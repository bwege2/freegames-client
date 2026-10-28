// Screenshots for the game page (npm run build && node scripts/screenshots.mjs adventure). The walk
// to the grate has no chance in it, so the shots come out the same every time. The last one also
// checks save and resume through the server: the game saved in the first play is resumed in a second.
export default async function (page, shot) {
  const text = () => page.evaluate(() => document.querySelector('.fg-term-page').textContent.replace('█', ''));
  const waitFor = async (re) => {
    for (let i = 0; i < 100; i++) {
      if (re.test(await text())) return;
      await new Promise((r) => setTimeout(r, 50));
    }
    throw new Error(`waited in vain for ${re}; the screen ends with:\n${(await text()).slice(-600)}`);
  };
  // leaving stops the game: no play running, the terminal (and with it its listeners) gone
  const stopped = async (how) => {
    const left = await page.evaluate(() => ({ running: window.__freegames.stats.running, terminal: !!document.querySelector('.fg-term') }));
    if (left.running !== 0 || left.terminal) throw new Error(`${how} left the game running: ${JSON.stringify(left)}`);
    console.log(`${how}: the game stopped`);
  };
  const type = async (s) => {
    await page.keyboard.type(s);
    await page.keyboard.press('Enter');
    await new Promise((r) => setTimeout(r, 120));
  };
  await page.waitForSelector('.fg-term-page');
  await waitFor(/Would you like instructions\?\s*> $/);
  await type('yes');
  await shot('welcome.png');

  for (const c of ['in', 'take lamp', 'take keys', 'out', 's', 's', 's', 'unlock grate', 'd', 'light lamp', 'w']) await type(c);
  await waitFor(/crawling over cobbles/);
  await shot('cave.png');

  await type('save');
  await type('y');
  await waitFor(/File name: $/);
  await type('cave-walk');
  await waitFor(/To resume your Adventure, start a new game/);
  await page.keyboard.press('Enter'); // the end of the program: back to the game page
  await page.waitForSelector('.play');
  await stopped('the end of the program');
  await page.click('.play');
  await page.waitForSelector('.fg-term-page');
  await waitFor(/Would you like instructions\?\s*> $/);
  await type('n');
  await type('resume');
  await waitFor(/File name: $/);
  await type('cave-walk');
  await waitFor(/You're in cobble crawl\./); // resumed where it was saved (seen before: the short description)
  await type('inventory');
  await waitFor(/Brass lantern/);
  await shot('resume.png');

  await page.click('.player-bar .bar-button'); // ← Back
  await page.waitForSelector('.play');
  await stopped('Back');
}
