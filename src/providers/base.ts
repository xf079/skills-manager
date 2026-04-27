import path from "node:path";
import type { Capability } from "@/shared/capability";
import type { OperationPlan } from "@/shared/operations";
import type {
  CreateCapabilityInput,
  InstallSource,
  Provider,
  ProviderLocation,
} from "@/shared/provider";

export function workspaceLocation(
  provider: ProviderLocation["provider"],
  workspacePath: string,
  relativePath: string,
  label: string,
): ProviderLocation {
  return {
    provider,
    scope: "workspace",
    rootPath: path.join(workspacePath, relativePath).replaceAll("\\", "/"),
    workspacePath,
    label,
  };
}

export function emptyPlan(
  provider: string,
  kind: OperationPlan["kind"],
  targetPath: string,
): OperationPlan {
  return {
    id: `${provider}:${kind}:${targetPath}`,
    kind,
    provider,
    scope: "global",
    targetPath,
    requiresConfirmation: false,
    warnings: [],
    steps: [],
  };
}

export function createProvider(input: {
  id: Provider["id"];
  label: string;
  supportedTypes: string[];
  globalRelativePaths: string[];
  workspaceRelativePaths: Array<{ path: string; label: string }>;
}): Provider {
  return {
    id: input.id,
    label: input.label,
    supportedTypes: input.supportedTypes,
    async discoverGlobalLocations() {
      return input.globalRelativePaths.map((rootPath) => ({
        provider: input.id,
        scope: "global",
        rootPath,
        label: `${input.label} global`,
      }));
    },
    async discoverWorkspaceLocations(workspacePath: string) {
      return input.workspaceRelativePaths.map((entry) =>
        workspaceLocation(input.id, workspacePath, entry.path, entry.label),
      );
    },
    async scan() {
      return [];
    },
    async validate(capability: Capability) {
      return capability;
    },
    async planCreate(_input: CreateCapabilityInput, target: ProviderLocation) {
      return emptyPlan(input.id, "create", target.rootPath);
    },
    async planInstall(_source: InstallSource, target: ProviderLocation) {
      return emptyPlan(input.id, "install", target.rootPath);
    },
    async planCopy(_capability: Capability, target: ProviderLocation) {
      return emptyPlan(input.id, "copy", target.rootPath);
    },
    async planEnable(capability: Capability) {
      return emptyPlan(input.id, "enable", capability.rootPath);
    },
    async planDisable(capability: Capability) {
      return emptyPlan(input.id, "disable", capability.rootPath);
    },
    async planRemove(capability: Capability) {
      return emptyPlan(input.id, "remove", capability.rootPath);
    },
    async checkUpdates(capability: Capability) {
      return capability;
    },
  };
}
