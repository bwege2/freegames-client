// The FreeType of the port (src/rt/freetype.ts) against the original's: every character U+0020..U+024F of the
// original's font (Graphics.ocg/Endeavour.ttf) at 16 sizes, regular and bold (the FT_Set_Transform of
// CStdFont::AddRenderedChar), rendered with FT_LOAD_RENDER | FT_LOAD_NO_HINTING, as re/openclonk/oracle/ft.sh has the
// FreeType of the original's build render them: the same bitmap box, advance and coverage bytes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { re } from './oracle.ts';
import * as FT from '../src/rt/freetype.ts';
import { FT_FUNCTIONS } from '../src/rt/freetype.ts';
import { Ptr, P } from '../src/rt/ptr.ts';

const font = path.join(re, 'orig/openclonk/planet/Graphics.ocg/Endeavour.ttf');
const glyphs = path.join(re, 'work/ft/glyphs.txt');

test('ft.txt lists the functions freetype.ts provides, each as ft$<name>', () => {
  const listed = fs.readFileSync(path.join(re, 'tools/ft.txt'), 'utf8').split('\n').filter((l) => l && !l.startsWith('#'));
  assert.deepEqual(listed, [...FT_FUNCTIONS]);
  for (const n of FT_FUNCTIONS) assert.equal(typeof (FT as Record<string, unknown>)['ft$' + n], 'function', `ft$${n}`);
});

test('the original\'s font renders as the original\'s FreeType renders it', {
  skip: !fs.existsSync(font) ? 'no reference source (re/openclonk/fetch.sh)' : !fs.existsSync(glyphs) ? 'no FreeType oracle (re/openclonk/oracle/ft.sh)' : false,
}, () => {
  const data = new Uint8Array(fs.readFileSync(font));
  const lib: { v: unknown } = { v: null };
  assert.equal(FT.ft$FT_Init_FreeType(P(lib, 'v')), 0);
  const face: { v: any } = { v: null };
  assert.equal(FT.ft$FT_New_Memory_Face(lib.v, new Ptr(data, 0), BigInt(data.length), 0, P(face, 'v')), 0);
  const f = face.v;
  const lines = fs.readFileSync(glyphs, 'utf8').trim().split('\n');
  const [, upem, asc, desc] = lines[0].split(' ').map(Number);
  assert.deepEqual([f.units_per_EM, f.ascender, f.descender], [upem, asc, desc], 'face metrics');
  let size = 0, weight = 0, same = 0;
  const differ: string[] = [];
  for (const line of lines.slice(1)) {
    const [s, w, c, ...rest] = line.split(' ');
    if (+s !== size || +w !== weight) {
      size = +s; weight = +w;
      FT.ft$FT_Set_Pixel_Sizes(f, size, size);
      const bold = weight - 400;
      FT.ft$FT_Set_Transform(f, bold ? { xx: (1 << 16) + ((bold << 16) / 400 | 0), xy: 0, yx: 0, yy: 1 << 16 } : null, null);
    }
    const err = FT.ft$FT_Load_Char(f, BigInt(c), 4 | 2);
    if (rest[0] === 'error') { if (err === 0) differ.push(`${s} ${w} ${c}: loads, the original fails`); continue; }
    const g = f.glyph;
    const pixels = g.bitmap.buffer ? Buffer.from((g.bitmap.buffer.a as Uint8Array).subarray(0, g.bitmap.width * g.bitmap.rows)).toString('hex') : '';
    const mine = [g.bitmap_left, g.bitmap_top, g.bitmap.width, g.bitmap.rows, Number(g.advance.x), Number(g.advance.y)].join(' ') + ' ' + pixels;
    if (mine === rest.join(' ')) same++;
    else if (differ.length < 10) differ.push(`size ${s} weight ${w} U+${(+c).toString(16)}:\n  original ${rest.join(' ')}\n  port     ${mine}`);
    else differ.push('');
  }
  assert.deepEqual(differ, [], `${same} of ${lines.length - 1} glyphs equal`);
  assert.ok(same > 17000);
});
