// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/VaultEntranceRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../../../jre/index.ts';
import { VaultRoom } from './VaultRoom.ts';
import { CustomTilemap } from '../../../../tiles/CustomTilemap.ts';

let Assets$Environment, Challenges, Dungeon, Torch, VaultBeacon, Terrain, LevelTransition, LevelTransition$Type, Painter, Room$Door$Type, AmbitiousImpRoom$WallBanners, Messages, Carpet, Point, Random;

export class VaultEntranceRoom extends VaultRoom {
  _VaultEntranceRoom(): this {
    this._VaultRoom();
    return this;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(level, this, 2, Terrain.EMPTY);
    let c = this.center();
    Painter.set$Level$int$int$int(level, (c.x - 3) | 0, (c.y - 3) | 0, Terrain.WALL);
    Painter.set$Level$int$int$int(level, (c.x + 3) | 0, (c.y - 3) | 0, Terrain.WALL);
    Painter.set$Level$int$int$int(level, (c.x - 3) | 0, (c.y + 3) | 0, Terrain.WALL);
    Painter.set$Level$int$int$int(level, (c.x + 3) | 0, (c.y + 3) | 0, Terrain.WALL);
    for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
      let door = $it0.next();
      door.set$Type(Room$Door$Type.REGULAR);
      Painter.drawInside(level, this, door, 3, Terrain.EMPTY);
    }
    Painter.set$Level$int$int$int(level, (c.x - 2) | 0, (c.y - 2) | 0, Terrain.REGION_DECO);
    Painter.set$Level$int$int$int(level, (c.x + 2) | 0, (c.y - 2) | 0, Terrain.REGION_DECO);
    Painter.set$Level$int$int$int(level, (c.x - 2) | 0, (c.y + 2) | 0, Terrain.REGION_DECO);
    Painter.set$Level$int$int$int(level, (c.x + 2) | 0, (c.y + 2) | 0, Terrain.REGION_DECO);
    Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 2) | 0, (this.top_ + 4) | 0, 7, 3, Terrain.CUSTOM_DECO_EMPTY);
    Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 4) | 0, (this.top_ + 2) | 0, 3, 7, Terrain.CUSTOM_DECO_EMPTY);
    let carpet = new Carpet()._Carpet();
    carpet.setRect$int$int$int$int((this.left_ + 2) | 0, (this.top_ + 4) | 0, 7, 3);
    level.customTiles.add(carpet);
    carpet = new Carpet()._Carpet();
    carpet.setRect$int$int$int$int((this.left_ + 4) | 0, (this.top_ + 2) | 0, 3, 7);
    level.customTiles.add(carpet);
    let vis = new VaultEntranceRoom$QuestEntranceInternal()._VaultEntranceRoom$QuestEntranceInternal();
    vis.pos$int$int((c.x - 1) | 0, (c.y - 1) | 0);
    level.customTiles.add(vis);
    let vis2 = new AmbitiousImpRoom$WallBanners()._AmbitiousImpRoom$WallBanners();
    vis2.pos$int$int((this.left_ + 2) | 0, (this.top_ + 1) | 0);
    level.customTerrain.add(vis2);
    let pedestalCandidates = new ArrayList();
    pedestalCandidates.add(new Point()._Point$int$int((this.left_ + 2) | 0, c.y));
    pedestalCandidates.add(new Point()._Point$int$int((this.right_ - 2) | 0, c.y));
    pedestalCandidates.add(new Point()._Point$int$int(c.x, (this.top_ + 2) | 0));
    pedestalCandidates.add(new Point()._Point$int$int(c.x, (this.bottom_ - 2) | 0));
    let furthest = null;
    let furthestDist = 0;
    for (const $it1 = pedestalCandidates.iterator(); $it1.hasNext(); ) {
      let p = $it1.next();
      let dist = 0;
      for (const $it2 = this.connected_.values().iterator(); $it2.hasNext(); ) {
        let d = $it2.next();
        dist = Math.fround(dist + Point.distance(p, d));
      }
      if (furthest == null || dist > furthestDist) {
        furthest = p;
        furthestDist = dist;
      }
    }
    let ofs = 0;
    if (furthest.x === c.x) {
      ofs = 1;
    } else {
      ofs = level.width();
    }
    let addTorch = Dungeon.isChallenged(Challenges.DARKNESS);
    switch (Random.Int$int(3)) {
      case 0:
        if (addTorch) {
          level.drop(new Torch()._Torch(), (level.pointToCell(furthest) - ofs) | 0);
        }
        level.drop(new VaultBeacon()._VaultBeacon(), level.pointToCell(furthest));
        level.drop(new VaultBeacon()._VaultBeacon(), (level.pointToCell(furthest) + ofs) | 0);
        break;
      case 1:
        level.drop(new VaultBeacon()._VaultBeacon(), (level.pointToCell(furthest) - ofs) | 0);
        if (addTorch) {
          level.drop(new Torch()._Torch(), level.pointToCell(furthest));
        }
        level.drop(new VaultBeacon()._VaultBeacon(), (level.pointToCell(furthest) + ofs) | 0);
        break;
      case 2:
        level.drop(new VaultBeacon()._VaultBeacon(), (level.pointToCell(furthest) - ofs) | 0);
        level.drop(new VaultBeacon()._VaultBeacon(), level.pointToCell(furthest));
        if (addTorch) {
          level.drop(new Torch()._Torch(), (level.pointToCell(furthest) + ofs) | 0);
        }
        break;
    }
    let entrance: number;
    do {
      entrance = level.pointToCell(this.center());
    } while (level.findMob(entrance) != null);
    level.transitions.add(new LevelTransition()._LevelTransition$Level$int$Type$int$int$Type(level, entrance, LevelTransition$Type.BRANCH_ENTRANCE, Dungeon.depth, 0, LevelTransition$Type.BRANCH_EXIT));
  }
  isEntrance(): boolean {
    return true;
  }
  canConnect$Point(p: Point): boolean {
    return (p.x > ((this.left_ + 1) | 0) && p.x < ((this.right_ - 1) | 0)) || (p.y > ((this.top_ + 1) | 0) && p.y < ((this.bottom_ - 1) | 0));
  }
}

