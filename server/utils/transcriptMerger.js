/**
 * Merges translated lines with original transcript timing data.
 * 
 * @param {Array} originalTranscript - Original transcript with timing: [{ text, start, duration }]
 * @param {Array} translatedLines - Translated indexed lines: ["1. translated", "2. text", ...]
 * @returns {Array} Merged transcript with timing: [{ text: "translated", start, duration, originalText }]
 */
function mergeTranslatedWithTiming(originalTranscript, translatedLines) {
  if (!Array.isArray(originalTranscript) || originalTranscript.length === 0) {
    return [];
  }

  if (!Array.isArray(translatedLines) || translatedLines.length === 0) {
    return [];
  }

  // Remove numbering from translated lines: "1. text" → "text"
  const cleanedTranslations = translatedLines.map((line) => {
    const match = line.match(/^\d+\.\s*(.*)$/);
    return match ? match[1].trim() : line.trim();
  });

  // Merge with original timing
  const merged = originalTranscript.map((item, index) => {
    return {
      text: cleanedTranslations[index] || item.text, // Use translation or fallback to original
      start: item.start,
      duration: item.duration,
      originalText: item.text,
    };
  });

  return merged;
}

module.exports = { mergeTranslatedWithTiming };