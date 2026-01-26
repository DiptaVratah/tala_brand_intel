// gpt_router.js - Multi-AI Orchestration Edition (Fixed Dec 2025 Models)
// Orchestrates OpenAI (GPT-4o), Anthropic (Claude 4 Sonnet), Google (Gemini 2.5 Pro)
// based on task type and style. Preserves v4 prompts/post-processing.

require('dotenv').config();
const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Clients
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// --- NEW: RETRY LOGIC HELPER ---
async function withRetry(fn, retries = 3, delay = 1000) {
    try {
        return await fn();
    } catch (err) {
        if (retries === 0) throw err;
        console.warn(`⚠️ API call failed. Retrying in ${delay}ms... (${retries} left)`);
        await new Promise(res => setTimeout(res, delay));
        return withRetry(fn, retries - 1, delay * 2); // Exponential backoff (1s, 2s, 4s)
    }
}

// Voice Analysis Schema (Unchanged)
const voiceAnalysisSchema = {
    type: "OBJECT",
    properties: {
        tone: { type: "STRING" },
        vocabulary: { type: "STRING" },
        phrasingStyle: { type: "STRING" },
        archetype: { type: "STRING" },
        samplePhrases: { type: "ARRAY", items: { type: "STRING" } },
        phrasesToAvoid: { type: "ARRAY", items: { type: "STRING" } },
        dnaTags: { type: "ARRAY", items: { type: "STRING" } },
        symbolAnchors: { type: "ARRAY", items: { type: "STRING" } }
    },
    required: ["tone", "vocabulary", "phrasingStyle", "archetype", "samplePhrases", "phrasesToAvoid", "dnaTags", "symbolAnchors"],
};

// [IN gpt_router.js]

// --- NEW: THE INTENT CLASSIFIER (Optimized) ---
async function classifyIntent(userPrompt) {
    console.log("🔮 Classifying User Intent...");
    
    // We use gpt-4o-mini because it is faster and cheaper for this simple logic task.
    // It acts as the "Switchboard Operator".
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // <--- CHANGED for speed/cost
            messages: [
                { 
                    role: "system", 
                    content: `You are a strict routing system. Classify the user's request into ONE category:
                    1. NARRATIVE (Story, manifesto, essay, deep reflection, emotional writing)
                    2. STRUCTURED (Plan, strategy, analysis, technical doc, outline, how-to)
                    3. ACTION (Email, social post, ad copy, sales pitch, dialogue, short request)
                    
                    If unclear, output ACTION.
                    Output ONLY the one word label.`
                }, 
                { role: "user", content: userPrompt.substring(0, 500) }
            ],
            temperature: 0.0 // Strict logic, no creativity
        });
        
        let intent = completion.choices[0].message.content.trim().toUpperCase();
        
        // Sanitize output (Safety Net)
        if (!['NARRATIVE', 'STRUCTURED', 'ACTION'].includes(intent)) {
            console.warn(`⚠️ Classifier returned weird value: ${intent}. Defaulting to ACTION.`);
            intent = 'ACTION'; 
        }
        
        console.log(`🔮 Intent Detected: ${intent}`);
        return intent;

    } catch (e) {
        console.error("Intent Classification Failed (Network/API Error):", e);
        return 'ACTION'; // Fail-safe: Defaults to GPT-4o (The Generalist)
    }
}

// --- 1. INTELLIGENT ROUTING LOGIC (Minor: Handle non-content styles) ---
async function selectModelForTask(type, style, userPrompt) {
    let selectedModel = 'openai';

    if (type === 'voice' || type === 'refine') {
        // For structural/JSON tasks, stick to OpenAI (best schema adherence)
        // Optional: If style provided, blend (e.g., poetic refine → Claude assist)
        if (style && style.includes('poetic')) selectedModel = 'anthropic';
        return selectedModel; 
    }

    if (type === 'content') {
        // DETECT INTENT AUTOMATICALLY
        let detectedIntent = await classifyIntent(userPrompt);

        // MAP INTENT TO BRAIN
        if (detectedIntent === 'NARRATIVE') {
            selectedModel = 'anthropic'; // Claude is the Storyteller
        } else if (detectedIntent === 'STRUCTURED') {
            selectedModel = 'google';    // Gemini is the Architect
        } else {
            selectedModel = 'openai';    // GPT-4o is the Messenger
        }
    }
    
    console.log(`[Orchestrator] Routing Content Task to: ${selectedModel.toUpperCase()}`);
    return selectedModel;
}

