import { resolveViteEnvironment, resolveLucideReactEntry } from '../../../sdkwork-specs/tools/vite-runtime-profile.mjs';
import { resolveBrowserDistOutDir } from '../../../sdkwork-specs/tools/browser-dist-layout.mjs';

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  build: {
    outDir: resolveBrowserDistOutDir(resolveViteEnvironment(undefined, process.env)),
    emptyOutDir: true,
  },
  plugins: [react()],
  server: { host: "127.0.0.1", port: 3100 },
});
