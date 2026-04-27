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
