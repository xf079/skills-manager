import { cp, mkdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { OperationPlan, OperationStep } from "@/shared/operations";
import type { IndexDb } from "./index-db";

async function executeStep(step: OperationStep) {
  switch (step.kind) {
    case "mkdir":
      await mkdir(step.path, { recursive: true });
      return;
    case "write_file":
      await mkdir(path.dirname(step.path), { recursive: true });
      await writeFile(step.path, step.contents, "utf8");
      return;
    case "copy_directory":
      await cp(step.from, step.to, { recursive: true, force: false, errorOnExist: true });
      return;
    case "move_directory":
      await mkdir(path.dirname(step.to), { recursive: true });
      await rename(step.from, step.to);
      return;
    case "delete_file":
      await rm(step.path);
      return;
  }
}

export async function executeOperationPlan(db: IndexDb, plan: OperationPlan) {
  try {
    for (const step of plan.steps) {
      await executeStep(step);
    }

    db.addOperationLog({
      id: `${plan.id}:success:${Date.now()}`,
      operationId: plan.id,
      kind: plan.kind,
      provider: plan.provider,
      scope: plan.scope,
      targetPath: plan.targetPath,
      status: "success",
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    db.addOperationLog({
      id: `${plan.id}:failure:${Date.now()}`,
      operationId: plan.id,
      kind: plan.kind,
      provider: plan.provider,
      scope: plan.scope,
      targetPath: plan.targetPath,
      status: "failure",
      message: error instanceof Error ? error.message : String(error),
      createdAt: new Date().toISOString(),
    });
    throw error;
  }
}
