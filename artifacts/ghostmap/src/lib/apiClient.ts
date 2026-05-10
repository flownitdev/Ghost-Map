const API_BASE = "/api";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const resp = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: resp.statusText }));
    throw new Error((err as { error?: string }).error ?? "Request failed");
  }
  if (resp.status === 204) return undefined as T;
  return resp.json() as Promise<T>;
}

export interface ApiLocation {
  id: number;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  description: string;
  abandonmentScore: number;
  riskLevel: string;
  lastVisited: string | null;
  submittedBy: string | null;
  createdAt: string;
}

export interface ApiUser {
  id: string;
  name: string | null;
  email: string | null;
}

export interface ApiAnalysis {
  locationId: string;
  summary: string;
  abandonmentScore: number;
  decayLevel: number;
  structuralIntegrity: number;
  activityLevel: number;
  explorationDifficulty: number;
  aiConfidence: number;
  roofDeterioration: number;
  vegetationOvergrowth: number;
  parkingDecay: number;
  riskEstimate: string;
}

export const api = {
  async getLocations(): Promise<ApiLocation[]> {
    return apiFetch<ApiLocation[]>("/locations");
  },

  async addLocation(payload: Omit<ApiLocation, "id" | "createdAt">): Promise<ApiLocation> {
    return apiFetch<ApiLocation>("/locations", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getUserLocations(userId: string): Promise<{ saved: ApiLocation[]; explored: ApiLocation[]; submitted: ApiLocation[] }> {
    return apiFetch(`/users/${userId}/locations`);
  },

  async getUserLocationIds(userId: string): Promise<{ savedIds: number[]; exploredIds: number[] }> {
    return apiFetch(`/users/${userId}/saved-ids`);
  },

  async saveLocation(userId: string, locationId: number): Promise<void> {
    return apiFetch(`/users/${userId}/saved`, {
      method: "POST",
      body: JSON.stringify({ locationId }),
    });
  },

  async unsaveLocation(userId: string, locationId: number): Promise<void> {
    return apiFetch(`/users/${userId}/saved/${locationId}`, { method: "DELETE" });
  },

  async markExplored(userId: string, locationId: number): Promise<void> {
    return apiFetch(`/users/${userId}/explored`, {
      method: "POST",
      body: JSON.stringify({ locationId }),
    });
  },

  async unmarkExplored(userId: string, locationId: number): Promise<void> {
    return apiFetch(`/users/${userId}/explored/${locationId}`, { method: "DELETE" });
  },

  async getAnalysis(locationId: string): Promise<ApiAnalysis | null> {
    try {
      return await apiFetch<ApiAnalysis>(`/analysis/${locationId}`);
    } catch {
      return null;
    }
  },

  async saveAnalysis(analysis: ApiAnalysis): Promise<void> {
    await apiFetch("/analysis", {
      method: "POST",
      body: JSON.stringify(analysis),
    });
  },

  async getAuthUser(): Promise<ApiUser | null> {
    const data = await apiFetch<{ user: ApiUser | null }>("/auth/user");
    return data.user;
  },

  async upsertUser(user: ApiUser): Promise<void> {
    await apiFetch("/users/upsert", {
      method: "POST",
      body: JSON.stringify(user),
    });
  },

  async analyzeLocation(payload: {
    locationId: string;
    name: string;
    category: string;
    description: string;
    riskLevel: string;
    abandonmentScore: number;
    lastVisited?: string;
    latitude?: number;
    longitude?: number;
  }): Promise<ApiAnalysis> {
    return apiFetch<ApiAnalysis>("/ai/analyze", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
