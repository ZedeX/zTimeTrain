import { NextRequest, NextResponse } from "next/server";

function ok(data: unknown) {
  return NextResponse.json({ code: 200, message: "success", data });
}
function err(msg: string, status = 500) {
  return NextResponse.json({ code: status, message: msg, data: null }, { status });
}

export async function GET(req: NextRequest) {
  try {
    const { kvGetTasks } = await import("@/lib/kv");
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return err("userId required", 400);
    const tasks = await kvGetTasks(userId);
    return ok(tasks ?? []);
  } catch (e) {
    return err(String(e));
  }
}

export async function POST(req: NextRequest) {
  try {
    const { kvSetTasks } = await import("@/lib/kv");
    const body = await req.json();
    const { userId, tasks } = body;
    if (!userId || !tasks) return err("userId and tasks required", 400);
    await kvSetTasks(userId, tasks);
    return ok(tasks);
  } catch (e) {
    return err(String(e));
  }
}
