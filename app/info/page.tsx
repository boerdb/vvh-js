import Link from "next/link";

export default function InfoPage() {
  return (
    <div className="page-container">
      <h1 className="page-title">Informatie</h1>

      <article className="match-card">
        <div className="match-card-header">
          <h2 className="match-card-title">VVH Harlingen</h2>
        </div>
        <div className="match-card-body">
          <div className="match-description">
            <p>
              <strong>Sinds 1971</strong>
              <br />
              Welkom bij VVH! Al meer dan 50 jaar het kloppende volleybalhart
              van de havenstad Harlingen. Wat begon als een hechte groep
              volleyballers is uitgegroeid tot een vereniging waar generaties
              spelers thuis zijn — van de eerste bal in de zaal tot het
              niveau waar passie en plezier samenkomen met ambitie.
            </p>
            <p>
              <strong>Onze Waddenhal</strong>
              <br />
              Thuiswedstrijden spelen we in de Waddenhal: de plek waar
              supporters, ouders en teamgenoten elkaar ontmoeten. De sfeer in
              de zaal hoort bij VVH — supporteren, een duw geven na een goede
              rally en samen genieten van het spel.
            </p>
            <p>
              <strong>Voor iedere speler</strong>
              <br />
              Van de allereerste stappen bij de Volley Stars (CMV) tot de harde
              smashes bij Heren 1 en Dames 1, en alles daartussen met jeugd-
              en recreatieteams. Bij VVH is ruimte voor zowel topsport als
              breedtesport. Iedereen leert, groeit en speelt op het niveau dat
              bij hem of haar past.
            </p>
            <p>
              <strong>Teams en competities</strong>
              <br />
              In de app vind je het actuele programma, uitslagen en standen van
              onze teams — van Heren en Dames tot Mix en Meisjes. Zo blijf je
              op de hoogte van wedstrijden thuis en uit, ook buiten het
              seizoen als je terugkijkt op gespeelde duels.
            </p>
            <p>
              <strong>Gedragen door vrijwilligers</strong>
              <br />
              Onze ware motor staat langs de kantlijn. Zonder de inzet van
              bevlogen trainers, scheidsrechters, meereizende ouders en
              commissieleden rolt er geen bal. Bestuur, bar, materialen en
              organisatie: het gebeurt allemaal dankzij mensen die VVH een warm
              hart toedragen. Samen maken we VVH!
            </p>
            <p>
              <strong>Meer weten of meedoen?</strong>
              <br />
              Nieuws, inschrijvingen, contact en alles over de vereniging vind
              je op onze website. Daar lees je ook het laatste clubnieuws en
              hoe je contact opneemt met de juiste commissie.
            </p>
          </div>
          <a
            href="https://www.vvh-harlingen.nl"
            target="_blank"
            rel="noopener noreferrer"
            className="match-card-btn"
          >
            Bezoek vvh-harlingen.nl
          </a>
          <Link href="/news" className="match-card-btn club-info-btn-secondary">
            Clubnieuws in de app
          </Link>
        </div>
      </article>

      <p className="copyright-text">
        © 2026 Clinical Vision | V 1.0.0 | Alle rechten voorbehouden.
      </p>
    </div>
  );
}
