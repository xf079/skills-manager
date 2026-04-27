import { createProvider } from "./base";

export const cursorProvider = createProvider({
  id: "cursor",
  label: "Cursor",
  supportedTypes: ["rule"],
  globalRelativePaths: ["~/.cursor/rules"],
  workspaceRelativePaths: [{ path: ".cursor/rules", label: "Cursor workspace rules" }],
});
