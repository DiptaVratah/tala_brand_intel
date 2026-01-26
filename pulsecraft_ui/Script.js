// script.js - v25: The Merging Fix Edition
// CRITICAL FIX: DNA tags appear after kit merging, sample phrases update
// Fixed layout positioning and interface alignment

let userId = localStorage.getItem('pulsecraft_userId');
if (!userId) {
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('pulsecraft_userId', userId);
    console.log('🆔 New user created:', userId);
} else {
    console.log('🆔 Returning user:', userId);
}

// Global state for the currently mirrored voice kit
let currentVoiceKit = null;
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000'  // Local development
    : window.location.origin;  // Production (Render)

console.log('Using API base URL:', API_BASE_URL);

// --- Utility Functions ---
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    let bgColor = '';
    switch (type) {
        case 'success': bgColor = '#2ECC71'; break;
        case 'warning': bgColor = '#F39C12'; break;
        case 'error':   bgColor = '#E74C3C'; break;
        case 'info':
        default:        bgColor = '#8E44AD'; break;
    }
    
    toast.style.backgroundColor = bgColor;
    toast.style.color = 'white';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
    toast.style.marginBottom = '10px';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
    
    toast.textContent = message;

    const container = document.getElementById('toastContainer');
    if (container) {
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 10);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            
            toast.addEventListener('transitionend', () => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, { once: true });
        }, 3000);
    }
}

let activeRequests = 0;
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingText = loadingOverlay ? loadingOverlay.querySelector('.loading-text') : null;

function showLoading(message = 'Reflecting truth...') {
    activeRequests++;
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
        if (loadingText) {
            loadingText.textContent = message || (window.pulsecraftShapeshifter ? window.pulsecraftShapeshifter.LANGUAGE_MATRIX[window.pulsecraftShapeshifter.mode].loadingText : 'Reflecting truth...');
        }
        if (window.pulsecraftShapeshifter && window.pulsecraftShapeshifter.mode) {
            loadingOverlay.classList.add(`${window.pulsecraftShapeshifter.mode}-mode`);
        }
    }
}

function hideLoading() {
    activeRequests--;
    if (activeRequests <= 0) {
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
        activeRequests = 0;
        if (window.pulsecraftShapeshifter && window.pulsecraftShapeshifter.mode) {
            loadingOverlay.classList.remove(`${window.pulsecraftShapeshifter.mode}-mode`);
        }
    }
}

const parseSafeArray = (value) => {
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.warn("Error parsing JSON string to array:", value, e);
            return [];
        }
    }
    return Array.isArray(value) ? value : [];
};

window.getSavedVoiceKits = function() {
    const currentMode = window.pulsecraftShapeshifter ? window.pulsecraftShapeshifter.mode : 'consciousness';
    const key = `pulsecraft_history_${currentMode}`;
    try {
        const saves = localStorage.getItem(key);
        let kits = [];
        if (saves) {
            kits = JSON.parse(saves);
        }
        return kits.map(kit => {
            return {
                ...kit,
                samplePhrases: parseSafeArray(kit.samplePhrases),
                phrasesToAvoid: parseSafeArray(kit.phrasesToAvoid),
                dnaTags: parseSafeArray(kit.dnaTags),
                symbolAnchors: parseSafeArray(kit.symbolAnchors)
            };
        });
    } catch (error) {
        console.error("Error parsing saved kits from localStorage:", error);
        showToast("Error loading saved kits. Local storage may be corrupted.", 'error');
        localStorage.removeItem(key);
        return [];
    }
};

window.saveVoiceKits = function(kits) {
    const currentMode = window.pulsecraftShapeshifter ? window.pulsecraftShapeshifter.mode : 'consciousness';
    const key = `pulsecraft_history_${currentMode}`;
    try {
        localStorage.setItem(key, JSON.stringify(kits));
    } catch (error) {
        console.error("Error saving kits to localStorage:", error);
        showToast("Failed to save voice kit. Storage might be full.", 'error');
    }
};

function createUnifiedKitObject(kitData) {
    return {
        name: kitData.name || "Untitled Kit",
        tone: kitData.tone || "",
        vocabulary: kitData.vocabulary || "",
        phrasingStyle: kitData.phrasingStyle || "",
        archetype: kitData.archetype || "",
        samplePhrases: JSON.stringify(parseSafeArray(kitData.samplePhrases)),
        phrasesToAvoid: JSON.stringify(parseSafeArray(kitData.phrasesToAvoid)),
        dnaTags: JSON.stringify(parseSafeArray(kitData.dnaTags)),
        symbolAnchors: JSON.stringify(parseSafeArray(kitData.symbolAnchors)),
        rawInput: kitData.rawInput || "", 
        createdAt: kitData.createdAt || new Date().toISOString() 
    };
}

// --- API Calls ---

