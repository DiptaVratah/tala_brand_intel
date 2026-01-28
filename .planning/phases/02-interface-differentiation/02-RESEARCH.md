# Phase 2: Interface Differentiation - Research

**Researched:** 2026-01-28
**Domain:** Frontend UX differentiation, CSS theming, and context-aware UI patterns
**Confidence:** HIGH

## Summary

Interface differentiation through mode-specific language, visual theming, and contextual framing is a well-established pattern in modern web applications. The standard approach uses CSS custom properties (CSS variables) for theming combined with data attributes on the document root to switch contexts. This allows a single codebase to present different "faces" without duplicating component logic.

The project already has a strong foundation with the `shapeshifter.js` LANGUAGE_MATRIX pattern and router-based mode switching. The existing landing page demonstrates emergent AI design standards (glassmorphism, dark backgrounds, subtle micro-interactions) that should inform mode differentiation—keeping the professional, minimal aesthetic while adding subtle contextual signals.

Research focused on: (1) CSS theming best practices for 2026, (2) mode-switcher UI patterns and context-aware interfaces, (3) professional UI polish patterns (loading states, error messages, empty states, typography systems), and (4) glassmorphism implementation with performance optimization.

**Primary recommendation:** Use CSS custom properties scoped by data-mode attribute for accent color theming, extend the existing LANGUAGE_MATRIX in shapeshifter.js for all contextual language, maintain the glassmorphism aesthetic from landing page, and implement professional loading/error/empty states with mode-specific messaging.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| CSS Custom Properties | Native | Theme variable management | Browser-native, performant, runtime-mutable without CSS recompilation |
| Data Attributes | Native | Mode state management | Semantic HTML, CSS-selectable, accessible to JS |
| IBM Plex Sans | Current | Typography system | Already in use, professional sans-serif with excellent weight range |
| Font Awesome | 6.5.1+ | Icons | Already in use, comprehensive icon set |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Vanilla JavaScript | ES6+ | Mode switching logic | No framework overhead, direct DOM manipulation |
| LocalStorage API | Native | Mode preference persistence | Saving user's last-selected mode |
| backdrop-filter | CSS3 | Glassmorphism effects | Visual depth and polish |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS Variables | CSS-in-JS (styled-components) | CSS-in-JS adds bundle size and runtime cost; not needed for mode switching |
| Data attributes | CSS classes | Data attributes are more semantic and clearly indicate state vs style |
| Vanilla JS | React/Vue | Framework would require full rewrite; current codebase works well |

**Installation:**
```bash
# No additional packages required - all native browser APIs
# Existing dependencies in package.json are sufficient
```

## Architecture Patterns

### Recommended Project Structure
```
pulsecraft_ui/
├── router.js              # Route handling (already exists)
├── shapeshifter.js        # Mode context management (already exists)
├── script.js              # Core app logic
├── progressive.js         # Phase revelation system
├── style.css              # Base styles + theme variables
├── landing.css            # Landing page (already polished)
├── progressive.css        # Phase-specific styles
├── dashboard.css          # Observatory/metrics styles
└── index.html             # Single-page app structure
```

### Pattern 1: CSS Custom Properties for Mode Theming

**What:** Define mode-specific theme variables in CSS, scope them by data-mode attribute, override only accent colors while keeping base design consistent.

**When to use:** When you need visual differentiation without rewriting entire stylesheets.

**Example:**
```css
/* Source: MDN CSS Custom Properties + research synthesis */
:root {
  /* Base theme (never changes) */
  --background-primary: #0a0a0a;
  --text-primary: #f1f5f9;
  --glass-bg: rgba(15, 23, 42, 0.6);

  /* Mode-agnostic defaults */
  --accent-primary: #6366f1;
  --accent-hover: #4f46e5;
}

/* Branding mode - Blue accents */
[data-mode="branding"] {
  --accent-primary: #3b82f6;
  --accent-hover: #2563eb;
  --accent-glow: rgba(59, 130, 246, 0.3);
}

/* Author mode - Red/Purple accents */
[data-mode="author"] {
  --accent-primary: #ef4444;
  --accent-hover: #dc2626;
  --accent-glow: rgba(239, 68, 68, 0.3);
}

/* Self-Reflection mode - Green accents */
[data-mode="therapy"] {
  --accent-primary: #10b981;
  --accent-hover: #059669;
  --accent-glow: rgba(16, 185, 129, 0.3);
}

/* Apply to components */
.btn-primary {
  background: var(--accent-primary);
  box-shadow: 0 0 20px var(--accent-glow);
}

.btn-primary:hover {
  background: var(--accent-hover);
}
```

