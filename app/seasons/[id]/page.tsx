import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { apiGetJson } from "@/app/lib/api";
import { Envelope, Player, Season, Team } from "@/app/lib/types";
import SeasonAddTeamForm from "./ui/SeasonAddTeamForm";

export const metadata = { title: "Season — Betty Crockers" };

async function fetchSeason(id: string): Promise<Season | null> {
  // Assuming GET /api/seasons/:id exists via proxy below; otherwise swap to list+find.
  const res = await apiGetJson<Season>(`/seasons/${id}`).catch(() => null);
  return res ?? null;
}

async function fetchPlayers(): Promise<Player[]> {
  // If your roster is large, add pagination or a q param; cap size reasonably.
  const payload = await apiGetJson<Envelope<Player[]>>(`/players?size=1000`).catch(() => ({
    data: [],
    total: 0,
    page: 1,
    size: 0,
  }));
  return payload.data;
}

async function fetchSeasonTeams(id: string): Promise<Team[]> {
  const payload = await apiGetJson<Envelope<Team[]>>(`/seasons/${id}/teams`).catch(() => ({
    data: [],
    total: 0,
    page: 1,
    size: 0,
  }));
  return payload.data;
}

  function fullName(p?: Player) {
  if (!p) return undefined;
  const s = [p.FirstName, p.LastName].filter(Boolean).join(" ").trim();
  return s || p.Nickname || `Player #${p.ID}`;
}



async function SeasonTeams({ id }: { id: string }) {
  const [teams, players] = await Promise.all([fetchSeasonTeams(id), fetchPlayers()]);
  const byId = new Map(players.map((p) => [String(p.ID), p]));

  if (teams.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-sm text-neutral-600 bg-white">
        No teams linked yet. Use the form to add teams to this season.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="w-full text-sm">
        <thead className="bg-neutral-100 text-left text-xs uppercase tracking-wider">
          <tr>
            <th className="px-4 py-2">Team</th>
            <th className="px-4 py-2">Players</th>
            <th className="px-4 py-2">Description</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((t) => {
            const a = byId.get(String(t.PlayerAID));
            const b = byId.get(String(t.PlayerBID));
            return (
              <tr key={t.ID} className="border-t hover:bg-neutral-50">
                <td className="px-4 py-2 font-medium">{t.Name}</td>
                <td className="px-4 py-2">
                  {fullName(a) ?? `#${t.PlayerAID}`} • {fullName(b) ?? `#${t.PlayerBID}`}
                </td>
                <td className="px-4 py-2 text-neutral-600">{t.Description || "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default async function SeasonPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const season = await fetchSeason(params.id);
  if (!season) return notFound();

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{season.Name}</h1>
          <p className="text-sm text-neutral-500">Season ID: {season.ID}</p>
        </div>
        <Link href="/seasons" className="text-sm text-neutral-600 hover:underline">
          ← Back to Seasons
        </Link>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          <Suspense fallback={<div className="text-sm text-neutral-500">Loading teams…</div>}>
            <SeasonTeams id={season.ID} />
          </Suspense>
        </div>

        <div className="lg:col-span-1">
          <SeasonAddTeamForm seasonId={params.id} />
        </div>
      </div>
    </section>
  );
}
