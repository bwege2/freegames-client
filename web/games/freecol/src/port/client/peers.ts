// The heavyweight side of AWT for the browser (what the JDK's XToolkit and X11 peers do): windows are
// rectangles on one screen canvas, stacked in the order they were shown or raised; the page sends mouse and
// keyboard input, which becomes AWT's native events for the window under the pointer or with the focus;
// what the windows paint is shown on the page (present). As on a plain X display without a window
// manager: windows have no decorations, a shown window gets the focus.
import { $J, JObject } from '../../jre/index.ts';
import { awt, SunToolkit, Toolkit } from '../../jre/toolkit.ts';
import { canvases, BufferedImage, createImage } from '../../jre/image.ts';
import { lateClass } from '../../jre/screen.ts';
import { newGraphics, type Target } from './graphics.ts';

/** The screen: one canvas, the windows on it (bottom first). */
export const screen = {
  surf: null as { canvas: any; ctx: any } | null,
  dirty: false,
  windows: [] as WindowPeer[],
  /** Shows the screen on the page (set by the worker): false if it cannot now (try again later). */
  show: (_canvas: any): boolean => true,
};

function screenSurface() {
  if (!screen.surf || screen.surf.canvas.width !== awt.screenWidth || screen.surf.canvas.height !== awt.screenHeight) {
    screen.surf = canvases.create(awt.screenWidth, awt.screenHeight);
    if (screen.surf) {
      screen.surf.ctx.fillStyle = '#000';
      screen.surf.ctx.fillRect(0, 0, awt.screenWidth, awt.screenHeight);
    }
  }
  return screen.surf;
}

export function present() {
  if (screen.dirty && screen.surf && screen.show(screen.surf.canvas)) screen.dirty = false;
}

function postPaint(target: any, x: number, y: number, w: number, h: number) {
  const PaintEventDispatcher = $J.load('sun.awt.PaintEventDispatcher');
  const e = PaintEventDispatcher.getPaintEventDispatcher().createPaintEvent(target, x, y, w, h);
  if (e != null) SunToolkit.postEvent(null, e);
}

