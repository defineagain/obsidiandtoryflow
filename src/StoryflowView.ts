import { ItemView, WorkspaceLeaf, Notice, TFile } from 'obsidian';
import {
  VaultFileSuggestModal, STORYFLOW_FOLDERS, writeVaultFile,
  wrapAsMarkdown, parseStoryflowMarkdown, downloadToDisk, loadFromDisk,
} from './vaultUtils';
import type StoryflowPlugin from '../main';
import {
  StoryflowItem, StoryflowItemType, StoryflowProject,
  TYPE_LABELS, DEFAULT_ITEM_VALUES, BUTTON_STYLES,
  BUTTON_LABELS, BUTTON_GROUPS,
} from './types';
import {
  resolvePromptTriggers, resolveConfigShortcuts,
  resolveWildcardShortcuts, resolvePoseJSONShortcuts,
  generateInstructionString,
} from './resolution';

export const VIEW_TYPE_STORYFLOW = 'storyflow-view';

export class StoryflowView extends ItemView {
  plugin: StoryflowPlugin;

  // State
  promptTriggers: Record<string, string> = {};
  configShortcuts: Record<string, string> = {};
  poseJSONShortcuts: Record<string, string> = {};
  wildcardShortcuts: Record<string, string> = {};

  // DOM refs
  private promptListEl: HTMLElement;
  private previewEl: HTMLElement;
  private projectNameInput: HTMLInputElement;
  private triggerListEl: HTMLElement;
  private configListEl: HTMLElement;
  private wildcardListEl: HTMLElement;
  private poseListEl: HTMLElement;

  // Drag state
  private draggedEl: HTMLElement | null = null;
  private dropIndicator: HTMLElement;

  constructor(leaf: WorkspaceLeaf, plugin: StoryflowPlugin) {
    super(leaf);
    this.plugin = plugin;
    this.dropIndicator = createDiv({ cls: 'storyflow-drop-indicator' });
  }

  getViewType(): string { return VIEW_TYPE_STORYFLOW; }
  getDisplayText(): string { return 'Storyflow editor'; }
  getIcon(): string { return 'film'; }

  async onOpen(): Promise<void> {
    const container = this.contentEl;
    container.empty();
    container.addClass('storyflow-container');

    // Header
    const header = container.createDiv({ cls: 'storyflow-header' });
    header.createEl('h1', { text: 'Storyflow Editor' });

    // Tabs
    this.buildTabs(container);

    // Prompt list
    this.promptListEl = container.createDiv({ cls: 'storyflow-prompt-list', attr: { id: 'storyflow-promptList' } });
    this.initDragAndDrop();

    // Add-item buttons bar
    this.buildInstructionBar(container);

    // Project controls
    this.buildProjectControls(container);

    // Preview
    const prevSection = container.createDiv({ cls: 'storyflow-section' });
    const prevHeader = prevSection.createDiv({ cls: 'storyflow-preview-header' });
    prevHeader.createEl('h3', { text: 'Preview' });
    const toggleBtn = prevHeader.createEl('button', { text: 'Hide', cls: 'storyflow-btn-project' });
    this.previewEl = prevSection.createEl('pre', { cls: 'storyflow-preview' });
    toggleBtn.addEventListener('click', () => {
      const hidden = this.previewEl.style.display === 'none';
      this.previewEl.style.display = hidden ? 'block' : 'none';
      toggleBtn.textContent = hidden ? 'Hide' : 'Show';
    });

    // Boot with one empty prompt
    this.addItem('prompt', '', true);
    this.updatePreview();
  }

  async onClose(): Promise<void> {
    this.contentEl.empty();
  }

  // ═══════════════════════════════════════
  // TABS
  // ═══════════════════════════════════════
  private buildTabs(container: HTMLElement): void {
    const tabSection = container.createDiv({ cls: 'storyflow-tab-container storyflow-section' });
    const tabNav = tabSection.createDiv({ cls: 'storyflow-tab-nav' });
    const tabContent = tabSection.createDiv({ cls: 'storyflow-tab-content' });

    const tabs: Array<{ id: string; label: string }> = [
      { id: 'tab-triggers', label: 'Prompt Triggers' },
      { id: 'tab-shortcuts', label: 'Config Shortcuts' },
      { id: 'tab-wildcards', label: 'Wildcards' },
      { id: 'tab-poses', label: 'JSON Poses' },
    ];

    const panels: HTMLElement[] = [];

    tabs.forEach((tab, i) => {
      const btn = tabNav.createEl('button', { text: tab.label, cls: 'storyflow-tab-button' });
      const panel = tabContent.createDiv({ cls: 'storyflow-tab-panel' });
      panels.push(panel);

      if (i === 0) {
        btn.addClass('active');
        panel.addClass('active');
      }

      btn.addEventListener('click', () => {
        tabNav.querySelectorAll('.storyflow-tab-button').forEach(b => b.removeClass('active'));
        panels.forEach(p => p.removeClass('active'));
        btn.addClass('active');
        panel.addClass('active');
      });

      // Build panel content
      const listContainer = panel.createDiv({ cls: 'storyflow-list-container' });
      const footer = panel.createDiv({ cls: 'storyflow-footer' });

      if (tab.id === 'tab-triggers') {
        this.triggerListEl = listContainer;
        const addBtn = footer.createEl('button', { text: '+ Add prompt trigger', cls: 'storyflow-btn' });
        addBtn.addEventListener('click', () => this.addTrigger());
        footer.createEl('p', { text: 'User-defined triggerwords used by the prompt items only', cls: 'storyflow-small-muted' });
      } else if (tab.id === 'tab-shortcuts') {
        this.configListEl = listContainer;
        const addBtn = footer.createEl('button', { text: '+ Add config shortcut', cls: 'storyflow-btn' });
        addBtn.addEventListener('click', () => this.addConfigShortcut());
        const ioRow = footer.createDiv({ cls: 'storyflow-io-row' });
        const loadBtn = ioRow.createEl('button', { text: 'Load configs/poses', cls: 'storyflow-btn-dark' });
        loadBtn.addEventListener('click', () => this.importConfigPoseVault());
        const saveBtn = ioRow.createEl('button', { text: 'Save configs/poses', cls: 'storyflow-btn-dark' });
        saveBtn.addEventListener('click', () => this.exportConfigPoseVault());
        footer.createEl('p', { text: 'User-defined shortcuts used by the config items only', cls: 'storyflow-small-muted' });
      } else if (tab.id === 'tab-wildcards') {
        this.wildcardListEl = listContainer;
        const addBtn = footer.createEl('button', { text: '+ Add wildcard', cls: 'storyflow-btn' });
        addBtn.addEventListener('click', () => this.addWildcard());
        footer.createEl('p', { text: 'Define wildcards for prompt items', cls: 'storyflow-small-muted' });
      } else if (tab.id === 'tab-poses') {
        this.poseListEl = listContainer;
        const addBtn = footer.createEl('button', { text: '+ Add pose shortcut', cls: 'storyflow-btn' });
        addBtn.addEventListener('click', () => this.addPose());
        footer.createEl('p', { text: 'Define shortcuts for JSON poses', cls: 'storyflow-small-muted' });
      }
    });
  }

