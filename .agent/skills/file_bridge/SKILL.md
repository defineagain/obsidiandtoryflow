---
description: Vault file I/O, markdown serialization, and disk helpers for the Storyflow Editor plugin
---

# File Bridge Skill

Manages all file I/O for the Storyflow Editor plugin: vault CRUD, markdown wrapping/parsing, and browser-based disk helpers.

## Key Files

- **[vaultUtils.ts](file:///Users/daniel/Documents/obsidian-plugin-sandbox/src/vaultUtils.ts)** — All I/O logic
- **[StoryflowView.ts](file:///Users/daniel/Documents/obsidian-plugin-sandbox/src/StoryflowView.ts)** — Consumes vault/disk functions (lines 702–921)

## Vault Folder Structure

All vault files are stored under a `Storyflow/` root folder:

```
Storyflow/
├── projects/    # .md files wrapping project JSON
├── exports/     # Pipeline and wildcard exports
└── configs/     # Config/pose shortcut exports
```

These paths are defined in `STORYFLOW_FOLDERS` in `vaultUtils.ts`.

## Markdown Serialization Format

Every vault file uses this structure:

```markdown
---
storyflow: "project"     # Type: project | pipeline | wildcard | config
name: "My Project"       # Optional
project: "My Project"    # Optional
created: "2026-02-18..."  # ISO timestamp
---

```json
{ ... actual content ... }
```​
```

### Writing

Use `wrapAsMarkdown(frontmatter, content, lang)`:
- `frontmatter`: Object with `storyflow` type tag and optional metadata
- `content`: Raw string (JSON, pipeline text, etc.)
- `lang`: Code fence language (`json`, `storyflow-pipeline`, `storyflow-wildcard`, `storyflow-config`)

### Reading

Use `parseStoryflowMarkdown(md)`:
- Returns `{ frontmatter: Record<string, string>, content: string }` or `null`
- Extracts YAML frontmatter and first fenced code block content
- Strips surrounding quotes from YAML values

## Vault Helpers

| Function | Purpose |
|---|---|
| `ensureFolder(app, path)` | Recursively create folder path in vault |
| `writeVaultFile(app, path, content)` | Create or update a vault file, shows Notice |
| `VaultFileSuggestModal` | Fuzzy file picker filtered by extension |

## Disk Helpers (Browser APIs)

| Function | Purpose |
|---|---|
| `downloadToDisk(filename, content, mimeType)` | Trigger browser file download |
| `loadFromDisk(accept, callback)` | Open browser file picker, return content |

## Dual-Mode I/O Pattern

Every operation in `StoryflowView.ts` has paired methods:

| Operation | Vault Method | Disk Method |
|---|---|---|
| Save Project | `saveProjectVault()` | `saveProjectDisk()` |
| Load Project | `loadProjectVault()` | `loadProjectDisk()` |
| Export Pipeline | `exportPipelineVault()` | `exportPipelineDisk()` |
| Export Wildcard | `exportWildcardVault()` | `exportWildcardDisk()` |
| Import Wildcard | `importWildcardVault()` | `importWildcardDisk()` |
| Export Configs | `exportConfigPoseVault()` | `exportConfigPoseDisk()` |
| Import Configs | `importConfigPoseVault()` | `importConfigPoseDisk()` |

### Rules for Adding New I/O Operations

1. Always create **both** vault and disk variants
2. Vault variant must use `wrapAsMarkdown()` for writes and `parseStoryflowMarkdown()` for reads
3. Vault variant saves to the appropriate `STORYFLOW_FOLDERS` subfolder
4. Disk variant uses `downloadToDisk()` or `loadFromDisk()`
5. Both must show an Obsidian `Notice` on success/failure
6. Add the new pair to `buildProjectControls()` in the `groups` array
