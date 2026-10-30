// The keys and swipes of 2048, as the original's js/keyboard_input_manager.js: arrow keys, the vim
// keys H J K L and W A S D move (unless a modifier is held), R starts a new game, a swipe of more
// than 10 pixels on the board moves, and "Keep going" and "Try again" are pressed with a click or a
// tap. The original read event.which (keyCode); this reads both that and event.key.
import type { Direction, InputManager } from './game.ts';

interface KeyEventLike {
  key?: string;
  keyCode?: number;
  which?: number;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
}

const WHICH: Record<number, Direction> = {
  38: 0, // Up
  39: 1, // Right
  40: 2, // Down
  37: 3, // Left
  75: 0, // Vim up
  76: 1, // Vim right
  74: 2, // Vim down
  72: 3, // Vim left
  87: 0, // W
  68: 1, // D
  83: 2, // S
  65: 3, // A
};

const KEY: Record<string, Direction> = {
  ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3,
  k: 0, l: 1, j: 2, h: 3,
  w: 0, d: 1, s: 2, a: 3,
};

/** The direction a key means, or null (the original's map). */
export function directionOf(event: KeyEventLike): Direction | null {
  const which = event.which ?? event.keyCode;
  if (which && which in WHICH) return WHICH[which];
  if (!event.key) return null;
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  return KEY[key] ?? null;
}

/** Whether a key restarts the game (the original's R, keyCode 82). */
export function isRestartKey(event: KeyEventLike): boolean {
  const which = event.which ?? event.keyCode;
  return which === 82 || event.key === 'r' || event.key === 'R';
}

/** The direction of a swipe: more than 10 pixels, the longer axis wins (dx : dy as in the original). */
export function swipeDirection(dx: number, dy: number): Direction | null {
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  if (Math.max(absDx, absDy) > 10) return absDx > absDy ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0);
  return null;
}

/** What a key press does: the original ignores every key with a modifier held. */
export type KeyAction = { type: 'move'; direction: Direction } | { type: 'restart' } | null;

export function keyAction(event: KeyEventLike): KeyAction {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return null;
  const direction = directionOf(event);
  if (direction !== null) return { type: 'move', direction };
  if (isRestartKey(event)) return { type: 'restart' };
  return null;
}

export class KeyboardInput implements InputManager {
  private readonly events: Record<string, ((data?: Direction) => void)[]> = {};

  constructor(root: HTMLElement, gameContainer: HTMLElement, signal: AbortSignal) {
    document.addEventListener('keydown', (event) => this.keydown(event), { signal });

    // Respond to button presses
    this.bindButtonPress(root, '.retry-button', (event) => this.restart(event), signal);
    this.bindButtonPress(root, '.restart-button', (event) => this.restart(event), signal);
    this.bindButtonPress(root, '.keep-playing-button', (event) => this.keepPlaying(event), signal);

    // Respond to swipe events
    let touchStartClientX = 0;
    let touchStartClientY = 0;

    gameContainer.addEventListener('touchstart', (event) => {
      if (event.touches.length > 1 || event.targetTouches.length > 1) return; // Ignore if touching with more than 1 finger
      touchStartClientX = event.touches[0].clientX;
      touchStartClientY = event.touches[0].clientY;
      event.preventDefault();
    }, { signal, passive: false });

    gameContainer.addEventListener('touchmove', (event) => {
      event.preventDefault();
    }, { signal, passive: false });

    gameContainer.addEventListener('touchend', (event) => {
      if (event.touches.length > 0 || event.targetTouches.length > 0) return; // Ignore if still touching with one or more fingers
      const dx = event.changedTouches[0].clientX - touchStartClientX;
      const dy = event.changedTouches[0].clientY - touchStartClientY;
      const direction = swipeDirection(dx, dy);
      if (direction !== null) this.emit('move', direction);
    }, { signal, passive: false });
  }

  on(event: string, callback: (data?: Direction) => void): void {
    (this.events[event] ??= []).push(callback);
  }

  private emit(event: string, data?: Direction): void {
    const callbacks = this.events[event];
    if (callbacks) callbacks.forEach((callback) => callback(data));
  }

  private keydown(event: KeyboardEvent): void {
    const action = keyAction(event);
    if (!action) return;
    if (action.type === 'move') {
      event.preventDefault();
      this.emit('move', action.direction);
    } else {
      // R key restarts the game
      this.restart(event);
    }
  }

  private restart(event: Event): void {
    event.preventDefault();
    this.emit('restart');
  }

  private keepPlaying(event: Event): void {
    event.preventDefault();
    this.emit('keepPlaying');
  }

  private bindButtonPress(root: HTMLElement, selector: string, fn: (event: Event) => void, signal: AbortSignal): void {
    const button = root.querySelector(selector);
    if (!button) return;
    button.addEventListener('click', fn, { signal });
    button.addEventListener('touchend', fn, { signal });
  }
}
