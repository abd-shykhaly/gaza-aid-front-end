import { AuthResponse } from "../types";

// Custom event for auth state changes
export const AUTH_STATE_CHANGED = "auth-state-changed";

export const authStorage = {
  getToken: (): string | null => {
    return localStorage.getItem("token");
  },

  setToken: (token: string): void => {
    localStorage.setItem("token", token);
    window.dispatchEvent(new CustomEvent(AUTH_STATE_CHANGED));
  },

  removeToken: (): void => {
    localStorage.removeItem("token");
    window.dispatchEvent(new CustomEvent(AUTH_STATE_CHANGED));
  },

  getUser: (): { id: number; username: string } | null => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  setUser: (user: { id: number; username: string }): void => {
    localStorage.setItem("user", JSON.stringify(user));
  },

  removeUser: (): void => {
    localStorage.removeItem("user");
  },

  isAuthenticated: (): boolean => {
    return !!authStorage.getToken();
  },

  logout: (): void => {
    authStorage.removeToken();
    authStorage.removeUser();
  },

  setAuthData: (response: AuthResponse): void => {
    authStorage.setToken(response.token);
    authStorage.setUser(response.user);
  },
};
