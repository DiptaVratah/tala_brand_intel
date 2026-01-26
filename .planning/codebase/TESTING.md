# Testing Patterns

**Analysis Date:** 2026-01-26

## Test Framework

**Runner:**
- Not configured
- `package.json` has: `"test": "echo \"Error: no test specified\" && exit 1"`
- No Jest, Vitest, Mocha, or other test framework installed

**Assertion Library:**
- Not applicable (no testing framework)

**Run Commands:**
```bash
npm test                # Currently returns error (not set up)
```

## Testing Status

**Current State:** No automated tests present in codebase

**Code that would benefit from tests:**
- `calculateSimilarity()` in `server.js` (lines 83-97) - Mathematical precision testing
- `latentExtract()` in `gpt_router.js` (lines 299-429) - Multi-AI response parsing
- `combineExtractionProviders()` in `gpt_router.js` (lines 175-207) - Data merging logic
- `buildLatentMeta()` in `services/latentMeta.js` (lines 76-132) - Statistical calculations
- Data parsing functions in `script.js` (lines 98-109 `parseSafeArray`) - Error handling

## Manual Testing Patterns Observed

**Frontend User Flow Testing:**
The codebase includes client-side state validation and error handling:

**Example from `/script.js` (lines 169-175):**
```javascript
const brandInputValue = brandInput.value.trim();

if (!brandInputValue) {
  showToast("Please enter some text to mirror your voice.", 'warning');
  return false;
}
```

**API Error Handling (Tested via try/catch):**
Example from `/script.js` (lines 185-188):
```javascript
if (!response.ok) {
  const errorData = await response.json();
  throw new Error(errorData.error || 'Failed to mirror voice.');
}
```

**Error Toast Notifications:**
All major operations show user-facing feedback via `showToast()`:
- Success: `showToast("Voice mirrored successfully!", 'success')`
- Error: `showToast(`Error mirroring voice: ${error.message}`, 'error')`
- Warning: `showToast("Please enter some text...", 'warning')`

## Backend Validation Patterns

**Input Validation (Server-side):**

Example from `/server.js` (lines 200-204):
```javascript
app.post('/api/mirror-voice', mirrorLimiter, async (req, res) => {
  const { brandInput, userId } = req.body;
  if (!brandInput) {
    return res.status(400).json({ error: 'Missing input text for voice mirroring.' });
  }
```

Example from `/server.js` (lines 301-303):
```javascript
if (!kit || !context) {
  return res.status(400).json({ error: 'Missing kit or context.' });
}
```

**Database Connection Validation:**
Example from `/server.js` (lines 57-63):
```javascript
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to Shadow Database (Telemetry Active)'))
    .catch(err => console.error('❌ Shadow Database Error:', err));
} else {
  console.warn('⚠️ MONGO_URI not found. Telemetry is disabled.');
}
```

## Edge Case Handling

**Array Parsing with Fallbacks:**

Example from `/script.js` (lines 98-109):
```javascript
const parseSafeArray = (value) => {
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn("Error parsing JSON string to array:", value, e);
      return [];
    }
  }
  return Array.isArray(value) ? value : [];
};
```

**JSON Extraction with Fallback Parsing:**

Example from `/gpt_router.js` (lines 637-649):
```javascript
if (isJsonResponse) {
  try {
    const jsonStartIndex = rawContent.indexOf('{');
    const jsonEndIndex = rawContent.lastIndexOf('}');
    if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
      rawContent = rawContent.substring(jsonStartIndex, jsonEndIndex + 1);
    } else {
      console.error(' AI response did not contain a valid JSON object:', rawContent);
      return {
        tone: '', vocabulary: '', phrasingStyle: '', archetype: '',
        samplePhrases: [], phrasesToAvoid: [], dnaTags: [], symbolAnchors: [],
        error: "AI response did not contain a valid JSON object."
      };
    }
```

**Latent Profile Parsing with Bracket Hunter:**

