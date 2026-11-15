// The event queue the page and the program's worker share (src/shared.ts): a ring of EV_CAP events. When
// the program does not read (a long computation) and the player keeps pressing, the page drops the newest
// event: an event the program has not read is never overwritten, and the order stays the player's.
import test from 'node:test';
import assert from 'node:assert/strict';
import { CTL, EV_CAP, eventWaiting, makeShared, pushEvent, takeEvent } from '../src/shared.ts';

test('a full event queue drops the newest event and never overwrites an unread one', () => {
  const shared = makeShared();
  const ctl = new Int32Array(shared.ctl);
  const ev = new Int32Array(shared.events);
  assert.equal(eventWaiting(ctl), false);
  assert.equal(takeEvent(ctl, ev), null);
  // the program is busy: EV_CAP events wait, the next ones are dropped
  for (let i = 0; i < EV_CAP; i++) assert.equal(pushEvent(ctl, ev, [2, i, 0, 0, 0]), true, `event ${i}`);
  assert.equal(pushEvent(ctl, ev, [2, 999999, 0, 0, 0]), false, 'the queue is full');
  assert.equal(pushEvent(ctl, ev, [2, 999998, 0, 0, 0]), false, 'still full');
  assert.equal(eventWaiting(ctl), true);
  // the program reads one: one slot is free again
  assert.deepEqual(takeEvent(ctl, ev), [2, 0, 0, 0, 0, 0, 0, 0]);
  assert.equal(pushEvent(ctl, ev, [3, EV_CAP, 0, 0, 0]), true);
  // everything in the player's order, nothing lost but the dropped ones
  for (let i = 1; i <= EV_CAP; i++) {
    const e = takeEvent(ctl, ev);
    assert.ok(e, `event ${i}`);
    assert.equal(e[1], i, `event ${i}`);
  }
  assert.equal(takeEvent(ctl, ev), null);
  assert.equal(Atomics.load(ctl, CTL.READ), Atomics.load(ctl, CTL.WRITE));
  // the ring goes on past its end, many times
  for (let n = 0; n < 5 * EV_CAP; n++) {
    assert.equal(pushEvent(ctl, ev, [4, n, n & 255, 1, 2]), true);
    assert.deepEqual(takeEvent(ctl, ev), [4, n, n & 255, 1, 2, 0, 0, 0]);
  }
});
