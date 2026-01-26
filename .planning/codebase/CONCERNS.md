# Codebase Concerns

**Analysis Date:** 2026-01-26

## Tech Debt

**Excessive Console Logging in Production Code:**
- Issue: 139 console.log/warn/error statements scattered across codebase (18 in gpt_router.js, 46 in progressive.js, 42 in script.js, 10 in shapeshifter.js, 23 in server.js). These remain active in production and create verbose console output.
- Files: `server.js`, `gpt_router.js`, `pulsecraft_ui/progressive.js`, `pulsecraft_ui/script.js`, `pulsecraft_ui/shapeshifter.js`
- Impact: Performance degradation on slower clients, information disclosure (internal logic visible to users), harder to spot real errors in production
- Fix approach: Implement environment-aware logging (log only in dev mode, silent in prod). Use `process.env.NODE_ENV` to conditionally disable console statements.

**Hardcoded Magic Numbers & Timeouts:**
- Issue: Arbitrary delays like 100ms, 500ms, 1000ms, 2000ms throughout progressive.js (lines 39, 43, 100, 145, 151, 182, 191, 215, 264, 308, 339, 375, 444, etc.). These timeouts are brittle and may fail under slow network conditions.
- Files: `pulsecraft_ui/progressive.js`, `pulsecraft_ui/script.js`, `server.js`
- Impact: Race conditions under slow networks, unpredictable UI reveal behavior, difficult to debug
- Fix approach: Extract timeouts to named constants at top of file (e.g., `PHASE_REVEAL_DELAY = 300`). Use Promise-based event listeners instead of fixed delays where possible.

**No Input Validation on Critical Endpoints:**
- Issue: `/api/mirror-voice` and `/api/generate-content` accept `brandInput` and `context` from client without length validation beyond 10kb JSON limit. No sanitization of prompt injection risks.
- Files: `server.js` (lines 200-204, 298-303)
- Impact: Potential prompt injection attacks leading to AI model abuse, resource exhaustion from maliciously crafted inputs
- Fix approach: Add length limits per field (e.g., max 5000 chars for input), validate input format, use parameterized prompts, sanitize special characters.

**Weak Error Handling with Generic Messages:**
- Issue: Most API errors return generic "Failed to X: " + error.message without proper HTTP status codes or structured error responses. Error objects sometimes returned as raw JSON without schema.
- Files: `server.js` (lines 293, 341, 413, 507), `gpt_router.js` (lines 692-694)
- Impact: Difficult to debug, poor client error recovery, security information leakage (raw error messages)
- Fix approach: Define error response schema, use appropriate HTTP status codes (400/422 for validation, 500 for server errors), log full error server-side only.

**Exposed API Keys in .env File:**
- Issue: `.env` file contains plaintext API keys (OpenAI, Anthropic, Google, MongoDB credentials) and is committed or visible in repository.
- Files: `.env`
- Impact: Critical security vulnerability. Any repo access compromises all integrated services.
- Fix approach: Add `.env` to `.gitignore` immediately. Rotate all exposed keys. Use environment variable injection in deployment (Render/production). Never commit secrets.

**Missing .gitignore for Sensitive Files:**
- Issue: `.gitignore` exists but may not exclude `.env`, `node_modules/.package-lock.json`, or other sensitive patterns comprehensively.
- Files: `.gitignore` (needs verification)
- Impact: Risk of accidental secret commits
- Fix approach: Ensure `.env`, `.env.*`, `*.key`, `*.pem` are in .gitignore. Consider using pre-commit hooks to prevent secret commits.

## Security Considerations

**Disabled Content Security Policy (CSP):**
- Risk: CSP is explicitly disabled in Helmet config with `contentSecurityPolicy: false` (server.js line 23) to work around UI styling issues.
- Files: `server.js` (lines 22-24)
- Current mitigation: None - CSP is completely disabled
- Recommendations: Fix UI styling to work with CSP. Define proper CSP headers that allow inline styles (if needed) but restrict script execution. This prevents XSS attacks.

