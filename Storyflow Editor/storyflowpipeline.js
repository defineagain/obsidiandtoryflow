// @api-1.0
// Storyflow Pipeline 251124
// author wetcircuit
//
// use with Storyflow Editor
// [Export to Pipeline] saves a .txt
// open the .txt and Copy the JSON
// Paste the full instructions in Pipeline
// Preflight Check will attempt to validate
//
//

//MENU A
//
const userSelectionA = requestFromUser(
  "Storyflow Pipeline",
  "Preflight Check",
  function () {
    return [
      this.section(
        "ℹ️ info",
        " Storyflow Editor (html) exports instructions for Pipeline. \n Create a sequence with full-configs and prompts. \n Export the instructions using [Export to Pipeline] or [Copy to Clipboard]. \n Paste the instructions in the textbox below.",
        [],
      ),

      this.section(
        "Storyflow Instructions",
        " Pipeline expects formatted JSON from Storyflow Editor \n [the square brackets and everything inbetween]",
        [this.textField("", "[{ Paste Instructions Here }]", true, 320)],
      ),

      this.section(
        "🌐 Storyflow Editor Online", 
        "The latest version of Storyflow Editor is online at:", 
        [this.textField("https://cutsceneartist.com/DrawThings/StoryflowEditor_online.html","https://cutsceneartist.com/DrawThings/StoryflowEditor_online.html", false, 20)]
)
    ];
  },
);

// User Menu Options
//
let userText = userSelectionA?.[1]?.[0] || "";
// 🟢 CHANGE: Use an array to store all warnings
let warnings = [];
let parsedInstruction;

try {
  parsedInstruction = JSON.parse(userText);
} catch (e) {
  // 🟢 CHANGE: Push JSON error to the array instead of overwriting a string
  warnings.push(" Invalid JSON – please see the Troubleshoot suggestions");
  parsedInstruction = [];
}

const instructions = parsedInstruction || [];

// Validation rules
//
const allowedKeys = {
  note: { type: "string" },
  prompt: { type: "string" },
  config: { type: "object" },
  frames: { type: "number" },
  faceZoom: { type: "flag" },
  askZoom: { type: "string" },
  removeBkgd: { type: "flag" },
  canvasClear: { type: "flag" },
  canvasSave: { type: "string", allowedExtensions: ["png"] },
  canvasLoad: { type: "string", allowedExtensions: ["png", "jpg", "webp"] },
  moveScale: { type: "object" },
  adaptSize: { type: "object" },
  crop: { type: "flag" },
  moodboardClear: { type: "flag" },
  moodboardCanvas: { type: "flag" },
  moodboardLoad: { type: "flag" }, // legacy same as moodboardCanvas
  moodboardAdd: { type: "string", allowedExtensions: ["png", "jpg", "webp"] },
  loopAddMB: { type: "string", allowedExtensions: ["png", "jpg", "webp"] },
  moodboardRemove: { type: "number" },
  moodboardWeights: { type: "object" },
  maskClear: { type: "flag" },
  maskLoad: { type: "string", allowedExtensions: ["png", "jpg", "webp"] },
  maskGet: { type: "flag" },
  maskBkgd: { type: "flag" },
  maskFG: { type: "flag" },
  maskBody: { type: "flag" },
  maskAsk: { type: "string" },
  depthExtract: { type: "flag" },
  depthCanvas: { type: "flag" },
  depthToCanvas: { type: "flag" },
  inpaintTools: { type: "object" },
  xlMagic: { type: "object" },
  negPrompt: { type: "string" },
  poseExtract: { type: "flag" },
  poseJSON: { type: "object" },
  loop: { type: "object" },
  loopLoad: { type: "string" },
  loopSave: { type: "string", allowedExtensions: ["png"] },
  loopEnd: { type: "flag" },
  end: { type: "flag" },
};

