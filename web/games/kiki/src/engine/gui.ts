// The original's 3D text and its screens (src/gui/KikiText.cpp, KikiTextLine.cpp, KikiCharacter.cpp,
// KikiScreenText.cpp, KikiPageText.cpp, KikiMenu.cpp, KikiColumnMenu.cpp, KikiScrollMenu.cpp):
// layout, keys and timing. ../render/text.ts draws them.
import { KikiAction, KikiActionObject, KikiPyAction } from './action.ts';
import { colorOf, type KColor } from './colors.ts';
import { Controller } from './global.ts';
import { kMax, kMin, KVector } from './math.ts';
import { unmodifiedName, type KeyHandler, type KikiKey } from './objects.ts';
import { KikiProjection } from './projection.ts';
import { Snd } from './sound.ts';
import { FONT } from '../data/models.gen.ts';

export const base_color = 0;
export const bright_color = 1;
export const dark_color = 2;
const TEXT_COLOR_NAMES = ['base', 'bright', 'dark'];
export function textColor(i: number): KColor { return colorOf('KikiText', TEXT_COLOR_NAMES[i]); }
export const bevel_depth = 4.0;

/** C++ std::string::erase(pos, n) */
function erase(s: string, pos: number, n: number): string { return s.substring(0, pos) + s.substring(pos + n); }

/** the text as the original's std::string of UTF-8 bytes, as signed chars */
function bytes(s: string): number[] {
  return Array.from(new TextEncoder().encode(s)).map((b) => (b > 127 ? b - 256 : b));
}

// ------------------------------------------------------------------------------------- KikiCharacter
const ADDONS: Record<number, [number, number]> = {
  [-68]: [52, 1], [-74]: [46, 1], [-76]: [46, 4], [-77]: [46, 2], [-79]: [45, 5], [-83]: [40, 2], [-87]: [36, 2],
  [-89]: [34, 6], [-91]: [32, 7], [-92]: [32, 1], [-93]: [32, 5], [-95]: [32, 2], [-96]: [32, 3],
};

export class KikiCharacter {
  character = -1;
  addon = 0;
  position = new KVector();

  constructor(c: number) {
    if (c >= 97) this.character = c - 65; // lower case is upper case
    else if (c < 0) {
      const m = ADDONS[c];
      if (m) [this.character, this.addon] = m;
    } else this.character = c - 33; // from '!'
  }

  getWidth(): number {
    const glyph = FONT[this.character];
    if (!glyph) return 0;
    let max = 0;
    for (const p of glyph[0]) if (p[0] > max) max = p[0];
    return max;
  }
}

// -------------------------------------------------------------------------------------- KikiTextLine
export class KikiTextLine {
  characters: KikiCharacter[] = [];
  text = '';
  width = 0;
  space_width = 5.0;
  character_spacing = 1.0;
  /** matrix position (the line's offset in the text) */
  position = new KVector();

  public scale_factor: number;
  constructor(str = '', scale_factor = 1.0) {
    this.scale_factor = scale_factor;
    if (str !== '') this.setText(str);
  }

  private addCharacter(c: number): void {
    const ch = new KikiCharacter(c);
    this.characters.push(ch);
    this.width += this.character_spacing;
    ch.position = new KVector(this.width, 0, 0);
    this.width += ch.getWidth();
  }

  setText(str: string): void {
    let text = str;
    const pos = text.indexOf('$scale(');
    if (pos >= 0) {
      text = erase(text, pos, pos + 7); // (sic) erases pos+7 characters
      const close = text.indexOf(')', pos);
      this.scale_factor = parseFloat(text.substring(pos, close < 0 ? undefined : close)) || 0;
      text = erase(text, pos, text.indexOf(')', pos) + 1);
    }
    this.text = text;
    for (const b of bytes(text)) {
      if (b === 32) this.width += this.space_width;
      else if (b !== -61) this.addCharacter(b);
    }
  }

