import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { codexProvider } from "@/providers/codex";
import { writeSkillFixture } from "@/test/fixtures";
import { createIndexDb } from "./index-db";
import { scanProviders } from "./scanner";

describe("scan orchestrator", () => {
  it("scans active provider locations into the index", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "skills-manager-"));
    await writeSkillFixture(root, "review");
    const db = createIndexDb(":memory:");

    await scanProviders({
      db,
      providers: [codexProvider],
      globalLocations: [
        { provider: "codex", scope: "global", rootPath: root, label: "Codex global" },
      ],
    });

    expect(db.listCapabilities().map((capability) => capability.name)).toEqual(["review"]);
  });
});
