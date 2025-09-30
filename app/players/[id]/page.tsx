// app/players/[id]/page.tsx
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { apiGetJson } from "@/app/lib/api";
import { Game, Player, Team } from "@/app/lib/types";
import TeamCard from "@/app/components/TeamCard";
import GameCard from "@/app/components/GameCard";

export const dynamic = "force-dynamic";

type Params = { id: string };

async function fetchPlayer(id: number): Promise<Player | null> {
  const player = await apiGetJson<Player>(`/players/${id}`).catch(() => null);
  return player ?? null;
}

async function fetchPlayerTeams(id: number): Promise<Team[]> {
  // Prefer a dedicated endpoint if present; fallback to query param.
  // Assumes: GET /players/:id/teams -> Team[] or { data: Team[] }
  const res = await apiGetJson<Team[] | { data: Team[] }>(`/teams?playerId=${id}`).catch(
    () => ({ data: [] as Team[] })
  );
  return Array.isArray(res) ? res : res?.data ?? [];
}

async function fetchRecentGames(id: number): Promise<Game[]> {
  // Assumes: GET /games?playerId=X&limit=25 -> Game[] or { data: Game[] }
  const res = await apiGetJson<Game[] | { data: Game[] }>(`/games?playerId=${id}&limit=25`).catch(
    () => ({ data: [] as Game[] })
  );
  return Array.isArray(res) ? res : res?.data ?? [];
}

export default async function PlayerPage(props: { params: Promise<Params> }) {
  const params = await props.params;
  const playerId = Number(params.id);
  if (Number.isNaN(playerId)) notFound();

  const [player, teams, games] = await Promise.all([
    fetchPlayer(playerId),
    fetchPlayerTeams(playerId),
    fetchRecentGames(playerId),
  ]);

  if (!player) notFound();

  const playerName = player.FirstName?.trim() + " " + (player.LastName?.trim() || "") || player.Nickname?.trim() || `Player #${player.ID}`;

  return (
    <section className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {playerName}
          </h1>
          {player.Nickname?.trim() && player.FirstName?.trim() && (
            <p className="text-sm text-neutral-500">Nickname: {player.Nickname}</p>
          )}
        </div>
      </header>

      {/* Teams */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Teams</h2>
        </div>
        {teams.length === 0 ? (
          <div className="rounded-xl border bg-white p-4 text-sm text-neutral-600">
            This player is not on any teams yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((t) => (
              <Suspense key={t.ID} fallback={<TeamCard.Skeleton />}>
                <TeamCard teamId={Number(t.ID)} />
              </Suspense>
            ))}
          </div>
        )}
      </section>

      {/* Description
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Description</h2>
        <div className="rounded-xl border bg-white p-4 leading-relaxed text-neutral-800">
          {player.Description?.trim() ? player.Description : <em>No description provided.</em>}
        </div>
      </section> */}

      {/* Recent Games */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Games</h2>
        </div>

        {games.length === 0 ? (
          <div className="rounded-xl border bg-white p-4 text-sm text-neutral-600">
            No games recorded yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {games.map((g) => (
              <Suspense key={g.ID} fallback={<GameCard.Skeleton />}>
                <GameCard gameId={g.ID} />
              </Suspense>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
