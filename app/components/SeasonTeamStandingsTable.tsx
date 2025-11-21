import { apiGetJson } from "@/app/lib/api";
import { SeasonStanding, Team } from "@/app/lib/types";
import Link from "next/link";
import { JSX } from "react";
import SortableTH from "./SortableTH";

async function fetchSeasonTeamStandings(
  seasonId: string | number
): Promise<SeasonStanding[]> {
  console.log("Fetching season standings for season:", seasonId);
  const res = await apiGetJson<SeasonStanding[] | { data: SeasonStanding[] }>(
    `/seasons/${seasonId}/standings`
  ).catch(() => ({ data: [] as SeasonStanding[] }));

  return Array.isArray(res) ? res : res?.data ?? [];
}

/** Small server helper to render a team display name; falls back to #id */
async function TeamName({ id }: { id: number }) {
  const t = await apiGetJson<Team | null>(`/teams/${id}`).catch(() => null);
  if (!t) return <span>Team #{id}</span>;
  const label = `${t.Name ?? `Team #${id}`}`;
  return (
    <Link href={`/teams/${id}`} className="hover:underline">
      {label}
    </Link>
  );
}

export function SeasonTeamStandingsSkeleton() {
  return (
    <div className="rounded-xl border bg-white p-4 animate-pulse space-y-3">
      <div className="h-4 w-40 bg-neutral-200 rounded" />
      <div className="h-3 w-full bg-neutral-200 rounded" />
      <div className="h-3 w-[92%] bg-neutral-200 rounded" />
      <div className="h-3 w-[88%] bg-neutral-200 rounded" />
      <div className="h-3 w-[84%] bg-neutral-200 rounded" />
    </div>
  );
}

// ------------------------------------------------------------
// Sorting
// ------------------------------------------------------------

type SortKey =
  | "rank"
  | "games"
  | "wins"
  | "losses"
  | "ties"
  | "pf"
  | "pa"
  | "diff"
  | "winPct"
  | "points";

const sortFns: Record<
  SortKey,
  (a: SeasonStanding, b: SeasonStanding) => number
> = {
  rank: (a, b) =>
    (b.winPct - a.winPct) ||
    (b.pointDiff - a.pointDiff) ||
    (b.pointsFor - a.pointsFor) ||
    (b.games - a.games),

  games: (a, b) => a.games - b.games,
  wins: (a, b) => a.wins - b.wins,
  losses: (a, b) => a.losses - b.losses,
  ties: (a, b) => a.ties - b.ties,
  pf: (a, b) => a.pointsFor - b.pointsFor,
  pa: (a, b) => a.pointsAgainst - b.pointsAgainst,
  diff: (a, b) => a.pointDiff - b.pointDiff,
  winPct: (a, b) => a.winPct - b.winPct,
  points: (a, b) =>
    (a.wins * 2 + a.ties) - (b.wins * 2 + b.ties), // 2/1/0 system
};

// ------------------------------------------------------------
// Impl
// ------------------------------------------------------------

async function Impl({
  seasonId,
  sortKey = "rank",
  sortDir = "desc",
}: {
  seasonId: string | number;
  sortKey?: SortKey | string;
  sortDir?: "asc" | "desc";
}) {
  const rows = await fetchSeasonTeamStandings(seasonId);

  if (!rows.length) {
    return (
      <div className="rounded-xl border bg-white p-4 text-sm text-neutral-600">
        No standings yet.
      </div>
    );
  }

  const key = (sortKey as SortKey) ?? "rank";
  const dir = sortDir ?? "desc";

  const sorted = rows.slice().sort((a, b) => {
    const fn = sortFns[key] ?? sortFns.rank;
    const cmp = fn(a, b);
    return dir === "asc" ? cmp : -cmp;
  });

  const sortParam = (col: SortKey) => {
    const nextDir = key === col && dir === "desc" ? "asc" : "desc";
    return `?sort=${col}&dir=${nextDir}`;
  };

  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-neutral-50 text-neutral-600">
          <tr className="[&>th]:px-3 [&>th]:py-2 text-left select-none">
            <SortableTH
              href={sortParam("rank")}
              label="#"
              active={key === "rank"}
              dir={dir}
            />
            <th>Team</th>
            <SortableTH
              href={sortParam("games")}
              label="GP"
              active={key === "games"}
              dir={dir}
              numeric
            />
            <SortableTH
              href={sortParam("wins")}
              label="W"
              active={key === "wins"}
              dir={dir}
              numeric
            />
            <SortableTH
              href={sortParam("losses")}
              label="L"
              active={key === "losses"}
              dir={dir}
              numeric
            />
            <SortableTH
              href={sortParam("ties")}
              label="T"
              active={key === "ties"}
              dir={dir}
              numeric
            />
            <SortableTH
              href={sortParam("pf")}
              label="PF"
              active={key === "pf"}
              dir={dir}
              numeric
            />
            <SortableTH
              href={sortParam("pa")}
              label="PA"
              active={key === "pa"}
              dir={dir}
              numeric
            />
            <SortableTH
              href={sortParam("diff")}
              label="Diff"
              active={key === "diff"}
              dir={dir}
              numeric
            />
            <SortableTH
              href={sortParam("winPct")}
              label="Win %"
              active={key === "winPct"}
              dir={dir}
              numeric
            />
            <SortableTH
              href={sortParam("points")}
              label="Pts"
              active={key === "points"}
              dir={dir}
              numeric
            />
          </tr>
        </thead>
        <tbody className="[&>tr]:border-t">
          {sorted.map((r, idx) => {
            const points = r.wins * 2 + r.ties;
            const rank = idx + 1;
            return (
              <tr key={r.teamId} className="[&>td]:px-3 [&>td]:py-2">
                <td className="text-neutral-500">{rank}</td>
                <td className="font-medium">
                  <TeamName id={r.teamId} />
                </td>
                <td className="text-right">{r.games}</td>
                <td className="text-right">{r.wins}</td>
                <td className="text-right">{r.losses}</td>
                <td className="text-right">{r.ties}</td>
                <td className="text-right">{r.pointsFor}</td>
                <td className="text-right">{r.pointsAgainst}</td>
                <td className="text-right">{r.pointDiff}</td>
                <td className="text-right">
                  {(r.winPct * 100).toFixed(1)}%
                </td>
                <td className="text-right font-semibold">{points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

type Comp = (p: {
  seasonId: string | number;
  sortKey?: SortKey | string;
  sortDir?: "asc" | "desc";
}) => Promise<JSX.Element>;

const SeasonTeamStandingsTable = Object.assign(Impl as Comp, {
  Skeleton: SeasonTeamStandingsSkeleton,
});

export default SeasonTeamStandingsTable;