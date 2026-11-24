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
  usePresenterMode?: boolean;
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
  executeInputs: { label: string; sub: string }[];
  executeOutputs: { label: string; sub: string }[];
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
  prospectName: "Pinnacle Hospitality",
  vertical: "hospitality",
  slug: "pinnacle-hospitality",
  presentationTitle: "Inside Your Dynamic Model | Pinnacle Hospitality",
  usePresenterMode: true,
};

export const presentationTitle: string = meta.presentationTitle ?? "Inside Your Dynamic Model";
export const usePresenterMode: boolean = meta.usePresenterMode ?? true;

// ── Data Counts & Labels ───────────────────────────────────────────────────

export const dataCounts: DataCounts = {
  accounts: 850,
  skus: 1200,
  orders: 680000,
  marketFeatures: 42,
  monthsOfData: 24,
};

export const dataLabels: DataLabels = {
  accounts: "corporate accounts",
  skus: "room configurations",
  orders: "booking records",
  marketFeatures: "market signals",
  monthsOfData: "months of booking data",
};

// ── Customer Scenarios ─────────────────────────────────────────────────────

export const customers: CustomerScenario[] = [
  {
    name: "Meridian Health Systems",
    segment: "High volume · contracted",
    price: "$189",
    delta: "+$34 above Historical Average",
    winProb: "72%",
    margin: "+6.8%",
    narrative:
      "Same room, but now the model layers in the guest profile — high booking frequency, long corporate relationship, and healthcare system tenure push the rate above Historical Average.",
    sliders: [
      { label: "Room Type", value: 0.75 },
      { label: "Source Market", value: 0.65 },
      { label: "Guest Segment", value: 0.85 },
      { label: "Comp Set ADR", value: 0.55 },
      { label: "Booking Frequency", value: 0.80 },
      { label: "Relationship Tenure", value: 0.80 },
      { label: "Length of Stay", value: 0.60 },
    ],
    color: "#00446A",
  },
  {
    name: "Atlas Corporate Travel",
    segment: "Price-sensitive · competitive",
    price: "$154",
    delta: "−$18 below Historical Average",
    winProb: "56%",
    margin: "−2.4%",
    narrative:
      "Different account, different answer — competitive corporate travel market and rate-shopping behavior push the price below Historical Average to protect the booking.",
    sliders: [
      { label: "Room Type", value: 0.55 },
      { label: "Source Market", value: 0.70 },
      { label: "Guest Segment", value: 0.45 },
      { label: "Comp Set ADR", value: 0.80 },
      { label: "Booking Frequency", value: 0.35 },
      { label: "Relationship Tenure", value: 0.35 },
      { label: "Length of Stay", value: 0.65 },
    ],
    color: "#21A5D5",
  },
  {
    name: "Evergreen Events Group",
    segment: "Group block · seasonal",
    price: "$212",
    delta: "+$42 above Historical Average",
    winProb: "84%",
    margin: "+5.2%",
    narrative:
      "Same room category, highest rate — seasonal demand, large group blocks, and limited venue alternatives drive the price up.",
    sliders: [
      { label: "Room Type", value: 0.80 },
      { label: "Source Market", value: 0.40 },
      { label: "Guest Segment", value: 0.70 },
      { label: "Comp Set ADR", value: 0.20 },
      { label: "Booking Frequency", value: 0.85 },
      { label: "Relationship Tenure", value: 0.55 },
      { label: "Length of Stay", value: 0.90 },
    ],
    color: "#1B4F72",
  },
];

// ── Pricing Factors ────────────────────────────────────────────────────────

export const factors: PricingFactors = {
  customer: [
    { label: "Guest Segment", category: "customer" },
    { label: "Account Manager", category: "customer" },
    { label: "Source Market", category: "customer" },
    { label: "Account Volume", category: "customer" },
    { label: "Relationship Tenure", category: "customer" },
    { label: "Booking Channel", category: "customer" },
  ],
  product: [
    { label: "Room Type", category: "product" },
    { label: "Property Brand", category: "product" },
    { label: "Room Configuration", category: "product" },
    { label: "Cost per Occupied Room", category: "product" },
    { label: "Rate Sensitivity", category: "product" },
    { label: "Demand Elasticity", category: "product" },
    { label: "Length of Stay", category: "product" },
  ],
  market: [
    { label: "Occupancy Share", category: "market" },
    { label: "Comp Set Index", category: "market" },
    { label: "Travel Demand Trends", category: "market" },
    { label: "Comp Set Activity", category: "market" },
    { label: "Comp Set ADR", category: "market" },
  ],
  order: [
    { label: "Booking Frequency", category: "order" },
    { label: "Group Size", category: "order" },
    { label: "Booking Lead Time", category: "order" },
    { label: "Cancellation Terms", category: "order" },
    { label: "Rate Plan Type", category: "order" },
    { label: "Day of Week / Season", category: "order", emphasis: "deemphasize" },
  ],
};

