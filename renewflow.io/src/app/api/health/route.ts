import { NextResponse } from "next/server";

export async function GET() {
  const checks: Record<string, string> = {};

  // Supabase
  const sbUrl = process.env.SUPABASE_URL;
  const sbKey = process.env.SUPABASE_SERVICE_KEY;
  checks.supabase = sbUrl && sbKey && !sbUrl.includes("placeholder") ? "connected" : "not_configured";

  // Resend
  checks.resend = process.env.RESEND_API_KEY ? "connected" : "not_configured";

  // KitZ OS
  checks.kitz_os = process.env.KITZ_OS_API_URL && process.env.KITZ_API_KEY ? "connected" : "not_configured";

  const allConnected = Object.values(checks).every((v) => v === "connected");

  return NextResponse.json({
    status: allConnected ? "ok" : "degraded",
    service: "renewflow",
    timestamp: new Date().toISOString(),
    services: checks,
  });
}
