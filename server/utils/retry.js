function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function expBackoffDelay(attempt, baseMs, maxMs) {
  const exp = Math.min(maxMs, baseMs * Math.pow(2, attempt));
  // jitter 0.7x - 1.3x
  const jitter = exp * (0.7 + Math.random() * 0.6);
  return Math.round(jitter);
}

/**
 * Retries async fn on retryable errors.
 * @param {Function} fn async () => any
 * @param {Object} options
 * @param {number} options.retries number of retries (not total attempts)
 * @param {number} options.baseDelayMs base delay
 * @param {number} options.maxDelayMs cap
 * @param {(err:any)=>boolean} options.shouldRetry
 */
async function withRetry(fn, options) {
  const {
    retries = 3,
    baseDelayMs = 500,
    maxDelayMs = 4000,
    shouldRetry = () => false,
  } = options || {};

  let lastErr;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      lastErr = err;

      const retryable = shouldRetry(err);
      const isLast = attempt >= retries;

      if (!retryable || isLast) throw err;

      const delay = expBackoffDelay(attempt, baseDelayMs, maxDelayMs);
      await sleep(delay);
    }
  }

  throw lastErr;
}

/**
 * Compatibility helper for ttsService.js
 * @param {Function} fn async () => any
 * @param {Object} options
 * @param {number} options.maxRetries
 * @param {number} options.initialDelay
 * @param {number} options.maxDelay
 * @param {number} options.backoffFactor
 * @param {(err:any)=>boolean} options.shouldRetry
 */
async function retryWithBackoff(fn, options) {
  const {
    maxRetries = 3,
    initialDelay = 500,
    maxDelay = 4000,
    backoffFactor = 2,
    shouldRetry = () => true,
  } = options || {};

  let lastErr;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;

      const isLast = attempt >= maxRetries;
      if (isLast || !shouldRetry(err)) throw err;

      // same jitter style
      const base = Math.min(maxDelay, initialDelay * Math.pow(backoffFactor, attempt));
      const delay = Math.round(base * (0.7 + Math.random() * 0.6));
      await sleep(delay);
    }
  }

  throw lastErr;
}

module.exports = { withRetry, retryWithBackoff };
