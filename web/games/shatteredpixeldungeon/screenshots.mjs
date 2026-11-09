// Screenshots for the game page: node scripts/screenshots.mjs shatteredpixeldungeon (after npm run build)
// A new player: the welcome screen leads to the hero selection (the warrior chosen), a new game, its first floor
// (the guidebook picked up with a tap, read in the journal, so that the original's guide shows the whole
// interface), the hero's window, then the game menu back to the title screen. The game's hooks (src/index.ts,
// debugHooks) say which scene is shown and where its buttons are.
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export default async (page, shot) => {
  const spd = (f, ...a) => page.evaluate((f, a) => window.shatteredpixeldungeon?.[f]?.(...a), f, a);
  const until = async (what, pred, tries = 900) => {
    for (let i = 0; i < tries; i++) {
      const v = await pred().catch(() => null);
      if (v) return v;
      await wait(100);
    }
    throw new Error('screenshots: no ' + what);
  };
  const scene = (name) => until(name, async () => (await spd('scene')) === name);
  const canvas = async () => page.evaluate(() => { const r = document.querySelector('.player-host canvas').getBoundingClientRect(); return { x: r.left, y: r.top }; });
  const click = async (b) => { const c = await canvas(); await page.mouse.click(c.x + b.x + b.w / 2, c.y + b.y + b.h / 2); };
  const button = (pred, what) => until(what, async () => (await spd('buttons')).find(pred));
  const log = async (what) => console.log(what, JSON.stringify((await spd('buttons')).map((b) => `${b.cls} "${b.text}"`)));

  await page.waitForSelector('.player-host canvas', { timeout: 120000 });
  await until('scene', async () => typeof (await spd('scene')) === 'string');
  if ((await spd('scene')) === 'WelcomeScene') {
    await wait(1500);
    await click(await button((b) => b.cls.startsWith('WelcomeScene'), 'the welcome button'));
  } else {
    await scene('TitleScene');
    await click(await button((b) => b.cls.startsWith('TitleScene') && /play|enter/i.test(b.text ?? ''), 'the play button'));
  }
  await scene('HeroSelectScene');
  await wait(1500);
  await click(await button((b) => b.cls.endsWith('HeroBtn'), 'a hero'));
  await wait(1500);
  await shot('hero-select.png');
  await log('hero chosen');

  await click(await button((b) => b.cls.startsWith('HeroSelectScene') && /start/i.test(b.text ?? ''), 'the start button'));
  // the region's story (InterlevelScene): Continue
  await click(await button((b) => b.cls.startsWith('InterlevelScene') && /continue/i.test(b.text ?? ''), 'the story'));
  await scene('GameScene');
  const ready = () => until('the hero', async () => (await spd('hero'))?.ready && (await spd('windows')).length === 0);
  await ready();
  const closeWindows = async () => {
    for (let i = 0; i < 50 && (await spd('windows')).length > 0; i++) { await page.keyboard.press('Escape'); await wait(400); }
  };
  // a new player's first game shows its interface step by step, as the original's guide does: pick up the
  // guidebook next to the hero (a tap on its cell), then a few steps
  const heaps = await spd('heaps');
  const hero = await spd('hero');
  if (heaps.length) {
    const w = hero.width;
    const d = (a) => Math.hypot((a % w) - (hero.pos % w), Math.floor(a / w) - Math.floor(hero.pos / w));
    const near = heaps.sort((a, b) => d(a) - d(b))[0];
    const c = await canvas(), p = await spd('cell', near);
    await page.mouse.click(c.x + p.x, c.y + p.y);
    await wait(1000);
    await ready();
    // the guide: read the book in the journal (J)
    await page.keyboard.press('KeyJ');
    await wait(1500);
    await closeWindows();
    await ready();
  }
  for (const k of ['KeyS', 'KeyD', 'KeyW', 'KeyA']) {
    await page.keyboard.press(k);
    await wait(250);
    await closeWindows();
    await ready();
  }
  await wait(1500);
  await shot('dungeon.png');

  // the hero's window (H)
  await page.keyboard.press('KeyH');
  await until('the hero window', async () => (await spd('windows')).some((w) => /WndHero/.test(w)));
  await wait(1200);
  await shot('hero.png');
  await closeWindows();

  // the game menu, back to the title screen (the game is saved)
  await page.keyboard.press('Escape');
  await until('the game menu', async () => (await spd('windows')).length > 0);
  await log('menu');
  await click(await button((b) => /main menu/i.test(b.text ?? ''), 'main menu'));
  await scene('TitleScene');
  await wait(3000);
  await shot('title.png');
  await log('title');
};
