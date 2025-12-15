import { apiGet, apiPost } from "@/app/lib/http";

export type MeResponse = { user: { id: string; label?: string } };

export async function registerKey(label?: string) {
  return apiPost<{ user: any; loginKey: string; warning?: string }>(
    "/api/auth/key/register",
    { label }
  );
}

export async function loginWithKey(loginKey: string) {
  return apiPost<{ user: any }>("/api/auth/key/login", { loginKey });
}

export async function me() {
  return apiGet<MeResponse>("/api/auth/me");
}

export async function logout() {
  return apiPost<{ ok: boolean }>("/api/auth/logout", {});
}
