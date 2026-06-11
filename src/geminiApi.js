import SYSTEM_PROMPT from './systemPrompt';

const MAX_TEXT_CHARS = 80000;

export async function analyzeEstimate(pdfText, apiKey) {
  const truncated = pdfText.length > MAX_TEXT_CHARS
    ? pdfText.slice(0, MAX_TEXT_CHARS)
    : pdfText;

  const userPrompt = `---\nXACTIMATE ESTIMATE TEXT TO ANALYZE:\n---\n${truncated}\n---\n\nAnalyze the above estimate and return the JSON audit report.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey.trim())}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 16000,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = err?.error?.message || `Gemini API error ${response.status}`;
    throw new Error(msg);
  }

  const data = await response.json();
  const candidate = data?.candidates?.[0];
  const finishReason = candidate?.finishReason;
  const raw = candidate?.content?.parts?.[0]?.text || '';

  if (!raw) throw new Error('Gemini returned an empty response. Check your API key and quota.');

  // Detect mid-stream truncation before attempting to parse
  if (finishReason === 'MAX_TOKENS') {
    throw new Error(
      'Gemini response was cut off (MAX_TOKENS). The estimate may be too large — '
      + 'try a shorter PDF or contact support.'
    );
  }

  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error('AI returned invalid JSON. Raw: ' + raw.slice(0, 300));
  }
}
