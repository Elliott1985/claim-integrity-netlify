import SYSTEM_PROMPT from './systemPrompt';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';
const MAX_TEXT_CHARS = 80000;

export async function analyzeEstimate(pdfText, apiKey) {
  const truncated = pdfText.length > MAX_TEXT_CHARS
    ? pdfText.slice(0, MAX_TEXT_CHARS)
    : pdfText;

  const userPrompt = `---\nXACTIMATE ESTIMATE TEXT TO ANALYZE:\n---\n${truncated}\n---\n\nAnalyze the above estimate and return the JSON audit report.`;

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-allow-browser': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  const raw = data.content?.[0]?.text || '';

  // Strip markdown code fences if present
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error('AI returned invalid JSON. Raw response: ' + raw.slice(0, 300));
  }
}
