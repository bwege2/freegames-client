// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndResurrect.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../jre/index.ts';
import { Window } from '../ui/Window.ts';

let Dungeon, Statistics, Ankh, Bag, Catalog, Messages, GameScene, InterlevelScene, InterlevelScene$Mode, PixelScene, ItemSprite, Icons, ItemButton, RedButton, IconTitle, WndBag$ItemSelector, WndOptions, Game;

export class WndResurrect extends Window {
  static readonly WIDTH: number = 120;
  static readonly BTN_HEIGHT: number = 20;
  static readonly GAP: number = 2;
  static readonly BTN_GAP: number = 10;
  static readonly BTN_SIZE: number = 36;
  static instance: any = null;
  btnItem1: ItemButton = null;
  btnItem2: ItemButton = null;
  btnPressed: ItemButton = null;
  btnContinue: RedButton = null;
  itemSelector: WndBag$ItemSelector = null;
  _WndResurrect(ankh: Ankh): this {
    this._Window$();
    this.itemSelector = new (WndResurrect$4())().$o(this)._WndBag$ItemSelector();
    WndResurrect.instance = this;
    let titlebar = new IconTitle()._IconTitle$();
    titlebar.icon(new ItemSprite()._ItemSprite$int$Glowing(ankh.image(), null));
    titlebar.label$String(Messages.titleCase(Messages.get$Object$String$ObjectArr(this, 'title', [])));
    titlebar.setRect(0, 0, Math.fround(WndResurrect.WIDTH), 0);
    this.add$Gizmo(titlebar);
    let message = PixelScene.renderTextBlock$String$int(Messages.get$Object$String$ObjectArr(this, 'message', []), 6);
    message.maxWidth$int(WndResurrect.WIDTH);
    message.setPos(0, Math.fround(titlebar.bottom() + WndResurrect.GAP));
    this.add$Gizmo(message);
    this.btnItem1 = new (WndResurrect$1())().$o(this)._ItemButton();
    this.btnItem1.item$Item(Dungeon.hero.belongings.weapon());
    this.btnItem1.setRect(Math.fround(Math.fround((Math.fround(WndResurrect.WIDTH - WndResurrect.BTN_GAP)) / 2) - WndResurrect.BTN_SIZE), Math.fround(message.bottom() + WndResurrect.BTN_GAP), Math.fround(WndResurrect.BTN_SIZE), Math.fround(WndResurrect.BTN_SIZE));
    this.add$Gizmo(this.btnItem1);
    this.btnItem2 = new (WndResurrect$2())().$o(this)._ItemButton();
    this.btnItem2.item$Item(Dungeon.hero.belongings.armor());
    this.btnItem2.setRect(Math.fround(this.btnItem1.right() + WndResurrect.BTN_GAP), this.btnItem1.top(), Math.fround(WndResurrect.BTN_SIZE), Math.fround(WndResurrect.BTN_SIZE));
    this.add$Gizmo(this.btnItem2);
    this.btnContinue = new (WndResurrect$3())().$o(this).$c(ankh)._RedButton$String(Messages.get$Object$String$ObjectArr(this, 'confirm', []));
    this.btnContinue.setRect(0, Math.fround(this.btnItem1.bottom() + WndResurrect.BTN_GAP), Math.fround(WndResurrect.WIDTH), Math.fround(WndResurrect.BTN_HEIGHT));
    this.add$Gizmo(this.btnContinue);
    this.resize(WndResurrect.WIDTH, $J.d2i(this.btnContinue.bottom()));
    return this;
  }
  resurrect(ankh: Ankh): void {
    this.hide();
    Statistics.ankhsUsed++;
    Catalog.countUse($J.cls(Ankh));
    ankh.detach(Dungeon.hero.belongings.backpack);
    if (this.btnItem1.item$() != null) {
      this.btnItem1.item$().keptThoughLostInvent = true;
    }
    if (this.btnItem2.item$() != null) {
      this.btnItem2.item$().keptThoughLostInvent = true;
    }
    InterlevelScene.mode = InterlevelScene$Mode.RESURRECT;
    Game.switchScene$Class($J.cls(InterlevelScene));
  }
  destroy(): void {
    super.destroy();
    WndResurrect.instance = null;
  }
  onBackPressed(): void {
  }
}

