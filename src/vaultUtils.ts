import { App, FuzzySuggestModal, TFile, Notice } from 'obsidian';

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

/** Folder constants for organized vault storage */
export const STORYFLOW_FOLDERS = {
  root: 'Storyflow',
  projects: 'Storyflow/projects',
  exports: 'Storyflow/exports',
  configs: 'Storyflow/configs',
} as const;

/** Ensure a folder path exists in the vault, creating it if needed */
export async function ensureFolder(app: App, path: string): Promise<void> {
  const folder = app.vault.getAbstractFileByPath(path);
  if (!folder) {
    await app.vault.createFolder(path);
  }
}

/**
 * Write a file to the vault, creating or updating as needed.
 * Ensures the parent folder exists.
 */
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
