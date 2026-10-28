// Screenshots for the game page (node scripts/screenshots.mjs worms): the demonstration the program
// starts with, a person's worm being taught (the green worm asks where to go), and a game further on.
export default async function (page, shot) {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  await page.waitForSelector('.player-host canvas');
  // the character set is built (about two seconds on the C64), then the demonstration plays
  await page.waitForFunction(() => (window.__worms?.frames() ?? 0) > 1400, { timeout: 60000 });
  await shot('demonstration.png');
  // F7 ends the demonstration, F7 starts a game: the new worm (green) asks at once
  await page.keyboard.press('F7');
  await page.waitForFunction(() => window.__worms.screen()[20 * 40] === 0x06, { timeout: 30000 }); // "F7:START ..."
  await wait(300);
  await page.keyboard.press('9'); // the fastest speed
  await wait(300);
  await page.keyboard.press('F7');
  await wait(1500);
  await shot('teaching.png');
  // answer every question for a while: turn once or twice with space, then RETURN
  for (let i = 0; i < 40; i++) {
    for (let k = 0; k < i % 3; k++) {
      await page.keyboard.press('Space');
      await wait(120);
    }
    await page.keyboard.press('Enter');
    await wait(450);
  }
  await shot('game.png');
}
