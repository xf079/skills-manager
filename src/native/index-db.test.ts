import { describe, expect, it } from "vitest";
import { createIndexDb } from "./index-db";

describe("index database", () => {
  it("upserts and lists capabilities", () => {
    const db = createIndexDb(":memory:");

    db.upsertCapabilities([
      {
        id: "codex:global::/tmp/review/SKILL.md",
        name: "review",
        provider: "codex",
        type: "skill",
        scope: "global",
        rootPath: "/tmp/review",
        entryPath: "/tmp/review/SKILL.md",
        enabled: true,
        status: "valid",
        sourceKind: "installed",
        tags: [],
        lastScannedAt: "2026-04-28T00:00:00.000Z",
        validationMessages: [],
        providerMetadata: {},
      },
    ]);

    expect(db.listCapabilities()).toHaveLength(1);
    expect(db.listCapabilities()[0].name).toBe("review");
  });
});
