import { NextResponse } from "next/server";
import districtsData from "../../../data/districts.json";

export async function GET() {
  return NextResponse.json({
    success: true,
    count: districtsData.length,
    data: districtsData,
  });
}
