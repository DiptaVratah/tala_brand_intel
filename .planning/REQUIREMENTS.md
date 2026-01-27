# Requirements: PulseCraft Upgrade

**Defined:** 2026-01-27
**Core Value:** Identity is not a prompt; it is a constraint. PulseCraft uses symbolic logic to deterministically constrain neural generation.

## v1 Requirements

Requirements for production-ready upgrade with professional UX, accurate psychometrics, and interface differentiation.

### Landing Page & Mode Selection

- [ ] **LAND-01**: User sees tagline "Most tools give you templates, this one gives you yourself" on landing page
- [ ] **LAND-02**: User can select between Branding, Author, Self-Reflection via card-based interface
- [ ] **LAND-03**: Each mode card shows outcome-driven description and visual preview
- [ ] **LAND-04**: Landing page has clean URL (root `/`)
- [ ] **LAND-05**: Landing page has professional visual design matching 2026 SaaS standards

### Interface Differentiation

- [ ] **INTF-01**: Branding interface uses professional language ("Mirror Brand Voice", "Brand DNA", "Brand Consistency")
- [ ] **INTF-02**: Author interface uses creative language ("Craft Author Voice", "Narrative Drift", "Literary Identity")
- [ ] **INTF-03**: Self-Reflection interface uses supportive language ("Track Inner Voice", "Emotional Timeline", "Personal Growth")
- [ ] **INTF-04**: Each interface has distinct visual theming (color schemes, typography, effects)
- [ ] **INTF-05**: Interface labels updated in all UI elements (buttons, headers, tooltips)
- [ ] **INTF-06**: Mode-specific placeholder text in input areas

### URL Routing & State Management

- [ ] **ROUT-01**: URLs do not use query parameters (remove `?mode=author` pattern)
- [ ] **ROUT-02**: Mode state managed via path-based routing (e.g., `/branding`, `/author`, `/self-reflection`)
- [ ] **ROUT-03**: Browser back/forward buttons work correctly with mode switching
- [ ] **ROUT-04**: Direct URL access to modes works (e.g., paste `/author` into browser)
- [ ] **ROUT-05**: Mode state persists in localStorage for return visits

### Session Management

- [ ] **SESS-01**: System generates unique sessionId per browser session using crypto-based UUID
- [ ] **SESS-02**: System maintains deviceId for persistent cross-session identity
- [ ] **SESS-03**: Both IDs stored appropriately (deviceId in localStorage, sessionId in sessionStorage)
- [ ] **SESS-04**: Both IDs sent to backend and tracked in MongoDB telemetry
- [ ] **SESS-05**: Backward compatible with existing userId-only data
- [ ] **SESS-06**: Session metadata includes creation timestamp and last activity

### Stability Audit & Documentation

- [ ] **STAB-01**: Document how stabilityIndex is calculated in latentMeta.js
- [ ] **STAB-02**: Document whether stability affects generation output or just dashboard display
- [ ] **STAB-03**: Document drift calculation algorithm (vector similarity, thresholds, interpretation)
- [ ] **STAB-04**: Create technical documentation file explaining all psychometric computations
- [ ] **STAB-05**: Add inline code comments in latentMeta.js explaining each calculation step

### Observatory Fixes & Enhancements

- [ ] **OBSR-01**: Fix Observatory to calculate tension/cadence on historical profile data, not just latest kit
- [ ] **OBSR-02**: Add sparklines showing stability trend over last 10 sessions
- [ ] **OBSR-03**: Add sparklines showing drift trend over time
- [ ] **OBSR-04**: Maintain non-judgmental language (current "Resonant/Flexible/Divergent" labels are good)
- [ ] **OBSR-05**: Implement progressive disclosure (summary cards → expandable details)
- [ ] **OBSR-06**: Add time range filter (7 days / 30 days / 90 days / All time)

### Content Generation Organization

- [ ] **CONT-01**: Branding interface shows quick actions: Social Post, Ad Copy, Email, Brand Messaging
- [ ] **CONT-02**: Author interface shows quick actions: Story, Essay, Dialogue, Character Voice
- [ ] **CONT-03**: Self-Reflection interface shows quick actions: Reflection, Self-dialogue, Insight Synthesis
- [ ] **CONT-04**: Voice Kit selector prominently placed above generation controls
- [ ] **CONT-05**: Context textarea has mode-appropriate placeholder text
- [ ] **CONT-06**: Quick action buttons pre-fill helpful context templates (user can edit)
- [ ] **CONT-07**: Generated content display area organized and readable

### UI Polish & Professional Design

- [ ] **UI-01**: Remove Consciousness Mode and Deep Mode from dropdown
- [ ] **UI-02**: Update all mode references in JavaScript (script.js, shapeshifter.js, progressive.js)
- [ ] **UI-03**: Professional color scheme consistent across all interfaces
- [ ] **UI-04**: Typography hierarchy clear (headers, body, captions)
- [ ] **UI-05**: Consistent spacing and alignment throughout
- [ ] **UI-06**: Loading states professional (no generic spinners)
- [ ] **UI-07**: Error messages helpful and contextual
- [ ] **UI-08**: Success feedback clear but unobtrusive

