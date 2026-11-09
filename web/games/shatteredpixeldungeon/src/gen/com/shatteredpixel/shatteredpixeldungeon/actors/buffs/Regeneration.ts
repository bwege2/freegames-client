// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Regeneration.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Actor, LockedFloor, MagicImmune, SpiritForm, SpiritForm$SpiritFormBuff, ChaliceOfBlood, ChaliceOfBlood$chaliceRegen, RingOfEnergy, ChaoticCenser, ChaoticCenser$CenserGasTracker, SaltCube;

export class Regeneration extends Buff {
  partialRegen: number = 0;
  static readonly REGENERATION_DELAY: number = 10;
  static readonly PARTIAL_REGEN: string = 'partial_regen';
  _Regeneration(): this {
    this._Buff();
    this.actPriority = (Actor.HERO_PRIO - 1) | 0;
    this.partialRegen = 0;
    return this;
  }
  act(): boolean {
    if (this.target.isAlive()) {
      if (ChaoticCenser.averageTurnsUntilGas$() !== -1) {
        Buff.affect$Char$Class(Dungeon.hero, $J.cls(ChaoticCenser$CenserGasTracker));
      }
      if (Regeneration.regenOn() && this.target.HP < this.regencap() && !(this.target).isStarving()) {
        let chaliceCursed = false;
        let chaliceLevel = -1;
        if (this.target.buff($J.cls(MagicImmune)) == null) {
          if (Dungeon.hero.buff($J.cls(ChaliceOfBlood$chaliceRegen)) != null) {
            chaliceCursed = Dungeon.hero.buff($J.cls(ChaliceOfBlood$chaliceRegen)).isCursed();
            chaliceLevel = Dungeon.hero.buff($J.cls(ChaliceOfBlood$chaliceRegen)).itemLevel();
          } else if (Dungeon.hero.buff($J.cls(SpiritForm$SpiritFormBuff)) != null && Dungeon.hero.buff($J.cls(SpiritForm$SpiritFormBuff)).artifact() instanceof ChaliceOfBlood) {
            chaliceLevel = SpiritForm.artifactLevel();
          }
        }
        let delay = Regeneration.REGENERATION_DELAY;
        if (chaliceLevel !== -1 && this.target.buff($J.cls(MagicImmune)) == null) {
          if (chaliceCursed) {
            delay = Math.fround(delay * 1.5);
          } else {
            delay = Math.fround(delay - Math.fround(Math.fround(1.33) + Math.fround(chaliceLevel * Math.fround(0.667))));
            delay = Math.fround(delay / RingOfEnergy.artifactChargeMultiplier(this.target));
          }
        }
        if (this.target.buff($J.cls(LockedFloor)) == null) {
          delay = Math.fround(delay / SaltCube.healthRegenMultiplier$());
        }
        this.partialRegen = Math.fround(this.partialRegen + Math.fround(1 / delay));
        if (this.partialRegen >= Math.fround(1)) {
          this.target.HP = (this.target.HP + $J.d2i(this.partialRegen)) | 0;
          this.partialRegen = Math.fround(this.partialRegen - $J.d2i(this.partialRegen));
          if (this.target.HP >= this.regencap()) {
            this.target.HP = this.regencap();
            (this.target).resting = false;
          }
        }
      }
      this.spend(Actor.TICK);
    } else {
      this.diactivate();
    }
    return true;
  }
  regencap(): number {
    return this.target.HT;
  }
  static regenOn(): boolean {
    let lock = Dungeon.hero.buff($J.cls(LockedFloor));
    if (lock != null && !lock.regenOn()) {
      return false;
    }
    return true;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$float(Regeneration.PARTIAL_REGEN, this.partialRegen);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.partialRegen = bundle.getFloat(Regeneration.PARTIAL_REGEN);
  }
}

$J.define(Regeneration, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Regeneration', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Regeneration' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  LockedFloor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.LockedFloor');
  MagicImmune = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MagicImmune');
  SpiritForm = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.SpiritForm');
  SpiritForm$SpiritFormBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.SpiritForm$SpiritFormBuff');
  ChaliceOfBlood = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.ChaliceOfBlood');
  ChaliceOfBlood$chaliceRegen = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.ChaliceOfBlood$chaliceRegen');
  RingOfEnergy = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfEnergy');
  ChaoticCenser = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ChaoticCenser');
  ChaoticCenser$CenserGasTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ChaoticCenser$CenserGasTracker');
  SaltCube = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.SaltCube');
});
