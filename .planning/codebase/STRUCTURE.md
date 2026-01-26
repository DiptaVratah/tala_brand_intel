# Codebase Structure

**Analysis Date:** 2026-01-26

## Directory Layout

```
tala_brand_intel/
├── server.js                  # Express backend: API routes, telemetry, orchestration
├── gpt_router.js              # Multi-AI orchestrator: Provider selection, extraction, alchemy
├── package.json               # Node dependencies (express, mongoose, AI SDKs)
├── package-lock.json          # Locked dependency versions
├── .env                        # Environment variables (API keys, MONGO_URI)
├── .gitignore                 # Git ignore patterns
│
├── services/
│   └── latentMeta.js          # Silent analytical layer: Stability, tension, coherence computation
│
├── pulsecraft_ui/             # Frontend: All browser-facing code and styles
│   ├── index.html             # HTML structure with 5 phases
│   ├── script.js              # Core functionality: API calls, voice kit management, rendering
│   ├── progressive.js         # Phase reveal system: Capability tracking, visibility control
│   ├── shapeshifter.js        # Theme switcher: Multi-mode language system (consciousness/subconscious)
│   ├── style.css              # Base styles
│   ├── progressive.css        # Phase transition and animation styles
│   ├── enhancement.css        # Additional component styling
│   ├── shapeshifter.css       # Mode-specific theme styles
│   ├── dashboard.css          # Timeline and history view styles
│   └── brand_kit_*.txt        # Sample voice kit file (reference)
│
└── .planning/
    └── codebase/              # Analysis documents (this file, ARCHITECTURE.md, etc.)
```

## Directory Purposes

**Project Root:**
- Purpose: Node.js application entry point and configuration
- Contains: Server runtime, environment setup, dependency manifests
- Key files: `server.js` (main backend), `package.json` (dependencies), `.env` (secrets)

**`services/` Directory:**
- Purpose: Modular backend utilities with single responsibilities
- Contains: Analytical functions not tied to HTTP routing
- Key files: `latentMeta.js` (longitudinal voice analysis)

**`pulsecraft_ui/` Directory:**
- Purpose: Complete frontend application (HTML, CSS, JavaScript)
- Contains: User interface, state management, API integration, phase system
- Key files: `index.html` (structure), `script.js` (logic), `progressive.js` (phases), stylesheets

## Key File Locations

**Entry Points:**
- `server.js` (line 640-643): Node.js server starts on port 3000
- `pulsecraft_ui/index.html`: Browser loads this file when visiting `/`

**Configuration:**
- `.env`: Database URI (MONGO_URI), API keys (OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_API_KEY)
- `package.json`: Node dependency declarations and versions

**Core API Logic:**
- `server.js` lines 200-295: POST /api/mirror-voice (voice analysis)
- `server.js` lines 298-344: POST /api/generate-content (content creation)
- `server.js` lines 347-415: POST /api/refine-kits (kit merging/alchemy)
- `server.js` lines 421-509: GET /api/user-history (timeline retrieval)
- `server.js` lines 512-628: GET /api/identity-drift (resonance calculation)

**AI Orchestration:**
- `gpt_router.js` lines 46-85: `classifyIntent()` - Detects narrative/structured/action
- `gpt_router.js` lines 88-114: `selectModelForTask()` - Routes to OpenAI/Anthropic/Google
- `gpt_router.js` lines 157-207: `multiExtract()` + `combineExtractionProviders()` - Voice mirroring
- `gpt_router.js` lines 210-294: `multiAlchemy()` + `combineAlchemyProviders()` - Kit refinement
- `gpt_router.js` lines 299-429: `latentExtract()` - Silent psychological inference
- `gpt_router.js` lines 471-695: `handleGPTRequest()` - Main orchestration dispatcher

**Internal Analytics:**
- `services/latentMeta.js` lines 76-132: `buildLatentMeta()` - Computes stability, tension, coherence from latent profiles

**Frontend Core Functions:**
- `pulsecraft_ui/script.js` lines 1-150: Global state, utility functions, API base URL setup
- `pulsecraft_ui/script.js`: `mirrorVoiceCore()` - Voice analysis trigger
- `pulsecraft_ui/script.js`: `generateContentCore()` - Content generation trigger
- `pulsecraft_ui/script.js`: `mergeKitsForAlchemy()` - Kit refinement trigger
- `pulsecraft_ui/script.js`: `renderMirroredVoiceOutput()` - Display voice attributes
- `pulsecraft_ui/script.js`: `getSavedVoiceKits()`, `saveVoiceKits()` - localStorage management