// Validate instruction array
//
function validateInstructionArray(arr) {
  const invalidKeys = [];
  const invalidTypes = [];

  for (const [index, item] of arr.entries()) {
    const key = Object.keys(item)[0];
    const value = item[key];

    if (!(key in allowedKeys)) {
      invalidKeys.push({ index, key });
      continue;
    }

    const rules = allowedKeys[key];

    // Key Type validation
    //
    if (rules.type === "flag") {
      continue;
    }
    if (typeof value !== rules.type) {
      invalidTypes.push({
        index,
        key,
        expected: rules.type,
        actual: typeof value,
      });
    }
    // 👇 FIX: Use the new allowedExtensions property for file path validation
    else if (rules.allowedExtensions) {
      // 1. Get the file extension (case-insensitive)
      const extensionMatch = value.match(/\.(png|jpg|webp)$/i);
      let actualExtension = extensionMatch ? extensionMatch[1].toLowerCase() : null;

      // 2. Check if the extension is in the allowed list
      if (!actualExtension || !rules.allowedExtensions.includes(actualExtension)) {
        invalidTypes.push({
          index,
          key,
          // Create a comma-separated list of expected extensions
          expected: `a file path ending in one of: ${rules.allowedExtensions.map(e => `.${e}`).join(', ')}`,
          actual: value,
        });
      }
    }
  }

  return { invalidKeys, invalidTypes };
}

// Collect model-related strings from config objects
//
function collectModelStringsFromConfig(config) {
  const result = [];

  function search(obj) {
    for (const key of Object.keys(obj)) {
      const value = obj[key];

      if (
        key === "model" ||
        key === "refinerModel" ||
        key === "file" ||
        key === "upscaler"
      ) {
        if (typeof value === "string") {
          result.push(value);
        }
      } else if (typeof value === "object" && value !== null) {
        search(value);
      }
    }
  }

  search(config);
  return result;
}

// Parse the Keys
//
const { invalidKeys, invalidTypes } = validateInstructionArray(instructions);

// Collect model strings
//
const modelStrings = instructions
  .filter((item) => item.config)
  .flatMap((item) => collectModelStringsFromConfig(item.config));

// 🟢 CHANGE: Validate and report ALL errors
//
if (invalidKeys.length > 0) {
  invalidKeys.forEach(({ index, key }) => {
    // 🟢 PUSH all errors to the array
    warnings.push(`Item ${index}: Invalid key "${key}"`);
  });
}

if (invalidTypes.length > 0) {
  invalidTypes.forEach(({ index, key, expected, actual }) => {
    // 🟢 PUSH all errors to the array
    // Check if the error is a file path error by looking for the "file path" string in the expected message
    if (expected.includes("file path")) {
        // Use a more specific file path error message
        warnings.push(`Item ${index}: "${key}" - Invalid file path or extension. Expected ${expected.replace('a file path ending in one of: ', '')} but got "${actual}"`);
    } else {
        // This handles standard type mismatches (string, object, number, etc.)
        warnings.push(`Item ${index}: "${key}" - Expected ${expected} but got ${actual}`);
    }
  });
}

function truncateFilePath(fullPath) {
  // Step 1: Split the path by '/' and remove empty strings
  const parts = fullPath.split("/").filter(Boolean);

  // Step 2: Check if there are at least two directory levels (first and second)
  if (parts.length < 2) {
    // Fallback to original path if it doesn't meet expected structure
    return fullPath;
  }

  // Step 3: Extract the relevant parts
  const firstPart = parts[0];
  const secondPart = parts[1];
  const lastPart = parts[parts.length - 1];

  // Step 4: Format the output string as ~<first>/<second>/<last>
  return `~${firstPart}/${secondPart}/${lastPart}`;
}

// collect path strings ... (moodboardLoad fix)
//
const picturesPath = filesystem.pictures.path;
const displayPath = truncateFilePath(picturesPath);
const pathStrings = instructions.flatMap((obj) =>
  Object.entries(obj)
    .filter(([key]) => ["canvasSave", "canvasLoad", "moodboardAdd", "maskLoad", "loopSave", "loopLoad", "loopAddMB"].includes(key))
    .map(([key, value]) => {
      if (key === "canvasSave" || key === "loopSave") {
        return ` 🔻 ${value}`;
      } else {
        return ` 🔺 ${value}`;
      }
    }),
);

// collect prompt strings
//
const promptString = instructions.flatMap((obj) =>
  Object.entries(obj)
    .filter(([key]) => ["prompt"].includes(key))
    .map(([key, value]) => value),
);

// Check which models have been downloaded, and format
//
const loaded = pipeline.areModelsDownloaded(modelStrings);
const annotatedModelStrings = modelStrings.map((modelName, index) => {
  return loaded[index] ? " 🔹 " + modelName : " 🔸 " + modelName;
});

