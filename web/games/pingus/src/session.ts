// Playing a level: GameSession (screens/game_session.cpp) with its Playfield, CaptureRectangle, ButtonPanel,
// PingusCounter, TimeDisplay, SmallMap and the armageddon, fast forward and pause buttons
// (components/*.cpp), the ResultScreen (screens/result_screen.cpp) and the StartScreen (start_screen.cpp).
import { type ActionName, LEFT, actionScreenName, globals, playMusic, playSound, stopMusic } from './common.ts';
import { breakLine, Fonts, ticksToRealtime } from './fonts.ts';
import { type DrawingContext, type Rect, SceneContext, rect, rgba } from './gfx.ts';
import { Component, GUIScreen, RectComponent, SCREEN_H, SCREEN_W, ScreenManager, TickButton } from './gui.ts';
import type { Pingu } from './pingu.ts';
import { SavegameManager } from './saves.ts';
import { Sprite } from './sprite.ts';
import { Surface } from './surface.ts';
import { type PingusLevel, Server, type SmallMapLike } from './world.ts';
import { GP_BRIDGE, GP_LAVA, GP_NOTHING, GP_SOLID, GP_WATER, type Vec3 } from './common.ts';
import { Entrance } from './worldobjs.ts';

const tr = Math.trunc;

/** GraphicContextState: the playfield's view, limited to the world */
class ViewState {
  r: Rect;
  offset = { x: 0, y: 0 };
  limit: Rect | null = null;
  constructor(w: number, h: number) { this.r = rect(0, 0, w, h); }
  get width() { return this.r.right - this.r.left; }
  get height() { return this.r.bottom - this.r.top; }
  setSize(w: number, h: number) { this.r = rect(this.r.left, this.r.top, this.r.left + w, this.r.top + h); }
  setPos(x: number, y: number) {
    const w = this.width, h = this.height, l = this.limit;
    this.offset.x = -x + tr(w / 2);
    this.offset.y = -y + tr(h / 2);
    if (l) {
      if (-this.offset.x < l.left) this.offset.x = -l.left;
      else if (-this.offset.x + w > l.right) this.offset.x = l.right - l.left > w ? -(l.right - w) : -l.left;
      if (-this.offset.y < l.top) this.offset.y = -l.top;
      else if (-this.offset.y + h > l.bottom) this.offset.y = l.bottom - l.top > h ? -(l.bottom - h) : -l.top;
    }
  }
  getPos() { return { x: -this.offset.x + tr(this.width / 2), y: -this.offset.y + tr(this.height / 2) }; }
  push(gc: SceneContext | DrawingContext) {
    if (gc instanceof SceneContext) { gc.pushModelview(); gc.translate(this.r.left, this.r.top); gc.translate(this.offset.x, this.offset.y); }
    else { gc.pushModelview(); gc.translateBy(this.r.left, this.r.top); gc.translateBy(this.offset.x, this.offset.y); }
  }
  pop(gc: SceneContext | DrawingContext) { gc.popModelview(); }
  screen2world(x: number, y: number) { return { x: x - this.r.left - this.r.left - this.offset.x, y: y - this.r.top - this.r.top - this.offset.y }; }
}

class CaptureRectangle {
  private session: GameSession | null;
  pingu: Pingu | null = null;
  private actionStr = '';
  private good = Sprite.load('game/cursors/capgood');
  private bad = Sprite.load('game/cursors/capbad');
  private arrowLeft = Sprite.load('game/cursors/arrow_left');
  private arrowRight = Sprite.load('game/cursors/arrow_right');
  constructor(s: GameSession | null) { this.session = s; }
  draw(sc: SceneContext) {
    const p = this.pingu;
    if (!p || !p.catchable()) return;
    const c = p.getCenterPos();
    if (this.session && p.action.changeAllowed(this.session.actionName())) sc.color().draw3(this.good, { x: c.x, y: c.y, z: 1000 });
    else sc.color().draw3(this.bad, { x: c.x, y: c.y, z: 1000 });
    sc.color().draw3(p.direction === LEFT ? this.arrowLeft : this.arrowRight, { x: c.x, y: c.y + 2, z: 1000 });
    sc.color().printCenter(Fonts.courierSmall, tr(c.x), tr(c.y - 46), this.actionStr, 1000);
  }
  setPingu(p: Pingu | null) {
    this.pingu = p;
    if (!p) return;
    this.actionStr = p.getName();
    if (p.wallAction || p.fallAction) {
      this.actionStr += '[';
      if (p.wallAction) this.actionStr += p.wallAction.type === 'climber' ? 'c' : '-';
      if (p.fallAction) this.actionStr += p.fallAction.type === 'floater' ? 'f' : '-';
      this.actionStr += ']';
    }
    if (globals.developerMode) this.actionStr += ` Id: ${p.id}`;
  }
}