// --- 2. PROVIDER HANDLERS (Fixed Models + Gemini JSON Fallback) ---

// [IN gpt_router.js - Top Section]
async function callOpenAI(messages, responseFormat = null, temp = 0.7) {
    const params = {
        model: "gpt-4o",
        messages: messages,
        temperature: temp,
    };
    // Only attach if it exists (don't send null)
    if (responseFormat) {
        params.response_format = responseFormat;
    }
    
    const completion = await openai.chat.completions.create(params);
    return completion.choices[0].message.content;
}

async function callAnthropic(systemPrompt, userPrompt, temp = 0.7) {
    // FIXED: Use current Claude 4 Sonnet (Dec 2025 stable)
    const msg = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250929",  // Or "claude-4-sonnet-latest" for auto-updates
        max_tokens: 4096,
        temperature: temp,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }]
    });
    return msg.content[0].text;
}

async function callGoogle(systemPrompt, userPrompt) {
    // FIXED: Use current Gemini 2.5 Pro (Dec 2025 stable; SDK auto-uses v1)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });  // Or "gemini-2.5-pro-latest"
    const fullPrompt = `${systemPrompt}\n\nUSER REQUEST:\n${userPrompt}`;
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
}

// --- 3. MAIN HANDLER (Unchanged—Your v4 Logic Shines) ---
// --- NEW: MULTI-AI EXTRACTION LOGIC ---
async function multiExtract(prompt) {
    console.log("⚡ Starting Multi-AI Voice Extraction...");
    
    // 1. OpenAI (The Skeleton: Strict JSON Schema)
    const openaiMsg = [
        { role: "system", content: "You extract structure, schema-correct JSON, and explicit linguistic patterns." },
        { role: "user", content: prompt }
    ];
    // Fire all three requests in parallel for speed
    const [baseJSON, claudeText, geminiText] = await Promise.all([
    withRetry(() => callOpenAI(openaiMsg, { type: "json_object" }, 0.2)),
    withRetry(() => callAnthropic("You reveal deeper emotional tone, archetypal narrative, subtextual intention. Output concise plain text.", prompt, 0.4)),
    withRetry(() => callGoogle("You provide bullet-level linguistic analysis, tendencies, bias markers, and structure.", prompt))
]);

    return { baseJSON, claudeText, geminiText };
}

function combineExtractionProviders(base, claude, gemini) {
    let parsed;
    try {
        parsed = JSON.parse(base);
    } catch (e) {
        console.error("OpenAI failed to return valid JSON base");
        return { error: "Base extraction failed" };
    }

    // Inject the "Soul" (Claude) and "Logic" (Gemini) into the JSON
    // We append this extra intel to the 'tone' and 'phrasingStyle' fields 
    // so it appears in the UI without breaking the schema.
    
    // Replace the fragie splitting logic with this:
if (claude) {
    // Regex to find "Subtext:" or just grab the text if no label exists
    const match = claude.match(/Subtext:\s*(.*)/i) || claude.match(/^(.*)/);
    const soulSnippet = match ? match[1].substring(0, 100).trim() : "Deep Resonance";
    parsed.tone += ` (Subtext: ${soulSnippet})`;
}

    if (gemini) {
        // Extract structural analysis
        if (gemini.toLowerCase().includes("concise") || gemini.toLowerCase().includes("short")) {
             parsed.phrasingStyle += " | Detected Preference: Concise Pacing";
        }
        if (gemini.toLowerCase().includes("complex") || gemini.toLowerCase().includes("academic")) {
             parsed.phrasingStyle += " | Detected Preference: High Complexity";
        }
    }

    return JSON.stringify(parsed);
}