  // ═══════════════════════════════════════
  // SHORTCUT MANAGEMENT
  // ═══════════════════════════════════════
  private addTrigger(key = '', value = ''): void {
    const row = this.triggerListEl.createDiv({ cls: 'storyflow-trigger' });
    const keyInput = row.createEl('input', { placeholder: 'trigger (e.g. @hero)', value: key });
    const valInput = row.createEl('textarea', { placeholder: 'value (e.g. brave knight)' });
    valInput.value = value;
    const delBtn = row.createEl('button', { text: '❌' });
    const onChange = () => { this.savePromptTriggers(); this.updatePreview(); };
    keyInput.addEventListener('input', onChange);
    valInput.addEventListener('input', onChange);
    delBtn.addEventListener('click', () => { row.remove(); onChange(); });
    this.savePromptTriggers();
  }

  private addConfigShortcut(key = '', value = ''): void {
    const row = this.configListEl.createDiv({ cls: 'storyflow-config-shortcut' });
    const keyInput = row.createEl('input', { placeholder: 'shortcut (e.g. #Wan_i2v)', value: key });
    const valInput = row.createEl('textarea', { placeholder: 'paste a full or parameter config {...}' });
    valInput.value = value;
    const delBtn = row.createEl('button', { text: '❌' });
    const onChange = () => { this.saveConfigShortcuts(); this.updatePreview(); };
    keyInput.addEventListener('input', onChange);
    valInput.addEventListener('input', onChange);
    delBtn.addEventListener('click', () => { row.remove(); onChange(); });
    this.saveConfigShortcuts();
  }

  private addWildcard(key = '', value = ''): void {
    const row = this.wildcardListEl.createDiv({ cls: 'storyflow-wildcard-shortcut' });
    const keyInput = row.createEl('input', { placeholder: 'shortcut (e.g. $sky)', value: key });
    const valInput = row.createEl('textarea', { placeholder: 'value options (e.g. blue sky|dawn|sunset)' });
    valInput.value = value;
    const delBtn = row.createEl('button', { text: '❌' });
    const onChange = () => { this.saveWildcardShortcuts(); this.updatePreview(); };
    keyInput.addEventListener('input', onChange);
    valInput.addEventListener('input', onChange);
    delBtn.addEventListener('click', () => { row.remove(); onChange(); });
    this.saveWildcardShortcuts();
  }

  private addPose(key = '', value = ''): void {
    const row = this.poseListEl.createDiv({ cls: 'storyflow-poseJSON-shortcut' });
    const keyInput = row.createEl('input', { placeholder: 'shortcut (e.g. #armsup)', value: key });
    const valInput = row.createEl('textarea', { placeholder: 'paste a full JSON Pose {...}' });
    valInput.value = value;
    const delBtn = row.createEl('button', { text: '❌' });
    const onChange = () => { this.savePoseJSONShortcuts(); this.updatePreview(); };
    keyInput.addEventListener('input', onChange);
    valInput.addEventListener('input', onChange);
    delBtn.addEventListener('click', () => { row.remove(); onChange(); });
    this.savePoseJSONShortcuts();
  }

  private savePromptTriggers(): void {
    this.promptTriggers = {};
    this.triggerListEl.querySelectorAll('.storyflow-trigger').forEach((t: Element) => {
      const key = (t.querySelector('input') as HTMLInputElement)?.value.trim();
      const val = (t.querySelector('textarea') as HTMLTextAreaElement)?.value.trim();
      if (key) this.promptTriggers[key] = val;
    });
  }

  private saveConfigShortcuts(): void {
    this.configShortcuts = {};
    this.configListEl.querySelectorAll('.storyflow-config-shortcut').forEach((c: Element) => {
      const key = (c.querySelector('input') as HTMLInputElement)?.value.trim();
      const val = (c.querySelector('textarea') as HTMLTextAreaElement)?.value.trim();
      if (key) this.configShortcuts[key] = val;
    });
  }

  private saveWildcardShortcuts(): void {
    this.wildcardShortcuts = {};
    this.wildcardListEl.querySelectorAll('.storyflow-wildcard-shortcut').forEach((c: Element) => {
      const key = (c.querySelector('input') as HTMLInputElement)?.value.trim();
      const val = (c.querySelector('textarea') as HTMLTextAreaElement)?.value.trim();
      if (key) this.wildcardShortcuts[key] = val;
    });
  }

  private savePoseJSONShortcuts(): void {
    this.poseJSONShortcuts = {};
    this.poseListEl.querySelectorAll('.storyflow-poseJSON-shortcut').forEach((c: Element) => {
      const key = (c.querySelector('input') as HTMLInputElement)?.value.trim();
      const val = (c.querySelector('textarea') as HTMLTextAreaElement)?.value.trim();
      if (key) this.poseJSONShortcuts[key] = val;
    });
  }

