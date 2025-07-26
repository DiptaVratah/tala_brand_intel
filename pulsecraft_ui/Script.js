// script.js - Updated for Welcome Banner logic, Dynamic DNA Tag/Symbol Anchor insertion,
// and NEW: Click-to-Generate functionality for DNA Tags and Symbol Anchors,
// aligned with the new server.js prompt architecture.
// FIX: Robust rendering of voice kit data from backend (removing redundant parsing in renderMirroredVoiceOutput).
// FIX: Populate brandVoiceInput with relevant context after Refine Selected Kits.
// NEW: Automatically save and display refined kits in the Collective Preview Gallery for full functionality.
// CRITICAL FIX: Remove redundant parseSafeArray calls in refineSelectedKits.
// NEW FIX: Ensure selected kits for refinement are fully structured before sending to backend.
// CRITICAL FIX: Stop refreshUIElements from clearing DNA/Symbol tags.
// NEW FIX: Reset checkboxes after refinement.

// Release Signal v13 -- Mirror Widening & Active Resonance: Dipta Vratah Anantagah

// Global state for the currently mirrored voice kit
let currentVoiceKit = null;

// --- Utility Functions ---
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    let bgColor = '';
    switch (type) {
        case 'success': bgColor = 'bg-emerald-600'; break;
        case 'warning': bgColor = 'bg-yellow-600'; break;
        case 'error':   bgColor = 'bg-red-600'; break;
        case 'info':
        default:        bgColor = 'bg-zinc-800'; break;
    }
    toast.className = `${bgColor} text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-up`;
    toast.textContent = message;

    const container = document.getElementById('toastContainer');
    if (container) {
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('opacity-0');
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    } else {
        console.warn("Toast container not found. Toast message: ", message);
    }
}

// Helper to safely parse JSON strings that should be arrays (primarily for localStorage retrieval)
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


// Helper to create a unified kit object for saving
function createUnifiedKitObject(kitData) {
    return {
        name: kitData.name || "Untitled Kit",
        tone: kitData.tone || "",
        vocabulary: kitData.vocabulary || "",
        phrasingStyle: kitData.phrasingStyle || "",
        archetype: kitData.archetype || "",
        // Ensure values are strings for localStorage, JSON.stringify empty array if null/undefined
        samplePhrases: JSON.stringify(parseSafeArray(kitData.samplePhrases)),
        phrasesToAvoid: JSON.stringify(parseSafeArray(kitData.phrasesToAvoid)),
        dnaTags: JSON.stringify(parseSafeArray(kitData.dnaTags)),
        symbolAnchors: JSON.stringify(parseSafeArray(kitData.symbolAnchors)),
        rawInput: kitData.rawInput || "", // Store the original input
        createdAt: new Date().toISOString()
    };
}

// Gets all saved kits from LocalStorage with robust parsing
function getSavedKits() {
    const rawKits = localStorage.getItem("pulsecraft_history");
    let kits = [];
    if (rawKits) {
        try {
            kits = JSON.parse(rawKits);
        } catch (e) {
            console.error("Error parsing pulsecraft_history from localStorage:", e);
            showToast("Error loading saved kits. Local storage may be corrupted.", 'error');
            localStorage.removeItem("pulsecraft_history"); // Clear corrupted data to prevent future errors
            kits = [];
        }
    }

    return kits.map(kit => {
        // Ensure all array-like properties are actually arrays after retrieval
        // This is crucial for consistency when recalling from local storage
        return {
            ...kit,
            samplePhrases: parseSafeArray(kit.samplePhrases),
            phrasesToAvoid: parseSafeArray(kit.phrasesToAvoid),
            dnaTags: parseSafeArray(kit.dnaTags),
            symbolAnchors: parseSafeArray(kit.symbolAnchors)
        };
    });
}

// Saves kits to LocalStorage
function saveKits(kits) {
    try {
        localStorage.setItem("pulsecraft_history", JSON.stringify(kits));
    } catch (e) {
        console.error("Error saving kits to localStorage:", e);
        showToast("Error saving kits. Local storage limit reached or inaccessible.", 'error');
    }
}

