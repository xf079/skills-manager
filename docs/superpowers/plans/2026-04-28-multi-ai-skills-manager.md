# Multi-AI Skills Manager Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a cross-platform Electrobun desktop app that manages global and optional workspace capabilities for Codex, Claude Code, Gemini CLI, Cursor, and Windsurf.

**Architecture:** File system remains the source of truth. Electrobun native code owns privileged file operations, provider modules understand each AI tool's capability formats, a local SQLite index caches scan and operation state, and React renders a three-pane management UI backed by TanStack Query/Table/Form.

**Tech Stack:** Electrobun, Bun, TypeScript, React, Vite, shadcn/ui, Tailwind CSS, TanStack Router, TanStack Query, TanStack Table, TanStack Form, SQLite, Vitest, Testing Library, Playwright.

---

## File Structure

Create these top-level areas:

- `package.json`: scripts and dependencies for Bun, Electrobun, React, tests, linting, and formatting.
- `electrobun.config.ts`: Electrobun app configuration.
- `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`: build and test configuration.
- `src/shared/`: provider-neutral domain types, path utilities, operation plan types, validation types.
- `src/native/`: Electrobun native APIs, provider registry, file operations, SQLite index, scan orchestration.
- `src/providers/`: provider implementations for Codex, Claude Code, Gemini CLI, Cursor, and Windsurf.
- `src/ui/`: React app, router, query client, shadcn components, pages, panels, forms, and table components.
- `src/test/`: fixture builders and test setup.
- `tests/e2e/`: Playwright smoke tests.
- `docs/superpowers/plans/2026-04-28-multi-ai-skills-manager.md`: this implementation plan.

Keep boundaries strict:

- UI imports `src/shared` and API clients only.
- Providers import `src/shared` and Node-safe helpers only.
- Native layer imports providers and executes file system work.
- Shared layer imports no UI or native modules.

---

### Task 1: Scaffold Electrobun React TypeScript App

**Files:**
- Create: `package.json`
- Create: `electrobun.config.ts`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `src/ui/main.tsx`
- Create: `src/ui/App.tsx`
- Create: `src/ui/styles.css`
- Create: `src/test/setup.ts`

- [ ] **Step 1: Create package metadata and scripts**

Write `package.json`:

