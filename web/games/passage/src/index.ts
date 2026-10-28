// Passage on the website: what game.cpp did with SDL. The 100x16 picture on the SDK's pixel screen,
// the keys and a gamepad read once per frame at the original's locked 15 frames per second, the music
// in an audio worklet, b (zoom) and f (full screen) as in the original, q or Esc to leave.
import { PixelScreen, type StartGame } from '../../../src/sdk/index.ts';
import { NAMES, parseImage, type AssetName, type Image } from './assets.ts';
import { GraphicContainer } from './World.ts';
import { PassageGame, FRAME_RATE, TOTAL_HEIGHT, WIDTH, type Keys } from './game.ts';
import { MusicPlayer, Resampler } from './music.ts';
import workletUrl from './music.worklet.ts?worker&url';

const urls = import.meta.glob<string>('../assets/*.bin', { eager: true, query: '?url', import: 'default' });

async function loadAssets(signal: AbortSignal): Promise<Record<AssetName, Image>> {
  const out = {} as Record<AssetName, Image>;
  await Promise.all(NAMES.map(async (n) => {
    const r = await fetch(urls[`../assets/${n}.bin`], { signal });
    out[n] = parseImage(new Uint8Array(await r.arrayBuffer()));
  }));
  return out;
}

interface Music { setLoudness(l: number): void; restart(): void }

/** The song in an AudioWorklet, or a ScriptProcessor where worklets are not allowed (plain http). */
async function startMusic(audio: AudioContext, music: Image, signal: AbortSignal): Promise<Music> {
  let loudness = 0;
  try {
    await audio.audioWorklet.addModule(workletUrl);
    const node = new AudioWorkletNode(audio, 'passage-music', { numberOfInputs: 0, outputChannelCount: [2], processorOptions: { music, loudness } });
    node.connect(audio.destination);
    signal.addEventListener('abort', () => node.disconnect(), { once: true });
    return {
      setLoudness: (l) => { if (l !== loudness) node.port.postMessage({ loudness: (loudness = l) }); },
      restart: () => node.port.postMessage({ restart: true }),
    };
  } catch {
    const player = new MusicPlayer(music);
    player.loudness = loudness;
    const resampler = new Resampler(player, audio.sampleRate);
    const node = audio.createScriptProcessor(1024, 0, 2);
    node.onaudioprocess = (e) => resampler.render(e.outputBuffer.getChannelData(0), e.outputBuffer.getChannelData(1));
    node.connect(audio.destination);
    signal.addEventListener('abort', () => node.disconnect(), { once: true });
    return {
      setLoudness: (l) => { player.loudness = l; },
      restart: () => { player.restart(); resampler.reset(); },
    };
  }
}

/** a gamepad's stick (and d-pad) as the original read its joystick's axes: beyond 25000 of 32767 */
function padKeys(): { left: boolean; right: boolean; up: boolean; down: boolean; any: boolean } {
  const out = { left: false, right: false, up: false, down: false, any: false };
  const t = 25000 / 32767;
  for (const p of navigator.getGamepads?.() ?? []) {
    if (!p) continue;
    const [x = 0, y = 0] = p.axes;
    const b = (i: number) => !!p.buttons[i]?.pressed;
    out.left ||= x < -t || b(14);
    out.right ||= x > t || b(15);
    out.up ||= y < -t || b(12);
    out.down ||= y > t || b(13);
    out.any ||= p.buttons.some((x) => x.pressed);
  }
  return out;
}

export const start: StartGame = async (host, ctx) => {
  const signal = ctx.signal;
  const assets = await loadAssets(signal);
  const music = await startMusic(ctx.audio, assets.music, signal);
  const gc = (n: AssetName) => new GraphicContainer(assets[n]);
  const game = new PassageGame({
    tileSet: gc('tileSet'), chest: gc('chest'), characterSprite: gc('characterSprite'), characterSpriteSad: gc('characterSpriteSad'),
    spouseSprite: gc('spouseSprite'), chestPrize: gc('chestPrize'), chestDust: gc('chestDust'), heart: gc('heart'),
    numerals: gc('numerals'), title: gc('title'),
  }, { setMusicLoudness: (l) => music.setLoudness(l), restartMusic: () => music.restart() });

  const screen = new PixelScreen(host, { width: WIDTH, height: TOTAL_HEIGHT }, signal);
  const pixels = screen.ctx.createImageData(WIDTH, TOTAL_HEIGHT);
  const draw = () => {
    const d = pixels.data;
    for (let i = 0; i < game.image.length; i++) {
      const p = game.image[i];
      d[i * 4] = (p >> 16) & 0xff;
      d[i * 4 + 1] = (p >> 8) & 0xff;
      d[i * 4 + 2] = p & 0xff;
      d[i * 4 + 3] = 255;
    }
    screen.ctx.putImageData(pixels, 0, 0);
  };

  // keys held (read once per frame, like SDL_GetKeyState) and presses since the last frame
  const held = new Set<string>();
  let anyEvent = false, quit = false;
  const GAME_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 's', 'p', 'o', 'i', 'b', 'f', 'q', 'Escape', ' ']);
  window.addEventListener('keydown', (e) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (GAME_KEYS.has(k)) e.preventDefault();
    held.add(k);
    anyEvent = true;
    if (k === 'q' || k === 'Escape') quit = true;
    if (k === 'f' && !e.repeat) void (document.fullscreenElement ? document.exitFullscreen() : host.requestFullscreen()).catch(() => { /* refused */ });
  }, { signal });
  window.addEventListener('keyup', (e) => {
    held.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key);
    anyEvent = true;
  }, { signal });
  window.addEventListener('blur', () => held.clear(), { signal });

  // b: the original's zoom, stepping down to 1x and back up while held
  let blowUp = screen.maxScale(), blowUpStep = -1;

  game.newGame(() => Math.floor(Date.now() / 1000));
  draw();
  let acc = 0;
  ctx.frame((_t, dt) => {
    acc += Math.min(dt, 250);
    const step = 1000 / FRAME_RATE;
    if (acc < step) return;
    acc %= step;
    const pad = padKeys();
    if (game.onTitle) {
      // any key or button starts a life, q and Esc too (waitForKeyOrButton() takes that key's event)
      if (anyEvent || pad.any) game.start();
      anyEvent = false;
      quit = false;
      if (game.onTitle) return;
    }
    const keys: Keys = {
      left: held.has('ArrowLeft') || pad.left, right: held.has('ArrowRight') || pad.right,
      up: held.has('ArrowUp') || pad.up, down: held.has('ArrowDown') || pad.down,
      s: held.has('s'), p: held.has('p'), o: held.has('o'), i: held.has('i'),
    };
    game.render(keys);
    draw();
    if (held.has('b')) {
      blowUp += blowUpStep;
      const max = screen.maxScale();
      if (blowUp > max) { blowUpStep = -blowUpStep; blowUp = max - 1; }
      if (blowUp < 1) { blowUpStep = -blowUpStep; blowUp = 2; }
      screen.setScale(blowUp);
    }
    game.update(keys, quit);
    const leaving = quit;
    quit = false;
    anyEvent = false;
    if (!game.done) return;
    if (leaving) { ctx.exit(); return; }
    // the life is over and the title is back: the next one begins with a key
    game.newGame(() => Math.floor(Date.now() / 1000));
    draw();
  });

  return { stop() { /* listeners, the frame loop, the screen and the music end with ctx.signal */ } };
};
