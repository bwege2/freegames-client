// Savegames in the site's storage (milestone 3), in headless Chromium: Tutorial01 runs with a player, the game is saved
// as the in-game menu's "Save game" saves it (C4MainMenu's command "Save:Game:<file>:<title>" calls C4Game::QuickSave:
// C4GameSaveSavegame into Savegames.ocf/Tutorial01.ocf/Tutorial011.ocs, a packed group, gzipped as the original packs
// it), the page writes it to the storage (src/storage.ts) and its size is within the storage's limits; a new start
// loads it from the storage and the original runs the savegame on from where it was saved.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { withBrowser, boot, run, evalIn, storageOf, GROUPS } from './menu.ts';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const chrome = process.env.CHROME ?? ['/usr/bin/chromium-browser', '/usr/bin/chromium', '/usr/bin/google-chrome'].find((p) => fs.existsSync(p));
const skip = !chrome ? 'no Chromium (set CHROME)'
  : GROUPS.some((g) => !fs.existsSync(path.join(here, '../assets', g))) ? 'no packed content (re/openclonk/tools/pack.sh)' : false;
const SAVE = 'Savegames.ocf/Tutorial01.ocf/Tutorial011.ocs';
const NAME = 'Savegames.ocf__Tutorial01.ocf__Tutorial011.ocs';

test('a savegame goes to the storage within its limits and runs on after a new start', { skip, timeout: 1_800_000 }, async () => {
  await withBrowser(async (open) => {
    let page = await open();
    await boot(page, {}, { scenario: 'Tutorials.ocf/Tutorial01.ocs', playerName: 'Clonk' });
    let s = await run(page, 400);
    assert.equal(s.error, '', s.error + '\n' + s.log.join('\n'));
    assert.ok(s.frame >= 150, `the game runs (frame ${s.frame})`);
    const saved = await evalIn(page, `
      const ok = $.Game.QuickSave(S(${JSON.stringify(SAVE.replace('Savegames.ocf/', ''))}), S('Tutorial 1'), false);
      // the original writes the savegame as a copy of its scenario, a folder here (the page's content is unpacked)
      let unpacked = 0;
      const walk = (d) => { for (const n of listDir(d) || []) { const f = readFile(d + n); if (f) unpacked += f.length; else walk(d + n + '/'); } };
      walk(USER + ${JSON.stringify(SAVE)} + '/');
      return { ok, unpacked, frame: $.Game.FrameCounter };`) as { ok: boolean; unpacked: number; frame: number };
    assert.ok(saved.ok, 'C4Game::QuickSave succeeded');
    s = await run(page, 10);
    const storage = await storageOf(page);
    assert.ok(storage[NAME], `the savegame is in the storage (${Object.keys(storage)})`);
    const size = storage[NAME].length;
    assert.deepEqual(storage[NAME].slice(0, 2), [0x1e, 0x8c], 'stored as a packed group: gzip with the original\'s magic bytes');
    assert.ok(size <= 512 * 1024, `the savegame (${size} bytes) fits the storage's 512 KiB per file`);
    console.log(`savegame of Tutorial01 at frame ${saved.frame}: ${saved.unpacked} bytes unpacked, ${size} packed; the storage holds ${Object.entries(storage).map(([n, d]) => `${n} ${d.length}`).join(', ')}`);
    await page.close();

    // a new start loads it and runs it on
    page = await open();
    const b = await boot(page, storage, { userScenario: SAVE, playerName: 'Clonk' });
    assert.ok(b.loaded.includes(SAVE), `loaded ${b.loaded}`);
    s = await run(page, 300);
    for (let i = 0; i < 10 && s.modal; i++) {
      // a question while the savegame starts (C4PlayerInfoList::RestoreSavegameInfos): its OK
      await page.evaluate(() => (globalThis as any).ocMenuKey('Enter', 'Enter'));
      s = await run(page, 100);
    }
    assert.equal(s.error, '', s.error + '\n' + s.log.join('\n'));
    assert.ok(s.frame > saved.frame + 50, `the savegame runs on from frame ${saved.frame} (now ${s.frame})`);
    assert.ok(s.players.length >= 1, `with its player (${s.players})`);
    await page.close();
  });
});
