const NOTES: Record<string, string[]> = {
  "intro": [
    "Welcome everyone to Inside Your Dynamic Model.",
    "Today we'll walk through how the pricing model works — from design through execution and refinement.",
  ],
  "one-model:0": [
    "Let's start with the four key inputs that power the ideal pricing model.",
    "Data inputs: your transaction history and external market signals.",
    "Expertise inputs: in-house business knowledge and industry benchmarks.",
  ],
  "one-model:1": [
    "All four inputs converge into one unified pricing model.",
    "Right now they're all flowing into a single engine. Click to see what's inside.",
  ],
  "one-model:2": [
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
    "The model scans all four data dimensions simultaneously — orders, market signals, customer profiles, and win/loss history.",
    "Every past pricing decision — win or loss — teaches the model about price sensitivity.",
  ],
  "power:2": [
    "Here are all 31 pricing factors we analyze, organized across four dimensions.",
    "Next we'll walk through each category and customize them for your business.",
  ],
  "power:3": [
    "Every business is different — we tune each factor based on your data.",
    "Starting with customer factors: channel, region, size, tenure, and sales relationship.",
  ],
  "power:4": [
    "Product factors: mix, family, specialization, cost, and price sensitivity.",
  ],
  "power:5": [
    "Market factors: price points, share, commodities, and competitive dynamics.",
  ],
  "power:6": [
    "Order factors: frequency, size, lead time, terms, and seasonality.",
  ],
  "power:7": [
    "All four factor groups are now tuned to this client's data.",
    "Add what matters, remove what doesn't, and adjust the balance.",
  ],
  "power:8": [
    "These five drivers are what the model actually uses — distilled from all 31 factors we analyzed.",
    "Watch the rail update to reflect the finalized model inputs.",
  ],
  "power:9": [
    "These four factors combine to produce a single SKU-level price.",
    "From here, that price gets customized to each customer — that's the next step.",
  ],
  "execute:0": [
    "The model produced $17.50 for SKU #A-7200 — now watch how it customizes that price for each customer.",
    "Click to see how different customer profiles shift the recommendation.",
  ],
  "execute:1": [
    "Same product, same list price — but each customer gets a different answer.",
    "Acme's high volume and deep relationship push the price above list.",
    "Click the customer chips to compare how different profiles shift the recommendation.",
  ],
  "refine:0": [
    "Strategic guidance is the other half of the equation.",
    "This is where your business expertise gets encoded into the model.",
  ],
  "refine:1": [
    "The calibrated pricing curve shows where the most profit opportunity lives.",
    "It's built from your historical win/loss data — price versus volume.",
  ],
  "refine:2": [
    "Every product–customer combination gets its own curve.",
    "The model learns different price sensitivities for each relationship.",
  ],
  "refine:3": [
    "QuickParts' curve appears — the model detects it's underpriced and adjusts automatically.",
    "Each customer gets a tailored recommendation based on their segment and behavior.",
  ],
  "refine:4": [
    "Acme shows a different pattern — the model catches a subtler margin opportunity.",
    "The model adjusts its recommendations based on each customer's unique profile.",
  ],
  "refine:5": [
    "MedSupply is at risk from a competitor — the model lowers price to defend the deal.",
    "Different segments, different calibrated prices — that's the power of dynamic pricing.",
  ],
  "refine:6": [
    "When all customers are optimized together, the portfolio effect is powerful.",
    "Some prices go up, some go down — but total margin improves significantly.",
  ],
  "end": [
    "Thank you for your time.",
    "Happy to dive deeper into any area that's relevant to your business.",
  ],
};

export function getPresenterNotes(kind: string, subStep: number): string[] {
  return NOTES[`${kind}:${subStep}`] ?? NOTES[kind] ?? [];
}
