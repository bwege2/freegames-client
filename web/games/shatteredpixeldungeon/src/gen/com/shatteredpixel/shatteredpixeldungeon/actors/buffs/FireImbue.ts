// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/FireImbue.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Actor, Buff$buffType, Burning, FlameParticle, Level, Terrain, Messages, GameScene, BuffIndicator, Random;

export class FireImbue extends Buff {
  static readonly DURATION: number = 50;
  left_: number = 0;
  static readonly LEFT: string = 'left';
  _FireImbue(): this {
    this._Buff();
    this.type_ = Buff$buffType.POSITIVE;
    this.announced = true;
    this.immunities_.add($J.cls(Burning));
    return this;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$float(FireImbue.LEFT, this.left_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.left_ = bundle.getFloat(FireImbue.LEFT);
  }
  set(duration: number): void {
    this.left_ = duration;
  }
  extend(duration: number): void {
    this.left_ = Math.fround(this.left_ + duration);
  }
  act(): boolean {
    if (Dungeon.level.map_[this.target.pos] === Terrain.GRASS) {
      Level.set$int$int(this.target.pos, Terrain.EMBERS);
      GameScene.updateMap$int(this.target.pos);
    }
    this.spend(Actor.TICK);
    this.left_ = Math.fround(this.left_ - Actor.TICK);
    if (this.left_ <= Math.fround(0)) {
      this.detach();
    }
    return true;
  }
  proc(enemy: Char): void {
    if (Random.Int$int(2) === 0) {
      Buff.affect$Char$Class(enemy, $J.cls(Burning)).reignite$Char(enemy);
    }
    enemy.sprite_.emitter().burst(FlameParticle.FACTORY, 2);
  }
  icon(): number {
    return BuffIndicator.IMBUE;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(2, 0.75, 0);
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(FireImbue.DURATION - this.left_)) / FireImbue.DURATION));
  }
  iconTextDisplay(): string {
    return String($J.d2i(this.left_));
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [this.dispTurns$float(this.left_)]);
  }
  attachTo(target: Char): boolean {
    if (super.attachTo(target)) {
      Buff.detach(target, $J.cls(Burning));
      return true;
    } else {
      return false;
    }
  }
}

$J.define(FireImbue, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FireImbue', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_FireImbue' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Burning = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Burning');
  FlameParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.FlameParticle');
  Level = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  Random = $J.load('com.watabou.utils.Random');
});
