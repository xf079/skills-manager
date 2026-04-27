import { describe, expect, it } from "vitest";
import { codexProvider } from "./codex";
import { cursorProvider } from "./cursor";

describe("provider discovery", () => {
  it("discovers codex workspace skills under .codex/skills", async () => {
    const locations = await codexProvider.discoverWorkspaceLocations("D:/repo");

    expect(locations).toContainEqual({
      provider: "codex",
      scope: "workspace",
      rootPath: "D:/repo/.codex/skills",
      workspacePath: "D:/repo",
      label: "Codex workspace skills",
    });
  });

  it("discovers cursor workspace rules under .cursor/rules", async () => {
    const locations = await cursorProvider.discoverWorkspaceLocations("D:/repo");

    expect(locations[0]).toEqual({
      provider: "cursor",
      scope: "workspace",
      rootPath: "D:/repo/.cursor/rules",
      workspacePath: "D:/repo",
      label: "Cursor workspace rules",
    });
  });
});
