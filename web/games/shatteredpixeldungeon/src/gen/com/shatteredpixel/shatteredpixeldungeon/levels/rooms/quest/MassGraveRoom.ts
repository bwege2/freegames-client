// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/MassGraveRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Arrays } from '../../../../../../../jre/index.ts';
import { SpecialRoom } from '../special/SpecialRoom.ts';
import { CustomTilemap } from '../../../tiles/CustomTilemap.ts';

let Assets$Environment, Skeleton, Generator, Gold, Heap$Type, PotionOfLiquidFlame, CorpseDust, Terrain, Painter, Room, Room$Door$Type, Messages, Random;

export class MassGraveRoom extends SpecialRoom {
  _MassGraveRoom(): this {
    this._SpecialRoom();
    return this;
  }
  minWidth(): number {
    return 11;
  }
  maxWidth(): number {
    return 11;
  }
  minHeight(): number {
    return 10;
  }
  maxHeight(): number {
    return 10;
  }
  paint(level: Level): void {
    let entrance = this.entrance();
    entrance.set$Type(Room$Door$Type.BARRICADE);
    level.addItemToSpawn(new PotionOfLiquidFlame()._PotionOfLiquidFlame());
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.CUSTOM_DECO_EMPTY);
    Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 1) | 0, (this.top_ + 1) | 0, 3, 1, Terrain.WALL);
    Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 1) | 0, (this.top_ + 2) | 0, 2, 1, Terrain.WALL);
    Painter.fill$Level$int$int$int$int$int(level, (this.right_ - 3) | 0, (this.top_ + 1) | 0, 3, 1, Terrain.WALL);
    Painter.fill$Level$int$int$int$int$int(level, (this.right_ - 2) | 0, (this.top_ + 2) | 0, 2, 1, Terrain.WALL);
    Painter.set$Level$int$int$int(level, (this.left_ + 5) | 0, this.top_, Terrain.WALL_DECO);
    Painter.set$Level$int$int$int(level, (this.left_ + 3) | 0, (this.top_ + 2) | 0, Terrain.STATUE);
    Painter.set$Level$int$int$int(level, (this.right_ - 3) | 0, (this.top_ + 2) | 0, Terrain.STATUE);
    let b = new MassGraveRoom$MassGraveDeco()._MassGraveRoom$MassGraveDeco();
    b.setRect$int$int$int$int((this.left_ + 1) | 0, this.top_, (this.width() - 2) | 0, (this.height() - 1) | 0);
    level.customTiles.add(b);
    let statue = new MassGraveRoom$StatueRaised()._MassGraveRoom$StatueRaised();
    statue.setRect$int$int$int$int((this.left_ + 3) | 0, (this.top_ + 2) | 0, 1, 1);
    level.customTerrain.add(statue);
    statue = new MassGraveRoom$StatueRaised()._MassGraveRoom$StatueRaised();
    statue.setRect$int$int$int$int((this.right_ - 3) | 0, (this.top_ + 2) | 0, 1, 1);
    level.customTerrain.add(statue);
    for (let i = 0; i <= Random.Int$int(2); i++) {
      let skele = new Skeleton()._Skeleton();
      let pos: number;
      let p: Point;
      do {
        p = this.random$int(1);
        if (p.y <= ((this.top_ + 2) | 0)) {
          p.x = Random.IntRange((this.left_ + 4) | 0, (this.right_ - 4) | 0);
        }
        pos = level.pointToCell(p);
      } while (p.y > ((this.top_ + 3) | 0) || level.findMob(pos) != null);
      skele.pos = pos;
      level.mobs.add(skele);
    }
    let items = new ArrayList();
    items.add(new CorpseDust()._CorpseDust());
    items.add(new Gold()._Gold$int(1));
    items.add(new Gold()._Gold$int(1));
    if (Random.Float$() <= Math.fround(0.3)) {
      items.add(new Gold()._Gold$());
    }
    if (Random.Float$() <= Math.fround(0.3)) {
      items.add(new Gold()._Gold$());
    }
    if (Random.Float$() <= Math.fround(0.6)) {
      items.add(Generator.random$());
    }
    if (Random.Float$() <= Math.fround(0.3)) {
      items.add(Generator.randomArmor$());
    }
    for (const $it0 = items.iterator(); $it0.hasNext(); ) {
      let item = $it0.next();
      let pos: number;
      let p: Point;
      do {
        p = this.random$int(1);
        if (p.y <= ((this.top_ + 2) | 0)) {
          p.x = Random.IntRange((this.left_ + 4) | 0, (this.right_ - 4) | 0);
        }
        pos = level.pointToCell(p);
      } while (p.y > ((this.top_ + 5) | 0) || level.heaps.get(pos) != null);
      let h = level.drop(item, pos);
      h.setHauntedIfCursed();
      h.type_ = Heap$Type.SKELETON;
    }
  }
  canConnect$int(direction: number): boolean {
    return super.canConnect$int(direction) && direction === Room.BOTTOM;
  }
  canConnect$Point(p: Point): boolean {
    return (Math.abs((p.x - this.center().x) | 0)) <= 2;
  }
  canConnect$Room(r: Room): boolean {
    if (r.isEntrance()) {
      return false;
    }
    for (const $it1 = r.connected_.keySet().iterator(); $it1.hasNext(); ) {
      let r1 = $it1.next();
      if (r1.isEntrance()) {
        return false;
      }
      for (const $it2 = r1.connected_.keySet().iterator(); $it2.hasNext(); ) {
        let r2 = $it2.next();
        if (r2.isEntrance()) {
          return false;
        }
        for (const $it3 = r2.connected_.keySet().iterator(); $it3.hasNext(); ) {
          let r3 = $it3.next();
          if (r3.isEntrance()) {
            return false;
          }
        }
      }
    }
    return super.canConnect$Room(r);
  }
}

