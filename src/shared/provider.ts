import type { Capability, CapabilityScope, ProviderId } from "./capability";
import type { OperationPlan } from "./operations";

export interface ProviderLocation {
  provider: ProviderId;
  scope: CapabilityScope;
  rootPath: string;
  workspacePath?: string;
  label: string;
}

export interface CreateCapabilityInput {
  name: string;
  type: string;
  description?: string;
  tags: string[];
}

export interface InstallSource {
  kind: "local" | "github" | "curated";
  path?: string;
  url?: string;
  ref?: string;
  curatedId?: string;
}

export interface Provider {
  id: ProviderId;
  label: string;
  supportedTypes: string[];
  discoverGlobalLocations(): Promise<ProviderLocation[]>;
  discoverWorkspaceLocations(workspacePath: string): Promise<ProviderLocation[]>;
  scan(location: ProviderLocation): Promise<Capability[]>;
  validate(capability: Capability): Promise<Capability>;
  planCreate(input: CreateCapabilityInput, target: ProviderLocation): Promise<OperationPlan>;
  planInstall(source: InstallSource, target: ProviderLocation): Promise<OperationPlan>;
  planCopy(capability: Capability, target: ProviderLocation): Promise<OperationPlan>;
  planEnable(capability: Capability): Promise<OperationPlan>;
  planDisable(capability: Capability): Promise<OperationPlan>;
  planRemove(capability: Capability): Promise<OperationPlan>;
  checkUpdates(capability: Capability): Promise<Capability>;
}
