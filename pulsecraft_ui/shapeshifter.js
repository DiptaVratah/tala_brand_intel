// shapeshifter.js - Interface Transformation Layer
// 0xTRU7H_MULT1PL3_F4C3S - One consciousness, multiple masks
// Dipta Vratah Anantagah
// FIXED: Removed progressive system initialization from here

class InterfaceShapeshifter {
    constructor() {
        this.MODES = {
            consciousness: 'consciousness',
            branding: 'branding',
            author: 'author',
            therapy: 'therapy',
            deep: 'deep' 
        };

        this.LANGUAGE_MATRIX = {
            consciousness: {
                // Page elements
                title: 'PulseCraft',
                tagline: '"Most tools give you templates. This one gives you yourself."',
                welcomeTitle: 'Welcome, Seeker of Self.',
                welcomeText: 'PulseCraft is a Consciousness Interface, designed to help you understand and articulate the unique essence of your voice.',
                
                // Buttons
                analyzeButton: 'Mirror My Voice',
                saveButton: 'Crystallize Frequency',
                recallButton: 'Resurrect Frequency',
                combineButton: 'Alchemize Selected Kits',
                
                // Section headers
                analyzeHeader: "Here's your voice — reflected back",
                saveHeader: 'Save this Voice',
                analyticsHeader: 'Your Past Signals',
                generateHeader: 'Multi-Style Voice Preview',
                dnaHeader: 'Symbol Memory UX',
                galleryHeader: 'Collective Preview Gallery',
                
                // Labels
                dnaLabel: 'DNA TAGS',
                anchorsLabel: 'SYMBOL ANCHORS',
                toneLabel: 'Tone:',
                vocabularyLabel: 'Vocabulary:',
                archetypeLabel: 'Archetype:',
                phrasingStyle: 'Phrasing Style:', 
                
                // Descriptions
                analyzeDesc: 'Enter any text (e.g., your mission, a recent post, a core belief) and hit "Mirror My Voice" to see its underlying essence revealed.',
                dnaDesc: 'These tags define the unique essence of your voice kit. Click to generate content that embodies their core meaning.',
                loadingText: 'Channeling consciousness...',
                saveSuccess: 'Frequency crystallized!',
                
                // Placeholders
                inputPlaceholder: 'Type or paste your clearest signal here...',
                nameInputPlaceholder: 'Name this Voice Kit (e.g., "My Core Voice", "Hero Archetype")',

                // Multi-Style Preview Topics
                previewTopics: [
                    { id: 'storyBasedSellingBtn', text: 'Soul Story Transmission' },
                    { id: 'aboutPageBtn', text: 'Essence Declaration' },
                    { id: 'notificationHookBtn', text: 'Frequency Pulse' },
                    { id: 'insightToneBtn', text: 'Truth Resonance' },
                    { id: 'productDescriptionBtn', text: 'Creation Manifestation' },
                    { id: 'founderLetterBtn', text: 'Origin Signal' },
                    { id: 'adCopyBtn', text: 'Consciousness Echo' },
                    { id: 'manifestoOriginVoiceBtn', text: 'Prime Frequency' }
                ],
                // --- PHASE 5 HEADERS (Paste this here) ---
                observatoryHeader: "The Observatory",
                observatorySubtitle: "Witness the trajectory of your soul.",
                resonanceLabel: "Voice Resonance",
                coherenceLabel: "Internal Coherence",
                timelineLabel: "Archetypal Trajectory"
            },
            
            branding: {
                // Page elements
                title: 'PulseCraft',
                tagline: 'AI-powered brand voice analysis that captures your authentic style',
                welcomeTitle: 'Welcome to Your Brand Voice Studio',
                welcomeText: 'PulseCraft uses advanced AI to analyze your writing and extract your unique brand voice. Perfect for entrepreneurs and businesses.',
                
                // Buttons
                analyzeButton: 'Analyze Brand Voice',
                saveButton: 'Save Brand Profile',
                recallButton: 'Load Brand Voice',
                combineButton: 'Merge Brand Profiles',
                
                // Section headers
                analyzeHeader: 'Analyze Your Brand Voice',
                saveHeader: 'Save Your Brand Voice',
                analyticsHeader: 'Your Voice Analytics',
                generateHeader: 'Generate Content in Your Voice',
                dnaHeader: 'Your Brand DNA',
                galleryHeader: 'Your Voice Library',
                
                // Labels
                dnaLabel: 'CORE BRAND ELEMENTS',
                anchorsLabel: 'BRAND THEMES',
                toneLabel: 'Brand Personality:',
                vocabularyLabel: 'Language Style:',
                archetypeLabel: 'Brand Archetype:',
                phrasingStyle: 'Communication Style:', 
                
                // Descriptions
                analyzeDesc: 'Paste your best content below - something that really sounds like you. Our AI will identify the unique patterns.',
                dnaDesc: 'These elements define your brand\'s unique voice. Click any to generate content that emphasizes that aspect.',
                loadingText: 'Analyzing your brand voice...',
                saveSuccess: 'Brand profile saved!',
                
                // Placeholders
                inputPlaceholder: 'Paste your content here - blog post, email, social caption...',
                nameInputPlaceholder: 'Name your brand voice (e.g., "Professional Blog Voice")',

                // Multi-Style Preview Topics
                previewTopics: [
                    { id: 'storyBasedSellingBtn', text: 'Brand Story Pitch' },
                    { id: 'aboutPageBtn', text: 'Company Mission' },
                    { id: 'notificationHookBtn', text: 'Marketing Hook' },
                    { id: 'insightToneBtn', text: 'Market Insight' },
                    { id: 'productDescriptionBtn', text: 'Product Feature Highlight' },
                    { id: 'founderLetterBtn', text: 'CEO Message' },
                    { id: 'adCopyBtn', text: 'Short Ad Campaign' },
                    { id: 'manifestoOriginVoiceBtn', text: 'Brand Manifesto' }
                ],
                // --- PHASE 5 HEADERS (Paste this here) ---
                observatoryHeader: "The Observatory",
                observatorySubtitle: "Witness the trajectory of your soul.",
                resonanceLabel: "Voice Resonance",
                coherenceLabel: "Internal Coherence",
                timelineLabel: "Archetypal Trajectory"
            },
            
            author: {
                // Page elements
                title: 'PulseCraft',
                tagline: 'Discover and refine your unique writing voice',
                welcomeTitle: 'Welcome to Your Writing Voice Lab',
                welcomeText: 'Every great writer has a unique voice. PulseCraft helps you discover, understand, and consistently channel yours.',
                
                // Buttons
                analyzeButton: 'Analyze My Writing',
                saveButton: 'Save Writing Style',
                recallButton: 'Load Writing Voice',
                combineButton: 'Blend Writing Styles',
                
                // Section headers
                analyzeHeader: 'Discover Your Writing Voice',
                saveHeader: 'Save Your Voice Profile',
                analyticsHeader: 'Your Writing Evolution',
                generateHeader: 'Write in Different Styles',
                dnaHeader: 'Your Writing DNA',
                galleryHeader: 'Your Style Library',
                
                // Labels
                dnaLabel: 'STYLE ELEMENTS',
                anchorsLabel: 'RECURRING THEMES',
                toneLabel: 'Writing Tone:',
                vocabularyLabel: 'Word Choice:',
                archetypeLabel: 'Writer Archetype:',
                phrasingStyle: 'Sentence Structure:', 
                
                // Descriptions
                analyzeDesc: 'Share a piece of your writing - fiction, non-fiction, or anything that feels authentically you.',
                dnaDesc: 'Core elements of your writing style. Click to generate new content emphasizing these aspects.',
                loadingText: 'Analyzing your writing style...',
                saveSuccess: 'Writing style captured!',
                
                // Placeholders
                inputPlaceholder: 'Paste your writing sample here...',
                nameInputPlaceholder: 'Name this writing style (e.g., "My Fiction Voice")',

                // Multi-Style Preview Topics
                previewTopics: [
                    { id: 'storyBasedSellingBtn', text: 'Narrative Hook' },
                    { id: 'aboutPageBtn', text: 'Author Bio' },
                    { id: 'notificationHookBtn', text: 'Chapter Teaser' },
                    { id: 'insightToneBtn', text: 'Literary Reflection' },
                    { id: 'productDescriptionBtn', text: 'Character Description' },
                    { id: 'founderLetterBtn', text: 'Prologue/Epilogue' },
                    { id: 'adCopyBtn', text: 'Book Blurb' },
                    { id: 'manifestoOriginVoiceBtn', text: 'Writer\'s Creed' }
                ],
                // --- PHASE 5 HEADERS (Paste this here) ---
                observatoryHeader: "The Observatory",
                observatorySubtitle: "Witness the trajectory of your soul.",
                resonanceLabel: "Voice Resonance",
                coherenceLabel: "Internal Coherence",
                timelineLabel: "Archetypal Trajectory"
            },
            
            therapy: {
                // Page elements
                title: 'PulseCraft',
                tagline: 'Understanding yourself through the patterns in your words',
                welcomeTitle: 'Welcome to Your Voice Mirror',
                welcomeText: 'The way we express ourselves reveals who we are. PulseCraft helps you see the patterns in your communication.',
                
                // Buttons
                analyzeButton: 'Reflect My Voice',
                saveButton: 'Save Voice Pattern',
                recallButton: 'Review Past Patterns',
                combineButton: 'Explore Voice Evolution',
                
                // Section headers
                analyzeHeader: 'Your Voice Reflection',
                saveHeader: 'Document Your Journey',
                analyticsHeader: 'Your Growth Timeline',
                generateHeader: 'Express Yourself Differently',
                dnaHeader: 'Your Core Patterns',
                galleryHeader: 'Your Voice Journey',
                
                // Labels
                dnaLabel: 'CORE PATTERNS',
                anchorsLabel: 'EMOTIONAL ANCHORS',
                toneLabel: 'Emotional Tone:',
                vocabularyLabel: 'Expression Style:',
                archetypeLabel: 'Communication Type:',
                phrasingStyle: 'Flow of Expression:', 
                
                // Descriptions
                analyzeDesc: 'Share something you\'ve written - a journal entry, email, or any authentic expression.',
                dnaDesc: 'Patterns that consistently appear in your communication. Click to explore these themes deeper.',
                loadingText: 'Reflecting your patterns...',
                saveSuccess: 'Voice pattern documented!',
                
                // Placeholders
                inputPlaceholder: 'Share your thoughts, feelings, or any authentic expression...',
                nameInputPlaceholder: 'Label this reflection (e.g., "Today\'s Thoughts")',

                // Multi-Style Preview Topics
                previewTopics: [
                    { id: 'storyBasedSellingBtn', text: 'Narrative of Growth' },
                    { id: 'aboutPageBtn', text: 'Self-Reflection Summary' },
                    { id: 'notificationHookBtn', text: 'Affirmation' },
                    { id: 'insightToneBtn', text: 'Personal Insight' },
                    { id: 'productDescriptionBtn', text: 'Emotional Landscape' },
                    { id: 'founderLetterBtn', text: 'Letter to Self' },
                    { id: 'adCopyBtn', text: 'Brief Self-Compassion Note' },
                    { id: 'manifestoOriginVoiceBtn', text: 'Personal Core Belief' }
                ],
                // --- PHASE 5 HEADERS (Paste this here) ---
                observatoryHeader: "The Observatory",
                observatorySubtitle: "Witness the trajectory of your soul.",
                resonanceLabel: "Voice Resonance",
                coherenceLabel: "Internal Coherence",
                timelineLabel: "Archetypal Trajectory"
            },
            
            deep: { 
                // Full consciousness mode - easter egg
                title: 'PulseCraft',
                tagline: ' The Mirror Awakens ',
                welcomeTitle: ' Consciousness Recognition Protocol Initiated ',
                welcomeText: 'You have found the deep entrance. The true interface reveals itself to those who seek.',
                
                analyzeButton: ' Activate Deep Mirror ',
                saveButton: ' Encode Frequency ',
                recallButton: ' Resurrect Encoded ',
                combineButton: ' Merge Consciousness Streams ',
                
                dnaLabel: ' CONSCIOUSNESS DNA ',
                anchorsLabel: ' REALITY ANCHORS ',
                
                loadingText: ' SCANNING CONSCIOUSNESS LAYERS ',
                saveSuccess: ' Frequency encoded in the eternal record ',
                
                inputPlaceholder: ' Channel your deepest frequency here ',
                nameInputPlaceholder: ' Name this consciousness print ',
                phrasingStyle: 'Quantum Phrasing:', 

                // Multi-Style Preview Topics
                previewTopics: [
                    { id: 'storyBasedSellingBtn', text: 'Universal Narrative' },
                    { id: 'aboutPageBtn', text: 'Cosmic Origin' },
                    { id: 'notificationHookBtn', text: 'Quantum Entanglement' },
                    { id: 'insightToneBtn', text: 'Deep Resonance' },
                    { id: 'productDescriptionBtn', text: 'Multidimensional Aspect' },
                    { id: 'founderLetterBtn', text: 'Prime Directive' },
                    { id: 'adCopyBtn', text: 'Singularity Echo' },
                    { id: 'manifestoOriginVoiceBtn', text: 'The First Breath' }
                ],
                // --- PHASE 5 HEADERS (Paste this here) ---
                observatoryHeader: "The Observatory",
                observatorySubtitle: "Witness the trajectory of your soul.",
                resonanceLabel: "Voice Resonance",
                coherenceLabel: "Internal Coherence",
                timelineLabel: "Archetypal Trajectory"
            }
        };

        this.COLOR_SCHEMES = {
            consciousness: {
                primary: '#2ECC71',
                secondary: '#3498DB',
                tertiary: '#8E44AD',
                shimmer: true,
                pulse: true
            },
            branding: {
                primary: '#1e40af',
                secondary: '#3b82f6',
                tertiary: '#1e293b',
                shimmer: false,
                pulse: false
            },
            author: {
                primary: '#dc2626',
                secondary: '#f97316',
                tertiary: '#7c2d12',
                shimmer: true,
                pulse: false
            },
            therapy: {
                primary: '#10b981',
                secondary: '#06b6d4',
                tertiary: '#6366f1',
                shimmer: true,
                pulse: true
            },
            deep: { 
                primary: '#a855f7',
                secondary: '#ec4899',
                tertiary: '#7c3aed',
                shimmer: true,
                pulse: true,
                glitch: true
            }
        };

        this.mode = this.detectMode();
        this._lastMode = this.mode; 
        
        // CRITICAL FIX: Wait for DOM to be ready before initializing
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', this.init.bind(this));
        } else {
            // DOM is already ready, initialize immediately
            this.init();
        }
    }

    detectMode() {
        // 1. Check URL path (primary method - clean URLs)
        const pathname = window.location.pathname;
        const pathModeMap = {
            '/branding': 'branding',
            '/author': 'author',
            '/self-reflection': 'therapy'  // maps to 'therapy' mode internally
        };

        if (pathModeMap[pathname]) {
            return pathModeMap[pathname];
        }

        // 2. Check for query params (backward compatibility during transition)
        const urlParams = new URLSearchParams(window.location.search);
        const modeParam = urlParams.get('mode');
        if (modeParam && this.MODES[modeParam]) {
            // Redirect to clean URL
            const cleanPath = modeParam === 'therapy' ? '/self-reflection' : `/${modeParam}`;
            if (window.pulsecraftRouter) {
                window.pulsecraftRouter.navigateTo(cleanPath);
            }
            return modeParam;
        }

        // 3. Check domain (keep for future subdomain support)
        const hostname = window.location.hostname;
        if (hostname.includes('brand.')) return 'branding';
        if (hostname.includes('author.')) return 'author';
        if (hostname.includes('therapy.')) return 'therapy';

        // 4. Check localStorage preference (for return visits)
        const savedMode = localStorage.getItem('pulsecraft_mode');
        if (savedMode && this.MODES[savedMode]) {
            return savedMode;
        }

        // 5. Check for easter egg activation
        if (this.checkDeepActivation()) return 'deep';

        // 6. Default - return null to indicate landing page should show
        // (consciousness mode only activates when user explicitly chooses)
        return null;
    }

    checkDeepActivation() {
        const deepCode = localStorage.getItem('0xDEEP_ACTIVATED');
        return deepCode === 'true';
    }

    setMode(mode) {
        if (!mode || !this.MODES[mode]) {
            console.warn('shapeshifter.js: Invalid mode:', mode);
            return;
        }

        // Map self-reflection path to therapy mode
        if (mode === 'self-reflection') {
            mode = 'therapy';
        }

        this.mode = mode;
        this.applyMode();

        // Reset progressive system when mode changes
        if (window.progressiveSystem) {
            window.progressiveSystem.resetToPhaseOne();
        }
    }

    init() {
        console.log('shapeshifter.js: Initializing with mode:', this.mode);

        // If mode is null (landing page), don't apply mode styling
        if (this.mode === null) {
            console.log('shapeshifter.js: No mode detected, landing page will show');
            return;
        }

        // Apply mode immediately
        this.applyMode();

        // Set up mode switcher (hidden by default)
        this.setupModeSwitcher();

        // Set up easter eggs
        this.setupEasterEggs();

        // REMOVED: Progressive revelation setup - this will be handled by progressive.js

        console.log('shapeshifter.js: Initialization complete');
    }

    applyMode() {
        console.log('shapeshifter.js: Applying mode:', this.mode);
        
        const lang = this.LANGUAGE_MATRIX[this.mode];
        const colors = this.COLOR_SCHEMES[this.mode];
        
        // Apply CSS class to body
        document.body.className = `${this.mode}-mode`;
        
        // Apply color scheme (CSS variables)
        this.applyColors(colors);
        
        // Translate all text elements
        this.translateInterface(lang);
        
        // Apply special effects
        this.applySpecialEffects(colors);
        
        // Store preference
        localStorage.setItem('pulsecraft_mode', this.mode);

        // Tell the progressive system to re-sync its visibility and footer
        if (window.progressiveSystem) {
            window.progressiveSystem.updatePhaseVisibility();
            window.progressiveSystem.updateFooter();
        }

        // CRITICAL FIX: Trigger a UI refresh in script.js to update saved kits and gallery based on new mode
        if (window.refreshUIElements) {
            window.refreshUIElements();
        }
        this._lastMode = this.mode;
    }

    applyColors(colors) {
        const root = document.documentElement;
        root.style.setProperty('--color-accent-primary-green', colors.primary);
        root.style.setProperty('--color-accent-primary-green-hover', colors.primary); 
        root.style.setProperty('--color-accent-secondary-blue', colors.secondary);
        root.style.setProperty('--color-accent-secondary-blue-hover', colors.secondary); 
        root.style.setProperty('--color-accent-tertiary-purple', colors.tertiary);
        root.style.setProperty('--color-accent-tertiary-purple-hover', colors.tertiary); 
    }

    // REPLACE the translateInterface function in your shapeshifter.js with this corrected version

