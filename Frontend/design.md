# MacroTracker — Design System

## 1. Purpose and rules

This file is the single source of truth for the MacroTracker UI. **Read it before any UI change.**

- Every visual value lives in **one file**: [`src/styles/tokens.css`](src/styles/tokens.css). Component CSS uses `var(--token)` only. No raw colors, sizes, spacing, radii, shadows or durations in component styles.
- **When a token changes, update this file in the same change.** The values below are copied from `tokens.css` and must stay identical.
- Styling stays **plain CSS**: one global [`src/index.css`](src/index.css) (base + CSS primitives) plus a co-located `.css` per component, scoped by the component's PascalCase root class (`.MealCard …`). No Tailwind, UI kits or CSS-in-JS. The only dependencies allowed for styling are `@fontsource` fonts.
- Architecture: **rendering comps** (data fetching, logic, error handling) keep their logic. Visual work goes into **micro-comps** (presentational). A new visual piece becomes a new micro-comp in `src/components/<area>/<kebab-name>/<kebab-name>.tsx` + `.css`, exporting a PascalCase function whose root element has that PascalCase class.
- TypeScript: `type`, never `interface`. Don't change an existing component's props without asking first.
- Errors are shown with **iziToast** (via `utils/notify.ts`). It's themed in [`src/styles/izitoast-theme.css`](src/styles/izitoast-theme.css). Never replace it.

### Where styles live

| File | Contents |
|---|---|
| `src/styles/tokens.css` | All tokens + the reduced-motion token overrides |
| `src/styles/fonts.css` | `@fontsource` imports |
| `src/styles/izitoast-theme.css` | iziToast restyle |
| `src/index.css` | Imports the three files above, then base styles + CSS primitives (Panel, Button, Input, Label, tone utilities) |
| `src/components/**/x.css` | One per component, every selector prefixed with the component's root class |

**Cascade note:** `index.css` is imported in `main.tsx` *after* the component tree, so it loads **after** component CSS. That's why global element rules are wrapped in `:where()` (zero specificity) and button states use `:where(:hover…)`. Any component rule (`.Comp .x`, specificity ≥ 0,2,0) always wins. Keep it that way.

---

## 2. Design concept and principles

**"Spacecraft instrument panel / HUD for nutrition":** precise, dark and data-forward. Not a gaming RGB rig, and not generic glassmorphism.

1. **Data first.** Numbers are the hero. Every number is mono with tabular figures, so digits never jump. Labels are small, uppercase and letter-spaced, and sit out of the way.
2. **Glow is a signal, not decoration.** Only these glow: **progress** (gauge segments, macro-bar fill, slider track, toast timer), **active/selected states** (current nav tab, selected calendar day), **focus**, and **primary / danger actions**. Everything else is flat: panels, chips, ticks, borders, the brand mark.
3. **One accent.** Electric cyan (`--color-accent`) marks interactive and primary elements. Nothing decorative is cyan unless it means "you can act here" or "this is the main metric".
4. **Fixed macro signals.** Each macro owns one color everywhere it appears (§3). Color is never the only cue; a text label is always shown next to it.
5. **Instrument framing.** Near-black navy, a faint 24px grid, slightly lighter panels with 1px low-opacity cyan borders and corner brackets (top-left + bottom-right).
6. **Short, purposeful motion.** 150–300ms ease-out, only when a value or state changes.

---

## 3. Color tokens

### Base

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#050912` | Page background (also `<meta name="theme-color">` in `index.html`) |
| `--color-surface` | `#0a1222` | Panels (`.card`), header, modal |
| `--color-surface-raised` | `#101b30` | Hover rows, dropdowns, toasts, empty slider track |
| `--color-surface-sunken` | `#060b16` | Inputs, slider well, empty/failed panels |
| `--color-grid-line` | `rgba(110, 200, 255, 0.045)` | Background grid lines |
| `--color-border` | `rgba(80, 220, 255, 0.14)` | Panel borders |
| `--color-border-strong` | `rgba(80, 220, 255, 0.3)` | Input borders, chips, gauge minor ticks |
| `--color-divider` | `rgba(140, 180, 230, 0.1)` | Hairlines between rows / sections |
| `--color-bracket` | `rgba(80, 220, 255, 0.55)` | Panel corner brackets |
| `--color-backdrop` | `rgba(2, 5, 12, 0.72)` | Modal backdrop |
| `--color-skeleton` | `#111c31` | Skeleton base |
| `--color-skeleton-shine` | `#1a2945` | Skeleton shimmer highlight |
| `--color-shadow` | `rgba(0, 0, 0, 0.7)` | Overlay drop shadows |
| `--color-highlight` | `rgba(255, 255, 255, 0.03)` | Panel inner top highlight |

### Text

| Token | Value | Usage |
|---|---|---|
| `--color-text` | `#e4eefc` | Primary text, values |
| `--color-text-muted` | `#8da2c0` | Labels, secondary text, placeholders |
| `--color-text-faint` | `#64789a` | **Disabled / decorative only** (future calendar days, major ticks, empty-state square). Below 4.5:1, so never use it for readable text. |

### Accent (interactive + primary)

