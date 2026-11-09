// @ts-nocheck
// The scene2d pieces of noosa's TextInput (a libGDX TextField on a Stage over the game's own NinePatch: the
// hero's name in the seed window, notes, custom seeds) as a DOM text field over the canvas. The page's
// <input> (one line, centred, as TextInput sets Align.center) or <textarea> (multi-line) sits where the
// Stage would draw the field (its Container's position and size, in the window's pixels, y up as in
// libGDX), in the game's font (the pixel font, at the BitmapFont's line height) and the skin's colour
// (gdx/textfield.json: black). It has the keyboard while it exists, as the Stage's keyboard focus: clicks on
// the game give it the focus back. Typing, the browser's own editing keys, IMEs, phone keyboards, cut, copy and
// paste work as in any text field; Enter calls the TextFieldListener (keyTyped '\n'), every change the
// ChangeListener (also for setText, as setProgrammaticChangeEvents(true) asks). No other scene2d is used.
import { JObject, defineLib } from '../../jre/lang.ts';
import { Gdx } from '../core.ts';

/** Where text fields go: the game's element and canvas, the size of a window pixel in CSS pixels, the font. */
export const textFieldHost: { host: HTMLElement | null; canvas: HTMLCanvasElement | null; scale: () => number; family: string; active: Set<any> } = {
  host: null, canvas: null, scale: () => 1, family: 'sans-serif', active: new Set(),
};

export class OrthographicCamera extends JObject {
  zoom = 1;
  viewportWidth = 0;
  viewportHeight = 0;
  update() {}
}
defineLib(OrthographicCamera, 'com.badlogic.gdx.graphics.OrthographicCamera');

export class Viewport extends JObject {
  worldWidth = 0;
  worldHeight = 0;
  screenX = 0;
  screenY = 0;
  screenWidth = 0;
  screenHeight = 0;
  camera: any = null;
  _Viewport(): this { return this; }
  setWorldSize(w: number, h: number) { this.worldWidth = w; this.worldHeight = h; }
  setScreenBounds(x: number, y: number, w: number, h: number) { this.screenX = x; this.screenY = y; this.screenWidth = w; this.screenHeight = h; }
  setCamera(c: any) { this.camera = c; }
  getCamera() { return this.camera; }
  getWorldWidth() { return this.worldWidth; }
  getWorldHeight() { return this.worldHeight; }
  apply() {}
  update() {}
}
defineLib(Viewport, 'com.badlogic.gdx.utils.viewport.Viewport');

export class SpriteBatch extends JObject {
  static overrideVertexType: any = null;
}
defineLib(SpriteBatch, 'com.badlogic.gdx.graphics.g2d.SpriteBatch');

export class ChangeListener_ChangeEvent extends JObject {
  stopped = false;
  handled = false;
  stop() { this.stopped = true; }
  handle() { this.handled = true; }
  cancel() { this.stopped = true; }
}
defineLib(ChangeListener_ChangeEvent, 'com.badlogic.gdx.scenes.scene2d.utils.ChangeListener$ChangeEvent');

export class ChangeListener extends JObject {
  _ChangeListener(): this { return this; }
  changed(_e: any, _a: any) {}
  handle(e: any) { return false; }
}
defineLib(ChangeListener, 'com.badlogic.gdx.scenes.scene2d.utils.ChangeListener', { ifaces: ['com.badlogic.gdx.scenes.scene2d.EventListener'] });

export class TextField_TextFieldStyle extends JObject {
  font: any = null;
  fontColor: any = null;
  focusedFontColor: any = null;
  disabledFontColor: any = null;
  background: any = null;
  focusedBackground: any = null;
  disabledBackground: any = null;
  cursor: any = null;
  selection: any = null;
  messageFont: any = null;
  messageFontColor: any = null;
}
defineLib(TextField_TextFieldStyle, 'com.badlogic.gdx.scenes.scene2d.ui.TextField$TextFieldStyle');

