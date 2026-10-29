// One game of play.test.ts, in a process of its own (the original runs each game in a fresh JVM, and
// FreeCol keeps state in static fields, e.g. NameCache's names): plays it in the port, compares every
// turn's savegame.xml with the original's and prints {"diff": null | "where"} as JSON.
//   node play-run.ts '{"seed":3,"rules":"freecol","script":true,"turns":60,"dir":"…","mutation":null}'
import path from 'node:path';
import { firstDiff, savegameXml } from './harness.ts';
import { portNewGame, portPlay } from './game.ts';

const g = JSON.parse(process.argv[2]);
const fsg = (t: number) => `turn${String(t).padStart(3, '0')}.fsg`;
const norm = (xml: string) => xml.replace(/ UUID="[^"]*"/, '');

/** The mutation check's changes to the port. */
async function mutate(name: string) {
  const fc = await import('../src/freecol.ts');
  if (name === 'moves') {
    // every unit moves one step (three move points) further
    const Unit = fc.java('net.sf.freecol.common.model.Unit');
    const orig = Unit.prototype.getInitialMovesLeft;
    Unit.prototype.getInitialMovesLeft = function () { return orig.call(this) + 3; };
  } else if (name === 'production') {
    // a tile could produce one more of every goods type
    const Tile = fc.java('net.sf.freecol.common.model.Tile');
    const orig = Tile.prototype.getPotentialProduction;
    Tile.prototype.getPotentialProduction = function (...a: any[]) { return orig.apply(this, a) + 1; };
  } else if (name === 'random') {
    // one bounded random draw in a thousand comes out one higher
    const { Random } = await import('../src/jre/index.ts');
    const orig = Random.prototype.nextInt;
    let n = 0;
    Random.prototype.nextInt = function (...a: any[]) {
      const r = (orig as any).apply(this, a);
      return a.length === 1 && ++n % 1000 === 0 ? (r + 1) % a[0] : r;
    };
  } else throw new Error('unknown mutation ' + name);
}

let diff: string | null = null;
try {
  const game = await portNewGame(g.seed, g.rules);
  if (g.mutation) await mutate(g.mutation);
  await portPlay(game, g.turns, g.script, (t, bytes) => {
    const mine = norm(savegameXml(bytes));
    const theirs = norm(savegameXml(path.join(g.dir, fsg(t))));
    if (mine === theirs) return true;
    diff = `turn ${t}: savegame.xml differs ${firstDiff(mine, theirs)}`;
    return false;
  });
} catch (e: any) {
  diff = `the game failed: ${e?.stack ?? e}`;
}
process.stdout.write(JSON.stringify({ diff }) + '\n');
process.exit(0);
