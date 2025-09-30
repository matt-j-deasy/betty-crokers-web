export type ID = string;

export type UserRole = "admin" | "user" | "guest";

export interface User {
  id: ID;
  email: string;
  name?: string;
  image?: string;
  role: UserRole;
}

export interface League {
  ID: ID;
  Name: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface Season {
  ID: ID;
  LeagueID: ID;
  Name: string;
  StartsOn: string;
  EndsOn: string;
  Timezone: string;
  Description?: string | null;
  createdAt: string;
  updatedAt: string;
}

// lib/types.ts

export interface Team {
  ID: number;
  Name: string;
  Description?: string | null;

  PlayerAID: number;
  PlayerBID: number;

  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string | null;
}

export interface TeamWithPlayers extends Team {
  PlayerA?: Player;
  PlayerB?: Player;
}

export interface TeamSeason {
  ID: number;
  TeamID: number;
  SeasonID: number;
  IsActive: boolean;

  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string | null;
}


export type Player = {
  ID: number;
  UserID?: number | null;
  Nickname: string;
  FirstName?: string | null;
  LastName?: string | null;
  CreatedAt?: string;
  UpdatedAt?: string;
};

export interface Game {
  ID: number;
  SeasonID?: number | null;
  MatchType: "players" | "teams";
  TargetPoints?: number | null;
  ScheduledAt?: string | null; // RFC3339
  Timezone?: string | null;
  Location?: string | null;
  Description?: string | null;
  Status?: "scheduled" | "in_progress" | "completed" | "canceled";
  WinnerSide?: "A" | "B" | null;

  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string | null;
}

export type Side = {
  ID: number;
  GameID: number;
  Side: "A" | "B";
  TeamID?: number;
  PlayerID?: number;
  Points?: number;
  Color?: "white" | "black" | "natural" | null;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string | null;
};

export type GameWithSides = {
  game: Game;
  sides?: Side[];
};

export type Envelope<T> = { data: T; total: number; page: number; size: number };

export type SessionWithUser = {
  user?: SessionUserWithRole;
}

export type SessionUserWithRole = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
};

export interface SeasonStanding {
  teamId: number;
  teamName: string;
  games: number;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDiff: number;
  winPct: number; // 0..1
}