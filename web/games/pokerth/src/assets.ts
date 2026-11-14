// The original's data (re/pokerth/tools/assets.sh copies it unchanged from PokerTH 1.1.2's data/ directory).
const cards = import.meta.glob('../assets/cards/*.png', { query: '?url', import: 'default', eager: true }) as Record<string, string>;
const table = import.meta.glob('../assets/table/*.png', { query: '?url', import: 'default', eager: true }) as Record<string, string>;
const misc = import.meta.glob('../assets/misc/*.png', { query: '?url', import: 'default', eager: true }) as Record<string, string>;
const sounds = import.meta.glob('../assets/sounds/*.wav', { query: '?url', import: 'default', eager: true }) as Record<string, string>;
import fontUrl from '../assets/fonts/DejaVuSans-Bold.ttf?url';

const pick = (m: Record<string, string>, name: string): string => {
  const k = Object.keys(m).find((p) => p.endsWith(`/${name}`));
  if (!k) throw new Error(`asset ${name} missing`);
  return m[k];
};

/** gfx/cards/default/<n>.png: 0..51, card / 13 the suit (diamonds, hearts, spades, clubs), card % 13 the rank */
export const cardUrl = (n: number): string => pick(cards, `${n}.png`);
export const flipsideUrl = (): string => pick(cards, 'flipside.png');
/** gfx/gui/table/default/<name>.png */
export const tableUrl = (name: string): string => pick(table, `${name}.png`);
/** gfx/gui/misc/actionpics/action_<name>.png, gfx/gui/misc/<name>.png */
export const miscUrl = (name: string): string => pick(misc, `${name}.png`);
/** sounds/default/<name>.wav */
export const soundUrl = (name: string): string => pick(sounds, `${name}.wav`);
export const FONT_URL: string = fontUrl;

/** everything to preload before the table appears */
export function allImageUrls(): string[] {
  return [...Object.values(cards), ...Object.values(table), ...Object.values(misc)];
}
