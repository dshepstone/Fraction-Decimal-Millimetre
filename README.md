# Fraction · Decimal · Millimetre

An interactive workshop converter between **fractions, decimal inches, and millimetres**,
built around a live rule graduated to **1/64″**. Type any value, step the rule with the
`−` / `+` buttons, or drag the blade — off-grid measurements snap to the nearest sixty-fourth
and report how far off you are in inches, mm, and thou.

Built with React + Vite.

## Run locally

Requires [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install      # install dependencies
npm run dev      # start the dev server (usually http://localhost:5173)
```

## Build for production

```bash
npm run build    # outputs a static site to dist/
npm run preview  # serve the built site locally to check it
```

The `dist/` folder is a plain static bundle — drop it on any static host
(GitHub Pages, Netlify, Vercel, or your own server).

## Deploy to GitHub Pages

A GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and publishes the
site automatically on every push to `main`. To enable it:

1. Push this repository to GitHub.
2. Go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Push to `main` — the site publishes at
   `https://<your-username>.github.io/Fraction-Decimal-Millimetre/`.

`vite.config.js` uses a relative `base` (`'./'`), so the build works on a Pages
project site, other static hosts, and even opened directly from disk without changes.

## Notes

- `1 inch = 25.4 mm`, exact. Decimal inches are shown to 4 places, millimetres to 3,
  rounded half-up to match a standard workshop quick-reference sheet.
- The rule covers 0–1″; values above 1″ carry a whole-inch count while the blade
  shows the remaining fraction.
- Fonts (Oswald + IBM Plex Mono) load from Google Fonts on first paint and fall back
  to system mono/sans if offline.

## Project structure

```
index.html            # Vite entry
src/
  main.jsx            # mounts the app
  BenchRule.jsx       # the converter component (all logic + styles)
  index.css           # global reset / full-height background
vite.config.js
.github/workflows/deploy.yml
```
