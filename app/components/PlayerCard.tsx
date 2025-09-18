// app/components/PlayerCard.tsx
import Link from "next/link";
import { Player } from "../lib/types";
import { apiGetJson } from "../lib/api";
import { JSX } from "react";

async function fetchPlayer(id: number): Promise<Player | null> {
  // Assuming GET /api/players/:id exists via proxy below; otherwise swap to list+find.
  const res = await apiGetJson<Player>(`/players/${id}`).catch(() => null);
  return res ?? null;
}

function PlayerCardSkeleton() {
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

async function Impl({ playerId }: { playerId: number }) {
  const player = await fetchPlayer(playerId);

  if (!player) {
    return (
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="text-sm text-neutral-500">Player not found.</div>
      </div>
    );
  }

  return (
    <Link
      href={`/players/${player.ID}`}
      className="block rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full border flex items-center justify-center text-sm font-medium">
          {String(player.Nickname ?? "").slice(0, 2).toUpperCase() || "PL"}
        </div>
        <div className="min-w-0">
          <div className="truncate font-semibold">{player.Nickname ?? "Unnamed Player"}</div>
          {/* <div className="text-xs text-neutral-500">View Profile →</div> */}
        </div>
      </div>
    </Link>
  );
}

// typed static `Skeleton`
type Comp = (p: { playerId: string | number }) => Promise<JSX.Element>;
const PlayerCard = Object.assign(Impl as Comp, { Skeleton: PlayerCardSkeleton });
export default PlayerCard;
