// The engine (src/engine, Fruit 2.1 as GNU Chess 6.3.0 has it) against the original built natively
// (re/gnuchess/oracle): the same UCI lines give the same output. Goldens: test/golden/uci-*.json,
// written by re/gnuchess/oracle/uci-goldens.py through re/gnuchess/oracle/drive.py (`gnuchess --uci`).
// Every line must match exactly, except the values of time, nps and cpuload, and the lines that
// only appear once a second ("info currmove", the periodic "info time … cpuload" and its
// "info hashfull"): best move, ponder move, score, depth, seldepth, PV and node counts are compared.
// GNUCHESS_DEEP=1 also runs the deeper searches of uci-positions-deep.json.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { start_engine, stable_lines, type Engine } from './engine/uci.ts';

const golden = join(import.meta.dirname, 'golden');
const read = (name: string) => JSON.parse(readFileSync(join(golden, name), 'utf8'));

interface Position {
  name: string;
  depth: number;
  fen: string;
  moves: string;
  output: string[];
}

test('uci: the id and option lines, and isready', () => {
  const { uci, isready } = read('uci-options.json') as { uci: string[]; isready: string[] };
  const engine = start_engine();
  assert.deepEqual(engine.send('uci'), uci);
  assert.deepEqual(engine.send('isready'), isready);
});

test('OwnBook: the book moves the oracle draws with the same rand() seed', () => {
  const { searches } = read('uci-book.json') as { searches: { position: string; depth: number; output: string[] }[] };
  const engine = start_engine();
  engine.send('uci');
  engine.send('setoption name OwnBook value true');
  engine.send('isready');
  for (const s of searches) {
    engine.send(s.position);
    engine.send('isready');
    assert.deepEqual(stable_lines(engine.send(`go depth ${s.depth}`)), stable_lines(s.output), s.position);
  }
});

interface Settings {
  name: string;
  before: string[];
  after: string[];
  searches: { position: string; depth: number; output: string[] }[];
}

for (const c of (read('uci-settings.json') as { cases: Settings[] }).cases) {
  test(`options: ${c.name} (${[...c.before, ...c.after].join(', ')})`, () => {
    const engine = start_engine();
    engine.send('uci');
    for (const line of c.before) engine.send(line);
    engine.send('isready');
    for (const line of c.after) engine.send(line);
    for (const s of c.searches) {
      engine.send('ucinewgame');
      engine.send(s.position);
      engine.send('isready');
      assert.deepEqual(stable_lines(engine.send(`go depth ${s.depth}`)), stable_lines(s.output), s.position);
    }
  });
}

// protocol.cpp's states with input during a search (the oracle cannot time such input, so these check
// the port against the source's rules, not against goldens): a line that arrives during a search is
// read at the next search_check() (every 10000 nodes)
test('protocol: "stop" during "go infinite" ends the search (after depth 1) with bestmove', () => {
  const engine = start_engine();
  engine.send('uci');
  engine.send('isready');
  engine.send('position startpos');
  engine.pending.push('isready', 'stop', 'position startpos moves e2e4');
  const out = engine.send('go infinite');
  assert.ok(out.includes('readyok'), 'isready is answered during the search');
  assert.match(out[out.length - 1], /^bestmove \S+ ponder \S+$/);
  assert.ok(out.some((l) => /^info depth 1 seldepth \d+ time \d+ nodes \d+/.test(l)), 'depth 1 completed');
  // event() stops reading after "stop": the next line waits for the main loop
  assert.deepEqual(engine.pending, ['position startpos moves e2e4']);
  assert.equal(engine.stderr, '');
});

test('protocol: a finished ponder search waits for "ponderhit" (or "stop") to send bestmove', () => {
  const engine = start_engine();
  engine.send('uci');
  engine.send('isready');
  engine.send('position startpos moves e2e4');
  // go ponder with a depth limit: the search does not stop at the limit while pondering...
  engine.pending.push('ponderhit');
  let out = engine.send('go depth 2 ponder');
  // ... until ponderhit makes it a normal search, which then stops at the next check (depth > 2)
  assert.match(out[out.length - 1], /^bestmove /);
  // without input the ponder search of a lone king reaches DepthMax and then waits
  engine.send('ucinewgame');
  engine.send('position fen 8/8/4k3/8/8/4K3/8/8 w - - 0 1');
  out = engine.send('go depth 1 ponder');
  assert.ok(!out.some((l) => l.startsWith('bestmove')), 'no bestmove before ponderhit');
  assert.deepEqual(engine.send('position startpos'), [], 'position is ignored while waiting');
  out = engine.send('ponderhit');
  assert.match(out[out.length - 1], /^bestmove /);
  out = engine.send('go depth 1 ponder');
  assert.ok(!out.some((l) => l.startsWith('bestmove')));
  out = engine.send('stop');
  assert.match(out[out.length - 1], /^bestmove /);
  assert.equal(engine.stderr, '');
});

test('protocol: quit sets the engine to quit; unknown lines are ignored', () => {
  const engine = start_engine();
  assert.deepEqual(engine.send('xyzzy'), []);
  assert.deepEqual(engine.send('debug on'), []);
  assert.equal(engine.quit, false);
  engine.send('quit');
  assert.equal(engine.quit, true);
});

function run_positions(file: string): void {
  const { positions } = read(file) as { positions: Position[] };
  // one engine for all of them, as the oracle ran them in one process; started by the first test
  // (the engine's state is the module's: only one engine exists at a time)
  let engine: Engine | null = null;
  for (const p of positions) {
    test(`${p.name}: depth ${p.depth}`, () => {
      if (engine === null) {
        engine = start_engine();
        engine.send('uci');
        engine.send('isready');
      }
      engine.send('ucinewgame');
      engine.send((p.fen === 'startpos' ? 'position startpos' : `position fen ${p.fen}`) + (p.moves ? ` ${p.moves}` : ''));
      engine.send('isready');
      const out = engine.send(`go depth ${p.depth}`);
      assert.equal(engine.stderr, '');
      assert.deepEqual(stable_lines(out), stable_lines(p.output));
    });
  }
}

run_positions('uci-positions.json');
if (process.env.GNUCHESS_DEEP === '1' && existsSync(join(golden, 'uci-positions-deep.json'))) {
  run_positions('uci-positions-deep.json');
}
