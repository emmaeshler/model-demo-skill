// ---------------------------------------------------------------------------
//  prospect-config.ts
//  Single source of truth for all customizable demo data.
//  The /tailor skill rewrites values in this file to customize for a prospect.
// ---------------------------------------------------------------------------

// ── Types ──────────────────────────────────────────────────────────────────

export interface ProspectMeta {
  prospectName: string;
  vertical: string;
  slug: string;
  presentationTitle?: string;
}

export interface DataCounts {
  accounts: number;
  skus: number;
  orders: number;
  marketFeatures: number;
  monthsOfData: number;
}

export interface DataLabels {
  accounts: string;
  skus: string;
  orders: string;
  marketFeatures: string;
  monthsOfData: string;
}

export interface Slider {
  label: string;
  value: number;
}

export interface CustomerScenario {
  name: string;
  segment: string;
  price: string;
  delta: string;
  winProb: string;
  margin: string;
  narrative: string;
  sliders: Slider[];
  color: string;
}

export interface PricingFactor {
  label: string;
  category: "product" | "market" | "customer" | "order";
  emphasis?: "highlight" | "crossoff" | "deemphasize";
}

export interface PricingFactors {
  customer: PricingFactor[];
  product: PricingFactor[];
  market: PricingFactor[];
  order: PricingFactor[];
}

export interface SelectedDriver {
  label: string;
  color: string;
  weight: number;
  note: string;
}

export interface DriverCluster {
  label: string;
  color: string;
}

export interface FactorAction {
  label: string;
  action: "elevate" | "remove" | "lower" | "add";
}

export interface ActionHint {
  icon: string;
  color: string;
  headline: string;
  detail: string;
}

export interface Spotlight {
  cluster: number;
  icon: string;
  label: string;
  count: string;
}

export interface Callout {
  label: string;
  price: string;
  x: number;
  y: number;
}

export interface PriceSatellite {
  label: string;
  price: string;
  value: number;
}

export interface KPI {
  label: string;
  before: string;
  after: string;
}

export interface BaselineKPI {
  winRate: number;
  priceAdoption: number;
  marginImpact: number;
}

export interface TimelineKPI {
  winRate: number;
  priceAdoption: number;
  marginImpact: number;
}

export interface TimelineEvent {
  month: number;
  label: string;
  dotLabel: string;
  factor: string;
  kpi: TimelineKPI;
}

export interface SegmentHighlight {
  t: number;
  label: string;
  oldPrice: string;
  newPrice: string;
  change: string;
  beforeTitle: string;
  shortReason: string;
  beforeBody: string;
  afterTitle: string;
  afterBody: string;
  marketSignal: string;
}

export interface ResolutionAnnotation {
  id: string;
  text: string;
  title: string;
  detail: string;
}

export interface PricingTier {
  qty: number;
  price: string;
}

export interface ResolutionContent {
  annotations: ResolutionAnnotation[];
  emailFrom: string;
  emailSubject: string;
  sku: string;
  vendor: string;
  pricingTiers: PricingTier[];
}

export interface ComplexityKeyInput {
  icon: string;
  label: string;
  items: string[];
}

export interface ComplexityContent {
  items: string[];
  exampleLabel: string;
  keyInputs: ComplexityKeyInput[];
}

export interface ScenarioItem {
  id: string;
  price: string;
  traits: string[];
  response: { volume: string; winRate: string };
  adjustment: string;
  newId: string;
  newPrice: string;
  newTraits: string[];
}

export interface ScenarioContent {
  items: ScenarioItem[];
}

export interface SegmentationTree {
  labels: string[];
}

export interface DemandCurveDot {
  label: string;
  t: number;
  color: string;
}

export interface DriverExampleStep {
  supertitle: string;
  headline: string;
  detail: string;
  dismissLine: string;
  action: "remove" | "elevate" | "add";
  highlight: string[];
  remove: string[];
  add: string[];
  icon: string;
}

export interface DriverAdjustmentItem {
  label: string;
  action: "remove" | "elevate" | "add" | "emphasized";
  icon: string;
  reason: string;
  category: string;
}

export interface DriverBeforeRisk {
  icon: string;
  title: string;
  detail: string;
}

export interface DriverImportanceConfig {
  importance: Record<string, number>;
  factorOrder: string[];
  exampleSteps: DriverExampleStep[];
  adjustments: DriverAdjustmentItem[];
  beforeRisks: DriverBeforeRisk[];
}

export interface StepNarratives {
  profitGrowthIntro: string;
  listPrice: string;
}

export interface Vocabulary {
  productUnit: string;
  productUnitPlural: string;
  transactionTerm: string;
  unitId: string;
}

