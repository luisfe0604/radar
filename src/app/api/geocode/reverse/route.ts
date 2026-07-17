import { NextRequest, NextResponse } from "next/server";
import { reverseGeocode } from "@/lib/geocoding/geocode";

export async function GET(request: NextRequest) {
  const lat = Number(request.nextUrl.searchParams.get("lat"));
  const lon = Number(request.nextUrl.searchParams.get("lon"));

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json(
      { error: "Parâmetros lat/lon inválidos" },
      { status: 400 },
    );
  }

  const result = await reverseGeocode(lat, lon);

  return NextResponse.json(
    { result },
    { headers: { "Cache-Control": "public, max-age=300" } },
  );
}
