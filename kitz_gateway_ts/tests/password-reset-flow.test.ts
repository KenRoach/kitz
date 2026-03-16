/**
 * Integration test for the full password reset flow.
 * Mocks Supabase to test the complete forgot → token → reset cycle.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcrypt";

// Mock Supabase before importing service
const mockDb: Record<string, unknown[]> = {
  users: [],
  password_reset_tokens: [],
  sessions: [],
};

// Chainable query builder mock
function createQueryBuilder(table: string) {
  let filters: Record<string, unknown> = {};
  let selectFields = "*";

  const builder: Record<string, unknown> = {
    select: (fields: string, _opts?: unknown) => {
      selectFields = fields;
      return builder;
    },
    eq: (field: string, value: unknown) => {
      filters[field] = value;
      return builder;
    },
    single: () => {
      const rows = mockDb[table] ?? [];
      const match = rows.find((row: Record<string, unknown>) =>
        Object.entries(filters).every(([k, v]) => (row as Record<string, unknown>)[k] === v)
      );
      return Promise.resolve({ data: match ?? null, error: match ? null : { code: "PGRST116" }, count: rows.length });
    },
    insert: (record: unknown) => {
      const records = Array.isArray(record) ? record : [record];
      for (const r of records) {
        (mockDb[table] ?? []).push(r as Record<string, unknown>);
      }
      return Promise.resolve({ error: null });
    },
    update: (fields: Record<string, unknown>) => {
      const rows = mockDb[table] ?? [];
      for (const row of rows) {
        const r = row as Record<string, unknown>;
        if (Object.entries(filters).every(([k, v]) => r[k] === v)) {
          Object.assign(r, fields);
        }
      }
      // Return chainable builder for .eq() chains after .update()
      const updateBuilder: Record<string, unknown> = {
        eq: (field: string, value: unknown) => {
          filters[field] = value;
          // Apply update to matching rows
          for (const row of rows) {
            const r = row as Record<string, unknown>;
            if (Object.entries(filters).every(([k, v]) => r[k] === v)) {
              Object.assign(r, fields);
            }
          }
          return updateBuilder;
        },
      };
      return updateBuilder;
    },
    delete: () => {
      const deleteBuilder: Record<string, unknown> = {
        eq: (field: string, value: unknown) => {
          mockDb[table] = (mockDb[table] ?? []).filter(
            (row) => (row as Record<string, unknown>)[field] !== value
          );
          return deleteBuilder;
        },
      };
      return deleteBuilder;
    },
  };

  return builder;
}

vi.mock("../src/db/client.js", () => ({
  getSupabase: () => ({
    from: (table: string) => createQueryBuilder(table),
  }),
}));

// Capture emails sent
const sentEmails: { to: string; subject: string; body: string; html?: string }[] = [];

vi.mock("../src/services/mailer.js", async () => {
  const actual = await vi.importActual("../src/services/mailer.js") as Record<string, unknown>;
  return {
    ...actual,
    sendEmail: async (to: string, subject: string, body: string, html?: string) => {
      sentEmails.push({ to, subject, body, html });
      return { sent: true, to, subject };
    },
    isConfigured: () => true,
  };
});

import { forgotPassword, resetPasswordWithToken, registerUser } from "../src/auth/service.js";

describe("Password Reset Flow (end-to-end)", () => {
  beforeEach(() => {
    mockDb.users = [];
    mockDb.password_reset_tokens = [];
    mockDb.sessions = [];
    sentEmails.length = 0;
  });

  it("full flow: register → forgot password → receive email → reset with token", async () => {
    // Step 1: Register a user with email
    await registerUser("testuser", "password123", "user", "test@renewflow.io");
    expect(mockDb.users).toHaveLength(1);

    const user = mockDb.users[0] as Record<string, unknown>;
    expect(user.email).toBe("test@renewflow.io");
    expect(user.username).toBe("testuser");

    // Give the user an id (Supabase would do this automatically)
    user.id = "user-uuid-123";

    // Step 2: Request forgot password
    const result = await forgotPassword("test@renewflow.io", "https://renewflow.io");
    expect(result.sent).toBe(true);

    // Step 3: Verify email was sent
    expect(sentEmails).toHaveLength(1);
    expect(sentEmails[0].to).toBe("test@renewflow.io");
    expect(sentEmails[0].subject).toBe("Reset your RenewFlow password");
    expect(sentEmails[0].body).toContain("https://renewflow.io/reset-password?token=");

    // Step 4: Extract token from email
    const tokenMatch = sentEmails[0].body.match(/token=([a-f0-9]+)/);
    expect(tokenMatch).not.toBeNull();
    const resetToken = tokenMatch![1];

    // Verify token was stored in DB
    expect(mockDb.password_reset_tokens).toHaveLength(1);
    const storedToken = mockDb.password_reset_tokens[0] as Record<string, unknown>;
    expect(storedToken.token).toBe(resetToken);
    expect(storedToken.used).toBeFalsy();

    // Step 5: Reset password with the token
    const resetResult = await resetPasswordWithToken(resetToken, "newpassword456");
    expect(resetResult.username).toBe("testuser");
    expect(resetResult.role).toBe("user");

    // Step 6: Verify token is now marked as used
    const usedToken = mockDb.password_reset_tokens[0] as Record<string, unknown>;
    expect(usedToken.used).toBe(true);

    // Step 7: Verify password was actually changed
    const updatedUser = mockDb.users[0] as Record<string, unknown>;
    const passwordChanged = await bcrypt.compare("newpassword456", updatedUser.password_hash as string);
    expect(passwordChanged).toBe(true);

    // Step 8: Verify old password no longer works
    const oldPasswordWorks = await bcrypt.compare("password123", updatedUser.password_hash as string);
    expect(oldPasswordWorks).toBe(false);
  });

  it("forgot password with non-existent email still returns success (anti-enumeration)", async () => {
    const result = await forgotPassword("nobody@example.com", "https://renewflow.io");
    expect(result.sent).toBe(true);
    expect(sentEmails).toHaveLength(0); // No email sent
  });

  it("forgot password with user that has no email returns success silently", async () => {
    await registerUser("noEmailUser", "password123");
    (mockDb.users[0] as Record<string, unknown>).id = "user-uuid-456";

    const result = await forgotPassword("noEmailUser", "https://renewflow.io");
    expect(result.sent).toBe(true);
    expect(sentEmails).toHaveLength(0);
  });

  it("reset with expired token throws error", async () => {
    // Insert an expired token directly
    mockDb.password_reset_tokens.push({
      token: "expired-token-abc",
      user_id: "user-uuid-789",
      expires_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      used: false,
    });

    await expect(resetPasswordWithToken("expired-token-abc", "newpass12345"))
      .rejects.toThrow("This reset link has expired");
  });

  it("reset with already-used token throws error", async () => {
    mockDb.password_reset_tokens.push({
      token: "used-token-def",
      user_id: "user-uuid-789",
      expires_at: new Date(Date.now() + 3600000).toISOString(),
      used: true,
    });

    await expect(resetPasswordWithToken("used-token-def", "newpass12345"))
      .rejects.toThrow("This reset link has already been used");
  });

  it("reset with invalid token throws error", async () => {
    await expect(resetPasswordWithToken("nonexistent-token", "newpass12345"))
      .rejects.toThrow("Invalid or expired reset link");
  });

  it("reset with short password throws error", async () => {
    await expect(resetPasswordWithToken("any-token", "short"))
      .rejects.toThrow("Password must be at least 8 characters");
  });

  it("email contains branded HTML with reset button", async () => {
    await registerUser("htmlUser", "password123", "user", "html@renewflow.io");
    (mockDb.users[0] as Record<string, unknown>).id = "user-uuid-html";

    await forgotPassword("html@renewflow.io", "https://renewflow.io");

    expect(sentEmails).toHaveLength(1);
    const { html } = sentEmails[0];
    expect(html).toBeDefined();
    expect(html).toContain("RenewFlow");
    expect(html).toContain("Reset Password");
    expect(html).toContain("1 hour");
    expect(html).toContain("renewflow.io");
  });
});
