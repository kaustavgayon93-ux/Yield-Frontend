import { NextResponse } from "next/server";
import cropsData from "../../../data/crops.json";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const season = searchParams.get("season");

  let filtered = cropsData;
  if (category && category !== "all") {
    filtered = filtered.filter((c: any) =>
      c.category.toLowerCase().includes(category.toLowerCase())
    );
  }
  if (season && season !== "all") {
    filtered = filtered.filter((c: any) =>
      c.season.toLowerCase().includes(season.toLowerCase())
    );
  }

  return NextResponse.json({
    success: true,
    count: filtered.length,
    data: filtered,
  });
}
