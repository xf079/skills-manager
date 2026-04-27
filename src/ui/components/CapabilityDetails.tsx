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
