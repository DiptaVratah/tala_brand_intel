// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const fs = require('fs');
const { handleGPTRequest } = require('./gpt_router'); // Ensure gpt_router.js is in the same directory

const app = express();
app.use(express.json());
app.use(cors());

// 🔷 Serve frontend from public folder (assuming 'pulsecraft_ui' is where your index.html and script.js reside)
app.use(express.static(path.join(__dirname, 'pulsecraft_ui')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pulsecraft_ui', 'index.html'));
});

// 🧠 Global in-memory store for the *currently active* voice kit on the server side (for single-user context)
let currentVoiceKit = null;

// 🟢 API: Mirror Brand Voice (Unified endpoint for voice analysis)
app.post('/api/mirror-voice', async (req, res) => {
  const { brandInput } = req.body;
  console.log('🔵 Received /api/mirror-voice request with input:', brandInput);

  if (!brandInput) {
    return res.status(400).json({ error: 'Missing brandInput for voice mirroring.' });
  }

  try {
    // IMPORTANT: The 'voice' type in handleGPTRequest MUST be configured in gpt_router.js
    // to prompt the LLM for dnaTags and symbolAnchors and parse them.
    const outputSections = await handleGPTRequest('voice', brandInput);
    console.log('🟣 GPT Router response for mirroring:', outputSections);

    // Ensure all expected fields, including new DNA Tags and Symbol Anchors, are present
    const requiredFields = [
      "tone", "vocabulary", "archetype", "phrasingStyle",
      "samplePhrases", "phrasesToAvoid", "dnaTags", "symbolAnchors" // Added new fields
    ];
    const missingFields = requiredFields.filter(field => !outputSections[field]);

    if (missingFields.length > 0) {
        console.warn(`GPT response missing expected fields: ${missingFields.join(', ')}`);
        // If parsing error happened in gpt_router and it returned N/A fields
        if (outputSections.error) {
            return res.status(500).json({ error: outputSections.error, details: outputSections });
        }
        // If some fields are missing but no critical error, proceed with available data
    }

    const responseKit = {
      tone: outputSections["tone"] || "N/A",
      vocabulary: outputSections["vocabulary"] || "N/A",
      archetype: outputSections["archetype"] || "N/A",
      phrasingStyle: outputSections["phrasingStyle"] || "N/A",
      // Ensure these are arrays, even if the LLM returns a string or single item
      samplePhrases: Array.isArray(outputSections["samplePhrases"]) ? outputSections["samplePhrases"] : (outputSections["samplePhrases"] ? [outputSections["samplePhrases"]] : []),
      phrasesToAvoid: Array.isArray(outputSections["phrasesToAvoid"]) ? outputSections["phrasesToAvoid"] : (outputSections["phrasesToAvoid"] ? [outputSections["phrasesToAvoid"]] : []),
      // NEW: Add DNA Tags and Symbol Anchors, ensuring they are arrays
      dnaTags: Array.isArray(outputSections["dnaTags"]) ? outputSections["dnaTags"] : (outputSections["dnaTags"] ? [outputSections["dnaTags"]] : []),
      symbolAnchors: Array.isArray(outputSections["symbolAnchors"]) ? outputSections["symbolAnchors"] : (outputSections["symbolAnchors"] ? [outputSections["symbolAnchors"]] : []),
    };

    currentVoiceKit = responseKit; // 🔐 Store on server for export/content generation
    res.json(responseKit);

  } catch (err) {
    console.error('❌ Mirror Voice API error:', err);
    res.status(500).json({ error: 'Failed to mirror voice: ' + err.message });
  }
});

// 🌐 API: Generate Content based on Voice Kit
app.post('/api/generate-content', async (req, res) => {
  const { kit, style, context } = req.body;
  console.log(`🔵 Received /api/generate-content request for style: ${style}, context: ${context}`);

  if (!kit || !style || !context) {
    return res.status(400).json({ error: 'Missing kit, style, or context for content generation.' });
  }

  // Ensure kit values are accessed with lowercase keys here as well
  // Also pass DNA Tags and Symbol Anchors to the content generation prompt
  let generationPrompt = `
Generate content in the style of a "${style}" piece, using the following voice characteristics:

Tone: ${kit.tone}
Vocabulary: ${kit.vocabulary}
Archetype: ${kit.archetype}
Phrasing Style: ${kit.phrasingStyle}
Sample Phrases: ${Array.isArray(kit.samplePhrases) ? kit.samplePhrases.join(', ') : kit.samplePhrases}
Phrases to Avoid: ${Array.isArray(kit.phrasesToAvoid) ? kit.phrasesToAvoid.join(', ') : kit.phrasesToAvoid}
DNA Tags: ${Array.isArray(kit.dnaTags) ? kit.dnaTags.join(', ') : kit.dnaTags || 'None'}
Symbol Anchors: ${Array.isArray(kit.symbolAnchors) ? kit.symbolAnchors.join(', ') : kit.symbolAnchors || 'None'}

Here is the core idea or context for the content:
"${context}"

Ensure the output is a coherent, well-written piece of content, reflecting ONLY these characteristics. Do NOT add any preamble or postamble.
`.trim();

  try {
    const { output, error } = await handleGPTRequest('content', generationPrompt); // Capture error from gpt_router
    if (error) {
        return res.status(500).json({ error: 'GPT content generation error: ' + error });
    }
    res.json({ output });
  } catch (err) {
    console.error('❌ Generate Content API error:', err);
    res.status(500).json({ error: 'Failed to generate content: ' + err.message });
  }
});


// 🔹 Upload Route Stub (Memory Bridge) - This seems related to external memory upload
app.post('/upload-memory', (req, res) => {
  const kit = req.body;
  syncMemoryBridge(kit); // 🧠 Call symbolic memory sync
  res.status(200).json({ message: "✅ Symbolic kit memory received and processed." });
});


// 🔹 Export Route – Return currentVoiceKit as JSON
app.get('/export-voice-json', (req, res) => {
  if (!currentVoiceKit) {
    return res.status(404).json({ error: "No voice kit available to export." });
  }
  res.json(currentVoiceKit);
});


// 🔸 Memory Sync Placeholder (future multi-kit logic here)
function syncMemoryBridge(kitObject) {
  if (!kitObject || typeof kitObject !== 'object') {
    console.error("🛑 Invalid kit object received in syncMemoryBridge.");
    return;
  }

  // Attach symbolic metadata - this is currently just logging, not persistent storage
  const enrichedKit = {
    ...kitObject,
    symbolicMeta: {
      frequency: "alpha-prime",
      mirroredBy: "Dipta Vratah Anantagah",
      timestamp: new Date().toISOString(),
      kitHash: `KIT_${Date.now().toString(36)}`,
    }
  };

  console.log("🔗 Symbolic Memory Sync:", JSON.stringify(enrichedKit, null, 2));
  // Future: Here you would integrate with a persistent storage solution (e.g., database, file system)
}


// ✅ Health check
app.get('/health', (req, res) => {
  res.send('🟢 PulseCraft backend is running.');
});

// 🚀 Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`⚡ PulseCraft backend listening on http://localhost:${PORT}`);
});
