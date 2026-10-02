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

## Illustrations (v2)

Flat vector characters in the style of the Freepik physiotherapy set that inspired the app:
teal top and shorts, bare legs with two-tone skin shading, navy shoes with blue laces, grey
swept hair, fingered hands, and a coral floor patch with a shadow ellipse under every figure.
The palette is lifted from that set (`--ill-skin` #EBB68D, `--ill-shirt` #00ABB3,
`--ill-shorts` #00969E, `--ill-shoe` #00475D, `--ill-lace` #0083AB, `--ill-mat` #FF675E,
`--ill-band` #FF821D). Props are a Thera-Band, a yoga block, a door anchor with a knob and a
long mat for floor poses. All colours are tokens, so the dark theme simply swaps them.

Built in `js/illustrations.js` from primitives in a 240 × 240 viewBox: `limb()` (skin line plus a
shadow line along one edge), `headFront` / `headSide` / `headTop`, `torsoFront` / `torsoSide` with
fold lines, `legsFront` / `legsSide` (shorts, legs, `shoeFront` / `shoeSide`), and `arm()` as a
two-joint chain (shoulder → elbow → hand) with open, fist and grip hands. Three views:

* **front** for symmetrical and lateral movements (arm circles, raises, pull-aparts, side bends)
* **side** for sagittal movements (shoulder rolls, forward folds, chin tucks, rollbacks)
* **top** for rotations (upper-body rotation, neck rotation, open book), with a small caption

Rotations with the elbow at the side (external / internal rotation) are shown from the front
by foreshortening the forearm: it scales from short-and-inward (pointing at the viewer) to
full-length outward, which is what the movement looks like in a mirror.

Animation is SMIL. Timelines are sampled in JS (`tl`, `outBack`, `swing`, `spin`) so a band
attached to a moving hand follows it exactly; `tempoOut` on an exercise gives the
"2 s out, 3 s back" asymmetry. The player calls `svg.setCurrentTime(0)` when a rep timer starts
and `pauseAnimations()` on pause, so figure and counter never drift.

Teal arrows (`--ill-arrow`) mark direction where it matters. To replace a figure with your own
art, set `image: 'assets/exercises/<file>.svg'` on the exercise.

## Icons

`js/icons.js` holds a 24 px stroke icon set (2 px stroke, round caps). Filled variants exist
only for transport controls (play, pause, next, previous).
