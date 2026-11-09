// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndQuickBag.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections } from '../../../../../jre/index.ts';
import { Window } from '../ui/Window.ts';

let Chrome, Chrome$Type, Dungeon, Talent, Generator$Category, Artifact, CloakOfShadows, HolyTome, Bag, Messages, PixelScene, InventorySlot, QuickSlotButton, WndBag, WndUseItem, Game;

export class WndQuickBag extends Window {
  static bag: Item = null;
  static quickBagComparator: Comparator<Item> = null;
  _WndQuickBag(bag: Bag): this {
    this._Window$int$int$NinePatch(0, 0, Chrome.get(Chrome$Type.TOAST_TR));
    if (WndBag.INSTANCE != null) {
      WndBag.INSTANCE.hide();
    }
    WndBag.INSTANCE = this;
    WndQuickBag.bag = bag;
    let width = 0;
    let height = 0;
    let maxWidth = PixelScene.landscape() ? 240 : 135;
    let left = 0;
    let top = 10;
    let items = new ArrayList();
    for (const $it0 = (bag == null ? Dungeon.hero.belongings : bag).iterator(); $it0.hasNext(); ) {
      let i = $it0.next();
      if (i.defaultAction() == null) {
        continue;
      }
      if (i instanceof Bag) {
        continue;
      }
      if (i instanceof Artifact && !i.isEquipped(Dungeon.hero) && (!(i instanceof CloakOfShadows) || !Dungeon.hero.hasTalent(Talent.LIGHT_CLOAK)) && (!(i instanceof HolyTome) || !Dungeon.hero.hasTalent(Talent.LIGHT_READING))) {
        continue;
      }
      items.add(i);
    }
    Collections.sort(items, WndQuickBag.quickBagComparator);
    let btnWidth = 16;
    let btnHeight = 20;
    let targetHeight = (PixelScene.uiCamera.height_ - 100) | 0;
    let rows = $J.d2i(Math.ceil(Math.fround(items.size() / Math.fround(($J.idiv(((maxWidth + 1) | 0), ((btnWidth + 1) | 0)))))));
    let expectedHeight = (Math.imul(rows, btnHeight) + (rows - 1)) | 0;
    while (expectedHeight > targetHeight && btnHeight > 16) {
      btnHeight--;
      expectedHeight = (expectedHeight - rows) | 0;
    }
    for (const $it1 = items.iterator(); $it1.hasNext(); ) {
      let i = $it1.next();
      let slot = new (WndQuickBag$1())().$o(this).$c(bag)._InventorySlot(i);
      slot.showExtraInfo(false);
      slot.setRect(Math.fround(left), Math.fround(top), Math.fround(btnWidth), Math.fround(btnHeight));
      this.add$Gizmo(slot);
      if (width < slot.right()) {
        width = slot.right();
      }
      if (height < slot.bottom()) {
        height = slot.bottom();
      }
      left = (left + (btnWidth + 1)) | 0;
      if (((left + btnWidth) | 0) > maxWidth) {
        left = 0;
        top = (top + (btnHeight + 1)) | 0;
      }
    }
    let txtTitle: RenderedTextBlock;
    txtTitle = PixelScene.renderTextBlock$String$int(Messages.titleCase(Messages.get$Object$String$ObjectArr(this, 'title', [])), 8);
    txtTitle.hardlight(Window.TITLE_COLOR);
    if (txtTitle.width() > width) {
      width = txtTitle.width();
    }
    txtTitle.setPos(Math.fround((Math.fround(width - txtTitle.width())) / 2), Math.fround(Math.fround((Math.fround(10 - txtTitle.height())) / 2) - 1));
    PixelScene.align$Component(txtTitle);
    this.add$Gizmo(txtTitle);
    this.resize($J.d2i(width), $J.d2i(height));
    let bottom = PixelScene.uiCamera.height_;
    this.offset$int$int(0, $J.d2i((Math.fround((($J.idiv(bottom, 2) - 30) | 0) - Math.fround(height / 2)))));
    return this;
  }
  hide(): void {
    super.hide();
    if (WndBag.INSTANCE === this) {
      WndBag.INSTANCE = null;
    }
  }
  static $clinit() {
    WndQuickBag.quickBagComparator = (lhs, rhs) => {
      if (lhs.isEquipped(Dungeon.hero) && !rhs.isEquipped(Dungeon.hero)) {
        return -1;
      } else if (!lhs.isEquipped(Dungeon.hero) && rhs.isEquipped(Dungeon.hero)) {
        return 1;
      } else {
        return (Generator$Category.order(lhs) - Generator$Category.order(rhs)) | 0;
      }
    };
  }
}

let $WndQuickBag$1: any = null;
/** An anonymous class (WndQuickBag.java:98). */
function WndQuickBag$1(): any {
  return $WndQuickBag$1 ??= $J.local(class extends InventorySlot {
    onClick(): void {
      if (Dungeon.hero == null || !Dungeon.hero.isAlive() || !Dungeon.hero.belongings.contains(this.item_)) {
        Game.scene().addToFront(new WndUseItem()._WndUseItem(this.$outer, this.item_));
        return;
      }
      this.$outer.hide();
      this.item_.execute$Hero(Dungeon.hero);
      if (this.item_.usesTargeting_ && this.$cv_bag != null) {
        let idx = Dungeon.quickslot.getSlot(WndQuickBag.bag);
        if (idx !== -1) {
          QuickSlotButton.useTargeting(idx);
          this.$cv_bag.quickUseItem = this.item_;
        }
      }
    }
    onLongClick(): boolean {
      Game.scene().addToFront(new WndUseItem()._WndUseItem(this.$outer, this.item_));
      return true;
    }
    hoverText(): string {
      return null;
    }
    $c($bag): this {
      this.$cv_bag = $bag;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndQuickBag$1', []);
}

$J.define(WndQuickBag, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndQuickBag', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.items.bags.Bag': '_WndQuickBag' }, clinit: true, lazy: ['bag', 'quickBagComparator'] });
$J.module(() => {
  Chrome = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome');
  Chrome$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome$Type');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  Artifact = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact');
  CloakOfShadows = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.CloakOfShadows');
  HolyTome = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.HolyTome');
  Bag = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bags.Bag');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  InventorySlot = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.InventorySlot');
  QuickSlotButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.QuickSlotButton');
  WndBag = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndBag');
  WndUseItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndUseItem');
  Game = $J.load('com.watabou.noosa.Game');
});
