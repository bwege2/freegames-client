// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndSadGhost.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { WndInfoItem } from './WndInfoItem.ts';

let Dungeon, Ghost$Quest, Armor, Weapon, Messages, GameScene, PixelScene, FetidRatSprite, GnollTricksterSprite, GreatCrabSprite, ItemButton, RedButton, GLog, IconTitle;

export class WndSadGhost extends Window {
  static readonly WIDTH: number = 120;
  static readonly BTN_SIZE: number = 32;
  static readonly BTN_GAP: number = 5;
  static readonly GAP: number = 2;
  ghost: Ghost = null;
  _WndSadGhost(ghost: Ghost, type$: number): this {
    this._Window$();
    this.ghost = ghost;
    let titlebar = new IconTitle()._IconTitle$();
    let message: RenderedTextBlock;
    switch (type$) {
      case 1:
      default:
        titlebar.icon(new FetidRatSprite()._FetidRatSprite());
        titlebar.label$String(Messages.get$Object$String$ObjectArr(this, 'rat_title', []));
        message = PixelScene.renderTextBlock$String$int(Messages.get$Object$String$ObjectArr(this, 'rat', []) + '\n\n' + Messages.get$Object$String$ObjectArr(this, 'give_item', []), 6);
        break;
      case 2:
        titlebar.icon(new GnollTricksterSprite()._GnollTricksterSprite());
        titlebar.label$String(Messages.get$Object$String$ObjectArr(this, 'gnoll_title', []));
        message = PixelScene.renderTextBlock$String$int(Messages.get$Object$String$ObjectArr(this, 'gnoll', []) + '\n\n' + Messages.get$Object$String$ObjectArr(this, 'give_item', []), 6);
        break;
      case 3:
        titlebar.icon(new GreatCrabSprite()._GreatCrabSprite());
        titlebar.label$String(Messages.get$Object$String$ObjectArr(this, 'crab_title', []));
        message = PixelScene.renderTextBlock$String$int(Messages.get$Object$String$ObjectArr(this, 'crab', []) + '\n\n' + Messages.get$Object$String$ObjectArr(this, 'give_item', []), 6);
        break;
    }
    titlebar.setRect(0, 0, Math.fround(WndSadGhost.WIDTH), 0);
    this.add$Gizmo(titlebar);
    message.maxWidth$int(WndSadGhost.WIDTH);
    message.setPos(0, Math.fround(titlebar.bottom() + WndSadGhost.GAP));
    this.add$Gizmo(message);
    let btnWeapon = new (WndSadGhost$1())().$o(this)._ItemButton();
    btnWeapon.item$Item(Ghost$Quest.weapon);
    btnWeapon.setRect(Math.fround(($J.idiv(((WndSadGhost.WIDTH - WndSadGhost.BTN_GAP) | 0), 2) - WndSadGhost.BTN_SIZE) | 0), Math.fround(Math.fround(message.top() + message.height()) + WndSadGhost.BTN_GAP), Math.fround(WndSadGhost.BTN_SIZE), Math.fround(WndSadGhost.BTN_SIZE));
    this.add$Gizmo(btnWeapon);
    let btnArmor = new (WndSadGhost$2())().$o(this)._ItemButton();
    btnArmor.item$Item(Ghost$Quest.armor);
    btnArmor.setRect(Math.fround(btnWeapon.right() + WndSadGhost.BTN_GAP), btnWeapon.top(), Math.fround(WndSadGhost.BTN_SIZE), Math.fround(WndSadGhost.BTN_SIZE));
    this.add$Gizmo(btnArmor);
    this.resize(WndSadGhost.WIDTH, ($J.d2i(btnArmor.bottom()) + WndSadGhost.BTN_GAP) | 0);
    return this;
  }
  selectReward(reward: Item): void {
    this.hide();
    if (reward == null) {
      return;
    }
    if (reward instanceof Weapon && Ghost$Quest.enchant != null) {
      (reward).enchant$Enchantment(Ghost$Quest.enchant);
    } else if (reward instanceof Armor && Ghost$Quest.glyph != null) {
      (reward).inscribe$Glyph(Ghost$Quest.glyph);
    }
    reward.identify$boolean(false);
    if (reward.doPickUp$Hero(Dungeon.hero)) {
      GLog.i(Messages.capitalize(Messages.get$Object$String$ObjectArr(Dungeon.hero, 'you_now_have', [reward.name()])), []);
    } else {
      Dungeon.level.drop(reward, this.ghost.pos).sprite_.drop$();
    }
    this.ghost.yell(Messages.get$Object$String$ObjectArr(this, 'farewell', []));
    this.ghost.die(null);
    Ghost$Quest.complete();
  }
}

