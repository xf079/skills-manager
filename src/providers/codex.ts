import { createProvider } from "./base";

export const codexProvider = createProvider({
  id: "codex",
  label: "Codex",
  supportedTypes: ["skill"],
  globalRelativePaths: ["~/.codex/skills"],
  workspaceRelativePaths: [{ path: ".codex/skills", label: "Codex workspace skills" }],
});