### Pattern 2: Language Matrix with Mode Context

**What:** Centralized object mapping UI strings to mode-specific variants, accessed via mode key.

**When to use:** When same UI element needs different text/labels per mode.

**Example:**
```javascript
// Source: Existing shapeshifter.js pattern + research synthesis
class InterfaceShapeshifter {
  constructor() {
    this.currentMode = 'branding';

    this.LANGUAGE_MATRIX = {
      branding: {
        voiceKitName: 'Brand Kit',
        analyzeButton: 'Build Brand Voice',
        driftLabel: 'Brand Consistency',
        stabilityLabel: 'Brand Drift',
        loadingText: 'Analyzing brand voice...',
        errorPrefix: 'Brand voice extraction failed',
        emptyState: 'Create your first Brand Kit to get started'
      },
      author: {
        voiceKitName: 'Voice Kit',
        analyzeButton: 'Craft Writing Voice',
        driftLabel: 'Narrative Stability',
        stabilityLabel: 'Voice Shift',
        loadingText: 'Capturing your style...',
        errorPrefix: 'Writing voice capture failed',
        emptyState: 'Create your first Voice Kit to begin'
      },
      therapy: {
        voiceKitName: 'Identity Profile',
        analyzeButton: 'Discover Inner Voice',
        driftLabel: 'Inner Alignment',
        stabilityLabel: 'Personal Change',
        loadingText: 'Reflecting on your words...',
        errorPrefix: 'Reflection analysis failed',
        emptyState: 'Create your first Identity Profile to explore'
      }
    };
  }

  setMode(mode) {
    this.currentMode = mode;
    document.documentElement.setAttribute('data-mode', mode);
    this.updateLanguage();
  }

  updateLanguage() {
    const lang = this.LANGUAGE_MATRIX[this.currentMode];
    document.querySelectorAll('[data-text-key]').forEach(el => {
      const key = el.getAttribute('data-text-key');
      if (lang[key]) el.textContent = lang[key];
    });
  }
}
```

### Pattern 3: Mode-Specific Loading States

**What:** Loading indicators with mode-appropriate messaging and visual cues.

**When to use:** Any async operation (API calls, data processing).

**Example:**
```javascript
// Source: Research on loading state patterns + existing loading overlay
function showLoading(mode) {
  const messages = {
    branding: 'Analyzing brand voice...',
    author: 'Capturing your style...',
    therapy: 'Reflecting on your words...'
  };

  const overlay = document.getElementById('loadingOverlay');
  const text = overlay.querySelector('.loading-text');
  text.textContent = messages[mode];
  overlay.classList.remove('hidden');
}

function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  overlay.classList.add('hidden');
}
```

### Pattern 4: Contextual Error Handling

**What:** Error messages framed appropriately for each mode's context.

**When to use:** All error scenarios (network, validation, server errors).

**Example:**
```javascript
// Source: Research on error message UX patterns
function showError(error, mode) {
  const prefixes = {
    branding: 'Brand voice extraction failed',
    author: 'Writing voice capture failed',
    therapy: 'Reflection analysis failed'
  };

  const message = `${prefixes[mode]}: ${error.message}`;
  showToast(message, 'error');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}
```

### Pattern 5: Typography Differentiation

**What:** Subtle typography variations per mode to reinforce identity.

**When to use:** Mode-specific feel without sacrificing readability.

