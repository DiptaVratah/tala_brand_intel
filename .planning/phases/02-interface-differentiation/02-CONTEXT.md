# Phase 2: Interface Differentiation - Context

**Gathered:** 2026-01-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Transform the three mode interfaces (Branding, Author, Self-Reflection) so each feels contextually appropriate through mode-specific language, visual theming, and framing. The backend remains universal — differentiation happens in the UX layer only. This phase does NOT add new features or change backend logic; it reframes what's already there.

**Scope note:** Backend prompt injection deferred to Phase 6 (Content Generation Organization). Phase 2 handles frontend preparation only.

</domain>

<decisions>
## Implementation Decisions

### Language & Terminology

**Voice Kit naming:**
- Branding: "Brand Kit"
- Author: "Voice Kit"
- Self-Reflection: "Identity Profile"

**Core action framing (Mirror Voice):**
- Branding: "Build Brand Voice"
- Author: "Craft Writing Voice"
- Self-Reflection: "Discover Inner Voice"

**Drift & Stability metrics:**
- Branding: "Brand Consistency" & "Brand Drift"
- Author: "Narrative Stability" & "Voice Shift"
- Self-Reflection: "Inner Alignment" & "Personal Change"

**Progressive phase names:**
Fully adapt per mode:
- Phase 1: "Build" (Branding) / "Craft" (Author) / "Discover" (Self-Reflection)
- Phase 2: "Brand Refinery" / "Voice Workshop" / "Identity Studio"
- Continue pattern for remaining phases

**DNA & Symbol terminology:**
- DNA adapts: "Brand DNA" / "Voice DNA" / "Identity DNA"
- Symbol stays universal (technical artifact)

**Voice Alchemy:**
- Keep "Voice Alchemy" universal across all modes

**Generation action labels:**
- Branding: "Create" (Create Brand Content)
- Author: "Write" (Write in Your Voice)
- Self-Reflection: "Reflect" (Generate Reflection)

### UI Polish Details

**Loading states:**
- Mode-specific loading messages:
  - Branding: "Analyzing brand voice..."
  - Author: "Capturing your style..."
  - Self-Reflection: "Reflecting on your words..."

**Error messages:**
- Mode-appropriate framing for same error:
  - Branding: "Brand voice extraction failed"
  - Author: "Writing voice capture failed"
  - Self-Reflection: "Reflection analysis failed"

**Typography & spacing:**
- Mode-specific typography systems and spacing
- Each mode gets its own hierarchy to reinforce identity
- Branding: tighter/bold, Author: relaxed/serif, Self-Reflection: softer/rounded

### Mode-Specific Content

**Placeholder text (main input):**
- Action-focused approach:
  - Branding: "Add content that represents your brand voice"
  - Author: "Share writing that sounds like you"
  - Self-Reflection: "Express what's on your mind"

**Tooltips & help text:**
- Mixed approach:
  - Technical tooltips: Universal (what it is)
  - Help text: Mode-specific (why you'd use it)
- Examples:
  - Technical: "Stability measures consistency of psychometric vectors"
  - Contextual: Branding: "Maintains consistency across campaigns" / Author: "Preserves your unique narrative style" / Self-Reflection: "Tracks your emotional patterns"

**Example inputs:**
- Expandable examples (collapsed by default)
- "See examples" link reveals 2-3 mode-appropriate sample inputs
- Branding: social posts, website copy
- Author: story excerpts, essays
- Self-Reflection: journal entries, personal thoughts

**Observatory metric labels:**
- Labels adapt per mode (Brand Consistency vs Narrative Stability vs Inner Alignment)
- Technical descriptions of how metrics are calculated stay universal

**Button text:**
- Primary CTAs use mode-specific language
- Secondary buttons stay universal
- Example: "Build Brand Kit" (primary) vs "Cancel" (secondary)

**Empty states:**
- Mode-specific welcome messages before first kit creation
- Explain value prop per mode:
  - Branding: consistent brand voice benefit
  - Author: capturing writing style benefit
  - Self-Reflection: tracking personal voice purpose

### Visual Theming

**Color scheme approach:**
- Accent colors only (not comprehensive theming)
- Branding: Blue accents
- Author: Red/orange accents
- Self-Reflection: Green accents
- Backgrounds, cards, and base typography stay consistent

**Mode switcher dropdown:**
- Color-coded options
- Each mode option shows its theme color with icon
- Easy to distinguish at a glance

### Claude's Discretion

Areas where Claude has flexibility during planning/implementation:

- Overall tone differences between modes (keep appropriate to context)
- Success feedback style and celebration variations
- Visual effects and animation timing differences
- How clearly the current mode is indicated throughout the interface
- Progressive phase guidance adaptation (which instructions benefit from mode context)
- Voice Kit display variations in saved kit list
- Loading skeleton designs
- Exact spacing and typography scale details

</decisions>

<specifics>
## Specific Ideas

- Landing page already uses emergent AI design standards (Linear/Vercel/Anthropic) - maintain this quality bar
- Existing glassmorphism and micro-interactions should inform mode theming
- Keep the professional, minimal aesthetic - differentiation is subtle, not overwhelming
- Mode colors referenced in roadmap: Branding (blue/stable), Author (red/dynamic), Self-Reflection (green/calm)

</specifics>

<deferred>
## Deferred Ideas

**Backend prompt injection (Phase 6):**
- Mode-aware system prompts: "Generate professional brand content" vs "Generate creative fiction" vs "Generate reflective content"
- LLM context injection based on current mode
- LANGUAGE_MATRIX backend extension for mode-specific prompt engineering

Phase 2 handles frontend context prep only. Backend prompt changes belong in Phase 6 (Content Generation Organization).

</deferred>

---

*Phase: 02-interface-differentiation*
*Context gathered: 2026-01-27*
