// Browser side of test/play.test.ts: the original's application (src/app.ts) on a canvas runs a scenario with a player,
// as the page starts it; at given frames the test's mouse clicks and keys go in as the page sends them (SDL events
// into the original's HandleSDLEvent), and the player's clonk is looked at. With an AudioContext the content's sounds
// are decoded first and the game's output (every source through rt/al.ts) is metered.
import { OriginalApp, type ContentFile } from '../../src/app.ts';
import { alOutput } from '../../src/rt/al.ts';

interface Action { frame: number; click?: [number, number]; key?: string; down?: boolean }
interface Run {
  groups: string[]; scenario: string; frames: number; width: number; height: number;
  audio?: boolean; noncommercial?: boolean; files?: string[]; actions?: Action[];
}
interface Result {
  log: string[]; frame: number; error: string;
  /** the player's clonk (its cursor) after each action */
  cursor: { frame: number; x: number; y: number }[];
  /** the game's output: blocks rendered, blocks that were not silent, the loudest sample */
  audio: { blocks: number; loud: number; peak: number } | null;
  /** the sound effects the original's sound system loaded (C4SoundSystem::FirstSound) and their instances */
  sounds: { name: string; instances: number }[];
  /** the piece the original's music system plays (C4MusicSystem::PlayMusicFile), if any */
  music: string;
}

const cString = (a: Int8Array): string => {
  let s = '';
  for (let i = 0; i < a.length && a[i]; i++) s += String.fromCharCode(a[i] & 0xff);
  return s;
};

(globalThis as unknown as { ocPlay: unknown }).ocPlay = async (run: Run): Promise<Result> => {
  const log: string[] = [];
  const fetchBytes = async (url: string) => new Uint8Array(await (await fetch(url)).arrayBuffer());
  const groups = await Promise.all(run.groups.map(async (name) => ({ name, data: await fetchBytes('/assets/' + name) })));
  const files: ContentFile[] = await Promise.all((run.files ?? []).map(async (path) => ({ path, data: await fetchBytes('/assets/noncommercial/' + path) })));
  const canvas = document.createElement('canvas');
  canvas.width = run.width;
  canvas.height = run.height;
  canvas.style.cssText = `position:absolute;left:0;top:0;width:${run.width}px;height:${run.height}px`;
  document.body.append(canvas);
  const audio = run.audio ? new AudioContext() : null;
  const app = new OriginalApp({
    canvas, audio, groups, files, noncommercial: run.noncommercial, scenario: run.scenario, playerName: 'Clonk',
    log: (l) => log.push(l),
  });
  const $ = app.engine;
  const result: Result = { log, frame: -1, error: '', cursor: [], audio: null, sounds: [], music: '' };
  try {
    app.prepare();
    if (audio) {
      await app.decodeSounds();
      const meter = { blocks: 0, loud: 0, peak: 0 };
      result.audio = meter;
      const tap = audio.createScriptProcessor(4096, 2, 2);
      tap.onaudioprocess = (e) => {
        let p = 0;
        for (let c = 0; c < e.inputBuffer.numberOfChannels; c++) {
          const d = e.inputBuffer.getChannelData(c);
          for (let i = 0; i < d.length; i++) p = Math.max(p, Math.abs(d[i]));
        }
        meter.blocks++;
        if (p > 1e-4) meter.loud++;
        meter.peak = Math.max(meter.peak, p);
      };
      alOutput()!.connect(tap);
      tap.connect(audio.destination);
      await audio.resume();
    }
    if (!app.start()) throw new Error('C4Application::Init failed');
    const actions = [...(run.actions ?? [])].sort((a, b) => a.frame - b.frame);
    const at = (x: number, y: number, button = 0) => ({ clientX: x, clientY: y, button, detail: 1 });
    for (let i = 0; i < run.frames * 8 && app.frameCounter < run.frames; i++) {
      await new Promise((r) => requestAnimationFrame(r));
      app.frame();
      while (actions.length && app.frameCounter >= actions[0].frame) {
        const a = actions.shift()!;
        if (a.click) {
          app.mouseMove(new MouseEvent('mousemove', at(...a.click)));
          app.mouseButton(new MouseEvent('mousedown', at(...a.click)), true);
          app.mouseButton(new MouseEvent('mouseup', at(...a.click)), false);
        }
        if (a.key) app.key(new KeyboardEvent(a.down ? 'keydown' : 'keyup', { code: a.key, key: a.key.replace(/^Key/, '').toLowerCase() }), !!a.down);
        let c = $.Players.First?.Cursor;
        if (c && c.fix_x === undefined && c.op_C4Object_) c = c.op_C4Object_();
        result.cursor.push({ frame: app.frameCounter, x: c ? $.fixtof(c.fix_x) : NaN, y: c ? $.fixtof(c.fix_y) : NaN });
      }
      if (app.quit) break;
    }
  } catch (e) {
    result.error = String((e as Error)?.stack ?? e).split('\n').slice(0, 12).join('\n');
  }
  result.frame = app.frameCounter;
  for (let s = $.Application?.SoundSystem?.FirstSound; s; s = s.Next) result.sounds.push({ name: cString(s.Name), instances: s.Instances });
  const music = $.Application?.MusicSystem;
  if (music?.PlayMusicFile) result.music = String(music.PlayMusicFile.FileName ? cString(music.PlayMusicFile.FileName) : music.PlayMusicFile.constructor?.name);
  await audio?.close();
  return result;
};
