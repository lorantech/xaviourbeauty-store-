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

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

export const API_URL = API_BASE;
export const BACKEND_URL = API_BASE.replace(/\/api$/, "");