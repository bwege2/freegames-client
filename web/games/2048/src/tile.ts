// A tile of 2048, as the original's js/tile.js: its cell, its value, where it was before the move
// (for the CSS transition) and the two tiles it was merged from (for the pop animation).

export interface Position {
  x: number;
  y: number;
}

export interface TileState {
  position: Position;
  value: number;
}

export class Tile {
  x: number;
  y: number;
  value: number;
  previousPosition: Position | null = null;
  mergedFrom: Tile[] | null = null; // the tiles that merged into this one

  constructor(position: Position, value?: number) {
    this.x = position.x;
    this.y = position.y;
    this.value = value || 2;
  }

  savePosition(): void {
    this.previousPosition = { x: this.x, y: this.y };
  }

  updatePosition(position: Position): void {
    this.x = position.x;
    this.y = position.y;
  }

  serialize(): TileState {
    return { position: { x: this.x, y: this.y }, value: this.value };
  }
}
