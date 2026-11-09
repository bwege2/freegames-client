// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Wraith.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../jre/index.ts';
import { Mob } from './Mob.ts';

let Dungeon, Actor, Char$Property, TormentedSpirit, ChallengeParticle, ShadowParticle, RatSkull, GameScene, WraithSprite, AlphaTweener, PathFinder, Random, Reflection;

export class Wraith extends Mob {
  static readonly SPAWN_DELAY: number = 2;
  level_: number = 0;
  static readonly LEVEL: string = 'level';
  _Wraith(): this {
    this._Mob();
    this.spriteClass = $J.cls(WraithSprite);
    this.HP = this.HT = 1;
    this.EXP = 0;
    this.maxLvl = -2;
    this.flying = true;
    this.properties_.add(Char$Property.UNDEAD);
    this.properties_.add(Char$Property.INORGANIC);
    return this;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(Wraith.LEVEL, this.level_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.level_ = bundle.getInt(Wraith.LEVEL);
    this.adjustStats(this.level_);
  }
  damageRoll(): number {
    return Random.NormalIntRange((1 + $J.idiv(this.level_, 2)) | 0, (2 + this.level_) | 0);
  }
  attackSkill(target: Char): number {
    return (10 + this.level_) | 0;
  }
  adjustStats(level: number): void {
    this.level_ = level;
    this.defenseSkill_ = Math.imul(this.attackSkill(null), 5);
    this.enemySeen = true;
  }
  spawningWeight(): number {
    return 0;
  }
  reset(): boolean {
    this.state_ = this.WANDERING;
    return true;
  }
  static spawnAround$int(pos: number): void {
    Wraith.spawnAround$int$Class(pos, null);
  }
  static spawnAround$int$Class(pos: number, wraithClass: JClass<Wraith>): void {
    for (let n of PathFinder.NEIGHBOURS4) {
      Wraith.spawnAt$int$Class$boolean((pos + n) | 0, wraithClass, false);
    }
  }
  static spawnAt$int(pos: number): Wraith {
    return Wraith.spawnAt$int$Class(pos, null);
  }
  static spawnAt$int$Class(pos: number, wraithClass: JClass<Wraith>): Wraith {
    return Wraith.spawnAt$int$Class$boolean(pos, wraithClass, true);
  }
  static spawnAt$int$Class$boolean(pos: number, wraithClass: JClass<Wraith>, allowAdjacent: boolean): Wraith {
    if (Dungeon.level.solid[pos] || Actor.findChar(pos) != null) {
      let candidates = new ArrayList();
      for (let i of PathFinder.NEIGHBOURS8) {
        if (!(Dungeon.level.solid[(pos + i) | 0]) && (Actor.findChar((pos + i) | 0)) == null) {
          candidates.add((pos + i) | 0);
        }
      }
      if (allowAdjacent && !candidates.isEmpty()) {
        pos = Random.element$Collection(candidates);
      } else {
        pos = -1;
      }
    }
    if (pos !== -1) {
      let w: Wraith;
      if (wraithClass == null) {
        let altChance = Math.fround(Math.fround(1 / 100) * RatSkull.exoticChanceMultiplier$());
        if (Random.Float$() < altChance) {
          w = new TormentedSpirit()._TormentedSpirit();
        } else {
          w = new Wraith()._Wraith();
        }
      } else {
        w = Reflection.newInstance(wraithClass);
      }
      w.adjustStats(Dungeon.scalingDepth());
      w.pos = pos;
      w.state_ = w.HUNTING;
      GameScene.add$Mob$float(w, Wraith.SPAWN_DELAY);
      Dungeon.level.occupyCell(w);
      w.sprite_.alpha$float(0);
      w.sprite_.parent.add$Gizmo(new AlphaTweener()._AlphaTweener(w.sprite_, 1, 0.5));
      if (w instanceof TormentedSpirit) {
        w.sprite_.emitter().burst(ChallengeParticle.FACTORY, 10);
      } else {
        w.sprite_.emitter().burst(ShadowParticle.CURSE, 5);
      }
      return w;
    } else {
      return null;
    }
  }
}

$J.define(Wraith, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Wraith', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_Wraith' }, meths: { 'spawnAt(int,java.lang.Class,boolean)': 'spawnAt$int$Class$boolean', 'spawnAt(int,java.lang.Class)': 'spawnAt$int$Class', 'spawnAt(int)': 'spawnAt$int', 'spawnAround(int,java.lang.Class)': 'spawnAround$int$Class', 'spawnAround(int)': 'spawnAround$int' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  TormentedSpirit = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.TormentedSpirit');
  ChallengeParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ChallengeParticle');
  ShadowParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShadowParticle');
  RatSkull = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.RatSkull');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  WraithSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.WraithSprite');
  AlphaTweener = $J.load('com.watabou.noosa.tweeners.AlphaTweener');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