export interface SlideText {
  powerTitle: string;
  powerSubtitle: string;
  powerAxisX: string;
  powerAxisY: string;
  driverIntroTitle: string;
  driverIntroSubtitle: string;
  driverCollapseTitle: string;
  driverCollapseSubtitle: string;
  executeModelTitle: string;
  executeModelSubtitle: string;
  executeWrapTitle: string;
  executeDataSub: string;
  executeNavSubtitle: string;
  executeRecapDesc: string;
  powerRecapDesc: string;
  resolutionMatchLabel: string;
  resolutionIdLabel: string;
  refineIntroTitle: string;
  refineIntroSubtitle: string;
  refineCurveTitle: string;
  refineOptimizedBody: string;
  statusQuoLabels: string[];
  profitStepNarratives: string[];
}

export interface ProspectConfig {
  meta: ProspectMeta;
  dataCounts: DataCounts;
  dataLabels: DataLabels;
  customers: CustomerScenario[];
  factors: PricingFactors;
  categoryTitles: string[];
  categoryNarration: string[];
  selectedDrivers: SelectedDriver[];
  driverClusters: DriverCluster[];
  factorActions: Record<string, FactorAction[]>;
  factorActionHints: ActionHint[];
  spotlights: Spotlight[];
  titles: string[];
  subtitles: string[];
  callouts: Callout[];
  basePriceValue: number;
  priceSatellites: PriceSatellite[];
  kpis: KPI[];
  baselineKpi: BaselineKPI;
  timelineEvents: TimelineEvent[];
  segmentHighlights: SegmentHighlight[];
  portfolioSegmentNames: string[];
  portfolioSegmentDeltas: string[];
  resolution: ResolutionContent;
  complexity: ComplexityContent;
  scenarios: ScenarioContent;
  segmentationTree: SegmentationTree;
  demandCurveDots: DemandCurveDot[];
  treeOutputPrice: string;
  driverImportance: DriverImportanceConfig;
  segmentsMonitored: number;
  stepNarratives: StepNarratives;
  vocabulary: Vocabulary;
  slideText: SlideText;
}

// ── Default Values ─────────────────────────────────────────────────────────

// ── Meta ───────────────────────────────────────────────────────────────────

export const meta: ProspectMeta = {
  prospectName: "Fire, Life & Safety",
  vertical: "fire-life-safety",
  slug: "fire-life-safety",
  presentationTitle: "Inside Your Dynamic Model | Fire, Life & Safety",
};

export const presentationTitle: string = meta.presentationTitle ?? "Inside Your Dynamic Model";

// ── Data Counts & Labels ───────────────────────────────────────────────────

export const dataCounts: DataCounts = {
  accounts: 1200,
  skus: 150,
  orders: 18000,
  marketFeatures: 32,
  monthsOfData: 36,
};

export const dataLabels: DataLabels = {
  accounts: "commercial accounts",
  skus: "service configurations",
  orders: "job records",
  marketFeatures: "market signals",
  monthsOfData: "months of job data",
};

// ── Customer Scenarios ─────────────────────────────────────────────────────

export const customers: CustomerScenario[] = [
  {
    name: "Meridian Health Systems",
    segment: "High volume · contracted",
    price: "$14,800",
    delta: "+$2,100 above Historical Average",
    winProb: "72%",
    margin: "+8.4%",
    narrative:
      "Same service, but now the model layers in the client — high job frequency, long tenure, and healthcare facility requirements push the price above Historical Average.",
    sliders: [
      { label: "Service Line", value: 0.75 },
      { label: "Service Territory", value: 0.65 },
      { label: "Facility Type", value: 0.85 },
      { label: "Urgency Score", value: 0.60 },
      { label: "Competitor Pricing", value: 0.55 },
      { label: "Quote Lead Time", value: 0.80 },
      { label: "Code Cycle Index", value: 0.45 },
    ],
    color: "#00446A",
  },
  {
    name: "Lakeview School District",
    segment: "Price-sensitive · bid-driven",
    price: "$6,200",
    delta: "−$1,400 below Historical Average",
    winProb: "58%",
    margin: "−2.1%",
    narrative:
      "Different client, different answer — tight public-sector budgets and competitive bidding push the price below Historical Average to protect the contract.",
    sliders: [
      { label: "Service Line", value: 0.55 },
      { label: "Service Territory", value: 0.70 },
      { label: "Facility Type", value: 0.45 },
      { label: "Urgency Score", value: 0.35 },
      { label: "Competitor Pricing", value: 0.80 },
      { label: "Quote Lead Time", value: 0.35 },
      { label: "Code Cycle Index", value: 0.65 },
    ],
    color: "#21A5D5",
  },
  {
    name: "Ironworks Manufacturing",
    segment: "Complex install · captive",
    price: "$38,500",
    delta: "+$6,800 above Historical Average",
    winProb: "85%",
    margin: "+6.3%",
    narrative:
      "Same service category, highest price — this facility's specialized suppression requirements and limited qualified competitors drive the price up.",
    sliders: [
      { label: "Service Line", value: 0.80 },
      { label: "Service Territory", value: 0.40 },
      { label: "Facility Type", value: 0.70 },
      { label: "Urgency Score", value: 0.90 },
      { label: "Competitor Pricing", value: 0.20 },
      { label: "Quote Lead Time", value: 0.85 },
      { label: "Code Cycle Index", value: 0.75 },
    ],
    color: "#1B4F72",
  },
];

