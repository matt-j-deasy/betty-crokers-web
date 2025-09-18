import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import TeamCreateForm from "./ui/TeamCreateForm";
import { Envelope, SessionWithUser, Team, Player } from "../lib/types";
import { apiGetJson } from "../lib/api";
import TeamCard from "../components/TeamCard";

export const metadata = { title: "Teams — Crok America" };

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function fetchTeams(): Promise<Team[]> {
  const payload = await apiGetJson<Envelope<Team[]>>("/teams").catch(() => ({
    data: [],
    total: 0,
    page: 1,
    size: 0,
  }));
  return payload.data;
}

async function fetchPlayers(): Promise<Player[]> {
  // Used for rendering player names in the list (avoid N+1 client round-trips)
  // Increase size as needed; if large, replace with server join or DTO denorm.
  const payload = await apiGetJson<Envelope<Player[]>>("/players?size=100").catch(() => ({
    data: [],
    total: 0,
    page: 1,
    size: 0,
  }));
  return payload.data;
}

async function TeamList() {
  const [teams] = await Promise.all([fetchTeams(), fetchPlayers()]);

  if (teams.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-sm text-neutral-600 bg-white">
        No teams yet. Create the first one.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {teams.map((t) => (
        <TeamCard key={t.ID} teamId={t.ID} />
      ))}
    </div>
  );
}

export default async function TeamsPage() {
  const session: SessionWithUser | null = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "admin";

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Teams</h1>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Suspense fallback={<div className="text-sm text-neutral-500">Loading teams…</div>}>
            <TeamList />
          </Suspense>
        </div>

        {isAdmin && (
          <div className="lg:col-span-1">
            <TeamCreateForm />
          </div>
        )}
      </div>
    </section>
  );
}
