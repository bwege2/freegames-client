// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Poison.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Badges, Dungeon, Actor, Buff$buffType, CellEmitter, PoisonParticle, Messages, BuffIndicator, GLog;

export class Poison extends Buff {
  left_: number = 0;
  static readonly LEFT: string = 'left';
  _Poison(): this {
    this._Buff();
    this.type_ = Buff$buffType.NEGATIVE;
    this.announced = true;
    return this;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$float(Poison.LEFT, this.left_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.left_ = bundle.getFloat(Poison.LEFT);
  }
  set(duration: number): void {
    this.left_ = Math.max(duration, this.left_);
    if (this.target != null) {
      this.target.needsIncomingDOTUpdate = true;
    }
  }
  extend(duration: number): void {
    this.left_ = Math.fround(this.left_ + duration);
    if (this.target != null) {
      this.target.needsIncomingDOTUpdate = true;
    }
  }
  delay(turns: number): void {
    this.spend(turns);
  }
  icon(): number {
    return BuffIndicator.POISON;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(Math.fround(0.6), Math.fround(0.2), Math.fround(0.6));
  }
  iconTextDisplay(): string {
    return String($J.d2i(this.left_));
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [this.dispTurns$float(this.left_)]);
  }
  attachTo(target: Char): boolean {
    if (super.attachTo(target) && target.sprite_ != null) {
      CellEmitter.center(target.pos).burst(PoisonParticle.SPLASH, 5);
      return true;
    } else {
      return false;
    }
  }
  detach(): void {
    this.target.needsIncomingDOTUpdate = true;
    super.detach();
  }
  act(): boolean {
    if (this.target.isAlive()) {
      this.target.damage(($J.d2i((Math.fround(this.left_ / 3))) + 1) | 0, this);
      this.spend(Actor.TICK);
      if ((this.left_ = Math.fround(this.left_ - Actor.TICK)) <= Math.fround(0)) {
        this.detach();
      }
      this.target.needsIncomingDOTUpdate = true;
    } else {
      this.detach();
    }
    return true;
  }
  totalIncomingDMG(): number {
    let total = 0;
    for (let i = $J.d2i(Math.ceil(this.left_)); i > 0; i--) {
      total = (total + ($J.idiv(i, 3) + 1)) | 0;
    }
    return total;
  }
  onDeath(): void {
    Badges.validateDeathFromPoison();
    Dungeon.fail(this);
    GLog.n(Messages.get$Object$String$ObjectArr(this, 'ondeath', []), []);
  }
}

$J.define(Poison, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Poison', { kind: 'class', ifaces: ['com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero$Doom', 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$DOTbuff'], sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Poison' } });
$J.module(() => {
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  PoisonParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.PoisonParticle');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
});
