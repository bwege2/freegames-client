// The original's modal loops on the page (src/rt/coro.ts): a generator started by a function that cannot wait runs up to
// its first wait and is then resumed by the page, innermost first, as the original's nested modal loops run; a waiting
// caller waits for a callee through $co.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { $co, $spawn, coroReset, coroResume, coroWaiting } from '../src/rt/coro.ts';

test('a modal loop waits until its dialog closes; loops inside loops are resumed innermost first', () => {
  coroReset();
  const trace: string[] = [];
  const dialogs: Record<string, boolean> = { outer: true, inner: true };
  // Dialog::DoModal as the translator writes it: while (fShow) { (yield, ScheduleProcs()) }
  function* doModal(name: string): Generator<unknown, boolean, unknown> {
    while (dialogs[name]) {
      yield;
      trace.push(`${name} round`);
    }
    return true;
  }
  // a caller that waits (ShowModalDlg) and one that cannot (a button's callback through a member function pointer)
  function* showModal(name: string): Generator<unknown, boolean, unknown> {
    const ok = yield* $co<boolean>(doModal(name));
    trace.push(`${name} closed`);
    return ok;
  }
  assert.equal($spawn(showModal('outer')), true, 'a waiting coroutine answers true to the caller that cannot wait');
  assert.equal(coroWaiting(), 1);
  coroResume();
  assert.deepEqual(trace, ['outer round']);
  // a button of the outer dialog opens another modal dialog (from inside the outer loop's round)
  assert.equal($spawn(showModal('inner')), true);
  assert.equal(coroWaiting(), 2);
  coroResume();
  assert.deepEqual(trace.slice(-1), ['inner round'], 'the inner loop runs, the outer one waits');
  dialogs.inner = false;
  coroResume();
  assert.deepEqual(trace.slice(-2), ['inner round', 'inner closed']);
  assert.equal(coroWaiting(), 1);
  dialogs.outer = false;
  coroResume();
  assert.deepEqual(trace.slice(-2), ['outer round', 'outer closed']);
  assert.equal(coroWaiting(), 0);
  // a call that does not wait answers at once
  assert.equal($spawn(42), 42);
  function* quick(): Generator<unknown, string, unknown> { return 'done'; }
  assert.equal($spawn(quick()), 'done');
  assert.equal(coroWaiting(), 0);
});