  setPosition(v: KVector): void { this.position = v.clone(); }
  getText(): string { return this.text; }
  getWidth(): number { return this.width * this.scale_factor; }
  getHeight(): number { return 8.0 * this.scale_factor; }
}

// ------------------------------------------------------------------------------------------ KikiText
export class KikiText {
  text_lines: KikiTextLine[] = [];
  width = 0;
  height = 0;
  line_spacing = 4.0;
  centered: boolean;
  color: KColor;

  constructor(text = '', centered = true, colorIndex = base_color) {
    this.color = textColor(colorIndex);
    this.centered = centered;
    if (text !== '') this.addText(text);
  }

  setText(str: string, colorIndex = base_color): void {
    this.clear();
    this.color = textColor(colorIndex);
    this.addText(str, 1.0);
  }

  clear(): void { this.text_lines = []; this.width = this.height = 0; }

  addText(str: string, scaleFactor = 1.0): void {
    for (const line of str.split('\n')) this.text_lines.push(new KikiTextLine(line, scaleFactor));
    this.width = 0;
    this.height = 0;
    for (const l of this.text_lines) {
      if (l.getWidth() > this.width) this.width = l.getWidth();
      this.height += l.getHeight() + this.line_spacing;
    }
    let currentHeight = this.text_lines[0].getHeight();
    for (const l of this.text_lines) {
      const yOffset = -(currentHeight - this.height / 2.0);
      currentHeight += l.getHeight() + this.line_spacing;
      l.setPosition(new KVector(this.centered ? -l.getWidth() / 2.0 : 0.0, yOffset, 0.0));
    }
  }

  getWidth(): number { return this.width; }
  getHeight(): number { return this.height; }
}

// ------------------------------------------------------------------------------------ KikiScreenText
/** what the renderer draws for an overlay line: a text line in a color (alpha = fade) and z scale */
export interface DrawLine { line: KikiTextLine; color: KColor; highlight: boolean }

export class KikiScreenText extends KikiActionObject implements KeyHandler {
  static readonly ACTION_SHOW = 0;
  static readonly ACTION_HIDE = 1;
  static readonly ACTION_DELETE = 2;
  depth = 2147483647 - 11;
  fade_value = 0.0;
  text = new KikiText();
  projection = new KikiProjection(60.0, 0.1, 600.0);
  deleted = false;

  constructor() {
    super();
    Controller.addOverlay(this);
    Controller.setFocusKeyHandler(this);
    this.addEventWithName('hide');
    this.addAction(new KikiAction(this, KikiScreenText.ACTION_SHOW, 'show', 500));
    this.addAction(new KikiAction(this, KikiScreenText.ACTION_HIDE, 'hide', 500));
    this.addAction(new KikiAction(this, KikiScreenText.ACTION_DELETE, 'delete'));
  }

  get width(): number { return this.text.width; }
  get height(): number { return this.text.height; }
  getWidth(): number { return this.text.width; }
  getHeight(): number { return this.text.height; }
  getProjection(): KikiProjection { return this.projection; }

  destroy(): void {
    if (this.deleted) return;
    this.deleted = true;
    Controller.removeOverlay(this);
    Controller.removeFocusKeyHandler(this);
    this.destroyActions();
  }

  show(): void { this.startTimedAction(this.getActionWithId(KikiScreenText.ACTION_SHOW)); }

  setText(str: string, colorIndex = base_color): void {
    this.text.clear();
    this.text.color = textColor(colorIndex);
    this.addText(str, 1.0);
  }

  addText(str: string, scaleFactor = 1.0): void {
    this.text.addText(str, scaleFactor);
    const m = kMax(this.width, this.height);
    this.projection.reset();
    this.projection.translate(0.0, 0.0, m);
    this.projection.setLightOffset(new KVector(-this.width / 2.0, this.height, 0.0));
    this.projection.setZFar(m + 10);
    this.projection.setZNear(m - 10);
  }

  performAction(action: KikiAction): void {
    if (action.getId() === KikiScreenText.ACTION_SHOW) this.fade_value = action.getRelativeTime();
    else if (action.getId() === KikiScreenText.ACTION_HIDE) this.fade_value = 1.0 - action.getRelativeTime();
  }

