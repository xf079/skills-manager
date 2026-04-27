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
