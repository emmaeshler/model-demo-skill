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

export interface StepNarratives {
  profitGrowthIntro: string;
  listPrice: string;
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
  segmentsMonitored: number;
  stepNarratives: StepNarratives;
}

// ── Default Values ─────────────────────────────────────────────────────────

// ── Meta ───────────────────────────────────────────────────────────────────

export const meta: ProspectMeta = {
  prospectName: "",
  vertical: "distribution",
  slug: "",
};

// ── Data Counts & Labels ───────────────────────────────────────────────────

export const dataCounts: DataCounts = {
  accounts: 2400,
  skus: 15000,
  orders: 14200,
  marketFeatures: 36,
  monthsOfData: 18,
};

export const dataLabels: DataLabels = {
  accounts: "customer accounts",
  skus: "SKUs",
  orders: "order records",
  marketFeatures: "market features",
  monthsOfData: "months of product data",
};

// ── Customer Scenarios ─────────────────────────────────────────────────────

export const customers: CustomerScenario[] = [
  {
    name: "Acme Industrial",
    segment: "High volume · loyal",
    price: "$19.24",
    delta: "+$1.74 above Historical Average",
    winProb: "68%",
    margin: "+9.9%",
    narrative:
      "Same product, but now the model layers in the customer — high order frequency, long tenure, and strong end market positioning push the price above Historical Average.",
    sliders: [
      { label: "Product Category", value: 0.75 },
      { label: "Geography", value: 0.60 },
      { label: "End Market", value: 0.85 },
      { label: "Product Importance", value: 0.70 },
      { label: "Order Frequency", value: 0.82 },
      { label: "Customer Tenure", value: 0.90 },
      { label: "Competitor Pricing", value: 0.55 },
    ],
    color: "#00446A",
  },
  {
    name: "MedSupply Co",
    segment: "Price-sensitive · contested",
    price: "$16.60",
    delta: "−0.90 below Historical Average",
    winProb: "74%",
    margin: "−1.2%",
    narrative:
      "Different customer, different answer — high product importance and competitive pressure push the price below Historical Average to protect win rate.",
    sliders: [
      { label: "Product Category", value: 0.65 },
      { label: "Geography", value: 0.50 },
      { label: "End Market", value: 0.55 },
      { label: "Product Importance", value: 0.80 },
      { label: "Order Frequency", value: 0.45 },
      { label: "Customer Tenure", value: 0.40 },
      { label: "Competitor Pricing", value: 0.70 },
    ],
    color: "#21A5D5",
  },
  {
    name: "QuickParts LLC",
    segment: "Niche need · captive",
    price: "$22.10",
    delta: "+$4.60 above Historical Average",
    winProb: "81%",
    margin: "+5.7%",
    narrative:
      "Same bearing, highest price — this buyer’s niche application and high product importance mean few alternatives, driving the price up.",
    sliders: [
      { label: "Product Category", value: 0.80 },
      { label: "Geography", value: 0.35 },
      { label: "End Market", value: 0.70 },
      { label: "Product Importance", value: 0.90 },
      { label: "Order Frequency", value: 0.22 },
      { label: "Customer Tenure", value: 0.15 },
      { label: "Competitor Pricing", value: 0.20 },
    ],
    color: "#1B4F72",
  },
];

// ── Pricing Factors ────────────────────────────────────────────────────────

export const factors: PricingFactors = {
  customer: [
    { label: "End Market", category: "customer" },
    { label: "Sales Rep", category: "customer" },
    { label: "Geography", category: "customer" },
    { label: "Customer size", category: "customer" },
    { label: "Customer Tenure", category: "customer" },
    { label: "Customer channel", category: "customer" },
  ],
  product: [
    { label: "Product Category", category: "product" },
    { label: "Product family", category: "product" },
    { label: "Product Specialization", category: "product" },
    { label: "Cost to serve", category: "product" },
    { label: "Willingness to pay", category: "product" },
    { label: "Price sensitivity", category: "product" },
    { label: "Product Importance", category: "product" },
  ],
  market: [
    { label: "Market share", category: "market" },
    { label: "Commodity index", category: "market" },
    { label: "Industry trends", category: "market" },
    { label: "Competitor activity", category: "market" },
    { label: "Competitor Pricing", category: "market" },
  ],
  order: [
    { label: "Order Frequency", category: "order" },
    { label: "Order size", category: "order" },
    { label: "Lead time", category: "order" },
    { label: "Payment terms", category: "order" },
    { label: "Contract type", category: "order" },
    { label: "Seasonality", category: "order", emphasis: "deemphasize" },
  ],
};

