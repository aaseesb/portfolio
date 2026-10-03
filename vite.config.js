import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // If you deploy to GitHub Pages at username.github.io/repo-name,
  // set base to "/repo-name/". For Vercel or a root domain, leave it as "/".
  base: "/",
});
