# Architecture

**Analysis Date:** 2026-01-26

## Pattern Overview

**Overall:** Distributed multi-AI orchestration system with progressive UI revelation and voice-based identity synthesis.

**Key Characteristics:**
- Three-tier architecture: Express backend → Multi-AI orchestrator → Frontend with progressive phases
- Vector-based identity tracking with MongoDB persistence
- Multi-provider AI routing (OpenAI, Anthropic, Google) based on task intent
- Progressive disclosure UI with capability unlocking based on user actions
- "Voice Kit" abstraction representing distilled identity profiles with latent psychological metadata

## Layers

**Express Backend (REST API Server):**
- Purpose: HTTP request router, data collection, vector embedding orchestration, database persistence
- Location: `server.js`
- Contains: 5 API endpoints (mirror-voice, generate-content, refine-kits, user-history, identity-drift), rate limiting, helmet security, mongoose schema definition
- Depends on: `gpt_router.js`, `services/latentMeta.js`, MongoDB (via mongoose), OpenAI embeddings API
- Used by: Frontend JavaScript, external clients

**Multi-AI Orchestrator (Task Router):**
- Purpose: Select optimal AI provider per task type and content intent, execute parallel multi-AI extraction/synthesis, combine outputs intelligently
- Location: `gpt_router.js`
- Contains: Provider handlers (OpenAI, Anthropic, Google), intent classifier, multi-extraction logic, multi-alchemy (kit refinement), latent layer inference
- Depends on: OpenAI SDK, Anthropic SDK, Google Generative AI SDK
- Used by: `server.js` handleGPTRequest

**Frontend UI (Phased Progressive Revelation):**
- Purpose: User interaction, progressive phase unlocking, local kit management, API orchestration
- Location: `pulsecraft_ui/` directory
- Contains: HTML structure (index.html), core functionality (script.js), phase management (progressive.js), UI theming (shapeshifter.js), stylesheets
- Depends on: localStorage for persistence, API_BASE_URL for backend communication
- Used by: Browser clients

**Internal Analytics Layer (Silent Observation):**
- Purpose: Non-user-facing computation of voice stability, tension forms, coherence patterns from latent profiles
- Location: `services/latentMeta.js`
- Contains: Stability band computation, tension form classification, coherence type calculation, longitudinal trend analysis
- Depends on: Latent profile data structure
- Used by: `server.js` for enhancements to voice and alchemy responses

## Data Flow

**Voice Mirroring Flow (Phase 1 → Phase 2):**

