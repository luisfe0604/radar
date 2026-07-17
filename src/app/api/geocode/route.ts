import { NextRequest, NextResponse } from "next/server";
import { geocode } from "@/lib/geocoding/geocode";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results = await geocode(query);

  return NextResponse.json(
    { results },
    { headers: { "Cache-Control": "public, max-age=300" } },
  );
}
