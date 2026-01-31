/**
 * Supported languages for translation and TTS
 * Keep this in sync with server/services/indexedTranscript.js
 */
export const SUPPORTED_LANGUAGES = [
  // Indian Languages
  { code: 'hi', name: 'Hindi', region: 'India' },
  { code: 'ta', name: 'Tamil', region: 'India' },
  { code: 'te', name: 'Telugu', region: 'India' },
  { code: 'mr', name: 'Marathi', region: 'India' },
  { code: 'gu', name: 'Gujarati', region: 'India' },
  { code: 'kn', name: 'Kannada', region: 'India' },
  { code: 'ml', name: 'Malayalam', region: 'India' },
  { code: 'pa', name: 'Punjabi', region: 'India' },
  { code: 'bn', name: 'Bengali', region: 'India' },
  { code: 'ur', name: 'Urdu', region: 'India/Pakistan' },
  
  // European Languages
  { code: 'es', name: 'Spanish', region: 'Spain' },
  { code: 'pt', name: 'Portuguese', region: 'Portugal/Brazil' },
  { code: 'fr', name: 'French', region: 'France' },
  { code: 'de', name: 'German', region: 'Germany' },
  { code: 'ru', name: 'Russian', region: 'Russia' },
  { code: 'it', name: 'Italian', region: 'Italy' },
  { code: 'nl', name: 'Dutch', region: 'Netherlands' },
  { code: 'pl', name: 'Polish', region: 'Poland' },
  { code: 'tr', name: 'Turkish', region: 'Turkey' },
  
  // Asian Languages
  { code: 'ja', name: 'Japanese', region: 'Japan' },
  { code: 'ko', name: 'Korean', region: 'Korea' },
  { code: 'zh', name: 'Chinese', region: 'China' },
  { code: 'vi', name: 'Vietnamese', region: 'Vietnam' },
  { code: 'th', name: 'Thai', region: 'Thailand' },
  { code: 'id', name: 'Indonesian', region: 'Indonesia' },
  { code: 'ms', name: 'Malay', region: 'Malaysia' },
  
  // Middle Eastern
  { code: 'ar', name: 'Arabic', region: 'Middle East' },
];

/**
 * Get language name from code
 */
export const getLanguageName = (code) => {
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
  return lang ? lang.name : code;
};

/**
 * Get language display name with region
 */
export const getLanguageDisplayName = (code) => {
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
  return lang ? `${lang.name} (${lang.region})` : code;
};