import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
export const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");
