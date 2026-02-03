import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface Team {
  teamId: string;
  teamName: string;
  members?: string;
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
}

interface Database {
  teams: Team[];
  matches: Match[];
}

const defaultDb: Database = {
  teams: [],
  matches: []
};

// Simple Async Mutex to prevent concurrent read-modify-write issues
class Mutex {
  private queue: Promise<any> = Promise.resolve();

  async acquire(): Promise<() => void> {
    let release: () => void;
    const next = new Promise<void>((resolve) => {
      release = resolve;
    });
    const current = this.queue;
    this.queue = this.queue.then(() => next);
    await current;
    return release!;
  }
}

const dbLock = new Mutex();

async function readDb(): Promise<Database> {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return defaultDb;
    }
    const data = await fs.promises.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Read DB error:', error);
    return defaultDb;
  }
}

async function writeDb(data: Database) {
  const tempPath = `${DB_PATH}.tmp`;
  try {
    // Atomic write: write to temp file then rename
    await fs.promises.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    await fs.promises.rename(tempPath, DB_PATH);
  } catch (error) {
    console.error('Write DB error:', error);
    if (fs.existsSync(tempPath)) {
      await fs.promises.unlink(tempPath).catch(() => {});
    }
    throw error;
  }
}

export const db = {
  findTeamByName: async (name: string) => {
    const { teams } = await readDb();
    return teams.find(t => t.teamName === name);
  },
  
  createTeam: async (name: string) => {
    const release = await dbLock.acquire();
    try {
      const data = await readDb();
      const newTeam: Team = {
        teamId: crypto.randomUUID(),
        teamName: name,
        createdAt: new Date().toISOString()
      };
      data.teams.push(newTeam);
      await writeDb(data);
      return newTeam;
    } finally {
      release();
    }
  },

  updateTeam: async (teamId: string, updates: { teamName?: string, members?: string }) => {
    const release = await dbLock.acquire();
    try {
      const data = await readDb();
      const teamIndex = data.teams.findIndex(t => t.teamId === teamId);
      
      if (teamIndex === -1) {
        throw new Error('Team not found');
      }

      if (updates.teamName) {
        const existingTeam = data.teams.find(t => t.teamName === updates.teamName && t.teamId !== teamId);
        if (existingTeam) {
          throw new Error('Team name already exists');
        }
        data.teams[teamIndex].teamName = updates.teamName;
      }

      if (updates.members !== undefined) {
        data.teams[teamIndex].members = updates.members;
      }

      await writeDb(data);
      return data.teams[teamIndex];
    } finally {
      release();
    }
  },
  
  findTeamById: async (id: string) => {
    const { teams } = await readDb();
    return teams.find(t => t.teamId === id);
  },

  createMatch: async (matchData: Omit<Match, 'matchId' | 'createdAt' | 'score'>) => {
    const release = await dbLock.acquire();
    try {
      const data = await readDb();
      const score = matchData.level;

      const existingIndex = data.matches.findIndex(m => m.teamId === matchData.teamId && m.round === matchData.round);
      
      if (existingIndex !== -1) {
        data.matches[existingIndex] = {
          ...data.matches[existingIndex],
          opponentName: matchData.opponentName,
          level: matchData.level,
          score,
        };
        await writeDb(data);
        return data.matches[existingIndex];
      } else {
        const newMatch: Match = {
          matchId: crypto.randomUUID(),
          ...matchData,
          score,
          createdAt: new Date().toISOString()
        };
        data.matches.push(newMatch);
        await writeDb(data);
        return newMatch;
      }
    } finally {
      release();
    }
  },

  getMatchesByTeam: async (teamId: string) => {
    const { matches } = await readDb();
    return matches.filter(m => m.teamId === teamId);
  },

  getAllMatches: async () => {
    const { matches } = await readDb();
    return matches;
  },

  getAllTeams: async () => {
    const { teams } = await readDb();
    return teams;
  },
  
  getLeaderboard: async () => {
    const data = await readDb();
    const { teams, matches } = data;
    
    const teamNameMap = new Map(teams.map(t => [t.teamName, t.teamId]));

    const leaderboard = teams.map(team => {
      const teamMatches = matches.filter(m => m.teamId === team.teamId);
      const totalScore = teamMatches.reduce((sum, m) => sum + m.score, 0);
      return {
        rank: 0,
        teamId: team.teamId,
        teamName: team.teamName,
        members: team.members,
        totalScore,
        rounds: teamMatches.map(m => {
          let opponentScore = null;
          const opponentId = teamNameMap.get(m.opponentName);
          
          if (opponentId) {
             const opponentMatches = matches.filter(om => om.teamId === opponentId);
             const opponentMatch = opponentMatches.find(om => om.round === m.round);
             if (opponentMatch) {
               opponentScore = opponentMatch.score;
             }
          }

          return {
            round: m.round,
            score: m.score,
            opponent: m.opponentName,
            level: m.level,
            opponentScore
          };
        }).sort((a, b) => a.round - b.round)
      };
    });
    
    leaderboard.sort((a, b) => b.totalScore - a.totalScore);
    leaderboard.forEach((item, index) => {
      item.rank = index + 1;
    });
    
    return leaderboard;
  },

  resetDatabase: async () => {
    const release = await dbLock.acquire();
    try {
      await writeDb(defaultDb);
      return true;
    } finally {
      release();
    }
  }
};
