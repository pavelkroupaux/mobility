# Mobility

A small, installable web app for daily physiotherapy mobility and flexibility routines.
Open it, pick a routine, and it walks you through one exercise after another with a timer,
a rep pacer, animated figures and a progress bar. Works offline and installs to the home
screen on iPhone, iPad and Android.

**Live app:** `https://<your-github-user>.github.io/mobility/` (after enabling Pages, see below)

## What it does

- **Home** – three built-in routines (Quick reset, Full physio session, Desk break) plus your own custom routines, with streak and weekly stats.
- **Player** – Freeletics-style flow: get-ready countdown, one exercise at a time, rep pacing with a tempo ring or a hold timer, rest between exercises, cues that rotate while you move, left/right sides handled automatically, pause/skip/back, sound and vibration cues, keeps the screen awake, completion screen.
- **Library** – every exercise with an animated illustration, dose and step-by-step cues. "Do just this one" starts it on its own.
- **Builder** – compose a custom routine: pick exercises, reorder, change reps/seconds and rest.
- **Progress** – streak, sessions, minutes, last 7 days.
- **Settings** – countdown and rest lengths, sound, vibration, screen wake lock, light/dark theme, install help, reset.

Everything is stored locally on the device (localStorage). No accounts, no tracking, no backend.

## Tech

No build step. Plain HTML, CSS and ES modules, a service worker for offline use and a
web app manifest for installation. Deploys as static files to GitHub Pages.

```
index.html              app shell
manifest.webmanifest    PWA manifest (icons, shortcuts)
sw.js                   service worker (precache + stale-while-revalidate)
css/tokens.css          design tokens (light + dark)
css/app.css             components, layout, player, illustration animations
js/app.js               router + tab bar + SW registration
js/data/exercises.js    ← the exercise library (edit this)
js/data/routines.js     ← built-in routines (edit this)
js/illustrations.js     animated SVG figures
js/views/*.js           screens (home, routine, player, library, exercise, builder, history, settings)
js/store.js             localStorage (settings, custom routines, history)
js/audio.js             WebAudio beeps + haptics
design.html / DESIGN.md living style guide + design system notes
icons/                  app icons (SVG sources + rendered PNGs)
.github/workflows/      GitHub Pages deployment
```

## Deploying on GitHub Pages

1. Push to `main`.
2. In the repository go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. The `Deploy to GitHub Pages` workflow runs on every push to `main` and publishes the site.
   It also stamps the commit id into `sw.js`, so every deploy is a new service-worker version
   and installed apps pick up the update (an "Update available" toast appears in the app).

The app uses only relative URLs and hash routing, so it works at `/mobility/` or any sub-path.

## Installing on a phone or tablet

- **iPhone / iPad (Safari):** open the site, tap **Share → Add to Home Screen**. It opens full screen without browser chrome and works offline.
- **Android (Chrome):** tap **Install** in the in-app banner, or the browser menu → **Install app**.
- **Desktop Chrome / Edge:** the install icon in the address bar.

## Adding or changing exercises

Edit `js/data/exercises.js`. Each exercise looks like:

```js
{
  id: 'arm-circles-open',            // unique, used by routines
  name: 'Arm circles – open palm',
  area: 'shoulders',                 // shoulders | back | neck | hips  (add more in AREAS)
  mode: 'reps', reps: 12, tempo: 2.5,// or: mode: 'time', duration: 30
  sides: false,                      // true → done left then right
  illustration: 'arm-circle',        // key from js/illustrations.js
  options: { hand: 'open', direction: 1 },
  summary: 'Straight arms, palms open, full circles from the shoulder.',
  cues: ['Arms straight out to the sides', 'Circles from the shoulder joint', '...'],
}
```

Available illustration keys: `shoulder-roll`, `arm-circle`, `scapula-squeeze`, `arm-raise`,
`forward-fold`, `fold-hold`, `trunk-rotation`, `neck-rotation`, `cat-cow`, `side-bend`,
`childs-pose`, `open-book`, `neck-tilt`, `chin-tuck`, `hip-circle`, `lunge-hold`, `hold`.

To use your own drawing or animation instead, drop a file into `assets/exercises/` and set
`image: 'assets/exercises/my-exercise.svg'` (SVG, PNG, GIF or animated SVG all work).

Routines are in `js/data/routines.js`; each item references an exercise `id` and can override
`reps` or `duration`.

If you add files, list them in `ASSETS` in `sw.js` so they are cached for offline use.

## Running locally

Any static server works, for example:

```
npx serve .
# or
python3 -m http.server 8000
```

Then open `http://localhost:8000/`. Service workers need `localhost` or HTTPS.

## Design system

See [DESIGN.md](DESIGN.md) and open `design.html` for the live component sheet.
