// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/ChampionEnemy.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Challenges, Dungeon, Actor, Blob, Fire, AllyBuff, Buff$buffType, Burning, Bat, Crab, Guard, Thief, AntiMagic, Messages, GameScene, BuffIndicator, BArray, PathFinder, Random;

export class ChampionEnemy extends Buff {
  color_: number = 0;
  rays: number = 0;
  _ChampionEnemy(): this {
    this._Buff();
    this.type_ = Buff$buffType.POSITIVE;
    this.revivePersists = true;
    this.immunities_.add($J.cls(AllyBuff));
    return this;
  }
  icon(): number {
    return BuffIndicator.CORRUPT;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$int(this.color_);
  }
  fx(on: boolean): void {
    if (on) {
      this.target.sprite_.aura(this.color_, this.rays);
    } else {
      this.target.sprite_.clearAura();
    }
  }
  onAttackProc(enemy: Char): void {
  }
  canAttackWithExtraReach(enemy: Char): boolean {
    return false;
  }
  meleeDamageFactor(): number {
    return 1;
  }
  damageTakenFactor(): number {
    return 1;
  }
  evasionAndAccuracyFactor(): number {
    return 1;
  }
  static rollForChampion(m: Mob): void {
    Dungeon.mobsToChampion--;
    let buffCls: JClass<ChampionEnemy>;
    switch (Random.Int$int(6)) {
      case 0:
      default:
        buffCls = $J.cls(ChampionEnemy$Blazing);
        break;
      case 1:
        buffCls = $J.cls(ChampionEnemy$Projecting);
        break;
      case 2:
        buffCls = $J.cls(ChampionEnemy$AntiMagic);
        break;
      case 3:
        buffCls = $J.cls(ChampionEnemy$Giant);
        break;
      case 4:
        buffCls = $J.cls(ChampionEnemy$Blessed);
        break;
      case 5:
        buffCls = $J.cls(ChampionEnemy$Growing);
        break;
    }
    if (Dungeon.mobsToChampion <= Math.fround(0) && Dungeon.isChallenged(Challenges.CHAMPION_ENEMIES)) {
      if (m instanceof Crab && Dungeon.scalingDepth() <= 3) {
        return;
      }
      if (m instanceof Thief && Dungeon.scalingDepth() <= 4) {
        return;
      }
      if (m instanceof Guard && Dungeon.scalingDepth() <= 7) {
        return;
      }
      if (m instanceof Bat && Dungeon.scalingDepth() <= 9) {
        return;
      }
      Buff.affect$Char$Class(m, buffCls);
      Dungeon.mobsToChampion = Math.fround(Dungeon.mobsToChampion + Math.fround(8 - Math.fround((Math.min(20, (Dungeon.scalingDepth() - 1) | 0)) / 10)));
      if (m.state_ !== m.PASSIVE) {
        m.state_ = m.WANDERING;
      }
    }
  }
}

export class ChampionEnemy$Blazing extends ChampionEnemy {
  _ChampionEnemy$Blazing(): this {
    this._ChampionEnemy();
    this.color_ = 16746496;
    this.rays = 4;
    this.immunities_.add($J.cls(Burning));
    return this;
  }
  onAttackProc(enemy: Char): void {
    if (!Dungeon.level.water[enemy.pos]) {
      Buff.affect$Char$Class(enemy, $J.cls(Burning)).reignite$Char(enemy);
    }
  }
  detach(): void {
    if (this.target.flying || !Dungeon.level.pit[this.target.pos]) {
      for (let i of PathFinder.NEIGHBOURS9) {
        if (!(Dungeon.level.solid[(this.target.pos + i) | 0]) && !(Dungeon.level.water[(this.target.pos + i) | 0])) {
          GameScene.add$Blob(Blob.seed$int$int$Class((this.target.pos + i) | 0, 2, $J.cls(Fire)));
        }
      }
    }
    super.detach();
  }
  meleeDamageFactor(): number {
    return 1.25;
  }
}

export class ChampionEnemy$Projecting extends ChampionEnemy {
  _ChampionEnemy$Projecting(): this {
    this._ChampionEnemy();
    this.color_ = 8913151;
    this.rays = 4;
    return this;
  }
  meleeDamageFactor(): number {
    return 1.25;
  }
  canAttackWithExtraReach(enemy: Char): boolean {
    if (Dungeon.level.distance(this.target.pos, enemy.pos) > 4) {
      return false;
    } else {
      let passable = BArray.not(Dungeon.level.solid, null);
      for (const $it0 = Actor.chars().iterator(); $it0.hasNext(); ) {
        let ch = $it0.next();
        passable[ch.pos] = ch === this.target;
      }
      PathFinder.buildDistanceMap$int$booleanArr$int(enemy.pos, passable, 4);
      return PathFinder.distance[this.target.pos] <= 4;
    }
  }
}

