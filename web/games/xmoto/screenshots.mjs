// Screenshots for the game page (node scripts/screenshots.mjs xmoto): the level packs over the title
// screen, and the first Classical level ridden to the left (turned round with Space, throttle open for a second).
export default async function (page, shot) {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const click = (text) => page.evaluate((t) => {
    const b = [...document.querySelectorAll('.player-host button')].find((x) => x.textContent.startsWith(t));
    if (b) b.click();
    return !!b;
  }, text);
  await page.waitForSelector('.player-host button', { timeout: 60000 });
  await wait(1500);
  await click('Levels');
  await wait(800);
  await shot('menu.png');
  await click('Classical');
  await wait(500);
  await click('Over or under');
  await wait(3000);
  await page.keyboard.press('Space');
  await wait(400);
  await page.keyboard.down('ArrowUp');
  await wait(1200);
  await shot('playing.png');
  await page.keyboard.up('ArrowUp');
}