  // ═══════════════════════════════════════
  // ITEM CREATION
  // ═══════════════════════════════════════
  addItem(type: StoryflowItemType, value?: string | number | boolean, skipUpdate = false): HTMLElement {
    const val = value !== undefined ? value : (DEFAULT_ITEM_VALUES[type] ?? '');
    const el = this.createItemElement({ type, value: val });
    this.promptListEl.appendChild(el);
    if (!skipUpdate) this.updatePreview();
    return el;
  }

  private createItemElement(itemObj: StoryflowItem): HTMLElement {
    const container = createDiv({ cls: 'storyflow-item', attr: { 'data-type': itemObj.type, draggable: 'false' } });

    // Drag handle
    const dragHandle = container.createDiv({ cls: 'storyflow-drag-handle', attr: { draggable: 'true' } });
    dragHandle.setText('⋮⋮');
    dragHandle.addEventListener('dragstart', (e: DragEvent) => {
      this.draggedEl = container;
      container.addClass('dragging');
      e.dataTransfer?.setData('text/plain', '');
      if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
    });
    dragHandle.addEventListener('dragend', () => {
      this.promptListEl.removeClass('dragging-active');
      if (this.draggedEl) { this.draggedEl.removeClass('dragging'); this.draggedEl = null; }
      this.removeDropIndicator();
    });
    // Touch drag support (mobile/iPad)
    let touchStartY = 0;
    dragHandle.addEventListener('touchstart', (e: TouchEvent) => {
      this.draggedEl = container;
      container.addClass('dragging');
      this.promptListEl.addClass('dragging-active');
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    dragHandle.addEventListener('touchmove', (e: TouchEvent) => {
      e.preventDefault();
      const y = e.touches[0].clientY;
      const after = this.getDragAfterElement(this.promptListEl, y);
      if (after == null) this.promptListEl.appendChild(this.dropIndicator);
      else this.promptListEl.insertBefore(this.dropIndicator, after);
    });
    dragHandle.addEventListener('touchend', () => {
      if (this.draggedEl && this.dropIndicator.parentNode) {
        this.dropIndicator.parentNode.insertBefore(this.draggedEl, this.dropIndicator);
      }
      this.removeDropIndicator();
      this.promptListEl.removeClass('dragging-active');
      if (this.draggedEl) { this.draggedEl.removeClass('dragging'); this.draggedEl = null; }
      this.updatePreview();
    });

    // Index
    const indexSpan = container.createEl('span', { cls: 'storyflow-item-index' });

    // Type label
    container.createDiv({ cls: 'storyflow-item-type-label', text: TYPE_LABELS[itemObj.type] || itemObj.type });

    // Build body based on type
    this.buildItemBody(container, itemObj);

    // Delete button
    const delBtn = container.createEl('button', { text: '❌', attr: { 'aria-label': 'Remove item' } });
    delBtn.addEventListener('click', () => { container.remove(); this.updatePreview(); });

    return container;
  }

  private buildItemBody(container: HTMLElement, itemObj: StoryflowItem): void {
    const type = itemObj.type;

    if (type === 'prompt' || type === 'config' || type === 'note' || type === 'negPrompt') {
      const ta = container.createEl('textarea');
      ta.value = String(itemObj.value || '');
      if (type === 'prompt') ta.placeholder = 'Prompt will generate\nAdd triggers and wildcards: @hero at $location';
      else if (type === 'negPrompt') ta.placeholder = 'Add a negative prompt';
      else if (type === 'note') ta.placeholder = 'Comment or instruction\nincluded in Export but ignored by Pipeline';
      else ta.placeholder = 'Paste a full or parameter config {...}\nor use a single shortcut #wan_i2v';
      ta.addEventListener('input', () => this.updatePreview());
      container.dataset.valueType = 'string';
    } else if (['moveScale','adaptSize','moodboardWeights','maskBody','inpaintTools','xlMagic','loop','poseJSON'].includes(type)) {
      const input = container.createEl('input', { type: 'text', value: String(itemObj.value || '') });
      if (type === 'poseJSON') input.placeholder = 'Paste a full JSON Pose {...} or JSON Poses #shortcut';
      input.addEventListener('input', () => this.updatePreview());
      container.dataset.valueType = 'string';
    } else if (type === 'maskAsk' || type === 'askZoom') {
      const el = container.createDiv();
      el.style.flexGrow = '1';
      el.createEl('span', { text: 'find object: ' });
      const input = el.createEl('input', { type: 'text', placeholder: 'a hat', value: String(itemObj.value || '') });
      input.addEventListener('input', () => this.updatePreview());
      container.dataset.valueType = 'string';
    } else if (['canvasSave','canvasLoad','moodboardAdd','loopAddMB','maskLoad','loopLoad','loopSave'].includes(type)) {
      const el = container.createDiv();
      el.style.flexGrow = '1';
      el.createEl('span', { text: '~Pictures/' });
      const ph = (type === 'loopLoad' || type === 'loopAddMB') ? 'myProject/batchFolder/' : 'myProject/image.png';
      const input = el.createEl('input', { type: 'text', placeholder: ph, value: String(itemObj.value || '') });
      input.addEventListener('input', () => this.updatePreview());
      container.dataset.valueType = 'string';
    } else if (type === 'moodboardRemove') {
      const el = container.createDiv();
      el.style.flexGrow = '1';
      el.createEl('span', { text: 'at index: ' });
      const input = el.createEl('input', { type: 'number', attr: { min: '0', max: '11' }, value: String(itemObj.value ?? '') });
      input.style.width = '40px';
      input.addEventListener('input', () => this.updatePreview());
      container.dataset.valueType = 'number';
    } else if (type === 'frames') {
      const wrapper = container.createDiv({ cls: 'storyflow-slider-row' });
      const slider = wrapper.createEl('input', { type: 'range', attr: { min: '0', max: '129', step: '4' } });
      let sliderPos = 0;
      if (typeof itemObj.value === 'number') {
        sliderPos = Math.round(Math.max(0, Math.min(129, (Number(itemObj.value) - 1))) / 4) * 4;
      }
      slider.value = String(sliderPos);
      const valueBadge = wrapper.createDiv({ cls: 'storyflow-value-badge', text: String(Number(slider.value) + 1) });
      const secBadge = wrapper.createEl('span', { cls: 'storyflow-small-muted', text: `${(Number(slider.value) / 16).toFixed(2)} sec (16fps)` });
      slider.addEventListener('input', () => {
        valueBadge.textContent = String(Number(slider.value) + 1);
        secBadge.textContent = `${(Number(slider.value) / 16).toFixed(2)} sec (16fps)`;
        this.updatePreview();
      });
      container.dataset.valueType = 'number';
    } else if (type === 'fileLoad') {
      const el = container.createDiv();
      el.style.flexGrow = '1';
      el.createEl('span', { text: 'Include instructions from: ' });
      const displaySpan = el.createEl('span', { text: String(itemObj.value) || 'Click to select .txt file', cls: 'storyflow-file-link' });
      container.dataset.fileContent = '';
      displaySpan.addEventListener('click', () => {
        new VaultFileSuggestModal(this.app, ['txt'], async (file: TFile) => {
          const content = await this.app.vault.read(file);
          container.dataset.fileContent = content;
          displaySpan.textContent = file.path;
          container.dataset.value = file.path;
          this.updatePreview();
        }).open();
      });
      container.dataset.valueType = 'fileContent';
    } else {
      // Boolean types: canvasClear, removeBkgd, crop, faceZoom, maskGet, maskClear, maskBkgd, maskFG, etc.
      const descriptions: Record<string, string> = {
        canvasClear: 'Clear the Canvas and control layers',
        removeBkgd: 'Make the background transparent / flat grey',
        crop: 'Crop the image to the visible canvas',
        faceZoom: 'Attempt face detection and scale in, no crop',
        maskGet: 'Copy the selection mask to Canvas',
        maskClear: 'Clear the selection mask', maskBkgd: 'Apply a selection mask', maskFG: 'Apply a selection mask',
        moodboardClear: 'Clear the full Moodboard', moodboardCanvas: 'Copy the visible Canvas to Moodboard',
        depthExtract: 'Extract a depthMap from Canvas to the depth layer',
        depthCanvas: 'Move a depthMap, does not extract', depthToCanvas: 'Move a depthMap, does not extract',
        loopEnd: 'Close the loop',
        moodboardLoad: 'Copy the visible Canvas to Moodboard',
        poseClear: 'Clear the current pose',
      };
      const desc = descriptions[type] || '';
      const el = container.createDiv({ text: desc, cls: 'storyflow-small-muted' });
      el.style.flexGrow = '1';
      container.dataset.valueType = 'boolean';
    }
  }

  // ═══════════════════════════════════════
  // INSTRUCTION BAR
  // ═══════════════════════════════════════
  private buildInstructionBar(container: HTMLElement): void {
    const bar = container.createDiv({ cls: 'storyflow-controls-row' });
    const addButtons = bar.createDiv({ cls: 'storyflow-add-buttons' });

    BUTTON_GROUPS.forEach((group, gi) => {
      if (gi > 0) addButtons.createDiv({ cls: 'storyflow-force-break' });
      group.forEach(type => {
        const cls = BUTTON_STYLES[type] || 'storyflow-btn';
        const btn = addButtons.createEl('button', { text: BUTTON_LABELS[type] || `+ ${type}`, cls, attr: { draggable: 'true' } });
        btn.addEventListener('click', () => this.addItem(type));
        btn.addEventListener('dragstart', (e: DragEvent) => {
          e.dataTransfer?.setData('text/plain', `NEW_ITEM:${type}`);
          if (e.dataTransfer) e.dataTransfer.effectAllowed = 'copy';
          this.promptListEl.addClass('dragging-active');
        });
        btn.addEventListener('dragend', () => {
          this.promptListEl.removeClass('dragging-active');
          this.removeDropIndicator();
        });
      });
    });
  }

  // ═══════════════════════════════════════
  // PROJECT CONTROLS
  // ═══════════════════════════════════════
  private buildProjectControls(container: HTMLElement): void {
    const section = container.createDiv({ cls: 'storyflow-section' });
    section.createEl('h3', { text: 'Project' });

    const nameRow = section.createDiv({ cls: 'storyflow-section' });
    nameRow.createEl('label', { text: 'Name: ' });
    this.projectNameInput = nameRow.createEl('input', { type: 'text', placeholder: 'Enter project name' }) as HTMLInputElement;
    this.projectNameInput.addEventListener('input', () => this.updatePreview());

    // New project
    const topRow = section.createDiv({ cls: 'storyflow-button-row' });
    const newBtn = topRow.createEl('button', { text: '🆕 New project', cls: 'storyflow-btn-project' });
    newBtn.addEventListener('click', () => this.newProject());

    // Build grouped buttons: each group has a vault + disk action
    const groups: Array<{ label: string; vaultText: string; vaultFn: () => void; diskText: string; diskFn: () => void }> = [
      { label: 'Save', vaultText: '💾 Save → Vault', vaultFn: () => this.saveProjectVault(), diskText: '💾 Save → Disk', diskFn: () => this.saveProjectDisk() },
      { label: 'Load', vaultText: '📂 Load ← Vault', vaultFn: () => this.loadProjectVault(), diskText: '📂 Load ← Disk', diskFn: () => this.loadProjectDisk() },
      { label: 'Pipeline', vaultText: '⬇️ Pipeline → Vault', vaultFn: () => this.exportPipelineVault(), diskText: '⬇️ Pipeline → Disk', diskFn: () => this.exportPipelineDisk() },
      { label: 'Wildcard Export', vaultText: '⬇️ Wildcard → Vault', vaultFn: () => this.exportWildcardVault(), diskText: '⬇️ Wildcard → Disk', diskFn: () => this.exportWildcardDisk() },
      { label: 'Wildcard Import', vaultText: '📂 Wildcard ← Vault', vaultFn: () => this.importWildcardVault(), diskText: '📂 Wildcard ← Disk', diskFn: () => this.importWildcardDisk() },
      { label: 'Configs', vaultText: '⬇️ Configs → Vault', vaultFn: () => this.exportConfigPoseVault(), diskText: '⬇️ Configs → Disk', diskFn: () => this.exportConfigPoseDisk() },
      { label: 'Configs Import', vaultText: '📂 Configs ← Vault', vaultFn: () => this.importConfigPoseVault(), diskText: '📂 Configs ← Disk', diskFn: () => this.importConfigPoseDisk() },
    ];

    groups.forEach(g => {
      const row = section.createDiv({ cls: 'storyflow-button-pair' });
      const vBtn = row.createEl('button', { text: g.vaultText, cls: 'storyflow-btn-project storyflow-btn-vault' });
      vBtn.addEventListener('click', g.vaultFn);
      const dBtn = row.createEl('button', { text: g.diskText, cls: 'storyflow-btn-project storyflow-btn-disk' });
      dBtn.addEventListener('click', g.diskFn);
    });

    // Clipboard (standalone)
    const clipRow = section.createDiv({ cls: 'storyflow-button-row' });
    const clipBtn = clipRow.createEl('button', { text: '📋 Export to clipboard', cls: 'storyflow-btn-project' });
    clipBtn.addEventListener('click', () => this.exportClipboard());
  }

  // ═══════════════════════════════════════
  // DRAG & DROP
  // ═══════════════════════════════════════
  private initDragAndDrop(): void {
    const list = this.promptListEl;
    list.addEventListener('dragover', (e: DragEvent) => {
      e.preventDefault();
      if ((e.target as HTMLElement)?.closest('.storyflow-prompt-list')) {
        const after = this.getDragAfterElement(list, e.clientY);
        if (after == null) list.appendChild(this.dropIndicator);
        else list.insertBefore(this.dropIndicator, after);
      }
    });
    list.addEventListener('drop', (e: DragEvent) => {
      e.preventDefault();
      const transferData = e.dataTransfer?.getData('text/plain') || '';
      // New-item drag from instruction bar
      if (transferData.startsWith('NEW_ITEM:')) {
        const type = transferData.substring(9) as StoryflowItemType;
        const newEl = this.createItemElement({ type, value: DEFAULT_ITEM_VALUES[type] ?? '' });
        if (this.dropIndicator.parentNode) {
          this.dropIndicator.parentNode.insertBefore(newEl, this.dropIndicator);
        } else {
          list.appendChild(newEl);
        }
        this.removeDropIndicator();
        list.removeClass('dragging-active');
        this.updatePreview();
        return;
      }
      // Reorder drag
      if (!this.draggedEl) return;
      if (this.dropIndicator.parentNode) {
        this.dropIndicator.parentNode.insertBefore(this.draggedEl, this.dropIndicator);
      }
      this.removeDropIndicator();
      this.draggedEl.removeClass('dragging');
      this.draggedEl = null;
      list.removeClass('dragging-active');
      this.updatePreview();
    });
    list.addEventListener('dragleave', (e: DragEvent) => {
      if (!list.contains(e.relatedTarget as Node)) this.removeDropIndicator();
    });
    list.addEventListener('dragend', () => {
      list.removeClass('dragging-active');
      if (this.draggedEl) this.draggedEl.removeClass('dragging');
      this.removeDropIndicator();
      this.draggedEl = null;
    });
  }

  private getDragAfterElement(container: HTMLElement, y: number): HTMLElement | null {
    const els = Array.from(container.querySelectorAll('.storyflow-item:not(.dragging)')) as HTMLElement[];
    let closest = { offset: Number.NEGATIVE_INFINITY, element: null as HTMLElement | null };
    for (const child of els) {
      const box = child.getBoundingClientRect();
      const offset = y - (box.top + box.height / 2);
      if (offset < 0 && offset > closest.offset) closest = { offset, element: child };
    }
    return closest.element;
  }

  private removeDropIndicator(): void {
    if (this.dropIndicator.parentNode) this.dropIndicator.parentNode.removeChild(this.dropIndicator);
  }

  // ═══════════════════════════════════════
  // READ ITEMS FROM DOM
  // ═══════════════════════════════════════
  readItemsFromDOM(): StoryflowItem[] {
    const items: StoryflowItem[] = [];
    this.promptListEl.querySelectorAll('.storyflow-item').forEach((el: Element) => {
      const htmlEl = el as HTMLElement;
      const type = htmlEl.dataset.type as StoryflowItemType;
      let value: string | number | boolean;

      if (['prompt','negPrompt','config','note'].includes(type)) {
        value = (htmlEl.querySelector('textarea') as HTMLTextAreaElement)?.value || '';
      } else if (type === 'moodboardRemove') {
        value = parseInt((htmlEl.querySelector('input[type="number"]') as HTMLInputElement)?.value || '0', 10);
      } else if (type === 'frames') {
        value = parseInt((htmlEl.querySelector('input[type="range"]') as HTMLInputElement)?.value || '0', 10) + 1;
      } else if (type === 'fileLoad') {
        value = htmlEl.dataset.value || '';
      } else if (htmlEl.dataset.valueType === 'string') {
        value = (htmlEl.querySelector('input[type="text"]') as HTMLInputElement)?.value || '';
      } else {
        value = true;
      }
      items.push({ type, value });
    });
    return items;
  }

  // ═══════════════════════════════════════
  // PREVIEW
  // ═══════════════════════════════════════
  updatePreview(): void {
    this.updateItemNumbers();
    this.savePromptTriggers();

    const projectName = this.projectNameInput?.value || 'Unnamed';
    const items = this.readItemsFromDOM();

    let promptCount = 0;
    let framesTotal = 0;
    let framesCount = 0;
    items.forEach(item => {
      if (item.type === 'prompt') promptCount++;
      else if (item.type === 'frames' && Number(item.value) > 1) {
        framesCount++;
        framesTotal += Number(item.value) - framesCount;
      }
    });

    let output = `=== PROJECT: ${projectName} ===\n\n`;
    output += `Prompt Total: ${promptCount}\n`;
    output += `Frames Total: ${framesTotal} (${(framesTotal / 16).toFixed(2)} sec 16fps)\n\n`;
    output += '=== Instructions (expanded prompts) ===\n';

    items.forEach((it, idx) => {
      if (it.type === 'prompt') {
        const expanded = resolvePromptTriggers(String(it.value || ''), this.promptTriggers);
        output += `[${idx + 1}] ${it.type}: "${expanded}"\n\n`;
      } else if (it.type === 'negPrompt') {
        output += `[${idx + 1}] ${it.type}: "${it.value}"\n\n`;
      } else if (['note','config','poseJSON'].includes(it.type)) {
        output += `[${idx + 1}] ${it.type}: ${it.value}\n\n`;
      } else if (it.type === 'frames') {
        output += `[${idx + 1}] ${it.type}: ${JSON.stringify(it.value)} — ${((Number(it.value) - 1) / 16)}sec (16fps)\n\n`;
      } else if (['canvasLoad','canvasSave','loopLoad','loopSave','moodboardAdd','loopAddMB','maskLoad','maskAsk','askZoom'].includes(it.type)) {
        output += `[${idx + 1}] ${it.type}: ${JSON.stringify(it.value)}\n\n`;
      } else if (['moveScale','adaptSize','xlMagic','loop','moodboardRemove','moodboardWeights','maskBody','inpaintTools'].includes(it.type)) {
        output += `[${idx + 1}] ${it.type}: ${it.value}\n\n`;
      } else if (it.type === 'fileLoad') {
        const itemEls = this.promptListEl.querySelectorAll('.storyflow-item');
        const itemEl = itemEls[idx] as HTMLElement | undefined;
        const fileContent = itemEl?.dataset.fileContent || '';
        const filePath = itemEl?.dataset.value || '';
        if (fileContent) {
          output += `[${idx + 1}] ${it.type}: ${filePath}\n`;
          output += `  --- INCLUDED CONTENT START ---\n`;
          output += `  ${fileContent.replace(/\n/g, '\n  ')}\n`;
          output += `  --- INCLUDED CONTENT END ---\n\n`;
        } else if (filePath) {
          output += `[${idx + 1}] ${it.type}: ${filePath} ⚠️ (content not loaded, re-select file)\n\n`;
        } else {
          output += `[${idx + 1}] ${it.type}: ⚠️ No file selected\n\n`;
        }
      } else {
        output += `[${idx + 1}] ${it.type}\n\n`;
      }
    });

    if (this.previewEl) this.previewEl.textContent = output;
  }

  private updateItemNumbers(): void {
    this.promptListEl.querySelectorAll('.storyflow-item').forEach((item: Element, index: number) => {
      const indexSpan = item.querySelector('.storyflow-item-index');
      if (indexSpan) indexSpan.textContent = `${index + 1}.`;
      (item as HTMLElement).dataset.index = String(index + 1);
    });
  }

  // ═══════════════════════════════════════
  // PROJECT MANAGEMENT
  // ═══════════════════════════════════════
  newProject(): void {
    this.projectNameInput.value = '';
    this.triggerListEl.empty();
    this.configListEl.empty();
    this.wildcardListEl.empty();
    this.poseListEl.empty();
    this.promptListEl.empty();
    this.promptTriggers = {};
    this.configShortcuts = {};
    this.poseJSONShortcuts = {};
    this.wildcardShortcuts = {};
    this.addItem('prompt', '', true);
    this.updatePreview();
  }

  // ═══════════════════════════════════════
  // SHARED DATA BUILDERS
  // ═══════════════════════════════════════
  private getProjectData(): { name: string; data: StoryflowProject; jsonStr: string } {
    this.saveAllShortcuts();
    const name = this.projectNameInput.value || 'StoryFlowProject';
    const data: StoryflowProject = {
      projectName: name,
      promptTriggers: this.promptTriggers,
      configShortcuts: this.configShortcuts,
      poseJSONShortcuts: this.poseJSONShortcuts,
      wildcardShortcuts: this.wildcardShortcuts,
      items: this.readItemsFromDOM(),
    };
    return { name, data, jsonStr: JSON.stringify(data, null, 2) };
  }

  private applyProjectData(data: StoryflowProject): void {
    this.projectNameInput.value = data.projectName || '';
    this.triggerListEl.empty();
    this.configListEl.empty();
    this.poseListEl.empty();
    this.wildcardListEl.empty();
    this.promptListEl.empty();
    this.promptTriggers = {};
    this.configShortcuts = {};
    this.poseJSONShortcuts = {};
    this.wildcardShortcuts = {};
    if (data.promptTriggers) Object.entries(data.promptTriggers).forEach(([k, v]) => this.addTrigger(k, v));
    if (data.configShortcuts) Object.entries(data.configShortcuts).forEach(([k, v]) => this.addConfigShortcut(k, v));
    if (data.poseJSONShortcuts) Object.entries(data.poseJSONShortcuts).forEach(([k, v]) => this.addPose(k, v));
    if (data.wildcardShortcuts) Object.entries(data.wildcardShortcuts).forEach(([k, v]) => this.addWildcard(k, v));
    if (data.items) data.items.forEach(it => this.addItem(it.type, it.value, true));
    this.updatePreview();
  }

  private getPipelineOutput(): string {
    this.saveAllShortcuts();
    const items = this.readItemsFromDOM();
    // Collect fileLoad content from DOM for inline expansion
    const fileContents: Record<number, string> = {};
    const itemEls = this.promptListEl.querySelectorAll('.storyflow-item');
    items.forEach((it, idx) => {
      if (it.type === 'fileLoad') {
        const el = itemEls[idx] as HTMLElement | undefined;
        const content = el?.dataset.fileContent || '';
        if (content) fileContents[idx] = content;
      }
    });
    return generateInstructionString(
      items, this.promptTriggers, this.configShortcuts,
      this.poseJSONShortcuts, this.wildcardShortcuts, fileContents
    );
  }

  private buildWildcardOutput(): string {
    this.saveAllShortcuts();
    let output = '';
    for (const [key, val] of Object.entries(this.configShortcuts)) {
      const defKey = key.startsWith('#') ? key : '#' + key;
      const c = val.trim();
      output += (c.startsWith('{') && c.endsWith('}')) ? `${defKey} := ${c}\n\n` : `${defKey} := { ${c} }\n\n`;
    }
    for (const [key, val] of Object.entries(this.poseJSONShortcuts)) {
      const defKey = key.startsWith('#') ? key : '#' + key;
      const c = val.trim();
      output += (c.startsWith('{') && c.endsWith('}')) ? `${defKey} := ${c}\n\n` : `${defKey} := { ${c} }\n\n`;
    }
    for (const [key, val] of Object.entries(this.promptTriggers)) {
      const defKey = key.startsWith('@') ? key : '@' + key;
      output += `${defKey} := { ${val} }\n\n`;
    }
    for (const [key, val] of Object.entries(this.wildcardShortcuts)) {
      let defKey = key;
      if (key.startsWith('$')) defKey = '@' + key.substring(1);
      else if (!key.startsWith('@')) defKey = '@' + key;
      output += `${defKey} := { ${val} }\n\n`;
    }
    const items = this.readItemsFromDOM();
    const prompts = items.filter(it => it.type === 'prompt').map(it => {
      let content = String(it.value);
      for (const k of Object.keys(this.wildcardShortcuts)) {
        if (k.startsWith('$')) {
          const bareName = k.substring(1);
          content = content.replace(new RegExp(`\\$${bareName}\\b`, 'g'), `@${bareName}`);
        }
      }
      return content;
    });
    if (prompts.length > 0) output += `PROMPT: [ ${prompts.join(' | ')} ]`;
    return output;
  }

  private buildConfigPoseOutput(): string {
    this.saveConfigShortcuts();
    this.savePoseJSONShortcuts();
    let output = '';
    for (const [key, val] of Object.entries(this.configShortcuts)) {
      const defKey = key.startsWith('#') ? key : '#' + key;
      const c = val.trim();
      output += (c.startsWith('{') && c.endsWith('}')) ? `${defKey} := ${c}\n\n` : `${defKey} := { ${c} }\n\n`;
    }
    for (const [key, val] of Object.entries(this.poseJSONShortcuts)) {
      const defKey = key.startsWith('#') ? key : '#' + key;
      const c = val.trim();
      output += (c.startsWith('{') && c.endsWith('}')) ? `${defKey} := ${c}\n\n` : `${defKey} := { ${c} }\n\n`;
    }
    return output;
  }

  // ═══════════════════════════════════════
  // SAVE PROJECT
  // ═══════════════════════════════════════
  async saveProjectVault(): Promise<void> {
    const { name, jsonStr } = this.getProjectData();
    const now = new Date().toISOString();
    const md = wrapAsMarkdown({ storyflow: 'project', name, created: now }, jsonStr, 'json');
    const filePath = `${STORYFLOW_FOLDERS.projects}/${name}.md`;
    await writeVaultFile(this.app, filePath, md);
  }

  saveProjectDisk(): void {
    const { name, jsonStr } = this.getProjectData();
    downloadToDisk(`${name}.json`, jsonStr, 'application/json');
  }

  // ═══════════════════════════════════════
  // LOAD PROJECT
  // ═══════════════════════════════════════
  loadProjectVault(): void {
    new VaultFileSuggestModal(this.app, ['md', 'json'], async (file: TFile) => {
      try {
        const raw = await this.app.vault.read(file);
        let data: StoryflowProject;
        if (file.extension === 'md') {
          const parsed = parseStoryflowMarkdown(raw);
          if (!parsed) { new Notice('Not a valid Storyflow markdown file'); return; }
          data = JSON.parse(parsed.content) as StoryflowProject;
        } else {
          data = JSON.parse(raw) as StoryflowProject;
        }
        this.applyProjectData(data);
        new Notice(`Project loaded: ${file.path}`);
      } catch {
        new Notice('Failed to load project file');
      }
    }).open();
  }

  loadProjectDisk(): void {
    loadFromDisk('.json', (_filename, content) => {
      try {
        const data = JSON.parse(content) as StoryflowProject;
        this.applyProjectData(data);
        new Notice(`Project loaded from disk`);
      } catch {
        new Notice('Failed to parse project file');
      }
    });
  }

  // ═══════════════════════════════════════
  // EXPORT PIPELINE
  // ═══════════════════════════════════════
  async exportPipelineVault(): Promise<void> {
    const output = this.getPipelineOutput();
    const name = this.projectNameInput.value || 'project';
    const now = new Date().toISOString();
    const md = wrapAsMarkdown({ storyflow: 'pipeline', project: name, created: now }, output, 'storyflow-pipeline');
    await writeVaultFile(this.app, `${STORYFLOW_FOLDERS.exports}/${name}_pipeline.md`, md);
  }

  exportPipelineDisk(): void {
    const output = this.getPipelineOutput();
    const name = this.projectNameInput.value || 'project';
    downloadToDisk(`${name}_pipeline.txt`, output);
  }

  // ═══════════════════════════════════════
  // EXPORT CLIPBOARD
  // ═══════════════════════════════════════
  exportClipboard(): void {
    const output = this.getPipelineOutput();
    navigator.clipboard.writeText(output);
    new Notice('Copied to clipboard');
  }

  // ═══════════════════════════════════════
  // EXPORT WILDCARD
  // ═══════════════════════════════════════
  async exportWildcardVault(): Promise<void> {
    const output = this.buildWildcardOutput();
    const name = this.projectNameInput.value || 'Project';
    const now = new Date().toISOString();
    const md = wrapAsMarkdown({ storyflow: 'wildcard', project: name, created: now }, output, 'storyflow-wildcard');
    await writeVaultFile(this.app, `${STORYFLOW_FOLDERS.exports}/${name}_wildcard.md`, md);
  }

  exportWildcardDisk(): void {
    const output = this.buildWildcardOutput();
    const name = this.projectNameInput.value || 'Project';
    downloadToDisk(`${name}_wildcard.txt`, output);
  }

  // ═══════════════════════════════════════
  // EXPORT CONFIG/POSE
  // ═══════════════════════════════════════
  async exportConfigPoseVault(): Promise<void> {
    const output = this.buildConfigPoseOutput();
    if (!output.trim()) { new Notice('No configs or poses to export'); return; }
    const name = this.projectNameInput.value || 'config_poses';
    const now = new Date().toISOString();
    const md = wrapAsMarkdown({ storyflow: 'config', project: name, created: now }, output, 'storyflow-config');
    await writeVaultFile(this.app, `${STORYFLOW_FOLDERS.configs}/${name}_configs.md`, md);
  }

  exportConfigPoseDisk(): void {
    const output = this.buildConfigPoseOutput();
    if (!output.trim()) { new Notice('No configs or poses to export'); return; }
    const name = this.projectNameInput.value || 'config_poses';
    downloadToDisk(`${name}_configs.txt`, output);
  }

  // ═══════════════════════════════════════
  // IMPORT CONFIG/POSE
  // ═══════════════════════════════════════
  private parseConfigPoseText(text: string): number {
    // If it's a markdown file, extract the code block content
    const parsed = parseStoryflowMarkdown(text);
    const rawText = parsed ? parsed.content : text;

    const defStartRegex = /#(\w+)\s*:=\s*\{/g;
    let match: RegExpExecArray | null;
    let count = 0;
    while ((match = defStartRegex.exec(rawText)) !== null) {
      const name = match[1];
      const braceStart = match.index + match[0].length - 1;
      const extracted = this.extractBalancedBraces(rawText, braceStart);
      if (extracted) {
        if (extracted.content.includes('"points"')) this.addPose(`#${name}`, extracted.content);
        else this.addConfigShortcut(`#${name}`, extracted.content);
        count++;
        defStartRegex.lastIndex = extracted.end + 1;
      }
    }
    return count;
  }

  importConfigPoseVault(): void {
    new VaultFileSuggestModal(this.app, ['txt', 'md'], async (file: TFile) => {
      const text = await this.app.vault.read(file);
      const count = this.parseConfigPoseText(text);
      new Notice(count > 0 ? `Imported ${count} configs/poses from ${file.name}` : 'No configs/poses found');
    }).open();
  }

  importConfigPoseDisk(): void {
    loadFromDisk('.txt', (filename, content) => {
      const count = this.parseConfigPoseText(content);
      new Notice(count > 0 ? `Imported ${count} configs/poses from ${filename}` : 'No configs/poses found');
    });
  }

  // ═══════════════════════════════════════
  // IMPORT WILDCARD
  // ═══════════════════════════════════════
  private parseWildcardText(text: string): void {
    // If it's a markdown file, extract the code block content
    const parsed = parseStoryflowMarkdown(text);
    const rawText = parsed ? parsed.content : text;

    this.newProject();
    const defRegex = /([@$#])(\w+)\s*:=\s*\{([\s\S]*?)\}/g;
    let match: RegExpExecArray | null;
    const definitions: Record<string, string> = {};
    while ((match = defRegex.exec(rawText)) !== null) {
      const prefix = match[1];
      const key = match[2].trim();
      const value = match[3].trim();
      if (prefix === '#') {
        if (value.includes('"points"')) this.addPose(`#${key}`, value);
        else this.addConfigShortcut(`#${key}`, value);
      } else {
        definitions[key] = value;
      }
    }
    const promptRegex = /PROMPT:\s*\[([\s\S]*?)\]/;
    const promptMatch = promptRegex.exec(rawText);
    if (promptMatch) {
      let finalPrompt = promptMatch[1].trim();
      Object.keys(definitions).forEach(key => {
        const val = definitions[key];
        if (val.includes('|')) {
          this.addWildcard(`$${key}`, val);
          finalPrompt = finalPrompt.replace(new RegExp(`@${key}\\b`, 'g'), `$${key}`);
        } else {
          this.addTrigger(`@${key}`, val);
          finalPrompt = finalPrompt.replace(new RegExp(`\\$${key}\\b`, 'g'), `@${key}`);
        }
      });
      finalPrompt.split('|').forEach(part => {
        const trimmed = part.trim();
        if (trimmed) this.addItem('prompt', trimmed, true);
      });
    }
    this.updatePreview();
  }

  importWildcardVault(): void {
    new VaultFileSuggestModal(this.app, ['txt', 'md'], async (file: TFile) => {
      try {
        const text = await this.app.vault.read(file);
        this.parseWildcardText(text);
        new Notice(`Wildcard script imported from ${file.name}`);
      } catch {
        new Notice('Error parsing wildcard script');
      }
    }).open();
  }

  importWildcardDisk(): void {
    loadFromDisk('.txt', (filename, content) => {
      try {
        this.parseWildcardText(content);
        new Notice(`Wildcard script imported from ${filename}`);
      } catch {
        new Notice('Error parsing wildcard script');
      }
    });
  }

  // ═══════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════
  private saveAllShortcuts(): void {
    this.savePromptTriggers();
    this.saveConfigShortcuts();
    this.savePoseJSONShortcuts();
    this.saveWildcardShortcuts();
  }

  private extractBalancedBraces(str: string, start: number): { content: string; end: number } | null {
    if (str[start] !== '{') return null;
    let curlyDepth = 0;
    let squareDepth = 0;
    for (let i = start; i < str.length; i++) {
      if (str[i] === '{') curlyDepth++;
      else if (str[i] === '}') {
        curlyDepth--;
        if (curlyDepth === 0 && squareDepth === 0) return { content: str.substring(start, i + 1), end: i };
      } else if (str[i] === '[') squareDepth++;
      else if (str[i] === ']') squareDepth--;
    }
    return null;
  }
}
