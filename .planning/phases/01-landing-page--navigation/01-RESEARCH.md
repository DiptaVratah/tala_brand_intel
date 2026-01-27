# Phase 1: Landing Page & Navigation - Research

**Researched:** 2026-01-27
**Domain:** Client-side routing and SaaS landing page design
**Confidence:** HIGH

## Summary

This phase requires implementing a professional landing page with clean URL-based routing for a single-page application. The current system uses a progressive reveal pattern (phases 1-5) but lacks a true landing page and proper URL routing. Users cannot directly access modes or use browser navigation.

The 2026 standard for SaaS landing pages emphasizes outcome-driven messaging, minimal navigation (or no navigation bar), and story-driven hero sections. For routing, vanilla JavaScript with the History API (pushState/popstate) is the preferred approach for projects without framework dependencies, offering longevity and simplicity over framework-specific routers.

The implementation must transform the current phase-based system into a mode-based routing system where:
- Root URL (/) shows landing page with mode selection cards
- Clean paths (/branding, /author, /self-reflection) route to different interface modes
- Browser back/forward buttons work correctly
- Mode state persists in localStorage for return visits

**Primary recommendation:** Use vanilla JavaScript History API for clean path-based routing, design a minimal landing page with card-based mode selection following 2026 SaaS standards, and persist mode state in localStorage.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| History API | Native | Client-side routing with pushState/popstate | Built into browsers since 2015, no dependencies, will work in 5 years |
| localStorage | Native | State persistence across sessions | Standard browser API for non-sensitive client-side storage |
| Vanilla JavaScript | ES6+ | Application logic and routing | Zero dependencies, long-term maintainability, surgical control |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| CSS Grid/Flexbox | Native | Card-based layout | Standard for modern responsive layouts |
| Intersection Observer | Native | Scroll animations (optional) | Progressive enhancement for landing page |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| History API | React Router | Framework lock-in, 50KB+ bundle, requires React ecosystem |
| History API | Vue Router | Framework dependency, needs Vue, learning curve |
| Vanilla JS | Framework SPA | Faster initial dev but higher maintenance burden, cognitive overhead |
| localStorage | sessionStorage | Data lost on tab close, not suitable for "return visit" persistence |

**Installation:**
```bash
# No installation needed - using native browser APIs
```

## Architecture Patterns

### Recommended Project Structure

```
pulsecraft_ui/
├── index.html           # Landing page (root view)
├── app.html             # Main application shell (loaded by router)
├── router.js            # URL routing logic (History API)
├── landing.js           # Landing page interactions
├── script.js            # Application logic (existing)
├── progressive.js       # Progressive reveal system (existing)
├── shapeshifter.js      # Mode switching logic (existing)
├── style.css            # Core styles
├── landing.css          # Landing page specific styles
└── progressive.css      # Phase reveal animations
```

### Pattern 1: Vanilla JS Router with History API

**What:** Client-side router using pushState for clean URLs and popstate for browser navigation
**When to use:** SPAs without framework dependencies needing clean URLs and browser history support

**Example:**
```javascript
// Source: MDN History API Documentation
class Router {
  constructor(routes) {
    this.routes = routes;
    this.init();
  }

  init() {
    // Listen for back/forward navigation
    window.addEventListener('popstate', (event) => {
      this.handleRoute(window.location.pathname, event.state);
    });

    // Handle initial page load
    this.handleRoute(window.location.pathname);
  }

  navigate(path, state = {}) {
    // Update URL without page reload
    history.pushState(state, '', path);
    this.handleRoute(path, state);
  }

  handleRoute(path, state = {}) {
    const route = this.routes[path] || this.routes['/'];
    if (route) {
      route(state);
    }
  }
}

// Usage
const router = new Router({
  '/': () => showLandingPage(),
  '/branding': () => loadMode('branding'),
  '/author': () => loadMode('author'),
  '/self-reflection': () => loadMode('self-reflection')
});
```

### Pattern 2: Card-Based Mode Selection

**What:** Interactive card interface for mode selection with outcome-driven descriptions
**When to use:** Landing pages where users choose between 2-5 distinct pathways

**Example:**
```html
<!-- Source: 2026 SaaS Landing Page Standards -->
<div class="mode-selector">
  <article class="mode-card" data-mode="branding">
    <div class="mode-icon">🎯</div>
    <h3>Branding</h3>
    <p class="outcome">Build a consistent brand voice that resonates</p>
    <button class="select-mode" data-path="/branding">
      Start Building
    </button>
  </article>
  <!-- More cards... -->
</div>
```

```css
.mode-card {
  border: 2px solid transparent;
  transition: all 0.3s ease;
  cursor: pointer;
  padding: 2rem;
  border-radius: 12px;
}

.mode-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}
```

### Pattern 3: localStorage State Persistence

