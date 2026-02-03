import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

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
}

interface Database {
  teams: Team[];
  matches: Match[];
}

const defaultDb: Database = {
  teams: [],
  matches: []
};

// Ensure DB file exists
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify(defaultDb, null, 2));
}

function readDb(): Database {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return defaultDb;
  }
}

function writeDb(data: Database) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export const db = {
  findTeamByName: (name: string) => {
    const { teams } = readDb();
    return teams.find(t => t.teamName === name);
  },
  
  createTeam: (name: string) => {
    const data = readDb();
    const newTeam: Team = {
      teamId: crypto.randomUUID(),
      teamName: name,
      createdAt: new Date().toISOString()
    };
    data.teams.push(newTeam);
    writeDb(data);
    return newTeam;
  },

  updateTeamName: (teamId: string, newName: string) => {
    const data = readDb();
    const teamIndex = data.teams.findIndex(t => t.teamId === teamId);
    
    if (teamIndex === -1) {
      throw new Error('Team not found');
    }

    // Check if new name is already taken by another team
    const existingTeam = data.teams.find(t => t.teamName === newName && t.teamId !== teamId);
    if (existingTeam) {
      throw new Error('Team name already exists');
    }

    data.teams[teamIndex].teamName = newName;
    writeDb(data);
    return data.teams[teamIndex];
  },
  
  findTeamById: (id: string) => {
    const { teams } = readDb();
    return teams.find(t => t.teamId === id);
  },

  createMatch: (matchData: Omit<Match, 'matchId' | 'createdAt' | 'score'>) => {
    const data = readDb();
    
    // Calculate score
    // 2=2, ..., K=13, A=14
    // Input level is 2-14. Score is same as level.
    const score = matchData.level;

    // Check if match already exists for this team and round
    const existingIndex = data.matches.findIndex(m => m.teamId === matchData.teamId && m.round === matchData.round);
    
    if (existingIndex !== -1) {
      // Update existing match
      data.matches[existingIndex] = {
        ...data.matches[existingIndex],
        opponentName: matchData.opponentName,
        level: matchData.level,
        score,
        // Keep original ID and creation time, or update creation time if needed. 
        // Let's keep original ID but update contents.
      };
      writeDb(data);
      return data.matches[existingIndex];
    } else {
      // Create new match
      const newMatch: Match = {
        matchId: crypto.randomUUID(),
        ...matchData,
        score,
        createdAt: new Date().toISOString()
      };
      data.matches.push(newMatch);
      writeDb(data);
      return newMatch;
    }
  },

  getMatchesByTeam: (teamId: string) => {
    const { matches } = readDb();
    return matches.filter(m => m.teamId === teamId);
  },

  getAllMatches: () => {
    const { matches } = readDb();
    return matches;
  },

  getAllTeams: () => {
    const { teams } = readDb();
    return teams;
  },
  
  getLeaderboard: () => {
    const { teams, matches } = readDb();
    
    // Create a helper map to quickly find team IDs by name
    const teamNameMap = new Map(teams.map(t => [t.teamName, t.teamId]));

    const leaderboard = teams.map(team => {
      const teamMatches = matches.filter(m => m.teamId === team.teamId);
      const totalScore = teamMatches.reduce((sum, m) => sum + m.score, 0);
      return {
        rank: 0, // Will assign later
        teamId: team.teamId,
        teamName: team.teamName,
        totalScore,
        rounds: teamMatches.map(m => {
          // Find opponent score
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
    
    // Sort by total score desc
    leaderboard.sort((a, b) => b.totalScore - a.totalScore);
    
    // Assign ranks
    leaderboard.forEach((item, index) => {
      item.rank = index + 1;
    });
    
    return leaderboard;
  },

  resetDatabase: () => {
    writeDb(defaultDb);
    return true;
  }
};
