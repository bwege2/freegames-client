// Screenshots for the game page (node scripts/screenshots.mjs wumpus). The cave is random: the second
// shot is a fresh game after a few moves (or wherever the first game ended).
export default async function (page, shot) {
  const text = () => page.evaluate(() => document.querySelector('.fg-term-page').textContent);
  const type = async (s) => { await page.keyboard.type(s); await page.keyboard.press('Enter'); await new Promise((r) => setTimeout(r, 150)); };
  await page.waitForSelector('.fg-term-page');
  await type('y');
  await shot('instructions.png');
  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForSelector('.fg-term-page');
  await type('n');
  for (let i = 0; i < 3; i++) {
    const t = await text();
    if (/SAME SET-UP \(Y-N\)\?$/.test(t.trimEnd())) break;
    const tunnels = [...t.matchAll(/TUNNELS LEAD TO +(\d+) +(\d+) +(\d+)/g)].pop().slice(1);
    await type('m');
    await type(tunnels[i % 3]);
  }
  if (!/SAME SET-UP/.test(await text())) {
    const tunnels = [...(await text()).matchAll(/TUNNELS LEAD TO +(\d+) +(\d+) +(\d+)/g)].pop().slice(1);
    await type('s');
    await type('2');
    await type(tunnels[0]);
    await type(tunnels[1]);
  }
  await shot('hunting.png');
}