**No Rate Limiting on Database Queries:**
- Risk: `/api/user-history` and `/api/identity-drift` endpoints fetch from MongoDB without pagination limits. User could fetch 100+ records, causing N+1 query patterns.
- Files: `server.js` (lines 421-509, 512-628)
- Current mitigation: Hard limit of 100 records in query (line 438), but no per-user rate limiting
- Recommendations: Implement pagination parameters, add rate limiting per userId, cache frequently accessed histories.

**Unauthenticated API Endpoints:**
- Risk: All endpoints (mirror-voice, generate-content, user-history, identity-drift) accept userId from client without authentication. Client can spoof any userId and access/modify data for other users.
- Files: `server.js` (entire API section)
- Current mitigation: None - userId is client-provided
- Recommendations: Implement JWT-based authentication or session management. Validate userId server-side against authenticated session, not client input.

**Embedding URLs & Timestamps in Client Data:**
- Risk: Vector embeddings are generated but never validated for content. No verification that embedded text matches original intent.
- Files: `server.js` (lines 100-124, 273-287, 322-336)
- Current mitigation: None
- Recommendations: Hash original content and verify against stored hash to detect tampering.

## Known Bugs

**Phase Reveal Race Condition:**
- Symptoms: Phase 2 sometimes doesn't reveal smoothly after mirrorVoice completes, or appears partially. Phase 3 may not unlock when expected.
- Files: `pulsecraft_ui/progressive.js` (lines 228-272)
- Trigger: Rapid successive calls to mirrorVoice, or network delay > 500ms
- Workaround: Manual page refresh restores correct phase state
- Root cause: Multiple setTimeout calls (100ms, 300ms) cause race conditions; phase visibility depends on DOM elements existing before reveal fires

**Vector Embedding Generation Timeout:**
- Symptoms: Content generation succeeds but vectorization fails silently (returns empty array).
- Files: `server.js` (lines 100-124)
- Trigger: OpenAI API slow or unresponsive, timeout hits 10s mark
- Workaround: Vector is empty but generation still completes
- Root cause: Embedding timeout (10s) may fire before API response, caught but not retried

**JSON Parsing Failures in Gemini Response:**
- Symptoms: Latent extraction fails, returns error object instead of latent profile.
- Files: `gpt_router.js` (lines 379-400)
- Trigger: Gemini returns JSON wrapped in extra text (e.g., "Here are the results: {...}")
- Workaround: Fallback to default latentProfile, extraction continues
- Root cause: Regex bracket-hunting fix (lines 383-390) works but is fragile

**localStorage Corruption During Rapid Saves:**
- Symptoms: Saved voice kits sometimes become unparseable JSON, getSavedVoiceKits() fails
- Files: `pulsecraft_ui/script.js` (lines 111-146)
- Trigger: Rapid save operations (multiple kits saved < 100ms apart)
- Workaround: localStorage is cleared, user loses kit history
- Root cause: No serialization queue; concurrent saves overwrite each other

## Performance Bottlenecks

**Multi-AI Extraction Runs 3 API Calls Sequentially (Not Parallel):**
- Problem: `multiExtract()` and `latentExtract()` claim to use `Promise.all()` but may serialize if APIs timeout
- Files: `gpt_router.js` (lines 157-173, 366-370)
- Cause: Promise.all() rejects on first failure; no error handling for individual provider failures
- Improvement path: Use Promise.allSettled() to allow 1-2 providers to fail while others continue. Implement fallback merging.

**Vector Embedding Generation Adds 200-500ms Latency:**
- Problem: Every mirror/content/alchemy operation calls createEmbedding(), which makes OpenAI request and waits. Serializes after other AI operations.
- Files: `server.js` (lines 100-124, 273-287, 322-336, 392-393)
- Cause: Embedding is required for drift calculation but blocks response
- Improvement path: Move embedding to background async job. Return response immediately, save embedding asynchronously. May need job queue.

**Heavy DOM Manipulation in Phase Reveal:**
- Problem: `crystallizeTags()` animates 20+ DOM elements with individual setTimeout for each (100ms spacing = 2+ seconds total). Blocks main thread.
- Files: `pulsecraft_ui/progressive.js` (lines 300-343)
- Cause: Sequential animation instead of CSS keyframes or requestAnimationFrame
- Improvement path: Use CSS animations with staggered delay, or batch DOM updates with requestAnimationFrame.

