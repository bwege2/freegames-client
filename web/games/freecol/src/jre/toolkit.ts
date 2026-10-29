// @ts-nocheck
// java.awt.Toolkit and sun.awt.SunToolkit: in the JDK the bridge between AWT and the platform (X11 on
// Linux, the toolkit FreeCol's oracle runs on). Here one toolkit for the browser: the screen is the
// game's canvas, the event queue is translated java.awt.EventQueue driven by the client's scheduler
// (src/port/client), heavyweight windows draw into the canvas (peers.ts). What the X11 toolkit answers
// for a plain Xvfb display, this one answers too (no translucency, three mouse buttons, 96 dpi).
import { $J, JObject, defineLib, HeadlessException, UnsupportedOperationException } from './lang.ts';
import { HashMap } from './util.ts';
import { AppContext, PlatformLogger } from './platform.ts';

/** What the client's platform layer provides (set by src/port/client before the GUI starts). */
export const awt: any = {
  screenWidth: 1280,
  screenHeight: 800,
  /** The java.awt.EventQueue, made when first asked for. */
  eventQueue: null,
  /** Wakes the scheduler: an event was posted. */
  wakeup: () => {},
  beep: () => {},
  desktopProperties: new Map<string, any>(),
  clipboard: null as any,
  /** Peers of heavyweight components (frames, dialogs, windows): made by peers.ts. */
  createWindowPeer: null as any,
  fontMetrics: null as any,
  createImage: null as any,
};

/** The AWTEvent mask of an event id (as Toolkit's ToolkitEventMulticaster selects listeners). */
function eventMask(id: number): number {
  if (id >= 100 && id <= 103) return 0x1; // component
  if (id >= 300 && id <= 301) return 0x2; // container
  if (id >= 1004 && id <= 1005) return 0x4; // focus
  if (id >= 400 && id <= 402) return 0x8; // key
  if (id === 503 || id === 506) return 0x20; // mouse motion
  if (id === 507) return 0x20000; // mouse wheel
  if (id >= 500 && id <= 507) return 0x10; // mouse
  if (id >= 200 && id <= 209) return 0x40 | 0x20000 | 0x40000; // window (and its focus and state)
  if (id === 1001) return 0x80; // action
  if (id === 601) return 0x100; // adjustment
  if (id === 701) return 0x200; // item
  if (id === 900) return 0x400; // text
  if (id >= 1100 && id <= 1101) return 0x800; // input method
  if (id === 800) return 0x2000; // invocation
  if (id === 1400) return 0x8000; // hierarchy
  if (id >= 1401 && id <= 1402) return 0x10000; // hierarchy bounds
  return 0;
}

export class Toolkit extends JObject {
  static toolkit: Toolkit = null;
  static loadLibraries() {}
  static getDefaultToolkit() {
    return Toolkit.toolkit ??= new SunToolkit();
  }
  static getProperty(key: string, def: string) {
    return def;
  }
  static getEventQueue() {
    return Toolkit.getDefaultToolkit().getSystemEventQueueImpl();
  }
  static enabledOnToolkit(_mask: number) {
    return true;
  }
  _Toolkit() {
    return this;
  }
  listeners: any[] = [];
  desktopPropsSupport = new HashMap();
  getSystemEventQueue() {
    return this.getSystemEventQueueImpl();
  }
  getSystemEventQueueImpl() {
    return SunToolkit.getSystemEventQueueImplPP(AppContext.getAppContext());
  }
  getScreenSize() {
    return $J.make('java.awt.Dimension', 'int,int', awt.screenWidth, awt.screenHeight);
  }
  getScreenResolution() {
    return 96;
  }
  getScreenInsets(_gc: any) {
    return $J.make('java.awt.Insets', 'int,int,int,int', 0, 0, 0, 0);
  }
  getColorModel() {
    const ColorModel = $J.load('java.awt.image.ColorModel');
    return ColorModel.getRGBdefault();
  }
  getFontMetrics(font: any) {
    return awt.fontMetrics(font);
  }
  sync() {}
  beep() {
    awt.beep();
  }
  getMenuShortcutKeyMask() {
    return 2; // Event.CTRL_MASK
  }
  getMenuShortcutKeyMaskEx() {
    return 128; // InputEvent.CTRL_DOWN_MASK
  }
  getSystemClipboard() {
    return (awt.clipboard ??= new ($J.load('java.awt.datatransfer.Clipboard'))('System'));
  }
  getSystemSelection() {
    return null;
  }
  getBestCursorSize(w: number, h: number) {
    return $J.make('java.awt.Dimension', 'int,int', Math.max(w, 32), Math.max(h, 32));
  }
  createCustomCursor(image: any, hotSpot: any, name: string) {
    const c = $J.make('java.awt.Cursor', 'java.lang.String', name);
    c.$image = image;
    c.$hotSpot = hotSpot;
    return c;
  }
  createImage(src: any, ..._a: any[]) {
    return awt.createImage(src);
  }
  getImage(url: any) {
    return awt.createImage(url);
  }
  prepareImage(_img: any, _w: number, _h: number, _obs: any) {
    return true;
  }
  checkImage(_img: any, _w: number, _h: number, _obs: any) {
    return 32 | 1 | 2; // ALLBITS | WIDTH | HEIGHT: images are decoded before use
  }
  getDesktopProperty(name: string) {
    return awt.desktopProperties.has(name) ? awt.desktopProperties.get(name) : null;
  }
  addPropertyChangeListener(_name: string, _l: any) {}
  removePropertyChangeListener(_name: string, _l: any) {}
  areExtraMouseButtonsEnabled() {
    return true;
  }
  isFrameStateSupported(state: number) {
    return state === 0 || state === 6; // NORMAL, MAXIMIZED_BOTH
  }
  isModalityTypeSupported(_t: any) {
    return true;
  }
  isAlwaysOnTopSupported() {
    return true;
  }
  loadSystemColors(_colors: number[]) {}
  mapInputMethodHighlight(_h: any) {
    return null;
  }
  // AWTEventListeners (Toolkit.addAWTEventListener): Swing's tooltips and popups use them
  addAWTEventListener(l: any, mask: number) {
    if (l != null) this.listeners.push({ l, mask });
  }
  removeAWTEventListener(l: any) {
    this.listeners = this.listeners.filter((x) => x.l !== l);
  }
  notifyAWTEventListeners(e: any) {
    if (!this.listeners.length) return;
    const m = eventMask(e.getID());
    for (const { l, mask } of this.listeners.slice()) {
      if ((mask & m) !== 0) {
        if (typeof l === 'function') l(e);
        else l.eventDispatched(e);
      }
    }
  }
}
defineLib(Toolkit, 'java.awt.Toolkit');

