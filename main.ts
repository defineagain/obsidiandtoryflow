import { Plugin } from 'obsidian';
import { StoryflowView, VIEW_TYPE_STORYFLOW } from './src/StoryflowView';
import { StoryflowSettings, DEFAULT_SETTINGS } from './src/types';

export default class StoryflowPlugin extends Plugin {
  settings: StoryflowSettings;

  async onload(): Promise<void> {
    await this.loadSettings();

    this.registerView(VIEW_TYPE_STORYFLOW, (leaf) => new StoryflowView(leaf, this));

    // Ribbon icon
    this.addRibbonIcon('film', 'Open Storyflow editor', () => {
      this.activateView();
    });

    // Command
    this.addCommand({
      id: 'open-storyflow-editor',
      name: 'Open Storyflow editor',
      callback: () => this.activateView(),
    });
  }

  onunload(): void {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_STORYFLOW);
  }

  async activateView(): Promise<void> {
    const existing = this.app.workspace.getLeavesOfType(VIEW_TYPE_STORYFLOW);
    if (existing.length > 0) {
      this.app.workspace.revealLeaf(existing[0]);
      return;
    }

    const leaf = this.app.workspace.getRightLeaf(false);
    if (leaf) {
      await leaf.setViewState({ type: VIEW_TYPE_STORYFLOW, active: true });
      this.app.workspace.revealLeaf(leaf);
    }
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}
