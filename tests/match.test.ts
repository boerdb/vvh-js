import { describe, expect, it } from "vitest";
import { groupByDay, parseMatch } from "@/lib/parsers/match";
import type { FeedItem } from "@/lib/types/models";

const gespeeld: FeedItem = {
  titel: "VC058 DS 9 - V.V.H. DS 1, Uitslag: 3-2",
  link: "https://api.nevobo.nl/permalink/wedstrijd/2039164",
  omschrijving:
    "Wedstrijd: VC058 DS 9 - V.V.H. DS 1, Uitslag: 3-2, Setstanden: 25-23, 13-25, 26-28, 26-24, 15-6",
  datum: "2026-10-08T19:00:00.000Z",
};

const gepland: FeedItem = {
  titel: "22 okt 20:00: V.V.H. HS 2 - V.C.S. Jongcars HS 1",
  link: "https://api.nevobo.nl/permalink/wedstrijd/1975862",
  omschrijving:
    "Wedstrijd: 1000H1G   DE, Datum: donderdag 22 oktober, 20:00, Speellocatie: De Waddenhal, Westerzeedijk 15, 8862PK  Harlingen",
  datum: "2026-10-22T18:00:00.000Z",
};

describe("parseMatch", () => {
  it("leest een uitslag met setstanden en ziet een VVH-nederlaag", () => {
    const match = parseMatch(gespeeld);
    expect(match).toMatchObject({
      thuis: "VC058 DS 9",
      uit: "V.V.H. DS 1",
      uitslag: { thuis: 3, uit: 2 },
      wedstrijdId: "2039164",
      vvhThuis: false,
      vvhGewonnen: false,
    });
    expect(match?.setstanden).toEqual(["25-23", "13-25", "26-28", "26-24", "15-6"]);
  });

  it("haalt het datumvoorvoegsel weg en leest de speellocatie", () => {
    const match = parseMatch(gepland);
    expect(match).toMatchObject({
      thuis: "V.V.H. HS 2",
      uit: "V.C.S. Jongcars HS 1",
      uitslag: null,
      vvhThuis: true,
      vvhGewonnen: null,
      speellocatie: "De Waddenhal, Westerzeedijk 15, 8862PK Harlingen",
    });
  });

  it("herkent het combinatieteam als eigen team", () => {
    const match = parseMatch({
      ...gespeeld,
      titel: "DOSKO/Acta MA 1 - Heerenveen MA 2, Uitslag: 4-0",
      omschrijving: "Wedstrijd: DOSKO/Acta MA 1 - Heerenveen MA 2, Uitslag: 4-0",
    });
    expect(match?.vvhGewonnen).toBe(true);
  });

  it("herkent vervallen wedstrijden", () => {
    const match = parseMatch({
      titel: "Vervallen: 17 sep 21:15: DOSKO/Acta HS 2 - V.V.H. HS 2",
      link: "",
      omschrijving:
        "Vervallen wedstrijd: 1000BH1B19CA, Datum: donderdag 17 september, 21:15, Speellocatie: Kaatshal De Trije, Jan Rodenhuisplein 3, 8801ET  Franeker",
      datum: null,
    });
    expect(match).toMatchObject({
      thuis: "DOSKO/Acta HS 2",
      uit: "V.V.H. HS 2",
      vervallen: true,
      uitslag: null,
    });
  });

  it("geeft null voor nieuwsberichten", () => {
    expect(
      parseMatch({ titel: "Nieuws", link: "", omschrijving: "<p>Tekst</p>", datum: null })
    ).toBeNull();
  });
});

describe("groupByDay", () => {
  it("groepeert per kalenderdag met een Nederlandse kop", () => {
    const groups = groupByDay([
      { ...gepland, datum: "2026-10-24T08:10:00.000Z" },
      { ...gepland, datum: "2026-10-24T13:00:00.000Z" },
      { ...gepland, datum: "2026-10-31T13:00:00.000Z" },
    ]);
    expect(groups.map((g) => [g.label, g.items.length])).toEqual([
      ["Zaterdag 24 oktober", 2],
      ["Zaterdag 31 oktober", 1],
    ]);
  });
});