async function mirrorVoiceCore() {
    console.log('mirrorVoiceCore: Starting voice mirror process');
    
    const brandInput = document.getElementById("brandVoiceInput");
    const brandInputValue = brandInput.value.trim();

    if (!brandInputValue) {
        showToast("Please enter some text to mirror your voice.", 'warning');
        return false;
    }
    
    showLoading();
    try {
        const response = await fetch(`${API_BASE_URL}/api/mirror-voice`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ brandInput: brandInputValue, userId: userId }),
             });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to mirror voice.');
        }

        const data = await response.json();
        data.rawInput = brandInputValue;
        
        console.log('mirrorVoiceCore: Voice mirrored successfully, rendering output');
        renderMirroredVoiceOutput(data);
        showToast("Voice mirrored successfully!", 'success');
        
        console.log('mirrorVoiceCore: Returning true for success');
        return true;

    } catch (error) {
        console.error('Error mirroring voice:', error);
        showToast(`Error mirroring voice: ${error.message}`, 'error');
        return false;
    } finally {
        hideLoading();
    }
}

window.mirrorVoice = mirrorVoiceCore;

window.saveVoiceKit = async function() {
    if (!currentVoiceKit) {
        showToast("No voice kit to save. Mirror your voice first!", 'warning');
        return;
    }

    const kitNameInput = document.getElementById('brandNameInput');
    const kitName = kitNameInput.value.trim();

    if (!kitName) {
        showToast("Please give your voice kit a name before saving.", 'warning');
        kitNameInput.focus();
        return;
    }

    let savedKits = window.getSavedVoiceKits();
    const existingIndex = savedKits.findIndex(kit => kit.name === kitName);

    const kitToSave = createUnifiedKitObject({
        ...currentVoiceKit,
        name: kitName,
        rawInput: document.getElementById("brandVoiceInput").value
    });

    if (existingIndex > -1) {
        if (confirm(`A voice kit named "${kitName}" already exists. Do you want to overwrite it?`)) {
            savedKits[existingIndex] = kitToSave;
            showToast(`Voice kit "${kitName}" overwritten.`, 'info');
        } else {
            showToast("Save cancelled.", 'info');
            return;
        }
    } else {
        savedKits.push(kitToSave);
        showToast("Voice kit saved!", 'success');
    }

    window.saveVoiceKits(savedKits);
    window.refreshUIElements();
}

async function recallVoiceKit() {
    const sessionSelect = document.getElementById("sessionSelect");
    const selectedKitName = sessionSelect.value;

    if (!selectedKitName) {
        showToast("Please select a voice kit to recall.", 'warning');
        return;
    }

    const savedKits = window.getSavedVoiceKits();
    const selectedKit = savedKits.find(kit => kit.name === selectedKitName);

    if (selectedKit) {
        const displayKit = {
            ...selectedKit,
            samplePhrases: parseSafeArray(selectedKit.samplePhrases),
            phrasesToAvoid: parseSafeArray(selectedKit.phrasesToAvoid),
            dnaTags: parseSafeArray(selectedKit.dnaTags),
            symbolAnchors: parseSafeArray(selectedKit.symbolAnchors)
        };
        renderMirroredVoiceOutput(displayKit);
        document.getElementById("brandVoiceInput").value = selectedKit.rawInput || '';
        showToast(`Voice kit "${selectedKitName}" recalled.`, 'success');
    } else {
        showToast("Selected voice kit not found.", 'error');
    }
}

// CRITICAL FIX: Enhanced refineSelectedKits function
window.refineSelectedKits = async function() {
    console.log('refineSelectedKits: Starting kit refinement process');
    
    const checkboxes = document.querySelectorAll('.preview-card-checkbox:checked');
    if (checkboxes.length === 0) {
        showToast("Please select at least one voice kit to refine.", 'warning');
        return false;
    }

    const selectedKitNames = Array.from(checkboxes).map(cb => cb.dataset.kitName);
    const savedKits = window.getSavedVoiceKits();
    
    const kitsToRefine = selectedKitNames.map(name => {
        const kit = savedKits.find(k => k.name === name);
        if (kit) {
            return {
                ...kit,
                samplePhrases: parseSafeArray(kit.samplePhrases),
                phrasesToAvoid: parseSafeArray(kit.phrasesToAvoid),
                dnaTags: parseSafeArray(kit.dnaTags),
                symbolAnchors: parseSafeArray(kit.symbolAnchors)
            };
        }
        return null;
    }).filter(Boolean);

    if (kitsToRefine.length === 0) {
        showToast("Selected kits could not be found or are malformed.", 'error');
        return false;
    }

    showLoading("Alchemizing frequencies...");
    try {
        const response = await fetch(`${API_BASE_URL}/api/refine-kits`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ kits: kitsToRefine, userId: userId }),
            });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to refine kits.');
        }

        const refinedKit = await response.json();
        console.log('refineSelectedKits: Received refined kit from backend:', refinedKit);
        
        renderMirroredVoiceOutput(refinedKit);
        document.getElementById("brandVoiceInput").value = '';
        showToast("Kits alchemized successfully!", 'success');

        checkboxes.forEach(cb => cb.checked = false);

        console.log('refineSelectedKits: Kit refinement completed successfully');
        return true;

    } catch (error) {
        console.error('Error refining kits:', error);
        showToast(`Error refining kits: ${error.message}`, 'error');
        return false;
    } finally {
        hideLoading();
    }
}

