---
name: Migration Skill
description: Expert capability for refactoring legacy HTML/JS/CSS applications into native Obsidian plugins.
---

# Migration Skill: Browser to Vault

This skill guides the agent through the process of converting a standalone web application into an Obsidian plugin.

## 1. Structural Mapping

| Browser Concept | Obsidian Equivalent | Notes |
| :--- | :--- | :--- |
| `index.html` | `ItemView` (for panels) or `Modal` (for popups) | Never use `innerHTML`. Use `createEl`. |
| `styles.css` | `styles.css` | Scope all CSS with `.your-plugin-class` to avoid vault conflicts. |
| `script.js` | `main.ts` (Plugin Class) | move global variables to Class properties. |
| `localStorage` | `Plugin.loadData()` / `saveData()` | Async operations. Requires `await`. |
| `fetch()` | `requestUrl()` | Bypasses CORS issues in Obsidian. |
| `document.getElementById` | `this.containerEl.querySelector` | Scoped to the view container. |

## 2. Refactoring Workflow

### Step 1: Component Extraction

Analyze the HTML. Identify likely components.

- **Static Content**: Move to `onOpen()`.
- **Dynamic Content**: Create render functions (e.g., `renderTaskList()`).

### Step 2: State Management

Locate all `var` or `let` globals in the legacy JS.

- Move them to the `Plugin` class or a dedicated `State` interface.
- Replace `localStorage.getItem` with `this.settings` access.

### Step 3: API Replacement

Scan for `fetch` calls.

- Replace with:

```typescript
const response = await requestUrl({
    url: '...',
    method: 'GET'
});
// process response.json or response.text
```

### Step 4: DOM Safety (Critical)

**FORBIDDEN**: `element.innerHTML = '<div>' + data + '</div>'`
**REQUIRED**:

```typescript
const div = container.createEl('div');
div.setText(data);
// or
div.createEl('span', { text: data, cls: 'my-class' });
```

## 3. Implementation Checklist

- [ ] `main.ts` created with `Plugin` extension.
- [ ] `manifest.json` matches ID folder name.
- [ ] Styles are scoped.
- [ ] No `innerHTML` usage.
- [ ] No `console.log` in production (use `new Notice()`).
