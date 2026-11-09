// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/traps/FlockTrap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Dungeon, Actor, Buff, Mob, Sheep, CellEmitter, Speck, Bestiary, Trap$HazardAssistTracker, GameScene, Sample, BArray, PathFinder;

export class FlockTrap extends Trap {
  _FlockTrap(): this {
    this._Trap();
    this.color_ = Trap.WHITE;
    this.shape = Trap.WAVES;
    return this;
  }
  activate(): void {
    PathFinder.buildDistanceMap$int$booleanArr$int(this.pos, BArray.not(Dungeon.level.solid, null), 2);
    let spawnPoints = new ArrayList();
    for (let i = 0; i < PathFinder.distance.length; i++) {
      if (PathFinder.distance[i] < 2147483647) {
        spawnPoints.add(i);
      }
    }
    for (const $it0 = spawnPoints.iterator(); $it0.hasNext(); ) {
      let i = $it0.next();
      let t: Trap;
      if (Dungeon.level.insideMap(i) && Actor.findChar(i) == null && !(Dungeon.level.pit[i])) {
        let sheep = new Sheep()._Sheep();
        sheep.initialize(6);
        sheep.pos = i;
        GameScene.add$Mob(sheep);
        CellEmitter.get(i).burst(Speck.factory$int(Speck.WOOL), 4);
        if ((t = Dungeon.level.traps.get(i)) != null && t.active) {
          if (t.disarmedByActivation) {
            t.disarm();
          }
          t.reveal();
          Bestiary.setSeen(t.getClass());
          Bestiary.countEncounter(t.getClass());
          t.activate();
        }
        Dungeon.level.occupyCell(sheep);
      } else if (Actor.findChar(i) instanceof Mob) {
        Buff.prolong(Actor.findChar(i), $J.cls(Trap$HazardAssistTracker), Trap$HazardAssistTracker.DURATION);
      }
    }
    Sample.INSTANCE.play$Object(Assets$Sounds.PUFF);
    Sample.INSTANCE.play$Object(Assets$Sounds.SHEEP);
  }
}

$J.define(FlockTrap, 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.FlockTrap', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap', ctors: { '': '_FlockTrap' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  Sheep = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Sheep');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Bestiary = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Bestiary');
  Trap$HazardAssistTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap$HazardAssistTracker');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
