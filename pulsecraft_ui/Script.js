// script.js - v25: The Merging Fix Edition
// CRITICAL FIX: DNA tags appear after kit merging, sample phrases update
// Fixed layout positioning and interface alignment

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
            body: JSON.stringify({ brandInput: brandInputValue }),
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
            body: JSON.stringify({ kits: kitsToRefine }),
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

    const style = 'symbolic_generation'; 
    const context = tag;

    showLoading(`Generating content for "${tag}"...`);
    try {
        const response = await fetch(`${API_BASE_URL}/api/generate-content`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                kit: currentVoiceKit,
                style: style,
                context: context
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate content.');
        }

        const data = await response.json();
        
        const generatedOutput = document.getElementById('stylePreviewOutput');
        if (generatedOutput) {
            generatedOutput.textContent = data.output || "No content generated.";
        }
        showToast(`Content generated for "${tag}"!`, 'success');
    } catch (error) {
        console.error('Error generating content:', error);
        showToast(`Error generating content: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

async function generateMultiStylePreview(style) {
    if (!currentVoiceKit) {
        showToast("Please mirror or recall a voice kit first.", 'warning');
        return;
    }
    
    const context = currentVoiceKit.rawInput || "This is a sample text to demonstrate the voice style.";

    const outputElement = document.getElementById('stylePreviewOutput');
    if (outputElement) {
        outputElement.textContent = 'Generating...';
    }

    showLoading(`Crafting ${style.replace(/([A-Z])/g, ' $1').toLowerCase()}...`);
    try {
        const response = await fetch(`${API_BASE_URL}/api/generate-content`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                kit: currentVoiceKit,
                style: style,
                context: context
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate multi-style preview.');
        }

        const data = await response.json();
        if (outputElement) {
            outputElement.textContent = data.output || "No content generated for this style.";
        }
        showToast(`Multi-style preview for "${style}" generated!`, 'success');
    } catch (error) {
        console.error('Error generating multi-style preview:', error);
        showToast(`Error generating multi-style preview: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

async function writeItForMe() {
    if (!currentVoiceKit) {
        showToast("Please mirror or recall a voice kit first.", 'warning');
        return;
    }
    
    const contextInput = document.getElementById('contentGenerationInput');
    const context = contextInput ? contextInput.value.trim() : '';
    
    const styleSelect = document.getElementById('contentGenerationStyleSelect');
    const style = styleSelect ? styleSelect.value : 'general';

    if (!context) {
        showToast("Please describe what content you want to generate.", 'warning');
        return;
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
                style: style,
                context: context
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate content.');
        }

        const data = await response.json();
        const generatedOutput = document.getElementById('generatedContentOutput');
        if (generatedOutput) {
            generatedOutput.innerHTML = (data.output || "No content generated.").replace(/\n/g, '<br>');
        }
        showToast("Content generated!", 'success');
    } catch (error) {
        console.error('Error in content generation:', error);
        showToast(`Error generating content: ${error.message}`, 'error');
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
    
    const mirrorButton = document.getElementById('mirrorVoiceButton');
    if (mirrorButton) {
        console.log('script.js: Attaching mirror voice button listener');
        mirrorButton.addEventListener('click', () => window.mirrorVoice());
    } else {
        console.error('script.js: Mirror voice button not found!');
    }
    
    const saveButton = document.getElementById('saveToMemoryButton');
    if (saveButton) {
        saveButton.addEventListener('click', () => window.saveVoiceKit());
    }
    
    const recallButton = document.getElementById('recallButton');
    if (recallButton) {
        recallButton.addEventListener('click', recallVoiceKit);
    }
    
    const exportJSONButton = document.getElementById('exportCurrentVoiceJSONButton');
    if (exportJSONButton) {
        exportJSONButton.addEventListener('click', exportCurrentVoiceJSON);
    }
    
    const exportPDFButton = document.getElementById('exportPDFButton');
    if (exportPDFButton) {
        exportPDFButton.addEventListener('click', exportPDF);
    }
    
    const exportTXTButton = document.getElementById('exportTXTButton');
    if (exportTXTButton) {
        exportTXTButton.addEventListener('click', exportTXT);
    }
    
    const clearAllButton = document.getElementById('clearAllSavedKitsButton');
    if (clearAllButton) {
        clearAllButton.addEventListener('click', clearAllSavedKits);
    }
    
    const uploadButton = document.getElementById('uploadMemoryBridgeButton');
    if (uploadButton) {
        uploadButton.addEventListener('click', () => document.getElementById('importMemoryFile').click());
    }
    
    const importFile = document.getElementById('importMemoryFile');
    if (importFile) {
        importFile.addEventListener('change', importMemoryBridge);
    }

    const writeItForMeButton = document.getElementById("writeItForMeButton");
    if (writeItForMeButton) {
        writeItForMeButton.addEventListener("click", () => writeItForMe());
    }

    document.querySelectorAll('.tab-button').forEach(button => {
        if (button) {
            button.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                generateMultiStylePreview(e.target.dataset.style);
            });
        }
    });

    const refineKitsButton = document.getElementById("refineKitsButton");
    if (refineKitsButton) {
        refineKitsButton.addEventListener("click", () => window.refineSelectedKits());
    }

    console.log('script.js: Performing initial UI refresh');
    window.refreshUIElements();

    const banner = document.getElementById("welcomeBanner");
    if (banner) {
        banner.style.background = "#f0fdf4";
        banner.innerHTML = `
            <div class="text-center text-emerald-700 font-semibold text-base fade-slide mb-4" id="welcomeBannerText">
                Welcome back, Creator. Ready to echo your voice again?
            </div>
        `;
        
        if (window.pulsecraftShapeshifter) {
            const lang = window.pulsecraftShapeshifter.LANGUAGE_MATRIX[window.pulsecraftShapeshifter.mode];
            const bannerTextElement = document.getElementById('welcomeBannerText');
            if (bannerTextElement) {
                bannerTextElement.innerHTML = `
                    <div class="text-center text-emerald-700 font-semibold text-base fade-slide mb-4">
                        ${lang.welcomeTitle}<br>
                        ${lang.welcomeText}
                    </div>
                `;
            }
        }
    }
    
    console.log('script.js: Initialization complete - Ready for progressive system integration');
});