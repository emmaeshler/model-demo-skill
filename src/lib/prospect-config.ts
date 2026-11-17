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
}

// ── Default Values ─────────────────────────────────────────────────────────

// ── Meta ───────────────────────────────────────────────────────────────────

export const meta: ProspectMeta = {
  prospectName: "Pinnacle Hospitality Group",
  vertical: "hospitality",
  slug: "pinnacle-hospitality",
};

// ── Data Counts & Labels ───────────────────────────────────────────────────

export const dataCounts: DataCounts = {
  accounts: 1200,
  skus: 540,
  orders: 185000,
  marketFeatures: 42,
  monthsOfData: 36,
};

export const dataLabels: DataLabels = {
  accounts: "client accounts",
  skus: "room configurations",
  orders: "booking records",
  marketFeatures: "market signals",
  monthsOfData: "months of booking data",
};

// ── Customer Scenarios ─────────────────────────────────────────────────────

export const customers: CustomerScenario[] = [
  {
    name: "Meridian Consulting",
    segment: "High volume · corporate",
    price: "$189.00",
    delta: "+$21.00 above Historical Average",
    winProb: "72%",
    margin: "+8.4%",
    narrative:
      "Same room, but now the model layers in the guest — high booking frequency, long tenure, and strong corporate positioning push the rate above Historical Average.",
    sliders: [
      { label: "Room Type", value: 0.75 },
      { label: "Market Region", value: 0.65 },
      { label: "Guest Segment", value: 0.85 },
      { label: "Seasonal Demand", value: 0.60 },
      { label: "Competitor ADR", value: 0.55 },
      { label: "Booking Lead Time", value: 0.80 },
      { label: "Event Calendar Index", value: 0.45 },
    ],
    color: "#00446A",
  },
  {
    name: "SunCoast Leisure Travel",
    segment: "Price-sensitive · OTA-driven",
    price: "$142.00",
    delta: "−$12.50 below Historical Average",
    winProb: "68%",
    margin: "−2.1%",
    narrative:
      "Different guest, different answer — high rate sensitivity and competitive pressure from Marriott push the rate below Historical Average to protect occupancy.",
    sliders: [
      { label: "Room Type", value: 0.55 },
      { label: "Market Region", value: 0.70 },
      { label: "Guest Segment", value: 0.45 },
      { label: "Seasonal Demand", value: 0.85 },
      { label: "Competitor ADR", value: 0.80 },
      { label: "Booking Lead Time", value: 0.35 },
      { label: "Event Calendar Index", value: 0.65 },
    ],
    color: "#21A5D5",
  },
  {
    name: "Evergreen Events Co",
    segment: "Group block · captive",
    price: "$214.00",
    delta: "+$46.00 above Historical Average",
    winProb: "85%",
    margin: "+6.3%",
    narrative:
      "Same room, highest rate — this group's niche venue requirements and high demand score mean few alternatives, driving the rate up.",
    sliders: [
      { label: "Room Type", value: 0.80 },
      { label: "Market Region", value: 0.40 },
      { label: "Guest Segment", value: 0.70 },
      { label: "Seasonal Demand", value: 0.75 },
      { label: "Competitor ADR", value: 0.20 },
      { label: "Booking Lead Time", value: 0.90 },
      { label: "Event Calendar Index", value: 0.85 },
    ],
    color: "#1B4F72",
  },
];

// ── Pricing Factors ────────────────────────────────────────────────────────

