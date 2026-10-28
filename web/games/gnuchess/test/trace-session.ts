// node test/trace-session.ts golden/sessions/NAME.json: runs a golden session and prints the port's output as it comes
import { readFileSync, writeSync } from 'node:fs';
import { GnuChess } from '../src/main.ts';
import { InProcessEngine } from '../src/engine-link.ts';
import { MemFiles, PKGDATADIR } from '../src/host.ts';
import { bytes } from '../src/libc.ts';
import { join } from 'node:path';
import { virtualClock, type Golden } from './session.ts';

const c = JSON.parse(readFileSync(process.argv[2], 'utf8')) as Golden;
const files = new MemFiles();
for (const [k, v] of Object.entries(c.files)) files.map.set(k, bytes(v));
files.map.set(PKGDATADIR + '/smallbook.bin', new Uint8Array(readFileSync(join(import.meta.dirname, '..', 'assets', 'smallbook.bin'))));
const clock = virtualClock(c.time);
let wants = false;
let ended = false;
const engine = new InProcessEngine(files, clock, (s) => writeSync(2, '[engine stderr] ' + s));
const origWrite = engine.write.bind(engine);
engine.write = (d) => {
  writeSync(2, '[a2e] ' + JSON.stringify(d) + '\n');
  origWrite(d);
};
const proc = new GnuChess({
  stdout: (s) => writeSync(1, s),
  stderr: (s) => writeSync(2, '[stderr] ' + s),
  readLine: () => {
    wants = true;
  },
  exit: (code) => {
    console.log(`[exit ${code}]`);
    ended = true;
  },
  files,
  clock,
  getenv: () => undefined,
  engine,
});
proc.start(c.args);
let next = 0;
while (!ended && wants) {
  wants = false;
  const line = next < c.input.length ? c.input[next++] : null;
  writeSync(2, `[input] ${line}\n`);
  proc.input(line === null ? null : line + '\n');
}
if (!ended) console.log('[the program neither ended nor waits for input]');
