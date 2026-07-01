const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface FetchOptions extends RequestInit {}

export async function fetchApi<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.error || `HTTP Error: ${response.status}`);
        }

        return responseData.data as T;
        
    } catch (error) {
        console.error(`[API Client] Gagal mengakses ${endpoint}:`, error);
        throw error;
    }
}