**Example:**
```css
/* Source: Typography hierarchy research synthesis */
/* Branding: Tighter, bold, professional */
[data-mode="branding"] {
  --heading-weight: 700;
  --heading-spacing: -0.02em;
  --body-line-height: 1.5;
}

[data-mode="branding"] h2 {
  font-weight: var(--heading-weight);
  letter-spacing: var(--heading-spacing);
}

/* Author: Relaxed, serif accents, flowing */
[data-mode="author"] {
  --heading-weight: 600;
  --heading-spacing: -0.01em;
  --body-line-height: 1.7;
}

[data-mode="author"] .tagline {
  font-family: Georgia, serif;
  font-style: italic;
}

/* Self-Reflection: Softer, rounded, approachable */
[data-mode="therapy"] {
  --heading-weight: 500;
  --heading-spacing: 0;
  --body-line-height: 1.6;
}

[data-mode="therapy"] h2 {
  font-weight: var(--heading-weight);
}
```

### Anti-Patterns to Avoid

- **Duplicating HTML per mode:** Don't create separate HTML files or components for each mode. Use one structure with dynamic content.
- **Inline styles for theming:** Don't use JavaScript to set inline styles. CSS custom properties are faster and more maintainable.
- **Over-differentiation:** Don't change too much between modes. Users should recognize it's the same app, just with different context.
- **Inconsistent naming:** Don't use `brand` in some places and `branding` in others. Pick one term per concept.
- **Hardcoding mode checks everywhere:** Centralize mode-specific logic in shapeshifter.js, not scattered across codebase.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Theme switching | Custom theme engine with JS style injection | CSS Custom Properties + data attributes | Browser-optimized, no FOUC, better performance |
| Skeleton loaders | Custom animated divs with complex keyframes | CSS linear-gradient + background-position animation | Proven pattern, GPU-accelerated, minimal code |
| Toast notifications | Modal dialogs for every message | Toast container with auto-dismiss | Non-blocking, better UX, established pattern |
| Loading spinners | Generic spinning circles | Mode-specific text + subtle animation | Contextual feedback reduces perceived wait time |
| Typography scales | Ad-hoc font sizes | Defined scale (1rem, 1.125rem, 1.25rem, 1.5rem, 2rem) | Maintains hierarchy, easier to adjust globally |
| Color contrast | Eyeballing accessibility | WCAG AAA compliance checking | Legal requirement, better UX for all users |

**Key insight:** Interface differentiation is about orchestration, not invention. The patterns (CSS variables, data attributes, language matrices) are mature and performant. Don't reinvent them.

## Common Pitfalls

### Pitfall 1: Forgetting Fallback Values in CSS Variables
**What goes wrong:** CSS custom properties don't fall back to initial values if variable is undefined. Components become invisible or broken.

**Why it happens:** Assuming undefined variables behave like undefined JavaScript variables (falsy but recoverable).

**How to avoid:** Always provide fallback values: `background: var(--accent-primary, #6366f1);`

**Warning signs:** Blank buttons, missing colors, elements with no visible styling.

### Pitfall 2: Mode State Desynchronization
**What goes wrong:** Router thinks mode is "author" but shapeshifter thinks mode is "branding", or data-mode attribute doesn't match JavaScript state.

**Why it happens:** Multiple sources of truth (router.currentMode, shapeshifter.currentMode, data-mode attribute).

**How to avoid:** Single source of truth pattern: router updates shapeshifter, shapeshifter updates DOM attribute, components read from DOM attribute only.

**Warning signs:** Wrong colors with correct text, or correct colors with wrong text.

### Pitfall 3: Overusing backdrop-filter (Performance)
**What goes wrong:** Lag on scroll, janky animations, poor mobile performance.

**Why it happens:** backdrop-filter is GPU-intensive. Applying it to many elements or animating it causes repaints.

**How to avoid:** Limit to 2-3 glass elements per viewport. Never animate backdrop-filter. Use static or pre-blurred backgrounds when possible. Test on low-end devices.

**Warning signs:** Scroll lag, high GPU usage in DevTools, complaints from users on older devices.

### Pitfall 4: Invisible Text Due to Color Contrast Issues
**What goes wrong:** Mode accent colors make text unreadable against backgrounds.

**Why it happens:** Choosing accent colors based on aesthetics without checking contrast ratios.

