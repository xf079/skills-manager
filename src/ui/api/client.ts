import type { Capability } from "@/shared/capability";
import { mockCapabilities } from "./mock-data";

export interface SkillsManagerApi {
  listCapabilities(): Promise<Capability[]>;
  refresh(): Promise<Capability[]>;
  selectWorkspace(path: string): Promise<{ workspacePath: string }>;
  clearWorkspace(): Promise<void>;
}

export function createMockApiClient(): SkillsManagerApi {
  return {
    async listCapabilities() {
      return mockCapabilities.filter((capability) => capability.scope === "global");
    },
    async refresh() {
      return mockCapabilities.filter((capability) => capability.scope === "global");
    },
    async selectWorkspace(path: string) {
      return { workspacePath: path };
    },
    async clearWorkspace() {},
  };
}

export const apiClient = createMockApiClient();
