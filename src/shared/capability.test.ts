import { describe, expect, it } from "vitest";
import { capabilityId, isWorkspaceCapability } from "./capability";

describe("capability domain helpers", () => {
  it("builds a stable id from provider, scope, workspace, and entry path", () => {
    expect(
      capabilityId({
        provider: "codex",
        scope: "workspace",
        workspacePath: "D:\\repo",
        entryPath: "D:\\repo\\.codex\\skills\\review\\SKILL.md",
      }),
    ).toBe("codex:workspace:D:/repo:D:/repo/.codex/skills/review/SKILL.md");
  });

  it("detects workspace capabilities", () => {
    expect(isWorkspaceCapability({ scope: "workspace" })).toBe(true);
    expect(isWorkspaceCapability({ scope: "global" })).toBe(false);
  });
});