**How to avoid:** Use WCAG AAA contrast checker (7:1 for normal text, 4.5:1 for large text). Test every mode's accent colors against backgrounds they'll appear on.

**Warning signs:** User reports of "can't read the button text", accessibility audit failures.

### Pitfall 5: Toast Notification Timing Conflicts
**What goes wrong:** Multiple toasts stack and obscure content, or dismiss too quickly to read.

**Why it happens:** Not managing toast lifecycle, firing multiple toasts in rapid succession.

**How to avoid:** Queue toasts (show one at a time), set timing based on message length (3-8 seconds), allow manual dismiss. Use `role="status"` for screen readers.

**Warning signs:** Users miss important feedback, toasts pile up in corner, accessibility tools don't announce toasts.

### Pitfall 6: Loading State Not Cleared on Error
**What goes wrong:** Loading overlay stays visible forever when API call fails.

**Why it happens:** Only calling `hideLoading()` in success handler, not in error handler.

**How to avoid:** Always hide loading in `.finally()` block or use try/finally pattern.

**Warning signs:** Permanent loading overlay, users report "stuck loading".

### Pitfall 7: Language Matrix Key Mismatches
**What goes wrong:** Some UI elements don't update when mode changes.

**Why it happens:** Typo in `data-text-key` attribute doesn't match LANGUAGE_MATRIX key.

**How to avoid:** Use constants for keys, add console warnings for missing keys in development.

**Warning signs:** Some labels change, others stay generic or show wrong mode's text.

## Code Examples

Verified patterns from official sources:

### CSS Custom Properties for Theming
```css
/* Source: MDN Web Docs - Using CSS custom properties */
/* https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties */

/* Define in :root for global access */
:root {
  --accent-primary: #6366f1;
  --accent-hover: #4f46e5;
}

/* Override per mode */
[data-mode="branding"] {
  --accent-primary: #3b82f6;
  --accent-hover: #2563eb;
}

/* Use with fallbacks */
.btn-primary {
  background: var(--accent-primary, #6366f1);
  transition: background 0.2s ease;
}

.btn-primary:hover {
  background: var(--accent-hover, #4f46e5);
}
```

### Glassmorphism Implementation
```css
/* Source: Multiple glassmorphism best practice guides */
/* https://invernessdesignstudio.com/glassmorphism-what-it-is-and-how-to-use-it-in-2026 */

.glass-card {
  /* Semi-transparent background */
  background: rgba(15, 23, 42, 0.6);

  /* Blur backdrop */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px); /* Safari support */

  /* Subtle border for definition */
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 20px;

  /* Soft shadow for depth */
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.02) inset;
}

/* Mobile optimization - reduce blur */
@media (max-width: 768px) {
  .glass-card {
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }
}
```

### Skeleton Loading Animation
```css
/* Source: CSS-Tricks - Building Skeleton Screens with CSS Custom Properties */
/* https://css-tricks.com/building-skeleton-screens-css-custom-properties/ */

.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 25%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Usage */
.skeleton-text {
  height: 1rem;
  width: 100%;
  margin-bottom: 0.5rem;
}

.skeleton-heading {
  height: 2rem;
  width: 60%;
  margin-bottom: 1rem;
}
```

### Error Message Pattern
```javascript
/* Source: Smashing Magazine - Designing Better Error Messages UX */
/* https://www.smashingmagazine.com/2022/08/error-messages-ux-design/ */

function showError(context, technicalError) {
  const errorConfig = {
    branding: {
      prefix: 'Brand voice extraction failed',
      suggestion: 'Try entering more brand-focused content',
      icon: 'fa-fingerprint'
    },
    author: {
      prefix: 'Writing voice capture failed',
      suggestion: 'Try sharing a longer writing sample',
      icon: 'fa-feather-pointed'
    },
    therapy: {
      prefix: 'Reflection analysis failed',
      suggestion: 'Try expressing your thoughts more openly',
      icon: 'fa-compass'
    }
  };

  const config = errorConfig[context];
  const message = `
    <div class="error-toast">
      <i class="fas ${config.icon}"></i>
      <div>
        <strong>${config.prefix}</strong>
        <p>${config.suggestion}</p>
        <small>${technicalError.message}</small>
      </div>
    </div>
  `;

  showToast(message, 'error', 7000); // 7 seconds for error messages
}
```

