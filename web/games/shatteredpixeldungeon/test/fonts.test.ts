// The fonts' metrics against libGDX's FreeType on the JVM: the port's FreeType (src/gdx/freetype) under the
// translated FreeTypeFontGenerator, BitmapFont, GlyphLayout and PixmapPacker must give the game the numbers
// gdx-freetype 1.14.0's natives give it (test/oracle/fonts.txt.gz, re/shatteredpixeldungeon/oracle/fontprobe.sh):
// each font's line height, cap height, ascent, descent, and every glyph's size, offsets, advance and place on
// the glyph page, for pixel_font.ttf and droid_sans.ttf at the sizes the game asks for on screens of every size,
// and the width and height of laid out texts.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { assetsDir, dirStore, goldenDir } from './harness.ts';
import { PROBES, probeFont } from './font-probe.ts';

const file = path.join(goldenDir, 'fonts.txt.gz');
const dir = assetsDir();
const skip = !dir || !fs.existsSync(path.join(dir, 'fonts/droid_sans.ttf')) ? 'no fonts (the game\'s assets/)' : !fs.existsSync(file) ? 'no fonts.txt.gz' : false;

test('font metrics as libGDX\'s FreeType gives them', { skip, timeout: 300000 }, async () => {
  const rt = await import('../src/jre/index.ts');
  rt.installHeadless({ internal: dirStore(dir!) });
  await import('../src/gen/index.ts');
  const theirs = zlib.gunzipSync(fs.readFileSync(file)).toString('utf8').split('\n');
  const mine: string[] = [];
  for (const [font, chars, sizes] of PROBES) probeFont(rt, font, chars, sizes, mine);
  mine.push('');
  const bad: string[] = [];
  let font = '';
  for (let i = 0; i < Math.max(mine.length, theirs.length); i++) {
    if (theirs[i]?.startsWith('font ')) font = theirs[i].split(' ').slice(1, 3).join(' ');
    if (mine[i] !== theirs[i] && bad.length < 12) bad.push(`${font}: line ${i + 1}\n  port:     ${mine[i]}\n  original: ${theirs[i]}`);
  }
  const n = mine.filter((l, i) => l !== theirs[i]).length;
  if (bad.length) assert.fail(`${n} of ${theirs.length} lines differ; the first:\n${bad.join('\n')}`);
});
