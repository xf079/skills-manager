import { createProvider } from "./base";

export const geminiProvider = createProvider({
  id: "gemini",
  label: "Gemini CLI",
  supportedTypes: ["rule", "context"],
  globalRelativePaths: ["~/.gemini"],
  workspaceRelativePaths: [{ path: ".gemini", label: "Gemini workspace config" }],
});
