// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/scrolls/exotic/ScrollOfSirensSong.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../jre/index.ts';
import { ExoticScroll } from './ExoticScroll.ts';
import { AllyBuff } from '../../../actors/buffs/AllyBuff.ts';

let Assets$Sounds, Dungeon, Actor, Char$Alignment, Buff, Buff$buffType, Charm, Mob, Speck, Item, Messages, CellSelector$Listener, GameScene, CharSprite$State, ItemSpriteSheet$Icons, BuffIndicator, GLog, Sample;

export class ScrollOfSirensSong extends ExoticScroll {
  static identifiedByUse: boolean = false;
  targeter: CellSelector$Listener = null;
  _ScrollOfSirensSong(): this {
    this._ExoticScroll();
    this.icon_ = ItemSpriteSheet$Icons.SCROLL_SIREN;
    this.targeter = new (ScrollOfSirensSong$1())().$o(this)._CellSelector$Listener();
    return this;
  }
  doRead(): void {
    if (!this.isKnown()) {
      this.identify$();
      Item.curItem = this.detach(Item.curUser.belongings.backpack);
      ScrollOfSirensSong.identifiedByUse = true;
    } else {
      ScrollOfSirensSong.identifiedByUse = false;
    }
    GameScene.selectCell(this.targeter);
  }
  static $clinit() {
    ScrollOfSirensSong.identifiedByUse = false;
  }
}

export class ScrollOfSirensSong$Enthralled extends AllyBuff {
  _ScrollOfSirensSong$Enthralled(): this {
    this._AllyBuff();
    this.type_ = Buff$buffType.NEGATIVE;
    this.announced = true;
    return this;
  }
  fx(on: boolean): void {
    if (on) {
      this.target.sprite_.add(CharSprite$State.HEARTS);
    } else {
      this.target.sprite_.remove$State(CharSprite$State.HEARTS);
    }
  }
  icon(): number {
    return BuffIndicator.HEART;
  }
}

let $ScrollOfSirensSong$1: any = null;
/** An anonymous class (ScrollOfSirensSong.java:62). */
function ScrollOfSirensSong$1(): any {
  return $ScrollOfSirensSong$1 ??= $J.local(class extends CellSelector$Listener {
    onSelect(cell: number): void {
      if (cell == null && this.$outer.isKnown()) {
        return;
      }
      let target = null;
      if (cell != null) {
        let ch = Actor.findChar(cell);
        if (ch != null && ch.alignment !== Char$Alignment.ALLY && ch instanceof Mob) {
          target = ch;
        }
      }
      if (target == null && !this.$outer.anonymous && !ScrollOfSirensSong.identifiedByUse) {
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(ScrollOfSirensSong), 'cancel', []), []);
        return;
      } else {
        Item.curUser.sprite_.centerEmitter().start(Speck.factory$int(Speck.HEART), Math.fround(0.2), 5);
        Sample.INSTANCE.play$Object(Assets$Sounds.CHARMS);
        Sample.INSTANCE.playDelayed$Object$float(Assets$Sounds.LULLABY, Math.fround(0.1));
        for (let mob of $J.toArrayInto(Dungeon.level.mobs.toArray(), $J.newArray(0, null))) {
          if (Dungeon.level.heroFOV[mob.pos] && mob !== target && mob.alignment !== Char$Alignment.ALLY) {
            Buff.affect$Char$Class$float(mob, $J.cls(Charm), Charm.DURATION).object = Item.curUser.id();
            mob.sprite_.centerEmitter().start(Speck.factory$int(Speck.HEART), Math.fround(0.2), 5);
          }
        }
        if (target != null) {
          if (!target.isImmune($J.cls(ScrollOfSirensSong$Enthralled))) {
            AllyBuff.affectAndLoot(target, Item.curUser, $J.cls(ScrollOfSirensSong$Enthralled));
          } else {
            Buff.affect$Char$Class$float(target, $J.cls(Charm), Charm.DURATION).object = Item.curUser.id();
          }
          target.sprite_.centerEmitter().burst(Speck.factory$int(Speck.HEART), 10);
        } else {
          GLog.w(Messages.get$Class$String$ObjectArr($J.cls(ScrollOfSirensSong), 'no_target', []), []);
        }
        if (!ScrollOfSirensSong.identifiedByUse) {
          Item.curItem.detach(Item.curUser.belongings.backpack);
        }
        ScrollOfSirensSong.identifiedByUse = false;
        this.$outer.readAnimation();
      }
    }
    prompt(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(ScrollOfSirensSong), 'prompt', []);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfSirensSong$1', []);
}

$J.define(ScrollOfSirensSong, 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfSirensSong', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ExoticScroll', ctors: { '': '_ScrollOfSirensSong' }, clinit: true, lazy: ['identifiedByUse'] });
$J.define(ScrollOfSirensSong$Enthralled, 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfSirensSong$Enthralled', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AllyBuff', ctors: { '': '_ScrollOfSirensSong$Enthralled' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Charm = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Charm');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CellSelector$Listener = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.CellSelector$Listener');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  CharSprite$State = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite$State');
  ItemSpriteSheet$Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
