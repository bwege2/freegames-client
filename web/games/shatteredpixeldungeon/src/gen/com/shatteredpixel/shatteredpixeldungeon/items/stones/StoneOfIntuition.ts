// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/stones/StoneOfIntuition.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../jre/index.ts';
import { InventoryStone } from './InventoryStone.ts';
import { Buff } from '../../actors/buffs/Buff.ts';
import { Window } from '../../ui/Window.ts';

let Assets$Sprites, Dungeon, Talent, Identification, Item, Potion, ExoticPotion, Ring, Scroll, ExoticScroll, Catalog, Messages, GameScene, PixelScene, ItemSprite, ItemSpriteSheet, ItemSpriteSheet$Icons, IconButton, RedButton, GLog, IconTitle, Image, Reflection;

export class StoneOfIntuition extends InventoryStone {
  static curGuess: JClass = null;
  _StoneOfIntuition(): this {
    this._InventoryStone();
    this.image_ = ItemSpriteSheet.STONE_INTUITION;
    return this;
  }
  usableOnItem(item: Item): boolean {
    if (item instanceof Ring) {
      return !(item).isKnown();
    } else if (item instanceof Potion) {
      return !(item).isKnown();
    } else if (item instanceof Scroll) {
      return !(item).isKnown();
    }
    return false;
  }
  onItemSelected(item: Item): void {
    GameScene.show(new StoneOfIntuition$WndGuess().$o(this)._StoneOfIntuition$WndGuess(item));
  }
  desc(): string {
    let text = super.desc();
    if (Dungeon.hero != null) {
      if (Dungeon.hero.buff($J.cls(StoneOfIntuition$IntuitionUseTracker)) == null) {
        text += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'break_info', []);
      } else {
        text += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'break_warn', []);
      }
    }
    return text;
  }
  static $clinit() {
    StoneOfIntuition.curGuess = null;
  }
}

export class StoneOfIntuition$IntuitionUseTracker extends Buff {
  _StoneOfIntuition$IntuitionUseTracker(): this {
    this._Buff();
    this.revivePersists = true;
    return this;
  }
}

export class StoneOfIntuition$WndGuess extends Window {
  static readonly WIDTH: number = 120;
  static readonly BTN_SIZE: number = 20;
  _StoneOfIntuition$WndGuess(item: Item): this {
    this._Window$();
    let titlebar = new IconTitle()._IconTitle$();
    titlebar.icon(new ItemSprite()._ItemSprite$Item(item));
    titlebar.label$String(Messages.titleCase(item.name()));
    titlebar.setRect(0, 0, Math.fround(StoneOfIntuition$WndGuess.WIDTH), 0);
    this.add$Gizmo(titlebar);
    let text = PixelScene.renderTextBlock$int(6);
    text.text$String(Messages.get$Object$String$ObjectArr(this, 'text', []));
    text.setPos(0, Math.fround(titlebar.bottom() + 2));
    text.maxWidth$int(StoneOfIntuition$WndGuess.WIDTH);
    this.add$Gizmo(text);
    let guess = new (StoneOfIntuition$WndGuess$1())().$o(this).$c(item)._RedButton$String('');
    guess.visible_ = false;
    guess.icon$Image(new ItemSprite()._ItemSprite$Item(item));
    guess.enable(false);
    guess.setRect(0, 80, Math.fround(StoneOfIntuition$WndGuess.WIDTH), 20);
    this.add$Gizmo(guess);
    let left: number;
    let top = Math.fround(text.bottom() + 5);
    let rows: number;
    let placed = 0;
    let unIDed = new ArrayList();
    if (item.isIdentified()) {
      this.hide();
      return this;
    } else if (item instanceof Potion) {
      if (item instanceof ExoticPotion) {
        for (const $it0 = Potion.getUnknown().iterator(); $it0.hasNext(); ) {
          let i = $it0.next();
          unIDed.add(ExoticPotion.regToExo.get(i));
        }
      } else {
        unIDed.addAll(Potion.getUnknown());
      }
    } else if (item instanceof Scroll) {
      if (item instanceof ExoticScroll) {
        for (const $it1 = Scroll.getUnknown().iterator(); $it1.hasNext(); ) {
          let i = $it1.next();
          unIDed.add(ExoticScroll.regToExo.get(i));
        }
      } else {
        unIDed.addAll(Scroll.getUnknown());
      }
    } else if (item instanceof Ring) {
      unIDed.addAll(Ring.getUnknown());
    } else {
      this.hide();
      return this;
    }
    if (unIDed.size() <= 5) {
      rows = 1;
      top = Math.fround(top + Math.fround(StoneOfIntuition$WndGuess.BTN_SIZE / 2));
      left = Math.fround(((StoneOfIntuition$WndGuess.WIDTH - Math.imul(StoneOfIntuition$WndGuess.BTN_SIZE, unIDed.size())) | 0) / 2);
    } else {
      rows = 2;
      left = Math.fround(((StoneOfIntuition$WndGuess.WIDTH - Math.imul(StoneOfIntuition$WndGuess.BTN_SIZE, ($J.idiv(((unIDed.size() + 1) | 0), 2)))) | 0) / 2);
    }
    for (const $it2 = unIDed.iterator(); $it2.hasNext(); ) {
      let i = $it2.next();
      let btn = new (StoneOfIntuition$WndGuess$2())().$o(this).$c(i, guess)._IconButton$();
      let im = new Image()._Image$Object(Assets$Sprites.ITEM_ICONS);
      im.frame$RectF(ItemSpriteSheet$Icons.film.get$Object(Reflection.newInstance(i).icon_));
      im.scale_.set$float(2);
      btn.icon$Image(im);
      btn.setRect(Math.fround(left + Math.imul(placed, StoneOfIntuition$WndGuess.BTN_SIZE)), top, Math.fround(StoneOfIntuition$WndGuess.BTN_SIZE), Math.fround(StoneOfIntuition$WndGuess.BTN_SIZE));
      this.add$Gizmo(btn);
      placed++;
      if (rows === 2 && placed === ($J.idiv(((unIDed.size() + 1) | 0), 2))) {
        placed = 0;
        if (unIDed.size() % 2 === 1) {
          left = Math.fround(left + Math.fround(StoneOfIntuition$WndGuess.BTN_SIZE / 2));
        }
        top = Math.fround(top + StoneOfIntuition$WndGuess.BTN_SIZE);
      }
    }
    this.resize(StoneOfIntuition$WndGuess.WIDTH, 100);
    return this;
  }
}

