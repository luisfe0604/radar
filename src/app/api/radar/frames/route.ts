import { NextResponse } from "next/server";
import { fetchRadarFrames } from "@/lib/radar/rainviewer";

export async function GET() {
  const frames = await fetchRadarFrames();

  return NextResponse.json(frames, {
    headers: { "Cache-Control": "public, max-age=60" },
  });
}
