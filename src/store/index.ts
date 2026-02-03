import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TeamInfo {
  teamId: string;
  teamName: string;
  members?: string;
}

interface AppState {
  hasAccess: boolean;
  teamInfo: TeamInfo | null;
  setHasAccess: (access: boolean) => void;
  setTeamInfo: (info: TeamInfo | null) => void;
  logout: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      hasAccess: false,
      teamInfo: null,
      setHasAccess: (access) => set({ hasAccess: access }),
      setTeamInfo: (info) => set({ teamInfo: info }),
      logout: () => set({ teamInfo: null }),
    }),
    {
      name: 'guandan-storage',
    }
  )
);
