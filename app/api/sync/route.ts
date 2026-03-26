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
    let state;
    if (db) {
      const { dbGetFullState } = await import("@/lib/d1");
      state = await dbGetFullState(db as any, userId);
    } else {
      const { kvGetFullState } = await import("@/lib/kv");
      state = await kvGetFullState(userId);
    }
    return ok(state);
  } catch (e) {
    return err(String(e));
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, tasks, plans, lastModified } = body;
    if (!userId) return err("userId required", 400);

    const db = (process.env as any).DB;
    let cloudState;
    if (db) {
      const { dbGetFullState, dbSaveFullState } = await import("@/lib/d1");
      cloudState = await dbGetFullState(db as any, userId);
      if (cloudState && cloudState.lastModified > lastModified) {
        return ok(cloudState);
      }
      await dbSaveFullState(db as any, { userId, tasks, plans, lastModified });
    } else {
      const { kvGetFullState, kvSaveFullState } = await import("@/lib/kv");
      cloudState = await kvGetFullState(userId);
      if (cloudState && cloudState.lastModified > lastModified) {
        return ok(cloudState);
      }
      await kvSaveFullState({ userId, tasks, plans, lastModified });
    }
    return ok(null);
  } catch (e) {
    return err(String(e));
  }
}
