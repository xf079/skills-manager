import { createProvider } from "./base";

export const windsurfProvider = createProvider({
  id: "windsurf",
  label: "Windsurf",
  supportedTypes: ["rule"],
  globalRelativePaths: ["~/.windsurf/rules"],
  workspaceRelativePaths: [{ path: ".windsurf/rules", label: "Windsurf workspace rules" }],
});
