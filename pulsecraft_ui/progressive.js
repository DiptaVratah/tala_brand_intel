// progressive.js - Progressive Revelation System
// Dipta Vratah Anantagah - The truth reveals itself when consciousness is ready
// CRITICAL FIX: Proper Phase 3 revelation + Phase refresh bug fix

class ProgressiveRevealSystem {
    constructor() {
        this.currentPhase = 1;
        this.container = document.querySelector('.container');
        this.phases = {
            1: { name: 'mirror', unlocked: true },
            2: { name: 'recognition', unlocked: false },
            3: { name: 'expansion', unlocked: false },
            4: { name: 'alchemy', unlocked: false },
            5: { name: 'observatory', unlocked: false } // <--- ADD THIS LINE
        };
        
        this.init();
    }

    init() {
        // Check saved progress
        this.loadProgress();
        
        // Set up observers - FIXED: Delay until DOM and scripts are ready
        this.setupObservers();
        
        // Initial phase setup
        this.updatePhaseVisibility();
        this.updateFooter();
        
        // Add phase transition capabilities
        this.enablePhaseTransitions();
    }

    setupObservers() {
        // Wait for script.js to load and expose the functions
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => {
                    this.observeMirroring();
                    this.observeSaving();
                    this.observeKitMerging();
                }, 100);
            });
        } else {
            setTimeout(() => {
                this.observeMirroring();
                this.observeSaving();
                this.observeKitMerging();
            }, 100);
        }
    }

    // CRITICAL FIX: Enhanced loadProgress with proper phase 3 handling
    loadProgress() {
        const currentMode = window.pulsecraftShapeshifter ? window.pulsecraftShapeshifter.mode : 'consciousness';
        const savedPhase = localStorage.getItem(`pulsecraft_phase_${currentMode}`);
        const savedKits = window.getSavedVoiceKits ? window.getSavedVoiceKits() : [];
        
        if (savedPhase) {
            const phase = parseInt(savedPhase);
            console.log(`Progressive system: Loading saved phase ${phase} for mode ${currentMode}`);
            
            // CRITICAL FIX: Set capability based on what user has earned
            for (let i = 1; i <= phase; i++) {
                this.phases[i].capability = true;
            }
            
            // BUT always start at phase 1 on page load
            this.currentPhase = 1;
            this.phases[1].unlocked = true;
            
            // Hide all phases except phase 1 initially
            this.hideAllPhasesExceptOne();
            
            console.log('Progressive system: Reset to phase 1 on page load, but capabilities preserved');
        }
        
        // CRITICAL FIX: Set phase capabilities based on saved kits
        if (savedKits.length >= 1 && !this.phases[3].capability) {
            this.phases[3].capability = true;
            console.log('Progressive system: Phase 3 capability granted due to saved kit(s)');
        }
        
        if (savedKits.length >= 3 && !this.phases[4].capability) {
            this.phases[4].capability = true;
            console.log('Progressive system: Phase 4 capability granted due to 3+ saved kits');
        }

        // --- PASTE YOUR CODE HERE ---
        // Check for Phase 5 (Observatory) capability
        if (this.phases[4].capability && !this.phases[5]?.capability) {
            // Initialize Phase 5 if not in constructor
            if (!this.phases[5]) this.phases[5] = { name: 'observatory', unlocked: false };
            
            this.phases[5].capability = true;
            console.log('Progressive system: Phase 5 capability granted (Alchemy unlocked)');
        }
        // -----------------------------
    }

    // Hide all phases except phase 1
    hideAllPhasesExceptOne() {
        for (let i = 2; i <= 4; i++) {
            const phaseElement = document.querySelector(`.phase-${i}`);
            if (phaseElement) {
                phaseElement.classList.add('hidden');
                phaseElement.style.display = 'none';
                phaseElement.style.opacity = '0';
                phaseElement.style.visibility = 'hidden';
                phaseElement.classList.remove('active', 'emerging', 'emerged');
            }
            this.phases[i].unlocked = false;
        }
        
        // Ensure phase 1 is visible
        const phase1 = document.querySelector('.phase-1');
        if (phase1) {
            phase1.classList.remove('hidden');
            phase1.style.display = 'block';
            phase1.style.opacity = '1';
            phase1.style.visibility = 'visible';
        }
    }

    observeMirroring() {
        if (typeof window.mirrorVoice !== 'function') {
            console.warn('mirrorVoice function not found, retrying in 500ms...');
            setTimeout(() => this.observeMirroring(), 500);
            return;
        }

        const originalMirrorVoice = window.mirrorVoice;
        
        window.mirrorVoice = async function() {
            console.log('Progressive system: mirrorVoice called');
            const wasSuccessful = await originalMirrorVoice.apply(this, arguments);
            
            if (wasSuccessful === true) {
                console.log('Progressive system: Revealing phase 2');
                setTimeout(() => {
                    if (window.progressiveSystem) {
                        window.progressiveSystem.revealPhase2();
                        
                        // CRITICAL FIX: Auto-unlock Phase 3 if user has capability
                        setTimeout(() => {
                            if (window.progressiveSystem.phases[3].capability) {
                                console.log('Progressive system: Auto-unlocking Phase 3 due to saved capability');
                                window.progressiveSystem.unlockPhase(3);
                            }
                        }, 1000);
                    }
                }, 300);
            }
            
            return wasSuccessful;
        };
        
        console.log('Progressive system: mirrorVoice observer set up successfully');
    }

    observeSaving() {
        if (typeof window.saveVoiceKit !== 'function') {
            console.warn('saveVoiceKit function not found, retrying in 500ms...');
            setTimeout(() => this.observeSaving(), 500);
            return;
        }

        const originalSaveVoiceKit = window.saveVoiceKit;
        
        window.saveVoiceKit = async function() {
            const result = await originalSaveVoiceKit.apply(this, arguments);
            const savedKits = window.getSavedVoiceKits ? window.getSavedVoiceKits() : [];
            
            // CRITICAL FIX: Proper phase progression
            if (savedKits.length === 1) {
                setTimeout(() => {
                    if (window.progressiveSystem) {
                        console.log('Progressive system: First kit saved, unlocking Phase 3');
                        window.progressiveSystem.unlockPhase(3);
                    }
                }, 1000);
            }
            
            if (savedKits.length >= 3) {
                setTimeout(() => {
                    if (window.progressiveSystem) {
                        console.log('Progressive system: 3+ kits saved, unlocking Phase 4');
                        window.progressiveSystem.unlockPhase(4);
                    }
                }, 1000);
            }
            
            return result;
        };
        
        console.log('Progressive system: saveVoiceKit observer set up successfully');
    }

    observeKitMerging() {
        if (typeof window.refineSelectedKits !== 'function') {
            console.warn('refineSelectedKits function not found, checking if defined in global scope...');
            setTimeout(() => this.observeKitMerging(), 500);
            return;
        }

        const originalRefineSelectedKits = window.refineSelectedKits;
        
        window.refineSelectedKits = async function() {
            console.log('Progressive system: refineSelectedKits called');
            const result = await originalRefineSelectedKits.apply(this, arguments);
            
            // After successful kit merging, force DNA tags update
            setTimeout(() => {
                if (window.progressiveSystem) {
                    console.log('Progressive system: Forcing DNA tags update after kit merging');
                    window.progressiveSystem.forceDNATagsUpdate();
                    window.progressiveSystem.forcePhase2Visibility();
                }
            }, 500);
            
            return result;
        };
        
        console.log('Progressive system: refineSelectedKits observer set up successfully');
    }

    // CRITICAL FIX: Enhanced revealPhase2 
    revealPhase2() {
        console.log('Progressive system: revealPhase2 called, current unlocked:', this.phases[2].unlocked);
        
        console.log('Progressive system: Unlocking Phase 2');
        
        this.phases[2].unlocked = true;
        this.phases[2].capability = true;
        this.currentPhase = Math.max(this.currentPhase, 2);
        
        const phase2 = document.querySelector('.phase-2');
        console.log('Progressive system: Phase 2 element found:', !!phase2);
        
        if (phase2) {
            phase2.classList.remove('hidden');
            phase2.style.display = 'block';
            phase2.style.opacity = '1';
            phase2.style.visibility = 'visible';
            phase2.classList.add('emerging');
            phase2.classList.add('active');
            
            console.log('Progressive system: Phase 2 display set to block');
            
            const attributes = phase2.querySelectorAll('.voice-attribute');
            console.log('Progressive system: Found', attributes.length, 'voice attributes');
            
            attributes.forEach((attr, index) => {
                setTimeout(() => {
                    attr.classList.add('revealed');
                    attr.style.opacity = '1';
                    attr.style.display = 'block';
                    attr.style.visibility = 'visible';
                }, index * 200);
            });
            
            setTimeout(() => {
                this.crystallizeTags();
            }, attributes.length * 200 + 500);
        }
        
        this.updatePhaseVisibility();
        this.updateFooter();
        this.saveProgress();
        this.showPhaseNotification(2);
    }

    forcePhase2Visibility() {
        console.log('Progressive system: forcePhase2Visibility called');
        
        this.phases[2].unlocked = true;
        this.currentPhase = Math.max(this.currentPhase, 2);
        
        const phase2 = document.querySelector('.phase-2');
        if (phase2) {
            phase2.classList.remove('hidden');
            phase2.style.display = 'block';
            phase2.style.opacity = '1';
            phase2.style.visibility = 'visible';
            phase2.classList.add('active');
            
            const attributes = phase2.querySelectorAll('.voice-attribute');
            attributes.forEach((attr) => {
                attr.classList.add('revealed');
                attr.style.opacity = '1';
                attr.style.display = 'block';
                attr.style.visibility = 'visible';
            });
            
            console.log('Progressive system: Phase 2 forced to be visible');
        }
    }

    crystallizeTags() {
        console.log('Progressive system: crystallizeTags called');
        
        const dnaContainer = document.querySelector('.dna-section');
        if (dnaContainer) {
            dnaContainer.classList.add('crystallizing');
            console.log('Progressive system: Added crystallizing class to dna-section');
            
            setTimeout(() => {
                const dnaTags = document.querySelectorAll('.dna-tag-button');
                const symbolAnchors = document.querySelectorAll('.symbol-anchor-button');
                
                console.log('Progressive system: Found', dnaTags.length, 'DNA tags and', symbolAnchors.length, 'symbol anchors');
                
                [...dnaTags, ...symbolAnchors].forEach((tag, index) => {
                    setTimeout(() => {
                        tag.classList.add('crystallized');
                        tag.style.opacity = '1';
                        tag.style.visibility = 'visible';
                        tag.style.display = 'inline-block';
                        console.log('Progressive system: Crystallized tag:', tag.textContent);
                    }, index * 100);
                });
                
                const dnaTagsContainer = document.getElementById('dnaTagsContainer');
                const symbolAnchorsContainer = document.getElementById('symbolAnchorsContainer');
                
                if (dnaTagsContainer) {
                    dnaTagsContainer.style.display = 'flex';
                    dnaTagsContainer.style.opacity = '1';
                    dnaTagsContainer.style.visibility = 'visible';
                }
                
                if (symbolAnchorsContainer) {
                    symbolAnchorsContainer.style.display = 'flex';
                    symbolAnchorsContainer.style.opacity = '1';
                    symbolAnchorsContainer.style.visibility = 'visible';
                }
                
            }, 200);
        } else {
            console.warn('Progressive system: dna-section not found');
        }
    }

    // CRITICAL FIX: Enhanced unlockPhase with proper phase 3 handling
    unlockPhase(phaseNumber) {
        console.log(`Progressive system: Attempting to unlock phase ${phaseNumber}`);
        
        // CRITICAL FIX: Don't skip phases - unlock them in sequence
        if (phaseNumber > this.currentPhase + 1) {
            console.log(`Progressive system: Cannot skip to phase ${phaseNumber}, current phase is ${this.currentPhase}`);
            return;
        }
        
        if (phaseNumber <= this.currentPhase && this.phases[phaseNumber].unlocked) {
            console.log(`Progressive system: Phase ${phaseNumber} already unlocked`);
            return;
        }
        
        console.log(`Progressive system: Unlocking phase ${phaseNumber}`);
        
        this.currentPhase = phaseNumber;
        this.phases[phaseNumber].unlocked = true;
        this.phases[phaseNumber].capability = true;
        
        const phaseElement = document.querySelector(`.phase-${phaseNumber}`);
        if (phaseElement) {
            phaseElement.classList.remove('hidden');
            phaseElement.style.display = 'block';
            phaseElement.style.opacity = '1';
            phaseElement.style.visibility = 'visible';
            phaseElement.classList.add('emerging');
            phaseElement.classList.add('active');
            
            console.log(`Progressive system: Phase ${phaseNumber} display set to block`);
        }
        
        switch(phaseNumber) {
            case 3:
                this.revealExpansion();
                break;
            case 4:
                this.revealAlchemy();
                break;
        }
        
        this.updatePhaseVisibility();
        this.updateFooter();
        this.saveProgress();
        this.showPhaseNotification(phaseNumber);
    }

    // CRITICAL FIX: Enhanced revealExpansion for Phase 3
    // FIXED: Reveal the Universal Creation Studio instead of Tabs
    revealExpansion() {
        console.log('Progressive system: revealExpansion called for Phase 3');

        // 1. Reveal the Creation Studio (Universal Input Area)
        // Replaces old tab/custom content logic
        const creationStudio = document.querySelector('.generation-controls');
        if (creationStudio) {
            setTimeout(() => {
                creationStudio.style.opacity = '1';
                creationStudio.style.visibility = 'visible';
                creationStudio.style.display = 'block';
                creationStudio.classList.add('emerging'); // Triggers CSS animation
                console.log('Progressive system: Revealed Creation Studio');
            }, 300);
        }
        
        // 2. Reveal the Voice Library Preview
        const librarySection = document.querySelector('.library-preview');
        if (librarySection) {
            setTimeout(() => {
                librarySection.style.opacity = '1';
                librarySection.style.visibility = 'visible';
                librarySection.style.display = 'block';
                console.log('Progressive system: Revealed Library');
            }, 600);
        }

        // 3. Ensure the Output Canvas is ready (but hidden until generation)
        const outputCanvas = document.getElementById('generatedContentOutput');
        if (outputCanvas) {
            outputCanvas.style.display = 'none'; // Keeps it hidden until user clicks generate
        }
    }

    revealAlchemy() {
        console.log('Progressive system: revealAlchemy called for Phase 4');
        
        const alchemySection = document.querySelector('.alchemy-section');
        if (alchemySection) {
            alchemySection.classList.add('awakening');
            alchemySection.style.opacity = '1';
            alchemySection.style.visibility = 'visible';
            alchemySection.style.display = 'block';
        }
        
        if (window.renderSymbolMemoryGrid) {
            window.renderSymbolMemoryGrid();
        }
        
       setTimeout(() => {
            this.crystallizeTags();
        }, 500);

        // --- PASTE YOUR CODE HERE ---
        // AUTO-UNLOCK PHASE 5 AFTER ALCHEMY IS REVEALED
        setTimeout(() => {
            if (this.phases[5]) {
                this.unlockPhase(5);
                // Call the data refresh when Phase 5 opens
                if (window.refreshObservatory) window.refreshObservatory();
            }
        }, 2000); 
        // -----------------------------
    }

    updatePhaseVisibility() {
        if (this.container) {
            this.container.setAttribute('data-phase', this.currentPhase);
            
            for (let i = 1; i <= 4; i++) {
                if (this.phases[i].unlocked) {
                    this.container.classList.add(`phase-${i}-unlocked`);
                    
                    const phaseElement = document.querySelector(`.phase-${i}`);
                    if (phaseElement) {
                        phaseElement.style.display = 'block';
                        phaseElement.style.opacity = '1';
                        phaseElement.style.visibility = 'visible';
                    }
                } else {
                    this.container.classList.remove(`phase-${i}-unlocked`);
                }
            }
        }
    }

    updateFooter() {
        const footerText = document.getElementById('footerText');
        if (footerText) {
            const footerMessages = {
                1: 'Begin your journey...',
                2: 'Your voice is emerging...',
                3: 'Express your truth...',
                4: 'Master your essence...'
            };
            
            footerText.textContent = footerMessages[this.currentPhase];
        }
    }

    showPhaseNotification(phase) {
        const messages = {
            2: 'Your voice has been recognized',
            3: 'Content creation unlocked',
            4: 'Voice alchemy available'
        };
        
        if (window.showToast && messages[phase]) {
            window.showToast(messages[phase], 'success');
        }
    }

    enablePhaseTransitions() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const target = mutation.target;
                    if (target.classList.contains('emerging')) {
                        setTimeout(() => {
                            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 300);
                    }
                }
            });
        });
        
        document.querySelectorAll('.phase').forEach(phase => {
            observer.observe(phase, { attributes: true });
        });
    }

    saveProgress() {
        const currentMode = window.pulsecraftShapeshifter ? window.pulsecraftShapeshifter.mode : 'consciousness';
        
        let highestCapability = 1;
        for (let i = 4; i >= 1; i--) {
            if (this.phases[i].capability) {
                highestCapability = i;
                break;
            }
        }
        
        localStorage.setItem(`pulsecraft_phase_${currentMode}`, highestCapability.toString());
        console.log(`Progressive system: Saved highest capability phase ${highestCapability} for mode ${currentMode}`);
    }

    debugUnlockPhase(phase) {
        this.unlockPhase(phase);
    }

    forceDNATagsUpdate() {
        console.log('Progressive system: forceDNATagsUpdate called');
        
        this.forcePhase2Visibility();
        
        setTimeout(() => {
            this.crystallizeTags();
        }, 100);
        
        setTimeout(() => {
            if (window.currentVoiceKit) {
                console.log('Progressive system: Updating DNA tags with current voice kit data');
                
                if (window.updateDNATags && window.currentVoiceKit.dnaTags) {
                    window.updateDNATags(window.currentVoiceKit.dnaTags);
                }
                
                if (window.updateSymbolAnchors && window.currentVoiceKit.symbolAnchors) {
                    window.updateSymbolAnchors(window.currentVoiceKit.symbolAnchors);
                }
                
                setTimeout(() => {
                    this.crystallizeTags();
                }, 200);
            }
        }, 300);
    }

    resetToPhaseOne() {
        console.log('Progressive system: Resetting to phase 1 while preserving capabilities');
        
        this.hideAllPhasesExceptOne();
        this.currentPhase = 1;
        this.updatePhaseVisibility();
        this.updateFooter();
        
        console.log('Progressive system: Reset complete - ready for fresh revelation');
    }
}

