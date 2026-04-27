# Multi-AI Skills Manager Design

## Summary

Build a cross-platform desktop management tool for AI coding assistant capabilities. The app uses Electrobun, React, shadcn/ui, TanStack Router, TanStack Query, TanStack Table, and TanStack Form.

The product manages global capability libraries by default. Workspaces are optional: when the user selects a workspace directory, the app also scans and manages project-level capabilities for that workspace.

The first version supports:

- Codex skills.
- Claude Code skills, commands, agents, and related configuration directories.
- Gemini CLI rule and context configuration files.
- Cursor and Windsurf global and project rule files.
- Local directory imports.
- GitHub repository URL installs and updates.
- Curated source lists.
- Full create, edit, delete, enable, disable, install, copy, and update workflows.

## Goals

- Provide one professional desktop UI for managing capabilities across multiple AI coding tools.
- Treat the file system as the source of truth.
- Maintain a local index for search, filtering, status, source tracking, update checks, and UI performance.
- Support global management without requiring a workspace.
- Support optional workspace management when the user chooses a project directory.
- Make cross-provider copying possible without pretending formats were converted automatically.
- Keep destructive writes explicit, confirmable, and logged.

## Non-Goals

- Automatic semantic conversion between providers in the first version.
- Replacing each tool's native runtime or configuration behavior.
- Cloud sync or team sharing.
- A marketplace backend service.
- Permanent deletion as the default delete behavior.

## Architecture

The app is organized into four main layers.

### Electrobun Native Layer

This layer owns privileged operations:

- File system reads and writes.
- Directory selection.
- GitHub clone or archive download.
- Curated source download.
- Opening directories and files in external tools.
- Moving deleted items into the app trash directory.
- Operation logging.
- Permission and writability checks.

UI code never writes capability files directly. It asks the native layer to execute a provider-generated change plan.

### Provider Layer

Each AI tool has a provider. Providers expose a common interface:

- `discoverGlobalLocations()`
- `discoverWorkspaceLocations(workspacePath)`
- `scan(location)`
- `parse(fileTree)`
- `validate(capability)`
- `planCreate(input, target)`
- `planEdit(input, target)`
- `planInstall(source, target)`
- `planCopy(capability, target)`
- `planEnable(capability)`
- `planDisable(capability)`
- `planRemove(capability)`
- `checkUpdates(capability)`

First-version providers:

- Codex provider.
- Claude Code provider.
- Gemini CLI provider.
- Cursor provider.
- Windsurf provider.

Providers own tool-specific rules, required files, metadata extraction, enablement rules, and target-path conventions.

### Index Layer

The local index caches scan results and operation metadata. The file system remains authoritative. When an indexed item differs from disk, the next scan reconciles it.

The index stores:

- Capability metadata.
- Provider and scope.
- File paths.
- Source information.
- Validation status.
- Enabled or disabled state.
- Last scan time.
- Last file modification time.
- Update check result.
- Operation log entries.
- Recent workspace list.

SQLite is preferred for the index because filtering, sorting, operation history, and update state will grow beyond a small JSON configuration file. A small JSON settings file can still store app preferences and provider toggles.

### React UI Layer

The UI uses:

- TanStack Router for navigation.
- TanStack Query for scan, mutation, and index requests.
- TanStack Table for capability lists.
- TanStack Form for create, install, and settings forms.
- shadcn/ui for sidebar, table, dialog, sheet, tabs, badge, toast, dropdown, command palette, and form controls.

## Data Model

The unified entity is `Capability`.

Core fields:

- `id`
- `name`
- `provider`
- `type`
- `scope`
- `workspacePath`
- `rootPath`
- `entryPath`
- `enabled`
- `status`
- `sourceKind`
- `sourceUrl`
- `sourceRef`
- `version`
- `commit`
- `description`
- `tags`
- `lastScannedAt`
- `lastModifiedAt`
- `validationMessages`
- `providerMetadata`

Provider examples:

- Codex: `skill`, `global`, `workspace`.
- Claude Code: `skill`, `command`, `agent`, `config`.
- Gemini CLI: `rule`, `context`.
- Cursor: `rule`.
- Windsurf: `rule`.

Status values:

- `valid`
- `invalid`
- `disabled`
- `needs_review`
- `update_available`
- `missing`
- `unconfigured`

Cross-provider copies use status `needs_review` until the target provider validates the copied files.

## Workspace Behavior

Workspace selection is optional.

Startup behavior:

1. Load settings, provider configuration, curated sources, and recent workspaces.
2. Discover and scan global locations for enabled providers.
3. Show the global management view immediately.

Workspace behavior:

1. The user can select a workspace directory at any time.
2. The app scans project-level capability locations inside that workspace.
3. The UI then shows both Global and Workspace scopes.
4. Install and copy dialogs include Workspace targets only when a workspace is selected.
5. Clearing the workspace returns the app to the global-only view.
6. Workspace index entries are retained for history and recent switching, but hidden when that workspace is not active.

## UI Design

The app opens directly into the management interface. There is no marketing landing page.

The main layout is a three-column manager:

- Left sidebar: workspace selector, providers, scopes, sources, and status filters.
- Center pane: searchable and filterable capability table.
- Right pane: selected capability details, preview, validation, and actions.