// --- UI Refresh Functions ---
function refreshDropdown() {
    const dropdown = document.getElementById("sessionSelect");
    if (!dropdown) return;
    dropdown.innerHTML = '<option value="" selected disabled>Select a session</option>';
    const history = getSavedKits();
    history.forEach((kit, i) => {
        const option = document.createElement("option");
        option.value = i;
        option.text = kit.name || `VoiceKit ${i + 1} (${new Date(kit.createdAt).toLocaleDateString()})`;
        dropdown.appendChild(option);
    });
}

function renderMirroredVoiceOutput(data) {
    const voiceData = {
        tone: data.tone || 'N/A',
        vocabulary: data.vocabulary || 'N/A',
        archetype: data.archetype || 'N/A',
        phrasingStyle: data.phrasingStyle || 'N/A',
        samplePhrases: data.samplePhrases || [],
        phrasesToAvoid: data.phrasesToAvoid || [],
        dnaTags: data.dnaTags || [],
        symbolAnchors: data.symbolAnchors || []
    };

    const outputTone = document.getElementById("outputTone");
    const outputVocabulary = document.getElementById("outputVocabulary");
    const outputArchetype = document.getElementById("outputArchetype");
    const outputPhrasingStyle = document.getElementById("outputPhrasingStyle");
    const outputSamplePhrases = document.getElementById("outputSamplePhrases");
    const outputPhrasesToAvoid = document.getElementById("outputPhrasesToAvoid");

    if (outputTone) outputTone.textContent = voiceData.tone;
    if (outputVocabulary) outputVocabulary.textContent = voiceData.vocabulary;
    if (outputArchetype) outputArchetype.textContent = voiceData.archetype;
    if (outputPhrasingStyle) outputPhrasingStyle.textContent = voiceData.phrasingStyle;
    if (outputSamplePhrases) outputSamplePhrases.textContent = voiceData.samplePhrases.join(', ') || 'N/A';
    if (outputPhrasesToAvoid) outputPhrasesToAvoid.textContent = voiceData.phrasesToAvoid.join(', ') || 'N/A';

    renderDNATags(voiceData.dnaTags);
    renderSymbolAnchors(voiceData.symbolAnchors);
}


function renderDNATags(tags) {
    const container = document.getElementById('dnaTagsContainer');
    if (!container) {
        console.error("dnaTagsContainer not found in DOM.");
        return;
    }
    container.innerHTML = ''; // Clear previous tags

    if (Array.isArray(tags) && tags.length > 0) {
        tags.forEach(tag => {
            const button = document.createElement('button');
            button.className = 'dna-tag-button';
            button.textContent = tag;
            button.addEventListener('click', () => {
                writeItForMe('symbolic_generation', tag);
                showToast(`Generating content for DNA Tag: "${tag}"`, 'info');
            });
            container.appendChild(button);
        });
        console.log(`DNA Tags rendered: ${tags.join(', ')}`);
    } else {
        container.innerHTML = '<p class="text-xs text-zinc-400">No DNA Tags generated.</p>';
        console.log("No DNA Tags to render, displaying placeholder.");
    }
}

function renderSymbolAnchors(anchors) {
    const container = document.getElementById('symbolAnchorsContainer');
    if (!container) {
        console.error("symbolAnchorsContainer not found in DOM.");
        return;
    }
    container.innerHTML = ''; // Clear previous anchors

    if (Array.isArray(anchors) && anchors.length > 0) {
        anchors.forEach(anchor => {
            const button = document.createElement('button');
            button.className = 'symbol-anchor-button';
            button.textContent = anchor;
            button.addEventListener('click', () => {
                writeItForMe('symbolic_generation', anchor);
                showToast(`Generating content for Symbol Anchor: "${anchor}"`, 'info');
            });
            container.appendChild(button);
        });
        console.log(`Symbol Anchors rendered: ${anchors.join(', ')}`);
    } else {
        container.innerHTML = '<p class="text-xs text-zinc-400">No Symbol Anchors generated.</p>';
        console.log("No Symbol Anchors to render, displaying placeholder.");
    }
}


