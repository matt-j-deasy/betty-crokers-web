// app/games/[id]/page.tsx
import { notFound } from "next/navigation";
import { apiGetJson } from "@/app/lib/api";
import { Envelope, GameWithSides, Season, Team, Player } from "@/app/lib/types";
import ScoreManager from "./ui/ScoreManager";
import GameActions from "./ui/GameActions";

export const metadata = { title: "Game — Crok America" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function fetchGame(id: string): Promise<GameWithSides | null> {
  return apiGetJson<GameWithSides>(`/games/${id}/with-sides`).catch(() => null);
}
async function fetchSeasons(): Promise<Season[]> {
  const p = await apiGetJson<Envelope<Season[]>>("/seasons").catch(() => ({
    data: [], total: 0, page: 1, size: 0,
  }));
  return p.data;
}
async function fetchTeams(): Promise<Team[]> {
  const p = await apiGetJson<Envelope<Team[]>>("/teams?size=500").catch(() => ({
    data: [], total: 0, page: 1, size: 0,
  }));
  return p.data;
}
async function fetchPlayers(): Promise<Player[]> {
  const p = await apiGetJson<Envelope<Player[]>>("/players?size=1000").catch(() => ({
    data: [], total: 0, page: 1, size: 0,
  }));
  return p.data;
}

function nameForTeam(teamId?: number, teamsById?: Map<string, Team>) {
  if (!teamId) return "—";
  return teamsById?.get(String(teamId))?.Name ?? `Team #${teamId}`;
}
function nameForPlayer(playerId?: number, playersById?: Map<string, Player>) {
  if (!playerId) return "—";
  const p = playersById?.get(String(playerId));
  if (!p) return `Player #${playerId}`;
  const canonical = [p.FirstName, p.LastName].filter(Boolean).join(" ").trim();
  return canonical || p.Nickname || `Player #${playerId}`;
}

export default async function GamePage({ params }: { params: { id: string } }) {
  const gws = await fetchGame(params.id);
  if (!gws) return notFound();

  const [seasons, teams, players] = await Promise.all([
    fetchSeasons(),
    fetchTeams(),
    fetchPlayers(),
  ]);

  const seasonById = new Map(seasons.map((s) => [String(s.ID), s]));
  const teamsById = new Map(teams.map((t) => [String(t.ID), t]));
  const playersById = new Map(players.map((p) => [String(p.ID), p]));

  const g = gws.game;
  const seasonName = g.SeasonID
    ? (seasonById.get(String(g.SeasonID))?.Name ?? `Season #${g.SeasonID}`)
    : "Exhibition";

  const display = (side: "A" | "B") => {
    const s = gws.sides?.find((x) => x.Side === side);
    if (!s) return { label: "—", points: 0, color: "natural" as const };
    if (g.MatchType === "teams") {
      return {
        label: nameForTeam(s.TeamID, teamsById),
        points: s.Points ?? 0,
        color: s.Color ?? "natural",
      };
    } else {
      return {
        label: nameForPlayer(s.PlayerID, playersById),
        points: s.Points ?? 0,
        color: s.Color ?? "natural",
      };
    }
  };

  const a = display("A");
  const b = display("B");

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Game #{g.ID}</h1>
          <p className="text-sm text-neutral-600">
            {seasonName} • {g.MatchType.toUpperCase()} • Status:{" "}
            <span className="capitalize">{g.Status ?? "scheduled"}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <GameActions gameId={g.ID} status={(g.Status as any) ?? "scheduled"} />
        </div>
      </header>

      <div className="rounded-xl border bg-white p-4">
        <ScoreManager
          gameId={g.ID}
          matchType={g.MatchType}
          targetPoints={g.TargetPoints ?? 100}
          status={g.Status ?? "scheduled"}
          winnerSide={g.WinnerSide ?? null}
          sides={gws.sides ?? []}
          sideALabel={a.label}
          sideBLabel={b.label}
          sideAPoints={a.points}
          sideBPoints={b.points}
          sideAColor={a.color}
          sideBColor={b.color}
          location={g.Location ?? ""}
          description={g.Description ?? ""}
        />
      </div>
    </section>
  );
}
