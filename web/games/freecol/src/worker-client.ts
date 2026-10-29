// The client worker in the browser (port/web/client-main.ts), started by worker.ts: canvases are OffscreenCanvases, fonts are
// FontFaces of the worker, the screen goes to the page as an ImageBitmap per frame.
import { runClient, type ClientInit } from './port/web/client-main.ts';
import { loadSync } from './port/web/files.ts';

const scope = self as any;

/** The fonts of the first screens, loaded before the client starts (text drawn later uses them at once). */
const EARLY_FONTS: [string, string][] = [
  ['DejaVuSans', '/fonts/DejaVuSans.ttf'],
  ['DejaVuSans-Bold', '/fonts/DejaVuSans-Bold.ttf'],
  ['DejaVuSerif', '/fonts/DejaVuSerif.ttf'],
  ['DejaVuSerif-Bold', '/fonts/DejaVuSerif-Bold.ttf'],
  ['ShadowedBlack', '/data/base/resources/fonts/ShadowedBlack.ttf'],
];

const families = new Map<string, string>();
function addFont(name: string, bytes: Uint8Array): string {
  let fam = families.get(name);
  if (!fam) {
    fam = 'freecol-' + name;
    const face = new FontFace(fam, bytes as Uint8Array<ArrayBuffer>);
    scope.fonts.add(face);
    void face.load();
    families.set(name, fam);
  }
  return fam;
}

export async function startClientWorker({ init, server }: { init: ClientInit; server: MessagePort }) {
  await Promise.all(EARLY_FONTS.map(([name, path]) => {
    const url = init.files[path];
    const bytes = url ? loadSync(url) : null;
    if (!bytes) return null;
    const fam = 'freecol-' + name;
    const face = new FontFace(fam, bytes as Uint8Array<ArrayBuffer>);
    scope.fonts.add(face);
    families.set(name, fam);
    return face.load().catch(() => null);
  }));
  let last = -1e9;
  let out: OffscreenCanvas | null = null;
  runClient(init, {
    server,
    post: (m, transfer) => scope.postMessage(m, transfer ?? []),
    load: loadSync,
    canvas: (w, h) => {
      const canvas = new OffscreenCanvas(Math.max(1, w), Math.max(1, h));
      return { canvas, ctx: canvas.getContext('2d') };
    },
    addFont,
    frame: (canvas: OffscreenCanvas) => {
      const now = performance.now();
      if (now - last < 15) return false;
      last = now;
      if (!out || out.width !== canvas.width || out.height !== canvas.height) out = new OffscreenCanvas(canvas.width, canvas.height);
      const ctx = out.getContext('2d')!;
      ctx.drawImage(canvas, 0, 0);
      const bitmap = out.transferToImageBitmap();
      scope.postMessage({ t: 'frame', bitmap }, [bitmap]);
      return true;
    },
  });
}
