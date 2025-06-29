// script.js - Updated for Welcome Banner logic and Dynamic DNA Tag/Symbol Anchor insertion

// 🜂 Release Signal v2 — Mirror Widening: Dipta Vratah Anantagah

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

// Helper to create a unified kit object for saving
function createUnifiedKitObject(kitData) {
    return {
        name: kitData.name || "Untitled Kit",
        tone: kitData.tone || "",
        vocabulary: kitData.vocabulary || "",
        phrasingStyle: kitData.phrasingStyle || "",
        archetype: kitData.archetype || "",
        samplePhrases: Array.isArray(kitData.samplePhrases) ? JSON.stringify(kitData.samplePhrases) : kitData.samplePhrases || "",
        phrasesToAvoid: Array.isArray(kitData.phrasesToAvoid) ? JSON.stringify(kitData.phrasesToAvoid) : kitData.phrasesToAvoid || "",
        dnaTags: Array.isArray(kitData.dnaTags) ? JSON.stringify(kitData.dnaTags) : kitData.dnaTags || "",
        symbolAnchors: Array.isArray(kitData.symbolAnchors) ? JSON.stringify(kitData.symbolAnchors) : kitData.symbolAnchors || "",
        rawInput: kitData.rawInput || "", // Store the original input
        createdAt: new Date().toISOString()
    };
}

// Gets all saved kits from LocalStorage
function getSavedKits() {
    const kits = JSON.parse(localStorage.getItem("pulsecraft_history")) || [];
    return kits.map(kit => ({
        ...kit,
        samplePhrases: typeof kit.samplePhrases === 'string' ? JSON.parse(kit.samplePhrases) : kit.samplePhrases,
        phrasesToAvoid: typeof kit.phrasesToAvoid === 'string' ? JSON.parse(kit.phrasesToAvoid) : kit.phrasesToAvoid,
        dnaTags: typeof kit.dnaTags === 'string' ? JSON.parse(kit.dnaTags) : kit.dnaTags,
        symbolAnchors: typeof kit.symbolAnchors === 'string' ? JSON.parse(kit.symbolAnchors) : kit.symbolAnchors
    }));
}

// Saves kits to LocalStorage
function saveKits(kits) {
    localStorage.setItem("pulsecraft_history", JSON.stringify(kits));
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
    const samplePhrases = Array.isArray(data.samplePhrases) ? data.samplePhrases.join(', ') : data.samplePhrases || '';
    const phrasesToAvoid = Array.isArray(data.phrasesToAvoid) ? data.phrasesToAvoid.join(', ') : data.phrasesToAvoid || '';

    const outputTone = document.getElementById("outputTone");
    const outputVocabulary = document.getElementById("outputVocabulary");
    const outputArchetype = document.getElementById("outputArchetype");
    const outputPhrasingStyle = document.getElementById("outputPhrasingStyle");
    const outputSamplePhrases = document.getElementById("outputSamplePhrases");
    const outputPhrasesToAvoid = document.getElementById("outputPhrasesToAvoid");

    if (outputTone) outputTone.textContent = data.tone || 'N/A';
    if (outputVocabulary) outputVocabulary.textContent = data.vocabulary || 'N/A';
    if (outputArchetype) outputArchetype.textContent = data.archetype || 'N/A';
    if (outputPhrasingStyle) outputPhrasingStyle.textContent = data.phrasingStyle || 'N/A';
    if (outputSamplePhrases) outputSamplePhrases.textContent = samplePhrases || 'N/A';
    if (outputPhrasesToAvoid) outputPhrasesToAvoid.textContent = phrasesToAvoid || 'N/A';

    // Render DNA Tags and Symbol Anchors
    renderDNATags(data.dnaTags);
    renderSymbolAnchors(data.symbolAnchors);
}

