// Pingus's GUI framework: engine/gui (Component, RectComponent, GroupComponent, GUIManager, SurfaceButton),
// engine/screen (Screen, GUIScreen, ScreenManager with its fade between screens) and the input events the
// controller (data/controller/default.scm) makes of the keyboard and mouse.
import { type DrawingContext, type Framebuffer, type Rect, DrawingContext as DC, rect } from './gfx.ts';
import { playSound } from './common.ts';
import { Sprite } from './sprite.ts';

export const SCREEN_W = 800, SCREEN_H = 600;

export type ButtonName = 'primary' | 'secondary' | 'pause' | 'fast-forward' | 'single-step' | 'armageddon' | 'escape'
  | 'action-up' | 'action-down' | `action-${number}`;
export type InputEvent =
  | { type: 'pointer'; x: number; y: number }
  | { type: 'button'; name: ButtonName; pressed: boolean }
  | { type: 'scroll'; dx: number; dy: number }
  | { type: 'key'; key: string };

export const contains = (r: Rect, x: number, y: number) => x >= r.left && x < r.right && y >= r.top && y < r.bottom;

export abstract class Component {
  parent: GroupComponent | null = null;
  focus = false;
  mouseOver = false;
  visible = true;
  hide() { this.visible = false; }
  show() { this.visible = true; }
  abstract draw(gc: DrawingContext): void;
  update(_delta: number): void {}
  isAt(_x: number, _y: number): boolean { return false; }
  onPrimaryButtonPress(_x: number, _y: number): void {}
  onPrimaryButtonRelease(_x: number, _y: number): void {}
  onSecondaryButtonPress(_x: number, _y: number): void {}
  onSecondaryButtonRelease(_x: number, _y: number): void {}
  onPrimaryButtonClick(_x: number, _y: number): void {}
  onSecondaryButtonClick(_x: number, _y: number): void {}
  onPointerEnter(): void {}
  onPointerLeave(): void {}
  onPointerMove(_x: number, _y: number): void {}
  onScrollerMove(_x: number, _y: number): void {}
  onKeyPressed(_key: string): void {}
}

export abstract class RectComponent extends Component {
  rect: Rect;
  constructor(r: Rect) { super(); this.rect = r; }
  isAt(x: number, y: number) { return contains(this.rect, x, y); }
  setRect(r: Rect) { this.rect = r; this.updateLayout(); }
  updateLayout() {}
}

export class GroupComponent extends RectComponent {
  children: Component[] = [];
  dc: DrawingContext;
  private mouseOverComp: Component | null = null;
  private focusedComp: Component | null = null;
  private primaryPressed: Component | null = null;
  private secondaryPressed: Component | null = null;
  constructor(r: Rect, clip = true) { super(r); this.dc = new DC(r, clip); }
  drawBackground(_gc: DrawingContext) {}
  draw(parent: DrawingContext) {
    this.dc.clear();
    this.drawBackground(this.dc);
    for (const c of this.children) if (c.visible) c.draw(this.dc);
    parent.drawContext(this.dc);
  }
  update(delta: number) { for (const c of this.children) if (c.visible) c.update(delta); }
  isAt(x: number, y: number) {
    const p = this.dc.screenToWorld(x, y);
    return super.isAt(x, y) || this.componentAt(p.x, p.y) !== null;
  }
  componentAt(x: number, y: number): Component | null {
    for (let i = this.children.length - 1; i >= 0; i--) {
      const c = this.children[i];
      if (c.visible && c.isAt(x, y)) return c;
    }
    return null;
  }
  add<T extends Component>(c: T): T { c.parent = this; this.children.push(c); return c; }
  updateLayout() { this.dc.rect = this.rect; }
  onPrimaryButtonPress(x: number, y: number) {
    const m = this.dc.screenToWorld(x, y);
    const c = this.componentAt(m.x, m.y);
    if (c) {
      c.onPrimaryButtonPress(m.x, m.y);
      if (this.focusedComp) this.focusedComp.focus = false;
      this.focusedComp = c;
      c.focus = true;
    }
    this.primaryPressed = c;
  }
  onPrimaryButtonRelease(x: number, y: number) {
    const m = this.dc.screenToWorld(x, y);
    const c = this.componentAt(m.x, m.y);
    if (this.primaryPressed) {
      const p = this.primaryPressed;
      p.onPrimaryButtonRelease(m.x, m.y);
      if (c === p) p.onPrimaryButtonClick(m.x, m.y);
      this.primaryPressed = null;
    } else if (c) {
      c.onPrimaryButtonRelease(m.x, m.y);
    }
  }
  onSecondaryButtonPress(x: number, y: number) {
    const m = this.dc.screenToWorld(x, y);
    const c = this.componentAt(m.x, m.y);
    if (c) c.onSecondaryButtonPress(m.x, m.y);
    if (!this.primaryPressed) this.secondaryPressed = c;
  }
  onSecondaryButtonRelease(x: number, y: number) {
    const m = this.dc.screenToWorld(x, y);
    const c = this.componentAt(m.x, m.y);
    if (this.secondaryPressed) {
      const p = this.secondaryPressed;
      p.onSecondaryButtonRelease(m.x, m.y);
      if (c === p) p.onSecondaryButtonClick(m.x, m.y);
      this.secondaryPressed = null;
    } else if (c) {
      c.onSecondaryButtonRelease(m.x, m.y);
    }
  }
  onKeyPressed(key: string) {
    if (this.focusedComp) this.focusedComp.onKeyPressed(key);
    else if (this.mouseOverComp) this.mouseOverComp.onKeyPressed(key);
  }
  onPointerMove(x: number, y: number) {
    const m = this.dc.screenToWorld(x, y);
    if (this.primaryPressed) { this.primaryPressed.onPointerMove(m.x, m.y); return; }
    if (this.secondaryPressed) { this.secondaryPressed.onPointerMove(m.x, m.y); return; }
    const c = this.componentAt(m.x, m.y);
    if (c) c.onPointerMove(m.x, m.y);
    if (c !== this.mouseOverComp) {
      if (this.mouseOverComp) { this.mouseOverComp.mouseOver = false; this.mouseOverComp.onPointerLeave(); }
      if (c) { c.mouseOver = true; c.onPointerEnter(); }
    }
    this.mouseOverComp = c;
  }
  onPointerLeave() {
    if (this.mouseOverComp) { this.mouseOverComp.mouseOver = false; this.mouseOverComp.onPointerLeave(); }
    this.mouseOverComp = null;
  }
}

