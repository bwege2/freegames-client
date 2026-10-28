// freegames.stream website and game SDK: GPL-3.0-or-later, with an additional permission and additional terms under its section 7 (web/LICENSE.md).
// Every game folder web/games/<id>/: its game.json, its screenshots and (once it is ported) its code,
// which is a lazily loaded chunk.
import type { GameManifest, StartGame } from '../sdk/game.ts';

const manifests = import.meta.glob<GameManifest>('../../games/*/game.json', { eager: true, import: 'default' });
const images = import.meta.glob<string>('../../games/*/screenshots/*.{png,jpg,jpeg,webp,gif}', { eager: true, query: '?url', import: 'default' });
const code = import.meta.glob<{ start: StartGame }>('../../games/*/src/index.ts');

export interface Game {
  manifest: GameManifest;
  shots: { url: string; caption: string }[];
  /** the game's start function; undefined while the game is not ported yet */
  load?: () => Promise<StartGame>;
}

const dirOf = (path: string) => path.split('/')[3];

export const games: Game[] = Object.entries(manifests).map(([path, manifest]) => {
  const dir = dirOf(path);
  const shots = manifest.screenshots
    .map((s) => ({ url: images[`../../games/${dir}/screenshots/${s.file}`], caption: s.caption }))
    .filter((s) => s.url);
  const loader = code[`../../games/${dir}/src/index.ts`];
  return { manifest, shots, load: loader && (async () => (await loader()).start) };
}).sort((a, b) => a.manifest.title.localeCompare(b.manifest.title));

export function game(id: string): Game | undefined {
  return games.find((g) => g.manifest.id === id);
}

/** 6774 -> "6.8 KB", 835620 -> "836 KB" */
export function size(bytes: number): string {
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
  return `${(bytes / 1e3).toFixed(bytes < 1e4 ? 1 : 0)} KB`;
}
