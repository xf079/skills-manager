import { createProvider } from "./base";

export const claudeProvider = createProvider({
  id: "claude",
  label: "Claude Code",
  supportedTypes: ["skill", "command", "agent", "config"],
  globalRelativePaths: ["~/.claude/skills", "~/.claude/commands", "~/.claude/agents"],
  workspaceRelativePaths: [
    { path: ".claude/skills", label: "Claude workspace skills" },
    { path: ".claude/commands", label: "Claude workspace commands" },
    { path: ".claude/agents", label: "Claude workspace agents" },
  ],
});
