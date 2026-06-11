import React, { useState, useRef, useCallback } from 'react';
import { extractPdfText } from './pdfExtract';
import { redactPII } from './piiRedact';
import { analyzeEstimate } from './claudeApi';
import './App.css';

// ─── Severity helpers ────────────────────────────────────────────────────────
const SEV_COLOR = { High: '#C0392B', Medium: '#E67E22', Low: '#2980B9' };
const SEV_BG    = { High: '#FDECEA', Medium: '#FEF3E2', Low: '#EBF5FB' };
const RISK_COLOR= { High: '#C0392B', Medium: '#E67E22', Low: '#27AE60' };

function Badge({ sev }) {
  return (
    <span style={{
      background: SEV_BG[sev] || '#F5F5F5',
      color: SEV_COLOR[sev] || '#555',
      border: `1px solid ${SEV_COLOR[sev] || '#ccc'}`,
      borderRadius: 4, padding: '2px 8px',
      fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
    }}>{sev}</span>
  );
}

function MetricCard({ label, value, sub, color }) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value" style={{ color: color || '#323130' }}>{value}</div>
      {sub && <div className="metric-sub">{sub}</div>}
    </div>
  );
}

function SectionHeader({ title }) {
  return <div className="section-header">{title}</div>;
}

function FindingCard({ f, idx }) {
  const [open, setOpen] = useState(false);
  const sev = f.severity || 'Low';
  return (
    <div className="finding-card" style={{ borderLeft: `4px solid ${SEV_COLOR[sev] || '#ccc'}` }}>
      <div className="finding-top" onClick={() => setOpen(o => !o)} style={{ cursor: 'pointer' }}>
        <div className="finding-left">
          <Badge sev={sev} />
          <span className="finding-title">{f.title || `Finding ${idx + 1}`}</span>
        </div>
        <div className="finding-right">
          {f.potential_savings > 0 && (
            <span className="finding-savings">${(f.potential_savings || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          )}
          <span className="chevron">{open ? '▲' : '▼'}</span>
        </div>
      </div>
      {open && (
        <div className="finding-body">
          <div className="finding-row"><span className="finding-lbl">Category:</span> {f.category}</div>
          <div className="finding-row"><span className="finding-lbl">Description:</span> {f.description}</div>
          <div className="finding-row"><span className="finding-lbl">Recommendation:</span> {f.recommendation}</div>
          {f.line_items_affected?.length > 0 && (
            <div className="finding-row"><span className="finding-lbl">Affected codes:</span> {f.line_items_affected.join(', ')}</div>
          )}
        </div>
      )}
    </div>
  );
}

function ComplianceCard({ f }) {
  const [open, setOpen] = useState(false);
  const sev = f.severity || 'Medium';
  return (
    <div className="finding-card" style={{ borderLeft: `4px solid ${SEV_COLOR[sev] || '#ccc'}` }}>
      <div className="finding-top" onClick={() => setOpen(o => !o)} style={{ cursor: 'pointer' }}>
        <div className="finding-left">
          <Badge sev={sev} />
          <span className="finding-title">{f.title}</span>
          <span className="flag-type-badge">{f.flag_type}</span>
        </div>
        <span className="chevron">{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div className="finding-body">
          <div className="finding-row"><span className="finding-lbl">Description:</span> {f.description}</div>
          <div className="finding-row"><span className="finding-lbl">Recommendation:</span> {f.recommendation}</div>
          {f.details?.expected && <div className="finding-row"><span className="finding-lbl">Expected:</span> {f.details.expected}</div>}
          {f.details?.found    && <div className="finding-row"><span className="finding-lbl">Found:</span> {f.details.found}</div>}
          {f.details?.amount != null && <div className="finding-row"><span className="finding-lbl">Amount:</span> ${Number(f.details.amount).toLocaleString()}</div>}
          {f.details?.limit  != null && <div className="finding-row"><span className="finding-lbl">Limit:</span> ${Number(f.details.limit).toLocaleString()}</div>}
        </div>
      )}
    </div>
  );
}

function LineItemsTable({ items }) {
  const [open, setOpen] = useState(false);
  if (!items?.length) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <button className="toggle-btn" onClick={() => setOpen(o => !o)}>
        {open ? '▲ Hide' : '▼ View'} All Line Items ({items.length})
      </button>
      {open && (
        <div className="table-wrap">
          <table className="line-table">
            <thead>
              <tr>{['Code','Description','Qty','Unit','Unit Price','Total','Trade'].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i} className={i % 2 === 0 ? 'row-even' : 'row-odd'}>
                  <td><code>{it.code}</code></td>
                  <td>{it.description}</td>
                  <td className="num">{it.quantity}</td>
                  <td>{it.unit}</td>
                  <td className="num">${Number(it.unit_price || 0).toFixed(2)}</td>
                  <td className="num">${Number(it.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td><span className="trade-badge">{it.trade_code || it.category}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function TradeSummaryBar({ trade_summary }) {
  if (!trade_summary) return null;
  const entries = Object.entries(trade_summary).filter(([, v]) => v?.total > 0);
  if (!entries.length) return null;
  const total = entries.reduce((s, [, v]) => s + (v.total || 0), 0);
  const TRADE_COLORS = {
    WTR:'#2980B9', DRY:'#8E44AD', PNT:'#27AE60', FNC:'#E67E22',
    RFG:'#C0392B', DEM:'#7F8C8D', MLD:'#16A085', GEN:'#2C3E50', PLM:'#D35400', ELC:'#F39C12',
  };
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 12, color: '#605E5C', marginBottom: 6 }}>Trade Breakdown</div>
      <div style={{ display: 'flex', height: 20, borderRadius: 4, overflow: 'hidden', width: '100%' }}>
        {entries.map(([code, v]) => (
          <div key={code} title={`${code}: $${v.total.toLocaleString()}`}
            style={{ width: `${(v.total / total) * 100}%`, background: TRADE_COLORS[code] || '#95A5A6' }} />
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginTop: 8 }}>
        {entries.map(([code, v]) => (
          <div key={code} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: TRADE_COLORS[code] || '#95A5A6' }} />
            <span style={{ color: '#605E5C' }}>{code}</span>
            <span style={{ fontWeight: 600 }}>${v.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            <span style={{ color: '#A19F9D' }}>({v.item_count} items)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [apiKey, setApiKey]         = useState('');
  const [showKey, setShowKey]       = useState(false);
  const [file, setFile]             = useState(null);
  const [dragging, setDragging]     = useState(false);
  const [status, setStatus]         = useState('idle'); // idle | extracting | redacting | analyzing | done | error
  const [statusMsg, setStatusMsg]   = useState('');
  const [result, setResult]         = useState(null);
  const [rawText, setRawText]       = useState('');
  const [showRaw, setShowRaw]       = useState(false);
  const [showJson, setShowJson]     = useState(false);
  const [elapsed, setElapsed]       = useState(null);
  const fileRef = useRef();
  const timerRef = useRef();

  const handleFile = useCallback(f => {
    if (!f || f.type !== 'application/pdf') {
      alert('Please upload a PDF file.');
      return;
    }
    setFile(f);
    setResult(null);
    setRawText('');
    setStatus('idle');
  }, []);

  const onDrop = useCallback(e => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const analyze = async () => {
    if (!file || !apiKey) return;
    const t0 = Date.now();
    timerRef.current = t0;

    try {
      setStatus('extracting');
      setStatusMsg('Extracting PDF text…');
      const text = await extractPdfText(file);
      if (!text.trim()) throw new Error('Could not extract text from PDF. The file may be image-based or corrupted.');
      setRawText(text);

      setStatus('redacting');
      setStatusMsg('Redacting PII…');
      const redacted = redactPII(text);

      setStatus('analyzing');
      setStatusMsg('Analyzing with Claude AI…');
      const data = await analyzeEstimate(redacted, apiKey.trim());

      setElapsed(((Date.now() - t0) / 1000).toFixed(1));
      setResult(data);
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setStatusMsg(err.message || 'Unknown error');
    }
  };

  const canAnalyze = file && apiKey.trim() && status !== 'extracting' && status !== 'redacting' && status !== 'analyzing';
  const isLoading  = ['extracting','redacting','analyzing'].includes(status);

  // ── Computed from result ──
  const leakage   = result?.leakage_findings || [];
  const compFlags = result?.policy_compliance_flags || [];
  const fin       = result?.financial_summary || {};
  const summary   = result?.audit_summary || {};
  const info      = result?.claim_info || {};
  const totalSavings = leakage.reduce((s, f) => s + (f.potential_savings || 0), 0);
  const highFindings = leakage.filter(f => f.severity === 'High').length;

  return (
    <div className="app-layout">
      {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-title">Claim Integrity Engine</div>
          <div className="brand-sub">Xactimate Audit &amp; Leakage Detection</div>
        </div>

        {/* API Key */}
        <div className="sidebar-section">
          <div className="sidebar-label">API Settings</div>
          <label className="input-label">Anthropic API Key</label>
          <div className="key-row">
            <input
              className="key-input"
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-ant-…"
              spellCheck={false}
              autoComplete="off"
            />
            <button className="eye-btn" onClick={() => setShowKey(v => !v)} title={showKey ? 'Hide' : 'Show'}>
              {showKey ? '🙈' : '👁️'}
            </button>
          </div>
          {!apiKey && <div className="key-hint">Get a key at <a href="https://console.anthropic.com" target="_blank" rel="noreferrer">console.anthropic.com</a></div>}
          {apiKey && <div className="key-ok">✓ Key entered</div>}
        </div>

        {/* Upload */}
        <div className="sidebar-section">
          <div className="sidebar-label">Upload Estimate</div>
          <div
            className={`drop-zone ${dragging ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
            onClick={() => fileRef.current.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }}
              onChange={e => handleFile(e.target.files[0])} />
            {file ? (
              <>
                <div className="drop-icon">📄</div>
                <div className="drop-filename">{file.name}</div>
                <div className="drop-filesize">{(file.size / 1024).toFixed(0)} KB</div>
                <button className="clear-btn" onClick={e => { e.stopPropagation(); setFile(null); setResult(null); setStatus('idle'); }}>Remove</button>
              </>
            ) : (
              <>
                <div className="drop-icon">⬆️</div>
                <div className="drop-text">Drop PDF here or click to browse</div>
                <div className="drop-hint">Xactimate estimates only</div>
              </>
            )}
          </div>
        </div>

        {/* Options */}
        <div className="sidebar-section">
          <div className="sidebar-label">Options</div>
          <label className="check-label">
            <input type="checkbox" checked={showRaw} onChange={e => setShowRaw(e.target.checked)} />
            Show extracted text
          </label>
          <label className="check-label">
            <input type="checkbox" checked={showJson} onChange={e => setShowJson(e.target.checked)} />
            Show raw AI response
          </label>
        </div>

        {/* Analyze button */}
        <button
          className={`analyze-btn ${isLoading ? 'loading' : ''}`}
          disabled={!canAnalyze}
          onClick={analyze}
        >
          {isLoading ? statusMsg : '🔍 Analyze Estimate'}
        </button>

        {/* Security notice */}
        <div className="sidebar-section security-block">
          <div className="security-row">✅ PII Redaction Active</div>
          <div className="security-row">🔒 Zero Storage Architecture</div>
          <div className="security-row">🌐 SSL/TLS Encrypted</div>
          <div className="security-row">🛡️ SOC 2 Type II Ready</div>
        </div>

        <div className="sidebar-disclaimer">
          <strong>Disclaimer:</strong> This tool is a proof-of-concept. PII redaction is algorithmic and for demonstration purposes only.
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <main className="main-content">
        {/* Page header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Claim Integrity Engine</h1>
            <p className="page-sub">Xactimate Estimate Analysis &amp; Leakage Detection Platform</p>
          </div>
          {status === 'done' && elapsed && (
            <div className="processed-badge">
              Processed in {elapsed}s · {leakage.length + compFlags.length} findings
            </div>
          )}
        </div>

        {/* ── IDLE STATE ── */}
        {status === 'idle' && !result && (
          <div className="idle-state">
            <div className="idle-icon">🔍</div>
            <h2 className="idle-title">Ready to Audit</h2>
            <p className="idle-body">Upload an Xactimate estimate PDF and enter your Anthropic API key to begin analysis. The engine will scan for financial leakage, billing overlaps, equipment overcounting, and policy compliance issues.</p>
            <div className="feature-grid">
              {[
                ['💧','Water Mitigation','Air mover counts, monitoring days, Cat 2/3 billing'],
                ['🪵','Flooring','Waste percentages, carpet/pad overlap, prep items'],
                ['🔨','Double-Dip Detection','Pre-hung doors, drywall/wallpaper, primer overlap'],
                ['📋','Financial Compliance','Deductible application, depreciation, math errors'],
                ['⚖️','Policy Compliance','COL mismatches, outdated pricing, sub-limit checks'],
                ['🏠','Coverage Limits','Coverage A/B/C validation, trade category totals'],
              ].map(([icon, title, desc]) => (
                <div key={title} className="feature-card">
                  <div className="feature-icon">{icon}</div>
                  <div className="feature-title">{title}</div>
                  <div className="feature-desc">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── LOADING STATE ── */}
        {isLoading && (
          <div className="loading-state">
            <div className="spinner" />
            <div className="loading-msg">{statusMsg}</div>
            <div className="loading-steps">
              {['Extracting PDF text','Redacting PII','Analyzing with Claude AI'].map((step, i) => {
                const stepStatus = ['extracting','redacting','analyzing'][i];
                const isActive   = status === stepStatus;
                const isDone     = ['extracting','redacting','analyzing'].indexOf(status) > i;
                return (
                  <div key={step} className={`loading-step ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
                    <span className="step-dot">{isDone ? '✓' : isActive ? '●' : '○'}</span>
                    {step}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ERROR STATE ── */}
        {status === 'error' && (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <div className="error-title">Analysis Failed</div>
            <div className="error-msg">{statusMsg}</div>
            <button className="analyze-btn" style={{ marginTop: 16, maxWidth: 200 }}
              onClick={() => setStatus('idle')}>Try Again</button>
          </div>
        )}

        {/* ── RAW TEXT ── */}
        {showRaw && rawText && (
          <div style={{ marginBottom: 20 }}>
            <SectionHeader title="Extracted PDF Text" />
            <pre className="raw-block">{rawText.slice(0, 5000)}{rawText.length > 5000 ? '\n\n[truncated…]' : ''}</pre>
          </div>
        )}

        {/* ── RESULTS ── */}
        {result && status === 'done' && (
          <div className="results">

            {/* KPI row */}
            <div className="kpi-row">
              <MetricCard label="Risk Level" value={summary.risk_level || '—'}
                color={RISK_COLOR[summary.risk_level] || '#323130'}
                sub={`Score: ${summary.accuracy_score ?? '—'}/100`} />
              <MetricCard label="Potential Leakage" value={`$${totalSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                color="#C0392B" sub={`${leakage.length} finding${leakage.length !== 1 ? 's' : ''}`} />
              <MetricCard label="High Severity" value={highFindings}
                color={highFindings > 0 ? '#C0392B' : '#27AE60'}
                sub="leakage findings" />
              <MetricCard label="Compliance Flags" value={compFlags.length}
                color={compFlags.length > 0 ? '#E67E22' : '#27AE60'}
                sub={`Pricing: ${summary.pricing_status || '—'}`} />
            </div>

            {/* Claim Info */}
            <SectionHeader title="Claim Information" />
            <div className="info-grid">
              {[
                ['Claim Number',   info.claim_number   || '—'],
                ['Date of Loss',   info.date_of_loss   || '—'],
                ['Cause of Loss',  info.cause_of_loss  || '—'],
                ['Claim Type',     info.claim_type     || '—'],
                ['Price List',     info.price_list     || '—'],
                ['Estimate Date',  info.estimate_date  || '—'],
              ].map(([k, v]) => (
                <div key={k} className="info-item">
                  <div className="info-key">{k}</div>
                  <div className="info-val">{v}</div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <SectionHeader title="Financial Summary" />
            <div className="fin-grid">
              <div className="fin-block">
                {[
                  ['Gross Estimate', fin.gross_estimate],
                  ['Depreciation',   fin.depreciation],
                  ['ACV',            fin.acv],
                ].map(([k, v]) => (
                  <div key={k} className="fin-row">
                    <span className="fin-label">{k}</span>
                    <span className="fin-value">${(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
                <div className="fin-divider" />
                {[
                  ['Deductible', fin.deductible],
                  ['Net Claim',  fin.net_claim],
                ].map(([k, v]) => (
                  <div key={k} className="fin-row fin-row-bold">
                    <span className="fin-label">{k}</span>
                    <span className="fin-value">${(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>
              <div className="fin-block">
                <div className={`deductible-status ${fin.deductible_applied_correctly ? 'ok' : 'err'}`}>
                  {fin.deductible_applied_correctly
                    ? '✅ Deductible correctly applied'
                    : '❌ Deductible calculation error detected'}
                </div>
                {/* Expected net check */}
                {fin.gross_estimate && fin.deductible && (() => {
                  const expected = Math.max(0, (fin.acv || fin.gross_estimate) - fin.deductible);
                  const diff = Math.abs((fin.net_claim || 0) - expected);
                  if (diff > 1) return (
                    <div className="deductible-status err" style={{ marginTop: 8 }}>
                      ⚠️ Net claim discrepancy: expected ${expected.toLocaleString('en-US', { minimumFractionDigits: 2 })}, got ${(fin.net_claim || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  );
                  return null;
                })()}
                <TradeSummaryBar trade_summary={result.trade_summary} />
              </div>
            </div>

            {/* Leakage Findings */}
            {leakage.length > 0 && (
              <>
                <SectionHeader title={`Leakage Findings — $${totalSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })} potential savings`} />
                {leakage
                  .slice()
                  .sort((a, b) => ({ High: 0, Medium: 1, Low: 2 }[a.severity] - { High: 0, Medium: 1, Low: 2 }[b.severity]))
                  .map((f, i) => <FindingCard key={i} f={f} idx={i} />)}
              </>
            )}
            {leakage.length === 0 && status === 'done' && (
              <div className="all-clear">✅ No leakage issues detected</div>
            )}

            {/* Compliance Flags */}
            {compFlags.length > 0 && (
              <>
                <SectionHeader title="Policy Compliance Flags" />
                {compFlags.map((f, i) => <ComplianceCard key={i} f={f} />)}
              </>
            )}

            {/* Line Items */}
            <SectionHeader title="Line Items" />
            <LineItemsTable items={result.line_items} />

            {/* Raw JSON */}
            {showJson && (
              <>
                <SectionHeader title="Raw AI Response (JSON)" />
                <pre className="raw-block">{JSON.stringify(result, null, 2)}</pre>
              </>
            )}

          </div>
        )}
      </main>
    </div>
  );
}
