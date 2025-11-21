// app/components/LeagueCard.tsx
import Link from "next/link";
import { apiGetJson } from "../lib/api";
import { League } from "../lib/types";
import { JSX } from "react";
import LocalTime from "./LocalTime";

async function fetchLeague(id: string | number): Promise<League | null> {
  const res = await apiGetJson<League>(`/leagues/${id}`).catch(() => null);
  return res ?? null;
}

function LeagueCardSkeleton() {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm animate-pulse">
      <div className="h-5 w-40 bg-neutral-200 rounded" />
      <div className="mt-2 h-3 w-24 bg-neutral-200 rounded" />
    </div>
  );
}

async function Impl({ leagueId }: { leagueId: string | number }) {
  const league = await fetchLeague(leagueId);

  if (!league) {
    return (
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="text-sm text-neutral-500">League not found.</div>
      </div>
    );
  }

  return (
    <Link
      href={`/leagues/${league.ID}`}
      className="block rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="font-semibold truncate">{league.Name ?? `League #${league.ID}`}</div>
      <div className="text-xs text-neutral-500 mt-1">
        <LocalTime iso={league.CreatedAt} />
      </div>
    </Link>
  );
}

// typed static `Skeleton`
type Comp = (p: { leagueId: string | number }) => Promise<JSX.Element>;
const LeagueCard = Object.assign(Impl as Comp, { Skeleton: LeagueCardSkeleton });
export default LeagueCard;
