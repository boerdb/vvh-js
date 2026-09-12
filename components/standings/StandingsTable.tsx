import type { StandenResult, StandingRow } from "@/lib/types/models";
import { formatTeamCode, getTeamLabel } from "@/lib/constants/teams";

interface StandingsTableProps {
  teamCode: string;
  result: StandenResult;
  hideHeading?: boolean;
}

export function StandingsTable({
  teamCode,
  result,
  hideHeading = false,
}: StandingsTableProps) {
  const rows = result.standen || [];
  const vvhRow = rows.find(
    (row): row is StandingRow => !row.isDivider && row.isVVH
  );
  const hasStandRows = rows.some((row) => !row.isDivider);
  const pouleNaam = result.poule || "Poule onbekend";

  return (
    <div className="standen-container">
      <div className="standen-header">
        {!hideHeading && (
          <>
            <h2 className="section-title-comp">Stand {teamCode.toUpperCase()}</h2>
            <p className="section-subtitle-comp">
              Huidige stand voor {getTeamLabel(teamCode) || formatTeamCode(teamCode)}
            </p>
          </>
        )}

        <div className="meta-grid">
          <div className="meta-item meta-item-poule">
            <span className="meta-label">Poule</span>
            <strong className="meta-value">{pouleNaam}</strong>
          </div>
          <div className="meta-item meta-item-compact">
            <span className="meta-label">VVH positie</span>
            <strong className="meta-value">#{vvhRow?.rank ?? "-"}</strong>
          </div>
          <div className="meta-item meta-item-compact">
            <span className="meta-label">VVH punten</span>
            <strong className="meta-value">{vvhRow?.punten ?? "-"}</strong>
          </div>
        </div>
      </div>

      <div className="stand-card">
        <table className="stand-table">
          <thead>
            <tr>
              <th className="col-rank">#</th>
              <th className="col-team">Team</th>
              <th className="col-wed">W</th>
              <th className="col-ptn">Ptn</th>
              <th className="col-sets">Sets</th>
            </tr>
          </thead>
          <tbody>
            {hasStandRows && (
              <tr className="poule-divider-row poule-main-row">
                <td colSpan={5}>Reguliere competitie</td>
              </tr>
            )}
            {rows.map((row, index) =>
              row.isDivider ? (
                <tr
                  key={`divider-${row.titel}-${index}`}
                  className="poule-divider-row"
                >
                  <td colSpan={5}>{row.titel}</td>
                </tr>
              ) : (
                <tr
                  key={`${row.team}-${row.rank}-${index}`}
                  className={row.isVVH ? "highlight-vvh" : undefined}
                >
                  <td className="col-rank">{row.rank}</td>
                  <td className="col-team">{row.team}</td>
                  <td className="col-wed">{row.wedstrijden}</td>
                  <td className="col-ptn">{row.punten}</td>
                  <td className="col-sets">{row.sets}</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
