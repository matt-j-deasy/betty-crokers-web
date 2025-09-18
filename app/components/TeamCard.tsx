// app/components/TeamCard.tsx
import Link from "next/link";
import { Team } from "../lib/types";
import { apiGetJson } from "../lib/api";
import { JSX } from "react";

async function fetchTeam(id: number): Promise<Team | null> {
  const res = await apiGetJson<Team>(`/teams/${id}`).catch(() => null);
  return res ?? null;
}

function TeamCardSkeleton() {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-neutral-200" />
        <div className="space-y-2 w-full">
          <div className="h-4 w-40 bg-neutral-200 rounded" />
          <div className="h-3 w-24 bg-neutral-200 rounded" />
        </div>
      </div>
    </div>
  );
}

async function Impl({ teamId }: { teamId: number }) {
  const team = await fetchTeam(teamId);

  if (!team) {
    return (
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="text-sm text-neutral-500">Team not found.</div>
      </div>
    );
  }

  return (
    <Link
      href={`/teams/${team.ID}`}
      className="block rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full border flex items-center justify-center text-sm font-medium">
          {String(team.Name ?? "").slice(0, 2).toUpperCase() || "TM"}
        </div>
        <div className="min-w-0">
          <div className="truncate font-semibold">{team.Name ?? "Unnamed Team"}</div>
          {/* <div className="text-xs text-neutral-500">View Team →</div> */}
        </div>
      </div>
    </Link>
  );
}

// typed static `Skeleton`
type Comp = (p: { teamId: string | number }) => Promise<JSX.Element>;
const TeamCard = Object.assign(Impl as Comp, { Skeleton: TeamCardSkeleton });
export default TeamCard;

