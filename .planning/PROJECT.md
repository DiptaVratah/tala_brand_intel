# PulseCraft: Neuro-Symbolic Identity Engine

## What This Is

PulseCraft is a Neuro-Symbolic Identity Infrastructure that extracts, crystallizes, and governs linguistic identity through multi-AI orchestration. It separates the "Mouth" (neural LLMs) from the "Brain" (symbolic constraints), creating persistent Voice Kits that prevent model collapse and maintain identity consistency across infinite sessions.

This upgrade transforms PulseCraft from a functional prototype into a production-ready, scalable system with professional UX, accurate psychometric tracking, and interface differentiation for three distinct use cases: Branding, Author, and Self-Reflection.

## Core Value

Identity is not a prompt; it is a constraint. PulseCraft uses symbolic logic (drift/stability tracking) to deterministically constrain neural generation, ensuring Voice Kits remain consistent and human rather than reverting to generic AI output.

## Requirements

### Validated

- ✓ Multi-AI extraction (OpenAI/Claude/Gemini triangulation) — existing
- ✓ Intent classification routing (NARRATIVE→Claude, STRUCTURED→Gemini, ACTION→OpenAI) — existing
- ✓ Voice Kit persistence (localStorage + MongoDB) — existing
- ✓ Voice Alchemy (multi-kit synthesis) — existing
- ✓ Latent psychometrics computation (stabilityIndex, emotionalCadence, cognitiveTension) — existing
- ✓ Identity drift calculation via vector similarity — existing
- ✓ Progressive phase revelation UI — existing

### Active

- [ ] Landing page with tagline and three interface entry points
- [ ] Interface differentiation (Branding/Author/Self-Reflection contextual framing)
- [ ] Clean URL routing (no ?mode= params, internal state management)
- [ ] Knowledge audit of stability calculations (document how they work, verify they affect generation)
- [ ] Observatory fix (latentMeta.js should calculate on history, not latest kit)
- [ ] Content generation UI organization (context-aware quick actions per interface)
- [ ] Session ID tracking (alongside userId)
- [ ] Professional visual design

### Out of Scope

- Authentication system — deferred to Beta phase (headless API)
- Multi-user accounts — deferred to Beta phase
- Reference kit system — v2 feature (post-upgrade)
- Multi-kit management for agencies — v2 feature
- Firecrawl URL integration — v2 feature
- Drift as governor (preventing generation) — v2 enhancement
- Intent audit logging — v2 enhancement
- Voice Kit versioning — v2 enhancement
- Downstream agents (Branding Agent, Author Agent) — future architecture

## Context

**Current State (Alpha):**
- Functional Neuro-Symbolic architecture with multi-AI extraction and intent routing
- Voice Kits stored as persistent JSON objects
- Three modes exist (Branding/Author/Consciousness) but feel identical
- Stability/drift calculations implemented but accuracy unverified
- UI is functional but not professional
- URL routing uses query parameters (?mode=author)
- Single-user system (no authentication, client-controlled userId)

**Codebase Architecture:**
- Express backend with 5 API endpoints (/api/mirror-voice, /api/generate-content, /api/refine-kits, /api/user-history, /api/identity-drift)
- Multi-AI orchestration in gpt_router.js (multiExtract, multiAlchemy, latentExtract, classifyIntent)
- Latent meta computation in services/latentMeta.js (buildLatentMeta)
- Progressive UI in pulsecraft_ui/ with phase-based revelation
- MongoDB telemetry storage with vector embeddings

**Target Users:**
- High-fidelity creators: Founders, brand strategists, authors
- Users who cannot afford "vanilla AI" and need identity preservation
- Future: Agencies managing multiple brand voices

**Known Issues:**
- Observatory calculates tension/cadence on latest Voice Kit instead of historical profile
- Stability calculations may not be influencing generation output (just dashboard metric)
- No session management (only userId)
- Excessive console logging in production code (139 statements across codebase)
- No input validation on critical endpoints (prompt injection risk)
- Disabled CSP (security vulnerability)

## Constraints

- **Tech Stack:** Node.js + Express + MongoDB + Multi-AI (OpenAI/Anthropic/Google) — cannot change, architecture is validated
- **Architecture:** Neuro-Symbolic design must remain intact — this is the patent-defensible core
- **Backwards Compatibility:** Existing Voice Kits in localStorage must continue working after upgrade
- **API Stability:** /api/mirror-voice, /api/generate-content, /api/refine-kits contracts cannot break
- **No Authentication:** Session IDs are sufficient for now, full auth is post-upgrade
- **Budget:** API costs constrained (OpenAI/Anthropic/Google) — minimize unnecessary calls
- **Timeline:** Preparing for 1000+ user scale, but not infinite scale yet

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Tagline on landing page, not Branding mode | Tagline describes core value (universal), not just branding use case | — Pending |
| Keep Self-Reflection as third interface | Extends psychometrics to personal domain, differentiates from competitors | — Pending |
| Prioritize stability audit before new features | Must understand current system before extending it | — Pending |
| Interface differentiation via UX framing, not backend changes | Backend (multiExtract, intent routing) is universal; context varies by use case | — Pending |
| Clean URL routing without query params | Professional UX, session state managed internally | — Pending |
| Defer authentication to post-upgrade | Session IDs sufficient for current scope, auth is complex milestone | — Pending |

---
*Last updated: 2026-01-26 after initialization*
