---
description: how to build the Storyflow Editor plugin
---

# Build Workflow

## Development (watch mode)
// turbo
1. Run the dev build with file watching:
```bash
cd /Users/daniel/Documents/obsidian-plugin-sandbox && npm run dev
```

## Production build
// turbo
1. Run the full production build (TypeScript type-check + esbuild):
```bash
cd /Users/daniel/Documents/obsidian-plugin-sandbox && npm run build
```

## What it does

- **`npm run dev`**: Runs `esbuild.config.mjs` in watch mode — outputs `main.js` to the project root. Obsidian reads this file directly.
- **`npm run build`**: Runs `tsc -noEmit -skipLibCheck` first (type-check only, no emit), then runs `esbuild.config.mjs production` (minified output).

## Output files

| File | Purpose |
|---|---|
| `main.js` | Compiled plugin code (loaded by Obsidian) |
| `manifest.json` | Plugin metadata |
| `styles.css` | Plugin styles |

## Reloading in Obsidian

After a build, reload the plugin in Obsidian:
1. Open **Settings → Community plugins**
2. Find **Storyflow editor** and click the reload icon (↻)
3. Or: close and reopen Obsidian

## Troubleshooting

### `EPERM: operation not permitted` on `node_modules`

This means `node_modules` has corrupted permissions. **Do not use `chmod`** (it's deny-listed). Instead:

// turbo
```bash
cd /Users/daniel/Documents/obsidian-plugin-sandbox && rm -r node_modules && npm install
```

Then retry the build. See `.agent/skills/terminal_constraints/SKILL.md` for more workarounds.