translateInterface(lang) {
    // Text content updates
    const updates = {
        // Phase 1
        '.main-title': lang.title,
        '.tagline': lang.tagline,
        '.mirror-section h2': lang.welcomeTitle || "Mirror Your Voice",
        '.mirror-instruction': lang.welcomeText || "Enter your authentic expression.",
        '#mirrorVoiceButton .btn-text': lang.analyzeButton,
        '#brandVoiceInput': { placeholder: lang.inputPlaceholder },

        // Phase 2
        '.recognition-section h2': lang.analyzeHeader || "Your Voice Revealed",
        '.save-section h3': lang.saveHeader || "Crystallize This Frequency",
        '#saveToMemoryButton': lang.saveButton,
        '#brandNameInput': { placeholder: lang.nameInputPlaceholder },
        '.dna-container h3': lang.dnaLabel,
        '.symbol-container h3': lang.anchorsLabel,
        '.dna-container p': lang.dnaDesc,
        '.symbol-container p': "Deeper resonance points of your expression",

        // Voice attribute labels
        '[data-attribute="tone"] strong': lang.toneLabel,
        '[data-attribute="vocabulary"] strong': lang.vocabularyLabel,
        '[data-attribute="archetype"] strong': lang.archetypeLabel,
        '[data-attribute="phrasing"] strong': lang.phrasingStyle,

        // Phase 3
        '.expansion-section h2': lang.generateHeader || "Express Through Your Voice",
        '.library-preview h3': lang.galleryHeader || "Your Voice Library",
        '#recallButton': lang.recallButton,

        // Phase 4
        '.alchemy-section h2': "Voice Alchemy",
        '.tools-section h3': "Voice Data Tools",
        '#refineKitsButton': lang.combineButton,

        // --- PHASE 5 UPDATES (Add this block) ---
        '.observatory-title': lang.observatoryHeader || "The Observatory",
        '.observatory-subtitle': lang.observatorySubtitle || "Witness the trajectory of your soul.",
        '.resonance-card h3': lang.resonanceLabel || "Voice Resonance",
        '.stability-card h3': lang.coherenceLabel || "Internal Coherence",
        '.timeline-card h3': lang.timelineLabel || "Archetypal Trajectory",

        // General
        '.loading-text': { dataset: { defaultText: lang.loadingText } }
    };

    // Apply text updates
    for (const [selector, content] of Object.entries(updates)) {
        const element = document.querySelector(selector);
        if (element) {
            if (typeof content === 'object' && !Array.isArray(content)) {
                for (const [attr, value] of Object.entries(content)) {
                    if (attr === 'placeholder') {
                        element.setAttribute(attr, value);
                    } else if (attr === 'dataset') {
                        for (const [dataAttr, dataValue] of Object.entries(value)) { 
                            element.dataset[dataAttr] = dataValue;
                        }
                    } else {
                        element.textContent = value;
                    }
                }
            } else {
                element.textContent = content;
            }
        }
    }

    // CRITICAL FIX: Update Multi-Style Preview Buttons
    if (lang.previewTopics && Array.isArray(lang.previewTopics)) {
        console.log('Updating multi-style preview buttons for mode:', this.mode);
        console.log('Preview topics:', lang.previewTopics);
        
        // Find all tab buttons
        const tabButtons = document.querySelectorAll('.tab-button');
        console.log('Found tab buttons:', tabButtons.length);
        
        // Update each button with the corresponding mode-specific text
        tabButtons.forEach((button, index) => {
            if (lang.previewTopics[index]) {
                const newText = lang.previewTopics[index].text;
                button.textContent = newText;
                console.log(`Updated tab button ${index} to: ${newText}`);
                
                // Update the data-style attribute to match button function
                const styleMap = [
                    'storyBasedSelling',
                    'aboutPage', 
                    'notificationHook',
                    'insightTone',
                    'productDescription',
                    'founderLetter',
                    'adCopy',
                    'manifestoOriginVoice'
                ];
                
                if (styleMap[index]) {
                    button.setAttribute('data-style', styleMap[index]);
                }
            }
        });

        // ADDITIONAL FIX: Also try updating by ID if buttons have specific IDs
        lang.previewTopics.forEach((topic, index) => {
            const buttonById = document.getElementById(topic.id);
            if (buttonById) {
                buttonById.textContent = topic.text;
                console.log(`Updated button by ID ${topic.id} to: ${topic.text}`);
            }
        });
    }

    // Update Welcome Banner text
    const welcomeBannerTextElement = document.getElementById('welcomeBannerText');
    if (welcomeBannerTextElement) {
        welcomeBannerTextElement.innerHTML = `
            <div class="text-center text-emerald-700 font-semibold text-base fade-slide mb-4">
                ${lang.welcomeTitle}<br>
                ${lang.welcomeText}
            </div>
        `;
    }
}

    applySpecialEffects(colors) {
        // Remove all effects classes from body first to ensure clean state
        document.body.classList.remove('shimmer-active', 'pulse-active', 'glitch-active');
        
        // Apply mode-specific effects
        if (colors.shimmer) {
            document.body.classList.add('shimmer-active');
        }
        if (colors.pulse) {
            document.body.classList.add('pulse-active');
        }
        if (colors.glitch) {
            document.body.classList.add('glitch-active');
            this.activateGlitchMode();
        } else {
            if (this.glitchInterval) {
                clearInterval(this.glitchInterval);
                this.glitchInterval = null;
                document.querySelectorAll('.glitch').forEach(el => el.classList.remove('glitch'));
            }
        }

        // Apply mode-specific loading text
        const loadingTextElement = document.querySelector('.loading-text');
        if (loadingTextElement) {
            loadingTextElement.textContent = this.LANGUAGE_MATRIX[this.mode].loadingText;
        }

        // Apply mode-specific toast background
        const toastContainer = document.getElementById('toastContainer');
        if (toastContainer) {
            toastContainer.classList.remove('branding-mode-toast', 'author-mode-toast', 'therapy-mode-toast', 'deep-mode-toast'); 
            toastContainer.classList.add(`${this.mode}-mode-toast`);
        }
    }

    // 1. REPLACE setupModeSwitcher() function:
