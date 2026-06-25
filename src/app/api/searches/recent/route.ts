import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getRecentSearches } from "@/lib/activity";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ searches: [] });
    }
    const searches = await getRecentSearches(user.id);
    return NextResponse.json({ searches });
  } catch (error) {
    console.error("Error in GET /api/searches/recent:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
