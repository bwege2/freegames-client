// PokerTH's port against the original: re/pokerth/oracle compiles PokerTH 1.1.2's own engine (Game,
// LocalHand, LocalBoard, the betting rounds, LocalPlayer with its computer opponents, CardsValue) and plays
// whole local games with a fixed random stream; test/golden/ holds its transcripts (re/pokerth/oracle/golden.sh).
// The port plays the same games and must print the same transcript line for line: the cards dealt, every
// player's hand value and best five cards, every action and amount of the human script and of the computer
// opponents, the board, who must show their cards, the winners and every player's cash after each hand.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gunzipSync } from 'node:zlib';
import { runGame, runRank } from './run-port.ts';

const golden = join(import.meta.dirname, 'golden');
const read = (name: string) => gunzipSync(readFileSync(join(golden, name))).toString('utf8');

function firstDifference(want: string, got: string): string {
  const w = want.split('\n');
  const g = got.split('\n');
  for (let i = 0; i < Math.max(w.length, g.length); i++) {
    if (w[i] !== g[i]) {
      return `line ${i + 1}:\n  original: ${w[i]}\n  port:     ${g[i]}\n  before:   ${w.slice(Math.max(0, i - 4), i).join('\n            ')}`;
    }
  }
  return '';
}

test('CardsValue::cardsValue: 4000 random seven-card hands, value and best five cards', () => {
  const want = read('rank-1-4000.txt.gz');
  const got = runRank(1, 4000);
  assert.equal(firstDifference(want, got), '');
});

test('CardsValue::cardsValue: 300000 more hands (SHA-256 of the transcript)', () => {
  const [seed, count, hash] = readFileSync(join(golden, 'rank-hashes.txt'), 'utf8').trim().split(' ');
  const got = createHash('sha256').update(runRank(Number(seed), Number(count))).digest('hex');
  assert.equal(got, hash);
});

const games = readFileSync(join(golden, 'games.txt'), 'utf8').trim().split('\n').map((l) => l.split(' ').map(Number));
for (const g of games) {
  const [seed, players, cash, sb, every, maxHands, ...manual] = g;
  test(`local game seed ${seed}: ${players} players, start cash ${cash}, small blind ${sb}, raised every ${every} hands${manual.length ? `, manual blinds ${manual.join(' ')}` : ''}`, () => {
    const want = read(`game-${g.join('-')}.txt.gz`);
    const got = runGame(seed, players, cash, sb, every, maxHands, manual);
    assert.equal(firstDifference(want, got), '');
  });
}
