import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../lib/auth/session";
import { saveLead, unsaveLead, getSavedFirmIds, setLeadStatus } from "../../../lib/leads";
import { parseLeadStatus } from "../../../utils/leadStatus";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ signedIn: false, firmIds: [] });
    }
    const firmIds = await getSavedFirmIds(user.id);
    return NextResponse.json({ signedIn: true, firmIds });
  } catch (error) {
    console.error("Error in GET /api/leads:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { firmId, firmIds } = body;

    if (firmId === undefined && firmIds === undefined) {
      return NextResponse.json(
        { error: "firmId or firmIds is required" },
        { status: 400 }
      );
    }

    if (firmId !== undefined) {
      if (typeof firmId !== "string" || !firmId.trim()) {
        return NextResponse.json(
          { error: "firmId is required and must be a non-empty string" },
          { status: 400 }
        );
      }
      await saveLead(user.id, firmId.trim());
      if (process.env.NODE_ENV !== "test") {
        try {
          const { logActivity } = await import("../../../lib/activity");
          await logActivity(user.id, { type: "SAVED", firmId: firmId.trim() }).catch(() => {});
        } catch (error) {
          console.error("Failed to log SAVED activity dynamically:", error);
        }
      }
      return NextResponse.json({ ok: true, saved: true });
    } else {
      if (!Array.isArray(firmIds)) {
        return NextResponse.json(
          { error: "firmIds must be an array" },
          { status: 400 }
        );
      }
      const ids: string[] = Array.from(
        new Set(
          firmIds
            .filter((id: any) => id && typeof id === "string" && id.trim())
            .map((id: string) => id.trim())
        )
      );

      await Promise.all(ids.map((id: string) => saveLead(user.id, id)));
      if (process.env.NODE_ENV !== "test") {
        try {
          const { logActivity } = await import("../../../lib/activity");
          if (ids.length > 0) {
            await logActivity(user.id, { type: "SAVED", count: ids.length }).catch(() => {});
          }
        } catch (error) {
          console.error("Failed to log SAVED batch activities dynamically:", error);
        }
      }
      return NextResponse.json({ ok: true, saved: ids.length });
    }
  } catch (error) {
    console.error("Error in POST /api/leads:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { firmId, firmIds } = body;

    if (firmId === undefined && firmIds === undefined) {
      return NextResponse.json(
        { error: "firmId or firmIds is required" },
        { status: 400 }
      );
    }

    if (firmId !== undefined) {
      if (typeof firmId !== "string" || !firmId.trim()) {
        return NextResponse.json(
          { error: "firmId is required and must be a non-empty string" },
          { status: 400 }
        );
      }
      await unsaveLead(user.id, firmId.trim());
      return NextResponse.json({ ok: true, saved: false });
    } else {
      if (!Array.isArray(firmIds)) {
        return NextResponse.json(
          { error: "firmIds must be an array" },
          { status: 400 }
        );
      }
      const ids: string[] = Array.from(
        new Set(
          firmIds
            .filter((id: any) => id && typeof id === "string" && id.trim())
            .map((id: string) => id.trim())
        )
      );

      await Promise.all(ids.map((id: string) => unsaveLead(user.id, id)));
      return NextResponse.json({ ok: true, removed: ids.length });
    }
  } catch (error) {
    console.error("Error in DELETE /api/leads:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { firmId, status } = body;

    if (typeof firmId !== "string" || !firmId.trim()) {
      return NextResponse.json(
        { error: "firmId is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    const parsedStatus = parseLeadStatus(status);
    if (!parsedStatus) {
      return NextResponse.json(
        { error: "Invalid or missing status" },
        { status: 400 }
      );
    }

    await setLeadStatus(user.id, firmId.trim(), parsedStatus);
    if (parsedStatus === "WON" || parsedStatus === "LOST") {
      if (process.env.NODE_ENV !== "test") {
        try {
          const { logActivity } = await import("../../../lib/activity");
          await logActivity(user.id, { type: parsedStatus, firmId: firmId.trim() }).catch(() => {});
        } catch (error) {
          console.error(`Failed to log ${parsedStatus} activity dynamically:`, error);
        }
      }
    }
    return NextResponse.json({ ok: true, status: parsedStatus });
  } catch (error) {
    console.error("Error in PATCH /api/leads:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
