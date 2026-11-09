// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/traps/GeyserTrap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Trap } from './Trap.ts';

let Assets$Sounds, Dungeon, Actor, Char, Char$Property, Fire, Buff, Burning, Mob, Splash, WandOfBlastWave, Trap$HazardAssistTracker, Ballistica, DungeonTilemap, Sample, BArray, PathFinder, PointF, Random;

export class GeyserTrap extends Trap {
  centerKnockBackDirection: number = 0;
  source_: any = null;
  _GeyserTrap(): this {
    this._Trap();
    this.color_ = Trap.TEAL;
    this.shape = Trap.DIAMOND;
    this.centerKnockBackDirection = -1;
    this.source_ = this;
    return this;
  }
  activate(): void {
    Splash.at$PointF$float$float$int$int$float(DungeonTilemap.tileCenterToWorld(this.pos), Math.fround(Math.fround(-PointF.PI) / 2), Math.fround(PointF.PI / 2), 6013411, 100, Math.fround(0.01));
    Sample.INSTANCE.play$Object$float$float(Assets$Sounds.GAS, 1, 0.75);
    let fire = Dungeon.level.blobs.get($J.cls(Fire));
    PathFinder.buildDistanceMap$int$booleanArr$int(this.pos, BArray.not(Dungeon.level.solid, null), 2);
    for (let i = 0; i < PathFinder.distance.length; i++) {
      if (PathFinder.distance[i] === 2 && Random.Int$int(3) > 0) {
        Dungeon.level.setCellToWater(true, i);
        if (fire != null) {
          fire.clear(i);
        }
      } else if (PathFinder.distance[i] < 2) {
        Dungeon.level.setCellToWater(true, i);
        if (fire != null) {
          fire.clear(i);
        }
      }
    }
    for (let i of PathFinder.NEIGHBOURS8) {
      let ch = Actor.findChar((this.pos + i) | 0);
      if (ch != null) {
        if (this.source_ === this && ch instanceof Mob) {
          Buff.prolong(ch, $J.cls(Trap$HazardAssistTracker), Trap$HazardAssistTracker.DURATION);
        }
        if (Char.hasProp(ch, Char$Property.FIERY)) {
          let dmg = Random.NormalIntRange((5 + this.scalingDepth()) | 0, (10 + Math.imul(this.scalingDepth(), 2)) | 0);
          dmg = $J.d2i(Math.fround(dmg * Math.fround(0.67)));
          if (!ch.isImmune($J.cls(GeyserTrap))) {
            ch.damage(dmg, this);
          }
        }
        if (ch.isAlive()) {
          if (ch.buff($J.cls(Burning)) != null) {
            ch.buff($J.cls(Burning)).detach();
          }
          let trajectory = new Ballistica()._Ballistica(this.pos, ch.pos, Ballistica.STOP_TARGET);
          trajectory = new Ballistica()._Ballistica(trajectory.collisionPos, trajectory.path.get((trajectory.path.size() - 1) | 0), Ballistica.PROJECTILE);
          WandOfBlastWave.throwChar(ch, trajectory, 2, true, true, this.source_);
        }
      }
    }
    let ch = Actor.findChar(this.pos);
    if (ch != null) {
      if (this.source_ === this && ch instanceof Mob) {
        Buff.prolong(ch, $J.cls(Trap$HazardAssistTracker), Trap$HazardAssistTracker.DURATION);
      }
      let targetpos = -1;
      if (this.centerKnockBackDirection !== -1) {
        targetpos = this.centerKnockBackDirection;
      } else if (ch === Dungeon.hero) {
        let candidates = new ArrayList();
        for (let i of PathFinder.NEIGHBOURS8) {
          if (!(Dungeon.level.avoid[(this.pos + i) | 0]) && !(Dungeon.level.avoid[(this.pos + i + i) | 0])) {
            candidates.add((this.pos + i) | 0);
          }
        }
        if (!candidates.isEmpty()) {
          targetpos = Random.element$Collection(candidates);
        }
      } else {
        targetpos = (this.pos + PathFinder.NEIGHBOURS8[Random.Int$int(8)]) | 0;
      }
      if (Char.hasProp(ch, Char$Property.FIERY)) {
        let dmg = Random.NormalIntRange((5 + this.scalingDepth()) | 0, (10 + Math.imul(this.scalingDepth(), 2)) | 0);
        if (!ch.isImmune($J.cls(GeyserTrap))) {
          ch.damage(dmg, this);
        }
      }
      if (ch.isAlive() && targetpos !== -1) {
        if (ch.buff($J.cls(Burning)) != null) {
          ch.buff($J.cls(Burning)).detach();
        }
        let trajectory = new Ballistica()._Ballistica(this.pos, targetpos, Ballistica.MAGIC_BOLT);
        WandOfBlastWave.throwChar(ch, trajectory, 2, true, true, this.source_);
      }
    }
  }
}

$J.define(GeyserTrap, 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.GeyserTrap', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap', ctors: { '': '_GeyserTrap' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Fire = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Fire');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Burning = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Burning');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  Splash = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Splash');
  WandOfBlastWave = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfBlastWave');
  Trap$HazardAssistTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap$HazardAssistTracker');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  PointF = $J.load('com.watabou.utils.PointF');
  Random = $J.load('com.watabou.utils.Random');
});