// Preflight Messages
//
let joinedModelString = annotatedModelStrings.join("\n");
let joinedPathString = pathStrings.join("\n");
// 🟢 CHANGE: Join all accumulated warnings for display
const joinedWarningString = warnings.join("\n");

const modelMessage = joinedModelString
  ? joinedModelString +
    "\n\nplease check that all models are available before starting Pipeline \n 🔹 model is downloaded \n 🔸 model is not available locally"
  : " no models found – Pipeline will use the available UI model \n\n ⁉️ Does your Storyflow project need a full config at the start? 🤔";

const pathMessage = joinedPathString
  ? ` ${displayPath}/... \n\n${joinedPathString} \n\nfiles can overwrite (do all sub-folders exist?) \n 🔻 save files \n 🔺  load files`
  : " 👌 no Save/Load instructions found.";

const infoMessage = `number of renders: ${promptString.length}`;
const warningMessage = "Instructions cannot be processed";
const warningInfo =
  " Pipeline expects instructions from Storyflow Editor \n use the [Export to Pipeline] option to save a .txt \n open the .txt and Copy the full contents \n Paste the instructions in the previous menu \n (cancel and relaunch the script)";
const troubleshoot =
  "\n 1. Copy/Paste the entire instructions array \n [{ the square brackets and everything between }]. \n\n 2. Storyflow Editor and Pipeline versions should match. \n - new commands won't be recognized\n\n 3. Save/Load filepaths must be within the Pictures directory. \n\n 4. All Save/Load files must be .png";

// PRE-FLIGHT CHECK
//

// 🟢 CHANGE: Check the warnings array length instead of the single string
if (warnings.length === 0) {
  //MENU B Pass Checks
  //
  const userSelectionB = requestFromUser(
    "Storyflow Pipeline – Preflight Check",
    "Start Pipeline",
    function () {
      return [
        this.section("📋 project info", infoMessage, []),

        this.section("✅ JSON appears valid", " preflight check passed", []),

        this.section("🤗 MODELS", modelMessage, []),

        this.section("📁 FILES for Save/Load", pathMessage, []),
      ];
    },
  );
} else {
  //MENU B warning
  //
  const userSelectionB = requestFromUser(
    "Storyflow Pipeline – Preflight Check",
    "🚫 Pipeline will fail",
    function () {
      return [
        this.section(`⛔ ${warningMessage}`, warningInfo, []),

        // 🟢 CHANGE: Display the joined warning string with ALL errors
        this.section("⚠️ WARNINGS FOUND", joinedWarningString, []),

        this.section("🔧 TROUBLESHOOT", troubleshoot, []),
      ];
    },
  );
}


//
// SPECIAL FUNCTIONS
//


function xlMagic(ois, tis, nois) {
  // Predefined array of size objects
  const sizes = [
    { width: 256, height: 192 },
    { width: 512, height: 384 },
    { width: 768, height: 576 },
    { width: 1024, height: 768 },
    { width: 1280, height: 960 },
    { width: 1536, height: 1152 },
    { width: 1792, height: 1344 },
    { width: 2048, height: 1536 }
  ];

  const oisIndex = Math.max(1, Math.min(ois, 8)) - 1;
  const tisIndex = Math.max(1, Math.min(tis, 8)) - 1;
  const noisIndex = Math.max(1, Math.min(nois, 8)) - 1;

    configuration.originalImageWidth = sizes[oisIndex].width;
    configuration.originalImageHeight = sizes[oisIndex].height;

    configuration.targetImageWidth = sizes[tisIndex].width;
    configuration.targetImageHeight = sizes[tisIndex].height;

    configuration.negativeOriginalImageWidth = sizes[noisIndex].width;
    configuration.negativeOriginalImageHeight = sizes[noisIndex].height;

  return;
}


function adaptAndResetCanvas(maxWidth, maxHeight) {
    // Get the dimensions of the loaded image via boundingBox


  function resizeAndReset() {
    if (canvas.boundingBox.width <= 0 || canvas.boundingBox.height <= 0) {
      console.error("Invalid or zero-sized bounding box.");
      return;
    }

    // Clamp to max dimensions
    const adjustedWidth = Math.min(canvas.boundingBox.width, maxWidth);
    const adjustedHeight = Math.min(canvas.boundingBox.height, maxHeight);

    configuration = {
      ...configuration,
      width: adjustedWidth,
      height: adjustedHeight
    };

            // Update the canvas size
            try {
                canvas.updateCanvasSize(configuration);

                // Reset zoom and center the canvas
                canvas.canvasZoom = 1;
                canvas.moveCanvas(0, 0);
            } catch (error) {
                console.error("Error updating the canvas size:", error);
            }
        } 

    // Wait for boundingBox to be ready
      __dtSleep(.2);


    // Run resizing and resetting after verification
    resizeAndReset();
}


