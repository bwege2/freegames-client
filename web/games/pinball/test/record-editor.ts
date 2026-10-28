// Records the original's lines for every construction set session into test/golden/editor-*.txt.gz
// (needs re/pinball/orig):   node games/pinball/test/record-editor.ts [name...]
import { mkdirSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';
import { editorLines, runOriginal } from './editor.ts';
import { SESSIONS } from './editor-sessions.ts';

const names = process.argv.slice(2);
const dir = join(import.meta.dirname, 'golden');
mkdirSync(dir, { recursive: true });
for (const s of SESSIONS) {
  if (names.length && !names.includes(s.name)) continue;
  const t0 = Date.now();
  const lines = editorLines(runOriginal(s));
  writeFileSync(join(dir, `editor-${s.name}.txt.gz`), gzipSync(lines.join('\n') + '\n', { level: 9 }));
  console.log(`${s.name}: ${lines.length} lines, ${Date.now() - t0} ms`);
}
