# Coding Conventions

**Analysis Date:** 2026-01-26

## Naming Patterns

**Files:**
- Backend: camelCase with descriptive names (`server.js`, `gpt_router.js`)
- Frontend: camelCase (`Script.js`, `progressive.js`, `shapeshifter.js`)
- Services: descriptive camelCase (`latentMeta.js`)
- HTML/CSS: camelCase (`style.css`, `progressive.css`, `dashboard.css`)

**Functions:**
- camelCase throughout (e.g., `mirrorVoiceCore`, `synthesizeGenerationPrompt`, `updateDNATags`)
- Action-oriented verbs at start: `get`, `set`, `create`, `build`, `render`, `update`, `fetch`, `parse`
- Example patterns:
  - Data fetching: `fetchUserHistory`, `getUserHistory`
  - DOM updates: `renderMirroredVoiceOutput`, `updateDNATags`, `updateSymbolAnchors`
  - Computations: `calculateSimilarity`, `createEmbedding`, `combineExtractionProviders`
  - Observers/trackers: `observeMirroring`, `setupObservers`

**Variables:**
- camelCase for all variables
- Descriptive names: `currentVoiceKit`, `savedKits`, `driftScore`, `latentProfile`
- Boolean flags: prefix with `is` or `has` (e.g., `isJsonResponse`, `hasError`)
- Temporary/loop: brief but clear (`i`, `log`, `kit`, `item`)
- API-related: `userId`, `brandInput`, `contextInput`, `outputContainer`

**Types/Classes:**
- PascalCase for ES6 classes: `InterfaceShapeshifter`, `ProgressiveRevealSystem`
- Constants: UPPER_SNAKE_CASE (e.g., `HISTORY_WINDOW`, `LANGUAGE_MATRIX`)
- Object keys: camelCase matching schema (e.g., `dnaTags`, `symbolAnchors`, `latentProfile`)

**Schema/Data Structure Keys:**
- Consistent camelCase across frontend and backend
- Example from Voice Kit object:
  ```javascript
  {
    tone, vocabulary, archetype, phrasingStyle,
    samplePhrases, phrasesToAvoid,
    dnaTags, symbolAnchors,
    latentProfile, name, rawInput, createdAt
  }
  ```

## Code Style

**Formatting:**
- No linter/formatter configured (no .eslintrc, .prettierrc)
- Observed style: 4-space indentation (implicit standard)
- Line length: varies (up to 100+ chars observed)
- Single quotes for strings in most files
- Semicolons: used consistently

**Linting:**
- No ESLint, Prettier, or Biome configured
- Manual style adherence observed
- Consistency maintained through code review patterns

**Language:**
- ES6+ features used throughout
- `const`/`let` for variables (no `var`)
- Arrow functions: `() => {}` for callbacks
- Template literals: backticks with `${}` for interpolation
- Async/await for promise handling
- `Promise.all()` for parallel operations
- `Promise.race()` for timeout patterns

## Import Organization

**Order:**
1. Built-in Node modules (`require('fs')`, `require('path')`)
2. Third-party dependencies (`express`, `mongoose`, `dotenv`)
3. Security/middleware packages (`helmet`, `cors`, `express-rate-limit`)
4. SDK clients (OpenAI, Anthropic, Google)
5. Local modules (`./gpt_router`, `./services/latentMeta`)
6. Configuration (`.config()` calls)

**Path Aliases:**
- No path aliases configured
- Relative paths: `require('./gpt_router')`, `require('./services/latentMeta')`
- Front-end: script loading order in HTML via `<script>` tags (no modules)

**Example from `/server.js`:**
```javascript
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const fs = require('fs');
const mongoose = require('mongoose');
const { handleGPTRequest } = require('./gpt_router');
const { buildLatentMeta } = require('./services/latentMeta');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
```

## Error Handling

**Patterns:**
- Try/catch blocks around async operations
- Error logging to console with context: `console.error('Context:', error)`
- Graceful fallbacks with default values
- JSON responses with error field: `{ error: "message", details: {...} }`
- HTTP status codes: 400 (missing input), 500 (server error), 503 (db not connected)

**Example from `/server.js` (lines 291-294):**
```javascript
} catch (err) {
  console.error(' Mirror Voice API error:', err);
  res.status(500).json({ error: 'Failed to mirror voice: ' + err.message });
}
```

**Fallback patterns:**
- Retry logic with exponential backoff in `gpt_router.js` (lines 16-24):
  ```javascript
  async function withRetry(fn, retries = 3, delay = 1000) {
    try { return await fn(); }
    catch (err) {
      if (retries === 0) throw err;
      console.warn(`⚠️ API call failed. Retrying...`);
      await new Promise(res => setTimeout(res, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
  }
  ```
- Silent fallbacks with logs: `catch (e) { console.error(...); return defaultValue; }`

## Logging

**Framework:** `console` object (no logging library)

**Patterns:**
- Console methods: `log`, `error`, `warn`
- Emoji prefixes for visual categorization:
  - `✅` (success)
  - `❌` (error)
  - `⚠️` (warning)
  - `🧬` (async operations)
  - `🔮` (classification)
  - `⚡` (parallel operations)
  - `🛡️` (security)
  - `🔭` (observatory/analysis)