// --- Helper Functions (Extracted Logic) ---

/**
 * Resets the canvas zoom and position to the default fallback state.
 * This logic was previously duplicated in faceZoom's catch block and else block.
 */
function fallbackCanvasZoom() {
  canvas.canvasZoom = 1.2;
  canvas.moveCanvas(
    configuration.width * 0.06,
    configuration.height * 0.06,
  );
}

/**
 * Applies the constrained zoom and move logic to the canvas based on a given rect.
 * This logic was previously central to faceZoom().
 *
 * @param {object} rect The rectangle object with { origin: {x, y}, size: {width, height} }
 */
function applyZoomAndMove(rect) {
  // Check if the rect is valid and meets the size criterion for zooming
  if (rect && rect.size && rect.size.height < configuration.height * 0.65) {

    // 1. Determine the final zoom level (myZoom/2 is the target zoom)
    const finalZoom = Math.max(1.5, canvas.canvasZoom / 1.8);

    // 2. Calculate the desired canvas top-left position to center the rect at the *final* zoom
    // Center of the rect in absolute coordinates
    const rectCenterX = rect.origin.x + rect.size.width / 2;
    const rectCenterY = rect.origin.y + rect.size.height / 2;
    
    // Desired top-left coordinate (x_0, y_0) such that the rect is centered
    // This is the absolute coordinate of the canvas's new center point (configuration.width/2, configuration.height/2)
    // Formula: x_0 = (rect_center * finalZoom) - (canvas_width / 2) / finalZoom  <-- Correction based on how most canvas libs work
    
    // Instead of using moveCanvasToRect and then adjusting, let's directly calculate the new canvas move.
    // The canvas's top-left (move coordinates) is the point in the full image that appears
    // at the top-left of the viewport.
    
    // Calculate the movement (x_move, y_move) in original image coordinates
    // that positions the rect's center at the screen's center (configuration.width/2, configuration.height/2)
    const desiredMoveX = rectCenterX - (configuration.width / 2) / finalZoom;
    const desiredMoveY = rectCenterY - (configuration.height / 2) / finalZoom;

    // 3. Constrain the movement to keep the canvas viewable within the bounds 
    const maxMoveX = pipeline.configuration.width - configuration.width / finalZoom;
    const maxMoveY = pipeline.configuration.height - configuration.height / finalZoom;

    // Constrain the final position (tempW, tempH)
    const tempW = Math.min(
      Math.max(0, desiredMoveX),
      Math.max(0, maxMoveX) // MaxMoveX must be at least 0 in case finalZoom is very small
    );

    const tempH = Math.min(
      Math.max(0, desiredMoveY),
      Math.max(0, maxMoveY)
    );

    // 4. Apply the final move and zoom
    canvas.moveCanvas(tempW, tempH);
    canvas.canvasZoom = finalZoom; // Set the calculated zoom
    
  } else {
    // If rect is null, invalid, or too large, perform the reset action
    fallbackCanvasZoom();
  }
}

/**
 * Executes the LLM query, parses the malformed JSON response, and converts
 * normalized coordinates into an absolute Rect object for canvas use.
 *
 * @param {string} query The query string for the LLM.
 * @returns {object|null} The absolute rect object, or null if parsing fails.
 */
function getAbsoluteRectForQuery(query) {
  const getRect = "get rectangle around " + query;
  const answerString = canvas.answer(askModel, getRect);
  // console.log(answerString);

  const normalizedCoords = parseMalformedJson(answerString);

  if (!normalizedCoords || normalizedCoords.length < 4) {
    console.error("Failed to parse valid coordinates from Ask response.");
    return null;
  }

  const canvasWidth = pipeline.configuration.width;
  const canvasHeight = pipeline.configuration.height;

  let startIndex = 0;
  // Check for an optional fifth coordinate (e.g., a confidence score)
  if (normalizedCoords.length === 5) {
    startIndex = 1;
  }

  const x_norm = normalizedCoords[startIndex];
  const y_norm = normalizedCoords[startIndex + 1];
  const x_max_norm = normalizedCoords[startIndex + 2];
  const y_max_norm = normalizedCoords[startIndex + 3];

  // Calculate the absolute pixel coordinates and dimensions
  const x_abs = Math.floor(x_norm * canvasWidth);
  const y_abs = Math.floor(y_norm * canvasHeight);
  const w_abs = Math.floor((x_max_norm - x_norm) * canvasWidth);
  const h_abs = Math.floor((y_max_norm - y_norm) * canvasHeight);

  // Return the rect in the required format: { origin: {x, y}, size: {width, height} }
  return {
    origin: { x: x_abs, y: y_abs },
    size: { width: w_abs, height: h_abs },
  };
}