// ── Category Titles & Narration ────────────────────────────────────────────

export const categoryTitles: string[] = [
  "Guest factors",
  "Room factors",
  "Booking factors",
  "Market factors",
];

export const categoryNarration: string[] = [
  "Who’s booking — guest segment, account management, source market, volume, tenure, and channel.",
  "What’s being booked — room type, property brand, configuration, cost, rate sensitivity, and demand patterns.",
  "How bookings are structured — frequency, group size, lead time, cancellation, rate plans, and seasonality.",
  "Where you compete — occupancy share, comp set positioning, travel trends, and competitive dynamics.",
];

// ── Selected Drivers ───────────────────────────────────────────────────────

export const selectedDrivers: SelectedDriver[] = [
  { label: "Room Type", color: "#E56910", weight: 4, note: "" },
  { label: "Source Market", color: "#00446A", weight: 3, note: "" },
  { label: "Guest Segment", color: "#00446A", weight: 4, note: "" },
  { label: "Comp Set ADR", color: "#2e7d32", weight: 3, note: "" },
  { label: "Booking Frequency", color: "#7B5EA7", weight: 3, note: "" },
  { label: "Relationship Tenure", color: "#00446A", weight: 2, note: "" },
  { label: "Length of Stay", color: "#7B5EA7", weight: 3, note: "Added" },
];

// ── Driver Clusters ────────────────────────────────────────────────────────

export const driverClusters: DriverCluster[] = [
  { label: "Property & Room", color: "#00446A" },
  { label: "Guest Profile", color: "#E56910" },
  { label: "Market Position", color: "#2e7d32" },
  { label: "Booking Dynamics", color: "#7B5EA7" },
];

// ── Factor Actions ─────────────────────────────────────────────────────────

export const factorActions: Record<string, FactorAction[]> = {
  customer: [{ label: "Booking Channel", action: "remove" }],
  product: [{ label: "Length of Stay", action: "elevate" }],
  market: [{ label: "Comp Set Index", action: "add" }],
  order: [{ label: "Cancellation Terms", action: "lower" }],
};

export const factorActionHints: ActionHint[] = [
  {
    icon: "×",
    color: "#21A5D5",
    headline: "Remove a factor",
    detail:
      "Which OTA they booked through doesn’t tell you what to charge.",
  },
  {
    icon: "↑",
    color: "#21A5D5",
    headline: "Elevate a factor",
    detail:
      "Longer stays are worth more than you’re pricing them for.",
  },
  {
    icon: "↓",
    color: "#7B5EA7",
    headline: "Lower its weight",
    detail:
      "Cancellation terms have minimal impact on the optimal rate — dial it down.",
  },
  {
    icon: "+",
    color: "#2e7d32",
    headline: "Add a factor",
    detail:
      "Knowing what the hotel next door charges changes everything.",
  },
];

// ── Spotlights ─────────────────────────────────────────────────────────────

export const spotlights: Spotlight[] = [
  {
    cluster: 2,
    icon: "people",
    label: "GUEST",
    count: "Found 850 corporate accounts",
  },
  {
    cluster: 3,
    icon: "chart",
    label: "ROOM",
    count: "Found 24 months of booking data",
  },
  {
    cluster: 1,
    icon: "trend",
    label: "MARKET",
    count: "Found 42 market signals",
  },
  {
    cluster: 0,
    icon: "grid",
    label: "BOOKING",
    count: "Found 680,000 booking records",
  },
];

// ── Titles & Subtitles ─────────────────────────────────────────────────────

export const titles: string[] = [
  "850 accounts × 1,200 room configurations",
  "The model scans for patterns",
  "Your customized factors now feed the model",
  "Your model drivers produce one optimized rate per room configuration",
];

