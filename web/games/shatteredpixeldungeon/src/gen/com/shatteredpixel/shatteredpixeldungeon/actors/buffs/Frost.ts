// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Frost.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { FlavourBuff } from './FlavourBuff.ts';

let Dungeon, Buff, Buff$buffType, Burning, Chill, Hero, Thief, FrozenCarpaccio, MysteryMeat, Potion, VaultLevel, Messages, CharSprite$State, BuffIndicator, GLog, Random;

export class Frost extends FlavourBuff {
  static readonly DURATION: number = 10;
  _Frost(): this {
    this._FlavourBuff();
    this.type_ = Buff$buffType.NEGATIVE;
    this.announced = true;
    this.immunities_.add($J.cls(Chill));
    return this;
  }
  attachTo(target: Char): boolean {
    Buff.detach(target, $J.cls(Burning));
    if (super.attachTo(target)) {
      target.paralysed++;
      Buff.detach(target, $J.cls(Chill));
      if (target instanceof Hero && !(Dungeon.level instanceof VaultLevel)) {
        let hero = target;
        let freezable = new ArrayList();
        if (!hero.belongings.lostInventory$()) {
          for (const $it0 = hero.belongings.backpack.items_.iterator(); $it0.hasNext(); ) {
            let i = $it0.next();
            if (!i.unique && (i instanceof Potion || i instanceof MysteryMeat)) {
              freezable.add(i);
            }
          }
        }
        if (!freezable.isEmpty()) {
          let toFreeze = Random.element$Collection(freezable).detach(hero.belongings.backpack);
          GLog.w(Messages.capitalize(Messages.get$Object$String$ObjectArr(this, 'freezes', [toFreeze.title()])), []);
          if (toFreeze instanceof Potion) {
            (toFreeze).shatter(hero.pos);
          } else if (toFreeze instanceof MysteryMeat) {
            let carpaccio = new FrozenCarpaccio()._FrozenCarpaccio();
            if (!carpaccio.collect$Bag(hero.belongings.backpack)) {
              Dungeon.level.drop(carpaccio, target.pos).sprite_.drop$();
            }
          }
        }
      } else if (target instanceof Thief) {
        let item = (target).item_;
        if (item instanceof Potion && !item.unique) {
          ((target).item_).shatter(target.pos);
          (target).item_ = null;
        } else if (item instanceof MysteryMeat) {
          (target).item_ = new FrozenCarpaccio()._FrozenCarpaccio();
        }
      }
      return true;
    } else {
      return false;
    }
  }
  detach(): void {
    super.detach();
    if (this.target.paralysed > 0) {
      this.target.paralysed--;
    }
    if (Dungeon.level.water[this.target.pos]) {
      Buff.prolong(this.target, $J.cls(Chill), Math.fround(Chill.DURATION / 2));
    }
  }
  icon(): number {
    return BuffIndicator.FROST;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(0, 0.75, 1);
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(Frost.DURATION - this.visualcooldown())) / Frost.DURATION));
  }
  fx(on: boolean): void {
    if (on) {
      this.target.sprite_.add(CharSprite$State.FROZEN);
      this.target.sprite_.add(CharSprite$State.PARALYSED);
    } else {
      this.target.sprite_.remove$State(CharSprite$State.FROZEN);
      if (this.target.paralysed <= 1) {
        this.target.sprite_.remove$State(CharSprite$State.PARALYSED);
      }
    }
  }
}

$J.define(Frost, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Frost', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Frost' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Burning = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Burning');
  Chill = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Chill');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  Thief = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Thief');
  FrozenCarpaccio = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.FrozenCarpaccio');
  MysteryMeat = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.MysteryMeat');
  Potion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.Potion');
  VaultLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.VaultLevel');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CharSprite$State = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite$State');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Random = $J.load('com.watabou.utils.Random');
});
