import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: "./",
  envDir: "./",
  build: {
    outDir: "../renderer",
    emptyOutDir: true,
    rollupOptions: {},
  },
  // publicDir: "../renderer/assets",
});
