/**
 * Resolution engine for Storyflow shortcuts.
 * Resolves @triggers, #configs, $wildcards, and #poses in text.
 */

/** Iteratively resolve prompt triggers (@key → value) */
export function resolvePromptTriggers(text: string, triggers: Record<string, string>): string {
  if (!text) return '';
  let replaced = text;
  let prev: string;
  do {
    prev = replaced;
    for (const [key, val] of Object.entries(triggers)) {
      replaced = replaced.split(key).join(val);
    }
  } while (replaced !== prev);
  return replaced;
}

/** Iteratively resolve config shortcuts (#key → value) */
export function resolveConfigShortcuts(text: string, shortcuts: Record<string, string>): string {
  if (!text) return '';
  let replaced = text;
  let prev: string;
  do {
    prev = replaced;
    for (const [key, val] of Object.entries(shortcuts)) {
      replaced = replaced.split(key).join(val);
    }
  } while (replaced !== prev);
  return replaced;
}

/** Iteratively resolve pose JSON shortcuts (#key → value) */
export function resolvePoseJSONShortcuts(text: string, shortcuts: Record<string, string>): string {
  if (!text) return '';
  let replaced = text;
  let prev: string;
  do {
    prev = replaced;
    for (const [key, val] of Object.entries(shortcuts)) {
      replaced = replaced.split(key).join(val);
    }
  } while (replaced !== prev);
  return replaced;
}

/**
 * Resolve wildcard shortcuts ($key → random option, $key[N] → specific option).
 * Options are pipe-delimited: "blue sky|dawn|sunset"
 */
export function resolveWildcardShortcuts(text: string, wildcards: Record<string, string>): string {
  if (!text) return '';
  let replaced = text;
  const wildcardPattern = /(\$[a-zA-Z0-9_]+)(\[\d+\])?/g;
  let prev: string;
  do {
    prev = replaced;
    replaced = replaced.replace(wildcardPattern, (match: string, key: string, indexGroup: string) => {
      const valueString = wildcards[key];
      if (!valueString) return match;
      const options = valueString.split('|').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
      if (options.length === 0) return match;
      if (indexGroup) {
        const requestedIndex = parseInt(indexGroup.slice(1, -1), 10) - 1;
        return (requestedIndex >= 0 && requestedIndex < options.length) ? options[requestedIndex] : match;
      } else {
        return options[Math.floor(Math.random() * options.length)];
      }
    });
  } while (replaced !== prev);
  return replaced;
}

/**
 * Generate the full pipeline instruction string from items and shortcuts.
 */
export function generateInstructionString(
  items: Array<{type: string; value: string | number | boolean}>,
  triggers: Record<string, string>,
  configSC: Record<string, string>,
  poseSC: Record<string, string>,
  wildcardSC: Record<string, string>,
): string {
  const instructionArray: string[] = [];

  items.forEach((it) => {
    let s = '';
    if (it.type === 'note') {
      s = `{"${it.type}": ${JSON.stringify(it.value)}}`;
    } else if (it.type === 'prompt' || it.type === 'negPrompt') {
      const withTriggers = resolvePromptTriggers(String(it.value || ''), triggers);
      const final = resolveWildcardShortcuts(withTriggers, wildcardSC);
      s = `{"${it.type}": ${JSON.stringify(final)}}`;
    } else if (it.type === 'config') {
      s = `{"config": ${resolveConfigShortcuts(String(it.value || ''), configSC)}}`;
    } else if (it.type === 'poseJSON') {
      s = `{"poseJSON": ${resolvePoseJSONShortcuts(String(it.value || ''), poseSC)}}`;
    } else if (it.type === 'frames' || it.type === 'moodboardRemove') {
      s = `{"${it.type}": ${it.value}}`;
    } else if (['moveScale','adaptSize','xlMagic','loop','moodboardWeights','maskBody','inpaintTools'].includes(it.type)) {
      s = `{"${it.type}": ${it.value}}`;
    } else if (['canvasSave','canvasLoad','pipeline','loopLoad','loopSave','moodboardAdd','loopAddMB','maskLoad','maskAsk','askZoom'].includes(it.type)) {
      s = `{"${it.type}": ${JSON.stringify(it.value)}}`;
    } else {
      s = `{"${it.type}": true}`;
    }
    if (s) instructionArray.push(s);
  });

  instructionArray.push('{"end": true}');
  return '[\n' + instructionArray.join(', \n') + '\n]';
}