**What:** Save and restore mode selection across browser sessions
**When to use:** SPAs where user context should persist between visits

**Example:**
```javascript
// Source: localStorage Best Practices 2026
class ModeState {
  static save(mode) {
    const state = {
      mode: mode,
      timestamp: Date.now(),
      version: '1.0'
    };
    localStorage.setItem('pulsecraft_mode', JSON.stringify(state));
  }

  static load() {
    try {
      const saved = localStorage.getItem('pulsecraft_mode');
      if (!saved) return null;

      const state = JSON.parse(saved);
      // Optional: Check if state is stale (e.g., > 30 days)
      const daysOld = (Date.now() - state.timestamp) / (1000 * 60 * 60 * 24);
      if (daysOld > 30) {
        this.clear();
        return null;
      }

      return state.mode;
    } catch (e) {
      console.error('Failed to load mode state:', e);
      return null;
    }
  }

  static clear() {
    localStorage.removeItem('pulsecraft_mode');
  }
}
```

### Pattern 4: Landing Page Layout (2026 Standard)

**What:** Minimal, outcome-focused landing page with single CTA pattern
**When to use:** SaaS landing pages prioritizing conversion over exploration

**Example:**
```html
<!-- Source: 2026 SaaS Design Trends -->
<main class="landing">
  <section class="hero">
    <h1>PulseCraft</h1>
    <p class="tagline">Most tools give you templates, this one gives you yourself</p>
  </section>

  <section class="mode-selection">
    <h2>Choose Your Path</h2>
    <!-- Card grid with 3 modes -->
  </section>

  <!-- NO navigation bar, NO footer links -->
</main>
```

### Anti-Patterns to Avoid

- **Navigation bar on landing page:** Provides exit points that reduce conversion (266% drop with second CTA)
- **Query parameters for mode (?mode=author):** Not professional, breaks direct URL access expectations
- **Calling pushState without popstate listener:** Browser back button won't work
- **Storing sensitive data in localStorage:** Not secure, only use for non-sensitive UI state
- **Manual history.go() calls without necessity:** Use back/forward for user actions only
- **Skipping error handling for localStorage:** Can fail in private browsing mode

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| URL parsing | Custom regex URL parser | `new URL(window.location)` or `URLSearchParams` | Built-in, handles edge cases, standard |
| Route matching | String comparison loops | Object lookup or Map | O(1) performance, cleaner code |
| JSON serialization for storage | Custom stringify | `JSON.stringify/parse` with try/catch | Handles nested objects, standard error patterns |
| Card hover effects | Custom JavaScript animations | CSS transitions/transforms | Hardware accelerated, simpler, more performant |
| Scroll management | Manual scroll position tracking | `scrollIntoView({ behavior: 'smooth' })` | Built-in, accessibility compliant |

**Key insight:** Modern browser APIs solve 90% of SPA routing and state management problems. Custom solutions add complexity without benefit and create maintenance burden.

## Common Pitfalls

### Pitfall 1: Browser Back Button Breaks After pushState

**What goes wrong:** Using `history.pushState()` without listening to `popstate` events causes back/forward buttons to change URL but not update UI

**Why it happens:** `pushState` doesn't fire `popstate` - only user navigation (back/forward) or `history.back()` does

**How to avoid:**
```javascript
// WRONG: Only using pushState
function navigate(path) {
  history.pushState({}, '', path);
  loadView(path); // UI updates, but back button won't work
}

// RIGHT: Listen to popstate AND call route handler
window.addEventListener('popstate', (event) => {
  loadView(window.location.pathname, event.state);
});

function navigate(path, state = {}) {
  history.pushState(state, '', path);
  loadView(path, state); // UI updates immediately
}
```

**Warning signs:**
- URL changes but page doesn't update when clicking browser back
- Console errors about undefined state on navigation

### Pitfall 2: Direct URL Access Returns 404

**What goes wrong:** User pastes `/branding` into browser, server returns 404 because route only exists client-side

**Why it happens:** SPAs need server configured to return `index.html` for all paths, not just root

**How to avoid:** Configure server to serve `index.html` for all non-file paths
```javascript
// Express.js example (server.js)
app.get('*', (req, res) => {
  // Only serve index.html for non-API, non-static-file requests
  if (!req.path.startsWith('/api/') && !req.path.includes('.')) {
    res.sendFile(path.join(__dirname, 'pulsecraft_ui', 'index.html'));
  }
});
```

**Warning signs:**
- Root URL works, but `/branding` gives 404 on page refresh
- Works locally but breaks on deployment

### Pitfall 3: localStorage Fails Silently in Private Browsing

**What goes wrong:** Code assumes localStorage always works, throws errors in private browsing mode or when storage quota exceeded

**Why it happens:** Some browsers block localStorage in private mode or when storage is full

