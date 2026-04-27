import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { writeSkillFixture } from "@/test/fixtures";
import { codexProvider } from "./codex";

describe("capability scanning", () => {
  it("scans child directories with SKILL.md as valid skills", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "skills-manager-"));
    await writeSkillFixture(root, "review", "# Review\n\nChecks code.");

    const capabilities = await codexProvider.scan({
      provider: "codex",
      scope: "global",
      rootPath: root,
      label: "Codex global",
    });

    expect(capabilities).toHaveLength(1);
    expect(capabilities[0]).toMatchObject({
      name: "review",
      provider: "codex",
      type: "skill",
      scope: "global",
      enabled: true,
      status: "valid",
      description: "Checks code.",
    });
  });
});
