# Claim Integrity Engine — Netlify Edition

Xactimate Estimate Analysis & Leakage Detection Platform  
**Static React app — deploys directly to Netlify with zero backend.**

---

## Deploy to Netlify (3 steps)

### Option A — Drag & Drop (fastest)
1. Run `npm install && npm run build` locally
2. Drag the `build/` folder into [app.netlify.com/drop](https://app.netlify.com/drop)
3. Done — live in 30 seconds

### Option B — GitHub + Netlify CI (recommended)
1. Push this folder to a GitHub repo
2. Go to [app.netlify.com](https://app.netlify.com) → **Add new site → Import from Git**
3. Select your repo — Netlify auto-detects the build settings from `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `build`
4. Click **Deploy site**

---

## Local Development

```bash
npm install
npm start          # Opens http://localhost:3000
```

---

## How It Works

This is a fully static app — no server, no Python, no backend.

| Layer | Technology |
|---|---|
| UI | React 18 |
| PDF extraction | pdf.js (loaded from CDN at runtime) |
| PII redaction | Client-side regex (see `src/piiRedact.js`) |
| AI analysis | Anthropic Claude API (called directly from browser) |
| Hosting | Netlify static CDN |

The user's API key is entered in the UI, held only in React state, and sent
directly to `api.anthropic.com` — it is never stored or logged anywhere.

---

## API Key

Users provide their own Anthropic API key in the sidebar.  
Get one at [console.anthropic.com](https://console.anthropic.com).

The app uses `claude-sonnet-4-20250514` with `anthropic-dangerous-allow-browser: true`
which is required for direct browser-to-API calls.

---

## Project Structure

```
src/
  App.js           # Main UI — sidebar, upload, results dashboard
  App.css          # All styles (Microsoft Fluent-inspired)
  claudeApi.js     # Anthropic API call + JSON parsing
  pdfExtract.js    # pdf.js wrapper for client-side PDF text extraction
  piiRedact.js     # Regex-based PII scrubbing before API call
  systemPrompt.js  # Full audit system prompt (ported from Python version)
  index.js         # React entry point
  index.css        # Global reset
public/
  index.html
netlify.toml       # Build config + SPA redirect rule
```

---

## Audit Capabilities

- **Water Mitigation** — air mover counts, monitoring days, Cat 2/3 billing
- **Flooring** — waste percentages, carpet/pad overlap, prep items
- **Roofing** — waste factors, starter/drip edge overlap, ice & water shield
- **Double-Dip Detection** — pre-hung doors + hinges, drywall + wallpaper, paint + primer
- **Financial Compliance** — deductible application, depreciation, math errors
- **Policy Compliance** — COL mismatches, outdated pricing, sub-limit enforcement
- **Coverage Limits** — Coverage A/B/C validation, trade category totals