// --- NEW: MULTI-AI ALCHEMY TOOLS (POLISHED & SILENT) ---
async function multiAlchemy(kits, prompt) {
    console.log("⚡ Starting Multi-AI Alchemy...");

    // 1. OpenAI (The Architect)
    // Strict Schema to prevent breakage
    const openaiMsg = [
        { 
            role: "system", 
            content: `You are a master synthesist. Output a JSON object strictly adhering to this schema: ${JSON.stringify(voiceAnalysisSchema, null, 2)}.` 
        },
        { role: "user", content: prompt }
    ];

    // 2. Claude (The Visionary)
    // SILENCING ORDER: We force it to output ONLY the name.
    const claudePrompt = `
    Review these Voice Kits. 
    Resolve the tension between them into a NEW, singular Archetype.
    Output ONLY the name of this new Archetype (e.g., "The Quantum Sage").
    Do not write a full sentence. Do not write "The archetype is...". Just the name.
    
    Data: ${JSON.stringify(kits)}
    `;

    // 3. Gemini (The Bridge)
    // SILENCING ORDER: We force it to output ONLY keywords.
    const geminiPrompt = `
    Identify 3 unique "Bridge Words" that fuse these styles.
    Output ONLY the 3 words, separated by commas. 
    NO intro text. NO explanations. NO bullet points.
    
    Data: ${JSON.stringify(kits)}
    `;

    // Fire all three
    const [baseJSON, claudeText, geminiText] = await Promise.all([
    withRetry(() => callOpenAI(openaiMsg, { type: "json_object" }, 0.6)),
    withRetry(() => callAnthropic("You are a concise namer.", claudePrompt, 0.7)),
    withRetry(() => callGoogle("You are a strict keyword extractor.", geminiPrompt))
]);

    return { baseJSON, claudeText, geminiText };
}

function combineAlchemyProviders(base, claude, gemini) {
    let parsed;
    try {
        parsed = JSON.parse(base);
        // The "Unwrapper" (Fixes the nested schema bug you saw)
        if (parsed.properties) {
            console.log("⚠️ OpenAI nested schema detected. Unwrapping...");
            parsed = parsed.properties;
        }
    } catch (e) {
        console.error("Alchemy Base JSON failed", e);
        parsed = { tone: "Emergent Synthesis", vocabulary: "Hybridized Lexicon", archetype: "The Alchemist" };
    }

    // Default Fallbacks
    parsed.archetype = parsed.archetype || "Emergent Archetype";
    parsed.tone = parsed.tone || "Synthesized Tone";
    parsed.vocabulary = parsed.vocabulary || "Evolved Vocabulary";

    // --- POLISHED MERGE LOGIC (Natural Blending) ---

    // 1. Inject Claude's Vision (Seamlessly)
    if (claude) {
        const cleanSoul = claude.replace(/\n/g, '').trim(); 
        // Result: "The Sage, The Quantum Alchemist" (No more pipes or labels)
        parsed.archetype = `${parsed.archetype}, ${cleanSoul}`; 
        
        // Result: "Reflective, with elements of The Quantum Alchemist"
        parsed.tone = `${parsed.tone}, evoking ${cleanSoul}`; 
    }

    // 2. Inject Gemini's Bridge Words (Seamlessly)
    if (gemini) {
        // Aggressive cleanup: remove "Here are words" or bullets
        const cleanBridge = gemini.replace(/^Here.*:/i, '').replace(/\*/g, '').trim();
        // Result: "Simple, including: Flux, Horizon, Crucible"
        parsed.vocabulary = `${parsed.vocabulary}, featuring: ${cleanBridge}`;
    }

    return JSON.stringify(parsed);
}

// [INSERT THIS BELOW multiExtract AND ABOVE handleGPTRequest]

