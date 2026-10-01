import { NextResponse } from "next/server";
import initialDb from "../../../data/db.json";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const districtId = searchParams.get("district_id");
  const stage = searchParams.get("approval_stage");

  let list = initialDb.estimates || [];
  if (districtId && districtId !== "all") {
    list = list.filter((e: any) => e.district_id === districtId);
  }
  if (stage && stage !== "all") {
    list = list.filter((e: any) => e.approval_stage === stage);
  }

  return NextResponse.json({
    success: true,
    count: list.length,
    data: list,
  });
}