| Token | Value | Usage |
|---|---|---|
| `--color-accent` | `#21d4fd` | Primary buttons, links, focus ring, active tab, selected day, slider |
| `--color-accent-hover` | `#67e3ff` | Hover on accent elements |
| `--color-accent-press` | `#12b5dc` | Pressed primary button |
| `--color-on-accent` | `#02111a` | Text/icons on an accent fill |

### Macro → color map (fixed)

| Stat | Token | Value | Tone class |
|---|---|---|---|
| Calories | `--color-calories` | `var(--color-accent)` (= `#21d4fd`) | `.tone-calories` |
| Protein | `--color-protein` | `#a78bff` (electric violet) | `.tone-protein` |
| Carbs | `--color-carbs` | `#ffb627` (amber) | `.tone-carbs` |
| Fat | `--color-fat` | `#ff5ccd` (magenta) | `.tone-fat` |
| Fiber, sugars, any other stat | `--color-neutral-signal` | `var(--color-text-muted)` | `.tone-neutral` |

Calories deliberately share the system accent: energy is the primary metric. It still has its own token, so it can split off later without touching components.

### Status

| Token | Value | Usage |
|---|---|---|
| `--color-danger` | `#ff5f57` | Errors, destructive actions, invalid inputs, error toast |
| `--color-danger-hover` | `#ff7f78` | Hover on danger elements |
| `--color-on-danger` | `#1a0303` | Text on a danger fill |
| `--color-success` | `#3ee09a` | Success toast |

### Derived tints

Every signal color has three tints: **`-soft`** (chip / hover fills), **`-line`** (borders) and **`-glow`** (glow color in shadows / drop-shadows). Neutral never glows.

| Token | Value |
|---|---|
| `--color-accent-soft` | `color-mix(in srgb, var(--color-accent) 12%, transparent)` |
| `--color-accent-line` | `color-mix(in srgb, var(--color-accent) 45%, transparent)` |
| `--color-accent-glow` | `color-mix(in srgb, var(--color-accent) 50%, transparent)` |
| `--color-calories-soft` | `color-mix(in srgb, var(--color-calories) 12%, transparent)` |
| `--color-calories-line` | `color-mix(in srgb, var(--color-calories) 45%, transparent)` |
| `--color-calories-glow` | `color-mix(in srgb, var(--color-calories) 50%, transparent)` |
| `--color-protein-soft` | `color-mix(in srgb, var(--color-protein) 12%, transparent)` |
| `--color-protein-line` | `color-mix(in srgb, var(--color-protein) 45%, transparent)` |
| `--color-protein-glow` | `color-mix(in srgb, var(--color-protein) 50%, transparent)` |
| `--color-carbs-soft` | `color-mix(in srgb, var(--color-carbs) 12%, transparent)` |
| `--color-carbs-line` | `color-mix(in srgb, var(--color-carbs) 45%, transparent)` |
| `--color-carbs-glow` | `color-mix(in srgb, var(--color-carbs) 50%, transparent)` |
| `--color-fat-soft` | `color-mix(in srgb, var(--color-fat) 12%, transparent)` |
| `--color-fat-line` | `color-mix(in srgb, var(--color-fat) 45%, transparent)` |
| `--color-fat-glow` | `color-mix(in srgb, var(--color-fat) 50%, transparent)` |
| `--color-neutral-soft` | `color-mix(in srgb, var(--color-neutral-signal) 10%, transparent)` |
| `--color-neutral-line` | `color-mix(in srgb, var(--color-neutral-signal) 30%, transparent)` |
| `--color-neutral-glow` | `transparent` |
| `--color-danger-soft` | `color-mix(in srgb, var(--color-danger) 12%, transparent)` |
| `--color-danger-line` | `color-mix(in srgb, var(--color-danger) 45%, transparent)` |
| `--color-danger-glow` | `color-mix(in srgb, var(--color-danger) 50%, transparent)` |
| `--color-success-soft` | `color-mix(in srgb, var(--color-success) 12%, transparent)` |
| `--color-success-line` | `color-mix(in srgb, var(--color-success) 45%, transparent)` |
| `--color-success-glow` | `color-mix(in srgb, var(--color-success) 50%, transparent)` |

### Tone utilities

`.tone-calories | .tone-protein | .tone-carbs | .tone-fat | .tone-neutral` (in `index.css`) set four local variables on an element: `--tone`, `--tone-soft`, `--tone-line`, `--tone-glow`. Macro primitives read only those, so a component never names a macro color directly. In TSX the type is `MacroTone` (exported from `macro-chip.tsx`): `"calories" | "protein" | "carbs" | "fat" | "neutral"`.

### Measured contrast (WCAG)

| Pair | Ratio |
|---|---|
| text on surface | 15.98 |
| muted on surface / raised | 7.18 / 6.60 |
| accent on surface | 10.60 |
| protein / carbs / fat on surface | 6.93 / 10.67 / 6.83 |
| danger on raised (lowest real-text pair) | 5.75 |
| protein / fat / danger on their own `-soft` tint | 5.82 / 5.90 / 5.52 |
| on-accent on accent / on-danger on danger | 10.84 / 6.64 |
| faint on surface | 4.18 (fails AA, decorative only) |

---

## 4. Typography

### Fonts and roles (self-hosted via `@fontsource`, imported in `src/styles/fonts.css`)

