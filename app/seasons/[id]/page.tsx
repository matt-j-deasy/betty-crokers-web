import { Suspense } from "react";
import { notFound } from "next/navigation";
import { apiGetJson } from "@/app/lib/api";
import { Game, Season, Team } from "@/app/lib/types";
import TeamCard from "@/app/components/TeamCard";
import GameCard from "@/app/components/GameCard";
import SeasonStandingsTable from "@/app/components/SeasonTeamStandingsTable";
import SeasonPlayerStandingsTable from "@/app/components/SeasonPlayerStandingsTable";

export const metadata = { title: "Season — Betty Crockers" };

async function fetchSeason(id: string | number): Promise<Season | null> {
  const res = await apiGetJson<Season>(`/seasons/${id}`).catch(() => null);
  return res ?? null;
}

async function fetchSeasonTeams(seasonId: string | number): Promise<Team[]> {
  const res = await apiGetJson<Team[] | { data: Team[] }>(
    `/teams?seasonId=${seasonId}`
  ).catch(() => ({ data: [] as Team[] }));
  return Array.isArray(res) ? res : res?.data ?? [];
}

async function fetchRecentGames(id: string | number): Promise<Game[]> {
  const res = await apiGetJson<Game[] | { data: Game[] }>(
    `/games?seasonId=${id}&limit=25`
  ).catch(() => ({ data: [] as Game[] }));
  return Array.isArray(res) ? res : res?.data ?? [];
}

export default async function SeasonPage(props: { params: Promise<{ id: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const params = await props.params;
  const id = params.id;

  const searchParams = await props.searchParams;

  const [season, teams, games] = await Promise.all([
    fetchSeason(id),
    fetchSeasonTeams(id),
    fetchRecentGames(id),
  ]);

  if (!season) notFound();

  const sortKey = (searchParams.sort as string | undefined) ?? "rank";
  const sortDir =
    searchParams.dir === "asc" || searchParams.dir === "desc"
      ? (searchParams.dir as "asc" | "desc")
      : "desc";

  return (
    <section className="mx-auto max-w-6xl space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {season.Name ?? `Season #${season.ID}`}
          </h1>
        </div>
      </header>

      {/* Team Standings */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Standings</h2>
        </div>
        <Suspense fallback={<SeasonStandingsTable.Skeleton />}>
          <SeasonStandingsTable
            seasonId={id}
            sortKey={sortKey as any}
            sortDir={sortDir}
          />
        </Suspense>
      </section>

      {/* Player Standings */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Player Standings</h2>
        </div>
        <Suspense fallback={<SeasonPlayerStandingsTable.Skeleton />}>
          <SeasonPlayerStandingsTable
            seasonId={id}
            sortKey={sortKey as any}
            sortDir={sortDir}
          />
        </Suspense>
      </section>

      {/* Teams */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Teams</h2>
        </div>

        {teams.length === 0 ? (
          <div className="rounded-xl border bg-white p-4 text-sm text-neutral-600">
            No teams added to this season yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((t) => (
              <Suspense key={t.ID} fallback={<TeamCard.Skeleton />}>
                <TeamCard teamId={t.ID} />
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
