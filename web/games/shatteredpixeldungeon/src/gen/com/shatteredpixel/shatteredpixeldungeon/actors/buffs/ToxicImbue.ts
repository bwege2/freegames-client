// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/ToxicImbue.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Actor, Blob, ToxicGas, Buff$buffType, Poison, Messages, GameScene, BuffIndicator, PathFinder;

export class ToxicImbue extends Buff {
  static readonly DURATION: number = 50;
  left_: number = 0;
  static readonly LEFT: string = 'left';
  _ToxicImbue(): this {
    this._Buff();
    this.type_ = Buff$buffType.POSITIVE;
    this.announced = true;
    this.immunities_.add($J.cls(ToxicGas));
    this.immunities_.add($J.cls(Poison));
    return this;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$float(ToxicImbue.LEFT, this.left_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.left_ = bundle.getFloat(ToxicImbue.LEFT);
  }
  set(duration: number): void {
    this.left_ = duration;
  }
  extend(duration: number): void {
    this.left_ = Math.fround(this.left_ + duration);
  }
  act(): boolean {
    if (this.left_ > Math.fround(0)) {
      let centerVolume = 6;
      for (let i of PathFinder.NEIGHBOURS8) {
        if (!(Dungeon.level.solid[(this.target.pos + i) | 0])) {
          GameScene.add$Blob(Blob.seed$int$int$Class((this.target.pos + i) | 0, 6, $J.cls(ToxicGas)));
        } else {
          centerVolume = (centerVolume + 6) | 0;
        }
      }
      GameScene.add$Blob(Blob.seed$int$int$Class(this.target.pos, centerVolume, $J.cls(ToxicGas)));
    }
    this.spend(Actor.TICK);
    this.left_ = Math.fround(this.left_ - Actor.TICK);
    if (this.left_ <= Math.fround(-5)) {
      this.detach();
    }
    return true;
  }
  icon(): number {
    return this.left_ > Math.fround(0) ? BuffIndicator.IMBUE : BuffIndicator.NONE;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(1, 1.5, 0);
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(ToxicImbue.DURATION - this.left_)) / ToxicImbue.DURATION));
  }
  iconTextDisplay(): string {
    return String($J.d2i(this.left_));
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [this.dispTurns$float(this.left_)]);
  }
  attachTo(target: Char): boolean {
    if (super.attachTo(target)) {
      Buff.detach(target, $J.cls(Poison));
      return true;
    } else {
      return false;
    }
  }
}

$J.define(ToxicImbue, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ToxicImbue', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_ToxicImbue' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Blob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob');
  ToxicGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.ToxicGas');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Poison = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Poison');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
