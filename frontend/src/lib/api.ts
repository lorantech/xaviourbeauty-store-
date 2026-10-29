import axios from "axios";

const RAW_BASE = "https://backend-gng5aslhl-loran4.vercel.app/api";

const cleanBaseUrl = (url: string) => {
  let cleaned = url;
  // Remove any leaked env var assignments
  cleaned = cleaned.replace(/EMAIL_USER=/gi, "");
  cleaned = cleaned.replace(/NEXT_PUBLIC_API_URL=/gi, "");
  cleaned = cleaned.replace(/NEXT_PUBLIC_SITE_URL=/gi, "");
  // Fix double slashes except after protocol
  cleaned = cleaned.replace(/([^:]\/)\/+/g, "$1");
  // Ensure it ends with /api
  if (!cleaned.endsWith("/api")) {
    if (cleaned.endsWith("/")) cleaned = cleaned.slice(0, -1);
    cleaned = cleaned + "/api";
  }
  return cleaned;
};

const baseURL = cleanBaseUrl(RAW_BASE);

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

export const API_URL = baseURL;
export const BACKEND_URL = baseURL.replace(/\/api$/, "");
