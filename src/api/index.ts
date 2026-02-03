const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = {
  // Teams
  getTeams: async () => {
    const res = await fetch(`${API_BASE_URL}/teams`);
    return res.json();
  },

  loginTeam: async (teamName: string) => {
    const res = await fetch(`${API_BASE_URL}/teams/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamName }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || '登录失败');
    }
    return res.json();
  },

  // Matches
  recordMatch: async (data: { teamId: string; round: number; opponentName: string; level: number }) => {
    const res = await fetch(`${API_BASE_URL}/matches/record`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || '提交失败');
    }
    return res.json();
  },

  getTeamMatches: async (teamId: string) => {
    const res = await fetch(`${API_BASE_URL}/matches/team/${teamId}`);
    return res.json();
  },

  getLeaderboard: async () => {
    const res = await fetch(`${API_BASE_URL}/matches/leaderboard`);
    return res.json();
  },

  // Auth/Admin
  resetData: async (password: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || '重置失败');
    }
    return res.json();
  },
  
  getExportUrl: () => `${API_BASE_URL}/matches/leaderboard/export`,

  updateTeam: async (teamId: string, data: { teamName?: string; members?: string }) => {
    const res = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || '更新失败');
    }
    return res.json();
  }
};
