const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const fs = require('fs');
const { handleGPTRequest } = require('./gpt_router');

const app = express();
app.use(express.json());
app.use(cors());

// 🔷 Serve frontend from public folder
app.use(express.static(path.join(__dirname, 'pulsecraft_ui')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pulsecraft_ui', 'index.html'));
});



// 🧠 Temporary in-memory store
let currentVoiceKit = null;

// 🟢 API: Reflect Brand Voice
app.post('/api/brand-voice', async (req, res) => {
  const { brandInput, kit } = req.body;
  console.log('🔵 Received brandInput:', brandInput);

  if (!brandInput) return res.status(400).json({ error: 'Missing prompt' });

  // 🪶 Prompt base
  let prompt = `Analyze the following voice and extract its brand tone, archetype, and phrasing:\n\n${brandInput}`;

  // 🎯 Add tone shaping if kit is recalled
  if (kit && kit.tone) {
    switch (kit.tone) {
      case "Bold, Inspirational, Nonconformist":
        prompt += `\n\nUse a rebellious, inspiring voice. Challenge the status quo.`;
        break;
      case "Warm, Supportive, Empathetic":
        prompt += `\n\nUse a kind, warm tone that makes the reader feel safe and understood.`;
        break;
      case "Witty, Clever, High-Attention":
        prompt += `\n\nWrite with sharp wit and clever phrasing. Keep it engaging and unexpected.`;
        break;
      case "Elegant, Refined, Understated":
        prompt += `\n\nMaintain a calm, elegant tone with rich vocabulary and minimal clutter.`;
        break;
    }
  }

  try {
    const { outputSections } = await handleGPTRequest('voice', prompt);
    console.log('🟣 Sending back to frontend:', outputSections);

    // ✨ Format output cleanly
    const response = {
      tone: outputSections["Tone"],
      vocabulary: outputSections["Vocabulary"],
      archetype: outputSections["Archetype"],
      phrasingStyle: outputSections["Phrasing Style"],
      samplePhrases: outputSections["Sample Phrases"],
      phrasesToAvoid: outputSections["Phrases to Avoid"]
    };

    currentVoiceKit = response; // 🔐 Store for export
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: 'OpenAI error: ' + err.message });
  }
});

// 🔹 Upload Route Stub (Memory Bridge)
app.post('/upload-memory', (req, res) => {
  const kit = req.body;
  syncMemoryBridge(kit);  // 🧠 Call symbolic memory sync
  res.status(200).json({ message: "✅ Symbolic kit memory received and processed." });
});


// 🌐 API: Dual-Channel GPT Router (Live + Recall)
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Missing prompt in request.' });

    const { output } = await handleGPTRequest("preview_card", prompt);
    res.json({ output });
  } catch (err) {
    console.error("❌ GPT generate error:", err);
    res.status(500).json({ error: 'Failed to process generate request.' });
  }
});


app.post('/save-voice-kit', (req, res) => {
  try {
    const { name, rawInput, previewHTML } = req.body;

    if (!name || !rawInput || !previewHTML) {
      return res.status(400).json({ error: "Missing fields in voice kit" });
    }

    currentVoiceKit = {
      name,
      rawInput,
      previewHTML,
      createdAt: new Date().toISOString()
    };

    console.log("✅ Voice kit saved:", currentVoiceKit.name);
    res.json({ success: true, message: "Voice kit saved successfully." });

  } catch (err) {
    console.error("❌ Failed to save voice kit:", err);
    res.status(500).json({ error: "Internal error while saving voice kit." });
  }
});

// 🔹 Export Route – Return currentVoiceKit as JSON
app.get('/export-voice-json', (req, res) => {
  if (!currentVoiceKit) {
    return res.status(404).json({ error: "No voice kit available to export." });
  }
  res.json(currentVoiceKit);
});
// 🔊 NEW: Reflect My Voice — this will feed the Mirror My Voice feature directly
app.post('/api/reflect-voice', async (req, res) => {
  try {
    const { brandInput } = req.body;
    if (!brandInput) return res.status(400).json({ error: 'Missing brandInput' });

    const { outputSections } = await handleGPTRequest('voice', brandInput);
    res.json({
      tone: outputSections['Tone'],
      vocabulary: outputSections['Vocabulary'],
      archetype: outputSections['Archetype'],
      phrasingStyle: outputSections['Phrasing Style'],
      samplePhrases: outputSections['Sample Phrases'],
      phrasesToAvoid: outputSections['Phrases to Avoid']
    });
  } catch (err) {
    console.error('❌ Reflect My Voice error:', err);
    res.status(500).json({ error: 'Failed to process voice reflection.' });
  }
});

// 🔸 Memory Sync Placeholder (future multi-kit logic here)
function syncMemoryBridge(kitObject) {
  if (!kitObject || typeof kitObject !== 'object') {
    console.error("🛑 Invalid kit object received in syncMemoryBridge.");
    return;
  }

  // Attach symbolic metadata
  const enrichedKit = {
    ...kitObject,
    symbolicMeta: {
      frequency: "alpha-prime",  // Placeholder – will route via tone/archetype later
      mirroredBy: "Dipta Vratah Anantagah",
      timestamp: new Date().toISOString(),
      kitHash: `KIT_${Date.now().toString(36)}`,
    }
  };

  // Save it to a symbolic folder (or log for now)
  console.log("🔗 Symbolic Memory Sync:", JSON.stringify(enrichedKit, null, 2));
  
  // (Optional) store to file or DB later
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
