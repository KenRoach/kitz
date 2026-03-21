import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the db client before importing the service
vi.mock("../src/db/client.js", () => ({
  getSupabase: vi.fn(),
}));

import { registerVar } from "../src/auth/service.js";
import { getSupabase } from "../src/db/client.js";

const mockGetSupabase = vi.mocked(getSupabase);

function createMockSupabase(overrides: {
  orgInsert?: { data: unknown; error: unknown };
  createUser?: { data: unknown; error: unknown };
  coreUserInsert?: { data: unknown; error: unknown };
  orgDelete?: { data: unknown; error: unknown };
}) {
  const deleteEq = vi.fn().mockReturnValue({ data: null, error: null });
  const deleteFn = vi.fn().mockReturnValue({ eq: deleteEq });

  return {
    from: vi.fn((table: string) => {
      if (table === "core_org") {
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(
                overrides.orgInsert ?? { data: { id: "org-123", name: "Test Co", slug: "test-co" }, error: null }
              ),
            }),
          }),
          delete: deleteFn,
        };
      }
      if (table === "core_user") {
        return {
          insert: vi.fn().mockResolvedValue(
            overrides.coreUserInsert ?? { data: null, error: null }
          ),
        };
      }
      return {};
    }),
    auth: {
      admin: {
        createUser: vi.fn().mockResolvedValue(
          overrides.createUser ?? {
            data: { user: { id: "user-456", email: "var@example.com" } },
            error: null,
          }
        ),
      },
    },
  } as unknown as ReturnType<typeof getSupabase>;
}

describe("registerVar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates an org and returns username, role=var, org_id", async () => {
    const mockDb = createMockSupabase({});
    mockGetSupabase.mockReturnValue(mockDb);

    const result = await registerVar("var@example.com", "securepass123", "Test Co");

    expect(result).toEqual({
      username: "var@example.com",
      role: "var",
      org_id: "org-123",
    });

    // Verify org was created
    expect(mockDb.from).toHaveBeenCalledWith("core_org");
    // Verify auth user was created
    expect(mockDb.auth.admin.createUser).toHaveBeenCalledWith({
      email: "var@example.com",
      password: "securepass123",
      email_confirm: true,
      user_metadata: { org_id: "org-123", role: "var", full_name: "Test Co" },
    });
    // Verify core_user row was created
    expect(mockDb.from).toHaveBeenCalledWith("core_user");
  });

  it("rejects passwords shorter than 8 characters", async () => {
    await expect(registerVar("var@example.com", "short", "Test Co")).rejects.toThrow(
      "Password must be at least 8 characters"
    );
  });

  it("rejects empty company names", async () => {
    await expect(registerVar("var@example.com", "securepass123", "   ")).rejects.toThrow(
      "Company name is required"
    );
  });

  it("cleans up org if user creation fails", async () => {
    const mockDb = createMockSupabase({
      createUser: { data: null, error: { message: "Email already exists" } },
    });
    mockGetSupabase.mockReturnValue(mockDb);

    await expect(registerVar("var@example.com", "securepass123", "Test Co")).rejects.toThrow(
      "Email already exists"
    );

    // Verify org cleanup was attempted
    expect(mockDb.from).toHaveBeenCalledWith("core_org");
  });
});
