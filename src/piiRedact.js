/* eslint-disable no-useless-escape */
// PII redaction before sending text to Claude API
export function redactPII(text) {
  let result = text;

  // Email addresses
  result = result.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '[REDACTED_PII]');

  // Phone numbers
  const phonePatterns = [
    /\b\d{3}[.\s-]?\d{3}[.\s-]?\d{4}\b/g,
    /\(\d{3}\)\s*\d{3}[.\s-]?\d{4}/g,
    /\+1\s*\d{3}[.\s-]?\d{3}[.\s-]?\d{4}/g,
  ];
  phonePatterns.forEach(p => { result = result.replace(p, '[REDACTED_PII]'); });

  // SSN
  result = result.replace(/\b\d{3}[\s-]?\d{2}[\s-]?\d{4}\b/g, '[REDACTED_PII]');

  // Street addresses
  result = result.replace(
    /\b\d+\s+[A-Za-z]+(?:\s+[A-Za-z]+)*\s+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Court|Ct|Boulevard|Blvd|Way|Circle|Cir|Place|Pl)\b/gi,
    '[REDACTED_PII]'
  );

  // Named fields
  const nameLabels = [
    /(Insured\s*[:-]?\s*)([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})/gi,
    /(Insured Name\s*[:-]?\s*)([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})/gi,
    /(Policy\s*Holder\s*[:-]?\s*)([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})/gi,
    /(Claimant\s*[:-]?\s*)([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})/gi,
    /(Homeowner\s*[:-]?\s*)([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})/gi,
  ];
  nameLabels.forEach(p => {
    result = result.replace(p, (_, label) => `${label}[REDACTED_PII]`);
  });

  return result;
}
