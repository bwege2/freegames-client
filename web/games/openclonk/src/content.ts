// OpenClonk in the browser: the original's content as the page downloads it. re/openclonk/tools/pack.sh packs the
// groups of the original's planet folder with the original's c4group tool into ../assets/ (pack.sh --out
// web/games/openclonk/assets; the packed files are not committed), Vite gives each a URL (hashed, cached by the
// browser), and src/boot.ts mounts them. The four non-commercial files (settings.ts) are separate files beside the
// groups; they are part of the build only while NONCOMMERCIAL_FILES is on (the build-if block below,
// web/scripts/build-if.mjs): with it off, Vite never sees them and does not emit them.
import { NONCOMMERCIAL_FILES, NONCOMMERCIAL_PATHS } from './settings.ts';
import type { ContentFile, ContentGroup } from './boot.ts';

/** every packed group in ../assets/ by its file name */
const GROUP_URLS: Record<string, string> = {};
for (const [file, url] of Object.entries(
  import.meta.glob('../assets/*.{ocg,ocd,ocf}', { query: '?url', import: 'default', eager: true }) as Record<string, string>,
)) GROUP_URLS[file.slice('../assets/'.length)] = url;

/** the non-commercial files by their path in planet/ (empty while NONCOMMERCIAL_FILES is off: not even built) */
const NONCOMMERCIAL_URLS: Record<string, string> = {};
// build-if ./settings.ts NONCOMMERCIAL_FILES
for (const [file, url] of Object.entries(
  import.meta.glob('../assets/noncommercial/**/*', { query: '?url', import: 'default', eager: true }) as Record<string, string>,
)) NONCOMMERCIAL_URLS[file.slice('../assets/noncommercial/'.length)] = url;
// build-end

/** the URL of a packed group, or null when it was not packed (pack.sh not run) */
export function groupUrl(name: string): string | null {
  return GROUP_URLS[name] ?? null;
}

/** the groups of `names` that are not there */
export function missingGroups(names: readonly string[]): string[] {
  return names.filter((n) => !GROUP_URLS[n]);
}

/** the non-commercial files the build has (all four with the setting on, none with it off) */
export function noncommercialUrls(): { path: string; url: string }[] {
  if (!NONCOMMERCIAL_FILES) return [];
  return NONCOMMERCIAL_PATHS.filter((p) => NONCOMMERCIAL_URLS[p]).map((p) => ({ path: p, url: NONCOMMERCIAL_URLS[p] }));
}

/** progress of one download: bytes received, bytes in total (0 when the server does not say) */
export type Progress = (got: number, total: number) => void;

async function fetchBytes(url: string, signal: AbortSignal, progress?: Progress): Promise<Uint8Array> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  const total = Number(response.headers.get('content-length')) || 0;
  const reader = response.body?.getReader();
  if (!reader) return new Uint8Array(await response.arrayBuffer());
  const chunks: Uint8Array[] = [];
  let got = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    got += value.length;
    progress?.(got, total);
  }
  const data = new Uint8Array(got);
  let o = 0;
  for (const c of chunks) {
    data.set(c, o);
    o += c.length;
  }
  return data;
}

/** downloads one packed group (Play has put the start groups into the browser's cache already) */
export async function fetchGroup(name: string, signal: AbortSignal, progress?: Progress): Promise<ContentGroup> {
  const url = groupUrl(name);
  if (!url) throw new Error(`the content group ${name} is not in this build (re/openclonk/tools/pack.sh --out web/games/openclonk/assets)`);
  return { name, data: await fetchBytes(url, signal, progress) };
}

/** downloads the non-commercial files of this build, for src/boot.ts (none while NONCOMMERCIAL_FILES is off) */
export async function fetchNoncommercial(signal: AbortSignal): Promise<ContentFile[]> {
  return Promise.all(noncommercialUrls().map(async ({ path, url }) => ({ path, data: await fetchBytes(url, signal) })));
}
