// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/HoldFast.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../jre/index.ts';
import { Buff } from './Buff.ts';

let Dungeon, Actor, Buff$buffType, Hero, HeroClass, Talent, Messages, BuffIndicator, Random;

export class HoldFast extends Buff {
  pos: number = 0;
  static readonly POS: string = 'pos';
  _HoldFast(): this {
    this._Buff();
    this.type_ = Buff$buffType.POSITIVE;
    this.pos = -1;
    return this;
  }
  act(): boolean {
    if (this.pos !== this.target.pos) {
      this.detach();
    } else {
      this.spend(Actor.TICK);
    }
    return true;
  }
  armorBonus(): number {
    if (this.pos === this.target.pos && this.target instanceof Hero) {
      let max = 0;
      if ((this.target).heroClass === HeroClass.WARRIOR) {
        max = 6;
      } else {
        let armor = (this.target).belongings.armor();
        if (armor != null) {
          max = (armor.tier_ + armor.buffedLvl()) | 0;
        }
      }
      let block = Random.NormalIntRange((this.target).pointsInTalent(Talent.HOLD_FAST), Math.imul(2, (this.target).pointsInTalent(Talent.HOLD_FAST)));
      return Math.min(block, max);
    } else {
      this.detach();
      return 0;
    }
  }
  static buffDecayFactor(target: Char): number {
    let buff = target.buff($J.cls(HoldFast));
    if (buff != null && target.pos === buff.pos && target instanceof Hero) {
      switch ((target).pointsInTalent(Talent.HOLD_FAST)) {
        case 1:
          return 0.5;
        case 2:
          return 0.25;
        case 3:
          return 0;
      }
    } else if (buff != null) {
      buff.detach();
    }
    return 1;
  }
  icon(): number {
    return BuffIndicator.ARMOR;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(Math.fround(1.9), Math.fround(2.4), 3.25);
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [Dungeon.hero.pointsInTalent(Talent.HOLD_FAST), Math.imul(2, Dungeon.hero.pointsInTalent(Talent.HOLD_FAST)), (25 + Math.imul(25, Dungeon.hero.pointsInTalent(Talent.HOLD_FAST))) | 0]);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(HoldFast.POS, this.pos);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.pos = bundle.getInt(HoldFast.POS);
  }
}

$J.define(HoldFast, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.HoldFast', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_HoldFast' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  HeroClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  Random = $J.load('com.watabou.utils.Random');
});
