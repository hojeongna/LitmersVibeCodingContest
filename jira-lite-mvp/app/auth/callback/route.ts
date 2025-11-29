import { NextResponse } from "next/server";

// Firebase handles OAuth callbacks automatically through the SDK
// This route exists for potential custom callback handling or redirects
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;
  const next = requestUrl.searchParams.get("next") ?? "/";

  // Redirect to the specified page or home
  return NextResponse.redirect(`${origin}${next}`);
}