**How to avoid:**
```javascript
function safeLocalStorage() {
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch(e) {
    return false;
  }
}

const storage = {
  set: (key, value) => {
    if (safeLocalStorage()) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch(e) {
        console.warn('Storage failed:', e);
      }
    }
  },
  get: (key) => {
    if (safeLocalStorage()) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch(e) {
        console.warn('Storage read failed:', e);
        return null;
      }
    }
    return null;
  }
};
```

**Warning signs:**
- App works in normal mode but breaks in incognito
- Errors like "QuotaExceededError" or "SecurityError"

### Pitfall 4: Too Many Links/CTAs on Landing Page

**What goes wrong:** Landing page includes navigation bar, footer links, multiple CTAs, causing users to leave without selecting a mode

**Why it happens:** Treating landing page like main site instead of conversion-focused entry point

**How to avoid:**
- Remove navigation bar entirely from landing page
- Single clear CTA per mode card
- No footer links on landing page
- Ratio of links:conversion goals should be 1:1

**Warning signs:**
- High bounce rate from landing page
- Users clicking "About" or "Help" instead of mode selection
- Multiple CTAs competing for attention

### Pitfall 5: State Not Restoring on Popstate

**What goes wrong:** Navigating back shows correct URL but wrong content because state object not used

**Why it happens:** Forgetting to pass state object to pushState and check it in popstate handler

**How to avoid:**
```javascript
// Save state when navigating
function selectMode(mode) {
  const state = { mode: mode, timestamp: Date.now() };
  history.pushState(state, '', `/${mode}`);
  loadMode(mode);
}

// Restore state on back/forward
window.addEventListener('popstate', (event) => {
  if (event.state && event.state.mode) {
    loadMode(event.state.mode); // Use saved state
  } else {
    // Fallback: parse from URL
    const mode = window.location.pathname.slice(1);
    loadMode(mode || 'landing');
  }
});
```

**Warning signs:**
- Back button changes URL but shows wrong interface mode
- State feels "stuck" on previous view

### Pitfall 6: Not Handling Initial Page Load Route

**What goes wrong:** Router handles navigation clicks but not initial page load, so direct URLs don't work

