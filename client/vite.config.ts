import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

function apiOrigin() {
  try {
    const envFile = fs.readFileSync(path.resolve(__dirname, "../server/.env"), "utf8");
    const match = envFile.match(/^PORT=(\d+)/m);
    if (match) return `http://localhost:${match[1]}`;
  } catch {
    // El puerto por defecto cubre una instalación nueva.
  }
  return "http://localhost:4000";
}

const api = apiOrigin();

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": { target: api, changeOrigin: true },
      "/uploads": { target: api, changeOrigin: true },
      "/robots.txt": { target: api, changeOrigin: true },
      "/sitemap.xml": { target: api, changeOrigin: true },
    },
  },
});
