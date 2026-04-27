export function normalizePathForId(path: string) {
  return path.replaceAll("\\", "/").replace(/\/+$/u, "");
}
