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
