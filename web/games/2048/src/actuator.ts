// The screen of 2048, as the original's js/html_actuator.js: every actuation redraws all tiles in
// a fresh frame, reusing the previous position of a moved tile so the CSS transition slides it,
// rendering the two source tiles under a merge for the pop, and fading in the win/lose message.
// The original asks window.requestAnimationFrame for these redraws; this keeps that timing and
// cancels what is still pending when the player leaves.
import type { ActuateMeta, Actuator } from './game.ts';
import type { Grid } from './grid.ts';
import type { Tile } from './tile.ts';

export class Frames {
  private readonly ids = new Set<number>();

  request(callback: FrameRequestCallback): number {
    let id = 0;
    id = requestAnimationFrame((time) => {
      this.ids.delete(id);
      callback(time);
    });
    this.ids.add(id);
    return id;
  }

  cancelAll(): void {
    for (const id of this.ids) cancelAnimationFrame(id);
    this.ids.clear();
  }
}

export class HTMLActuator implements Actuator {
  private readonly tileContainer: HTMLElement;
  private readonly scoreContainer: HTMLElement;
  private readonly bestContainer: HTMLElement;
  private readonly messageContainer: HTMLElement;
  private readonly frames: Frames;
  private score = 0;

  constructor(root: ParentNode, frames: Frames) {
    this.frames = frames;
    this.tileContainer = root.querySelector('.tile-container')!;
    this.scoreContainer = root.querySelector('.score-container')!;
    this.bestContainer = root.querySelector('.best-container')!;
    this.messageContainer = root.querySelector('.game-message')!;
  }

  actuate(grid: Grid, metadata: ActuateMeta): void {
    this.frames.request(() => {
      this.clearContainer(this.tileContainer);

      grid.cells.forEach((column) => {
        column.forEach((cell) => {
          if (cell) this.addTile(cell);
        });
      });

      this.updateScore(metadata.score);
      this.updateBestScore(metadata.bestScore);

      if (metadata.terminated) {
        if (metadata.over) this.message(false); // You lose
        else if (metadata.won) this.message(true); // You win!
      }
    });
  }

  /** Continues the game (both restart and keep playing). */
  continueGame(): void {
    this.clearMessage();
  }

  private clearContainer(container: HTMLElement): void {
    while (container.firstChild) container.removeChild(container.firstChild);
  }

  private addTile(tile: Tile): void {
    const wrapper = document.createElement('div');
    const inner = document.createElement('div');
    const position = tile.previousPosition || { x: tile.x, y: tile.y };
    const classes = ['tile', `tile-${tile.value}`, this.positionClass(position)];

    if (tile.value > 2048) classes.push('tile-super');

    this.applyClasses(wrapper, classes);

    inner.classList.add('tile-inner');
    inner.textContent = String(tile.value);

    if (tile.previousPosition) {
      // Make sure that the tile gets rendered in the previous position first
      this.frames.request(() => {
        classes[2] = this.positionClass({ x: tile.x, y: tile.y });
        this.applyClasses(wrapper, classes); // Update the position
      });
    } else if (tile.mergedFrom) {
      classes.push('tile-merged');
      this.applyClasses(wrapper, classes);

      // Render the tiles that merged
      tile.mergedFrom.forEach((merged) => this.addTile(merged));
    } else {
      classes.push('tile-new');
      this.applyClasses(wrapper, classes);
    }

    // Add the inner part of the tile to the wrapper
    wrapper.appendChild(inner);

    // Put the tile on the board
    this.tileContainer.appendChild(wrapper);
  }

  private applyClasses(element: HTMLElement, classes: string[]): void {
    element.setAttribute('class', classes.join(' '));
  }

  private normalizePosition(position: { x: number; y: number }): { x: number; y: number } {
    return { x: position.x + 1, y: position.y + 1 };
  }

  private positionClass(position: { x: number; y: number }): string {
    position = this.normalizePosition(position);
    return `tile-position-${position.x}-${position.y}`;
  }

  private updateScore(score: number): void {
    this.clearContainer(this.scoreContainer);

    const difference = score - this.score;
    this.score = score;

    this.scoreContainer.textContent = String(this.score);

    if (difference > 0) {
      const addition = document.createElement('div');
      addition.classList.add('score-addition');
      addition.textContent = '+' + difference;
      this.scoreContainer.appendChild(addition);
    }
  }

  private updateBestScore(bestScore: number): void {
    this.bestContainer.textContent = String(bestScore);
  }

  private message(won: boolean): void {
    const type = won ? 'game-won' : 'game-over';
    const message = won ? 'You win!' : 'Game over!';

    this.messageContainer.classList.add(type);
    this.messageContainer.getElementsByTagName('p')[0].textContent = message;
  }

  private clearMessage(): void {
    // IE only takes one value to remove at a time.
    this.messageContainer.classList.remove('game-won');
    this.messageContainer.classList.remove('game-over');
  }
}
