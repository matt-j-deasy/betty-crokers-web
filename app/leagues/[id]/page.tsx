// app/leagues/[id]/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { apiGetJson } from "@/app/lib/api";
import { League, Season, SessionWithUser } from "@/app/lib/types";
import SeasonCard from "@/app/components/SeasonCard";
import SeasonCreateForm from "../ui/SeasonCreateForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

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
    const session: SessionWithUser | null = await getServerSession(authOptions)
    const isAdmin = session?.user?.role === "admin";
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

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Seasons</h2>
          </div>

          {seasons.length === 0 ? (
            <div className="rounded-xl border bg-white p-4 text-sm text-neutral-600">
              No seasons created for this league yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {seasons.map((s) => (
                <Suspense key={s.ID} fallback={<SeasonCard.Skeleton />}>
                  <SeasonCard seasonId={s.ID} />
                </Suspense>
              ))}
            </div>
          )}
        </div>

{isAdmin && (
          <div className="lg:col-span-1">
            <SeasonCreateForm leagueId={league.ID} />
          </div>
        )}
      </section>
    </section>
  );
}