async function generateContentFromTag(tag, type) {
    if (!currentVoiceKit) {
        showToast("Please mirror or recall a voice kit first.", 'warning');
        return;
    }

    // We keep 'symbolic_generation' to trigger the "Resonant Truth" prompt in server.js
    const style = 'symbolic_generation'; 
    const context = tag;

    const outputContainer = document.getElementById('generatedContentOutput');
    if (outputContainer) {
        outputContainer.style.display = 'block';
        outputContainer.innerHTML = '<div class="spinner"></div><p style="text-align:center; margin-top:10px; color:#aaa;">Channeling resonance...</p>';
    }

    showLoading(`Channeling "${tag}"...`);
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/generate-content`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                kit: currentVoiceKit,
                style: style, // Explicitly sending symbolic style
                context: context,userId: userId
                 }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate content.');
        }

        const data = await response.json();
        
        if (outputContainer) {
            // Formatting: Convert newlines to breaks and bold markdown to strong tags
            let formatted = (data.output || "No content generated.")
                .replace(/\n/g, '<br>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            
            outputContainer.innerHTML = formatted;
            
            // Visual success cue
            outputContainer.classList.add('success-pulse');
            setTimeout(() => outputContainer.classList.remove('success-pulse'), 1000);
        }
        showToast(`Insight generated for "${tag}"!`, 'success');

    } catch (error) {
        console.error('Error generating content:', error);
        if (outputContainer) outputContainer.textContent = "Error: " + error.message;
        showToast(`Error: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}



// [IN script.js]

