import { describe, expect, it } from "vitest";
import { buildSnapshot, diffSnapshots } from "@/lib/push/changes";
import type { FeedItem } from "@/lib/types/models";

const now = new Date("2026-10-23T12:00:00+02:00").getTime();

const gepland: FeedItem = {
  titel: "22 okt 20:00: V.V.H. HS 2 - V.C.S. Jongcars HS 1",
  link: "https://api.nevobo.nl/permalink/wedstrijd/1975862",
  omschrijving:
    "Wedstrijd: 1000H1G   DE, Datum: donderdag 22 oktober, 20:00, Speellocatie: De Waddenhal, Westerzeedijk 15, 8862PK  Harlingen",
  datum: "2026-10-22T18:00:00.000Z",
};

const gespeeld: FeedItem = {
  ...gepland,
  titel: "V.V.H. HS 2 - V.C.S. Jongcars HS 1, Uitslag: 1-3",
  omschrijving:
    "Wedstrijd: V.V.H. HS 2 - V.C.S. Jongcars HS 1, Uitslag: 1-3, Setstanden: 25-20, 18-25, 20-25, 22-25",
};

describe("diffSnapshots", () => {
  it("stuurt niets bij de eerste run", () => {
    expect(diffSnapshots({}, buildSnapshot([gepland]), now)).toEqual([]);
  });

  it("meldt een nieuwe uitslag, vanuit VVH gezien", () => {
    const events = diffSnapshots(buildSnapshot([gepland]), buildSnapshot([gespeeld]), now);
    expect(events).toEqual([
      {
        team: "HS2",
        title: "Heren 2: verloren 1-3",
        body: "Thuis tegen V.C.S. Jongcars HS 1",
        url: "/teams?team=HS2",
        tag: "uitslag-1975862",
      },
    ]);
  });

  it("meldt een gewijzigde aanvangstijd in Nederlandse tijd", () => {
    const verschoven = { ...gepland, datum: "2026-10-22T18:30:00.000Z" };
    const [event] = diffSnapshots(buildSnapshot([gepland]), buildSnapshot([verschoven]), now);
    expect(event.title).toBe("Heren 2: nieuwe aanvangstijd");
    expect(event.body).toMatch(/nu do 22 okt\.? 20:30 \(was do 22 okt\.? 20:00\)/);
  });

  it("meldt een vervallen wedstrijd", () => {
    const vervallen = {
      ...gepland,
      titel: `Vervallen: ${gepland.titel}`,
      omschrijving: `Vervallen wedstrijd: ${gepland.omschrijving.slice("Wedstrijd: ".length)}`,
    };
    const [event] = diffSnapshots(buildSnapshot([gepland]), buildSnapshot([vervallen]), now);
    expect(event.title).toBe("Heren 2: wedstrijd vervallen");
  });

  it("stuurt geen oude uitslagen die opeens in de feed verschijnen", () => {
    const oud = { ...gespeeld, datum: "2026-09-01T18:00:00.000Z" };
    const anders = buildSnapshot([{ ...gepland, link: "https://x/wedstrijd/1" }]);
    expect(diffSnapshots(anders, buildSnapshot([oud]), now)).toEqual([]);
  });

  it("negeert niet-VVH-wedstrijden en ongewijzigde wedstrijden", () => {
    const snapshot = buildSnapshot([gepland]);
    expect(diffSnapshots(snapshot, buildSnapshot([gepland]), now)).toEqual([]);
    expect(
      buildSnapshot([{ ...gepland, titel: "Udiros HS 1 - Heerenveen HS 2" }])
    ).toEqual({});
  });
});
