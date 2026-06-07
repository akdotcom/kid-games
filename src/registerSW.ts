// Registers the service worker that powers offline support and installability.
//
// Skipped during local development (the dev server has no built service worker
// and stale caches make iterating painful). In production it registers the SW
// that Vite copies from public/ to the app base path.
export function registerSW() {
  if (!import.meta.env.PROD) return
  if (!('serviceWorker' in navigator)) return

  window.addEventListener('load', () => {
    const base = import.meta.env.BASE_URL // e.g. "/kid-games/"
    navigator.serviceWorker
      .register(`${base}sw.js`, { scope: base })
      .catch((err) => {
        // Non-fatal: the app still works online without the SW.
        console.error('Service worker registration failed:', err)
      })
  })
}