async function writeItForMe() {
    if (!currentVoiceKit) {
        showToast("Please mirror or recall a voice kit first.", 'warning');
        return;
    }
    
    const contextInput = document.getElementById('contentGenerationInput');
    const context = contextInput ? contextInput.value.trim() : '';
    
    if (!context) {
        showToast("Please describe what content you want to generate.", 'warning');
        return;
    }

    const outputContainer = document.getElementById('generatedContentOutput');
    if (outputContainer) {
        // CRITICAL: Ensure the box is visible before writing to it
        outputContainer.style.display = 'block'; 
        outputContainer.innerHTML = '<div class="spinner-small"></div><p style="text-align:center; color:#666;">Crafting your content...</p>';
    }

    showLoading("Crafting your content...");
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/generate-content`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                kit: currentVoiceKit,
                context: context, userId: userId
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate content.');
        }

        const data = await response.json();
        
        // Debug Log: Check your browser console to see the text arriving
        console.log("🔥 CONTENT RECEIVED:", data); 

        if (outputContainer) {
            if (data.output) {
                // Formatting: Convert newlines to HTML breaks
                let formatted = data.output
                    .replace(/\n/g, '<br>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

                outputContainer.innerHTML = formatted;
                
                // Visual Pulse
                outputContainer.classList.add('success-pulse');
                setTimeout(() => outputContainer.classList.remove('success-pulse'), 1000);
            } else {
                outputContainer.innerHTML = "<p style='color:red;'>Server response was empty.</p>";
            }
        }
        showToast("Content generated!", 'success');

    } catch (error) {
        console.error('Error in content generation:', error);
        if (outputContainer) outputContainer.textContent = "Error: " + error.message;
        showToast(`Error: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

// --- UI Refresh Functions ---
function refreshDropdown() {
    const sessionSelect = document.getElementById("sessionSelect");
    if (!sessionSelect) return;
    sessionSelect.innerHTML = '<option value="" selected disabled>Select a saved Voice Kit</option>';
    const history = window.getSavedVoiceKits();
    history.forEach((kit, i) => {
        const option = document.createElement("option");
        option.value = kit.name;
        option.text = kit.name || `VoiceKit ${i + 1} (${new Date(kit.createdAt).toLocaleDateString()})`;
        sessionSelect.appendChild(option);
    });
}

// CRITICAL FIX: Enhanced renderMirroredVoiceOutput function
function renderMirroredVoiceOutput(data) {
    console.log('renderMirroredVoiceOutput: Starting to render voice data', data);
    
    const voiceData = {
        name: data.name, 
        tone: data.tone || 'Awaiting analysis...',
        vocabulary: data.vocabulary || 'Awaiting analysis...',
        archetype: data.archetype || 'Awaiting analysis...',
        phrasingStyle: data.phrasingStyle || 'Awaiting analysis...',
        samplePhrases: data.samplePhrases || [],
        phrasesToAvoid: data.phrasesToAvoid || [],
        dnaTags: data.dnaTags || [],
        symbolAnchors: data.symbolAnchors || [],
        rawInput: data.rawInput || '' 
    };

    console.log('renderMirroredVoiceOutput: Processed voice data:', voiceData);

    // Update all display elements
    document.getElementById("outputTone").textContent = voiceData.tone;
    document.getElementById("outputVocabulary").textContent = voiceData.vocabulary;
    document.getElementById("outputArchetype").textContent = voiceData.archetype;
    document.getElementById("outputPhrasingStyle").textContent = voiceData.phrasingStyle;
    document.getElementById("outputSamplePhrases").textContent = voiceData.samplePhrases.join('; ') || 'N/A';
    document.getElementById("outputPhrasesToAvoid").textContent = voiceData.phrasesToAvoid.join('; ') || 'N/A';

    // CRITICAL FIX: Force update DNA tags and symbol anchors
    console.log('renderMirroredVoiceOutput: Updating DNA tags:', voiceData.dnaTags);
    console.log('renderMirroredVoiceOutput: Updating Symbol anchors:', voiceData.symbolAnchors);
    
    updateDNATags(voiceData.dnaTags);
    updateSymbolAnchors(voiceData.symbolAnchors);

    const outputDiv = document.getElementById('mirroredVoiceOutput');
    if (outputDiv) {
        outputDiv.classList.add('success');
        setTimeout(() => outputDiv.classList.remove('success'), 1000);
    }

    // Update global state
    currentVoiceKit = voiceData; 
    currentVoiceKit._lastMode = window.pulsecraftShapeshifter ? window.pulsecraftShapeshifter.mode : 'consciousness';

    const brandNameInput = document.getElementById('brandNameInput');
    if (brandNameInput) {
        brandNameInput.value = voiceData.name || '';
    }
    
    if (window.pulsecraftShapeshifter) {
        window.pulsecraftShapeshifter.translateInterface(window.pulsecraftShapeshifter.LANGUAGE_MATRIX[window.pulsecraftShapeshifter.mode]);
    }
    
    console.log('renderMirroredVoiceOutput: Voice rendering complete');
}

// CRITICAL FIX: Enhanced updateDNATags function
window.updateDNATags = function(tags) {
    console.log('updateDNATags: Called with tags:', tags);
    
    const container = document.getElementById('dnaTagsContainer');
    if (!container) {
        console.error("dnaTagsContainer not found in DOM.");
        return;
    }
    
    // Clear existing content
    container.innerHTML = '';

    if (Array.isArray(tags) && tags.length > 0) {
        console.log('updateDNATags: Creating buttons for', tags.length, 'tags');
        
        tags.forEach((tag, index) => {
            const button = document.createElement('button');
            button.className = 'dna-tag-button btn-tag';
            button.textContent = tag;
            button.style.opacity = '1';
            button.style.visibility = 'visible';
            button.style.display = 'inline-block';
            
            button.addEventListener('click', () => {
                generateContentFromTag(tag, 'dna');
                showToast(`Generating content for DNA Tag: "${tag}"`, 'info');
            });
            
            container.appendChild(button);
            console.log('updateDNATags: Created button for tag:', tag);
        });
        
        // Force container visibility
        container.style.display = 'flex';
        container.style.opacity = '1';
        container.style.visibility = 'visible';
        
    } else {
        container.innerHTML = '<p class="text-xs text-zinc-400">Mirror your voice to see DNA Tags.</p>';
    }
    
    console.log('updateDNATags: Function completed');
}

// CRITICAL FIX: Enhanced updateSymbolAnchors function  
window.updateSymbolAnchors = function(anchors) {
    console.log('updateSymbolAnchors: Called with anchors:', anchors);
    
    const container = document.getElementById('symbolAnchorsContainer');
    if (!container) {
        console.error("symbolAnchorsContainer not found in DOM.");
        return;
    }
    
    // Clear existing content
    container.innerHTML = '';

    if (Array.isArray(anchors) && anchors.length > 0) {
        console.log('updateSymbolAnchors: Creating buttons for', anchors.length, 'anchors');
        
        anchors.forEach((anchor, index) => {
            const button = document.createElement('button');
            button.className = 'symbol-anchor-button btn-tag';
            button.textContent = anchor;
            button.style.opacity = '1';
            button.style.visibility = 'visible';
            button.style.display = 'inline-block';
            
            button.addEventListener('click', () => {
                generateContentFromTag(anchor, 'symbol');
                showToast(`Generating content for Symbol Anchor: "${anchor}"`, 'info');
            });
            
            container.appendChild(button);
            console.log('updateSymbolAnchors: Created button for anchor:', anchor);
        });
        
        // Force container visibility
        container.style.display = 'flex';
        container.style.opacity = '1';
        container.style.visibility = 'visible';
        
    } else {
        container.innerHTML = '<p class="text-xs text-zinc-400">Mirror your voice to see Symbol Anchors.</p>';
    }
    
    console.log('updateSymbolAnchors: Function completed');
}

// --- PHASE 5: OBSERVATORY LOGIC (THE META-LAYER) ---

// Helper: Format relative time (e.g., "2 hours ago")
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Helper: Get icon class and symbol for event type
function getIconForType(type) {
    if (type === 'MIRROR_VOICE') return { class: 'mirror', icon: '<i class="fas fa-sparkles"></i>' };
    if (type === 'GENERATE_CONTENT') return { class: 'content', icon: '<i class="fas fa-pen-fancy"></i>' };
    if (type === 'REFINE_ALCHEMY') return { class: 'alchemy', icon: '<i class="fas fa-flask"></i>' };
    return { class: 'mirror', icon: '<i class="fas fa-circle"></i>' };
}

// 1. Fetch & Render History
async function updateHistoryFeed() {
    const userId = localStorage.getItem('pulsecraft_userId') || 'anonymous';
    const feedContainer = document.getElementById('historyFeedContainer');

    if (!feedContainer) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/user-history?userId=${userId}`);
        const data = await response.json();

        if (data.timeline && data.timeline.length > 0) {
            feedContainer.innerHTML = data.timeline.map(item => {
                const iconData = getIconForType(item.type);
                const detail = item.details.archetype || item.details.archetypeUsed || item.details.name || 'Voice Kit';
                const relativeTime = formatRelativeTime(item.date);

                return `
                    <div class="history-item">
                        <div class="history-icon ${iconData.class}">${iconData.icon}</div>
                        <div class="history-content">
                            <h4>${item.category}</h4>
                            <div class="history-meta">
                                <span>${detail}</span>
                                <span class="dot"></span>
                                <span class="history-timestamp">${relativeTime}</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            feedContainer.innerHTML = '<div class="empty-state">No activity recorded yet. Start by mirroring your voice.</div>';
        }
    } catch (e) {
        console.error("History fetch failed:", e);
        feedContainer.innerHTML = '<div class="empty-state">Unable to load activity stream.</div>';
    }
}