function renderSymbolMemoryGrid() {
    const grid = document.getElementById("previewGalleryGrid");
    if (!grid) return;
    grid.innerHTML = ""; // Clear existing content

    const history = getSavedKits();

    history.forEach((kit, index) => {
        const card = document.createElement("div");
        card.className = "preview-card"; // Apply the preview-card class for styling

        // Ensure dnaTags and symbolAnchors are arrays for display here as well
        const kitDnaTags = parseSafeArray(kit.dnaTags);
        const kitSymbolAnchors = parseSafeArray(kit.symbolAnchors);

        card.innerHTML = `
            <input type="checkbox" class="preview-card-checkbox" data-index="${index}">
            <h4>${kit.name || 'VoiceKit ' + (index + 1)}</h4>
            <p><strong>Tone:</strong> ${kit.tone || '-'}</p>
            <p><strong>Archetype:</strong> ${kit.archetype || '-'}</p>
            <p><strong>Saved At:</strong> ${kit.createdAt ? new Date(kit.createdAt).toLocaleString() : '-'}</p>
            ${kitDnaTags.length > 0 ? `<p class="text-xs text-zinc-600 mt-2">DNA: ${kitDnaTags.join(', ')}</p>` : ''}
            ${kitSymbolAnchors.length > 0 ? `<p class="text-xs text-zinc-600">Anchors: ${kitSymbolAnchors.join(', ')}</p>` : ''}
            <button data-index="${index}" class="recall-symbolic-kit-button">
                Preview Again
            </button>
            <div class="dna-tag-overlay"> <!-- This overlay remains a visual placeholder, not for dynamic tags -->
                DNA-${index + 1}
            </div>
        `;
        grid.appendChild(card);
    });

    document.querySelectorAll('.recall-symbolic-kit-button').forEach(button => {
        if (button) {
            button.addEventListener('click', (event) => {
                const index = event.target.dataset.index;
                recallSymbolicKit(index);
            });
        }
    });
}

function refreshUIElements() {
    refreshDropdown();
    renderSymbolMemoryGrid();
    // CRITICAL FIX: Removed these lines. DNA Tags and Symbol Anchors should be rendered
    // by renderMirroredVoiceOutput, not cleared on every UI refresh.
    // renderDNATags([]);
    // renderSymbolAnchors([]);
    // Update Your Past Signals section based on saved kits
    updatePastSignalsSection();
}

// NEW FUNCTION: Update Your Past Signals section
function updatePastSignalsSection() {
    const pastSignalsSection = document.getElementById('yourPastSignalsContent');
    if (!pastSignalsSection) return;

    const history = getSavedKits();
    if (history.length > 0) {
        pastSignalsSection.innerHTML = `
            <p>You have **${history.length}** Voice Kit(s) saved in your memory.</p>
            <p>Last saved: ${history[history.length - 1].name || `VoiceKit ${history.length}`} on ${new Date(history[history.length - 1].createdAt).toLocaleString()}.</p>
            <p>Explore them in the 'Collective Preview Gallery' below or 'Recall' them from the dropdown.</p>
        `;
    } else {
        pastSignalsSection.innerHTML = '<p>Nothing here yet — but your voice is about to leave a mark. This section could contain a brief overview of recent interactions or saved kits.</p>';
    }
}


// --- Core Logic Functions ---

