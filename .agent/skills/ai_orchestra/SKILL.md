---
description: Wildcard resolution, prompt building, and config marker parsing for the Storyflow Editor
---

# AI Orchestra Skill

Handles the resolution engine that expands shortcuts (`@triggers`, `#configs`, `$wildcards`, `#poses`) and generates Draw Things pipeline instruction strings.

## Key Files

- **[resolution.ts](file:///Users/daniel/Documents/obsidian-plugin-sandbox/src/resolution.ts)** — All resolution functions
- **[types.ts](file:///Users/daniel/Documents/obsidian-plugin-sandbox/src/types.ts)** — Item type definitions and constants

## Shortcut Types

| Prefix | Type | Example | Resolution Behavior |
|---|---|---|---|
| `@` | Prompt Trigger | `@hero` → `brave knight` | Direct text substitution, iterative |
| `#` | Config Shortcut | `#wan_i2v` → `{"steps": 25, ...}` | Direct text substitution, iterative |
| `#` | Pose Shortcut | `#armsup` → `{"joints": [...]}` | Direct text substitution, iterative |
| `$` | Wildcard | `$sky` → random of `blue sky\|dawn\|sunset` | Random or indexed (`$sky[2]` → `dawn`) |

## Resolution Functions

### `resolvePromptTriggers(text, triggers)`
- Iteratively replaces all `@key` occurrences with their values
- Loops until no more replacements occur (handles nested triggers)
- Used for `prompt` and `negPrompt` items only

### `resolveConfigShortcuts(text, shortcuts)`
- Same iterative pattern for `#key` in config items
- Allows nested config shortcuts (e.g., `#base` contains `#lora`)

### `resolvePoseJSONShortcuts(text, shortcuts)`
- Same iterative pattern for `#key` in poseJSON items
- Separate namespace from config shortcuts

### `resolveWildcardShortcuts(text, wildcards)`
- Pattern: `$key` → random option, `$key[N]` → specific option (1-indexed)
- Options are pipe-delimited: `"blue sky|dawn|sunset"`
- Uses regex: `(\$[a-zA-Z0-9_]+)(\[\d+\])?`
- Iterative — wildcards can reference other wildcards

## Pipeline Instruction Generation

`generateInstructionString(items, triggers, configSC, poseSC, wildcardSC)` produces the final Draw Things pipeline JSON array.

### Item Type → JSON Mapping

| Category | Types | JSON Format |
|---|---|---|
| Text (resolved) | `prompt`, `negPrompt` | `{"prompt": "resolved text"}` |
| Text (raw) | `note` | `{"note": "raw text"}` |
| Config (resolved) | `config` | `{"config": resolved_json}` |
| Pose (resolved) | `poseJSON` | `{"poseJSON": resolved_json}` |
| Numeric | `frames`, `moodboardRemove` | `{"frames": 5}` |
| JSON object | `moveScale`, `adaptSize`, `xlMagic`, `loop`, `moodboardWeights`, `maskBody`, `inpaintTools` | `{"moveScale": {json}}` |
| String path | `canvasSave`, `canvasLoad`, `loopLoad`, `loopSave`, `moodboardAdd`, `loopAddMB`, `maskLoad`, `maskAsk`, `askZoom` | `{"canvasLoad": "path"}` |
| Boolean flag | Everything else | `{"faceZoom": true}` |

### Output Format
```json
[
{"prompt": "resolved prompt text"},
{"config": {"steps": 25}},
{"frames": 5},
{"end": true}
]
```

## Wildcard Script Import/Export

The plugin can interoperate with Draw Things wildcard scripts:

### Import Logic (`parseWildcardText`)
- Parses `@name := { value }` definitions
- Single-option wildcards → imported as **Prompt Triggers** (`@key`)
- Multi-option wildcards → imported as **Wildcards** (`$key`)
- `#name := { json }` → imported as **Config Shortcuts**
- `PROMPT: [ shot1 | shot2 ]` → imported as individual prompt items

### Export Logic (`buildWildcardOutput`)
- Converts config/pose shortcuts back to `#key := { json }` format
- Converts prompt triggers to `@key := { value }` format
- Converts wildcards (`$key`) to `@key := { option1 | option2 }` format
- Appends `PROMPT: [ prompt1 | prompt2 ]` from prompt items