// Helper: Map text values to percentage for progress bars
function getMetricPercentage(value, type) {
    const valueMap = {
        tension: {
            'Low': 25, 'Balanced': 50, 'Moderate': 65, 'High': 85, 'Intense': 95
        },
        cadence: {
            'Flat': 20, 'Steady': 45, 'Flowing': 60, 'Dynamic': 75, 'Rhythmic': 85, 'Intense': 95
        },
        stability: {
            'Volatile': 20, 'Shifting': 40, 'Stable': 70, 'Anchored': 85, 'Crystallized': 95
        },
        evolution: {
            'Divergent': 30, 'Flexible': 55, 'Resonant': 85
        }
    };

    const map = valueMap[type] || {};
    // Try to find a matching key (case-insensitive partial match)
    for (const key of Object.keys(map)) {
        if (value && value.toLowerCase().includes(key.toLowerCase())) {
            return map[key];
        }
    }
    return 50; // Default middle value
}

// 2. Fetch & Render Drift (The Gauge & Timeline)
async function updateDriftAnalysis() {
    const userId = localStorage.getItem('pulsecraft_userId') || 'anonymous';

    try {
        const response = await fetch(`${API_BASE_URL}/api/identity-drift?userId=${userId}`);
        const data = await response.json();

        const metrics = data.internalMetrics || {};

        // Update Internal Coherence metrics with visual bars
        if (document.getElementById('metaTension')) {
            const tension = metrics.tension || "Balanced";
            document.getElementById('metaTension').textContent = tension;
            const tensionBar = document.getElementById('metaTensionBar');
            if (tensionBar) {
                setTimeout(() => tensionBar.style.width = getMetricPercentage(tension, 'tension') + '%', 100);
            }
        }

        if (document.getElementById('metaCadence')) {
            const cadence = metrics.cadence || "Steady";
            document.getElementById('metaCadence').textContent = cadence;
            const cadenceBar = document.getElementById('metaCadenceBar');
            if (cadenceBar) {
                setTimeout(() => cadenceBar.style.width = getMetricPercentage(cadence, 'cadence') + '%', 200);
            }
        }

        if (document.getElementById('metaStability')) {
            const stability = (metrics.stability || "Stable");
            document.getElementById('metaStability').textContent = stability;
            const stabilityBar = document.getElementById('metaStabilityBar');
            if (stabilityBar) {
                setTimeout(() => stabilityBar.style.width = getMetricPercentage(stability, 'stability') + '%', 300);
            }
        }

        if (document.getElementById('metaEvolution')) {
            const evolution = data.state || "Resonant";
            document.getElementById('metaEvolution').textContent = evolution;
            const evolutionBar = document.getElementById('metaEvolutionBar');
            if (evolutionBar) {
                setTimeout(() => evolutionBar.style.width = getMetricPercentage(evolution, 'evolution') + '%', 400);
            }
        }

        if (data.status === 'active' || data.status === 'clean_slate') {
            // A. Update Gauge with animated counter
            const score = data.resonanceScore || 100;
            const gaugeFill = document.getElementById('driftGaugeFill');
            const scoreText = document.getElementById('driftScoreDisplay');
            const insightText = document.getElementById('driftInsightText');
            const badge = document.getElementById('driftStatusBadge');

            // Animate score counter
            if (scoreText) {
                animateCounter(scoreText, score);
            }

            if (insightText) insightText.textContent = data.insight || 'Analyzing your voice patterns...';

            // Update badge with proper class
            if (badge) {
                badge.textContent = data.state || 'Active';
                badge.className = 'status-badge'; // Reset classes
                const state = (data.state || '').toLowerCase();
                if (state === 'resonant') badge.classList.add('resonant');
                else if (state === 'flexible') badge.classList.add('flexible');
                else if (state === 'divergent') badge.classList.add('divergent');
            }

            // Animate Gauge (141 is full arc length for the new larger gauge)
            if (gaugeFill) {
                setTimeout(() => {
                    const arcLength = 141;
                    const offset = arcLength - (arcLength * (score / 100));
                    gaugeFill.style.strokeDashoffset = offset;

                    // Reset and apply color class
                    gaugeFill.classList.remove('high-resonance', 'mid-resonance', 'low-resonance');
                    if (score > 80) gaugeFill.classList.add('high-resonance');
                    else if (score > 50) gaugeFill.classList.add('mid-resonance');
                    else gaugeFill.classList.add('low-resonance');
                }, 100);
            }

            // B. Update Vertical Timeline
            const timelineContainer = document.getElementById('evolutionTimeline');
            if (timelineContainer && data.journey && data.journey.length > 0) {
                // Reverse to show newest first
                const reversedJourney = [...data.journey].reverse();
                timelineContainer.innerHTML = reversedJourney.map((node, index) => `
                    <div class="timeline-node-wrapper">
                        <div class="timeline-node"></div>
                        <div class="timeline-info">
                            <span class="timeline-date">${formatRelativeTime(node.date)}</span>
                            <span class="timeline-archetype">${node.archetype}</span>
                            ${node.cadence ? `<span class="timeline-cadence">${node.cadence}</span>` : ''}
                        </div>
                    </div>
                `).join('');
            } else if (timelineContainer) {
                timelineContainer.innerHTML = '<p class="placeholder-text">Your evolution journey will appear here as you create more voices.</p>';
            }
        }
    } catch (e) {
        console.error("Drift analysis failed:", e);
    }
}

