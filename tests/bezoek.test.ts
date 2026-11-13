import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { normaliseerPad } from "@/lib/bezoek/paden";

describe("normaliseerPad", () => {
  it.each([
    ["/home", "/home"],
    ["/", "/home"],
    ["/programma/", "/programma"],
    ["/teams", "/teams"],
  ])("%s → %s", (pad, verwacht) => {
    expect(normaliseerPad(pad)).toBe(verwacht);
  });

  it.each([["/onbekend"], ["/team/HS1"], ["/home/extra"], [42], [undefined], ["/" + "a".repeat(200)]])(
    "weigert %s",
    (pad) => {
      expect(normaliseerPad(pad)).toBeNull();
    },
  );
});

describe("telBezoek", () => {
  const map = mkdtempSync(path.join(tmpdir(), "vvh-bezoek-"));
  afterAll(() => rmSync(map, { recursive: true, force: true }));

  it("telt per Nederlandse dag en gooit oude dagen weg", async () => {
    process.env.PUSH_DATA_DIR = map;
    const { telBezoek, leesBezoek } = await import("@/lib/bezoek/store");

    // 23:30 UTC op 1 jan = 00:30 op 2 jan in Nederland
    const oud = new Date("2025-01-01T23:30:00Z");
    await telBezoek({ bezoeker: "app", pagina: "/home" }, oud);
    expect((await leesBezoek()).dagen["2025-01-02"]).toEqual({ app: 1, browser: 0, paginas: { "/home": 1 } });

    const nu = new Date("2026-11-14T12:00:00+01:00");
    await Promise.all([
      telBezoek({ bezoeker: "browser", pagina: "/home" }, nu),
      telBezoek({ pagina: "/home" }, nu),
      telBezoek({ pagina: "/teams" }, nu),
    ]);

    const opSchijf = JSON.parse(readFileSync(path.join(map, "bezoek.json"), "utf8"));
    expect(opSchijf.dagen).toEqual({
      "2026-11-14": { app: 0, browser: 1, paginas: { "/home": 2, "/teams": 1 } },
    });
  });
});
