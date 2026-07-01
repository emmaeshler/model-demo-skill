const NOTES: Record<string, string[]> = {
  "intro": [
    "Welcome everyone to Inside Your Dynamic Model.",
    "Today we'll walk through how the pricing model works — from design through execution and refinement.",
  ],
  "overview:0": [
    "Let's start with the big picture.",
    "Our approach has four phases: Design the model, Power it with data, Execute pricing decisions, and Refine through continuous feedback.",
  ],
  "overview:1": [
    "At the center is the pricing model itself — a unified engine that combines machine learning with strategic business guidance.",
  ],
  "one-model:0": [
    "Four key inputs feed into the pricing model — all on the left.",
    "Data inputs: your transaction history and external market signals.",
    "Expertise inputs: in-house business knowledge and industry benchmarks.",
    "Right now they're all flowing into one unified model. Click to see what's inside.",
  ],
  "one-model:1": [
    "The model splits into two complementary engines.",
    "Machine learning handles pattern recognition — data inputs (green) feed it historical and market signals.",
    "Strategic guidance encodes your business expertise — knowledge inputs (blue) feed it rules and constraints.",
    "Notice how each input re-routes to the right engine. Together they produce pricing that's both data-driven AND strategically sound.",
  ],
  "power:0": [
    "Now let's talk about what powers the ML engine.",
    "Machine learning is only as good as its training data.",
  ],
  "power:1": [
    "Historical price points form the backbone of the model's learning.",
    "Every past pricing decision — win or loss — teaches the model about price sensitivity.",
  ],
  "power:2": [
    "Transaction-level data adds depth.",
    "Volume patterns, seasonal trends, and customer-specific behaviors all feed the model.",
  ],
  "power:3": [
    "We also ingest market and environmental signals.",
    "Competitor pricing, commodity indices, and macroeconomic indicators help the model adapt.",
  ],
  "power:4": [
    "Customer segmentation helps the model personalize.",
    "Different customers have different price sensitivities and value perceptions.",
  ],
  "power:5": [
    "The model tracks outcomes rigorously.",
    "Win rates, margin performance, and revenue impact create a continuous feedback loop.",
  ],
  "power:6": [
    "Key pricing drivers are identified and weighted.",
    "The model learns which factors matter most for each segment and situation.",
  ],
  "execute:0": [
    "Here's where the model meets the real world.",
    "For each customer and product combination, the model generates optimized price recommendations.",
    "These aren't just numbers — they come with confidence levels and supporting rationale.",
  ],
  "refine:0": [
    "Strategic guidance is the other half of the equation.",
    "This is where your business expertise gets encoded into the model.",
  ],
  "refine:1": [
    "Without segmentation, pricing is scattered and inconsistent.",
    "The model needs structure to make sense of diverse customer behaviors.",
  ],
  "refine:2": [
    "The optimal pricing curve shows where the most profit opportunity lives.",
    "Most companies leave significant margin on the table with flat pricing.",
  ],
  "refine:3": [
    "Watch how the model detects QuickParts is underpriced and adjusts automatically.",
    "Each customer gets a tailored recommendation based on their segment and behavior.",
  ],
  "refine:4": [
    "Acme shows a different pattern — the model catches a subtler margin opportunity.",
    "The model adjusts its recommendations based on each customer's unique profile.",
  ],
  "refine:5": [
    "MedSupply is at risk from a competitor — the model lowers price to defend the deal.",
    "Different segments, different optimal prices — that's the power of dynamic pricing.",
  ],
  "refine:6": [
    "When all customers are optimized together, the portfolio effect is powerful.",
    "Some prices go up, some go down — but total margin improves significantly.",
  ],
  "profit-growth:0": [
    "Let's talk about the bottom line.",
    "The whole point of this model is to drive measurable profit growth.",
  ],
  "profit-growth:1": [
    "Here's the status quo — where most companies sit without dynamic pricing.",
  ],
  "profit-growth:2": [
    "With the dynamic model engaged, pricing moves toward optimization.",
    "The model continuously adjusts based on market conditions and customer behavior.",
  ],
  "profit-growth:3": [
    "The model scans the full portfolio, identifying the highest-impact opportunities first.",
  ],
  "profit-growth:4": [
    "The optimized result — measurable, sustainable profit improvement.",
    "This isn't a one-time gain. The model keeps learning and refining.",
  ],
  "closing-summary": [
    "Let's recap what we've covered.",
    "Design, Power, Execute, Refine — four phases working together as one dynamic pricing engine.",
    "The result: pricing that's smarter, faster, and more profitable.",
  ],
  "end": [
    "Thank you for your time.",
    "Happy to dive deeper into any area that's relevant to your business.",
  ],
};

export function getPresenterNotes(kind: string, subStep: number): string[] {
  return NOTES[`${kind}:${subStep}`] ?? NOTES[kind] ?? [];
}
