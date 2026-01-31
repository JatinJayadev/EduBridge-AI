const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

function getLevel() {
  const raw = (process.env.LOG_LEVEL || 'warn').toLowerCase();
  return LEVELS[raw] ?? LEVELS.warn;
}

function shouldLog(level) {
  return LEVELS[level] <= getLevel();
}

function safeMeta(meta) {
  if (!meta) return undefined;
  // Prevent accidental big dumps to console
  const { prompt, input, transcript, indexedLines, ...rest } = meta;
  return rest;
}

function log(level, message, meta) {
  if (!shouldLog(level)) return;
  const cleaned = safeMeta(meta);
  if (cleaned) console[level](`[${level.toUpperCase()}] ${message}`, cleaned);
  else console[level](`[${level.toUpperCase()}] ${message}`);
}

module.exports = {
  error: (msg, meta) => log('error', msg, meta),
  warn: (msg, meta) => log('warn', msg, meta),
  info: (msg, meta) => log('info', msg, meta),
  debug: (msg, meta) => log('debug', msg, meta),
};