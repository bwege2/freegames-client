// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/AmbitiousImpRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../jre/index.ts';
import { SpecialRoom } from '../special/SpecialRoom.ts';
import { CustomTilemap } from '../../../tiles/CustomTilemap.ts';

let Assets$Environment, Dungeon, Imp, Terrain, LevelTransition, LevelTransition$Type, Painter, Room$Door$Type, Messages, Carpet, Game, NoosaScript, TextureFilm, Tilemap, Point, Random;

export class AmbitiousImpRoom extends SpecialRoom {
  _AmbitiousImpRoom(): this {
    this._SpecialRoom();
    return this;
  }
  maxWidth(): number {
    return 9;
  }
  minWidth(): number {
    return 9;
  }
  maxHeight(): number {
    return 9;
  }
  minHeight(): number {
    return 9;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL_DECO);
    Painter.fill$Level$Rect$int$int(level, this, 1, Terrain.EMPTY);
    let c = this.center();
    Painter.set$Level$int$int$int(level, (c.x - 2) | 0, (c.y - 2) | 0, Terrain.REGION_DECO);
    Painter.set$Level$int$int$int(level, (c.x + 2) | 0, (c.y - 2) | 0, Terrain.REGION_DECO);
    Painter.set$Level$int$int$int(level, (c.x - 2) | 0, (c.y + 2) | 0, Terrain.REGION_DECO);
    Painter.set$Level$int$int$int(level, (c.x + 2) | 0, (c.y + 2) | 0, Terrain.REGION_DECO);
    Painter.set$Level$int$int$int(level, (c.x - 3) | 0, (c.y - 3) | 0, Terrain.WALL_DECO);
    Painter.set$Level$int$int$int(level, (c.x + 3) | 0, (c.y - 3) | 0, Terrain.WALL_DECO);
    Painter.set$Level$int$int$int(level, (c.x - 3) | 0, (c.y + 3) | 0, Terrain.WALL_DECO);
    Painter.set$Level$int$int$int(level, (c.x + 3) | 0, (c.y + 3) | 0, Terrain.WALL_DECO);
    let entrance = this.entrance();
    let npc = new Imp()._Imp();
    npc.pos = level.pointToCell(c);
    if (entrance.x === this.left_ || entrance.x === this.right_) {
      npc.pos = (npc.pos + Math.imul(Random.IntRange(-1, 1), level.width())) | 0;
      npc.pos = (npc.pos + (entrance.x === this.left_ ? -2 : 2)) | 0;
    } else if (entrance.y === this.top_ || entrance.y === this.bottom_) {
      npc.pos = (npc.pos + Random.IntRange(-1, 1)) | 0;
      npc.pos = (npc.pos + Math.imul(level.width(), (entrance.y === this.top_ ? -2 : 2))) | 0;
    }
    level.mobs.add(npc);
    Painter.drawInside(level, this, entrance, 1, Terrain.EMPTY);
    entrance.set$Type(Room$Door$Type.REGULAR);
    Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 1) | 0, (this.top_ + 3) | 0, 7, 3, Terrain.CUSTOM_DECO_EMPTY);
    Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 3) | 0, (this.top_ + 1) | 0, 3, 7, Terrain.CUSTOM_DECO_EMPTY);
    let carpet = new Carpet()._Carpet();
    carpet.setRect$int$int$int$int((this.left_ + 1) | 0, (this.top_ + 3) | 0, 7, 3);
    level.customTiles.add(carpet);
    carpet = new Carpet()._Carpet();
    carpet.setRect$int$int$int$int((this.left_ + 3) | 0, (this.top_ + 1) | 0, 3, 7);
    level.customTiles.add(carpet);
    let vis = new AmbitiousImpRoom$QuestEntrance()._AmbitiousImpRoom$QuestEntrance();
    vis.pos$int$int((c.x - 2) | 0, (c.y - 2) | 0);
    level.customTiles.add(vis);
    let vis2 = new AmbitiousImpRoom$EntranceBarrier()._AmbitiousImpRoom$EntranceBarrier();
    vis2.pos$int$int((c.x - 1) | 0, (c.y - 1) | 0);
    level.customTiles.add(vis2);
    let vis3 = new AmbitiousImpRoom$WallBanners()._AmbitiousImpRoom$WallBanners();
    vis3.pos$int$int((this.left_ + 1) | 0, this.top_);
    level.customTerrain.add(vis3);
    let entrancePos = level.pointToCell(c);
    level.transitions.add(new LevelTransition()._LevelTransition$Level$int$Type$int$int$Type(level, entrancePos, LevelTransition$Type.BRANCH_EXIT, Dungeon.depth, (Dungeon.branch + 1) | 0, LevelTransition$Type.BRANCH_ENTRANCE));
    Painter.set$Level$int$int(level, entrancePos, Terrain.EXIT);
  }
  canPlaceCharacter(p: Point, l: Level): boolean {
    return false;
  }
  canPlaceItem(p: Point, l: Level): boolean {
    return false;
  }
  canPlaceTrap(p: Point): boolean {
    return false;
  }
  canPlaceGrass(p: Point): boolean {
    return Point.distance(p, this.center()) >= Math.fround(5);
  }
  canPlaceWater(p: Point): boolean {
    return Point.distance(p, this.center()) >= Math.fround(5);
  }
}

