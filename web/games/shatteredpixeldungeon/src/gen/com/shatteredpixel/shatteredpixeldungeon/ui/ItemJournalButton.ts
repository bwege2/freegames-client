// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/ItemJournalButton.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JString } from '../../../../../jre/index.ts';
import { IconButton } from './IconButton.ts';

let EquipableItem, Trinket, Wand, Notes, Notes$CustomRecord, Messages, GameScene, CustomNoteButton, CustomNoteButton$CustomNoteWindow, Icons, WndTextInput, WndTitledMessage, WndUseItem;

export class ItemJournalButton extends IconButton {
  item_: Item = null;
  parentWnd: Window = null;
  _ItemJournalButton(item: Item, parentWnd: Window): this {
    this._IconButton$Image(Icons.JOURNAL.get());
    this.item_ = item;
    this.parentWnd = parentWnd;
    return this;
  }
  onClick(): void {
    this.customNote();
  }
  customNote(): void {
    let note = null;
    if (this.item_ instanceof EquipableItem || this.item_ instanceof Wand || this.item_ instanceof Trinket) {
      note = Notes.findCustomRecord$int(this.item_.customNoteID);
    } else {
      note = Notes.findCustomRecord$Class(this.item_.getClass());
    }
    if (note == null) {
      if (Notes.getRecords$Class($J.cls(Notes$CustomRecord)).size() >= Notes.customRecordLimit()) {
        GameScene.show(new WndTitledMessage()._WndTitledMessage$Image$String$String(Icons.INFO.get(), Messages.get$Class$String$ObjectArr($J.cls(CustomNoteButton), 'limit_title', []), Messages.get$Class$String$ObjectArr($J.cls(CustomNoteButton), 'limit_text', [])));
      } else {
        if (this.item_ instanceof EquipableItem || this.item_ instanceof Wand || this.item_ instanceof Trinket) {
          note = new Notes$CustomRecord()._Notes$CustomRecord$Item$String$String(this.item_, '', '');
          note.assignID();
          this.item_.customNoteID = note.ID();
        } else {
          note = new Notes$CustomRecord()._Notes$CustomRecord$Class$String$String(this.item_.getClass(), '', '');
          note.assignID();
        }
        ItemJournalButton.addNote(this.parentWnd, note, Messages.get$Class$String$ObjectArr($J.cls(CustomNoteButton), 'new_inv', []), Messages.get$Class$String$ObjectArr($J.cls(CustomNoteButton), 'new_item_title', [Messages.titleCase(this.item_.name())]));
      }
    } else {
      GameScene.show(new CustomNoteButton$CustomNoteWindow()._CustomNoteButton$CustomNoteWindow(note, this.parentWnd));
    }
  }
  static addNote(parentWindow: Window, note: Notes$CustomRecord, promptTitle: string, prompttext: string): void {
    GameScene.show(new (ItemJournalButton$1())().$c(note, parentWindow)._WndTextInput(promptTitle, prompttext, '', 50, false, Messages.get$Class$String$ObjectArr($J.cls(CustomNoteButton$CustomNoteWindow), 'confirm', []), Messages.get$Class$String$ObjectArr($J.cls(CustomNoteButton$CustomNoteWindow), 'cancel', [])));
  }
}

let $ItemJournalButton$1: any = null;
/** An anonymous class (ItemJournalButton.java:91). */
function ItemJournalButton$1(): any {
  return $ItemJournalButton$1 ??= $J.local(class extends WndTextInput {
    onSelect(positive: boolean, text: string): void {
      if (positive && !(text.length === 0)) {
        Notes.add$CustomRecord(this.$cv_note);
        this.$cv_note.editText(text, '');
        if (this.$cv_parentWindow != null) {
          this.$cv_parentWindow.hide();
        }
        this.hide();
        if (this.$cv_parentWindow instanceof WndUseItem) {
          GameScene.show(new WndUseItem()._WndUseItem((this.$cv_parentWindow).owner, (this.$cv_parentWindow).item_));
        }
      }
    }
    $c($note, $parentWindow): this {
      this.$cv_note = $note; this.$cv_parentWindow = $parentWindow;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.ItemJournalButton$1', []);
}

$J.define(ItemJournalButton, 'com.shatteredpixel.shatteredpixeldungeon.ui.ItemJournalButton', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.IconButton', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.items.Item,com.shatteredpixel.shatteredpixeldungeon.ui.Window': '_ItemJournalButton' } });
$J.module(() => {
  EquipableItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.EquipableItem');
  Trinket = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.Trinket');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  Notes = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes');
  Notes$CustomRecord = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes$CustomRecord');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  CustomNoteButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.CustomNoteButton');
  CustomNoteButton$CustomNoteWindow = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.CustomNoteButton$CustomNoteWindow');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  WndTextInput = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndTextInput');
  WndTitledMessage = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndTitledMessage');
  WndUseItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndUseItem');
});
