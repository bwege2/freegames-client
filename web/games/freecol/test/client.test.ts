// FreeCol's client against the original: the port's client worker and server worker (as on the page, in node
// worker threads) start the game at 1280x800 and go to each screen of test/oracle/screens.json as a player
// does (clicks); the Swing component tree on the screen (classes, bounds, preferred sizes, fonts, texts) is
// the original's on Xvfb with the same fonts (test/oracle/SCREEN.tree, re/freecol/tools/client-trees.sh).
// A screen may name components whose subtrees differ by chance (a random game's names): those are left out.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { startWorkers, waitFor, click, type TwoWorkers } from './workers.ts';

type Screen = { steps: string[]; ignore?: string[] };
const oracle = path.join(import.meta.dirname, 'oracle');
const { size, screens } = JSON.parse(fs.readFileSync(path.join(oracle, 'screens.json'), 'utf8')) as { size: string; screens: Record<string, Screen> };
const [width, height] = size.split('x').map(Number);

/** Goes from the main menu to a screen as ClientDump does: click=TEXT, wait=CLASS. */
async function goTo(w: TwoWorkers, steps: string[]): Promise<string> {
  let tree = (await waitFor(w, (n) => n.cls === 'net.sf.freecol.client.gui.panel.MainPanel')).tree;
  for (const s of steps) {
    if (s.startsWith('click=')) {
      const text = s.substring(6);
      click(w, (await waitFor(w, (n) => n.text === text && /Button|RadioButton|CheckBox/.test(n.cls))).node);
    } else if (s.startsWith('wait=')) {
      const cls = s.substring(5);
      await waitFor(w, (n) => n.cls === cls);
      await new Promise((r) => setTimeout(r, 1500)); // as the oracle lets painting settle
    }
  }
  tree = await w.tree();
  return tree;
}

/** The tree without the subtrees of the named classes (their own line stays). */
export function without(tree: string, ignore: string[]): string {
  const out: string[] = [];
  let skipDepth = -1;
  for (const line of tree.split('\n')) {
    const depth = line.length - line.trimStart().length;
    if (skipDepth >= 0 && depth > skipDepth) continue;
    skipDepth = -1;
    out.push(line);
    const cls = line.trim().split(' ')[0];
    if (ignore.includes(cls)) skipDepth = depth;
  }
  return out.join('\n');
}

/** The first ship's name in the info panel (the unit the game selected). */
const unitName = (tree: string) => /"([^"]*) \(Dutch"/.exec(tree)?.[1] ?? null;

test('a game ends its turn, autosaves to the site\'s storage, and a new start continues it', { timeout: 300000 }, async () => {
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const press = async (w: TwoWorkers, pred: (n: any) => boolean, ms = 60000) => {
    click(w, (await waitFor(w, pred, ms)).node);
    await sleep(1000);
  };
  const w = await startWorkers(width, height);
  let name: string | null = null;
  try {
    await waitFor(w, (n) => n.cls === 'net.sf.freecol.client.gui.panel.MainPanel');
    await press(w, (n) => n.text === 'New');
    await press(w, (n) => n.text === 'OK' && n.cls.endsWith('FreeColButton'));
    await press(w, (n) => n.text === 'Start Game');
    await press(w, (n) => n.text === 'OK' && n.cls.endsWith('FreeColButton'));
    name = unitName(await w.tree());
    assert.ok(name, 'a ship is selected');
    w.key(10, '\n'); // Enter: end the turn; the end turn dialog asks, OK
    await press(w, (n) => n.text === 'OK' && n.cls === 'javax.swing.JButton', 30000);
    for (let i = 0; i < 120 && !w.stored.has('d.save_2fautosave_2fAutosave-last-turn.fsg'); i++) await sleep(500);
    assert.ok(w.stored.get('d.save_2fautosave_2fAutosave-last-turn.fsg'), 'the autosave is stored');
    assert.deepEqual(w.errors, []);
  } finally {
    await w.stop();
  }
  const files = [...w.stored].filter(([, v]) => v) as [string, Uint8Array][];
  const w2 = await startWorkers(width, height, 'en_US', files);
  try {
    await press(w2, (n) => n.text === 'Continue Playing');
    await waitFor(w2, (n) => n.cls === 'net.sf.freecol.client.gui.panel.InfoPanel');
    await sleep(1500);
    assert.equal(unitName(await w2.tree()), name, 'the same game, with the same ship');
    assert.deepEqual(w2.errors, []);
  } finally {
    await w2.stop();
  }
});

for (const [name, screen] of Object.entries(screens)) {
  test(`the client's ${name} screen is the original's`, { timeout: 240000 }, async () => {
    const w = await startWorkers(width, height);
    try {
      const tree = await goTo(w, screen.steps);
      assert.deepEqual(w.errors, []);
      const ignore = screen.ignore ?? [];
      assert.equal(without(tree, ignore), without(fs.readFileSync(path.join(oracle, name + '.tree'), 'utf8'), ignore));
    } finally {
      await w.stop();
    }
  });
}
