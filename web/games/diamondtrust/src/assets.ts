// Original Diamond Trust of London artwork used by the browser port: the map,
// unit sprites, diamond/vault markers and title/paper images. Files are copied
// from gameSource/graphics by re/diamondtrust/tools/build-assets.py.
const IMAGES = import.meta.glob('../assets/*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

function nameOf(path: string): string { return path.split('/').pop() ?? path; }
const URLS: Record<string, string> = Object.fromEntries(Object.entries(IMAGES).map(([p, u]) => [nameOf(p), u]));

export function assetUrl(name: string): string | null { return URLS[name] ?? null; }

const cache = new Map<string, HTMLImageElement>();
const keyedCache = new Map<string, HTMLCanvasElement>();

export function image(name: string): Promise<HTMLImageElement> {
  const url = URLS[name];
  if (!url) return Promise.reject(new Error(`missing diamondtrust image ${name}`));
  const hit = cache.get(url);
  if (hit) return Promise.resolve(hit);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => { cache.set(url, img); resolve(img); };
    img.onerror = () => reject(new Error(`could not load ${name}`));
    img.src = url;
  });
}

export type ArtImage = HTMLImageElement | HTMLCanvasElement;

/** Loads an original RGB image and makes its corner colour transparent, as applyCornerTransparency(). */
export async function keyedImage(name: string): Promise<HTMLCanvasElement> {
  const hit = keyedCache.get(name);
  if (hit) return hit;
  const img = await image(name);
  const c = document.createElement('canvas');
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  const x = c.getContext('2d', { willReadFrequently: true });
  if (!x) throw new Error(`could not key ${name}`);
  x.drawImage(img, 0, 0);
  const data = x.getImageData(0, 0, c.width, c.height);
  const d = data.data;
  const r0 = d[0], g0 = d[1], b0 = d[2];
  for (let i = 0; i < d.length; i += 4) {
    if (d[i] === r0 && d[i + 1] === g0 && d[i + 2] === b0) d[i + 3] = 0;
  }
  x.putImageData(data, 0, 0);
  keyedCache.set(name, c);
  return c;
}

export interface Art {
  map: HTMLImageElement;
  names: ArtImage;
  playerUnits: ArtImage;
  enemyUnits: ArtImage;
  inspector: ArtImage;
  diamond: ArtImage;
  vault: ArtImage;
  title: ArtImage;
  paper: HTMLImageElement;
  font8: HTMLImageElement;
  font16: HTMLImageElement;
}

export async function loadArt(): Promise<Art> {
  const [map, names, playerUnits, enemyUnits, inspector, diamond, vault, title, paper,
    font8, font16] = await Promise.all([
    image('angola_map.png'), keyedImage('map_names.png'), keyedImage('playerUnits.png'),
    keyedImage('enemyUnits.png'), keyedImage('inspectorUnit.png'), keyedImage('diamond.png'),
    keyedImage('vault.png'), keyedImage('titleBlack16.png'), image('paper.png'),
    image('font8.png'), image('font16_jcr.png'),
  ]);
  return { map, names, playerUnits, enemyUnits, inspector, diamond, vault, title, paper,
    font8, font16 };
}
