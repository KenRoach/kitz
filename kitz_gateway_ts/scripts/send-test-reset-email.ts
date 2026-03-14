#!/usr/bin/env npx tsx
/**
 * Send a test password reset email using the branded template.
 *
 * Usage:
 *   npx tsx scripts/send-test-reset-email.ts kenneth_roach@hotmail.com
 *   npm run test:email -- kenneth_roach@hotmail.com
 */

import "dotenv/config";
import { configureResend, sendEmail, buildPasswordResetEmail } from "../src/services/mailer.js";

const to = process.argv[2];
if (!to) {
  console.error("Usage: npx tsx scripts/send-test-reset-email.ts <email>");
  process.exit(1);
}

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  console.error("RESEND_API_KEY not set in .env");
  process.exit(1);
}

const from = process.env.SMTP_FROM || "RenewFlow <onboarding@resend.dev>";

configureResend(apiKey, from);

const resetUrl = "https://renewflow.io/reset-password?token=test-preview-token";
const { subject, body, html } = buildPasswordResetEmail(resetUrl);

console.log(`Sending test password reset email to ${to}...`);

sendEmail(to, `${subject} (Test)`, body, html)
  .then((result) => {
    console.log("Sent successfully:", result);
  })
  .catch((err) => {
    console.error("Failed:", err.message);
    process.exit(1);
  });
