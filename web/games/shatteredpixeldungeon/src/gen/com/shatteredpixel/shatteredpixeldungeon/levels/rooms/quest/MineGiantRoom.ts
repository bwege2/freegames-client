// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/MineGiantRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Buff, CrystalSpire, FungalCore, GnollGeomancer, GnollGeomancer$RockArmor, Blacksmith$Quest, Terrain, Painter, Room$Door$Type, SecretRoom, GameMath, Point, Random, Rect;

export class MineGiantRoom extends CaveRoom {
  _MineGiantRoom(): this {
    this._CaveRoom();
    return this;
  }
  sizeCatProbs(): number[] {
    return [0, 0, 1];
  }
  fill(): number {
    return Math.fround(0.7);
  }
  mobSpawnWeight(): number {
    return 1;
  }
  paint(level: Level): void {
    super.paint(level);
    if (Blacksmith$Quest.Type() === Blacksmith$Quest.CRYSTAL) {
      Painter.fillEllipse$Level$Rect$int$int(level, this, 3, Terrain.EMPTY);
      for (let i = 0; i < $J.idiv(Math.imul(this.width(), this.height()), 2); i++) {
        let r = this.random$int(1);
        if (level.map_[level.pointToCell(r)] !== Terrain.WALL) {
          Painter.set$Level$Point$int(level, r, Terrain.MINE_CRYSTAL);
        }
      }
      let p = this.center();
      let m = new CrystalSpire()._CrystalSpire();
      m.pos = level.pointToCell(p);
      level.mobs.add(m);
      Painter.set$Level$Point$int(level, p, Terrain.EMPTY);
    } else if (Blacksmith$Quest.Type() === Blacksmith$Quest.GNOLL) {
      Painter.fillEllipse$Level$Rect$int$int(level, this, 3, Terrain.EMPTY);
      for (const $it0 = this.connected_.keySet().iterator(); $it0.hasNext(); ) {
        let n = $it0.next();
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
      for (const $it1 = this.connected_.values().iterator(); $it1.hasNext(); ) {
        let d = $it1.next();
        if (d.type_ === Room$Door$Type.WALL) {
          doors.add(d);
        }
      }
      for (const $it2 = this.getPoints().iterator(); $it2.hasNext(); ) {
        let p = $it2.next();
        let cell = level.pointToCell(p);
        if (level.map_[cell] === Terrain.EMPTY) {
          let dist = 1000;
          for (const $it3 = doors.iterator(); $it3.hasNext(); ) {
            let d = $it3.next();
            dist = Math.min(dist, Point.distance(p, d));
          }
          dist = GameMath.gate(1, Math.fround(dist - 0.5), Math.fround(3.1));
          let val = Random.Float$float(Math.fround($J.pow(dist, 2)));
          if (val <= 0.75 || dist <= Math.fround(1)) {
            Painter.set$Level$int$int(level, cell, Terrain.MINE_BOULDER);
          } else if (val <= 5 && dist <= Math.fround(3)) {
            Painter.set$Level$int$int(level, cell, Terrain.EMPTY_DECO);
          }
        }
      }
      let center = this.center();
      let centerArea = new Rect()._Rect$int$int$int$int((center.x - 2) | 0, (center.y - 2) | 0, (center.x + 3) | 0, (center.y + 3) | 0);
      Painter.fillEllipse$Level$Rect$int$int(level, centerArea, 0, Terrain.MINE_BOULDER);
      Painter.fill$Level$Rect$int$int(level, centerArea, 2, Terrain.EMPTY_DECO);
      let g = new GnollGeomancer()._GnollGeomancer();
      g.pos = level.pointToCell(center);
      Buff.affect$Char$Class(g, $J.cls(GnollGeomancer$RockArmor)).setShield(50);
      level.mobs.add(g);
    } else if (Blacksmith$Quest.Type() === Blacksmith$Quest.FUNGI) {
      Painter.fillEllipse$Level$Rect$int$int(level, this, 2, Terrain.HIGH_GRASS);
      Painter.fillEllipse$Level$Rect$int$int(level, this, 3, Terrain.GRASS);
      Painter.fillEllipse$Level$Rect$int$int(level, this, 4, Terrain.HIGH_GRASS);
      Painter.fillEllipse$Level$Rect$int$int(level, this, 5, Terrain.GRASS);
      let p = this.center();
      let m = new FungalCore()._FungalCore();
      m.pos = level.pointToCell(p);
      level.mobs.add(m);
    } else {
      Painter.fillEllipse$Level$Rect$int$int(level, this, 3, Terrain.EMPTY);
    }
  }
}

$J.define(MineGiantRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.MineGiantRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.CaveRoom', ctors: { '': '_MineGiantRoom' } });
$J.module(() => {
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  CrystalSpire = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.CrystalSpire');
  FungalCore = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.FungalCore');
  GnollGeomancer = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollGeomancer');
  GnollGeomancer$RockArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollGeomancer$RockArmor');
  Blacksmith$Quest = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Blacksmith$Quest');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  SecretRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretRoom');
  GameMath = $J.load('com.watabou.utils.GameMath');
  Point = $J.load('com.watabou.utils.Point');
  Random = $J.load('com.watabou.utils.Random');
  Rect = $J.load('com.watabou.utils.Rect');
});
