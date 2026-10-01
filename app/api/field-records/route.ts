import { NextResponse } from "next/server";
import initialDb from "../../../data/db.json";

export async function GET() {
  return NextResponse.json({
    success: true,
    count: initialDb.field_records.length,
    data: initialDb.field_records,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newRecord = {
      ...body,
      id: `cce-2026-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      verification_status: "Verified & Approved",
    };

    return NextResponse.json({
      success: true,
      message: "Field CCE record recorded successfully",
      data: newRecord,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
