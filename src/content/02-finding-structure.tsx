"use client";

import { DealCardsHero } from "@/components/visuals/deal-cards-hero";
import { RegionScatterVisual } from "@/components/visuals/region-scatter";
import { AttributeGridVisual } from "@/components/visuals/attribute-grid";

/* ── Low depth: Visual hero ── */
export function DDILow() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-muted/30 p-4">
        <DealCardsHero />
      </div>
    </div>
  );
}

/* ── Medium depth: Story v2 DDI beats 1-5 ── */
export function DDIMedium() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold tracking-tight">Your deal history hides structure you can&apos;t see by eye.</h3>

      <div className="rounded-lg border bg-muted/30 p-4">
        <RegionScatterVisual />
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        Take about 500 deals of the same product at similar volumes — and prices are all
        over the map. But color every dot by where it shipped and four distinct distributions
        separate out. California averages $172. PNW lands at $148. Southwest at $124.
        Great Plains at $96. Region alone explains 64% of the variance.
      </p>

      <div className="rounded-lg border bg-muted/30 p-4">
        <AttributeGridVisual />
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        Region was one of sixteen attributes tested. The model checks every attribute on a
        deal for whether it actually moves price. Four drivers explain most of the variance:
        Region (64%), Channel (18%), Order Size (7%), and Customer Tier (3%). Twelve attributes
        are noise. These four become transactional pricing drivers — and each one becomes a control
        knob. Four drivers create 16 interaction surfaces. Turn a knob, the price moves.
      </p>
    </div>
  );
}

/* ── High depth: Demo v9 grid → knobs → auto-tune ── */
export function DDIHigh() {
  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold tracking-tight">From attributes to knobs to auto-tuned prices</h3>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
        <p>
          <strong className="font-semibold text-foreground">The grid.</strong>{" "}
          Machine learning tests every attribute on a deal for pricing significance. Region was one
          of sixteen. Most attributes show no pricing signal at all — statistical relevance separates
          the trends that move price from the ones that don&apos;t. In a typical engagement, 3–6
          drivers explain most of the variance. The rest are noise.
        </p>
        <p>
          <strong className="font-semibold text-foreground">Drivers become knobs.</strong>{" "}
          Each significant driver becomes a control knob. Turn it — the price moves. But drivers
          interact: Region × Order Size, Channel × Tier. More knobs emerge from the combinations.
          The combinatorics explode — a human can&apos;t tune hundreds of interacting variables
          across thousands of SKU-customer pairs. That&apos;s where the model takes over.
        </p>
        <p>
          <strong className="font-semibold text-foreground">Auto-tune.</strong>{" "}
          ML tunes every knob, for every deal, simultaneously. Knobs settle. Prices land back on
          the calibrated curve. The combination of driver values — California + Large Order + Tier 1 +
          Direct Channel — identifies a micro-segment with its own price distribution. The model
          learns the optimal price for each micro-segment, not one price for the whole product.
          Each deal gets its own price, fitted to the curve, not approximated by a step.
        </p>
      </div>
    </div>
  );
}
