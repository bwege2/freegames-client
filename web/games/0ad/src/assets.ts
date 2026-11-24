// Vite imports. Every file of assets/ gets a content-hashed URL and is served by the site's own
// server; nothing is fetched from another origin.
const modules = import.meta.glob('../assets/**/*', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const PREFIX = '../assets/';

// Vite's URL glob leaves .json files out (they are modules), so the four data JSON files are
// imported as explicit URLs. Everything else (WebP, PMD, PSA, XML) is in `modules` below.
import actorsUrl from '../assets/actors.json?url';
import iconsUrl from '../assets/icons/icons.json?url';
import terrainsUrl from '../assets/terrain/terrains.json?url';
import skyUrl from '../assets/sky/sky.json?url';
const JSON_URLS: Record<string, string> = {
  'actors.json': actorsUrl,
  'icons/icons.json': iconsUrl,
  'terrain/terrains.json': terrainsUrl,
  'sky/sky.json': skyUrl,
};

export function assetUrl(path: string): string {
  const url = JSON_URLS[path] ?? modules[PREFIX + path];
  if (!url) throw new Error(`0 A.D. asset missing: ${path}`);
  return url;
}

export function assetPaths(): string[] {
  return Object.keys(modules).map((k) => k.slice(PREFIX.length)).sort();
}

/** The shipped templates as name → XML text (name without .xml). */
const templateModules = import.meta.glob('../assets/templates/**/*.xml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export function templateFiles(): Map<string, string> {
  const files = new Map<string, string>();
  for (const [path, text] of Object.entries(templateModules)) {
    const name = path.replace(/^\.\.\/assets\/templates\//, '').replace(/\.xml$/, '');
    files.set(name, text);
  }
  return files;
}

export async function fetchJson<T>(path: string): Promise<T> {
  const url = assetUrl(path);
  console.log('0ad fetchJson', path, url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  const text = await res.text();
  try { return JSON.parse(text) as T; } catch { throw new Error(`${path} (${url}) is not JSON: ${text.slice(0, 80)}`); }
}

export async function fetchBuffer(path: string): Promise<ArrayBuffer> {
  const res = await fetch(assetUrl(path));
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.arrayBuffer();
}

export async function fetchText(path: string): Promise<string> {
  const url = assetUrl(path);
  console.log('0ad fetchText', path, url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.text();
}
