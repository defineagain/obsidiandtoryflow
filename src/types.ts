/** All supported Storyflow item types */
export type StoryflowItemType =
  | 'note' | 'prompt' | 'config' | 'frames' | 'negPrompt'
  | 'faceZoom' | 'askZoom' | 'removeBkgd'
  | 'canvasClear' | 'canvasSave' | 'canvasLoad'
  | 'moveScale' | 'adaptSize' | 'crop'
  | 'moodboardClear' | 'moodboardAdd' | 'moodboardCanvas' | 'moodboardRemove' | 'moodboardWeights'
  | 'loopAddMB'
  | 'maskClear' | 'maskLoad' | 'maskGet' | 'maskBkgd' | 'maskFG' | 'maskBody' | 'maskAsk'
  | 'inpaintTools'
  | 'depthExtract' | 'depthCanvas' | 'depthToCanvas'
  | 'xlMagic'
  | 'poseJSON' | 'poseClear' | 'fileLoad'
  | 'moodboardLoad'
  | 'loop' | 'loopLoad' | 'loopSave' | 'loopEnd';

export interface StoryflowItem {
  type: StoryflowItemType;
  value: string | number | boolean;
}

export interface StoryflowProject {
  projectName: string;
  promptTriggers: Record<string, string>;
  configShortcuts: Record<string, string>;
  poseJSONShortcuts: Record<string, string>;
  wildcardShortcuts: Record<string, string>;
  items: StoryflowItem[];
}

export interface StoryflowSettings {
  lastProjectName: string;
}

export const DEFAULT_SETTINGS: StoryflowSettings = {
  lastProjectName: '',
};

/** Default values when adding a new item of a given type */
export const DEFAULT_ITEM_VALUES: Partial<Record<StoryflowItemType, string | number>> = {
  note: '',
  prompt: '',
  config: '',
  frames: 1,
  negPrompt: '',
  askZoom: '',
  moveScale: '{"position_X": 512, "position_Y": 512, "canvas_scale": 1.8}',
  adaptSize: '{"maxWidth": 1664, "maxHeight": 1664}',
  moodboardAdd: '',
  loopAddMB: '',
  moodboardRemove: '0',
  moodboardWeights: '{"index_0": 1, "index_1": 0, "index_2": 0}',
  xlMagic: '{"original": 3, "target": 4, "negative":7}',
  canvasSave: '',
  canvasLoad: '',
  maskLoad: '',
  maskBody: '{"upper": true, "lower": true, "clothes": true, "neck": false, "extra": 5}',
  maskAsk: '',
  inpaintTools: '{"strength": 1, "maskBlur": 0, "maskBlurOutset": 0, "preserveOriginalAfterInpaint": true}',
  loop: '{"loop": 4, "start": 1}',
  loopLoad: '',
  loopSave: '',
  poseJSON: '',
  fileLoad: '',
};

/** Human-readable labels for item types */
export const TYPE_LABELS: Record<string, string> = {
  note: 'note', prompt: 'prompt', config: 'config', frames: 'frames',
  negPrompt: 'neg prompt', faceZoom: 'face zoom', askZoom: 'ask zoom',
  removeBkgd: 'remove background',
  canvasClear: 'clear canvas', canvasSave: 'save canvas', canvasLoad: 'load canvas',
  moveScale: 'move & scale', adaptSize: 'adapt size to fit image', crop: 'crop',
  moodboardClear: 'clear moodboard', moodboardAdd: 'add to moodboard',
  moodboardCanvas: 'canvas to moodboard', moodboardLoad: 'add to moodboard', moodboardRemove: 'remove moodboard',
  moodboardWeights: 'set moodboard weights', loopAddMB: 'Add⒤ to moodboard',
  maskClear: 'clear mask', maskLoad: 'load mask', maskGet: 'get mask',
  maskBkgd: 'mask background', maskFG: 'mask foreground', maskBody: 'mask body',
  maskAsk: 'ask mask', inpaintTools: 'in-paint tools',
  depthExtract: 'extract depthmap', depthCanvas: 'canvas to depth layer',
  depthToCanvas: 'depth layer to canvas', xlMagic: 'XL magic✨',
  poseJSON: 'JSON pose', poseClear: 'clear pose', fileLoad: 'add pipeline',
  loop: 'loop', loopLoad: 'load image⒤ from', loopSave: 'save image⒤', loopEnd: 'endLoop',
};

