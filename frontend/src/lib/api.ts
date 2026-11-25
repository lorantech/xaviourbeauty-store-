import axios from "axios";

// Accept either a backend origin or an API base URL from the deployment environment.
const configuredApiUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://xaviourbeauty-store.vercel.app";
const normalizedApiUrl = configuredApiUrl.replace(/\/+$/, "");
const API_BASE = /\/api$/i.test(normalizedApiUrl)
  ? normalizedApiUrl
  : `${normalizedApiUrl}/api`;

export const CART_SESSION_KEY = "xbs_cart_session";

export function getCartSessionId(): string {
  if (typeof window === "undefined") return "";
  const existing = window.localStorage.getItem(CART_SESSION_KEY);
  if (existing) return existing;
  const id = (typeof crypto !== "undefined" && "randomUUID" in crypto)
    ? crypto.randomUUID()
    : `xbs_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(CART_SESSION_KEY, id);
  return id;
}

export const AUTH_TOKEN_KEY = "xbs_auth_token";

export function getAuthToken(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(AUTH_TOKEN_KEY) || "";
}

export function setAuthToken(token?: string) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  else window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const sessionId = getCartSessionId();
    config.headers = config.headers ?? {};
    (config.headers as any)["x-cart-session"] = sessionId;
    const token = getAuthToken();
    if (token) (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error?.response?.status === 401) {
      const path = window.location.pathname;
      const requestUrl = String(error?.config?.url || "");
      const isAuthCheck = requestUrl.includes("/auth/me") || requestUrl.includes("/auth/login");
      if (path.startsWith("/admin") && path !== "/admin/login" && !isAuthCheck) {
        setAuthToken();
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

export const API_URL = API_BASE;
export const BACKEND_URL = API_BASE.replace(/\/api$/, "");