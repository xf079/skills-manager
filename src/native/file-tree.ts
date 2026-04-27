import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

export async function pathExists(target: string) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

export async function listDirectories(rootPath: string) {
  if (!(await pathExists(rootPath))) {
    return [];
  }

  const entries = await readdir(rootPath, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(rootPath, entry.name));
}

export async function readTextIfExists(filePath: string) {
  if (!(await pathExists(filePath))) {
    return undefined;
  }

  return readFile(filePath, "utf8");
}
