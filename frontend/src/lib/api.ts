import axios from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? "https://backend-gng5aslhl-loran4.vercel.app/api"
    : "http://localhost:5000/api");

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

export const API_URL = baseURL;
export const BACKEND_URL = baseURL.replace(/\/api$/, "");