**Frontend Phase System:**
- `pulsecraft_ui/progressive.js` lines 1-50: ProgressiveRevealSystem class initialization
- `pulsecraft_ui/progressive.js`: `loadProgress()` - Restore saved capabilities
- `pulsecraft_ui/progressive.js`: `revealPhase2()`, `revealPhase3()`, `revealPhase4()`, `revealPhase5()` - Phase transitions
- `pulsecraft_ui/progressive.js`: `unlockPhase()` - Enable new capability
- `pulsecraft_ui/progressive.js`: `observeMirroring()`, `observeSaving()`, `observeKitMerging()` - Monitor state changes

**Frontend Theme System:**
- `pulsecraft_ui/shapeshifter.js`: Multi-mode language switching (consciousness/subconscious/etc.)
- `pulsecraft_ui/shapeshifter.css`: Mode-specific color, typography, messaging

**Styling:**
- `pulsecraft_ui/style.css`: Base layout, typography, button styles
- `pulsecraft_ui/progressive.css`: Phase transitions, hidden/visible states, animations
- `pulsecraft_ui/enhancement.css`: Component-specific styling
- `pulsecraft_ui/dashboard.css`: Timeline view, history cards
- `pulsecraft_ui/shapeshifter.css`: Theme overrides per mode

## Naming Conventions

**Files:**
- Backend files: camelCase or snake_case + .js (e.g., `gpt_router.js`, `server.js`, `latentMeta.js`)
- Frontend files: camelCase + .js (e.g., `script.js`, `progressive.js`) or descriptive + .css (e.g., `progressive.css`)
- CSS files: kebab-case (e.g., `dashboard.css`, `progressive.css`)
- HTML: Single index.html with data-phase attribute for phases

**Directories:**
- Root: lowercase (e.g., `services`, `pulsecraft_ui`, `.planning`)
- No nested deeply; max 2 levels (root → services)

**Variables:**
- Frontend globals: camelCase (e.g., `currentVoiceKit`, `userId`, `activeRequests`)
- Functions: camelCase (e.g., `mirrorVoiceCore()`, `renderMirroredVoiceOutput()`)
- Classes: PascalCase (e.g., `ProgressiveRevealSystem`)
- Constants: UPPER_SNAKE_CASE (e.g., `HISTORY_WINDOW`, `API_BASE_URL`)
- localStorage keys: snake_case with mode suffix (e.g., `pulsecraft_history_{mode}`, `pulsecraft_phase_{mode}`)

## Where to Add New Code

**New Feature (Voice-related):**
- Primary code: Add handler in `server.js` (new app.post/get route)
- Orchestration: Add logic to `gpt_router.js` (new handleGPTRequest type or selectModelForTask logic)
- Frontend: Add UI in `pulsecraft_ui/index.html` phase or new phase div, handlers in `script.js`
- Tests: Not currently implemented; would go in `tests/` directory if added

**New Component/Module:**
- Implementation: Add .js file in `services/` if backend utility, or directly in `pulsecraft_ui/` if frontend
- Naming: Use camelCase for both backend and frontend files
- Export: Use `module.exports = { functionName }` for backend, or attach to `window.` for frontend

**Utilities:**
- Shared backend helpers: Add functions to `services/` directory
- Shared frontend helpers: Add to `pulsecraft_ui/script.js` global scope or new utility file
- API constants: Maintain `API_BASE_URL` in `script.js`

**Styles:**
- New phase styles: Add to `pulsecraft_ui/progressive.css`
- New component styles: Add to `pulsecraft_ui/style.css` or new .css file
- Theme overrides: Add to `pulsecraft_ui/shapeshifter.css`

**Database/Telemetry:**
- Schema changes: Modify `TelemetrySchema` in `server.js` lines 66-77
- New event types: Add eventType string constant, handle in telemetry routes
- Queries: Add to MongoDB operations in existing endpoints (user-history, identity-drift)

**Analysis Functions:**
- New latent metrics: Add computation functions to `services/latentMeta.js`
- Call sites: Update `buildLatentMeta()` return object to include new metric

## Special Directories

**`.planning/codebase/`:**
- Purpose: Generated analysis documents
- Generated: Yes (by GSD agents)
- Committed: Yes (gitignored is not listed, so these are tracked)
- Contents: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, CONCERNS.md

**`node_modules/`:**
- Purpose: Installed npm packages
- Generated: Yes (by npm install)
- Committed: No (listed in .gitignore)

**`.git/`:**
- Purpose: Version control metadata
- Generated: Yes (by git init)
- Committed: No (git directory)

**`pulsecraft_ui/` (Static Assets):**
- Purpose: Served directly by Express static middleware
- Generated: No (hand-written)
- Committed: Yes
- Served by: `app.use(express.static(path.join(__dirname, 'pulsecraft_ui')))` in server.js line 49

---

*Structure analysis: 2026-01-26*