// Global function for resetting progressive phase
window.resetProgressivePhase = function() {
    console.log('Global resetProgressivePhase called');
    
    if (window.progressiveSystem) {
        window.progressiveSystem.resetToPhaseOne();
    }
};

// Initialize the progressive system
function initializeProgressiveSystem() {
    if (!window.progressiveSystem) {
        console.log('Initializing Progressive Revelation System');
        window.progressiveSystem = new ProgressiveRevealSystem();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeProgressiveSystem);
} else {
    initializeProgressiveSystem();
}

// Enhance existing UI elements for progressive reveal
document.addEventListener('DOMContentLoaded', () => {
    const mirrorButton = document.getElementById('mirrorVoiceButton');
    if (mirrorButton) {
        mirrorButton.addEventListener('mouseenter', () => {
            const icon = mirrorButton.querySelector('.mirror-icon');
            if (icon) {
                icon.style.animation = 'pulse 1s infinite';
            }
        });
        mirrorButton.addEventListener('mouseleave', () => {
            const icon = mirrorButton.querySelector('.mirror-icon');
            if (icon) {
                icon.style.animation = 'none';
            }
        });
    }
    
    document.querySelectorAll('.phase').forEach(phase => {
        phase.addEventListener('transitionend', () => {
            if (phase.classList.contains('emerging')) {
                phase.classList.remove('emerging');
                phase.classList.add('emerged');
            }
        });
    });
});