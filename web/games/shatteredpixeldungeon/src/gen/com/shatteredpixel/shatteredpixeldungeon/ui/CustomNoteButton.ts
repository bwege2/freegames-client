// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/CustomNoteButton.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
/*
 * Pixel Dungeon
 * Copyright (C) 2012-2015 Oleg Dolya
 *
 * Shattered Pixel Dungeon
 * Copyright (C) 2014-2026 Evan Debenham
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 */
import { $J, ArrayList, Collections, JString } from '../../../../../jre/index.ts';
import { IconButton } from './IconButton.ts';
import { WndOptions } from '../windows/WndOptions.ts';
import { WndTitledMessage } from '../windows/WndTitledMessage.ts';
import { WndJournalItem } from '../windows/WndJournalItem.ts';

let Statistics, EquipableItem, Generator$Category, Ring, Scroll, Trinket, Wand, Notes, Notes$CustomRecord, Messages, GameScene, PixelScene, Icons, ItemButton, RedButton, WndBag, WndBag$ItemSelector, WndJournal, WndTextInput, WndUseItem, Game, Reflection;

export class CustomNoteButton extends IconButton {
  static NOTE_SELECT_INSTANCE: CustomNoteButton$WndNoteTypeSelect = null;
  itemSelector: WndBag$ItemSelector = null;
  static itemVisualcomparator: Comparator<Item> = null;
  _CustomNoteButton(): this {
    this._IconButton$Image(Icons.PLUS.get());
    this.itemSelector = new (CustomNoteButton$1())().$o(this)._WndBag$ItemSelector();
    this.width_ = 11;
    this.height_ = 11;
    return this;
  }
  onClick(): void {
    super.onClick();
    if (Notes.getRecords$Class($J.cls(Notes$CustomRecord)).size() >= Notes.customRecordLimit()) {
      GameScene.show(new WndTitledMessage()._WndTitledMessage$Image$String$String(Icons.INFO.get(), Messages.get$Object$String$ObjectArr(this, 'limit_title', []), Messages.get$Object$String$ObjectArr(this, 'limit_text', [])));
      return;
    }
    GameScene.show(new CustomNoteButton$WndNoteTypeSelect().$o(this)._CustomNoteButton$WndNoteTypeSelect());
  }
  hoverText(): string {
    return Messages.get$Object$String$ObjectArr(this, 'title', []);
  }
  static addNote(parentWindow: Window, note: Notes$CustomRecord, promptTitle: string, prompttext: string): void {
    GameScene.show(new (CustomNoteButton$3())().$c(note, parentWindow)._WndTextInput(promptTitle, prompttext, '', 50, false, Messages.get$Class$String$ObjectArr($J.cls(CustomNoteButton$CustomNoteWindow), 'confirm', []), Messages.get$Class$String$ObjectArr($J.cls(CustomNoteButton$CustomNoteWindow), 'cancel', [])));
  }
  static $clinit() {
    CustomNoteButton.itemVisualcomparator = (i1, i2) => {
      let i1Idx = i1.image();
      let i2Idx = i2.image();
      if (i1 instanceof Scroll) {
        i1Idx = (i1Idx + 1000) | 0;
      }
      if (i1 instanceof Ring) {
        i1Idx = (i1Idx + 2000) | 0;
      }
      if (i2 instanceof Scroll) {
        i2Idx = (i2Idx + 1000) | 0;
      }
      if (i2 instanceof Ring) {
        i2Idx = (i2Idx + 2000) | 0;
      }
      return (i1Idx - i2Idx) | 0;
    };
  }
}