export class Playfield extends RectComponent {
  private server: Server;
  private session: GameSession | null;
  private currentPingu: Pingu | null = null;
  private mouseScrolling = false;
  private scrollCenter = { x: 0, y: 0 };
  private sc: SceneContext;
  state: ViewState;
  private capture: CaptureRectangle;
  private mouse = { x: 0, y: 0 };
  constructor(server: Server, session: GameSession | null, r: Rect) {
    super(r);
    this.server = server;
    this.session = session;
    this.sc = new SceneContext(r);
    this.state = new ViewState(r.right - r.left, r.bottom - r.top);
    this.capture = new CaptureRectangle(session);
    const w = server.world;
    this.state.limit = rect(0, 0, w.width, w.height);
    const sp = startPos(server);
    this.state.setPos(sp.x, sp.y);
  }
  draw(gc: DrawingContext) {
    this.sc.clear();
    this.state.push(this.sc);
    this.capture.setPingu(this.currentPingu);
    this.capture.draw(this.sc);
    this.server.world.draw(this.sc);
    this.state.pop(this.sc);
    const sc = this.sc;
    gc.drawScene(sc, -10000);
    if (this.mouseScrolling) {
      gc.pushModelview();
      gc.translateBy(this.rect.left, this.rect.top);
      const m = this.mouse, c = this.scrollCenter;
      gc.drawLine(m.x, m.y, c.x, c.y - 15, rgba(0, 255, 0));
      gc.drawLine(m.x, m.y, c.x, c.y + 15, rgba(0, 0, 255));
      gc.drawLine(m.x, m.y, c.x + 15, c.y, rgba(0, 255, 255));
      gc.drawLine(m.x, m.y, c.x - 15, c.y, rgba(255, 255, 0));
      gc.drawLine(m.x, m.y, c.x, c.y, rgba(255, 0, 0));
      gc.popModelview();
    }
  }
  private find(x: number, y: number): Pingu | null {
    let min = 500, best: Pingu | null = null;
    for (const p of this.server.world.pingus.pingus) {
      if (p.isOver(tr(x), tr(y))) {
        const d = p.dist(tr(x), tr(y));
        if (d < min) { min = d; best = p; }
      }
    }
    return best;
  }
  update(_delta: number) {
    if (!this.mouseScrolling) {
      const w = this.state.screen2world(this.mouse.x, this.mouse.y);
      this.currentPingu = this.find(w.x, w.y);
      this.capture.setPingu(this.currentPingu);
    } else {
      const p = this.state.getPos();
      this.state.setPos(p.x - tr((this.scrollCenter.x - this.mouse.x) * Math.fround(0.2)), p.y - tr((this.scrollCenter.y - this.mouse.y) * Math.fround(0.2)));
    }
    // autoscrolling only works in full screen or with the mouse grabbed, neither of which the page has
  }
  onPrimaryButtonPress(x: number, y: number) {
    x -= this.rect.left; y -= this.rect.top;
    if (this.session) {
      const w = this.state.screen2world(x, y);
      this.currentPingu = this.find(w.x, w.y);
      if (this.currentPingu) this.server.sendPinguActionEvent(this.currentPingu, this.session.actionName());
    }
  }
  onSecondaryButtonPress(x: number, y: number) {
    this.mouseScrolling = true;
    this.scrollCenter = { x: x - this.rect.left, y: y - this.rect.top };
  }
  onSecondaryButtonRelease() { this.mouseScrolling = false; }
  onPointerMove(x: number, y: number) { this.mouse = { x: x - this.rect.left, y: y - this.rect.top }; }
  getPos() { return this.state.getPos(); }
  setViewpoint(x: number, y: number) { this.state.setPos(x, y); }
  scroll(x: number, y: number) { const p = this.state.getPos(); this.state.setPos(p.x + x, p.y + y); }
  updateLayout() { this.state.setSize(this.rect.right - this.rect.left, this.rect.bottom - this.rect.top); this.sc.setRect(this.rect); }
}

