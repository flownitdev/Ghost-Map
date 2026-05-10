export async function signIn(): Promise<void> {
  window.location.href = "/__replauth";
}

export async function signOut(): Promise<void> {
  window.location.href = "/__replauthlogout";
}
