// app/components/SeasonTeamStatsTable.tsx
import { apiGetJson } from "@/app/lib/api";
import { Team } from "@/app/lib/types";
import { JSX } from "react";
import Link from "next/link";

type TeamStats = {
  teamId: number;
  games: number;
  wins: number;
  losses: number;
  winPct: number;
  whiteWins: number;
  blackWins: number;
  naturalWins: number;
  whiteGames: number;
  blackGames: number;
  naturalGames: number;
  bestLocation: string | null;
  bestLocationWins: number;
};

async function fetchTeamStats(
  seasonId: string | number
): Promise<TeamStats[]> {
  const res = await apiGetJson<TeamStats[] | { data: TeamStats[] }>(
    `/seasons/${seasonId}/stats/teams`
  ).catch(() => ({ data: [] as TeamStats[] }));

  return Array.isArray(res) ? res : res?.data ?? [];
}

async function TeamName({ id }: { id: number }) {
  const t = await apiGetJson<Team | null>(`/teams/${id}`).catch(() => null);
  if (!t) return <span>Team #{id}</span>;
  return (
    <Link href={`/teams/${id}`} className="hover:underline">
      {t.Name ?? `Team #${id}`}
    </Link>
  );
}

export function SeasonTeamStatsSkeleton() {
  return (
    <div className="rounded-xl border bg-white p-4 animate-pulse space-y-3">
      <div className="h-4 w-56 bg-neutral-200 rounded" />
      <div className="h-3 w-full bg-neutral-200 rounded" />
      <div className="h-3 w-[94%] bg-neutral-200 rounded" />
      <div className="h-3 w-[90%] bg-neutral-200 rounded" />
      <div className="h-3 w-[86%] bg-neutral-200 rounded" />
    </div>
  );
}

function colorRecord(games: number, wins: number): string {
  if (!games) return "–";
  const losses = games - wins;
  return `${wins}-${losses}`;
}

async function Impl({
  seasonId,
}: {
  seasonId: string | number;
}): Promise<JSX.Element> {
  const stats = await fetchTeamStats(seasonId);

  if (!stats.length) {
    return (
      <div className="rounded-xl border bg-white p-4 text-sm text-neutral-600">
        No team stats yet.
      </div>
    );
  }

  // Sort by winPct desc, then wins desc, then games desc
  const ordered = stats
    .slice()
    .sort(
      (a, b) =>
        b.winPct - a.winPct ||
        b.wins - a.wins ||
        b.games - a.games ||
        a.teamId - b.teamId
    );

  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-neutral-50 text-neutral-600">
          <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
            <th className="w-10">#</th>
            <th>Team</th>
            <th className="text-right">GP</th>
            <th className="text-right">W</th>
            <th className="text-right">L</th>
            <th className="text-right">Win %</th>
            <th className="text-right">White</th>
            <th className="text-right">Black</th>
            <th className="text-right">Natural</th>
            <th className="text-right">Best Location</th>
          </tr>
        </thead>
        <tbody className="[&>tr]:border-t">
          {ordered.map((t, idx) => {
            const rank = idx + 1;
            const bestLoc =
              t.bestLocation && t.bestLocation.trim().length > 0
                ? t.bestLocation
                : "Unknown";

            const whiteRec = colorRecord(t.whiteGames, t.whiteWins);
            const blackRec = colorRecord(t.blackGames, t.blackWins);
            const natRec = colorRecord(t.naturalGames, t.naturalWins);

            return (
              <tr key={t.teamId} className="[&>td]:px-3 [&>td]:py-2">
                <td className="text-neutral-500">{rank}</td>
                <td className="font-medium">
                  <TeamName id={t.teamId} />
                </td>
                <td className="text-right">{t.games}</td>
                <td className="text-right">{t.wins}</td>
                <td className="text-right">{t.losses}</td>
                <td className="text-right">
                  {(t.winPct * 100).toFixed(1)}%
                </td>

                {/* Color records */}
                <td className="text-right">
                  <span className="inline-flex items-center justify-end gap-1">
                    <span className="h-2 w-2 rounded-full bg-white border" />
                    <span>{whiteRec}</span>
                  </span>
                </td>
                <td className="text-right">
                  <span className="inline-flex items-center justify-end gap-1">
                    <span className="h-2 w-2 rounded-full bg-black" />
                    <span>{blackRec}</span>
                  </span>
                </td>
                <td className="text-right">
                  <span className="inline-flex items-center justify-end gap-1">
                    <span className="h-2 w-2 rounded-full bg-amber-200 border" />
                    <span>{natRec}</span>
                  </span>
                </td>

                {/* Best location */}
                <td className="text-right">
                  <div className="inline-flex flex-col items-end">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-neutral-100">
                      {bestLoc}
                    </span>
                    <span className="text-[11px] text-neutral-500 mt-0.5">
                      {t.bestLocationWins} win
                      {t.bestLocationWins === 1 ? "" : "s"}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

type Comp = (p: { seasonId: string | number }) => Promise<JSX.Element>;

const SeasonTeamStatsTable = Object.assign(Impl as Comp, {
  Skeleton: SeasonTeamStatsSkeleton,
});

export default SeasonTeamStatsTable;
