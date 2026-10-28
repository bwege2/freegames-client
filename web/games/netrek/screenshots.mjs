// Screenshots for the game page (node scripts/screenshots.mjs netrek): a galaxy of one's own, COW's team
// selection, then a fight with the practice robot.
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export default async (page, shot) => {
  const button = async (text) => {
    await page.waitForFunction((t) => [...document.querySelectorAll('button')].some((b) => b.textContent === t), { timeout: 15000 }, text);
    for (const b of await page.$$('button')) if ((await b.evaluate((e) => e.textContent)) === text) return b;
  };
  const snap = () => page.evaluate(() => window.__netrek?.snapshot() ?? null);
  const clickX = async (x, y, b = 'left') => {
    const r = await page.evaluate(() => { const c = document.querySelector('.player-host canvas'); const q = c.getBoundingClientRect(); return { x: q.x, y: q.y, w: q.width, h: q.height, cw: c.width, ch: c.height }; });
    await page.mouse.click(r.x + (x + 0.5) * r.w / r.cw, r.y + (y + 0.5) * r.h / r.ch, { button: b });
  };
  await page.evaluate(() => localStorage.setItem('freegames-name', 'Anna'));
  await page.reload({ waitUntil: 'networkidle0' });
  await (await button('Create room')).click();
  await (await button('Start')).click();
  await page.waitForFunction(() => !!window.__netrek?.snapshot(), { timeout: 15000 });
  await wait(1500);
  await page.focus('.player-host');
  await page.keyboard.press('Enter');
  await wait(2500);
  for (let i = 0; i < 2; i++) {
    await page.keyboard.type('secret', { delay: 60 });
    await page.keyboard.press('Enter');
    await wait(2500);
  }
  await wait(2000);
  await shot('teams.png');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => { const s = window.__netrek?.snapshot(); return s && s.players.some((q) => q.no === s.me && q.status === 2); }, { timeout: 20000 });
  await page.keyboard.down('Shift');
  await page.keyboard.press('Digit8');
  await page.keyboard.up('Shift');
  await wait(3000);
  // fly towards the robot and shoot at it
  for (let i = 0; i < 40; i++) {
    const s = await snap();
    const me = s.players.find((q) => q.no === s.me);
    const bot = s.players.find((q) => q.no !== s.me && q.status === 2);
    if (me?.status !== 2) {
      await page.keyboard.press('Enter');
      await wait(2000);
      continue;
    }
    await page.keyboard.press('3');
    if (bot) {
      const dx = bot.x - me.x, dy = bot.y - me.y;
      const d = Math.hypot(dx, dy) || 1;
      const tx = 250 + Math.round(120 * dx / d), ty = 250 + Math.round(120 * dy / d);
      await clickX(tx, ty, 'right');
      if (d < 8000) await clickX(tx, ty, 'left');
      if (d < 6000) {
        await clickX(tx, ty, 'left');
        await wait(250);
        break;
      }
    }
    await wait(400);
  }
  await shot('battle.png');
};
