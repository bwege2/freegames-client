// src/sdlttf.ts against SDL2_ttf 2.24 itself: TTF_SizeUTF8 of DejaVuSans-Bold.ttf and NotoSans-Regular.ttf for test
// strings at many sizes, English and the translations' texts (golden/fontmetrics-check.txt.gz and
// fontmetrics-check-noto.txt.gz, written by re/hyperrogue/tools/gen-fontmetrics.sh with the oracle's libraries).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { TTF_OpenFont, TTF_SizeUTF8, fontmetrics_load_all, type TTF_Font } from '../src/sdlttf.ts';

for (const [file, check] of [['DejaVuSans-Bold.ttf', 'fontmetrics-check.txt.gz'], ['NotoSans-Regular.ttf', 'fontmetrics-check-noto.txt.gz']]) {
  test(`TTF_SizeUTF8 matches SDL2_ttf: ${file}`, async () => {
    await fontmetrics_load_all();
    const text = gunzipSync(readFileSync(new URL(`./golden/${check}`, import.meta.url))).toString('utf8');
    const fonts = new Map<number, TTF_Font>();
    const bad: string[] = [];
    let n = 0;
    for (const line of text.split('\n')) {
      if (line === '' || line[0] === '#') continue;
      const m = /^(\d+) (\d+) (\d+) (.*)$/.exec(line)!;
      const size = +m[1], w = +m[2], h = +m[3], str = m[4];
      if (!fonts.has(size)) fonts.set(size, TTF_OpenFont(file, size)!);
      const r = TTF_SizeUTF8(fonts.get(size)!, str);
      n++;
      if (r.w !== w || r.h !== h) bad.push(`size ${size} "${str}": ${r.w}x${r.h}, SDL_ttf ${w}x${h}`);
    }
    assert.ok(n > 1000);
    assert.deepEqual(bad.slice(0, 20), [], `${bad.length} of ${n} differ`);
  });
}
