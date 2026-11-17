// node games/enigma/test/tools/runlua.ts file.lua: runs a Lua file on the port's interpreter (for comparing
// with re/enigma/oracle/lua51-oracle, see re/enigma/oracle/lua-golden.sh)
import { readFileSync } from 'node:fs';
import { newState, toBytes } from '../../src/lua/lib.ts';
import { LuaError } from '../../src/lua/interp.ts';

const L = newState();
L.write = (s) => { process.stdout.write(Buffer.from(s, 'latin1')); };
try {
  L.doString(toBytes(readFileSync(process.argv[2], 'utf8')), '@' + process.argv[2].replace(/^.*\//, ''));
} catch (e) {
  if (e instanceof LuaError) { console.log('ERROR: ' + String(e.value)); process.exit(1); }
  throw e;
}
