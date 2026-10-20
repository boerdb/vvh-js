import { describe, expect, it } from "vitest";
import { buildIcs } from "@/lib/utils/ics";
import {
  formatTeamCode,
  getNevoboTeamName,
  parseTeamCode,
} from "@/lib/constants/teams";
import { teamNevoboPath } from "@/lib/constants/nevobo";

describe("buildIcs", () => {
  const ics = buildIcs(
    [
      {
        uid: "wedstrijd-1975862@vvh.clvs.nl",
        title: "V.V.H. HS 2 - V.C.S. Jongcars HS 1",
        start: new Date("2026-10-22T18:00:00.000Z"),
        location: "De Waddenhal, Westerzeedijk 15, 8862PK Harlingen",
      },
    ],
    "VVH Heren 2"
  );

  it("schrijft UTC-tijden met standaardduur van twee uur", () => {
    expect(ics).toContain("DTSTART:20261022T180000Z");
    expect(ics).toContain("DTEND:20261022T200000Z");
  });

  it("escapet komma's en gebruikt CRLF", () => {
    expect(ics).toContain("LOCATION:De Waddenhal\\, Westerzeedijk 15\\, 8862PK Harlingen");
    expect(ics.split("\r\n")[0]).toBe("BEGIN:VCALENDAR");
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });

  it("vouwt regels langer dan 75 tekens", () => {
    const long = buildIcs(
      [{ uid: "x", title: "A".repeat(200), start: new Date(0) }],
      "Test"
    );
    for (const line of long.split("\r\n")) {
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    }
  });
});

describe("teamcodes", () => {
  it("splitst L41 als L4 + 1 en niet als L + 41", () => {
    expect(parseTeamCode("L41")).toEqual({ prefix: "L4", number: "1" });
    expect(formatTeamCode("l41")).toBe("L4 1");
  });

  it("gebruikt de Nevobo-naam van het combinatieteam", () => {
    expect(getNevoboTeamName("MA1")).toBe("DOSKO/Acta MA 1");
    expect(getNevoboTeamName("HS2")).toBe("V.V.H. HS 2");
  });

  it("bouwt het Nevobo-pad en weigert onbekende prefixen", () => {
    expect(teamNevoboPath("MB1")).toBe("meiden-b/1");
    expect(teamNevoboPath("L41")).toBe("l4/1");
    expect(() => teamNevoboPath("ZZ1")).toThrow();
  });
});