1. User enters text in `pulsecraft_ui/index.html` textarea (#brandVoiceInput)
2. `pulsecraft_ui/script.js` → `mirrorVoiceCore()` sends POST to `/api/mirror-voice` with userId
3. `server.js` receives request, calls `handleGPTRequest('voice', voiceAnalysisPrompt)`
4. `gpt_router.js` → `multiExtract()` fires 3 parallel AI requests:
   - OpenAI: Structural JSON schema extraction
   - Anthropic: Emotional/psychological subtext
   - Google: Linguistic analysis and bias detection
5. `combineExtractionProviders()` merges three outputs into unified Voice Kit JSON
6. In parallel: `latentExtract()` infers latent profile (narrative mode, emotional cadence, cognitive tension, motifs)
7. Voice Kit + latent profile returned to frontend
8. `script.js` → `renderMirroredVoiceOutput()` displays attributes, DNA tags, symbol anchors
9. User saves kit with name → stored in localStorage (mode-specific key: `pulsecraft_history_{mode}`)
10. MongoDB stores telemetry if connected: TelemetryLog with vectorEmbedding created via `createEmbedding()`

**Content Generation Flow (Phase 3):**

1. User selects saved Voice Kit and enters generation prompt in Phase 3
2. `script.js` → `generateContentCore()` sends POST to `/api/generate-content`
3. `server.js` → `synthesizeGenerationPrompt()` builds dual-layer prompt:
   - For 'symbolic_generation' style: Uses Latent Profile + Voice Kit attributes
   - For 'auto' style: Universal prompt with full Voice Kit + Latent Profile
4. `handleGPTRequest('content', {prompt, style})` routes to AI based on intent:
   - NARRATIVE intent → Claude (Anthropic)
   - STRUCTURED intent → Gemini (Google)
   - ACTION intent → GPT-4o (OpenAI)
5. Generated text vectorized via `createEmbedding()`
6. Result + vector stored in MongoDB for drift tracking
7. Text returned to frontend for display

**Kit Refinement Flow (Phase 4 - Alchemy):**

1. User selects 2+ saved Voice Kits for merging
2. `script.js` → `mergeKitsForAlchemy()` sends POST to `/api/refine-kits`
3. `server.js` calls `handleGPTRequest('refine', {kits})`
4. `gpt_router.js` → `multiAlchemy()` executes:
   - OpenAI: Synthesized JSON Voice Kit (architect role)
   - Anthropic: New archetype name (visionary role)
   - Google: Bridge words connecting the kits (connector role)
5. `combineAlchemyProviders()` merges three outputs seamlessly
6. Refined kit latent profile computed via `buildLatentMeta()` with history
7. Refined kit vectorized and logged to MongoDB
8. Result returned to frontend, auto-saved to localStorage

**Identity Drift Calculation Flow:**

1. User navigates to Phase 5 (Observatory)
2. `script.js` → `loadIdentityDrift()` sends GET to `/api/identity-drift?userId={userId}`
3. `server.js` queries MongoDB:
   - Latest Voice Kit (Mirror or Alchemy) → anchor vector
   - Last 5 generated content vectors → for comparison
   - Full voice history → journey narrative
4. `calculateSimilarity()` using cosine similarity computes resonance score
5. Evolution narrative built from archetype journey
6. Internal metrics extracted from latent profile
7. Non-judgmental observation generated based on drift band (>90%, >75%, >50%)
8. Full state returned: resonanceScore, journey, evolution story, internalMetrics

**State Management:**

Frontend state persistence:
- localStorage keys: `pulsecraft_history_{mode}`, `pulsecraft_phase_{mode}`, `pulsecraft_userId`
- Current Voice Kit held in memory: `currentVoiceKit` global variable
- Saved kits retrieved via `window.getSavedVoiceKits()`

Backend state persistence:
- MongoDB TelemetryLog schema stores all events (userId indexed)
- Vector embeddings stored with every event for drift analysis
- Latent profiles attached to voice mirrors and refinements
- History fetched via `/api/user-history` for timeline display

## Key Abstractions

**Voice Kit:**
- Purpose: Represents distilled identity in 8 dimensions (tone, vocabulary, phrasing, archetype, sample phrases, phrases to avoid, DNA tags, symbol anchors)
- Examples: Results from `/api/mirror-voice` and `/api/refine-kits` endpoints
- Pattern: JSON object with string fields and array fields; arrays serialized as JSON strings in localStorage

**Latent Profile:**
- Purpose: Psychological metadata inferred from linguistic structure without user-facing labels
- Examples: Structure includes narrativeMode, stabilityIndex, emotionalCadence, cognitiveTension, communicativeIntent, dominantMotifs
- Pattern: Silently computed by `latentExtract()`, attached to voice kits, never displayed to user; used for drift analysis and internal consistency checks

**Latent Meta:**
- Purpose: Longitudinal reliability metrics computed from latent profiles over time
- Examples: stabilityBand ("low"/"medium"/"high"), tensionForm ("paradoxical"/"dialectical"/"contrast"/"minimal"), coherenceType, stabilityDelta, tensionShift
- Pattern: Computed by `buildLatentMeta()` comparing current profile to historical profiles; stored in MongoDB alongside telemetry

**TelemetryLog (MongoDB Schema):**
- Purpose: Single unified event log capturing all user actions (voice mirrors, content generations, kit refinements)
- Fields: userId, timestamp, eventType ('MIRROR_VOICE'|'GENERATE_CONTENT'|'REFINE_ALCHEMY'), inputContext, outputData, latentProfile, latentMeta, vectorEmbedding, meta
- Pattern: Indexed by userId; vectors used for similarity calculations; enables identity drift tracking

**Vector Embedding:**
- Purpose: Mathematical representation of voice/content essence for similarity comparison
- Examples: Generated via OpenAI's text-embedding-3-small model for tone+archetype+DNA essence
- Pattern: Stored alongside every Voice Kit and generated content; cosine similarity computed for drift detection

## Entry Points

**HTTP API Entry (Backend):**
- Location: `server.js` line 640-643
- Triggers: Server startup (port 3000 or env.PORT)
- Responsibilities: Listen for requests, apply security middleware, route to handlers

**Frontend Entry (UI):**
- Location: `pulsecraft_ui/index.html`
- Triggers: Browser load of served static files
- Responsibilities: Initial HTML structure, load CSS and JavaScript

**API Route: POST /api/mirror-voice**
- Location: `server.js` line 200-295
- Triggers: User submits text in Phase 1
- Responsibilities: Call voice analyzer, compute latent profile, embed, persist to DB, return Voice Kit

**API Route: POST /api/generate-content**
- Location: `server.js` line 298-344
- Triggers: User generates content in Phase 3 with saved kit
- Responsibilities: Route by intent, synthesize prompt, embed result, persist to DB, return text

**API Route: POST /api/refine-kits**
- Location: `server.js` line 347-415
- Triggers: User merges 2+ kits in Phase 4
- Responsibilities: Call multi-AI alchemy, compute latent meta, embed, persist, return refined kit

**API Route: GET /api/user-history**
- Location: `server.js` line 421-509
- Triggers: Dashboard loads user timeline
- Responsibilities: Query MongoDB, format events by type, return timeline + stats

**API Route: GET /api/identity-drift**
- Location: `server.js` line 512-628
- Triggers: User navigates to Phase 5 (Observatory)
- Responsibilities: Calculate resonance score, build evolution narrative, return comprehensive drift state

**Frontend Function: mirrorVoice()**
- Location: `pulsecraft_ui/script.js`
- Triggers: User clicks "Mirror My Voice" button
- Responsibilities: Call mirrorVoiceCore(), trigger phase 2 reveal via progressive system

**Frontend Function: mergeKitsForAlchemy()**
- Location: `pulsecraft_ui/script.js`
- Triggers: User selects 2+ kits and clicks refine button
- Responsibilities: Call API, handle refined kit, update localStorage, unlock Phase 4 reveal

**Progressive Phase System:**
- Location: `pulsecraft_ui/progressive.js`
- Triggers: Capability milestones reached (mirror → phase 2, save kit → phase 3, 3+ kits → phase 4, alchemy → phase 5)
- Responsibilities: Unlock phases, manage visibility, restore progress on reload

## Error Handling

**Strategy:** Graceful degradation with user-facing toasts and fallback defaults.

**Patterns:**
- API errors returned as JSON: `{ error: "message" }` or `{ error: "...", details: {...} }`
- Frontend catches errors via `.catch()` and displays via `showToast(message, 'error')`
- Rate limiting returns 429 with message via limiters defined in server.js (mirrorLimiter, generateLimiter)
- Database connection errors: Telemetry silently skipped if mongoose not connected; user sees no disruption
- Voice Kit JSON parsing: If AI returns invalid JSON, `combineExtractionProviders()` returns error object with all empty fields
- Vector embedding timeout: 10-second timeout per embedding call; returns empty array on failure, process continues
- Latent extraction failures: Returns object with "error": "latent_extraction_failed", doesn't block voice kit response

## Cross-Cutting Concerns

**Logging:**
- Backend: `console.log()` / `console.error()` with emoji prefix ("✅", "❌", "⚠️", "🧬", "⚗️", "🔮") for visual scanning
- Frontend: Minimal console logging; relies on showToast() for user feedback

**Validation:**
- Backend: Input size limit 10kb (express.json({ limit: '10kb' }))
- Backend: Rate limiting per IP (10 voice mirrors / 15 min, 20 generations / 15 min)
- Frontend: Required fields checked before API calls (brandInput, kit, context)
- Latent extraction: 3-retries with exponential backoff via `withRetry()` helper

**Authentication:**
- No explicit auth; userId generated as `user_{timestamp}_{random}` stored in localStorage
- All telemetry indexed by userId but visible only to that user
- No API auth keys exposed to frontend

**Helmet Security:**
- Applied at `server.js` line 22-24: CSP disabled for beta (allows UI styling), other security headers enabled
- CORS enabled globally for cross-origin requests

---

*Architecture analysis: 2026-01-26*
