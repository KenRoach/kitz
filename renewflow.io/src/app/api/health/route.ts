import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "ok", service: "renewflow", timestamp: new Date().toISOString() });
}