  actionFinished(action: KikiAction): void {
    switch (action.getId()) {
      case KikiScreenText.ACTION_HIDE:
        this.getEventWithName('hide')!.triggerActions();
        Controller.timer_event.addAction(this.getActionWithId(KikiScreenText.ACTION_DELETE));
        break;
      case KikiScreenText.ACTION_DELETE:
        this.destroy();
        break;
      case KikiScreenText.ACTION_SHOW:
        this.fade_value = 1.0;
        break;
    }
  }

  handleKey(_key: KikiKey): boolean {
    this.startTimedAction(this.getActionWithId(KikiScreenText.ACTION_HIDE));
    return false;
  }

  /** KikiScreenText::display: the lines in the text's colour, faded */
  drawLines(): DrawLine[] {
    const c = this.text.color;
    const color: KColor = this.fade_value !== 1.0 ? [c[0], c[1], c[2], this.fade_value] : c;
    if (this.fade_value !== 1.0) this.text.color = color;
    return this.text.text_lines.map((line) => ({ line, color, highlight: false }));
  }
}

// -------------------------------------------------------------------------------------- KikiPageText
export class KikiPageText extends KikiScreenText {
  static readonly ACTION_NEXT_PAGE = 3;
  static readonly ACTION_PREVIOUS_PAGE = 4;

  constructor(pageText: string, nextPage: boolean, previousPage = false) {
    super();
    Controller.sound.playSound(Snd.MENU_FADE);
    this.setText(pageText, bright_color);
    this.addAction(new KikiAction(this, KikiPageText.ACTION_NEXT_PAGE, 'next'));
    this.addAction(new KikiAction(this, KikiPageText.ACTION_PREVIOUS_PAGE, 'previous'));
    if (nextPage) this.addEventWithName('next');
    if (previousPage) this.addEventWithName('previous');
    this.show();
  }

  private dropEvent(name: string): void {
    const e = this.getEventWithName(name);
    if (e) {
      this.events.splice(this.events.indexOf(e), 1);
      e.destroy();
    }
  }

  actionFinished(action: KikiAction): void {
    switch (action.getId()) {
      case KikiPageText.ACTION_NEXT_PAGE:
        this.getEventWithName('next')?.triggerActions();
        Controller.timer_event.addAction(this.getActionWithId(KikiScreenText.ACTION_DELETE));
        break;
      case KikiPageText.ACTION_PREVIOUS_PAGE:
        this.getEventWithName('previous')?.triggerActions();
        Controller.timer_event.addAction(this.getActionWithId(KikiScreenText.ACTION_DELETE));
        break;
      default:
        super.actionFinished(action);
    }
  }

  handleKey(key: KikiKey): boolean {
    let retval = false;
    const keyName = unmodifiedName(key);
    if (['DOWN', 'PAGEDOWN', 'RIGHT', 'RETURN', 'SPACE'].includes(keyName)) {
      if (this.getEventWithName('next')) {
        Controller.sound.playSound(Snd.MENU_SELECT);
        this.startTimedAction(this.getActionWithId(KikiPageText.ACTION_NEXT_PAGE));
      } else {
        this.dropEvent('previous');
        Controller.sound.playSound(Snd.MENU_ABORT);
        Controller.timer_event.addAction(this.getActionWithId(KikiScreenText.ACTION_HIDE));
      }
      retval = true;
    } else if (['UP', 'PAGEUP', 'LEFT'].includes(keyName)) {
      if (this.getEventWithName('previous')) {
        Controller.sound.playSound(Snd.MENU_SELECT);
        this.startTimedAction(this.getActionWithId(KikiPageText.ACTION_PREVIOUS_PAGE));
      }
      retval = true;
    } else {
      if (keyName === 'ESCAPE') retval = true;
      this.dropEvent('next');
      this.dropEvent('previous');
      Controller.sound.playSound(Snd.MENU_ABORT);
      Controller.timer_event.addAction(this.getActionWithId(KikiScreenText.ACTION_HIDE));
    }
    return retval;
  }

