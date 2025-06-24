// gpt_router.js — OpenAI SDK v4.x, supports 'voice', 'content', 'preview_card'
require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Main handler function
async function handleGPTRequest(type, data) {
  if (type === "voice") {
    // Brand Voice Analysis
    const prompt = `
Analyze the brand voice from this text:

${data}

Respond ONLY using these exact numbered points:
1. Tone: (describe the overall tone)
2. Vocabulary: (key phrases and word types)
3. Archetype: (e.g., The Sage, The Rebel)
4. Phrasing Style: (short/long form, poetic/direct etc.)
5. Sample Phrases: (some invented sample lines in the same style)
6. Phrases to Avoid: (words or styles that break the tone)

Format strictly as:
1. ...
2. ...
3. ...
4. ...
5. ...
6. ...
`.trim();


    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // or "gpt-4", etc.
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content.trim();
console.log('📜 Raw completion content:', content);
let sections = {};
try {
  sections = JSON.parse(content); 
  console.log('✅ Parsed sections:', sections); 
} catch (parseError) {
  console.error('❌ JSON parse failed:', parseError.message); 
  sections = { rawOutput: content };
}
    // Parse the numbered sections
    
    const sectionTitles = [
  "Tone",
  "Vocabulary",
  "Archetype",
  "Phrasing Style",
  "Sample Phrases",
  "Phrases to Avoid"
];

    const regex = /\d\.\s([\s\S]*?)(?=\n\d\.|$)/g;
    let match, i = 0;
    while ((match = regex.exec(content)) && i < sectionTitles.length) {
      sections[sectionTitles[i]] = match[1].trim();
      sections[sectionTitles[i]] = sections[sectionTitles[i]].replace(/^.*?:\s*/, '');

      i++;
    }

    return { outputSections: sections };
  }

  // Support other types if needed
  if (type === "content") {
    // ... implement content type logic here
    return { output: "Content generation is not yet implemented." };
  }
  if (type === "preview_card") {
    // ... implement preview card logic here
    return { output: "Preview card is not yet implemented." };
  }

  throw new Error("Unsupported type for GPT request.");
}

module.exports = { handleGPTRequest };
