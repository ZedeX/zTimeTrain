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
    if (!userId) return err("userId required", 400);

    const db = (process.env as any).DB;
    if (db) {
      const { dbGetTasks } = await import("@/lib/d1");
      const tasks = await dbGetTasks(db as any, userId);
      return ok(tasks);
    } else {
      const { kvGetTasks } = await import("@/lib/kv");
      const tasks = await kvGetTasks(userId);
      return ok(tasks ?? []);
    }
  } catch (e) {
    return err(String(e));
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, tasks } = body;
    if (!userId || !tasks) return err("userId and tasks required", 400);

    const db = (process.env as any).DB;
    if (db) {
      const { dbSetTasks } = await import("@/lib/d1");
      await dbSetTasks(db as any, userId, tasks);
    } else {
      const { kvSetTasks } = await import("@/lib/kv");
      await kvSetTasks(userId, tasks);
    }
    return ok(tasks);
  } catch (e) {
    return err(String(e));
  }
}
