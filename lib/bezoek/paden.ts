/** Vaste pagina's van de app; alleen deze worden geteld. */
const VASTE_PADEN = new Set([
  "/home",
  "/programma",
  "/standen",
  "/teams",
  "/news",
  "/nevobo-nieuws",
  "/waddenhal",
  "/info",
]);

/**
 * Maakt van een adres een bekende paginanaam, of null als het geen pagina van de app is.
 * Zo komt er nooit willekeurige tekst in het telbestand.
 */
export function normaliseerPad(pad: unknown): string | null {
  if (typeof pad !== "string" || pad.length > 100) return null;
  const schoon = pad.replace(/\/+$/, "") || "/home";
  if (schoon === "/") return "/home";
  // /team/XX en /standen/XX sturen door naar /teams en /standen en worden daar geteld.
  return VASTE_PADEN.has(schoon) ? schoon : null;
}