// --- Original and New Primary Functions ---

/**
 * Original function to parse numeric coordinates from malformed JSON string.
 */
function parseMalformedJson(answerString) {
  // Step 1: Extract all valid numeric values (including decimals)
  const matches = answerString.match(/-?\d+(?:\.\d+)?/g);
  if (!matches) return [];

  // Step 2: Convert strings to floats
  const numbers = matches.map(Number);
  return numbers;
}

/**
 * Refactored faceZoom function using the shared applyZoomAndMove logic.
 */
function faceZoom() {
  try {
    const faces = canvas.detectFaces();
    // Pass the first face rect to the shared zoom/move logic
    applyZoomAndMove(faces[0]);
  } catch (error) {
    // If detection fails, use the shared reset logic
    fallbackCanvasZoom();
  }
  return;
}

/**
 * Refactored maskAsk function using the shared getAbsoluteRectForQuery logic.
 */
function maskAsk(query) {
  const rect = getAbsoluteRectForQuery(query);

  if (!rect) {
    return canvas.createMask(
      pipeline.configuration.width,
      pipeline.configuration.height,
      0.0
    ); // Return an empty mask on failure
  }

  // 1. Get the current canvas dimensions for createMask
  const canvasWidth = pipeline.configuration.width;
  const canvasHeight = pipeline.configuration.height;

  // 2. Create a new, blank (solid black/0.0) mask to start
  const newMask = canvas.createMask(canvasWidth, canvasHeight, 0.0);

  // 3. Fill the calculated rectangle region with solid white (1.0)
  newMask.fillRectangle(
    rect.origin.x,
    rect.origin.y,
    rect.size.width,
    rect.size.height,
    1.0
  );

  return newMask;
}

/**
 * NEW function: Performs the query for a rect and then zooms the canvas to that rect.
 */
function askZoom(query) {
  const rect = getAbsoluteRectForQuery(query);
  // Reuses the core canvas manipulation logic
  applyZoomAndMove(rect);
  return;
}

function setBodyparts(value) {
      let bodyparts = [];
      if (value.upper) bodyparts.push(BodyMaskType.UPPER_BODY);
      if (value.lower) bodyparts.push(BodyMaskType.LOWER_BODY);
      if (value.clothes) bodyparts.push(BodyMaskType.CLOTHING);
      if (value.neck) bodyparts.push(BodyMaskType.NECK);
      const newMask = canvas.bodyMask(bodyparts, value.extra);
      return newMask;
}

function crop() {
      canvas.updateCanvasSize(configuration);
      const bank = canvas.saveImageSrc((visibleRegionOnly = true));
      canvas.clear();
      canvas.loadImageSrc(bank);
      return;
}


function generatePath(value, i) {
  // Step 1: Split directory and filename
  const lastSlashIndex = value.lastIndexOf('/');
  let dirPath;
  let fileName;

  if (lastSlashIndex === -1) {
    dirPath = '';
    fileName = value;
  } else {
    dirPath = value.substring(0, lastSlashIndex + 1);
    fileName = value.substring(lastSlashIndex + 1);
  }

  // Step 2: Split filename into base name and extension
  const lastDotIndex = fileName.lastIndexOf('.');
  let baseName;
  let extension;

  if (lastDotIndex === -1) {
    baseName = fileName;
    extension = '';
  } else {
    baseName = fileName.substring(0, lastDotIndex);
    extension = fileName.substring(lastDotIndex + 1);
  }

const maxDigits = String(i).length;
const paddedIncrement = String(i).padStart(3, '0');

  // Step 4: Build new filename
  let newFileName;
  if (extension) {
    newFileName = `${baseName}_${paddedIncrement}.${extension}`;
  } else {
    newFileName = `${baseName}_${paddedIncrement}`;
  }

  // Step 5: Combine and return full path
  return dirPath + newFileName;
}




