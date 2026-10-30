// Turns the Expo web export into an installable, offline-capable PWA for GitHub Pages.
import { copyFileSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const dist = process.argv[2] ?? 'dist';
const base = (process.env.EXPO_BASE_URL ?? '').replace(/\/$/, '');

copyFileSync('assets/icon.png', join(dist, 'icon-512.png'));
writeFileSync(join(dist, 'manifest.webmanifest'), JSON.stringify({
  name: 'Lunéa – suivi du cycle',
  short_name: 'Lunéa',
  start_url: `${base}/`,
  scope: `${base}/`,
  display: 'standalone',
  background_color: '#FFF7F8',
  theme_color: '#E2556F',
  lang: 'fr',
  icons: [{ src: `${base}/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any maskable' }],
}, null, 2));

// Cache-first service worker listing every exported file, so the app opens offline.
const files = [];
const walk = (dir) => readdirSync(dir).forEach((f) => {
  const p = join(dir, f);
  statSync(p).isDirectory() ? walk(p) : files.push(`${base}/${relative(dist, p).split('\\').join('/')}`);
});
walk(dist);
const version = Date.now();
writeFileSync(join(dist, 'sw.js'), `const CACHE = 'lunea-${version}';
const FILES = ${JSON.stringify([`${base}/`, ...files])};
self.addEventListener('install', (e) => e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const isPage = e.request.mode === 'navigate';
  e.respondWith(caches.match(isPage ? '${base}/' : e.request).then((hit) => hit || fetch(e.request)));
});
`);

const head = `
<link rel="manifest" href="${base}/manifest.webmanifest">
<meta name="theme-color" content="#E2556F">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Lunéa">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="apple-touch-icon" href="${base}/icon-512.png">
<script>if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('${base}/sw.js'));</script>
`;
const indexPath = join(dist, 'index.html');
const html = readFileSync(indexPath, 'utf8').replace('</head>', `${head}</head>`).replace('<html lang="en">', '<html lang="fr">');
writeFileSync(indexPath, html);
// GitHub Pages: serve the SPA for deep links, and don't let Jekyll hide the _expo folder.
writeFileSync(join(dist, '404.html'), html);
writeFileSync(join(dist, '.nojekyll'), '');
console.log(`PWA ready in ${dist} (${files.length} files, base "${base || '/'}")`);
