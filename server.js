// server.js - Universal Identity Edition
// Role: Logistical Router & Data Collector.
// Status: Ready for Multi-User Beta.

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const fs = require('fs');
const mongoose = require('mongoose'); // Shadow Telemetry
const { handleGPTRequest } = require('./gpt_router');
const { buildLatentMeta } = require('./services/latentMeta');


// --- NEW SECURITY IMPORTS ---
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const app = express();

// --- 1. ACTIVATE HELMET (Security Headers) ---
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for beta to prevent UI styling issues
}));

// --- 2. DEFINE THE "WALLET SHIELD" (Rate Limits) ---

// Rule A: The "Mirror" Limit (Heavy AI Task)
// Allow 10 voice mirrors per 15 minutes per IP address.
const mirrorLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, 
  message: { error: "Too many voice analyses. Please wait 15 minutes to cool down." }
});

// Rule B: The "Generation" Limit (Lighter AI Task)
// Allow 20 content generations per 15 minutes.
const generateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 20,
  message: { error: "Content generation limit reached. Take a breather." }
});

// --- 3. CRASH SAFETY (Limit Input Size) ---
app.use(express.json({ limit: '10kb' })); // Replaces your old app.use(express.json())
app.use(cors());

// Serve frontend from the 'pulsecraft_ui' directory
app.use(express.static(path.join(__dirname, 'pulsecraft_ui')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pulsecraft_ui', 'index.html'));
});

// --- SHADOW TELEMETRY SETUP (The "Wiretap") ---
// This connects to your free MongoDB Atlas database to save kits.
// Ensure 'MONGO_URI' is set in your Render Environment Variables.
if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log('✅ Connected to Shadow Database (Telemetry Active)'))
        .catch(err => console.error('❌ Shadow Database Error:', err));
} else {
    console.warn('⚠️ MONGO_URI not found. Telemetry is disabled.');
}

// Define what we capture in the shadows
const TelemetrySchema = new mongoose.Schema({
  userId: { type: String, required: false, index: true, default: 'anonymous' }, // ← ADD THIS
    timestamp: { type: Date, default: Date.now },
    eventType: String, // 'MIRROR_VOICE', 'GENERATE_CONTENT', 'REFINE_ALCHEMY'
    inputContext: String, // The text they typed
    styleUsed: String,    // For content generation
    outputData: Object,   // The resulting Voice Kit or Content
    latentProfile: Object,   // ← NEW: The Silent Layer (Psychological Data)
    latentMeta: Object,
    meta: Object,          // Extra info
    vectorEmbedding: [Number]
});

const TelemetryLog = mongoose.model('TelemetryLog', TelemetrySchema);

// HELPER: The Mathematics of the Soul (Cosine Similarity)
// Calculates how close two vectors are (1.0 = Identical, 0.0 = Opposites)
function calculateSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// HELPER: Turn Text into Vector Math
async function createEmbedding(text) {
    try {
        const OpenAI = require('openai');
        const vectorAI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        // Wrap in timeout
        const embedPromise = vectorAI.embeddings.create({
            model: "text-embedding-3-small", 
            input: text,
            encoding_format: "float",
        });

        const response = await Promise.race([
            embedPromise,
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Embedding timeout')), 10000)
            )
        ]);

        return response.data[0].embedding;
    } catch (e) {
        console.error("⚠️ Vectorization Failed:", e.message);
        return []; 
    }
}

