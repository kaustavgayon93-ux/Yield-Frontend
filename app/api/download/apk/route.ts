import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  const targetPath = path.join(process.cwd(), "public", "ASSAC-GeoAgri-Field-CCE.apk");

  if (!fs.existsSync(targetPath)) {
    return NextResponse.json({ error: "APK file not found on server" }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(targetPath);
  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": "application/vnd.android.package-archive",
      "Content-Disposition": 'attachment; filename="ASSAC-GeoAgri-Field-CCE.apk"',
      "Content-Length": fileBuffer.length.toString(),
      "Cache-Control": "no-store, must-revalidate",
    },
  });
}