export class WndSadGhost$RewardWindow extends WndInfoItem {
  _WndSadGhost$RewardWindow(item: Item): this {
    this._WndInfoItem$Item(item);
    let btnConfirm = new (WndSadGhost$RewardWindow$1())().$o(this).$c(item)._RedButton$String(Messages.get$Class$String$ObjectArr($J.cls(WndSadGhost), 'confirm', []));
    btnConfirm.setRect(0, Math.fround((this.height_ + 2) | 0), Math.fround(($J.idiv(this.width_, 2) - 1) | 0), 16);
    this.add$Gizmo(btnConfirm);
    let btnCancel = new (WndSadGhost$RewardWindow$2())().$o(this)._RedButton$String(Messages.get$Class$String$ObjectArr($J.cls(WndSadGhost), 'cancel', []));
    btnCancel.setRect(Math.fround(btnConfirm.right() + 2), Math.fround((this.height_ + 2) | 0), btnConfirm.width(), 16);
    this.add$Gizmo(btnCancel);
    this.resize(this.width_, $J.d2i(btnCancel.bottom()));
    return this;
  }
}

let $WndSadGhost$1: any = null;
/** An anonymous class (WndSadGhost.java:84). */
function WndSadGhost$1(): any {
  return $WndSadGhost$1 ??= $J.local(class extends ItemButton {
    onClick(): void {
      GameScene.show(new WndSadGhost$RewardWindow().$o(this.$outer)._WndSadGhost$RewardWindow(this.item$()));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSadGhost$1', []);
}

let $WndSadGhost$2: any = null;
/** An anonymous class (WndSadGhost.java:94). */
function WndSadGhost$2(): any {
  return $WndSadGhost$2 ??= $J.local(class extends ItemButton {
    onClick(): void {
      GameScene.show(new WndSadGhost$RewardWindow().$o(this.$outer)._WndSadGhost$RewardWindow(this.item$()));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSadGhost$2', []);
}

let $WndSadGhost$RewardWindow$1: any = null;
/** An anonymous class (WndSadGhost.java:137). */
function WndSadGhost$RewardWindow$1(): any {
  return $WndSadGhost$RewardWindow$1 ??= $J.local(class extends RedButton {
    onClick(): void {
      this.$outer.hide();
      this.$outer.$outer.selectReward(this.$cv_item);
    }
    $c($item): this {
      this.$cv_item = $item;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSadGhost$RewardWindow$1', []);
}

let $WndSadGhost$RewardWindow$2: any = null;
/** An anonymous class (WndSadGhost.java:148). */
function WndSadGhost$RewardWindow$2(): any {
  return $WndSadGhost$RewardWindow$2 ??= $J.local(class extends RedButton {
    onClick(): void {
      this.$outer.hide();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSadGhost$RewardWindow$2', []);
}

$J.define(WndSadGhost, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSadGhost', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Ghost,int': '_WndSadGhost' } });
$J.define(WndSadGhost$RewardWindow, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndSadGhost$RewardWindow', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.windows.WndInfoItem', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.items.Item': '_WndSadGhost$RewardWindow' }, inner: true });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Ghost$Quest = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Ghost$Quest');
  Armor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor');
  Weapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  FetidRatSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.FetidRatSprite');
  GnollTricksterSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.GnollTricksterSprite');
  GreatCrabSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.GreatCrabSprite');
  ItemButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ItemButton');
  RedButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RedButton');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  IconTitle = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.IconTitle');
});
