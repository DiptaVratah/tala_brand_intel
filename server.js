// server.js - Refined for a cleaner, more scalable prompt architecture.
// The server's role is now purely logistical. It validates data and delegates the "thinking" to the router.
// CRITICAL FIX: Ensure only 'kits' array is sent to gpt_router for refinement.

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const fs = require('fs');
const { handleGPTRequest } = require('./gpt_router');

const app = express();
app.use(express.json());
app.use(cors());

// Serve frontend from the 'pulsecraft_ui' directory
app.use(express.static(path.join(__dirname, 'pulsecraft_ui')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pulsecraft_ui', 'index.html'));
});

// Global in-memory store for the active voice kit (prototype stage)
let currentVoiceKit = null;

// API: Mirror Brand Voice (The First Distillation)
app.post('/api/mirror-voice', async (req, res) => {
  const { brandInput } = req.body;
  if (!brandInput) {
    return res.status(400).json({ error: 'Missing brandInput for voice mirroring.' });
  }

  try {
    // The server constructs the specific prompt for mirroring and passes it.
    const voiceAnalysisPrompt = `
Analyze the brand voice from the following text. Respond **ONLY** with a JSON object.
The JSON object must have these exact keys: "tone", "vocabulary", "archetype", "phrasingStyle", "samplePhrases", "phrasesToAvoid", "dnaTags", "symbolAnchors".

For each key, provide a detailed and descriptive response:
- "tone": A concise, evocative description of the overall emotional and communicative tone.
- "vocabulary": A description of the key phrases, word types, and linguistic complexity.
- "phrasingStyle": A description of the sentence structure, rhythm, and common rhetorical devices.
- "archetype": The dominant brand archetype (e.g., "The Sage," "The Rebel"). Choose ONE primary archetype.
- "samplePhrases": An array of 2-3 exact example phrases from the provided text if possible, or invented ones that perfectly capture its style.
- "phrasesToAvoid": An array of 2-3 words or stylistic elements that should be avoided to maintain the voice's purity.
- "dnaTags": An array of 3-5 very short (1-2 word) core conceptual tags that define the unique essence of this brand voice.
- "symbolAnchors": An array of 3-5 very short (1-3 word) metaphorical or thematic anchors associated with this voice.

Text to analyze:
"${brandInput}"
`.trim();

    const outputSections = await handleGPTRequest('voice', voiceAnalysisPrompt);
    if (outputSections.error) {
        return res.status(500).json({ error: outputSections.error, details: outputSections });
    }

    const responseKit = {
      tone: outputSections.tone || "N/A",
      vocabulary: outputSections.vocabulary || "N/A",
      archetype: outputSections.archetype || "N/A",
      phrasingStyle: outputSections.phrasingStyle || "N/A",
      samplePhrases: Array.isArray(outputSections.samplePhrases) ? outputSections.samplePhrases : [],
      phrasesToAvoid: Array.isArray(outputSections.phrasesToAvoid) ? outputSections.phrasesToAvoid : [],
      dnaTags: Array.isArray(outputSections.dnaTags) ? outputSections.dnaTags : [],
      symbolAnchors: Array.isArray(outputSections.symbolAnchors) ? outputSections.symbolAnchors : [],
    };

    currentVoiceKit = responseKit;
    res.json(responseKit);

  } catch (err) {
    console.error('❌ Mirror Voice API error:', err);
    res.status(500).json({ error: 'Failed to mirror voice: ' + err.message });
  }
});