**No Pagination on User History:**
- Problem: `/api/user-history` fetches up to 100 records every time, even if user only needs first 10.
- Files: `server.js` (lines 421-509)
- Cause: Hard-coded limit (100), no skip/limit parameters
- Improvement path: Add ?limit=10&skip=0 query parameters, implement cursor-based pagination.

## Fragile Areas

**Progressive Reveal System Depends on Global Window Functions:**
- Files: `pulsecraft_ui/progressive.js` (lines 126-160, 162-198, 200-226)
- Why fragile: Observer pattern wraps global functions (mirrorVoice, saveVoiceKit, refineSelectedKits). If script.js doesn't load, observeMirroring() retries indefinitely. Race condition if progressive.js loads before script.js.
- Safe modification: Wait for script.js to define functions before observing. Use events instead of function wrapping (dispatch custom events).
- Test coverage: No tests for phase transition logic. Only manual testing possible.

**Latent Profile Extraction Depends on 3 Different AI Providers:**
- Files: `gpt_router.js` (lines 299-429)
- Why fragile: Claude returns 2-line format that's parsed by regex split/find (lines 407-411). Gemini returns JSON that may be wrapped in text. If provider changes response format, extraction breaks.
- Safe modification: Define strict output schema for each provider. Add validation after parsing to ensure required fields exist.
- Test coverage: No unit tests for latentExtract(). Only end-to-end testing.

**Voice Kit Schema Exists in Multiple Places:**
- Files: `gpt_router.js` (lines 28-41, 218-219, 507-508), `server.js` (implicit), `pulsecraft_ui/script.js` (implicit)
- Why fragile: Schema defined as constant in gpt_router.js but referenced in multiple files. If shape changes, backend and frontend can desync.
- Safe modification: Define single source of truth (export voiceAnalysisSchema from gpt_router.js). Import and use everywhere. Add runtime validation.
- Test coverage: No schema validation tests.

**MongoDB Connection Assumed but Not Required:**
- Files: `server.js` (lines 57-63, 245, 277, 326, 367, 396, 429, 519)
- Why fragile: Code checks `mongoose.connection.readyState === 1` in multiple places. If MongoDB is down, features silently fail (no telemetry saved, no history available).
- Safe modification: Implement fallback in-memory storage. Return 503 if telemetry is required but DB is down. Log database errors prominently.
- Test coverage: No database failure scenarios tested.

**Phase Transitions Hardcoded to DOM Selectors:**
- Files: `pulsecraft_ui/progressive.js` (lines 238, 241, 280, 324, 366, 400, 412, 432, 440)
- Why fragile: Uses hardcoded .phase-N and .generation-controls, .library-preview selectors. If HTML changes class names, phases don't reveal.
- Safe modification: Inject phase element references through constructor. Define phase structure as data structure.
- Test coverage: No visual regression tests.

## Scaling Limits

**Single MongoDB Connection Pool:**
- Current capacity: Default Mongoose connection pool (10 connections). Will saturate under >10 concurrent requests.
- Limit: When pool exhausted, new requests queue indefinitely (default 10s timeout before rejection).
- Scaling path: Increase poolSize in mongoose.connect() options. Implement connection pooling middleware. For production, use MongoDB Atlas dedicated cluster with auto-scaling.

**Vector Embedding Cache Missing:**
- Current capacity: Every request to createEmbedding() calls OpenAI API (costs money, 200ms latency).
- Limit: If 1000 users generate content, 1000 embedding API calls = $10+ cost, no reuse.
- Scaling path: Implement Redis cache of embeddings keyed by text hash. Reuse embeddings for identical input. Consider using cheaper embedding model or batching.

**No Rate Limiting on AI API Calls:**
- Current capacity: Rate limiters exist for /api/mirror-voice (10/15min) and /api/generate-content (20/15min) but not for embedding generation or intent classification.
- Limit: If mirror-voice calls classifyIntent() in selectModelForTask(), that's an extra gpt-4o-mini API call per request (not counted in rate limit).
- Scaling path: Add rate limiting per AI provider. Track API spend. Implement token budgeting per user.

