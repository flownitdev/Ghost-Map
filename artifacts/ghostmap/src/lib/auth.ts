// Auth is handled via Replit Auth (server-side).
// These functions redirect the browser to the auth endpoints.

export function signIn() {
  window.location.href = "/api/login";
}

export function signOut() {
  window.location.href = "/api/logout";
}

export async function getSession(): Promise<null> {
  return null;
}
