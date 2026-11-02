// Screenshots for the game page (node scripts/screenshots.mjs gltron): the original menu and a
// running round. The round starts on the pause screen, as GLtron does; a key starts the physics.
export default async function (page, shot) {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  await page.waitForSelector('.gltron-app canvas', { timeout: 20000 });
  await wait(4000); // models, fonts, sounds and the soundtrack load
  await shot('menu.png');
  await page.keyboard.press('Enter'); // Game
  await wait(200);
  await page.keyboard.press('Enter'); // Start Game
  await wait(500);
  await page.keyboard.press('KeyX'); // unpause
  await wait(200);
  for (let i = 0; i < 3; i++) { await page.keyboard.press('F10'); await wait(120); } // circling camera
  await wait(700);
  await page.keyboard.press('KeyA');
  await wait(500);
  await shot('playing.png');
}
