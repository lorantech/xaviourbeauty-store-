import axios from "axios";

// Backend base URL. Override per environment via Vercel project env var
// `NEXT_PUBLIC_API_BASE_URL` (no trailing slash). Falls back to the current
// production backend so the storefront works out of the box.
const API_BASE = (
  (process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://backend-gng5aslhl-loran4.vercel.app").replace(/\/$/, "") + "/api"
);

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

export const API_URL = API_BASE;
export const BACKEND_URL = API_BASE.replace(/\/api$/, "");