### Empty State Pattern
```html
<!-- Source: Multiple empty state UX guides -->
<!-- https://www.eleken.co/blog-posts/empty-state-ux -->

<!-- HTML structure -->
<div class="empty-state" data-mode-context>
  <div class="empty-state-icon">
    <i class="fas fa-inbox"></i>
  </div>
  <h3 data-text-key="emptyStateHeading">No voice kits yet</h3>
  <p data-text-key="emptyStateDescription">Create your first kit to get started</p>
  <button class="btn-primary" data-text-key="emptyStateCTA">
    Create Your First Kit
  </button>
</div>
```

```css
.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
}

.empty-state-icon {
  font-size: 3rem;
  color: var(--accent-primary);
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.empty-state p {
  font-size: 0.9375rem;
  margin-bottom: 1.5rem;
}
```

### Typography Scale System
```css
/* Source: Design system typography hierarchy research */
/* https://medium.com/eightshapes-llc/typography-in-design-systems-6ed771432f1e */

:root {
  /* Type scale - modular scale (1.125 ratio) */
  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.875rem;     /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg: 1.125rem;     /* 18px */
  --text-xl: 1.25rem;      /* 20px */
  --text-2xl: 1.5rem;      /* 24px */
  --text-3xl: 2rem;        /* 32px */
  --text-4xl: 2.5rem;      /* 40px */

  /* Line heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;

  /* Font weights */
  --weight-normal: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;
}

/* Apply systematically */
.caption { font-size: var(--text-xs); }
.body-sm { font-size: var(--text-sm); }
.body { font-size: var(--text-base); line-height: var(--leading-normal); }
.body-lg { font-size: var(--text-lg); line-height: var(--leading-relaxed); }
h3 { font-size: var(--text-xl); font-weight: var(--weight-semibold); }
h2 { font-size: var(--text-2xl); font-weight: var(--weight-bold); }
h1 { font-size: var(--text-3xl); font-weight: var(--weight-bold); }
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CSS classes for themes (.theme-dark, .theme-light) | CSS custom properties + data attributes | 2020-2021 | Runtime theme switching without class manipulation, better performance |
| Separate stylesheets per theme | Single stylesheet with CSS variables | 2019-2020 | Smaller bundle size, no FOUC (flash of unstyled content) |
| JavaScript style injection | CSS custom properties set via JS | 2020-2021 | Leverages native CSS engine, GPU-accelerated |
| Modal alerts for feedback | Toast notifications | 2018-2019 | Non-blocking UX, better for success messages |
| Generic loading spinners | Skeleton screens | 2019-2020 | Better perceived performance, less jarring |
| Binary themes (light/dark) | Context-aware multi-mode theming | 2024-2025 | Interfaces adapt to user role/persona/use case |
| Static fonts | Variable fonts | 2023-2024 | One file vs 12, design flexibility, better performance |

**Deprecated/outdated:**
- **jQuery theme plugins:** Modern browsers have native CSS variable support, no need for library overhead
- **LESS/SASS color functions for theming:** CSS custom properties can be modified at runtime, preprocessors can't
- **Separate mobile/desktop CSS files:** CSS Grid and Flexbox with media queries handle responsive design in one file
- **CSS reset libraries (Normalize.css):** Modern browsers converged on standards, minimal reset needed

## Open Questions

Things that couldn't be fully resolved:

1. **Progressive phase language adaptation**
   - What we know: CONTEXT.md specifies progressive phases should fully adapt (Build/Craft/Discover, Brand Refinery/Voice Workshop/Identity Studio)
   - What's unclear: Whether progressive.js has hooks for language injection or if HTML needs data attributes for dynamic text replacement
   - Recommendation: Audit progressive.js implementation during planning to determine injection points

2. **Mode switcher dropdown placement**
   - What we know: Router shows/hides mode switcher based on landing vs app view, CONTEXT.md specifies color-coded dropdown with icons
   - What's unclear: Whether mode switcher DOM element exists in current HTML or needs to be created
   - Recommendation: Check index.html for `#modeSwitcher` element during planning, create if missing