/** World::get_start_pos: the middle of the player's entrances, 100 below */
function startPos(server: Server) {
  let x = 0, y = 0, n = 0;
  for (const o of server.world.objs) {
    if (o instanceof Entrance && o.ownerId === 0) { x += tr(o.pos.x); y += tr(o.pos.y); n++; }
  }
  if (n > 0) { x = tr(x / n); y = tr(y / n) + 100; }
  return { x, y };
}

class ButtonPanel extends RectComponent {
  private server: Server;
  private background = Sprite.load('core/buttons/buttonbackground');
  private highlight = Sprite.load('core/buttons/buttonbackgroundhl');
  buttons: { name: ActionName; sprite: Sprite }[] = [];
  current = 0;
  private showTip = false;
  private tip = 0;
  constructor(s: Server, x: number, y: number) {
    super(rect(0, 0, 0, 0));
    this.server = s;
    const actions = s.actionHolder.availableActions();
    this.rect = rect(x, y - tr(actions.length * 38 / 2), x + 60, y - tr(actions.length * 38 / 2) + actions.length * 38);
    for (const a of actions) {
      const sp = Sprite.load(`pingus/player0/${a}/right`);
      sp.setHotspot('center', 0, 0);
      sp.setPlayLoop(true);
      this.buttons.push({ name: a, sprite: sp });
    }
  }
  draw(gc: DrawingContext) {
    const ah = this.server.actionHolder, r = this.rect;
    this.buttons.forEach((b, i) => {
      gc.draw(this.current === i ? this.highlight : this.background, r.left, r.top + 38 * i);
      gc.draw(b.sprite, r.left + 20, r.top + 38 * i + 16);
      if (globals.developerMode) gc.printLeft(Fonts.pingusSmall, r.left + 46, r.top + 5 + 38 * i, `${ah.getAvailable(b.name)} / ${ah.getUsed(b.name)}`);
      else gc.printCenter(Fonts.pingusSmall, r.left + 46, r.top + 5 + 38 * i, String(ah.getAvailable(b.name)));
      if (this.showTip && this.tip === i) gc.printLeft(Fonts.pingusSmall, r.left + 65, r.top + 5 + 38 * i, actionScreenName(b.name));
    });
  }
  update(delta: number) { this.buttons.forEach((b, i) => { if (i === this.current) b.sprite.update(delta); else b.sprite.setFrame(0); }); }
  actionName(): ActionName { return this.buttons[this.current]?.name ?? 'walker'; }
  /** set_button: its test is n >= 0 || n < size-1, so any n is taken */
  setButton(n: number) { this.current = n; }
  next() { this.current = (this.current + 1 + this.buttons.length) % this.buttons.length; }
  previous() { this.current = (this.current - 1 + this.buttons.length) % this.buttons.length; }
  onPrimaryButtonPress(_x: number, y: number) { this.current = Math.max(0, Math.min(tr((y - this.rect.top) / 38), this.buttons.length - 1)); }
  onPointerEnter() { this.showTip = true; }
  onPointerLeave() { this.showTip = false; }
  onPointerMove(_x: number, y: number) { this.tip = Math.max(0, Math.min(tr((y - this.rect.top) / 38), this.buttons.length - 1)); }
  setPos(x: number, y: number) {
    const n = this.buttons.length;
    this.rect = rect(x, y - tr(n * 38 / 2), x + 60, y - tr(n * 38 / 2) + n * 38);
  }
}

