import { NextRequest, NextResponse } from "next/server";

function ok(data: unknown) {
  return NextResponse.json({ code: 200, message: "success", data });
}
function err(msg: string, status = 500) {
  return NextResponse.json({ code: status, message: msg, data: null }, { status });
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    const date = req.nextUrl.searchParams.get("date");
    if (!userId || !date) return err("userId and date required", 400);

    const db = (process.env as any).DB;
    if (db) {
      const { dbGetPlan } = await import("@/lib/d1");
      const plan = await dbGetPlan(db as any, userId, date);
      return ok(plan);
    } else {
      const { kvGetPlan } = await import("@/lib/kv");
      const plan = await kvGetPlan(userId, date);
      return ok(plan);
    }
  } catch (e) {
    return err(String(e));
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, plan } = body;
    if (!userId || !plan) return err("userId and plan required", 400);

    const db = (process.env as any).DB;
    if (db) {
      const { dbSetPlan } = await import("@/lib/d1");
      await dbSetPlan(db as any, userId, plan);
    } else {
      const { kvSetPlan } = await import("@/lib/kv");
      await kvSetPlan(userId, plan);
    }
    return ok(plan);
  } catch (e) {
    return err(String(e));
  }
}
