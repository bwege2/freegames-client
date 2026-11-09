// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/RitualSiteRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, Arrays } from '../../../../../../../jre/index.ts';
import { StandardRoom } from '../standard/StandardRoom.ts';
import { CustomTilemap } from '../../../tiles/CustomTilemap.ts';

let Assets$Environment, CeremonialCandle, Terrain, Painter, Room$Door$Type, Messages, Point, Random;

export class RitualSiteRoom extends StandardRoom {
  _RitualSiteRoom(): this {
    this._StandardRoom();
    return this;
  }
  minWidth(): number {
    return Math.max(super.minWidth(), 10);
  }
  minHeight(): number {
    return Math.max(super.minHeight(), 10);
  }
  paint(level: Level): void {
    for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
      let door = $it0.next();
      door.set$Type(Room$Door$Type.REGULAR);
    }
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    let validTopRowCells = $J.newArray(10, false);
    Arrays.fill(validTopRowCells, true);
    validTopRowCells[0] = validTopRowCells[3] = validTopRowCells[6] = validTopRowCells[9] = false;
    for (const $it1 = this.connected_.values().iterator(); $it1.hasNext(); ) {
      let d = $it1.next();
      if (d.y === this.top_) {
        (validTopRowCells[(d.x - this.left_) | 0]) = false;
      } else if (d.y <= ((this.top_ + 2) | 0)) {
        if (d.x === this.left_) {
          validTopRowCells[1] = false;
        } else {
          validTopRowCells[8] = false;
        }
      }
    }
    let topRow = new Point()._Point$int$int(this.left_, this.top_);
    let cageRow = Random.Int$int(2);
    for (let i = this.left_; i < this.right_; i = (i + 3) | 0) {
      topRow.x = i;
      Painter.drawInside(level, this, topRow, 2, Terrain.WALL);
      if (!(validTopRowCells[(topRow.x + 1 - this.left_) | 0]) && !(validTopRowCells[(topRow.x + 2 - this.left_) | 0])) {
        continue;
      }
      if (!(validTopRowCells[(topRow.x + 2 - this.left_) | 0])) {
        topRow.x = (topRow.x + 1) | 0;
      } else if (!(validTopRowCells[(topRow.x + 1 - this.left_) | 0])) {
        topRow.x = (topRow.x + 2) | 0;
      } else {
        topRow.x = (topRow.x + Random.IntRange(1, 2)) | 0;
      }
      (validTopRowCells[(topRow.x - this.left_) | 0]) = false;
      if (cageRow === 0) {
        Painter.drawInside(level, this, topRow, 2, Terrain.REGION_DECO);
      } else {
        let table = new RitualSiteRoom$Table()._RitualSiteRoom$Table();
        Painter.drawInside(level, this, topRow, 2, Terrain.CUSTOM_DECO);
        table.pos$int$int(topRow.x, (topRow.y + 1) | 0);
        level.customTerrain.add(table);
      }
      cageRow--;
    }
    let tries = 100;
    do {
      let i = Random.IntRange(1, 9);
      if (validTopRowCells[i]) {
        topRow.x = (this.left_ + i) | 0;
        Painter.drawInside(level, this, topRow, 1, Terrain.REGION_DECO);
        tries = 0;
      }
    } while (tries-- > 0);
    let vis = new RitualSiteRoom$RitualMarker()._RitualSiteRoom$RitualMarker();
    let c = this.center();
    c.y++;
    vis.pos$int$int((c.x - 2) | 0, (c.y - 2) | 0);
    level.customTiles.add(vis);
    Painter.fill$Level$int$int$int$int$int(level, (c.x - 1) | 0, (c.y - 1) | 0, 3, 3, Terrain.CUSTOM_DECO_EMPTY);
    level.addItemToSpawn(new CeremonialCandle()._CeremonialCandle());
    level.addItemToSpawn(new CeremonialCandle()._CeremonialCandle());
    level.addItemToSpawn(new CeremonialCandle()._CeremonialCandle());
    level.addItemToSpawn(new CeremonialCandle()._CeremonialCandle());
    CeremonialCandle.ritualPos = (c.x + (Math.imul(level.width(), c.y))) | 0;
  }
  canPlaceItem(p: Point, l: Level): boolean {
    return super.canPlaceItem(p, l) && l.distance(CeremonialCandle.ritualPos, l.pointToCell(p)) >= 2;
  }
  canPlaceCharacter(p: Point, l: Level): boolean {
    return super.canPlaceCharacter(p, l) && l.distance(CeremonialCandle.ritualPos, l.pointToCell(p)) >= 2;
  }
  canConnect$Point(p: Point): boolean {
    if (p.y === this.top_ && (p.x === ((this.left_ + 3) | 0) || p.x === ((this.left_ + 6) | 0))) {
      return false;
    }
    return super.canConnect$Point(p);
  }
}

export class RitualSiteRoom$RitualMarker extends CustomTilemap {
  TEX_WIDTH: number = 0;
  _RitualSiteRoom$RitualMarker(): this {
    this._CustomTilemap();
    this.texture_ = Assets$Environment.PRISON_QUEST;
    this.tileW = this.tileH = 5;
    this.TEX_WIDTH = 256;
    return this;
  }
  create(): Tilemap {
    let v = super.create();
    v.map(this.mapSimpleImage(0, 2, this.TEX_WIDTH), 5);
    return v;
  }
  image(tileX: number, tileY: number): Image {
    if (tileX === 0 || tileY === 0 || tileX === ((this.tileW - 1) | 0) || tileY === ((this.tileH - 1) | 0)) {
      return null;
    }
    return super.image(tileX, tileY);
  }
  name(tileX: number, tileY: number): string {
    return Messages.get$Object$String$ObjectArr(this, 'name', []);
  }
  desc(tileX: number, tileY: number): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', []);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    if (this.tileW === 3) {
      this.tileW = this.tileH = 5;
      this.tileX = (this.tileX - 1) | 0;
      this.tileY = (this.tileY - 1) | 0;
    }
  }
}

export class RitualSiteRoom$Table extends CustomTilemap {
  TEX_WIDTH: number = 0;
  _RitualSiteRoom$Table(): this {
    this._CustomTilemap();
    this.texture_ = Assets$Environment.PRISON_QUEST;
    this.tileW = 1;
    this.tileH = 2;
    this.TEX_WIDTH = 256;
    return this;
  }
  create(): Tilemap {
    let v = super.create();
    v.map(this.mapSimpleImage(0, 0, this.TEX_WIDTH), 1);
    return v;
  }
  name(tileX: number, tileY: number): string {
    return Messages.get$Object$String$ObjectArr(this, 'name', []);
  }
  desc(tileX: number, tileY: number): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', []);
  }
}

$J.define(RitualSiteRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.RitualSiteRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom', ctors: { '': '_RitualSiteRoom' }, meths: { 'canConnect(com.watabou.utils.Point)': 'canConnect$Point' } });
$J.define(RitualSiteRoom$RitualMarker, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.RitualSiteRoom$RitualMarker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_RitualSiteRoom$RitualMarker' } });
$J.define(RitualSiteRoom$Table, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.RitualSiteRoom$Table', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_RitualSiteRoom$Table' } });
$J.module(() => {
  Assets$Environment = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Environment');
  CeremonialCandle = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.CeremonialCandle');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  Point = $J.load('com.watabou.utils.Point');
  Random = $J.load('com.watabou.utils.Random');
});
