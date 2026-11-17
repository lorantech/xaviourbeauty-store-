import axios from "axios";

const API_BASE = (
  (process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://xaviourbeauty-store.vercel.app").replace(/\/$/, "") + "/api"
);

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

export const API_URL = API_BASE;
export const BACKEND_URL = API_BASE.replace(/\/api$/, "");