// Animate counter from 0 to target
function animateCounter(element, target) {
    const duration = 1500;
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (target - start) * easeProgress);
        element.textContent = current + '%';

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// 3. Master Refresh Function (The Eye Open)
window.refreshObservatory = function() {
    console.log("🔭 Opening Observatory...");
    updateHistoryFeed();
    updateDriftAnalysis();
};

window.renderSymbolMemoryGrid = function() {
    const grid = document.getElementById("previewGalleryGrid");
    if (!grid) return;
    grid.innerHTML = ""; 

    const history = window.getSavedVoiceKits();

    if (history.length === 0) {
        grid.innerHTML = '<p class="placeholder-text">Save at least three voices to unlock Alchemy...</p>';
        return;
    }

    history.forEach((kit, index) => {
        const card = document.createElement("div");
        card.className = (history.length >= 3) ? 'preview-card alchemy-unlocked' : 'preview-card';

        const kitDnaTags = parseSafeArray(kit.dnaTags);

        card.innerHTML = `
            <input type="checkbox" class="preview-card-checkbox" data-kit-name="${kit.name}" style="display: ${history.length >= 3 ? 'block' : 'none'};">
            
            <h3>${kit.name || 'VoiceKit ' + (index + 1)}</h3>
            <p><strong>Archetype:</strong> ${kit.archetype || '-'}</p>
            ${kitDnaTags.length > 0 ? `<p class="text-xs text-zinc-600 mt-2">DNA: ${kitDnaTags.join(', ')}</p>` : ''}
            <button class="btn-recall-card" data-kit-name="${kit.name}">Recall</button>
            <button class="btn-delete-card" data-kit-name="${kit.name}">Delete</button>
        `;
        grid.appendChild(card);
    });

    document.querySelectorAll('.btn-recall-card').forEach(button => {
        button.addEventListener('click', (event) => {
            const nameToRecall = event.target.dataset.kitName;
            recallVoiceKitByName(nameToRecall);
        });
    });

    document.querySelectorAll('.btn-delete-card').forEach(button => {
        button.addEventListener('click', (event) => {
            deleteVoiceKit(event.target.dataset.kitName);
        });
    });
};

function recallVoiceKitByName(kitName) {
    const sessionSelect = document.getElementById("sessionSelect");
    if(sessionSelect) {
        sessionSelect.value = kitName;
        recallVoiceKit();
    }
}

window.refreshUIElements = function() {
    const currentMode = window.pulsecraftShapeshifter ? window.pulsecraftShapeshifter.mode : 'consciousness';
    if (currentVoiceKit && currentVoiceKit._lastMode !== currentMode) {
        currentVoiceKit = null;
        document.getElementById("outputTone").textContent = 'Awaiting analysis...';
        document.getElementById("outputVocabulary").textContent = 'Awaiting analysis...';
        document.getElementById("outputArchetype").textContent = 'Awaiting analysis...';
        document.getElementById("outputPhrasingStyle").textContent = 'Awaiting analysis...';
        document.getElementById("outputSamplePhrases").textContent = 'N/A';
        document.getElementById("outputPhrasesToAvoid").textContent = 'N/A';
        updateDNATags([]);
        updateSymbolAnchors([]);
        document.getElementById('brandVoiceInput').value = '';

        const stylePreview = document.getElementById('stylePreviewOutput');
        if (stylePreview) stylePreview.textContent = 'Click a button above to generate a preview.';

        const generatedContent = document.getElementById('generatedContentOutput');
        if (generatedContent) generatedContent.textContent = 'Your generated content will appear here.';
    }

    refreshDropdown();
    renderSymbolMemoryGrid(); 
    updatePastSignalsSection();
    
    const brandNameInput = document.getElementById('brandNameInput');
    if (brandNameInput) {
        if (!currentVoiceKit) { 
            brandNameInput.value = '';
        } else {
            brandNameInput.value = currentVoiceKit.name || '';
        }
    }
};

