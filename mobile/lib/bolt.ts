import Constants from 'expo-constants';

const backendUrl = Constants.expoConfig?.extra?.backendUrl ?? 'http://localhost:5173';
export const API_BASE = backendUrl; // Now typed

export async function getAgents() {
  const res = await fetch(`${API_BASE}/api/agents`);
  return (await res.json()).agents as Array<{ id: string; name: string; description?: string; skills: string[] }>;
}

export async function delegate(agentId: string, type: string, payload?: unknown) {
  const res = await fetch(`${API_BASE}/api.agents.delegate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agentId, type, payload }),
  });
  return await res.json();
}