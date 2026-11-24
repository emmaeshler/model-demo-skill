import { segmentsMonitored } from "@/lib/prospect-config";

const NOTES: Record<string, string[]> = {
  "intro": [
    "Welcome everyone to Inside Your Dynamic Model.",
    "Today we'll walk through how the dynamic pricing model works for Pinnacle Hospitality — from design through execution and refinement.",
  ],
  "one-model:0": [
    "Let's start with the four key inputs that power the ideal pricing model.",
    "Data inputs: your booking history and external market signals like comp set rates and travel demand.",
    "Expertise inputs: your revenue strategy and hospitality intelligence — STR benchmarks, comp set data.",
  ],
  "one-model:1": [
    "All four inputs converge into one unified pricing model.",
    "Right now they're all flowing into a single engine. Click to see what's inside.",
  ],
  "one-model:2": [
    "The model splits into two complementary engines.",
    "Machine learning handles pattern recognition — data inputs (green) feed it booking history and market signals.",
    "Strategic guidance encodes your revenue expertise — knowledge inputs (blue) feed it rate rules and brand constraints.",
    "Notice how each input re-routes to the right engine. Together they produce rates that are both data-driven AND strategically sound.",
  ],
  "power:0": [
    "Now let's talk about what powers the ML engine.",
    "Machine learning is only as good as its training data — and with 680,000 bookings across 850 accounts, there's a lot to learn from.",
  ],
  "power:1": [
    "The model scans all four data dimensions simultaneously — bookings, market signals, guest profiles, and rate performance history.",
    "Every past rate decision — won booking or lost opportunity — teaches the model about price sensitivity for each room type and guest segment.",
  ],
  "driver-importance:6": [
    "These seven drivers now feed the pricing model — each selected because it explains meaningful rate variance in your booking data.",
    "Click to see how they collapse into one optimal rate per room night.",
  ],
  "driver-importance:7": [
    "All four driver categories converge — the model combines them into a single optimized rate for each room configuration.",
  ],
  "execute:0": [
    "Here's where the model output meets the real world — it starts with one optimized rate per room configuration, then adjusts for each account.",
    "Watch how an account's profile feeds into the model and produces a tailored rate.",
  ],
  "execute:1": [
    "Same room, same base rate — but each account gets a different answer.",
    "Meridian Health's strong corporate relationship, high booking frequency, and long tenure push the rate above Historical Average.",
    "Click the account chips to compare how different guest profiles shift the recommendation.",
  ],
  "refine:0": [
    "Strategic guidance is the other half of the equation.",
    "This is where your revenue expertise gets encoded into the model.",
  ],
  "refine:1": [
    "The calibrated pricing curve shows where the most RevPAR opportunity lives.",
    "It's built from your historical booking data — rate versus occupancy.",
  ],
  "refine:2": [
    "Every room–account combination gets its own curve.",
    "The model learns different rate sensitivities for each relationship.",
  ],
  "refine:3": [
    "Evergreen Events' curve appears — the model detects their group blocks are underpriced and adjusts automatically.",
    "Seasonal event demand with limited venue alternatives means there's margin being left on the table.",
  ],
  "refine:4": [
    "Meridian Health shows a different pattern — booking conversion is climbing, so there's room to push the corporate rate higher.",
    "The model adjusts its recommendations based on each account's unique booking behavior.",
  ],
  "refine:5": [
    "Atlas Corporate Travel is at risk — a comp set property is undercutting on corporate travel rates.",
    "The model lowers the rate to defend the booking. Different accounts, different calibrated rates — that's the power of dynamic pricing.",
  ],
  "refine:6": [
    "The model doesn't just react to comp set changes — it reads occupancy, booking conversion, and RevPAR together.",
    "Each evolution is driven by all four signals, not just the competitive rate change.",
  ],
  "refine:7": [
    "Every account–property combination gets its own model.",
    "Here are four examples — each calibrated independently based on its own rate sensitivities.",
  ],
  "refine:8": [
    `Now zoom out — we do this across ${segmentsMonitored} segments, continuously.`,
    "Every segment is monitored and recalibrated as demand shifts — spring break surges, convention seasons, new competitors.",
  ],
  "end": [
    "Thank you for your time.",
    "Happy to dive deeper into any area — whether it's rate optimization for a specific property type, group pricing, or the competitive intelligence side.",
  ],
};

export function getPresenterNotes(kind: string, subStep: number): string[] {
  return NOTES[`${kind}:${subStep}`] ?? NOTES[kind] ?? [];
}

const TRANSITION_HINTS: Record<string, string> = {
  "intro": "Opens with the four key inputs — booking data, market signals, revenue strategy, and hospitality intelligence.",
  "one-model:0": "Opens with the four key inputs — booking data, market signals, revenue strategy, and hospitality intelligence.",
  "one-model:1": "The four inputs converge into one unified pricing model.",
  "one-model:2": "The model splits into ML and Strategic Guidance engines — each input re-routes to the right side.",
  "power:0": "Transitions to the Power section. A scatter plot of 680K booking rate points appears.",
  "power:1": "The scatter plot highlights four data dimensions. The dimension cards appear below the chart.",
  "driver-importance:0": "Dimensions become pricing factors on the left rail — keeps context visible while exploring each category.",
  "driver-importance:1": "Spotlights Guest factors — the rail highlights the guest category.",
  "driver-importance:2": "Spotlights Room factors.",
  "driver-importance:3": "Spotlights Booking factors.",
  "driver-importance:4": "Spotlights Market factors.",
  "driver-importance:5": "All factors appear together — the model's full input set.",
  "driver-importance:6": "Factors distill into 7 model drivers that explain the most rate variance.",
  "driver-importance:7": "Drivers collapse into one optimized rate per room night — transitions to Execute.",
  "execute:0": "The Execute section: one optimized rate per room configuration, then adjusted for each account's profile.",
  "execute:1": "Account comparison view — click chips to see how different guest profiles shift the recommendation.",
  "refine:0": "Transitions to Refine. Strategic guidance meets the demand curve.",
  "refine:1": "The calibrated demand curve appears — rate vs. occupancy built from booking history.",
  "refine:2": "Evergreen Events appears on the curve — the model detects their group blocks are underpriced.",
  "refine:3": "Meridian Health's curve — booking conversion is climbing, margin opportunity available.",
  "refine:4": "Atlas Corporate Travel is at risk from a comp set property — the model lowers the rate to defend.",
  "refine:5": "All three accounts snap to the curve — optimized rates appear.",
  "refine:6": "The curve adapts over time — comp set changes, occupancy, conversion, and RevPAR all feed each evolution.",
  "refine:7": "Zooms out to show segment-level models — each account–property combination gets its own.",
  "refine:8": `Full portfolio view — ${segmentsMonitored} segments monitored and recalibrated continuously.`,
  "end": "Closing slide — thank you and next steps.",
};

export function getTransitionHint(kind: string, subStep: number): string {
  return TRANSITION_HINTS[`${kind}:${subStep}`] ?? TRANSITION_HINTS[kind] ?? "";
}
