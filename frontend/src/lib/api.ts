import axios from "axios";

// Backend base URL. Reads from Vercel env var NEXT_PUBLIC_API_URL (or
// NEXT_PUBLIC_API_BASE_URL). Falls back to your live production backend.
const API_BASE = (
  (process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://backend-gng5aslhl-loran4.vercel.app").replace(/\/$/, "") + "/api"
);

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

export const API_URL = API_BASE;
export const BACKEND_URL = API_BASE.replace(/\/api$/, "");