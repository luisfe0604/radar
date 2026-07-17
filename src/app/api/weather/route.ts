import { NextRequest, NextResponse } from "next/server";
import { fetchWeather } from "@/lib/weather/open-meteo";

export async function GET(request: NextRequest) {
  const lat = Number(request.nextUrl.searchParams.get("lat"));
  const lon = Number(request.nextUrl.searchParams.get("lon"));

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json(
      { error: "Parâmetros lat/lon inválidos" },
      { status: 400 },
    );
  }

  const weather = await fetchWeather(lat, lon);

  return NextResponse.json(weather, {
    headers: { "Cache-Control": "public, max-age=300" },
  });
}
