// Screenshots for the game page (npm run build && node scripts/screenshots.mjs pokerth): a local game with
// ten players, the player on "auto check/call any" (F8), shot preflop and at a showdown.
export default async function (page, shot) {
  const log = () => page.evaluate(() => document.querySelector('.pth .log')?.textContent ?? '');
  await page.waitForSelector('.pth-start button.big');
  await page.click('.pth-start button.big');
  await page.waitForSelector('.pth-dialog');
  const buttons = await page.$$('.pth-dialog .buttons button');
  await buttons[buttons.length - 1].click();
  await page.waitForSelector('.pth');
  // the first player to act preflop: shot when the second action is in the log
  for (let i = 0; i < 300; i++) {
    if ((await log()).match(/calls|folds|bets/g)?.length >= 2) break;
    await new Promise((r) => setTimeout(r, 100));
  }
  await shot('table.png');
  await page.keyboard.press('F8');
  await page.keyboard.press('F2');
  // the next showdown: a hand shown with its name, then the winner's cards stay bright
  const shows = (await log()).split(' - "').length;
  for (let i = 0; i < 3000; i++) {
    const l = await log();
    if (l.split(' - "').length > shows && l.lastIndexOf(' wins $') > l.lastIndexOf(' - "')) break;
    await new Promise((r) => setTimeout(r, 100));
  }
  await new Promise((r) => setTimeout(r, 1500));
  await shot('showdown.png');
}
