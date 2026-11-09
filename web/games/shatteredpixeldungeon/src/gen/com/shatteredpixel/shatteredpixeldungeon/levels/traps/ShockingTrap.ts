// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/traps/ShockingTrap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Dungeon, Actor, Blob, Electricity, Buff, Mob, Trap$HazardAssistTracker, GameScene, Sample, PathFinder;

export class ShockingTrap extends Trap {
  _ShockingTrap(): this {
    this._Trap();
    this.color_ = Trap.YELLOW;
    this.shape = Trap.DOTS;
    return this;
  }
  activate(): void {
    if (Dungeon.level.heroFOV[this.pos]) {
      Sample.INSTANCE.play$Object(Assets$Sounds.LIGHTNING);
    }
    for (let i of PathFinder.NEIGHBOURS9) {
      if (!(Dungeon.level.solid[(this.pos + i) | 0])) {
        GameScene.add$Blob(Blob.seed$int$int$Class((this.pos + i) | 0, 10, $J.cls(Electricity)));
      }
      if ((Actor.findChar((this.pos + i) | 0)) instanceof Mob) {
        Buff.prolong(Actor.findChar((this.pos + i) | 0), $J.cls(Trap$HazardAssistTracker), Trap$HazardAssistTracker.DURATION);
      }
    }
  }
}

$J.define(ShockingTrap, 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.ShockingTrap', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap', ctors: { '': '_ShockingTrap' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Blob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob');
  Electricity = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Electricity');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  Trap$HazardAssistTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap$HazardAssistTracker');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