async function mirrorVoice() {
    const brandInputEl = document.getElementById("brandVoiceInput");
    const brandInput = brandInputEl ? brandInputEl.value.trim() : '';

    if (!brandInput) {
        showToast("Please paste your clearest signal.", 'warning');
        return;
    }

    const outputTone = document.getElementById("outputTone");
    const outputVocabulary = document.getElementById("outputVocabulary");
    const outputArchetype = document.getElementById("outputArchetype");
    const outputPhrasingStyle = document.getElementById("outputPhrasingStyle");
    const outputSamplePhrases = document.getElementById("outputSamplePhrases");
    const outputPhrasesToAvoid = document.getElementById("outputPhrasesToAvoid");

    if (outputTone) outputTone.textContent = " Reflecting...";
    if (outputVocabulary) outputVocabulary.textContent = "";
    if (outputArchetype) outputArchetype.textContent = "";
    if (outputPhrasingStyle) outputPhrasingStyle.textContent = "";
    if (outputSamplePhrases) outputSamplePhrases.textContent = "";
    if (outputPhrasesToAvoid) outputPhrasesToAvoid.textContent = "";
    
    // Clear dynamic tags/anchors before new generation
    renderDNATags([]);
    renderSymbolAnchors([]);

    console.log("Attempting to mirror voice with input:", brandInput);

    try {
        const response = await fetch('/api/mirror-voice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ brandInput })
        });

        console.log("Raw Response Status:", response.status);
        console.log("Raw Response OK:", response.ok);

        if (!response.ok) {
            let errorText = `HTTP Error: ${response.status} ${response.statusText}`;
            try {
                const errorData = await response.json();
                errorText += ` - ${errorData.error || JSON.stringify(errorData)}`;
            } catch (e) {
                errorText += ` - ${await response.text()}`;
            }
            throw new Error(errorText);
        }

        const data = await response.json(); 
        console.log("Received data from backend for /api/mirror-voice:", data);

        currentVoiceKit = {
            tone: data.tone,
            vocabulary: data.vocabulary,
            archetype: data.archetype,
            phrasingStyle: data.phrasingStyle,
            samplePhrases: data.samplePhrases,
            phrasesToAvoid: data.phrasesToAvoid,
            dnaTags: data.dnaTags,
            symbolAnchors: data.symbolAnchors,
            rawInput: brandInput
        };
        console.log("currentVoiceKit after assignment in mirrorVoice:", currentVoiceKit);
        renderMirroredVoiceOutput(currentVoiceKit);
        showToast("Voice mirrored successfully!", 'success');
        updatePastSignalsSection(); 
    } catch (err) {
        console.error("Mirror voice failed (Network or Uncaught):", err);
        if (outputTone) outputTone.textContent = ` Request failed: ${err.message}`;
        if (outputVocabulary) outputVocabulary.textContent = "";
        if (outputArchetype) outputArchetype.textContent = "";
        if (outputPhrasingStyle) outputPhrasingStyle.textContent = "";
        if (outputSamplePhrases) outputSamplePhrases.textContent = "";
        if (outputPhrasesToAvoid) outputPhrasesToAvoid.textContent = "";
        showToast(`Request failed: ${err.message}`, 'error');
    }
}

async function saveVoiceKit() {
    const brandNameInput = document.getElementById("brandNameInput");
    const brandName = brandNameInput ? brandNameInput.value.trim() : '';
    
    if (!currentVoiceKit || Object.keys(currentVoiceKit).length === 0) {
        showToast("Please 'Mirror Your Voice' or 'Recall' a kit first to populate the voice data before saving.", 'warning');
        return;
    }
    if (!brandName) {
        showToast("Please provide a name for your Brand Kit.", 'warning');
        return;
    }

    const kitToSave = createUnifiedKitObject({
        ...currentVoiceKit,
        name: brandName,
        rawInput: document.getElementById("brandVoiceInput") ? document.getElementById("brandVoiceInput").value.trim() : ''
    });

    const history = getSavedKits();
    const existingKitIndex = history.findIndex(kit => kit.name === kitToSave.name);

    if (existingKitIndex !== -1) {
        history[existingKitIndex] = kitToSave;
        showToast(`Brand Kit "${kitToSave.name}" updated!`, 'success');
    } else {
        history.push(kitToSave);
        showToast("Your Brand Kit has been saved!", 'success');
    }

    saveKits(history);
    refreshUIElements(); // This will re-render the gallery and dropdown
    // Explicitly re-render current DNA/Symbol tags if they were just saved
    if (currentVoiceKit) {
        renderDNATags(currentVoiceKit.dnaTags);
        renderSymbolAnchors(currentVoiceKit.symbolAnchors);
    }
}

async function recallSession() {
    const select = document.getElementById("sessionSelect");
    const selectedIndex = select ? select.value : null;

    if (selectedIndex === "" || selectedIndex === null) {
        showToast("Please select a saved session.", 'warning');
        return;
    }

    const history = getSavedKits();
    const kitData = history[selectedIndex];

    if (!kitData) {
        showToast("Selected kit not found.", 'error');
        return;
    }

    const brandVoiceInputEl = document.getElementById("brandVoiceInput");
    if (brandVoiceInputEl) brandVoiceInputEl.value = kitData.rawInput || "";
    
    const brandNameInputEl = document.getElementById("brandNameInput");
    if (brandNameInputEl) brandNameInputEl.value = kitData.name || "";
    
    currentVoiceKit = kitData; // This kitData is already parsed by getSavedKits
    renderMirroredVoiceOutput(kitData); 

    showToast(`Kit "${kitData.name}" recalled successfully!`, 'success');
}