// --- LATENT LAYER EXTRACTION (Silent, Non-User-Facing) ---
async function latentExtract(prompt) {
    console.log("🧬 Running Latent Layer Inference...");

    // 1. OpenAI Structural Prompt (Exact Text)
    const structuralSystemPrompt = `
You are analyzing linguistic structure ONLY.

From the text below, infer:
1. Narrative structure (how ideas are sequenced and resolved).
2. Consistency of voice and structure across the passage.

Output STRICT JSON with:
{
  "narrativeMode": "",
  "stabilityIndex": number between 0.0 and 1.0
}

Rules:
- Do NOT infer emotions.
- Do NOT infer psychology.
- Base answers ONLY on structure, transitions, and consistency.
- StabilityIndex reflects internal coherence, not quality.
`.trim();

    // 2. Claude Subtext Prompt (Exact Text)
    const claudeSystemPrompt = `
Analyze the emotional rhythm and internal tension of the language.

You are NOT diagnosing a person.
You are describing the cadence and unresolved polarity in the text itself.

Return PLAIN TEXT with two labeled lines only:

Emotional Cadence: <short phrase>
Cognitive Tension: <short phrase>

Rules:
- Do not speculate beyond the text.
- Use neutral, descriptive language.
- Focus on rhythm, contrast, modulation.
`.trim();

    // 3. Gemini Intent Prompt (Exact Text)
    const geminiSystemPrompt = `
Analyze the language for:
1. Primary communicative intent.
2. Recurring conceptual or symbolic motifs.

Output STRICT JSON:

{
  "communicativeIntent": "",
  "dominantMotifs": []
}

Rules:
- Motifs must be recurring ideas or metaphors.
- Do NOT invent symbolism.
- Use short phrases only.
`.trim();

    const openaiMsg = [
        { role: "system", content: structuralSystemPrompt },
        { role: "user", content: prompt }
    ];

    // Fire parallel requests (Wrapped in retry for fortress resilience)
    const [structuralJSON, claudeText, geminiText] = await Promise.all([
        withRetry(() => callOpenAI(openaiMsg, { type: "json_object" }, 0.1)),
        withRetry(() => callAnthropic(claudeSystemPrompt, prompt, 0.3)),
        withRetry(() => callGoogle(geminiSystemPrompt, prompt))
    ]);

    let latentProfile = {};

    try {
        // Parse OpenAI
        const structural = JSON.parse(structuralJSON);

        // [IN gpt_router.js - inside latentExtract]
        // Parse Gemini (The Robust "Bracket Hunter" Fix)
        let intentMotifs = {};
        try {
            let clean = geminiText;
            // 1. Find the first '{'
            const start = clean.indexOf('{');
            // 2. Find the LAST '}'
            const end = clean.lastIndexOf('}');
            
            if (start !== -1 && end !== -1) {
                // Extract ONLY the JSON part
                clean = clean.substring(start, end + 1);
                intentMotifs = JSON.parse(clean);
            } else {
                // If no brackets, use fallback
                intentMotifs = JSON.parse(clean); 
            }
        } catch (e) { 
            console.warn(`Gemini Latent Parse Warning (Handled): ${e.message}`); 
            // Fallback so extraction succeeds
            intentMotifs = { communicativeIntent: "Complex Expression", dominantMotifs: [] };
        }

        // Parse Claude (2-line format)
        let emotionalCadence = "";
        let cognitiveTension = "";

        if (claudeText) {
            const lines = claudeText.split('\n');
            emotionalCadence = lines.find(l => l.toLowerCase().includes('emotional'))
                ?.split(':')[1]?.trim() || "Unclear";
            cognitiveTension = lines.find(l => l.toLowerCase().includes('tension'))
                ?.split(':')[1]?.trim() || "Unclear";
        }

        latentProfile = {
            narrativeMode: structural.narrativeMode || "Linear",
            stabilityIndex: structural.stabilityIndex || 0.5,
            emotionalCadence,
            cognitiveTension,
            communicativeIntent: intentMotifs.communicativeIntent || "Expression",
            dominantMotifs: intentMotifs.dominantMotifs || []
        };

    } catch (e) {
        console.error("Latent extraction failed:", e);
        latentProfile = { error: "latent_extraction_failed" };
    }

    return latentProfile;
}


// ===============================
// 🔒 LATENT INFERENCE PROMPTS
// (DORMANT - NOT EXECUTED IN BETA)
// ===============================