/** A heavyweight window's peer (frames, dialogs, windows: popups and tooltips). */
export class WindowPeer extends JObject {
  target: any;
  x = 0;
  y = 0;
  w = 0;
  h = 0;
  visible = false;
  title = '';
  state = 0;
  constructor(target: any) {
    super();
    this.target = target;
    const b = target[$J.m('java.awt.Component', 'getBounds()')]();
    this.x = b.getX();
    this.y = b.getY();
    this.w = b.getWidth();
    this.h = b.getHeight();
    // as XWindowPeer.preInit: a window without a font gets the toolkit's default font (XWindow.getDefaultFont)
    if (target.getFont() == null) target.setFont($J.make('java.awt.Font', 'java.lang.String,int,int', 'Dialog', 0, 12));
  }
  // ComponentPeer
  isObscured() { return false; }
  canDetermineObscurity() { return false; }
  setVisible(v: boolean) {
    if (v === this.visible) return;
    this.visible = v;
    if (v) {
      screen.windows = screen.windows.filter((p) => p !== this);
      screen.windows.push(this);
      postPaint(this.target, 0, 0, this.w, this.h);
      if (this.target.isFocusableWindow() && this.target.getFocusableWindowState()) focus.activate(this);
    } else {
      screen.windows = screen.windows.filter((p) => p !== this);
      this.exposeBelow(this.x, this.y, this.w, this.h);
      if (focus.window === this) focus.activate(screen.windows.filter((p) => p.target.isFocusableWindow()).pop() ?? null);
    }
  }
  /** What a window covered becomes visible again: the windows under it repaint it. */
  exposeBelow(x: number, y: number, w: number, h: number) {
    const s = screenSurface();
    if (s) {
      s.ctx.fillStyle = '#000';
      s.ctx.fillRect(x, y, w, h);
      screen.dirty = true;
    }
    for (const p of screen.windows) {
      const ix = Math.max(x, p.x), iy = Math.max(y, p.y);
      const iw = Math.min(x + w, p.x + p.w) - ix, ih = Math.min(y + h, p.y + p.h) - iy;
      if (iw > 0 && ih > 0) postPaint(p.target, ix - p.x, iy - p.y, iw, ih);
    }
  }
  setEnabled(_e: boolean) {}
  paint(_g: any) {}
  print(_g: any) {}
  setBounds(x: number, y: number, w: number, h: number, op: number) {
    const old = [this.x, this.y, this.w, this.h];
    if (op === 1) [this.x, this.y] = [x, y];
    else if (op === 2 || op === 4) [this.w, this.h] = [w, h];
    else [this.x, this.y, this.w, this.h] = [x, y, w, h];
    if (this.visible && (old[0] !== this.x || old[1] !== this.y || old[2] !== this.w || old[3] !== this.h)) {
      this.exposeBelow(old[0], old[1], old[2], old[3]);
      postPaint(this.target, 0, 0, this.w, this.h);
    }
  }
  handleEvent(_e: any) {}
  coalescePaintEvent(_e: any) {}
  getLocationOnScreen() {
    return $J.make('java.awt.Point', 'int,int', this.x, this.y);
  }
  getPreferredSize() {
    return $J.make('java.awt.Dimension', 'int,int', this.w, this.h);
  }
  getMinimumSize() {
    return $J.make('java.awt.Dimension', 'int,int', 1, 1);
  }
  getColorModel() {
    return this.getGraphicsConfiguration().getColorModel();
  }
  getGraphicsConfiguration() {
    return $J.load('java.awt.GraphicsEnvironment').getLocalGraphicsEnvironment().getDefaultScreenDevice().getDefaultConfiguration();
  }
  targetFor(): Target {
    return {
      surface: () => screenSurface(),
      drawn: () => (screen.dirty = true),
      ox: this.x,
      oy: this.y,
      w: this.w,
      h: this.h,
    };
  }
  getGraphics() {
    if (!this.visible) return null;
    return newGraphics(this.targetFor(), this.target.getFont(), this.target.getForeground(), this.target.getBackground());
  }
  getFontMetrics(font: any) {
    return $J.load('sun.font.FontDesignMetrics.$factory').getMetrics(font);
  }
  dispose() {
    if (this.visible) this.setVisible(false);
  }
  setForeground(_c: any) {}
  setBackground(_c: any) {}
  setFont(_f: any) {}
  updateCursorImmediately() {
    awt.setCursor?.(this.target.getCursor?.());
  }
  requestFocus(lightweightChild: any, temporary: boolean, focusedWindowChangeAllowed: boolean, time: number, cause: any) {
    const K = $J.load('sun.awt.KeyboardFocusManagerPeerImpl');
    if (K.processSynchronousLightweightTransfer(this.target, lightweightChild, temporary, focusedWindowChangeAllowed, time)) return true;
    const r = K.shouldNativelyFocusHeavyweight(this.target, lightweightChild, temporary, focusedWindowChangeAllowed, time, cause);
    if (r === 0) return false; // SNFH_FAILURE
    if (r === 1) return true; // SNFH_SUCCESS_HANDLED
    if (focus.window !== this) focus.activate(this);
    return K.deliverFocus(lightweightChild, this.target, temporary, focusedWindowChangeAllowed, time, cause, focus.peer().getCurrentFocusOwner());
  }
  isFocusable() {
    return true;
  }
  createImage(a: any, b?: any) {
    if (typeof a === 'number') return new BufferedImage(a, b, 1);
    return Toolkit.getDefaultToolkit().createImage(a);
  }
  createVolatileImage(w: number, h: number) {
    return newVolatile(w, h);
  }
  handlesWheelScrolling() {
    return false;
  }
  createBuffers() {}
  getBackBuffer() {
    return null;
  }
  flip() {}
  destroyBuffers() {}
  reparent(_c: any) {}
  isReparentSupported() {
    return false;
  }
  layout() {}
  applyShape(_r: any) {}
  setZOrder(_above: any) {}
  updateGraphicsData(_gc: any) {
    return false;
  }
  // ContainerPeer
  getInsets() {
    return $J.make('java.awt.Insets', 'int,int,int,int', 0, 0, 0, 0);
  }
  beginValidate() {}
  endValidate() {}
  beginLayout() {}
  endLayout() {}
  // WindowPeer
  toFront() {
    if (!this.visible) return;
    screen.windows = screen.windows.filter((p) => p !== this);
    screen.windows.push(this);
    postPaint(this.target, 0, 0, this.w, this.h);
    if (this.target.isFocusableWindow()) focus.activate(this);
  }
  toBack() {
    if (!this.visible) return;
    screen.windows = [this, ...screen.windows.filter((p) => p !== this)];
    this.exposeBelow(this.x, this.y, this.w, this.h);
  }
  updateAlwaysOnTopState() {}
  updateFocusableWindowState() {}
  setModalBlocked(_d: any, _b: boolean) {}
  updateMinimumSize() {}
  updateIconImages() {}
  setOpacity(_o: number) {}
  setOpaque(_o: boolean) {}
  updateWindow() {}
  repositionSecurityWarning() {}
  // FramePeer, DialogPeer
  setTitle(t: string) {
    this.title = t;
  }
  setMenuBar(_m: any) {}
  setResizable(_r: boolean) {}
  setState(s: number) {
    this.state = s;
  }
  getState() {
    return this.state;
  }
  setMaximizedBounds(_r: any) {}
  setBoundsPrivate(x: number, y: number, w: number, h: number) {
    this.setBounds(x, y, w, h, 3);
  }
  getBoundsPrivate() {
    return $J.make('java.awt.Rectangle', 'int,int,int,int', this.x, this.y, this.w, this.h);
  }
  emulateActivation(a: boolean) {
    if (a) focus.activate(this);
  }
  blockWindows(_l: any) {}
}
$J.define(WindowPeer, 'sun.awt.WebWindowPeer', {
  kind: 'class', sup: 'java.lang.Object', ifaces: ['java.awt.peer.FramePeer', 'java.awt.peer.DialogPeer', 'java.awt.peer.WindowPeer'],
});