**Frontend localStorage Limited to ~5-10MB:**
- Current capacity: Saving voice kits to localStorage. Each kit ~5KB. Max ~1500 kits before quota hit.
- Limit: localStorage.setItem() throws when quota exceeded.
- Scaling path: Migrate to IndexedDB (larger quota). Implement cleanup of old kits. Sync to backend (MongoDB already has kits).

## Dependencies at Risk

**@anthropic-ai/sdk v0.71.1 (2+ months old):**
- Risk: May not support latest Claude model variants. Breaking changes in newer versions.
- Impact: Cannot use newer Claude versions without major version bump
- Migration plan: Pin to range (^0.71.1 allows patches but not minor). Set up automated dependency updates. Test before upgrading.

**@google/generative-ai v0.24.1 (Older version):**
- Risk: Gemini API has evolved. Newer versions may have different response formats.
- Impact: Latent extraction regex parsing may break with new API versions
- Migration plan: Test with latest version (v0.25+). Add integration tests that verify response format.

**openai v4.103.0 (Up-to-date):**
- Risk: Low. OpenAI maintains backward compatibility. But gpt-4o model may be deprecated in future.
- Impact: If gpt-4o is retired, hardcoded model references fail
- Migration plan: Parameterize model names. Allow config-based model selection.

**express v5.1.0 (Latest but RC):**
- Risk: Express 5.x is in active development. May have breaking changes.
- Impact: Potential compatibility issues if dependencies expect Express 4.x
- Migration plan: Consider pinning to latest 4.x stable. If using 5.x, add CI tests.

## Missing Critical Features

**No User Authentication:**
- Problem: userId is entirely client-controlled. Any user can access any other user's data by guessing userId format.
- Blocks: Multi-tenant security, audit trails, user account management
- Recommendation: Implement OAuth2 or JWT-based auth before production deployment.

**No Data Backup/Recovery:**
- Problem: MongoDB data is live but no automated backups visible in codebase. If DB corrupted, all user data lost.
- Blocks: Disaster recovery, data compliance
- Recommendation: Enable MongoDB Atlas automated backups. Add backup export endpoints.

**No API Documentation:**
- Problem: No OpenAPI/Swagger spec, no endpoint documentation
- Blocks: Third-party integrations, client development
- Recommendation: Add Swagger/OpenAPI spec. Generate client SDK.

**No Monitoring/Alerting:**
- Problem: No error tracking (Sentry), no uptime monitoring, no latency metrics
- Blocks: Production readiness, incident response
- Recommendation: Add Sentry for error tracking, DataDog for metrics.

## Test Coverage Gaps

**No Unit Tests for Core Logic:**
- What's not tested: Voice analysis schema validation, vector similarity calculations, latent profile computation, phase transitions
- Files: `server.js`, `gpt_router.js`, `services/latentMeta.js`, `pulsecraft_ui/progressive.js`
- Risk: Refactoring breaks business logic without warning. Regressions only caught by manual testing.
- Priority: High - Add Jest tests for gpt_router.js and latentMeta.js functions

**No Integration Tests for API Endpoints:**
- What's not tested: Full request/response cycles, multi-provider alchemy synthesis, database save/load
- Files: `server.js` (all API routes)
- Risk: API contract breaks between frontend/backend without detection
- Priority: High - Add supertest integration tests for all /api/* endpoints

**No E2E Tests for User Journeys:**
- What's not tested: Phase reveal sequence, kit save/merge/retrieve, progressive revelation flow
- Files: `pulsecraft_ui/*.js`, `server.js`
- Risk: UI/backend integration breaks under user scenarios
- Priority: Medium - Add Playwright/Cypress tests for each phase transition

**No Performance/Load Tests:**
- What's not tested: Multi-AI extraction under high concurrency, vectorization at scale, database under load
- Files: `gpt_router.js`, `server.js`
- Risk: Performance issues only discovered in production
- Priority: Medium - Add k6 or Artillery load tests

**No Security/Penetration Testing:**
- What's not tested: Input validation bypass, JWT spoofing, prompt injection, XSS payloads
- Files: `server.js`, `pulsecraft_ui/*.js`
- Risk: Security vulnerabilities exploited in production
- Priority: Critical - Add OWASP security test cases before launch

---

*Concerns audit: 2026-01-26*
