import axios from "axios";

const API_BASE = "https://backend-gng5aslhl-loran4.vercel.app/api";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

export const API_URL = API_BASE;
export const BACKEND_URL = API_BASE.replace(/\/api$/, "");
