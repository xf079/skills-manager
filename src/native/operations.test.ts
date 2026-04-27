import { mkdir, readFile, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createIndexDb } from "./index-db";
import { executeOperationPlan } from "./operations";

describe("operation execution", () => {
  it("writes files and logs success", async () => {
    const root = path.join(os.tmpdir(), `skills-manager-${Date.now()}`);
    await mkdir(root, { recursive: true });
    const db = createIndexDb(":memory:");
    const target = path.join(root, "new-skill", "SKILL.md");

    await executeOperationPlan(db, {
      id: "op-1",
      kind: "create",
      provider: "codex",
      scope: "global",
      targetPath: target,
      requiresConfirmation: false,
      warnings: [],
      steps: [
        { kind: "mkdir", path: path.dirname(target) },
        { kind: "write_file", path: target, contents: "# New skill\n" },
      ],
    });

    expect(await readFile(target, "utf8")).toBe("# New skill\n");
    expect(db.listOperationLogs()[0].status).toBe("success");
  });

  it("moves directories instead of permanently deleting", async () => {
    const root = path.join(os.tmpdir(), `skills-manager-remove-${Date.now()}`);
    const from = path.join(root, "skill");
    const to = path.join(root, "trash", "skill");
    await mkdir(from, { recursive: true });
    const db = createIndexDb(":memory:");

    await executeOperationPlan(db, {
      id: "op-2",
      kind: "remove",
      provider: "codex",
      scope: "global",
      targetPath: from,
      requiresConfirmation: true,
      warnings: ["Moves item to app trash."],
      steps: [{ kind: "move_directory", from, to }],
    });

    await expect(stat(to)).resolves.toBeTruthy();
    expect(db.listOperationLogs()[0].kind).toBe("remove");
  });
});
