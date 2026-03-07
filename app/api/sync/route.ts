import { NextRequest, NextResponse } from "next/server";

function ok(data: unknown) {
  return NextResponse.json({ code: 200, message: "success", data });
}
function err(msg: string, status = 500) {
  return NextResponse.json({ code: status, message: msg, data: null }, { status });
}

export async function GET(req: NextRequest) {
  try {
    const { kvGetFullState } = await import("@/lib/kv");
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return err("userId required", 400);
    const state = await kvGetFullState(userId);
    return ok(state);
  } catch (e) {
    return err(String(e));
  }
}

export async function POST(req: NextRequest) {
  try {
    const { kvGetFullState, kvSaveFullState } = await import("@/lib/kv");
    const body = await req.json();
    const { userId, tasks, plans, lastModified } = body;
    if (!userId) return err("userId required", 400);

    // Conflict resolution: take latest
    const cloudState = await kvGetFullState(userId);
    if (cloudState && cloudState.lastModified > lastModified) {
      // Cloud is newer, return cloud state
      return ok(cloudState);
    }
    // Local is newer, save to cloud
    await kvSaveFullState({ userId, tasks, plans, lastModified });
    return ok(null);
  } catch (e) {
    return err(String(e));
  }
}
