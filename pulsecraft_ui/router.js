// router.js - PulseCraft Client-Side Router
// Provides clean URL routing using the HTML5 History API
// Supports browser back/forward buttons via popstate event handling

class PulseCraftRouter {
    constructor() {
        this.routes = new Map();
        this.currentPath = window.location.pathname;
        this.initialized = false;

        // Bind methods to maintain context
        this.handlePopState = this.handlePopState.bind(this);
        this.handleLinkClick = this.handleLinkClick.bind(this);
    }

    /**
     * Initialize the router with route handlers
     * @param {Object} routeHandlers - Map of path patterns to handler functions
     * @example
     * router.init({
     *   '/': () => showLandingPage(),
     *   '/branding': () => showBrandingMode(),
     *   '/author': () => showAuthorMode(),
     *   '/self-reflection': () => showSelfReflectionMode()
     * });
     */
    init(routeHandlers = {}) {
        if (this.initialized) {
            console.warn('Router already initialized');
            return;
        }

        // Register route handlers
        Object.entries(routeHandlers).forEach(([path, handler]) => {
            this.routes.set(path, handler);
        });

        // Listen for browser back/forward button clicks
        window.addEventListener('popstate', this.handlePopState);

        // Intercept link clicks for client-side navigation
        document.addEventListener('click', this.handleLinkClick);

        this.initialized = true;

        // Handle initial page load
        this.handleRoute(this.currentPath);
    }

    /**
     * Navigate to a new path programmatically
     * @param {string} path - The path to navigate to
     * @param {boolean} replace - If true, replaces current history entry instead of adding new one
     */
    navigateTo(path, replace = false) {
        if (this.currentPath === path) {
            return; // Already on this path
        }

        // Update browser history
        if (replace) {
            window.history.replaceState({ path }, '', path);
        } else {
            window.history.pushState({ path }, '', path);
        }

        // Update current path and handle route
        this.currentPath = path;
        this.handleRoute(path);
    }

    /**
     * Handle route changes and execute appropriate handler
     * @param {string} path - The path to handle
     */
    handleRoute(path) {
        // Normalize path (remove trailing slash except for root)
        const normalizedPath = path === '/' ? path : path.replace(/\/$/, '');

        // Find matching route handler
        const handler = this.routes.get(normalizedPath);

        if (handler && typeof handler === 'function') {
            handler(normalizedPath);
        } else {
            // Fallback: Check if it's a root route
            if (normalizedPath === '/' || normalizedPath === '') {
                const rootHandler = this.routes.get('/');
                if (rootHandler) {
                    rootHandler('/');
                }
            } else {
                console.warn(`No handler found for path: ${normalizedPath}`);
                // Optionally show 404 or redirect to home
                this.navigateTo('/', true);
            }
        }
    }

    /**
     * Handle browser back/forward button events
     * @param {PopStateEvent} event - The popstate event
     */
    handlePopState(event) {
        const path = event.state?.path || window.location.pathname;
        this.currentPath = path;
        this.handleRoute(path);
    }

    /**
     * Intercept link clicks for client-side navigation
     * @param {MouseEvent} event - The click event
     */
    handleLinkClick(event) {
        // Check if clicked element or parent is a link with data-path attribute
        const link = event.target.closest('[data-path]');

        if (link) {
            event.preventDefault();
            const path = link.getAttribute('data-path');
            this.navigateTo(path);
        }
    }

    /**
     * Get the current path
     * @returns {string} The current path
     */
    getCurrentPath() {
        return this.currentPath;
    }

    /**
     * Check if a specific route is currently active
     * @param {string} path - The path to check
     * @returns {boolean} True if the path is active
     */
    isActive(path) {
        return this.currentPath === path;
    }

    /**
     * Destroy the router and clean up event listeners
     */
    destroy() {
        window.removeEventListener('popstate', this.handlePopState);
        document.removeEventListener('click', this.handleLinkClick);
        this.routes.clear();
        this.initialized = false;
    }
}

// ===================================
// VIEW TOGGLE FUNCTIONS
// ===================================

function showLanding() {
    const landingPage = document.getElementById('landingPage');
    const appContainer = document.getElementById('appContainer');
    const modeSwitcher = document.getElementById('modeSwitcher');

    if (landingPage) {
        landingPage.classList.remove('hidden');
        landingPage.style.display = 'flex';
    }
    if (appContainer) {
        appContainer.classList.add('hidden');
        appContainer.style.display = 'none';
    }

    // CRITICAL FIX: Hide mode switcher on landing page
    if (modeSwitcher) {
        modeSwitcher.classList.add('hidden');
        modeSwitcher.style.display = 'none';
    }

    // Update page title
    document.title = 'PulseCraft: The Consciousness Interface';
}

function showApp() {
    const landingPage = document.getElementById('landingPage');
    const appContainer = document.getElementById('appContainer');
    const modeSwitcher = document.getElementById('modeSwitcher');

    if (landingPage) {
        landingPage.classList.add('hidden');
        landingPage.style.display = 'none';
    }
    if (appContainer) {
        appContainer.classList.remove('hidden');
        appContainer.style.display = 'block';
    }

    // CRITICAL FIX: Show mode switcher when in app mode
    if (modeSwitcher) {
        modeSwitcher.classList.remove('hidden');
        modeSwitcher.style.display = 'block';
    }
}

