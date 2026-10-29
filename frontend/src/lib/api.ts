import axios from "axios";

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    }
    // Always use production backend for non-localhost (Vercel/other)
    if (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.includes("backend")) {
      return process.env.NEXT_PUBLIC_API_URL;
    }
    return "https://backend-gng5aslhl-loran4.vercel.app/api";
  }
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return "https://backend-gng5aslhl-loran4.vercel.app/api";
};

const baseURL = getBaseUrl();

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

export const API_URL = baseURL;
export const BACKEND_URL = baseURL.replace(/\/api$/, "");
