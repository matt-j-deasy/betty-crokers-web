// app/components/GameCard.tsx
import Link from "next/link";
import { apiGetJson } from "../lib/api";
import { JSX } from "react";
import { Team, GameWithSides } from "../lib/types";

/** ---- Data fetchers ---- */
async function fetchGameWithSides(id: number): Promise<GameWithSides | null> {
  const res = await apiGetJson<GameWithSides>(`/games/${id}/with-sides`).catch(() => null);
  return res ?? null;
}

async function fetchTeam(id: number | null | undefined): Promise<Team | null> {
  if (!id && id !== 0) return null;
  const res = await apiGetJson<Team>(`/teams/${id}`).catch(() => null);
  return res ?? null;
}

/** ---- Skeleton ---- */
function GameCardSkeleton() {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm animate-pulse">
      <div className="space-y-2">
        <div className="h-4 w-28 bg-neutral-200 rounded" />
        <div className="h-3 w-44 bg-neutral-200 rounded" />
        <div className="h-4 w-64 bg-neutral-200 rounded" />
      </div>
    </div>
  );
}

/** ---- Component ---- */
async function Impl({ gameId }: { gameId: number }) {
  const gws = await fetchGameWithSides(gameId);

  if (!gws || !gws.game) {
    return (
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="text-sm text-neutral-500">Game not found.</div>
      </div>
    );
  }

  const game = gws.game;
  const sides = gws.sides ?? [];
  const sideA = sides.find((s) => s.Side === "A");
  const sideB = sides.find((s) => s.Side === "B");

  // Load teams in parallel (if present)
  const [teamA, teamB] = await Promise.all([
    fetchTeam(sideA?.TeamID ?? undefined),
    fetchTeam(sideB?.TeamID ?? undefined),
  ]);

  const teamAName = teamA?.Name ?? (sideA?.TeamID ? `Team #${sideA.TeamID}` : "—");
  const teamBName = teamB?.Name ?? (sideB?.TeamID ? `Team #${sideB.TeamID}` : "—");

  const aPoints = typeof sideA?.Points === "number" ? sideA.Points : "–";
  const bPoints = typeof sideB?.Points === "number" ? sideB.Points : "–";

  const when = (() => {
    const ts = game.CreatedAt;
    if (!ts) return "TBD";
    const d = new Date(ts);
    return d.toLocaleString();
  })();

  const winnerSide = game.WinnerSide === "A" || game.WinnerSide === "B" ? game.WinnerSide : null;

  return (
    <Link
      href={`/games/${game.ID}`}
      className="block rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="font-semibold truncate">Game #{game.ID}</div>
          <div className="text-xs text-neutral-500">{when}</div>

          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className={`truncate ${winnerSide === "A" ? "font-semibold" : ""}`}>
                {teamAName}
              </span>
              <span className={`shrink-0 tabular-nums ${winnerSide === "A" ? "font-semibold" : ""}`}>
                {aPoints}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className={`truncate ${winnerSide === "B" ? "font-semibold" : ""}`}>
                {teamBName}
              </span>
              <span className={`shrink-0 tabular-nums ${winnerSide === "B" ? "font-semibold" : ""}`}>
                {bPoints}
              </span>
            </div>
          </div>
        </div>

        <div className="text-xs text-neutral-500 shrink-0">View →</div>
      </div>
    </Link>
  );
}

/** ---- typed static Skeleton (matches your PlayerCard pattern) ---- */
type Comp = (p: { gameId: number }) => Promise<JSX.Element>;
const GameCard = Object.assign(Impl as Comp, { Skeleton: GameCardSkeleton });
export default GameCard;