export const factors: PricingFactors = {
  customer: [
    { label: "Guest Segment", category: "customer" },
    { label: "Booking Channel", category: "customer" },
    { label: "Market Region", category: "customer" },
    { label: "Account Volume", category: "customer" },
    { label: "Guest Loyalty", category: "customer" },
    { label: "Corporate vs. Leisure", category: "customer" },
  ],
  product: [
    { label: "Room Type", category: "product" },
    { label: "Property Tier", category: "product" },
    { label: "Room Amenities", category: "product" },
    { label: "Cost per Occupied Room", category: "product" },
    { label: "Willingness to Pay", category: "product" },
    { label: "Rate Sensitivity", category: "product" },
    { label: "Room Demand Score", category: "product" },
  ],
  market: [
    { label: "Market Penetration", category: "market" },
    { label: "Event Calendar Index", category: "market" },
    { label: "Tourism Trends", category: "market" },
    { label: "Competitor Occupancy", category: "market" },
    { label: "Competitor ADR", category: "market" },
  ],
  order: [
    { label: "Booking Frequency", category: "order" },
    { label: "Length of Stay", category: "order" },
    { label: "Booking Lead Time", category: "order" },
    { label: "Cancellation Terms", category: "order" },
    { label: "Rate Plan Type", category: "order" },
    { label: "Seasonal Demand", category: "order", emphasis: "deemphasize" },
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
  "Who is the guest — segment, channel, region, volume, loyalty, and corporate vs. leisure.",
  "What's being booked — room type, property tier, amenities, cost, and rate sensitivity.",
  "How bookings behave — frequency, length of stay, lead time, terms, and seasonality.",
  "Where you compete — penetration, events, tourism trends, and competitive dynamics.",
];

// ── Selected Drivers ───────────────────────────────────────────────────────

export const selectedDrivers: SelectedDriver[] = [
  { label: "Room Type", color: "#E56910", weight: 4, note: "" },
  { label: "Market Region", color: "#00446A", weight: 3, note: "" },
  { label: "Guest Segment", color: "#00446A", weight: 4, note: "" },
  { label: "Seasonal Demand", color: "#7B5EA7", weight: 3, note: "Added" },
  { label: "Competitor ADR", color: "#2e7d32", weight: 3, note: "Added" },
  { label: "Booking Lead Time", color: "#7B5EA7", weight: 2, note: "" },
  { label: "Event Calendar Index", color: "#2e7d32", weight: 2, note: "" },
];

// ── Driver Clusters ────────────────────────────────────────────────────────

export const driverClusters: DriverCluster[] = [
  { label: "Demand Patterns", color: "#00446A" },
  { label: "Competitive Position", color: "#E56910" },
  { label: "Rate Sensitivity", color: "#2e7d32" },
  { label: "Booking Patterns", color: "#7B5EA7" },
];

// ── Factor Actions ─────────────────────────────────────────────────────────

export const factorActions: Record<string, FactorAction[]> = {
  customer: [{ label: "Booking Channel", action: "remove" }],
  product: [{ label: "Room Demand Score", action: "add" }],
  market: [{ label: "Competitor ADR", action: "add" }],
  order: [{ label: "Cancellation Terms", action: "lower" }],
};

export const factorActionHints: ActionHint[] = [
  {
    icon: "×",
    color: "#21A5D5",
    headline: "Remove a factor",
    detail:
      "Booking Channel is a distribution mechanism — it doesn't belong in the pricing model.",
  },
  {
    icon: "+",
    color: "#21A5D5",
    headline: "Add a factor",
    detail:
      "Room Demand Score captures how urgently each room type needs to be filled.",
  },
  {
    icon: "↓",
    color: "#7B5EA7",
    headline: "Lower its weight",
    detail:
      "Cancellation Terms have minimal impact on optimal rate — dial it down.",
  },
  {
    icon: "+",
    color: "#2e7d32",
    headline: "Add a factor",
    detail:
      "Competitor ADR adds a final market positioning check against Marriott and others.",
  },
];

// ── Spotlights ─────────────────────────────────────────────────────────────

export const spotlights: Spotlight[] = [
  {
    cluster: 2,
    icon: "people",
    label: "GUEST",
    count: "Found 1,200 client accounts",
  },
  {
    cluster: 3,
    icon: "chart",
    label: "ROOM",
    count: "Found 36 months of booking data",
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
    count: "Found 185,000 booking records",
  },
];

// ── Titles & Subtitles ─────────────────────────────────────────────────────

export const titles: string[] = [
  "1,200 accounts × 540 room configurations",
  "The model scans for patterns",
  "Your customized factors now feed the model",
  "Your model drivers produce one optimized rate per room configuration",
];

export const subtitles: string[] = [
  "That's thousands of unique rate points — far too many for any team to set manually. The model finds the patterns hiding inside.",
  "We look at pricing factors across four dimensions — tailored to what matters for your business.",
  "Every business is different. We analyze what matters to you — adding key factors, removing what doesn't apply, and tuning the balance.",
  "Seven tailored drivers — drawn from the factors that matter most to you — feed the model to arrive at the right rate for every room configuration.",
];

// ── Callouts ───────────────────────────────────────────────────────────────

export const callouts: Callout[] = [
  { label: "Meridian Consulting", price: "$189.00", x: 310, y: 115 },
  { label: "Evergreen Events", price: "$214.00", x: 625, y: 185 },
  { label: "SunCoast Leisure", price: "$142.00", x: 475, y: 290 },
  { label: "Cypress Financial", price: "$198.00", x: 165, y: 195 },
  { label: "Blue Ridge Tours", price: "$128.00", x: 760, y: 320 },
];

// ── Base Price & Satellites ────────────────────────────────────────────────

export const basePriceValue: number = 168.00;

export const priceSatellites: PriceSatellite[] = [
  { label: "Guest", price: "+$8.50", value: 8.50 },
  { label: "Room", price: "+$12.00", value: 12.00 },
  { label: "Market", price: "−$4.50", value: -4.50 },
  { label: "Booking", price: "+$5.00", value: 5.00 },
];

// ── KPIs ───────────────────────────────────────────────────────────────────

export const kpis: KPI[] = [
  { label: "RevPAR Growth", before: "+12%", after: "+22%" },
  { label: "Booking Conversion", before: "34%", after: "43%" },
  { label: "Rate Consistency", before: "Low", after: "High" },
  { label: "Manual Override Rate", before: "45%", after: "9%" },
  { label: "Rate Update Speed", before: "Quarterly", after: "Real-time" },
];

// ── Baseline & Timeline KPIs ──────────────────────────────────────────────

export const baselineKpi: BaselineKPI = {
  winRate: 58,
  priceAdoption: 65,
  marginImpact: 1.4,
};

export const timelineEvents: TimelineEvent[] = [
  {
    month: 8,
    label: "Spring Break +15%",
    dotLabel: "Spring",
    factor:
      "Spring break surge drives coastal demand — the model captures peak-season rates that quarterly rate cards would miss.",
    kpi: { winRate: 55, priceAdoption: 72, marginImpact: 1.9 },
  },
  {
    month: 20,
    label: "Hurricane −12%",
    dotLabel: "Hurricane",
    factor:
      "Hurricane season suppresses southeast travel — the model drops rates to protect occupancy while competitors hold static prices.",
    kpi: { winRate: 62, priceAdoption: 78, marginImpact: 2.0 },
  },
  {
    month: 32,
    label: "Convention +20%",
    dotLabel: "Convention",
    factor:
      "Major convention influx — the model recognizes the demand spike and reprices confidently across properties.",
    kpi: { winRate: 60, priceAdoption: 83, marginImpact: 2.3 },
  },
];

// ── Segment Highlights ─────────────────────────────────────────────────────

export const segmentHighlights: SegmentHighlight[] = [
  {
    t: 0.12,
    label: "Evergreen Events",
    oldPrice: "$214.00",
    newPrice: "$232.00",
    change: "+$18.00",
    beforeTitle: "Priced too low",
    shortReason: "No competition",
    beforeBody:
      "Wedding season approaching with no competing boutique venues — current rate card doesn't capture the demand surge.",
    afterTitle: "Adjusted +$18.00",
    afterBody:
      "Seasonal demand and venue exclusivity push the rate to market-clearing price.",
    marketSignal: "Peak season, no competition",
  },
  {
    t: 0.35,
    label: "Meridian",
    oldPrice: "$189.00",
    newPrice: "$195.00",
    change: "+$6.00",
    beforeTitle: "Underpriced",
    shortReason: "Conversion climbing",
    beforeBody:
      "Booking conversion is climbing — a pattern, not noise. There's room to price higher for this corporate segment.",
    afterTitle: "Adjusted +$6.00",
    afterBody:
      "Rate rises to capture margin the data says is available.",
    marketSignal: "Conversion climbing, margin available",
  },
  {
    t: 0.72,
    label: "SunCoast",
    oldPrice: "$148.00",
    newPrice: "$138.00",
    change: "−$10.00",
    beforeTitle: "At risk",
    shortReason: "Marriott undercutting",
    beforeBody:
      "Marriott is undercutting in this market — OTA shoppers are price-comparing and booking conversion is dropping.",
    afterTitle: "Adjusted −$10.00",
    afterBody:
      "Rate drops to defend occupancy against the competitive threat.",
    marketSignal: "Marriott undercutting",
  },
];

// ── Portfolio Segments ─────────────────────────────────────────────────────

export const portfolioSegmentNames: string[] = [
  "Meridian Consulting – Charleston King Suite",
  "SunCoast Leisure – Savannah Std Double",
  "Evergreen Events – Asheville Group Block",
  "Trident Corp – Nashville Premium Suite",
  "Palmetto Weddings – Hilton Head Ballroom Pkg",
  "Blue Ridge Tours – Gatlinburg Standard",
  "Southline Pharma – Atlanta King Deluxe",
  "Magnolia Events – Charleston Group Block",
  "Cypress Financial – Savannah Suite",
  "Redbird Logistics – Nashville Std Double",
  "Tideline Retreats – Hilton Head Oceanview",
  "Ironwood Consulting – Asheville Premium",
  "Coastal Med Conf – Charleston Block Pkg",
  "Peachtree Legal – Atlanta King Suite",
  "Riverbend Agency – Gatlinburg Std Queen",
  "Harbor Tech – Savannah Waterfront King",
  "Summit Health – Nashville Suite",
  "Carolina Realty – Charleston Std Double",
  "Gulf Breeze Travel – Hilton Head Resort Pkg",
  "Appalachian Adv. – Asheville Std Queen",
  "Dogwood Financial – Atlanta Premium Suite",
  "Lowcountry Events – Charleston Oceanview",
  "Volunteer State Conv. – Nashville Group Block",
  "Piedmont Insurance – Savannah King Deluxe",
  "Golden Isles Tours – Hilton Head Std Double",
  "Smoky Mtn Weddings – Gatlinburg Block Pkg",
  "Crescent Consulting – Atlanta Std Double",
  "Azalea Health Grp – Charleston Suite",
  "SilverLeaf Corp – Nashville King Deluxe",
  "Tidewater Assoc. – Savannah Group Block",
  "Heritage Tours – Asheville Waterfront King",
  "Beacon Partners – Hilton Head Premium Suite",
  "Southern Conf. Svcs – Atlanta Block Pkg",
  "Inlet Marine – Charleston Std Queen",
  "MidSouth Logistics – Nashville Standard",
  "Sapphire Legal – Savannah Premium Suite",
  "Ridgeline Events – Gatlinburg Group Block",
  "Coastal Engineering – Hilton Head King Deluxe",
  "Dixie Pharma – Atlanta Oceanview",
  "Live Oak Agency – Charleston Premium",
  "River City Health – Nashville Waterfront King",
  "Marshland Tours – Savannah Resort Pkg",
  "Pinnacle Partners – Asheville King Suite",
  "Bay Street Legal – Hilton Head Std Double",
  "Foothills Retreat – Gatlinburg Suite",
  "Magnolia Law Grp – Charleston King Deluxe",
  "Music Row Events – Nashville Block Pkg",
  "Barrier Island Tours – Savannah Std Queen",
  "Highland Consulting – Atlanta Premium Suite",
  "Sea Pines Corp – Hilton Head Oceanview",
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

// ── Resolution (Email → Room pipeline) ────────────────────────────────────

export const resolution: ResolutionContent = {
  annotations: [
    {
      id: "roomtype",
      text: "KNG-DLX",
      title: "Room Code Extraction",
      detail: "Shorthand resolved → King Deluxe Oceanview (property standard)",
    },
    {
      id: "ratecode",
      text: "CORP-A",
      title: "Rate Code Normalization",
      detail: "Legacy code → Corporate Negotiated Rate A (current structure)",
    },
    {
      id: "dates",
      text: "3/15-3/18",
      title: "Availability Lookup",
      detail: "Date range → 3 nights confirmed available (King Deluxe)",
    },
    {
      id: "property",
      text: "BW-SVAN",
      title: "Property Resolution",
      detail: "Shorthand → Pinnacle Charleston Waterfront (verified property)",
    },
    {
      id: "package",
      text: "PKG-ROM",
      title: "Package Disambiguation",
      detail: "ROM suffix → Romance Package 2N+Dinner (spa add-on excluded)",
    },
  ],
  emailFrom: "reservations@meridiangroup.com",
  emailSubject: "Group Rate Request — King Suites",
  sku: "CHSWF-KNGDLX-OV",
  vendor: "Pinnacle Charleston Waterfront",
  pricingTiers: [
    { qty: 1, price: "$214.00" },
    { qty: 5, price: "$198.00" },
    { qty: 10, price: "$186.00" },
    { qty: 25, price: "$172.00" },
    { qty: 50, price: "$159.00" },
    { qty: 100, price: "$148.00" },
  ],
};

// ── Complexity ─────────────────────────────────────────────────────────────

export const complexity: ComplexityContent = {
  items: [
    "View Type",
    "Floor Level",
    "Bed Configuration",
    "Suite Layout",
    "Balcony Access",
    "Pet-Friendly",
    "ADA Accessible",
    "Mini-Bar Package",
    "Breakfast Inclusion",
    "Check-in Flexibility",
    "Resort Fee Tier",
    "Parking Inclusion",
    "Late Checkout",
    "Loyalty Tier Upgrade",
    "Cancellation Window",
  ],
  exampleLabel: "EXAMPLE: Boutique Hotel Revenue Management",
  keyInputs: [
    {
      icon: "👤",
      label: "Guest",
      items: ["Guest Segment", "Guest loyalty"],
    },
    {
      icon: "🏨",
      label: "Room",
      items: [
        "Room type",
        "Property tier",
        "View type",
        "Amenity level",
        "Season",
      ],
    },
    {
      icon: "📋",
      label: "Booking Context",
      items: ["Lead time", "Length of stay"],
    },
  ],
};

// ── Scenarios ──────────────────────────────────────────────────────────────

export const scenarios: ScenarioContent = {
  items: [
    {
      id: "A",
      price: "$168.00",
      traits: [
        "Corporate Account",
        "Premium Suite",
        "Peak Season",
        "Boutique Property",
        "40% Win Rate",
      ],
      response: { volume: "Flat", winRate: "Up" },
      adjustment: "++",
      newId: "A2",
      newPrice: "$189.00",
      newTraits: [
        "Corporate Account",
        "Premium Suite",
        "Peak Season",
        "Boutique Property",
        "43% Win Rate",
      ],
    },
    {
      id: "B",
      price: "$155.00",
      traits: [
        "Corporate Account",
        "Premium Suite",
        "Off-Season",
        "Resort Property",
        "40% Win Rate",
      ],
      response: { volume: "Down", winRate: "Down" },
      adjustment: "–",
      newId: "B2",
      newPrice: "$142.00",
      newTraits: [
        "Corporate Account",
        "Premium Suite",
        "Off-Season",
        "Resort Property",
        "38% Win Rate",
      ],
    },
  ],
};

// ── Segmentation Tree ──────────────────────────────────────────────────────

export const segmentationTree: SegmentationTree = {
  labels: ["Guest", "Premium", "Boutique", "Resort", "Economy"],
};

// ── Segments Monitored ─────────────────────────────────────────────────────

export const demandCurveDots: DemandCurveDot[] = [
  { label: "A2: $189.00", t: 0.18, color: "#00446A" },
  { label: "A: $168.00", t: 0.28, color: "#00446A" },
  { label: "B: $155.00", t: 0.38, color: "#21A5D5" },
  { label: "B2: $142.00", t: 0.52, color: "#E56910" },
];

export const treeOutputPrice: string = "A: $168.00";

export const driverImportance: DriverImportanceConfig = {
  importance: {
    "Room Type": 14.8,
    "Guest Segment": 13.2,
    "Market Region": 11.6,
    "Booking Channel": 10.4,
    "Seasonal Demand": 9.2,
    "Competitor ADR": 8.0,
    "Booking Lead Time": 7.4,
    "Property Tier": 6.8,
    "Account Volume": 6.0,
    "Event Calendar Index": 5.6,
    "Guest Loyalty": 5.0,
    "Willingness to Pay": 4.4,
    "Corporate vs. Leisure": 3.8,
    "Room Amenities": 3.4,
    "Cost per Occupied Room": 3.0,
    "Rate Sensitivity": 2.6,
    "Booking Frequency": 2.2,
    "Tourism Trends": 2.0,
    "Market Penetration": 1.8,
    "Length of Stay": 1.6,
    "Competitor Occupancy": 1.4,
    "Cancellation Terms": 1.2,
    "Rate Plan Type": 1.0,
    "Room Demand Score": 0.4,
  },
  factorOrder: [
    "Room Type", "Guest Segment", "Market Region", "Booking Channel",
    "Seasonal Demand", "Booking Lead Time", "Property Tier", "Account Volume",
    "Event Calendar Index", "Guest Loyalty", "Willingness to Pay",
    "Corporate vs. Leisure", "Competitor ADR", "Room Amenities",
    "Cost per Occupied Room", "Rate Sensitivity", "Booking Frequency",
    "Tourism Trends", "Market Penetration", "Length of Stay",
    "Competitor Occupancy", "Cancellation Terms", "Rate Plan Type",
    "Room Demand Score",
  ],
  exampleSteps: [
    {
      supertitle: "Removing a factor",
      headline: "Booking Channel",
      detail: "A distribution mechanism, not a pricing driver — the model stays focused on rate-driving patterns.",
      dismissLine: "Variance explained by how the guest books, not what the room is worth.",
      action: "remove",
      highlight: ["Booking Channel"],
      remove: ["Booking Channel"],
      add: [],
      icon: "✕",
    },
    {
      supertitle: "Elevating a factor",
      headline: "Room Demand Score",
      detail: "Captures how urgently each room type needs to be filled — a hidden signal worth surfacing.",
      dismissLine: "Adds precision to the room dimension of the model.",
      action: "elevate",
      highlight: ["Room Demand Score"],
      remove: [],
      add: ["Room Demand Score"],
      icon: "↑",
    },
    {
      supertitle: "Adding a factor",
      headline: "Competitor ADR",
      detail: "A final positioning check — keeping the model's rate competitive against Marriott and others.",
      dismissLine: "A market guardrail that sharpens the final rate.",
      action: "add",
      highlight: ["Competitor ADR"],
      remove: [],
      add: ["Competitor ADR"],
      icon: "+",
    },
  ],
  adjustments: [
    { label: "Booking Channel", action: "remove", icon: "✕", reason: "Distribution mechanism, not a structural pricing driver", category: "Guest" },
    { label: "Room Type", action: "emphasized", icon: "★", reason: "Strongest room-level signal", category: "Room" },
    { label: "Guest Segment", action: "emphasized", icon: "★", reason: "Corporate vs. leisure pricing patterns", category: "Guest" },
    { label: "Market Region", action: "emphasized", icon: "★", reason: "Regional demand and competitive dynamics", category: "Guest" },
    { label: "Seasonal Demand", action: "emphasized", icon: "★", reason: "Peak/off-season rate optimization", category: "Booking" },
    { label: "Booking Lead Time", action: "emphasized", icon: "★", reason: "Advance booking patterns and urgency pricing", category: "Booking" },
    { label: "Room Demand Score", action: "elevate", icon: "↑", reason: "Hidden signal for room fill urgency", category: "Room" },
    { label: "Competitor ADR", action: "add", icon: "+", reason: "Final positioning check against Marriott and others", category: "Market" },
  ],
  beforeRisks: [
    { icon: "🏨", title: "Booking Channel drives pricing", detail: "How the guest books matters more than what the room is worth — <b>rates shift with channel, not demand.</b>" },
    { icon: "📉", title: "Hidden signals stay buried", detail: "Room Demand Score sits near the bottom — <b>a key urgency signal the model doesn't surface.</b>" },
    { icon: "🔇", title: "No competitive check", detail: "Without Competitor ADR, <b>the model sets rates blind to Marriott.</b>" },
    { icon: "⚖️", title: "Noise outweighs signal", detail: "24 untuned factors dilute the drivers that actually explain <b>rate variation.</b>" },
  ],
};

export const segmentsMonitored: number = 320;

// ── Step Narratives ────────────────────────────────────────────────────────

export const stepNarratives: StepNarratives = {
  profitGrowthIntro:
    "The model now manages 185,000 rates × 1,200 accounts — let's see the impact with vs. without it.",
  listPrice: "$168.00",
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
};

export default PROSPECT_CONFIG;
