import Link from "next/link";
import { apiGetJson } from "@/app/lib/api";
import {
  Player,
  PlayerSeasonStanding,
  PlayerSeasonStandingsEnvelope,
} from "@/app/lib/types";
import { JSX } from "react";
import SortableTH from "./SortableTH";

async function fetchPlayerStats(seasonId: string | number) {
  const res = await apiGetJson<
    PlayerSeasonStandingsEnvelope | { data: PlayerSeasonStandingsEnvelope }
  >(`/seasons/${seasonId}/standings/players`).catch(() => ({
    data: {
      seasonId: Number(seasonId),
      standings: [] as PlayerSeasonStanding[],
      next_cursor: null,
    },
  }));

  const env =
    "standings" in (res as any)
      ? (res as PlayerSeasonStandingsEnvelope)
      : ((res as any)?.data as PlayerSeasonStandingsEnvelope);

  return (
    env ?? {
      seasonId: Number(seasonId),
      standings: [] as PlayerSeasonStanding[],
      next_cursor: null,
    }
  );
}

async function PlayerName({ id }: { id: number }) {
  const p = await apiGetJson<Player | null>(`/players/${id}`).catch(() => null);
  if (!p) return <span>Player #{id}</span>;
  return (
    <Link href={`/players/${id}`} className="hover:underline">
      {p.Nickname ?? `Player #${id}`}
    </Link>
  );
}

export function SeasonPlayerStandingsSkeleton() {
  return (
    <div className="rounded-xl border bg-white p-4 animate-pulse space-y-3">
      <div className="h-4 w-48 bg-neutral-200 rounded" />
      <div className="h-3 w-full bg-neutral-200 rounded" />
      <div className="h-3 w-[92%] bg-neutral-200 rounded" />
      <div className="h-3 w-[88%] bg-neutral-200 rounded" />
      <div className="h-3 w-[84%] bg-neutral-200 rounded" />
    </div>
  );
}

// ------------------------------------------------------------
// Sort definitions
// ------------------------------------------------------------

type SortKey =
  | "rank"
  | "games"
  | "wins"
  | "losses"
  | "pf"
  | "pa"
  | "diff"
  | "winPct"
  | "points";

const sortFns: Record<
  SortKey,
  (a: PlayerSeasonStanding, b: PlayerSeasonStanding) => number
> = {
  rank: (a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity),
  games: (a, b) => a.games - b.games,
  wins: (a, b) => a.wins - b.wins,
  losses: (a, b) => a.losses - b.losses,
  pf: (a, b) => a.pointsFor - b.pointsFor,
  pa: (a, b) => a.pointsAgainst - b.pointsAgainst,
  diff: (a, b) => a.pointDiff - b.pointDiff,
  winPct: (a, b) => a.winPct - b.winPct,
  points: (a, b) => a.wins * 2 - b.wins * 2,
};

async function Impl({
  seasonId,
  sortKey = "rank",
  sortDir = "desc",
}: {
  seasonId: string | number;
  sortKey?: SortKey | string;
  sortDir?: "asc" | "desc";
}) {
  const { standings } = await fetchPlayerStats(seasonId);

  if (!standings.length) {
    return (
      <div className="rounded-xl border bg-white p-4 text-sm text-neutral-600">
        No player stats yet.
      </div>
    );
  }

  const key = (sortKey as SortKey) ?? "rank";
  const dir = sortDir ?? "desc";

  const sorted = standings.slice().sort((a, b) => {
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
            <th>Player</th>
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
            const rank = r.rank ?? idx + 1;
            const points = r.wins * 2;

            return (
              <tr key={r.playerId} className="[&>td]:px-3 [&>td]:py-2">
                <td className="text-neutral-500">{rank}</td>
                <td className="font-medium">
                  <PlayerName id={r.playerId} />
                </td>
                <td className="text-right">{r.games}</td>
                <td className="text-right">{r.wins}</td>
                <td className="text-right">{r.losses}</td>
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

const SeasonPlayerStandingsTable = Object.assign(Impl as Comp, {
  Skeleton: SeasonPlayerStandingsSkeleton,
});

export default SeasonPlayerStandingsTable;