class PingusCounter extends Component {
  private server: Server;
  private background = Sprite.load('core/buttons/info');
  constructor(s: Server) { super(); this.server = s; }
  draw(gc: DrawingContext) {
    gc.draw(this.background, tr(gc.width / 2), 0);
    const p = this.server.world.pingus;
    const d3 = (n: number) => String(n).padStart(3, ' ');
    gc.printCenter(Fonts.pingusSmallFixnum, tr(gc.width / 2), -2,
      `Released:${d3(p.released)}/${p.allowed}   Out:${d3(p.alive)}   Saved:${d3(p.exited)}/${this.server.plf.numberToSave}`);
  }
}

class TimeDisplay extends Component {
  private server: Server;
  constructor(s: Server) { super(); this.server = s; }
  draw(gc: DrawingContext) {
    const plf = this.server.plf;
    if (plf.time !== -1 || globals.developerMode) {
      let t = this.server.world.time;
      if (plf.time !== -1 && !globals.developerMode) t = t - plf.time;
      gc.printRight(Fonts.pingusSmallFixnum, SCREEN_W - 30, 3, ticksToRealtime(t), 150);
    }
  }
}

class SmallMapImage {
  private server: Server;
  private w: number;
  private h: number;
  private count = 0;
  private serial = 0;
  sprite: Sprite;
  constructor(s: Server, w: number, h: number) { this.server = s; this.w = w; this.h = h; this.sprite = this.make(); }
  update(delta: number) {
    this.count = Math.fround(this.count + delta);
    if (this.count > 1) {
      this.count = 0;
      if (this.serial !== this.server.world.colmap.serial) this.sprite = this.make();
    }
  }
  private make(): Sprite {
    const cm = this.server.world.colmap;
    this.serial = cm.serial;
    const s = Surface.rgba(this.w, this.h);
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const v = cm.data[tr(x * cm.width / this.w) + tr(y * cm.height / this.h) * cm.width];
        const c = v === GP_NOTHING ? [0, 0, 0] : v === GP_BRIDGE ? [0, 255, 100] : v === GP_SOLID ? [100, 100, 125]
          : v === GP_WATER || v === GP_LAVA ? [0, 0, 200] : [200, 200, 200];
        s.px.set([c[0], c[1], c[2], 255], (y * this.w + x) * 4);
      }
    }
    return Sprite.fromSurface(s);
  }
}

class SmallMap extends RectComponent implements SmallMapLike {
  private server: Server;
  private playfield: Playfield;
  private image: SmallMapImage;
  private scrollMode = false;
  private gc: DrawingContext | null = null;
  constructor(s: Server, pf: Playfield, r: Rect) {
    super(r);
    this.server = s;
    this.playfield = pf;
    this.image = new SmallMapImage(s, r.right - r.left, r.bottom - r.top);
  }
  draw(gc: DrawingContext) {
    this.gc = gc;
    const w = this.server.world, r = this.rect, rw = r.right - r.left, rh = r.bottom - r.top;
    const of = this.playfield.getPos();
    const v = rect(r.left, r.top, r.right, r.bottom);
    if (w.width > gc.width) {
      const rwidth = tr(gc.width * rw / w.width);
      v.left = r.left + tr(of.x * rw / w.width) - tr(rwidth / 2);
      v.right = v.left + rwidth;
    }
    if (w.height > gc.height) {
      const rheight = tr(gc.height * rh / w.height);
      v.top = r.top + tr(of.y * rh / w.height) - tr(rheight / 2);
      v.bottom = v.top + rheight;
    }
    gc.draw(this.image.sprite, r.left, r.top);
    gc.drawRect(v, rgba(0, 255, 0));
    w.drawSmallmap(this);
    const f = Math.fround;
    for (const p of w.pingus.pingus) {
      const x = tr(f(r.left + f(f(p.x * rw) / w.width))), y = tr(f(r.top + f(f(p.y * rh) / w.height)));
      gc.drawLine(x, y, x, y - 2, rgba(255, 255, 0));
    }
    this.gc = null;
  }
  update(delta: number) { this.image.update(delta); }
  drawSprite(s: Sprite, pos: Vec3) {
    const w = this.server.world, r = this.rect, f = Math.fround;
    const x = f(r.left + f(f(pos.x * (r.right - r.left)) / w.width)), y = f(r.top + f(f(pos.y * (r.bottom - r.top)) / w.height));
    this.gc?.draw3(s, { x, y, z: 0 });
  }
  isAt(x: number, y: number) { return x > this.rect.left && x < this.rect.right && y > this.rect.top && y < this.rect.bottom; }
  onPointerMove(x: number, y: number) {
    if (!this.scrollMode) return;
    const w = this.server.world, r = this.rect;
    this.playfield.setViewpoint((x - r.left) * tr(w.width / (r.right - r.left)), (y - r.top) * tr(w.height / (r.bottom - r.top)));
  }
  onPrimaryButtonPress(x: number, y: number) {
    this.scrollMode = true;
    const w = this.server.world, r = this.rect;
    this.playfield.setViewpoint(tr((x - r.left) * w.width / (r.right - r.left)), tr((y - r.top) * w.height / (r.bottom - r.top)));
  }
  onPrimaryButtonRelease() { this.scrollMode = false; }
}