  drawLines(): DrawLine[] {
    const c = textColor(bright_color);
    const color: KColor = this.fade_value !== 1.0 ? [c[0], c[1], c[2], this.fade_value] : c;
    if (this.fade_value !== 1.0) this.text.color = color;
    return this.text.text_lines.map((line) => ({ line, color, highlight: false }));
  }
}

// ------------------------------------------------------------------------------------------ KikiMenu
export class KikiMenuItem {
  ignore = false;
  option = false;
  item_text: KikiTextLine | null = null;
  value_text: KikiTextLine | null = null;
  extra_text: KikiTextLine | null = null;
  event_name = '';
  getWidth(): number {
    let w = 0;
    if (this.item_text) w += this.item_text.getWidth();
    if (this.value_text) w += this.value_text.getWidth();
    return w;
  }
  getHeight(): number {
    let h = 0;
    if (this.item_text) h = this.item_text.getHeight();
    if (this.value_text) h = kMax(this.value_text.getHeight(), h);
    return h;
  }
}

export class KikiMenu extends KikiScreenText {
  index_offset = 0;
  active_index: number;
  circular = true;
  menu_items: KikiMenuItem[] = [];
  escape_active = true;

  constructor(selectedItem = -1) {
    super();
    if (selectedItem < 0) {
      this.active_index = 0;
      Controller.sound.playSound(Snd.MENU_FADE);
    } else {
      this.active_index = selectedItem;
      this.getActionWithId(KikiScreenText.ACTION_SHOW).setDuration(0);
      this.getActionWithId(KikiScreenText.ACTION_HIDE).setDuration(0);
      this.fade_value = 1.0;
    }
    this.addEventWithName('next');
    this.addEventWithName('previous');
    this.addEventWithName('changed');
    this.escape_active = true;
    // KikiScreenText::show (a virtual call from the base constructor in the original)
    this.startTimedAction(this.getActionWithId(KikiScreenText.ACTION_SHOW));
  }

  setEscapeActive(active: boolean | number = true): void { this.escape_active = !!active; }

  newItem(itemText: string, itemAction: KikiAction | null = null): KikiMenuItem {
    let item_text = itemText;
    let event_name = itemText;
    const item = new KikiMenuItem();
    let pos = item_text.indexOf('$event(');
    if (pos >= 0) {
      item_text = erase(item_text, pos, pos + 7);
      event_name = item_text.substring(pos, item_text.indexOf(')', pos));
      item_text = erase(item_text, pos, item_text.indexOf(')', pos) + 1);
    }
    pos = item_text.indexOf('$no_item');
    if (pos >= 0) {
      item_text = erase(item_text, pos, pos + 8);
      item.ignore = true;
    } else {
      this.addEventWithName(event_name);
      item.event_name = event_name;
      if (itemAction) this.getEventWithName(event_name)!.addAction(itemAction);
    }
    pos = item_text.indexOf('|');
    if (pos >= 0) {
      let valueText = item_text.substring(pos + 1);
      item_text = item_text.substring(0, pos);
      const p2 = valueText.indexOf('|');
      if (p2 >= 0) {
        item.extra_text = new KikiTextLine(valueText.substring(p2 + 1), 1.0);
        valueText = valueText.substring(0, p2);
      }
      item.value_text = new KikiTextLine(valueText, 1.0);
    }
    item.item_text = new KikiTextLine(item_text);
    return item;
  }

  addItem(itemText: string, itemAction: KikiAction | null = null, option = false): void {
    this.menu_items.push(this.newItem(itemText, itemAction));
    this.menu_items[this.menu_items.length - 1].option = option;
    this.alignItems();
  }

  currentItem(): KikiMenuItem | null { return this.active_index >= 0 ? this.menu_items[this.active_index] : null; }

