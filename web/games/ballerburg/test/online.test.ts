// Online play is lockstep: what one client decides with the original's dialogs (moves), the other client
// carries out without them. These tests play a golden scenario as the deciding client (recording its
// moves) and then as the other client (fed those moves), and require the same game at the start of every
// turn: the same state (everything but the local mouse) and the same pixels on the drawing surface (which
// the game reads back: where a ball hits, where a shaft tower stands). And: moves survive the wire.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { unpackGame } from '../../../src/sdk/index.ts';
import { parseScript, run, stateString, surfaceHash, type ScriptEvent } from './harness.ts';
import { g } from '../src/baller1.ts';
import { decodeMove, encodeMove, takeMove } from '../src/online.ts';
import { Msg } from '../src/proto/ballerburg.ts';
import type { Move, MoveContext, Moves } from '../src/moves.ts';

const golden = join(import.meta.dirname, 'golden');

/** the shared part of the state: without the local mouse (mx, my, bt) */
const shared = (st: string) => st.split(' ').filter((_, i) => i < 5 || i > 7).join(' ');

class Recorder implements Moves {
  readonly moves: Move[] = [];
  readonly turns: string[] = [];
  private zug = -1;
  private readonly passive: Move[] | null;
  constructor(passive: Move[] | null) {
    this.passive = passive;
  }
  private mark(): void {
    if (g.zug === this.zug) return;
    this.zug = g.zug;
    this.turns.push(g.zug + ' ' + shared(stateString()) + ' ' + surfaceHash() + ' ' + surfaceHash(true));
  }
  remote(): boolean {
    this.mark();
    return this.passive !== null;
  }
  async next(ctx: MoveContext): Promise<Move | null> {
    for (;;) {
      const m = this.passive!.shift();
      if (!m) return null;
      const t = takeMove(ctx, m);
      if (t) return t;
    }
  }
  async commit(m: Move): Promise<void> {
    this.moves.push(m);
  }
  gameOver(): void {}
  async escape(): Promise<number> {
    return 0;
  }
}

async function lockstep(name: string): Promise<void> {
  const { seed, events } = parseScript(readFileSync(join(golden, `${name}.txt`), 'utf8'));
  // the scenario up to its first visit to the settings (online there are none)
  const upTo = events.findIndex((e: ScriptEvent) => e.what === 'KD' && e.a === 27);
  const script = upTo < 0 ? events : events.slice(0, upTo);

  const active = new Recorder(null);
  await run(seed, script, { moves: active });
  assert.ok(active.moves.length >= 8, `${name}: moves were made (${active.moves.length})`);
  assert.ok(active.turns.length > 4, `${name}: turns were played (${active.turns.length})`);

  const passive = new Recorder(active.moves.slice());
  await run(seed, [], { moves: passive });
  assert.equal(passive.turns.length, active.turns.length, 'as many turns');
  for (let i = 0; i < active.turns.length; i++) assert.equal(passive.turns[i], active.turns[i], `turn ${i}`);
}

test('lockstep: shots, the table, Done', () => lockstep('hotseat-shots'));
test('lockstep: the market, bricks, shaft towers, the king', () => lockstep('market'));

test('moves survive the wire, and what is out of range does not', () => {
  const moves: Move[] = [
    { kind: 'done' }, { kind: 'king' }, { kind: 'market' }, { kind: 'bricksDone' }, { kind: 'marketButton', button: 35 },
    { kind: 'brick', x: 639, y: 479 }, { kind: 'cannon', k: 9, w: 180, p: 20, fire: true }, { kind: 'cannon', k: 0, w: 0, p: 5, fire: false },
  ];
  for (const m of moves) assert.deepEqual(decodeMove(unpackGame(Msg, encodeMove(m))), m);
  for (const bad of [{ k: 10, w: 45, p: 12 }, { k: 0, w: 181, p: 12 }, { k: 0, w: 45, p: 4 }, { k: 0, w: 45, p: 21 }]) {
    assert.equal(decodeMove(unpackGame(Msg, encodeMove({ kind: 'cannon', ...bad, fire: true }))), null);
  }
  assert.throws(() => takeMove('market', { kind: 'done' }), /turn end/);
  assert.equal(takeMove('turn', { kind: 'brick', x: 1, y: 1 }), null);
  assert.equal(takeMove('bricks', { kind: 'marketButton', button: 19 }), null);
});
