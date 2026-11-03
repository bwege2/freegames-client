// The Powder Toy v100.1.400 in the browser: PowderToySDL.cpp's main (window, event loop, EngineProcess) on a
// PixelScreen of WINDOWW x WINDOWH (629x424). The simulation and the GUI are the original's, ported in src/.
import type { StartGame, GameContext } from '../../../src/sdk/index.ts';
import { PixelScreen } from '../../../src/sdk/screen.ts';
import fontUrl from '../assets/font.bin?url';
import { loadFont } from './graphics/font.ts';
import { Graphics, toCanvasPixels } from './graphics/raster.ts';
import { WINDOWW, WINDOWH } from './sim/config.ts';
import { Engine } from './gui/interface/Engine.ts';
import { sdlKeyOf, textInputOf, SetClipboardText, SDL_SCANCODE_LGUI, SDL_SCANCODE_RGUI } from './gui/interface/Keys.ts';
import { Client } from './game/Client.ts';
import { GameController } from './gui/game/GameController.ts';
import { ErrorMessage } from './gui/dialogues/Dialogues.ts';

/** keys whose browser default (scrolling, find, tab focus, history, quick find, help...) must not happen */
const PREVENT = new Set([
  'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'Slash', 'Quote', 'Backspace', 'PageUp',
  'PageDown', 'Home', 'End', 'F1', 'F2', 'F3', 'F5', 'F6', 'F7', 'Backquote', 'Enter', 'NumpadEnter',
]);
/** Ctrl(+Shift)+key combinations the game uses and the browser would take (save page, print, find, reload...) */
const PREVENT_CTRL = new Set(['KeyS', 'KeyP', 'KeyF', 'KeyR', 'KeyZ', 'KeyY', 'KeyC', 'KeyX', 'KeyB', 'KeyG', 'KeyH',
  'KeyE', 'KeyU', 'KeyI', 'KeyD', 'KeyA', 'KeyO', 'KeyK', 'KeyL', 'Semicolon', 'Equal', 'Insert', 'Delete']);

/** SDL mouse button of a browser button (0 left, 1 middle, 2 right) */
function sdlButton(b: number): number {
  return b === 0 ? 1 : b === 1 ? 2 : b === 2 ? 3 : 0;
}