  alignItems(): void {
    const t = this.text;
    t.width = 0;
    t.height = 0;
    let value_offset = 0;
    let value_width = 0;
    for (const it of this.menu_items) {
      if (it.getWidth() > t.width) t.width = it.getWidth();
      t.height += it.getHeight() + t.line_spacing;
      if (it.value_text) {
        value_offset = kMax(it.item_text!.getWidth(), value_offset);
        value_width = kMax(it.value_text.getWidth(), value_width);
      }
    }
    if (value_offset === 0.0) value_offset = t.width / 2.0;
    else t.width = kMax(t.width, value_offset + value_width);
    let currentHeight = this.menu_items[0].getHeight();
    for (const it of this.menu_items) {
      const yOffset = -(currentHeight - t.height / 2.0);
      currentHeight += it.getHeight() + t.line_spacing;
      if (t.centered) {
        if (it.value_text) {
          it.item_text!.setPosition(new KVector(-t.width / 2.0 + value_offset - it.item_text!.getWidth(), yOffset, 0));
          it.value_text.setPosition(new KVector(-t.width / 2.0 + value_offset, yOffset, 0));
        } else {
          it.item_text!.setPosition(new KVector(-it.item_text!.getWidth() / 2.0, yOffset, 0));
        }
      } else {
        it.item_text!.setPosition(new KVector(0, yOffset, 0));
        if (it.value_text) it.value_text.setPosition(new KVector(value_offset, yOffset, 0));
      }
    }
    this.placeProjection(1.2);
  }

  protected placeProjection(factor: number): void {
    const ar = this.projection.getCurrentAspectRatio();
    const distance = kMax(this.width / ar, this.height) * factor;
    this.projection.reset();
    this.projection.translate(0, 0, distance);
    this.projection.setLightOffset(new KVector(-this.width / (ar * 2.0), this.height, 0));
    this.projection.setZFar(distance + 10);
    this.projection.setZNear(distance - 10);
  }

  performAction(action: KikiAction): void {
    super.performAction(action);
    if (action.getId() === KikiScreenText.ACTION_SHOW) this.fade_value = 1.0;
  }

  actionFinished(action: KikiAction): void {
    if (action.getId() === KikiScreenText.ACTION_HIDE) {
      if (this.active_index >= 0) this.getEventWithName(this.currentItem()!.event_name)?.triggerActions();
      else this.getEventWithName('hide')!.triggerActions();
      Controller.timer_event.addAction(this.getActionWithId(KikiScreenText.ACTION_DELETE));
    } else {
      super.actionFinished(action);
    }
  }

  nextItem(): void {
    do {
      if (this.circular) this.active_index = (this.active_index + 1) % this.menu_items.length;
      else this.active_index = kMin(this.active_index + 1, this.menu_items.length - 1);
    } while (this.menu_items[this.active_index].ignore);
  }

  previousItem(): void {
    do {
      if (this.circular) this.active_index = this.active_index > 0 ? this.active_index - 1 : this.menu_items.length - 1;
      else this.active_index = kMax(this.active_index - 1, 0);
    } while (this.menu_items[this.active_index].ignore);
  }

