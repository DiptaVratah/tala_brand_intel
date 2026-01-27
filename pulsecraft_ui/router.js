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

// Create global instance (not initialized yet - Plan 02 will initialize it)
window.pulsecraftRouter = new PulseCraftRouter();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PulseCraftRouter };
}