function updatePastSignalsSection() {
    const pastSignalsSection = document.getElementById('yourPastSignalsContent');
    if (!pastSignalsSection) return;

    const history = window.getSavedVoiceKits();
    if (history.length > 0) {
        const lastSavedKit = history[history.length - 1];
        pastSignalsSection.innerHTML = `
            <p>You have <strong>${history.length}</strong> Voice Kit(s) saved in your memory for this mode.</p>
            <p>Last saved: <strong>${lastSavedKit.name || `VoiceKit ${history.length}`}</strong> on ${new Date(lastSavedKit.createdAt).toLocaleString()}.</p>
            <p>Explore them in the "Collective Preview Gallery" below or "Recall" them from the dropdown.</p>
        `;
    } else {
        pastSignalsSection.innerHTML = '<p>Nothing here yet — but your voice is about to leave a mark. This section could contain a brief overview of recent interactions or saved kits.</p>';
    }
}

function deleteVoiceKit(kitName) {
    let savedKits = window.getSavedVoiceKits();
    const initialLength = savedKits.length;
    savedKits = savedKits.filter(kit => kit.name !== kitName);

    if (savedKits.length < initialLength) {
        window.saveVoiceKits(savedKits);
        window.refreshUIElements();
        showToast(`Voice kit "${kitName}" deleted.`, 'info');
    } else {
        showToast(`Voice kit "${kitName}" not found.`, 'warning');
    }
}

function clearAllSavedKits() {
    const confirmClear = () => {
        if (confirm("Are you sure you want to clear ALL saved voice kits for this mode? This cannot be undone.")) {
            const currentMode = window.pulsecraftShapeshifter ? window.pulsecraftShapeshifter.mode : 'consciousness';
            const key = `pulsecraft_history_${currentMode}`;
            localStorage.removeItem(key);
            currentVoiceKit = null;
            window.refreshUIElements();
            renderMirroredVoiceOutput({});
            document.getElementById("brandVoiceInput").value = '';
            document.getElementById("brandNameInput").value = '';
            showToast('All saved voice kits for this mode have been cleared.', 'success');
        }
    };
    confirmClear(); 
}

function exportCurrentVoiceJSON() {
    if (!currentVoiceKit) {
        showToast('No current voice kit to export.', 'warning');
        return;
    }
    const filename = `${currentVoiceKit.name || 'voice_kit'}.json`;
    const jsonStr = JSON.stringify(currentVoiceKit, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Voice kit exported as JSON!', 'success');
}

function exportPDF() {
    if (!currentVoiceKit) {
        showToast('No current voice kit to export.', 'warning');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFont('helvetica');
    doc.setFontSize(22);
    doc.text(`PulseCraft Voice Kit: ${currentVoiceKit.name || 'Untitled'}`, 10, 20);

    doc.setFontSize(12);
    let y = 40;
    const lineHeight = 10;

    const addText = (label, value) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${label}:`, 10, y);
        doc.setFont('helvetica', 'normal');
        const splitText = doc.splitTextToSize(value, 180);
        doc.text(splitText, 40, y);
        y += (splitText.length * lineHeight) + 5;
    };

    addText('Tone', currentVoiceKit.tone || 'N/A');
    addText('Vocabulary', currentVoiceKit.vocabulary || 'N/A');
    addText('Phrasing Style', currentVoiceKit.phrasingStyle || 'N/A');
    addText('Archetype', currentVoiceKit.archetype || 'N/A');
    addText('Sample Phrases', (currentVoiceKit.samplePhrases || []).join('; ') || 'N/A');
    addText('Phrases to Avoid', (currentVoiceKit.phrasesToAvoid || []).join('; ') || 'N/A');
    addText('DNA Tags', (currentVoiceKit.dnaTags || []).join(', ') || 'N/A');
    addText('Symbol Anchors', (currentVoiceKit.symbolAnchors || []).join(', ') || 'N/A');

    doc.save(`${currentVoiceKit.name || 'voice_kit'}.pdf`);
    showToast('Voice kit exported as PDF!', 'success');
}

function exportTXT() {
    if (!currentVoiceKit) {
        showToast('No current voice kit to export.', 'warning');
        return;
    }

    const content = `
PulseCraft Voice Kit: ${currentVoiceKit.name || 'Untitled'}

Tone: ${currentVoiceKit.tone || 'N/A'}
Vocabulary: ${currentVoiceKit.vocabulary || 'N/A'}
Phrasing Style: ${currentVoiceKit.phrasingStyle || 'N/A'}
Archetype: ${currentVoiceKit.archetype || 'N/A'}
Sample Phrases: ${(currentVoiceKit.samplePhrases || []).join('; ') || 'N/A'}
Phrases to Avoid: ${(currentVoiceKit.phrasesToAvoid || []).join('; ') || 'N/A'}
DNA Tags: ${(currentVoiceKit.dnaTags || []).join(', ') || 'N/A'}
Symbol Anchors: ${(currentVoiceKit.symbolAnchors || []).join(', ') || 'N/A'}
    `.trim();

    const filename = `${currentVoiceKit.name || 'voice_kit'}.txt`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Voice kit exported as TXT!', 'success');
}

function importMemoryBridge(event) {
    const file = event.target.files[0];
    if (!file) {
        showToast('No file selected for import.', 'warning');
        return;
    }

    if (file.type !== "application/json") {
        showToast('Please select a valid JSON file.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedData = JSON.parse(e.target.result);

            let kitsToImport = [];
            if (Array.isArray(importedData)) {
                kitsToImport = importedData;
            } else if (typeof importedData === 'object' && importedData !== null && importedData.name && importedData.tone) {
                kitsToImport = [importedData];
            } else {
                showToast("Invalid JSON structure for Memory Bridge. Expected a Voice Kit object or an array of Voice Kits.", 'error');
                return;
            }

            let savedKits = window.getSavedVoiceKits();
            let importedCount = 0;

            kitsToImport.forEach(newKit => {
                if (typeof newKit === 'object' && newKit !== null && newKit.name && newKit.tone) {
                    const existingIndex = savedKits.findIndex(kit => kit.name === newKit.name);
                    if (existingIndex > -1) {
                        savedKits[existingIndex] = newKit;
                    } else {
                        savedKits.push(newKit);
                    }
                    importedCount++;
                } else {
                    console.warn("Skipping invalid kit during import:", newKit);
                }
            });

            if (importedCount > 0) {
                window.saveVoiceKits(savedKits);
                window.refreshUIElements();
                showToast(`Successfully imported ${importedCount} voice kit(s) into this mode's memory.`, 'success');
            } else {
                showToast('No valid voice kits found in the imported file.', 'warning');
            }

        } catch (error) {
            console.error('Error importing Memory Bridge:', error);
            showToast('Failed to import Memory Bridge. Ensure it is a valid JSON file.', 'error');
        }
    };
    reader.readAsText(file);
}


