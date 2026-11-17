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
  "driver-importance:6": [
    "These seven drivers now feed the pricing model — each selected because it explains meaningful price variance in your data.",
    "Click to see how they collapse into one optimal price per SKU.",
  ],
  "driver-importance:7": [
    "All four driver categories converge — the model combines them into a single optimized price for each SKU.",
  ],
  "execute:0": [
    "Here's where the model output meets the real world — it starts with one optimized price per SKU, then adjusts for each customer.",
    "Watch how a customer's profile feeds into the model and produces a tailored price.",
  ],
  "execute:1": [
    "Same product, same list price — but each customer gets a different answer.",
    "Meridian's strong corporate relationship, high booking frequency, and long tenure push the rate above Historical Average.",
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
    "The model doesn't just react to external indices — it reads win rate, price adoption, and margin together.",
    "Each evolution is driven by all four signals, not just the cost change.",
  ],
  "refine:7": [
    "Every customer–end market combination gets its own model.",
    "Here are four examples — each calibrated independently based on its own price sensitivities.",
  ],
  "refine:8": [
    "Now zoom out — we do this across 247 segments, continuously.",
    "Every segment is monitored and recalibrated as the market shifts.",
  ],
  "end": [
    "Thank you for your time.",
    "Happy to dive deeper into any area that's relevant to your business.",
  ],
};

export function getPresenterNotes(kind: string, subStep: number): string[] {
  return NOTES[`${kind}:${subStep}`] ?? NOTES[kind] ?? [];
}

const TRANSITION_HINTS: Record<string, string> = {
  "intro": "Opens with the four key inputs — data, market signals, expertise, and benchmarks.",
  "one-model:0": "Opens with the four key inputs — data, market signals, expertise, and benchmarks.",
  "one-model:1": "The four inputs converge into one unified pricing model.",
  "one-model:2": "The model splits into ML and Strategic Guidance engines — each input re-routes to the right side.",
  "power:0": "Transitions to the Power section. A scatter plot of 36M price points appears.",
  "power:1": "The scatter plot highlights four data dimensions. The dimension cards appear below the chart.",
  "driver-importance:0": "Dimensions become pricing factors on the left rail — keeps context visible while exploring each category.",
  "driver-importance:1": "Spotlights Customer factors — the rail highlights the customer category.",
  "driver-importance:2": "Spotlights Product factors.",
  "driver-importance:3": "Spotlights Order factors.",
  "driver-importance:4": "Spotlights Market factors.",
  "driver-importance:5": "All factors appear together — the model's full input set.",
  "driver-importance:6": "Factors distill into 7 model drivers that explain the most price variance.",
  "driver-importance:7": "Drivers collapse into one optimized price per SKU — transitions to Execute.",
  "execute:0": "The Execute section: one optimized price per SKU, then adjusted for each customer's profile.",
  "execute:1": "Customer comparison view — click chips to see how different profiles shift the recommendation.",
  "refine:0": "Transitions to Refine. Strategic guidance meets the demand curve.",
  "refine:1": "The calibrated demand curve appears — price vs. volume built from win/loss history.",
  "refine:2": "QuickParts appears on the curve — the model detects it's underpriced.",
  "refine:3": "Acme's curve — a subtler margin opportunity with a rising win rate.",
  "refine:4": "MedSupply is at risk from a competitor — the model lowers price to defend.",
  "refine:5": "All three customers snap to the curve — optimized prices appear.",
  "refine:6": "The curve adapts over time — external indices, win rate, adoption, and margin all feed each evolution.",
  "refine:7": "Zooms out to show segment-level models — each customer–market combination gets its own.",
  "refine:8": "Full portfolio view — 247 segments monitored and recalibrated continuously.",
  "end": "Closing slide — thank you and next steps.",
};

export function getTransitionHint(kind: string, subStep: number): string {
  return TRANSITION_HINTS[`${kind}:${subStep}`] ?? TRANSITION_HINTS[kind] ?? "";
}
