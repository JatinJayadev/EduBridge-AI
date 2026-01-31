const OpenAI = require('openai');

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function createOpenAIClient() {
  return new OpenAI({
    apiKey: requireEnv('OPENAI_API_KEY'),
  });
}

/**
 * Best-effort extraction of text from different SDK response shapes.
 */
function extractTextFromResponse(resp) {
  if (!resp) return '';

  // Newer SDKs / Responses API often provide output_text
  if (typeof resp.output_text === 'string') return resp.output_text;

  // Sometimes "output" is an array of content parts
  if (Array.isArray(resp.output)) {
    const texts = [];
    for (const item of resp.output) {
      // Typical: { content: [ { type: 'output_text', text: '...' } ] }
      if (Array.isArray(item.content)) {
        for (const c of item.content) {
          if (c && typeof c.text === 'string') texts.push(c.text);
        }
      }
    }
    if (texts.length) return texts.join('\n');
  }

  // Fallback: chat.completions shape
  if (resp.choices?.[0]?.message?.content) return resp.choices[0].message.content;

  return '';
}

function isRetryableOpenAIError(err) {
  const status = err?.status || err?.statusCode;
  // Retry common transient cases
  if (status === 408 || status === 409 || status === 429) return true;
  if (status >= 500 && status <= 599) return true;

  // network-ish
  const msg = (err?.message || '').toLowerCase();
  if (msg.includes('timeout') || msg.includes('econnreset') || msg.includes('fetch failed')) return true;

  return false;
}

async function generateText({ model, instructions, input, timeoutMs }) {
  const client = createOpenAIClient();

  // Prefer Responses API when available
  if (client.responses && typeof client.responses.create === 'function') {
    const resp = await client.responses.create(
      {
        model,
        instructions,
        input,
      },
      { timeout: timeoutMs }
    );
    return extractTextFromResponse(resp);
  }

  // Fallback: Chat Completions (older SDKs)
  const resp = await client.chat.completions.create(
    {
      model,
      messages: [
        { role: 'system', content: instructions },
        { role: 'user', content: input },
      ],
    },
    { timeout: timeoutMs }
  );
  return extractTextFromResponse(resp);
}

module.exports = {
  generateText,
  isRetryableOpenAIError,
};