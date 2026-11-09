// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/WellFed.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Challenges, Dungeon, Actor, Buff$buffType, Hunger, Hero, FloatingText, SaltCube, Messages, CharSprite, BuffIndicator;

export class WellFed extends Buff {
  left_: number = 0;
  static readonly LEFT: string = 'left';
  _WellFed(): this {
    this._Buff();
    this.type_ = Buff$buffType.POSITIVE;
    this.announced = true;
    return this;
  }
  act(): boolean {
    this.left_--;
    if (this.left_ < 0) {
      this.detach();
      if (this.target instanceof Hero) {
        (this.target).resting = false;
      }
      return true;
    } else if (this.left_ % 18 === 0 && this.target.HP < this.target.HT) {
      this.target.HP = (this.target.HP + 1) | 0;
      this.target.sprite_.showStatusWithIcon(CharSprite.POSITIVE, '1', FloatingText.HEALING, []);
      if (this.target.HP === this.target.HT && this.target instanceof Hero) {
        (this.target).resting = false;
      }
    }
    this.spend(Math.fround(Actor.TICK / SaltCube.hungerGainMultiplier$()));
    return true;
  }
  reset(): void {
    this.left_ = $J.d2i(Hunger.STARVING);
    if (Dungeon.isChallenged(Challenges.NO_FOOD)) {
      this.left_ = $J.idiv(this.left_, 3);
    }
  }
  extend(duration: number): void {
    this.left_ = $J.d2i(Math.fround(this.left_ + duration));
  }
  icon(): number {
    return BuffIndicator.WELL_FED;
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(Hunger.STARVING - this.left_)) / Hunger.STARVING));
  }
  iconTextDisplay(): string {
    let visualLeft = $J.d2i((Math.fround(this.left_ / SaltCube.hungerGainMultiplier$())));
    return String((visualLeft + 1) | 0);
  }
  desc(): string {
    let visualLeft = $J.d2i((Math.fround(this.left_ / SaltCube.hungerGainMultiplier$())));
    return Messages.get$Object$String$ObjectArr(this, 'desc', [(visualLeft + 1) | 0]);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(WellFed.LEFT, this.left_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.left_ = bundle.getInt(WellFed.LEFT);
  }
}

$J.define(WellFed, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.WellFed', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_WellFed' } });
$J.module(() => {
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Hunger = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Hunger');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  SaltCube = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.SaltCube');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
});
