import { isUseful } from "./sanitize";

type Field = "EMAIL" | "PHONE";

interface ContactCtx {
  website: string | null;
  sourceType: string | null;
}

interface Classified {
  source: string;
  confidence: number;
}

export function classifyContact(
  field: Field,
  value: string,
  ctx: ContactCtx
): Classified {
  if (field === "EMAIL") {
    const trimmedVal = value.trim();
    const emailParts = trimmedVal.split("@");
    const emailDomain = emailParts[emailParts.length - 1]?.trim().toLowerCase() || "";

    // The consumer-provider check takes precedence over a domain match.
    // Known consumer providers: gmail, yahoo, outlook, hotmail, aol, icloud
    const domainParts = emailDomain.split(".");
    const isConsumer = domainParts.some((part) =>
      ["gmail", "yahoo", "outlook", "hotmail", "aol", "icloud"].includes(part)
    );

    if (isConsumer) {
      return { source: "GENERIC_PROVIDER", confidence: 0.4 };
    }

    if (ctx.website && isUseful(ctx.website)) {
      let host = "";
      try {
        let webStr = ctx.website.trim();
        if (!/^https?:\/\//i.test(webStr)) {
          webStr = "https://" + webStr;
        }
        host = new URL(webStr).hostname.toLowerCase();
      } catch {
        host = ctx.website.replace(/^https?:\/\//i, "").split("/")[0].toLowerCase();
      }

      // Remove leading www. and trailing slash/whitespace
      host = host.replace(/^www\./, "").trim();
      const cleanEmailDomain = emailDomain.replace(/^www\./, "").trim();

      const matches =
        cleanEmailDomain === host ||
        cleanEmailDomain.endsWith("." + host) ||
        host.endsWith("." + cleanEmailDomain);

      if (matches) {
        return { source: "FIRM_DOMAIN", confidence: 0.9 };
      } else {
        return { source: "OFF_DOMAIN", confidence: 0.5 };
      }
    } else {
      return { source: "UNVERIFIED", confidence: 0.5 };
    }
  } else {
    // PHONE:
    if (ctx.sourceType === "GOOGLE_MAPS") {
      return { source: "PLACES", confidence: 0.85 };
    } else {
      return { source: "WEBSITE", confidence: 0.55 };
    }
  }
}

export interface DataPointLike {
  value: string;
  source: string;
  confidence: number;
  observedAt: Date;
}

export function pickCurrentBest(
  points: DataPointLike[]
): { value: string; source: string; confidence: number } | null {
  if (points.length === 0) return null;
  let best = points[0];
  for (let i = 1; i < points.length; i++) {
    const pt = points[i];
    if (pt.confidence > best.confidence) {
      best = pt;
    } else if (pt.confidence === best.confidence) {
      if (new Date(pt.observedAt).getTime() > new Date(best.observedAt).getTime()) {
        best = pt;
      }
    }
  }
  return {
    value: best.value,
    source: best.source,
    confidence: best.confidence,
  };
}

