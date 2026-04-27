import { describe, expect, it } from "vitest";
import { normalizePathForId } from "./paths";

describe("path helpers", () => {
  it("normalizes backslashes to forward slashes for stable ids", () => {
    expect(normalizePathForId("C:\\Users\\me\\.codex\\skills")).toBe(
      "C:/Users/me/.codex/skills",
    );
  });

  it("removes trailing slashes for stable ids", () => {
    expect(normalizePathForId("C:/Users/me/.codex/skills/")).toBe(
      "C:/Users/me/.codex/skills",
    );
  });
});
