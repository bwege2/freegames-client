// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/RotHeart.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Mob } from './Mob.ts';

let Dungeon, Statistics, Char$Property, Blob, ToxicGas, Burning, RotLasher, Bestiary, Rotberry$Seed, GameScene, RotHeartSprite, PathFinder, Random;

export class RotHeart extends Mob {
  _RotHeart(): this {
    this._Mob();
    this.spriteClass = $J.cls(RotHeartSprite);
    this.HP = this.HT = 80;
    this.defenseSkill_ = 0;
    this.EXP = 4;
    this.state_ = this.PASSIVE;
    this.properties_.add(Char$Property.IMMOVABLE);
    this.properties_.add(Char$Property.MINIBOSS);
    this.properties_.add(Char$Property.STATIC);
    this.immunities_.add($J.cls(ToxicGas));
    return this;
  }
  act(): boolean {
    this.alerted = false;
    return super.act();
  }
  damage(dmg: number, src: any): void {
    if (src instanceof Burning) {
      this.destroy();
      this.sprite_.die();
    } else {
      super.damage(dmg, src);
    }
  }
  defenseProc(enemy: Char, damage: number): number {
    let openNearby = 0;
    for (let i of PathFinder.NEIGHBOURS8) {
      if (!(Dungeon.level.solid[(this.pos + i) | 0])) {
        openNearby++;
      }
    }
    GameScene.add$Blob(Blob.seed$int$int$Class(this.pos, (5 + Math.imul(3, openNearby)) | 0, $J.cls(ToxicGas)));
    return super.defenseProc(enemy, damage);
  }
  beckon(cell: number): void {
  }
  getCloser(target: number): boolean {
    return false;
  }
  destroy(): void {
    super.destroy();
    Bestiary.skipCountingEncounters = true;
    for (let mob of $J.toArrayInto(Dungeon.level.mobs.toArray(), $J.newArray(Dungeon.level.mobs.size(), null))) {
      if (mob instanceof RotLasher) {
        mob.die(null);
      }
    }
    Bestiary.skipCountingEncounters = false;
  }
  die(cause: any): void {
    super.die(cause);
    Dungeon.level.drop(new Rotberry$Seed()._Rotberry$Seed(), this.pos).sprite_.drop$();
    Statistics.questScores[1] = (Statistics.questScores[1] + 2000) | 0;
  }
  reset(): boolean {
    return true;
  }
  damageRoll(): number {
    return 0;
  }
  attackSkill(target: Char): number {
    return 0;
  }
  drRoll(): number {
    return (super.drRoll() + Random.NormalIntRange(0, 5)) | 0;
  }
}

$J.define(RotHeart, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.RotHeart', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_RotHeart' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Blob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob');
  ToxicGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.ToxicGas');
  Burning = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Burning');
  RotLasher = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.RotLasher');
  Bestiary = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Bestiary');
  Rotberry$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Rotberry$Seed');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  RotHeartSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.RotHeartSprite');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
