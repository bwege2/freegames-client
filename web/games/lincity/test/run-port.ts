// node run-port.ts <session script> <output dir> [home dir]: plays a session with the port, writes its
// dumps (<name>.bin, as the oracle does) and the files it left in the home directory (home/...); the
// optional home dir's .lincityrc and .lincity/* are there when the program starts.
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { installScript, loadOriginalFiles } from './harness.ts';
import { dumpState } from './dump.ts';
import { run } from '../src/lc/main.ts';
import { vfsList, vfsGet, vfsPut, HOME } from '../src/lc/stdio.ts';

const [script, out, home] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
loadOriginalFiles();
if (home) {
  if (existsSync(join(home, '.lincityrc'))) vfsPut(`${HOME}/.lincityrc`, readFileSync(join(home, '.lincityrc')));
  const scenes = join(home, '.lincity');
  if (existsSync(scenes)) for (const f of readdirSync(scenes)) vfsPut(`${HOME}/.lincity/${f}`, readFileSync(join(scenes, f)));
}
installScript(readFileSync(script, 'utf8'), (name) => writeFileSync(join(out, `${name}.bin`), dumpState()));
const code = run();
for (const dir of [HOME, `${HOME}/.lincity`]) {
  for (const f of vfsList(dir)) {
    const p = join(out, 'home', dir.slice(HOME.length), f);
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, vfsGet(`${dir}/${f}`)!);
  }
}
process.exitCode = code === 0 ? 0 : 1;
