// /services/latentMeta.js
// Role: Internal signal reliability & longitudinal patterning
// Scope: Observational only. Never user-facing. Never generative.

const HISTORY_WINDOW = 5;

// ---------- SNAPSHOT INTERPRETATION ----------

function computeStabilityBand(stabilityIndex) {
  if (stabilityIndex < 0.35) return "low";
  if (stabilityIndex < 0.7) return "medium";
  return "high";
}

function computeTensionForm(cognitiveTensionText = "") {
  const t = cognitiveTensionText.toLowerCase();

  if (t.includes("paradox") || t.includes("without resolution"))
    return "paradoxical";

  if (t.includes("contradiction") || t.includes("binary"))
    return "dialectical";

  if (t.includes("contrast") || t.includes("paired"))
    return "contrast";

  return "minimal";
}

function computeCoherenceType(stabilityBand, tensionForm) {
  if (stabilityBand === "high" && tensionForm === "paradoxical")
    return "reflective";

  if (stabilityBand === "low" && tensionForm !== "minimal")
    return "oscillatory";

  return "resolved";
}

// ---------- LONGITUDINAL MEASURES ----------

function computeStabilityDelta(current, previous) {
  if (previous === undefined) return 0;
  return Number((current - previous).toFixed(4));
}

function computeVariance(values) {
  if (!values || values.length < 2) return 0;

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) /
    values.length;

  return Number(variance.toFixed(4));
}

function computeTensionShift(forms) {
  if (!forms || forms.length < 3) return "flat";

  const last = forms[forms.length - 1];
  const prev = forms[forms.length - 2];

  if (last === prev) return "flat";
  return "increasing"; // form change detected (no judgment)
}

function computeTrendConfidence(sampleSize, variance) {
  if (sampleSize < 3) return "weak";
  if (variance < 0.01) return "strong";
  return "moderate";
}

// ---------- FINAL ASSEMBLY ----------

function buildLatentMeta(currentProfile, historyProfiles = []) {
  if (!currentProfile) return null;

  // --- Snapshot ---
  const stabilityBand = computeStabilityBand(
    currentProfile.stabilityIndex
  );

  const tensionForm = computeTensionForm(
    currentProfile.cognitiveTension
  );

  const coherenceType =
    computeCoherenceType(stabilityBand, tensionForm);

  // --- Longitudinal ---
  const stabilityValues = historyProfiles
    .map(p => p.stabilityIndex)
    .filter(v => typeof v === "number")
    .slice(-HISTORY_WINDOW);

  const previousStability =
    stabilityValues.length > 1
      ? stabilityValues[stabilityValues.length - 2]
      : undefined;

  const stabilityDelta =
    computeStabilityDelta(
      currentProfile.stabilityIndex,
      previousStability
    );

  const stabilityVariance =
    computeVariance(stabilityValues);

  const tensionForms = historyProfiles
    .map(p => computeTensionForm(p.cognitiveTension));

  const tensionShift =
    computeTensionShift(tensionForms);

  const trendConfidence =
    computeTrendConfidence(
      stabilityValues.length,
      stabilityVariance
    );

  return {
    stabilityBand,
    tensionForm,
    coherenceType,
    stabilityDelta,
    stabilityVariance,
    tensionShift,
    trendConfidence
  };
}

module.exports = { buildLatentMeta };
