---
name: new-slide
description: "Scaffold a new slide for the ml-explainer presentation — creates the component files and wires up all 7 registration points in page.tsx"
---

# New Slide Scaffold

Creates the boilerplate for a new slide and registers it in all required places. Use when the user asks to add a new slide to the presentation.

## Gather from the user

Before scaffolding, confirm these details (ask if not provided):

1. **Slide kind** — kebab-case identifier (e.g. `"deep-dive"`)
2. **Component name** — PascalCase (e.g. `DeepDiveSlide`)
3. **Total sub-steps** — how many sub-steps (minimum 1)
4. **Position** — which existing slide it goes after (e.g. "after refine")
5. **Nav group** — new section or add to existing? If new: label, subtitle. Provide sub-step labels.

## Files to create

All in `src/components/slides/`:

### 1. Data file (if needed): `<kind>-slide-data.ts`

```ts
import { EASE } from "@/lib/anim";
export { EASE };

// Static constants for <kind> slide
```

Only create this if the user describes enough static data to warrant it (~200+ lines). Otherwise skip.

### 2. Orchestrator: `<kind>-slide.tsx`

```tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useShareMode } from "@/lib/share-context";
import { usePhaseSequence, EASE } from "@/lib/anim";

export const <NAME>_TOTAL_STEPS = <N>;

export function <Name>Slide({
  step = 0,
  skipAnimation,
  isActive = true,
  onAutoAdvance,
}: {
  step: number;
  skipAnimation?: boolean;
  isActive?: boolean;
  onAutoAdvance?: () => void;
}) {
  const { shareMode } = useShareMode();

  return (
    <div className="mx-auto flex h-[calc(var(--slide-h,100vh)-7.5rem)] max-w-7xl flex-col items-center justify-start px-6 pt-4">
      <h2 className="text-2xl font-semibold text-[var(--i2p-navy)]">
        {/* Slide title */}
      </h2>
      {/* Slide content */}
    </div>
  );
}
```

## Registration in page.tsx

Make these edits in `src/app/page.tsx` — follow the exact patterns documented in the [[reference-slide-architecture]] memory:

### 1. Add import (near line 11-16)
```tsx
import { <Name>Slide, <NAME>_TOTAL_STEPS } from "@/components/slides/<kind>-slide";
```

### 2. Add memo wrapper (near line 19-24)
```tsx
const Memo<Name> = memo(<Name>Slide);
```

### 3. Add to SlideKind type union (near line 26-34)
Add `"<kind>"` to the union.

### 4. Add to SLIDES array (near line 40-54)
Insert `{ kind: "<kind>" }` at the correct position.

### 5. Add/update index constants (near line 56-60)
```tsx
const <NAME>_INDEX = <position>;
```
**Critical:** If inserting before existing slides, increment all subsequent index constants.

### 6. Add to SUB_STEP_CONFIG (near line 62-68)
```tsx
[<NAME>_INDEX]: <NAME>_TOTAL_STEPS,
```

### 7. Add to DEFAULT_NAV_GROUPS (near line 567-630)
Add entries with sub-step labels.

### 8. Add render case (near line 1344-1377)
```tsx
{sc.kind === "<kind>" && (
  <Memo<Name>
    step={isActive ? subStep : 0}
    skipAnimation={effectiveSkip}
    isActive={isActive}
  />
)}
```

## After scaffolding

1. Run `npm run build` to verify no type errors
2. Run `npm run dev` and navigate to the new slide to confirm it renders
3. Tell the user the slide is wired up and ready to build out

## Notes

- Use `usePhaseSequence` from `src/lib/anim.ts` instead of setTimeout chains for timed animation phases
- Use `EASE` constant instead of `[0.22, 1, 0.36, 1]` magic arrays
- If the slide grows past ~800 lines, split into sub-components following the `<kind>-slide-<part>.tsx` pattern (see power-slide and refine-slide-v2 for examples)
- Brand colors: `var(--i2p-navy)`, `var(--i2p-orange)`, `var(--i2p-teal)`, `var(--i2p-bg)`
- Small/secondary text must use `font-medium` (500) or heavier — default weight is too thin