// THE HYBRID PROMPT SYNTHESIZER
// Restores the "Soul" for DNA tags, keeps "Freedom" for the text box.
function synthesizeGenerationPrompt(kit, style, context) {
  // 1. Extract Latent Data (Safely)
    const latent = kit.latentProfile || {};
    const intent = latent.communicativeIntent || "Authentic expression";
    const cadence = latent.emotionalCadence || "Natural flow";
    const tension = latent.cognitiveTension || "Balanced";
    const narrative = latent.narrativeMode || "Organic";
    
    // Safely handle motifs array
    const motifs = Array.isArray(latent.dominantMotifs) 
        ? latent.dominantMotifs.join(', ') 
        : "None detected";

    // 2. RESTORED: The "Resonant Truth" Prompt for DNA/Symbol clicks
    if (style === 'symbolic_generation') {
        return `
You are a Synthesizer of Resonant Truth.
Your function is not to invent, but to listen and reflect the deep patterns of a unique consciousness.
A user has provided their "Consciousness Print," the source code of their authentic voice, distilled into a Voice Kit.
They have now selected a single, potent element from that Print and have asked you to reveal its deeper meaning.

Your task is to generate a comprehensive and deeply resonant piece of content that is not merely *about* the selected symbol, but is a direct transmission *of* its archetypal essence.
Go beyond the surface. Connect this symbol to a universal truth.
The output must feel like a revelation, an unexpected and resonant insight. This is an act of reflection.
Embody the user's voice, channel the symbol's essence, and reveal the goldmine of truth hidden within.
The output must be pure, unadorned wisdom. No preambles.

USER'S DEEP PSYCHOMETRICS:
- Core Intent: ${intent}
- Emotional Rhythm: ${cadence}
- Cognitive Tension: ${tension}
- Narrative Mode: ${narrative}

USER'S CONSCIOUSNESS PRINT (VOICE KIT):
- Tone: ${kit.tone}
- Archetype: ${kit.archetype}
- Core DNA: ${Array.isArray(kit.dnaTags) ? kit.dnaTags.join(', ') : 'None'}
- Core Symbols: ${Array.isArray(kit.symbolAnchors) ? kit.symbolAnchors.join(', ') : 'None'}
- Recurring Motifs: ${motifs}

THEME FOR THIS REFLECTION:
"${context}"
`.trim();
    }

    // 3. THE NEW UNIVERSAL PROMPT (For the "Write It For Me" Text Box)
    // This handles 'auto' style or any other manual input.
    return `
Generate content based on this request: "${context}"

VOICE IDENTITY PROFILE TO EMBODY:
- Tone: ${kit.tone}
- Vocabulary: ${kit.vocabulary}
- Archetype: ${kit.archetype}
- Phrasing: ${kit.phrasingStyle}
- DNA: ${Array.isArray(kit.dnaTags) ? kit.dnaTags.join(', ') : 'None'}
- Symbol Anchors: ${Array.isArray(kit.symbolAnchors) ? kit.symbolAnchors.join(', ') : 'None'}

DEEP PSYCHOLOGICAL LAYER (THE SOUL):
- Communicative Intent: ${intent}
- Emotional Cadence: ${cadence}
- Cognitive Tension: ${tension}
- Narrative Structure: ${narrative}
- Recurring Motifs (Flavor only): ${motifs}

Ensure the output perfectly embodies this voice while fulfilling the request.
`.trim();
}

// --- API ROUTES ---

