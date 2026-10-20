import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("react-router") || /node_modules\/(react|react-dom)\//.test(id)) {
            return "vendor-react";
          }
          if (id.includes("lucide-react") || id.includes("react-icons")) {
            return "vendor-icons";
          }
          if (
            id.includes("framer-motion") ||
            id.includes("motion-dom") ||
            id.includes("motion-utils")
          ) {
            return "vendor-motion";
          }
          return undefined;
        },
      },
    },
  },
});