// ── Pricing Factors ────────────────────────────────────────────────────────

export const factors: PricingFactors = {
  customer: [
    { label: "Facility Type", category: "customer" },
    { label: "Sales Channel", category: "customer" },
    { label: "Service Territory", category: "customer" },
    { label: "Account Revenue", category: "customer" },
    { label: "Account Tenure", category: "customer" },
    { label: "Contract vs. T&M", category: "customer" },
  ],
  product: [
    { label: "Service Line", category: "product" },
    { label: "System Complexity", category: "product" },
    { label: "Scope of Work", category: "product" },
    { label: "Cost to Deliver", category: "product" },
    { label: "Price Sensitivity", category: "product" },
    { label: "Bid Elasticity", category: "product" },
    { label: "Urgency Score", category: "product" },
  ],
  market: [
    { label: "Territory Coverage", category: "market" },
    { label: "Code Cycle Index", category: "market" },
    { label: "Construction Activity", category: "market" },
    { label: "Competitor Capacity", category: "market" },
    { label: "Competitor Pricing", category: "market" },
  ],
  order: [
    { label: "Job Frequency", category: "order" },
    { label: "Project Duration", category: "order" },
    { label: "Quote Lead Time", category: "order" },
    { label: "Contract Terms", category: "order" },
    { label: "Pricing Structure", category: "order" },
    { label: "Seasonal Demand", category: "order", emphasis: "deemphasize" },
  ],
};

// ── Category Titles & Narration ────────────────────────────────────────────

export const categoryTitles: string[] = [
  "Client factors",
  "Service factors",
  "Job factors",
  "Market factors",
];

export const categoryNarration: string[] = [
  "Who the client is — facility type, channel, territory, revenue, tenure, and contract structure.",
  "What's being delivered — service line, complexity, scope, cost, and price sensitivity.",
  "How jobs flow — frequency, duration, lead time, terms, pricing structure, and seasonality.",
  "Where you compete — coverage, code cycles, construction activity, and competitive dynamics.",
];

// ── Selected Drivers ───────────────────────────────────────────────────────

export const selectedDrivers: SelectedDriver[] = [
  { label: "Service Line", color: "#E56910", weight: 4, note: "" },
  { label: "Service Territory", color: "#00446A", weight: 3, note: "" },
  { label: "Facility Type", color: "#00446A", weight: 4, note: "" },
  { label: "Urgency Score", color: "#7B5EA7", weight: 3, note: "Added" },
  { label: "Competitor Pricing", color: "#2e7d32", weight: 3, note: "Added" },
  { label: "Quote Lead Time", color: "#7B5EA7", weight: 2, note: "" },
  { label: "Code Cycle Index", color: "#2e7d32", weight: 2, note: "" },
];

// ── Driver Clusters ────────────────────────────────────────────────────────

export const driverClusters: DriverCluster[] = [
  { label: "Job Characteristics", color: "#00446A" },
  { label: "Competitive Position", color: "#E56910" },
  { label: "Market Dynamics", color: "#2e7d32" },
  { label: "Timing & Urgency", color: "#7B5EA7" },
];

// ── Factor Actions ─────────────────────────────────────────────────────────

export const factorActions: Record<string, FactorAction[]> = {
  customer: [{ label: "Sales Channel", action: "remove" }],
  product: [{ label: "Urgency Score", action: "elevate" }],
  market: [{ label: "Competitor Pricing", action: "add" }],
  order: [{ label: "Contract Terms", action: "lower" }],
};