/** sun.awt.SunToolkit: the static helpers the translated AWT calls, and the browser's toolkit itself. */
export class SunToolkit extends Toolkit {
  static awtLock() {}
  static flushPendingEvents(_ctx?: any) {}
  static wakeupEventQueue(_q: any, _b: boolean) {}
  static awtUnlock() {}
  static closeSplashScreen() {}
  static getSunAwtDisableMixing() {
    return true;
  }
  static isTouchKeyboardAutoShowEnabled() {
    return false;
  }
  static setAAFontSettingsCondition(_b: boolean) {}
  static checkAndSetPolicy(_c: any) {}
  static consumeNextKeyTyped(_e: any) {}
  static targetToAppContext(_t: any) {
    return AppContext.getAppContext();
  }
  static isDispatchThreadForAppContext(_t: any) {
    return awt.isDispatchThread ? awt.isDispatchThread() : true;
  }
  static getSystemEventQueueImplPP(ctx?: any) {
    const c = ctx ?? AppContext.getAppContext();
    let q = c.get(AppContext.EVENT_QUEUE_KEY);
    if (q == null) {
      q = $J.make('java.awt.EventQueue', '');
      c.put(AppContext.EVENT_QUEUE_KEY, q);
    }
    return q;
  }
  static postEvent(_ctx: any, e: any) {
    SunToolkit.getSystemEventQueueImplPP()[$J.m('java.awt.EventQueue', 'postEvent(java.awt.AWTEvent)')](e);
  }
  static executeOnEventHandlerThread(target: any, r: any) {
    SunToolkit.postEvent(null, $J.make('sun.awt.PeerEvent', 'java.lang.Object,java.lang.Runnable,long', target, r, 1));
  }
  static getContainingWindow(c: any) {
    const Window = $J.load('java.awt.Window');
    while (c != null && !$J.isa(c, Window)) c = c.getParent();
    return c;
  }
  static isInstanceOf(o: any, type: string) {
    if (o == null || type == null) return false;
    for (let c = $J.getClass(o); c != null; c = c.getSuperclass()) {
      if (c.getName() === type) return true;
      for (const i of c.getInterfaces ? c.getInterfaces() : []) if (i.getName() === type) return true;
    }
    return false;
  }
  static systemGenerated = new WeakSet<any>();
  static setSystemGenerated(e: any) {
    SunToolkit.systemGenerated.add(e);
  }
  static isSystemGenerated(e: any) {
    return SunToolkit.systemGenerated.has(e);
  }
  // instance: what the X11 toolkit answers on a plain display
  canPopupOverlapTaskBar() {
    return true;
  }
  dismissPopupOnFocusLostIfNeeded(_w: any) {}
  dismissPopupOnFocusLostIfNeededCleanUp(_w: any) {}
  getDesktop() {
    throw new UnsupportedOperationException('Desktop API is not supported on the current platform');
  }
  isDesktopSupported() {
    return false;
  }
  getFocusAcceleratorKeyMask() {
    return 512; // ALT_DOWN_MASK
  }
  getNumberOfButtons() {
    return 3;
  }
  grab(_w: any) {}
  ungrab(_w: any) {}
  isNativeGTKAvailable() {
    return false;
  }
  isPrintableCharacterModifiersMask(mods: number) {
    return (mods & 512) === (mods & 128); // ALT and CTRL together or neither
  }
  isSwingBackbufferTranslucencySupported() {
    return false;
  }
  isWindowOpacitySupported() {
    return false;
  }
  isWindowShapingSupported() {
    return false;
  }
  isWindowTranslucencySupported() {
    return false;
  }
  needUpdateWindow() {
    return false;
  }
  notifyModalityPopped(_d: any) {}
  notifyModalityPushed(_d: any) {}
  showOrHideTouchKeyboard(_c: any, _e: any) {}
  updateScreenMenuBarUI() {}
  useBufferPerWindow() {
    return false;
  }
}
defineLib(SunToolkit, 'sun.awt.SunToolkit', { ifaces: ['sun.awt.ComponentFactory', 'sun.awt.KeyboardFocusManagerPeerProvider', 'sun.awt.InputMethodSupport'] });

export const UNIXToolkit: any = { isOnWayland: () => false };
defineLib(UNIXToolkit, 'sun.awt.UNIXToolkit');
void HeadlessException;
void PlatformLogger;
