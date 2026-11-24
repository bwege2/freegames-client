// The original's start menu on the page (milestone 3), in headless Chromium: the original's application started without
// a scenario (test/browser/menu-entry.ts, as src/index.ts starts it), the player's files in a stand-in of the site's
// storage (src/storage.ts), the original's own GUI driven with the page's mouse and keys.
//
// * First start, no player file: the main menu opens and asks for a new player in a modal dialog (C4StartupMainDlg::
//   OnShown: ShowModalDlg of C4StartupPlrPropertiesDlg, a modal loop of its own, rt/coro.ts); a name typed and Return
//   pressed create the player file, a packed group, which goes to the storage.
// * Main menu -> scenario selection -> start: "Local game", the Tutorials folder, Tutorial01, Start: the game runs with the
//   new player.
// * The player file round trip: a second start loads the player from the storage, asks for no new player and has it
//   among the participants.
// * NONCOMMERCIAL_FILES off: the start menu opens with plain stand-ins of the same sizes for the two parchment images.
// Chromium as web/scripts/e2e.mjs finds it, or $CHROME; the packed content (re/openclonk/tools/pack.sh).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { withBrowser, boot, run, find, click, key, type, storageOf, press, ok, skip, evalIn } from './menu.ts';

test('the start menu: a new player in the modal dialog, main menu -> scenario selection -> start; the player file round trip', { skip, timeout: 1_800_000 }, async () => {
  await withBrowser(async (open) => {
    let page = await open();
    const b = await boot(page, {});
    assert.equal(b.error, '');
    let s = await run(page, 300, 'C4StartupMainDlg');
    ok(s, 'start');
    s = await run(page, 60);
    ok(s, 'main menu');
    assert.equal(s.dialog, 'C4StartupMainDlg', 'the original opens its main menu');
    // the GUI's fonts are references to C4GraphicsResource's Font* members (the translator binds references after
    // the members are constructed): a stale copy has no glyphs, and the menu's buttons drew no labels
    const fonts = await evalIn(page, `return ['TitleFont', 'CaptionFont', 'TextFont', 'TooltipFont'].map((n) => {
      const f = $.GraphicsResource[n]; const w = new Int32Array(1), h = new Int32Array(1);
      f.GetTextExtent(S('Start Game'), P(w, 0), P(h, 0), true); return { n, w: w[0], h: h[0] }; });`);
    assert.ok(Array.isArray(fonts) && fonts.every((f: { w: number; h: number }) => f.w > 0 && f.h > 0), `the GUI fonts have glyphs (${JSON.stringify(fonts)})`);
    assert.equal(s.modal, 1, 'without a player file it asks for a new player in a modal loop');
    assert.ok(s.dialogs.includes('C4StartupPlrPropertiesDlg'), `the new player dialog is shown (${s.dialogs})`);
    await type(page, 'Tester');
    await run(page, 5);
    await key(page, 'Enter', 'Enter');
    s = await run(page, 30);
    ok(s, 'new player');
    assert.equal(s.modal, 0, 'the modal loop ended with its dialog');
    assert.ok(s.storage['Tester.ocp'] > 0, `the player file is in the storage (${JSON.stringify(s.storage)})`);
    assert.match(s.participants, /Tester\.ocp/, 'the new player takes part');

    // main menu -> scenario selection -> start
    s = await press(page, 'OnStartBtn', 120);
    ok(s, 'local game');
    assert.equal(s.dialog, 'C4StartupScenSelDlg', 'Local game opens the scenario selection');
    const folder = await find(page, { cls: 'C4StartupScenSelDlg$ScenListItem', text: 'Tutorials' }) ?? await find(page, { text: 'Tutorials' });
    assert.ok(folder, 'the Tutorials folder is listed');
    await click(page, folder!.at, true);
    s = await run(page, 120);
    ok(s, 'Tutorials');
    const scen = await find(page, { text: 'Wandering Wipf' }) ?? await find(page, { text: 'Tutorial 1' });
    assert.ok(scen, 'Tutorial01 is listed in its folder');
    await click(page, scen!.at, true);
    s = await run(page, 400);
    ok(s, 'start of Tutorial01');
    assert.ok(s.frame > 50, `the game runs (frame ${s.frame}, app state ${s.appState})`);
    assert.ok(s.players.includes('Tester'), `with the new player (${s.players})`);
    // the window closed (the page's stop): the original quits and saves its config, with the participants
    await evalIn(page, '$.Application.Quit$v();');
    s = await run(page, 2);
    assert.ok(s.quit);
    const storage = await storageOf(page);
    await page.close();

    // a second start: the player file comes from the storage
    page = await open();
    const b2 = await boot(page, storage);
    assert.ok(b2.loaded.includes('Tester.ocp') && b2.loaded.includes('config'), `loaded ${b2.loaded}`);
    s = await run(page, 300, 'C4StartupMainDlg');
    s = await run(page, 60);
    ok(s, 'second start');
    assert.equal(s.dialog, 'C4StartupMainDlg');
    assert.equal(s.modal, 0, 'no new player asked for: the player file is there');
    assert.match(s.participants, /Tester\.ocp/);
    await page.close();
  });
});

