import { notFound } from "next/navigation";
import { apiGetJson } from "@/app/lib/api";
import { Game, Team, SessionWithUser, Season } from "@/app/lib/types";
import PlayerCard from "@/app/components/PlayerCard";
import GameCard from "@/app/components/GameCard";
import LinkTeamToSeasonCard from "@/app/components/LinkTeamToSeasonCard";
import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import SeasonCard from "@/app/components/SeasonCard";

export const dynamic = "force-dynamic"; // or tune with revalidate

type Params = { id: string };

async function fetchTeam(id: number): Promise<Team | null> {
  const team = await apiGetJson<Team>(`/teams/${id}`).catch(() => null);
  return team ?? null;
}

async function fetchRecentGames(id: number): Promise<Game[]> {
  const res = await apiGetJson<Game[] | { data: Game[] }>(`/games?teamId=${id}&limit=25`).catch(
    () => ({ data: [] as Game[] })
  );
  return Array.isArray(res) ? res : res?.data ?? [];
}

// Public: seasons for this team
async function fetchTeamSeasons(teamId: number): Promise<Season[]> {
  const res = await apiGetJson<Season[] | { data: Season[] }>(`/teams/${teamId}/seasons`).catch(
    () => ({ data: [] as Season[] })
  );
  return Array.isArray(res) ? res : res?.data ?? [];
}

// Public: all seasons (for admin to choose from)
async function fetchAllSeasons(): Promise<Season[]> {
  const res = await apiGetJson<Season[] | { data: Season[] }>(`/seasons`).catch(
    () => ({ data: [] as Season[] })
  );
  return Array.isArray(res) ? res : res?.data ?? [];
}

export default async function TeamPage(props: { params: Promise<Params> }) {
  const params = await props.params;
  const teamId = Number(params.id);
  if (Number.isNaN(teamId)) notFound();

  const session = (await getServerSession(authOptions)) as SessionWithUser | null;
  const isAdmin = session?.user?.role === "admin";

  const [team, games, teamSeasons, allSeasons] = await Promise.all([
    fetchTeam(teamId),
    fetchRecentGames(teamId),
    fetchTeamSeasons(teamId),
    isAdmin ? fetchAllSeasons() : Promise.resolve([] as Season[]),
  ]);

  if (!team) notFound();

  // Build a quick lookup set for the admin form
  const linkedSeasonIds = new Set(teamSeasons.map((s) => s.ID));

  return (
    <section className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{team.Name ?? `Team #${team.ID}`}</h1>
        </div>
      </header>

      {/* Players */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Players</h2>
        </div>
        <div className="flex flex-wrap gap-4">
          {team.PlayerAID && (
            <Suspense fallback={<PlayerCard.Skeleton />}>
              <PlayerCard playerId={team.PlayerAID} />
            </Suspense>
          )}
          {team.PlayerBID && (
            <Suspense fallback={<PlayerCard.Skeleton />}>
              <PlayerCard playerId={team.PlayerBID} />
            </Suspense>
          )}
        </div>
      </section>

      {/* Team Seasons */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Team Seasons</h2>
        </div>

        {teamSeasons.length === 0 ? (
          <div className="rounded-xl border bg-white p-4 text-sm text-neutral-600">
            Not linked to any seasons yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamSeasons.map((ts) => (
              <Suspense key={ts.ID} fallback={<SeasonCard.Skeleton />}>
                <SeasonCard seasonId={ts.ID} />
              </Suspense>
            ))}
          </div>
        )}

        {isAdmin && (
          <div className="pt-2">
            <LinkTeamToSeasonCard
              teamId={teamId}
              allSeasons={allSeasons}
              linkedSeasonIds={linkedSeasonIds}
            />
          </div>
        )}
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