function getDirectoryByIndex(relativeDirectory, index) {
    try {
        const entries = filesystem.pictures.readEntries(relativeDirectory);
        if (!entries || entries.length === 0) {
            console.warn(`Directory not found or is empty: ${relativeDirectory}`);
            return;
        }
        entries.sort((a, b) => 
            a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        );
        const count = entries.length;
        const loopedIndex = ((index % count) + count) % count;
        return entries[loopedIndex];
    } catch (error) {
        console.error(`Error reading directory: ${error.message}`);
        throw error;  // Re-throw or handle as appropriate
    }
}





//
// SUPERLOOPER
//



let configuration = pipeline.configuration;
let negativePrompt = pipeline.prompts.negativePrompt;
let Pvalue;
let mask = null;
let askModel = "blip2_eva_vit_q8p.ckpt";
let _loopMarker = -1;
let _loopCounter = 0;
let _maxLoops = 0;
let _startCount = 0;
let sleep = 0.1




// Process each instruction in the array
//
for (let i = 0; i < instructions.length; i++) {
  let instruction = instructions[i];
  // Extract key and value from current instruction object
  const key = Object.keys(instruction)[0];
  const value = instruction[key];

  // Execute command based on key type
  switch (key) {
    case "note":
      // do nothing
      break;

    case "prompt":
      // Prompt triggers canvas update and render
if (mask !== null) {
  canvas.updateCanvasSize(configuration);
  pipeline.run({
    configuration: configuration,
    prompt: value,
    negativePrompt: negativePrompt,
    mask: mask,
  });
} else {
  canvas.updateCanvasSize(configuration);
  pipeline.run({
    configuration: configuration,
    prompt: value,
    negativePrompt: negativePrompt,
  });
}
      break;

    case "negPrompt":
      // sets negative prompt. does not render
      negativePrompt = value;
      break;

    case "config":
      // edits the values, but does NOT update the config
      Object.assign(configuration, value);
      break;

    case "frames":
      // edits the numFrames
      configuration.numFrames = value;
      break;

    case "faceZoom":
      // attempt face detection and zoom logic
      faceZoom();
      break;

    case "askZoom":
      //  zoom based on a rect created by answer() logic
      askZoom(value);
      break;

    case "removeBkgd":
      // remove background logic
      canvas.loadMaskFromSrc(canvas.backgroundMask.src);
      __dtSleep(sleep);
      break;

    case "canvasClear":
      // Clear canvas logic
      canvas.clear();
      __dtSleep(sleep);
      break;

    case "canvasSave":
      // Save canvas to .png
      Pvalue = picturesPath + "/" + value;
      canvas.saveImage(Pvalue, (visibleRegionOnly = false));
      __dtSleep(sleep);
      break;

    case "canvasLoad":
      // update config before Loading canvas png
      canvas.updateCanvasSize(configuration);
      Pvalue = picturesPath + "/" + value;
      canvas.loadImage(Pvalue);
      __dtSleep(sleep);
      break;

    case "moveScale":
      // set moveCanvas and canvasZoom
      canvas.moveCanvas(value.position_X, value.position_Y);
      canvas.canvasZoom = value.canvas_scale;
      break;

    case "adaptSize":
      // trim canvas logic
      // value.maxHeight, value.maxWidth
      adaptAndResetCanvas(value.maxWidth, value.maxHeight);
      __dtSleep(sleep);
      break;

    case "crop":
      // crop to visible canvas
      crop();
      break;

    case "moodboardClear":
      // Clear moodboard logic
      canvas.clearMoodboard();
      __dtSleep(sleep);
      break;

    case "moodboardCanvas":
      // send canvas to moodboard
      canvas.addToMoodboardFromSrc(
        canvas.saveImageSrc((visibleRegionOnly = true)),
      );
      __dtSleep(sleep);
      break;

    case "moodboardLoad":
      // legacy function from beta 1, updated to MoodboardCanvas
      canvas.addToMoodboardFromSrc(
        canvas.saveImageSrc((visibleRegionOnly = true)),
      );
      canvas.clear();
      break;

    case "moodboardAdd":
      // add to moodboard from file
      Pvalue = "file://" + picturesPath + "/" + value;
      canvas.addToMoodboardFromSrc([Pvalue]);
      __dtSleep(0.2);
      break;

    case "loopAddMB":
      // add to moodboard incrementally from directory
      Pvalue = "file://" + getDirectoryByIndex(value, _loopCounter);
      canvas.addToMoodboardFromSrc([Pvalue]);
      __dtSleep(0.2);
      break;

    case "moodboardRemove":
      // remove moodboard at index
      canvas.removeFromMoodboardAt(value);
      __dtSleep(sleep);
      break;

     case "moodboardWeights":
      // set each moodboard at index, if present in the instruction
      for (let i = 0; i <= 11; i++) {
        const key = 'index_' + i;
        if (key in value) {
          canvas.setMoodboardImageWeight(value[key], i);
        }
      }
      break;

    case "maskClear":
      // reset mask to null logic
      mask = null;
      break;

    case "maskLoad":
      // load mask from path logic
      Pvalue = "file://" + picturesPath + "/" + value;
      canvas.loadMaskFromSrc(Pvalue);
      __dtSleep(0.2);
      mask = null;
      break;

    case "maskGet":
      // copy mask layer to canvas logic
      if (mask !== null) {
        canvas.loadImageSrc(mask.src);
      }
      break;

    case "maskBkgd":
      // set mask to background logic
      mask = canvas.backgroundMask;
      break;

    case "maskFG":
      // set mask to foreground logic
      mask = canvas.foregroundMask;
      break;

    case "maskBody":
      // set mask to foreground logic
      mask = setBodyparts(value);
      break;

    case "maskAsk":
      // create a mask based on Answer() logic
      mask = maskAsk(value);
      break;

    case "depthExtract":
      // extract depth from canvas logic
      canvas.extractDepthMapFromSrc(
        canvas.saveImageSrc((visibleRegionOnly = true)),
      );
      __dtSleep(sleep);
      break;

    case "depthCanvas":
      // load depth from Canvas logic
      canvas.loadDepthMapFromSrc(canvas.saveImageSrc(visibleRegionOnly = true));
      break;

    case "depthToCanvas":
      // load depth from Canvas logic
      canvas.loadImageSrc(canvas.saveDepthMapSrc());
      break;

    case "inpaintTools":
      // edits the values, but does NOT update the config
      Object.assign(configuration, value);
      break;

    case "xlMagic":
      // XL Magic latents
      // value.original, value.target, value.negative
      xlMagic(value.original, value.target, value.negative);
      break;

    case "poseExtract":
      // extract pose from canvas logic
      canvas.loadPoseFromSrc(canvas.saveImageSrc(visibleRegionOnly = true));
      __dtSleep(sleep);
      break;

    case "poseJSON":
      // add pose from JSON logic
      canvas.loadPoseFromJson(value);
      break;

    case "loop":
      // value.loop is the total number of loops (e.g., 5)
      // value.start is an optional starting frame number/index for the incrementals
      if (_loopMarker === -1) {
        // Only initialize on the first pass
        _loopMarker = i;
        _loopCounter = 0;
        _maxLoops = value.loop || 1; // Default to 1 if not specified
        _startCount = value.start;
        // Initial setup for loopLoad/loopSave can go here if needed
      }
      break;

    case "loopLoad":
      // Incremental load logic
      // Note: Assumes directory contains files indexed from 0 or 'value.start'
      Pvalue = getDirectoryByIndex(value, _loopCounter);
      canvas.loadImage(Pvalue);
      __dtSleep(sleep);
      break;

    case "loopSave":
      // Incremental save logic
      Pvalue = generatePath(value, _loopCounter + _startCount);
      Pvalue = picturesPath + "/" + Pvalue;
      canvas.saveImage(Pvalue, (visibleRegionOnly = false));
      __dtSleep(sleep);
      break;

    case "loopEnd":
      _loopCounter++; // Increment the counter
      if (_loopCounter < _maxLoops) {
        // Loop not depleted, jump back to the 'loop' instruction
        i = _loopMarker - 1; // Subtract 1 because 'i++' in the for loop will increment it back to _loopMarker
      } else {
        // Loop finished, reset markers to allow for future loops
        _loopMarker = -1;
        _loopCounter = 0;
        _maxLoops = 0;
      }
      break;

    case "end":
      // PLACEHOLDER: End process logic
      console.log("ENDING PIPELINE");
      break;

    default:
      console.warn("Unknown instruction type:", key);
  }
}