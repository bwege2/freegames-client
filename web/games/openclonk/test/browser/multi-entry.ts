// Browser side of test/multiplayer.test.ts: the original's local multiplayer, two players on one computer, the first with
// the keyboard and mouse set, the second with the gamepad set and a gamepad (a stand-in for the browser's Gamepad API,
// rt/sdl.ts sdlSetGamepadSource, with the standard mapping); the test moves each player's clonk with its own controls.
import { OriginalApp } from '../../src/app.ts';
import { sdlSetGamepadSource, type PadState } from '../../src/rt/sdl.ts';

const pad: PadState = { index: 0, id: 'Test pad (standard mapping)', connected: true, mapping: 'standard', axes: [0, 0, 0, 0],
  buttons: Array.from({ length: 17 }, () => ({ value: 0, pressed: false })) };

(globalThis as any).ocMulti = async (run: { groups: string[]; scenario: string; width: number; height: number }) => {
  const log: string[] = [];
  const fetchBytes = async (url: string) => new Uint8Array(await (await fetch(url)).arrayBuffer());
  const groups = await Promise.all(run.groups.map(async (name) => ({ name, data: await fetchBytes('/assets/' + name) })));
  const canvas = document.createElement('canvas');
  canvas.width = run.width;
  canvas.height = run.height;
  document.body.append(canvas);
  sdlSetGamepadSource(() => [pad]);
  const app = new OriginalApp({
    canvas, audio: null, groups, files: [], scenario: run.scenario, playerName: 'Keys',
    morePlayers: [{ name: 'Pad', controlSet: 'Gamepad_GamepadCon_IntQueue_' }], log: (l) => log.push(l),
  });
  const $ = app.engine as any;
  const frames = async (n: number) => {
    const until = app.frameCounter + n;
    for (let i = 0; i < n * 8 && app.frameCounter < until; i++) {
      await new Promise((r) => requestAnimationFrame(r));
      app.frame();
    }
  };
  const xOf = (name: string): number => {
    for (let p = $.Players.First; p; p = p.Next) {
      let s = '';
      for (let i = 0; p.Name.getData().a[p.Name.getData().o + i]; i++) s += String.fromCharCode(p.Name.getData().a[p.Name.getData().o + i]);
      if (s !== name) continue;
      let c = p.Cursor;
      if (c && c.fix_x === undefined && c.op_C4Object_) c = c.op_C4Object_();
      return c ? $.fixtof(c.fix_x) : NaN;
    }
    return NaN;
  };
  const out: Record<string, unknown> = { log };
  try {
    app.prepare();
    if (!app.start()) throw new Error('C4Application::Init failed');
    await frames(150);
    out.start = { keys: xOf('Keys'), pad: xOf('Pad'), frame: app.frameCounter };
    // D on the keyboard: only the keyboard player's clonk walks
    app.key(new KeyboardEvent('keydown', { code: 'KeyD', key: 'd' }), true);
    await frames(60);
    app.key(new KeyboardEvent('keyup', { code: 'KeyD', key: 'd' }), false);
    await frames(10);
    out.afterKeys = { keys: xOf('Keys'), pad: xOf('Pad') };
    // the gamepad's left stick to the right: only the gamepad player's clonk walks
    pad.axes[0] = 1;
    await frames(60);
    pad.axes[0] = 0;
    await frames(10);
    out.afterPad = { keys: xOf('Keys'), pad: xOf('Pad'), frame: app.frameCounter };
  } catch (e) {
    out.error = String((e as Error)?.stack ?? e).split('\n').slice(0, 10).join('\n');
  }
  return out;
};