export class AmbitiousImpRoom$QuestEntrance extends CustomTilemap {
  TEX_WIDTH: number = 0;
  _AmbitiousImpRoom$QuestEntrance(): this {
    this._CustomTilemap();
    this.texture_ = Assets$Environment.CITY_QUEST;
    this.tileW = this.tileH = 5;
    this.TEX_WIDTH = 256;
    return this;
  }
  create(): Tilemap {
    let v = super.create();
    v.map(this.mapSimpleImage(0, 0, this.TEX_WIDTH), 5);
    return v;
  }
  name(tileX: number, tileY: number): string {
    return Messages.get$Object$String$ObjectArr(this, 'name', []);
  }
  desc(tileX: number, tileY: number): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', []);
  }
  image(tileX: number, tileY: number): Image {
    if ((tileX === 0 || tileX === ((this.tileW - 1) | 0)) && (tileY === 0 || tileY === ((this.tileH - 1) | 0))) {
      return null;
    } else {
      return super.image(tileX, tileY);
    }
  }
}

export class AmbitiousImpRoom$WallBanners extends CustomTilemap {
  BANNER_1: number = 0;
  BANNER_2: number = 0;
  BANNER__BOTTOM: number = 0;
  _AmbitiousImpRoom$WallBanners(): this {
    this._CustomTilemap();
    this.texture_ = Assets$Environment.CITY_QUEST;
    this.tileW = 7;
    this.tileH = 3;
    this.BANNER_1 = 80;
    this.BANNER_2 = 81;
    this.BANNER__BOTTOM = 82;
    return this;
  }
  pos$int(pos: number): void {
    super.pos$int(pos);
  }
  create(): Tilemap {
    let v = super.create();
    let data = $J.newArray(Math.imul(this.tileW, this.tileH), 0);
    let cell = (this.tileX + Math.imul(Dungeon.level.width(), this.tileY)) | 0;
    if (!(Dungeon.level.passable[(cell + 1) | 0])) {
      data[1] = (this.BANNER_1 + Random.Int$int(2)) | 0;
      (data[(1 + this.tileW) | 0]) = this.BANNER__BOTTOM;
    }
    if (!(Dungeon.level.passable[(cell + 3) | 0])) {
      data[3] = (this.BANNER_1 + Random.Int$int(2)) | 0;
      if ((Dungeon.level.map_[(cell + 3 + Dungeon.level.width()) | 0]) !== Terrain.PEDESTAL) {
        (data[(3 + this.tileW) | 0]) = this.BANNER__BOTTOM;
      }
    }
    if (!(Dungeon.level.passable[(cell + 5) | 0])) {
      data[5] = (this.BANNER_1 + Random.Int$int(2)) | 0;
      (data[(5 + this.tileW) | 0]) = this.BANNER__BOTTOM;
    }
    cell = (cell + Dungeon.level.width()) | 0;
    if (!Dungeon.level.passable[cell]) {
      data[7] = (this.BANNER_1 + Random.Int$int(2)) | 0;
      (data[(7 + this.tileW) | 0]) = this.BANNER__BOTTOM;
    }
    if (!(Dungeon.level.passable[(cell + 6) | 0])) {
      data[13] = (this.BANNER_1 + Random.Int$int(2)) | 0;
      (data[(13 + this.tileW) | 0]) = this.BANNER__BOTTOM;
    }
    v.map(data, this.tileW);
    return v;
  }
  image(tileX: number, tileY: number): Image {
    return null;
  }
}

