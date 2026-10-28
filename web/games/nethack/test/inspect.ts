// Development: evaluates expressions over the program's state after $init (node games/nethack/test/inspect.ts 'G.mons[352]')
import { initGlobals } from '../src/init.ts';
import { G } from '../src/globals.ts';
import { jstr } from '../src/rt/cstring.ts';
import { setPlatform } from '../src/rt/platform.ts';

setPlatform({ getKey: async () => -1, delay: async () => {}, time: () => 0, login: () => 'x', seed: () => 1, fileChanged() {}, stderr() {} });
initGlobals();
for (const e of process.argv.slice(2)) {
  const v = new Function('G', 'jstr', `return (${e});`)(G, jstr);
  console.log(e, '=', v);
}
