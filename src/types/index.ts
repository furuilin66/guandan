export interface Team {
  teamId: string;
  teamName: string;
  createdAt: string;
}

export interface Match {
  matchId: string;
  teamId: string;
  round: number;
  opponentName: string;
  level: number;
  score: number;
  createdAt: string;
  opponentScore?: number | null;
}

export interface LeaderboardItem {
  rank: number;
  teamId: string;
  teamName: string;
  members?: string;
  totalScore: number;
  rounds: {
    round: number;
    score: number;
    opponent: string;
    level: number;
    opponentScore?: number | null;
  }[];
}
