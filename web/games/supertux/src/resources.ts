// The browser resource layer behind a small interface, so that the simulation (levels, physics,
// sprites) can run headless in node tests without a DOM or Vite's asset globs.
export interface Sound {
  play(path: string, volume?: number): void;
  playMusic(path: string, loop?: boolean): void;
  stopMusic(): void;
}

export interface ResourceLoader {
  text(path: string): Promise<string>;
  /** the image if decoded, else null and its load starts */
  imageReady(path: string): HTMLImageElement | null;
  image(path: string): Promise<HTMLImageElement>;
}

let loader: ResourceLoader | null = null;

export function setResourceLoader(l: ResourceLoader | null): void { loader = l; }

export function loadText(path: string): Promise<string> {
  if (!loader) return Promise.reject(new Error(`no resource loader for ${path}`));
  try { return loader.text(path); } catch (e) { return Promise.reject(e); }
}

export function imageReady(path: string): HTMLImageElement | null {
  return loader ? loader.imageReady(path) : null;
}

export function loadImage(path: string): Promise<HTMLImageElement> {
  if (!loader) return Promise.reject(new Error(`no resource loader for ${path}`));
  return loader.image(path);
}

export const silentSound: Sound = {
  play(): void {},
  playMusic(): void {},
  stopMusic(): void {},
};