let $WndResurrect$4: any = null;
/** An anonymous class (WndResurrect.java:144). */
function WndResurrect$4(): any {
  return $WndResurrect$4 ??= $J.local(class extends WndBag$ItemSelector {
    textPrompt(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(WndResurrect), 'prompt', []);
    }
    itemSelectable(item: Item): boolean {
      return !(item instanceof Ankh || item instanceof Bag);
    }
    onSelect(item: Item): void {
      if (item != null && this.$outer.btnPressed.parent != null) {
        this.$outer.btnPressed.item$Item(item);
        if (this.$outer.btnItem1.item$() === this.$outer.btnItem2.item$()) {
          if (this.$outer.btnPressed === this.$outer.btnItem1) {
            this.$outer.btnItem2.clear();
          } else {
            this.$outer.btnItem1.clear();
          }
        }
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndResurrect$4', []);
}

let $WndResurrect$1: any = null;
/** An anonymous class (WndResurrect.java:76). */
function WndResurrect$1(): any {
  return $WndResurrect$1 ??= $J.local(class extends ItemButton {
    onClick(): void {
      this.$outer.btnPressed = this.$outer.btnItem1;
      GameScene.selectItem(this.$outer.itemSelector);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndResurrect$1', []);
}

let $WndResurrect$2: any = null;
/** An anonymous class (WndResurrect.java:87). */
function WndResurrect$2(): any {
  return $WndResurrect$2 ??= $J.local(class extends ItemButton {
    onClick(): void {
      this.$outer.btnPressed = this.$outer.btnItem2;
      GameScene.selectItem(this.$outer.itemSelector);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndResurrect$2', []);
}

let $WndResurrect$3$1: any = null;
/** An anonymous class (WndResurrect.java:106). */
function WndResurrect$3$1(): any {
  return $WndResurrect$3$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      if (index === 0) {
        this.$outer.$outer.resurrect(this.$cv_ankh);
      }
    }
    $c($ankh): this {
      this.$cv_ankh = $ankh;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndResurrect$3$1', []);
}

let $WndResurrect$3: any = null;
/** An anonymous class (WndResurrect.java:98). */
function WndResurrect$3(): any {
  return $WndResurrect$3 ??= $J.local(class extends RedButton {
    onClick(): void {
      if (this.$outer.btnItem1.item$() == null || this.$outer.btnItem2.item$() == null) {
        GameScene.show(new (WndResurrect$3$1())().$o(this).$c(this.$cv_ankh)._WndOptions$Image$String$String$StringArr(Icons.WARNING.get(), Messages.get$Class$String$ObjectArr($J.cls(WndResurrect), 'warn_title', []), Messages.get$Class$String$ObjectArr($J.cls(WndResurrect), 'warn_body', []), [Messages.get$Class$String$ObjectArr($J.cls(WndResurrect), 'warn_yes', []), Messages.get$Class$String$ObjectArr($J.cls(WndResurrect), 'warn_no', [])]));
      } else {
        this.$outer.resurrect(this.$cv_ankh);
      }
    }
    $c($ankh): this {
      this.$cv_ankh = $ankh;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndResurrect$3', []);
}

$J.define(WndResurrect, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndResurrect', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.items.Ankh': '_WndResurrect' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Ankh = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Ankh');
  Bag = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bags.Bag');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  InterlevelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene');
  InterlevelScene$Mode = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene$Mode');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  ItemButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ItemButton');
  RedButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RedButton');
  IconTitle = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.IconTitle');
  WndBag$ItemSelector = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndBag$ItemSelector');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  Game = $J.load('com.watabou.noosa.Game');
});