const latentInferencePrompts = {
  narrativeStability: `
You are analyzing a time-series of latent voice profiles.
Your task is to detect whether the narrative mode is:
- stable
- evolving
- fragmented
- converging

Only analyze. Do not generate advice.
Return a short analytical summary.
`,

  emotionalDrift: `
Given a chronological sequence of emotional cadences,
identify whether emotional expression is:
- compressing
- expanding
- oscillating
- stabilizing

Do not diagnose. Do not label pathology.
Only describe the pattern.
`,

  identityCoherence: `
Analyze whether core motifs remain consistent across time.
Report:
- dominant motifs
- disappearing motifs
- newly emerging motifs
`
};

async function handleGPTRequest(type, data) {
  let promptContent;
  let style = 'general'; // Default style
  let systemMessage = "You are PulseCraft, an advanced identity engine.";
  let isJsonResponse = false;
  
  // Extract data if it's an object with metadata (from updated server.js)
  // Or handle it if it's just a raw prompt string (legacy support)
  let requestData = data;
  if (type === 'content' && typeof data === 'object' && data.prompt) {
      promptContent = data.prompt;
      style = data.style || 'general';
  } else if (type === 'voice' || type === 'refine') {
      requestData = data; // Keep object structure for these types
  } else {
      promptContent = data; // Raw string fallback
  }

  // --- PREPARE PROMPTS BASED ON TYPE (Preserving Your Previous Logic) ---
  
  if (type === "voice") {
    promptContent = data; // Full prompt from server.js
    
    isJsonResponse = true;
    systemMessage = `You are an expert Linguistic Analyst. Your output must be a JSON object strictly adhering to this schema: ${JSON.stringify(voiceAnalysisSchema, null, 2)}
      Ensure all array fields (samplePhrases, phrasesToAvoid, dnaTags, symbolAnchors) are valid JSON arrays. Do not include any other text or formatting outside the JSON object.`;

  } else if (type === "content") {
    // Prompt content is already extracted above
    systemMessage = "You are a master stylist and voice chameleon. Your task is to generate content that perfectly embodies a specific voice and style.";
    isJsonResponse = false;

  } else if (type === "refine") {
    const { kits } = requestData; 

    // CRITICAL FIX: Streamlined system message from v4.
    systemMessage = `You are the Supreme Voice Alchemist. Your SOLE output MUST be a JSON object that strictly adheres to the following schema: ${JSON.stringify(voiceAnalysisSchema, null, 2)}.
      You MUST provide detailed, descriptive, and non-empty values for ALL required properties. Ensure all array fields are valid JSON arrays. DO NOT include any other text, preambles, or explanations outside the JSON object. Your response should start directly with '{'.`;

    // Preserving the Refine Prompt from v4
    promptContent = `
Your sacred task is to perform a profound, non-linear synthesis of the provided Voice Kits. These are "Consciousness Prints" – the distilled essence of unique voices. Your goal is to identify the emergent properties, the unexpected harmonies, and the deeper, unifying frequency that arises when these voices are brought together.

Synthesize a NEW Voice Kit that is a revelation, a voice that *could not have been predicted* by merely analyzing its components. It must embody a higher truth, a more evolved resonance that is truly greater than the sum of its parts.
All emergent qualities must be grounded in patterns actually present in the source Voice Kits. Do not invent traits with no lineage or connection to the input material.The synthesis may transcend the components, but it must remain traceable to them.

**CRITICAL: For EVERY single property (Tone, Vocabulary, Phrasing Style, Archetype, Sample Phrases, Phrases To Avoid, DNA Tags, Symbol Anchors), you MUST provide a rich, detailed, and descriptive response. DO NOT leave any field blank, return generic placeholders, or provide empty arrays. Expand only from signals present in the source kits. Do not fabricate disconnected traits.**

Focus on:
1.  **Emergent Tone:** A concise, evocative description of the new overall emotional and communicative tone that transcends the individual kits.
2.  **Transformed Vocabulary:** A detailed description of the new key phrases, word types, and linguistic complexity that emerges from the fusion.
3.  **Evolved Phrasing Style:** A detailed description of the new sentence structure, rhythm, and rhetorical power.
4.  **Synthesized Archetype:** The new dominant brand archetype (e.g., "The Skeptical Sage," "The Luminous Explorer") that encapsulates the combined essence.
5.  **Interconnected DNA Tags:** Provide 3-5 *new*, unique, very short (1-2 word) core conceptual tags that define this evolved essence. These must reflect the fusion, not just a list of old tags.
6.  **Resonant Symbol Anchors:** Provide 3-5 *new*, unique, very short (1-3 word) metaphorical or thematic anchors that capture the deeper, unified symbolic meaning. These should feel like a fresh, powerful revelation.
7.  **Harmonized Sample Phrases:** Provide 2-3 new sample phrases that perfectly embody this *new, synthesized* voice.
8.  **Refined Phrases to Avoid:** Provide 2-3 words or stylistic elements that should be avoided to maintain the purity of this *evolved* voice.

The output must be a single JSON object, strictly adhering to the Voice Kit schema. Do NOT include any preambles or explanations outside the JSON.

Here are the Voice Kits to be alchemized (their raw data for your deep analysis):
${kits.map((kit, index) => `
--- Voice Kit ${index + 1} ("${kit.name || 'Untitled'}") ---
Tone: ${kit.tone || 'None'}
Vocabulary: ${kit.vocabulary || 'None'}
Phrasing Style: ${kit.phrasingStyle || 'None'}
Archetype: ${kit.archetype || 'None'}
Sample Phrases: ${Array.isArray(kit.samplePhrases) && kit.samplePhrases.length > 0 ? kit.samplePhrases.join(', ') : 'None'}
Phrases To Avoid: ${Array.isArray(kit.phrasesToAvoid) && kit.phrasesToAvoid.length > 0 ? kit.phrasesToAvoid.join(', ') : 'None'}
DNA Tags: ${Array.isArray(kit.dnaTags) && kit.dnaTags.length > 0 ? kit.dnaTags.join(', ') : 'None'}
Symbol Anchors: ${Array.isArray(kit.symbolAnchors) && kit.symbolAnchors.length > 0 ? kit.symbolAnchors.join(', ') : 'None'}
`).join('\n')}

Perform the alchemy. Provide only the refined JSON object.
`.trim();

    isJsonResponse = true;
  } else {
    throw new Error("Unsupported type for GPT request: " + type);
  }

  // --- SELECT MODEL ---
  // CRITICAL FIX: Added 'await' because selectModelForTask is async
const provider = await selectModelForTask(type, style, promptContent);

  try {
    let rawContent;

    // --- EXECUTE REQUEST ---
    
    if (type === 'voice') {
        // Multi-AI Extraction (Existing)
    console.log("⚡ Executing Multi-AI Voice Extraction...");
    
    // EXECUTE PARALLEL: Visible Extraction + Silent Latent Extraction
    const [extract, latent] = await Promise.all([
        multiExtract(promptContent),
        latentExtract(promptContent)
    ]);

    rawContent = combineExtractionProviders(
        extract.baseJSON,
        extract.claudeText,
        extract.geminiText
    );

    // Attach latent profile silently
    try {
        const parsed = JSON.parse(rawContent);
        parsed.latentProfile = latent;
        rawContent = JSON.stringify(parsed);
    } catch (e) {
        console.warn("Could not attach latent profile to JSON", e);
    }
    } 
    else if (type === 'refine') {
        // [NEW] Multi-AI Alchemy Logic
        console.log("⚡ Executing Multi-AI Alchemy...");
        const { kits } = requestData; 
        const alchemy = await multiAlchemy(kits, promptContent);
        rawContent = combineAlchemyProviders(
            alchemy.baseJSON,
            alchemy.claudeText,
            alchemy.geminiText
        );
    }
    // [IN gpt_router.js - inside handleGPTRequest]
    else if (provider === 'openai') {
        const messages = [
            { role: "system", content: systemMessage },
            { role: "user", content: promptContent }
        ];
        
        // CRITICAL FIX: Explicitly undefined if not JSON. 
        // Sending { type: "json_object" } for text prompts causes OpenAI to hang/error.
        const format = isJsonResponse ? { type: "json_object" } : undefined; 
        const temp = type === 'refine' ? 0.9 : 0.7; 

        console.log(`🚀 Sending request to OpenAI (Format: ${format ? 'JSON' : 'Text'})...`); 
        
        // Safety Timeout (60s)
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("OpenAI Request Timed Out")), 60000)
        );
        
        try {
            rawContent = await Promise.race([
                callOpenAI(messages, format, temp),
                timeoutPromise
            ]);
            console.log("✅ OpenAI Replied. Length:", rawContent ? rawContent.length : 0);
        } catch (openaiError) {
            console.error("❌ OpenAI Error:", openaiError.message);
            throw openaiError; 
        }
    }
    else if (provider === 'anthropic') {
        rawContent = await callAnthropic(systemMessage, promptContent);
    } 
    else if (provider === 'google') {
        rawContent = await callGoogle(systemMessage, promptContent);
    }

    // --- POST-PROCESSING (Preserving v4 Logic + Gemini JSON Fallback) ---
    if (isJsonResponse) {
        try {
            // FIXED: Enhanced extraction for non-JSON providers (e.g., Gemini/Claude may return text-wrapped JSON)
            const jsonStartIndex = rawContent.indexOf('{');
            const jsonEndIndex = rawContent.lastIndexOf('}');
            if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
                rawContent = rawContent.substring(jsonStartIndex, jsonEndIndex + 1);
            } else {
                console.error(' AI response did not contain a valid JSON object:', rawContent);
                return {
                    tone: '', vocabulary: '', phrasingStyle: '', archetype: '',
                    samplePhrases: [], phrasesToAvoid: [], dnaTags: [], symbolAnchors: [],
                    error: "AI response did not contain a valid JSON object."
                };
            }

            let parsedContent = JSON.parse(rawContent);

            // CRITICAL FIX: Aggressive post-processing (from v4)
            parsedContent.tone = parsedContent.tone || 'Emergent Tone';
            parsedContent.vocabulary = parsedContent.vocabulary || 'Rich and expressive lexicon';
            parsedContent.phrasingStyle = parsedContent.phrasingStyle || 'Dynamic and impactful phrasing';
            parsedContent.archetype = parsedContent.archetype || 'The Alchemist';
            
            parsedContent.samplePhrases = Array.isArray(parsedContent.samplePhrases) && parsedContent.samplePhrases.length > 0
                                        ? parsedContent.samplePhrases
                                        : ['Synthesized insight', 'New resonant truth'];
            
            parsedContent.phrasesToAvoid = Array.isArray(parsedContent.phrasesToAvoid) && parsedContent.phrasesToAvoid.length > 0
                                        ? parsedContent.phrasesToAvoid
                                        : ['Stagnation', 'Limitation'];
            
            parsedContent.dnaTags = Array.isArray(parsedContent.dnaTags) && parsedContent.dnaTags.length > 0
                                  ? parsedContent.dnaTags
                                  : ['Fusion', 'Evolution', 'Resonance'];
            
            parsedContent.symbolAnchors = Array.isArray(parsedContent.symbolAnchors) && parsedContent.symbolAnchors.length > 0
                                        ? parsedContent.symbolAnchors
                                        : ['New Horizon', 'Deep Current', 'Guiding Star'];
            
            parsedContent.name = parsedContent.name || undefined; 

            return parsedContent;

        } catch (parseError) {
            console.error(' Backend failed to parse JSON from AI. Raw content:', rawContent, 'Parse Error:', parseError);
            return {
                tone: '', vocabulary: '', phrasingStyle: '', archetype: '',
                samplePhrases: [], phrasesToAvoid: [], dnaTags: [], symbolAnchors: [],
                error: "Backend failed to parse AI response as JSON."
            };
        }
    } else {
        return { output: rawContent };
    }

  } catch (error) {
    console.error(` ${provider.toUpperCase()} API call failed (Backend):`, error);
    throw new Error(`Failed to communicate with ${provider.toUpperCase()} API: ` + error.message);
  }
}

module.exports = { handleGPTRequest };