  handleKey(key: KikiKey): boolean {
    const keyName = unmodifiedName(key);
    if (keyName === 'DOWN') {
      this.nextItem();
      this.getEventWithName('next')!.triggerActions();
      this.getEventWithName('changed')!.triggerActions();
      Controller.sound.playSound(Snd.MENU_ITEM);
    } else if (keyName === 'UP') {
      this.previousItem();
      this.getEventWithName('previous')!.triggerActions();
      this.getEventWithName('changed')!.triggerActions();
      Controller.sound.playSound(Snd.MENU_ITEM);
    } else if (keyName === 'ESCAPE' && this.escape_active) {
      Controller.sound.playSound(Snd.MENU_ABORT);
      this.active_index = -1;
      this.getActionWithId(KikiScreenText.ACTION_HIDE).setDuration(500);
      Controller.timer_event.addAction(this.getActionWithId(KikiScreenText.ACTION_HIDE));
      Controller.removeFocusKeyHandler(this);
    } else if (keyName === 'RETURN' || keyName === 'SPACE') {
      if (this.currentItem()!.ignore === false) {
        Controller.sound.playSound(Snd.MENU_SELECT);
        this.getEventWithName(this.currentItem()!.event_name)!.triggerActions();
        Controller.timer_event.addAction(this.getActionWithId(KikiScreenText.ACTION_DELETE));
        Controller.removeFocusKeyHandler(this);
      }
    } else if (keyName === 'RIGHT') {
      const it = this.currentItem()!;
      if (it.option === true && it.ignore === false) {
        Controller.sound.playSound(Snd.MENU_SELECT);
        this.getEventWithName(it.event_name)!.triggerActions();
        Controller.timer_event.addAction(this.getActionWithId(KikiScreenText.ACTION_DELETE));
        Controller.removeFocusKeyHandler(this);
      }
    } else if (key.name === Controller.quit_key) {
      Controller.quit();
    }
    return true;
  }

  /** KikiMenu::display: the active item bright and twice as deep, items with values in base/dark */
  drawLines(): DrawLine[] {
    const out: DrawLine[] = [];
    const faded = (c: KColor): KColor => (this.fade_value !== 1.0 ? [c[0], c[1], c[2], this.fade_value] : c);
    this.menu_items.forEach((it, index) => {
      const active = index === this.active_index - this.index_offset;
      let list_color: number;
      let value_color = base_color;
      if (active) list_color = bright_color;
      else if (it.value_text) { value_color = dark_color; list_color = base_color; }
      else list_color = dark_color;
      out.push({ line: it.item_text!, color: faded(textColor(list_color)), highlight: active });
      if (it.value_text) {
        out.push({ line: it.value_text, color: faded(textColor(value_color)), highlight: active });
        if (it.extra_text) out.push({ line: it.extra_text, color: faded(textColor(value_color)), highlight: active });
      }
    });
    return out;
  }
}

// ------------------------------------------------------------------------------------ KikiColumnMenu
export class KikiColumnMenu extends KikiMenu {
  column_spacing = 6.0;
  max_column_items: number;

  constructor(maxColumnItems = 10, activeItem = -1) {
    super(activeItem);
    this.max_column_items = maxColumnItems;
    this.text.centered = false;
  }

  alignItems(): void {
    const t = this.text;
    const numLines = this.menu_items.length;
    t.width = 0;
    t.height = 0;
    let value_offset = 0;
    let value_width = 0;
    let extra_width = 0;
    for (const it of this.menu_items) {
      if (it.getWidth() > t.width) t.width = it.getWidth();
      t.height += it.getHeight() + t.line_spacing;
      if (it.value_text) {
        value_offset = kMax(it.item_text!.getWidth(), value_offset);
        value_width = kMax(it.value_text.getWidth(), value_width);
      }
      if (it.extra_text) extra_width = kMax(it.extra_text.getWidth(), extra_width);
    }
    if (value_offset === 0.0) value_offset = t.width / 2.0;
    else t.width = kMax(t.width, value_offset + value_width + extra_width);
    let currentHeight = 0;
    const columns = Math.ceil(numLines / this.max_column_items);
    const column_items = Math.ceil(numLines / columns);
    let column_offset = 0;
    let column_line_index = 0;
    let column_index = -1;
    const column_width = t.width + this.column_spacing;
    t.width = columns * column_width;
    t.height = t.height / columns + 2 * this.column_spacing;
    for (let lineIndex = 0; lineIndex < numLines; lineIndex++) {
      const it = this.menu_items[lineIndex];
      if (column_line_index % column_items === 0) {
        column_index++;
        column_offset = (-columns * column_width) / 2.0 + column_index * column_width + column_width / 2.0;
        column_line_index = 0;
        currentHeight = it.getHeight() + this.column_spacing;
      } else {
        currentHeight += it.getHeight() + t.line_spacing;
      }
      const yOffset = -(currentHeight - t.height / 2.0);
      column_line_index++;
      if (t.centered) {
        if (it.value_text) {
          it.item_text!.setPosition(new KVector(-column_width / 2.0 + value_offset + column_offset - it.item_text!.getWidth(), yOffset, 0));
          it.value_text.setPosition(new KVector(-column_width / 2.0 + value_offset + column_offset, yOffset, 0));
        } else {
          it.item_text!.setPosition(new KVector(it.item_text!.getWidth() / 2.0 + column_offset, yOffset, 0));
        }
      } else {
        it.item_text!.setPosition(new KVector(column_offset - column_width / 2.0, yOffset, 0));
        if (it.value_text) it.value_text.setPosition(new KVector(column_offset - column_width / 2.0 + value_offset, yOffset, 0));
        if (it.extra_text) it.extra_text.setPosition(new KVector(column_offset + column_width / 2.0 - extra_width, yOffset, 0));
      }
    }
    this.placeProjection(1.0);
  }
}

