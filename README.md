# 🎮 Kid Games

A small static website of browser games for kids, built with **TypeScript + React + Vite** and deployed to **GitHub Pages**.

**Live site:** https://akdotcom.github.io/kid-games/

## Games

| Game | Description |
| --- | --- |
| ➕ Beat the Clock: Addition | Solve 10 single-digit addition problems, with 10 seconds for each one. |
| 🧠 Memory Math Match | Flip cards two at a time to match addition problems with their answers. |
| ❌ Math Tic-Tac-Toe | Two players take turns; solve a square's addition problem to claim it and get three in a row. |

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
  App.tsx               routes, generated from the game registry
  pages/Home.tsx        home page listing all games
  games/
    registry.tsx        the list of games
    addition/           the addition game
```
