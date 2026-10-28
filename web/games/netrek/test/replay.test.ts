// The translated COW against the client oracle (re/netrek/oracle/, the original COW 3.3.3 on a recording
// Xlib, run in lockstep with the original server): replaying a golden, every byte and every datagram COW
// sends is the original's (in the same relay order), and every Xlib call, section by section, is the
// original's: the same lines and the same index (calls and FNV-1a 64 hash per section) for all of its
// frames. cowduel plays over TCP, cowudp in UDP mode (simple, fat, by TCP only, the switch back to TCP).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadGolden, replay } from './replay.ts';

for (const name of ['cowduel', 'cowudp']) {
  const golden = loadGolden(name);
  test(`${name}: COW replays the client oracle byte for byte and call for call`, { skip: golden ? false : `no client-oracle golden re/netrek/golden/${name} (run re/netrek/oracle/build.sh run ${name})`, timeout: 600000 }, async () => {
    const g = golden!;
    const r = await replay(g);
    if (r.mismatch) assert.fail(`${r.mismatch.what} differs at frame ${r.mismatch.frame}: ${r.mismatch.detail}`);
    assert.equal(r.frames, g.frames, 'every frame');
    // the draw log: every line (calls and the notes of the input as it became events) and every section's index
    assert.equal(r.lines, g.draw.length, 'as many draw-log lines as the oracle');
    for (let i = 0; i < g.draw.length; i++) if (r.draw[i] !== g.draw[i]) assert.fail(`draw line ${i + 1}: ${r.draw[i]} / ${g.draw[i]}`);
    assert.deepEqual(r.index, g.index, 'the section index (calls, hash) of every section');
    // the bytes and datagrams: all of them, both ways
    let c2s = 0, s2c = 0, u2s = 0, s2u = 0;
    for (const p of g.packets.values()) {
      c2s += p.c2s.length;
      s2c += p.s2c.length;
      u2s += p.u2s.length;
      s2u += p.s2u.length;
    }
    assert.equal(r.c2sBytes, c2s, 'every byte COW sent');
    assert.equal(r.s2cBytes, s2c, 'every byte the server sent was read');
    assert.equal(r.u2s, u2s, 'every datagram COW sent');
    assert.equal(r.s2u, s2u, 'every datagram the server sent');
    if (name === 'cowudp') assert.ok(u2s > 100 && s2u > 500, `UDP mode: ${u2s} datagrams sent, ${s2u} received`);
  });
}