export const subtitles: string[] = [
  "That’s hundreds of thousands of unique rate points — far too many for any revenue team to set manually. The model finds the patterns hiding inside.",
  "We look at pricing factors across four dimensions — tailored to what matters for your hospitality business.",
  "Every property is different. We analyze what matters to you — adding key factors, removing what doesn’t apply, and tuning the balance.",
  "Seven tailored drivers — drawn from the factors that matter most — feed the model to arrive at the right rate for every room configuration.",
];

// ── Callouts ───────────────────────────────────────────────────────────────

export const callouts: Callout[] = [
  { label: "Meridian Health", price: "$189", x: 310, y: 115 },
  { label: "Evergreen Events", price: "$212", x: 625, y: 185 },
  { label: "Atlas Corporate", price: "$154", x: 475, y: 290 },
  { label: "Summit Financial", price: "$176", x: 165, y: 195 },
  { label: "Baxter Travel", price: "$142", x: 760, y: 320 },
];

// ── Base Price & Satellites ────────────────────────────────────────────────

export const basePriceValue: number = 155;

export const priceSatellites: PriceSatellite[] = [
  { label: "Guest", price: "+$18", value: 18 },
  { label: "Room", price: "+$24", value: 24 },
  { label: "Market", price: "−$12", value: -12 },
  { label: "Booking", price: "+$14", value: 14 },
];

// ── KPIs ───────────────────────────────────────────────────────────────────

export const kpis: KPI[] = [
  { label: "RevPAR", before: "$98", after: "$119" },
  { label: "Booking Conversion", before: "52%", after: "61%" },
  { label: "Rate Consistency", before: "Low", after: "High" },
  { label: "Manual Rate Overrides", before: "44%", after: "15%" },
  { label: "Rate Updates", before: "Weekly", after: "Real-time" },
];

// ── Baseline & Timeline KPIs ──────────────────────────────────────────────

export const baselineKpi: BaselineKPI = {
  winRate: 56,
  priceAdoption: 62,
  marginImpact: 1.4,
};

export const timelineEvents: TimelineEvent[] = [
  {
    month: 8,
    label: "Spring Break +22%",
    dotLabel: "Demand",
    factor:
      "Spring break demand surge — the model reprices leisure and family segments to capture the seasonal premium while competitors react too late.",
    kpi: { winRate: 52, priceAdoption: 68, marginImpact: 1.7 },
  },
  {
    month: 16,
    label: "Convention Season +15%",
    dotLabel: "Events",
    factor:
      "Convention season drives group and transient demand — the model recognizes the occupancy spike and prices across all room types to maximize RevPAR.",
    kpi: { winRate: 58, priceAdoption: 74, marginImpact: 2.0 },
  },
  {
    month: 24,
    label: "New Comp Set Hotel −8%",
    dotLabel: "Competition",
    factor:
      "A new competitor opens nearby — the model adjusts rates across segments to defend market share while protecting margin on loyal accounts.",
    kpi: { winRate: 55, priceAdoption: 78, marginImpact: 2.2 },
  },
];

// ── Segment Highlights ─────────────────────────────────────────────────────

export const segmentHighlights: SegmentHighlight[] = [
  {
    t: 0.12,
    label: "Evergreen Events",
    oldPrice: "$212",
    newPrice: "$238",
    change: "+$26",
    beforeTitle: "Priced too low",
    shortReason: "Peak demand",
    beforeBody:
      "Seasonal event demand with limited venue alternatives — current spreadsheet pricing doesn’t capture the premium during peak weekends.",
    afterTitle: "Adjusted +$26",
    afterBody:
      "Seasonal demand patterns and limited alternatives push the rate to market-clearing level.",
    marketSignal: "Peak demand, limited alternatives",
  },
  {
    t: 0.35,
    label: "Meridian Health",
    oldPrice: "$189",
    newPrice: "$204",
    change: "+$15",
    beforeTitle: "Underpriced",
    shortReason: "Conversion climbing",
    beforeBody:
      "Booking conversion on corporate healthcare accounts is climbing — a pattern, not noise. There’s room to price higher for this segment.",
    afterTitle: "Adjusted +$15",
    afterBody:
      "Rate rises to capture margin the data says is available.",
    marketSignal: "Conversion climbing, margin available",
  },
  {
    t: 0.72,
    label: "Atlas Corporate Travel",
    oldPrice: "$168",
    newPrice: "$148",
    change: "−$20",
    beforeTitle: "At risk",
    shortReason: "Comp set undercutting",
    beforeBody:
      "Comp set property is undercutting on corporate travel rates — booking conversion is dropping and the contract is up for renewal.",
    afterTitle: "Adjusted −$20",
    afterBody:
      "Rate drops to defend the account against the competitive threat.",
    marketSignal: "Comp set undercutting",
  },
];