export const factorActionHints: ActionHint[] = [
  {
    icon: "×",
    color: "#21A5D5",
    headline: "Remove a factor",
    detail:
      "Sales Channel is an acquisition path — it doesn't determine what the work is worth.",
  },
  {
    icon: "↑",
    color: "#21A5D5",
    headline: "Elevate a factor",
    detail:
      "Urgency Score captures how emergency vs. planned a job is — the biggest hidden margin signal.",
  },
  {
    icon: "↓",
    color: "#7B5EA7",
    headline: "Lower its weight",
    detail:
      "Contract Terms have minimal impact on the optimal price — dial it down.",
  },
  {
    icon: "+",
    color: "#2e7d32",
    headline: "Add a factor",
    detail:
      "Competitor Pricing adds a final market check against other fire protection companies.",
  },
];

// ── Spotlights ─────────────────────────────────────────────────────────────

export const spotlights: Spotlight[] = [
  {
    cluster: 2,
    icon: "people",
    label: "CLIENT",
    count: "Found 1,200 commercial accounts",
  },
  {
    cluster: 3,
    icon: "chart",
    label: "SERVICE",
    count: "Found 36 months of job data",
  },
  {
    cluster: 1,
    icon: "trend",
    label: "MARKET",
    count: "Found 32 market signals",
  },
  {
    cluster: 0,
    icon: "grid",
    label: "JOB",
    count: "Found 18,000 job records",
  },
];

// ── Titles & Subtitles ─────────────────────────────────────────────────────

export const titles: string[] = [
  "1,200 accounts × 150 service configurations",
  "The model scans for patterns",
  "Your customized factors now feed the model",
  "Your model drivers produce one optimized price per service configuration",
];

export const subtitles: string[] = [
  "That's thousands of unique price points — far too many for any team to set manually. The model finds the patterns hiding inside.",
  "We look at pricing factors across four dimensions — tailored to what matters for your business.",
  "Every business is different. We analyze what matters to you — adding key factors, removing what doesn't apply, and tuning the balance.",
  "Seven tailored drivers — drawn from the factors that matter most to you — feed the model to arrive at the right price for every service configuration.",
];

// ── Callouts ───────────────────────────────────────────────────────────────

export const callouts: Callout[] = [
  { label: "Meridian Health", price: "$14,800", x: 310, y: 115 },
  { label: "Ironworks Manufacturing", price: "$38,500", x: 625, y: 185 },
  { label: "Lakeview School District", price: "$6,200", x: 475, y: 290 },
  { label: "CrossPoint Logistics", price: "$11,400", x: 165, y: 195 },
  { label: "Metro Parking Auth", price: "$4,800", x: 760, y: 320 },
];

// ── Base Price & Satellites ────────────────────────────────────────────────

export const basePriceValue: number = 10500;

export const priceSatellites: PriceSatellite[] = [
  { label: "Client", price: "+$1,800", value: 1800 },
  { label: "Service", price: "+$2,100", value: 2100 },
  { label: "Market", price: "−$900", value: -900 },
  { label: "Job", price: "+$1,300", value: 1300 },
];

// ── KPIs ───────────────────────────────────────────────────────────────────

export const kpis: KPI[] = [
  { label: "Margin Uplift", before: "18%", after: "26%" },
  { label: "Win Rate", before: "38%", after: "49%" },
  { label: "Price Consistency", before: "Low", after: "High" },
  { label: "Manual Override Rate", before: "52%", after: "14%" },
  { label: "Pricing Speed", before: "Spreadsheet (days)", after: "Same-day" },
];

// ── Baseline & Timeline KPIs ──────────────────────────────────────────────

export const baselineKpi: BaselineKPI = {
  winRate: 52,
  priceAdoption: 58,
  marginImpact: 1.2,
};

export const timelineEvents: TimelineEvent[] = [
  {
    month: 10,
    label: "Steel & Copper +12%",
    dotLabel: "Materials",
    factor:
      "Material costs spike — the model reprices install jobs to protect margin while competitors eat the increase.",
    kpi: { winRate: 48, priceAdoption: 65, marginImpact: 1.6 },
  },
  {
    month: 22,
    label: "Code Cycle Surge +18%",
    dotLabel: "Code Cycle",
    factor:
      "Fire code inspection deadlines cluster — the model recognizes the demand spike and prices inspection contracts to capture the urgency premium.",
    kpi: { winRate: 56, priceAdoption: 72, marginImpact: 1.9 },
  },
  {
    month: 36,
    label: "New Construction +15%",
    dotLabel: "Construction",
    factor:
      "Regional building boom drives install demand — the model reprices confidently across service lines.",
    kpi: { winRate: 54, priceAdoption: 79, marginImpact: 2.2 },
  },
];

// ── Segment Highlights ─────────────────────────────────────────────────────