Example from `/gpt_router.js` (lines 379-400):
```javascript
let intentMotifs = {};
try {
  let clean = geminiText;
  const start = clean.indexOf('{');
  const end = clean.lastIndexOf('}');

  if (start !== -1 && end !== -1) {
    clean = clean.substring(start, end + 1);
    intentMotifs = JSON.parse(clean);
  } else {
    intentMotifs = JSON.parse(clean);
  }
} catch (e) {
  console.warn(`Gemini Latent Parse Warning (Handled): ${e.message}`);
  intentMotifs = { communicativeIntent: "Complex Expression", dominantMotifs: [] };
}
```

## Retry and Resilience Patterns

**Exponential Backoff Retry Logic:**

Example from `/gpt_router.js` (lines 16-24):
```javascript
async function withRetry(fn, retries = 3, delay = 1000) {
  try {
    return await fn();
  } catch (err) {
    if (retries === 0) throw err;
    console.warn(`⚠️ API call failed. Retrying in ${delay}ms... (${retries} left)`);
    await new Promise(res => setTimeout(res, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
}
```

**Promise.race() for Timeouts:**

Example from `/server.js` (lines 112-117):
```javascript
const embedPromise = vectorAI.embeddings.create({
  model: "text-embedding-3-small",
  input: text,
  encoding_format: "float",
});

const response = await Promise.race([
  embedPromise,
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Embedding timeout')), 10000)
  )
]);
```

Example from `/gpt_router.js` (lines 611-620):
```javascript
const timeoutPromise = new Promise((_, reject) =>
  setTimeout(() => reject(new Error("OpenAI Request Timed Out")), 60000)
);

try {
  rawContent = await Promise.race([
    callOpenAI(messages, format, temp),
    timeoutPromise
  ]);
```

## Rate Limiting

**Express-rate-limit Configuration:**

Example from `/server.js` (lines 30-42):
```javascript
const mirrorLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: "Too many voice analyses. Please wait 15 minutes to cool down." }
});

const generateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Content generation limit reached. Take a breather." }
});
```

Applied to endpoints:
```javascript
app.post('/api/mirror-voice', mirrorLimiter, async (req, res) => {...});
app.post('/api/generate-content', generateLimiter, async (req, res) => {...});
app.post('/api/refine-kits', generateLimiter, async (req, res) => {...});
```

## Data Validation Patterns

**Schema Validation (OpenAI JSON Schema):**

Example from `/gpt_router.js` (lines 28-41):
```javascript
const voiceAnalysisSchema = {
  type: "OBJECT",
  properties: {
    tone: { type: "STRING" },
    vocabulary: { type: "STRING" },
    phrasingStyle: { type: "STRING" },
    archetype: { type: "STRING" },
    samplePhrases: { type: "ARRAY", items: { type: "STRING" } },
    phrasesToAvoid: { type: "ARRAY", items: { type: "STRING" } },
    dnaTags: { type: "ARRAY", items: { type: "STRING" } },
    symbolAnchors: { type: "ARRAY", items: { type: "STRING" } }
  },
  required: ["tone", "vocabulary", "phrasingStyle", "archetype", "samplePhrases", "phrasesToAvoid", "dnaTags", "symbolAnchors"],
};
```

**Array Validation and Defaults:**

Example from `/gpt_router.js` (lines 654-673):
```javascript
parsedContent.samplePhrases = Array.isArray(parsedContent.samplePhrases) && parsedContent.samplePhrases.length > 0
  ? parsedContent.samplePhrases
  : ['Synthesized insight', 'New resonant truth'];

parsedContent.phrasesToAvoid = Array.isArray(parsedContent.phrasesToAvoid) && parsedContent.phrasesToAvoid.length > 0
  ? parsedContent.phrasesToAvoid
  : ['Stagnation', 'Limitation'];

parsedContent.dnaTags = Array.isArray(parsedContent.dnaTags) && parsedContent.dnaTags.length > 0
  ? parsedContent.dnaTags
  : ['Fusion', 'Evolution', 'Resonance'];

parsedContent.symbolAnchors = Array.isArray(parsedContent.symbolAnchors) && parsedContent.symbolAnchors.length > 0
  ? parsedContent.symbolAnchors
  : ['New Horizon', 'Deep Current', 'Guiding Star'];
```

## Frontend State Testing

**localStorage Persistence Testing Pattern:**

