function normalizeIndexedLines(indexedLines) {
  if (!Array.isArray(indexedLines)) return [];
  return indexedLines
    .map((x) => (typeof x === 'string' ? x.trim() : ''))
    .filter(Boolean);
}

/**
 * Parse output like:
 * 1. Hola
 * 2. Bienvenidos
 *
 * Returns array WITH numbering preserved: ["1. Hola", "2. Bienvenidos"]
 */
function parseNumberedOutputToArray(outputText) {
  const text = String(outputText || '').trim();
  if (!text) return [];

  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  const parsed = [];
  for (const line of lines) {
    const m = line.match(/^(\d+)\.\s*(.*)$/);
    if (!m) continue;
    const idx = Number(m[1]);
    const value = (m[2] || '').trim();
    if (!Number.isFinite(idx) || idx <= 0) continue;
    
    // Store with numbering: "1. value"
    parsed[idx - 1] = `${idx}. ${value}`;
  }

  // Compact but preserve ordering gaps as empty string
  return parsed.filter((v) => typeof v === 'string');
}

/**
 * Map language code to full language name for OpenAI
 */
function getLanguageName(languageCode) {
  const languageMap = {
    'hi': 'Hindi',
    'ta': 'Tamil',
    'es': 'Spanish',
    'pt': 'Portuguese',
    'fr': 'French',
    'de': 'German',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese',
    'ar': 'Arabic',
    'ru': 'Russian',
    'it': 'Italian',
    'nl': 'Dutch',
    'pl': 'Polish',
    'tr': 'Turkish',
    'vi': 'Vietnamese',
    'th': 'Thai',
    'id': 'Indonesian',
    'ms': 'Malay',
    'bn': 'Bengali',
    'te': 'Telugu',
    'mr': 'Marathi',
    'gu': 'Gujarati',
    'kn': 'Kannada',
    'ml': 'Malayalam',
    'pa': 'Punjabi',
    'ur': 'Urdu',
  };
  
  return languageMap[languageCode] || languageCode;
}

function buildTranslateInstructions(targetLanguage) {
  const languageName = getLanguageName(targetLanguage);
  
  return [
    `Translate the following transcript into ${languageName}.`,
    `Use natural, casual, spoken ${languageName}, like how a real person would speak.`,
    `Maintain the same emotional tone, intensity, and style as the original.`,
    `Do NOT make it formal or literary.`,
    `Keep numbering exactly the same.`,
    `Return ONLY the numbered lines, one per line.`,
    `Do not add explanations or extra text.`,
  ].join('\n');
}

function buildTranslateInput(indexedLines) {
  return normalizeIndexedLines(indexedLines).join('\n');
}

function chunkIndexedLines(indexedLines, maxChars) {
  const chunks = [];
  let current = [];
  let currentLen = 0;

  for (const line of normalizeIndexedLines(indexedLines)) {
    // +1 for newline
    const addLen = line.length + 1;

    if (currentLen + addLen > maxChars && current.length > 0) {
      chunks.push(current);
      current = [];
      currentLen = 0;
    }

    current.push(line);
    currentLen += addLen;
  }

  if (current.length > 0) chunks.push(current);

  return chunks;
}

module.exports = {
  normalizeIndexedLines,
  parseNumberedOutputToArray,
  buildTranslateInstructions,
  buildTranslateInput,
  chunkIndexedLines,
};