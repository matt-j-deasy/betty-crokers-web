import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import TeamCreateForm from "./ui/TeamCreateForm";
import { Envelope, SessionWithUser, Team, Player } from "../lib/types";
import { apiGetJson } from "../lib/api";

export const metadata = { title: "Teams — Betty Crockers" };

async function fetchTeams(): Promise<Team[]> {
  const payload = await apiGetJson<Envelope<Team[]>>("/api/teams").catch(() => ({
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
  const [teams, players] = await Promise.all([fetchTeams(), fetchPlayers()]);
  const playerById = new Map(players.map((p) => [String(p.ID), p]));

  if (teams.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-sm text-neutral-600 bg-white">
        No teams yet. Create the first one.
      </div>
    );
  }

  return (
    <ul className="divide-y rounded-lg border bg-white">
      {teams.map((t) => {
        const a = playerById.get(String(t.PlayerAID));
        const b = playerById.get(String(t.PlayerBID));
        return (
          <li key={t.ID} className="flex items-center justify-between p-4">
            <div className="flex flex-col">
              <div className="font-medium">{t.Name}</div>
              <div className="text-xs text-neutral-600">
                {a ? `${a.FirstName} ${a.LastName}` : `Player #${t.PlayerAID}`} •{" "}
                {b ? `${b.FirstName} ${b.LastName}` : `Player #${t.PlayerBID}`}
              </div>
              {t.Description && (
                <div className="mt-1 text-xs text-neutral-500">{t.Description}</div>
              )}
            </div>
            {/* Future: actions (edit/delete) */}
          </li>
        );
      })}
    </ul>
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
