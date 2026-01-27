# Roadmap: PulseCraft Production Upgrade

## Overview

Transform PulseCraft from functional prototype into production-ready system with professional UX, accurate psychometrics, and differentiated interfaces for three use cases (Branding/Author/Self-Reflection). This upgrade preserves the validated Neuro-Symbolic architecture while adding landing page, interface differentiation, session management, stability documentation, enhanced Observatory, and mode-aware content generation. The journey takes PulseCraft from working prototype to polished product ready for 1000+ users.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Landing Page & Navigation** - Professional entry point with mode selection
- [ ] **Phase 2: Interface Differentiation** - Mode-specific language, theming, and experience
- [ ] **Phase 3: Session Management** - Robust identity tracking with deviceId + sessionId
- [ ] **Phase 4: Stability Knowledge Audit** - Document and verify psychometric calculations
- [ ] **Phase 5: Observatory Enhancement** - Advanced visualization with trends and insights
- [ ] **Phase 6: Content Generation Organization** - Mode-aware quick actions and context

## Phase Details

### Phase 1: Landing Page & Navigation
**Goal**: Users land on professional page with clear value proposition and choose their interface mode via clean URL routing

**Depends on**: Nothing (first phase)

**Requirements**: LAND-01, LAND-02, LAND-03, LAND-04, LAND-05, ROUT-01, ROUT-02, ROUT-03, ROUT-04, ROUT-05

**Success Criteria** (what must be TRUE):
  1. User visiting root URL sees tagline "Most tools give you templates, this one gives you yourself"
  2. User can select between Branding, Author, or Self-Reflection via card-based interface showing outcome descriptions
  3. User selecting a mode navigates to clean path-based URL (e.g., /branding, /author, /self-reflection) without query parameters
  4. User can use browser back/forward buttons to navigate between landing and modes
  5. User can directly access mode URLs by pasting them into browser

**Plans:** 2 plans

Plans:
- [ ] 01-01-PLAN.md - Landing page foundation (router, HTML/CSS, server SPA support)
- [ ] 01-02-PLAN.md - Router wiring and mode integration (connects to shapeshifter, verification)

### Phase 2: Interface Differentiation
**Goal**: Each interface mode feels contextually appropriate through language, visual theming, and mode-specific framing

**Depends on**: Phase 1

**Requirements**: INTF-01, INTF-02, INTF-03, INTF-04, INTF-05, INTF-06, UI-01, UI-02, UI-03, UI-04, UI-05, UI-06, UI-07, UI-08

**Success Criteria** (what must be TRUE):
  1. User in Branding mode sees professional business language ("Mirror Brand Voice", "Brand DNA", "Brand Consistency")
  2. User in Author mode sees creative language ("Craft Author Voice", "Narrative Drift", "Literary Identity")
  3. User in Self-Reflection mode sees supportive language ("Track Inner Voice", "Emotional Timeline", "Personal Growth")
  4. User can visually distinguish interfaces by color scheme and visual effects (Branding: blue/stable, Author: red/dynamic, Self-Reflection: green/calm)
  5. User sees mode-appropriate placeholder text in input areas and contextual tooltips
  6. User no longer sees Consciousness Mode or Deep Mode in any interface
  7. User encounters helpful error messages and clear success feedback
  8. User experiences consistent spacing, typography hierarchy, and professional loading states

**Plans**: TBD

Plans:
- [ ] 02-01: TBD during phase planning

### Phase 3: Session Management
**Goal**: System tracks user sessions with cryptographically secure IDs supporting future analytics and multi-device features

**Depends on**: Phase 2

**Requirements**: SESS-01, SESS-02, SESS-03, SESS-04, SESS-05, SESS-06

**Success Criteria** (what must be TRUE):
  1. System generates unique sessionId per browser session using crypto-based UUID
  2. System maintains persistent deviceId stored in localStorage for cross-session identity
  3. System sends both IDs to backend which tracks them in MongoDB telemetry
  4. User returning to site sees their previous Voice Kits (backward compatible with existing userId data)
  5. Session metadata includes creation timestamp and last activity time

**Plans**: TBD

Plans:
- [ ] 03-01: TBD during phase planning

### Phase 4: Stability Knowledge Audit
**Goal**: Team and users understand how stability/drift calculations work and whether they affect generation output

**Depends on**: Phase 3

**Requirements**: STAB-01, STAB-02, STAB-03, STAB-04, STAB-05

**Success Criteria** (what must be TRUE):
  1. Developer reading latentMeta.js sees inline comments explaining each calculation step (stabilityIndex, emotionalCadence, cognitiveTension)
  2. Developer can access technical documentation file explaining all psychometric computations with formulas
  3. Documentation clearly states whether stability affects generation output or only dashboard display
  4. Documentation explains drift calculation algorithm including vector similarity method, thresholds, and interpretation guidance
  5. Code comments reference documentation for deeper context

**Plans**: TBD

Plans:
- [ ] 04-01: TBD during phase planning

### Phase 5: Observatory Enhancement
**Goal**: Users see historical patterns and trends in their identity metrics through enhanced visualization

**Depends on**: Phase 4

**Requirements**: OBSR-01, OBSR-02, OBSR-03, OBSR-04, OBSR-05, OBSR-06

**Success Criteria** (what must be TRUE):
  1. User sees Observatory calculations based on historical profile data across multiple Voice Kits, not just latest kit
  2. User sees sparklines showing stability trend over last 10 sessions within metric cards
  3. User sees sparklines showing drift trend over time
  4. User can filter Observatory view by time range (7 days / 30 days / 90 days / All time)
  5. User sees progressive disclosure with summary cards that expand to show detailed breakdowns
  6. User continues to see non-judgmental language (Resonant/Flexible/Divergent labels maintained)

**Plans**: TBD

Plans:
- [ ] 05-01: TBD during phase planning

### Phase 6: Content Generation Organization
**Goal**: Users see mode-appropriate quick action buttons and context templates that streamline content generation

**Depends on**: Phase 5

**Requirements**: CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, CONT-06, CONT-07

**Success Criteria** (what must be TRUE):
  1. User in Branding interface sees quick actions: Social Post, Ad Copy, Email, Brand Messaging
  2. User in Author interface sees quick actions: Story, Essay, Dialogue, Character Voice
  3. User in Self-Reflection interface sees quick actions: Reflection, Self-dialogue, Insight Synthesis
  4. User sees Voice Kit selector prominently placed above generation controls
  5. User clicking quick action button sees context textarea pre-filled with helpful template (editable)
  6. User sees mode-appropriate placeholder text in context textarea before quick action selected
  7. User sees generated content in organized, readable display area

**Plans**: TBD

Plans:
- [ ] 06-01: TBD during phase planning

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Landing Page & Navigation | 0/2 | Planned | - |
| 2. Interface Differentiation | 0/TBD | Not started | - |
| 3. Session Management | 0/TBD | Not started | - |
| 4. Stability Knowledge Audit | 0/TBD | Not started | - |
| 5. Observatory Enhancement | 0/TBD | Not started | - |
| 6. Content Generation Organization | 0/TBD | Not started | - |

---
*Roadmap created: 2026-01-27*
*Last updated: 2026-01-27*