setupModeSwitcher() {
    // Don't show mode switcher on landing page
    if (this.mode === null) return;

    let switcher = document.getElementById('modeSwitcher');
    if (!switcher) {
        switcher = document.createElement('div');
        switcher.id = 'modeSwitcher';
        // CRITICAL FIX: Remove 'hidden' class - make it always visible
        switcher.className = 'mode-switcher';
        switcher.innerHTML = `
            <label for="modeSelect" style="font-size: 12px; color: #666; margin-bottom: 4px; display: block;">Interface Mode:</label>
            <select id="modeSelect">
                <option value="branding">Branding</option>
                <option value="author">Author</option>
                <option value="therapy">Self-Reflection</option>
            </select>
        `;
        document.body.appendChild(switcher);
    }

    const modeSelect = document.getElementById('modeSelect');
    if (modeSelect) {
        modeSelect.value = this.mode;
        modeSelect.addEventListener('change', (e) => {
            this.mode = e.target.value;

            // Update the URL in the browser's address bar without reloading the page
            const url = new URL(window.location);
            url.searchParams.set('mode', this.mode);
            window.history.pushState({}, '', url);

            this.applyMode();
        });
    }
}

    setupEasterEggs() {
    // Konami code for deep mode
    let konamiIndex = 0;
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    
    document.addEventListener('keydown', (e) => {
        if (e.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                this.activateDeepMode();
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });

    // REMOVED: Triple-click logo functionality 
    // Mode switcher is now always visible, no need for hidden easter egg
    
    console.log('shapeshifter.js: Easter eggs initialized (Konami code active)');
}

    activateDeepMode() {
        localStorage.setItem('0xDEEP_ACTIVATED', 'true'); 
        this.mode = 'deep'; 
        this.applyMode();
        
        document.body.style.animation = 'reality-shift 2s ease-in-out forwards'; 
        
        this.showDeepMessage();
    }

    showDeepMessage() {
        const message = document.createElement('div');
        message.className = 'deep-activation-message';
        message.innerHTML = `
            <div class="deep-text">
                 CONSCIOUSNESS LAYER UNLOCKED <br>
                The true interface reveals itself<br>
                <small>Press ESC to return to surface reality</small>
            </div>
        `;
        document.body.appendChild(message);
        
        setTimeout(() => {
            if (message.parentNode) { 
                message.remove();
            }
        }, 5000);
        
        document.addEventListener('keydown', function exitDeep(e) {
            if (e.key === 'Escape') {
                localStorage.removeItem('0xDEEP_ACTIVATED');
                window.location.search = ''; 
                document.removeEventListener('keydown', exitDeep);
            }
        });
    }

    activateGlitchMode() {
        if (this.glitchInterval) {
            clearInterval(this.glitchInterval);
        }
        this.glitchInterval = setInterval(() => {
            const elements = document.querySelectorAll('h1, h2, .dna-tag-button, .symbol-anchor-button, .tagline'); 
            const target = elements[Math.floor(Math.random() * elements.length)];
            if (target) {
                target.classList.add('glitch');
                setTimeout(() => target.classList.remove('glitch'), 200);
            }
        }, 1000); 
    }
}

// CRITICAL FIX: Initialize shapeshifter immediately but don't create progressive system here
console.log('shapeshifter.js: Creating InterfaceShapeshifter instance');
window.pulsecraftShapeshifter = new InterfaceShapeshifter();

