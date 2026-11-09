// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Corrosion.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Badges, Dungeon, Actor, Buff$buffType, WandOfCorrosion, Messages, BuffIndicator, GLog;

export class Corrosion extends Buff {
  damage_: number = 0;
  left_: number = 0;
  source_: JClass = null;
  static readonly DAMAGE: string = 'damage';
  static readonly LEFT: string = 'left';
  static readonly SOURCE: string = 'source';
  _Corrosion(): this {
    this._Buff();
    this.damage_ = 1;
    this.type_ = Buff$buffType.NEGATIVE;
    this.announced = true;
    return this;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$float(Corrosion.DAMAGE, this.damage_);
    bundle.put$String$float(Corrosion.LEFT, this.left_);
    bundle.put$String$Class(Corrosion.SOURCE, this.source_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.damage_ = bundle.getFloat(Corrosion.DAMAGE);
    this.left_ = bundle.getFloat(Corrosion.LEFT);
    this.source_ = bundle.getClass$String(Corrosion.SOURCE);
  }
  set$float$int(duration: number, damage: number): void {
    this.set$float$int$Class(duration, damage, null);
  }
  set$float$int$Class(duration: number, damage: number, source: JClass): void {
    this.left_ = Math.max(duration, this.left_);
    if (this.damage_ < Math.fround(damage)) {
      this.damage_ = Math.fround(damage);
    }
    this.source_ = source;
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
  icon(): number {
    return BuffIndicator.POISON;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(1, 0.5, 0);
  }
  iconTextDisplay(): string {
    return String($J.d2i(this.damage_));
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [this.dispTurns$float(this.left_), $J.d2i(this.damage_)]);
  }
  act(): boolean {
    if (this.target.isAlive()) {
      this.target.damage($J.d2i(this.damage_), this);
      if (this.damage_ < Math.fround((($J.idiv(Dungeon.scalingDepth(), 2)) + 2) | 0)) {
        this.damage_++;
      } else {
        this.damage_ = Math.fround(this.damage_ + 0.5);
      }
      this.spend(Actor.TICK);
      if ((this.left_ = Math.fround(this.left_ - Actor.TICK)) <= Math.fround(0)) {
        this.detach();
      }
    } else {
      this.detach();
    }
    this.target.needsIncomingDOTUpdate = true;
    return true;
  }
  detach(): void {
    this.target.needsIncomingDOTUpdate = true;
    super.detach();
  }
  onDeath(): void {
    if (this.source_ === $J.cls(WandOfCorrosion)) {
      Badges.validateDeathFromFriendlyMagic();
    }
    Dungeon.fail(this);
    GLog.n(Messages.get$Object$String$ObjectArr(this, 'ondeath', []), []);
  }
  totalIncomingDMG(): number {
    let total = 0;
    let curDMG = this.damage_;
    for (let i = $J.d2i(Math.ceil(this.left_)); i > 0; i--) {
      total = (total + $J.d2i(curDMG)) | 0;
      if (curDMG < Math.fround((($J.idiv(Dungeon.scalingDepth(), 2)) + 2) | 0)) {
        curDMG++;
      } else {
        curDMG = Math.fround(curDMG + 0.5);
      }
    }
    return total;
  }
}

$J.define(Corrosion, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Corrosion', { kind: 'class', ifaces: ['com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero$Doom', 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$DOTbuff'], sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Corrosion' }, meths: { 'set(float,int,java.lang.Class)': 'set$float$int$Class', 'set(float,int)': 'set$float$int' } });
$J.module(() => {
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  WandOfCorrosion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfCorrosion');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
});
