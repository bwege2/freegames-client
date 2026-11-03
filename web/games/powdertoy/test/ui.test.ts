// The game's window without a browser: the key mapping, the storage names, the brush size steps, the GUI
// widgets, and the whole GameView/GameController/GameModel driven by synthetic input on a Graphics buffer.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadFont } from '../src/graphics/font.ts';
import { Graphics } from '../src/graphics/raster.ts';
import { WINDOWW, WINDOWH, XRES, YRES } from '../src/sim/config.ts';
import { PT_DUST, PT_NONE, PT_WATR } from '../src/sim/numbers.ts';
import { Engine, FrameSchedule } from '../src/gui/interface/Engine.ts';
import {
  sdlKeyOf, textInputOf, SDLK_LEFT, SDLK_RETURN, SDLK_TAB, SDL_SCANCODE_A, SDL_SCANCODE_SPACE, SDL_SCANCODE_Z,
  SDL_SCANCODE_LEFTBRACKET, SDL_SCANCODE_RIGHTBRACKET, SDL_SCANCODE_C, SetTimeSource,
} from '../src/gui/interface/Keys.ts';
import { TextWrapper } from '../src/gui/interface/TextWrapper.ts';
import { Textbox } from '../src/gui/interface/Label.ts';
import { Window } from '../src/gui/interface/Engine.ts';
import { Client, SaveFileName, SaveDisplayName, StampFileName, IsValidStorageName, type StorageLike } from '../src/game/Client.ts';
import { fmtG, fmtFixed, CleanString, RenderTemperature } from '../src/gui/Format.ts';
import { GameController } from '../src/gui/game/GameController.ts';

const fontPath = join(import.meta.dirname, '..', 'assets', 'font.bin');
loadFont(new Uint8Array(readFileSync(fontPath)));

let now = 0;
SetTimeSource(() => now);

/** an in-memory ctx.storage */
class MemStorage implements StorageLike {
  files = new Map<string, Uint8Array>();
  async get(name: string) { return this.files.get(name) ?? null; }
  async put(name: string, data: Uint8Array) { this.files.set(name, data); return {}; }
  async delete(name: string) { return this.files.delete(name); }
  async list(prefix = '') {
    return [...this.files].filter(([n]) => n.startsWith(prefix)).map(([name, d]) => ({ name, size: d.length, modified: 0 }));
  }
}

function key(code: string, k: string, mods: Partial<{ shift: boolean; ctrl: boolean; alt: boolean }> = {}) {
  return sdlKeyOf({ code, key: k, repeat: false, shiftKey: !!mods.shift, ctrlKey: !!mods.ctrl, altKey: !!mods.alt, metaKey: false });
}

test('keys map to SDL keycodes and scancodes', () => {
  assert.deepEqual([key('KeyA', 'a').key, key('KeyA', 'a').scan], [97, SDL_SCANCODE_A]);
  assert.equal(key('KeyA', 'A', { shift: true }).key, 97); // SDL keycodes are unshifted
  assert.equal(key('KeyQ', 'a').key, 97); // AZERTY: the layout's letter
  assert.equal(key('Digit6', '^', { shift: true }).key, 0x36);
  assert.equal(key('Space', ' ').scan, SDL_SCANCODE_SPACE);
  assert.equal(key('ArrowLeft', 'ArrowLeft').key, SDLK_LEFT);
  assert.equal(key('Enter', 'Enter').key, SDLK_RETURN);
  assert.equal(key('Tab', 'Tab').key, SDLK_TAB);
  assert.equal(key('BracketLeft', '[').scan, SDL_SCANCODE_LEFTBRACKET);
  assert.equal(key('KeyZ', 'z', { ctrl: true }).ctrl, true);
  assert.equal(textInputOf({ key: 'a', ctrlKey: false, metaKey: false, altKey: false }), 'a');
  assert.equal(textInputOf({ key: 'a', ctrlKey: true, metaKey: false, altKey: false }), '');
  assert.equal(textInputOf({ key: 'Shift', ctrlKey: false, metaKey: false, altKey: false }), '');
});

test('storage names of saves and stamps', () => {
  assert.equal(SaveFileName('my save'), 'save-my_save.cps');
  assert.equal(SaveDisplayName('save-my_save.cps'), 'my_save');
  assert.equal(StampFileName('5f1e2a3b00'), 'stamp-5f1e2a3b00.stm');
  assert.equal(SaveDisplayName('stamp-5f1e2a3b00.stm'), '5f1e2a3b00');
  assert.equal(SaveFileName(''), null);
  assert.equal(SaveFileName('x'.repeat(60)), null);
  assert.ok(IsValidStorageName('powder.pref'));
  assert.ok(!IsValidStorageName('a/b'));
});

test('number formatting as the original streams it', () => {
  assert.equal(fmtG(22), '22');
  assert.equal(fmtG(0.1), '0.1');
  assert.equal(fmtG(1234567), '1.23457e+06');
  assert.equal(fmtFixed(1.005, 2), (1.005).toFixed(2));
  assert.equal(RenderTemperature(Math.fround(295.15), 1, 2), '22.00C');
  assert.equal(RenderTemperature(Math.fround(295.15), 0, 2), '295.15K');
  assert.equal(CleanString('\bgab\x0F\x01\x02\x03c\nd', false, true, true), 'abc d');
});

test('frame schedule: a 120 Hz display still draws 60 frames a second', () => {
  const s = new FrameSchedule();
  let frames = 0;
  for (let t = 0; t < 1e9; t += 1e9 / 120) {
    if (s.HasElapsed(t)) {
      frames++;
      s.SetNow(t);
    }
    s.Arm(60);
  }
  assert.ok(frames >= 59 && frames <= 61, `frames ${frames}`);
});