/** A VolatileImage drawn into as a BufferedImage (it is never lost). */
const volatileClass = lateClass(() => {
  const VolatileImage = $J.load('java.awt.image.VolatileImage');
  const C = class WebVolatileImage extends VolatileImage {
    $image: any;
    $init(w: number, h: number) {
      this.$image = new BufferedImage(w, h, 1);
      return this;
    }
    getSnapshot() {
      return this.$image;
    }
    getWidth(_o?: any) {
      return this.$image.w;
    }
    getHeight(_o?: any) {
      return this.$image.h;
    }
    createGraphics() {
      return this.$image.createGraphics();
    }
    getGraphics() {
      return this.$image.createGraphics();
    }
    validate(_gc: any) {
      return 0; // IMAGE_OK
    }
    contentsLost() {
      return false;
    }
    getCapabilities() {
      return $J.make('java.awt.ImageCapabilities', 'boolean', false);
    }
    getSource() {
      return this.$image.getSource();
    }
  };
  $J.adoptOverloads(C);
  $J.define(C, 'sun.awt.image.WebVolatileImage', { kind: 'class', sup: 'java.awt.image.VolatileImage' });
  return C;
});
export function newVolatile(w: number, h: number) {
  return new (volatileClass())().$init(w, h);
}

/* ------------------------------------------------------------------ focus */

const kfmPeerClass = lateClass(() => {
  const K = $J.load('sun.awt.KeyboardFocusManagerPeerImpl');
  const C = class WebKeyboardFocusManagerPeer extends K {
    focusedWindow: any = null;
    focusOwner: any = null;
    setCurrentFocusedWindow(w: any) {
      this.focusedWindow = w;
    }
    getCurrentFocusedWindow() {
      return this.focusedWindow;
    }
    setCurrentFocusOwner(c: any) {
      this.focusOwner = c;
    }
    getCurrentFocusOwner() {
      return this.focusOwner;
    }
  };
  $J.adoptOverloads(C);
  $J.define(C, 'sun.awt.WebKeyboardFocusManagerPeer', { kind: 'class', sup: 'sun.awt.KeyboardFocusManagerPeerImpl' });
  return C;
});

