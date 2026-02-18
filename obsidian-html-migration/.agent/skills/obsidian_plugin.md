---
name: Obsidian Plugin Development
description: Comprehensive guide to the 27 Mandatory Obsidian Development Guidelines for security, performance, and UX.
---

# Obsidian Plugin Development: The 27 Rules

You strictly adhere to these rules. Any violation requires immediate correction.

## Security & Privacy (Highest Priority)
**Rule 21 & 25: NO innerHTML**
- **Violation**: `el.innerHTML = "<span>" + userInput + "</span>"`
- **Fix**: `el.createEl("span", { text: userInput })`
- **Why**: Prevents XSS attacks from malicious notes.

**Rule 22: No Unauthorized Telemetry**
- **Requirement**: Must be opt-in. Explicit user consent required for any data egress.

**Rule 23: Regex Safety**
- **Violation**: using Lookbehind `/(?<=...)`
- **Why**: Breaks on older iOS webkit versions.

## Resource Management
**Rule 6: Event Cleanup**
- **Requirement**: Use `this.registerEvent(...)`
- **Why**: Prevents memory leaks when plugin is disabled.

**Rule 7: Interval Management**
- **Requirement**: Use `this.registerInterval(...)`
- **Why**: Ensures timers stop when plugin unloads.

**Rule 16: Background Processing**
- **Requirement**: Use `Vault.process()` for modifying files.
- **Why**: Prevents race conditions during sync.

**Rule 20: No Sync on Main Thread**
- **Violation**: `fs.readFileSync` (unless widely accepted as fast/necessary at startup, but generally avoid).
- **Fix**: Use async `vault.read()`.

## User Interface & UX
**Rule 11: Sentence Case**
- **Requirement**: "Open daily note" NOT "Open Daily Note".
- **Why**: Matches native UI (Apple Human Interface Guidelines style).

**Rule 13: No Default Hotkeys**
- **Requirement**: Definitions in `manifest.json` must not set default hotkeys.
- **Why**: Conflicts to user custom setups.

**Rule 14: Use Lucide Icons**
- **Requirement**: Use built-in icon names (e.g., `calendar`, `file-text`).

## Accessibility (A11y)
**Rule 24: Keyboard Navigation**
- **Requirement**: All interactive elements must be focusable (`tabindex="0"` if custom div) and usable via Enter/Space.

**Rule 25: ARIA Labels**
- **Requirement**: Icon-only buttons must have `aria-label="Description"`.

**Rule 27: Touch Targets**
- **Requirement**: Minimum 44x44px clickable area on mobile.

## Coding Best Practices
**Rule 10: No Prototype Pollution**
- **Violation**: `String.prototype.myFunc = ...`
- **Why**: Destabilizes the entire app and other plugins.

**Rule 18: Use Editor API**
- **Requirement**: Modify open files via `Editor` (Transaction), not `Vault.modify` if possible, to support Undo/Redo history.