export class CustomNoteButton$WndNoteTypeSelect extends WndOptions {
  _CustomNoteButton$WndNoteTypeSelect(): this {
    this._WndOptions$Image$String$String$StringArr(Icons.SCROLL_COLOR.get(), Messages.get$Class$String$ObjectArr($J.cls(CustomNoteButton), 'title', []), Messages.get$Class$String$ObjectArr($J.cls(CustomNoteButton), 'desc', []), [Messages.get$Class$String$ObjectArr($J.cls(CustomNoteButton), 'new_text', []), Messages.get$Class$String$ObjectArr($J.cls(CustomNoteButton), 'new_floor', []), Messages.get$Class$String$ObjectArr($J.cls(CustomNoteButton), 'new_inv', []), Messages.get$Class$String$ObjectArr($J.cls(CustomNoteButton), 'new_type', [])]);
    CustomNoteButton.NOTE_SELECT_INSTANCE = this;
    return this;
  }
  onSelect(index: number): void {
    if (index === 0) {
      let custom = new Notes$CustomRecord()._Notes$CustomRecord$String$String('', '');
      CustomNoteButton.addNote(null, custom, Messages.get$Class$String$ObjectArr($J.cls(CustomNoteButton), 'new_text', []), Messages.get$Class$String$ObjectArr($J.cls(CustomNoteButton), 'new_text_title', []));
    } else if (index === 1) {
      GameScene.show(new CustomNoteButton$WndDepthSelect().$o(this.$outer)._CustomNoteButton$WndDepthSelect());
    } else if (index === 2) {
      GameScene.selectItem(this.$outer.itemSelector);
    } else {
      GameScene.show(new CustomNoteButton$WndItemtypeSelect()._CustomNoteButton$WndItemtypeSelect());
    }
  }
  hide(): void {
  }
  onBackPressed(): void {
    super.hide();
    CustomNoteButton.NOTE_SELECT_INSTANCE = null;
  }
}

export class CustomNoteButton$WndDepthSelect extends WndTitledMessage {
  _CustomNoteButton$WndDepthSelect(): this {
    this._WndTitledMessage$Image$String$String(Icons.STAIRS.get(), Messages.get$Class$String$ObjectArr($J.cls(CustomNoteButton), 'new_floor', []), Messages.get$Class$String$ObjectArr($J.cls(CustomNoteButton), 'new_floor_prompt', []));
    let top = (this.height_ + 2) | 0;
    let left = 0;
    for (let i = Statistics.deepestFloor; i > 0; i--) {
      if (i % 5 === 0 && left > 0) {
        left = 0;
        top = (top + 17) | 0;
      }
      let finalI = i;
      let btnDepth = new (CustomNoteButton$WndDepthSelect$1())().$o(this).$c(finalI)._RedButton$String(String(finalI));
      btnDepth.setRect(Math.fround(left), Math.fround(top), 23, 16);
      left = (left + 24) | 0;
      this.add$Gizmo(btnDepth);
    }
    this.resize(this.width_, (top + (left === 0 ? 0 : 16)) | 0);
    return this;
  }
}

export class CustomNoteButton$WndItemtypeSelect extends WndTitledMessage {
  _CustomNoteButton$WndItemtypeSelect(): this {
    this._WndTitledMessage$Image$String$String(Icons.SCROLL_COLOR.get(), Messages.get$Class$String$ObjectArr($J.cls(CustomNoteButton), 'new_type', []), Messages.get$Class$String$ObjectArr($J.cls(CustomNoteButton), 'new_type_prompt', []));
    let top = (this.height_ + 2) | 0;
    let left = 0;
    let items = new ArrayList();
    for (let potionCls of Generator$Category.POTION.classes) {
      items.add(Reflection.newInstance(potionCls));
    }
    for (let potionCls of Generator$Category.SCROLL.classes) {
      items.add(Reflection.newInstance(potionCls));
    }
    for (let potionCls of Generator$Category.RING.classes) {
      items.add(Reflection.newInstance(potionCls));
    }
    Collections.sort(items, CustomNoteButton.itemVisualcomparator);
    for (const $it0 = items.iterator(); $it0.hasNext(); ) {
      let item = $it0.next();
      let itemButton = new (CustomNoteButton$WndItemtypeSelect$1())().$o(this).$c(item)._ItemButton();
      itemButton.item$Item(item);
      itemButton.setRect(Math.fround(left), Math.fround(top), 19, 19);
      this.add$Gizmo(itemButton);
      if (Notes.findCustomRecord$Class(item.getClass()) != null) {
        itemButton.slot_.enable(false);
      }
      left = (left + 20) | 0;
      if (left >= ((this.width_ - 19) | 0)) {
        top = (top + 20) | 0;
        left = 0;
      }
    }
    if (left > 0) {
      top = (top + 20) | 0;
      left = 0;
    }
    this.resize(this.width_, top);
    return this;
  }
}

