# Upstream-data via Next.js API (geen externe proxy.php meer)

De app haalt Nevobo-, clubnieuws- en Nations League-data **server-side** op.
De browser praat alleen met eigen routes onder `/api/…` op hetzelfde domein
(bijv. `https://vvh.clvs.nl`). De oude CORS-proxy op `weer.benswebradio.nl/proxy.php`
is daarmee **niet meer nodig** voor VVH.

## API-routes

| Route | Bron |
|-------|------|
| `GET /api/programma` | Nevobo verenigingsprogramma (RSS) |
| `GET /api/nevobo-nieuws` | Nevobo algemeen nieuws (RSS) |
| `GET /api/news` | WordPress clubnieuws (JSON) |
| `GET /api/team/{code}/programma` | Nevobo teamprogramma (RSS) |
| `GET /api/team/{code}/resultaten` | Nevobo teamuitslagen (RSS) |
| `GET /api/standen?team=HS1` | Nevobo standen (XLSX → JSON) |
| `GET /api/nations-league?limit=3` | TheSportsDB Nations League (fallback homepage) |

Teamcodes in de URL: `HS1`, `DS2`, `XB1`, `MA1`, `MC1`, enz.

## Omgevingsvariabelen

Op de server (bijv. `.env.local` of PM2-ecosysteem):

```env
NEVOBO_VERENIGING_ID=CKL6L32
```

Standaard is `CKL6L32` (VVH Harlingen) al ingebouwd; alleen zetten als dat ooit wijzigt.

`NEXT_PUBLIC_PROXY_BASE_URL` wordt **niet meer gebruikt** en kan uit productie-config.

## Nevobo-URL’s (ter referentie)

De logica staat in `lib/constants/nevobo.ts` en komt overeen met de oude `proxy.php`:

- Programma: `https://api.nevobo.nl/export/vereniging/CKL6L32/programma.rss`
- Team: `https://api.nevobo.nl/export/team/CKL6L32/{heren\|dames\|mix-b\|meiden-*}/{nr}/programma.rss`
- Standen: `https://api.nevobo.nl/export/vereniging/CKL6L32/stand.xlsx`

Upstream-responses worden **5 minuten** gecached (`revalidate: 300` in `lib/server/upstream.ts`).

## Deploy-stappen

1. Code pull/build op de server:
   ```bash
   npm ci
   npm run build
   ```
2. Zorg dat Node/PM2 de app start (poort **3003**, zie `ecosystem.config.cjs`).
3. Nginx blijft alles naar Next doorsturen (`deploy/nginx-vvh.clvs.nl.conf`) — geen aparte PHP-proxy nodig.
4. Herstart de app:
   ```bash
   pm2 restart vvh-js   # of de naam uit ecosystem.config.cjs
   ```
5. Controleer na deploy:
   - `https://vvh.clvs.nl/api/programma` → JSON-array (kan leeg zijn buiten seizoen)
   - `https://vvh.clvs.nl/api/standen?team=HS1` → JSON met `standen` / `poule`
   - Homepage zonder clubwedstrijden → Nations League-kaarten (via `/api/nations-league`)

## Nations League (homepage)

Als Nevobo **geen komende** wedstrijden heeft, toont de homepage automatisch
komende Nations League-wedstrijden (heren + dames). Zodra het clubprogramma weer
gevuld is, schakelt de homepage terug naar VVH-wedstrijden — geen extra instelling.

## Foutafhandeling

- API-route mislukt → HTTP **502** met `{ "error": "…" }`
- Nevobo rate limit (429) → tijdelijk 502; even later opnieuw proberen

## Opruimen (optioneel)

- Externe `proxy.php` op `weer.benswebradio.nl` kan voor VVH uitgeschakeld blijven.
- Verwijder oude `NEXT_PUBLIC_PROXY_BASE_URL` uit productie-`.env` als die nog staat.
