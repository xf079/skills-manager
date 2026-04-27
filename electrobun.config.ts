import type { ElectrobunConfig } from "electrobun";

export default {
  app: {
    name: "Skills Manager",
    identifier: "dev.skills-manager.app",
    version: "0.1.0",
  },
  runtime: {
    exitOnLastWindowClosed: true,
  },
  build: {
    bun: {
      entrypoint: "src/native/main.ts",
    },
    views: {
      mainview: {
        entrypoint: "src/ui/main.tsx",
      },
    },
  },
} satisfies ElectrobunConfig;
