import { describe, expect, it } from "vitest";
import { providerRegistry } from "./registry";

describe("provider registry", () => {
  it("registers first-version providers", () => {
    expect(providerRegistry.map((provider) => provider.id)).toEqual([
      "codex",
      "claude",
      "gemini",
      "cursor",
      "windsurf",
    ]);
  });
});
