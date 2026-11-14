import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base works on username.github.io/<repo>/ and on a custom domain.
export default defineConfig({
  base: "./",
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(process.env.APP_VERSION || "dev"),
  },
});
