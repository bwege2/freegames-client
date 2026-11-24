// Test helper: the translated script engine run as the original's standalone interpreter (c4script -e):
// src/script/C4ScriptStandalone.cpp's c4s_runstring, with Log() written into a string.
import { initGlobals } from '../src/aul/index.ts';
import { $ } from '../src/rt/registry.ts';
import { S } from '../src/rt/ptr.ts';
import { $io } from '../src/rt/libc.ts';

/** runs a script (its Main) and returns what it printed and the error count */
export function runScript(script: string): { out: string; errors: number } {
  initGlobals(true);
  let out = '';
  const old = { ...$io };
  $io.out = (s) => { out += s; };
  $io.err = (s) => { out += s; };
  try {
    const errors = $.c4s_runstring(S(script));
    return { out, errors };
  } finally {
    $io.out = old.out;
    $io.err = old.err;
  }
}
