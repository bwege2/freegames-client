// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndWandmaker.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Wandmaker$Quest, CorpseDust, Embers, Messages, Rotberry$Seed, GameScene, PixelScene, ItemSprite, ItemButton, RedButton, GLog, IconTitle, WndSadGhost;

export class WndWandmaker extends Window {
  static readonly WIDTH: number = 120;
  static readonly BTN_SIZE: number = 32;
  static readonly BTN_GAP: number = 5;
  static readonly GAP: number = 2;
  wandmaker: Wandmaker = null;
  questItem: Item = null;
  _WndWandmaker(wandmaker: Wandmaker, item: Item): this {
    this._Window$();
    this.wandmaker = wandmaker;
    this.questItem = item;
    let titlebar = new IconTitle()._IconTitle$();
    titlebar.icon(new ItemSprite()._ItemSprite$int$Glowing(item.image(), null));
    titlebar.label$String(Messages.titleCase(item.name()));
    titlebar.setRect(0, 0, Math.fround(WndWandmaker.WIDTH), 0);
    this.add$Gizmo(titlebar);
    let msg = '';
    if (item instanceof CorpseDust) {
      msg = Messages.get$Object$String$ObjectArr(this, 'dust', []);
    } else if (item instanceof Embers) {
      msg = Messages.get$Object$String$ObjectArr(this, 'ember', []);
    } else if (item instanceof Rotberry$Seed) {
      msg = Messages.get$Object$String$ObjectArr(this, 'berry', []);
    }
    let message = PixelScene.renderTextBlock$String$int(msg, 6);
    message.maxWidth$int(WndWandmaker.WIDTH);
    message.setPos(0, Math.fround(titlebar.bottom() + WndWandmaker.GAP));
    this.add$Gizmo(message);
    let btnWand1 = new (WndWandmaker$1())().$o(this)._ItemButton();
    btnWand1.item$Item(Wandmaker$Quest.wand1);
    btnWand1.setRect(Math.fround(($J.idiv(((WndWandmaker.WIDTH - WndWandmaker.BTN_GAP) | 0), 2) - WndWandmaker.BTN_SIZE) | 0), Math.fround(Math.fround(message.top() + message.height()) + WndWandmaker.BTN_GAP), Math.fround(WndWandmaker.BTN_SIZE), Math.fround(WndWandmaker.BTN_SIZE));
    this.add$Gizmo(btnWand1);
    let btnWand2 = new (WndWandmaker$2())().$o(this)._ItemButton();
    btnWand2.item$Item(Wandmaker$Quest.wand2);
    btnWand2.setRect(Math.fround(btnWand1.right() + WndWandmaker.BTN_GAP), btnWand1.top(), Math.fround(WndWandmaker.BTN_SIZE), Math.fround(WndWandmaker.BTN_SIZE));
    this.add$Gizmo(btnWand2);
    this.resize(WndWandmaker.WIDTH, $J.d2i(btnWand2.bottom()));
    return this;
  }
  selectReward(reward: Item): void {
    if (reward == null) {
      return;
    }
    this.hide();
    this.questItem.detach(Dungeon.hero.belongings.backpack);
    reward.identify$boolean(false);
    if (reward.doPickUp$Hero(Dungeon.hero)) {
      GLog.i(Messages.capitalize(Messages.get$Object$String$ObjectArr(Dungeon.hero, 'you_now_have', [reward.name()])), []);
    } else {
      Dungeon.level.drop(reward, this.wandmaker.pos).sprite_.drop$();
    }
    this.wandmaker.yell(Messages.get$Object$String$ObjectArr(this, 'farewell', [Messages.titleCase(Dungeon.hero.name())]));
    this.wandmaker.destroy();
    this.wandmaker.sprite_.die();
    Wandmaker$Quest.complete();
  }
}

export class WndWandmaker$RewardWindow extends WndInfoItem {
  _WndWandmaker$RewardWindow(item: Item): this {
    this._WndInfoItem$Item(item);
    let btnConfirm = new (WndWandmaker$RewardWindow$1())().$o(this).$c(item)._RedButton$String(Messages.get$Class$String$ObjectArr($J.cls(WndSadGhost), 'confirm', []));
    btnConfirm.setRect(0, Math.fround((this.height_ + 2) | 0), Math.fround(($J.idiv(this.width_, 2) - 1) | 0), 16);
    this.add$Gizmo(btnConfirm);
    let btnCancel = new (WndWandmaker$RewardWindow$2())().$o(this)._RedButton$String(Messages.get$Class$String$ObjectArr($J.cls(WndSadGhost), 'cancel', []));
    btnCancel.setRect(Math.fround(btnConfirm.right() + 2), Math.fround((this.height_ + 2) | 0), btnConfirm.width(), 16);
    this.add$Gizmo(btnCancel);
    this.resize(this.width_, $J.d2i(btnCancel.bottom()));
    return this;
  }
}

let $WndWandmaker$1: any = null;
/** An anonymous class (WndWandmaker.java:77). */
function WndWandmaker$1(): any {
  return $WndWandmaker$1 ??= $J.local(class extends ItemButton {
    onClick(): void {
      if (Dungeon.hero.belongings.contains(this.$outer.questItem) && this.item$() != null) {
        GameScene.show(new WndWandmaker$RewardWindow().$o(this.$outer)._WndWandmaker$RewardWindow(this.item$()));
      } else {
        this.$outer.hide();
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndWandmaker$1', []);
}

let $WndWandmaker$2: any = null;
/** An anonymous class (WndWandmaker.java:91). */
function WndWandmaker$2(): any {
  return $WndWandmaker$2 ??= $J.local(class extends ItemButton {
    onClick(): void {
      if (Dungeon.hero.belongings.contains(this.$outer.questItem) && this.item$() != null) {
        GameScene.show(new WndWandmaker$RewardWindow().$o(this.$outer)._WndWandmaker$RewardWindow(this.item$()));
      } else {
        this.$outer.hide();
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndWandmaker$2', []);
}

let $WndWandmaker$RewardWindow$1: any = null;
/** An anonymous class (WndWandmaker.java:138). */
function WndWandmaker$RewardWindow$1(): any {
  return $WndWandmaker$RewardWindow$1 ??= $J.local(class extends RedButton {
    onClick(): void {
      this.$outer.hide();
      this.$outer.$outer.selectReward(this.$cv_item);
    }
    $c($item): this {
      this.$cv_item = $item;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndWandmaker$RewardWindow$1', []);
}

let $WndWandmaker$RewardWindow$2: any = null;
/** An anonymous class (WndWandmaker.java:149). */
function WndWandmaker$RewardWindow$2(): any {
  return $WndWandmaker$RewardWindow$2 ??= $J.local(class extends RedButton {
    onClick(): void {
      this.$outer.hide();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndWandmaker$RewardWindow$2', []);
}

$J.define(WndWandmaker, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndWandmaker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Wandmaker,com.shatteredpixel.shatteredpixeldungeon.items.Item': '_WndWandmaker' } });
$J.define(WndWandmaker$RewardWindow, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndWandmaker$RewardWindow', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.windows.WndInfoItem', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.items.Item': '_WndWandmaker$RewardWindow' }, inner: true });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Wandmaker$Quest = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Wandmaker$Quest');
  CorpseDust = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.CorpseDust');
  Embers = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.Embers');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  Rotberry$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Rotberry$Seed');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ItemButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ItemButton');
  RedButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RedButton');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  IconTitle = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.IconTitle');
  WndSadGhost = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndSadGhost');
});
