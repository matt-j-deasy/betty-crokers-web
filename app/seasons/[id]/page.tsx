// app/seasons/[id]/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { apiGetJson } from "@/app/lib/api";
import { Game, Season, Team } from "@/app/lib/types";
import TeamCard from "@/app/components/TeamCard";
import GameCard from "@/app/components/GameCard";

export const metadata = { title: "League — Betty Crockers" };

async function fetchSeason(id: string | number): Promise<Season | null> {
  const res = await apiGetJson<Season>(`/seasons/${id}`).catch(() => null);
  return res ?? null;
}

async function fetchSeasonTeams(seasonId: string | number): Promise<Team[]> {
  // Assumes GET /leagues/:id/seasons -> Season[] or { data: Season[] }
  const res = await apiGetJson<Team[] | { data: Team[] }>(`/teams?seasonId=${seasonId}`).catch(
    () => ({ data: [] as Team[] })
  );
  return Array.isArray(res) ? res : res?.data ?? [];
}

async function fetchRecentGames(id: string | number): Promise<Game[]> {
  // Assumes: GET /games?seasonId=X&limit=25 -> Game[] or { data: Game[] }
  const res = await apiGetJson<Game[] | { data: Game[] }>(`/games?seasonId=${id}&limit=25`).catch(
    () => ({ data: [] as Game[] })
  );
  return Array.isArray(res) ? res : res?.data ?? [];
}

export default async function SeasonPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const [season, teams, games] = await Promise.all([fetchSeason(id), fetchSeasonTeams(id), fetchRecentGames(id)]);
  if (!season) notFound();

  return (
    <section className="mx-auto max-w-6xl space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{season.Name ?? `Season #${season.ID}`}</h1>
          {/* <p className="text-sm text-neutral-500">League ID: {season.ID}</p> */}
        </div>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Teams</h2>
          {/* <Link className="text-sm text-blue-600 hover:underline" href={`/leagues/${league.ID}/seasons`}>
            View all seasons
          </Link> */}
        </div>

        {teams.length === 0 ? (
          <div className="rounded-xl border bg-white p-4 text-sm text-neutral-600">
            No teams added to this season yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((s) => (
              <Suspense key={s.ID} fallback={<TeamCard.Skeleton />}>
                <TeamCard teamId={s.ID} />
              </Suspense>
            ))}
          </div>
        )}
      </section>

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