class HButton extends RectComponent {
  protected bg = Sprite.load('core/buttons/hbuttonbgb');
  protected bghl = Sprite.load('core/buttons/hbuttonbg');
  constructor(x: number, y: number) { super(rect(x, y, x + 38, y + 60)); }
  draw(_gc: DrawingContext) {}
}
class ArmageddonButton extends HButton {
  private server: Server;
  private pressed = false;
  private pressTime = 0;
  private sprite = Sprite.load('core/buttons/armageddon_anim');
  constructor(s: Server, x: number, y: number) { super(x, y); this.server = s; }
  draw(gc: DrawingContext) {
    if (this.server.world.doArmageddon) { gc.draw(this.bghl, this.rect.left, this.rect.top); gc.draw(this.sprite, this.rect.left, this.rect.top); }
    else { gc.draw(this.bg, this.rect.left, this.rect.top); this.sprite.setFrame(7); gc.draw(this.sprite, this.rect.left, this.rect.top); }
  }
  update(delta: number) {
    this.sprite.update(delta);
    if (this.pressed) {
      this.pressTime = Math.fround(this.pressTime + delta);
      if (this.pressTime > 1) { this.pressTime = 0; this.pressed = false; }
    } else { this.pressTime = 0; }
  }
  onPrimaryButtonClick() { if (this.pressed) this.server.sendArmageddonEvent(); else this.pressed = true; }
}
class ForwardButton extends HButton {
  private session: GameSession;
  private surface = Sprite.load('core/buttons/fast_forward');
  constructor(s: GameSession, x: number, y: number) { super(x, y); this.session = s; }
  draw(gc: DrawingContext) {
    gc.draw(this.session.fastForward ? this.bghl : this.bg, this.rect.left, this.rect.top);
    gc.draw(this.surface, this.rect.left, this.rect.top);
  }
  onPrimaryButtonPress() { this.session.setFastForward(true); }
  onPrimaryButtonRelease() { this.session.setFastForward(false); }
}
class PauseButton extends HButton {
  private session: GameSession;
  private surface = Sprite.load('core/buttons/pause');
  constructor(s: GameSession, x: number, y: number) { super(x, y); this.session = s; }
  draw(gc: DrawingContext) {
    gc.draw(this.session.pause ? this.bghl : this.bg, this.rect.left, this.rect.top);
    gc.draw(this.surface, this.rect.left, this.rect.top);
  }
  onPrimaryButtonClick() { this.session.setPause(!this.session.pause); }
}

export interface Result { plf: PingusLevel; saved: number; killed: number; total: number; needed: number; maxTime: number; usedTime: number }

export class GameSession extends GUIScreen {
  readonly plf: PingusLevel;
  private showResult: boolean;
  readonly server: Server;
  private worldDelay = 0;
  private buttonPanel: ButtonPanel;
  private playfield: Playfield;
  pause = false;
  fastForward = false;
  private singleStep = false;
  /** the recorded demo of the level when it ends (Server's demostream; the browser keeps the last one) */
  static onDemo: ((name: string, text: string) => void) | null = null;

