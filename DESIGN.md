# Mobility design system

A small, opinionated design system for a physiotherapy companion app. It borrows the
clarity of Hevy (dense but calm data), the energy of Strava (one warm accent for
progress and streaks) and the friendliness of MyFitnessPal (soft cards, generous
tap targets), and adds a calm clinical teal so it feels like therapy, not a gym.

Everything lives in two files:

| File | Contents |
| --- | --- |
| `css/tokens.css` | Design tokens (colour, type, spacing, shape, elevation, motion) + dark theme |
| `css/app.css` | Components, layout, player screen, illustration animations |

A living style guide is at `design.html` (open it next to the app).

## Principles

1. **One thing at a time.** The player shows one exercise, one number, one cue. Everything else is a step away.
2. **Thumb first.** Primary actions sit at the bottom, tap targets are at least 44 px, no hover-only affordances.
3. **Calm by default, energetic on progress.** Teal is the brand; coral is reserved for streaks, progress and the get-ready countdown so it always means "go".
4. **Works on the floor.** Large type and high contrast so the screen is readable from a mat a metre away. Dark theme is a first-class citizen.
5. **Motion explains.** Illustrations animate at the same tempo as the rep counter; no decorative motion. `prefers-reduced-motion` slows everything down.

## Colour

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--c-primary` | teal 500 `#0F9C86` | teal 400 `#2BB89F` | primary buttons, active tab, progress fill |
| `--c-primary-soft` | teal 100 | teal 400 @ 16 % | chips, banners, cue numbers |
| `--c-accent` | coral 500 `#FF6B4A` | same | streaks, right-side chip, "get ready" phase |
| `--c-bg` | gray 50 `#F5F8F8` | gray 950 `#0B100F` | page background |
| `--c-surface` | white | `#151C1B` | cards, sheets, list items |
| `--c-surface-2/3` | gray 100 / 200 | `#1E2726` / `#283332` | secondary buttons, steppers, tracks |
| `--c-text` / `-2` / `-3` | gray 900 / 600 / 400 | `#F2F6F5` / `#A9B6B5` / `#6F7D7C` | body / secondary / tertiary text |
| `--c-danger` | `#E5484D` | same | destructive actions |

Routine kinds get a gradient each so they are recognisable at a glance:
`--grad-quick` (teal), `--grad-full` (indigo), `--grad-break` (coral), `--grad-custom` (graphite).

Body-area tags: shoulders = teal, back & spine = indigo, neck = amber, hips = coral.

Theme switching: `:root[data-theme="dark"]` forces dark, `[data-theme="light"]` forces light,
otherwise `prefers-color-scheme` decides. `color-scheme` is set so form controls follow.

## Typography

System font stack (`-apple-system`, SF Pro, Inter, Segoe UI, Roboto). No web fonts, so the
app is fully offline and renders instantly.

| Token | Size | Use |
| --- | --- | --- |
| `--fs-xs` | 12 | tags, eyebrow labels (uppercase, `--ls-caps`) |
| `--fs-sm` | 14 | secondary text, chips, list subtitles |
| `--fs-md` | 16 | body, buttons |
| `--fs-lg` | 18 | section headings, large buttons |
| `--fs-xl` | 22 | card titles, exercise name in player |
| `--fs-2xl` | 28 | page titles, stat values |
| `--fs-3xl` | 36 | completion screen |
| `.clock` | `clamp(3rem, 14vh, 6rem)` | timer in the player, tabular numerals |

Headings use `-0.01em` letter-spacing, the clock `-0.04em`. Numbers that change use
`font-variant-numeric: tabular-nums` so they do not jitter.

## Spacing, shape, elevation

* 4-pt scale: `--sp-1` (4) … `--sp-12` (48). Page gutter is 16 px, content max 720 px (1040 px for grids).
* Radii: `--r-sm` 10, `--r-md` 14, `--r-lg` 20 (cards), `--r-xl` 28 (hero cards, sheets), `--r-pill`.
* Shadows are soft and cool-tinted; `--shadow-brand` is a teal glow used only on the primary CTA.
* Safe areas: `--safe-top` / `--safe-bottom` map to `env(safe-area-inset-*)` and pad the shell and tab bar.

## Motion

`--dur-fast` 140 ms for presses, `--dur-base` 220 ms for state, `--dur-slow` 400 ms for
page and sheet entrances, with `--ease-out` (`cubic-bezier(0.22, 1, 0.36, 1)`).
Pressed buttons scale to 0.97 (0.94 for round controls).

Illustration animations are keyframes named `ill-*` and applied through `anim-*` classes.
Duration is always `var(--tempo)` (seconds per rep) set on the SVG root, so the figure and
the rep ring stay in sync.

## Components (class names)

| Component | Classes | Notes |
| --- | --- | --- |
| Button | `.btn`, `--primary` `--accent` `--secondary` `--ghost` `--outline` `--danger`, `--lg` `--sm` `--block` `--icon` | pill shaped, 44 px min height |
| Card | `.card`, `.card--pad`, `.card--tap` | surface + hairline border + small shadow |
| Routine card | `.routine-card--quick/full/break/custom` | gradient hero with decorative figure and play badge |
| Stat tile | `.stats > .card.stat` | value + label, `.stat__value--accent` for streaks |
| List item | `.item`, `.item__thumb`, `.item__body`, `.item__title`, `.item__sub`, `.item__chev` | 56 px thumbnail; `.item__thumb--icon` for icon thumbs |
| Chip / tag | `.chip` (`.is-active`, `--accent`), `.tag--area-*` | filters and labels |
| Illustration frame | `.ill-frame`, `--hero` | tinted background, 5:4 ratio |
| Form | `.input`, `.stepper`, `.switch`, `.segmented`, `.field` | steppers instead of number inputs |
| Setting row | `.setting` | label + control, dividers between rows |
| Banner | `.banner` | soft primary background, icon + text + actions |
| Sheet | `.sheet-backdrop` + `.sheet` (`--center` for dialogs) | bottom sheet on phones, centred card on tablets |
| Toast | `.toast` | single line, optional action |
| Tab bar | `.tabbar`, `.tab.is-active` | blurred, hidden while the player runs |
| Player | `.player`, `.progress-seg`, `.clock`, `.rep-ring`, `.player__pause`, `.player__skip`, `.player__next` | phase colour via `--phase-color` (teal active, coral ready, indigo rest) |

## Illustrations

Figures are drawn in `js/illustrations.js` from a handful of primitives (head, capsule
torso, round-capped limbs) in a 200 × 240 viewBox, using `currentColor` for the body,
`--ill-accent` for the moving part and `--ill-muted` for what stays still. Three views:

* **front** for symmetrical movements (arm circles, side bends, neck tilts)
* **side** for sagittal movements (shoulder rolls, forward folds, chin tucks)
* **top** for rotations (upper-body rotation, neck rotation, open book)

An accent arrow shows direction where it matters. To replace a figure with your own art,
set `image: 'assets/exercises/<file>.svg'` on the exercise.

## Icons

`js/icons.js` holds a 24 px stroke icon set (2 px stroke, round caps). Filled variants exist
only for transport controls (play, pause, next, previous).