| Token | Stack | Role | Weights loaded |
|---|---|---|---|
| `--font-display` | `"Chakra Petch", "IBM Plex Sans Hebrew", "IBM Plex Sans", system-ui, sans-serif` | Headings, labels, buttons, units, tabs | 500, 600, 700 |
| `--font-body` | `"IBM Plex Sans", "IBM Plex Sans Hebrew", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` | Body text, food names, inputs | 400, 500, 600 (+ Hebrew 400, 500, 600) |
| `--font-mono` | `"IBM Plex Mono", ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace` | **Every number**: kcal, grams, macros, times, dates, counts | 400, 500, 600 |

Each `@fontsource` file covers all subsets via `unicode-range`, so the browser only downloads the glyphs it renders.

### Type scale

| Token | Value | Use |
|---|---|---|
| `--text-2xs` | `0.6875rem` (11px) | Uppercase labels, units |
| `--text-xs` | `0.75rem` (12px) | Captions, chips, time tags |
| `--text-sm` | `0.875rem` (14px) | Secondary text, buttons, chip values |
| `--text-md` | `1rem` (16px) | Body, **all inputs** (smaller makes iOS zoom) |
| `--text-lg` | `1.125rem` (18px) | Brand, modal title |
| `--text-xl` | `1.375rem` (22px) | Slider readout, calendar nav glyphs |
| `--text-2xl` | `clamp(1.5rem, 1.2rem + 1.5vw, 2rem)` | Page titles (24 → 32px) |
| `--text-3xl` | `clamp(1.75rem, 1.4rem + 1.6vw, 2.25rem)` | Gauge readout (28 → 36px) |
| `--text-4xl` | `clamp(3rem, 2.2rem + 4vw, 4.5rem)` | 404 code (48 → 72px) |

| Token | Value | Use |
|---|---|---|
| `--weight-regular` | `400` | Body |
| `--weight-medium` | `500` | Values, food names |
| `--weight-semibold` | `600` | Headings, labels, buttons |
| `--weight-bold` | `700` | Brand |
| `--leading-none` | `1` | Readouts, chips, buttons |
| `--leading-tight` | `1.15` | Headings |
| `--leading-snug` | `1.3` | Labels, inputs, captions |
| `--leading-normal` | `1.5` | Body |
| `--tracking-normal` | `0` | Numbers inside tracked labels |
| `--tracking-display` | `0.04em` | Headings, brand |
| `--tracking-button` | `0.08em` | Buttons, chip labels, weekdays |
| `--tracking-label` | `0.12em` | Labels, units, section titles |
| `--underline-offset` | `0.2em` | Links |

### Number rules

- Every number renders in `--font-mono` with `font-variant-numeric: tabular-nums`.
- Ready-made hooks: `<time>` and `.num` (global), `input[type="number"]` (global), `Readout`, `MacroChip`, `RangeSlider`.
- Format values with `mealUtil.format()` (1 decimal, `—` for null). A null value shows `—` and **no unit**.

### Label style

Small uppercase, letter-spaced, display face: `--font-display`, `--text-2xs`, `--weight-semibold`, `--tracking-label`, uppercase, `--color-text-muted`. Applied to every `<label>` and to `.label`. Units join with a middle dot: **`PROTEIN · G`** (the unit sits in `<span class="unit">`; CSS adds the `· `).

Section titles (h3 in panels) are display-face uppercase `--text-md` with `--tracking-label`, preceded by a 12×2px accent tick (`--space-3` × `--border-width-strong`). Page titles (h2) are `--text-2xl` uppercase.

### Hebrew / RTL rules

- Food names can be Hebrew. Both the body and display stacks fall back to **IBM Plex Sans Hebrew**, so Hebrew never lands in a font without Hebrew letters.
- Every element showing or taking a food name gets **`dir="auto"`**. Current list: `MealCard .desc`, `ConfirmModal .modal-meal-name`, `MealItem` description input and suggestion `<li>`s, `LogMeal` prompt textarea.
- Next to a food name, use logical properties (`margin-inline-start`, not `margin-left`).
- Toast messages use `unicode-bidi: plaintext`, so mixed-direction text reads correctly.
- Never put Hebrew in `--font-mono`; it's for numbers.

---

## 5. Spacing, radii, borders, shadows, z-index

### Spacing (4px grid)

| Token | Value |
|---|---|
| `--space-0` | `0` |
| `--space-1` | `0.25rem` (4px) |
| `--space-2` | `0.5rem` (8px) |
| `--space-3` | `0.75rem` (12px) |
| `--space-4` | `1rem` (16px) |
| `--space-5` | `1.25rem` (20px) |
| `--space-6` | `1.5rem` (24px) |
| `--space-8` | `2rem` (32px) |
| `--space-10` | `2.5rem` (40px) |
| `--space-12` | `3rem` (48px) |
| `--space-16` | `4rem` (64px) |

### Radii (HUD = tight corners)

| Token | Value | Use |
|---|---|---|
| `--radius-xs` | `2px` | Chips, time tags, list options |
| `--radius-sm` | `4px` | Panels, inputs, buttons, modal |
| `--radius-md` | `6px` | Reserved |
| `--radius-lg` | `10px` | Reserved |
| `--radius-full` | `999px` | Slider track/thumb, spinner |

