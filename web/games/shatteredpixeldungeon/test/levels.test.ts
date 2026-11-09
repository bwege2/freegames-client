// Level generation against the original: the translated game (src/gen, j2ts) generates the levels of a new
// game as the oracle's driver does (freegames.spd.Oracle.levels, translated with the game), and the text must
// be the original's, byte for byte (test/oracle/*.txt.gz, written by re/shatteredpixeldungeon/oracle/goldens.sh
// from Shattered Pixel Dungeon 4.0.2 on the JVM). The mutation checks change one rule of the translated game
// and expect the comparison to fail, so that the test is known to see such changes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { assetsDir, bootPort, firstDiff, golden, goldenDir } from './harness.ts';

const goldens = fs.existsSync(goldenDir)
  ? fs.readdirSync(goldenDir).filter((f) => f.startsWith('levels-') && f.endsWith('.txt.gz')).map((f) => f.replace(/\.txt\.gz$/, '')).sort()
  : [];
const skip = !assetsDir()
  ? "no assets: run re/shatteredpixeldungeon/fetch.sh (the original's core/src/main/assets) or add the game's assets/"
  : goldens.length === 0 ? 'no golden output in test/oracle (re/shatteredpixeldungeon/oracle/goldens.sh)' : false;

/** The port's output for a golden's arguments, and the golden. */
async function run(name: string) {
  const g = golden(name);
  const port = await bootPort(Number(g.meta.clock));
  const mine = port.Oracle.levels(BigInt(g.meta.seed), Number(g.meta.class), Number(g.meta.depths));
  return { mine, theirs: g.text, meta: g.meta };
}

for (const name of goldens) {
  test(`levels as the original generates them: ${name}`, { skip, timeout: 300000 }, async () => {
    const { mine, theirs, meta } = await run(name);
    const d = firstDiff(mine, theirs);
    if (d) assert.fail(`seed ${meta.seed}, hero class ${meta.class}: the port's levels differ from the original's at ${d}`);
    assert.equal(mine.split('\n').filter((l: string) => l.startsWith('depth ')).length, Number(meta.depths));
  });
}

/** Runs the first golden with a rule of the game changed, and restores it. */
async function mutated(change: (J: any) => () => void): Promise<string | null> {
  const port = await bootPort(Date.now());
  const restore = change(port.J);
  try {
    const { mine, theirs } = await run(goldens[0]);
    return firstDiff(mine, theirs);
  } finally {
    restore();
  }
}

/** Replaces a method of a translated class (initialized first, so that its lazy initialization keeps the change). */
function patch(J: any, cls: string, name: string, wrap: (orig: any) => any, isStatic = false): () => void {
  const C = J.load(cls);
  J.initClass(C);
  const target = isStatic ? C : C.prototype;
  const orig = target[name];
  assert.equal(typeof orig, 'function', `${cls}.${name}`);
  target[name] = wrap(orig);
  return () => { target[name] = orig; };
}

test('mutation check: a rat with 9 hit points instead of 8 is seen', { skip, timeout: 300000 }, async () => {
  const d = await mutated((J) => patch(J, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Rat', '_Rat', (orig) => function (this: any) {
    orig.call(this);
    this.HP = this.HT = 9;
    return this;
  }));
  assert.ok(d, 'the comparison must fail when a rule changes');
  assert.match(d!, /"HT":9|"HP":9|"HT":8|"HP":8/);
});

test('mutation check: one more standard room in the sewers is seen', { skip, timeout: 300000 }, async () => {
  const d = await mutated((J) => patch(J, 'com.shatteredpixel.shatteredpixeldungeon.levels.SewerLevel', 'standardRooms', (orig) => function (this: any, ...a: any[]) {
    return (orig.apply(this, a) + 1) | 0;
  }));
  assert.ok(d, 'the comparison must fail when a rule changes');
  assert.match(d!, /^depth [1-4] /);
});

test('the unchanged game matches again after the mutations', { skip, timeout: 300000 }, async () => {
  const { mine, theirs } = await run(goldens[0]);
  assert.equal(firstDiff(mine, theirs), null);
});