export class VaultEntranceRoom$QuestEntranceInternal extends CustomTilemap {
  TEX_WIDTH: number = 0;
  _VaultEntranceRoom$QuestEntranceInternal(): this {
    this._CustomTilemap();
    this.texture_ = Assets$Environment.CITY_QUEST;
    this.tileW = this.tileH = 3;
    this.TEX_WIDTH = 256;
    return this;
  }
  create(): Tilemap {
    let v = super.create();
    v.map(this.mapSimpleImage(8, 1, this.TEX_WIDTH), 3);
    return v;
  }
  name(tileX: number, tileY: number): string {
    return Messages.get$Object$String$ObjectArr(this, 'name', []);
  }
  desc(tileX: number, tileY: number): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', []);
  }
}

$J.define(VaultEntranceRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultEntranceRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultRoom', ctors: { '': '_VaultEntranceRoom' }, meths: { 'canConnect(com.watabou.utils.Point)': 'canConnect$Point' } });
$J.define(VaultEntranceRoom$QuestEntranceInternal, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultEntranceRoom$QuestEntranceInternal', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_VaultEntranceRoom$QuestEntranceInternal' } });
$J.module(() => {
  Assets$Environment = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Environment');
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Torch = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Torch');
  VaultBeacon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.VaultBeacon');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  LevelTransition = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition');
  LevelTransition$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition$Type');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  AmbitiousImpRoom$WallBanners = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.AmbitiousImpRoom$WallBanners');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  Carpet = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.custom.Carpet');
  Point = $J.load('com.watabou.utils.Point');
  Random = $J.load('com.watabou.utils.Random');
});