// ── Category Titles & Narration ────────────────────────────────────────────

export const categoryTitles: string[] = [
  "Customer factors",
  "Product factors",
  "Order factors",
  "Market factors",
];

export const categoryNarration: string[] = [
  "Who is the customer — geography, tenure, size, channel, and sales relationship.",
  "What’s being sold — category, family, specialization, cost, and price sensitivity.",
  "How orders behave — frequency, size, lead time, terms, and seasonality.",
  "Where you compete — share, commodities, trends, and competitive dynamics.",
];

// ── Selected Drivers ───────────────────────────────────────────────────────

export const selectedDrivers: SelectedDriver[] = [
  { label: "Product Category", color: "#E56910", weight: 4, note: "" },
  { label: "Geography", color: "#00446A", weight: 3, note: "" },
  { label: "End Market", color: "#00446A", weight: 4, note: "" },
  { label: "Product Importance", color: "#E56910", weight: 3, note: "Added" },
  { label: "Order Frequency", color: "#7B5EA7", weight: 2, note: "" },
  { label: "Customer Tenure", color: "#00446A", weight: 3, note: "" },
  { label: "Competitor Pricing", color: "#2e7d32", weight: 2, note: "Added" },
];

// ── Driver Clusters ────────────────────────────────────────────────────────

export const driverClusters: DriverCluster[] = [
  { label: "Cost Trends", color: "#00446A" },
  { label: "Competitive Position", color: "#E56910" },
  { label: "Volume & Elasticity", color: "#2e7d32" },
  { label: "Win / Loss Patterns", color: "#7B5EA7" },
];

// ── Factor Actions ─────────────────────────────────────────────────────────

export const factorActions: Record<string, FactorAction[]> = {
  customer: [{ label: "Sales Rep", action: "remove" }],
  product: [{ label: "Product Importance", action: "add" }],
  market: [{ label: "Competitor Pricing", action: "add" }],
  order: [{ label: "Seasonality", action: "lower" }],
};

export const factorActionHints: ActionHint[] = [
  {
    icon: "×",
    color: "#21A5D5",
    headline: "Remove a factor",
    detail:
      "Sales Rep is behavioral — it doesn’t belong in the model.",
  },
  {
    icon: "+",
    color: "#21A5D5",
    headline: "Add a factor",
    detail:
      "Product Importance indicates price sensitivity for a product within a customer.",
  },
  {
    icon: "↓",
    color: "#7B5EA7",
    headline: "Lower its weight",
    detail:
      "Seasonality has minimal impact for this customer — dial it down.",
  },
  {
    icon: "+",
    color: "#2e7d32",
    headline: "Add a factor",
    detail:
      "Competitor Pricing is low weight, but adds a final positioning check.",
  },
];

// ── Spotlights ─────────────────────────────────────────────────────────────

export const spotlights: Spotlight[] = [
  {
    cluster: 2,
    icon: "people",
    label: "CUSTOMER",
    count: "Found 2,400 customer accounts",
  },
  {
    cluster: 3,
    icon: "chart",
    label: "PRODUCT",
    count: "Found 18 months of product data",
  },
  {
    cluster: 1,
    icon: "trend",
    label: "MARKET",
    count: "Found 36 market features",
  },
  {
    cluster: 0,
    icon: "grid",
    label: "ORDER",
    count: "Found 14,200 order records",
  },
];

// ── Titles & Subtitles ─────────────────────────────────────────────────────

export const titles: string[] = [
  "2,400 accounts × 15,000 SKUs",
  "The model scans for patterns",
  "Your customized factors now feed the model",
  "Your model drivers produce one optimized price per SKU",
];

