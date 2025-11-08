import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: true, // allows external connections (Replit, Codespaces, etc.)
    port: 8080,
    allowedHosts: [
      "570ca7bc-be94-4e03-9141-3c3f18aead9b-00-306u1xmy0jrlc.kirk.replit.dev", // Replit host
      "localhost",
      "127.0.0.1",
    ],
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

