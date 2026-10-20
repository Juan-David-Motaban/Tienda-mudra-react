const API_URL = "http://localhost:8080/api";
export const CLAVE_TOKEN = "mudraTokenJWT";

export function obtenerToken() {
    return localStorage.getItem(CLAVE_TOKEN);
}

export function guardarToken(token) {
    if (token) localStorage.setItem(CLAVE_TOKEN, token);
    else localStorage.removeItem(CLAVE_TOKEN);
}

export async function apiFetch(endpoint, options = {}) {
    const token = obtenerToken();
    const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });

    if (response.status === 204) return null;

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        if (response.status === 401) {
            guardarToken(null);
        }
        throw new Error(data?.mensaje || `Error HTTP ${response.status}`);
    }

    return data;
}