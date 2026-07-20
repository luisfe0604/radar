import { NextRequest, NextResponse } from "next/server";
import { findNearestMapillaryImage } from "@/lib/streetview/mapillary";
import { findNearestKartaViewPhoto } from "@/lib/streetview/kartaview";

export async function GET(request: NextRequest) {
  const lat = Number(request.nextUrl.searchParams.get("lat"));
  const lon = Number(request.nextUrl.searchParams.get("lon"));

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json(
      { error: "Parâmetros lat/lon inválidos" },
      { status: 400 },
    );
  }

  const image =
    (await findNearestMapillaryImage(lat, lon)) ??
    (await findNearestKartaViewPhoto(lat, lon));

  return NextResponse.json(
    { image },
    { headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
