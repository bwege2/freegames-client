// Browser side of test/count.test.ts: one scenario started as the original's scenario selection starts it (the
// scenario and the selected players on the command line of C4Application::Init, the config with the player's
// unlocked missions), run for a number of frames; what the engine logged, how far it came and why it stopped.
import { OriginalApp } from '../../src/app.ts';

interface Run {
  groups: string[]; scenario: string; frames: number; width: number; height: number;
  players: string[]; config?: string; limitMs: number;
}

(globalThis as any).ocCount = async (run: Run) => {
  const log: string[] = [];
  const fetchBytes = async (url: string) => new Uint8Array(await (await fetch(url)).arrayBuffer());
  const groups = await Promise.all(run.groups.map(async (name) => ({ name, data: await fetchBytes('/assets/' + name) })));
  const canvas = document.createElement('canvas');
  canvas.width = run.width;
  canvas.height = run.height;
  document.body.append(canvas);
  const app = new OriginalApp({
    canvas, audio: null, groups, files: [], scenario: run.scenario, playerName: run.players[0], morePlayers: run.players.slice(1),
    config: run.config, log: (l) => log.push(l),
  });
  const $ = app.engine as any;
  let error = '';
  let started = false;
  const t0 = performance.now();
  try {
    app.prepare();
    started = app.start();
    if (!started) throw new Error('C4Application::Init failed');
    while (app.frameCounter < run.frames && performance.now() - t0 < run.limitMs) {
      await new Promise((r) => requestAnimationFrame(r));
      app.frame();
      if (app.quit) break;
    }
  } catch (e) {
    error = String((e as Error)?.stack ?? e).split('\n').slice(0, 8).join('\n');
  }
  const players: number = (() => { let n = 0; for (let p = $.Players?.First; p; p = p.Next) n++; return n; })();
  return {
    frame: app.frameCounter, error, quit: app.quit, running: !!$.Game?.IsRunning, gameOver: !!$.Game?.GameOver,
    players, seconds: Math.round((performance.now() - t0) / 1000), log: log.slice(-25),
  };
};
