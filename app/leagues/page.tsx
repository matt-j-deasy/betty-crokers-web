import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import LeagueCreateForm from "./ui/LeagueCreateForm";
import { Envelope, League, SessionWithUser } from "../lib/types";
import { apiGetJson } from "../lib/api";
import LeagueCard from "../components/LeagueCard";

export const metadata = { title: "Leagues — Crok America" };

async function fetchLeagues(): Promise<League[]> {
  const payload = await apiGetJson<Envelope<League[]>>("/leagues").catch(() => ({
    data: [],
    total: 0,
    page: 1,
    size: 0,
  }));
  return payload.data;
}

async function LeagueList() {
  const leagues = await fetchLeagues();
  if (leagues.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-sm text-neutral-600 bg-white">
        No leagues yet. Create the first one.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {leagues.map((league) => (
        <Suspense key={league.ID} fallback={<LeagueCard.Skeleton />}>
          <LeagueCard leagueId={league.ID} />
        </Suspense>
      ))}
    </div>
  );
}



export default async function LeaguesPage() {
  const session: SessionWithUser | null = await getServerSession(authOptions)
  const isAdmin = session?.user?.role === "admin";

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Leagues</h1>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Suspense fallback={<div className="text-sm text-neutral-500">Loading leagues…</div>}>
            <LeagueList />
          </Suspense>
        </div>

        {isAdmin && (
          <div className="lg:col-span-1">
            <LeagueCreateForm />
          </div>
        )}
      </div>
    </section>
  );
}