export const segmentHighlights: SegmentHighlight[] = [
  {
    t: 0.12,
    label: "Ironworks Manufacturing",
    oldPrice: "$38,500",
    newPrice: "$43,200",
    change: "+$4,700",
    beforeTitle: "Priced too low",
    shortReason: "No competition",
    beforeBody:
      "Complex industrial suppression with no local competitors qualified to do the work — current spreadsheet doesn't capture the premium.",
    afterTitle: "Adjusted +$4,700",
    afterBody:
      "System complexity and limited competition push the price to market-clearing level.",
    marketSignal: "Specialized scope, no competition",
  },
  {
    t: 0.35,
    label: "Meridian Health",
    oldPrice: "$14,800",
    newPrice: "$16,200",
    change: "+$1,400",
    beforeTitle: "Underpriced",
    shortReason: "Win rate climbing",
    beforeBody:
      "Win rate on healthcare inspection contracts is climbing — a pattern, not noise. There's room to price higher for this segment.",
    afterTitle: "Adjusted +$1,400",
    afterBody:
      "Price rises to capture margin the data says is available.",
    marketSignal: "Win rate climbing, margin available",
  },
  {
    t: 0.72,
    label: "Lakeview School District",
    oldPrice: "$6,800",
    newPrice: "$5,600",
    change: "−$1,200",
    beforeTitle: "At risk",
    shortReason: "Competitor undercutting",
    beforeBody:
      "Regional competitor is undercutting on school district bids — win rate is dropping and contracts are up for renewal.",
    afterTitle: "Adjusted −$1,200",
    afterBody:
      "Price drops to defend the contract against the competitive threat.",
    marketSignal: "Competitor undercutting",
  },
];

// ── Portfolio Segments ─────────────────────────────────────────────────────

export const portfolioSegmentNames: string[] = [
  "Meridian Health – Fire Alarm Upgrade",
  "Lakeview School District – Annual Inspection",
  "Ironworks Manufacturing – Wet Suppression Install",
  "Midwest Medical Center – Sprinkler Retrofit",
  "CrossPoint Logistics – Emergency Lighting",
  "First Federal Credit Union – Alarm Monitoring",
  "Buckeye Cold Storage – Clean Agent System",
  "Prairie View Senior Living – Quarterly Inspection",
  "Summit Office Park – Sprinkler Design",
  "Great Lakes Brewing – Hood Suppression",
  "Heritage Assisted Living – Panel Upgrade",
  "Indiana Steel Works – Dry Pipe Install",
  "Lakeshore Hospital – Annual Inspection",
  "Pinnacle Hotel Group – Alarm Addressable",
  "Metro Parking Authority – Standpipe Service",
  "Oakwood Mall – Sprinkler Inspection",
  "Riverview Apartments – Fire Alarm Install",
  "Central Distribution Co – Suppression Recharge",
  "Keystone Automotive – Dry Chemical System",
  "Cedar Rapids Pharma – Clean Room Suppression",
  "Dayton Convention Center – Mass Notification",
  "Lakeland Community College – Emergency Lighting",
  "Northfield Data Center – FM-200 System",
  "Pioneer Grain Co – Dust Suppression",
  "Quad Cities Medical – Alarm Upgrade",
  "Riverside Church – Inspection Contract",
  "Steelcase Midwest – Sprinkler Expansion",
  "Timber Ridge Resort – Fire Pump Service",
  "Union Savings Bank – Alarm Monitoring",
  "Veterans Memorial Hospital – Panel Replacement",
  "Westfield Shopping Center – Sprinkler Retrofit",
  "Archer Daniels Offices – Quarterly Inspection",
  "Blue Cross Regional – Alarm Addressable",
  "Carver Elementary – Annual Inspection",
  "Drake University Housing – Emergency Lighting",
  "Elkhart RV Manufacturing – Paint Booth Suppression",
  "Fairfield Inn Downtown – Sprinkler Design",
  "Grandview Nursing – Fire Alarm Install",
  "Hamilton County Jail – Mass Notification",
  "Interstate Warehousing – Dry Pipe Install",
  "Jefferson High School – Inspection Contract",
  "Knox County Courthouse – Alarm Upgrade",
  "Lincoln Financial Tower – Standpipe Service",
  "Maplewood Commons – Fire Alarm Install",
  "Newman Catholic Schools – Annual Inspection",
  "Ohio Valley Foundry – Wet Suppression Install",
  "Parkview Medical Arts – Sprinkler Retrofit",
  "Republic Steel Annex – Clean Agent System",
  "St. Joseph Hospital – Quarterly Inspection",
  "Wabash National Plant – Hood Suppression",
];

