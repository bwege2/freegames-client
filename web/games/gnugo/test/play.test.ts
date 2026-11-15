// The computer player in the ported program: GNU Go plays itself (`play N`) on a small board with few
// simulations, every move legal, until both pass; then the count. Not compared with the original (its
// moves come from its full engine, which is not ported); the Monte Carlo search itself is compared in
// oracle.test.ts.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runSession } from './ascii-session.ts';

test('GNU Go plays a 7x7 game against itself to the end, and counts', async () => {
  const r = await runSession(
    ['--mode', 'ascii', '--boardsize', '7', '-r', '11', '--komi', '4.5', '--mc-games-per-level', '40', '--quiet'],
    'play 200\ncount\nd4\ndone\nsave self.sgf\nquit\n',
    {},
  );
  assert.equal(r.status, 0);
  assert.equal(r.stderr, '');
  const moves = r.stdout.split('\n').filter((l) => /^(white|black)\(\d+\): [A-T]/.test(l));
  assert.ok(moves.length > 10, 'some moves were played');
  assert.match(r.stdout, /(white|black)\(\d+\): PASS\n(white|black)\(\d+\): PASS\nResult: (jigo|[WB]\+\d+\.\d)   \nIf you disagree/);
  assert.match(r.stdout, /Game over. Let's count!/);
  assert.match(r.written['self.sgf'], /^\(;GM\[1\]FF\[4\]\nSZ\[7\]\nGN\[GNU Go 3\.8 Random Seed 11 level 10\]/);
  assert.match(r.written['self.sgf'], /RE\[(0|[WB]\+\d+\.\d)\]/);
});

test('the computer answers a move, and the same seed gives the same game', async () => {
  const run = () =>
    runSession(['--mode', 'ascii', '--boardsize', '9', '-r', '5', '--mc-games-per-level', '100', '--quiet', '--level', '2'], 'e5\nc3\nquit\n', {});
  const a = await run();
  const b = await run();
  assert.equal(a.stdout, b.stdout);
  assert.match(a.stdout, /white\(2\): [A-J]\d\n/);
  assert.match(a.stdout, /white\(4\): ([A-J]\d|PASS)\n/);
});
