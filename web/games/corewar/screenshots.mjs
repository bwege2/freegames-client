// Screenshots for the game page (node scripts/screenshots.mjs corewar): a battle of two of the
// package's example warriors in the core display, then cdb entered from it, then the end of a battle
// with pMARS's results in the terminal.
export default async function (page, shot) {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const button = (text) => page.evaluateHandle((t) => [...document.querySelectorAll('button')].find((x) => x.textContent === t), text);
  const term = () => page.evaluate(() => [...document.querySelectorAll('.cw-term .fg-term-page')].pop()?.textContent ?? '');
  page.on('pageerror', (e) => console.log(`page error: ${e.message}`));
  await page.waitForSelector('.cw-cmd');
  await page.$eval('.cw-cmd', (e) => { e.value = '-r 3 -v 303 warriors/sunset.red warriors/excalibur.red'; });
  await (await button('Run')).click();
  await page.waitForSelector('.cw-xhost.cw-open canvas');
  await wait(4000);
  await shot('battle.png');
  // the debugger: d in the core window, then cdb's commands in its panel
  await page.keyboard.press('d');
  await wait(400);
  for (const c of ['registers', 'list .,+4', 'display 103']) {
    await page.keyboard.type(c);
    await page.keyboard.press('Enter');
    await wait(250);
  }
  await wait(300);
  await shot('cdb.png');
  await page.keyboard.type('continue');
  await page.keyboard.press('Enter');
  // let the battle end: the window waits for a key, then pMARS prints the results
  for (let i = 0; i < 120 && !(await page.evaluate(() => document.querySelector('.cw-xwin-panel')?.textContent.includes('Press any key'))); i++) await wait(500);
  await page.keyboard.press('Enter');
  for (let i = 0; i < 20 && !/Results:/.test(await term()); i++) await wait(250);
  await shot('results.png');
}