  constructor(plf: PingusLevel, showResult: boolean) {
    super();
    this.plf = plf;
    this.showResult = showResult;
    this.server = new Server(plf, true);
    const w = this.server.world;
    this.buttonPanel = new ButtonPanel(this.server, 0, tr((SCREEN_H - 150) / 2));
    this.playfield = new Playfield(this.server, this, rect(Math.max(tr((SCREEN_W - w.width) / 2), 0), Math.max(tr((SCREEN_H - w.height) / 2), 0),
      Math.max(tr((SCREEN_W - w.width) / 2), 0) + Math.min(SCREEN_W, w.width), Math.max(tr((SCREEN_H - w.height) / 2), 0) + Math.min(SCREEN_H, w.height)));
    this.gui.add(this.playfield);
    this.gui.add(this.buttonPanel);
    this.gui.add(new PingusCounter(this.server));
    this.gui.add(new SmallMap(this.server, this.playfield, rect(5, SCREEN_H - 105, 5 + 175, SCREEN_H - 105 + 100)));
    this.gui.add(new TimeDisplay(this.server));
    this.gui.add(new ArmageddonButton(this.server, SCREEN_W - 40, SCREEN_H - 62));
    this.gui.add(new ForwardButton(this, SCREEN_W - 40 * 2, SCREEN_H - 62));
    this.gui.add(new PauseButton(this, SCREEN_W - 40 * 3, SCREEN_H - 62));
  }
  actionName(): ActionName { return this.buttonPanel.actionName(); }
  drawBackground(gc: DrawingContext) {
    const r = this.playfield.rect;
    if (r.left !== 0 || r.top !== 0 || r.right !== SCREEN_W || r.bottom !== SCREEN_H) {
      const black = rgba(0, 0, 0);
      gc.drawFillrect(rect(0, 0, SCREEN_W, r.top), black);
      gc.drawFillrect(rect(0, r.bottom, SCREEN_W, SCREEN_H), black);
      gc.drawFillrect(rect(0, r.top, r.left, r.bottom), black);
      gc.drawFillrect(rect(r.right, r.top, SCREEN_W, r.bottom), black);
    }
  }
  private updateServer(delta: number) {
    const s = this.server;
    if (s.isFinished()) {
      const ph = s.world.pingus;
      const result: Result = {
        plf: s.plf, saved: ph.exited, killed: ph.killed, total: s.plf.numberOfPingus, needed: s.plf.numberToSave,
        maxTime: s.plf.time, usedTime: s.time,
      };
      SavegameManager.instance.store({ filename: s.plf.resname, status: result.saved >= result.needed ? 'finished' : 'accessible', time: result.usedTime, saved: result.saved });
      if (s.demo) GameSession.onDemo?.(s.plf.resname, [...s.demo, `(end (time ${s.time}))`].join('\n') + '\n');
      if (this.showResult) ScreenManager.instance.replace(new ResultScreen(result));
      else ScreenManager.instance.pop();
      return;
    }
    const passed = tr(Math.fround(delta * 1000)) + this.worldDelay;
    const step = globals.gameSpeed;
    let updates = 0;
    while ((updates + 1) * step <= passed) {
      if (!this.pause || this.singleStep) {
        this.singleStep = false;
        if (this.fastForward) for (let i = 0; i < globals.fastForwardTimeScale; ++i) s.update();
        else s.update();
      }
      updates++;
    }
    this.worldDelay = passed - updates * step;
  }
  update(delta: number) {
    this.updateServer(delta);
    if (ScreenManager.instance.current() !== this) return;
    super.update(delta);
  }
  event(ev: Parameters<GUIScreen['event']>[0]) {
    super.event(ev);
    if (ev.type === 'button' && ev.pressed) {
      const m = /^action-(\d+)$/.exec(ev.name);
      if (m) this.buttonPanel.setButton(+m[1] - 1);
      else if (ev.name === 'action-down') this.buttonPanel.next();
      else if (ev.name === 'action-up') this.buttonPanel.previous();
    } else if (ev.type === 'scroll') {
      this.playfield.scroll(tr(-ev.dx), tr(-ev.dy));
    }
  }
  onEscapePress() { this.server.sendFinishEvent(); }
  onPausePress() { this.setPause(!this.pause); }
  onSingleStepPress() { this.setPause(true); this.singleStep = true; }
  onFastForwardPress() { if (this.pause) this.setPause(false); else this.setFastForward(true); }
  onFastForwardRelease() { this.setFastForward(false); }
  onArmageddonPress() { this.server.sendArmageddonEvent(); }
  onStartup() {
    const music = this.server.plf.music;
    if (music === 'none' || !music) stopMusic(); else playMusic(music);
  }
  setFastForward(v: boolean) { this.fastForward = v; if (v) this.pause = false; }
  setPause(v: boolean) { this.pause = v; if (v) this.fastForward = false; }
}

