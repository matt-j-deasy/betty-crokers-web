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

export type MatchType = "SINGLES" | "TEAMS";
export type Side = "A" | "B";

export interface MatchParticipant {
  id: ID;
  matchId: ID;
  playerId: ID;
  side: Side;
}

export interface MatchRound {
  id: ID;
  matchId: ID;
  number: number;
  scoreA: number;
  scoreB: number;
  twentiesA: number;
  twentiesB: number;
}

export interface Match {
  id: ID;
  seasonId: ID;
  type: MatchType;
  playedAt: string;
  teamAId?: ID | null;
  teamBId?: ID | null;
  participants: MatchParticipant[];
  rounds: MatchRound[];
  createdAt: string;
  updatedAt: string;
}

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