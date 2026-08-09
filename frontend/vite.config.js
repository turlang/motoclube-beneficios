import { defineConfig } from "vite";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react"
  },
  build: {
    target: "es2022",
    sourcemap: false
  }
});
