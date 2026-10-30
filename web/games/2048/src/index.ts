// 2048 on the website: the original's page (index.html) and its four parts — the rules in game.ts
// (js/game_manager.js), the screen in actuator.ts (js/html_actuator.js), the keys and swipes in
// input.ts (js/keyboard_input_manager.js), and the best score and running game in storage.ts
// (js/local_storage_manager.js, in the player's account on the server). The 500 px column is scaled
// to fit the player window; it is 280 px wide on a narrow window, as the original's mobile layout.
import { HTMLActuator, Frames } from './actuator.ts';
import { GameManager } from './game.ts';
import { KeyboardInput } from './input.ts';
import { ServerStorage } from './storage.ts';
import type { StartGame } from '../../../src/sdk/index.ts';
import './style.css';

const GRID_ROWS = 4;
const GRID_CELLS = 4;

const gridRows = Array.from({ length: GRID_ROWS },
  () => `<div class="grid-row">${'<div class="grid-cell"></div>'.repeat(GRID_CELLS)}</div>`).join('');

const TEMPLATE = `
<div class="viewport">
  <div class="stage">
    <div class="container">
      <div class="heading">
        <h1 class="title">2048</h1>
        <div class="scores-container">
          <div class="score-container">0</div>
          <div class="best-container">0</div>
        </div>
      </div>

      <div class="above-game">
        <p class="game-intro">Join the numbers and get to the <strong>2048 tile!</strong></p>
        <a class="restart-button">New Game</a>
      </div>

      <div class="game-container">
        <div class="game-message">
          <p></p>
          <div class="lower">
            <a class="keep-playing-button">Keep going</a>
            <a class="retry-button">Try again</a>
          </div>
        </div>

        <div class="grid-container">${gridRows}</div>

        <div class="tile-container"></div>
      </div>

      <p class="game-explanation">
        <strong class="important">How to play:</strong> Use your <strong>arrow keys</strong> to move the tiles. When two tiles with the same number touch, they <strong>merge into one!</strong>
      </p>
      <hr>
      <p>
        Created by <a href="http://gabrielecirulli.com" target="_blank" rel="noopener">Gabriele Cirulli.</a> Based on <a href="https://itunes.apple.com/us/app/1024!/id823499224" target="_blank" rel="noopener">1024 by Veewo Studio</a> and conceptually similar to <a href="http://asherv.com/threes/" target="_blank" rel="noopener">Threes by Asher Vollmer.</a>
      </p>
    </div>
  </div>
</div>`;

export const start: StartGame = async (host, ctx) => {
  const root = document.createElement('div');
  root.className = 'game-root';
  root.style.visibility = 'hidden'; // until it has its size
  root.innerHTML = TEMPLATE;
  host.append(root);

  const storage = await ServerStorage.load(ctx.storage, ctx.signal);
  if (ctx.signal.aborted) {
    root.remove();
    return { stop() {} };
  }

  const stage = root.querySelector('.stage') as HTMLElement;
  const gameContainer = root.querySelector('.game-container') as HTMLElement;
  const frames = new Frames();
  const live = new AbortController(); // everything of the game: ends with ctx.signal or stop()
  const actuator = new HTMLActuator(root, frames);
  const input = new KeyboardInput(root, gameContainer, live.signal);
  new GameManager(4, input, actuator, storage);

  // the original's 500 px page (280 px below 520 px) scaled to the window below the site's bar
  const fit = (): void => {
    if (live.signal.aborted) return;
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (!w || !h) return;
    const narrow = w <= 520;
    root.classList.toggle('narrow', narrow);
    stage.style.transform = 'none';
    const width = stage.offsetWidth;
    const height = stage.offsetHeight;
    if (!width || !height) return;
    const gutter = narrow ? 40 : 16; // the original's page margin on a phone, a little air on a desktop
    const scale = Math.max(0.05, Math.min((w - gutter) / width, (h - 16) / height));
    stage.style.transform = `scale(${scale})`;
  };
  const observer = new ResizeObserver(fit);
  observer.observe(host);
  observer.observe(stage);
  fit();
  void document.fonts?.ready.then(fit);
  root.style.visibility = '';

  const end = (): void => {
    live.abort();
    observer.disconnect();
    frames.cancelAll();
  };
  ctx.signal.addEventListener('abort', end, { once: true });

  return {
    async stop() {
      end();
      root.remove();
      await storage.flush(1000); // the last best score or game state on its way to the server
    },
  };
};
