// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/traps/FrostTrap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Trap } from './Trap.ts';

let Assets$Sounds, Dungeon, Actor, Blob, Freezing, Buff, Mob, Splash, Trap$HazardAssistTracker, GameScene, Sample, BArray, PathFinder;

export class FrostTrap extends Trap {
  _FrostTrap(): this {
    this._Trap();
    this.color_ = Trap.WHITE;
    this.shape = Trap.STARS;
    return this;
  }
  activate(): void {
    if (Dungeon.level.heroFOV[this.pos]) {
      Splash.at$int$int$int(this.pos, -5056769, 5);
      Sample.INSTANCE.play$Object(Assets$Sounds.SHATTER);
    }
    PathFinder.buildDistanceMap$int$booleanArr$int(this.pos, BArray.not(Dungeon.level.solid, null), 2);
    for (let i = 0; i < PathFinder.distance.length; i++) {
      if (PathFinder.distance[i] < 2147483647) {
        GameScene.add$Blob(Blob.seed$int$int$Class(i, 20, $J.cls(Freezing)));
        if (Actor.findChar(i) instanceof Mob) {
          Buff.prolong(Actor.findChar(i), $J.cls(Trap$HazardAssistTracker), Trap$HazardAssistTracker.DURATION);
        }
      }
    }
  }
}

$J.define(FrostTrap, 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.FrostTrap', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap', ctors: { '': '_FrostTrap' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Blob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob');
  Freezing = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Freezing');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  Splash = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Splash');
  Trap$HazardAssistTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap$HazardAssistTracker');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