/** Button style classes per item type */
export const BUTTON_STYLES: Partial<Record<StoryflowItemType, string>> = {
  note: 'storyflow-btn-note', prompt: 'storyflow-btn-prompt',
  config: 'storyflow-btn-config', frames: 'storyflow-btn-frames',
  faceZoom: 'storyflow-btn-special', askZoom: 'storyflow-btn-special',
  removeBkgd: 'storyflow-btn-special', moveScale: 'storyflow-btn-special',
  adaptSize: 'storyflow-btn-special', crop: 'storyflow-btn-special',
  canvasClear: 'storyflow-btn-canvas', canvasSave: 'storyflow-btn-canvas',
  canvasLoad: 'storyflow-btn-canvas',
  moodboardClear: 'storyflow-btn-moodboard', moodboardAdd: 'storyflow-btn-moodboard',
  moodboardCanvas: 'storyflow-btn-moodboard', moodboardLoad: 'storyflow-btn-moodboard', moodboardRemove: 'storyflow-btn-moodboard',
  moodboardWeights: 'storyflow-btn-moodboard', loopAddMB: 'storyflow-btn-loop',
  maskClear: 'storyflow-btn', maskLoad: 'storyflow-btn',
  maskGet: 'storyflow-btn-mask', maskBkgd: 'storyflow-btn-mask',
  maskFG: 'storyflow-btn-mask', maskBody: 'storyflow-btn-mask',
  maskAsk: 'storyflow-btn-mask',
  depthExtract: 'storyflow-btn-depth', depthCanvas: 'storyflow-btn-depth',
  depthToCanvas: 'storyflow-btn-depth',
  inpaintTools: 'storyflow-btn-mask', xlMagic: 'storyflow-btn-xlMagic',
  negPrompt: 'storyflow-btn', poseJSON: 'storyflow-btn', poseClear: 'storyflow-btn',
  fileLoad: 'storyflow-btn', loop: 'storyflow-btn-loop',
  loopSave: 'storyflow-btn-loop', loopLoad: 'storyflow-btn-loop',
  loopEnd: 'storyflow-btn-loop',
};

/** Button display labels */
export const BUTTON_LABELS: Partial<Record<StoryflowItemType, string>> = {
  note: '+ Note', prompt: '+ Prompt', config: '+ Config', frames: '+ Frames',
  faceZoom: '+ FaceZoom', askZoom: '+ AskZoom', removeBkgd: '+ Remove Bkgd',
  canvasClear: '+ Clear Canvas', canvasSave: '+ Save Canvas', canvasLoad: '+ Load Canvas',
  moveScale: '+ Move Scale', adaptSize: '+ Adapt Size', crop: '+ Crop',
  moodboardClear: '+ Clear Moodboard', moodboardCanvas: '+ Canvas to MB',
  moodboardAdd: '+ Add MB', moodboardRemove: '+ Remove', moodboardWeights: '+ Weights',
  loopAddMB: '+ Add⒤ MB',
  maskClear: '+ Clear Mask', maskLoad: '+ Load Mask',
  maskGet: '+ Get 👤', maskBkgd: '+ Bkgd 👤', maskFG: '+ FG 👤',
  maskBody: '+ Body 👤', maskAsk: '+ Ask 👤',
  depthExtract: '+ Extract Depth', depthCanvas: '+ Canvas to Depth',
  depthToCanvas: '+ Depth to Canvas', inpaintTools: '+ Inpaint Tools',
  xlMagic: '+ XL Magic✨',
  negPrompt: '+ Neg Prompt', poseJSON: '+ JSON Pose', poseClear: '+ Clear Pose', fileLoad: '+ Pipeline',
  moodboardLoad: '+ MB Load', loop: '+ Loop', loopSave: '+ Save ⒤', loopLoad: '+ Load ⒤', loopEnd: '+ EndLoop',
};

/** Groups of add-item buttons for the instruction bar */
export const BUTTON_GROUPS: StoryflowItemType[][] = [
  ['note', 'prompt', 'config', 'frames', 'faceZoom', 'askZoom', 'removeBkgd'],
  ['canvasClear', 'canvasSave', 'canvasLoad', 'moveScale', 'adaptSize', 'crop'],
  ['moodboardClear', 'moodboardCanvas', 'moodboardAdd', 'moodboardRemove', 'moodboardWeights', 'loopAddMB'],
  ['maskClear', 'maskLoad', 'maskGet', 'maskBkgd', 'maskFG', 'maskBody', 'maskAsk'],
  ['depthExtract', 'depthCanvas', 'depthToCanvas', 'inpaintTools', 'xlMagic'],
  ['negPrompt', 'poseJSON', 'fileLoad', 'loop', 'loopSave', 'loopLoad', 'loopEnd'],
];
