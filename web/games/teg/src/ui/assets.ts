// The original's default theme (m2), its data and pictures. re/teg/fetch.sh copies the files from
// TEG 0.13.0 unchanged and writes theme.json from the theme's XML; Vite gives every file its hashed
// name, and the code here loads the pictures the game needs before the board is drawn.
import themeData from '../../assets/theme/theme.json';

export interface ThemeCountry {
  name: string;
  file: string;
  x: number;
  y: number;
  armyX: number;
  armyY: number;
  w: number;
  h: number;
}
export interface ThemeContinent {
  name: string;
  x: number;
  y: number;
  countries: ThemeCountry[];
}
export interface Theme {
  name: string;
  author: string;
  email: string;
  version: string;
  board: string;
  boardW: number;
  boardH: number;
  dicePos: { x: number; y: number };
  diceExt: Record<string, number>;
  diceText: { x1: number; y1: number; x2: number; y2: number; color: string };
  toolbar: { file: string; textColor: string };
  cards: Record<string, string>;
  cardsPosY: number;
  continents: ThemeContinent[];
}

export const THEME = themeData as Theme;

type UrlMap = Record<string, string>;
const themeUrls = import.meta.glob('../../assets/theme/*', {
  eager: true, query: '?url', import: 'default',
}) as UrlMap;
const pixUrls = import.meta.glob('../../assets/pix/*', {
  eager: true, query: '?url', import: 'default',
}) as UrlMap;

function byBaseName(map: UrlMap): Map<string, string> {
  const out = new Map<string, string>();
  for (const [path, url] of Object.entries(map)) out.set(path.split('/').pop()!, url);
  return out;
}

const themeUrl = byBaseName(themeUrls);
const pixUrl = byBaseName(pixUrls);

function load(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`cannot load ${url}`));
    img.src = url;
  });
}

export interface Assets {
  theme: Theme;
  /** theme files by base name: board.jpg, Southamerica-Argentinia.png, dice-1.png, … */
  images: Map<string, HTMLImageElement>;
  /** client/teg_pix files by base name: disc_red.png, color_player_red.png, objetivo.png, … */
  pix: Map<string, HTMLImageElement>;
}

/** all the pictures the board, the cards, the dice and the dialogs use */
export async function loadAssets(): Promise<Assets> {
  const files: string[] = [THEME.board];
  for (const c of THEME.continents) for (const k of c.countries) files.push(k.file);
  for (const f of Object.values(THEME.cards)) files.push(f);
  for (let i = 1; i <= 6; i++) files.push(`dice-${i}.png`);
  files.push(THEME.toolbar.file);
  const pix = ['objetivo.png', 'disc_grey.png', 'disc_over.png'];
  for (const c of ['red', 'yellow', 'blue', 'black', 'pink', 'green']) {
    pix.push(`disc_${c}.png`, `color_player_${c}.png`);
  }
  const images = new Map<string, HTMLImageElement>();
  const pixImages = new Map<string, HTMLImageElement>();
  await Promise.all([
    ...files.map(async (f) => {
      const url = themeUrl.get(f);
      if (url) images.set(f, await load(url));
    }),
    ...pix.map(async (f) => {
      const url = pixUrl.get(f);
      if (url) pixImages.set(f, await load(url));
    }),
  ]);
  return { theme: THEME, images, pix: pixImages };
}
