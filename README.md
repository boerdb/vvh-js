# VVH Harlingen app

PWA voor volleybalvereniging VVH Harlingen: programma, thuiswedstrijden in de
Waddenhal, uitslagen, standen en clubnieuws. Live op **https://vvh.clvs.nl**.

Gebouwd met Next.js 16 (App Router), React 19, Tailwind 4 en Serwist (service worker).

## Ontwikkelen

```bash
cp .env.example .env.local   # eenmalig
npm install
npm run dev                  # http://localhost:3000, service worker staat uit in dev
```

| Script | Doel |
|--------|------|
| `npm run dev` | Ontwikkelserver |
| `npm run build` / `npm start` | Productiebuild en -server |
| `npm test` | Vitest: parsers, agenda-export, teamcodes (`tests/`) |
| `npm run lint` | ESLint |
| `npm run icons` | App-icons opnieuw maken uit `assets/vvh-app-icon.svg` |

Maak de lockfile met npm 11 (`npx npm@11 install`); de server draait npm 11 en
`npm ci` faalt op een lockfile van npm 10.

## Hoe het werkt

- De browser praat alleen met eigen routes onder `/api/…`; die halen Nevobo
  (RSS en `stand.xlsx`), het WordPress-clubnieuws en TheSportsDB op en cachen
  60 seconden. Zie [`deploy/API-upstream.md`](deploy/API-upstream.md).
- `GET /api/agenda?wedstrijd=<id>` geeft één wedstrijd als `.ics`,
  `GET /api/agenda?team=HS1` een agenda-abonnement (via `webcal://`).
- De service worker bewaart API-antwoorden tot twee dagen, zodat de app ook
  zonder bereik het laatst bekende programma toont (met een melding).
- **Mijn team** (ster naast het teamfilter) staat in `localStorage` en is het
  standaardfilter op de wedstrijdpagina's en op Home.

## Teams aanpassen

Alle teams staan in [`lib/constants/teams.ts`](lib/constants/teams.ts).
Combinatieteams die bij een andere vereniging zijn ingeschreven krijgen een
`nevoboName` en `verenigingId`; hun feeds worden bij die van VVH gevoegd.

## Deploy

Handmatig op de server (PM2, poort 3003, nginx ervoor):

```bash
cd /var/www/vvh-js && git pull && npm ci && npm run build && pm2 restart vvh-js
```

Nginx-config: [`deploy/nginx-vvh.clvs.nl.conf`](deploy/nginx-vvh.clvs.nl.conf).
