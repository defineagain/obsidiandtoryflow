---
description: how to test the export pipeline for Storyflow Editor
---

# Export Workflow

Test the full export pipeline to confirm interoperability with Draw Things.

## Step 1 — Create a test project

In the Storyflow Editor view:
1. Set project name to `test_export`
2. Add at least 1 Prompt Trigger (e.g., `@hero` → `brave knight wielding a sword`)
3. Add at least 1 Config Shortcut (e.g., `#base` → `{"steps": 25, "width": 1024}`)
4. Add at least 1 Wildcard (e.g., `$sky` → `blue sky|golden dawn|fiery sunset`)

## Step 2 — Add prompt items

1. Add a Prompt item: `@hero standing under the $sky`
2. Add a Config item: `#base`
3. Add a Frames item: value `5`
4. Add an End item

## Step 3 — Verify preview

The preview pane should show a resolved JSON array like:
```json
[
{"prompt": "brave knight wielding a sword standing under the golden dawn"},
{"config": {"steps": 25, "width": 1024}},
{"frames": 5},
{"end": true}
]
```

The wildcard (`$sky`) should resolve to a random option each time.

## Step 4 — Test all export paths

| Action | Expected Result |
|---|---|
| **Save → Vault** | Creates `Storyflow/projects/test_export.md` with YAML frontmatter |
| **Save → Disk** | Downloads `test_export.json` |
| **Pipeline → Vault** | Creates `Storyflow/exports/test_export_pipeline.md` |
| **Pipeline → Disk** | Downloads `test_export_pipeline.txt` |
| **Wildcard → Vault** | Creates `Storyflow/exports/test_export_wildcard.md` |
| **Wildcard → Disk** | Downloads `test_export_wildcard.txt` |
| **Configs → Vault** | Creates `Storyflow/configs/test_export_configs.md` |
| **Configs → Disk** | Downloads `test_export_configs.txt` |
| **Clipboard** | Copies pipeline JSON to clipboard |

## Step 5 — Test import roundtrip

1. New Project (clears state)
2. **Load ← Vault** → select `Storyflow/projects/test_export.md`
3. Verify all items, triggers, configs, and wildcards restore correctly
4. Preview should match the original output

## Step 6 — Validate Draw Things compatibility

Copy the pipeline output and paste into Draw Things script prompt field.
Verify the instruction string is accepted and processed correctly.
