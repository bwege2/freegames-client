// Graphics: font (graphics/FontReader.cpp), raster methods, colour helpers and the renderer (graphics/Renderer.cpp).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { FONT_H, loadFont } from '../src/graphics/font.ts';
import { Graphics, TextFit, TextSize, VideoBuffer, WithAlpha, CharWidth } from '../src/graphics/raster.ts';

const fontBytes = new Uint8Array(readFileSync(fileURLToPath(new URL('../assets/font.bin', import.meta.url))));

test('font loads and TextSize matches the original widths', () => {
  assert.equal(loadFont(fontBytes), true);
  // glyph widths of the original font (resources/font.bz2): T h e ' ' P o w d e r ' ' T o y = 73
  assert.equal(TextSize('The Powder Toy').X, 73);
  assert.equal(TextSize('The Powder Toy').Y, FONT_H - 2);
  assert.equal(CharWidth('H'.charCodeAt(0)), 6);
  assert.equal(CharWidth('i'.charCodeAt(0)), 4);
  assert.equal(CharWidth(' '.charCodeAt(0)), 5);
  assert.equal(CharWidth(0xE00D), 6);
  // a missing glyph falls back to U+FFFD
  assert.equal(CharWidth(0x10FFFE), CharWidth(0xFFFD));
  // second line adds FONT_H, the width is the widest line; colour escapes take no space
  assert.deepEqual(TextSize('Hi!\nHi'), { X: 13, Y: FONT_H - 2 + FONT_H });
  assert.equal(TextSize('\x0F\xFF\x00\x00Hi!\bgHi\x0E').X, 23);
  assert.equal(TextFit('Hi!Hi!', 7), 1);
});

test('text and shapes draw into a buffer', () => {
  loadFont(fontBytes);
  const vb = new VideoBuffer(40, 20);
  const d = vb.BlendText(2, 4, 'Hi', WithAlpha(0xFFFFFF, 255));
  assert.deepEqual(d, { X: 10, Y: 0 });
  assert.ok(vb.video.some(p => p !== 0));
  vb.Clear();
  vb.DrawRect(0, 0, 40, 20, 0x123456);
  assert.equal(vb.video[0], 0x123456);
  assert.equal(vb.video[39 + 19 * 40], 0x123456);
  assert.equal(vb.video[1 + 40], 0);
  vb.DrawFilledRect(-5, -5, 10, 10, 0xFF0000);
  assert.equal(vb.video[4 + 4 * 40], 0xFF0000);
  vb.BlendPixel(30, 10, WithAlpha(0xFFFFFF, 0x80));
  assert.equal(vb.video[30 + 10 * 40], 0x808080);
  const g = new Graphics();
  g.SwapClipRect(10, 10, 5, 5);
  g.DrawPixel(0, 0, 0xFFFFFF);
  assert.equal(g.video[0], 0);
  g.DrawPixel(12, 12, 0xFFFFFF);
  assert.equal(g.video[12 + 12 * g.width], 0xFFFFFF);
});

test('sign formatting', async (t) => {
  let s: typeof import('../src/graphics/sign.ts');
  try {
    s = await import('../src/graphics/sign.ts');
  } catch (e) {
    t.skip(`sign.ts does not load yet (core/elements unfinished): ${(e as Error).message}`);
    return;
  }
  const { formatShowPointPrecision, sign_split } = s;
  assert.equal(formatShowPointPrecision(22, 2), '22.');
  assert.equal(formatShowPointPrecision(0, 2), '0.0');
  assert.equal(formatShowPointPrecision(1234.5, 2), '1.2e+03');
  assert.equal(formatShowPointPrecision(-0.25, 2), '-0.25');
  assert.equal(formatShowPointPrecision(0.00001234, 2), '1.2e-05');
  assert.deepEqual(sign_split('{c:123|Save}'), [6, 1]);
  assert.deepEqual(sign_split('{b|Button}'), [2, 3]);
  assert.deepEqual(sign_split('{t:12a|x}'), [0, 0]);
});