3. **Observatory metric adaptation depth**
   - What we know: Labels should adapt (Brand Consistency vs Narrative Stability vs Inner Alignment), technical descriptions stay universal
   - What's unclear: Whether Observatory/dashboard implementation has clear separation between label elements and technical description elements
   - Recommendation: Audit dashboard.css and dashboard-related HTML during planning to identify which elements need data-text-key attributes

4. **Backend mode parameter**
   - What we know: Phase 2 is frontend only, backend prompt injection deferred to Phase 6
   - What's unclear: Whether backend API expects a mode parameter that should be sent but not yet used, or if mode should be client-side only until Phase 6
   - Recommendation: Check server.js API endpoints during planning to see if mode parameter is already present

5. **Loading overlay vs skeleton screens**
   - What we know: Loading overlay exists (`#loadingOverlay` in HTML), skeleton screens are mentioned as best practice
   - What's unclear: Whether to replace loading overlay with skeleton screens, or use both for different contexts (overlay for full-page, skeletons for inline)
   - Recommendation: Use loading overlay for mode analysis (full-page blocking operation), consider adding skeletons for Voice Library loading (inline, partial)

## Sources

### Primary (HIGH confidence)
- [MDN Web Docs - Using CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) - CSS variable implementation
- [MDN Web Docs - Data Attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/data-*) - Semantic state management
- [Glassmorphism: What It Is and How to Use It in 2026](https://invernessdesignstudio.com/glassmorphism-what-it-is-and-how-to-use-it-in-2026) - Performance optimization
- [CSS-Tricks - Building Skeleton Screens with CSS Custom Properties](https://css-tricks.com/building-skeleton-screens-css-custom-properties/) - Loading state patterns
- [Smashing Magazine - Designing Better Error Messages UX](https://www.smashingmagazine.com/2022/08/error-messages-ux-design/) - Contextual error handling
- [Medium - Typography in Design Systems (EightShapes)](https://medium.com/eightshapes-llc/typography-in-design-systems-6ed771432f1e) - Typography hierarchy

### Secondary (MEDIUM confidence)
- [Tailwind CSS Best Practices 2025-2026](https://www.frontendtools.tech/blog/tailwind-css-best-practices-design-system-patterns) - Design token patterns (verified with MDN)
- [Top UI/UX Design Trends for 2026 (DEV Community)](https://dev.to/pixel_mosaic/top-uiux-design-trends-for-2026-ai-first-context-aware-interfaces-spatial-experiences-166j) - Context-aware interface trends (verified with Nielsen Norman Group)
- [LogRocket - Toast Notifications UX](https://blog.logrocket.com/ux-design/toast-notifications/) - Toast best practices (verified with accessibility sources)
- [Eleken - Empty State UX](https://www.eleken.co/blog-posts/empty-state-ux) - First-time user patterns (verified with multiple UX sources)

### Tertiary (LOW confidence)
- Multiple WebSearch results on mode switcher patterns - No single authoritative source found, pattern synthesized from B2B SaaS UX articles and Nielsen Norman Group modes research
- Variable fonts performance claims - Mentioned in multiple 2026 typography trend articles but not verified with official browser documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Native browser APIs, well-documented, production-proven
- Architecture: HIGH - Patterns verified across multiple authoritative sources (MDN, CSS-Tricks, Smashing Magazine)
- Pitfalls: HIGH - Based on documented issues in CSS custom properties, backdrop-filter performance, and toast notification accessibility research

**Research date:** 2026-01-28
**Valid until:** 2026-03-28 (60 days - domain is relatively stable, browser APIs mature)

**Notes:**
- Existing codebase already implements many best practices (glassmorphism in landing.css, router pattern, shapeshifter language matrix)
- Phase 2 builds on strong foundation rather than replacing architecture
- Focus on extension and polish, not rewrite
- All patterns are production-ready and browser-native (no new dependencies required)
