import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export async function writeSkillFixture(
  root: string,
  name: string,
  body = "# Test skill\n\nUseful skill.",
) {
  const skillDir = path.join(root, name);
  await mkdir(skillDir, { recursive: true });
  await writeFile(path.join(skillDir, "SKILL.md"), body, "utf8");
  return skillDir;
}