export const start: StartGame = async (host: HTMLElement, ctx: GameContext) => {
  const stopped = new AbortController();
  const signal = AbortSignal.any ? AbortSignal.any([ctx.signal, stopped.signal]) : ctx.signal;

  // ---- data: the font, the player's files (prefs, saves, stamps) ----
  const fontBytes = new Uint8Array(await (await fetch(fontUrl, { signal })).arrayBuffer());
  if (!loadFont(fontBytes)) throw new Error('powdertoy: bad font data');
  const client = Client.Create(ctx.storage);
  await client.Init();

  // ---- window ----
  const screen = new PixelScreen(host, { width: WINDOWW, height: WINDOWH, pixelAspect: 1, background: '#000' }, signal);
  const canvas = screen.canvas;
  canvas.tabIndex = 0;
  canvas.style.outline = 'none';
  canvas.style.touchAction = 'none';
  canvas.style.cursor = 'crosshair';
  const image = screen.ctx.createImageData(WINDOWW, WINDOWH);
  const pixels = new Uint32Array(image.data.buffer);

  const g = new Graphics();
  const engine = Engine.Create(g);
  engine.Begin();
  engine.onQuit = () => {
    gameController.Destroy();
    ctx.exit();
  };
  client.onStorageError = (message) => {
    if (!signal.aborted) new ErrorMessage('Could not save', message);
  };

  const gameController = new GameController();
  engine.ShowWindow(gameController.GetView());
  gameController.GetView().screenshotHook = (data, w, h) => {
    // the original writes "screenshot <date>.png" to its folder; the browser offers the PNG as a download
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const cctx = c.getContext('2d')!;
    const img = cctx.createImageData(w, h);
    toCanvasPixels(data, new Uint32Array(img.data.buffer), w * h);
    cctx.putImageData(img, 0, 0);
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const name = `screenshot ${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}.${pad(d.getMinutes())}.${pad(d.getSeconds())}.png`;
    c.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 10000);
    }, 'image/png');
  };

  // the text field that receives typed text while a textbox has focus (phone keyboards, IMEs)
  const textField = document.createElement('textarea');
  Object.assign(textField.style, { position: 'absolute', left: '0', top: '0', width: '1px', height: '1px', opacity: '0', pointerEvents: 'none' });
  textField.setAttribute('autocapitalize', 'off');
  textField.setAttribute('autocomplete', 'off');
  textField.spellcheck = false;
  host.append(textField);
  signal.addEventListener('abort', () => textField.remove(), { once: true });
  engine.onTextInputChange = (on) => {
    if (on && matchMedia('(pointer: coarse)').matches) textField.focus({ preventScroll: true });
    else if (!on && document.activeElement === textField) canvas.focus({ preventScroll: true });
  };
  textField.addEventListener('input', () => {
    const t = textField.value;
    textField.value = '';
    if (t) engine.onTextInput(t);
  }, { signal });

  // ---- keyboard ----
  let pendingPaste: ReturnType<typeof sdlKeyOf> | null = null;
  const deliverPaste = () => {
    const k = pendingPaste;
    pendingPaste = null;
    if (k && !signal.aborted) engine.onKeyPress(k.key, k.scan, k.repeat, k.shift, k.ctrl, k.alt);
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.isComposing) return;
    if (PREVENT.has(e.code) || ((e.ctrlKey || e.metaKey) && PREVENT_CTRL.has(e.code)) || e.key === 'Escape') e.preventDefault();
    if (e.code === 'F11' || e.code === 'F12') return; // full screen and the developer tools stay the browser's
    const k = sdlKeyOf(e);
    if (k.scan === SDL_SCANCODE_LGUI || k.scan === SDL_SCANCODE_RGUI) return;
    if (k.ctrl && e.code === 'KeyV' && engine.IsTextInput()) {
      // Ctrl+V into a textbox: the browser's paste event brings the clipboard text first (see below)
      pendingPaste = k;
      setTimeout(deliverPaste, 100);
      return;
    }
    engine.onKeyPress(k.key, k.scan, k.repeat, k.shift, k.ctrl, k.alt);
    const text = textInputOf(e);
    if (text && e.target !== textField) engine.onTextInput(text);
    if (text && engine.IsTextInput()) e.preventDefault();
  };
  const onKeyUp = (e: KeyboardEvent) => {
    const k = sdlKeyOf(e);
    engine.onKeyRelease(k.key, k.scan, false, k.shift, k.ctrl, k.alt);
  };
  window.addEventListener('keydown', onKeyDown, { signal });
  window.addEventListener('keyup', onKeyUp, { signal });
  window.addEventListener('paste', (e) => {
    const t = e.clipboardData?.getData('text/plain');
    if (t !== undefined) SetClipboardText(t);
    e.preventDefault();
    deliverPaste();
  }, { signal });
  // the window losing focus: SDL sends key-ups for held modifiers
  window.addEventListener('blur', () => {
    engine.onKeyRelease(0, 0, false, false, false, false);
  }, { signal });

  // ---- mouse, pen and touch ----
  let lastX = 0, lastY = 0;
  const pos = (e: PointerEvent | WheelEvent) => {
    const r = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - r.left) / r.width * WINDOWW);
    const y = Math.floor((e.clientY - r.top) / r.height * WINDOWH);
    lastX = x;
    lastY = y;
    return { x, y };
  };
  void screen.toPixel; // pointer positions outside the canvas are kept (the original's mouse capture while dragging)
  canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    canvas.focus({ preventScroll: true });
    try { canvas.setPointerCapture(e.pointerId); } catch { /* not capturable */ }
    const p = pos(e);
    engine.onMouseMove(p.x, p.y);
    const b = sdlButton(e.button);
    if (b) engine.onMouseDown(p.x, p.y, b);
  }, { signal });
  canvas.addEventListener('pointermove', (e) => {
    const p = pos(e);
    engine.onMouseMove(p.x, p.y);
  }, { signal });
  const up = (e: PointerEvent) => {
    const p = pos(e);
    const b = sdlButton(e.button);
    if (b) engine.onMouseUp(p.x, p.y, b);
  };
  canvas.addEventListener('pointerup', up, { signal });
  canvas.addEventListener('pointercancel', up, { signal });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault(), { signal });
  canvas.addEventListener('auxclick', (e) => e.preventDefault(), { signal });
  let wheelAcc = 0;
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const p = pos(e);
    // SDL reports whole notches; pixel-precise wheels (touchpads) add up to one notch per 50 pixels
    let d = 0;
    if (e.deltaMode === 1 || e.deltaMode === 2) d = -Math.sign(e.deltaY);
    else {
      wheelAcc += e.deltaY;
      if (Math.abs(wheelAcc) >= 50) {
        d = -Math.trunc(wheelAcc / 50);
        wheelAcc -= -d * 50;
      }
    }
    if (d) engine.onMouseWheel(p.x, p.y, d);
  }, { signal, passive: false });
  // a save or stamp dropped onto the window (SDL_DROPFILE)
  canvas.addEventListener('dragover', (e) => e.preventDefault(), { signal });
  canvas.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    void file.arrayBuffer().then((buf) => {
      if (!signal.aborted) gameController.GetView().DropFile(file.name, new Uint8Array(buf));
    });
  }, { signal });
  engine.initialMouse(lastX, lastY);
  engine.TouchUI = matchMedia('(pointer: coarse)').matches;
  canvas.focus({ preventScroll: true });

  // ---- main loop: EngineProcess on every animation frame; its schedules keep the 60 fps caps ----
  ctx.frame((time) => {
    if (!engine.Running()) return;
    try {
      const drawn = engine.Process(time * 1e6);
      if (drawn) {
        toCanvasPixels(g.Data(), pixels, WINDOWW * WINDOWH);
        screen.ctx.putImageData(image, 0, 0);
      }
    } catch (e) {
      console.error('powdertoy:', e);
    }
  }, signal);

  // the prefs are written as the original writes them on exit
  const savePrefs = () => gameController.Destroy();
  window.addEventListener('pagehide', savePrefs, { signal });

  return {
    stop: async () => {
      if (!stopped.signal.aborted) {
        try { gameController.Destroy(); } catch { /* already gone */ }
        stopped.abort();
      }
      Engine.Destroy();
      // the last writes (the prefs, as the original writes them on exit) go out before the connection closes;
      // no window can show an error any more
      client.onStorageError = null;
      await client.Flush().catch(() => {});
    },
  };
};