/** the wood, the blackboard: the background of the start, result, story and level menu screens */
export function drawBoard(gc: DrawingContext, bg: Sprite, board: Sprite) {
  for (let y = 0; y < gc.height; y += bg.height) for (let x = 0; x < gc.width; x += bg.width) gc.draw(bg, x, y);
  gc.draw(board, tr(gc.width / 2), tr(gc.height / 2));
}

class StartScreenComponent extends Component {
  private plf: PingusLevel;
  private bg = Sprite.load('core/menu/wood');
  private board = Sprite.load('core/menu/blackboard');
  private timeStr: string;
  private description = '';
  constructor(plf: PingusLevel) { super(); this.plf = plf; this.timeStr = ticksToRealtime(plf.time); }
  draw(gc: DrawingContext) {
    drawBoard(gc, this.bg, this.board);
    const cx = tr(gc.width / 2), cy = tr(gc.height / 2);
    const lx = cx - 150, rx = cx + 150;
    let y = cy + 40;
    gc.printCenter(Fonts.chalkLarge, cx, cy - 230, this.plf.levelname);
    if (!this.description && this.plf.description) this.description = breakLine(this.plf.description, 800 - 200, Fonts.chalkNormal);
    gc.printLeft(Fonts.chalkNormal, cx - 300, cy - 170, this.description);
    y += 32 + 45;
    gc.printLeft(Fonts.chalkNormal, lx, y, 'Number of Pingus: ');
    gc.printRight(Fonts.chalkNormal, rx, y, String(this.plf.numberOfPingus));
    gc.printLeft(Fonts.chalkNormal, lx, (y += 30), 'Number to Save: ');
    gc.printRight(Fonts.chalkNormal, rx, y, String(this.plf.numberToSave));
    gc.printLeft(Fonts.chalkNormal, lx, (y += 30), 'Time: ');
    gc.printRight(Fonts.chalkNormal, rx, y, this.timeStr);
    gc.printCenter(Fonts.chalkSmall, cx, cy + 215, `Author: ${this.plf.author}`);
    if (globals.developerMode) gc.printCenter(Fonts.chalkSmall, cx, gc.height - 50, this.plf.resname);
  }
}

class LabelButton extends TickButton {
  private label: string;
  private lx: number;
  private ly: number;
  private hitTop: number;
  constructor(x: number, y: number, base: string, label: string, lx: number, ly: number, hitTop: number, cb: () => void) {
    super(x, y, base, cb);
    this.label = label; this.lx = lx; this.ly = ly; this.hitTop = hitTop;
  }
  draw(gc: DrawingContext) { super.draw(gc); gc.printCenter(Fonts.chalkNormal, this.x + this.lx, this.y + this.ly, this.label); }
  isAt(x: number, y: number) {
    const w = this.normal?.width ?? 0, h = this.normal?.height ?? 0;
    return x > this.x && x < this.x + w && y > this.y - this.hitTop && y < this.y + h;
  }
}

export class StartScreen extends GUIScreen {
  private plf: PingusLevel;
  constructor(plf: PingusLevel) {
    super();
    this.plf = plf;
    this.gui.add(new StartScreenComponent(plf));
    this.gui.add(new LabelButton(SCREEN_W / 2 + 245, SCREEN_H / 2 + 150, 'core/start/ok', 'Play', 30, -20, 20, () => { playSound('yipee'); this.startGame(); }));
    this.gui.add(new LabelButton(SCREEN_W / 2 - 300, SCREEN_H / 2 + 200, 'core/start/back', 'Back', 55, 0, 0, () => this.cancel()));
  }
  onFastForwardPress() { this.startGame(); }
  onPausePress() { this.startGame(); }
  onEscapePress() { this.cancel(); }
  startGame() { ScreenManager.instance.replace(new GameSession(this.plf, true)); }
  cancel() { ScreenManager.instance.pop(); }
}

