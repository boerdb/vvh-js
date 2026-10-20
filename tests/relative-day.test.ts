import { describe, expect, it } from "vitest";
import { relativeDayLabel } from "@/lib/utils/relative-day";

describe("relativeDayLabel", () => {
  // Dinsdagavond 20 oktober 2026, Nederlandse tijd (TZ in vitest.config).
  const now = new Date("2026-10-20T21:30:00+02:00");

  it.each([
    ["2026-10-20T22:00:00+02:00", "Vandaag 22:00"],
    ["2026-10-21T00:30:00+02:00", "Morgen 00:30"],
    ["2026-10-22T20:00:00+02:00", "Overmorgen 20:00"],
    ["2026-10-24T10:10:00+02:00", "Over 4 dagen, 10:10"],
    // Na de wintertijd (25 okt): nog steeds 15:00 lokaal.
    ["2026-10-31T15:00:00+01:00", "za 31 okt. 15:00"],
  ])("%s → %s", (iso, label) => {
    expect(relativeDayLabel(new Date(iso), now)).toBe(label);
  });
});
