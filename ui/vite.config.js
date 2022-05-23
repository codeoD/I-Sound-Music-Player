import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

const htmlPlugin = () => {
  return {
    name: "html-transform",
    transformIndexHtml(html) {
      return html.replace(/<title>(.*?)<\/title>/, `<title>I Sound</title>`);
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), htmlPlugin()],
  base: "./",
  envDir: "./",
  build: {
    outDir: "../renderer",
    emptyOutDir: true,
    rollupOptions: {
      // plugins: [],
    },
  },
});
