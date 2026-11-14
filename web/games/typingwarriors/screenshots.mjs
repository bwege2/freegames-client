// Screenshots for the game page (npm run build && node scripts/screenshots.mjs typingwarriors).
// Plays a few seconds of a race, of Word Loot and of Switch Wars against bots, and opens the course.
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export default async function (page, shot) {
  const click = async (selector, text) => {
    await page.waitForFunction((s, t) => [...document.querySelectorAll(s)].some((e) => e.textContent.includes(t)), {}, selector, text);
    await page.evaluate((s, t) => [...document.querySelectorAll(s)].find((e) => e.textContent.includes(t)).click(), selector, text);
    await wait(150);
  };
  const select = async (index, value) => {
    await page.evaluate((i, v) => {
      const s = document.querySelectorAll('.tw-main select, .tw-me select')[i];
      s.value = v;
      s.dispatchEvent(new Event('change'));
    }, index, value);
    await wait(150);
  };
  /** types what the round asks for, for a while: the text's next characters, or a word of the pool */
  const play = async (ms, until = '') => {
    const end = Date.now() + ms;
    while (Date.now() < end) {
      if (until && await page.$(until)) return;
      const next = await page.evaluate(() => {
        if (!document.querySelector('.tw-count.tw-hidden')) return null;
        const cur = document.querySelector('.tw-pad .tw-cur');
        if (cur) return cur.classList.contains('tw-space') ? ' ' : cur.textContent;
        const mine = document.querySelector('.tw-slot-mine .tw-slot-word');
        if (mine) return mine.lastChild.textContent[0];
        const any = document.querySelector('.tw-slot .tw-slot-word');
        return any ? any.textContent[0] : null;
      });
      if (next) await page.keyboard.type(next);
      await wait(70);
    }
  };
  const bots = async (n) => { for (let i = 0; i < n; i++) await click('.tw-btn', '+'); };

  await page.waitForSelector('.tw-home');
  await select(0, 'qwerty');
  await shot('menu.png');

  // a race against four bots
  await click('.tw-tile', 'Duel');
  await bots(3);
  await click('.tw-btn', 'Play the bots now');
  await page.waitForSelector('.tw-pad');
  await play(9000);
  await shot('race.png');
  await click('.tw-back', '←');

  // Word Loot
  await page.waitForSelector('.tw-home');
  await click('.tw-tile', 'Duel');
  await click('.tw-mode', 'Word Loot');
  await click('.tw-btn', 'Play the bots now');
  await page.waitForSelector('.tw-pool');
  await play(9000);
  await shot('loot.png');
  await click('.tw-back', '←');

  // Switch Wars, QWERTY and Dvorak (the keys puppeteer sends are QWERTY's: it types the first
  // segment, and its next key is refused)
  await page.waitForSelector('.tw-home');
  await click('.tw-tile', 'Duel');
  await click('.tw-mode', 'Switch Wars');
  await click('.tw-btn', 'Play the bots now');
  await page.waitForSelector('.tw-banner');
  await play(12000, '.tw-banner-now');
  await page.keyboard.type('x');
  await wait(300);
  await shot('switch.png');
  await click('.tw-back', '←');

  // the course of Neo 2 and one of its lessons
  await page.waitForSelector('.tw-home');
  await select(0, 'neo2');
  await click('.tw-tile', 'Course');
  await page.waitForSelector('.tw-lessons');
  await shot('course.png');
  await click('.tw-lesson', '3');
  await page.waitForSelector('.tw-pad');
  await play(400);
  await shot('lesson.png');
}