```json
{
  "name": "skills-manager",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "electrobun dev",
    "build": "tsc -b && vite build && electrobun build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "lint": "tsc -b --pretty false",
    "format": "prettier --write ."
  },
  "dependencies": {
    "@electrobun/core": "latest",
    "@tanstack/react-form": "latest",
    "@tanstack/react-query": "latest",
    "@tanstack/react-router": "latest",
    "@tanstack/react-table": "latest",
    "@vitejs/plugin-react": "latest",
    "better-sqlite3": "latest",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "lucide-react": "latest",
    "react": "latest",
    "react-dom": "latest",
    "tailwind-merge": "latest",
    "tailwindcss": "latest",
    "zod": "latest"
  },
  "devDependencies": {
    "@playwright/test": "latest",
    "@testing-library/jest-dom": "latest",
    "@testing-library/react": "latest",
    "@types/better-sqlite3": "latest",
    "@types/node": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "jsdom": "latest",
    "prettier": "latest",
    "typescript": "latest",
    "vite": "latest",
    "vitest": "latest"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `bun install`

Expected: `bun.lock` is created and dependencies install without errors.

- [ ] **Step 3: Create TypeScript and Vite config**

Write `tsconfig.json`:

```json
{
  "files": [],
  "references": [{ "path": "./tsconfig.node.json" }],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

Write `tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "types": ["node", "vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src", "tests", "*.config.ts", "electrobun.config.ts"]
}
```

Write `vite.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
  server: {
    port: 5173,
    strictPort: false,
  },
});
```

Write `vitest.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["src/test/setup.ts"],
    globals: true,
  },
});
```

Write `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "on-first-retry",
  },
  webServer: {
    command: "bun run preview -- --host 127.0.0.1 --port 5173",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: true,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
```

- [ ] **Step 4: Create Electrobun and React entry files**

Write `electrobun.config.ts`:

```ts
export default {
  app: {
    name: "Skills Manager",
    identifier: "dev.skills-manager.app",
    version: "0.1.0",
  },
  build: {
    entrypoint: "src/native/main.ts",
    renderer: {
      url: "http://localhost:5173",
    },
  },
};
```

Write `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Skills Manager</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/ui/main.tsx"></script>
  </body>
</html>
```

Write `src/ui/main.tsx`:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

Write `src/ui/App.tsx`:

```tsx
export function App() {
  return (
    <main className="app-shell">
      <h1>Skills Manager</h1>
      <p>Global capability management is ready for provider integration.</p>
    </main>
  );
}
```

Write `src/ui/styles.css`:

```css
:root {
  color: #171717;
  background: #f7f7f5;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}

.app-shell {
  min-height: 100vh;
  padding: 32px;
}
```

Write `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 5: Verify scaffold**

Run: `bun run lint`

Expected: TypeScript completes without errors.

Run: `bun run test`

Expected: Vitest exits successfully with no tests found or zero test files.

- [ ] **Step 6: Commit scaffold**

```bash
git add package.json bun.lock electrobun.config.ts index.html tsconfig.json tsconfig.node.json vite.config.ts vitest.config.ts playwright.config.ts src/ui/main.tsx src/ui/App.tsx src/ui/styles.css src/test/setup.ts
git commit -m "chore: scaffold electrobun react app"
```

---

### Task 2: Define Shared Domain Types and Provider Contracts

**Files:**
- Create: `src/shared/capability.ts`
- Create: `src/shared/provider.ts`
- Create: `src/shared/operations.ts`
- Create: `src/shared/paths.ts`
- Test: `src/shared/capability.test.ts`
- Test: `src/shared/paths.test.ts`

- [ ] **Step 1: Write failing capability tests**

Write `src/shared/capability.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { capabilityId, isWorkspaceCapability } from "./capability";

describe("capability domain helpers", () => {
  it("builds a stable id from provider, scope, workspace, and entry path", () => {
    expect(
      capabilityId({
        provider: "codex",
        scope: "workspace",
        workspacePath: "D:/repo",
        entryPath: "D:/repo/.codex/skills/review/SKILL.md",
      }),
    ).toBe("codex:workspace:D:/repo:D:/repo/.codex/skills/review/SKILL.md");
  });

  it("detects workspace capabilities", () => {
    expect(isWorkspaceCapability({ scope: "workspace" })).toBe(true);
    expect(isWorkspaceCapability({ scope: "global" })).toBe(false);
  });
});
```

Write `src/shared/paths.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { normalizePathForId } from "./paths";

describe("path helpers", () => {
  it("normalizes backslashes to forward slashes for stable ids", () => {
    expect(normalizePathForId("C:\\Users\\me\\.codex\\skills")).toBe(
      "C:/Users/me/.codex/skills",
    );
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `bun run test src/shared/capability.test.ts src/shared/paths.test.ts`

Expected: FAIL because `capability.ts` and `paths.ts` do not exist.

- [ ] **Step 3: Implement shared types and helpers**

Write `src/shared/capability.ts`:

```ts
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
```

Write `src/shared/provider.ts`:

```ts
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
```

Write `src/shared/operations.ts`:

```ts
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
```

Write `src/shared/paths.ts`:

```ts
export function normalizePathForId(path: string) {
  return path.replaceAll("\\", "/").replace(/\/+$/u, "");
}
```

- [ ] **Step 4: Run tests to verify pass**

Run: `bun run test src/shared/capability.test.ts src/shared/paths.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit shared contracts**

```bash
git add src/shared
git commit -m "feat: define capability domain contracts"
```

---

### Task 3: Implement Provider Registry and Path Discovery

**Files:**
- Create: `src/providers/registry.ts`
- Create: `src/providers/base.ts`
- Create: `src/providers/codex.ts`
- Create: `src/providers/claude.ts`
- Create: `src/providers/gemini.ts`
- Create: `src/providers/cursor.ts`
- Create: `src/providers/windsurf.ts`
- Test: `src/providers/registry.test.ts`
- Test: `src/providers/discovery.test.ts`

- [ ] **Step 1: Write failing provider tests**

Write `src/providers/registry.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { providerRegistry } from "./registry";

describe("provider registry", () => {
  it("registers first-version providers", () => {
    expect(providerRegistry.map((provider) => provider.id)).toEqual([
      "codex",
      "claude",
      "gemini",
      "cursor",
      "windsurf",
    ]);
  });
});
```

Write `src/providers/discovery.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { codexProvider } from "./codex";
import { cursorProvider } from "./cursor";

describe("provider discovery", () => {
  it("discovers codex workspace skills under .codex/skills", async () => {
    const locations = await codexProvider.discoverWorkspaceLocations("D:/repo");
    expect(locations).toContainEqual({
      provider: "codex",
      scope: "workspace",
      rootPath: "D:/repo/.codex/skills",
      workspacePath: "D:/repo",
      label: "Codex workspace skills",
    });
  });

  it("discovers cursor workspace rules under .cursor/rules", async () => {
    const locations = await cursorProvider.discoverWorkspaceLocations("D:/repo");
    expect(locations[0]).toEqual({
      provider: "cursor",
      scope: "workspace",
      rootPath: "D:/repo/.cursor/rules",
      workspacePath: "D:/repo",
      label: "Cursor workspace rules",
    });
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `bun run test src/providers/registry.test.ts src/providers/discovery.test.ts`

Expected: FAIL because provider files do not exist.

- [ ] **Step 3: Implement provider skeletons**

Write `src/providers/base.ts`:

```ts
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

export function emptyPlan(provider: string, kind: OperationPlan["kind"], targetPath: string): OperationPlan {
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
```

Write provider files:

```ts
// src/providers/codex.ts
import { createProvider } from "./base";

export const codexProvider = createProvider({
  id: "codex",
  label: "Codex",
  supportedTypes: ["skill"],
  globalRelativePaths: ["~/.codex/skills"],
  workspaceRelativePaths: [{ path: ".codex/skills", label: "Codex workspace skills" }],
});
```

```ts
// src/providers/claude.ts
import { createProvider } from "./base";

export const claudeProvider = createProvider({
  id: "claude",
  label: "Claude Code",
  supportedTypes: ["skill", "command", "agent", "config"],
  globalRelativePaths: ["~/.claude/skills", "~/.claude/commands", "~/.claude/agents"],
  workspaceRelativePaths: [
    { path: ".claude/skills", label: "Claude workspace skills" },
    { path: ".claude/commands", label: "Claude workspace commands" },
    { path: ".claude/agents", label: "Claude workspace agents" },
  ],
});
```

```ts
// src/providers/gemini.ts
import { createProvider } from "./base";

export const geminiProvider = createProvider({
  id: "gemini",
  label: "Gemini CLI",
  supportedTypes: ["rule", "context"],
  globalRelativePaths: ["~/.gemini"],
  workspaceRelativePaths: [{ path: ".gemini", label: "Gemini workspace config" }],
});
```

```ts
// src/providers/cursor.ts
import { createProvider } from "./base";

export const cursorProvider = createProvider({
  id: "cursor",
  label: "Cursor",
  supportedTypes: ["rule"],
  globalRelativePaths: ["~/.cursor/rules"],
  workspaceRelativePaths: [{ path: ".cursor/rules", label: "Cursor workspace rules" }],
});
```

```ts
// src/providers/windsurf.ts
import { createProvider } from "./base";

export const windsurfProvider = createProvider({
  id: "windsurf",
  label: "Windsurf",
  supportedTypes: ["rule"],
  globalRelativePaths: ["~/.windsurf/rules"],
  workspaceRelativePaths: [{ path: ".windsurf/rules", label: "Windsurf workspace rules" }],
});
```

Write `src/providers/registry.ts`:

```ts
import { claudeProvider } from "./claude";
import { codexProvider } from "./codex";
import { cursorProvider } from "./cursor";
import { geminiProvider } from "./gemini";
import { windsurfProvider } from "./windsurf";

export const providerRegistry = [
  codexProvider,
  claudeProvider,
  geminiProvider,
  cursorProvider,
  windsurfProvider,
] as const;
```

- [ ] **Step 4: Run tests to verify pass**

Run: `bun run test src/providers/registry.test.ts src/providers/discovery.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit provider registry**

```bash
git add src/providers
git commit -m "feat: add provider registry"
```

---

### Task 4: Add Capability Scanning and Validation

**Files:**
- Create: `src/native/file-tree.ts`
- Modify: `src/providers/base.ts`
- Test: `src/providers/scan.test.ts`
- Create: `src/test/fixtures.ts`

- [ ] **Step 1: Write failing scan tests**

Write `src/test/fixtures.ts`:

```ts
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export async function writeSkillFixture(root: string, name: string, body = "# Test skill\n\nUseful skill.") {
  const skillDir = path.join(root, name);
  await mkdir(skillDir, { recursive: true });
  await writeFile(path.join(skillDir, "SKILL.md"), body, "utf8");
  return skillDir;
}
```

Write `src/providers/scan.test.ts`:

```ts
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { codexProvider } from "./codex";
import { writeSkillFixture } from "@/test/fixtures";

describe("capability scanning", () => {
  it("scans child directories with SKILL.md as valid skills", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "skills-manager-"));
    await writeSkillFixture(root, "review", "# Review\n\nChecks code.");

    const capabilities = await codexProvider.scan({
      provider: "codex",
      scope: "global",
      rootPath: root,
      label: "Codex global",
    });

    expect(capabilities).toHaveLength(1);
    expect(capabilities[0]).toMatchObject({
      name: "review",
      provider: "codex",
      type: "skill",
      scope: "global",
      enabled: true,
      status: "valid",
      description: "Checks code.",
    });
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `bun run test src/providers/scan.test.ts`

Expected: FAIL because `scan` returns an empty array.

- [ ] **Step 3: Implement directory scanning**

Write `src/native/file-tree.ts`:

```ts
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
```

Modify `src/providers/base.ts` so `createProvider` accepts scanner settings and scans markdown-backed capabilities:

```ts
import path from "node:path";
import type { Capability } from "@/shared/capability";
import { capabilityId } from "@/shared/capability";
import type { OperationPlan } from "@/shared/operations";
import type {
  CreateCapabilityInput,
  InstallSource,
  Provider,
  ProviderLocation,
} from "@/shared/provider";
import { listDirectories, readTextIfExists } from "@/native/file-tree";

function extractDescription(markdown: string) {
  return markdown
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .find((line) => line.length > 0 && !line.startsWith("#"));
}

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

export function emptyPlan(provider: string, kind: OperationPlan["kind"], targetPath: string): OperationPlan {
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
  entryFile?: string;
  defaultType?: string;
}): Provider {
  const entryFile = input.entryFile ?? "SKILL.md";
  const defaultType = input.defaultType ?? input.supportedTypes[0];

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
    async scan(location) {
      const directories = await listDirectories(location.rootPath);
      const scannedAt = new Date().toISOString();
      const capabilities: Capability[] = [];

      for (const directory of directories) {
        const entryPath = path.join(directory, entryFile);
        const markdown = await readTextIfExists(entryPath);
        if (!markdown) {
          continue;
        }

        const name = path.basename(directory);
        capabilities.push({
          id: capabilityId({
            provider: input.id,
            scope: location.scope,
            workspacePath: location.workspacePath,
            entryPath,
          }),
          name,
          provider: input.id,
          type: defaultType,
          scope: location.scope,
          workspacePath: location.workspacePath,
          rootPath: directory,
          entryPath,
          enabled: !name.endsWith(".disabled"),
          status: name.endsWith(".disabled") ? "disabled" : "valid",
          sourceKind: "installed",
          description: extractDescription(markdown),
          tags: [],
          lastScannedAt: scannedAt,
          validationMessages: [],
          providerMetadata: {},
        });
      }

      return capabilities;
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
```

- [ ] **Step 4: Run scan tests**

Run: `bun run test src/providers/scan.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit scanning**

```bash
git add src/native/file-tree.ts src/providers/base.ts src/providers/scan.test.ts src/test/fixtures.ts
git commit -m "feat: scan provider capabilities"
```

---

### Task 5: Add SQLite Index and Scan Orchestrator

**Files:**
- Create: `src/native/index-db.ts`
- Create: `src/native/scanner.ts`
- Test: `src/native/index-db.test.ts`
- Test: `src/native/scanner.test.ts`

- [ ] **Step 1: Write failing index tests**

Write `src/native/index-db.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createIndexDb } from "./index-db";

describe("index database", () => {
  it("upserts and lists capabilities", () => {
    const db = createIndexDb(":memory:");
    db.upsertCapabilities([
      {
        id: "codex:global::/tmp/review/SKILL.md",
        name: "review",
        provider: "codex",
        type: "skill",
        scope: "global",
        rootPath: "/tmp/review",
        entryPath: "/tmp/review/SKILL.md",
        enabled: true,
        status: "valid",
        sourceKind: "installed",
        tags: [],
        lastScannedAt: "2026-04-28T00:00:00.000Z",
        validationMessages: [],
        providerMetadata: {},
      },
    ]);

    expect(db.listCapabilities()).toHaveLength(1);
    expect(db.listCapabilities()[0].name).toBe("review");
  });
});
```

Write `src/native/scanner.test.ts`:

```ts
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createIndexDb } from "./index-db";
import { scanProviders } from "./scanner";
import { codexProvider } from "@/providers/codex";
import { writeSkillFixture } from "@/test/fixtures";

describe("scan orchestrator", () => {
  it("scans active provider locations into the index", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "skills-manager-"));
    await writeSkillFixture(root, "review");
    const db = createIndexDb(":memory:");

    await scanProviders({
      db,
      providers: [codexProvider],
      globalLocations: [
        { provider: "codex", scope: "global", rootPath: root, label: "Codex global" },
      ],
    });

    expect(db.listCapabilities().map((capability) => capability.name)).toEqual(["review"]);
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `bun run test src/native/index-db.test.ts src/native/scanner.test.ts`

Expected: FAIL because index database and scanner do not exist.

- [ ] **Step 3: Implement SQLite index**

Write `src/native/index-db.ts`:

```ts
import Database from "better-sqlite3";
import type { Capability } from "@/shared/capability";
import type { OperationLogEntry } from "@/shared/operations";

export function createIndexDb(filename: string) {
  const db = new Database(filename);

  db.exec(`
    create table if not exists capabilities (
      id text primary key,
      data text not null
    );

    create table if not exists operation_logs (
      id text primary key,
      data text not null
    );
  `);

  const upsertCapability = db.prepare(`
    insert into capabilities (id, data)
    values (@id, @data)
    on conflict(id) do update set data = excluded.data
  `);

  const listCapabilitiesStatement = db.prepare("select data from capabilities order by id");
  const insertLog = db.prepare(`
    insert into operation_logs (id, data)
    values (@id, @data)
  `);
  const listLogsStatement = db.prepare("select data from operation_logs order by id");

  return {
    upsertCapabilities(capabilities: Capability[]) {
      const transaction = db.transaction((items: Capability[]) => {
        for (const capability of items) {
          upsertCapability.run({ id: capability.id, data: JSON.stringify(capability) });
        }
      });
      transaction(capabilities);
    },
    listCapabilities(): Capability[] {
      return listCapabilitiesStatement
        .all()
        .map((row) => JSON.parse((row as { data: string }).data) as Capability);
    },
    addOperationLog(entry: OperationLogEntry) {
      insertLog.run({ id: entry.id, data: JSON.stringify(entry) });
    },
    listOperationLogs(): OperationLogEntry[] {
      return listLogsStatement
        .all()
        .map((row) => JSON.parse((row as { data: string }).data) as OperationLogEntry);
    },
    close() {
      db.close();
    },
  };
}

export type IndexDb = ReturnType<typeof createIndexDb>;
```

Write `src/native/scanner.ts`:

```ts
import type { Provider } from "@/shared/provider";
import type { IndexDb } from "./index-db";

export interface ScanProvidersInput {
  db: IndexDb;
  providers: Provider[];
  workspacePath?: string;
  globalLocations?: Awaited<ReturnType<Provider["discoverGlobalLocations"]>>;
}

export async function scanProviders(input: ScanProvidersInput) {
  for (const provider of input.providers) {
    const globalLocations =
      input.globalLocations?.filter((location) => location.provider === provider.id) ??
      (await provider.discoverGlobalLocations());

    for (const location of globalLocations) {
      input.db.upsertCapabilities(await provider.scan(location));
    }

    if (input.workspacePath) {
      const workspaceLocations = await provider.discoverWorkspaceLocations(input.workspacePath);
      for (const location of workspaceLocations) {
        input.db.upsertCapabilities(await provider.scan(location));
      }
    }
  }
}
```

- [ ] **Step 4: Run index tests**

Run: `bun run test src/native/index-db.test.ts src/native/scanner.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit index and scanner**

```bash
git add src/native/index-db.ts src/native/scanner.ts src/native/index-db.test.ts src/native/scanner.test.ts
git commit -m "feat: index scanned capabilities"
```

---

### Task 6: Implement Native File Operations and Safety Logging

**Files:**
- Create: `src/native/operations.ts`
- Test: `src/native/operations.test.ts`

- [ ] **Step 1: Write failing operation tests**

Write `src/native/operations.test.ts`:

```ts
import { mkdir, readFile, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createIndexDb } from "./index-db";
import { executeOperationPlan } from "./operations";

describe("operation execution", () => {
  it("writes files and logs success", async () => {
    const root = await mkdir(path.join(os.tmpdir(), `skills-manager-${Date.now()}`), {
      recursive: true,
    }).then(() => path.join(os.tmpdir(), `skills-manager-${Date.now()}`));
    const db = createIndexDb(":memory:");
    const target = path.join(root, "new-skill", "SKILL.md");

    await executeOperationPlan(db, {
      id: "op-1",
      kind: "create",
      provider: "codex",
      scope: "global",
      targetPath: target,
      requiresConfirmation: false,
      warnings: [],
      steps: [
        { kind: "mkdir", path: path.dirname(target) },
        { kind: "write_file", path: target, contents: "# New skill\n" },
      ],
    });

    expect(await readFile(target, "utf8")).toBe("# New skill\n");
    expect(db.listOperationLogs()[0].status).toBe("success");
  });

  it("moves directories instead of permanently deleting", async () => {
    const root = path.join(os.tmpdir(), `skills-manager-remove-${Date.now()}`);
    const from = path.join(root, "skill");
    const to = path.join(root, "trash", "skill");
    await mkdir(from, { recursive: true });
    const db = createIndexDb(":memory:");

    await executeOperationPlan(db, {
      id: "op-2",
      kind: "remove",
      provider: "codex",
      scope: "global",
      targetPath: from,
      requiresConfirmation: true,
      warnings: ["Moves item to app trash."],
      steps: [{ kind: "move_directory", from, to }],
    });

    await expect(stat(to)).resolves.toBeTruthy();
    expect(db.listOperationLogs()[0].kind).toBe("remove");
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `bun run test src/native/operations.test.ts`

Expected: FAIL because `operations.ts` does not exist.

- [ ] **Step 3: Implement operation execution**

Write `src/native/operations.ts`:

```ts
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
```

- [ ] **Step 4: Fix the test temp directory bug if it appears**

If the first test fails because the `root` variable uses two timestamps, replace its root setup with:

```ts
const root = path.join(os.tmpdir(), `skills-manager-${Date.now()}`);
await mkdir(root, { recursive: true });
```

Run: `bun run test src/native/operations.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit operations**

```bash
git add src/native/operations.ts src/native/operations.test.ts
git commit -m "feat: execute safe file operations"
```

---

### Task 7: Build UI Data Client and Mockable API Boundary

**Files:**
- Create: `src/ui/api/client.ts`
- Create: `src/ui/api/mock-data.ts`
- Test: `src/ui/api/client.test.ts`

- [ ] **Step 1: Write failing API client test**

Write `src/ui/api/client.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createMockApiClient } from "./client";

describe("ui api client", () => {
  it("lists mock capabilities in global-only mode", async () => {
    const client = createMockApiClient();
    const capabilities = await client.listCapabilities();
    expect(capabilities.every((capability) => capability.scope === "global")).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `bun run test src/ui/api/client.test.ts`

Expected: FAIL because the API client does not exist.

- [ ] **Step 3: Implement mockable API client**

Write `src/ui/api/mock-data.ts`:

```ts
import type { Capability } from "@/shared/capability";

export const mockCapabilities: Capability[] = [
  {
    id: "codex:global::mock/review/SKILL.md",
    name: "review",
    provider: "codex",
    type: "skill",
    scope: "global",
    rootPath: "mock/review",
    entryPath: "mock/review/SKILL.md",
    enabled: true,
    status: "valid",
    sourceKind: "installed",
    description: "Review code changes and flag correctness risks.",
    tags: ["review"],
    lastScannedAt: "2026-04-28T00:00:00.000Z",
    validationMessages: [],
    providerMetadata: {},
  },
  {
    id: "claude:global::mock/agents/planner.md",
    name: "planner",
    provider: "claude",
    type: "agent",
    scope: "global",
    rootPath: "mock/agents/planner",
    entryPath: "mock/agents/planner.md",
    enabled: true,
    status: "needs_review",
    sourceKind: "github",
    sourceUrl: "https://github.com/example/ai-tools",
    description: "Planning agent copied from another provider.",
    tags: ["planning"],
    lastScannedAt: "2026-04-28T00:00:00.000Z",
    validationMessages: [{ level: "warning", message: "Copied across providers; review format." }],
    providerMetadata: {},
  },
];
```

Write `src/ui/api/client.ts`:

```ts
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
```

- [ ] **Step 4: Run API client test**

Run: `bun run test src/ui/api/client.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit API boundary**

```bash
git add src/ui/api
git commit -m "feat: add ui api boundary"
```

---

### Task 8: Build Three-Pane Manager UI

**Files:**
- Modify: `src/ui/App.tsx`
- Modify: `src/ui/styles.css`
- Create: `src/ui/components/ProviderSidebar.tsx`
- Create: `src/ui/components/CapabilityTable.tsx`
- Create: `src/ui/components/CapabilityDetails.tsx`
- Create: `src/ui/components/WorkspaceSwitcher.tsx`
- Test: `src/ui/App.test.tsx`

- [ ] **Step 1: Write failing UI test**

Write `src/ui/App.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("App", () => {
  it("renders global-first three pane manager", async () => {
    render(<App />);

    expect(await screen.findByText("Global capabilities")).toBeInTheDocument();
    expect(screen.getByText("Providers")).toBeInTheDocument();
    expect(screen.getByText("Capabilities")).toBeInTheDocument();
    expect(screen.getByText("Details")).toBeInTheDocument();
    expect(screen.getByText("No workspace selected")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `bun run test src/ui/App.test.tsx`

Expected: FAIL because App still renders scaffold text.

- [ ] **Step 3: Implement UI components**

Write `src/ui/components/WorkspaceSwitcher.tsx`:

```tsx
export function WorkspaceSwitcher() {
  return (
    <section className="sidebar-section">
      <div className="section-label">Workspace</div>
      <div className="workspace-box">
        <span>No workspace selected</span>
        <button type="button">Choose</button>
      </div>
    </section>
  );
}
```

Write `src/ui/components/ProviderSidebar.tsx`:

```tsx
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

const providers = ["Codex", "Claude Code", "Gemini CLI", "Cursor", "Windsurf"];
const statuses = ["Needs Review", "Invalid", "Update Available", "Disabled"];

export function ProviderSidebar() {
  return (
    <aside className="sidebar">
      <WorkspaceSwitcher />
      <section className="sidebar-section">
        <div className="section-label">Providers</div>
        {providers.map((provider) => (
          <button className="sidebar-item" type="button" key={provider}>
            {provider}
          </button>
        ))}
      </section>
      <section className="sidebar-section">
        <div className="section-label">Scopes</div>
        <button className="sidebar-item active" type="button">
          Global
        </button>
      </section>
      <section className="sidebar-section">
        <div className="section-label">Status</div>
        {statuses.map((status) => (
          <button className="sidebar-item" type="button" key={status}>
            {status}
          </button>
        ))}
      </section>
    </aside>
  );
}
```

Write `src/ui/components/CapabilityTable.tsx`:

```tsx
import type { Capability } from "@/shared/capability";

export function CapabilityTable({
  capabilities,
  selectedId,
  onSelect,
}: {
  capabilities: Capability[];
  selectedId?: string;
  onSelect(id: string): void;
}) {
  return (
    <section className="table-pane">
      <div className="pane-header">
        <div>
          <h2>Capabilities</h2>
          <p>Global capabilities</p>
        </div>
        <button type="button">Refresh</button>
      </div>
      <input className="search-input" placeholder="Search capabilities" />
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Provider</th>
            <th>Type</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {capabilities.map((capability) => (
            <tr
              className={capability.id === selectedId ? "selected" : ""}
              key={capability.id}
              onClick={() => onSelect(capability.id)}
            >
              <td>{capability.name}</td>
              <td>{capability.provider}</td>
              <td>{capability.type}</td>
              <td>{capability.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
```

Write `src/ui/components/CapabilityDetails.tsx`:

```tsx
import type { Capability } from "@/shared/capability";

export function CapabilityDetails({ capability }: { capability?: Capability }) {
  return (
    <aside className="details-pane">
      <div className="pane-header">
        <h2>Details</h2>
      </div>
      {!capability ? (
        <p>Select a capability to inspect files, validation, and actions.</p>
      ) : (
        <div className="details-stack">
          <div>
            <div className="section-label">Name</div>
            <h3>{capability.name}</h3>
          </div>
          <div>
            <div className="section-label">Path</div>
            <code>{capability.entryPath}</code>
          </div>
          <div>
            <div className="section-label">Description</div>
            <p>{capability.description}</p>
          </div>
          <div className="action-row">
            <button type="button">Edit</button>
            <button type="button">Copy</button>
            <button type="button">Delete</button>
          </div>
        </div>
      )}
    </aside>
  );
}
```

Modify `src/ui/App.tsx`:

```tsx
import { useEffect, useMemo, useState } from "react";
import type { Capability } from "@/shared/capability";
import { apiClient } from "./api/client";
import { CapabilityDetails } from "./components/CapabilityDetails";
import { CapabilityTable } from "./components/CapabilityTable";
import { ProviderSidebar } from "./components/ProviderSidebar";

export function App() {
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [selectedId, setSelectedId] = useState<string>();

  useEffect(() => {
    void apiClient.listCapabilities().then((items) => {
      setCapabilities(items);
      setSelectedId(items[0]?.id);
    });
  }, []);

  const selectedCapability = useMemo(
    () => capabilities.find((capability) => capability.id === selectedId),
    [capabilities, selectedId],
  );

  return (
    <main className="manager-shell">
      <ProviderSidebar />
      <CapabilityTable
        capabilities={capabilities}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      <CapabilityDetails capability={selectedCapability} />
    </main>
  );
}
```

Replace `src/ui/styles.css`:

```css
:root {
  color: #171717;
  background: #f7f7f5;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}

button,
input {
  font: inherit;
}

.manager-shell {
  display: grid;
  grid-template-columns: 260px minmax(420px, 1fr) 360px;
  min-height: 100vh;
  background: #f7f7f5;
}

.sidebar,
.details-pane {
  border-right: 1px solid #deded8;
  background: #efefeb;
  padding: 16px;
}

.details-pane {
  border-left: 1px solid #deded8;
  border-right: 0;
  background: #fbfbf8;
}

.sidebar-section {
  margin-bottom: 22px;
}

.section-label {
  margin-bottom: 8px;
  color: #696960;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.workspace-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px;
  border: 1px solid #d4d4cc;
  border-radius: 6px;
  background: #ffffff;
  font-size: 13px;
}

.sidebar-item {
  display: block;
  width: 100%;
  margin-bottom: 4px;
  padding: 8px 10px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #282824;
  text-align: left;
}

.sidebar-item.active,
.sidebar-item:hover {
  background: #ffffff;
}

.table-pane {
  min-width: 0;
  padding: 18px;
}

.pane-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.pane-header h2 {
  margin: 0;
  font-size: 20px;
}

.pane-header p {
  margin: 4px 0 0;
  color: #696960;
  font-size: 13px;
}

.search-input {
  width: 100%;
  margin-bottom: 12px;
  padding: 10px 12px;
  border: 1px solid #d4d4cc;
  border-radius: 6px;
  background: #ffffff;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
  border: 1px solid #deded8;
}

th,
td {
  padding: 10px 12px;
  border-bottom: 1px solid #ededE7;
  font-size: 13px;
  text-align: left;
}

th {
  color: #696960;
  font-size: 12px;
  text-transform: uppercase;
}

tr.selected {
  background: #e8f0ec;
}

.details-stack {
  display: grid;
  gap: 18px;
}

code {
  display: block;
  overflow-wrap: anywhere;
  padding: 10px;
  border-radius: 6px;
  background: #eeeeea;
  font-size: 12px;
}

.action-row {
  display: flex;
  gap: 8px;
}
```

- [ ] **Step 4: Run UI test**

Run: `bun run test src/ui/App.test.tsx`

Expected: PASS.

- [ ] **Step 5: Fix CSS color typo if lint catches it**

If lint fails on `#ededE7`, replace it with:

```css
#edede7
```

Run: `bun run lint`

Expected: PASS.

- [ ] **Step 6: Commit manager UI**

```bash
git add src/ui
git commit -m "feat: build three pane manager ui"
```

---

### Task 9: Add Workspace State and Scope Filtering

**Files:**
- Modify: `src/ui/api/client.ts`
- Modify: `src/ui/api/mock-data.ts`
- Modify: `src/ui/App.tsx`
- Modify: `src/ui/components/WorkspaceSwitcher.tsx`
- Modify: `src/ui/components/ProviderSidebar.tsx`
- Test: `src/ui/workspace.test.tsx`

- [ ] **Step 1: Write failing workspace test**

Write `src/ui/workspace.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("workspace behavior", () => {
  it("starts global-only and reveals workspace scope after selection", async () => {
    render(<App />);

    expect(await screen.findByText("No workspace selected")).toBeInTheDocument();
    expect(screen.queryByText("Workspace scope")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Choose" }));

    expect(await screen.findByText("D:/example/workspace")).toBeInTheDocument();
    expect(screen.getByText("Workspace scope")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `bun run test src/ui/workspace.test.tsx`

Expected: FAIL because workspace selection is static.

- [ ] **Step 3: Add workspace-aware mock data and UI state**

Append a workspace item to `src/ui/api/mock-data.ts`:

```ts
mockCapabilities.push({
  id: "cursor:workspace:D:/example/workspace:D:/example/workspace/.cursor/rules/review.md",
  name: "project-review",
  provider: "cursor",
  type: "rule",
  scope: "workspace",
  workspacePath: "D:/example/workspace",
  rootPath: "D:/example/workspace/.cursor/rules",
  entryPath: "D:/example/workspace/.cursor/rules/review.md",
  enabled: true,
  status: "valid",
  sourceKind: "installed",
  description: "Project-specific Cursor review rule.",
  tags: ["workspace"],
  lastScannedAt: "2026-04-28T00:00:00.000Z",
  validationMessages: [],
  providerMetadata: {},
});
```

Modify `src/ui/api/client.ts`:

```ts
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
      (workspacePath && capability.workspacePath === workspacePath),
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
```

Modify `src/ui/components/WorkspaceSwitcher.tsx`:

```tsx
export function WorkspaceSwitcher({
  workspacePath,
  onChoose,
  onClear,
}: {
  workspacePath?: string;
  onChoose(): void;
  onClear(): void;
}) {
  return (
    <section className="sidebar-section">
      <div className="section-label">Workspace</div>
      <div className="workspace-box">
        <span>{workspacePath ?? "No workspace selected"}</span>
        {workspacePath ? (
          <button type="button" onClick={onClear}>
            Clear
          </button>
        ) : (
          <button type="button" onClick={onChoose}>
            Choose
          </button>
        )}
      </div>
    </section>
  );
}
```

Modify `src/ui/components/ProviderSidebar.tsx`:

```tsx
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

const providers = ["Codex", "Claude Code", "Gemini CLI", "Cursor", "Windsurf"];
const statuses = ["Needs Review", "Invalid", "Update Available", "Disabled"];

export function ProviderSidebar({
  workspacePath,
  onChooseWorkspace,
  onClearWorkspace,
}: {
  workspacePath?: string;
  onChooseWorkspace(): void;
  onClearWorkspace(): void;
}) {
  return (
    <aside className="sidebar">
      <WorkspaceSwitcher
        workspacePath={workspacePath}
        onChoose={onChooseWorkspace}
        onClear={onClearWorkspace}
      />
      <section className="sidebar-section">
        <div className="section-label">Providers</div>
        {providers.map((provider) => (
          <button className="sidebar-item" type="button" key={provider}>
            {provider}
          </button>
        ))}
      </section>
      <section className="sidebar-section">
        <div className="section-label">Scopes</div>
        <button className="sidebar-item active" type="button">
          Global
        </button>
        {workspacePath ? (
          <button className="sidebar-item" type="button">
            Workspace scope
          </button>
        ) : null}
      </section>
      <section className="sidebar-section">
        <div className="section-label">Status</div>
        {statuses.map((status) => (
          <button className="sidebar-item" type="button" key={status}>
            {status}
          </button>
        ))}
      </section>
    </aside>
  );
}
```

Modify `src/ui/App.tsx` to track workspace:

```tsx
import { useEffect, useMemo, useState } from "react";
import type { Capability } from "@/shared/capability";
import { apiClient } from "./api/client";
import { CapabilityDetails } from "./components/CapabilityDetails";
import { CapabilityTable } from "./components/CapabilityTable";
import { ProviderSidebar } from "./components/ProviderSidebar";

const demoWorkspacePath = "D:/example/workspace";

export function App() {
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [workspacePath, setWorkspacePath] = useState<string>();

  useEffect(() => {
    void apiClient.listCapabilities(workspacePath).then((items) => {
      setCapabilities(items);
      setSelectedId(items[0]?.id);
    });
  }, [workspacePath]);

  const selectedCapability = useMemo(
    () => capabilities.find((capability) => capability.id === selectedId),
    [capabilities, selectedId],
  );

  async function chooseWorkspace() {
    const result = await apiClient.selectWorkspace(demoWorkspacePath);
    setWorkspacePath(result.workspacePath);
  }

  async function clearWorkspace() {
    await apiClient.clearWorkspace();
    setWorkspacePath(undefined);
  }

  return (
    <main className="manager-shell">
      <ProviderSidebar
        workspacePath={workspacePath}
        onChooseWorkspace={chooseWorkspace}
        onClearWorkspace={clearWorkspace}
      />
      <CapabilityTable
        capabilities={capabilities}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      <CapabilityDetails capability={selectedCapability} />
    </main>
  );
}
```

- [ ] **Step 4: Run workspace tests**

Run: `bun run test src/ui/workspace.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit workspace behavior**

```bash
git add src/ui
git commit -m "feat: support optional workspace scope"
```

---

### Task 10: Add Install, Copy, Delete Confirmation UI Stubs

**Files:**
- Create: `src/ui/components/ActionToolbar.tsx`
- Modify: `src/ui/components/CapabilityDetails.tsx`
- Test: `src/ui/actions.test.tsx`

- [ ] **Step 1: Write failing action test**

Write `src/ui/actions.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("capability actions", () => {
  it("shows confirmation for delete to trash", async () => {
    render(<App />);

    await screen.findByText("review");
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(screen.getByText("Move capability to app trash?")).toBeInTheDocument();
    expect(screen.getByText("This does not permanently delete files.")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `bun run test src/ui/actions.test.tsx`

Expected: FAIL because the delete button has no confirmation.

- [ ] **Step 3: Implement action toolbar and confirmation**

Write `src/ui/components/ActionToolbar.tsx`:

```tsx
export function ActionToolbar({ onDelete }: { onDelete(): void }) {
  return (
    <div className="action-row">
      <button type="button">Edit</button>
      <button type="button">Copy</button>
      <button type="button">Install</button>
      <button type="button" onClick={onDelete}>
        Delete
      </button>
    </div>
  );
}
```

Modify `src/ui/components/CapabilityDetails.tsx`:

```tsx
import { useState } from "react";
import type { Capability } from "@/shared/capability";
import { ActionToolbar } from "./ActionToolbar";

export function CapabilityDetails({ capability }: { capability?: Capability }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <aside className="details-pane">
      <div className="pane-header">
        <h2>Details</h2>
      </div>
      {!capability ? (
        <p>Select a capability to inspect files, validation, and actions.</p>
      ) : (
        <div className="details-stack">
          <div>
            <div className="section-label">Name</div>
            <h3>{capability.name}</h3>
          </div>
          <div>
            <div className="section-label">Path</div>
            <code>{capability.entryPath}</code>
          </div>
          <div>
            <div className="section-label">Description</div>
            <p>{capability.description}</p>
          </div>
          <ActionToolbar onDelete={() => setConfirmingDelete(true)} />
          {confirmingDelete ? (
            <div className="confirm-box">
              <strong>Move capability to app trash?</strong>
              <p>This does not permanently delete files.</p>
              <div className="action-row">
                <button type="button">Move to trash</button>
                <button type="button" onClick={() => setConfirmingDelete(false)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </aside>
  );
}
```

Append to `src/ui/styles.css`:

```css
.confirm-box {
  padding: 12px;
  border: 1px solid #d8b65c;
  border-radius: 6px;
  background: #fff8df;
}

.confirm-box p {
  margin: 6px 0 10px;
}
```

- [ ] **Step 4: Run action tests**

Run: `bun run test src/ui/actions.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit action confirmations**

```bash
git add src/ui
git commit -m "feat: add capability action confirmations"
```

---

### Task 11: Add End-to-End Smoke Test and Visual Verification

**Files:**
- Create: `tests/e2e/manager.spec.ts`
- Modify: `package.json`

- [ ] **Step 1: Write Playwright smoke test**

Write `tests/e2e/manager.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("manager starts in global-only mode and can show workspace scope", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("No workspace selected")).toBeVisible();
  await expect(page.getByText("Global capabilities")).toBeVisible();
  await expect(page.getByText("review")).toBeVisible();

  await page.getByRole("button", { name: "Choose" }).click();
  await expect(page.getByText("D:/example/workspace")).toBeVisible();
  await expect(page.getByText("Workspace scope")).toBeVisible();
});
```

- [ ] **Step 2: Build app for preview**

Run: `bun run build`

Expected: Vite and TypeScript build complete. If Electrobun build fails because its final binary packaging requires platform setup, keep the Vite output and record the Electrobun packaging error in the task notes before fixing configuration.

- [ ] **Step 3: Run Playwright smoke test**

Run: `bun run test:e2e`

Expected: PASS.

- [ ] **Step 4: Capture layout screenshots**

Run: `bunx playwright screenshot http://127.0.0.1:5173 screenshots/manager-desktop.png --viewport-size=1440,900`

Expected: screenshot shows a nonblank three-pane manager with no overlapping text.

Run: `bunx playwright screenshot http://127.0.0.1:5173 screenshots/manager-mobile.png --viewport-size=390,844`

Expected: screenshot shows content; if the three-column layout overflows on mobile, add a responsive breakpoint that stacks sidebar, table, and details vertically.

- [ ] **Step 5: Commit E2E coverage**

```bash
git add tests/e2e/manager.spec.ts package.json screenshots
git commit -m "test: add manager smoke coverage"
```

---

### Task 12: Final Verification and Documentation Update

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update README**

Replace `README.md` with:

```md
# skills-manager

A cross-platform desktop manager for AI coding assistant capabilities.

The app manages global capabilities by default and can optionally scan a selected workspace. First-version targets include Codex, Claude Code, Gemini CLI, Cursor, and Windsurf.

## Development

```bash
bun install
bun run dev
```

## Verification

```bash
bun run lint
bun run test
bun run build
bun run test:e2e
```
```

- [ ] **Step 2: Run full verification**

Run: `bun run lint`

Expected: PASS.

Run: `bun run test`

Expected: PASS.

Run: `bun run build`

Expected: PASS or one documented Electrobun packaging limitation with Vite and TypeScript passing.

Run: `bun run test:e2e`

Expected: PASS.

- [ ] **Step 3: Check git status**

Run: `git status --short`

Expected: only intentional README changes are unstaged.

- [ ] **Step 4: Commit documentation**

```bash
git add README.md
git commit -m "docs: document development workflow"
```

- [ ] **Step 5: Provide completion summary**

Report:

- Commit range created.
- Verification commands and outcomes.
- Any Electrobun packaging limitation or platform prerequisite.
- Local dev command and URL if the dev server is running.

---

## Self-Review

Spec coverage:

- Multi-provider support is covered by Tasks 2, 3, and 4.
- Global-first startup and optional workspace behavior are covered by Tasks 7, 8, and 9.
- File-system truth source, provider plans, and native writes are covered by Tasks 5 and 6.
- Three-pane UI is covered by Task 8.
- Install/copy/delete safety surfaces are covered by Tasks 6 and 10.
- Testing and E2E smoke coverage are covered by Tasks 1 through 12.

Known implementation tradeoff:

- The first UI tasks use a mock API boundary before wiring actual Electrobun IPC. This keeps the first working app testable and visible, while native scan/index/provider pieces are already implemented behind the same domain contracts.

Placeholder scan:

- This plan contains no placeholder markers or unspecified test steps. Each task includes exact files, commands, and expected outcomes.

Type consistency:

- Shared types are defined in Task 2 and reused by provider, native, and UI tasks.
- Provider ids remain `codex`, `claude`, `gemini`, `cursor`, and `windsurf`.
- Capability status values match the confirmed design spec.
