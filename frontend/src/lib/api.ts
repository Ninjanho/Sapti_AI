const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface FetchOptions extends RequestInit {
  token?: string;
}

async function apiFetch(endpoint: string, options: FetchOptions = {}) {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `API error: ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Conversations
  getConversations: (token: string) =>
    apiFetch('/conversations', { token }),

  getConversation: (id: string, token: string) =>
    apiFetch(`/conversations/${id}`, { token }),

  deleteConversation: (id: string, token: string) =>
    apiFetch(`/conversations/${id}`, { method: 'DELETE', token }),

  // Profile
  getProfile: (token: string) =>
    apiFetch('/profile', { token }),

  updateProfile: (data: Record<string, unknown>, token: string) =>
    apiFetch('/profile', { method: 'PATCH', body: JSON.stringify(data), token }),

  setApiKey: (provider: string, apiKey: string, token: string) =>
    apiFetch('/profile/api-key', {
      method: 'POST',
      body: JSON.stringify({ provider, api_key: apiKey }),
      token,
    }),

  removeApiKey: (token: string) =>
    apiFetch('/profile/api-key', { method: 'DELETE', token }),

  // Evolution
  getEvolution: () =>
    apiFetch('/evolution'),

  // Chat (SSE - handled separately)
  getChatStreamUrl: () => `${API_BASE_URL}/api/v1/chat/stream`,
};
