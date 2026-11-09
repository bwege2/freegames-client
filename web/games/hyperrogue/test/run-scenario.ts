// Runs one scenario through the port (trace.ts) in its own process, as the oracle does (one scenario = one process
// = at most one game: the game's globals are not reset between games). Prints a JSON object to stdout:
// {"out": <dump>} or {"notported": <message>, "partial": <the dump up to there>}; other errors propagate (non-zero
// exit).
// Usage: node run-scenario.ts <scenario.txt>
import { readFileSync } from 'node:fs';
import { runScenario } from './trace.ts';
import { NotPorted } from '../src/hyper.ts';
import { language_load_all } from '../src/language.ts';
import { fontmetrics_load_all } from '../src/sdlttf.ts';

const text = readFileSync(process.argv[2], 'utf8');
// the translations and the other fonts' metrics arrive asynchronously in the game (language.ts, sdlttf.ts): a
// scenario that switches the language has them all from the start
if (/^(lang |start .*-lang )/m.test(text)) { await language_load_all(); await fontmetrics_load_all(); }
let res: { out?: string; notported?: string; partial?: string };
try {
  res = { out: runScenario(text) };
} catch (e) {
  if (!(e instanceof NotPorted)) throw e;
  res = { notported: e.message, partial: (e as NotPorted & { partial?: string }).partial };
}
process.stdout.write(JSON.stringify(res));
