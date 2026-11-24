// Screenshots of the 0 A.D. slice, for its game page. Driven through the page's real UI; the
// only direct calls frame the camera and fast-forward the simulation so a shot shows a real
// game state (no unit or resource is created for a screenshot).
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function (page, shot) {
  await page.waitForFunction(() => document.body.innerText.includes('Start skirmish'), { timeout: 120000 });
  await wait(800);
  await shot('menu.png');

  // the other civilisation: choose Carthage in the menu, start, and show its Punic village
  await page.select('.ad-menu select', 'cart');
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((x) => x.textContent.includes('Start skirmish'));
    b?.click();
  });
  await page.waitForFunction(() => window.__0ad?.world?.entitiesOf(1).some((e) => e.template.startsWith('structures/cart/')), { timeout: 60000 });
  await wait(4500);
  await page.evaluate(() => {
    const s = window.__0ad.scene;
    s.camera.distance = 76;
    s.camera.pitch = 0.70;
    s.camera.yaw = 0.22;
    s.camera.focus(205, 390);
  });
  await wait(1500);
  await shot('carthage.png');

  // back to the menu and start an Athenian skirmish for the remaining shots
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => [...document.querySelectorAll('.ad-menu')].some((m) => m.style.display !== 'none' && m.querySelector('h1')?.textContent === 'Paused'), { timeout: 10000 });
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((x) => x.textContent === 'Main menu');
    b?.click();
  });
  await page.waitForFunction(() => [...document.querySelectorAll('.ad-menu')].some((m) => m.style.display !== 'none' && m.querySelector('h1')?.textContent === '0 A.D.'), { timeout: 10000 });
  await page.select('.ad-menu select', 'athen');
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((x) => x.textContent.includes('Start skirmish'));
    b?.click();
  });
  await page.waitForFunction(() => window.__0ad?.world?.entitiesOf(1).some((e) => e.template.startsWith('structures/athen/')), { timeout: 60000 });
  await wait(5000);
  await page.evaluate(() => {
    const s = window.__0ad.scene;
    s.camera.distance = 76;
    s.camera.pitch = 0.70;
    s.camera.yaw = 0.22;
    s.camera.focus(205, 390);
  });
  await wait(1500);
  await shot('village.png');

  // select the nearest civilian with a real left click, so the selection panel and the building
  // commands are the ones a player sees
  const civilian = await page.evaluate(() => {
    const s = window.__0ad.scene;
    for (let y = 180; y < 680; y += 6) {
      for (let x = 100; x < 1150; x += 6) {
        const e = s.pick(x, y);
        if (e && e.kind === 'unit' && e.player === 1 && e.role === 'civilian') return { x, y };
      }
    }
    return null;
  });
  if (civilian) {
    await page.mouse.click(civilian.x, civilian.y);
    await wait(900);
    await page.evaluate(() => {
      const s = window.__0ad.scene;
      s.camera.distance = 56;
      s.camera.pitch = 0.70;
      s.camera.focus(199, 386);
    });
    await wait(700);
    await shot('commands.png');
  }

  // show the terrain from farther out: the explored circle, the unseen edges and the minimap
  await page.evaluate(() => {
    const s = window.__0ad.scene;
    s.camera.distance = 170;
    s.camera.pitch = 0.95;
    s.camera.focus(260, 430);
  });
  await wait(1200);
  await shot('fog.png');
}
