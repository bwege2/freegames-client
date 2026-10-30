// The rules of 2048, as the original's js/game_manager.js: one move slides and merges the tiles,
// spawns one new tile and scores the merged values; 2048 wins the game, "Keep going" continues it
// past 2048, and the game is over when no move is left. The managers around it (input, screen,
// storage) are the original's interfaces, passed in instead of constructed here.
import { Grid, type GridState } from './grid.ts';
import { Tile } from './tile.ts';

/** 0: up, 1: right, 2: down, 3: left (the original's order). */
export type Direction = 0 | 1 | 2 | 3;

export interface GameState {
  grid: GridState;
  score: number;
  over: boolean;
  won: boolean;
  keepPlaying: boolean;
}

export interface ActuateMeta {
  score: number;
  over: boolean;
  won: boolean;
  bestScore: number;
  terminated: boolean;
}

export interface Actuator {
  actuate(grid: Grid, metadata: ActuateMeta): void;
  continueGame(): void;
}

/** What the original's LocalStorageManager did, with the server's storage behind it. */
export interface StorageManager {
  getBestScore(): number;
  setBestScore(score: number): void;
  getGameState(): GameState | null;
  setGameState(gameState: GameState): void;
  clearGameState(): void;
}

export interface InputManager {
  on(event: string, callback: (data?: Direction) => void): void;
}

export class GameManager {
  readonly size: number;
  grid!: Grid;
  score = 0;
  over = false;
  won = false;
  keepPlaying = false;

  private readonly startTiles = 2;
  private readonly inputManager: InputManager;
  private readonly actuator: Actuator;
  private readonly storageManager: StorageManager;
  private readonly random: () => number;

  constructor(size: number, inputManager: InputManager, actuator: Actuator, storageManager: StorageManager,
    random: () => number = Math.random) {
    this.size = size;
    this.inputManager = inputManager;
    this.storageManager = storageManager;
    this.actuator = actuator;
    this.random = random;

    // The original binds its keepPlaying method here, before setup() puts a boolean of the same
    // name on the instance; the port keeps the boolean and names the method keepPlayingGame.
    this.inputManager.on('move', (direction) => this.move(direction!));
    this.inputManager.on('restart', () => this.restart());
    this.inputManager.on('keepPlaying', () => this.keepPlayingGame());

    this.setup();
  }

  /** Restart the game. */
  restart(): void {
    this.storageManager.clearGameState();
    this.actuator.continueGame(); // Clear the game won/lost message
    this.setup();
  }

  /** Keep playing after winning (allows going over 2048). */
  keepPlayingGame(): void {
    this.keepPlaying = true;
    this.actuator.continueGame(); // Clear the game won/lost message
  }

  /** True if the game is lost, or has won and the user hasn't kept playing. */
  isGameTerminated(): boolean {
    return this.over || (this.won && !this.keepPlaying);
  }

  /** Set up the game. */
  private setup(): void {
    const previousState = this.storageManager.getGameState();

    // Reload the game from a previous game if present
    if (previousState) {
      this.grid = new Grid(previousState.grid.size, previousState.grid.cells, this.random);
      this.score = previousState.score;
      this.over = previousState.over;
      this.won = previousState.won;
      this.keepPlaying = previousState.keepPlaying;
    } else {
      this.grid = new Grid(this.size, undefined, this.random);
      this.score = 0;
      this.over = false;
      this.won = false;
      this.keepPlaying = false;

      // Add the initial tiles
      this.addStartTiles();
    }

    // Update the actuator
    this.actuate();
  }

  /** Set up the initial tiles to start the game with. */
  private addStartTiles(): void {
    for (let i = 0; i < this.startTiles; i++) this.addRandomTile();
  }

  /** Adds a tile in a random position. */
  private addRandomTile(): void {
    if (this.grid.cellsAvailable()) {
      const value = this.random() < 0.9 ? 2 : 4;
      const tile = new Tile(this.grid.randomAvailableCell()!, value);
      this.grid.insertTile(tile);
    }
  }

  /** Sends the updated grid to the actuator. */
  private actuate(): void {
    if (this.storageManager.getBestScore() < this.score) this.storageManager.setBestScore(this.score);

    // Clear the state when the game is over (game over only, not win)
    if (this.over) this.storageManager.clearGameState();
    else this.storageManager.setGameState(this.serialize());

    this.actuator.actuate(this.grid, {
      score: this.score,
      over: this.over,
      won: this.won,
      bestScore: this.storageManager.getBestScore(),
      terminated: this.isGameTerminated(),
    });
  }

