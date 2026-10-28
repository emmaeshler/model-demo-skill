# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
npm run dev          # Start dev server (Next.js 16)
npm run build        # Full build: HTML export + Next.js build
npm run build:html   # Standalone HTML export only (esbuild → public/)
npm run lint         # ESLint (flat config, v9)
```

There are no tests in this project.

A PreToolUse hook automatically runs `npm run build:html` before any `git push` to `main`. Do not run it manually before pushes.

## What This Is

An interactive slide presentation for INSIGHT2PROFIT's ML pricing model walkthrough. It has two viewing modes:

- **Self mode** — single-window, self-paced navigation
- **Presenter mode** — opens a synced audience window via BroadcastChannel (`ml-explainer-sync`), shows presenter notes in a side panel

There is also an auth-gated login flow (`/login`) that hits an external auth service via API routes.

## Architecture

### Slide System

[page.tsx](src/app/page.tsx) is the presentation engine. It manages `slide` (0–6) and `subStep` (0–N) state, keyboard navigation, and presenter/audience sync.

Each slide kind maps to a component in [src/components/slides/](src/components/slides/). Slides export a `*_TOTAL_STEPS` constant that `page.tsx` imports into `SUB_STEP_CONFIG` to know how many sub-steps each slide has. When adding steps to a slide, update the exported constant — `page.tsx` reads it automatically.

Navigation structure (sidebar labels, grouping) is defined in [slide-nav.tsx](src/components/slide-nav.tsx) via the `NAV_GROUPS` array.

### Animation Pattern

All animations use Framer Motion. Slides receive `step` (the sub-step index) and advance through visual states based on it. Complex slides use internal phase state machines triggered by `useEffect` on step changes. Use `usePhaseSequence()` from [anim.ts](src/lib/anim.ts) instead of raw setTimeout chains, and the `EASE` constant instead of `[0.22, 1, 0.36, 1]`.

SVG charts render inside `<svg>` elements. Interactive overlays inside SVG use `<foreignObject>`. Framer Motion `layoutId` does **not** work across the SVG/foreignObject boundary — use explicit transform animations instead.

### Standalone HTML Export

`npm run build:html` produces a single self-contained HTML file at `public/Inside Your Dynamic Model - INSIGHT2PROFIT.html` (~1.5 MB). The pipeline:

1. esbuild bundles [scripts/export-entry.tsx](scripts/export-entry.tsx) (React app without auth/mode providers)
2. `next build` with `STATIC_EXPORT=1` generates CSS + font files
3. Script inlines fonts as base64, merges CSS, and writes one HTML file
4. Cleans up `out/` and `.next/`

If the export breaks, the issue is almost always in the esbuild bundle step — check that new imports resolve through the `@/` alias plugin.

### Context Providers

- **ModeProvider** ([mode-context.tsx](src/lib/mode-context.tsx)) — `"self"` or `"presenter"`, drives BroadcastChannel sync
- **DepthProvider** ([depth-context.tsx](src/lib/depth-context.tsx)) — per-section zoom depth (0/1/2), used by some slides for layered content

### Rail System (RAIL_CONFIG in page.tsx)

The left-side rail (Model Drivers / Customer Order Price) is configured by a single `RAIL_CONFIG` table in `page.tsx`, keyed by `"slideIndex-subStep"`. Each entry declares: rail type (`"model"` or `"mini-exec"`), engine focus, active categories, whether to show drivers/engine/factors, and which customer highlights. To change the rail for any step, edit that one row — no other lookups to update.

### Key Data Structures in power-slide

The power-slide is split across `power-slide.tsx` (orchestrator, ~400 lines) + `power-slide-data.tsx`, `power-slide-dots.tsx`, `power-slide-factors.tsx`, `power-slide-convergence.tsx`, `power-slide-bottom.tsx`. Important constants in the data file:
- `SPOTLIGHTS` — the 4 bottom cards (ORDER, MARKET, CUSTOMER, PRODUCT) with data pills
- `SQUARE_FACTORS` — 24 pricing factors with `category` matching spotlight labels (lowercase)
- `CATEGORY_LAYOUT` — quadrant positions/colors for the factor grid
- `DRIVERS` — cluster definitions with colors (color mapping differs from CATEGORY_LAYOUT)

## Styling

Tailwind CSS v4 via `@tailwindcss/postcss`. Brand colors are CSS variables in [globals.css](src/app/globals.css): `--i2p-navy`, `--i2p-orange`, `--i2p-teal`, `--i2p-bg`. shadcn/ui components live in [src/components/ui/](src/components/ui/) (base-nova style).

## Skills

- **`/new-slide`** — Scaffolds a new slide: creates component files with correct boilerplate and wires up all 7 registration points in `page.tsx`. Use whenever adding a new slide to the presentation.

## Auth

SSO via password admin. `/login` server-redirects to `{AUTH_ADMIN_URL}/auth?app=ml-explainer&redirect={callback}`. After login, password admin redirects back to `/api/auth/callback?token=...`, which exchanges the one-time token for user data and sets the `ml_explainer_session` httpOnly cookie. Env vars `AUTH_ADMIN_URL` and `AUTH_API_KEY` required.
