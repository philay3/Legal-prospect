Task: wire the cooldown into the enrich route, backed by a new additive column.
Edit two files: the Prisma schema and the enrich route. Do NOT edit anything else.
Do NOT run any commands (the human runs the migration). Return your plan first;
after I approve, make the edits, report both changed sections, then stop.

Part 1 — schema. In prisma/schema.prisma, in the Firm model, add this field
(place it right after the `email String?` line):
  emailCheckedAt     DateTime?

Part 2 — the route (src/app/api/leads/enrich/route.ts).

a) Swap the imports: remove
     import { isUseful } from "../../../../lib/research/sanitize";
   and add
     import { enrichDecision } from "../../../../lib/research/enrichDecision";

b) Replace this block (everything from the isUseful check through the final
   return):

    if (isUseful(firm.email)) {
      return NextResponse.json({ ok: true, email: firm.email, cached: true });
    }

    if (!firm.website) {
      return NextResponse.json({ ok: true, email: null });
    }

    const email = await findContactEmail(firm.website);
    if (email) {
      await prisma.firm.update({ where: { id }, data: { email } });
      return NextResponse.json({ ok: true, email });
    }

    return NextResponse.json({ ok: true, email: null });

   with:

    const decision = enrichDecision(firm.email, firm.emailCheckedAt);
    if (decision === "use-email") {
      return NextResponse.json({ ok: true, email: firm.email, cached: true });
    }
    if (decision === "skip") {
      return NextResponse.json({ ok: true, email: null, cached: true });
    }

    // decision === "fetch": attempt enrichment and record the attempt
    const email = firm.website ? await findContactEmail(firm.website) : null;
    await prisma.firm.update({
      where: { id },
      data: { email: email ?? undefined, emailCheckedAt: new Date() },
    });
    return NextResponse.json({ ok: true, email: email ?? null });

Leave the auth check, the body parse, the saved-lead guard, the firm lookup, and
the try/catch exactly as they are. Report the schema diff and the changed route
sections, then stop.