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
