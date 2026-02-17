// schemas.js - Zod Validation Schemas for PulseCraft Voice Kits
// Purpose: Formalizes the "Patent Claims" into strict, reusable validation objects
// Usage: Import and use .parse() or .safeParse() to validate Multi-AI outputs

const { z } = require('zod');

// --- LATENT PROFILE SCHEMA ---
// The hidden psychometric layer (non-user-facing analytics)
// Matches latentExtract() output in gpt_router.js (lines 414-421)
// Security: Max lengths prevent prompt injection via oversized fields
const LatentProfileSchema = z.object({
    narrativeMode: z.string().max(300).describe('How ideas are sequenced and resolved'),
    stabilityIndex: z.number().min(0).max(1).describe('Internal coherence score (0.0-1.0)'),
    emotionalCadence: z.string().max(300).describe('Rhythm and modulation of emotional expression'),
    cognitiveTension: z.string().max(300).describe('Unresolved polarity in the text'),
    communicativeIntent: z.string().max(300).describe('Primary purpose of the communication'),
    dominantMotifs: z.array(z.string().max(50)).max(10).describe('Recurring conceptual or symbolic themes')
});

// --- VOICE KIT SCHEMA ---
// The user-facing voice signature
// Matches voiceAnalysisSchema in gpt_router.js (lines 28-41)
// Security: Max lengths prevent prompt injection via oversized fields
const VoiceKitSchema = z.object({
    tone: z.string().max(500).describe('Overall emotional and communicative tone'),
    vocabulary: z.string().max(500).describe('Key phrases, word types, and linguistic complexity'),
    phrasingStyle: z.string().max(500).describe('Sentence structure, rhythm, and rhetorical devices'),
    archetype: z.string().max(500).describe('Dominant persona or character archetype'),
    samplePhrases: z.array(z.string().max(200)).max(10).describe('2-3 exact example phrases from the text'),
    phrasesToAvoid: z.array(z.string().max(100)).max(10).describe('2-3 words or stylistic elements to avoid'),
    dnaTags: z.array(z.string().max(50)).max(10).describe('3-5 short conceptual tags defining the essence'),
    symbolAnchors: z.array(z.string().max(50)).max(10).describe('3-5 metaphorical or thematic anchors'),
    // Optional: Attached when latent extraction succeeds
    latentProfile: LatentProfileSchema.optional()
});

// --- COMPLETE MIRROR RESPONSE SCHEMA ---
// Full response from /api/mirror-voice endpoint
// Combines VoiceKit + LatentProfile + LatentMeta
const MirrorResponseSchema = VoiceKitSchema.extend({
    latentProfile: LatentProfileSchema.optional(),
    latentMeta: z.object({
        driftScore: z.number().optional(),
        evolutionState: z.string().optional(),
        archetypeTrajectory: z.array(z.string()).optional()
    }).optional()
});

// --- ALCHEMY (REFINED) KIT SCHEMA ---
// Output from /api/refine-kits when combining multiple voices
// Same structure as VoiceKit but represents emergent synthesis
const AlchemyKitSchema = VoiceKitSchema.describe('Synthesized voice from multiple source kits');

// --- HELPER: Safe Validation ---
// Returns { success: true, data } or { success: false, error }
function validateVoiceKit(data) {
    return VoiceKitSchema.safeParse(data);
}

function validateLatentProfile(data) {
    return LatentProfileSchema.safeParse(data);
}

function validateMirrorResponse(data) {
    return MirrorResponseSchema.safeParse(data);
}

// --- EXPORTS ---
module.exports = {
    // Schemas (for direct .parse() / .safeParse() usage)
    VoiceKitSchema,
    LatentProfileSchema,
    MirrorResponseSchema,
    AlchemyKitSchema,

    // Helper functions
    validateVoiceKit,
    validateLatentProfile,
    validateMirrorResponse
};
