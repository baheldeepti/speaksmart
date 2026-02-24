import { create } from "zustand";

interface AuthUser {
  id: number;
  username: string;
  email: string;
  totalScore: number;
  sessionsPlayed: number;
  totalRecordings: number;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  checkAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  checkAuth: async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const user = await res.json();
        set({ user, loading: false });
      } else {
        set({ user: null, loading: false });
      }
    } catch {
      set({ user: null, loading: false });
    }
  },

  login: async (email, password) => {
    set({ error: null });
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        const meRes = await fetch("/api/auth/me");
        const user = await meRes.json();
        set({ user, error: null });
        return true;
      } else {
        set({ error: data.message });
        return false;
      }
    } catch {
      set({ error: "Connection error" });
      return false;
    }
  },

  register: async (username, email, password) => {
    set({ error: null });
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        const meRes = await fetch("/api/auth/me");
        const user = await meRes.json();
        set({ user, error: null });
        return true;
      } else {
        set({ error: data.message });
        return false;
      }
    } catch {
      set({ error: "Connection error" });
      return false;
    }
  },

  logout: async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    set({ user: null });
  },

  clearError: () => set({ error: null }),
}));
