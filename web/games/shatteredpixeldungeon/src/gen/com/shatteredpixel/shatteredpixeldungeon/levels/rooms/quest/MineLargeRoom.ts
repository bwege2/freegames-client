// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/MineLargeRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../../jre/index.ts';
import { CaveRoom } from '../standard/CaveRoom.ts';

let CrystalGuardian, FungalSentry, GnollGuard, GnollSapper, Blacksmith$Quest, Terrain, Painter, Room$Door$Type, SecretRoom, GnollRockfallTrap, GameMath, PathFinder, Point, Random;

export class MineLargeRoom extends CaveRoom {
  _MineLargeRoom(): this {
    this._CaveRoom();
    return this;
  }
  sizeCatProbs(): number[] {
    return [0, 1, 0];
  }
  minHeight(): number {
    return 11;
  }
  minWidth(): number {
    return 11;
  }
  fill(): number {
    return Math.fround(0.55);
  }
  mobSpawnWeight(): number {
    return 1;
  }
  paint(level: Level): void {
    super.paint(level);
    if (Blacksmith$Quest.Type() === Blacksmith$Quest.CRYSTAL) {
      Painter.fillEllipse$Level$Rect$int$int(level, this, 3, Terrain.MINE_CRYSTAL);
      Painter.fillEllipse$Level$Rect$int$int(level, this, 4, Terrain.EMPTY);
      let p = this.random$int(5);
      let internalcells = new ArrayList();
      this.findInternalCells(level, level.pointToCell(p), internalcells);
      for (const $it0 = internalcells.iterator(); $it0.hasNext(); ) {
        let i = $it0.next();
        for (let j of PathFinder.CIRCLE8) {
          if (!internalcells.contains((i + j) | 0) && (level.map_[(i + j) | 0]) !== Terrain.MINE_CRYSTAL) {
            level.map_[i] = Terrain.MINE_CRYSTAL;
            break;
          }
        }
      }
      for (let i = 0; i < $J.idiv(Math.imul(this.width(), this.height()), 4); i++) {
        let r = this.random$int(1);
        if (level.map_[level.pointToCell(r)] !== Terrain.WALL) {
          Painter.set$Level$Point$int(level, r, Terrain.MINE_CRYSTAL);
        }
      }
      let m = new CrystalGuardian()._CrystalGuardian();
      m.pos = level.pointToCell(p);
      level.mobs.add(m);
      Painter.set$Level$Point$int(level, p, Terrain.EMPTY);
    } else if (Blacksmith$Quest.Type() === Blacksmith$Quest.GNOLL) {
      Painter.fillEllipse$Level$Rect$int$int(level, this, 3, Terrain.EMPTY);
      for (const $it1 = this.connected_.keySet().iterator(); $it1.hasNext(); ) {
        let n = $it1.next();
        if (!(n instanceof SecretRoom) && this.connected_.get(n).type_ === Room$Door$Type.REGULAR) {
          if (Random.Int$int(10) === 0) {
            this.connected_.get(n).set$Type(Room$Door$Type.EMPTY);
          } else {
            this.connected_.get(n).set$Type(Room$Door$Type.WALL);
          }
          this.connected_.get(n).lockTypeChanges(true);
        }
      }
      let doors = new ArrayList();
      for (const $it2 = this.connected_.values().iterator(); $it2.hasNext(); ) {
        let d = $it2.next();
        if (d.type_ === Room$Door$Type.WALL) {
          doors.add(d);
        }
      }
      let sapperPos = level.pointToCell(this.random$int(5));
      let s = new GnollSapper()._GnollSapper();
      s.pos = sapperPos;
      s.spawnPos = s.pos;
      level.mobs.add(s);
      let guardPos: number;
      do {
        guardPos = (sapperPos + PathFinder.NEIGHBOURS8[Random.Int$int(8)]) | 0;
      } while (level.map_[guardPos] !== Terrain.EMPTY);
      let g = new GnollGuard()._GnollGuard();
      g.pos = guardPos;
      level.mobs.add(g);
      s.linkPartner(g);
      let barricades = Random.Int$int(2) === 0 ? 2 : 1;
      for (let i = 0; i < barricades; i++) {
        let barricadePos = (sapperPos + PathFinder.NEIGHBOURS8[Random.Int$int(8)]) | 0;
        if (level.map_[barricadePos] === Terrain.EMPTY && barricadePos !== guardPos) {
          Painter.set$Level$int$int(level, barricadePos, Terrain.BARRICADE);
        } else {
          i--;
        }
      }
      let traps = this.square() > 150 ? 3 : 2;
      for (let i = 0; i < traps; i++) {
        let r: Point;
        do {
          r = this.random$int(2);
        } while (level.map_[level.pointToCell(r)] !== Terrain.EMPTY || level.pointToCell(r) === sapperPos || level.pointToCell(r) === guardPos);
        Painter.set$Level$Point$int(level, r, Terrain.TRAP);
        level.setTrap(new GnollRockfallTrap()._GnollRockfallTrap().reveal(), level.pointToCell(r));
      }
      for (const $it3 = this.getPoints().iterator(); $it3.hasNext(); ) {
        let p = $it3.next();
        let cell = level.pointToCell(p);
        if (level.map_[cell] === Terrain.EMPTY && cell !== sapperPos && cell !== guardPos) {
          let dist = 1000;
          for (const $it4 = doors.iterator(); $it4.hasNext(); ) {
            let d = $it4.next();
            dist = Math.min(dist, Point.distance(p, d));
          }
          dist = GameMath.gate(1, Math.fround(dist - 0.5), 4);
          let val = Random.Float$float(Math.fround($J.pow(dist, 2)));
          if (val <= 0.75 || dist <= Math.fround(1)) {
            Painter.set$Level$int$int(level, cell, Terrain.MINE_BOULDER);
          } else if (val <= 5 && dist <= Math.fround(3)) {
            Painter.set$Level$int$int(level, cell, Terrain.EMPTY_DECO);
          }
        }
      }
    } else if (Blacksmith$Quest.Type() === Blacksmith$Quest.FUNGI) {
      for (const $it5 = this.getPoints().iterator(); $it5.hasNext(); ) {
        let p = $it5.next();
        let cell = level.pointToCell(p);
        if (level.map_[cell] === Terrain.EMPTY) {
          level.map_[cell] = Terrain.HIGH_GRASS;
        }
      }
      Painter.fillEllipse$Level$Rect$int$int(level, this, 3, Terrain.GRASS);
      for (let i = 0; i < $J.idiv(Math.imul(this.width(), this.height()), 6); i++) {
        let r = this.random$int(1);
        if (level.map_[level.pointToCell(r)] !== Terrain.WALL) {
          Painter.set$Level$Point$int(level, r, Terrain.HIGH_GRASS);
        }
      }
      let p = this.center();
      let m = new FungalSentry()._FungalSentry();
      m.pos = level.pointToCell(p);
      level.mobs.add(m);
      Painter.set$Level$Point$int(level, p, Terrain.GRASS);
      p.y--;
      Painter.set$Level$Point$int(level, p, Terrain.GRASS);
    } else {
      Painter.fillEllipse$Level$Rect$int$int(level, this, 3, Terrain.EMPTY);
    }
  }
  findInternalCells(level: Level, cell: number, internalCells: ArrayList<number>): void {
    for (let i of PathFinder.NEIGHBOURS4) {
      if (!internalCells.contains((cell + i) | 0) && (level.map_[(cell + i) | 0]) !== Terrain.MINE_CRYSTAL) {
        internalCells.add((cell + i) | 0);
        this.findInternalCells(level, (cell + i) | 0, internalCells);
      }
    }
  }
}

$J.define(MineLargeRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.MineLargeRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.CaveRoom', ctors: { '': '_MineLargeRoom' } });
$J.module(() => {
  CrystalGuardian = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.CrystalGuardian');
  FungalSentry = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.FungalSentry');
  GnollGuard = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollGuard');
  GnollSapper = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollSapper');
  Blacksmith$Quest = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Blacksmith$Quest');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  SecretRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretRoom');
  GnollRockfallTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.GnollRockfallTrap');
  GameMath = $J.load('com.watabou.utils.GameMath');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Point = $J.load('com.watabou.utils.Point');
  Random = $J.load('com.watabou.utils.Random');
});
