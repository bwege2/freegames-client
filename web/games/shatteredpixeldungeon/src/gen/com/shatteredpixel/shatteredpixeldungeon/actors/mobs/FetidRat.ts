// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/FetidRat.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Rat } from './Rat.ts';
import { Mob$Wandering } from './Mob.ts';

let Dungeon, Statistics, Char$Property, Blob, StenchGas, Buff, Ooze, Ghost$Quest, GameScene, FetidRatSprite, PathFinder, Random;

export class FetidRat extends Rat {
  _FetidRat(): this {
    this._Rat();
    this.spriteClass = $J.cls(FetidRatSprite);
    this.HP = this.HT = 20;
    this.defenseSkill_ = 5;
    this.EXP = 4;
    this.WANDERING = new FetidRat$Wandering().$o(this)._FetidRat$Wandering();
    this.state_ = this.WANDERING;
    this.properties_.add(Char$Property.MINIBOSS);
    this.properties_.add(Char$Property.DEMONIC);
    this.immunities_.add($J.cls(StenchGas));
    return this;
  }
  attackSkill(target: Char): number {
    return 12;
  }
  drRoll(): number {
    return (super.drRoll() + Random.NormalIntRange(0, 2)) | 0;
  }
  attackProc(enemy: Char, damage: number): number {
    damage = super.attackProc(enemy, damage);
    if (Random.Int$int(3) === 0) {
      Buff.affect$Char$Class(enemy, $J.cls(Ooze)).set(Ooze.DURATION);
      if (enemy === Dungeon.hero && !Dungeon.level.water[enemy.pos]) {
        Statistics.questScores[0] = (Statistics.questScores[0] - 50) | 0;
      }
    }
    return damage;
  }
  defenseProc(enemy: Char, damage: number): number {
    GameScene.add$Blob(Blob.seed$int$int$Class(this.pos, 20, $J.cls(StenchGas)));
    return super.defenseProc(enemy, damage);
  }
  die(cause: any): void {
    super.die(cause);
    Ghost$Quest.process();
  }
}

export class FetidRat$Wandering extends Mob$Wandering {
  _FetidRat$Wandering(): this {
    this._Mob$Wandering();
    return this;
  }
  randomDestination(): number {
    let pos1 = super.randomDestination();
    let pos2 = super.randomDestination();
    PathFinder.buildDistanceMap$int$booleanArr(Dungeon.hero.pos, Dungeon.level.passable);
    if (PathFinder.distance[pos2] < PathFinder.distance[pos1]) {
      return pos2;
    } else {
      return pos1;
    }
  }
}

$J.define(FetidRat, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.FetidRat', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Rat', ctors: { '': '_FetidRat' } });
$J.define(FetidRat$Wandering, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.FetidRat$Wandering', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Wandering', ctors: { '': '_FetidRat$Wandering' }, inner: true });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Blob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob');
  StenchGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.StenchGas');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Ooze = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Ooze');
  Ghost$Quest = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Ghost$Quest');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  FetidRatSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.FetidRatSprite');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