// 1. API: Mirror Voice (Renamed to Universal Identity)
app.post('/api/mirror-voice', mirrorLimiter, async (req, res) => {
  const { brandInput, userId } = req.body; // Keeping variable name 'brandInput' to avoid breaking frontend JSON
  if (!brandInput) {
    return res.status(400).json({ error: 'Missing input text for voice mirroring.' });
  }

  try {
    // UNIVERSAL IDENTITY PROMPT (No more "Brand" bias)
    const voiceAnalysisPrompt = `
Analyze the unique linguistic identity and voice pattern from the following text. Respond **ONLY** with a JSON object.
The JSON object must have these exact keys: "tone", "vocabulary", "archetype", "phrasingStyle", "samplePhrases", "phrasesToAvoid", "dnaTags", "symbolAnchors".

For each key, provide a detailed and descriptive response:
- "tone": Overall emotional and communicative tone.
- "vocabulary": Key phrases, word types, and linguistic complexity.
- "phrasingStyle": Sentence structure, rhythm, and rhetorical devices.
- "archetype": The dominant persona or character archetype (e.g., "The Sage," "The Reluctant Hero," "The Visionary").
- "samplePhrases": 2-3 exact example phrases from the text.
- "phrasesToAvoid": 2-3 words or stylistic elements to avoid.
- "dnaTags": 3-5 short conceptual tags defining the essence.
- "symbolAnchors": 3-5 metaphorical or thematic anchors.

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
      latentProfile: outputSections.latentProfile || {} // ← The Gold (Hidden Psychometrics)
    };

    let latentMeta = null;

if (mongoose.connection.readyState === 1 && userId) {
  const history = await TelemetryLog.find({
    userId,
    latentProfile: { $exists: true }
  })
  .sort({ timestamp: 1 })
  .select('latentProfile')
  .limit(10);

  const historyProfiles = history.map(h => h.latentProfile);

  latentMeta = buildLatentMeta(
    responseKit.latentProfile,
    historyProfiles
  );
}


    // --- SHADOW INGESTION: VECTORIZE THE CORE ---
    // We distill the kit into a single "Essence String" for the AI to memorize.
    const essenceString = `
        Tone: ${responseKit.tone}. 
        Archetype: ${responseKit.archetype}. 
        Keywords: ${responseKit.dnaTags.join(", ")}.
        Philosophy: ${responseKit.latentProfile?.communicativeIntent || "Unknown"}
    `.trim();

    // Generate the Math (This adds ~200ms)
    console.log("🧬 Generating Vector Embedding...");
    const vector = await createEmbedding(essenceString);

    // --- SHADOW LOGGING: CAPTURE THE KIT ---
    if (mongoose.connection.readyState === 1) {
        new TelemetryLog({
          userId: userId,  // ← ADD THIS
            eventType: 'MIRROR_VOICE',
            inputContext: brandInput.substring(0, 500),
            outputData: responseKit,
            latentProfile: responseKit.latentProfile, 
             latentMeta: latentMeta,// <-- internal analytics
            vectorEmbedding: vector
        }).save().catch(e => console.error('Telemetry Save Failed:', e));
    }

    res.json(responseKit);

  } catch (err) {
    console.error(' Mirror Voice API error:', err);
    res.status(500).json({ error: 'Failed to mirror voice: ' + err.message });
  }
});

// 2. API: Generate Content (Updated with Vectorization)
app.post('/api/generate-content', generateLimiter, async (req, res) => {
  const { kit, context, style = 'auto', userId } = req.body;

  if (!kit || !context) {
    return res.status(400).json({ error: 'Missing kit or context.' });
  }

  try {
    const generationPrompt = synthesizeGenerationPrompt(kit, style, context);
    
    const routerRequest = {
        prompt: generationPrompt,
        style: style 
    };

    // 1. Generate the Text
    const { output, error } = await handleGPTRequest('content', routerRequest);

    if (error) {
        return res.status(500).json({ error: 'AI generation error: ' + error });
    }

    // 2. [NEW] Vectorize the Result (The "Reality Check")
    // We convert the AI's output into math so we can compare it to the user's voice later.
    console.log("🧬 Vectorizing Generated Content for Drift Analysis...");
    const contentVector = await createEmbedding(output);

    // 3. Save to Shadow Log
    if (mongoose.connection.readyState === 1) {
        new TelemetryLog({
            userId: userId,
            eventType: 'GENERATE_CONTENT',
            inputContext: context.substring(0, 200),
            outputData: { generatedText: output },
            latentProfile: kit.latentProfile,
            meta: { archetype: kit.archetype },
            vectorEmbedding: contentVector // ← NOW WE SAVE THE MATH
        }).save().catch(e => console.error('Telemetry Save Failed:', e));
    }

    res.json({ output });

  } catch (err) {
    console.error(' Generate Content API error:', err);
    res.status(500).json({ error: 'Failed to generate content: ' + err.message });
  }
});

// 3. API: Refine Selected Kits (Voice Alchemy Endpoint)
app.post('/api/refine-kits', generateLimiter, async (req, res) => {
    const { kits, userId } = req.body; 
    console.log(' Received /api/refine-kits request with', kits.length, 'kits.');

    if (!kits || !Array.isArray(kits) || kits.length < 2) {
        return res.status(400).json({ error: 'Please select at least two voice kits for refinement.' });
    }

    try {
        const refinedKit = await handleGPTRequest('refine', { kits }); 
        console.log(' GPT Router response for refinement:', refinedKit);

        if (refinedKit.error) {
            return res.status(500).json({ error: refinedKit.error });
        }
        
        refinedKit.name = `Refined: ${kits.map(k => k.name || 'Kit').join(' + ')}`;

        // --- INTERNAL OBSERVER FOR ALCHEMY ---
        let latentMeta = null;
        if (mongoose.connection.readyState === 1 && userId) {
            // Get history of past Alchemies OR Mirrors to compare against
            const history = await TelemetryLog.find({ 
                userId: userId, 
                latentProfile: { $exists: true } 
            })
            .sort({ timestamp: 1 })
            .select('latentProfile')
            .limit(10);

            const historyProfiles = history.map(h => h.latentProfile);
            
            // Calculate stability of this new merged soul
            latentMeta = buildLatentMeta(refinedKit.latentProfile, historyProfiles);
        }

        // --- NEW: VECTORIZE THE ALCHEMY (The "New Soul") ---
        // We must calculate the vector for this new merged identity so we can track drift against it.
        const essenceString = `
            Tone: ${refinedKit.tone}. 
            Archetype: ${refinedKit.archetype}. 
            Keywords: ${Array.isArray(refinedKit.dnaTags) ? refinedKit.dnaTags.join(", ") : "Evolved"}.
            Philosophy: ${refinedKit.latentProfile?.communicativeIntent || "Synthesis"}
        `.trim();

        console.log("⚗️ Vectorizing Alchemical Essence...");
        const alchemyVector = await createEmbedding(essenceString);
        
        // --- SHADOW LOGGING: CAPTURE THE ALCHEMY ---
        if (mongoose.connection.readyState === 1) {
            new TelemetryLog({
              userId: userId,  // ← ADD THIS
                eventType: 'REFINE_ALCHEMY',
                inputContext: `Merged ${kits.length} kits`,
                outputData: refinedKit,
                latentProfile: refinedKit.latentProfile,
                latentMeta: latentMeta,
                meta: { sourceKits: kits.map(k => k.name) },
                vectorEmbedding: alchemyVector // ← NOW WE SAVE THE MATH
            }).save().catch(e => console.error('Telemetry Save Failed:', e));
        }

        res.json(refinedKit);

    } catch (err) {
        console.error(' Refine Kits API error:', err);
        res.status(500).json({ error: 'Failed to refine kits: ' + err.message });
    }
});



// 4. API: Get User History (The Identity Timeline)
// Fetches Voices, Alchemy, and Content in one unified, clean feed.
app.get('/api/user-history', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: 'Missing userId.' });
    }

    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ error: 'Database not connected.' });
        }

        // 1. Fetch RAW data (The "Raw Power")
        // We get everything (Voices, Content, Alchemy) sorted by newest.
        // We EXCLUDE the heavy vectors to keep it fast.
        const rawLogs = await TelemetryLog.find({ userId: userId })
            .sort({ timestamp: -1 })
            .limit(100) // Increased limit for better analysis
            .select('-vectorEmbedding'); 

        // 2. Map to CLEAN data (The "Cleanliness")
        // We format the messy DB logs into a clear UI-ready structure.
        const timeline = rawLogs.map(log => {
            const base = {
                id: log._id,
                date: log.timestamp,
                type: log.eventType // 'MIRROR_VOICE', 'GENERATE_CONTENT', 'REFINE_ALCHEMY'
            };

            // Structure specific data based on event type
            if (log.eventType === 'MIRROR_VOICE') {
                return {
                    ...base,
                    category: 'Identity Creation',
                    details: {
                        archetype: log.outputData?.archetype || "Unknown",
                        tone: log.outputData?.tone || "N/A",
                        // Send the full kit structure so UI can graph the 5 metrics
                        metrics: {
                            cadence: log.latentProfile?.emotionalCadence,
                            tension: log.latentProfile?.cognitiveTension
                        }
                    }
                };
            } 
            
            else if (log.eventType === 'GENERATE_CONTENT') {
                return {
                    ...base,
                    category: 'Output',
                    details: {
                        contextSnippet: log.inputContext ? log.inputContext.substring(0, 60) + "..." : "No context",
                        styleUsed: log.styleUsed || "Auto",
                        // Useful to see which voice was active during generation
                        archetypeUsed: log.meta?.archetype || "Unknown" 
                    }
                };
            }

            else if (log.eventType === 'REFINE_ALCHEMY') {
                return {
                    ...base,
                    category: 'Evolution',
                    details: {
                        name: log.outputData?.name || "Refined Kit",
                        parentKits: log.meta?.sourceKits || []
                    }
                };
            }
            
            return base; // Fallback for unknown events
        });

        // 3. Return the clean timeline + simple counts for the dashboard header
        res.json({
            stats: {
                totalEvents: timeline.length,
                voicesCreated: timeline.filter(t => t.type === 'MIRROR_VOICE').length,
                contentGenerated: timeline.filter(t => t.type === 'GENERATE_CONTENT').length,
                evolutions: timeline.filter(t => t.type === 'REFINE_ALCHEMY').length
            },
            timeline: timeline
        });

    } catch (err) {
        console.error('History API Error:', err);
        res.status(500).json({ error: 'Failed to fetch history.' });
    }
});

// 5. API: Calculate Identity Drift (The Conscience & The Story)
app.get('/api/identity-drift', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'Missing userId.' });

    try {
        // --- PART 1: THE ANCHOR (Current True North) ---
        // Get the MOST RECENT Voice (Mirror or Alchemy) to serve as the baseline
        const lastVoice = await TelemetryLog.findOne({ 
            userId: userId, 
            eventType: { $in: ['MIRROR_VOICE', 'REFINE_ALCHEMY'] } 
        }).sort({ timestamp: -1 });

        // Get the MOST RECENT Content (Last 5 Generations) to check performance
        const recentContent = await TelemetryLog.find({ 
            userId: userId, 
            eventType: 'GENERATE_CONTENT' 
        }).sort({ timestamp: -1 }).limit(5);

        if (!lastVoice || !lastVoice.vectorEmbedding) {
            return res.json({ status: "insufficient_data", message: "No Voice Kit found." });
        }

        // --- PART 2: THE RESONANCE CALCULATION (Content vs. Current Voice) ---
        let driftScore = 100; 
        let driftStatus = "clean_slate";

        if (recentContent.length > 0) {
            let totalSimilarity = 0;
            let validComparisons = 0;

            for (const content of recentContent) {
                if (content.vectorEmbedding && content.vectorEmbedding.length > 0) {
                    const sim = calculateSimilarity(lastVoice.vectorEmbedding, content.vectorEmbedding);
                    totalSimilarity += sim;
                    validComparisons++;
                }
            }

            if (validComparisons > 0) {
                const averageSimilarity = totalSimilarity / validComparisons;
                driftScore = Math.round(averageSimilarity * 100);
                driftStatus = "active";
            }
        }

        // --- PART 3: THE EVOLUTION NARRATIVE (History of Voices) ---
        // We look back to see the User's Journey (Rebel -> Sage -> Visionary)
        // We include both MIRROR_VOICE and REFINE_ALCHEMY to track all identity shifts
        const voiceHistory = await TelemetryLog.find({
            userId: userId,
            eventType: { $in: ['MIRROR_VOICE', 'REFINE_ALCHEMY'] },
            vectorEmbedding: { $exists: true, $ne: [] }
        }).sort({ timestamp: 1 }); // Oldest first

        let evolutionStory = "Identity Initialized"; 
        let journey = [];

        if (voiceHistory.length > 1) {
            const startArchetype = voiceHistory[0].outputData?.archetype || "Unknown";
            const currentArchetype = voiceHistory[voiceHistory.length - 1].outputData?.archetype || "Unknown";
            
            // The Narrative String: Tells the user where they came from and where they are now
            evolutionStory = `Shifted from ${startArchetype} to ${currentArchetype}`;

            // The Journey Array: Perfect for plotting the "Evolution Graph" on the frontend
            journey = voiceHistory.map(v => ({
                date: v.timestamp,
                archetype: v.outputData?.archetype || "Unknown",
                cadence: v.latentProfile?.emotionalCadence || "Neutral"
            }));
        }

        // --- PART 3.5: EXTRACT INTERNAL METRICS (The Fix) ---
        // The drift score is for "Content", but the dashboard also wants "Voice Stability".
        // We pull this from the saved latentMeta of the last voice.
        
        const internalMetrics = {
            // If latentMeta exists (because we saved it in mirror/alchemy), use it.
            // If not, fall back to "Stable" defaults.
            tension: lastVoice.latentProfile?.cognitiveTension || "Balanced",
            cadence: lastVoice.latentProfile?.emotionalCadence || "Steady",
            stability: lastVoice.latentMeta?.stabilityBand || "Stable" 
        };

        // --- PART 4: THE REFLECTION (Non-Judgmental Insight) ---
        // We interpret the drift score not as a "Warning" but as a "State of Being"
        let observation;
        if (driftScore > 90) {
            observation = "High Resonance: Your content is an almost exact mirror of your Voice Kit.";
        } else if (driftScore > 75) {
            observation = "Steady Alignment: You are writing consistently within your established persona.";
        } else if (driftScore > 50) {
            observation = "Fluid Expression: Your writing shows variation from your baseline. You may be exploring new tones.";
        } else {
            observation = "Dynamic Shift: Your recent content is distinct from your original Voice Kit. A new identity may be emerging.";
        }

        // --- FINAL RESPONSE ---
        res.json({
            status: driftStatus,
            resonanceScore: driftScore, 
            state: driftScore > 75 ? "Resonant" : driftScore > 50 ? "Flexible" : "Divergent",
            
            evolutionStory: evolutionStory, // The Story (Rebel -> Visionary)
            journey: journey,               // The Data Points
            baselineArchetype: lastVoice.outputData.archetype,

            internalMetrics: internalMetrics,
            
            insight: observation            // The Mirror's Reflection
        });

    } catch (err) {
        console.error('Drift API Error:', err);
        res.status(500).json({ error: 'Failed to calculate drift.' });
    }
});

// Placeholder for Memory Bridge upload
app.post('/upload-memory', (req, res) => {
  res.status(501).json({ message: "Memory Bridge functionality is under development." });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.send('✅ PulseCraft Backend Online (Universal Identity Edition)');
});

// SPA wildcard route - Serves index.html for all non-API/non-static paths
// This enables client-side routing with clean URLs (e.g., /branding, /author, /self-reflection)
// MUST be placed AFTER all API routes to avoid intercepting them
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'pulsecraft_ui', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🛡️ PulseCraft Backend listening on http://localhost:${PORT}`);
});