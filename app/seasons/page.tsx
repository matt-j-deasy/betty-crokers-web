// NO "use client" here
import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import SeasonCreateForm from "./ui/SeasonCreateForm";
import { Envelope, League, Season, SessionWithUser } from "../lib/types";
import { apiGetJson } from "../lib/api";

export const metadata = { title: "Seasons — Betty Crockers" };

async function fetchSeasons(): Promise<Season[]> {
  const payload = await apiGetJson<Envelope<Season[]>>("/api/seasons").catch(() => ({
    data: [],
    total: 0,
    page: 1,
    size: 0,
  }));
  return payload.data;
}

async function fetchLeagues(): Promise<League[]> {
  const payload = await apiGetJson<Envelope<League[]>>("/api/leagues").catch(() => ({
    data: [],
    total: 0,
    page: 1,
    size: 0,
  }));
  return payload.data;
}

// Async server component used under Suspense
async function SeasonList() {
  const [seasons, leagues] = await Promise.all([fetchSeasons(), fetchLeagues()]);
  const leagueById = new Map(leagues.map((l) => [String(l.ID), l]));

  if (seasons.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-sm text-neutral-600 bg-white">
        No seasons yet. Create the first one.
      </div>
    );
  }

  return (
    <ul className="divide-y rounded-lg border bg-white">
      {seasons.map((s) => {
        const league = leagueById.get(String(s.LeagueID));
        return (
          <li key={s.ID} className="flex items-center justify-between p-4">
            <div className="flex flex-col">
              <div className="font-medium">{s.Name}</div>
              <div className="text-xs text-neutral-600">
                League: {league?.Name ?? "—"}
              </div>
            </div>
            {/* Extend with dates/status/actions as needed */}
          </li>
        );
      })}
    </ul>
  );
}

export default async function SeasonsPage() {
  const session: SessionWithUser | null = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "admin";

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Seasons</h1>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Suspense fallback={<div className="text-sm text-neutral-500">Loading seasons…</div>}>
            <SeasonList />
          </Suspense>
        </div>

        {isAdmin && (
          <div className="lg:col-span-1">
            <SeasonCreateForm />
          </div>
        )}
      </div>
    </section>
  );
}