export class GUIManager extends GroupComponent {
  mouse = { x: 400, y: 300 };
  constructor() { super(rect(0, 0, SCREEN_W, SCREEN_H), false); }
  event(ev: InputEvent) {
    switch (ev.type) {
      case 'pointer':
        this.mouse = { x: Math.trunc(ev.x), y: Math.trunc(ev.y) };
        this.onPointerMove(this.mouse.x, this.mouse.y);
        break;
      case 'button':
        if (ev.name === 'primary') {
          if (ev.pressed) this.onPrimaryButtonPress(this.mouse.x, this.mouse.y);
          else this.onPrimaryButtonRelease(this.mouse.x, this.mouse.y);
        } else if (ev.name === 'secondary') {
          if (ev.pressed) this.onSecondaryButtonPress(this.mouse.x, this.mouse.y);
          else this.onSecondaryButtonRelease(this.mouse.x, this.mouse.y);
        }
        break;
      case 'key': this.onKeyPressed(ev.key); break;
      case 'scroll': this.onScrollerMove(ev.dx, ev.dy); break;
    }
  }
}

/** SurfaceButton: three sprites (normal, pressed, hover) */
export class SurfaceButton extends Component {
  x: number;
  y: number;
  normal: Sprite | null;
  pressedSprite: Sprite | null;
  hover: Sprite | null;
  pressed = false;
  over = false;
  constructor(x: number, y: number, normal: string, pressed: string, hover: string) {
    super();
    this.x = x;
    this.y = y;
    this.normal = normal ? Sprite.load(normal) : null;
    this.pressedSprite = pressed ? Sprite.load(pressed) : null;
    this.hover = hover ? Sprite.load(hover) : null;
  }
  draw(gc: DrawingContext) {
    const s = this.pressed && this.over ? this.pressedSprite : !this.pressed && this.over ? this.hover : this.normal;
    if (s) gc.draw(s, this.x, this.y);
  }
  isAt(x: number, y: number) {
    const w = this.normal?.width ?? 0, h = this.normal?.height ?? 0;
    return x > this.x && x < this.x + w && y > this.y && y < this.y + h;
  }
  onPrimaryButtonPress() { this.pressed = true; }
  onPrimaryButtonRelease() { this.pressed = false; }
  onPointerEnter() { this.over = true; }
  onPointerLeave() { this.over = false; }
  onPrimaryButtonClick() { this.onClick(); }
  onClick() {}
  setPos(x: number, y: number) { this.x = x; this.y = y; }
}

