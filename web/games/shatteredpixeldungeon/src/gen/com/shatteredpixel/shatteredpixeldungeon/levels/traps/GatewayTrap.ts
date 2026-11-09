// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/traps/GatewayTrap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Dungeon, Actor, Char, Char$Property, Buff, Mob, CellEmitter, Speck, Heap$Type, Honeypot$ShatteredPot, ScrollOfTeleportation, Trap$HazardAssistTracker, Sample, PathFinder, Random;

export class GatewayTrap extends Trap {
  telePos: number = 0;
  static readonly TELE_POS: string = 'tele_pos';
  _GatewayTrap(): this {
    this._Trap();
    this.color_ = Trap.TEAL;
    this.shape = Trap.CROSSHAIR;
    this.disarmedByActivation = false;
    this.avoidsClosedSpaces = true;
    this.telePos = -1;
    return this;
  }
  activate(): void {
    if (this.telePos === -1) {
      for (let i of PathFinder.NEIGHBOURS9) {
        let ch = Actor.findChar((this.pos + i) | 0);
        if (ch != null) {
          if (ScrollOfTeleportation.teleportChar$Char(ch)) {
            if (ch instanceof Mob && (ch).state_ === (ch).HUNTING) {
              (ch).state_ = (ch).WANDERING;
              Buff.prolong(ch, $J.cls(Trap$HazardAssistTracker), Trap$HazardAssistTracker.DURATION);
            }
            this.telePos = ch.pos;
            break;
          }
        }
        let heap = Dungeon.level.heaps.get((this.pos + i) | 0);
        if (heap != null && heap.type_ === Heap$Type.HEAP) {
          let cell = Dungeon.level.randomRespawnCell(null);
          let item = heap.pickUp();
          if (cell !== -1) {
            Dungeon.level.drop(item, cell);
            this.telePos = cell;
            break;
          }
        }
      }
    }
    if (this.telePos !== -1) {
      let telePositions = new ArrayList();
      for (let i of PathFinder.NEIGHBOURS8) {
        if (Dungeon.level.passable[(this.telePos + i) | 0] && (Actor.findChar((this.telePos + i) | 0)) == null) {
          telePositions.add((this.telePos + i) | 0);
        }
      }
      Random.shuffle$List(telePositions);
      if (Dungeon.level.passable[this.telePos] && Actor.findChar(this.telePos) == null) {
        telePositions.add(0, this.telePos);
      }
      let largeCharPositions = new ArrayList();
      for (const $it0 = telePositions.iterator(); $it0.hasNext(); ) {
        let pos = $it0.next();
        if (Dungeon.level.openSpace[pos]) {
          largeCharPositions.add(pos);
        }
      }
      for (let i of PathFinder.NEIGHBOURS9) {
        let ch = Actor.findChar((this.pos + i) | 0);
        if (ch != null && !Char.hasProp(ch, Char$Property.IMMOVABLE)) {
          let newPos = -1;
          if (Char.hasProp(ch, Char$Property.LARGE)) {
            if (!largeCharPositions.isEmpty()) {
              newPos = largeCharPositions.get(0);
            }
          } else {
            if (!telePositions.isEmpty()) {
              newPos = telePositions.get(0);
            }
          }
          if (newPos !== -1) {
            telePositions.remove(newPos);
            largeCharPositions.remove(newPos);
            if (ScrollOfTeleportation.teleportToLocation(ch, newPos)) {
              if (ch instanceof Mob && (ch).state_ === (ch).HUNTING) {
                (ch).state_ = (ch).WANDERING;
              }
            }
          }
        }
        let heap = Dungeon.level.heaps.get((this.pos + i) | 0);
        if (heap != null && heap.type_ === Heap$Type.HEAP) {
          let item = heap.pickUp();
          Dungeon.level.drop(item, this.telePos);
          if (item instanceof Honeypot$ShatteredPot) {
            (item).movePot(this.pos, this.telePos);
          }
          Sample.INSTANCE.play$Object(Assets$Sounds.TELEPORT);
          CellEmitter.get(this.pos).burst(Speck.factory$int(Speck.LIGHT), 4);
        }
      }
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(GatewayTrap.TELE_POS, this.telePos);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.telePos = bundle.getInt(GatewayTrap.TELE_POS);
  }
}

$J.define(GatewayTrap, 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.GatewayTrap', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap', ctors: { '': '_GatewayTrap' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
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
  Random = $J.load('com.watabou.utils.Random');
});
