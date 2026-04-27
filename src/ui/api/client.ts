import type { Capability } from "@/shared/capability";
import { mockCapabilities } from "./mock-data";

export interface SkillsManagerApi {
  listCapabilities(workspacePath?: string): Promise<Capability[]>;
  refresh(workspacePath?: string): Promise<Capability[]>;
  selectWorkspace(path: string): Promise<{ workspacePath: string }>;
  clearWorkspace(): Promise<void>;
}

function filterForWorkspace(workspacePath?: string) {
  return mockCapabilities.filter(
    (capability) =>
      capability.scope === "global" ||
      (workspacePath !== undefined && capability.workspacePath === workspacePath),
  );
}

export function createMockApiClient(): SkillsManagerApi {
  return {
    async listCapabilities(workspacePath?: string) {
      return filterForWorkspace(workspacePath);
    },
    async refresh(workspacePath?: string) {
      return filterForWorkspace(workspacePath);
    },
    async selectWorkspace(path: string) {
      return { workspacePath: path };
    },
    async clearWorkspace() {},
  };
}

export const apiClient = createMockApiClient();
