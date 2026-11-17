// The original's data files (assets/, copied by re/opencity/fetch.sh --assets), by their path in the
// original's data directory ("graphism/gui/zone.png").
const urls = import.meta.glob('../assets/**/*', { query: '?url', import: 'default', eager: true }) as Record<string, string>;

export function assetUrl(path: string): string {
  const u = urls[`../assets/${path}`];
  if (!u) throw new Error(`missing asset ${path}`);
  return u;
}

export function hasAsset(path: string): boolean { return `../assets/${path}` in urls; }

export async function fetchText(path: string, signal: AbortSignal): Promise<string> {
  const res = await fetch(assetUrl(path), { signal });
  const buf = await res.arrayBuffer();
  return new TextDecoder('latin1').decode(buf);
}

export async function fetchBytes(path: string, signal: AbortSignal): Promise<ArrayBuffer> {
  const res = await fetch(assetUrl(path), { signal });
  return res.arrayBuffer();
}

export function loadImage(path: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`image ${path}`));
    img.src = assetUrl(path);
  });
}

/** every GUI image under graphism/gui/ */
export function guiImagePaths(): string[] {
  return Object.keys(urls).map((k) => k.slice('../assets/'.length)).filter((p) => p.startsWith('graphism/gui/') && p.endsWith('.png'));
}
