// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndUseItem.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../jre/index.ts';
import { WndInfoItem } from './WndInfoItem.ts';

let Dungeon, Item, InventoryPane, ItemJournalButton, RedButton, Window;

export class WndUseItem extends WndInfoItem {
  static readonly BUTTON_HEIGHT: number = 16;
  static readonly GAP: number = 2;
  owner: Window = null;
  item_: Item = null;
  _WndUseItem(owner: Window, item: Item): this {
    this._WndInfoItem$Item(item);
    this.owner = owner;
    this.item_ = item;
    let y = Math.fround(this.height_);
    if (Dungeon.hero.isAlive() && Dungeon.hero.belongings.contains(item)) {
      y = Math.fround(y + WndUseItem.GAP);
      let buttons = new ArrayList();
      for (const $it0 = item.actions(Dungeon.hero).iterator(); $it0.hasNext(); ) {
        let action = $it0.next();
        let btn = new (WndUseItem$1())().$o(this).$c(owner, item, action)._RedButton$String$int(item.actionName(action, Dungeon.hero), 8);
        btn.setSize(btn.reqWidth(), WndUseItem.BUTTON_HEIGHT);
        buttons.add(btn);
        this.add$Gizmo(btn);
        if ($J.equals(action, item.defaultAction())) {
          btn.textColor(Window.TITLE_COLOR);
        }
      }
      y = WndUseItem.layoutButtons(buttons, Math.fround(this.width_), y);
      let btn = new ItemJournalButton()._ItemJournalButton(item, this);
      btn.setRect(Math.fround((this.width_ - 16) | 0), 0, 16, 16);
      this.add$Gizmo(btn);
    }
    this.resize(this.width_, $J.d2i((y)));
    return this;
  }
  static layoutButtons(buttons: ArrayList<RedButton>, width: number, y: number): number {
    let curRow = new ArrayList();
    let widthLeftThisRow = width;
    while (!buttons.isEmpty()) {
      let btn = buttons.get(0);
      widthLeftThisRow = Math.fround(widthLeftThisRow - btn.width());
      if (curRow.isEmpty()) {
        curRow.add(btn);
        buttons.remove(btn);
      } else {
        widthLeftThisRow = Math.fround(widthLeftThisRow - 1);
        if (widthLeftThisRow >= Math.fround(0)) {
          curRow.add(btn);
          buttons.remove(btn);
        }
      }
      if (buttons.isEmpty() || widthLeftThisRow <= Math.fround(0) || curRow.size() >= 3) {
        widthLeftThisRow = Math.fround(width - ((curRow.size() - 1) | 0));
        for (const $it1 = curRow.iterator(); $it1.hasNext(); ) {
          let b = $it1.next();
          widthLeftThisRow = Math.fround(widthLeftThisRow - b.width());
        }
        while (widthLeftThisRow > Math.fround(0)) {
          let shortest = new ArrayList();
          let secondShortest = null;
          for (const $it2 = curRow.iterator(); $it2.hasNext(); ) {
            let b = $it2.next();
            if (shortest.isEmpty()) {
              shortest.add(b);
            } else {
              if (b.width() < shortest.get(0).width()) {
                secondShortest = shortest.get(0);
                shortest.clear();
                shortest.add(b);
              } else if (b.width() === shortest.get(0).width()) {
                shortest.add(b);
              } else if (secondShortest == null || secondShortest.width() > b.width()) {
                secondShortest = b;
              }
            }
          }
          let widthToGrow: number;
          if (secondShortest == null) {
            widthToGrow = Math.fround(widthLeftThisRow / shortest.size());
            widthLeftThisRow = 0;
          } else {
            widthToGrow = Math.fround(secondShortest.width() - shortest.get(0).width());
            if ((Math.fround(widthToGrow * shortest.size())) >= widthLeftThisRow) {
              widthToGrow = Math.fround(widthLeftThisRow / shortest.size());
              widthLeftThisRow = 0;
            } else {
              widthLeftThisRow = Math.fround(widthLeftThisRow - Math.fround(widthToGrow * shortest.size()));
            }
          }
          for (const $it3 = shortest.iterator(); $it3.hasNext(); ) {
            let toGrow = $it3.next();
            toGrow.setRect(0, 0, Math.fround(toGrow.width() + widthToGrow), toGrow.height());
          }
        }
        let x = 0;
        for (const $it4 = curRow.iterator(); $it4.hasNext(); ) {
          let b = $it4.next();
          b.setRect(x, y, b.width(), b.height());
          x = Math.fround(x + Math.fround(b.width() + 1));
        }
        y = Math.fround(y + Math.fround(WndUseItem.BUTTON_HEIGHT + 1));
        widthLeftThisRow = width;
        curRow.clear();
      }
    }
    return Math.fround(y - 1);
  }
}

let $WndUseItem$1: any = null;
/** An anonymous class (WndUseItem.java:56). */
function WndUseItem$1(): any {
  return $WndUseItem$1 ??= $J.local(class extends RedButton {
    onClick(): void {
      this.$outer.hide();
      if (this.$cv_owner != null && this.$cv_owner.parent != null) {
        this.$cv_owner.hide();
      }
      if (Dungeon.hero.isAlive() && Dungeon.hero.belongings.contains(this.$cv_item)) {
        this.$cv_item.execute$Hero$String(Dungeon.hero, this.$cv_action);
      }
      Item.updateQuickslot();
      if ($J.equals(this.$cv_action, this.$cv_item.defaultAction()) && this.$cv_item.usesTargeting_ && this.$cv_owner == null) {
        InventoryPane.useTargeting();
      }
    }
    $c($owner, $item, $action): this {
      this.$cv_owner = $owner; this.$cv_item = $item; this.$cv_action = $action;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndUseItem$1', []);
}

$J.define(WndUseItem, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndUseItem', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.windows.WndInfoItem', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.ui.Window,com.shatteredpixel.shatteredpixeldungeon.items.Item': '_WndUseItem' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  InventoryPane = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.InventoryPane');
  ItemJournalButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ItemJournalButton');
  RedButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RedButton');
  Window = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Window');
});