**Why it happens:** Only listening to popstate (which doesn't fire on initial load) without handling `DOMContentLoaded`

**How to avoid:**
```javascript
class Router {
  init() {
    // Handle initial page load
    document.addEventListener('DOMContentLoaded', () => {
      this.handleRoute(window.location.pathname);
    });

    // Handle back/forward navigation
    window.addEventListener('popstate', (event) => {
      this.handleRoute(window.location.pathname, event.state);
    });
  }
}
```

**Warning signs:**
- Clicking links works, but pasting `/branding` into browser shows blank page
- Page loads but stays on default view regardless of URL

## Code Examples

Verified patterns from official sources:

### Basic Router Implementation
```javascript
// Source: MDN Web API Documentation + Vanilla JS Router Patterns 2026
class SimpleRouter {
  constructor() {
    this.routes = new Map();
    this.currentPath = window.location.pathname;
    this.init();
  }

  init() {
    // Handle browser back/forward
    window.addEventListener('popstate', (event) => {
      this.route(window.location.pathname, event.state);
    });

    // Handle initial load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.route(this.currentPath);
      });
    } else {
      this.route(this.currentPath);
    }

    // Intercept link clicks
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-route]')) {
        e.preventDefault();
        const path = e.target.getAttribute('data-route');
        this.navigate(path);
      }
    });
  }

  register(path, handler) {
    this.routes.set(path, handler);
    return this;
  }

  navigate(path, state = {}) {
    history.pushState(state, '', path);
    this.route(path, state);
  }

  route(path, state = {}) {
    this.currentPath = path;
    const handler = this.routes.get(path) || this.routes.get('*');
    if (handler) {
      handler(state);
    }
  }
}

// Usage
const router = new SimpleRouter();

router
  .register('/', () => {
    document.body.innerHTML = '<div class="landing">Landing Page</div>';
  })
  .register('/branding', () => {
    document.body.innerHTML = '<div class="app">Branding Mode</div>';
  })
  .register('*', () => {
    router.navigate('/'); // Fallback to landing
  });
```

### Mode Selection Card Pattern
```javascript
// Source: 2026 Card UI Component Best Practices
function setupModeSelection() {
  const cards = document.querySelectorAll('.mode-card');

  cards.forEach(card => {
    const button = card.querySelector('.select-mode');
    const mode = button.getAttribute('data-path');

    // Make entire card clickable
    card.addEventListener('click', (e) => {
      if (e.target !== button) {
        button.click();
      }
    });

    button.addEventListener('click', (e) => {
      e.stopPropagation();

      // Save to localStorage
      ModeState.save(mode.slice(1)); // Remove leading /

      // Navigate
      window.router.navigate(mode, {
        mode: mode.slice(1),
        source: 'landing'
      });
    });
  });
}
```

### Loading Saved Mode on Return
```javascript
// Source: localStorage State Management Best Practices
function handleReturnVisit() {
  const savedMode = ModeState.load();

  if (savedMode && window.location.pathname === '/') {
    // User returned to root but has saved mode preference
    // Option 1: Auto-redirect
    window.router.navigate(`/${savedMode}`, {
      restored: true
    });

    // Option 2: Show "Continue" prompt on landing page
    showContinuePrompt(savedMode);
  }
}

function showContinuePrompt(mode) {
  const banner = document.createElement('div');
  banner.className = 'return-visitor-banner';
  banner.innerHTML = `
    <p>Welcome back! Continue with ${mode}?</p>
    <button onclick="window.router.navigate('/${mode}')">Continue</button>
    <button onclick="this.parentElement.remove()">Start Fresh</button>
  `;
  document.body.prepend(banner);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hash-based routing (#/page) | History API (pushState) | 2015 | Clean URLs, better SEO, professional appearance |
| Framework routers (React Router, Vue Router) | Vanilla JS routers | 2025-2026 | Zero dependencies, longer lifespan, simpler maintenance |
| Feature-focused landing pages | Outcome-driven landing pages | 2026 | Higher conversion, clearer value proposition |
| Navigation bars on landing pages | Single CTA, no navigation | 2024-2026 | 266% improvement in conversion when removing second CTA |
| Manual JSON stringification | JSON.stringify/parse with error handling | Always standard | Browser-native, reliable, handles edge cases |

**Deprecated/outdated:**
- Hash-based routing: Still works but looks unprofessional, use History API instead
- Query parameters for state (?mode=x): Use path-based routing for primary navigation
- Framework dependencies for simple routing: Vanilla JS sufficient for most SPAs in 2026
- Multiple CTAs on landing pages: Single clear action per section is 2026 standard

## Open Questions

Things that couldn't be fully resolved:

1. **Integration with existing progressive reveal system**
   - What we know: Current system uses localStorage for phase state, has mode switching via shapeshifter.js
   - What's unclear: How modes should interact with phases (does each mode have independent phase progression?)
   - Recommendation: Document current behavior, plan migration path from phases to modes

2. **Server configuration for clean URL support**
   - What we know: Express server currently serves from pulsecraft_ui directory
   - What's unclear: Whether server.js needs wildcard route handler or if static file serving handles it
   - Recommendation: Test direct URL access (e.g., localhost:3000/branding) and add wildcard route if needed

3. **Mode descriptions for cards**
   - What we know: Need outcome-driven descriptions, have three modes (Branding, Author, Self-Reflection)
   - What's unclear: Exact wording for each mode's value proposition (not specified in requirements)
   - Recommendation: Draft descriptions during planning, validate with user

## Sources

### Primary (HIGH confidence)
- [MDN History.pushState() Documentation](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState) - Syntax and API reference
- [MDN Window popstate Event](https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event) - Event handling for navigation
- [How to Use HTML5 History API for Single Page Apps](https://blog.pixelfreestudio.com/how-to-use-html5-history-api-for-single-page-apps/) - Implementation patterns

### Secondary (MEDIUM confidence)
- [10 SaaS Landing Page Trends for 2026](https://www.saasframe.io/blog/10-saas-landing-page-trends-for-2026-with-real-examples) - Design standards
- [Best Practices for Persisting State in Frontend Applications](https://blog.pixelfreestudio.com/best-practices-for-persisting-state-in-frontend-applications/) - localStorage patterns
- [DocsAllOver SPA Routing Best Practices](https://docsallover.com/blog/ui-ux/spa-routing-and-navigation-best-practices/) - Common pitfalls
- [Landing Page UX: Top Tips & Mistakes to Avoid](https://www.webstacks.com/blog/landing-page-ux) - Navigation anti-patterns
- [Cards: UI Component Definition](https://www.nngroup.com/articles/cards-component/) - Card design patterns

### Tertiary (LOW confidence)
- [Why Developers Are Ditching Frameworks for Vanilla JavaScript](https://thenewstack.io/why-developers-are-ditching-frameworks-for-vanilla-javascript/) - Trend context only
- Various SaaS landing page galleries - Visual inspiration only, not technical guidance

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Native browser APIs, well-documented, stable since 2015
- Architecture: HIGH - History API patterns verified with MDN official docs, localStorage patterns widely established
- Pitfalls: MEDIUM-HIGH - Sourced from community best practices and official documentation, some based on common developer experience

**Research date:** 2026-01-27
**Valid until:** 2027-01-27 (12 months - stable web standards, slow-changing domain)
