import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'doctor' | 'admin' | 'technician';
}

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;

  // UI
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Theme
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Auth
  user: null,
  isAuthenticated: false,
  setUser: (user) =>
    set({ user, isAuthenticated: user !== null }),
  logout: () =>
    set({ user: null, isAuthenticated: false }),

  // UI
  sidebarCollapsed: false,
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) =>
    set({ sidebarCollapsed: collapsed }),

  // Theme
  theme: 'light',
  setTheme: (theme) => set({ theme }),
}));
