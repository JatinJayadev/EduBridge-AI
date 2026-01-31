const { withRetry } = require('../utils/retry');
const logger = require('../utils/logger');
const { generateText, isRetryableOpenAIError } = require('../clients/openaiClient');
const {
  buildTranslateInstructions,
  buildTranslateInput,
  parseNumberedOutputToArray,
  chunkIndexedLines,
} = require('./indexedTranscript');

function getConfig() {
  return {
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    timeoutMs: Number(process.env.OPENAI_TIMEOUT_MS || 30000),
    maxRetries: Number(process.env.OPENAI_MAX_RETRIES || 3),
    maxChunkChars: Number(process.env.OPENAI_MAX_CHUNK_CHARS || 12000),
  };
}

/**
 * Translates numbered lines and returns translatedLines array in the same order with numbering.
 * Example input: ["1. Hello", "2. Welcome"]
 * Example output: ["1. हैलो", "2. स्वागत है"]
 */
async function translateIndexedLines({ indexedLines, targetLanguage }) {
  const { model, timeoutMs, maxRetries, maxChunkChars } = getConfig();

  const chunks = chunkIndexedLines(indexedLines, maxChunkChars);

  const allTranslated = [];
  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
    const linesChunk = chunks[chunkIndex];

    const instructions = buildTranslateInstructions(targetLanguage);
    const input = buildTranslateInput(linesChunk);

    logger.info('OpenAI translate chunk start', {
      chunkIndex,
      chunksTotal: chunks.length,
      model,
      timeoutMs,
      targetLanguage,
      targetLanguageName: instructions.match(/into ([^.]+)/)?.[1] || targetLanguage,
    });

    const outputText = await withRetry(
      async (attempt) => {
        logger.debug('OpenAI attempt', { attempt, chunkIndex });
        return await generateText({ model, instructions, input, timeoutMs });
      },
      {
        retries: maxRetries,
        baseDelayMs: 600,
        maxDelayMs: 6000,
        shouldRetry: isRetryableOpenAIError,
      }
    );

    const translatedArray = parseNumberedOutputToArray(outputText);

    // Safety: if parsing failed, fall back to raw output as single block
    if (!translatedArray.length) {
      logger.warn('OpenAI output parse produced empty result; storing raw output', { chunkIndex });
      allTranslated.push(outputText);
      continue;
    }

    // Add all translated lines (they already have numbering: "1. text")
    for (const t of translatedArray) allTranslated.push(t);
  }

  return allTranslated;
}

module.exports = { translateIndexedLines };