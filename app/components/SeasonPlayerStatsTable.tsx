// app/components/SeasonPlayerStatsTable.tsx
import { apiGetJson } from "@/app/lib/api";
import { Player } from "@/app/lib/types";
import Link from "next/link";
import { JSX } from "react";

type PlayerStats = {
  playerId: number;
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
};

async function fetchPlayerStats(
  seasonId: string | number
): Promise<PlayerStats[]> {
  const res = await apiGetJson<PlayerStats[] | { data: PlayerStats[] }>(
    `/seasons/${seasonId}/stats/players`
  ).catch(() => ({ data: [] as PlayerStats[] }));

  return Array.isArray(res) ? res : res?.data ?? [];
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

export function SeasonPlayerStatsSkeleton() {
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
  const stats = await fetchPlayerStats(seasonId);

  if (!stats.length) {
    return (
      <div className="rounded-xl border bg-white p-4 text-sm text-neutral-600">
        No player stats yet.
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
        a.playerId - b.playerId
    );

  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-neutral-50 text-neutral-600">
          <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
            <th className="w-10">#</th>
            <th>Player</th>
            <th className="text-right">GP</th>
            <th className="text-right">W</th>
            <th className="text-right">L</th>
            <th className="text-right">Win %</th>
            <th className="text-right">White</th>
            <th className="text-right">Black</th>
            <th className="text-right">Natural</th>
          </tr>
        </thead>
        <tbody className="[&>tr]:border-t">
          {ordered.map((p, idx) => {
            const rank = idx + 1;

            const whiteRec = colorRecord(p.whiteGames, p.whiteWins);
            const blackRec = colorRecord(p.blackGames, p.blackWins);
            const natRec = colorRecord(p.naturalGames, p.naturalWins);

            return (
              <tr key={p.playerId} className="[&>td]:px-3 [&>td]:py-2">
                <td className="text-neutral-500">{rank}</td>
                <td className="font-medium">
                  <PlayerName id={p.playerId} />
                </td>
                <td className="text-right">{p.games}</td>
                <td className="text-right">{p.wins}</td>
                <td className="text-right">{p.losses}</td>
                <td className="text-right">
                  {(p.winPct * 100).toFixed(1)}%
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
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

type Comp = (p: { seasonId: string | number }) => Promise<JSX.Element>;

const SeasonPlayerStatsTable = Object.assign(Impl as Comp, {
  Skeleton: SeasonPlayerStatsSkeleton,
});

export default SeasonPlayerStatsTable;