## v2 Requirements

Deferred to future releases. Tracked but not in current roadmap.

### Advanced Features

- **REF-01**: Reference kit system (designate one kit as anchor for drift comparison)
- **REF-02**: Kit locking (mark kits as "finalized" to prevent edits)
- **REF-03**: Kit versioning (track evolution with delta history)
- **REF-04**: Multi-kit management dashboard for agencies
- **REF-05**: Kit export/import (download Voice Kit JSON)

### Firecrawl Integration

- **FIRE-01**: New endpoint `/api/mirror-url` for URL-based voice extraction
- **FIRE-02**: Firecrawl MCP integration for web content parsing
- **FIRE-03**: URL input field in voice mirroring interface
- **FIRE-04**: Preview of extracted content before mirroring

### Governance Enhancements

- **GOV-01**: Drift as governor (prevent generation if stability below threshold)
- **GOV-02**: Intent audit logging (log every routing decision to MongoDB)
- **GOV-03**: Generation approval workflow (review before publishing)

### Authentication & Multi-User

- **AUTH-01**: User registration with email/password
- **AUTH-02**: Login/logout functionality
- **AUTH-03**: Password reset flow
- **AUTH-04**: User profile management
- **AUTH-05**: Multi-user session isolation
- **AUTH-06**: API key generation for headless access

## Out of Scope

Explicitly excluded from current upgrade. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Full authentication system | Complex milestone requiring security audit, password hashing, email verification - defer to Beta phase |
| Multi-tenant architecture | Requires database schema changes, user isolation, permissions - wait until user demand proven |
| Real-time collaboration | Not core to identity preservation use case |
| Mobile app | Web-first strategy, mobile later if needed |
| White-label customization | Enterprise feature, not needed for current market |
| Analytics dashboard | Nice-to-have, defer until user base established |
| Bulk operations | Agency feature, defer to v2 |
| API rate limiting per user | Requires auth, defer to Beta |
| Webhook integrations | Headless API feature, defer to Beta |
| Third-party OAuth | Email/password sufficient for Beta, social login is v3 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| LAND-01 | Phase 1 | Pending |
| LAND-02 | Phase 1 | Pending |
| LAND-03 | Phase 1 | Pending |
| LAND-04 | Phase 1 | Pending |
| LAND-05 | Phase 1 | Pending |
| ROUT-01 | Phase 1 | Pending |
| ROUT-02 | Phase 1 | Pending |
| ROUT-03 | Phase 1 | Pending |
| ROUT-04 | Phase 1 | Pending |
| ROUT-05 | Phase 1 | Pending |
| INTF-01 | Phase 2 | Pending |
| INTF-02 | Phase 2 | Pending |
| INTF-03 | Phase 2 | Pending |
| INTF-04 | Phase 2 | Pending |
| INTF-05 | Phase 2 | Pending |
| INTF-06 | Phase 2 | Pending |
| UI-01 | Phase 2 | Pending |
| UI-02 | Phase 2 | Pending |
| UI-03 | Phase 2 | Pending |
| UI-04 | Phase 2 | Pending |
| UI-05 | Phase 2 | Pending |
| UI-06 | Phase 2 | Pending |
| UI-07 | Phase 2 | Pending |
| UI-08 | Phase 2 | Pending |
| SESS-01 | Phase 3 | Pending |
| SESS-02 | Phase 3 | Pending |
| SESS-03 | Phase 3 | Pending |
| SESS-04 | Phase 3 | Pending |
| SESS-05 | Phase 3 | Pending |
| SESS-06 | Phase 3 | Pending |
| STAB-01 | Phase 4 | Pending |
| STAB-02 | Phase 4 | Pending |
| STAB-03 | Phase 4 | Pending |
| STAB-04 | Phase 4 | Pending |
| STAB-05 | Phase 4 | Pending |
| OBSR-01 | Phase 5 | Pending |
| OBSR-02 | Phase 5 | Pending |
| OBSR-03 | Phase 5 | Pending |
| OBSR-04 | Phase 5 | Pending |
| OBSR-05 | Phase 5 | Pending |
| OBSR-06 | Phase 5 | Pending |
| CONT-01 | Phase 6 | Pending |
| CONT-02 | Phase 6 | Pending |
| CONT-03 | Phase 6 | Pending |
| CONT-04 | Phase 6 | Pending |
| CONT-05 | Phase 6 | Pending |
| CONT-06 | Phase 6 | Pending |
| CONT-07 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 48 total
- Mapped to phases: 48 (100% coverage)
- Unmapped: 0

---
*Requirements defined: 2026-01-27*
*Last updated: 2026-01-27 after roadmap creation*