### Borders

| Token | Value | Use |
|---|---|---|
| `--border-width` | `1px` | All hairlines |
| `--border-width-strong` | `2px` | Indicator bars, ticks, slider thumb ring, toast timer |
| `--bracket-size` | `10px` | Corner bracket length |
| `--bracket-width` | `2px` | Corner brackets; left "rail" on chips, item rows and toasts |

### Shadows and glows

| Token | Value |
|---|---|
| `--glow-blur-sm` | `6px` |
| `--glow-blur-md` | `14px` |
| `--glow-blur-lg` | `28px` |
| `--shadow-panel` | `inset 0 1px 0 var(--color-highlight)` |
| `--shadow-overlay` | `0 24px 48px -12px var(--color-shadow)` (modal, dropdown, toast; elevation, not glow) |
| `--shadow-glow-accent` | `0 0 0 var(--border-width) var(--color-accent-line), 0 0 var(--glow-blur-md) var(--color-accent-glow)` |
| `--shadow-glow-danger` | `0 0 0 var(--border-width) var(--color-danger-line), 0 0 var(--glow-blur-md) var(--color-danger-glow)` |
| `--focus-ring-width` | `2px` |
| `--focus-ring-offset` | `2px` |
| `--blur-backdrop` | `4px` (modal backdrop only) |

Glow recipe for a toned element: `box-shadow: 0 0 var(--glow-blur-sm) var(--tone-glow)`. On SVG or striped fills use `filter: drop-shadow(…)` or a blurred copy (see Gauge).

### Opacity

| Token | Value | Use |
|---|---|---|
| `--opacity-disabled` | `0.45` | Disabled controls, a row being deleted |
| `--opacity-off` | `0.18` | Unlit gauge segments / empty macro-bar cells |
| `--opacity-busy` | `0.55` | Previous content held on screen while new content loads (Stats range switch) |

### Z-index

| Token | Value | Use |
|---|---|---|
| `--z-base` | `0` | Default |
| `--z-raised` | `1` | Reserved |
| `--z-dropdown` | `10` | Food search suggestions |
| `--z-header` | `20` | Site header |
| `--z-toast` | `99999` | iziToast wrapper |

Native `<dialog>` (ConfirmModal) renders in the browser's top layer and needs no z-index.

---

## 6. Motion

| Token | Value | Use |
|---|---|---|
| `--duration-fast` | `150ms` | Hover, color, border, per-segment gauge fade |
| `--duration-base` | `200ms` | Tab indicator, modal enter, row dimming |
| `--duration-slow` | `300ms` | Bar fill, number count-up |
| `--duration-shimmer` | `1400ms` | Skeleton shimmer, scan lines, pulse (loading only) |
| `--duration-spin` | `900ms` | Spinner turn (loading only) |
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | All transitions |
| `--scale-enter` | `0.98` | Modal start scale |
| `--stagger-step` | `3ms` | Gauge segments light up in sequence (48 × 3ms = 144ms) |

**What animates:** gauge segments (fade in sequence when values change), macro-bar fill width, numbers in `Readout` with `countUp` (ease-out over `--duration-slow`), hover/focus colors, the nav indicator, modal enter.

**What never animates:** nothing loops forever and nothing flashes. The only continuous animations are loading indicators (skeleton shimmer, calendar/search scan line, "Loading stats" pulse, Spinner), and they exist only while something is loading.

