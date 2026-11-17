// Development helper: node games/opencity/test/compare.ts NAME runs re/opencity/oracle/scripts/NAME.txt
// on the port and prints the first line that differs from test/oracle/NAME.out.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { runScript } from './script.ts';

const root = join(import.meta.dirname, '..', '..', '..', '..');
for (const name of process.argv.slice(2)) {
  const script = readFileSync(join(root, 're', 'opencity', 'oracle', 'scripts', `${name}.txt`), 'utf8');
  const want = readFileSync(join(import.meta.dirname, 'oracle', `${name}.out`), 'utf8');
  const got = runScript(script);
  if (got === want) { console.log(name, 'same', want.split('\n').length, 'lines'); continue; }
  const a = got.split('\n'), b = want.split('\n');
  for (let i = 0; i < Math.max(a.length, b.length); i++)
    if (a[i] !== b[i]) {
      console.log(name, 'differs at line', i + 1);
      console.log(' port:', a[i]?.slice(0, 200));
      console.log(' orig:', b[i]?.slice(0, 200));
      break;
    }
}
