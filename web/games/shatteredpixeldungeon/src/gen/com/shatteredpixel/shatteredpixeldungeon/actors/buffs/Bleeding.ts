// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Bleeding.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Badges, Dungeon, Actor, Buff$buffType, Splash, Sacrificial, MeleeWeapon, Sickle$HarvestBleedTracker, Chasm, Messages, BuffIndicator, GLog, PointF, Random;

export class Bleeding extends Buff {
  level_: number = 0;
  source_: JClass = null;
  static readonly LEVEL: string = 'level';
  static readonly SOURCE: string = 'source';
  _Bleeding(): this {
    this._Buff();
    this.type_ = Buff$buffType.NEGATIVE;
    this.announced = true;
    return this;
  }
  level(): number {
    return this.level_;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$float(Bleeding.LEVEL, this.level_);
    bundle.put$String$Class(Bleeding.SOURCE, this.source_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.level_ = bundle.getFloat(Bleeding.LEVEL);
    this.source_ = bundle.getClass$String(Bleeding.SOURCE);
  }
  set$float(level: number): void {
    this.set$float$Class(level, null);
  }
  set$float$Class(level: number, source: JClass): void {
    level = Random.NormalFloat(Math.fround(level / 2), level);
    if (this.level_ < level) {
      this.level_ = Math.max(this.level_, level);
      this.source_ = source;
    }
    if (this.target != null) {
      this.target.needsIncomingDOTUpdate = true;
    }
  }
  extend(amount: number): void {
    this.level_ = Math.fround(this.level_ + amount);
  }
  icon(): number {
    return BuffIndicator.BLEEDING;
  }
  iconTextDisplay(): string {
    return String($J.roundf(this.level_));
  }
  act(): boolean {
    if (this.target.isAlive()) {
      let dmg = $J.roundf(this.level_);
      if (dmg > 0) {
        this.target.damage(dmg, this);
        if (this.target.sprite_.visible_) {
          Splash.at$PointF$float$float$int$int(this.target.sprite_.center$(), Math.fround(Math.fround(-PointF.PI) / 2), Math.fround(PointF.PI / 6), this.target.sprite_.blood(), Math.min($J.idiv(Math.imul(10, dmg), this.target.HT), 10));
        }
        if (this.target === Dungeon.hero && !this.target.isAlive()) {
          if (this.source_ === $J.cls(Chasm)) {
            Badges.validateDeathFromFalling();
          } else if (this.source_ === $J.cls(Sacrificial)) {
            Badges.validateDeathFromFriendlyMagic();
          }
          Dungeon.fail(this);
          GLog.n(Messages.get$Object$String$ObjectArr(this, 'ondeath', []), []);
        }
        if (this.source_ === $J.cls(Sickle$HarvestBleedTracker) && !this.target.isAlive()) {
          MeleeWeapon.onAbilityKill(Dungeon.hero, this.target);
        }
        this.spend(Actor.TICK);
      }
      this.level_ = Random.NormalFloat(Math.fround(this.level_ / 2), this.level_);
      if ($J.roundf(this.level_) <= 0) {
        this.detach();
      }
      this.target.needsIncomingDOTUpdate = true;
    } else {
      this.detach();
    }
    return true;
  }
  detach(): void {
    this.target.needsIncomingDOTUpdate = true;
    super.detach();
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [$J.roundf(this.level_)]);
  }
  totalIncomingDMG(): number {
    return $J.roundf(Math.fround(this.level_ * 4));
  }
}

$J.define(Bleeding, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Bleeding', { kind: 'class', ifaces: ['com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$DOTbuff'], sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Bleeding' }, meths: { 'set(float,java.lang.Class)': 'set$float$Class', 'set(float)': 'set$float' } });
$J.module(() => {
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Splash = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Splash');
  Sacrificial = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.curses.Sacrificial');
  MeleeWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon');
  Sickle$HarvestBleedTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Sickle$HarvestBleedTracker');
  Chasm = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.Chasm');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  PointF = $J.load('com.watabou.utils.PointF');
  Random = $J.load('com.watabou.utils.Random');
});