export class CustomNoteButton$CustomNoteWindow extends WndJournalItem {
  _CustomNoteButton$CustomNoteWindow(rec: Notes$CustomRecord, parentWindow: Window): this {
    this._WndJournalItem(rec.icon(), rec.title(), rec.desc());
    let title = new (CustomNoteButton$CustomNoteWindow$1())().$o(this).$c(rec, parentWindow)._RedButton$String(Messages.get$Class$String$ObjectArr($J.cls(CustomNoteButton$CustomNoteWindow), 'edit_title', []));
    this.add$Gizmo(title);
    title.setRect(0, Math.fround(Math.min((this.height_ + 2) | 0, (PixelScene.uiCamera.height_ - 50) | 0)), Math.fround(($J.idiv(this.width_, 2) - 1) | 0), 16);
    let editBodyText = (rec.desc().length === 0) ? Messages.get$Class$String$ObjectArr($J.cls(CustomNoteButton$CustomNoteWindow), 'add_text', []) : Messages.get$Class$String$ObjectArr($J.cls(CustomNoteButton$CustomNoteWindow), 'edit_text', []);
    let body = new (CustomNoteButton$CustomNoteWindow$2())().$o(this).$c(editBodyText, rec, parentWindow)._RedButton$String(editBodyText);
    this.add$Gizmo(body);
    body.setRect(Math.fround(title.right() + 2), title.top(), Math.fround(($J.idiv(this.width_, 2) - 1) | 0), 16);
    let delete$ = new (CustomNoteButton$CustomNoteWindow$3())().$o(this).$c(rec, parentWindow)._RedButton$String(Messages.get$Class$String$ObjectArr($J.cls(CustomNoteButton$CustomNoteWindow), 'delete', []));
    this.add$Gizmo(delete$);
    delete$.setRect(0, Math.fround(title.bottom() + 1), Math.fround(this.width_), 16);
    this.resize(this.width_, $J.d2i(delete$.bottom()));
    return this;
  }
  useHighlighting(): boolean {
    return false;
  }
}

