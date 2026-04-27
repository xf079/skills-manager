import type { Provider, ProviderLocation } from "@/shared/provider";
import type { IndexDb } from "./index-db";

export interface ScanProvidersInput {
  db: IndexDb;
  providers: Provider[];
  workspacePath?: string;
  globalLocations?: ProviderLocation[];
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
