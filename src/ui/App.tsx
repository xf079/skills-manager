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
