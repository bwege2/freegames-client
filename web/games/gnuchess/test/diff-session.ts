// node test/diff-session.ts golden/sessions/NAME.json: writes the oracle's and the port's stdout (and stderr) to
// $TMPDIR/want.txt and got.txt, for diff
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { runSession, type Golden } from './session.ts';

const c = JSON.parse(readFileSync(process.argv[2], 'utf8')) as Golden;
const r = runSession(c);
const dir = process.env.TMPDIR ?? tmpdir();
writeFileSync(join(dir, 'want.txt'), c.stdout + '\n--- stderr\n' + c.stderr + `\n--- status ${c.status}\n` + JSON.stringify(c.written, null, 1));
writeFileSync(join(dir, 'got.txt'), r.stdout + '\n--- stderr\n' + r.stderr + `\n--- status ${r.status}\n` + JSON.stringify(r.written, null, 1));
console.log(join(dir, 'want.txt'), join(dir, 'got.txt'));
