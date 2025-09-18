// app/leagues/[id]/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { apiGetJson } from "@/app/lib/api";
import { League, Season } from "@/app/lib/types";
import SeasonCard from "@/app/components/SeasonCard";

export const metadata = { title: "League — Betty Crockers" };

async function fetchLeague(id: string | number): Promise<League | null> {
  const res = await apiGetJson<League>(`/leagues/${id}`).catch(() => null);
  return res ?? null;
}

// Prefer a dedicated endpoint; adjust if your API differs.
async function fetchLeagueSeasons(leagueId: string | number): Promise<Season[]> {
  // Assumes GET /leagues/:id/seasons -> Season[] or { data: Season[] }
  const res = await apiGetJson<Season[] | { data: Season[] }>(`/seasons?leagueId=${leagueId}`).catch(
    () => ({ data: [] as Season[] })
  );
  return Array.isArray(res) ? res : res?.data ?? [];
}

export default async function LeaguePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const [league, seasons] = await Promise.all([fetchLeague(id), fetchLeagueSeasons(id)]);
  if (!league) notFound();

  return (
    <section className="mx-auto max-w-6xl space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{league.Name ?? `League #${league.ID}`}</h1>
          {/* <p className="text-sm text-neutral-500">League ID: {league.ID}</p> */}
        </div>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Seasons</h2>
          {/* <Link className="text-sm text-blue-600 hover:underline" href={`/leagues/${league.ID}/seasons`}>
            View all seasons
          </Link> */}
        </div>

        {seasons.length === 0 ? (
          <div className="rounded-xl border bg-white p-4 text-sm text-neutral-600">
            No seasons created for this league yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {seasons.map((s) => (
              <Suspense key={s.ID} fallback={<SeasonCard.Skeleton />}>
                <SeasonCard seasonId={s.ID} />
              </Suspense>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