export class AmbitiousImpRoom$EntranceBarrier extends CustomTilemap {
  TEX_WIDTH: number = 0;
  _AmbitiousImpRoom$EntranceBarrier(): this {
    this._CustomTilemap();
    this.texture_ = Assets$Environment.CITY_QUEST;
    this.tileW = this.tileH = 3;
    this.TEX_WIDTH = 256;
    return this;
  }
  create(): Tilemap {
    if (this.vis != null && this.vis.alive) {
      this.vis.killAndErase();
    }
    this.vis = new (AmbitiousImpRoom$EntranceBarrier$1())().$o(this)._Tilemap(this.texture_, new TextureFilm()._TextureFilm$Object$int$int(this.texture_, CustomTilemap.SIZE, CustomTilemap.SIZE));
    this.vis.x = Math.fround(Math.imul(this.tileX, CustomTilemap.SIZE));
    this.vis.y = Math.fround(Math.imul(this.tileY, CustomTilemap.SIZE));
    this.vis.map(this.mapSimpleImage(5, 1, this.TEX_WIDTH), 3);
    return this.vis;
  }
  image(tileX: number, tileY: number): Image {
    return null;
  }
}

let $AmbitiousImpRoom$EntranceBarrier$1: any = null;
/** An anonymous class (AmbitiousImpRoom.java:260). */
function AmbitiousImpRoom$EntranceBarrier$1(): any {
  return $AmbitiousImpRoom$EntranceBarrier$1 ??= $J.local(class extends Tilemap {
    script(): NoosaScript {
      return NoosaScript.get();
    }
    update(): void {
      this.alpha$float(Math.fround(Math.fround(0.3) + Math.fround(Math.fround(0.3) * Math.fround(Math.sin(Game.timeTotal)))));
      super.update();
    }
    updateMapCell(cell: number): void {
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.AmbitiousImpRoom$EntranceBarrier$1', []);
}

$J.define(AmbitiousImpRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.AmbitiousImpRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SpecialRoom', ctors: { '': '_AmbitiousImpRoom' } });
$J.define(AmbitiousImpRoom$QuestEntrance, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.AmbitiousImpRoom$QuestEntrance', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_AmbitiousImpRoom$QuestEntrance' } });
$J.define(AmbitiousImpRoom$WallBanners, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.AmbitiousImpRoom$WallBanners', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_AmbitiousImpRoom$WallBanners' }, meths: { 'pos(int)': 'pos$int' } });
$J.define(AmbitiousImpRoom$EntranceBarrier, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.AmbitiousImpRoom$EntranceBarrier', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_AmbitiousImpRoom$EntranceBarrier' } });
$J.module(() => {
  Assets$Environment = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Environment');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Imp = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Imp');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  LevelTransition = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition');
  LevelTransition$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition$Type');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  Carpet = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.custom.Carpet');
  Game = $J.load('com.watabou.noosa.Game');
  NoosaScript = $J.load('com.watabou.noosa.NoosaScript');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
  Tilemap = $J.load('com.watabou.noosa.Tilemap');
  Point = $J.load('com.watabou.utils.Point');
  Random = $J.load('com.watabou.utils.Random');
});