export const portfolioSegmentDeltas: string[] = [
  "+2.4%",  "-0.8%",  "+3.6%",  "+1.2%",  "-1.5%",  "+2.8%",
  "-0.3%",  "+1.9%",  "+0.6%",  "-1.1%",  "+3.1%",  "+1.4%",
  "-0.7%",  "+2.2%",  "-0.4%",  "+3.5%",  "+0.9%",  "-1.6%",
  "+2.3%",  "-0.5%",  "+1.7%",  "+0.8%",  "-0.2%",  "+2.9%",
  "+1.3%",  "-0.9%",  "+1.8%",  "+0.5%",  "-1.2%",  "+2.6%",
  "+0.7%",  "-0.4%",  "+3.2%",  "+1.5%",  "-1.0%",  "+2.0%",
  "-0.6%",  "+3.4%",  "+0.3%",  "-1.4%",  "+2.5%",  "-0.3%",
  "+1.6%",  "+1.0%",  "-0.8%",  "+2.7%",  "+0.4%",  "-0.6%",
  "+2.1%",  "-0.2%",
];

// ── Resolution (Email → Quote pipeline) ──────────────────────────────────

export const resolution: ResolutionContent = {
  annotations: [
    {
      id: "system",
      text: "FA-ADDR",
      title: "System Code Extraction",
      detail: "Shorthand resolved → Fire Alarm Addressable (120-point system)",
    },
    {
      id: "contract",
      text: "SVC-GOLD",
      title: "Contract Code Normalization",
      detail: "Legacy code → Gold Service Contract (quarterly inspections)",
    },
    {
      id: "code",
      text: "NFPA-72/25",
      title: "Code Compliance Lookup",
      detail: "Reference matched → NFPA 72 2025 edition compliance required",
    },
    {
      id: "branch",
      text: "BR-MW-03",
      title: "Branch Resolution",
      detail: "Branch code → Midwest Regional Branch (verified location)",
    },
    {
      id: "suppression",
      text: "SUPP-WET",
      title: "System Disambiguation",
      detail: "WET suffix → Wet Chemical Suppression (hood system, kitchen)",
    },
  ],
  emailFrom: "procurement@ironworksmfg.com",
  emailSubject: "Suppression System Quote — Plant 4 Expansion",
  sku: "IWM-P4-WETSUPP-KIT",
  vendor: "Midwest Regional Branch",
  pricingTiers: [
    { qty: 1, price: "$38,500" },
    { qty: 2, price: "$36,200" },
    { qty: 4, price: "$33,800" },
    { qty: 8, price: "$31,500" },
    { qty: 12, price: "$29,200" },
    { qty: 20, price: "$27,000" },
  ],
};

// ── Complexity ─────────────────────────────────────────────────────────────

export const complexity: ComplexityContent = {
  items: [
    "System Type",
    "Building Sq Ft",
    "Number of Floors",
    "Occupancy Class",
    "Hazard Classification",
    "Pipe Schedule",
    "Head Count",
    "Panel Zones",
    "Device Count",
    "AHJ Requirements",
    "Monitoring Type",
    "Inspection Frequency",
    "Access Difficulty",
    "Permit Requirements",
    "Retrofit vs. New",
  ],
  exampleLabel: "EXAMPLE: Fire Protection System Pricing",
  keyInputs: [
    {
      icon: "👤",
      label: "Client",
      items: ["Facility Type", "Occupancy class"],
    },
    {
      icon: "🔧",
      label: "System",
      items: [
        "System type",
        "Hazard class",
        "Pipe schedule",
        "Head count",
        "Device count",
      ],
    },
    {
      icon: "📋",
      label: "Job Context",
      items: ["AHJ requirements", "Permit requirements"],
    },
  ],
};

// ── Scenarios ──────────────────────────────────────────────────────────────

export const scenarios: ScenarioContent = {
  items: [
    {
      id: "A",
      price: "$14,200",
      traits: [
        "Contracted Account",
        "Sprinkler Install",
        "Code Deadline Quarter",
        "Industrial Facility",
        "38% Win Rate",
      ],
      response: { volume: "Flat", winRate: "Up" },
      adjustment: "++",
      newId: "A2",
      newPrice: "$16,800",
      newTraits: [
        "Contracted Account",
        "Sprinkler Install",
        "Code Deadline Quarter",
        "Industrial Facility",
        "44% Win Rate",
      ],
    },
    {
      id: "B",
      price: "$11,500",
      traits: [
        "Contracted Account",
        "Sprinkler Install",
        "Non-Peak Quarter",
        "Commercial Office",
        "38% Win Rate",
      ],
      response: { volume: "Down", winRate: "Down" },
      adjustment: "–",
      newId: "B2",
      newPrice: "$9,200",
      newTraits: [
        "Contracted Account",
        "Sprinkler Install",
        "Non-Peak Quarter",
        "Commercial Office",
        "34% Win Rate",
      ],
    },
  ],
};