let $CustomNoteButton$1: any = null;
/** An anonymous class (CustomNoteButton.java:158). */
function CustomNoteButton$1(): any {
  return $CustomNoteButton$1 ??= $J.local(class extends WndBag$ItemSelector {
    textPrompt(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(CustomNoteButton), 'new_inv_prompt', []);
    }
    hideAfterSelecting(): boolean {
      return false;
    }
    itemSelectable(item: Item): boolean {
      if (item instanceof EquipableItem) {
        if (item instanceof Ring && Notes.findCustomRecord$Class(item.getClass()) != null) {
          return false;
        }
        return item.customNoteID === -1 || Notes.findCustomRecord$int(item.customNoteID) == null;
      } else {
        return Notes.findCustomRecord$Class(item.getClass()) == null;
      }
    }
    onSelect(item: Item): void {
      if (item != null) {
        let custom: Notes$CustomRecord;
        if (item instanceof EquipableItem || item instanceof Wand || item instanceof Trinket) {
          custom = new Notes$CustomRecord()._Notes$CustomRecord$Item$String$String(item, '', '');
          custom.assignID();
          item.customNoteID = custom.ID();
        } else {
          custom = new Notes$CustomRecord()._Notes$CustomRecord$Class$String$String(item.getClass(), '', '');
          custom.assignID();
        }
        CustomNoteButton.addNote(null, custom, Messages.get$Class$String$ObjectArr($J.cls(CustomNoteButton), 'new_inv', []), Messages.get$Class$String$ObjectArr($J.cls(CustomNoteButton), 'new_item_title', [Messages.titleCase(item.name())]));
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.CustomNoteButton$1', []);
}

let $CustomNoteButton$3: any = null;
/** An anonymous class (CustomNoteButton.java:375). */
function CustomNoteButton$3(): any {
  return $CustomNoteButton$3 ??= $J.local(class extends WndTextInput {
    onSelect(positive: boolean, text: string): void {
      if (positive && !(text.length === 0)) {
        Notes.add$CustomRecord(this.$cv_note);
        this.$cv_note.editText(text, '');
        if (this.$cv_parentWindow != null) {
          this.$cv_parentWindow.hide();
        }
        if (WndBag.INSTANCE != null) {
          WndBag.INSTANCE.hide();
        }
        if (CustomNoteButton.NOTE_SELECT_INSTANCE != null) {
          CustomNoteButton.NOTE_SELECT_INSTANCE.onBackPressed();
        }
        this.hide();
        let wnd = new WndJournal()._WndJournal();
        Game.scene().addToFront(wnd);
        Game.scene().addToFront(new CustomNoteButton$CustomNoteWindow()._CustomNoteButton$CustomNoteWindow(this.$cv_note, wnd));
      }
    }
    $c($note, $parentWindow): this {
      this.$cv_note = $note; this.$cv_parentWindow = $parentWindow;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.CustomNoteButton$3', []);
}

let $CustomNoteButton$WndDepthSelect$1: any = null;
/** An anonymous class (CustomNoteButton.java:139). */
function CustomNoteButton$WndDepthSelect$1(): any {
  return $CustomNoteButton$WndDepthSelect$1 ??= $J.local(class extends RedButton {
    onClick(): void {
      CustomNoteButton.addNote(this.$outer, new Notes$CustomRecord()._Notes$CustomRecord$int$String$String(this.$cv_finalI, '', ''), Messages.get$Class$String$ObjectArr($J.cls(CustomNoteButton), 'new_floor', []), Messages.get$Class$String$ObjectArr($J.cls(CustomNoteButton), 'new_floor_title', [this.$cv_finalI]));
    }
    $c($finalI): this {
      this.$cv_finalI = $finalI;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.CustomNoteButton$WndDepthSelect$1', []);
}

let $CustomNoteButton$WndItemtypeSelect$1: any = null;
/** An anonymous class (CustomNoteButton.java:225). */
function CustomNoteButton$WndItemtypeSelect$1(): any {
  return $CustomNoteButton$WndItemtypeSelect$1 ??= $J.local(class extends ItemButton {
    onClick(): void {
      CustomNoteButton.addNote(this.$outer, new Notes$CustomRecord()._Notes$CustomRecord$Class$String$String(this.$cv_item.getClass(), '', ''), Messages.get$Class$String$ObjectArr($J.cls(CustomNoteButton), 'new_type', []), Messages.get$Class$String$ObjectArr($J.cls(CustomNoteButton), 'new_item_title', [Messages.titleCase(this.$cv_item.name())]));
    }
    $c($item): this {
      this.$cv_item = $item;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.CustomNoteButton$WndItemtypeSelect$1', []);
}

let $CustomNoteButton$CustomNoteWindow$1$1: any = null;
/** An anonymous class (CustomNoteButton.java:287). */
function CustomNoteButton$CustomNoteWindow$1$1(): any {
  return $CustomNoteButton$CustomNoteWindow$1$1 ??= $J.local(class extends WndTextInput {
    onSelect(positive: boolean, text: string): void {
      if (positive && !(text.length === 0)) {
        this.$cv_rec.editText(text, this.$cv_rec.desc());
        this.$outer.$outer.hide();
        if (this.$cv_parentWindow instanceof WndUseItem) {
          let newParent = new WndUseItem()._WndUseItem((this.$cv_parentWindow).owner, (this.$cv_parentWindow).item_);
          GameScene.show(newParent);
          GameScene.show(new CustomNoteButton$CustomNoteWindow()._CustomNoteButton$CustomNoteWindow(this.$cv_rec, newParent));
        } else {
          GameScene.show(new CustomNoteButton$CustomNoteWindow()._CustomNoteButton$CustomNoteWindow(this.$cv_rec, this.$cv_parentWindow));
        }
      }
    }
    $c($rec, $parentWindow): this {
      this.$cv_rec = $rec; this.$cv_parentWindow = $parentWindow;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.CustomNoteButton$CustomNoteWindow$1$1', []);
}

let $CustomNoteButton$CustomNoteWindow$1: any = null;
/** An anonymous class (CustomNoteButton.java:278). */
function CustomNoteButton$CustomNoteWindow$1(): any {
  return $CustomNoteButton$CustomNoteWindow$1 ??= $J.local(class extends RedButton {
    onClick(): void {
      GameScene.show(new (CustomNoteButton$CustomNoteWindow$1$1())().$o(this).$c(this.$cv_rec, this.$cv_parentWindow)._WndTextInput(Messages.get$Class$String$ObjectArr($J.cls(CustomNoteButton$CustomNoteWindow), 'edit_title', []), '', this.$cv_rec.title(), 50, false, Messages.get$Class$String$ObjectArr($J.cls(CustomNoteButton$CustomNoteWindow), 'confirm', []), Messages.get$Class$String$ObjectArr($J.cls(CustomNoteButton$CustomNoteWindow), 'cancel', [])));
    }
    $c($rec, $parentWindow): this {
      this.$cv_rec = $rec; this.$cv_parentWindow = $parentWindow;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.CustomNoteButton$CustomNoteWindow$1', []);
}

let $CustomNoteButton$CustomNoteWindow$2$1: any = null;
/** An anonymous class (CustomNoteButton.java:318). */
function CustomNoteButton$CustomNoteWindow$2$1(): any {
  return $CustomNoteButton$CustomNoteWindow$2$1 ??= $J.local(class extends WndTextInput {
    onSelect(positive: boolean, text: string): void {
      if (positive) {
        this.$cv_rec.editText(this.$cv_rec.title(), text);
        this.$outer.$outer.hide();
        GameScene.show(new CustomNoteButton$CustomNoteWindow()._CustomNoteButton$CustomNoteWindow(this.$cv_rec, this.$cv_parentWindow));
      }
    }
    $c($rec, $parentWindow): this {
      this.$cv_rec = $rec; this.$cv_parentWindow = $parentWindow;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.CustomNoteButton$CustomNoteWindow$2$1', []);
}

let $CustomNoteButton$CustomNoteWindow$2: any = null;
/** An anonymous class (CustomNoteButton.java:309). */
function CustomNoteButton$CustomNoteWindow$2(): any {
  return $CustomNoteButton$CustomNoteWindow$2 ??= $J.local(class extends RedButton {
    onClick(): void {
      GameScene.show(new (CustomNoteButton$CustomNoteWindow$2$1())().$o(this).$c(this.$cv_rec, this.$cv_parentWindow)._WndTextInput(this.$cv_editBodyText, '', this.$cv_rec.desc(), 500, true, Messages.get$Class$String$ObjectArr($J.cls(CustomNoteButton$CustomNoteWindow), 'confirm', []), Messages.get$Class$String$ObjectArr($J.cls(CustomNoteButton$CustomNoteWindow), 'cancel', [])));
    }
    $c($editBodyText, $rec, $parentWindow): this {
      this.$cv_editBodyText = $editBodyText; this.$cv_rec = $rec; this.$cv_parentWindow = $parentWindow;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.CustomNoteButton$CustomNoteWindow$2', []);
}

let $CustomNoteButton$CustomNoteWindow$3$1: any = null;
/** An anonymous class (CustomNoteButton.java:340). */
function CustomNoteButton$CustomNoteWindow$3$1(): any {
  return $CustomNoteButton$CustomNoteWindow$3$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      if (index === 0) {
        Notes.remove$CustomRecord(this.$cv_rec);
        this.$outer.$outer.hide();
        if (this.$cv_parentWindow instanceof WndJournal || this.$cv_parentWindow == null) {
          Game.scene().addToFront(new WndJournal()._WndJournal());
        } else if (this.$cv_parentWindow instanceof WndUseItem) {
          GameScene.show(new WndUseItem()._WndUseItem((this.$cv_parentWindow).owner, (this.$cv_parentWindow).item_));
        }
      }
    }
    $c($rec, $parentWindow): this {
      this.$cv_rec = $rec; this.$cv_parentWindow = $parentWindow;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.CustomNoteButton$CustomNoteWindow$3$1', []);
}

let $CustomNoteButton$CustomNoteWindow$3: any = null;
/** An anonymous class (CustomNoteButton.java:333). */
function CustomNoteButton$CustomNoteWindow$3(): any {
  return $CustomNoteButton$CustomNoteWindow$3 ??= $J.local(class extends RedButton {
    onClick(): void {
      GameScene.show(new (CustomNoteButton$CustomNoteWindow$3$1())().$o(this).$c(this.$cv_rec, this.$cv_parentWindow)._WndOptions$Image$String$String$StringArr(Icons.WARNING.get(), Messages.get$Class$String$ObjectArr($J.cls(CustomNoteButton$CustomNoteWindow), 'delete', []), Messages.get$Class$String$ObjectArr($J.cls(CustomNoteButton$CustomNoteWindow), 'delete_warn', []), [Messages.get$Class$String$ObjectArr($J.cls(CustomNoteButton$CustomNoteWindow), 'confirm', []), Messages.get$Class$String$ObjectArr($J.cls(CustomNoteButton$CustomNoteWindow), 'cancel', [])]));
    }
    $c($rec, $parentWindow): this {
      this.$cv_rec = $rec; this.$cv_parentWindow = $parentWindow;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.CustomNoteButton$CustomNoteWindow$3', []);
}

$J.define(CustomNoteButton, 'com.shatteredpixel.shatteredpixeldungeon.ui.CustomNoteButton', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.IconButton', ctors: { '': '_CustomNoteButton' }, clinit: true, lazy: ['NOTE_SELECT_INSTANCE', 'itemVisualcomparator'] });
$J.define(CustomNoteButton$WndNoteTypeSelect, 'com.shatteredpixel.shatteredpixeldungeon.ui.CustomNoteButton$WndNoteTypeSelect', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions', ctors: { '': '_CustomNoteButton$WndNoteTypeSelect' }, inner: true });
$J.define(CustomNoteButton$WndDepthSelect, 'com.shatteredpixel.shatteredpixeldungeon.ui.CustomNoteButton$WndDepthSelect', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.windows.WndTitledMessage', ctors: { '': '_CustomNoteButton$WndDepthSelect' }, inner: true });
$J.define(CustomNoteButton$WndItemtypeSelect, 'com.shatteredpixel.shatteredpixeldungeon.ui.CustomNoteButton$WndItemtypeSelect', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.windows.WndTitledMessage', ctors: { '': '_CustomNoteButton$WndItemtypeSelect' } });
$J.define(CustomNoteButton$CustomNoteWindow, 'com.shatteredpixel.shatteredpixeldungeon.ui.CustomNoteButton$CustomNoteWindow', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.windows.WndJournalItem', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.journal.Notes$CustomRecord,com.shatteredpixel.shatteredpixeldungeon.ui.Window': '_CustomNoteButton$CustomNoteWindow' } });
$J.module(() => {
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  EquipableItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.EquipableItem');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  Ring = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.Ring');
  Scroll = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.Scroll');
  Trinket = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.Trinket');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  Notes = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes');
  Notes$CustomRecord = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes$CustomRecord');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  ItemButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ItemButton');
  RedButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RedButton');
  WndBag = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndBag');
  WndBag$ItemSelector = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndBag$ItemSelector');
  WndJournal = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndJournal');
  WndTextInput = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndTextInput');
  WndUseItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndUseItem');
  Game = $J.load('com.watabou.noosa.Game');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
