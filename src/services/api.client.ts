export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export async function apiRequest<T>(
    path: string,
    options: RequestInit = {},
): Promise<{ data?: T; error?: { code: string; message: string; details?: any } }> {
    try {
        const token = localStorage.getItem('supabase_access_token'); // 저장 위치는 auth.store와 맞춤
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        };

        const response = await fetch(`${API_BASE_URL}${path}`, {
            ...options,
            headers,
        });

        const result = await response.json();

        if (!response.ok) {
            return { error: result.error || { code: 'E_UNKNOWN', message: 'An unknown error occurred' } };
        }

        return result; // NestJS는 { data: ... } 형식으로 반환하도록 설정함
    } catch (err) {
        return {
            error: {
                code: 'E_NETWORK_ERROR',
                message: 'Network error or server is down',
                details: err,
            },
        };
    }
}
