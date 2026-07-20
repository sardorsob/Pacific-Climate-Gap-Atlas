import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // Match the hard JavaScript asset cap enforced by check_app_bundle_budget.py.
    chunkSizeWarningLimit: 1050,
  },
});
