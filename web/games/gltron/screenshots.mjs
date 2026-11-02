// Screenshots for the game page (node scripts/screenshots.mjs gltron): the original menu and
// running rounds with the behind and the circling camera. The round starts on the pause screen,
// as GLtron does; a key starts the physics. The player steers with A (left) and S (right).
export default async function (page, shot) {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  await page.setViewport({ width: 1280, height: 1000 });
  await page.waitForSelector('.gltron-app canvas', { timeout: 20000 });
  await wait(4000); // models, fonts, sounds and the soundtrack load
  await shot('menu.png');
  await page.keyboard.press('Enter'); // Game
  await wait(200);
  await page.keyboard.press('Enter'); // Start Game
  await wait(1500);
  await shot('paused.png');
  await page.keyboard.press('KeyX'); // unpause
  const tap = async (key, after) => { await page.keyboard.press(key); await wait(after); };
  await wait(2200);
  await tap('KeyA', 1800); // turn away from the opponents' trails
  await shot('behind.png');
  await page.keyboard.press('F10'); // next camera: cockpit
  await page.keyboard.press('F10'); // mouse camera, treated as behind
  await page.keyboard.press('F10'); // circling camera
  await wait(900);
  await shot('circling.png');
}
