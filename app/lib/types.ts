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
  id: ID;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface Season {
  id: ID;
  leagueId: ID;
  name: string;
  slug: string;
  startsAt: string;
  endsAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: ID;
  leagueId: ID;
  seasonId?: ID | null;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
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