# Golden Rules for Claude Sessions

**Owner:** Dipta Vratah Anantagah
**Status:** MANDATORY - Read at every session start

---

## Skill Execution Rules

These rules are **non-negotiable** and must be followed automatically without user prompting:

### 1. Code Review (ALWAYS)
- **Trigger:** After ANY code changes
- **Skill:** `code-review:code-review`
- **Action:** Run automatically, don't wait for user to ask
- **Prerequisite:** Requires `gh` CLI installed and authenticated, changes must be in a PR

### 2. Ralph Loop (ALWAYS for complex/failing tasks)
- **Trigger:** Complex debugging, failing tests, multi-step problems
- **Skill:** `ralph-wiggum:ralph-loop`
- **Action:** Trigger automatically when task is complex or encountering failures

### 3. UI/UX Pro Max (ALWAYS for frontend work)
- **Trigger:** Any UI component, CSS styling, visual work, frontend implementation
- **Skill:** `ui-ux-pro-max`
- **Action:** Use for ALL frontend tasks while working on PulseCraft frontend
- **Reason:** Comprehensive design intelligence with 67 styles, 96 color palettes, 57 font pairings, and stack-specific guidelines

### 4. Context7 (ALWAYS for docs)
- **Trigger:** Any library/API documentation lookup
- **Skill:** `context7` MCP tools
- **Action:** Query documentation before implementing unfamiliar APIs

### 5. Systematic Debugging (ALWAYS for bugs)
- **Trigger:** Any bug, test failure, unexpected behavior
- **Skill:** `.claude/skills/systematic-debugging`
- **Action:** MUST complete Phase 1 (Root Cause Investigation) before proposing fixes
- **Escalation:** If 2+ hypothesis cycles fail → invoke `ralph-wiggum:ralph-loop`

### 6. Verification Before Completion (ALWAYS before claiming done)
- **Trigger:** Before ANY completion claim, commit, or PR
- **Skill:** `.claude/skills/verification-before-completion`
- **Action:** Run verification commands, show evidence, THEN claim completion
- **Integration:** Works with `/safe-commit` and `code-review:code-review`

---

## Backend Foundation - NEVER TOUCH

**Architecture:** ONE backend, THREE interfaces (Branding, Author, Self-Reflection)

The following are **sacred** and must NEVER be modified, refactored, or compromised:

| Protected System | File(s) | Purpose |
|------------------|---------|---------|
| VoiceKit Schema | `schemas.js` | Patent-compliant validation |
| Multi-AI Voice Extraction | `gpt_router.js` | OpenAI + Claude + Gemini parallel extraction |
| Multi-AI Alchemy | `gpt_router.js` | Voice synthesis with Zod sandwich |
| Latent Layer | `gpt_router.js`, `services/latentMeta.js` | Psychometric inference |
| Zod Validation | `schemas.js`, `gpt_router.js` | Schema enforcement |
| Streaming | `gpt_router.js`, `server.js` | Vercel AI SDK integration |
| Telemetry | `server.js` | MongoDB shadow logging |

**Rule:** Only BUILD ON TOP. Never refactor core. New features = new code, not modified foundations.

---

## User Expectations

- **No generic AI solutions** - reach for highest potential
- **Proactive skill usage** - don't wait for prompts
- **Commit all changes** - never lose backend progress again
- **Cross-check before confirming** - verify features exist in code

---

*Last Updated: 2026-02-19*