/** The skin of gdx/textfield.json: a TextFieldStyle in black (its cursor and selection are the browser's). */
export class Skin extends JObject {
  color = '#000';
  constructor(file?: any) {
    super();
    try {
      const m = /black:\s*\{\s*a:\s*([\d.]+),\s*b:\s*([\d.]+),\s*g:\s*([\d.]+),\s*r:\s*([\d.]+)/.exec(file.readString());
      if (m) this.color = `rgba(${+m[4] * 255},${+m[3] * 255},${+m[2] * 255},${+m[1]})`;
    } catch { /* the default */ }
  }
  get(_cls: any) {
    const s = new TextField_TextFieldStyle();
    s.fontColor = this.color;
    return s;
  }
  dispose() {}
}
defineLib(Skin, 'com.badlogic.gdx.scenes.scene2d.ui.Skin');

export class Container extends JObject {
  actor: any = null;
  x = 0;
  y = 0;
  w = 0;
  h = 0;
  stage: any = null;
  setTransform(_t: boolean) {}
  setActor(a: any) { this.actor = a; if (a) a.container = this; }
  getActor() { return this.actor; }
  align(_a: number) { return this; }
  setPosition(x: number, y: number) { this.x = x; this.y = y; }
  size(w: number, h: number) { this.w = w; this.h = h; return this; }
}
defineLib(Container, 'com.badlogic.gdx.scenes.scene2d.ui.Container');

export class Stage extends JObject {
  viewport: any;
  actors: any[] = [];
  focus: any = null;
  constructor(viewport?: any) {
    super();
    this.viewport = viewport;
  }
  addActor(a: any) { this.actors.push(a); a.stage = this; }
  setKeyboardFocus(a: any) { this.focus = a; a?.focusField?.(); return true; }
  getKeyboardFocus() { return this.focus; }
  act(_d?: number) {}
  /** Puts the fields where the containers are (the Stage draws them here in libGDX). */
  draw() {
    for (const c of this.actors) if (c.actor) c.actor.place(c);
  }
  dispose() {
    for (const c of this.actors) c.actor?.remove();
    this.actors = [];
  }
  // as an InputProcessor (InputHandler adds the stage before the game's handler): the DOM field takes the keys
  // itself while it has the focus, so the stage handles nothing here
  keyDown() { return false; }
  keyUp() { return false; }
  keyTyped() { return false; }
  touchDown() { return false; }
  touchUp() { return false; }
  touchCancelled() { return false; }
  touchDragged() { return false; }
  mouseMoved() { return false; }
  scrolled() { return false; }
}
defineLib(Stage, 'com.badlogic.gdx.scenes.scene2d.Stage', { ifaces: ['com.badlogic.gdx.InputProcessor'] });

export class TextField extends JObject {
  el: HTMLInputElement | HTMLTextAreaElement = null;
  style: any = null;
  listeners: any[] = [];
  fieldListener: any = null;
  keyboard: any = null;
  programmatic = false;
  container: any = null;
  stage: any = null;
  removed = false;
  multiline = false;
  abort = new AbortController();