function renderDNATags(tags) {
    const container = document.getElementById('dnaTagsContainer');
    if (!container) return;
    container.innerHTML = ''; // Clear previous tags

    if (Array.isArray(tags) && tags.length > 0) {
        tags.forEach(tag => {
            const button = document.createElement('button');
            button.className = 'dna-tag-button'; // Class for specific styling in style.css
            button.textContent = tag;
            container.appendChild(button);
        });
    } else {
        container.innerHTML = '<p class="text-xs text-zinc-400">No DNA Tags generated.</p>';
    }
}

function renderSymbolAnchors(anchors) {
    const container = document.getElementById('symbolAnchorsContainer');
    if (!container) return;
    container.innerHTML = ''; // Clear previous anchors

    if (Array.isArray(anchors) && anchors.length > 0) {
        anchors.forEach(anchor => {
            const button = document.createElement('button');
            button.className = 'symbol-anchor-button'; // Class for specific styling in style.css
            button.textContent = anchor;
            container.appendChild(button);
        });
    } else {
        container.innerHTML = '<p class="text-xs text-zinc-400">No Symbol Anchors generated.</p>';
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

        card.innerHTML = `
            <h4>${kit.name || 'VoiceKit ' + (index + 1)}</h4>
            <p><strong>Tone:</strong> ${kit.tone || '-'}</p>
            <p><strong>Archetype:</strong> ${kit.archetype || '-'}</p>
            <p><strong>Saved At:</strong> ${kit.createdAt ? new Date(kit.createdAt).toLocaleString() : '-'}</p>
            ${Array.isArray(kit.dnaTags) && kit.dnaTags.length > 0 ? `<p class="text-xs text-zinc-600 mt-2">DNA: ${kit.dnaTags.join(', ')}</p>` : ''}
            ${Array.isArray(kit.symbolAnchors) && kit.symbolAnchors.length > 0 ? `<p class="text-xs text-zinc-600">Anchors: ${kit.symbolAnchors.join(', ')}</p>` : ''}
            <button data-index="${index}" class="recall-symbolic-kit-button">
                Preview Again
            </button>
            <div class="dna-tag-overlay"> <!-- Styling for this class will be in style.css -->
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
    // Also clear DNA tags and Symbol anchors on initial load or refresh if no kit is active
    renderDNATags([]);
    renderSymbolAnchors([]);
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

    if (outputTone) outputTone.textContent = "⏳ Reflecting...";
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

        const data = await response.json(); 
        console.log("Received data from backend for /api/mirror-voice:", data);

        if (data.error || !response.ok) { 
            const errorMessage = data.error || `HTTP Error: ${response.status} ${response.statusText}`;
            if (outputTone) outputTone.textContent = `❌ Error: ${errorMessage}`;
            if (outputVocabulary) outputVocabulary.textContent = "";
            if (outputArchetype) outputArchetype.textContent = "";
            if (outputPhrasingStyle) outputPhrasingStyle.textContent = "";
            if (outputSamplePhrases) outputSamplePhrases.textContent = "";
            if (outputPhrasesToAvoid) outputPhrasesToAvoid.textContent = "";
            showToast(`Error: ${errorMessage}`, 'error');
        } else {
            currentVoiceKit = data; 
            renderMirroredVoiceOutput(data); 
            showToast("Voice mirrored successfully!", 'success');
            updatePastSignalsSection(); // Update after a new voice is mirrored
        }
    } catch (err) {
        console.error("Mirror voice failed (Network or Uncaught):", err);
        if (outputTone) outputTone.textContent = `❌ Request failed: ${err.message}`;
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
    refreshUIElements();
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
    
    currentVoiceKit = kitData; 
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

    currentVoiceKit = kit;
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
    textContent += `Archetype: ${currentVoiceKit.archetype || 'N/A'}\n`;
    textContent += `Phrasing Style: ${currentVoiceKit.phrasingStyle || 'N/A'}\n`;
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

    if (stylePreviewOutput) stylePreviewOutput.innerHTML = `⏳ Generating ${style} preview...`;

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
            if (stylePreviewOutput) stylePreviewOutput.innerHTML = `❌ Error generating preview: ${data.error}`;
            showToast(`Error generating preview: ${data.error}`, 'error');
        } else {
            if (stylePreviewOutput) stylePreviewOutput.innerHTML = `<p>${data.output}</p>`;
            showToast(`${style} preview generated!`, 'success');
        }
    }
     catch (err) {
        console.error("Multi-style preview generation failed:", err);
        if (stylePreviewOutput) stylePreviewOutput.innerHTML = `❌ Request failed: ${err.message}`;
        showToast(`Preview request failed: ${err.message}`, 'error');
    }
}


async function writeItForMe() {
    const contentInputEl = document.getElementById("contentGenerationInput");
    const contentInput = contentInputEl ? contentInputEl.value.trim() : '';
    
    const contentGenerationStyleSelect = document.getElementById("contentGenerationStyleSelect");
    const style = contentGenerationStyleSelect ? contentGenerationStyleSelect.value : 'general'; 
    
    const generatedContentOutput = document.getElementById("generatedContentOutput");

    if (!currentVoiceKit) {
        if (generatedContentOutput) generatedContentOutput.innerHTML = '<p class="text-red-500">Please mirror your voice first to generate content in your style.</p>';
        showToast("Mirror your voice first.", 'warning');
        return;
    }
    if (!contentInput) {
        showToast("Please enter what you want this to say.", 'warning');
        return;
    }

    if (generatedContentOutput) generatedContentOutput.innerHTML = '⏳ Crafting your content...';

    try {
        const response = await fetch('/api/generate-content', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                kit: currentVoiceKit, 
                style: style, 
                context: contentInput 
            })
        });
        const data = await response.json();

        if (data.error) {
            if (generatedContentOutput) generatedContentOutput.innerHTML = `❌ Error: ${data.error}`;
            showToast(`Error generating content: ${data.error}`, 'error');
        } else {
            if (generatedContentOutput) generatedContentOutput.innerHTML = `<p>${data.output}</p>`;
            showToast("Content crafted!", 'success');
        }
    } catch (err) {
        console.error("Write it for me failed:", err);
        if (generatedContentOutput) generatedContentOutput.innerHTML = `❌ Request failed: ${err.message}`;
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

    // Combine relevant data from selected kits into a single context for the AI
    let combinedInput = "";
    selectedKitData.forEach(kit => {
        combinedInput += `Kit Name: ${kit.name}\n`;
        combinedInput += `Tone: ${kit.tone}\n`;
        combinedInput += `Vocabulary: ${kit.vocabulary}\n`;
        combinedInput += `Phrasing Style: ${kit.phrasingStyle}\n`;
        combinedInput += `Archetype: ${kit.archetype}\n`;
        combinedInput += `DNA Tags: ${Array.isArray(kit.dnaTags) ? kit.dnaTags.join(', ') : kit.dnaTags}\n`;
        combinedInput += `Symbol Anchors: ${Array.isArray(kit.symbolAnchors) ? kit.symbolAnchors.join(', ') : kit.symbolAnchors}\n\n`;
    });

    try {
        const response = await fetch('/api/refine-kits', { // New API endpoint for refinement
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ kits: selectedKitData, combinedInput: combinedInput }) // Send both structured data and combined string
        });
        const data = await response.json();

        if (data.error || !response.ok) {
            const errorMessage = data.error || `HTTP Error: ${response.status} ${response.statusText}`;
            showToast(`Error refining kits: ${errorMessage}`, 'error');
            console.error("Refine kits failed:", data);
        } else {
            // Assuming the AI returns a single, refined voice kit
            currentVoiceKit = data; // Set the refined kit as current
            renderMirroredVoiceOutput(data); // Display the refined kit
            showToast("Kits refined successfully! New kit displayed.", 'success');
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

    const writeItForMeButton = document.getElementById("writeItForMeButton");
    if (writeItForMeButton) writeItForMeButton.addEventListener("click", writeItForMe);

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
            <div class="text-center text-emerald-700 font-semibold text-base fade-slide mb-4">
                Welcome back, Creator. Ready to echo your voice again?
            </div>
        `;
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
