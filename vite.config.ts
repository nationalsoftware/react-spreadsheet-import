import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import dts from "vite-plugin-dts"
import cssInjectedByJs from "vite-plugin-css-injected-by-js"
import { resolve } from "path"

export default defineConfig({
  plugins: [
    react(),
    cssInjectedByJs(),
    dts({
      include: ["src"],
      outDirs: "types",
      exclude: ["**/*.test.ts", "**/*.test.tsx", "**/tests/**", "**/stories/**"],
      tsconfigPath: "./tsconfig.json",
    }),
  ],
  build: {
    emptyOutDir: false,
    rollupOptions: {
      input: resolve(__dirname, "src/index.ts"),
      external: ["react", "react-dom"],
      preserveEntrySignatures: "exports-only",
      output: [
        {
          format: "es",
          dir: "dist",
          preserveModules: true,
          preserveModulesRoot: "src",
          entryFileNames: "[name].js",
        },
        {
          format: "cjs",
          dir: "dist-commonjs",
          preserveModules: true,
          preserveModulesRoot: "src",
          entryFileNames: "[name].js",
        },
      ],
    },
  },
  resolve: {
    alias: {
      "~/": resolve(__dirname, "src") + "/",
    },
  },
})
