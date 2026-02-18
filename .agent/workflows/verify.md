---
description: how to verify changes to the Storyflow Editor plugin
---

# Verify Workflow

Run this after every code change to confirm the plugin works correctly.

## Step 1 — TypeScript compile check
// turbo
```bash
cd /Users/daniel/Documents/obsidian-plugin-sandbox && npx tsc -noEmit -skipLibCheck
```
Expected: No output (clean compile). Any errors must be fixed before proceeding.

## Step 2 — Production build
// turbo
```bash
cd /Users/daniel/Documents/obsidian-plugin-sandbox && npm run build
```
Expected: Clean exit with no errors.

## Step 3 — Manual UI verification

Reload the plugin in Obsidian, then verify:

1. [ ] Plugin appears in ribbon bar (🎬 icon)
2. [ ] Clicking ribbon icon opens the Storyflow Editor view
3. [ ] All 4 tabs load: Prompt Triggers, Config Shortcuts, Wildcards, JSON Poses
4. [ ] Can add/edit/delete items in each tab
5. [ ] Item drag-and-drop reordering works
6. [ ] Instruction bar shows all item type buttons
7. [ ] Preview pane updates when items change
8. [ ] Project save/load works (both vault and disk)
9. [ ] Pipeline export works (both vault and disk)
10. [ ] Wildcard export/import works (both vault and disk)
11. [ ] Config export/import works (both vault and disk)
12. [ ] Clipboard copy works
13. [ ] Light theme renders correctly
14. [ ] Dark theme renders correctly
