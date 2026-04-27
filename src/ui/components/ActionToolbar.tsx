export function ActionToolbar({ onDelete }: { onDelete(): void }) {
  return (
    <div className="action-row">
      <button type="button">Edit</button>
      <button type="button">Copy</button>
      <button type="button">Install</button>
      <button type="button" onClick={onDelete}>
        Delete
      </button>
    </div>
  );
}
