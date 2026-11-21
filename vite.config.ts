import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// For GitHub Pages at username.github.io/repo-name, set base to "/repo-name/".
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/",
});