**When to log:**
- API lifecycle: request start, response received, errors
- Database operations: connection status, save/fetch operations
- Phase transitions: "Progressive system: Phase X capability granted"
- Async operations: parallel request execution, extraction steps

**Example from `/server.js` (lines 273-274, 322-323):**
```javascript
console.log("🧬 Generating Vector Embedding...");
console.log("🧬 Vectorizing Generated Content for Drift Analysis...");
```

**Example from `/gpt_router.js` (lines 47-48, 158):**
```javascript
console.log("🔮 Classifying User Intent...");
console.log("⚡ Starting Multi-AI Voice Extraction...");
```

## Comments

**When to Comment:**
- Complex algorithms (e.g., cosine similarity calculation in `server.js` lines 81-97)
- Non-obvious intent (e.g., why a particular AI model is chosen)
- Business logic explanations (e.g., "Voice Alchemy" multi-AI synthesis)
- Section headers for major code blocks (e.g., `--- SHADOW TELEMETRY SETUP ---`)

**JSDoc/TSDoc:**
- Not used (no type annotations needed in current Node.js context)
- Inline comments preferred for clarity

**Example section headers from `/server.js`:**
```javascript
// --- SHADOW TELEMETRY SETUP (The "Wiretap") ---
// --- HYBRID PROMPT SYNTHESIZER ---
// --- API ROUTES ---
// HELPER: The Mathematics of the Soul (Cosine Similarity)
```

## Function Design

**Size:**
- Most functions: 10-50 lines
- Complex handlers: up to 100 lines (e.g., `synthesizeGenerationPrompt` in `server.js`)
- Async functions: wrapped in try/catch, include loading state management

**Parameters:**
- Maximum 3-4 positional parameters
- Objects used for complex data: `req.body` contains `{ kit, context, style, userId }`
- Destructuring common for extraction: `const { kits, userId } = req.body`
- Default parameters: `temp = 0.7`, `style = 'auto'`, `retries = 3`

**Return Values:**
- JSON objects for API endpoints: `{ output: string }` or `{ error: string }`
- Data transformation functions return parsed objects
- Void functions (side effects): DOM updates, localStorage writes
- Promise-based: all async operations return promises

**Example function design from `/script.js` (lines 166-206):**
```javascript
async function mirrorVoiceCore() {
  // Validation
  const brandInputValue = brandInput.value.trim();
  if (!brandInputValue) {
    showToast("Please enter some text...", 'warning');
    return false;
  }

  // Loading state
  showLoading();
  try {
    // API call
    const response = await fetch(`${API_BASE_URL}/api/mirror-voice`, {...});
    // Error handling
    if (!response.ok) throw new Error(errorData.error || 'Failed to mirror voice.');
    // Processing
    const data = await response.json();
    data.rawInput = brandInputValue;
    // UI update
    renderMirroredVoiceOutput(data);
    showToast("Voice mirrored successfully!", 'success');
    return true;
  } catch (error) {
    // Error handling
    console.error('Error mirroring voice:', error);
    showToast(`Error mirroring voice: ${error.message}`, 'error');
    return false;
  } finally {
    // Cleanup
    hideLoading();
  }
}
```

## Module Design

**Exports:**
- Node.js CommonJS: `module.exports = { functionName, otherFunction }`
- Example from `/gpt_router.js` (line 697):
  ```javascript
  module.exports = { handleGPTRequest };
  ```
- Example from `/services/latentMeta.js` (line 134):
  ```javascript
  module.exports = { buildLatentMeta };
  ```

**Imports:**
- Destructuring: `const { handleGPTRequest } = require('./gpt_router');`
- Full module: `const express = require('express');`

**Barrel Files:**
- Not used (services have single exports)

**Front-end Module Pattern:**
- No module system (vanilla JavaScript in `<script>` tags)
- Global namespace: `window.mirrorVoice`, `window.saveVoiceKit`, `window.getSavedVoiceKits`
- Classes attached to window: `window.InterfaceShapeshifter`, `window.ProgressiveRevealSystem`
- Initialization: `DOMContentLoaded` event listener (lines 1165+ in `/script.js`)

**Local Storage Pattern:**
- Key format: `pulsecraft_` prefix + context
- Examples: `pulsecraft_userId`, `pulsecraft_history_${mode}`, `pulsecraft_phase_${mode}`
- Parsing: wrapped in try/catch with fallback to empty state

## API Request/Response Patterns

**Request Format:**
- POST requests with JSON body
- Header: `'Content-Type': 'application/json'`
- Includes `userId` for tracking
- Example from `/script.js` (lines 179-182):
  ```javascript
  const response = await fetch(`${API_BASE_URL}/api/mirror-voice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ brandInput: brandInputValue, userId: userId })
  });
  ```

**Response Format:**
- Success: JSON object with data fields
- Error: `{ error: "string", details?: {...} }`
- Status codes: 200 (ok), 400 (client error), 500 (server error), 503 (service unavailable)

**URL Pattern:**
- Base: `http://localhost:3000` (dev) or `window.location.origin` (prod)
- Endpoints: `/api/mirror-voice`, `/api/generate-content`, `/api/refine-kits`, `/api/user-history`, `/api/identity-drift`

---

*Convention analysis: 2026-01-26*