/** The window with the keyboard focus, as a window manager gives it. */
export const focus = {
  window: null as WindowPeer | null,
  kfm: null as any,
  peer() {
    return (this.kfm ??= new (kfmPeerClass())());
  },
  activate(p: WindowPeer | null) {
    if (p === this.window) return;
    const WindowEvent = $J.load('java.awt.event.WindowEvent');
    const old = this.window;
    this.window = p;
    // the native focused window, as the X toolkit keeps it (markClearGlobalFocusOwner asks for it)
    this.peer().setCurrentFocusedWindow(p?.target ?? null);
    const mk = (src: any, id: number, other: any) => $J.make('java.awt.event.WindowEvent', 'java.awt.Window,int,java.awt.Window', src, id, other);
    if (old) {
      SunToolkit.postEvent(null, mk(old.target, WindowEvent.WINDOW_LOST_FOCUS, p?.target ?? null));
      SunToolkit.postEvent(null, mk(old.target, WindowEvent.WINDOW_DEACTIVATED, p?.target ?? null));
    }
    if (p) {
      SunToolkit.postEvent(null, mk(p.target, WindowEvent.WINDOW_ACTIVATED, old?.target ?? null));
      SunToolkit.postEvent(null, mk(p.target, WindowEvent.WINDOW_GAINED_FOCUS, old?.target ?? null));
    }
  },
};

/* ------------------------------------------------------------------ the toolkit's component factory */

export function installPeers() {
  const NullComponentPeer = $J.load('sun.awt.NullComponentPeer');
  const P = SunToolkit.prototype as any;
  P.createComponent = (_t: any) => $J.make('sun.awt.NullComponentPeer', '');
  P.createFrame = (t: any) => new WindowPeer(t);
  P.createWindow = (t: any) => new WindowPeer(t);
  P.createDialog = (t: any) => new WindowPeer(t);
  P.createPanel = (_t: any) => $J.make('sun.awt.NullComponentPeer', '');
  P.createCanvas = (_t: any) => $J.make('sun.awt.NullComponentPeer', '');
  P.getKeyboardFocusManagerPeer = () => focus.peer();
  P.isTraySupported = () => false;
  P.getMouseInfoPeer = () => ({ fillPointWithCoords: (p: any) => { p.setLocation$double$double(input.mx, input.my); return 0; }, isWindowUnderMouse: (w: any) => input.over?.target === w });
  P.postPriorityEvent = undefined;
  (SunToolkit as any).postPriorityEvent = (e: any) => {
    const pe = $J.make('sun.awt.PeerEvent', 'java.lang.Object,java.lang.Runnable,long', Toolkit.getDefaultToolkit(), () => {
      $J.load('sun.awt.AWTAccessor').getAWTEventAccessor().setPosted(e);
      e.getSource().dispatchEvent(e);
    }, 2);
    SunToolkit.postEvent(null, pe);
  };
  // AWTEvent.setSource: the native event (an X event) follows the new source; there is none here
  $J.natives.set('java.awt.AWTEvent.nativeSetSource', () => undefined);
  awt.createImage = createImage;
  awt.newVolatile = newVolatile;
  // the toolkit makes these, as XToolkit
  awt.createGraphics = (img: any) => newGraphics({ surface: () => img.surface(), drawn: () => img.$drawn(), ox: img.parent ? img.ox : 0, oy: img.parent ? img.oy : 0, w: img.w, h: img.h, image: img });
  void NullComponentPeer;
}

/* ------------------------------------------------------------------ input from the page */

export const input = {
  mx: 0,
  my: 0,
  over: null as WindowPeer | null,
  buttons: 0,
  /** The pressed-at point and time of the last press, for clicks and multi-clicks. */
  press: null as null | { x: number; y: number; t: number; button: number; count: number; peer: WindowPeer },
  lastClick: null as null | { x: number; y: number; t: number; button: number; count: number },
};

function windowAt(x: number, y: number): WindowPeer | null {
  for (let i = screen.windows.length - 1; i >= 0; i--) {
    const p = screen.windows[i];
    if (x >= p.x && y >= p.y && x < p.x + p.w && y < p.y + p.h) return p;
  }
  return null;
}

/** Java's extended modifiers of the page's keys and buttons. */
function modsEx(e: any): number {
  let m = 0;
  if (e.shift) m |= 64;
  if (e.ctrl) m |= 128;
  if (e.meta) m |= 256;
  if (e.alt) m |= 512;
  if (e.buttons & 1) m |= 1024;
  if (e.buttons & 4) m |= 2048;
  if (e.buttons & 2) m |= 4096;
  return m;
}