### Left Sidebar

Sections:

- Workspace selector: none selected by default, recent workspaces available.
- Providers: Codex, Claude Code, Gemini CLI, Cursor, Windsurf.
- Scopes: Global and, when active, Workspace.
- Sources: Installed, Local Import, GitHub, Curated.
- Status: Needs Review, Invalid, Update Available, Disabled.

### Center Pane

The capability table supports:

- Search.
- Provider filter.
- Type filter.
- Scope filter.
- Status filter.
- Source filter.
- Batch enable and disable.
- Batch copy.
- Batch delete to trash.
- Manual refresh.

Columns:

- Name.
- Provider.
- Type.
- Scope.
- Status.
- Source.
- Last modified.
- Update state.

### Right Pane

The details pane shows:

- Name, provider, type, scope, and status.
- Description and tags.
- Source and version information.
- Full paths.
- Provider-specific metadata.
- File tree.
- Markdown and code preview.
- Validation messages.
- Operation history for the selected capability.

Actions:

- Create.
- Edit.
- Enable.
- Disable.
- Copy.
- Install or update.
- Delete to trash.
- Open directory.
- Open file in external editor.

## Workflows

### Scan

1. User triggers refresh or app starts.
2. Enabled providers discover configured global locations.
3. If a workspace is active, providers discover workspace locations.
4. Providers scan and parse files.
5. Providers validate parsed capabilities.
6. The index is updated.
7. UI queries invalidate and refresh.

### Install

Supported sources:

- Local directory.
- GitHub repository URL.
- Curated source entry.

Flow:

1. User chooses source.
2. User chooses provider and target scope.
3. Provider validates the source.
4. Provider creates an install plan.
5. Native layer checks conflicts and permissions.
6. User confirms if the operation writes to global paths or overwrites files.
7. Native layer writes files.
8. Scan refreshes the target location.

### Copy

Same-provider copy:

- Provider creates a normal copy plan.
- The copied item is validated as a normal capability.

Cross-provider copy:

- Native layer copies files to the chosen target directory.
- The copied item is marked `needs_review`.
- The target provider validates what it can.
- The UI clearly labels it as not converted.

### Create and Edit

Create:

- User selects provider, type, scope, and name.
- Provider supplies required fields and templates.
- Native layer writes the initial files.
- Scan refreshes the target.

Edit:

- Simple edits can happen in-app.
- Complex file edits can be opened in the external editor.
- Saving triggers provider validation and index refresh.

### Enable and Disable

Providers define how enablement works. Examples include renaming, moving, adding metadata, or modifying a known config file.

The UI shows the exact planned change before applying when enablement affects files outside the capability root.

### Delete

Delete means move to app trash by default.

The operation records:

- Original path.
- Trash path.
- Provider.
- Scope.
- Time.
- Result.

Permanent deletion is not part of the default first-version flow.

### Update

GitHub and curated sources can check for updates.

Local directory sources only compare last modification time and do not claim remote update availability.

## Error Handling

- Missing provider path: show provider as unconfigured or not discovered.
- Unreadable path: show scan error with the path.
- Unwritable path: disable write actions and show the target path.
- Invalid format: display the item with status `invalid`.
- Cross-provider copy: display status `needs_review`.
- GitHub or curated install failure: roll back partial files and log the failure.
- Overwrite conflict: reject by default and require explicit confirmation.
- Delete failure: keep the item in place and log the failed operation.
- Index mismatch: rescan from disk and update the index.

## Safety Rules

- File system remains the source of truth.
- Native layer executes all writes.
- Provider plans must be reviewable before write execution.
- Global writes require confirmation.
- Workspace writes show the target workspace path.
- Overwrites require explicit confirmation.
- Deletes move to app trash by default.
- All write operations create an operation log entry.

## Testing

### Provider Unit Tests

- Global path discovery.
- Workspace path discovery.
- Metadata parsing.
- Validation.
- Enable and disable planning.
- Install and copy planning.

### File Operation Tests

- Local install.
- GitHub install with mocked download.
- Curated install with mocked source list.
- Copy within provider.
- Copy across provider.
- Conflict detection.
- Delete to trash.
- Rollback on failed install.

### Index Tests

- Scan result upsert.
- Missing item reconciliation.
- Status filtering.
- Recent workspace persistence.
- Operation log persistence.

### UI Tests

- Sidebar provider filtering.
- Scope filtering with and without workspace.
- Table search and sorting.
- Details pane rendering.
- Disabled actions for invalid or unwritable targets.
- Dialog confirmation behavior.

### End-to-End Smoke Tests

- Launch the app into global-only view.
- Scan mocked global provider directories.
- Select a workspace and scan project-level capabilities.
- Install a local capability.
- Copy a capability across providers and verify `needs_review`.
- Delete a capability to app trash.

## Implementation Notes

- Use a provider registry so new AI coding tools can be added without changing UI routing.
- Keep provider-specific UI in detail subpanels instead of separate top-level applications.
- Prefer compact, utilitarian UI density suitable for repeated management tasks.
- Do not block the app startup on workspace selection.
- Do not claim cross-provider conversion until a dedicated conversion design exists.
