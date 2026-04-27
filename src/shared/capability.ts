import { normalizePathForId } from "./paths";

export type ProviderId = "codex" | "claude" | "gemini" | "cursor" | "windsurf";
export type CapabilityScope = "global" | "workspace";
export type SourceKind = "installed" | "local" | "github" | "curated";
export type CapabilityStatus =
  | "valid"
  | "invalid"
  | "disabled"
  | "needs_review"
  | "update_available"
  | "missing"
  | "unconfigured";

export interface ValidationMessage {
  level: "info" | "warning" | "error";
  message: string;
  path?: string;
}

export interface Capability {
  id: string;
  name: string;
  provider: ProviderId;
  type: string;
  scope: CapabilityScope;
  workspacePath?: string;
  rootPath: string;
  entryPath: string;
  enabled: boolean;
  status: CapabilityStatus;
  sourceKind: SourceKind;
  sourceUrl?: string;
  sourceRef?: string;
  version?: string;
  commit?: string;
  description?: string;
  tags: string[];
  lastScannedAt: string;
  lastModifiedAt?: string;
  validationMessages: ValidationMessage[];
  providerMetadata: Record<string, unknown>;
}

export function capabilityId(input: {
  provider: ProviderId;
  scope: CapabilityScope;
  workspacePath?: string;
  entryPath: string;
}) {
  return [
    input.provider,
    input.scope,
    normalizePathForId(input.workspacePath ?? ""),
    normalizePathForId(input.entryPath),
  ].join(":");
}

export function isWorkspaceCapability(input: { scope: CapabilityScope }) {
  return input.scope === "workspace";
}