export class MassGraveRoom$Bones extends CustomTilemap {
  static readonly WALL_OVERLAP: number = 3;
  static readonly FLOOR: number = 7;
  _MassGraveRoom$Bones(): this {
    this._CustomTilemap();
    this.texture_ = Assets$Environment.PRISON_QUEST;
    return this;
  }
  create(): Tilemap {
    let v = super.create();
    let data = $J.newArray(Math.imul(this.tileW, this.tileH), 0);
    for (let i = 0; i < data.length; i++) {
      if (i < this.tileW) {
        data[i] = MassGraveRoom$Bones.WALL_OVERLAP;
      } else {
        data[i] = MassGraveRoom$Bones.FLOOR;
      }
    }
    v.map(data, this.tileW);
    return v;
  }
  image(tileX: number, tileY: number): Image {
    if (tileY === 0) {
      return null;
    } else {
      return super.image(tileX, tileY);
    }
  }
  name(tileX: number, tileY: number): string {
    return Messages.get$Class$String$ObjectArr($J.cls(MassGraveRoom$MassGraveDeco), 'name', []);
  }
  desc(tileX: number, tileY: number): string {
    return Messages.get$Class$String$ObjectArr($J.cls(MassGraveRoom$MassGraveDeco), 'desc', []);
  }
}

export class MassGraveRoom$MassGraveDeco extends CustomTilemap {
  static render: number[] = null;
  _MassGraveRoom$MassGraveDeco(): this {
    this._CustomTilemap();
    this.texture_ = Assets$Environment.PRISON_QUEST;
    this.tileW = 9;
    this.tileH = 9;
    return this;
  }
  create(): Tilemap {
    let v = super.create();
    let data = this.mapSimpleImage(5, 0, 256);
    for (let i = 0; i < data.length; i++) {
      if (MassGraveRoom$MassGraveDeco.render[i] === 0) {
        data[i] = -1;
      }
    }
    v.map(data, this.tileW);
    return v;
  }
  name(tileX: number, tileY: number): string {
    if ((MassGraveRoom$MassGraveDeco.render[(tileX + Math.imul(tileY, this.tileH)) | 0]) === 1) {
      return Messages.get$Object$String$ObjectArr(this, 'name', []);
    } else {
      return super.name(tileX, tileY);
    }
  }
  desc(tileX: number, tileY: number): string {
    if ((MassGraveRoom$MassGraveDeco.render[(tileX + Math.imul(tileY, this.tileH)) | 0]) === 1) {
      return Messages.get$Object$String$ObjectArr(this, 'desc', []);
    } else {
      return super.desc(tileX, tileY);
    }
  }
  static $clinit() {
    MassGraveRoom$MassGraveDeco.render = [0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1];
  }
}

export class MassGraveRoom$StatueRaised extends CustomTilemap {
  _MassGraveRoom$StatueRaised(): this {
    this._CustomTilemap();
    this.texture_ = Assets$Environment.PRISON_QUEST;
    return this;
  }
  create(): Tilemap {
    let v = super.create();
    let data = $J.newArray(Math.imul(this.tileW, this.tileH), 0);
    Arrays.fill(data, 4);
    v.map(data, this.tileW);
    return v;
  }
}

$J.define(MassGraveRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.MassGraveRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SpecialRoom', ctors: { '': '_MassGraveRoom' }, meths: { 'canConnect(com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room)': 'canConnect$Room', 'canConnect(com.watabou.utils.Point)': 'canConnect$Point', 'canConnect(int)': 'canConnect$int' } });
$J.define(MassGraveRoom$Bones, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.MassGraveRoom$Bones', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_MassGraveRoom$Bones' } });
$J.define(MassGraveRoom$MassGraveDeco, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.MassGraveRoom$MassGraveDeco', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_MassGraveRoom$MassGraveDeco' }, clinit: true, lazy: ['render'] });
$J.define(MassGraveRoom$StatueRaised, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.MassGraveRoom$StatueRaised', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_MassGraveRoom$StatueRaised' } });
$J.module(() => {
  Assets$Environment = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Environment');
  Skeleton = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Skeleton');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Gold = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Gold');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  PotionOfLiquidFlame = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfLiquidFlame');
  CorpseDust = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.CorpseDust');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  Random = $J.load('com.watabou.utils.Random');
});
