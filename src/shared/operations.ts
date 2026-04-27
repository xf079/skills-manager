export type OperationKind =
  | "create"
  | "edit"
  | "install"
  | "copy"
  | "enable"
  | "disable"
  | "remove"
  | "update";

export type OperationStep =
  | { kind: "write_file"; path: string; contents: string }
  | { kind: "copy_directory"; from: string; to: string }
  | { kind: "move_directory"; from: string; to: string }
  | { kind: "delete_file"; path: string }
  | { kind: "mkdir"; path: string };

export interface OperationPlan {
  id: string;
  kind: OperationKind;
  provider: string;
  scope: "global" | "workspace";
  targetPath: string;
  requiresConfirmation: boolean;
  warnings: string[];
  steps: OperationStep[];
}

export interface OperationLogEntry {
  id: string;
  operationId: string;
  kind: OperationKind;
  provider: string;
  scope: "global" | "workspace";
  targetPath: string;
  status: "success" | "failure";
  message?: string;
  createdAt: string;
}
