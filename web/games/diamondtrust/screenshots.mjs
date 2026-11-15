// Screenshots for the game page (node scripts/screenshots.mjs diamondtrust):
// the title/board and a hot-seat month after the pass screen.
export default async function (page, shot) {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  await page.waitForSelector('.dt-map', { timeout: 20000 });
  await wait(1200);
  await shot('title.png');
  await page.click('[data-act="local"]');
  await wait(300);
  await page.click('.dt-pass [data-act="ready"]');
  await wait(300);
  await shot('board.png');
}
