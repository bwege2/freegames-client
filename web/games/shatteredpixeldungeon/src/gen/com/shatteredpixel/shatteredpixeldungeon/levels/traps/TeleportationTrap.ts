// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/traps/TeleportationTrap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Dungeon, Actor, Buff, Mob, CellEmitter, Speck, Heap$Type, Honeypot$ShatteredPot, ScrollOfTeleportation, Trap$HazardAssistTracker, Sample, PathFinder;

export class TeleportationTrap extends Trap {
  _TeleportationTrap(): this {
    this._Trap();
    this.color_ = Trap.TEAL;
    this.shape = Trap.DOTS;
    return this;
  }
  activate(): void {
    for (let i of PathFinder.NEIGHBOURS9) {
      let ch = Actor.findChar((this.pos + i) | 0);
      if (ch != null) {
        if (ScrollOfTeleportation.teleportChar$Char(ch)) {
          if (ch instanceof Mob && (ch).state_ === (ch).HUNTING) {
            (ch).state_ = (ch).WANDERING;
            Buff.prolong(ch, $J.cls(Trap$HazardAssistTracker), Trap$HazardAssistTracker.DURATION);
          }
        }
      }
      let heap = Dungeon.level.heaps.get((this.pos + i) | 0);
      if (heap != null && heap.type_ === Heap$Type.HEAP) {
        let cell = Dungeon.level.randomRespawnCell(null);
        let item = heap.pickUp();
        if (cell !== -1) {
          Dungeon.level.drop(item, cell);
          if (item instanceof Honeypot$ShatteredPot) {
            (item).movePot(this.pos, cell);
          }
          Sample.INSTANCE.play$Object(Assets$Sounds.TELEPORT);
          CellEmitter.get(this.pos).burst(Speck.factory$int(Speck.LIGHT), 4);
        }
      }
    }
  }
}

$J.define(TeleportationTrap, 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.TeleportationTrap', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap', ctors: { '': '_TeleportationTrap' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  Honeypot$ShatteredPot = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Honeypot$ShatteredPot');
  ScrollOfTeleportation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation');
  Trap$HazardAssistTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap$HazardAssistTracker');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
