import { NextRequest, NextResponse } from "next/server";

const ALLOWED_LAYERS = new Set([
  "clouds_new",
  "temp_new",
  "wind_new",
  "pressure_new",
]);

export async function GET(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ layer: string; z: string; x: string; y: string }> },
) {
  const { layer, z, x, y } = await params;

  if (!ALLOWED_LAYERS.has(layer)) {
    return NextResponse.json({ error: "Camada inválida" }, { status: 400 });
  }

  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Chave OpenWeatherMap não configurada" },
      { status: 503 },
    );
  }

  const url = `https://tile.openweathermap.org/map/${layer}/${z}/${x}/${y}.png?appid=${apiKey}`;
  const res = await fetch(url, { next: { revalidate: 600 } });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Falha ao buscar tile da OpenWeatherMap" },
      { status: res.status },
    );
  }

  const buffer = await res.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=600",
    },
  });
}
