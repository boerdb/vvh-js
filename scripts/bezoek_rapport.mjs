/**
 * Dagelijks bezoekersrapport van de VVH-app als tekstbestand.
 * Haalt de dagtotalen (data/bezoek.json) via SSH van de server; er staan geen
 * IP-adressen of apparaat-ID's in.
 *
 *   node scripts/bezoek_rapport.mjs [uitvoerbestand] [lokaal bezoek.json]
 *
 * Standaard: Bureaublad\VVH bezoekers.txt (wordt elke keer volledig herschreven).
 * Het tweede argument is alleen om te testen met een lokaal bestand.
 *
 * Instellen kan met: VVH_SSH_HOST, VVH_SSH_KEY, VVH_BEZOEK_BESTAND.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const uitvoer = process.argv[2] ?? join(homedir(), "Desktop", "VVH bezoekers.txt");
const lokaal = process.argv[3];

const host = process.env.VVH_SSH_HOST ?? "root@85.10.144.42";
const sleutel = process.env.VVH_SSH_KEY ?? join(homedir(), ".ssh", "id_ed25519_homelab");
const bestand = process.env.VVH_BEZOEK_BESTAND ?? "/var/www/vvh-js/data/bezoek.json";

function haalOp() {
  if (lokaal) return readFileSync(lokaal, "utf8");
  // Bestaat het bestand nog niet (nog geen bezoek geteld), dan een lege telling.
  return execFileSync(
    "ssh",
    ["-i", sleutel, "-o", "BatchMode=yes", "-o", "ConnectTimeout=10", host, `cat ${bestand} 2>/dev/null || echo '{}'`],
    { encoding: "utf8" },
  );
}

const dagNl = (d) => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Amsterdam" }).format(d);
const vandaag = dagNl(new Date());
const dagenTerug = (n) => dagNl(new Date(Date.now() - n * 86_400_000));
const gisteren = dagenTerug(1);

const fmtDag = (iso) =>
  new Intl.DateTimeFormat("nl-NL", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" })
    .format(new Date(`${iso}T00:00:00Z`));
const rechts = (v, n) => String(v).padStart(n);

const dagen = JSON.parse(haalOp()).dagen ?? {};
const alleDagen = Object.keys(dagen).sort();
const leeg = { app: 0, browser: 0, paginas: {} };
const dag = (d) => dagen[d] ?? leeg;
const bezoekers = (d) => dag(d).app + dag(d).browser;
const paginas = (d) => Object.values(dag(d).paginas ?? {}).reduce((s, n) => s + n, 0);
const som = (vanaf, tot) =>
  alleDagen.filter((d) => d >= vanaf && d < tot).reduce((s, d) => s + bezoekers(d), 0);

const regels = [];
regels.push("VVH Harlingen app — bezoekers");
regels.push(`Bijgewerkt: ${new Date().toLocaleString("nl-NL", { timeZone: "Europe/Amsterdam" })}`);
regels.push(
  `Geteld sinds: ${alleDagen[0] ? `${fmtDag(alleDagen[0])} ${alleDagen[0].slice(0, 4)}` : "nog geen gegevens"}`,
);
regels.push("");
regels.push("Bezoeker = een toestel dat de app die dag minstens één keer opende.");
regels.push("App = geïnstalleerd op het beginscherm; browser = via de website.");
regels.push("Geen IP-adressen of persoonsgegevens; alleen dagtotalen.");
regels.push("");

regels.push(`VANDAAG TOT NU TOE (${fmtDag(vandaag)})`);
regels.push(`  Bezoekers:        ${bezoekers(vandaag)}  (app ${dag(vandaag).app}, browser ${dag(vandaag).browser})`);
regels.push(`  Pagina's geopend: ${paginas(vandaag)}`);
for (const [pad, aantal] of Object.entries(dag(vandaag).paginas ?? {}).sort((a, b) => b[1] - a[1])) {
  regels.push(`    ${pad.padEnd(26)}${rechts(aantal, 6)}`);
}
regels.push("");

regels.push(`GISTEREN (${fmtDag(gisteren)})`);
regels.push(`  Bezoekers:        ${bezoekers(gisteren)}  (app ${dag(gisteren).app}, browser ${dag(gisteren).browser})`);
regels.push(`  Pagina's geopend: ${paginas(gisteren)}`);
regels.push("");

const vanaf30 = dagenTerug(30);
regels.push("TOTALEN (t/m gisteren)");
regels.push(`  Laatste 7 dagen:  ${som(dagenTerug(7), vandaag)} bezoeken`);
regels.push(`  Laatste 30 dagen: ${som(vanaf30, vandaag)} bezoeken`);
regels.push(`  Laatste 90 dagen: ${som(dagenTerug(90), vandaag)} bezoeken`);
regels.push("");

regels.push("LAATSTE 14 DAGEN");
regels.push("  Dag            Bezoekers   App  Browser  Pagina's");
for (let i = 14; i >= 1; i--) {
  const d = dagenTerug(i);
  regels.push(
    `  ${fmtDag(d).padEnd(14)}${rechts(bezoekers(d), 10)}${rechts(dag(d).app, 6)}${rechts(dag(d).browser, 9)}${rechts(paginas(d), 10)}`,
  );
}
regels.push("");

regels.push("MEEST BEKEKEN PAGINA'S (laatste 30 dagen)");
const top = new Map();
for (const d of alleDagen.filter((x) => x >= vanaf30 && x < vandaag)) {
  for (const [pad, aantal] of Object.entries(dag(d).paginas ?? {})) {
    top.set(pad, (top.get(pad) ?? 0) + aantal);
  }
}
if (top.size === 0) regels.push("  nog geen gegevens");
for (const [pad, aantal] of [...top.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15)) {
  regels.push(`  ${pad.padEnd(28)}${rechts(aantal, 6)}`);
}
regels.push("");

writeFileSync(uitvoer, regels.join("\r\n"), "utf8");
console.log(`Rapport geschreven: ${uitvoer}`);
