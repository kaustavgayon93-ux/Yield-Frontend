import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const possiblePaths = [
    path.join(process.cwd(), "public", "ASSAC-GeoAgri-Field-CCE.apk"),
    path.join(process.cwd(), "..", "ASSAC-GeoAgri-Field-CCE.apk"),
    path.join(process.cwd(), "ASSAC-GeoAgri-Field-CCE.apk"),
  ];

  let targetPath = "";
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      targetPath = p;
      break;
    }
  }

  if (!targetPath) {
    return NextResponse.json({ error: "APK file not found on server" }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(targetPath);
  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": "application/vnd.android.package-archive",
      "Content-Disposition": 'attachment; filename="ASSAC-GeoAgri-Field-CCE.apk"',
      "Content-Length": fileBuffer.length.toString(),
    },
  });
}
