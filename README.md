# skills-manager

A cross-platform desktop manager for AI coding assistant capabilities.

The app manages global capabilities by default and can optionally scan a selected workspace. First-version targets include Codex, Claude Code, Gemini CLI, Cursor, and Windsurf.

## Development

```bash
bun install
bun run dev
```

Use `bun run dev:app` to launch the Electrobun shell during desktop integration work.

## Verification

```bash
bun run lint
bun run test
bun run build
bun run test:e2e
```

`bun run build` runs TypeScript, Vite, and Electrobun packaging. On a fresh machine Electrobun may need to download its platform CLI before packaging can complete.