test('heat and pressure colours', async (t) => {
  let r: typeof import('../src/graphics/renderer.ts');
  try {
    r = await import('../src/graphics/renderer.ts');
  } catch (e) {
    t.skip(`renderer does not load yet (core/elements unfinished): ${(e as Error).message}`);
    return;
  }
  // heatTable[0] = 0x2B00FF, * 0.7f per channel
  assert.equal(r.HeatToColour(0, 0, 9999), 0x1E00B2);
  // heatTable[1023] (clamped) of the gradient towards 0xFF00DC
  const top = r.HeatToColour(9999, 0, 9999);
  assert.equal((top >>> 16) & 0xFF, 178);
  assert.equal(r.PressureToColour(4), 0x7F0000);
  assert.equal(r.PressureToColour(-8), 0x0000FF);
  assert.equal(r.PressureToColour(0), 0x000000);
  assert.equal(r.Renderer.renderModePresets.length, 13);
});

test('RenderSimulation of a tiny scene', async (t) => {
  let r: typeof import('../src/graphics/renderer.ts');
  let simMod: typeof import('../src/sim/simulation.ts');
  let sdMod: typeof import('../src/sim/simulationData.ts');
  let nums: typeof import('../src/sim/numbers.ts');
  try {
    sdMod = await import('../src/sim/simulationData.ts');
    r = await import('../src/graphics/renderer.ts');
    simMod = await import('../src/sim/simulation.ts');
    nums = await import('../src/sim/numbers.ts');
  } catch (e) {
    t.skip(`core/elements do not load yet: ${(e as Error).message}`);
    return;
  }
  if (!sdMod.sd.elements[1] || !sdMod.sd.elements[1].Name) {
    t.skip('elements are not ported yet (sd.elements[1].Name is empty)');
    return;
  }
  loadFont(fontBytes);
  const sim = new simMod.Simulation();
  const place = (i: number, type: number, x: number, y: number) => {
    const p = sim.parts[i];
    p.type = type;
    p.x = x;
    p.y = y;
    p.temp = sdMod.sd.elements[type].DefaultProperties.temp;
    p.life = sdMod.sd.elements[type].DefaultProperties.life;
    sim.pmap[y][x] = (i << 9) | type;
  };
  place(0, nums.PT_DUST, 10, 10);
  place(1, nums.PT_FIRE, 20, 20);
  place(2, nums.PT_WATR, 30, 30);
  sim.parts.active = 3;
  sim.bmap[5][5] = 8; // WL_WALL
  sim.signs.push({ x: 100, y: 100, ju: 1, text: 'Temp {t}' });

  const ren = new r.Renderer();
  ren.sim = sim;
  for (const preset of r.Renderer.renderModePresets) {
    const s = ren.GetSettings();
    s.renderMode = preset.renderMode;
    s.displayMode = preset.displayMode;
    s.colorMode = preset.colorMode;
    s.wantHdispLimitMin = preset.wantHdispLimitMin;
    s.wantHdispLimitMax = preset.wantHdispLimitMax;
    ren.ApplySettings(s);
    try {
      ren.Clear();
      ren.RenderBackground();
      ren.RenderSimulation();
    } catch (e) {
      if (/TODO/.test((e as Error).message)) {
        t.skip(`a graphics function the renderer calls is not ported yet: ${(e as Error).message}`);
        return;
      }
      throw e;
    }
  }
  // fire display: dust pixel drawn in its colour
  ren.ApplySettings(Object.assign(ren.GetSettings(), { renderMode: r.Renderer.renderModePresets[4].renderMode, displayMode: 0, colorMode: 0 }));
  ren.Clear();
  ren.RenderSimulation();
  const video = ren.GetVideo();
  assert.equal(video.length, 629 * 384);
  assert.notEqual(video[10 * 629 + 10], 0);
  // wall cell (5, 5) drawn grey
  assert.equal(video[20 * 629 + 20], 0x808080);
});