function loadMode(mode) {
    console.log('router.js: loadMode called with mode:', mode);

    // CRITICAL FIX: Show app view first
    showApp();

    // CRITICAL FIX: Set mode in shapeshifter after view is visible
    if (window.pulsecraftShapeshifter) {
        console.log('router.js: Setting shapeshifter mode to:', mode);
        window.pulsecraftShapeshifter.setMode(mode);
    } else {
        console.warn('router.js: shapeshifter not found, mode styling may not apply');
    }

    // Save to localStorage for return visits
    localStorage.setItem('pulsecraft_last_mode', mode);

    // Update page title
    const titles = {
        'branding': 'PulseCraft: Brand Voice Studio',
        'author': 'PulseCraft: Writing Voice Lab',
        'self-reflection': 'PulseCraft: Voice Mirror'
    };
    document.title = titles[mode] || 'PulseCraft';

    console.log('router.js: loadMode complete');
}

// ===================================
// RETURN VISIT HANDLING
// ===================================

/**
 * Handles return visitors who have a saved mode preference.
 * Shows a "Continue" prompt on the landing page if user previously used a mode.
 * Pattern from RESEARCH.md lines 527-552.
 */
function handleReturnVisit() {
    const savedMode = localStorage.getItem('pulsecraft_last_mode');

    // Only show prompt if:
    // 1. User has a saved mode preference
    // 2. User is on the landing page (root path)
    if (!savedMode || window.location.pathname !== '/') {
        return;
    }

    // Validate saved mode is one of the allowed modes
    const allowedModes = ['branding', 'author', 'self-reflection'];
    if (!allowedModes.includes(savedMode)) {
        // Clear invalid saved mode
        localStorage.removeItem('pulsecraft_last_mode');
        return;
    }

    // Create and show the return visitor banner
    showContinuePrompt(savedMode);
}

/**
 * Shows a banner prompting the user to continue with their previous mode.
 * @param {string} mode - The previously saved mode
 */
function showContinuePrompt(mode) {
    // Don't show if banner already exists
    if (document.querySelector('.return-visitor-banner')) {
        return;
    }

    // Map mode to display name
    const modeNames = {
        'branding': 'Branding',
        'author': 'Author',
        'self-reflection': 'Self-Reflection'
    };
    const displayName = modeNames[mode] || mode;

    const banner = document.createElement('div');
    banner.className = 'return-visitor-banner';
    banner.innerHTML = `
        <p>Welcome back! Continue with <strong>${displayName}</strong>?</p>
        <div class="return-visitor-actions">
            <button class="continue-btn" data-mode="${mode}">Continue</button>
            <button class="start-fresh-btn">Start Fresh</button>
        </div>
    `;

    // Insert at top of landing view
    const landingView = document.getElementById('landingPage');
    if (landingView) {
        landingView.insertBefore(banner, landingView.firstChild);
    }

    // Wire up button handlers
    const continueBtn = banner.querySelector('.continue-btn');
    const startFreshBtn = banner.querySelector('.start-fresh-btn');

    continueBtn.addEventListener('click', () => {
        const targetMode = continueBtn.getAttribute('data-mode');
        const path = targetMode === 'self-reflection' ? '/self-reflection' : `/${targetMode}`;
        if (window.pulsecraftRouter) {
            window.pulsecraftRouter.navigateTo(path);
        }
        banner.remove();
    });

    startFreshBtn.addEventListener('click', () => {
        // Clear saved mode preference
        localStorage.removeItem('pulsecraft_last_mode');
        banner.remove();
    });
}

// ===================================
// ROUTER INITIALIZATION
// ===================================

/**
 * Initialize router when DOM is ready
 */
function initRouter() {
    console.log('router.js: Initializing router');

    const router = window.pulsecraftRouter || new PulseCraftRouter();

    // CRITICAL FIX: Check for legacy query params and redirect to clean URLs BEFORE router init
    const urlParams = new URLSearchParams(window.location.search);
    const modeParam = urlParams.get('mode');
    if (modeParam) {
        console.log('router.js: Found legacy query param, redirecting to clean URL');
        // Redirect to clean URL
        const cleanPath = modeParam === 'therapy' ? '/self-reflection' : `/${modeParam}`;
        // Use replaceState to update URL without triggering router twice
        window.history.replaceState({ path: cleanPath }, '', cleanPath);
        // Update router's current path
        router.currentPath = cleanPath;
    }

    router.init({
        '/': () => {
            console.log('router.js: Route handler for / (landing)');
            showLanding();
            // Check for return visit after showing landing
            handleReturnVisit();
        },
        '/branding': () => {
            console.log('router.js: Route handler for /branding');
            loadMode('branding');
        },
        '/author': () => {
            console.log('router.js: Route handler for /author');
            loadMode('author');
        },
        '/self-reflection': () => {
            console.log('router.js: Route handler for /self-reflection');
            loadMode('self-reflection');
        },
        '*': () => {
            console.log('router.js: Fallback route handler, redirecting to landing');
            // Fallback: redirect to landing
            window.pulsecraftRouter.navigateTo('/');
        }
    });

    window.pulsecraftRouter = router;
    console.log('router.js: Router initialized and exposed globally');

    // Set up card button click handlers
    setupCardNavigation();
}

function setupCardNavigation() {
    // Make entire card clickable
    const cards = document.querySelectorAll('.mode-card');
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const path = card.getAttribute('data-path');
            if (path && window.pulsecraftRouter) {
                window.pulsecraftRouter.navigateTo(path);
            }
        });

        // Add pointer cursor
        card.style.cursor = 'pointer';
    });
}

// Initialize when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRouter);
} else {
    initRouter();
}

// ===================================
// GLOBAL EXPORTS
// ===================================

// Expose functions globally for integration
window.showLanding = showLanding;
window.showApp = showApp;
window.loadMode = loadMode;
window.handleReturnVisit = handleReturnVisit;
window.showContinuePrompt = showContinuePrompt;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PulseCraftRouter };
}
