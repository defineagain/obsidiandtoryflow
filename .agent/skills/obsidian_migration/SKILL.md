---
description: Guidelines for porting HTML/JS web apps into Obsidian plugins
---

# Obsidian Migration Skill

Covers the patterns and mandatory rules for migrating standalone HTML/JS applications into Obsidian plugins. Based on the successful migration of the Storyflow Editor from a browser-based HTML app to an Obsidian `ItemView`.

## Architecture Pattern

### Source → Target Mapping

| Browser Concept | Obsidian Equivalent |
|---|---|
| `<body>` contents | `ItemView.onOpen()` builds into `this.contentEl` |
| Inline `<style>` | `styles.css` in plugin root (auto-loaded by Obsidian) |
| `<script>` with global functions | Class methods on the `ItemView` subclass |
| `document.createElement()` | `container.createEl('tag', { ...opts })` |
| `document.getElementById()` | Store references as class fields during `onOpen()` |
| `element.innerHTML = ...` | **NEVER** — use `createEl()`, `createDiv()`, `setText()` |
| `onclick="fn()"` inline handlers | `element.addEventListener('click', () => ...)` |
| `fetch()` | `requestUrl()` from the Obsidian API |
| `localStorage` | `this.plugin.loadData()` / `this.plugin.saveData()` |
| Browser file download | `downloadToDisk()` helper (see file_bridge skill) |
| Browser file picker | `loadFromDisk()` helper (see file_bridge skill) |
| Vault file access | Obsidian `app.vault` API |

## Mandatory Development Guidelines

### DOM Safety (Critical)
1. **Never use `innerHTML`** — always use `createEl()`, `createDiv()`, `setText()`, `textContent`
2. **Never use `document.write()`**
3. **Never inject raw HTML strings** — construct DOM trees programmatically
4. **Sanitize any user input** before inserting into the DOM

### CSS Rules
5. **Prefix all CSS classes** with a unique plugin prefix (e.g., `storyflow-`)
6. **Use Obsidian CSS variables** for colors, fonts, spacing:
   - `var(--text-normal)`, `var(--text-muted)`, `var(--text-accent)`
   - `var(--background-primary)`, `var(--background-secondary)`
   - `var(--background-modifier-border)`, `var(--background-modifier-hover)`
   - `var(--font-interface)`, `var(--font-monospace)`, `var(--font-ui-smaller)`
   - `var(--interactive-accent)`
7. **Support dark theme** — add `.theme-dark` overrides where hardcoded colors are used
8. **Never use `!important`** unless absolutely required for specificity override
9. **Put all styles in `styles.css`** — never inline styles in TypeScript (except dynamic values)

### Plugin Structure
10. **Extend `Plugin`** for the main class in `main.ts`
11. **Extend `ItemView`** for custom views
12. **Register views** in `onload()` with `registerView()`
13. **Clean up** in `onunload()` with `detachLeavesOfType()`
14. **Use `addRibbonIcon()`** for quick access
15. **Use `addCommand()`** for command palette integration

### TypeScript
16. **Strict typing** — define interfaces for all data structures
17. **Separate concerns** — split into modules: types, view, utilities, resolution logic
18. **Export constants** (labels, defaults, groups) from a dedicated types file
19. **Use enums or union types** for item types

### File I/O
20. **Always use the dual-mode pattern** (vault + disk) — see file_bridge skill
21. **Vault writes** must use markdown wrapping with YAML frontmatter
22. **Show `Notice`** on every save/load success or failure
23. **Use `VaultFileSuggestModal`** for file selection (fuzzy search)

### Event Handling
24. **Use `addEventListener()`** — never inline `onclick` attributes
25. **Clean up listeners** when the view is closed
26. **Debounce expensive operations** (e.g., preview updates)

### Testing
27. **Always verify build** with `npm run build` after changes
28. **Test in Obsidian** — reload plugin via Community Plugins settings
29. **Test both light and dark themes**

## Migration Checklist

When porting a new HTML file:

1. [ ] Identify all DOM elements and their IDs/classes
2. [ ] Map inline styles to CSS classes, prefix with plugin name
3. [ ] Convert all `innerHTML` usage to `createEl()` calls
4. [ ] Replace global functions with class methods
5. [ ] Replace `onclick=""` with `addEventListener()`
6. [ ] Replace hardcoded colors with Obsidian CSS variables
7. [ ] Add `.theme-dark` overrides where needed
8. [ ] Replace `localStorage` with `plugin.loadData()`/`saveData()`
9. [ ] Replace `fetch()` with `requestUrl()` if needed
10. [ ] Add vault I/O alongside disk I/O (dual-mode pattern)
11. [ ] Test build: `npm run build`
12. [ ] Test in Obsidian: light theme, dark theme, mobile (if applicable)
