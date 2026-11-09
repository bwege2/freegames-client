// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/traps/GnollRockfallTrap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { RockfallTrap } from './RockfallTrap.ts';

let Assets$Sounds, Badges, Dungeon, Actor, Buff, Paralysis, GnollGeomancer, GnollGuard, Mob, CellEmitter, Speck, Level, MiningLevel, Terrain, Trap$HazardAssistTracker, Messages, GameScene, PixelScene, GLog, Sample, BArray, PathFinder, Random;

export class GnollRockfallTrap extends RockfallTrap {
  _GnollRockfallTrap(): this {
    this._RockfallTrap();
    return this;
  }
  activate(): void {
    let rockCells = new ArrayList();
    PathFinder.buildDistanceMap$int$booleanArr$int(this.pos, BArray.not(Dungeon.level.solid, null), 2);
    for (let i = 0; i < PathFinder.distance.length; i++) {
      if (PathFinder.distance[i] < 2147483647) {
        if (Dungeon.level instanceof MiningLevel) {
          let barricade = false;
          for (let j of PathFinder.NEIGHBOURS9) {
            if ((Dungeon.level.map_[(i + j) | 0]) === Terrain.BARRICADE) {
              barricade = true;
            }
          }
          if (barricade) {
            continue;
          }
        }
        rockCells.add(i);
      }
    }
    let seen = false;
    for (const $it0 = rockCells.iterator(); $it0.hasNext(); ) {
      let cell = $it0.next();
      if (Dungeon.level.heroFOV[cell]) {
        (CellEmitter.get((cell - Dungeon.level.width()) | 0)).start(Speck.factory$int(Speck.ROCK), Math.fround(0.07), 10);
        seen = true;
      }
      let ch = Actor.findChar(cell);
      if (ch != null && ch.isAlive() && !(ch instanceof GnollGeomancer)) {
        if (ch instanceof Mob) {
          Buff.prolong(ch, $J.cls(Trap$HazardAssistTracker), Trap$HazardAssistTracker.DURATION);
        }
        let damage = Random.NormalIntRange(6, 12);
        ch.damage(Math.max(damage, 0), this);
        Buff.prolong(ch, $J.cls(Paralysis), Math.fround(ch instanceof GnollGuard ? 10 : 3));
        if (!ch.isAlive() && ch === Dungeon.hero) {
          Dungeon.fail(this);
          GLog.n(Messages.get$Object$String$ObjectArr(this, 'ondeath', []), []);
          if (this.reclaimed) {
            Badges.validateDeathFromFriendlyMagic();
          }
        }
      } else if (ch == null && Dungeon.level instanceof MiningLevel && Dungeon.level.traps.get(cell) == null && Dungeon.level.plants.get(cell) == null && Random.Int$int(2) === 0) {
        Level.set$int$int(cell, Terrain.MINE_BOULDER);
        GameScene.updateMap$int(cell);
      }
    }
    if (seen) {
      PixelScene.shake(3, Math.fround(0.7));
      Sample.INSTANCE.play$Object(Assets$Sounds.ROCKS);
    }
  }
}

$J.define(GnollRockfallTrap, 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.GnollRockfallTrap', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.RockfallTrap', ctors: { '': '_GnollRockfallTrap' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Paralysis = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Paralysis');
  GnollGeomancer = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollGeomancer');
  GnollGuard = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollGuard');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Level = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level');
  MiningLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.MiningLevel');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Trap$HazardAssistTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap$HazardAssistTracker');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
