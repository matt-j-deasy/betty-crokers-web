// app/teams/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { apiGetJson } from "@/app/lib/api";
import { Game, Team } from "@/app/lib/types";
import PlayerCard from "@/app/components/PlayerCard";
import GameCard from "@/app/components/GameCard";
import { Suspense } from "react";

export const dynamic = "force-dynamic"; // or tune with revalidate

type Params = { id: string };

async function fetchTeam(id: number): Promise<Team | null> {
  const team = await apiGetJson<Team>(`/teams/${id}`).catch(() => null);
  return team ?? null;
}

async function fetchRecentGames(id: number): Promise<Game[]> {
  const res = await apiGetJson<Game[] | { data: Game[] }>(`/teams/${id}/games?limit=5`).catch(
    () => ({ data: [] as Game[] })
  );
  return Array.isArray(res) ? res : res?.data ?? [];
}

export default async function TeamPage(props: { params: Promise<Params> }) {
  const params = await props.params;
  const teamId = Number(params.id);
  if (Number.isNaN(teamId)) notFound();

  const [team, games] = await Promise.all([
    fetchTeam(teamId),
    fetchRecentGames(teamId),
  ]);

  if (!team) notFound();

  return (
    <section className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{team.Name ?? `Team #${team.ID}`}</h1>
          {/* <p className="text-sm text-neutral-500">Team ID: {team.ID}</p> */}
        </div>
      </header>

      {/* Players */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Players</h2>
        </div>
        <div className="flex flex-wrap gap-4">
            {team.PlayerAID && <Suspense fallback={<PlayerCard.Skeleton />}><PlayerCard playerId={team.PlayerAID} /></Suspense>}
            {team.PlayerBID && <Suspense fallback={<PlayerCard.Skeleton />}><PlayerCard playerId={team.PlayerBID} /></Suspense>}
        </div>
      </section>

      {/* Description */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Description</h2>
        <div className="rounded-xl border bg-white p-4 leading-relaxed text-neutral-800">
          {team.Description?.trim() ? team.Description : <em>No description provided.</em>}
        </div>
      </section>

      {/* Recent Games */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Games</h2>
          <Link className="text-sm text-blue-600 hover:underline" href={`/teams/${teamId}/games`}>
            See all games
          </Link>
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
