// Demo mode output — mirrors the CLM-2024-08471 mock Xactimate estimate
// with all 10 planted errors pre-analyzed. No API key required.
const DEMO_RESULT = {
  claim_info: {
    claim_number: "CLM-2024-08471",
    insured_name: "REDACTED",
    date_of_loss: "08/14/2024",
    cause_of_loss: "Water",
    claim_type: "Water",
    price_list: "GAATL9AUG24",
    price_list_date: "2024-08-01",
    estimate_date: "08/19/2024"
  },
  financial_summary: {
    gross_estimate: 9247.82,
    depreciation: 0,
    acv: 9247.82,
    deductible: 1000.00,
    net_claim: 8297.82,
    deductible_applied_correctly: false
  },
  line_items: [
    { code: "WTR-AIRF", description: "Air Mover Fan - per day", quantity: 12, unit: "DA", unit_price: 35.00, total: 2940.00, category: "Water", trade_code: "WTR" },
    { code: "WTR-DEHU", description: "Dehumidifier LGR - per day", quantity: 2, unit: "DA", unit_price: 89.00, total: 178.00, category: "Water", trade_code: "WTR" },
    { code: "WTR-PPE3", description: "PPE - Tyvek Suit / Respirator - Cat 3 Biohazard", quantity: 4, unit: "EA", unit_price: 48.00, total: 192.00, category: "Water", trade_code: "WTR" },
    { code: "WTR-ANTI", description: "Antimicrobial Treatment - apply", quantity: 180, unit: "SF", unit_price: 0.38, total: 68.40, category: "Water", trade_code: "WTR" },
    { code: "WTR-DMON", description: "Daily Monitoring Labor - per visit", quantity: 7, unit: "DA", unit_price: 75.00, total: 525.00, category: "Water", trade_code: "WTR" },
    { code: "DRY-R&R", description: "Drywall - 1/2\" - remove & replace", quantity: 180, unit: "SF", unit_price: 3.85, total: 693.00, category: "General", trade_code: "DRY" },
    { code: "DEM-HAUL", description: "Haul Off / Debris Removal - per load", quantity: 2, unit: "EA", unit_price: 95.00, total: 190.00, category: "General", trade_code: "DEM" },
    { code: "DRY-REM",  description: "Wallboard - remove", quantity: 180, unit: "SF", unit_price: 0.62, total: 111.60, category: "General", trade_code: "DRY" },
    { code: "PNT-WREM", description: "Wallpaper - remove", quantity: 180, unit: "SF", unit_price: 0.55, total: 99.00, category: "General", trade_code: "PNT" },
    { code: "PNT-PRM",  description: "Primer - 1 coat, standalone", quantity: 180, unit: "SF", unit_price: 0.52, total: 93.60, category: "General", trade_code: "PNT" },
    { code: "PNT-2CT",  description: "Paint - 2 coats with primer", quantity: 180, unit: "SF", unit_price: 1.10, total: 198.00, category: "General", trade_code: "PNT" },
    { code: "FNF-BASE", description: "Baseboard - 3-1/4\" paint grade", quantity: 42, unit: "LF", unit_price: 3.20, total: 134.40, category: "General", trade_code: "GEN" },
    { code: "FCC-TCPT", description: "Carpet - tear out", quantity: 220, unit: "SF", unit_price: 0.33, total: 72.60, category: "Flooring", trade_code: "FNC" },
    { code: "FCC-TPAD", description: "Carpet pad - tear out", quantity: 220, unit: "SF", unit_price: 0.14, total: 30.80, category: "Flooring", trade_code: "FNC" },
    { code: "FCC-INST", description: "Carpet - install", quantity: 220, unit: "SF", unit_price: 1.95, total: 429.00, category: "Flooring", trade_code: "FNC" },
    { code: "FCC-PAD",  description: "Carpet pad - 6 lb rebond", quantity: 220, unit: "SF", unit_price: 0.62, total: 136.40, category: "Flooring", trade_code: "FNC" },
    { code: "FCC-WSTE", description: "Carpet - waste / cut-off allowance", quantity: 33, unit: "SF", unit_price: 1.95, total: 64.35, category: "Flooring", trade_code: "FNC" },
    { code: "DOR-PHNG", description: "Door - pre-hung, interior 2/8", quantity: 1, unit: "EA", unit_price: 285.00, total: 285.00, category: "General", trade_code: "GEN" },
    { code: "DOR-HING", description: "Door hinges - 3-pack (already incl in pre-hung)", quantity: 1, unit: "EA", unit_price: 22.00, total: 22.00, category: "General", trade_code: "GEN" },
    { code: "PLB-SMIN", description: "Plumber - service call / minimum charge", quantity: 1, unit: "EA", unit_price: 145.00, total: 145.00, category: "General", trade_code: "GEN" },
    { code: "FNC-RVNL", description: "Vinyl plank LVP - remove & replace", quantity: 85, unit: "SF", unit_price: 4.75, total: 403.75, category: "Flooring", trade_code: "FNC" },
    { code: "FNC-WSTE", description: "LVP - waste allowance (18%)", quantity: 15, unit: "SF", unit_price: 4.75, total: 71.25, category: "Flooring", trade_code: "FNC" },
    { code: "GEN-CONT", description: "Content manipulation / move", quantity: 1, unit: "HR", unit_price: 45.00, total: 45.00, category: "General", trade_code: "GEN" },
  ],
  trade_summary: {
    WTR: { item_count: 5, total: 3903.40 },
    DRY: { item_count: 2, total: 804.60 },
    PNT: { item_count: 3, total: 390.60 },
    FNC: { item_count: 6, total: 1207.15 },
    DEM: { item_count: 1, total: 190.00 },
    GEN: { item_count: 5, total: 497.00 },
    MLD: { item_count: 0, total: 0 },
    RFG: { item_count: 0, total: 0 },
  },
  property_details: {
    total_sqft_affected: 485,
    roof_type: null,
    water_category: 2
  },
  policy_compliance_flags: [
    {
      flag_type: "SUBLIMIT_EXCEEDED",
      severity: "High",
      title: "Water Mitigation Sub-Limit Exceeded",
      description: "WTR trade total of $3,903.40 approaches the $15,000 sub-limit but includes Cat 3 PPE on a documented Cat 2 loss, inflating the total.",
      details: { expected: "Cat 2 appropriate billing", found: "Cat 3 Biohazard PPE billed", affected_items: ["WTR-PPE3"], amount: 192.00, limit: 15000 },
      recommendation: "Remove Cat 3 PPE items or reclassify water category to Cat 3 with supporting documentation."
    },
    {
      flag_type: "COL_MISMATCH",
      severity: "Medium",
      title: "Category 3 Biohazard Items on Cat 2 Loss",
      description: "Claim is documented as Category 2 (Gray Water) but includes Tyvek suits and respirators typically reserved for Category 3 (Black Water/Sewage) losses.",
      details: { expected: "Cat 2 standard PPE", found: "WTR-PPE3: Cat 3 Biohazard PPE", affected_items: ["WTR-PPE3"], amount: 192.00, limit: null },
      recommendation: "Verify water category. If truly Cat 2, remove Cat 3 PPE. If sewage contamination was present, upgrade category documentation."
    }
  ],
  leakage_findings: [
    {
      category: "Water Mitigation",
      severity: "High",
      title: "Excessive Air Mover Count — Kitchen (180 SF)",
      description: "12 air movers billed for 180 SF kitchen. Industry standard is 1 per 50–70 SF, meaning 3–4 units are appropriate. 8–9 units represent potential leakage.",
      line_items_affected: ["WTR-AIRF"],
      potential_savings: 315.00,
      recommendation: "Reduce to 3–4 air movers consistent with IICRC S500 standards for the documented affected area."
    },
    {
      category: "Financial",
      severity: "High",
      title: "Net Claim Calculation Error — $50.00 Variance",
      description: "Net claim stated as $8,297.82 but RCV $9,247.82 minus $1,000.00 deductible = $8,247.82. Overpayment of $50.00 detected.",
      line_items_affected: [],
      potential_savings: 50.00,
      recommendation: "Recalculate net claim: Gross RCV − Deductible = $8,247.82. Correct before issuing payment."
    },
    {
      category: "Financial",
      severity: "High",
      title: "No Depreciation Applied — Full RCV Billed as ACV",
      description: "ACV equals RCV on every line item. No depreciation schedule is attached. Policy requires ACV worksheet for items over 5 years old. This represents potential overpayment across the entire estimate.",
      line_items_affected: [],
      potential_savings: 924.78,
      recommendation: "Complete ACV depreciation worksheet for all applicable line items. Flooring and drywall typically carry 10–20% depreciation on aged homes."
    },
    {
      category: "General",
      severity: "Medium",
      title: "Double-Dip: Wallboard Removal + Wallpaper Removal (Kitchen)",
      description: "DRY-REM (wallboard remove) and PNT-WREM (wallpaper remove) billed in the same room. Removing drywall inherently removes any wallpaper attached to it — these cannot both be legitimate.",
      line_items_affected: ["DRY-REM", "PNT-WREM"],
      potential_savings: 99.00,
      recommendation: "Remove PNT-WREM wallpaper line item. Wallpaper removal is included in drywall demolition scope."
    },
    {
      category: "General",
      severity: "Medium",
      title: "Double-Dip: Standalone Primer + Paint With Primer (Kitchen & Bedroom)",
      description: "PNT-PRM (primer standalone) and PNT-2CT (paint with primer) billed in both kitchen and master bedroom. Primer is already included in the 2-coat paint line — billing it separately is a duplicate charge.",
      line_items_affected: ["PNT-PRM", "PNT-2CT"],
      potential_savings: 143.52,
      recommendation: "Remove PNT-PRM standalone primer from both rooms. Use PNT-2CT only, which includes primer in the unit price."
    },
    {
      category: "General",
      severity: "Medium",
      title: "Double-Dip: Pre-Hung Door + Separate Hinge Line Item",
      description: "DOR-PHNG (pre-hung door) and DOR-HING (door hinges) billed separately. Pre-hung door units include hinges as part of the unit per Xactimate pricing standards.",
      line_items_affected: ["DOR-PHNG", "DOR-HING"],
      potential_savings: 22.00,
      recommendation: "Remove DOR-HING. Hinges are included in the pre-hung door unit price."
    },
    {
      category: "General",
      severity: "Medium",
      title: "Double-Dip: Demolition + Separate Haul-Off Charge",
      description: "DEM-HAUL (haul off/debris removal) billed separately from drywall demo scope. Debris removal is typically included in demolition line items per Xactimate standard.",
      line_items_affected: ["DEM-HAUL", "DRY-R&R"],
      potential_savings: 190.00,
      recommendation: "Verify whether haul-off is separately justified or included in demo unit pricing. Remove if duplicative."
    },
    {
      category: "Flooring",
      severity: "Medium",
      title: "Double-Dip: Carpet Tear-Out + Pad Tear-Out Billed Separately",
      description: "FCC-TCPT (carpet tear out) and FCC-TPAD (pad tear out) billed as separate line items. Industry standard includes pad removal within carpet tear-out.",
      line_items_affected: ["FCC-TCPT", "FCC-TPAD"],
      potential_savings: 30.80,
      recommendation: "Remove FCC-TPAD. Carpet pad removal is included in carpet tear-out per Xactimate FCC code definitions."
    },
    {
      category: "Flooring",
      severity: "Low",
      title: "Excessive Carpet Waste — Master Bedroom (15%)",
      description: "Carpet waste billed at 33 SF / 220 SF = 15% of install area. Standard threshold for simple rectangular rooms is 10%. Excess of 5% (~11 SF) represents unnecessary overage.",
      line_items_affected: ["FCC-WSTE"],
      potential_savings: 21.45,
      recommendation: "Reduce carpet waste to 10% (22 SF) for standard rectangular bedroom. Higher waste is only justified for irregular cuts, stairs, or pattern matching."
    },
    {
      category: "Flooring",
      severity: "Low",
      title: "Excessive LVP Waste — Hallway (18%)",
      description: "LVP waste billed at 15 SF / 85 SF = 18% for a straight corridor. Standard is 10% for simple layouts. Excess of 8% (~7 SF) represents overcharge.",
      line_items_affected: ["FNC-WSTE"],
      potential_savings: 33.25,
      recommendation: "Reduce LVP waste to 10% (9 SF) for straight hallway. Justify higher waste only if diagonal cuts or pattern alignment is required."
    }
  ],
  audit_summary: {
    total_leakage_found: 1829.80,
    leakage_count: 10,
    compliance_flags_count: 2,
    risk_level: "High",
    accuracy_score: 31,
    pricing_status: "Current"
  }
};

export default DEMO_RESULT;
