import { NextRequest, NextResponse } from "next/server";
import { AppState } from "@/lib/types";

function ok(data: unknown) {
  return NextResponse.json({ code: 200, message: "success", data });
}
function err(msg: string, status = 500) {
  return NextResponse.json({ code: status, message: msg, data: null }, { status });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, data } = body;

    if (!userId || !data) {
      return err("userId and data required", 400);
    }

    const state = data as AppState;

    if (!state.tasks || !state.plans) {
      return err("Invalid data format", 400);
    }

    const db = (process.env as any).DB;
    if (db) {
      const { dbSaveFullState } = await import("@/lib/d1");
      await dbSaveFullState(db as any, { ...state, userId });
    } else {
      const { kvSaveFullState } = await import("@/lib/kv");
      await kvSaveFullState({ ...state, userId });
    }

    return ok({ success: true });
  } catch (e) {
    return err(String(e));
  }
}
