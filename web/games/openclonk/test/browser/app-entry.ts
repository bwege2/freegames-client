// Browser side of test/screenshot.test.ts: the original's application (src/app.ts) on a canvas, replaying a record,
// stopped after it drew the first frame at or past a game frame; the canvas's pixels are read back.
import { OriginalApp } from '../../src/app.ts';

interface Run { groups: string[]; record: string; frame: number; width: number; height: number }

(globalThis as unknown as { ocShot: unknown }).ocShot = async (run: Run): Promise<{ log: string[]; frame: number; png: string }> => {
  const log: string[] = [];
  const datas = await Promise.all(run.groups.map(async (g) => new Uint8Array(await (await fetch('/assets/' + g)).arrayBuffer())));
  const record = new Uint8Array(await (await fetch('/record')).arrayBuffer());
  const canvas = document.createElement('canvas');
  canvas.width = run.width;
  canvas.height = run.height;
  document.body.append(canvas);
  const app = new OriginalApp({
    canvas, preserveDrawingBuffer: true, audio: null, groups: run.groups.map((name, i) => ({ name, data: datas[i] })),
    replay: { name: run.record, data: record }, log: (l) => log.push(l),
  });
  if (!app.init()) return { log, frame: -1, png: '' };
  // the original's main loop, one round per animation frame, until a frame at or past `frame` is drawn
  for (let i = 0; i < 20000 && app.frameCounter < run.frame; i++) {
    await new Promise((r) => requestAnimationFrame(r));
    app.frame();
    if (app.quit) break;
  }
  return { log, frame: app.frameCounter, png: canvas.toDataURL('image/png') };
};
