import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, unknown> = {
    env_DATABASE_URL: !!process.env["DATABASE_URL"],
    env_POSTGRES_PRISMA_URL: !!process.env["POSTGRES_PRISMA_URL"],
    env_POSTGRES_URL: !!process.env["POSTGRES_URL"],
    env_AUTH_SECRET: !!process.env["AUTH_SECRET"],
    env_AUTH_SECRET_len: process.env["AUTH_SECRET"]?.length ?? 0,
    node_env: process.env.NODE_ENV,
  };

  try {
    const count = await db.cliente.count();
    checks.db_connected = true;
    checks.clientes_count = count;
  } catch (e: any) {
    checks.db_connected = false;
    checks.db_error = e.message?.substring(0, 500);
  }

  return NextResponse.json(checks);
}
