# 🎮 Kid Games

A small static website of browser games for kids, built with **TypeScript + React + Vite** and deployed to **GitHub Pages**.

**Live site:** https://akdotcom.github.io/kid-games/

## Progressive Web App

The site is an installable PWA: from the browser's "Add to Home Screen" /
"Install" prompt it runs full-screen (no browser chrome) and works offline after
the first visit, thanks to a service worker (`public/sw.js`) and web app manifest
(`public/manifest.webmanifest`).

Games use an on-screen number pad rather than the device's software keyboard, so
the keyboard never slides up and covers the screen on phones, and the layout
stays fully under our control.

The app icons (`public/icon-*.png`, `public/apple-touch-icon.png`) are generated
from a tiny dependency-free script:

```bash
node scripts/generate-icons.mjs
```

## Games

| Game | Description |
| --- | --- |
| ➕ Beat the Clock: Addition | Solve 10 single-digit addition problems, with 10 seconds for each one. |

## Local development

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173/kid-games/)
npm run build    # type-check and build to dist/
npm run preview  # preview the production build locally
```

## Deployment

Every push to `main` triggers the
[`Deploy to GitHub Pages`](.github/workflows/deploy.yml) workflow, which builds
the site and publishes `dist/` to GitHub Pages.

> **One-time setup:** In the repository settings, go to
> **Settings → Pages → Build and deployment** and set **Source** to
> **GitHub Actions**.

## Adding a new game

1. Create a component under `src/games/<your-game>/`.
2. Register it in [`src/games/registry.tsx`](src/games/registry.tsx):

   ```ts
   {
     id: 'your-game',
     title: 'Your Game',
     description: 'What it does.',
     emoji: '🎲',
     component: YourGame,
   }
   ```

That's it — the game automatically appears on the home page and gets its own
route at `/games/your-game`.

## Project structure

```
src/
  main.tsx              app entry (HashRouter for GitHub Pages)
  registerSW.ts         registers the service worker in production
  App.tsx               routes, generated from the game registry
  components/
    NumberPad.tsx       reusable on-screen numeric keypad
  pages/Home.tsx        home page listing all games
  games/
    registry.tsx        the list of games
    addition/           the addition game
public/
  manifest.webmanifest  PWA manifest
  sw.js                 service worker (offline + installability)
  icon-*.png            PWA / home-screen icons
scripts/
  generate-icons.mjs    regenerates the PNG icons
```
