// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/VaultTokensRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { VaultLongRoom } from './VaultLongRoom.ts';
import { CustomTilemap } from '../../../../tiles/CustomTilemap.ts';

let Assets$Environment, Dungeon, Char, Char$Property, VaultMirror, VaultTokenDoor, Terrain, Painter, Carpet, Point, Random;

export class VaultTokensRoom extends VaultLongRoom {
  _VaultTokensRoom(): this {
    this._VaultLongRoom();
    return this;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    let c = this.center();
    if (this.wide()) {
      let leftDoor = 0;
      let rightDoor = 0;
      for (const $it0 = this.connected_.values().iterator(); $it0.hasNext(); ) {
        let d = $it0.next();
        if (d.x < c.x) {
          leftDoor = 1;
          Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 1) | 0, (this.top_ + 1) | 0, $J.idiv(((this.width() - 2) | 0), 2), (this.height() - 2) | 0, Terrain.EMPTY);
        } else {
          rightDoor = 1;
          Painter.fill$Level$int$int$int$int$int(level, (c.x + 1) | 0, (this.top_ + 1) | 0, $J.idiv(((this.width() - 2) | 0), 2), (this.height() - 2) | 0, Terrain.EMPTY);
        }
      }
      Painter.fillDiamond$Level$int$int$int$int$int(level, (this.left_ + 3) | 0, (this.top_ + 1) | 0, 9, 9, Terrain.WALL);
      Painter.fillDiamond$Level$int$int$int$int$int(level, (this.left_ + 9) | 0, (this.top_ + 1) | 0, 9, 9, Terrain.WALL);
      Painter.fillDiamond$Level$int$int$int$int$int(level, (this.left_ + 5) | 0, (this.top_ + 1) | 0, 9, 9, Terrain.EMPTY_SP);
      Painter.fillDiamond$Level$int$int$int$int$int(level, (this.left_ + 7) | 0, (this.top_ + 1) | 0, 9, 9, Terrain.EMPTY_SP);
      Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 4 - leftDoor) | 0, c.y, (13 + leftDoor + rightDoor) | 0, 1, Terrain.EMPTY);
      Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 4) | 0, c.y, 13, 1, Terrain.EMPTY_SP);
    } else {
      let topdoor = 0;
      let bottomDoor = 0;
      for (const $it1 = this.connected_.values().iterator(); $it1.hasNext(); ) {
        let d = $it1.next();
        if (d.y < c.y) {
          topdoor = 1;
          Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 1) | 0, (this.top_ + 1) | 0, (this.width() - 2) | 0, $J.idiv(((this.height() - 2) | 0), 2), Terrain.EMPTY);
        } else {
          bottomDoor = 1;
          Painter.fill$Level$int$int$int$int$int(level, (this.left_ + 1) | 0, (c.y + 1) | 0, (this.width() - 2) | 0, $J.idiv(((this.height() - 2) | 0), 2), Terrain.EMPTY);
        }
      }
      Painter.fillDiamond$Level$int$int$int$int$int(level, (this.left_ + 1) | 0, (this.top_ + 3) | 0, 9, 9, Terrain.WALL);
      Painter.fillDiamond$Level$int$int$int$int$int(level, (this.left_ + 1) | 0, (this.top_ + 9) | 0, 9, 9, Terrain.WALL);
      Painter.fillDiamond$Level$int$int$int$int$int(level, (this.left_ + 1) | 0, (this.top_ + 5) | 0, 9, 9, Terrain.EMPTY_SP);
      Painter.fillDiamond$Level$int$int$int$int$int(level, (this.left_ + 1) | 0, (this.top_ + 7) | 0, 9, 9, Terrain.EMPTY_SP);
      Painter.fill$Level$int$int$int$int$int(level, c.x, (this.top_ + 4 - topdoor) | 0, 1, (13 + topdoor + bottomDoor) | 0, Terrain.EMPTY);
      Painter.fill$Level$int$int$int$int$int(level, c.x, (this.top_ + 4) | 0, 1, 13, Terrain.EMPTY_SP);
    }
    Painter.fillDiamond$Level$int$int$int$int$int(level, (c.x - 3) | 0, (c.y - 3) | 0, 7, 7, Terrain.WALL);
    Painter.fill$Level$int$int$int$int$int(level, (c.x - 1) | 0, (c.y - 1) | 0, 3, 3, Terrain.EMPTY_SP);
    Painter.fill$Level$int$int$int$int$int(level, (c.x - 2) | 0, c.y, 5, 1, Terrain.EMPTY_SP);
    Painter.fill$Level$int$int$int$int$int(level, c.x, (c.y - 1) | 0, 1, 5, Terrain.EMPTY_SP);
    Painter.set$Level$int$int$int(level, (c.x - 1) | 0, (c.y - 1) | 0, Terrain.REGION_DECO_ALT);
    Painter.set$Level$int$int$int(level, (c.x + 1) | 0, (c.y - 1) | 0, Terrain.REGION_DECO_ALT);
    let carpet = new Carpet()._Carpet();
    carpet.setRect$int$int$int$int((c.x - 1) | 0, (c.y - 1) | 0, 3, 3);
    carpet.overrideTile$int$int$int(0, 0, Carpet.CITY_PEDESTAL_TL);
    carpet.overrideTile$int$int$int(2, 0, Carpet.CITY_PEDESTAL_TR);
    level.customTiles.add(carpet);
    Painter.set$Level$int$int$int(level, c.x, (c.y + 3) | 0, Terrain.LOCKED_DOOR);
    let door = new VaultTokenDoor()._VaultTokenDoor();
    door.pos = (c.x + Math.imul(((c.y + 3) | 0), level.width())) | 0;
    level.mobs.add(door);
    let doorFloor = new VaultTokensRoom$TokenDoorFloor()._VaultTokensRoom$TokenDoorFloor();
    doorFloor.pos$int$Level(door.pos, level);
    level.customTiles.add(doorFloor);
    let mirror = new VaultMirror()._VaultMirror();
    mirror.createReward(Dungeon.hero.heroClass);
    mirror.pos = (c.x + Math.imul(((c.y - 1) | 0), level.width())) | 0;
    level.mobs.add(mirror);
    if (Random.Int$int(2) === 0) {
      level.drop((level).createEquipment(3), (c.x - 2 + Math.imul(c.y, level.width())) | 0);
      level.drop((level).createConsumabe(3), (c.x + 2 + Math.imul(c.y, level.width())) | 0);
    } else {
      level.drop((level).createEquipment(3), (c.x + 2 + Math.imul(c.y, level.width())) | 0);
      level.drop((level).createConsumabe(3), (c.x - 2 + Math.imul(c.y, level.width())) | 0);
    }
    let enemy: Mob;
    let toReturn = new ArrayList();
    do {
      enemy = level.createMob();
      if (Char.hasProp(enemy, Char$Property.LARGE)) {
        toReturn.add(enemy.getClass());
      }
    } while (Char.hasProp(enemy, Char$Property.LARGE));
    let wanderPositions: number[];
    if (Random.Int$int(2) === 0) {
      wanderPositions = [level.pointToCell(new Point()._Point$int$int((c.x - 4) | 0, c.y)), level.pointToCell(new Point()._Point$int$int(c.x, (c.y - 4) | 0)), level.pointToCell(new Point()._Point$int$int((c.x + 4) | 0, c.y)), level.pointToCell(new Point()._Point$int$int(c.x, (c.y + 4) | 0))];
    } else {
      wanderPositions = [level.pointToCell(new Point()._Point$int$int((c.x - 4) | 0, c.y)), level.pointToCell(new Point()._Point$int$int(c.x, (c.y - 4) | 0)), level.pointToCell(new Point()._Point$int$int((c.x + 4) | 0, c.y)), level.pointToCell(new Point()._Point$int$int(c.x, (c.y + 4) | 0))];
    }
    let idx = Random.Int$int(4);
    enemy.pos = wanderPositions[idx];
    enemy.setupStealthGameplayWanderPositions(wanderPositions, idx);
    enemy.state_ = enemy.WANDERING;
    level.mobs.add(enemy);
    for (const $it2 = toReturn.iterator(); $it2.hasNext(); ) {
      let cls = $it2.next();
      (level).returnMob(cls);
    }
  }
  canConnect$Point(p: Point): boolean {
    if (!super.canConnect$Point(p)) {
      return false;
    }
    if (this.wide()) {
      return p.x < ((this.left_ + 5) | 0) || p.x > ((this.right_ - 5) | 0);
    } else {
      return p.y < ((this.top_ + 5) | 0) || p.y > ((this.bottom_ - 5) | 0);
    }
  }
  canConnect$Room(r: Room): boolean {
    if (r.isEntrance()) {
      return false;
    }
    for (const $it3 = r.connected_.keySet().iterator(); $it3.hasNext(); ) {
      let r1 = $it3.next();
      if (r1.isEntrance()) {
        return false;
      }
      for (const $it4 = r1.connected_.keySet().iterator(); $it4.hasNext(); ) {
        let r2 = $it4.next();
        if (r2.isEntrance()) {
          return false;
        }
      }
    }
    return super.canConnect$Room(r);
  }
  canPlaceItem(p: Point, l: Level): boolean {
    return super.canPlaceItem(p, l) && l.map_[l.pointToCell(p)] !== Terrain.EMPTY_SP;
  }
  canPlaceCharacter(p: Point, l: Level): boolean {
    return super.canPlaceCharacter(p, l) && l.map_[l.pointToCell(p)] !== Terrain.EMPTY_SP;
  }
}