export const subtitles: string[] = [
  "That’s millions of unique price points — far too many for any team to set manually. The model finds the patterns hiding inside.",
  "We look at pricing factors across four dimensions — tailored to what matters for your business.",
  "Every business is different. We analyze what matters to you — adding key factors, removing what doesn’t apply, and tuning the balance.",
  "Seven tailored drivers — drawn from the factors that matter most to you — feed the model to arrive at the right price for every SKU.",
];

// ── Callouts ───────────────────────────────────────────────────────────────

export const callouts: Callout[] = [
  { label: "Acme Industrial", price: "$58.20", x: 310, y: 115 },
  { label: "QuickParts LLC", price: "$34.50", x: 625, y: 185 },
  { label: "MedSupply Co", price: "$47.10", x: 475, y: 290 },
  { label: "Coastal Dist.", price: "$62.80", x: 165, y: 195 },
  { label: "Delta Mfg", price: "$29.40", x: 760, y: 320 },
];

// ── Base Price & Satellites ────────────────────────────────────────────────

export const basePriceValue: number = 15.90;

export const priceSatellites: PriceSatellite[] = [
  { label: "Customer", price: "+$0.60", value: 0.60 },
  { label: "Product", price: "+$0.85", value: 0.85 },
  { label: "Market", price: "−$0.30", value: -0.30 },
  { label: "Order", price: "+$0.45", value: 0.45 },
];

// ── KPIs ───────────────────────────────────────────────────────────────────

export const kpis: KPI[] = [
  { label: "Margin Uplift", before: "28%", after: "34%" },
  { label: "Win Rate", before: "41%", after: "47%" },
  { label: "Price Consistency", before: "Low", after: "High" },
  { label: "Override Rate", before: "38%", after: "12%" },
  { label: "Quote Speed", before: "3 days", after: "Real-time" },
];

// ── Baseline & Timeline KPIs ──────────────────────────────────────────────

export const baselineKpi: BaselineKPI = {
  winRate: 62,
  priceAdoption: 71,
  marginImpact: 1.8,
};

export const timelineEvents: TimelineEvent[] = [
  {
    month: 6,
    label: "Steel +8%",
    dotLabel: "Steel",
    factor:
      "Steel index rises — combined with declining win rates, the model reprices upward to protect margin.",
    kpi: { winRate: 59, priceAdoption: 76, marginImpact: 2.1 },
  },
  {
    month: 12,
    label: "Freight −6%",
    dotLabel: "Freight",
    factor:
      "Freight costs drop and adoption climbs — the model splits the savings between price and margin.",
    kpi: { winRate: 66, priceAdoption: 80, marginImpact: 2.4 },
  },
  {
    month: 18,
    label: "Industry +12%",
    dotLabel: "Industry",
    factor:
      "Industry-wide increase — win rate holds, adoption is high, so the model reprices confidently.",
    kpi: { winRate: 63, priceAdoption: 84, marginImpact: 2.5 },
  },
];

// ── Segment Highlights ─────────────────────────────────────────────────────

export const segmentHighlights: SegmentHighlight[] = [
  {
    t: 0.12,
    label: "QuickParts",
    oldPrice: "$22.10",
    newPrice: "$24.20",
    change: "+$2.10",
    beforeTitle: "Priced too low",
    shortReason: "No competition",
    beforeBody:
      "No competition in this niche, but cost increases aren’t reflected in the price.",
    afterTitle: "Adjusted +$2.10",
    afterBody:
      "Cost pressure passes through — price moves to the market curve.",
    marketSignal: "Cost pressure, no competition",
  },
  {
    t: 0.35,
    label: "Acme",
    oldPrice: "$19.24",
    newPrice: "$19.80",
    change: "+$0.56",
    beforeTitle: "Underpriced",
    shortReason: "Win rate climbing",
    beforeBody:
      "Win rate is climbing — a pattern, not noise. There’s room to price higher.",
    afterTitle: "Adjusted +$0.56",
    afterBody:
      "Price rises to capture margin the data says is available.",
    marketSignal: "Win rate climbing, margin available",
  },
  {
    t: 0.72,
    label: "MedSupply",
    oldPrice: "$18.40",
    newPrice: "$17.95",
    change: "−$0.45",
    beforeTitle: "At risk",
    shortReason: "New entrant undercutting",
    beforeBody:
      "A new entrant is undercutting — willingness to pay is dropping in this region.",
    afterTitle: "Adjusted −$0.45",
    afterBody:
      "Price drops to defend the deal against the competitive threat.",
    marketSignal: "New entrant undercutting",
  },
];

