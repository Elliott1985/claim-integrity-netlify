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
3. Netlify auto-detects build settings from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `build`
4. Click **Deploy site**

---

## Local Development

```bash
npm install
npm start    # Opens http://localhost:3000
```

---

## API Key (Google Gemini — Free)

Get a free key at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)  
No credit card required. Free tier: 1,500 requests/day, resets every 24 hours.

The app calls Gemini 2.5 Flash directly from the browser.  
The key lives only in React state — never stored or logged anywhere.

---

## Demo Mode

No API key? Click **Run Demo Mode** in the sidebar.  
Loads a pre-analyzed mock Xactimate water loss claim (CLM-2024-08471) with  
10 planted billing errors — fully interactive, zero API calls required.

Planted errors include:
- Excessive air movers (12 for 180 SF — should be 3-4)
- Cat 3 PPE billed on a Cat 2 gray water loss
- Net claim math error ($50 overpayment)
- No depreciation applied (ACV = RCV throughout)
- Wallboard removal + wallpaper removal double-dip
- Primer billed standalone + paint with primer (x2 rooms)
- Pre-hung door + separate hinge line item
- Carpet tear-out + pad tear-out billed separately
- Excessive carpet waste (15% vs 10% threshold)
- Excessive LVP waste (18% vs 10% threshold)

---

## Project Structure

```
src/
  App.js           Main UI — sidebar, upload, results dashboard
  App.css          All styles
  geminiApi.js     Google Gemini API call + JSON parsing
  pdfExtract.js    pdf.js wrapper for client-side PDF text extraction
  piiRedact.js     Regex-based PII scrubbing before API call
  systemPrompt.js  Full audit system prompt
  demoData.js      Pre-analyzed mock estimate for demo mode
  index.js         React entry point
  index.css        Global reset
public/
  index.html
netlify.toml       Build config + SPA redirect rule
```