// ── Portfolio Segments ─────────────────────────────────────────────────────

export const portfolioSegmentNames: string[] = [
  "Meridian Health — Corporate Negotiated",
  "Meridian Health — Extended Stay",
  "Atlas Corporate — Transient Business",
  "Atlas Corporate — Group Block",
  "Evergreen Events — Ballroom Package",
  "Evergreen Events — Wedding Block",
  "Baxter Travel Group — Leisure Transient",
  "Baxter Travel Group — Extended Stay",
  "Summit Financial — Corporate Negotiated",
  "Summit Financial — Retreat Block",
  "Coastal Medical Center — Group Block",
  "Coastal Medical Center — Extended Stay",
  "Redbird University — Athletic Travel",
  "Redbird University — Conference Block",
  "Magnolia Weddings — Weekend Block",
  "Trident Defense — Government Rate",
  "Trident Defense — Extended Stay",
  "Clearwater Insurance — Corporate Negotiated",
  "Clearwater Insurance — Annual Meeting",
  "Palmetto Engineering — Extended Stay",
  "Southeast Auto Group — Sales Rally Block",
  "Gulf Coast Pharma — Clinical Trial Stay",
  "Harbor View Marina — Leisure Transient",
  "First Coast Bank — Corporate Negotiated",
  "First Coast Bank — Board Retreat",
  "SunBridge Senior Living — Family Visit",
  "Peachtree Consulting — Weekly Extended",
  "Riverwalk Development — Relocation Block",
  "Blue Ridge Tech — Conference Block",
  "Blue Ridge Tech — Corporate Negotiated",
  "Magnolia Health Network — Group Block",
  "King Tide Seafood — Event Catering Suite",
  "Coastal Construction — Crew Extended Stay",
  "Savannah Arts Council — Festival Block",
  "Savannah Arts Council — Leisure Transient",
  "Victory Sports Group — Tournament Block",
  "Southern Logistics Corp — Corporate Negotiated",
  "Southern Logistics Corp — Driver Extended Stay",
  "Cypress Point Golf — Weekend Leisure",
  "Atlantic Regional Hospital — Visiting Physician",
  "Lowcountry Tourism Bureau — FAM Trip Block",
  "Carolina Manufacturing — Shutdown Crew Stay",
  "Tidewater Energy — Extended Stay",
  "Tidewater Energy — Corporate Negotiated",
  "Heritage Foundation — Gala Weekend Block",
  "Suncoast University — Graduation Weekend",
  "Brightline Ventures — Corporate Negotiated",
  "Palm Harbor Resort — Overflow Block",
  "Crescent Bay Developers — Relocation Stay",
  "Southshore Convention — Annual Conference Block",
];

export const portfolioSegmentDeltas: string[] = [
  "+3.2%",  "-1.4%",  "+2.8%",  "+1.6%",  "-0.8%",  "+4.1%",
  "-0.5%",  "+2.2%",  "+1.0%",  "-1.8%",  "+3.6%",  "+0.4%",
  "-1.2%",  "+2.5%",  "+0.8%",  "-0.6%",  "+1.9%",  "+3.4%",
  "-0.3%",  "+2.0%",  "+1.4%",  "-1.0%",  "+2.6%",  "+0.6%",
  "-1.5%",  "+3.8%",  "+1.2%",  "-0.4%",  "+2.1%",  "+0.9%",
  "-1.6%",  "+3.0%",  "+0.7%",  "-0.9%",  "+2.4%",  "+1.8%",
  "-0.2%",  "+3.5%",  "+0.5%",  "-1.3%",  "+2.9%",  "+1.1%",
  "-0.7%",  "+2.3%",  "+0.3%",  "-1.1%",  "+3.3%",  "+1.5%",
  "-0.5%",  "+2.7%",
];

