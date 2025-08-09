// gpt_router.js - Refined to provide the complete Consciousness Print for alchemy.
// This ensures consistent, high-quality results for the "Refine Kits" feature.
// CRITICAL FIX: Aggressive post-processing to ensure all fields are populated, even if AI underperforms.
// CRITICAL FIX: Streamlined system message to reduce AI confusion.

require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// This schema remains the same, defining the structure of a Voice Kit.
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

// Main handler function for all GPT requests
async function handleGPTRequest(type, data) {
  let promptContent;
  let modelToUse = "gpt-4o";
  let completionParams = {
    model: modelToUse,
    messages: [],
    temperature: 0.9, // Keep high for creativity in refinement
  };
  let isJsonResponse = false;

  if (type === "voice") {
    promptContent = data;
    completionParams.response_format = { type: "json_object" };
    isJsonResponse = true;
    
    completionParams.messages.push({
      role: "system",
      content: `You are an expert AI that generates brand voice kits. Your output must be a JSON object strictly adhering to this schema: ${JSON.stringify(voiceAnalysisSchema, null, 2)}
      Ensure all array fields (samplePhrases, phrasesToAvoid, dnaTags, symbolAnchors) are valid JSON arrays. Do not include any other text or formatting outside the JSON object.`
    });
    
    completionParams.messages.push({ role: "user", content: promptContent });

  } else if (type === "content") {
    promptContent = data;
    completionParams.messages.push({ role: "user", content: promptContent });
    isJsonResponse = false;

  } else if (type === "refine") {
    const { kits } = data; 

    // CRITICAL FIX: Streamlined system message. Focus solely on JSON output and required fields.
    completionParams.messages.push({
      role: "system",
      content: `You are the Supreme Voice Alchemist. Your SOLE output MUST be a JSON object that strictly adheres to the following schema: ${JSON.stringify(voiceAnalysisSchema, null, 2)}.
      You MUST provide detailed, descriptive, and non-empty values for ALL required properties. Ensure all array fields are valid JSON arrays. DO NOT include any other text, preambles, or explanations outside the JSON object. Your response should start directly with '{'.`
    });

    // Reinforce prompt instructions for consistent, descriptive refinement outputs.
    promptContent = `
Your sacred task is to perform a profound, non-linear synthesis of the provided Voice Kits. These are "Consciousness Prints" – the distilled essence of unique voices. Your goal is to identify the emergent properties, the unexpected harmonies, and the deeper, unifying frequency that arises when these voices are brought together.

Synthesize a NEW Voice Kit that is a revelation, a voice that *could not have been predicted* by merely analyzing its components. It must embody a higher truth, a more evolved resonance that is truly greater than the sum of its parts.

**CRITICAL: For EVERY single property (Tone, Vocabulary, Phrasing Style, Archetype, Sample Phrases, Phrases To Avoid, DNA Tags, Symbol Anchors), you MUST provide a rich, detailed, and descriptive response. DO NOT leave any field blank, return generic placeholders, or provide empty arrays. Invent if necessary to fulfill the requirement for descriptive content.**

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

    completionParams.response_format = { type: "json_object" };
    isJsonResponse = true;
    completionParams.messages.push({ role: "user", content: promptContent });
  
  } else {
    throw new Error("Unsupported type for GPT request: " + type);
  }

  try {
    const completion = await openai.chat.completions.create(completionParams);
    let rawContent = completion.choices[0].message.content;

    if (isJsonResponse) {
        try {
            // CRITICAL FIX: Attempt to extract JSON if AI includes extra text
            const jsonStartIndex = rawContent.indexOf('{');
            const jsonEndIndex = rawContent.lastIndexOf('}');
            if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
                rawContent = rawContent.substring(jsonStartIndex, jsonEndIndex + 1);
            } else {
                // If no valid JSON structure is found, log and return an error
                console.error('❌ AI response did not contain a valid JSON object:', rawContent);
                // Fallback to a default, empty but valid kit structure
                return {
                    tone: '', vocabulary: '', phrasingStyle: '', archetype: '',
                    samplePhrases: [], phrasesToAvoid: [], dnaTags: [], symbolAnchors: [],
                    error: "AI response did not contain a valid JSON object."
                };
            }

            let parsedContent = JSON.parse(rawContent);

            // CRITICAL FIX: Aggressive post-processing to ensure all fields are populated
            // This is a failsafe if the AI still returns empty/null values despite strong prompting.
            parsedContent.tone = parsedContent.tone || 'Emergent Tone'; // Default descriptive placeholder
            parsedContent.vocabulary = parsedContent.vocabulary || 'Rich and expressive lexicon';
            parsedContent.phrasingStyle = parsedContent.phrasingStyle || 'Dynamic and impactful phrasing';
            parsedContent.archetype = parsedContent.archetype || 'The Alchemist';
            
            parsedContent.samplePhrases = Array.isArray(parsedContent.samplePhrases) && parsedContent.samplePhrases.length > 0
                                        ? parsedContent.samplePhrases
                                        : ['Synthesized insight', 'New resonant truth']; // Default non-empty array
            
            parsedContent.phrasesToAvoid = Array.isArray(parsedContent.phrasesToAvoid) && parsedContent.phrasesToAvoid.length > 0
                                        ? parsedContent.phrasesToAvoid
                                        : ['Stagnation', 'Limitation']; // Default non-empty array
            
            parsedContent.dnaTags = Array.isArray(parsedContent.dnaTags) && parsedContent.dnaTags.length > 0
                                  ? parsedContent.dnaTags
                                  : ['Fusion', 'Evolution', 'Resonance']; // Default non-empty array
            
            parsedContent.symbolAnchors = Array.isArray(parsedContent.symbolAnchors) && parsedContent.symbolAnchors.length > 0
                                        ? parsedContent.symbolAnchors
                                        : ['New Horizon', 'Deep Current', 'Guiding Star']; // Default non-empty array
            
            parsedContent.name = parsedContent.name || undefined; // Let server.js handle default naming

            return parsedContent;

        } catch (parseError) {
            console.error('❌ Backend failed to parse JSON from OpenAI. Raw content:', rawContent, 'Parse Error:', parseError);
            // Fallback to a default, empty but valid kit structure
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
    console.error('❌ OpenAI API call failed (Backend):', error);
    const errorMessage = error.response?.data?.error?.message || error.message;
    throw new Error('Failed to communicate with OpenAI API: ' + errorMessage);
  }
}

module.exports = { handleGPTRequest };

