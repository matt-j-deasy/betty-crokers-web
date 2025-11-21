// app/components/SeasonPlayerStandingsTable.tsx
import Link from "next/link";
import { apiGetJson } from "@/app/lib/api";
import { Player, PlayerSeasonStanding, PlayerSeasonStandingsEnvelope } from "@/app/lib/types";
import { JSX } from "react";

/** Fetch standings envelope */
async function fetchPlayerStandings(seasonId: string | number) {
  const res = await apiGetJson<PlayerSeasonStandingsEnvelope | { data: PlayerSeasonStandingsEnvelope }>(
    `/seasons/${seasonId}/standings/players`
  ).catch(() => ({ data: { next_cursor: null, seasonId: Number(seasonId), standings: [] as PlayerSeasonStanding[] } }));

  const env = "standings" in (res as any)
    ? (res as PlayerSeasonStandingsEnvelope)
    : ((res as any)?.data as PlayerSeasonStandingsEnvelope);

  return env ?? { next_cursor: null, seasonId: Number(seasonId), standings: [] as PlayerSeasonStanding[] };
}

/** Small server helper to render a player's display name; falls back to #id */
async function PlayerName({ id }: { id: number }) {
  const p = await apiGetJson<Player | null>(`/players/${id}`).catch(() => null);
  if (!p) return <span>Player #{id}</span>;
  const label = `${p.Nickname ?? `Player #${id}`}`;
  return <Link href={`/players/${id}`} className="hover:underline">{label}</Link>;
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

async function Impl({ seasonId }: { seasonId: string | number }) {
  const { standings, next_cursor } = await fetchPlayerStandings(seasonId);

  if (!standings.length) {
    return (
      <div className="rounded-xl border bg-white p-4 text-sm text-neutral-600">
        No player standings yet.
      </div>
    );
  }

  // Sort: prefer API rank; otherwise by winPct desc, diff desc, PF desc, games desc
  const sorted = standings.slice().sort((a, b) => {
    const ar = a.rank ?? Number.POSITIVE_INFINITY;
    const br = b.rank ?? Number.POSITIVE_INFINITY;
    if (ar !== br) return ar - br;

    // fallback sort if no ranks or equal ranks
    return (b.winPct - a.winPct)
      || (b.pointDiff - a.pointDiff)
      || (b.pointsFor - a.pointsFor)
      || (b.games - a.games);
  });

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
              <th className="w-10">#</th>
              <th>Player</th>
              <th className="text-right">GP</th>
              <th className="text-right">W</th>
              <th className="text-right">L</th>
              <th className="text-right">PF</th>
              <th className="text-right">PA</th>
              <th className="text-right">Diff</th>
              <th className="text-right">Win %</th>
              <th className="text-right">Pts</th>
            </tr>
          </thead>
          <tbody className="[&>tr]:border-t">
            {sorted.map((r, idx) => {
              const rank = r.rank ?? (idx + 1);
              const points = r.wins * 2; // adjust if players earn ties/OT points; align with your league rules
              return (
                <tr key={r.playerId} className="[&>td]:px-3 [&>td]:py-2">
                  <td className="text-neutral-500">{rank}</td>
                  <td className="font-medium">
                    {/* Server-side name fetch; if scale grows, return names from API or add batch endpoint */}
                    <PlayerName id={r.playerId} />
                  </td>
                  <td className="text-right">{r.games}</td>
                  <td className="text-right">{r.wins}</td>
                  <td className="text-right">{r.losses}</td>
                  <td className="text-right">{r.pointsFor}</td>
                  <td className="text-right">{r.pointsAgainst}</td>
                  <td className="text-right">{r.pointDiff}</td>
                  <td className="text-right">{(r.winPct * 100).toFixed(1)}%</td>
                  <td className="text-right font-semibold">{points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {next_cursor ? (
        <div className="text-xs text-neutral-500">
          More available… (paging not wired yet). Expose a “Load more” with `next_cursor` when needed.
        </div>
      ) : null}
    </div>
  );
}



// typed static `Skeleton`
type Comp = (p: { seasonId: string | number }) => Promise<JSX.Element>;
const SeasonPlayersStandingTable = Object.assign(Impl as Comp, { Skeleton: SeasonPlayerStandingsSkeleton });
export default SeasonPlayersStandingTable;