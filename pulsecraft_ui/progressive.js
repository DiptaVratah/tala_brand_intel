// progressive.js - Progressive Revelation System
// Dipta Vratah Anantagah - The truth reveals itself when consciousness is ready
// CRITICAL FIX: DNA Tags appear after merging + Layout fixes

class ProgressiveRevealSystem {
    constructor() {
        this.currentPhase = 1;
        this.container = document.querySelector('.container');
        this.phases = {
            1: { name: 'mirror', unlocked: true },
            2: { name: 'recognition', unlocked: false },
            3: { name: 'expansion', unlocked: false },
            4: { name: 'alchemy', unlocked: false }
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
                    this.observeKitMerging(); // NEW: Observe kit merging
                }, 100);
            });
        } else {
            setTimeout(() => {
                this.observeMirroring();
                this.observeSaving();
                this.observeKitMerging(); // NEW: Observe kit merging
            }, 100);
        }
    }

    loadProgress() {
        const currentMode = window.pulsecraftShapeshifter ? window.pulsecraftShapeshifter.mode : 'consciousness';
        const savedPhase = localStorage.getItem(`pulsecraft_phase_${currentMode}`);
        const savedKits = window.getSavedVoiceKits ? window.getSavedVoiceKits() : [];
        
        if (savedPhase) {
            this.currentPhase = parseInt(savedPhase);
            for (let i = 1; i <= this.currentPhase; i++) {
                this.phases[i].unlocked = true;
            }
        }
        
        if (savedKits.length >= 3 && this.currentPhase < 4) {
            this.unlockPhase(4);
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
            
            if (savedKits.length === 1) {
                setTimeout(() => {
                    if (window.progressiveSystem) {
                        window.progressiveSystem.unlockPhase(3);
                    }
                }, 1000);
            }
            
            if (savedKits.length >= 3) {
                setTimeout(() => {
                    if (window.progressiveSystem) {
                        window.progressiveSystem.unlockPhase(4);
                    }
                }, 1000);
            }
            
            return result;
        };
        
        console.log('Progressive system: saveVoiceKit observer set up successfully');
    }

    // NEW: Observe kit merging/refinement
    observeKitMerging() {
        if (typeof window.refineSelectedKits !== 'function') {
            console.warn('refineSelectedKits function not found, checking if defined in global scope...');
            // Check if it's defined on the global window object
            setTimeout(() => this.observeKitMerging(), 500);
            return;
        }

        const originalRefineSelectedKits = window.refineSelectedKits;
        
        window.refineSelectedKits = async function() {
            console.log('Progressive system: refineSelectedKits called');
            const result = await originalRefineSelectedKits.apply(this, arguments);
            
            // CRITICAL: After successful kit merging, force DNA tags update
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

    revealPhase2() {
        console.log('Progressive system: revealPhase2 called, current unlocked:', this.phases[2].unlocked);
        
        if (this.phases[2].unlocked) {
            console.log('Progressive system: Phase 2 already unlocked, still triggering crystallization');
            setTimeout(() => {
                this.crystallizeTags();
            }, 200);
            return;
        }
        
        console.log('Progressive system: Unlocking Phase 2');
        
        this.phases[2].unlocked = true;
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

    // NEW: Force phase 2 to be visible (for merged kits)
    forcePhase2Visibility() {
        console.log('Progressive system: forcePhase2Visibility called');
        
        const phase2 = document.querySelector('.phase-2');
        if (phase2) {
            phase2.classList.remove('hidden');
            phase2.style.display = 'block';
            phase2.style.opacity = '1';
            phase2.style.visibility = 'visible';
            phase2.classList.add('active');
            
            // Force all voice attributes to be visible
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
                
                // Force containers to be visible
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

    unlockPhase(phaseNumber) {
        if (phaseNumber <= this.currentPhase) return;
        
        console.log(`Progressive system: Unlocking phase ${phaseNumber}`);
        
        this.currentPhase = phaseNumber;
        this.phases[phaseNumber].unlocked = true;
        
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

    revealExpansion() {
        const tabs = document.querySelectorAll('.tab-button');
        tabs.forEach((tab, index) => {
            setTimeout(() => {
                tab.classList.add('available');
                tab.style.opacity = '1';
            }, index * 150);
        });
    }

    revealAlchemy() {
        const alchemySection = document.querySelector('.alchemy-section');
        if (alchemySection) {
            alchemySection.classList.add('awakening');
        }
        
        if (window.renderSymbolMemoryGrid) {
            window.renderSymbolMemoryGrid();
        }
        
        setTimeout(() => {
            this.crystallizeTags();
        }, 500);
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
        localStorage.setItem(`pulsecraft_phase_${currentMode}`, this.currentPhase.toString());
    }

    debugUnlockPhase(phase) {
        this.unlockPhase(phase);
    }

    // CRITICAL NEW METHOD: Force DNA tags update (enhanced)
    forceDNATagsUpdate() {
        console.log('Progressive system: forceDNATagsUpdate called');
        
        // First ensure phase 2 is visible
        this.forcePhase2Visibility();
        
        // Then crystallize tags
        setTimeout(() => {
            this.crystallizeTags();
        }, 100);
        
        // Force update the actual DNA tags and symbol anchors content
        setTimeout(() => {
            if (window.currentVoiceKit) {
                console.log('Progressive system: Updating DNA tags with current voice kit data');
                
                // Force re-render of DNA tags and symbol anchors
                if (window.updateDNATags && window.currentVoiceKit.dnaTags) {
                    window.updateDNATags(window.currentVoiceKit.dnaTags);
                }
                
                if (window.updateSymbolAnchors && window.currentVoiceKit.symbolAnchors) {
                    window.updateSymbolAnchors(window.currentVoiceKit.symbolAnchors);
                }
                
                // Force crystallization again after content update
                setTimeout(() => {
                    this.crystallizeTags();
                }, 200);
            }
        }, 300);
    }
}

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