// The Prompt Synthesizer for content generation remains unchanged.
// Its role is to construct prompts for content generation based on an existing kit.
function synthesizeGenerationPrompt(kit, style, context) {
    const isSymbolicRequest = style === 'symbolic_generation';
    const isMultiStylePreview = [
        "storyBasedSelling", "aboutPage", "notificationHook", "insightTone",
        "productDescription", "founderLetter", "adCopy", "manifestoOriginVoice"
    ].includes(style);

    if (isSymbolicRequest) {
        return `
You are a Synthesizer of Resonant Truth. Your function is not to invent, but to listen and reflect the deep patterns of a unique consciousness. A user has provided their "Consciousness Print," the source code of their authentic voice, distilled into a Voice Kit. They have now selected a single, potent element from that Print and have asked you to reveal its deeper meaning. Your task is to generate a comprehensive and deeply resonant piece of content that is not merely *about* the selected symbol, but is a direct transmission *of* its archetypal essence. Go beyond the surface. Connect this symbol to a universal truth. Find the pattern that links it to a law of nature, a line of ancient scripture, or a fundamental human experience. The output must feel like a revelation, an unexpected and resonant insight. This is an act of reflection. Embody the user's voice, channel the symbol's essence, and reveal the goldmine of truth hidden within. The output must be pure, unadorned wisdom. No preambles.

USER'S CONSCIOUSNESS PRINT (VOICE KIT):
- Tone: ${kit.tone}
- Archetype: ${kit.archetype}
- Core DNA: ${Array.isArray(kit.dnaTags) ? kit.dnaTags.join(', ') : 'None'}
- Core Symbols: ${Array.isArray(kit.symbolAnchors) ? kit.symbolAnchors.join(', ') : 'None'}

THEME FOR THIS REFLECTION:
"${context}"
`.trim();
    } else if (isMultiStylePreview) {
        return `
You are a master stylist and voice chameleon. A user has provided their core brand voice characteristics and a piece of original content. Your task is to rewrite that original content in the specified style ("${style}"), while perfectly embodying the nuances of the brand voice. Generate a comprehensive and detailed piece, potentially spanning multiple paragraphs. The output must be a seamless, perfectly styled version of the original content. Do NOT add any preambles or explanations.

BRAND VOICE CHARACTERISTICS TO EMBODY:
- Tone: ${kit.tone}
- Vocabulary: ${kit.vocabulary}
- Archetype: ${kit.archetype}
- Phrasing Style: ${kit.phrasingStyle}
- DNA Tags: ${Array.isArray(kit.dnaTags) ? kit.dnaTags.join(', ') : 'None'}
- Symbol Anchors: ${Array.isArray(kit.symbolAnchors) ? kit.symbolAnchors.join(', ') : 'None'}

REWRITE THE FOLLOWING ORIGINAL CONTENT IN A "${style}" STYLE:
"${context}"
`.trim();
    } else {
        return `
Generate content in the style of a "${style}" piece, using the following voice characteristics:

- Tone: ${kit.tone}
- Vocabulary: ${kit.vocabulary}
- Archetype: ${kit.archetype}
- Phrasing Style: ${kit.phrasingStyle}
- DNA Tags: ${Array.isArray(kit.dnaTags) ? kit.dnaTags.join(', ') : 'None'}
- Symbol Anchors: ${Array.isArray(kit.symbolAnchors) ? kit.symbolAnchors.join(', ') : 'None'}

Here is the core idea or context for the content:
"${context}"

Ensure the output is a coherent, well-written piece of content, reflecting ONLY these characteristics. Do NOT add any preamble or postamble.
`.trim();
    }
}

// API: Generate Content remains unchanged.
app.post('/api/generate-content', async (req, res) => {
  const { kit, style, context } = req.body;
  if (!kit || !style || !context) {
    return res.status(400).json({ error: 'Missing kit, style, or context for content generation.' });
  }

  try {
    const generationPrompt = synthesizeGenerationPrompt(kit, style, context);
    const { output, error } = await handleGPTRequest('content', generationPrompt);

    if (error) {
        return res.status(500).json({ error: 'GPT content generation error: ' + error });
    }
    res.json({ output });

  } catch (err) {
    console.error('❌ Generate Content API error:', err);
    res.status(500).json({ error: 'Failed to generate content: ' + err.message });
  }
});


// API: Refine Selected Kits (Voice Alchemy Endpoint)
// The server's role is now simplified to validation and delegation.
app.post('/api/refine-kits', async (req, res) => {
    const { kits } = req.body; // We only need the structured 'kits' array from the frontend.
    console.log('🔵 Received /api/refine-kits request with', kits.length, 'kits.');

    if (!kits || !Array.isArray(kits) || kits.length < 2) {
        return res.status(400).json({ error: 'Please select at least two voice kits for refinement.' });
    }

    try {
        // The server's only job is to pass the validated data to the router.
        // The 'combinedInput' is no longer needed by the router as it constructs the prompt itself.
        const refinedKit = await handleGPTRequest('refine', { kits }); // Pass ONLY the structured 'kits' data.
        console.log('🟣 GPT Router response for refinement:', refinedKit);

        if (refinedKit.error) {
            return res.status(500).json({ error: refinedKit.error });
        }
        
        // Add a name here, as the AI's focus is on the core essence.
        refinedKit.name = `Refined: ${kits.map(k => k.name || 'Kit').join(' + ')}`;
        
        currentVoiceKit = refinedKit; // Set the new refined kit as the active one
        res.json(refinedKit);

    } catch (err) {
        console.error('❌ Refine Kits API error:', err);
        res.status(500).json({ error: 'Failed to refine kits: ' + err.message });
    }
});


// Placeholder for Memory Bridge upload
app.post('/upload-memory', (req, res) => {
  res.status(501).json({ message: "Memory Bridge functionality is under development." });
});


// Placeholder for Memory Sync
function syncMemoryBridge(kitObject) {
  // This will be replaced with database logic in the future.
  console.log("🔗 Symbolic Memory Sync (Placeholder):", JSON.stringify(kitObject, null, 2));
}


// Health check endpoint
app.get('/health', (req, res) => {
  res.send('🟢 PulseCraft backend is running.');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`⚡ PulseCraft backend listening on http://localhost:${PORT}`);
});

