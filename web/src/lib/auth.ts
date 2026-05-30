const TOKEN_KEY = "vivarium_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function extractTokenFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  if (token) {
    setToken(token);
    window.history.replaceState({}, "", window.location.pathname);
    return token;
  }
  return null;
}

export function getAuthError(): string | null {
  const params = new URLSearchParams(window.location.search);
  const error = params.get("auth_error");
  if (error) {
    window.history.replaceState({}, "", window.location.pathname);
    return error;
  }
  return null;
}