// ── Segmentation Tree ──────────────────────────────────────────────────────

export const segmentationTree: SegmentationTree = {
  labels: ["Facility", "Industrial", "Healthcare", "Commercial", "Residential"],
};

// ── Segments Monitored ─────────────────────────────────────────────────────

export const demandCurveDots: DemandCurveDot[] = [
  { label: "A2: $16,800", t: 0.18, color: "#00446A" },
  { label: "A: $14,200", t: 0.28, color: "#00446A" },
  { label: "B: $11,500", t: 0.38, color: "#21A5D5" },
  { label: "B2: $9,200", t: 0.52, color: "#E56910" },
];

export const treeOutputPrice: string = "A: $14,200";

export const driverImportance: DriverImportanceConfig = {
  importance: {
    "Service Line": 15.2,
    "Facility Type": 13.6,
    "Service Territory": 11.8,
    "Sales Channel": 10.2,
    "System Complexity": 9.4,
    "Quote Lead Time": 7.6,
    "Account Revenue": 7.0,
    "Code Cycle Index": 6.2,
    "Account Tenure": 5.8,
    "Price Sensitivity": 5.2,
    "Contract vs. T&M": 4.6,
    "Scope of Work": 4.0,
    "Competitor Pricing": 8.0,
    "Cost to Deliver": 3.4,
    "Bid Elasticity": 3.0,
    "Seasonal Demand": 2.6,
    "Job Frequency": 2.2,
    "Construction Activity": 2.0,
    "Territory Coverage": 1.8,
    "Project Duration": 1.6,
    "Competitor Capacity": 1.4,
    "Contract Terms": 1.2,
    "Pricing Structure": 1.0,
    "Urgency Score": 0.4,
  },
  factorOrder: [
    "Service Line", "Facility Type", "Service Territory", "Sales Channel",
    "System Complexity", "Quote Lead Time", "Account Revenue",
    "Code Cycle Index", "Account Tenure", "Price Sensitivity",
    "Contract vs. T&M", "Scope of Work", "Competitor Pricing",
    "Cost to Deliver", "Bid Elasticity", "Seasonal Demand",
    "Job Frequency", "Construction Activity", "Territory Coverage",
    "Project Duration", "Competitor Capacity", "Contract Terms",
    "Pricing Structure", "Urgency Score",
  ],
  exampleSteps: [
    {
      supertitle: "Removing a factor",
      headline: "Sales Channel",
      detail: "How the job came in — referral, cold call, repeat — doesn't determine what the work is worth.",
      dismissLine: "Variance explained by acquisition path, not job value.",
      action: "remove",
      highlight: ["Sales Channel"],
      remove: ["Sales Channel"],
      add: [],
      icon: "✕",
    },
    {
      supertitle: "Elevating a factor",
      headline: "Urgency Score",
      detail: "Emergency call-outs price completely differently from planned work — a hidden signal worth surfacing.",
      dismissLine: "Separates emergency margin from planned work pricing.",
      action: "elevate",
      highlight: ["Urgency Score"],
      remove: [],
      add: ["Urgency Score"],
      icon: "↑",
    },
    {
      supertitle: "Adding a factor",
      headline: "Competitor Pricing",
      detail: "A final market check — keeping your prices competitive against other fire protection companies in each territory.",
      dismissLine: "A market guardrail that sharpens the final price.",
      action: "add",
      highlight: ["Competitor Pricing"],
      remove: [],
      add: ["Competitor Pricing"],
      icon: "+",
    },
  ],
  adjustments: [
    { label: "Sales Channel", action: "remove", icon: "✕", reason: "Acquisition path, not a structural pricing driver", category: "Client" },
    { label: "Service Line", action: "emphasized", icon: "★", reason: "Strongest service-level signal", category: "Service" },
    { label: "Facility Type", action: "emphasized", icon: "★", reason: "Healthcare vs. industrial vs. commercial pricing patterns", category: "Client" },
    { label: "Service Territory", action: "emphasized", icon: "★", reason: "Regional demand and competitive dynamics", category: "Client" },
    { label: "System Complexity", action: "emphasized", icon: "★", reason: "Complex installs justify premium pricing", category: "Service" },
    { label: "Quote Lead Time", action: "emphasized", icon: "★", reason: "Rush jobs and emergency pricing patterns", category: "Job" },
    { label: "Urgency Score", action: "elevate", icon: "↑", reason: "Hidden signal for emergency vs. planned work", category: "Service" },
    { label: "Competitor Pricing", action: "add", icon: "+", reason: "Final market check against regional competitors", category: "Market" },
  ],
  beforeRisks: [
    { icon: "📞", title: "Sales Channel drives pricing", detail: "How the job came in matters more than what the work is worth — <b>prices shift with referral source, not complexity.</b>" },
    { icon: "📉", title: "Hidden signals stay buried", detail: "Urgency Score sits near the bottom — <b>a key signal separating emergency from planned work.</b>" },
    { icon: "🔇", title: "No competitive check", detail: "Without Competitor Pricing, <b>the model sets prices blind to what others are quoting.</b>" },
    { icon: "⚖️", title: "Noise outweighs signal", detail: "24 untuned factors dilute the drivers that actually explain <b>price variation.</b>" },
  ],
};

