// app/seasons/[id]/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { apiGetJson } from "@/app/lib/api";
import { Season, Team } from "@/app/lib/types";
import SeasonCard from "@/app/components/SeasonCard";
import TeamCard from "@/app/components/TeamCard";

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

export default async function SeasonPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const [season, teams] = await Promise.all([fetchSeason(id), fetchSeasonTeams(id)]);
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
    </section>
  );
}