class ResultScreenComponent extends Component {
  private r: Result;
  private bg = Sprite.load('core/menu/wood');
  private board = Sprite.load('core/menu/blackboard');
  private timeStr: string;
  constructor(r: Result) { super(); this.r = r; this.timeStr = r.maxTime === -1 ? '-' : ticksToRealtime(r.maxTime - r.usedTime); }
  draw(gc: DrawingContext) {
    const r = this.r;
    drawBoard(gc, this.bg, this.board);
    const cx = tr(gc.width / 2);
    gc.printCenter(Fonts.chalkLarge, cx, SCREEN_H / 2 - 200, r.plf.levelname);
    const success = r.saved >= r.needed;
    gc.printCenter(Fonts.chalkLarge, cx, SCREEN_H / 2 - 140, success ? 'Success!' : 'Failure!');
    let msg: string;
    if (success) {
      if (r.killed === 0 && r.saved === r.total) msg = 'Perfect! You saved everyone possible - great!';
      else if (r.killed === 0) msg = 'No-one got killed, pretty good work.';
      else if (r.saved === r.needed) msg = 'You saved exactly what you needed - you made it, but\nmaybe you can do better?';
      else if (r.killed >= 5) msg = 'Not everybody was saved, but still good work!';
      else msg = 'What can I say, you made it - congratulations!';
    } else if (r.killed === r.total) msg = 'You killed everybody, not good.';
    else if (r.saved === 0) msg = 'No-one got saved - I know you can do better.';
    else if (r.saved > 0) msg = "You didn't save enough, but you saved a few.  Next\ntime you might do better.";
    else if (r.saved + 1 >= r.needed) msg = 'Only one more and you would have made it - try again!';
    else if (r.saved + 5 >= r.needed) msg = 'Only a handful more and you would have made it - try again!';
    else msg = 'Better luck next time!';
    gc.printCenter(Fonts.chalkNormal, cx, tr(gc.height / 2) - 70, msg);
    const lx = cx - 100, rx = cx + 100;
    let y = SCREEN_H / 2 + 10;
    gc.printLeft(Fonts.chalkNormal, lx, y, 'Saved: ');
    gc.printRight(Fonts.chalkNormal, rx, y, `${r.saved}/${r.needed}`);
    gc.printLeft(Fonts.chalkNormal, lx, (y += 30), 'Died: ');
    gc.printRight(Fonts.chalkNormal, rx, y, String(r.killed));
    gc.printLeft(Fonts.chalkNormal, lx, (y += 30), 'Time left: ');
    gc.printRight(Fonts.chalkNormal, rx, y, this.timeStr);
  }
}

export class ResultScreen extends GUIScreen {
  private r: Result;
  constructor(r: Result) {
    super();
    this.r = r;
    this.gui.add(new ResultScreenComponent(r));
    if (this.success) {
      this.gui.add(new TickButton(SCREEN_W / 2 + 245, SCREEN_H / 2 + 150, 'core/start/ok', () => { this.close(); playSound('yipee'); }));
    } else {
      this.gui.add(new LabelButton(SCREEN_W / 2 - 300, SCREEN_H / 2 + 200, 'core/start/back', 'Give up', 55, -4, 0, () => this.close()));
      this.gui.add(new LabelButton(SCREEN_W / 2 + 245, SCREEN_H / 2 + 150, 'core/start/ok', 'Retry', 30, -24, 24, () => this.retry()));
    }
  }
  get success() { return this.r.saved >= this.r.needed; }
  onStartup() { if (this.success) playMusic('success_1.it', 1, false); else playMusic('pingus-2.it', 1, false); }
  retry() { ScreenManager.instance.replace(new GameSession(this.r.plf, true)); }
  close() { ScreenManager.instance.pop(); }
  onFastForwardPress() { this.onPausePress(); }
  onPausePress() { if (this.success) this.close(); else this.retry(); }
  onEscapePress() { this.close(); }
}