test('text wrapping', () => {
  const tw = new TextWrapper();
  const lines = tw.Update('hello world hello world', true, 40);
  assert.ok(lines >= 2);
  assert.equal(tw.WrappedText().replace(/\n/g, ' ').replace(/ +/g, ' '), 'hello world hello world');
  assert.equal(tw.Update('a\nb', false, 1000), 2);
});

test('the game window: tools, brush, drawing, pausing, stamps, undo', async () => {
  const storage = new MemStorage();
  const client = Client.Create(storage);
  await client.Init();
  const g = new Graphics();
  const engine = Engine.Create(g);
  engine.Begin();
  const gc = new GameController();
  engine.ShowWindow(gc.GetView());
  const model = gc.GetModel();
  const sim = model.GetSimulation();
  const frame = () => {
    now += 17;
    engine.Process(now * 1e6);
  };
  for (let i = 0; i < 3; i++) frame();
  assert.equal(g.Size().X, WINDOWW);
  assert.equal(g.Size().Y, WINDOWH);

  // default tools: DUST left, NONE right, SAMPLE middle
  assert.equal(gc.GetActiveTool(0).ToolID, PT_DUST);
  assert.equal(gc.GetActiveTool(1).ToolID, PT_NONE);
  assert.equal(gc.GetActiveTool(2).Identifier, 'DEFAULT_UI_SAMPLE');
  gc.SetActiveTool(0, 'DEFAULT_PT_WATR');
  assert.equal(gc.GetActiveTool(0).ToolID, PT_WATR);

  // brush size: wheel and [ ] (logarithmic steps of radius/5, at least 1)
  const brush = () => model.GetBrush().GetRadius().X;
  assert.equal(brush(), 4);
  engine.onMouseMove(100, 100);
  engine.onMouseWheel(100, 100, 1);
  assert.equal(brush(), 5);
  const press = (k: ReturnType<typeof key>) => {
    engine.onKeyPress(k.key, k.scan, false, k.shift, k.ctrl, k.alt);
    engine.onKeyRelease(k.key, k.scan, false, false, false, false);
    frame();
  };
  for (let i = 0; i < 5; i++) press(key('BracketRight', ']'));
  assert.equal(brush(), 10);
  press(key('BracketLeft', '['));
  assert.equal(brush(), 8);
  void SDL_SCANCODE_RIGHTBRACKET;

  // pause with space, draw water, step one frame with F
  press(key('Space', ' '));
  assert.equal(model.GetPaused(), true);
  frame();
  engine.onMouseMove(200, 200);
  engine.onMouseDown(200, 200, 1);
  frame();
  engine.onMouseUp(200, 200, 1);
  frame();
  assert.ok(sim.parts.active > 0 || sim.elementCount[PT_WATR] > 0 || sim.pmap[200][200] !== 0, 'water was drawn');
  const pmapAt = sim.pmap[200][200];
  assert.ok(pmapAt !== 0);

  // undo removes it
  press(key('KeyZ', 'z', { ctrl: true }));
  assert.equal(sim.pmap[200][200], 0);
  press(key('KeyY', 'y', { ctrl: true }));
  assert.notEqual(sim.pmap[200][200], 0);

  // a stamp: S, drag, release
  press(key('KeyS', 's'));
  engine.onMouseMove(190, 190);
  engine.onMouseDown(190, 190, 1);
  engine.onMouseMove(210, 210);
  frame();
  engine.onMouseUp(210, 210, 1);
  frame();
  assert.equal(client.GetStamps().length, 1);
  await new Promise((r) => setTimeout(r, 10));
  assert.ok([...storage.files.keys()].some((n) => n.startsWith('stamp-') && n.endsWith('.stm')));

  // L places the last stamp; a click puts it into the simulation
  press(key('KeyL', 'l'));
  frame();
  assert.equal(gc.GetView().GetPlacingSave(), true);
  engine.onMouseMove(400, 100);
  engine.onMouseDown(400, 100, 1);
  engine.onMouseUp(400, 100, 1);
  frame();
  assert.equal(gc.GetView().GetPlacingSave(), false);

  // render presets with the digit keys
  press(key('Digit6', '6'));
  assert.equal(model.GetInfoTip(), 'Heat Display');
  press(key('Digit0', '0'));

  // Ctrl+C selects an area to copy; Escape asks to quit
  press(key('KeyC', 'c', { ctrl: true }));
  void SDL_SCANCODE_C;
  void SDL_SCANCODE_Z;
  void XRES;
  void YRES;
  let quit = false;
  engine.onQuit = () => { quit = true; };
  press(key('Escape', 'Escape'));
  assert.notEqual(engine.GetWindow(), gc.GetView()); // the confirm prompt
  press(key('Enter', 'Enter'));
  assert.equal(quit, true);
  gc.Destroy();
  await new Promise((r) => setTimeout(r, 10));
  assert.ok(storage.files.has('powder.pref'));
});

test('a textbox takes typed text and edits it', () => {
  const g = new Graphics();
  const engine = Engine.Create(g);
  const w = new Window({ X: 10, Y: 10 }, { X: 200, Y: 50 });
  const tb = new Textbox({ X: 4, Y: 4 }, { X: 150, Y: 16 }, 'ab');
  w.AddComponent(tb);
  engine.ShowWindow(w);
  engine.Tick();
  w.FocusComponent(tb);
  engine.Tick();
  engine.onTextInput('c');
  assert.equal(tb.GetText(), 'abc');
  const bs = sdlKeyOf({ code: 'Backspace', key: 'Backspace', repeat: false, shiftKey: false, ctrlKey: false, altKey: false, metaKey: false });
  engine.onKeyPress(bs.key, bs.scan, false, false, false, false);
  assert.equal(tb.GetText(), 'ab');
  engine.Draw();
});
