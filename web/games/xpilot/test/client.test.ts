// The client port against the client oracle (re/xpilot/oracle/client): every drawing client of
// every scenario runs on the recorded server stream with the scenario's input (harness.ts), and its
// draw log must equal the golden section by section (calls and hash of every section; the lines of
// every committed section), and what it sends must be what the server got from the original client.
// XPILOT_DEEP=1 also rasterizes every drawing call (the pixels have no golden; the rasterizer must
// take everything the client draws).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readDraw, readDrawIndex, readScenario } from './golden.ts';
import { runClient } from './harness.ts';
import { fold } from './compare.ts';

const DEEP = process.env.XPILOT_DEEP === '1';

const clients: [string, string][] = [];
for (const name of ['duel', 'robots', 'cannons', 'targets', 'ball', 'race', 'asteroids', 'wormholes', 'set']) {
  for (const nick of readScenario(name).drawing) clients.push([name, nick]);
}

for (const [scn, nick] of clients) {
  test(`xpilot client ${scn}/${nick}: draw log and client packets as the original's`, async () => {
    const index = readDrawIndex(scn, nick);
    const draw = readDraw(scn, nick);
    const committed = new Set(index.filter((e) => e.committed !== null).map((e) => e.section));
    const run = await runClient(scn, nick, { keep: (name) => committed.has(name), render: DEEP });
    // every section: name, calls, hash
    let matched = 0;
    while (matched < index.length && matched < run.sections.length) {
      const s = run.sections[matched], g = index[matched];
      if (s.name !== g.section || s.calls !== g.calls || s.hash !== g.hash) break;
      matched++;
    }
    const where = matched < index.length
      ? `section ${matched}: port ${run.sections[matched]?.name} ${run.sections[matched]?.calls} ${run.sections[matched]?.hash}, `
        + `golden ${index[matched].section} ${index[matched].calls} ${index[matched].hash}`
      : '';
    assert.equal(matched, index.length, `${matched} of ${index.length} sections equal; first difference at ${where}`);
    assert.equal(run.sections.length, index.length, 'more sections than the golden');
    // the committed sections line by line (input notes included)
    let lines = 0;
    for (const s of run.sections) {
      if (!s.lines) continue;
      const want = draw.get(s.name)!.map((b) => b.toString('latin1'));
      const got = fold(s.lines);
      lines += got.length;
      assert.deepEqual(got, want, `section ${s.name}`);
    }
    assert.ok(lines > 0);
    // the client's packets
    assert.deepEqual(run.c2sBad, [], 'client messages that differ from the recording');
    assert.ok(run.c2sOk > 0 || nick === 'Dave');
  });
}
