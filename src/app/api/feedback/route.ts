import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../lib/auth/session";
import { createFeedback } from "../../../lib/feedback";

const ALLOWED_CHOICES = [
  "More emails",
  "Faster search",
  "Better save & export",
  "Something else",
];

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { choice, message } = body;

  if (typeof choice !== "string" || !choice.trim()) {
    return NextResponse.json(
      { error: "Choice is required and must be a non-empty string" },
      { status: 400 }
    );
  }

  const trimmedChoice = choice.trim();
  if (!ALLOWED_CHOICES.includes(trimmedChoice)) {
    return NextResponse.json(
      { error: `Invalid choice. Must be one of: ${ALLOWED_CHOICES.join(", ")}` },
      { status: 400 }
    );
  }

  if (message !== undefined && message !== null) {
    if (typeof message !== "string") {
      return NextResponse.json(
        { error: "Message must be a string" },
        { status: 400 }
      );
    }
    if (message.length > 1000) {
      return NextResponse.json(
        { error: "Message must not exceed 1000 characters" },
        { status: 400 }
      );
    }
  }

  try {
    const user = await getCurrentUser();
    const userId = user?.id || null;

    await createFeedback({
      choice: trimmedChoice,
      message: message ? message.trim() : null,
      userId,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/feedback] Error saving feedback:", error);
    return NextResponse.json(
      { error: "Failed to save feedback" },
      { status: 500 }
    );
  }
}
