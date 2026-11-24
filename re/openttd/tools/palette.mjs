#!/usr/bin/env node
// The OpenTTD palette: the 256 DOS colours and the animated ranges.
// Source: src/table/palettes.h and src/gfx_type.h of the pinned 15.3.
import { readFileSync, writeFileSync } from 'node:fs';

const root = new URL('../orig/openttd-15.3/', import.meta.url).pathname;
const header = readFileSync(root + 'src/table/palettes.h', 'utf8');

const section = (text, start) => {
  const i = text.indexOf(start);
  if (i < 0) throw new Error(`missing ${start}`);
  let depth = 0, j = text.indexOf('{', i);
  const begin = j;
  for (; j < text.length; j++) {
    if (text[j] === '{') depth++;
    else if (text[j] === '}' && --depth === 0) return text.slice(begin, j + 1);
  }
  throw new Error('unbalanced braces');
};

const parseColours = (block) => {
  const out = [];
  for (const m of block.matchAll(/(?:Colour|M)\(([^)]*)\)/g)) {
    const parts = m[1].split(',').map((s) => Number(s.trim()));
    if (parts.some((n) => !Number.isInteger(n))) throw new Error(`bad colour ${m[0]}`);
    out.push(parts.length === 4 ? parts : [...parts, 255]);
  }
  return out;
};

const palette = parseColours(section(header, 'static const Palette _palette'));
if (palette.length !== 256) throw new Error(`palette has ${palette.length} entries`);
palette[0][3] = 0; // index 0 is transparent ("magic blue")

const extraBlock = section(header, 'static const ExtraPaletteValues _extra_palette_values');
// The seven child arrays of the struct, in declaration order.
const arrays = [];
{
  let depth = 0, begin = -1;
  for (let i = 0; i < extraBlock.length; i++) {
    const c = extraBlock[i];
    if (c === '{') {
      depth++;
      if (depth === 2) begin = i;
    } else if (c === '}') {
      if (depth === 2) arrays.push(extraBlock.slice(begin, i + 1));
      depth--;
    }
  }
}
if (arrays.length !== 7) throw new Error(`expected 7 animation arrays, got ${arrays.length}`);
const names = ['darkWater', 'darkWaterToyland', 'lighthouse', 'oilRefinery', 'fizzyDrink', 'glitterWater', 'glitterWaterToyland'];
const animation = {};
names.forEach((name, i) => { animation[name] = parseColours(arrays[i]).map(([r, g, b]) => [r, g, b]); });

const out = {
  source: 'openttd-15.3 src/table/palettes.h, src/gfx_type.h',
  animStart: 227,
  animSize: 28,
  palette,
  animation,
};
const target = process.argv[2] ?? new URL('../../../web/games/openttd/assets/palette.json', import.meta.url).pathname;
writeFileSync(target, JSON.stringify(out, null, 0) + '\n');
console.log(`palette: 256 colours, animation ${out.animStart}+${out.animSize}, wrote ${target}`);