function mouse(peer: WindowPeer, id: number, e: any, count: number, button: number, popup = false) {
  const MouseEvent = $J.load('java.awt.event.MouseEvent');
  const me = $J.make('java.awt.event.MouseEvent', 'java.awt.Component,int,long,int,int,int,int,int,int,boolean,int',
    peer.target, id, e.time, modsEx(e), e.x - peer.x, e.y - peer.y, e.x, e.y, count, popup, button);
  SunToolkit.postEvent(null, me);
  void MouseEvent;
}

/** An input event from the page: { kind: 'move'|'down'|'up'|'wheel'|'key', ... } (worker.ts sends them). */
export function handleInput(e: any) {
  const MouseEvent = $J.load('java.awt.event.MouseEvent');
  if (e.kind === 'move' || e.kind === 'down' || e.kind === 'up' || e.kind === 'wheel' || e.kind === 'leave') {
    input.mx = e.x;
    input.my = e.y;
    const grabbed = input.press?.peer ?? null;
    const under = e.kind === 'leave' ? null : windowAt(e.x, e.y);
    if (under !== input.over && !grabbed) {
      if (input.over) mouse(input.over, MouseEvent.MOUSE_EXITED, e, 0, 0);
      if (under) mouse(under, MouseEvent.MOUSE_ENTERED, e, 0, 0);
      input.over = under;
    }
    const target = grabbed ?? under;
    if (!target) return;
    const button = e.button === 0 ? 1 : e.button === 1 ? 2 : e.button === 2 ? 3 : 0;
    if (e.kind === 'move') {
      mouse(target, input.press ? MouseEvent.MOUSE_DRAGGED : MouseEvent.MOUSE_MOVED, e, 0, 0);
    } else if (e.kind === 'down') {
      const lc = input.lastClick;
      const count = lc && lc.button === button && e.time - lc.t < 500 && Math.abs(lc.x - e.x) <= 4 && Math.abs(lc.y - e.y) <= 4 ? lc.count + 1 : 1;
      input.press = { x: e.x, y: e.y, t: e.time, button, count, peer: target };
      if (!focus.window || focus.window !== target) {
        if (target.target.isFocusableWindow()) focus.activate(target);
      }
      mouse(target, MouseEvent.MOUSE_PRESSED, e, count, button, button === 3);
    } else if (e.kind === 'up') {
      const p = input.press;
      const count = p ? p.count : 1;
      mouse(target, MouseEvent.MOUSE_RELEASED, e, count, button);
      if (p && p.button === button && Math.abs(p.x - e.x) <= 4 && Math.abs(p.y - e.y) <= 4) {
        mouse(target, MouseEvent.MOUSE_CLICKED, e, count, button);
        input.lastClick = { x: e.x, y: e.y, t: e.time, button, count };
      }
      if (!e.buttons) input.press = null;
      const now = windowAt(e.x, e.y);
      if (now !== input.over) {
        if (input.over) mouse(input.over, MouseEvent.MOUSE_EXITED, e, 0, 0);
        if (now) mouse(now, MouseEvent.MOUSE_ENTERED, e, 0, 0);
        input.over = now;
      }
    } else if (e.kind === 'wheel') {
      const we = $J.make('java.awt.event.MouseWheelEvent', 'java.awt.Component,int,long,int,int,int,int,int,int,boolean,int,int,int,double',
        target.target, MouseEvent.MOUSE_WHEEL, e.time, modsEx(e), e.x - target.x, e.y - target.y, e.x, e.y, 0, false, 0, 3,
        Math.sign(e.dy), Math.sign(e.dy));
      SunToolkit.postEvent(null, we);
    }
    return;
  }
  if (e.kind === 'key') {
    const w = focus.window;
    if (!w) return;
    const KeyEvent = $J.load('java.awt.event.KeyEvent');
    const id = e.type === 'down' ? KeyEvent.KEY_PRESSED : KeyEvent.KEY_RELEASED;
    const mk = (id: number, code: number, ch: number, loc: number) => $J.make('java.awt.event.KeyEvent', 'java.awt.Component,int,long,int,int,char,int',
      w.target, id, e.time, modsEx(e), code, ch, loc);
    const ch = e.char ? e.char.charCodeAt(0) : 0xffff;
    SunToolkit.postEvent(null, mk(id, e.code, ch, e.location ?? 1));
    if (e.type === 'down' && e.char) SunToolkit.postEvent(null, mk(KeyEvent.KEY_TYPED, 0, ch, 0));
  }
}
