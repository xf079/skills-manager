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