**Reduced motion:** under `prefers-reduced-motion: reduce`, `tokens.css` sets `--duration-fast/base/slow` and `--stagger-step` to `0ms`, so every token-driven transition becomes instant. `index.css` also forces `animation-duration: 0ms` and `animation-iteration-count: 1` on everything (this covers shimmer and iziToast's own animations). `Readout` reads `--duration-slow` at runtime and skips the count-up when it's 0. **Rule:** always use duration tokens, never literal durations, or reduced motion breaks.

> Build note: the CSS minifier rewrites `300ms` as `.3s`. Runtime code that reads a duration token must accept both `ms` and `s` (see `countUpMs()` in `readout.tsx`).

---

## 7. Layout

| Token | Value | Use |
|---|---|---|
| `--container-max` | `1100px` | Header + main content width |
| `--container-narrow` | `400px` | Login card |
| `--modal-width` | `420px` | ConfirmModal (`min()` with viewport − 2 gutters) |
| `--gutter` | `var(--space-4)` | Page side padding (16px) |
| `--grid-size` | `24px` | Background grid cell |
| `--touch-target` | `44px` | Minimum height/width of anything tappable |
| `--header-height` | `56px` | Header row; desktop tab height |
| `--dropdown-max-height` | `280px` | Search suggestions |
| `--field-min` | `7rem` | Narrowest number field in the meal form grid |
| `--col-calendar` | `380px` | Calendar column / max width |

### Component sizes

| Token | Value | Use |
|---|---|---|
| `--brand-mark-size` | `10px` | Header diamond mark |
| `--gauge-size` | `clamp(168px, 46vw, 208px)` | Gauge diameter |
| `--gauge-ring-width` | `9px` | Gauge segment stroke |
| `--gauge-tick-width` | `1px` | Gauge ticks + inner ring |
| `--macro-bar-height` | `8px` | MacroBar track |
| `--macro-bar-cell` | `6px` | One MacroBar cell (segment + gap) |
| `--macro-bar-gap` | `2px` | Gap between MacroBar cells |
| `--slider-track-height` | `6px` | RangeSlider track |
| `--slider-thumb-size` | `22px` | RangeSlider thumb |
| `--chip-dot-size` | `6px` | Status / tone squares, calendar dot |
| `--status-icon-size` | `22px` | Toast icon, count badge, item header |
| `--spinner-size` | `32px` | Spinner ring |
| `--skeleton-line-height` | `12px` | Skeleton text line |
| `--skeleton-block-height` | `56px` | Skeleton chip block |
| `--stat-tile-min` | `9rem` | Narrowest KPI tile before the row drops a column |

### Charts

| Token | Value | Use |
|---|---|---|
| `--chart-height` | `240px` | Whole plot incl. the x-axis label band |
| `--chart-line-width` | `2px` | Lines, legend + tooltip line-keys |
| `--chart-area-opacity` | `0.1` | Wash under a single-series line |
| `--chart-key-width` | `14px` | Line-key length |
| `--chart-tooltip-min` | `168px` | Tooltip min width |

### Breakpoints (mobile-first)

Design at **375–430px** first. Nothing may overflow at **360px**. CSS can't read variables in `@media` / `@container`, so these tokens are reference values and queries repeat the literal:

| Token | Value | Query | Effect |
|---|---|---|---|
| `--bp-sm` | `600px` | `@media (min-width: 600px)` | One-row header, panel padding 16 → 24px, roomier calendar |
| `--bp-md` | `860px` | `@media (min-width: 860px)` | Two-column Today / History pages, sticky calendar |
| `--cq-item-narrow` | `340px` | `@container meal-item (max-width: 340px)` | Slider macro chips 4 → 2 per row |
| `--cq-list-split` | `460px` | `@container meal-list (min-width: 460px)` | Gauge and macro bars side by side |
| `--cq-list-wide` | `640px` | `@container meal-list (min-width: 640px)` | Log row chips in one line of 6, indented under the name |

Named containers: `.MealList` → `meal-list`, `.MealItem` → `meal-item`. Prefer container queries for components that appear in columns of different widths.

### Touch targets

Buttons, inputs, nav tabs, calendar days, suggestion rows, the slider and the toast close button are all ≥ `--touch-target`. Small inline buttons (Remove) keep a 44px box and use negative block margins (`calc(-1 * var(--space-3))`) so they don't make the row taller. Calendar day cells have **no gap**: the whole cell is the target and the visible chip is an inset `::before`. On phones the calendar panel uses `--space-2` padding, so cells stay ≥ 44px at 360px.

### Phones

Verified with touch emulation at 320, 360, 375, 390 and 430px portrait and 667 / 844px landscape, on every screen and state (login + error toast, Today's logs, search dropdown, picked food, delete modal, History, Stats in every range + the table, 404): no horizontal scroll, every target ≥ 44px, no input below 16px.

- **Hover is mouse-only.** Every `:hover` rule sits inside `@media (hover: hover)`. On a phone a tapped element would otherwise keep its hover look until the next tap. Press states (`:active`) stay outside the query.
- **Tap feedback** is the soft accent wash: `-webkit-tap-highlight-color: var(--color-accent-soft)` on `html` (not the browser's gray box).
- **Inputs are 16px** (`--text-md`), so iOS Safari doesn't zoom in on focus.
- **Charts:** a tap shows that point's tooltip and keeps it until you tap elsewhere; a horizontal drag scrubs (`touch-action: pan-y`), a vertical drag still scrolls the page.
- **Viewport height** uses `100dvh` (with a `100vh` fallback), so the mobile address bar doesn't push the footer off-screen.

---

## 8. Component catalog

### CSS primitives (`src/index.css`)

| Primitive | Use | Variants / states | Don't |
|---|---|---|---|
| **Panel** — `.card` | Any top-level content block | Corner brackets via `::before`/`::after`; padding 16 → 24px at `--bp-sm` | Don't use the card's own `::before/::after` (the brackets live there). Don't nest cards: inner groups use a 1px border + left rail (see `MealItem`). |
| **Button** — `.btn-primary` | The single main action of a view (Log meal, Log in) | Rest glow → hover `--shadow-glow-accent`, active `--color-accent-press`, disabled: no glow, `--opacity-disabled`, `not-allowed` | Max one per view |
| `.btn-secondary` | Supporting actions (Get AI estimate, Add item, Log out, Today, Try again, Cancel) | Cyan outline, hover `-soft` fill, flat | — |
| `.btn-ghost` | Low-emphasis inline actions (Remove on a log row) | No border, hover raised fill; tint per use (e.g. danger text) | Not for primary flows |
| `.btn-danger` | Confirming a destructive action (modal confirm) | Red fill + glow like primary | Not for the first click of a destructive flow (that's ghost-danger + a confirm modal) |
| **Input** — native `input` / `textarea` / `select` | All fields | 44px min, sunken fill, `--color-border-strong`; hover `-line`; focus: accent outline + glow; `aria-invalid="true"`: danger border, red glow on focus; disabled; `input[type=number]` is mono | Don't style `type="range"` here; use `RangeSlider` |
| **Field error** — `.field-error` | Message under an invalid field | Danger text + status square | — |
| **Label** — `label`, `.label` | Every field label / caption | See §4 | — |
| **Tone** — `.tone-*` | Gives a primitive its macro color | §3 | Don't hardcode macro colors in components |
| `.num` | Marks inline numbers as mono/tabular | — | — |
| `.visually-hidden` | Text for screen readers only | — | — |

The classes style `<a>` / `<Link>` as buttons too (e.g. Page404's "Back to the app").

### React primitives (`src/components/shared-area/`)

| Component | Path | Purpose | Props / variants | States | Use / don't |
|---|---|---|---|---|---|
| **MacroChip** | `macro-chip/macro-chip.tsx` | One stat as a toned chip: label + mono value + unit | `label`, `value: number \| null \| undefined`, `unit`, `tone: MacroTone` | null → `—`, no unit; long values wrap the unit | Renders `<dt>/<dd>`, **must sit inside a `<dl>`**. Use for every per-meal stat. |
| **Readout** | `readout/readout.tsx` | A number in mono + optional uppercase unit | `value`, `unit?`, `size: sm \| md \| lg \| xl`, `countUp?` | null → `—`; count-up off under reduced motion | Use for every standalone metric. Count up only for summary numbers, not for inputs. |
| **Gauge** | `gauge/gauge.tsx` | Circular segmented ring (48 segments, 60 ticks) with a center readout | `value`, `unit`, `label`, `goal?`, `split?: {tone, value}[]` | **Goal mode** (`goal` set): fills value/goal in calories cyan, center shows `/ goal`. **Split mode**: ring shared between slices (largest-remainder rounding). All zero → all segments unlit. | Lit segments glow through a blurred copy layer. SVG geometry constants live in the TSX (viewBox units); colors/strokes come from tokens. One per view. |
| **MacroBar** | `macro-bar/macro-bar.tsx` | A macro's segmented bar + readout | `label`, `tone`, `value`, `unit`, `goal?`, `share?` (0–1), `shareLabel?` | Goal → `value / goal`; else `%` of share. Fill snaps to whole cells (`round()`); any value > 0 lights at least one cell. | Label always visible. Track is `aria-hidden`; the text carries the meaning. |
| **RangeSlider** | `range-slider/range-slider.tsx` | Range input: filled glowing track, glowing ring thumb, live mono `<output>` | `id`, `label`, `value`, `min`, `max`, `step`, `unit`, `disabled?`, `onChange(value)`, `children?` (extra readouts) | Hover: thumb fills. Focus-visible: ring on the thumb. Disabled: no glow. | Input box is the 44px target. Presentational: wire it to data in a wrapper (see GramsSlider). |
| **Skeleton** | `skeleton/skeleton.tsx` | Loading placeholder shaped like log rows | `rows?` (3), `label?` (announced) | Shimmer; static under reduced motion | Use when the content's shape is known (lists). |
| **Spinner** | `spinner/spinner.tsx` | Small indeterminate loader (dashed ring + lit arc) | — | `role="status"` + hidden "Loading..." | Only when no content shape is known. **Currently unused** (lists use Skeleton). |
| **ConfirmModal** | `confirm-modal/confirm-modal.tsx` | Native `<dialog>` confirm | existing props (`danger` → `.btn-danger` + red title tick) | Busy disables buttons; enter animation `--duration-base` | — |
| **Calendar** | `calendar/calendar.tsx` | Month grid date picker | existing props | Hover, focus (inset ring), today (accent outline), selected (accent fill + glow), future (faint, disabled), marked (square dot), busy (scan line) | — |
| **StatusPanel** | `status-panel/status-panel.tsx` | The "no data" / "couldn't load" box | `kind: "empty" \| "failed"`, `text`, `children?` (an action, e.g. Try again) | Empty: dashed sunken + grey square. Failed: danger tint + red square. | Every empty / load-error state uses it (MealList, Stats). The text always says what happened. |
| **SegmentedControl** | `segmented-control/segmented-control.tsx` | A row of mutually exclusive choices (range picker) | `label` (group name), `options: {value, label, fullLabel}[]`, `value`, `onChange` (generic over the value type) | Hover raised; selected = accent fill + glow (active state); focus ring on the segment | Native radios underneath (arrow keys + screen readers work). `label` is the short visible text ("1M"), `fullLabel` is read aloud ("1 month"). Full width on phones. |
| **LineChart** | `line-chart/line-chart.tsx` | Responsive SVG line chart over time | `title` (for screen readers), `unit` (one per chart), `labels[]`, `details[]` (tooltip heading per point), `notes?[]`, `series: {key, label, tone, shape, values: (number \| null)[]}[]`, `area?` | Crosshair snaps to the nearest point on hover/touch; arrow keys / Home / End read points (announced through a live region); active marker grows + glows; a new data set fades in (`--duration-slow`) | See *Chart rules* below. Geometry constants (padding, marker radius) live in the TSX; colors, strokes and fonts come from tokens. |

### Chart rules (LineChart)

- **One y-axis, one unit.** Never plot two units on one chart: kcal and grams are two charts.
- **Missing ≠ zero.** `null` values break the line (a gap); only real zeros sit on the baseline.
- The y-axis ends at the tightest round top (steps of 1/2/2.5/5 × 10ⁿ, 3–5 gridlines). Gridlines are solid hairlines (`--color-divider`), the baseline is `--color-border-strong`.
- X labels thin out when they'd crowd (judged by the longest label), always keeping the latest point.
- Marks: `--chart-line-width` lines with round joins; markers carry a 2px `--color-surface` ring; an optional `--chart-area-opacity` wash for a **single** series only.
- **Two or more series → a legend**, and each series gets its own marker `shape` (circle / square / diamond). The shape is the second cue for color-blind readers. The macro hues are brighter than a generic dark-mode chart band (by design, for the HUD); protein ↔ fat measure ΔE 7.8 under protanopia, so the shapes are **required**, not decoration.
- Text never wears the series color: legend, tooltip and axis text use text tokens; a line-key or marker beside the text carries the identity.
- Tooltip: values lead (strong), series names follow (muted), line-keys rather than boxes, footnote for context ("3 of 7 days logged").
- Every chart has a **table view** with the same numbers (`StatsTable`). Tooltips never gate a value.
- Filters sit in one row above everything they scope. On refetch, keep the previous render at `--opacity-busy` (no skeleton flash); the skeleton is for the very first load only.

### Stats micro-comps (`src/components/stats-area/`)

| Component | Path | Purpose |
|---|---|---|
| **StatsSummary** | `stats-summary/stats-summary.tsx` | KPI row: the range's average per day for calories, protein, carbs, fat, sugars (Readout `lg`, count-up) + "Days logged x / y". Labels in text color, a tone square beside each. |
| **StatsTable** | `stats-table/stats-table.tsx` | The charts' table view, inside a `<details>` ("Table view"): one row per point: period, the five averages, days logged. Scrolls sideways inside its own box on phones. |

### Meal micro-comps (`src/components/meals-area/`)

| Component | Path | Purpose |
|---|---|---|
| **DailySummary** | `daily-summary/daily-summary.tsx` | Totals of a `meals` list: Gauge (kcal, split by each macro's energy: protein×4, carbs×4, fat×9) + 3 MacroBars (% of energy). Rendered by `MealList` above the log when there are meals (Today and History). |
| **GramsSlider** | `grams-slider/grams-slider.tsx` | `RangeSlider` bound to `meals.<index>.grams` of the meal form (5–1000g, step 5; the range stretches if a bigger weight is typed). After a move it calls `onWeightChange` (MealItem's `rescale`). A `<dl>` of MacroChips shows the recalculated kcal / protein / carbs / fat live. Writes the same field as the Weight input, so the two always match. |

### Patterns

- **Mission-log row** (`MealCard`): CSS grid `time | name · grams | remove` over a row of MacroChips (3 columns; 6 at `--cq-list-wide`). The time is a mono tag. Rows split by `--color-divider`, hover raised. The row dims while its delete request runs (`:has(.btn-delete:disabled)`).
- **Header**: mobile = brand + Log out on row 1, menu as a full-width tab bar on row 2 (tabs sized from their text, `--tracking-button`, so 3 fit at 360px). ≥600px = one row. The active tab gets a glowing bottom indicator on the header edge. No greeting: it got cut off on phones and wasn't needed.
- **Stats page** (`pages-area/stats`): title + period → range SegmentedControl (1W / 2W / 1M / 6M / 1Y, kept in `?range=`) → StatsSummary → Calories chart (area) + Macros chart (3 series), side by side from `--bp-md` → StatsTable. Points: 1W and 2W = per day, 1M = per 7-day week counted back from today, 6M and 1Y = per calendar month.
- **Search combobox** (`MealItem`): raised dropdown with an overlay shadow. Rows are 44px. The keyboard-active option gets an accent rail + soft fill. "Searching…" shows a scan line.
- **Number field labels**: a colored square per macro (`data-field` → `--field-tone`), neutral for the rest.

### iziToast theme (`src/styles/izitoast-theme.css`)

Raised panel, toned left rail and border (danger red for `error`, success green for `success`), a bracketed mono status icon (`!` / `✓`) instead of iziToast's PNGs, a `×` glyph close button (44px), and a glowing time-left bar in the toast's tone. Selectors are prefixed `.iziToast-wrapper` so they win whatever the load order. `!important` is used only where iziToast writes inline styles from JS.

### Favicon (`public/`)

The daily macro ring, like the `Gauge`: three arcs in the fixed macro colors (protein 30%, carbs 45%, fat 25%, clockwise from the top, with small gaps), around a fork in `--color-accent`, on a `--color-bg` rounded square. It's flat, with no glow, like all branding. It says *food + macros* at a glance. At 16px it reads as a colored ring with a cyan stem, and from 32px (normal hi-DPI tabs) the fork is clear. This is the one place macro colors appear outside a macro value, and it's allowed because the ring *is* the macro split.

| File | Use |
|---|---|
| `favicon.svg` | Browser tab (32-unit viewBox, `rx="7"` corners) |
| `apple-touch-icon.png` | 180 × 180 iPhone home-screen icon: the same SVG full-bleed (`rx="0"`), since iOS rounds the corners itself |

The hex values are copied from the tokens (SVG/PNG files can't read CSS variables), just like `theme-color` in `index.html`. If `--color-bg`, `--color-accent` or a macro color changes, update `favicon.svg`, re-export the PNG, and update `theme-color`. Don't write `--` inside an SVG comment: it's invalid XML and the icon won't load.

---

## 9. States

Every component must handle all of these:

| State | Look |
|---|---|
| **Loading** | Content with a known shape → `Skeleton` (shimmer). Reloading content that's already on screen → keep it at `--opacity-busy` with `aria-busy` (Stats). Calendar month → scan line on top of the days (`aria-busy`). Search → "Searching…" + scan line. A picked food's stats → pulsing accent square + "Loading stats...". Buttons → busy text ("Logging...") + disabled. |
| **Empty** | `StatusPanel kind="empty"`: dashed sunken panel with a grey status square + muted text. |
| **Error** | `StatusPanel kind="failed"`: danger tint, red square, a "Try again" secondary button; the error also goes to an iziToast toast. Field errors → danger border + `.field-error` line. |
| **Disabled** | `--opacity-disabled`, `cursor: not-allowed`, glow removed. Future calendar days use `--color-text-faint` instead of opacity. |
| **Hover** | Flat: raised fill or a brighter border/text. Never adds glow (except primary/danger buttons, whose glow grows). Always inside `@media (hover: hover)` (see *Phones*). |
| **Focus-visible** | `--focus-ring-width` accent outline at `--focus-ring-offset` + `--glow-blur-md` accent glow, global for links, buttons and inputs. Inputs show it on any focus; range sliders show it on the thumb; tightly packed cells (calendar days, tabs) use an inset outline. |

---

## 10. Accessibility rules

- Text contrast meets **WCAG AA** (≥ 4.5:1; see §3). `--color-text-faint` is only for disabled or decorative content.
- **Never color alone.** Macros always carry a text label (chip label, bar label, field label). Empty vs failed states differ in wording, not just color.
- Every interactive element is ≥ 44 × 44px.
- Focus is always visible (§9). Don't remove outlines without an equally visible replacement.
- Decorative graphics are `aria-hidden` (gauge SVG, bar tracks, 404 code, skeleton bars). Their meaning is always also in text.
- Loading regions use `role="status"` or `aria-busy`. The slider has `aria-valuetext` (`"150 g"`) and a live `<output>`.
- Food names get `dir="auto"` (§4).
- All motion respects `prefers-reduced-motion` (§6).
- Inputs use `--text-md` (16px) so iOS doesn't zoom on focus.

---

## 11. Do's and don'ts

**Do**
- Use tokens for every value; add a token (and a row in this file) when you need a new one.
- Use `MacroChip` / `MacroBar` / `.tone-*` for anything macro-related, so colors stay consistent.
- Put numbers in mono (`Readout`, `.num`, `<time>`).
- Keep one primary button per view.
- Prefix every selector with the component's root class; wrap new global element rules in `:where()`.
- Use container queries for components that live in columns of different widths.
- Check 360px, 375px and desktop, keyboard focus, and reduced motion.

**Don't**
- Don't hardcode a color, px/rem size, radius, shadow or duration in component CSS. The only exceptions are `@media` / `@container` breakpoints (CSS limitation; they mirror the `--bp-*` / `--cq-*` tokens) and the standard 1px clip inside `.visually-hidden`.
- Don't write a `:hover` rule outside `@media (hover: hover)`; it sticks after a tap on phones.
- Don't add glow to static or decorative elements (panels, chips, borders, logos, ticks).
- Don't give a macro a different color anywhere, or reuse a macro color for something that isn't that macro.
- Don't animate longer than 300ms, loop anything except a loading indicator, or flash.
- Don't add UI libraries, CSS-in-JS, Tailwind or chart libraries. Ask first for any new dependency (fonts via `@fontsource` are allowed).
- Don't use `interface`. Don't change existing component props without asking.
- Don't touch services, models, redux or `utils/notify.ts` for visual work.

---

## 12. Checklist: adding a screen or component

1. [ ] Read this file. Reuse an existing primitive or pattern if one fits.
2. [ ] New visual piece → new micro-comp folder `src/components/<area>/<kebab-name>/` with `<kebab-name>.tsx` + `.css`, PascalCase function and root class. Props declared with `type`.
3. [ ] Logic stays in the rendering comp; the micro-comp only gets props.
4. [ ] Styles use tokens only. New value needed → add it to `tokens.css` **and** to this file.
5. [ ] Numbers mono/tabular; labels in the label style; food names `dir="auto"`.
6. [ ] Macros use `MacroTone` / `.tone-*` with a visible text label.
7. [ ] Glow only on progress / active / focus / primary action.
8. [ ] States done: loading, empty, error, disabled, hover, focus-visible.
9. [ ] Touch targets ≥ 44px; no overflow at 360px; checked at 375–430px and desktop.
10. [ ] Contrast ≥ 4.5:1 for text; decorative graphics `aria-hidden`.
11. [ ] Motion uses duration tokens; works with reduced motion on.
12. [ ] `npm run build` passes (runs `tsc -b` + Vite).
13. [ ] Catalog entry added to §8.
