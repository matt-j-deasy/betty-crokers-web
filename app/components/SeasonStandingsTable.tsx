// app/components/SeasonStandingsTable.tsx
import { apiGetJson } from "@/app/lib/api";
import { SeasonStanding } from "@/app/lib/types";
import { JSX } from "react";

async function fetchSeasonStandings(seasonId: string | number): Promise<SeasonStanding[]> {
  // GET /seasons/:id/standings -> SeasonStanding[]
  const res = await apiGetJson<SeasonStanding[] | { data: SeasonStanding[] }>(
    `/seasons/${seasonId}/standings`
  ).catch(() => ({ data: [] as SeasonStanding[] }));

  return Array.isArray(res) ? res : res?.data ?? [];
}

export function SeasonStandingsSkeleton() {
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

async function Impl({ seasonId }: { seasonId: string | number }) {
  const rows = await fetchSeasonStandings(seasonId);

  if (!rows.length) {
    return (
      <div className="rounded-xl border bg-white p-4 text-sm text-neutral-600">
        No standings yet.
      </div>
    );
  }

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
            <th className="text-right">T</th>
            <th className="text-right">PF</th>
            <th className="text-right">PA</th>
            <th className="text-right">Diff</th>
            <th className="text-right">Win %</th>
            <th className="text-right">Pts</th>
          </tr>
        </thead>
        <tbody className="[&>tr]:border-t">
          {rows
            .slice()
            // Primary sort: Win% desc, then Diff desc, then PF desc
            .sort((a, b) =>
              b.winPct !== a.winPct
                ? b.winPct - a.winPct
                : b.pointDiff !== a.pointDiff
                ? b.pointDiff - a.pointDiff
                : b.pointsFor - a.pointsFor
            )
            .map((r, idx) => {
              // Typical 2/1/0 points system; adjust if your league differs.
              const points = r.wins * 2 + r.ties * 1;
              return (
                <tr key={r.teamId} className="[&>td]:px-3 [&>td]:py-2">
                  <td className="text-neutral-500">{idx + 1}</td>
                  <td className="font-medium">{r.teamName}</td>
                  <td className="text-right">{r.games}</td>
                  <td className="text-right">{r.wins}</td>
                  <td className="text-right">{r.losses}</td>
                  <td className="text-right">{r.ties}</td>
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
  );
}

// typed static `Skeleton`
type Comp = (p: { seasonId: string | number }) => Promise<JSX.Element>;
const SeasonStandingTable = Object.assign(Impl as Comp, { Skeleton: SeasonStandingsSkeleton });
export default SeasonStandingTable;