// ── Resolution (Email → Quote pipeline) ──────────────────────────────────

export const resolution: ResolutionContent = {
  annotations: [
    {
      id: "channel",
      text: "EXP-BKG",
      title: "Channel Code Extraction",
      detail: "Booking source resolved → Expedia Group (OTA channel, negotiated rate)",
    },
    {
      id: "room",
      text: "DLX K OV",
      title: "Room Type Normalization",
      detail: "Shorthand resolved → Deluxe King, Ocean View (Property SE-114)",
    },
    {
      id: "rate",
      text: "C-PIN-2024-A",
      title: "Rate Code Matching",
      detail: "Corporate code → Pinnacle Negotiated Rate Plan A (2024 contract)",
    },
    {
      id: "property",
      text: "SE-114",
      title: "Property Resolution",
      detail: "Property code → Pinnacle Southeast, Jacksonville Beach (114 rooms)",
    },
    {
      id: "segment",
      text: "CORP-HC",
      title: "Segment Classification",
      detail: "Guest segment → Corporate Healthcare (Meridian Health account)",
    },
  ],
  emailFrom: "gds-feed@pinnaclehotels.com",
  emailSubject: "Rate Sync — SE Properties Q2 Update",
  sku: "KDOV-SE-114",
  vendor: "Pinnacle Revenue Systems",
  pricingTiers: [
    { qty: 1, price: "$212" },
    { qty: 10, price: "$198" },
    { qty: 25, price: "$184" },
    { qty: 50, price: "$172" },
    { qty: 100, price: "$162" },
    { qty: 200, price: "$149" },
  ],
};

// ── Complexity ─────────────────────────────────────────────────────────────

export const complexity: ComplexityContent = {
  items: [
    "Room Type",
    "View Category",
    "Floor Level",
    "Bed Configuration",
    "ADA Accessibility",
    "Amenity Package",
    "Pet Policy",
    "Suite Layout",
    "Connecting Rooms",
    "Mini Kitchen",
    "Balcony Type",
    "Club Level Access",
    "Smoking Status",
    "Rollaway Availability",
    "Crib Availability",
  ],
  exampleLabel: "EXAMPLE: Room Configuration Pricing",
  keyInputs: [
    {
      icon: "👤",
      label: "Guest",
      items: ["Guest Segment", "Account type"],
    },
    {
      icon: "🏨",
      label: "Property",
      items: [
        "Room type",
        "View category",
        "Floor level",
        "Bed config",
        "Amenity package",
      ],
    },
    {
      icon: "📋",
      label: "Booking",
      items: ["Rate plan", "Length of stay"],
    },
  ],
};

// ── Scenarios ──────────────────────────────────────────────────────────────

export const scenarios: ScenarioContent = {
  items: [
    {
      id: "A",
      price: "$189",
      traits: [
        "Corporate Negotiated",
        "Deluxe King",
        "Convention Week",
        "Healthcare Account",
        "52% Conversion",
      ],
      response: { volume: "Flat", winRate: "Up" },
      adjustment: "++",
      newId: "A2",
      newPrice: "$214",
      newTraits: [
        "Corporate Negotiated",
        "Deluxe King",
        "Convention Week",
        "Healthcare Account",
        "61% Conversion",
      ],
    },
    {
      id: "B",
      price: "$176",
      traits: [
        "Corporate Negotiated",
        "Deluxe King",
        "Off-Peak Tuesday",
        "Financial Services",
        "52% Conversion",
      ],
      response: { volume: "Down", winRate: "Down" },
      adjustment: "–",
      newId: "B2",
      newPrice: "$148",
      newTraits: [
        "Corporate Negotiated",
        "Deluxe King",
        "Off-Peak Tuesday",
        "Financial Services",
        "46% Conversion",
      ],
    },
  ],
};

// ── Segmentation Tree ──────────────────────────────────────────────────────

export const segmentationTree: SegmentationTree = {
  labels: ["Property Type", "Corporate", "Group", "Transient", "Extended Stay"],
};

// ── Demand Curve Dots ──────────────────────────────────────────────────────

