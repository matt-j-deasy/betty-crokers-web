// app/components/GameCard.tsx
import Link from "next/link";
import { apiGetJson } from "../lib/api";
import { GameWithSides } from "../lib/types";
import { JSX } from "react";

async function fetchGame(id: number): Promise<GameWithSides | null> {
  const res = await apiGetJson<GameWithSides>(`/games/${id}/with-sides`).catch(() => null);
  return res ?? null;
}

function GameCardSkeleton() {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm animate-pulse">
      <div className="space-y-2">
        <div className="h-4 w-24 bg-neutral-200 rounded" />
        <div className="h-3 w-40 bg-neutral-200 rounded" />
        <div className="h-4 w-56 bg-neutral-200 rounded" />
      </div>
    </div>
  );
}

async function Impl({ gameId }: { gameId: number }) {
  const gws = await fetchGame(gameId);

  if(!gws || !gws.game) {
    return (
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="text-sm text-neutral-500">Game not found.</div>
      </div>
    );
  }

  const game = gws.game;

  if (!game) {
    return (
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="text-sm text-neutral-500">Game not found.</div>
      </div>
    );
  }

  const sides = gws.sides || [];
  const sideA = sides.find(s => s.Side === 'A');
  const sideB = sides.find(s => s.Side === 'B');

  const date = game.CreatedAt ? new Date(game.CreatedAt) : null;
  const when = date ? date.toLocaleString() : "TBD";

  return (
    <Link
      href={`/games/${game.ID}`}
      className="block rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="font-semibold truncate">Game #{game.ID}</div>
          <div className="text-xs text-neutral-500">{when}</div>
          <div className="mt-2 text-sm text-neutral-700">
            {sideA?.TeamID ?? "—"} {typeof sideA?.Points === "number" ? sideA?.Points : "–"}
            {"  vs  "}
            {typeof sideB?.Points === "number" ? sideB?.Points : "–"} {sideB?.TeamID ?? "—"}
          </div>
        </div>
        <div className="text-xs text-neutral-500 shrink-0">View →</div>
      </div>
    </Link>
  );
}

// typed static `Skeleton`
type Comp = (p: { gameId: string | number }) => Promise<JSX.Element>;
const GameCard = Object.assign(Impl as Comp, { Skeleton: GameCardSkeleton });
export default GameCard;
