import { App, FuzzySuggestModal, TFile, Notice } from 'obsidian';

// ═══════════════════════════════════════
// VAULT FILE SUGGEST MODAL
// ═══════════════════════════════════════

/**
 * Modal that lets the user pick a file from the vault, filtered by extension.
 */
export class VaultFileSuggestModal extends FuzzySuggestModal<TFile> {
  private files: TFile[];
  private onChoose: (file: TFile) => void;

  constructor(app: App, extensions: string[], onChoose: (file: TFile) => void) {
    super(app);
    this.onChoose = onChoose;
    this.files = app.vault.getFiles().filter(f =>
      extensions.some(ext => f.extension === ext)
    );
    this.setPlaceholder(`Select a file (${extensions.join(', ')})`);
  }

  getItems(): TFile[] {
    return this.files;
  }

  getItemText(item: TFile): string {
    return item.path;
  }

  onChooseItem(item: TFile): void {
    this.onChoose(item);
  }
}

// ═══════════════════════════════════════
// FOLDER CONSTANTS
// ═══════════════════════════════════════

export const STORYFLOW_FOLDERS = {
  root: 'Storyflow',
  projects: 'Storyflow/projects',
  exports: 'Storyflow/exports',
  configs: 'Storyflow/configs',
} as const;

// ═══════════════════════════════════════
// VAULT HELPERS
// ═══════════════════════════════════════

/** Ensure a folder path exists in the vault, creating parent folders as needed */
export async function ensureFolder(app: App, path: string): Promise<void> {
  const parts = path.split('/');
  let current = '';
  for (const part of parts) {
    current = current ? `${current}/${part}` : part;
    if (!app.vault.getAbstractFileByPath(current)) {
      await app.vault.createFolder(current);
    }
  }
}

/** Write a file to the vault, creating or updating as needed */
export async function writeVaultFile(app: App, filePath: string, content: string): Promise<void> {
  const folderPath = filePath.substring(0, filePath.lastIndexOf('/'));
  if (folderPath) {
    await ensureFolder(app, folderPath);
  }
  const existing = app.vault.getAbstractFileByPath(filePath);
  if (existing && existing instanceof TFile) {
    await app.vault.modify(existing, content);
    new Notice(`Updated: ${filePath}`);
  } else {
    await app.vault.create(filePath, content);
    new Notice(`Created: ${filePath}`);
  }
}

// ═══════════════════════════════════════
// MARKDOWN WRAP / PARSE
// ═══════════════════════════════════════

export interface StoryflowFrontmatter {
  storyflow: string;       // 'project' | 'pipeline' | 'wildcard' | 'config'
  name?: string;
  project?: string;
  created?: string;
}

/** Wrap content in a markdown file with YAML frontmatter and a fenced code block */
export function wrapAsMarkdown(
  frontmatter: StoryflowFrontmatter,
  content: string,
  lang = 'json',
): string {
  const yamlLines = ['---'];
  for (const [key, val] of Object.entries(frontmatter)) {
    if (val !== undefined) yamlLines.push(`${key}: "${val}"`);
  }
  yamlLines.push('---', '');
  yamlLines.push(`\`\`\`${lang}`);
  yamlLines.push(content);
  yamlLines.push('```', '');
  return yamlLines.join('\n');
}

/**
 * Parse a Storyflow markdown file, extracting the code block content.
 * Returns the raw content string inside the first fenced code block.
 */
export function parseStoryflowMarkdown(md: string): { frontmatter: Record<string, string>; content: string } | null {
  // Parse YAML frontmatter
  const fmMatch = md.match(/^---\n([\s\S]*?)\n---/);
  const frontmatter: Record<string, string> = {};
  if (fmMatch) {
    for (const line of fmMatch[1].split('\n')) {
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0) {
        const key = line.substring(0, colonIdx).trim();
        let val = line.substring(colonIdx + 1).trim();
        // Strip surrounding quotes
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        frontmatter[key] = val;
      }
    }
  }

  // Extract first code block content
  const codeMatch = md.match(/```\w*\n([\s\S]*?)```/);
  if (!codeMatch) return null;

  return { frontmatter, content: codeMatch[1].trim() };
}

// ═══════════════════════════════════════
// DISK I/O HELPERS (Browser APIs)
// ═══════════════════════════════════════

/** Trigger a browser file download */
export function downloadToDisk(filename: string, content: string, mimeType = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  new Notice(`Downloaded: ${filename}`);
}

/** Open a browser file picker and return the file content via callback */
export function loadFromDisk(accept: string, callback: (filename: string, content: string) => void): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = accept;
  input.addEventListener('change', (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = String(evt.target?.result || '');
      callback(file.name, content);
    };
    reader.readAsText(file);
  });
  input.click();
}