export const demandCurveDots: DemandCurveDot[] = [
  { label: "A2: $214", t: 0.18, color: "#00446A" },
  { label: "A: $189", t: 0.28, color: "#00446A" },
  { label: "B: $176", t: 0.38, color: "#21A5D5" },
  { label: "B2: $148", t: 0.52, color: "#E56910" },
];

export const treeOutputPrice: string = "A: $189";

export const driverImportance: DriverImportanceConfig = {
  importance: {
    "Room Type": 15.2,
    "Guest Segment": 13.6,
    "Source Market": 11.8,
    "Booking Channel": 10.2,
    "Comp Set ADR": 9.4,
    "Booking Frequency": 7.6,
    "Relationship Tenure": 7.0,
    "Comp Set Index": 8.0,
    "Room Configuration": 6.2,
    "Rate Sensitivity": 5.8,
    "Account Volume": 5.2,
    "Cost per Occupied Room": 4.6,
    "Property Brand": 4.0,
    "Demand Elasticity": 3.4,
    "Account Manager": 3.0,
    "Day of Week / Season": 2.6,
    "Booking Lead Time": 2.2,
    "Travel Demand Trends": 2.0,
    "Occupancy Share": 1.8,
    "Group Size": 1.6,
    "Comp Set Activity": 1.4,
    "Cancellation Terms": 1.2,
    "Rate Plan Type": 1.0,
    "Length of Stay": 0.4,
  },
  factorOrder: [
    "Room Type", "Guest Segment", "Source Market", "Booking Channel",
    "Comp Set ADR", "Booking Frequency", "Relationship Tenure",
    "Comp Set Index", "Room Configuration", "Rate Sensitivity",
    "Account Volume", "Cost per Occupied Room", "Property Brand",
    "Demand Elasticity", "Account Manager", "Day of Week / Season",
    "Booking Lead Time", "Travel Demand Trends", "Occupancy Share",
    "Group Size", "Comp Set Activity", "Cancellation Terms",
    "Rate Plan Type", "Length of Stay",
  ],
  exampleSteps: [
    {
      supertitle: "Removing a factor",
      headline: "Booking Channel",
      detail: "Which OTA they booked through doesn’t tell you what to charge — it’s an acquisition path, not a pricing signal.",
      dismissLine: "Variance explained by distribution channel, not room value.",
      action: "remove",
      highlight: ["Booking Channel"],
      remove: ["Booking Channel"],
      add: [],
      icon: "✕",
    },
    {
      supertitle: "Elevating a factor",
      headline: "Length of Stay",
      detail: "Longer stays are worth more than you’re pricing them for — a hidden signal worth surfacing.",
      dismissLine: "Separates extended-stay margin from transient night pricing.",
      action: "elevate",
      highlight: ["Length of Stay"],
      remove: [],
      add: ["Length of Stay"],
      icon: "↑",
    },
    {
      supertitle: "Adding a factor",
      headline: "Comp Set Index",
      detail: "Knowing what the hotel next door charges changes everything — a final market check that sharpens every rate.",
      dismissLine: "A market guardrail that sharpens the final rate.",
      action: "add",
      highlight: ["Comp Set Index"],
      remove: [],
      add: ["Comp Set Index"],
      icon: "+",
    },
  ],
  adjustments: [
    { label: "Booking Channel", action: "remove", icon: "✕", reason: "Distribution channel, not a structural pricing driver", category: "Guest" },
    { label: "Room Type", action: "emphasized", icon: "★", reason: "Strongest room-level signal", category: "Room" },
    { label: "Guest Segment", action: "emphasized", icon: "★", reason: "Corporate vs. group vs. transient pricing patterns", category: "Guest" },
    { label: "Source Market", action: "emphasized", icon: "★", reason: "Geographic demand and feeder market dynamics", category: "Guest" },
    { label: "Comp Set ADR", action: "emphasized", icon: "★", reason: "Competitive rate positioning", category: "Market" },
    { label: "Booking Frequency", action: "emphasized", icon: "★", reason: "Repeat booking patterns and loyalty signals", category: "Booking" },
    { label: "Length of Stay", action: "elevate", icon: "↑", reason: "Hidden signal for extended-stay vs. transient pricing", category: "Room" },
    { label: "Comp Set Index", action: "add", icon: "+", reason: "Final market check against nearby hotels", category: "Market" },
  ],
  beforeRisks: [
    { icon: "📱", title: "Booking Channel drives pricing", detail: "Which OTA they booked through matters more than what the room is worth — <b>rates shift with distribution channel, not demand.</b>" },
    { icon: "📉", title: "Hidden signals stay buried", detail: "Length of Stay sits near the bottom — <b>a key signal separating extended-stay margin from transient pricing.</b>" },
    { icon: "🔇", title: "No competitive check", detail: "Without Comp Set Index, <b>the model sets rates blind to what nearby hotels are charging.</b>" },
    { icon: "⚖️", title: "Noise outweighs signal", detail: "24 untuned factors dilute the drivers that actually explain <b>rate variation.</b>" },
  ],
};