test('NONCOMMERCIAL_FILES off: the start menu opens with plain stand-ins for the parchment images', { skip, timeout: 1_800_000 }, async () => {
  await withBrowser(async (open) => {
    for (const nc of [true, false]) {
      const page = await open();
      await boot(page, {}, {}, nc);
      let s = await run(page, 300, 'C4StartupMainDlg');
      s = await run(page, 30);
      ok(s, `NONCOMMERCIAL_FILES ${nc}`);
      assert.equal(s.dialog, 'C4StartupMainDlg', `NONCOMMERCIAL_FILES ${nc}: the main menu opens`);
      assert.deepEqual(s.paper, { w: 628, h: 483 }, `NONCOMMERCIAL_FILES ${nc}: the dialog paper has the original's size`);
      assert.ok(s.dialogs.includes('C4StartupPlrPropertiesDlg'), `NONCOMMERCIAL_FILES ${nc}: the player properties open on their background`);
      await page.close();
    }
  });
});

test('a network game from the start menu: "Network game", a scenario, the site\'s lobby, the round as a client of the module', { skip, timeout: 1_800_000 }, async () => {
  await withBrowser(async (open) => {
    // a player file from a first start
    let page = await open();
    await boot(page, {});
    await run(page, 300, 'C4StartupMainDlg');
    await run(page, 30);
    await type(page, 'Tester');
    await run(page, 5);
    await key(page, 'Enter', 'Enter');
    await run(page, 30);
    // quit: the config (with the new player taking part) goes to the storage
    await evalIn(page, '$.Application.Quit$v();');
    await run(page, 2);
    const storage = await storageOf(page);
    await page.close();

    page = await open();
    await boot(page, storage, { online: true });
    let s = await run(page, 300, 'C4StartupMainDlg');
    s = await run(page, 30);
    ok(s, 'main menu');
    s = await press(page, 'OnNetJoinBtn', 120);
    ok(s, 'network game');
    assert.equal(s.dialog, 'C4StartupScenSelDlg', '"Network game" opens the scenario selection');
    assert.equal(await evalIn(page, 'return $.Game.NetworkActive;'), true, 'in network mode (Game.NetworkActive)');
    const folder = await find(page, { text: 'Arena' });
    assert.ok(folder, 'the Arena folder is listed');
    await click(page, folder!.at, true);
    s = await run(page, 120);
    const scen = await find(page, { text: 'Flint Brawl' });
    assert.ok(scen, 'Flint Brawl is listed');
    await click(page, scen!.at, true);
    s = await run(page, 60);
    // a melee for two with one player: in network mode the original only warns that more must join (in its lobby)
    assert.equal(s.modal, 1, `the original's warning that more players must join (${s.dialogs})`);
    await key(page, 'Enter', 'Enter');
    s = await run(page, 400);
    ok(s, 'the round');
    const net = await page.evaluate(() => (globalThis as any).ocMenuNet());
    assert.equal(net.lobby?.options.scenario, 'Arena.ocf/FlintBrawl.ocs', `the lobby makes rooms with the chosen scenario (${JSON.stringify(net.lobby)})`);
    assert.equal(net.lobby?.options.controlRate, 3, 'and the original\'s control rate (Config.Network.ControlRate)');
    assert.ok(s.frame > 100, `the round runs (frame ${s.frame}, app state ${s.appState})`);
    const infos = await evalIn(page, `const l = $.Game.PlayerInfos; const out = [l.GetPlayerCount(), $.Control$2.ClientID(), $.Game.Clients.getLocal().isActivated()];
      for (let i = 0, c; (c = l.GetIndexedInfo(i)); i++) for (let j = 0; j < c.GetPlayerCount(); j++) { const p = c.GetPlayerInfo$i32(j); out.push([c.GetClientID(), p.GetID(), p.HasJoinIssued(), p.GetFilename() ? String.fromCharCode(...Array.from(p.GetFilename().a.slice(p.GetFilename().o, p.GetFilename().o + 60)).filter(x => x > 0)) : null]); }
      out.push(String.fromCharCode(...Array.from($.Game.PlayerFilenames.slice(0, 60)).filter(x => x > 0)));
      return JSON.stringify(out);`);
    assert.ok(s.players.includes('Tester'), `the player joined (${infos}) through the control (${s.players}; ${JSON.stringify(net)})\n${s.log.join('\n')}`);
    assert.equal(await evalIn(page, 'return $.Control$2.eMode;'), 2, 'the control queue in network mode (CM_Network)');
    assert.equal(await evalIn(page, 'return $.Control$2.ClientID();'), 1, 'as client seat + 1');
    assert.ok(net.controls > 30 && net.packets >= 2, `control went to the module (${JSON.stringify(net)})`);
    assert.ok(net.checks >= 1, 'and a sync check');
    await page.close();
  });
});