function recallSymbolicKit(index) {
    const history = getSavedKits();
    const kit = history[index];
    if (!kit) {
        showToast("Selected kit not found in gallery.", 'error');
        return;
    }

    const brandVoiceInputEl = document.getElementById("brandVoiceInput");
    if (brandVoiceInputEl) brandVoiceInputEl.value = kit.rawInput || "";

    const brandNameInputEl = document.getElementById("brandNameInput");
    if (brandNameInputEl) brandNameInputEl.value = kit.name || "";

    currentVoiceKit = kit; // This kit is already parsed by getSavedKits
    renderMirroredVoiceOutput(kit);

    showToast(`Kit "${kit.name}" loaded from gallery!`, 'success');
}


async function exportTXT() {
    const nameInput = document.getElementById("brandNameInput");
    const name = nameInput ? nameInput.value.trim() : "brand-kit";
    
    if (!currentVoiceKit) { 
        showToast("No active voice kit to export to TXT. Mirror your voice first.", 'warning');
        return;
    }

    let textContent = `PulseCraft Voice Kit: ${name}\n\n`;
    textContent += `Tone: ${currentVoiceKit.tone || 'N/A'}\n`;
    textContent += `Vocabulary: ${currentVoiceKit.vocabulary || 'N/A'}\n`;
    textContent += `Phrasing Style: ${currentVoiceKit.phrasingStyle || 'N/A'}\n`;
    textContent += `Archetype: ${currentVoiceKit.archetype || 'N/A'}\n`;
    textContent += `Sample Phrases: ${Array.isArray(currentVoiceKit.samplePhrases) ? currentVoiceKit.samplePhrases.join(', ') : currentVoiceKit.samplePhrases || 'N/A'}\n`;
    textContent += `Phrases To Avoid: ${Array.isArray(currentVoiceKit.phrasesToAvoid) ? currentVoiceKit.phrasesToAvoid.join(', ') : currentVoiceKit.phrasesToAvoid || 'N/A'}\n`;
    textContent += `DNA Tags: ${Array.isArray(currentVoiceKit.dnaTags) ? currentVoiceKit.dnaTags.join(', ') : currentVoiceKit.dnaTags || 'N/A'}\n`;
    textContent += `Symbol Anchors: ${Array.isArray(currentVoiceKit.symbolAnchors) ? currentVoiceKit.symbolAnchors.join(', ') : currentVoiceKit.symbolAnchors || 'N/A'}\n`;
    textContent += `Original Input: ${currentVoiceKit.rawInput || 'N/A'}\n`;
    textContent += `Generated On: ${new Date().toLocaleString()}`;


    const blob = new Blob([textContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${name.replace(/\s+/g, "_").toLowerCase()}_pulsecraft_mirror.txt`;
    document.body.appendChild(link); 
    link.click();
    document.body.removeChild(link); 
    URL.revokeObjectURL(link.href);
    showToast("TXT export started!", 'success');
}

async function exportPDF() {
    if (!currentVoiceKit) {
        showToast("No active voice kit to export to PDF. Mirror your voice first.", 'warning');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const nameInput = document.getElementById("brandNameInput");
    const name = nameInput ? nameInput.value.trim() : "PulseCraft Voice Kit";

    let y = 20;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`PulseCraft Voice Kit: ${name}`, 20, y);
    y += 10;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Generated On: ${new Date().toLocaleString()}`, 20, y);
    y += 15;

    if (currentVoiceKit) {
        const attributes = [
            { title: "Tone", value: currentVoiceKit.tone },
            { title: "Vocabulary", value: currentVoiceKit.vocabulary },
            { title: "Archetype", value: currentVoiceKit.archetype },
            { title: "Phrasing Style", value: currentVoiceKit.phrasingStyle },
            { title: "Sample Phrases", value: Array.isArray(currentVoiceKit.samplePhrases) ? currentVoiceKit.samplePhrases.join('; ') : currentVoiceKit.samplePhrases },
            { title: "Phrases To Avoid", value: Array.isArray(currentVoiceKit.phrasesToAvoid) ? currentVoiceKit.phrasesToAvoid.join('; ') : currentVoiceKit.phrasesToAvoid },
            { title: "DNA Tags", value: Array.isArray(currentVoiceKit.dnaTags) ? currentVoiceKit.dnaTags.join('; ') : currentVoiceKit.dnaTags },
            { title: "Symbol Anchors", value: Array.isArray(currentVoiceKit.symbolAnchors) ? currentVoiceKit.symbolAnchors.join('; ') : currentVoiceKit.symbolAnchors }
        ];

        attributes.forEach(attr => {
            if (attr.value) {
                doc.setFont("helvetica", "bold");
                doc.setFontSize(12);
                doc.text(`${attr.title}:`, 20, y);
                y += 7;
                doc.setFont("helvetica", "normal");
                doc.setFontSize(11);
                const textLines = doc.splitTextToSize(attr.value, 170);
                doc.text(textLines, 25, y);
                y += (textLines.length * 6) + 5;

                if (y > doc.internal.pageSize.height - 20) {
                    doc.addPage();
                    y = 20;
                }
            }
        });
    } else {
        doc.text("No voice data available for this report.", 20, y);
    }

    const filename = `${name.replace(/\s+/g, "_").toLowerCase()}_pulsecraft_voice_kit.pdf`;
    doc.save(filename);
    showToast("PDF export started!", 'success');
}


async function exportAllKitsJSON() {
    const history = getSavedKits();

    if (!history.length) {
        showToast("No saved kits to export.", 'warning');
        return;
    }

    const json = JSON.stringify(history, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `PulseCraft_AllVoiceKits_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("All kits JSON export started!", 'success');
    }

async function exportCurrentVoiceJSON() {
    if (!currentVoiceKit) {
        showToast("No active voice kit to export. Mirror your voice first.", 'warning');
        return;
    }

    const json = JSON.stringify(currentVoiceKit, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${(currentVoiceKit.name || 'current_voice_kit').replace(/\s+/g, '_').toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Current voice kit JSON export started!", 'success');
}


async function generateMultiStylePreview(style) {
    const stylePreviewOutput = document.getElementById("stylePreviewOutput");
    
    if (!currentVoiceKit) {
        if (stylePreviewOutput) stylePreviewOutput.innerHTML = '<p class="text-red-500">Please mirror your voice first to enable style previews.</p>';
        return;
    }

    if (stylePreviewOutput) stylePreviewOutput.innerHTML = ` Generating ${style} preview...`;

    const brandVoiceInputEl = document.getElementById('brandVoiceInput');
    const context = brandVoiceInputEl ? brandVoiceInputEl.value.trim() : '';

    try {
        const response = await fetch('/api/generate-content', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                kit: currentVoiceKit, 
                style: style, 
                context: context 
            })
        });
        const data = await response.json();

        if (data.error) {
            if (stylePreviewOutput) stylePreviewOutput.innerHTML = ` Error generating preview: ${data.error}`;
            showToast(`Error generating preview: ${data.error}`, 'error');
        } else {
            if (stylePreviewOutput) stylePreviewOutput.innerHTML = `<p>${data.output}</p>`;
            showToast(`${style} preview generated!`, 'success');
        }
    }
     catch (err) {
        console.error("Multi-style preview generation failed:", err);
        if (stylePreviewOutput) stylePreviewOutput.innerHTML = ` Request failed: ${err.message}`;
        showToast(`Preview request failed: ${err.message}`, 'error');
    }
}


// --- REFINED writeItForMe Function ---
async function writeItForMe(overrideStyle = null, overrideContext = null) {
    const contentInputEl = document.getElementById("contentGenerationInput");
    const contentGenerationStyleSelect = document.getElementById("contentGenerationStyleSelect");
    const generatedContentOutput = document.getElementById("generatedContentOutput");

    let style = overrideStyle || (contentGenerationStyleSelect ? contentGenerationStyleSelect.value : 'general'); 
    let context = overrideContext || (contentInputEl ? contentInputEl.value.trim() : '');
    
    if (!currentVoiceKit) {
        if (generatedContentOutput) generatedContentOutput.innerHTML = '<p class="text-red-500">Please mirror your voice first to generate content in your style.</p>';
        showToast("Mirror your voice first.", 'warning');
        return;
    }
    if (!context) {
        showToast("Please enter what you want this to say, or click a DNA Tag/Symbol Anchor.", 'warning');
        return;
    }

    if (generatedContentOutput) generatedContentOutput.innerHTML = ' Crafting your content...';

    try {
        const response = await fetch('/api/generate-content', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                kit: currentVoiceKit, 
                style: style, 
                context: context 
            })
        });
        const data = await response.json();

        if (data.error) {
            if (generatedContentOutput) generatedContentOutput.innerHTML = ` Error: ${data.error}`;
            showToast(`Error generating content: ${data.error}`, 'error');
        } else {
            if (generatedContentOutput) generatedContentOutput.innerHTML = `<p>${data.output}</p>`;
            showToast("Content crafted!", 'success');
        }
    } catch (err) {
        console.error("Write it for me failed:", err);
        if (generatedContentOutput) generatedContentOutput.innerHTML = ` Request failed: ${err.message}`;
        showToast(`Content generation failed: ${err.message}`, 'error');
    }
}


// --- New Function: Refine Selected Kits ---
async function refineSelectedKits() {
    const selectedCheckboxes = document.querySelectorAll('.preview-card-checkbox:checked');
    const selectedKitData = [];
    const history = getSavedKits();

    if (selectedCheckboxes.length < 2) {
        showToast("Please select at least two kits to refine.", 'warning');
        return;
    }

    selectedCheckboxes.forEach(checkbox => {
        const index = parseInt(checkbox.dataset.index);
        if (history[index]) {
            selectedKitData.push(history[index]);
        }
    });

    if (selectedKitData.length === 0) {
        showToast("No valid kits selected for refinement.", 'error');
        return;
    }

    showToast(`Refining ${selectedKitData.length} kit(s)...`, 'info');

    // NEW FIX: Ensure selected kits for refinement are fully structured before sending to backend.
    // This is crucial to prevent malformed prompts if localStorage data is inconsistent.
    const structuredSelectedKitData = selectedKitData.map(kit => ({
        name: kit.name || 'Untitled',
        tone: kit.tone || '',
        vocabulary: kit.vocabulary || '',
        phrasingStyle: kit.phrasingStyle || '',
        archetype: kit.archetype || '',
        samplePhrases: Array.isArray(kit.samplePhrases) ? kit.samplePhrases : [],
        phrasesToAvoid: Array.isArray(kit.phrasesToAvoid) ? kit.phrasesToAvoid : [],
        dnaTags: Array.isArray(kit.dnaTags) ? kit.dnaTags : [],
        symbolAnchors: Array.isArray(kit.symbolAnchors) ? kit.symbolAnchors : []
    }));


    try {
        const response = await fetch('/api/refine-kits', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Send the newly structured data to the backend
            body: JSON.stringify({ kits: structuredSelectedKitData })
        });
        const data = await response.json();

        if (data.error || !response.ok) {
            const errorMessage = data.error || `HTTP Error: ${response.status} ${response.statusText}`;
            showToast(`Error refining kits: ${errorMessage}`, 'error');
            console.error("Refine kits failed:", data);
        } else {
            // Ensure the refined kit received from backend is correctly parsed
            const refinedKit = {
                tone: data.tone || 'N/A',
                vocabulary: data.vocabulary || 'N/A',
                archetype: data.archetype || 'N/A',
                phrasingStyle: data.phrasingStyle || 'N/A',
                // CRITICAL FIX: Direct assignment, as backend guarantees arrays
                samplePhrases: data.samplePhrases,
                phrasesToAvoid: data.phrasesToAvoid,
                dnaTags: data.dnaTags,
                symbolAnchors: data.symbolAnchors,
                name: data.name || `Refined Kit (${new Date().toLocaleDateString()})`,
                rawInput: currentVoiceKit ? currentVoiceKit.rawInput : "" // Keep original raw input if available, or empty
            };
            
            // Set the newly refined kit as the current active kit
            currentVoiceKit = refinedKit;

            // Display the refined kit in the main section
            renderMirroredVoiceOutput(currentVoiceKit); 
            
            // Save the newly refined kit to localStorage
            const updatedHistory = getSavedKits();
            updatedHistory.push(createUnifiedKitObject(currentVoiceKit)); // Use createUnifiedKitObject for proper saving
            saveKits(updatedHistory);

            // Refresh UI to show the new kit in the gallery and dropdown
            refreshUIElements();

            // NEW FIX: Uncheck all selected checkboxes after successful refinement
            selectedCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
            });

            showToast("Kits refined and saved successfully! New kit displayed.", 'success');

            // Populate brandVoiceInput with a relevant context for multi-style preview
            const brandVoiceInputEl = document.getElementById("brandVoiceInput");
            if (brandVoiceInputEl) {
                if (currentVoiceKit.samplePhrases && currentVoiceKit.samplePhrases.length > 0) {
                    brandVoiceInputEl.value = currentVoiceKit.samplePhrases[0]; // Use the first sample phrase
                } else {
                    brandVoiceInputEl.value = "Describe this refined voice in action."; // Fallback generic prompt
                }
            }
        }
    } catch (err) {
        console.error("Refine kits failed (Network or Uncaught):", err);
        showToast(`Refine request failed: ${err.message}`, 'error');
    }
}


// --- Event Listeners & Initial Load ---
document.addEventListener("DOMContentLoaded", () => {
    // Buttons
    const mirrorVoiceButton = document.getElementById("mirrorVoiceButton");
    if (mirrorVoiceButton) mirrorVoiceButton.addEventListener("click", mirrorVoice);

    const saveToMemoryButton = document.getElementById("saveToMemoryButton");
    if (saveToMemoryButton) saveToMemoryButton.addEventListener("click", saveVoiceKit);

    const recallButton = document.getElementById("recallButton");
    if (recallButton) recallButton.addEventListener("click", recallSession);

    const exportTXTButton = document.getElementById("exportTXTButton");
    if (exportTXTButton) exportTXTButton.addEventListener("click", exportTXT);

    const exportPDFButton = document.getElementById("exportPDFButton");
    if (exportPDFButton) exportPDFButton.addEventListener("click", exportPDF);

    const exportAllKitsJSONButton = document.getElementById("exportAllKitsJSONButton");
    if (exportAllKitsJSONButton) exportAllKitsJSONButton.addEventListener("click", exportAllKitsJSON);

    const exportCurrentVoiceJSONButton = document.getElementById("exportCurrentVoiceJSONButton");
    if (exportCurrentVoiceJSONButton) exportCurrentVoiceJSONButton.addEventListener("click", exportCurrentVoiceJSON);

    // Modified writeItForMe button listener to call without arguments
    const writeItForMeButton = document.getElementById("writeItForMeButton");
    if (writeItForMeButton) writeItForMeButton.addEventListener("click", () => writeItForMe());

    // Multi-Style Preview Tabs
    document.querySelectorAll('.tab-button').forEach(button => {
        if (button) {
            button.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                generateMultiStylePreview(e.target.dataset.style);
            });
        }
    });

    // Initial UI refresh
    refreshUIElements();

    // Welcome Banner Logic - SIMPLIFIED AND POSITIONED
    const banner = document.getElementById("welcomeBanner");
    if (banner) {
        banner.style.background = "#f0fdf4";
        banner.innerHTML = `
            <div class="text-center text-emerald-700 font-semibold text-base fade-slide mb-4">\n                Welcome back, Creator. Ready to echo your voice again?\\n\n            </div>\n        `;
        setTimeout(() => {
            banner.classList.add('hidden');
        }, 5000);
    }

    // NEW: Refine Selected Kits event listener
    const refineKitsButton = document.getElementById("refineKitsButton");
    if (refineKitsButton) {
        refineKitsButton.addEventListener("click", refineSelectedKits); // Now calls the actual function
    }


    // Placeholder for Export to Symbolic Memory / Upload Memory Bridge
    const exportSymbolicMemoryButton = document.getElementById("exportSymbolicMemoryButton");
    if (exportSymbolicMemoryButton) {
        exportSymbolicMemoryButton.addEventListener("click", () => {
            showToast("Exporting to Symbolic Memory... (Functionality coming soon!)", 'info');
        });
    }

    const uploadMemoryBridgeButton = document.getElementById("uploadMemoryBridgeButton");
    if (uploadMemoryBridgeButton) {
        uploadMemoryBridgeButton.addEventListener("click", () => {
            showToast("Uploading Memory Bridge... (Functionality coming soon!)", 'info');
        });
    }
});
// Final casing fix applied.
