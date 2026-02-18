# Storyflow Editor for DrawThings - Wildcards Plus Integration

A visual node-based editor designed to streamline the creation of complex prompt pipelines for [Draw Things](https://drawthings.ai/), now enhanced with full support for **Wildcard Scripts** and **Sequential Shot Generation**.

CREDITS: 
Based on work by Cutscene Artist (@wetcircuit on Discord) who created the original storyflow editor and the first wildcard script for Draw Things. Inspired also by Ariane Emory's work on wildcards plus, where tagged wildcards and calls to tagged wildcards got floated: https://github.com/ariane-emory/wildcards-plus


## 🎯 Overview

This toolkit provides a complete workflow for generating AI images with complex, randomizable prompts. It combines:

- A **visual editor** for designing prompt structures
- **Draw Things scripts** for executing multi-shot photoshoots
- **LLM prompts** for generating high-quality prompt content

---

## 📁 File Reference

### Core Files

| File                                   | Description                                                                                            |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `Storyflow Editor for DrawThings.html` | The main visual editor. Open in any browser to design prompt workflows.                                |
| `sequential-wildcards.js`              | Draw Things script for processing `[shot1 \| shot2]` sequences with `@wildcard` and `#config` support. |
| `storyflowpipeline.js`                 |  Draw Things script by Cutscene Artist (@wetcircuit on Discord) for basic prompt processing.                                                 |
| `LLM Prompt.txt`                       | System prompt for LLMs to generate structured photoshoot prompts in the correct format.                |

### Project Files

| File                                         | Description                                              |
| -------------------------------------------- | -------------------------------------------------------- |
| `ExampleStoryFlowProject.json`               | Example project demonstrating the editor's capabilities. |
| `StoryFlowProject Street Fashion Korea.json` | Complete street fashion photoshoot project.              |
| `Streetwear.json`                            | Streetwear-focused project template.                     |
| `Wildcard for conversion.txt`                | Sample wildcard script for import testing.               |

### Subdirectories

| Directory                | Description                                                                         |
| ------------------------ | ----------------------------------------------------------------------------------- |
| `Wildcards Plus Source/` | Submodule containing the enhanced Wildcards Plus scripts (linked to separate repo). |
| `Draw Things Scripts/`   | Collection of Draw Things community scripts for reference.                          |

---

## 🚀 Suggested Workflow

### Step 1: Generate Prompt Content with LLM

1. Copy the contents of `LLM Prompt.txt` to your preferred LLM (Claude, GPT-4, etc.)
2. Answer the LLM's interview questions about:
   - **Subject Profile**: Physical characteristics, skin details, identifiers
   - **Aesthetic/Publication**: Photographer style, magazine reference
   - **Storyline**: Narrative arc of the photoshoot
3. The LLM will generate a structured prompt with:
   - `@wildcard` definitions (e.g., `@subject := { ... }`)
   - `#config` definitions (e.g., `#street := { "steps": 12 }`)
   - Shot sequence `[ Shot 1 @wildcard... | Shot 2 @wildcard... ]`

### Step 2: Edit in Storyflow Editor

1. Open `Storyflow Editor for DrawThings.html` in your browser
2. **Import** your generated prompt:
   - Go to **Project** tab → **Import Wildcard Script**
   - Or paste directly and use the Wildcards/Config Shortcuts tabs
3. **Edit** your wildcards, configs, and prompt triggers visually
4. **Export** the final script when ready

### Step 3: Run in Draw Things

1. Copy `sequential-wildcards.js` to Draw Things' Scripts folder
2. In Draw Things:
   - Paste your prompt (with definitions and `[shots]`) in the main prompt area
   - Run the "Sequential Wildcards" script
   - Set your batch count
3. The script will:
   - Parse all `@wildcard` and `#config` definitions
   - Generate each shot in the sequence
   - Apply configs to the generation settings
   - Randomly select from wildcard options

---

## 📖 Syntax Reference

### Wildcard Definitions

```
@name := { option1 | option2 | option3 }
```

- Defines a randomizable wildcard
- Use `@name` in prompts to expand to a random option

### Config Definitions

```
#configname := { "steps": 25, "model": "sdxl.ckpt", "loras": [...] }
```

- Defines a JSON configuration object
- Use `#configname` in a shot to apply that config

### Shot Sequence

```
PROMPT: [ Shot 1 description @subject @lighting | Shot 2 description @subject @pose ]
```

- Each shot separated by `|`
- Wildcards and configs are expanded per-shot

---

## 🔧 Changes from Original Sources

### sequential-wildcards.js (New File)

A **completely new script** created for this project. Features:

- **Sequential Shot Parsing**: Splits `[shot1 | shot2]` into individual generations
- **Balanced Brace Extraction**: Properly handles nested JSON with arrays like `"loras":[{...}]`
- **Config Application**: `#name` flags apply configs for that shot and onwards
- **PROMPT: Marker Detection**: Finds the correct `[...]` sequence even with JSON arrays in configs

### Storyflow Editor for DrawThings.html

Enhanced from the base Storyflow Editor with:
-**Wildcard Import/Export**:To interoperate with wildcard scripts (without configs, also interoperable with original Wildcards Plus)
- **Improved Import/Export**: Balanced brace parsing for nested JSON
- **Load/Save Configs**: Separate config/pose file management

### Wildcards Plus Source (Submodule)

Forked from [ariane-emory/wildcards-plus](https://github.com/ariane-emory/wildcards-plus) with:

- **Photoshoot Mode**: `[shot1 | shot2]` sequential generation
- **Config Definitions**: `#name := {...}` for model/LoRA settings
- **Fixed AST Finalization**: Corrected `__impl_finalize` method signatures
- **Preamble Processing**: Definitions parsed before shot execution

---

## 🖥️ Usage

### Browser Editor

Simply open `Storyflow Editor for DrawThings.html` in any modern web browser (Chrome, Safari, Firefox). No installation or server required.

### Draw Things Scripts

1. Copy the desired `.js` script to Draw Things' Scripts folder:
   - macOS: `~/Library/Containers/com.liuliu.draw-things/Data/Documents/Scripts/`
   - iOS: Via Files app
2. In Draw Things, access via the Scripts menu
3. Enter your prompt in the main prompt area before running the script

---

## 📝 Import/Export Formats

### Import Wildcard Script

Supported format:

```
@subject := { description of subject }
@lighting := { option1 | option2 | option3 }
#myconfig := { "steps": 25, "loras": [...] }

PROMPT: [ Shot 1 @subject @lighting #myconfig | Shot 2 @subject ]
```

### Smart Import Logic

- **Single-option wildcards** → Imported as **Prompt Triggers** (`@name`)
- **Multi-option wildcards** → Imported as **Wildcards** (`$name`)
- **Config definitions** → Imported to **Config Shortcuts** tab

---

## 📄 License

This project is provided as-is for creative use with Draw Things. Wildcards Plus is based on work by [ariane-emory](https://github.com/ariane-emory/wildcards-plus).