// ── Portfolio Segments ─────────────────────────────────────────────────────

export const portfolioSegmentNames: string[] = [
  "Acme Mfg – Industrial MRO",
  "BearingCo – Heavy Equipment",
  "AutoParts Direct – Automotive OEM",
  "SeaGuard – Marine Offshore",
  "ClimaTech – HVAC Systems",
  "MedSupply Co – Medical Devices",
  "AeroSpec – Aerospace Def.",
  "PetroChem Ltd – Oil & Gas",
  "CoastLine – Marine Coatings",
  "FlowTech – Comm. Plumbing",
  "NetWire Corp – Telecom",
  "ThermalPro – Commercial",
  "DriveLink – Auto Aftermkt.",
  "CircuitEdge – Electronics",
  "HomeFit – Furniture",
  "ArmorTech – Defense Sys.",
  "SteelRise – Construction",
  "SunBuild – Solar Energy",
  "SignCraft – Signage",
  "SkyFast – Aerospace Mfg.",
  "RailWorks – Rail Transport",
  "DeepCore – Mining Ops.",
  "PetroFlow – Petrochemical",
  "MicroPin – Electronics",
  "PackRight – Packaging",
  "PrecisionCo – Precision",
  "StructurePro – Structural",
  "HydraForce – Hydraulic",
  "WindPower – Wind Energy",
  "AgriChain – Agriculture",
  "VoltEdge – Power Dist.",
  "ClearCoat – Ind. Coatings",
  "TitanGrip – Fasteners",
  "AquaPure – Water Treat.",
  "FiberLink – Fiber Optics",
  "ChemFlow – Spec. Chem.",
  "ProWeld – Welding Supply",
  "GeoTech – Geotech Equip.",
  "BrightSteel – Steel Fab.",
  "CoolAir – Refrigeration",
  "SpectraLens – Optics MRO",
  "CoreDrill – Drilling Ops.",
  "AlphaValve – Valve Dist.",
  "NexGen Parts – Gen. Ind.",
  "SolidPipe – Pipeline Eng.",
  "LaserCut – CNC Fab.",
  "TrueGauge – Instruments",
  "IronClad – Metal Svcs.",
  "BlueWave – Marine Sys.",
  "VertexAir – Ventilation",
];

export const portfolioSegmentDeltas: string[] = [
  "+1.8%",  "-0.4%",  "+3.2%",  "+0.9%",  "-1.1%",  "+2.4%",
  "-0.7%",  "+1.5%",  "+0.3%",  "-0.9%",  "+2.7%",  "+1.2%",
  "-0.5%",  "+1.9%",  "-0.2%",  "+3.1%",  "+0.8%",  "-1.3%",
  "+2.0%",  "-0.6%",  "+1.4%",  "+0.7%",  "-0.3%",  "+2.5%",
  "+1.1%",  "-0.8%",  "+1.6%",  "+0.4%",  "-1.0%",  "+2.2%",
  "+0.5%",  "-0.3%",  "+2.8%",  "+1.3%",  "-0.9%",  "+1.7%",
  "-0.6%",  "+3.0%",  "+0.2%",  "-1.2%",  "+2.1%",  "-0.4%",
  "+1.5%",  "+0.8%",  "-0.7%",  "+2.3%",  "+0.6%",  "-0.5%",
  "+1.9%",  "-0.2%",
];

// ── Resolution (Email → SKU pipeline) ──────────────────────────────────────