export const segmentsMonitored: number = 220;

// ── Step Narratives ────────────────────────────────────────────────────────

export const stepNarratives: StepNarratives = {
  profitGrowthIntro:
    "The model now manages 680,000 bookings × 850 accounts — let’s see the impact with vs. without it.",
  listPrice: "$155",
};

// ── Vocabulary & Slide Text ───────────────────────────────────────────────

export const vocabulary: Vocabulary = {
  productUnit: "room night",
  productUnitPlural: "room nights",
  transactionTerm: "bookings",
  unitId: "Room #K-2140",
};

export const slideText: SlideText = {
  powerTitle: "Every room night is priced differently",
  powerSubtitle: "Corporate negotiated, group blocks, transient walk-ins — far too many combinations for any revenue team to price manually.",
  powerAxisX: "Monthly Booking Volume",
  powerAxisY: "Average Daily Rate ($)",
  driverIntroTitle: "Pricing factors across four dimensions",
  driverIntroSubtitle: "Tuned to your hospitality business — elevating what matters, removing what doesn’t.",
  driverCollapseTitle: "One optimal rate per room night",
  driverCollapseSubtitle: "All your drivers, one answer.",
  executeModelTitle: "Applying the optimized rate at the booking level",
  executeModelSubtitle: "The model starts with one optimized rate per room night — then adjusts for each booking’s unique factors.",
  executeWrapTitle: "The ideal rate, adjusted for each account",
  executeDataSub: "680K booking records scanned for patterns",
  executeInputs: [
    { label: "Internal Data", sub: "680K booking records scanned for patterns" },
    { label: "Revenue Strategy", sub: "Business rules that shape rate guidance" },
    { label: "External Data", sub: "Demand signals driving competitive position" },
    { label: "Hospitality Intelligence", sub: "STR benchmarks and comp set data" },
  ],
  executeOutputs: [
    { label: "Optimized Rate", sub: "Booking-specific guidance" },
    { label: "Booking Probability", sub: "Likelihood at recommended rate" },
    { label: "RevPAR Impact", sub: "Projected uplift vs. current" },
    { label: "Confidence Score", sub: "Statistical certainty range" },
  ],
  executeNavSubtitle: "Room-level rates tailored to each account",
  executeRecapDesc: "Room-level rates tailored to each account, delivered where your revenue team works.",
  powerRecapDesc: "ML finds pricing patterns across millions of bookings humans can’t see.",
  resolutionMatchLabel: "Matched Room Config",
  resolutionIdLabel: "Room Code",
  refineIntroTitle: "Now we look across all your bookings",
  refineIntroSubtitle: "Together, they form a market curve — and every rate gets refined against it.",
  refineCurveTitle: "Your calibrated demand curve",
  refineOptimizedBody: "Every booking is now aligned to the model’s recommended rate — lifting underpriced rooms while protecting wins.",
  statusQuoLabels: [
    "Group block underpriced by 18%",
    "Corporate rate stale for 2 years",
    "Revenue manager overrode model rate",
    "Comp set rate ignored on sellout night",
    "Extended-stay discount exceeded threshold",
    "Inconsistent pricing across properties",
    "Manual exception — no audit trail",
    "Weekend surge missed on select-service",
  ],
  profitStepNarratives: [
    "Each property’s revenue manager sets rates independently — margin leaks with every spreadsheet decision.",
    "The Dynamic Pricing Model optimizes every room rate across the portfolio simultaneously.",
    "The model analyzes room type, day of week, demand signals, and competitive position across every combination.",
    "Rates snap to model-optimized positions — tighter to the demand curve, less revenue leakage.",
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
