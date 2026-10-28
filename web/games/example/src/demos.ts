// The SDK's terminal and pixel screen, shown from the example game's menu (docs/GAME-INTEGRATION.md
// "Text games", "Pixel screens"). Each demo returns to the menu by resolving.
import { Teletype, TextScreen, PixelScreen, REVERSE, BOLD, type GameContext } from '../../../src/sdk/index.ts';

/** A line-oriented dialogue, as Hunt the Wumpus or Adventure would have it; SCREEN opens the curses demo. */
export async function teletypeDemo(host: HTMLElement, ctx: GameContext): Promise<void> {
  const stop = new AbortController();
  ctx.signal.addEventListener('abort', () => stop.abort(), { once: true });
  const tty = new Teletype(host, { cols: 72, rows: 24, foreground: '#f0e6c8', background: '#1b1a17' }, stop.signal);
  try {
    tty.writeLine('TELETYPE DEMO. TYPE SCREEN FOR THE FULL-SCREEN DEMO, BYE TO LEAVE.');
    for (;;) {
      tty.write('? ');
      const line = (await tty.readLine({ transform: (s) => s.toUpperCase(), maxLength: 60 })).trim();
      if (line === 'BYE') break;
      if (line === 'SCREEN') {
        await screenDemo(host, stop.signal);
        tty.focus();
        continue;
      }
      tty.writeLine(line ? `YOU SAID ${line}.` : 'SAY SOMETHING.');
    }
  } finally {
    stop.abort();
  }
}

/** A curses-style screen: a reverse title bar, a box, an @ moved with the arrow keys; q leaves. */
async function screenDemo(host: HTMLElement, parent: AbortSignal): Promise<void> {
  const stop = new AbortController();
  parent.addEventListener('abort', () => stop.abort(), { once: true });
  const s = new TextScreen(host, { cols: 80, rows: 24 }, stop.signal);
  try {
    s.setAttr(REVERSE);
    s.writeAt(0, 0, ' TextScreen demo: arrows move, q leaves'.padEnd(80));
    s.setAttr(0);
    s.writeAt(2, 10, '+' + '-'.repeat(58) + '+');
    for (let r = 3; r < 20; r++) s.writeAt(r, 10, '|' + ' '.repeat(58) + '|');
    s.writeAt(20, 10, '+' + '-'.repeat(58) + '+');
    let row = 11, col = 40;
    s.showCursor(false);
    for (;;) {
      s.setAttr(BOLD);
      s.writeAt(row, col, '@');
      s.setAttr(0);
      s.writeAt(22, 0, `position ${row},${col}`);
      s.clearToEol();
      const k = await s.readKey();
      if (k.key === 'q') return;
      s.writeAt(row, col, ' ');
      if (k.key === 'ArrowUp') row = Math.max(3, row - 1);
      if (k.key === 'ArrowDown') row = Math.min(19, row + 1);
      if (k.key === 'ArrowLeft') col = Math.max(11, col - 1);
      if (k.key === 'ArrowRight') col = Math.min(68, col + 1);
    }
  } finally {
    stop.abort();
  }
}

/** A 160×100 screen with double-wide pixels (like the C64's multicolour mode); a click paints. Esc leaves. */
export function pixelDemo(host: HTMLElement, ctx: GameContext): Promise<void> {
  return new Promise((resolve) => {
    const stop = new AbortController();
    ctx.signal.addEventListener('abort', () => stop.abort(), { once: true });
    const screen = new PixelScreen(host, { width: 160, height: 100, pixelAspect: 2 }, stop.signal);
    const g = screen.ctx;
    g.fillStyle = '#352879';
    g.fillRect(0, 0, 160, 100);
    g.fillStyle = '#6c5eb5';
    g.fillRect(4, 4, 152, 92);
    let x = 10, y = 10, dx = 1, dy = 1;
    ctx.frame(() => {
      g.fillStyle = '#6c5eb5';
      g.fillRect(x, y, 2, 2);
      x += dx; y += dy;
      if (x < 5 || x > 153) dx = -dx;
      if (y < 5 || y > 93) dy = -dy;
      g.fillStyle = '#f2c14e';
      g.fillRect(x, y, 2, 2);
    }, stop.signal);
    screen.canvas.addEventListener('pointerdown', (e) => {
      const p = screen.toPixel(e.clientX, e.clientY);
      if (!p) return;
      g.fillStyle = '#ffffff';
      g.fillRect(p.x, p.y, 1, 1);
    }, { signal: stop.signal });
    window.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      stop.abort();
      resolve();
    }, { signal: stop.signal });
  });
}