export const resolution: ResolutionContent = {
  annotations: [
    {
      id: "insulator",
      text: "INSULATOR",
      title: "Token Extraction",
      detail: "Product type identified → STANDOFF (Rigid Insulation)",
    },
    {
      id: "voltage",
      text: "2.7KV",
      title: "Unit Normalization",
      detail: "Non-standard unit → 2700V (catalog format)",
    },
    {
      id: "thread",
      text: "3/8-16",
      title: "Fuzzy SKU Lookup",
      detail: "Ambiguous spec → 3/8×16×9/16 (thread matched)",
    },
    {
      id: "vendor",
      text: "MAR-BAL",
      title: "Vendor Resolution",
      detail: "Shorthand → MAR-BAL INC. (verified vendor)",
    },
    {
      id: "variant",
      text: "R4225-S5",
      title: "Variant Disambiguation",
      detail: "S5 suffix → A5 (metric variant rejected)",
    },
  ],
  emailFrom: "buyer@industrialco.com",
  emailSubject: "Quote Request — Insulators",
  sku: "STAOFFR4225A5",
  vendor: "MAR-BAL INC.",
  pricingTiers: [
    { qty: 1, price: "$124.50" },
    { qty: 5, price: "$118.28" },
    { qty: 10, price: "$112.05" },
    { qty: 25, price: "$105.83" },
    { qty: 50, price: "$99.60" },
    { qty: 100, price: "$93.38" },
  ],
};

// ── Complexity ─────────────────────────────────────────────────────────────

export const complexity: ComplexityContent = {
  items: [
    "Finish Type",
    "Material Grade",
    "Surface Treatment",
    "Edge Profile",
    "Base Thickness",
    "Copper Weight",
    "Layer Count",
    "Impedance Control",
    "Via Type",
    "Solder Mask",
    "Silkscreen",
    "Panelization",
    "Stack-up Config",
    "Drill Aspect Ratio",
    "UL Rating",
  ],
  exampleLabel: "EXAMPLE: Specialty Parts Manufacturer",
  keyInputs: [
    {
      icon: "👤",
      label: "Customer",
      items: ["End Market", "Customer importance"],
    },
    {
      icon: "📦",
      label: "Product",
      items: [
        "Key material",
        "Finish material",
        "Thickness",
        "Hardware",
        "Quantity",
      ],
    },
    {
      icon: "📋",
      label: "Deal Context",
      items: ["Leadtime", "Plant capacity"],
    },
  ],
};

// ── Scenarios ──────────────────────────────────────────────────────────────

export const scenarios: ScenarioContent = {
  items: [
    {
      id: "A",
      price: "$17.96",
      traits: [
        "Strategic Customer",
        "Specialized Product",
        "High Product Mix",
        "Industrial End Market",
        "40% Win Rate",
      ],
      response: { volume: "Flat", winRate: "Up" },
      adjustment: "++",
      newId: "A2",
      newPrice: "$19.24",
      newTraits: [
        "Strategic Customer",
        "Specialized Product",
        "High Product Mix",
        "Industrial End Market",
        "43% Win Rate",
      ],
    },
    {
      id: "B",
      price: "$16.73",
      traits: [
        "Strategic Customer",
        "Specialized Product",
        "Low Product Mix",
        "Healthcare End Market",
        "40% Win Rate",
      ],
      response: { volume: "Down", winRate: "Down" },
      adjustment: "–",
      newId: "B2",
      newPrice: "$18.40",
      newTraits: [
        "Strategic Customer",
        "Specialized Product",
        "Low Product Mix",
        "Healthcare End Market",
        "38% Win Rate",
      ],
    },
  ],
};

// ── Segmentation Tree ──────────────────────────────────────────────────────

export const segmentationTree: SegmentationTree = {
  labels: ["Customer", "Strategic", "Standard", "Specialized", "Commodity"],
};

// ── Segments Monitored ─────────────────────────────────────────────────────

export const segmentsMonitored: number = 247;

// ── Step Narratives ────────────────────────────────────────────────────────

export const stepNarratives: StepNarratives = {
  profitGrowthIntro:
    "The model now manages 14,200 prices × 2,400 accounts — let’s see the impact with vs. without it.",
  listPrice: "$17.50",
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
  segmentsMonitored,
  stepNarratives,
};

export default PROSPECT_CONFIG;
