import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import path from "path";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [sveltekit()],

  // Vite options tailored for Tauri development
  resolve: {
    alias: {
      "@runyard/ui": path.resolve(__dirname, "../../packages/ui/src/lib"),
      "@runyard/editor": path.resolve(__dirname, "../../packages/editor/src"),
      "@runyard/protocol": path.resolve(__dirname, "../../packages/protocol/src"),
      "@runyard/common": path.resolve(__dirname, "../../packages/common/src")
    },
    dedupe: [
      "@codemirror/state",
      "@codemirror/view",
      "@codemirror/basic-setup",
      "@codemirror/lang-javascript",
      "@codemirror/lang-python",
      "@codemirror/theme-one-dark",
      "@codemirror/language",
      "@codemirror/commands",
      "@codemirror/search",
      "@codemirror/autocomplete"
    ]
  },
  optimizeDeps: {
    include: [
      "@codemirror/state",
      "@codemirror/view",
      "@codemirror/basic-setup",
      "@codemirror/lang-javascript",
      "@codemirror/lang-python",
      "@codemirror/theme-one-dark",
      "@codemirror/language",
      "@codemirror/commands",
      "@codemirror/search",
      "@codemirror/autocomplete",
      "@fontsource-variable/google-sans-flex"
    ]
  },

  server: {
    fs: {
      allow: ["../../"] // Allow workspace root
    },
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
