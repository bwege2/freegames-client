// Screenshots for the game page (node scripts/screenshots.mjs darkroom): the firelit room after the
// stranger arrives, and the first Outside screen. A Dark Room's screens are text and buttons; the
// early game takes half a minute of real time, so the script waits through it rather than faking state.
export default async function (page, shot) {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const click = (text) => page.evaluate((t) => {
    const els = [...document.querySelectorAll('.adr-root .button, .adr-root .menuBtn, .adr-root .headerButton')];
    const e = els.find((x) => x.textContent.trim().toLowerCase() === t.toLowerCase())
      ?? els.find((x) => x.textContent.trim().toLowerCase().includes(t.toLowerCase()));
    if (e) { e.click(); return e.textContent.trim(); }
    return null;
  }, text);
  await page.waitForSelector('.adr-root #main', { timeout: 20000 });
  await wait(4000); // the audio question appears three seconds after the game starts
  await click('disable audio');
  await wait(700);
  await click('light fire');
  await wait(32000); // the stranger arrives thirty seconds after the fire is lit
  await shot('room.png');
  await wait(16000); // ... and unlocks the forest fifteen seconds later
  await click('A Silent Forest');
  await wait(1500);
  await shot('outside.png');
}
