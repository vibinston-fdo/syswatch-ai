/**
 * api.js — Central API configuration for SysWatch AI
 *
 * When built for production, the React app is served BY the FastAPI backend
 * at the same host/port, so all API calls use relative paths (/api/...).
 *
 * For local development (npm start on :3000 + uvicorn on :8000),
 * the CRA proxy (configured in package.json) automatically forwards
 * /api and /ws requests to http://localhost:8000.
 */

import axios from "axios";

const api = axios.create({
  baseURL: "",          // relative — works whether on :3000 (dev) or :8000 (prod)
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token automatically to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors globally (redirect to login)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

/**
 * Build the correct WebSocket URL regardless of protocol/host.
 * Works in both dev (port 3000 → proxied to 8000) and production.
 */
export const getWebSocketUrl = (path = "/ws") => {
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${window.location.host}${path}`;
};

export default api;