  _TextField(text: string, style: any): this { this.init(text, style, false); return this; }
  init(text: string, style: any, multiline: boolean) {
    this.multiline = multiline;
    this.style = style;
    const el = document.createElement(multiline ? 'textarea' : 'input');
    if (!multiline) (el as HTMLInputElement).type = 'text';
    el.value = text ?? '';
    el.spellcheck = false;
    el.autocomplete = 'off';
    el.setAttribute('autocapitalize', 'off');
    el.style.cssText = 'position:absolute;box-sizing:border-box;margin:0;padding:0;border:0;outline:none;background:transparent;' +
      'resize:none;overflow:hidden;z-index:2;line-height:1.1;white-space:pre-wrap;display:none';
    el.style.color = style?.fontColor ?? '#000';
    el.style.caretColor = el.style.color;
    const signal = this.abort.signal;
    el.addEventListener('input', () => this.fire(), { signal });
    el.addEventListener('keydown', (e: KeyboardEvent) => {
      e.stopPropagation();
      if (e.key === 'Enter' && !this.multiline) {
        e.preventDefault();
        this.fieldListener?.keyTyped(this, 10);
      }
    }, { signal });
    el.addEventListener('keyup', (e) => e.stopPropagation(), { signal });
    el.addEventListener('copy', () => queueMicrotask(() => this.copied()), { signal });
    el.addEventListener('cut', () => queueMicrotask(() => this.copied()), { signal });
    textFieldHost.host?.append(el);
    textFieldHost.active.add(this);
    // a click on the game gives the field the keyboard back (it keeps the Stage's keyboard focus)
    textFieldHost.canvas?.addEventListener('pointerup', () => this.focusField(), { signal });
    this.el = el;
  }
  copied() {
    const sel = this.getSelection();
    if (sel) Gdx.app?.getClipboard().setContents(sel);
  }
  focusField() { if (!this.removed) setTimeout(() => { if (!this.removed) this.el.focus({ preventScroll: true }); }, 0); }
  /** Sizes and places the field over the canvas (the container's place in window pixels, y up). */
  place(c: any) {
    if (this.removed) return;
    const s = textFieldHost.scale();
    const canvas = textFieldHost.canvas;
    const hostRect = textFieldHost.host.getBoundingClientRect();
    const cr = canvas.getBoundingClientRect();
    const winH = canvas.height;
    const font = this.style?.font;
    const line = font ? (font.getLineHeight?.() ?? font.getData?.().lineHeight ?? 16) : 16;
    const st = this.el.style;
    st.display = 'block';
    st.left = (cr.left - hostRect.left + c.x * s) + 'px';
    st.top = (cr.top - hostRect.top + (winH - c.y) * s) + 'px';
    st.width = Math.max(1, c.w * s) + 'px';
    st.height = Math.max(1, c.h * s) + 'px';
    st.font = `${Math.max(1, line * s * 0.8)}px "${textFieldHost.family}", sans-serif`;
    st.textAlign = this.multiline ? 'left' : this.align;
    if (!this.multiline) st.lineHeight = Math.max(1, c.h * s) + 'px';
  }
  align = 'left';
  setAlignment(a: number) { this.align = (a & 8) ? 'left' : (a & 16) ? 'right' : 'center'; }
  fire() {
    const ev = new ChangeListener_ChangeEvent();
    for (const l of this.listeners) if (l.changed) l.changed(ev, this);
  }
  remove() {
    this.removed = true;
    this.abort.abort();
    this.el?.remove();
    textFieldHost.active.delete(this);
    textFieldHost.canvas?.focus({ preventScroll: true });
  }
  addListener(l: any) { this.listeners.push(l); return true; }
  setProgrammaticChangeEvents(b: boolean) { this.programmatic = b; }
  setTextFieldListener(l: any) { this.fieldListener = l; }
  setOnscreenKeyboard(k: any) { this.keyboard = k; }
  getStyle() { return this.style; }
  setStyle(s: any) { this.style = s; }
  getText() { return this.el.value; }
  setText(t: string) {
    const v = t ?? '';
    const max = this.el.maxLength > 0 ? this.el.maxLength : -1;
    const nv = max >= 0 ? v.substring(0, max) : v;
    if (nv === this.el.value) return;
    this.el.value = nv;
    if (this.programmatic) this.fire();
  }
  setMaxLength(n: number) { if (n > 0) this.el.maxLength = n; else this.el.removeAttribute('maxlength'); }
  getMaxLength() { return this.el.maxLength > 0 ? this.el.maxLength : 0; }
  getCursorPosition() { return this.el.selectionStart ?? this.el.value.length; }
  setCursorPosition(i: number) { const p = Math.max(0, Math.min(i, this.el.value.length)); this.el.setSelectionRange(p, p); }
  getSelection() {
    const a = this.el.selectionStart ?? 0, b = this.el.selectionEnd ?? 0;
    return this.el.value.substring(Math.min(a, b), Math.max(a, b));
  }
  selectAll() { this.el.select(); }
  setSelection(a: number, b: number) { this.el.setSelectionRange(Math.min(a, b), Math.max(a, b)); }
  clearSelection() { const p = this.getCursorPosition(); this.el.setSelectionRange(p, p); }
  /** libGDX copies the selection to the clipboard. */
  copy() {
    const s = this.getSelection();
    if (s) Gdx.app?.getClipboard().setContents(s);
  }
  cut() {
    this.copy();
    const a = this.el.selectionStart ?? 0, b = this.el.selectionEnd ?? 0;
    if (a !== b) {
      this.el.setRangeText('', Math.min(a, b), Math.max(a, b), 'start');
      if (this.programmatic) this.fire();
    }
  }
  setDisabled(d: boolean) { this.el.disabled = d; }
  isDisabled() { return this.el.disabled; }
  setPosition() {}
}
defineLib(TextField, 'com.badlogic.gdx.scenes.scene2d.ui.TextField');

export class TextArea extends TextField {
  _TextArea(text: string, style: any): this { this.init(text, style, true); return this; }
}
defineLib(TextArea, 'com.badlogic.gdx.scenes.scene2d.ui.TextArea');
