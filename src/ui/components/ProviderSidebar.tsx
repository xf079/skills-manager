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
