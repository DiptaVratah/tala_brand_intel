// gpt_router.js - OpenAI SDK v4.x, supports 'voice', 'content', 'preview_card', and NEW 'refine_kits' with enhanced 'voice' output
require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the JSON schema for Voice Analysis and Refined Voice Kit responses
// This ensures consistent output structure for both mirror-voice and refine-kits
const voiceAnalysisSchema = {
    type: "OBJECT",
    properties: {
        tone: { type: "STRING" },
        vocabulary: { type: "STRING" },
        phrasingStyle: { type: "STRING" },
        archetype: { type: "STRING" },
        samplePhrases: {
            type: "ARRAY",
            items: { type: "STRING" }
        },
        phrasesToAvoid: {
            type: "ARRAY",
            items: { type: "STRING" }
        },
        dnaTags: { // AI-generated core essence tags
            type: "ARRAY",
            items: { type: "STRING" },
            minItems: 3,
            maxItems: 5
        },
        symbolAnchors: { // AI-generated metaphorical anchors
            type: "ARRAY",
            items: { type: "STRING" },
            minItems: 3,
            maxItems: 5
        }
    },
    required: ["tone", "vocabulary", "phrasingStyle", "archetype", "samplePhrases", "phrasesToAvoid", "dnaTags", "symbolAnchors"],
    propertyOrdering: ["tone", "vocabulary", "phrasingStyle", "archetype", "samplePhrases", "phrasesToAvoid", "dnaTags", "symbolAnchors"]
};


// Main handler function for all GPT requests
async function handleGPTRequest(type, data) {
  let promptContent;
  let modelToUse = "gpt-4o"; // Consistent model for quality and reliable JSON adherence
  let completionParams = {
    model: modelToUse,
    messages: [],
    temperature: 0.7, // Adjust creativity as needed
  };
  let isJsonResponse = false; // Flag to indicate if JSON parsing is expected from AI

  if (type === "voice") {
    // Logic for Brand Voice Analysis (Mirror My Voice)
    promptContent = `
Analyze the brand voice from the following text. Respond **ONLY** with a JSON object.
The JSON object must have these exact keys: "tone", "vocabulary", "archetype", "phrasingStyle", "samplePhrases", "phrasesToAvoid", "dnaTags", "symbolAnchors".
"samplePhrases", "phrasesToAvoid", "dnaTags", and "symbolAnchors" must be arrays of strings.
For "dnaTags", provide 3-5 very short (1-2 word) core conceptual tags that define the unique essence or core "DNA" of this brand voice.
For "symbolAnchors", provide 3-5 very short (1-3 word) metaphorical or thematic anchors associated with this voice.

Text to analyze:
"${data}"

Example JSON Structure:
{
  "tone": "Brief description of the overall tone.",
  "vocabulary": "Key phrases and word types used.",
  "archetype": "The Sage, The Rebel, The Lover, etc. (choose ONE primary archetype or a dominant one).",
  "phrasingStyle": "Description of sentence structure, rhythm, and common rhetorical devices.",
  "samplePhrases": ["Exact example phrase 1 from the text if possible, or an invented one in its style.", "Example phrase 2."],
  "phrasesToAvoid": ["Word or style to avoid 1.", "Word or style to avoid 2."],
  "dnaTags": ["Authenticity", "Innovation", "Connection"],
  "symbolAnchors": ["Whisper of Truth", "Echoing Depths", "Pathfinder's Light"]
}
`.trim();
    completionParams.response_format = { type: "json_object" }; // Request JSON from OpenAI
    isJsonResponse = true;
    completionParams.messages.push({ role: "user", content: promptContent });

  } else if (type === "content" || type === "preview_card") {
    // Logic for Content Generation (Write It For Me, Multi-Style Preview)
    if (type === "preview_card") {
      console.warn("gpt_router received 'preview_card' type. This is treated as 'content' for generation.");
    }
    promptContent = data; // Data here is the full prompt from frontend
    completionParams.messages.push({ role: "user", content: promptContent });
    isJsonResponse = false; // Expecting plain text output

  } else if (type === "refine_kits") { // NEW: Logic for Refine Selected Kits
    const { kits, combinedInput } = data; // 'data' here is an object containing selected kits and combined string

    if (!Array.isArray(kits) || kits.length < 2) {
        throw new Error("At least two voice kits are required for refinement.");
    }

    promptContent = `You are a Voice Kit Refinement AI. Your task is to analyze the following ${kits.length} distinct voice kits. Synthesize their core attributes, focusing on blending their their tones, vocabularies, phrasing styles, archetypes, DNA Tags, and Symbol Anchors, to create a *single, harmonized, and evolved* brand voice kit. The output should capture the combined essence while presenting a cohesive, new voice.
    
    Here are the voice kits for refinement (each kit's details are separated):
    ${combinedInput}

    Generate the refined voice kit as a JSON object, strictly adhering to the provided schema. The name for the refined kit should be concise and reflect the blending (e.g., "Harmonized Voice", "Blended Essence").`;

    completionParams.response_format = { type: "json_object" }; // Request JSON from OpenAI
    isJsonResponse = true;
    completionParams.messages.push({ role: "user", content: promptContent });

  } else {
    throw new Error("Unsupported type for GPT request: " + type);
  }

  try {
    const completion = await openai.chat.completions.create(completionParams);

    const rawContent = completion.choices[0].message.content;
    console.log('📜 Raw completion content from OpenAI:', rawContent);

    if (isJsonResponse) {
        // OpenAI's `response_format: json_object` type ensures the output is valid JSON.
        // We no longer need the regex cleaning (`.replace(/```json\n|```/g, '')`)
        // The `JSON.parse` is still needed to convert the string to a JavaScript object.
        try {
            const parsedContent = JSON.parse(rawContent);
            console.log('✅ Successfully parsed JSON from OpenAI (backend).');
            
            // For refined kits, add a default name if AI doesn't provide one explicitly
            if (type === "refine_kits" && !parsedContent.name) {
                parsedContent.name = `Refined Kit (${new Date().toLocaleString()})`;
            }
            return parsedContent;
        } catch (parseError) {
            console.error('❌ Backend failed to parse JSON from OpenAI. Raw content:', rawContent, 'Error:', parseError.message); 
            // Return a structured error response that frontend can understand, 
            // ensuring new fields are present as empty arrays
            return {
                "tone": "N/A - Parsing Error", 
                "vocabulary": "N/A - Parsing Error",
                "archetype": "N/A - Parsing Error",
                "phrasingStyle": "N/A - Parsing Error",
                "samplePhrases": [],
                "phrasesToAvoid": [],
                "dnaTags": [], 
                "symbolAnchors": [], 
                "error": "Backend failed to parse AI response as JSON. Check GPT prompt and raw output for unexpected characters or model behavior."
            };
        }
    } else {
        // For plain text content generation, just return the raw text
        return { output: rawContent }; 
    }

  } catch (error) {
    console.error('❌ OpenAI API call failed (Backend):', error);
    // Provide more specific error messages from OpenAI if available
    const errorMessage = error.response && error.response.data && error.response.data.error && error.response.data.error.message 
                         ? error.response.data.error.message 
                         : error.message;
    throw new Error('Failed to communicate with OpenAI API: ' + errorMessage);
  }
}

module.exports = { handleGPTRequest };