/** a SurfaceButton that ticks when the pointer enters (most of Pingus's buttons) */
export class TickButton extends SurfaceButton {
  private cb: () => void;
  constructor(x: number, y: number, base: string, cb: () => void, suffixes: [string, string] = ['_clicked', '_hover']) {
    super(x, y, base, base + suffixes[0], base + suffixes[1]);
    this.cb = cb;
  }
  onPointerEnter() { super.onPointerEnter(); playSound('tick'); }
  onClick() { this.cb(); }
}

export abstract class Screen {
  size = { width: SCREEN_W, height: SCREEN_H };
  abstract draw(gc: DrawingContext): void;
  abstract update(delta: number): void;
  abstract event(ev: InputEvent): void;
  onStartup(): void {}
}

export class GUIScreen extends Screen {
  gui = new GUIManager();
  drawBackground(_gc: DrawingContext) {}
  drawForeground(_gc: DrawingContext) {}
  draw(gc: DrawingContext) { this.drawBackground(gc); this.gui.draw(gc); this.drawForeground(gc); }
  update(delta: number) { this.gui.update(delta); }
  event(ev: InputEvent) {
    this.gui.event(ev);
    if (ev.type === 'button') {
      if (ev.pressed) {
        switch (ev.name) {
          case 'pause': this.onPausePress(); break;
          case 'single-step': this.onSingleStepPress(); break;
          case 'fast-forward': this.onFastForwardPress(); break;
          case 'armageddon': this.onArmageddonPress(); break;
          case 'escape': this.onEscapePress(); break;
          case 'action-up': this.onActionUpPress(); break;
          case 'action-down': this.onActionDownPress(); break;
        }
      } else if (ev.name === 'fast-forward') {
        this.onFastForwardRelease();
      }
    }
  }
  onPausePress() {}
  onSingleStepPress() {}
  onFastForwardPress() {}
  onFastForwardRelease() {}
  onArmageddonPress() {}
  onEscapePress() {}
  onActionUpPress() {}
  onActionDownPress() {}
}

/** ScreenManager: the stack of screens, events then update then draw each frame, the fade on a change */
export class ScreenManager {
  static instance: ScreenManager;
  screens: Screen[] = [];
  private gc = new DC(rect(0, 0, SCREEN_W, SCREEN_H));
  private fade: { from: Screen; to: Screen; start: number } | null = null;
  private fb: Framebuffer;
  /** called when the last screen is gone (the original quits) */
  onEmpty: () => void = () => {};
  constructor(fb: Framebuffer) { this.fb = fb; ScreenManager.instance = this; }
  current(): Screen | undefined { return this.screens[this.screens.length - 1]; }
  push(s: Screen) { this.screens.push(s); s.onStartup(); }
  pop() {
    this.screens.pop();
    const c = this.current();
    if (c) c.onStartup(); else this.onEmpty();
  }
  replace(s: Screen) { this.screens[this.screens.length - 1] = s; s.onStartup(); }

  /** one frame: delta in seconds, now in ms */
  frame(delta: number, events: InputEvent[], now: number): void {
    if (this.fade) {
      const progress = (now - this.fade.start) / 1000 * 2;
      if (progress <= 1) { this.drawFade(this.fade.from, this.fade.to, progress); return; }
      this.fade = null;
    }
    const last = this.current();
    if (!last) return;
    for (const ev of events) {
      last.event(ev);
      if (last !== this.current()) { this.startFade(last, now); return; }
    }
    if (delta > 1) return; // the original skips frames that took longer than a second
    last.update(delta);
    if (last !== this.current()) { this.startFade(last, now); return; }
    this.render(this.current()!);
  }
  private render(s: Screen) {
    s.draw(this.gc);
    this.gc.render(this.fb, rect(0, 0, SCREEN_W, SCREEN_H));
    this.gc.clear();
  }
  private startFade(old: Screen, now: number) {
    const next = this.current();
    if (!next) return;
    this.fade = { from: old, to: next, start: now };
    this.drawFade(old, next, 0);
  }
  private drawFade(from: Screen, to: Screen, progress: number) {
    const bx = Math.trunc((SCREEN_W / 2) * (1 - progress)), by = Math.trunc((SCREEN_H / 2) * (1 - progress));
    this.render(from);
    this.fb.pushCliprect(rect(bx, by, SCREEN_W - bx, SCREEN_H - by));
    this.render(to);
    this.fb.popCliprect();
  }
}