export class VaultTokensRoom$TokenDoorFloor extends CustomTilemap {
  _VaultTokensRoom$TokenDoorFloor(): this {
    this._CustomTilemap();
    this.texture_ = Assets$Environment.CITY_QUEST;
    this.tileW = this.tileH = 1;
    return this;
  }
  create(): Tilemap {
    let v = super.create();
    let data = $J.newArray(1, 0);
    this.updateCell(0, data);
    v.map(data, this.tileW);
    return v;
  }
  updateCell(cell: number, data: number[]): boolean {
    cell = (this.tileX + Math.imul(this.tileY, Dungeon.level.width())) | 0;
    if (Dungeon.level.map_[cell] !== Terrain.DOOR) {
      data[0] = (Math.imul(16, 9) + 1) | 0;
    } else {
      data[0] = Math.imul(16, 9);
    }
    return true;
  }
  updateAll(data: number[]): void {
    this.updateCell(0, data);
  }
}

$J.define(VaultTokensRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultTokensRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultLongRoom', ctors: { '': '_VaultTokensRoom' }, meths: { 'canConnect(com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room)': 'canConnect$Room', 'canConnect(com.watabou.utils.Point)': 'canConnect$Point' } });
$J.define(VaultTokensRoom$TokenDoorFloor, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultTokensRoom$TokenDoorFloor', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_VaultTokensRoom$TokenDoorFloor' } });
$J.module(() => {
  Assets$Environment = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Environment');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  VaultMirror = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.VaultMirror');
  VaultTokenDoor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.VaultTokenDoor');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Carpet = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.custom.Carpet');
  Point = $J.load('com.watabou.utils.Point');
  Random = $J.load('com.watabou.utils.Random');
});
