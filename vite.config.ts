import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => {
  const isDev = command === "serve";

  return {
    plugins: [react()],
    base: "/gaza-aid-front-end",
    build: {
      outDir: "dist",
      sourcemap: false,
    },
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: isDev
            ? "http://localhost:5000"
            : "https://gaza-aid-exchange-api.onrender.com",
          changeOrigin: true,
        },
      },
    },
  };
});
