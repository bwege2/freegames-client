// node test/try-session.ts golden/sessions/NAME.json...: runs golden sessions and shows the differences
import { readFileSync } from 'node:fs';
import { runSession, splitPrompts, type Golden } from './session.ts';

for (const file of process.argv.slice(2)) {
  const c = JSON.parse(readFileSync(file, 'utf8')) as Golden;
  const r = runSession(c);
  const want = splitPrompts(c.stdout);
  const got = splitPrompts(r.stdout);
  const wl = want.text.split('\n');
  const gl = got.text.split('\n');
  let shown = 0;
  for (let i = 0; i < Math.max(wl.length, gl.length) && shown < 12; i++) {
    if (wl[i] !== gl[i]) {
      console.log(`  line ${i + 1}:\n    want ${JSON.stringify(wl[i])}\n    got  ${JSON.stringify(gl[i])}`);
      shown++;
    }
  }
  let ok = shown === 0;
  if (want.prompts.join('|') !== got.prompts.join('|')) {
    ok = false;
    console.log(`  prompts differ:\n    want ${want.prompts.join('|')}\n    got  ${got.prompts.join('|')}`);
  }
  if (c.stderr !== r.stderr) {
    ok = false;
    console.log('  stderr differs:', JSON.stringify(c.stderr), JSON.stringify(r.stderr));
  }
  if (c.status !== r.status) {
    ok = false;
    console.log('  status differs:', c.status, r.status);
  }
  for (const k of new Set([...Object.keys(c.written), ...Object.keys(r.written)])) {
    if (c.written[k] !== r.written[k]) {
      ok = false;
      console.log(`  file ${k} differs:\n    want ${JSON.stringify(c.written[k])}\n    got  ${JSON.stringify(r.written[k])}`);
    }
  }
  console.log(`${c.name}: ${ok ? 'matches' : 'DIFFERENT'}`);
}