let $StoneOfIntuition$WndGuess$1: any = null;
/** An anonymous class (StoneOfIntuition.java:113). */
function StoneOfIntuition$WndGuess$1(): any {
  return $StoneOfIntuition$WndGuess$1 ??= $J.local(class extends RedButton {
    onClick(): void {
      super.onClick();
      this.$outer.$outer.useAnimation();
      if (this.$cv_item.getClass() === StoneOfIntuition.curGuess) {
        if (this.$cv_item instanceof Ring) {
          (this.$cv_item).setKnown();
          Item.updateQuickslot();
        } else {
          this.$cv_item.identify$();
        }
        GLog.p(Messages.get$Class$String$ObjectArr($J.cls(StoneOfIntuition$WndGuess), 'correct', []), []);
        Item.curUser.sprite_.parent.add$Gizmo(new Identification()._Identification(Item.curUser.sprite_.center$().offset$float$float(0, -16)));
      } else {
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(StoneOfIntuition$WndGuess), 'incorrect', []), []);
      }
      if (!this.$outer.$outer.anonymous) {
        Catalog.countUse($J.cls(StoneOfIntuition));
        if (Item.curUser.buff($J.cls(StoneOfIntuition$IntuitionUseTracker)) == null) {
          Buff.affect$Char$Class(Item.curUser, $J.cls(StoneOfIntuition$IntuitionUseTracker));
        } else {
          Item.curItem.detach(Item.curUser.belongings.backpack);
          Item.curUser.buff($J.cls(StoneOfIntuition$IntuitionUseTracker)).detach();
        }
        Talent.onRunestoneUsed(Item.curUser, Item.curUser.pos, $J.cls(StoneOfIntuition));
      }
      StoneOfIntuition.curGuess = null;
      this.$outer.hide();
    }
    $c($item): this {
      this.$cv_item = $item;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfIntuition$WndGuess$1', []);
}

let $StoneOfIntuition$WndGuess$2: any = null;
/** An anonymous class (StoneOfIntuition.java:193). */
function StoneOfIntuition$WndGuess$2(): any {
  return $StoneOfIntuition$WndGuess$2 ??= $J.local(class extends IconButton {
    onClick(): void {
      StoneOfIntuition.curGuess = this.$cv_i;
      this.$cv_guess.visible_ = true;
      this.$cv_guess.text$String(Messages.titleCase(Messages.get$Class$String$ObjectArr(StoneOfIntuition.curGuess, 'name', [])));
      this.$cv_guess.enable(true);
      super.onClick();
    }
    $c($i, $guess): this {
      this.$cv_i = $i; this.$cv_guess = $guess;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfIntuition$WndGuess$2', []);
}

$J.define(StoneOfIntuition, 'com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfIntuition', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.stones.InventoryStone', ctors: { '': '_StoneOfIntuition' }, clinit: true, lazy: ['curGuess'] });
$J.define(StoneOfIntuition$IntuitionUseTracker, 'com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfIntuition$IntuitionUseTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_StoneOfIntuition$IntuitionUseTracker' } });
$J.define(StoneOfIntuition$WndGuess, 'com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfIntuition$WndGuess', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.items.Item': '_StoneOfIntuition$WndGuess' }, inner: true });
$J.module(() => {
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Identification = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Identification');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Potion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.Potion');
  ExoticPotion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.ExoticPotion');
  Ring = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.Ring');
  Scroll = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.Scroll');
  ExoticScroll = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ExoticScroll');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  ItemSpriteSheet$Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons');
  IconButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.IconButton');
  RedButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RedButton');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  IconTitle = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.IconTitle');
  Image = $J.load('com.watabou.noosa.Image');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
