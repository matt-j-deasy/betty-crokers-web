import { Envelope, SessionWithUser, Season, Game, GameWithSides, Side } from "@/app/lib/types";
import { Suspense } from "react";
import GameCreateForm from "./ui/GameCreateForm";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import { apiGetJson } from "../lib/api";
import Link from "next/link";

export const metadata = { title: "Games — Betty Crockers" };

async function fetchGames(): Promise<Game[]> {
  const payload = await apiGetJson<Envelope<Game[]>>("/games?size=25").catch(() => ({
    data: [],
    total: 0,
    page: 1,
    size: 0,
  }));
  return payload.data;
}

async function fetchGameWithSides(id: number): Promise<GameWithSides | null> {
  return apiGetJson<GameWithSides>(`/games/${id}/with-sides`).catch(() => null);
}

async function fetchSeasons(): Promise<Season[]> {
  const payload = await apiGetJson<Envelope<Season[]>>("/seasons").catch(() => ({
    data: [],
    total: 0,
    page: 1,
    size: 0,
  }));
  return payload.data;
}

async function fetchTeams(): Promise<Array<{ ID: number; Name: string }>> {
  const payload = await apiGetJson<Envelope<Array<{ ID: number; Name: string }>>>("/teams?size=500").catch(
    () => ({ data: [], total: 0, page: 1, size: 0 })
  );
  return payload.data;
}

function teamName(teamId?: number, teamsById?: Map<string, { ID: number; Name: string }>) {
  if (!teamId) return "—";
  const t = teamsById?.get(String(teamId));
  return t?.Name ?? `Team #${teamId}`;
}

function pickSide(sides: Side[] | undefined, which: "A" | "B"): Side | undefined {
  return sides?.find((s) => s.Side === which);
}

function renderTeamsCell(gws: GameWithSides, teamsById: Map<string, { ID: number; Name: string }>) {
  const g = gws.game;

  if (g.MatchType === "players") {
    // Optional: map player names with a playersById lookup as you did for teams
    return <span className="opacity-60">Players match</span>;
  }

  const a = pickSide(gws.sides, "A");
  const b = pickSide(gws.sides, "B");

  const aName = teamName(a?.TeamID, teamsById);
  const bName = teamName(b?.TeamID, teamsById);
  const aPts = a?.Points ?? 0;
  const bPts = b?.Points ?? 0;

  const isCompleted = g.Status === "completed" || !!g.WinnerSide;

  if (!isCompleted) {
    return (
      <div className="flex items-center gap-2">
        <span>{aName}</span>
        <span className="opacity-50">vs</span>
        <span>{bName}</span>
        {(aPts > 0 || bPts > 0) && (
          <span className="ml-2 rounded bg-neutral-100 px-1.5 py-0.5 text-xs">
            {aPts}–{bPts}
          </span>
        )}
      </div>
    );
  }

  // Prefer explicit WinnerSide, fall back to points
  const aWon = g.WinnerSide ? g.WinnerSide === "A" : aPts > bPts;
  const bWon = g.WinnerSide ? g.WinnerSide === "B" : bPts > aPts;

  return (
    <div className="flex items-center gap-2">
      <span className={aWon ? "font-semibold" : "opacity-70"}>
        {aName}
        <span className="ml-1 text-xs opacity-70">({aPts})</span>
        {aWon && (
          <span className="ml-2 rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-800">Winner</span>
        )}
      </span>
      <span className="opacity-50">vs</span>
      <span className={bWon ? "font-semibold" : "opacity-70"}>
        {bName}
        <span className="ml-1 text-xs opacity-70">({bPts})</span>
        {bWon && (
          <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-800">Loser</span>
        )}
      </span>
    </div>
  );
}

async function GamesTable() {
  const [games, seasons] = await Promise.all([fetchGames(), fetchSeasons()]);

  if (games.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-sm text-neutral-600 bg-white">
        No games yet. Create the first one.
      </div>
    );
  }

  // Expand each game to { Game, Sides }
  const expanded = await Promise.all(games.map((g) => fetchGameWithSides(g.ID)));
  // Use expanded when available, else wrap bare Game into the shape
  const gamesWithSides: GameWithSides[] = games.map((g, i) => expanded[i] ?? { game: g, sides: [] });

  const teams = await fetchTeams();
  const teamsById = new Map(teams.map((t) => [String(t.ID), t]));
  const seasonById = new Map(seasons.map((s) => [String(s.ID), s]));

  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="w-full text-sm">
        <thead className="bg-neutral-100 text-left text-xs uppercase tracking-wider">
          <tr>
            <th className="px-4 py-2">Season</th>
            <th className="px-4 py-2">Teams</th>
            <th className="px-4 py-2">Target</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Location</th>
          </tr>
        </thead>
        <tbody>
          {gamesWithSides.map((gws) => {
            const g = gws.game;
            return (
              <tr key={g.ID} className="border-t hover:bg-neutral-50">
                <td className="px-4 py-2">
                  {g.SeasonID
                    ? seasonById.get(String(g.SeasonID))?.Name ?? `Season #${g.SeasonID}`
                    : "Exhibition"}
                </td>
                <td className="px-4 py-2">
                  <Link href={`/games/${gws.game.ID}`} className="hover:underline">
                    {renderTeamsCell(gws, teamsById)}
                  </Link>
                </td>
                <td className="px-4 py-2">{g.TargetPoints ?? 100}</td>
                <td className="px-4 py-2 capitalize">{g.Status ?? "scheduled"}</td>
                <td className="px-4 py-2">{g.Location ?? "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default async function GamesPage() {
  const session: SessionWithUser | null = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "admin";

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Games</h1>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Suspense fallback={<div className="text-sm text-neutral-500">Loading games…</div>}>
            <GamesTable />
          </Suspense>
        </div>

        {isAdmin && (
          <div className="lg:col-span-1">
            <GameCreateForm />
          </div>
        )}
      </div>
    </section>
  );
}
