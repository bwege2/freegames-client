// Screenshots for the game page (node scripts/screenshots.mjs teeworlds): a deathmatch on dm1 with three more
// players in browsers of their own, then capture the flag on ctf1 in the red base.
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export default async (page, shot) => {
  const browser = page.browser();
  const base = page.url().replace(/#.*$/, '');
  const hasButton = (p, text) => p.waitForFunction((t) => [...document.querySelectorAll('button')].some((b) => b.textContent === t), { timeout: 30000 }, text);
  const click = async (p, text) => {
    await hasButton(p, text);
    for (const b of await p.$$('button')) if ((await b.evaluate((e) => e.textContent)) === text) return b.click();
  };
  const online = (p) => p.waitForFunction(() => { const s = window.__teeworlds?.snapshot(); return s && s.state === 3 && s.localId >= 0; }, { timeout: 30000 });
  const snap = (p) => p.evaluate(() => window.__teeworlds?.snapshot() ?? null);
  const settings = (p, st) => p.evaluate((st) => {
    for (const l of document.querySelectorAll('label')) {
      const v = st[l.firstChild?.textContent];
      if (v === undefined) continue;
      const i = l.querySelector('select, input');
      i.value = v;
      i.dispatchEvent(new Event('change'));
    }
  }, st);
  /** another player, joining the room of `host` */
  const other = async (name, host) => {
    const p = await (await browser.createBrowserContext()).newPage();
    await p.setViewport({ width: 800, height: 600 });
    await p.goto(base, { waitUntil: 'networkidle0' });
    await p.evaluate((n) => localStorage.setItem('freegames-name', n), name);
    await p.goto(`${base}#/teeworlds/play`, { waitUntil: 'networkidle0' });
    await p.waitForFunction((h) => [...document.querySelectorAll('li')].some((li) => li.textContent.includes(h) && li.querySelector('button')), { timeout: 30000 }, host);
    // the newest room of that name (the list is in the order the rooms were made)
    for (const li of (await p.$$('li')).reverse()) {
      if (!(await li.evaluate((e, h) => e.textContent.includes(h), host))) continue;
      await (await li.$('button')).click();
      break;
    }
    await online(p);
    return p;
  };
  /** every player runs to the tee nearest to it, jumping, hooking up and shooting now and then */
  const fight = async (players, ms) => {
    const end = Date.now() + ms;
    for (let i = 0; Date.now() < end; i++) {
      for (const [k, o] of players.entries()) {
        await o.evaluate((i, k) => {
          const t = window.__teeworlds;
          const s = t?.snapshot();
          const self = s?.players.find((q) => q.id === s.localId);
          if (!t || !self?.alive) return;
          let best = null;
          for (const q of s.players) if (q.id !== s.localId && q.alive && (!best || Math.hypot(q.x - self.x, q.y - self.y) < Math.hypot(best.x - self.x, best.y - self.y))) best = q;
          // nobody in sight: walk left and right in long turns without jumping, so that they all end up on the
          // lowest floor
          const dx = best ? best.x - self.x : (Math.floor(i / 40 + k) % 2 ? 1000 : -1000), dy = best ? best.y - self.y : 0;
          const right = Math.abs(dx) > 120 ? dx > 0 : (i + k) % 8 < 4;
          t.key(right ? 'd' : 'a', true);
          t.key(right ? 'a' : 'd', false);
          t.key('space', !!best && ((i + k) % 5 === 0 || dy < -60));
          // hook up towards the target when it is above
          t.aim(dy < -60 ? Math.sign(dx) * 150 : dx || 1, dy < -60 ? -250 : dy);
          t.key('mouse2', dy < -60 && i % 6 < 4);
          t.key('mouse1', Math.hypot(dx, dy) < 400 && (i + k) % 7 === 0);
        }, i, k);
      }
      await wait(120);
    }
  };
  const near = (s) => {
    const me = s.players.find((q) => q.id === s.localId);
    return me ? s.players.filter((q) => q.id !== s.localId && q.alive && Math.abs(q.x - me.x) < 450 && Math.abs(q.y - me.y) < 280).length : 0;
  };

  // ---- deathmatch on dm1
  await page.evaluate(() => localStorage.setItem('freegames-name', 'Anna'));
  await page.reload({ waitUntil: 'networkidle0' });
  await hasButton(page, 'Create room');
  await settings(page, { 'Game type': 'dm', 'Map': 'dm1', 'Warmup (seconds)': '0' });
  await click(page, 'Create room');
  await click(page, 'Start');
  await online(page);
  const others = [];
  for (const n of ['Bert', 'Cara', 'Dora']) others.push(await other(n, 'Anna'));
  await wait(2000);
  // Anna fires now and then; the others come to her
  for (let tries = 0; tries < 120; tries++) {
    await fight([page, ...others], 1000);
    const s = await snap(page);
    const n = s.players.find((q) => q.id === s.localId)?.alive ? near(s) : 0;
    if (n >= 2 || (n >= 1 && tries > 60)) break;
  }
  for (const o of [page, ...others]) await o.evaluate(() => { const t = window.__teeworlds; for (const k of ['a', 'd', 'space', 'mouse1', 'mouse2']) t.key(k, false); });
  await shot('battle.png');
  for (const o of others) await o.browserContext().close();

  // ---- capture the flag on ctf1: Anna in the red base, Bert in the blue team
  await page.click('.player-bar button');
  await page.waitForSelector('.page .play', { timeout: 10000 });
  await page.goto(`${base}#/teeworlds/play`, { waitUntil: 'networkidle0' });
  await hasButton(page, 'Create room');
  await settings(page, { 'Game type': 'ctf', 'Map': 'ctf1', 'Warmup (seconds)': '0' });
  await click(page, 'Create room');
  await click(page, 'Start');
  await online(page);
  const bert = await other('Bert', 'Anna');
  // the game starts when both teams have a player (the warmup's "wait for more players" ends)
  await page.waitForFunction(() => (window.__teeworlds.snapshot().gameStateFlags & 1) === 0, { timeout: 15000 }).catch(() => {});
  await wait(3000);
  // Anna walks to her flag's stand
  for (let i = 0; i < 40; i++) {
    const s = await snap(page);
    const me = s.players.find((q) => q.id === s.localId);
    const flag = s.flags.find((f) => f.team === me?.team);
    if (!me?.alive || !flag) { await wait(200); continue; }
    const dx = flag.x - me.x;
    if (Math.abs(dx) < 90) break;
    await page.evaluate((dx) => { const t = window.__teeworlds; t.key(dx > 0 ? 'd' : 'a', true); t.key(dx > 0 ? 'a' : 'd', false); t.aim(Math.sign(dx) * 200, -30); }, dx);
    await wait(150);
  }
  await page.evaluate(() => { const t = window.__teeworlds; t.key('a', false); t.key('d', false); });
  await wait(800);
  await shot('ctf.png');
  await bert.browserContext().close();
};
