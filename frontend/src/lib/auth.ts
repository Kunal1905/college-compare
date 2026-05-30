import type { AuthUser } from "@/types";

export const TOKEN_KEY = "college_token";
export const USER_KEY = "college_user";

const isBrowser = () => typeof window !== "undefined";

export const getStoredToken = () => {
  if (!isBrowser()) {
    return null;
  }

  return localStorage.getItem(TOKEN_KEY);
};

export const getStoredUser = () => {
  if (!isBrowser()) {
    return null;
  }

  const rawUser = localStorage.getItem(USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    return null;
  }
};

export const storeSession = (token: string, user: AuthUser) => {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearSession = () => {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};
