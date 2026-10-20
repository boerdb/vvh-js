import { NextResponse } from "next/server";
import { getTeamLabel, getTeamOption } from "@/lib/constants/teams";
import { parseMatch } from "@/lib/parsers/match";
import { matchesVvhTeam, toDate } from "@/lib/parsers/rss-xml";
import { upstreamErrorResponse } from "@/lib/server/api-error";
import { fetchClubProgramma } from "@/lib/server/club-feeds";
import { buildIcs, type IcsEvent } from "@/lib/utils/ics";
import type { FeedItem } from "@/lib/types/models";

function toEvent(item: FeedItem): IcsEvent | null {
  const match = parseMatch(item);
  const start = toDate(item.datum);
  if (!match || !start || match.uitslag || match.vervallen) return null;
  return {
    uid: `wedstrijd-${match.wedstrijdId || start.getTime()}@vvh.clvs.nl`,
    title: `${match.thuis} - ${match.uit}`,
    start,
    location: match.speellocatie,
    url: item.link,
  };
}

function icsResponse(body: string, filename: string, attachment: boolean) {
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `${attachment ? "attachment" : "inline"}; filename="${filename}"`,
      "Cache-Control": "public, max-age=300",
    },
  });
}

/**
 * GET /api/agenda?wedstrijd=1975862 → één wedstrijd (.ics-download)
 * GET /api/agenda?team=HS1          → agenda-abonnement met alle geplande wedstrijden
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const wedstrijd = params.get("wedstrijd");
  const team = params.get("team")?.toUpperCase();

  if (!wedstrijd && !team) {
    return NextResponse.json(
      { error: "Queryparameter wedstrijd of team is verplicht" },
      { status: 400 }
    );
  }
  if (team && !getTeamOption(team)) {
    return NextResponse.json({ error: "Onbekend team" }, { status: 400 });
  }

  try {
    const items = await fetchClubProgramma();

    if (wedstrijd) {
      const item = items.find((i) => i.link.endsWith(`/wedstrijd/${wedstrijd}`));
      const event = item ? toEvent(item) : null;
      if (!event) {
        return NextResponse.json(
          { error: "Wedstrijd niet gevonden in het programma" },
          { status: 404 }
        );
      }
      return icsResponse(
        buildIcs([event], "VVH Harlingen"),
        `vvh-wedstrijd-${wedstrijd}.ics`,
        true
      );
    }

    const events = items
      .filter((item) => matchesVvhTeam(item, team!))
      .map(toEvent)
      .filter((e): e is IcsEvent => e !== null);
    return icsResponse(
      buildIcs(events, `VVH ${getTeamLabel(team!)}`),
      `vvh-${team!.toLowerCase()}.ics`,
      false
    );
  } catch (error) {
    return upstreamErrorResponse(error);
  }
}
