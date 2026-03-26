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

    if (!state) {
      return err("No data found", 404);
    }

    return new NextResponse(JSON.stringify(state, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="timetrain-export-${Date.now()}.json"`,
      },
    });
  } catch (e) {
    return err(String(e));
  }
}
