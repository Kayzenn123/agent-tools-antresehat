// Pre-warm Astro Fonts cache: unduh woff2 Google Fonts SECARA SEKUENSIAL
// (proxy egress flaky untuk fetch konkuren saat build) lalu simpan ke
// node_modules/.astro/fonts/<xxhash_h64(url)>.woff2 — persis skema cache Astro.
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cacheDir = join(root, 'node_modules', '.astro', 'fonts');
mkdirSync(cacheDir, { recursive: true });

const UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

const cssRequests = [
  'https://fonts.googleapis.com/css2?family=Atkinson Hyperlegible Mono:ital,wght@0,400;0,700',
  'https://fonts.googleapis.com/css2?family=Sofia Sans Extra Condensed:ital,wght@0,400;0,700',
  'https://fonts.googleapis.com/css2?family=Bungee Hairline:ital,wght@0,400',
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchRetry(url, tries = 6) {
  let last;
  for (let i = 1; i <= tries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (!res.ok) throw new Error('status ' + res.status);
      return Buffer.from(await res.arrayBuffer());
    } catch (e) {
      last = e;
      console.log(`  retry ${i}/${tries} ${url.slice(0, 70)}… (${e.message || e.cause?.code || e})`);
      await sleep(2000 * i);
    }
  }
  throw last;
}

const { default: xxhash } = await import('xxhash-wasm');
const { h64ToString } = await xxhash();

const urls = new Set();
for (const cssUrl of cssRequests) {
  console.log('CSS:', cssUrl);
  const css = (await fetchRetry(cssUrl)).toString('utf8');
  for (const m of css.matchAll(/url\((https:[^)]+?\.woff2)\)/g)) urls.add(m[1]);
  await sleep(500);
}
console.log('woff2 unik:', urls.size);

let ok = 0;
for (const url of urls) {
  const id = h64ToString(url) + '.woff2';
  const dest = join(cacheDir, id);
  if (existsSync(dest)) {
    console.log('cached:', id);
    ok++;
    continue;
  }
  console.log('dl:', id, url.slice(0, 60));
  const buf = await fetchRetry(url);
  writeFileSync(dest, buf);
  ok++;
  await sleep(500);
}
console.log('SELESAI', ok, '/', urls.size);