// --- Event Listeners and Initial Setup ---
document.addEventListener('DOMContentLoaded', () => {
    console.log('script.js: DOMContentLoaded - Initializing UI and event listeners');
    
    if (!window.pulsecraftShapeshifter) {
        console.log('script.js: Initializing shapeshifter');
        window.pulsecraftShapeshifter = new InterfaceShapeshifter();
    }
    
    console.log('script.js: Exposing mirrorVoice function globally');
    window.mirrorVoice = mirrorVoiceCore;
    
    // --- Core Buttons ---
    const mirrorButton = document.getElementById('mirrorVoiceButton');
    if (mirrorButton) {
        mirrorButton.addEventListener('click', () => window.mirrorVoice());
    }
    
    const saveButton = document.getElementById('saveToMemoryButton');
    if (saveButton) {
        saveButton.addEventListener('click', () => window.saveVoiceKit());
    }
    
    const recallButton = document.getElementById('recallButton');
    if (recallButton) {
        recallButton.addEventListener('click', recallVoiceKit);
    }
    
    const writeItForMeButton = document.getElementById("writeItForMeButton");
    if (writeItForMeButton) {
        writeItForMeButton.addEventListener("click", () => writeItForMe());
    }

    const refineKitsButton = document.getElementById("refineKitsButton");
    if (refineKitsButton) {
        refineKitsButton.addEventListener("click", () => window.refineSelectedKits());
    }

    // --- Export/Import Tools ---
    const exportJSONButton = document.getElementById('exportCurrentVoiceJSONButton');
    if (exportJSONButton) exportJSONButton.addEventListener('click', exportCurrentVoiceJSON);
    
    const exportPDFButton = document.getElementById('exportPDFButton');
    if (exportPDFButton) exportPDFButton.addEventListener('click', exportPDF);
    
    const exportTXTButton = document.getElementById('exportTXTButton');
    if (exportTXTButton) exportTXTButton.addEventListener('click', exportTXT);
    
    const clearAllButton = document.getElementById('clearAllSavedKitsButton');
    if (clearAllButton) clearAllButton.addEventListener('click', clearAllSavedKits);
    
    const uploadButton = document.getElementById('uploadMemoryBridgeButton');
    if (uploadButton) uploadButton.addEventListener('click', () => document.getElementById('importMemoryFile').click());
    
    const importFile = document.getElementById('importMemoryFile');
    if (importFile) importFile.addEventListener('change', importMemoryBridge);

    const refreshDashboardBtn = document.getElementById('refreshDashboardButton');
    if (refreshDashboardBtn) {
        refreshDashboardBtn.addEventListener('click', window.refreshObservatory);
    }

    // --- Initialization ---
    console.log('script.js: Performing initial UI refresh');
    window.refreshUIElements();

    // Welcome Banner Logic
    const banner = document.getElementById("welcomeBanner");
    if (banner) {
        banner.style.background = "#f0fdf4";
        if (window.pulsecraftShapeshifter) {
            const lang = window.pulsecraftShapeshifter.LANGUAGE_MATRIX[window.pulsecraftShapeshifter.mode];
            banner.innerHTML = `
                <div class="text-center text-emerald-700 font-semibold text-base fade-slide mb-4" id="welcomeBannerText">
                    ${lang.welcomeTitle}<br>${lang.welcomeText}
                </div>
            `;
        }
    }
    
    console.log('script.js: Initialization complete');
});