Example from `/script.js` (lines 111-135):
```javascript
window.getSavedVoiceKits = function() {
  const currentMode = window.pulsecraftShapeshifter ? window.pulsecraftShapeshifter.mode : 'consciousness';
  const key = `pulsecraft_history_${currentMode}`;
  try {
    const saves = localStorage.getItem(key);
    let kits = [];
    if (saves) {
      kits = JSON.parse(saves);
    }
    return kits.map(kit => {
      return {
        ...kit,
        samplePhrases: parseSafeArray(kit.samplePhrases),
        phrasesToAvoid: parseSafeArray(kit.phrasesToAvoid),
        dnaTags: parseSafeArray(kit.dnaTags),
        symbolAnchors: parseSafeArray(kit.symbolAnchors)
      };
    });
  } catch (error) {
    console.error("Error parsing saved kits from localStorage:", error);
    showToast("Error loading saved kits. Local storage may be corrupted.", 'error');
    localStorage.removeItem(key);
    return [];
  }
};
```

## Multi-AI Response Consistency

**Parallel Request Testing Pattern:**

Example from `/gpt_router.js` (lines 165-172):
```javascript
const [baseJSON, claudeText, geminiText] = await Promise.all([
  withRetry(() => callOpenAI(openaiMsg, { type: "json_object" }, 0.2)),
  withRetry(() => callAnthropic("You reveal deeper emotional tone...", prompt, 0.4)),
  withRetry(() => callGoogle("You provide bullet-level linguistic analysis...", prompt))
]);
```

All three AI calls fire in parallel, then combined responses are processed with fallbacks.

## Loading State Management

**Frontend Loading Overlay Pattern:**

Example from `/script.js` (lines 72-96):
```javascript
function showLoading(message = 'Reflecting truth...') {
  activeRequests++;
  if (loadingOverlay) {
    loadingOverlay.classList.remove('hidden');
    if (loadingText) {
      loadingText.textContent = message || (window.pulsecraftShapeshifter ? window.pulsecraftShapeshifter.LANGUAGE_MATRIX[window.pulsecraftShapeshifter.mode].loadingText : 'Reflecting truth...');
    }
  }
}

function hideLoading() {
  activeRequests--;
  if (activeRequests <= 0) {
    if (loadingOverlay) {
      loadingOverlay.classList.add('hidden');
    }
    activeRequests = 0;
  }
}
```

Used with try/finally:
```javascript
showLoading();
try {
  const response = await fetch(...);
  // processing
} catch (error) {
  // error handling
} finally {
  hideLoading();
}
```

## Observed Testing Gaps

**Critical areas without tests:**
1. **Mathematical operations** - `calculateSimilarity()` needs numerical accuracy tests
2. **Data transformation** - `combineExtractionProviders()`, `combineAlchemyProviders()` need unit tests
3. **API integration** - OpenAI, Anthropic, Google SDK interactions need mock tests
4. **Database operations** - MongoDB connection, queries, save operations need integration tests
5. **Multi-AI orchestration** - `handleGPTRequest()` with different types ('voice', 'refine', 'content')
6. **localStorage persistence** - Edge cases like corrupted data, quota limits
7. **UI state management** - Progressive phase unlocking, mode switching
8. **Error recovery** - Timeout handling, retry exhaustion, API failures

## Recommended Testing Approach

**Setup (if implemented):**
```bash
npm install --save-dev jest @testing-library/dom
```

**Test file location:**
- `__tests__/` directory at root or alongside source
- Pattern: `src/server.test.js`, `src/gpt_router.test.js`, etc.

**Example test structure (conceptual):**
```javascript
describe('calculateSimilarity', () => {
  it('returns 1.0 for identical vectors', () => {
    const vec = [1, 0, 0];
    expect(calculateSimilarity(vec, vec)).toBe(1.0);
  });

  it('returns 0.0 for orthogonal vectors', () => {
    expect(calculateSimilarity([1, 0], [0, 1])).toBe(0);
  });

  it('handles edge cases', () => {
    expect(calculateSimilarity(null, [1, 0])).toBe(0);
    expect(calculateSimilarity([1, 2], [1, 2, 3])).toBe(0);
  });
});
```

---

*Testing analysis: 2026-01-26*