export class ChampionEnemy$AntiMagic extends ChampionEnemy {
  _ChampionEnemy$AntiMagic(): this {
    this._ChampionEnemy();
    this.color_ = 65280;
    this.rays = 5;
    this.immunities_.addAll(AntiMagic.RESISTS);
    return this;
  }
  damageTakenFactor(): number {
    return 0.5;
  }
}

export class ChampionEnemy$Giant extends ChampionEnemy {
  _ChampionEnemy$Giant(): this {
    this._ChampionEnemy();
    this.color_ = 35071;
    this.rays = 5;
    return this;
  }
  damageTakenFactor(): number {
    return Math.fround(0.2);
  }
  canAttackWithExtraReach(enemy: Char): boolean {
    if (Dungeon.level.distance(this.target.pos, enemy.pos) > 2) {
      return false;
    } else {
      let passable = BArray.not(Dungeon.level.solid, null);
      for (const $it1 = Actor.chars().iterator(); $it1.hasNext(); ) {
        let ch = $it1.next();
        passable[ch.pos] = ch === this.target;
      }
      PathFinder.buildDistanceMap$int$booleanArr$int(enemy.pos, passable, 2);
      return PathFinder.distance[this.target.pos] <= 2;
    }
  }
}

export class ChampionEnemy$Blessed extends ChampionEnemy {
  _ChampionEnemy$Blessed(): this {
    this._ChampionEnemy();
    this.color_ = 16776960;
    this.rays = 6;
    return this;
  }
  evasionAndAccuracyFactor(): number {
    return 4;
  }
}

export class ChampionEnemy$Growing extends ChampionEnemy {
  multiplier: number = 0;
  static readonly MULTIPLIER: string = 'multiplier';
  _ChampionEnemy$Growing(): this {
    this._ChampionEnemy();
    this.color_ = 16720418;
    this.rays = 6;
    this.multiplier = Math.fround(1.19);
    return this;
  }
  act(): boolean {
    this.multiplier = Math.fround(this.multiplier + Math.fround(0.01));
    this.spend(Math.fround(4 * Actor.TICK));
    return true;
  }
  meleeDamageFactor(): number {
    return this.multiplier;
  }
  damageTakenFactor(): number {
    return Math.fround(1 / this.multiplier);
  }
  evasionAndAccuracyFactor(): number {
    return this.multiplier;
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [$J.d2i((Math.fround(100 * (Math.fround(this.multiplier - 1))))), $J.d2i((Math.fround(100 * (Math.fround(1 - Math.fround(1 / this.multiplier))))))]);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$float(ChampionEnemy$Growing.MULTIPLIER, this.multiplier);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.multiplier = bundle.getFloat(ChampionEnemy$Growing.MULTIPLIER);
  }
}

$J.define(ChampionEnemy, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ChampionEnemy', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_ChampionEnemy' } });
$J.define(ChampionEnemy$Blazing, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ChampionEnemy$Blazing', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ChampionEnemy', ctors: { '': '_ChampionEnemy$Blazing' } });
$J.define(ChampionEnemy$Projecting, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ChampionEnemy$Projecting', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ChampionEnemy', ctors: { '': '_ChampionEnemy$Projecting' } });
$J.define(ChampionEnemy$AntiMagic, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ChampionEnemy$AntiMagic', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ChampionEnemy', ctors: { '': '_ChampionEnemy$AntiMagic' } });
$J.define(ChampionEnemy$Giant, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ChampionEnemy$Giant', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ChampionEnemy', ctors: { '': '_ChampionEnemy$Giant' } });
$J.define(ChampionEnemy$Blessed, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ChampionEnemy$Blessed', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ChampionEnemy', ctors: { '': '_ChampionEnemy$Blessed' } });
$J.define(ChampionEnemy$Growing, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ChampionEnemy$Growing', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ChampionEnemy', ctors: { '': '_ChampionEnemy$Growing' } });
$J.module(() => {
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Blob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob');
  Fire = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Fire');
  AllyBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AllyBuff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Burning = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Burning');
  Bat = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Bat');
  Crab = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Crab');
  Guard = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Guard');
  Thief = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Thief');
  AntiMagic = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.AntiMagic');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