export const segmentsMonitored: number = 180;

// ── Step Narratives ────────────────────────────────────────────────────────

export const stepNarratives: StepNarratives = {
  profitGrowthIntro:
    "The model now manages 18,000 jobs × 1,200 accounts — let's see the impact with vs. without it.",
  listPrice: "$10,500",
};

// ── Vocabulary & Slide Text ───────────────────────────────────────────────

export const vocabulary: Vocabulary = {
  productUnit: "job",
  productUnitPlural: "jobs",
  transactionTerm: "service contracts",
  unitId: "Job #FP-4821",
};

export const slideText: SlideText = {
  powerTitle: "Every fire protection contract is priced differently",
  powerSubtitle: "Inspections, installations, emergency calls — far too many combinations for any team to price manually.",
  powerAxisX: "Monthly Job Volume",
  powerAxisY: "Average Job Price ($)",
  driverIntroTitle: "Pricing factors across four dimensions",
  driverIntroSubtitle: "Tuned to your fire protection business — elevating what matters, removing what doesn’t.",
  driverCollapseTitle: "One optimal price per job",
  driverCollapseSubtitle: "All your drivers, one answer.",
  executeModelTitle: "Applying the optimized price at the service contract level",
  executeModelSubtitle: "The model starts with one optimized price per job — then adjusts for each service contract’s unique factors.",
  executeWrapTitle: "The ideal price, adjusted for each contract",
  executeDataSub: "Millions of service records scanned for patterns",
  executeNavSubtitle: "Job-level prices tailored to each customer",
  executeRecapDesc: "Job-level prices tailored to each customer, delivered where your team works.",
  powerRecapDesc: "ML finds pricing patterns across millions of service contracts humans can't see.",
  resolutionMatchLabel: "Matched Job",
  resolutionIdLabel: "Job Code",
  refineIntroTitle: "Now we look across all your service contracts",
  refineIntroSubtitle: "Together, they form a market curve — and every price gets refined against it.",
  refineCurveTitle: "Your calibrated demand curve",
  refineOptimizedBody: "Every service contract is now aligned to the model's recommended price — lifting underpriced jobs while protecting wins.",
  statusQuoLabels: [
    "Quoted 18% below floor",
    "Emergency markup overridden",
    "Stale estimate sent to GC",
    "Discount exceeded threshold",
    "Missed price increase on renewals",
    "Inconsistent territory pricing",
    "Manual exception — no audit trail",
    "Competitor intel ignored on bid",
  ],
  profitStepNarratives: [
    "Each manual estimate introduces errors and inconsistency — margin leaks with every job priced by gut.",
    "The Dynamic Pricing Model optimizes every job price simultaneously.",
    "The model analyzes facility type, urgency, territory, and competitive position across every combination.",
    "Prices snap to model-optimized positions — tighter to the demand curve, less leakage.",
  ],
};

// ── Full Config Object ─────────────────────────────────────────────────────

export const PROSPECT_CONFIG: ProspectConfig = {
  meta,
  dataCounts,
  dataLabels,
  customers,
  factors,
  categoryTitles,
  categoryNarration,
  selectedDrivers,
  driverClusters,
  factorActions,
  factorActionHints,
  spotlights,
  titles,
  subtitles,
  callouts,
  basePriceValue,
  priceSatellites,
  kpis,
  baselineKpi,
  timelineEvents,
  segmentHighlights,
  portfolioSegmentNames,
  portfolioSegmentDeltas,
  resolution,
  complexity,
  scenarios,
  segmentationTree,
  demandCurveDots,
  treeOutputPrice,
  driverImportance,
  segmentsMonitored,
  stepNarratives,
  vocabulary,
  slideText,
};

export default PROSPECT_CONFIG;