  /** Represent the current game as an object. */
  serialize(): GameState {
    return {
      grid: this.grid.serialize(),
      score: this.score,
      over: this.over,
      won: this.won,
      keepPlaying: this.keepPlaying,
    };
  }

  /** Save all tile positions and remove merger info. */
  private prepareTiles(): void {
    this.grid.eachCell((_x, _y, tile) => {
      if (tile) {
        tile.mergedFrom = null;
        tile.savePosition();
      }
    });
  }

  /** Move a tile and its representation. */
  private moveTile(tile: Tile, cell: { x: number; y: number }): void {
    this.grid.cells[tile.x][tile.y] = null;
    this.grid.cells[cell.x][cell.y] = tile;
    tile.updatePosition(cell);
  }

  /** Move tiles on the grid in the specified direction. */
  move(direction: Direction): void {
    if (this.isGameTerminated()) return; // Don't do anything if the game's over

    const vector = this.getVector(direction);
    const traversals = this.buildTraversals(vector);
    let moved = false;

    // Save the current tile positions and remove merger information
    this.prepareTiles();

    // Traverse the grid in the right direction and move tiles
    traversals.x.forEach((x) => {
      traversals.y.forEach((y) => {
        const cell = { x, y };
        const tile = this.grid.cellContent(cell);

        if (tile) {
          const positions = this.findFarthestPosition(cell, vector);
          const next = this.grid.cellContent(positions.next);

          // Only one merger per row traversal?
          if (next && next.value === tile.value && !next.mergedFrom) {
            const merged = new Tile(positions.next, tile.value * 2);
            merged.mergedFrom = [tile, next];

            this.grid.insertTile(merged);
            this.grid.removeTile(tile);

            // Converge the two tiles' positions
            tile.updatePosition(positions.next);

            // Update the score
            this.score += merged.value;

            // The mighty 2048 tile
            if (merged.value === 2048) this.won = true;
          } else {
            this.moveTile(tile, positions.farthest);
          }

          if (!this.positionsEqual(cell, tile)) moved = true; // The tile moved from its original cell!
        }
      });
    });

    if (moved) {
      this.addRandomTile();

      if (!this.movesAvailable()) this.over = true; // Game over!

      this.actuate();
    }
  }

  /** Get the vector representing the chosen direction. */
  private getVector(direction: Direction): { x: number; y: number } {
    // Vectors representing tile movement
    const map: Record<Direction, { x: number; y: number }> = {
      0: { x: 0, y: -1 }, // Up
      1: { x: 1, y: 0 }, // Right
      2: { x: 0, y: 1 }, // Down
      3: { x: -1, y: 0 }, // Left
    };
    return map[direction];
  }

  /** Build a list of positions to traverse in the right order. */
  private buildTraversals(vector: { x: number; y: number }): { x: number[]; y: number[] } {
    let x: number[] = [];
    let y: number[] = [];
    for (let pos = 0; pos < this.size; pos++) {
      x.push(pos);
      y.push(pos);
    }
    // Always traverse from the farthest cell in the chosen direction
    if (vector.x === 1) x = x.reverse();
    if (vector.y === 1) y = y.reverse();
    return { x, y };
  }

  private findFarthestPosition(cell: { x: number; y: number }, vector: { x: number; y: number }): {
    farthest: { x: number; y: number };
    next: { x: number; y: number };
  } {
    let previous;
    // Progress towards the vector direction until an obstacle is found
    do {
      previous = cell;
      cell = { x: previous.x + vector.x, y: previous.y + vector.y };
    } while (this.grid.withinBounds(cell) && this.grid.cellAvailable(cell));

    return {
      farthest: previous,
      next: cell, // Used to check if a merge is required
    };
  }

  private movesAvailable(): boolean {
    return this.grid.cellsAvailable() || this.tileMatchesAvailable();
  }

  /** Check for available matches between tiles (more expensive check). */
  private tileMatchesAvailable(): boolean {
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        const tile = this.grid.cellContent({ x, y });
        if (tile) {
          for (let direction = 0; direction < 4; direction++) {
            const vector = this.getVector(direction as Direction);
            const cell = { x: x + vector.x, y: y + vector.y };
            const other = this.grid.cellContent(cell);
            if (other && other.value === tile.value) return true; // These two tiles can be merged
          }
        }
      }
    }
    return false;
  }

  private positionsEqual(first: { x: number; y: number }, second: { x: number; y: number }): boolean {
    return first.x === second.x && first.y === second.y;
  }
}
