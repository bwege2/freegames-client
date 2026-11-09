// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/ArtifactRecharge.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Actor, Buff$buffType, Hero, Artifact$ArtifactBuff, HornOfPlenty$hornRecharge, Messages, BuffIndicator;

export class ArtifactRecharge extends Buff {
  static readonly DURATION: number = 30;
  left_: number = 0;
  ignoreHornOfPlenty: boolean = false;
  static readonly LEFT: string = 'left';
  static readonly IGNORE_HORN: string = 'ignore_horn';
  _ArtifactRecharge(): this {
    this._Buff();
    this.type_ = Buff$buffType.POSITIVE;
    return this;
  }
  act(): boolean {
    if (this.target instanceof Hero) {
      let chargeAmount = Math.min(1, this.left_);
      if (chargeAmount > Math.fround(0)) {
        for (const $it0 = this.target.buffs$().iterator(); $it0.hasNext(); ) {
          let b = $it0.next();
          if (b instanceof Artifact$ArtifactBuff) {
            if (b instanceof HornOfPlenty$hornRecharge && this.ignoreHornOfPlenty) {
              continue;
            }
            if (!(b).isCursed()) {
              (b).charge$Hero$float(this.target, chargeAmount);
            }
          }
        }
      }
    }
    this.left_--;
    if (this.left_ < Math.fround(0)) {
      this.detach();
    } else {
      this.spend(Actor.TICK);
    }
    return true;
  }
  set(amount: number): ArtifactRecharge {
    if (this.left_ < amount) {
      this.left_ = amount;
    }
    return this;
  }
  extend(amount: number): ArtifactRecharge {
    this.left_ = Math.fround(this.left_ + amount);
    return this;
  }
  left(): number {
    return this.left_;
  }
  icon(): number {
    return BuffIndicator.RECHARGING;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(0, 1, 0);
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(ArtifactRecharge.DURATION - this.left_)) / ArtifactRecharge.DURATION));
  }
  iconTextDisplay(): string {
    return String(($J.d2i(this.left_) + 1) | 0);
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [this.dispTurns$float(Math.fround(this.left_ + 1))]);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$float(ArtifactRecharge.LEFT, this.left_);
    bundle.put$String$boolean(ArtifactRecharge.IGNORE_HORN, this.ignoreHornOfPlenty);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.left_ = bundle.getFloat(ArtifactRecharge.LEFT);
    this.ignoreHornOfPlenty = bundle.getBoolean(ArtifactRecharge.IGNORE_HORN);
  }
  static chargeArtifacts(hero: Hero, turns: number): void {
    for (const $it1 = hero.buffs$().iterator(); $it1.hasNext(); ) {
      let b = $it1.next();
      if (b instanceof Artifact$ArtifactBuff && !(b).isCursed()) {
        if (!(b).isCursed()) {
          (b).charge$Hero$float(hero, turns);
        }
      }
    }
  }
}

$J.define(ArtifactRecharge, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ArtifactRecharge', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_ArtifactRecharge' } });
$J.module(() => {
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  Artifact$ArtifactBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact$ArtifactBuff');
  HornOfPlenty$hornRecharge = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.HornOfPlenty$hornRecharge');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
});
