// Vite turns every file of assets/ into a hashed URL. The game loads only what a level needs;
// maps, dialogues, sounds and the 110 animation files stay lazy (game.json lazyAssets).
const modules = import.meta.glob('../assets/**/*', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const PREFIX = '../assets/';

export function assetUrl(path: string): string {
  const url = modules[PREFIX + path];
  if (!url) throw new Error(`Lugaru asset missing: ${path}`);
  return url;
}

export function assetPaths(): string[] {
  return Object.keys(modules).map((k) => k.slice(PREFIX.length)).sort();
}
