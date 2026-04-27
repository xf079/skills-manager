import { describe, expect, it } from "vitest";
import { createMockApiClient } from "./client";

describe("ui api client", () => {
  it("lists mock capabilities in global-only mode", async () => {
    const client = createMockApiClient();
    const capabilities = await client.listCapabilities();

    expect(capabilities.every((capability) => capability.scope === "global")).toBe(true);
  });
});