// ------------------------------------------------------------------------------------ KikiScrollMenu
export class KikiScrollMenu extends KikiColumnMenu {
  num_rows: number;
  visible_items: number;
  offset: number;
  all_menu_items: KikiMenuItem[] = [];

  constructor(rows = 5, columns = 4, activeItem = -1) {
    super(rows, activeItem);
    this.num_rows = rows;
    this.visible_items = rows * columns;
    this.offset = this.index_offset = kMax(0, this.active_index - this.visible_items + 1);
  }

  addItem(itemText: string, itemAction: KikiAction | null = null, _option = false): void {
    this.all_menu_items.push(this.newItem(itemText, itemAction));
  }

  show(): void {
    this.activeIndexChanged();
    super.show();
  }

  getCurrentIndex(): number { return this.active_index; }

  nextItem(): void {
    if (this.circular) this.active_index = (this.active_index + 1) % this.all_menu_items.length;
    else this.active_index = kMin(this.active_index + 1, this.all_menu_items.length - 1);
    this.activeIndexChanged();
  }

  previousItem(): void {
    if (this.circular) this.active_index = this.active_index > 0 ? this.active_index - 1 : this.all_menu_items.length - 1;
    else this.active_index = kMax(this.active_index - 1, 0);
    this.activeIndexChanged();
  }

  activeIndexChanged(): void {
    const min_index_offset = kMax(0, this.active_index - this.visible_items + 1);
    const max_index_offset = this.active_index;
    this.offset = kMin(max_index_offset, kMax(min_index_offset, this.offset));
    this.menu_items = this.all_menu_items.slice(this.offset, kMin(this.all_menu_items.length, this.offset + this.visible_items));
    this.index_offset = this.offset;
    this.alignItems();
  }

  currentItem(): KikiMenuItem | null { return this.active_index >= 0 ? this.all_menu_items[this.active_index] : null; }

  handleKey(key: KikiKey): boolean {
    const keyName = unmodifiedName(key);
    if (keyName === 'LEFT' || keyName === 'RIGHT') {
      this.active_index += (keyName === 'LEFT' ? -1 : 1) * this.num_rows;
      const n = this.all_menu_items.length;
      if (this.circular) {
        if (this.active_index < 0) this.active_index += n;
        else if (this.active_index >= n) this.active_index -= n;
      } else if (this.active_index < 0) {
        this.offset = this.index_offset = this.active_index = 0;
      } else {
        this.active_index = kMin(n - 1, this.active_index);
      }
      this.activeIndexChanged();
      this.getEventWithName('changed')!.triggerActions();
      return true;
    }
    return super.handleKey(key);
  }
}

/** py/action.py once() and continuous() */
export function once(fn: (() => unknown) | KikiPyAction['target'], name = 'kikipy action'): KikiPyAction {
  return new KikiPyAction(fn, name, 0, 0);
}
export function continuous(fn: (() => unknown) | KikiPyAction['target'], name = 'continuous kikipy action'): KikiPyAction {
  return new KikiPyAction(fn, name, 0, 1);
}
