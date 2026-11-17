// The port's Lua 5.1 interpreter against Enigma's Lua 5.1.4: every test/lua/*.lua script prints the same
// bytes as the original's interpreter did (test/lua/*.out, written by re/enigma/oracle/lua-golden.sh):
// table iteration order, number formatting, patterns, sort order, metatables.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { newState, toBytes } from '../src/lua/lib.ts';
import { LuaError } from '../src/lua/interp.ts';

const dir = join(import.meta.dirname, 'lua');
for (const f of readdirSync(dir).filter((x) => x.endsWith('.lua'))) {
  test(`Lua 5.1.4 output: ${f}`, () => {
    const L = newState();
    let out = '';
    L.write = (s) => { out += s; };
    try {
      L.doString(toBytes(readFileSync(join(dir, f), 'utf8')), '@' + f);
    } catch (e) {
      if (!(e instanceof LuaError)) throw e;
      out += 'ERROR: ' + String(e.value) + '\n';
    }
    const want = readFileSync(join(dir, f.replace(/\.lua$/, '.out')), 'latin1');
    assert.equal(out, want);
  });
}
