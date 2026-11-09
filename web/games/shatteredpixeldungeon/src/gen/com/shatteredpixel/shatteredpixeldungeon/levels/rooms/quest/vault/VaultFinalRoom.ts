// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/VaultFinalRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, JObject } from '../../../../../../../../jre/index.ts';
import { SpecialRoom } from '../../special/SpecialRoom.ts';
import { CustomTilemap } from '../../../../tiles/CustomTilemap.ts';

let Assets$Environment, Assets$Sounds, Dungeon, Actor, Imp, Imp$Quest, VaultBossElemental, Armor, ImpStatue, Ring, Wand, MagesStaff, MeleeWeapon, MissileWeapon, Level, Terrain, Painter, Room$Door$Type, EmptyRoom, Languages, Messages, GameScene, ImpSprite, DungeonTileSheet, Carpet, GLog, WndTitledMessage, Game, Image, Sample, PathFinder, Point, Random;

export class VaultFinalRoom extends SpecialRoom {
  entryDoor: Point = null;
  lockedDoor: Point = null;
  warnState: number = 0;
  lockTriggered: boolean = false;
  static readonly ENTRY_DOOR_X: string = 'entry_door_x';
  static readonly ENTRY_DOOR_Y: string = 'entry_door_y';
  static readonly LOCKED_DOOR_X: string = 'locked_door_x';
  static readonly LOCKED_DOOR_Y: string = 'locked_door_y';
  static readonly WARN_STATE: string = 'warn_state';
  static readonly LOCK_TRIGGERED: string = 'lock_triggered';
  _VaultFinalRoom(): this {
    this._SpecialRoom();
    this.warnState = 0;
    this.lockTriggered = false;
    return this;
  }
  minWidth(): number {
    return 21;
  }
  maxWidth(): number {
    return 21;
  }
  minHeight(): number {
    return 21;
  }
  maxHeight(): number {
    return 21;
  }
  isExit(): boolean {
    return true;
  }
  canConnect$Point(p: Point): boolean {
    return ((Math.abs((p.x - this.center().x) | 0)) <= 5 || (Math.abs((p.y - this.center().y) | 0)) <= 5);
  }
  canConnect$Room(r: Room): boolean {
    if (r.isEntrance()) {
      return false;
    }
    for (const $it0 = r.connected_.keySet().iterator(); $it0.hasNext(); ) {
      let r1 = $it0.next();
      if (r1.isEntrance()) {
        return false;
      }
      for (const $it1 = r1.connected_.keySet().iterator(); $it1.hasNext(); ) {
        let r2 = $it1.next();
        if (r2.isEntrance()) {
          return false;
        }
        for (const $it2 = r2.connected_.keySet().iterator(); $it2.hasNext(); ) {
          let r3 = $it2.next();
          if (r3.isEntrance()) {
            return false;
          }
        }
      }
    }
    return super.canConnect$Room(r);
  }
  canPlaceGrass(p: Point): boolean {
    return false;
  }
  canPlaceWater(p: Point): boolean {
    return false;
  }
  canPlaceItem(p: Point, l: Level): boolean {
    return false;
  }
  paint(level: Level): void {
    Painter.fill$Level$Rect$int(level, this, Terrain.WALL);
    Painter.fillEllipse$Level$Rect$int$int(level, this, 5, Terrain.EMPTY_SP);
    let c = this.center();
    let marker = new VaultFinalRoom$MarkerTiles()._VaultFinalRoom$MarkerTiles();
    marker.pos$int$int((c.x - 4) | 0, (c.y - 4) | 0);
    level.customTiles.add(marker);
    let entrance = this.entrance();
    entrance.set$Type(Room$Door$Type.REGULAR);
    let entry = new EmptyRoom()._EmptyRoom();
    let treasure = new EmptyRoom()._EmptyRoom();
    if (entrance.x === this.left_) {
      entry.set$int$int$int$int((this.left_ + 1) | 0, (this.top_ + 5) | 0, (this.left_ + 3) | 0, (this.bottom_ - 5) | 0);
      this.entryDoor = new Point()._Point$int$int((this.left_ + 4) | 0, c.y);
      treasure.set$int$int$int$int((this.right_ - 3) | 0, (this.top_ + 3) | 0, (this.right_ - 1) | 0, (this.bottom_ - 3) | 0);
      this.lockedDoor = new Point()._Point$int$int((this.right_ - 4) | 0, c.y);
    } else if (entrance.x === this.right_) {
      treasure.set$int$int$int$int((this.left_ + 1) | 0, (this.top_ + 3) | 0, (this.left_ + 3) | 0, (this.bottom_ - 3) | 0);
      this.lockedDoor = new Point()._Point$int$int((this.left_ + 4) | 0, c.y);
      entry.set$int$int$int$int((this.right_ - 3) | 0, (this.top_ + 5) | 0, (this.right_ - 1) | 0, (this.bottom_ - 5) | 0);
      this.entryDoor = new Point()._Point$int$int((this.right_ - 4) | 0, c.y);
    } else if (entrance.y === this.top_) {
      entry.set$int$int$int$int((this.left_ + 5) | 0, (this.top_ + 1) | 0, (this.right_ - 5) | 0, (this.top_ + 3) | 0);
      this.entryDoor = new Point()._Point$int$int(c.x, (this.top_ + 4) | 0);
      treasure.set$int$int$int$int((this.left_ + 3) | 0, (this.bottom_ - 3) | 0, (this.right_ - 3) | 0, (this.bottom_ - 1) | 0);
      this.lockedDoor = new Point()._Point$int$int(c.x, (this.bottom_ - 4) | 0);
    } else {
      treasure.set$int$int$int$int((this.left_ + 3) | 0, (this.top_ + 1) | 0, (this.right_ - 3) | 0, (this.top_ + 3) | 0);
      this.lockedDoor = new Point()._Point$int$int(c.x, (this.top_ + 4) | 0);
      entry.set$int$int$int$int((this.left_ + 5) | 0, (this.bottom_ - 3) | 0, (this.right_ - 5) | 0, (this.bottom_ - 1) | 0);
      this.entryDoor = new Point()._Point$int$int(c.x, (this.bottom_ - 4) | 0);
    }
    Painter.set$Level$Point$int(level, this.entryDoor, Terrain.DOOR);
    Painter.set$Level$Point$int(level, this.lockedDoor, Terrain.LOCKED_DOOR);
    Painter.fill$Level$Rect$int(level, entry, Terrain.CUSTOM_DECO_EMPTY);
    let carpet = new Carpet()._Carpet();
    carpet.setRect$int$int$int$int(entry.left_, entry.top_, entry.width(), entry.height());
    level.customTiles.add(carpet);
    let treasureSpots = new ArrayList();
    if (entry.width() > entry.height()) {
      Painter.set$Level$int$int$int(level, (entry.left_ + 1) | 0, (entry.top_ + 1) | 0, Terrain.REGION_DECO);
      carpet.overrideTile$Level$int$int$int(level, (entry.left_ + 1) | 0, (entry.top_ + 1) | 0, Carpet.CITY_PEDESTAL);
      Painter.set$Level$int$int$int(level, (entry.left_ + 3) | 0, (entry.top_ + 1) | 0, Terrain.REGION_DECO);
      carpet.overrideTile$Level$int$int$int(level, (entry.left_ + 3) | 0, (entry.top_ + 1) | 0, Carpet.CITY_PEDESTAL);
      Painter.set$Level$int$int$int(level, (entry.left_ + 7) | 0, (entry.top_ + 1) | 0, Terrain.REGION_DECO);
      carpet.overrideTile$Level$int$int$int(level, (entry.left_ + 7) | 0, (entry.top_ + 1) | 0, Carpet.CITY_PEDESTAL);
      Painter.set$Level$int$int$int(level, (entry.left_ + 9) | 0, (entry.top_ + 1) | 0, Terrain.REGION_DECO);
      carpet.overrideTile$Level$int$int$int(level, (entry.left_ + 9) | 0, (entry.top_ + 1) | 0, Carpet.CITY_PEDESTAL);
      treasureSpots.add((treasure.left_ + 1 + Math.imul(((treasure.top_ + 1) | 0), level.width())) | 0);
      treasureSpots.add((treasure.left_ + 3 + Math.imul(((treasure.top_ + 1) | 0), level.width())) | 0);
      treasureSpots.add((treasure.left_ + 5 + Math.imul(((treasure.top_ + 1) | 0), level.width())) | 0);
      treasureSpots.add((treasure.left_ + 7 + Math.imul(((treasure.top_ + 1) | 0), level.width())) | 0);
      treasureSpots.add((treasure.left_ + 9 + Math.imul(((treasure.top_ + 1) | 0), level.width())) | 0);
      treasureSpots.add((treasure.left_ + 11 + Math.imul(((treasure.top_ + 1) | 0), level.width())) | 0);
      treasureSpots.add((treasure.left_ + 13 + Math.imul(((treasure.top_ + 1) | 0), level.width())) | 0);
    } else {
      Painter.set$Level$int$int$int(level, (entry.left_ + 1) | 0, (entry.top_ + 1) | 0, Terrain.REGION_DECO);
      carpet.overrideTile$Level$int$int$int(level, (entry.left_ + 1) | 0, (entry.top_ + 1) | 0, Carpet.CITY_PEDESTAL);
      Painter.set$Level$int$int$int(level, (entry.left_ + 1) | 0, (entry.top_ + 3) | 0, Terrain.REGION_DECO);
      carpet.overrideTile$Level$int$int$int(level, (entry.left_ + 1) | 0, (entry.top_ + 3) | 0, Carpet.CITY_PEDESTAL);
      Painter.set$Level$int$int$int(level, (entry.left_ + 1) | 0, (entry.top_ + 7) | 0, Terrain.REGION_DECO);
      carpet.overrideTile$Level$int$int$int(level, (entry.left_ + 1) | 0, (entry.top_ + 7) | 0, Carpet.CITY_PEDESTAL);
      Painter.set$Level$int$int$int(level, (entry.left_ + 1) | 0, (entry.top_ + 9) | 0, Terrain.REGION_DECO);
      carpet.overrideTile$Level$int$int$int(level, (entry.left_ + 1) | 0, (entry.top_ + 9) | 0, Carpet.CITY_PEDESTAL);
      treasureSpots.add((treasure.left_ + 1 + Math.imul(((treasure.top_ + 1) | 0), level.width())) | 0);
      treasureSpots.add((treasure.left_ + 1 + Math.imul(((treasure.top_ + 3) | 0), level.width())) | 0);
      treasureSpots.add((treasure.left_ + 1 + Math.imul(((treasure.top_ + 5) | 0), level.width())) | 0);
      treasureSpots.add((treasure.left_ + 1 + Math.imul(((treasure.top_ + 7) | 0), level.width())) | 0);
      treasureSpots.add((treasure.left_ + 1 + Math.imul(((treasure.top_ + 9) | 0), level.width())) | 0);
      treasureSpots.add((treasure.left_ + 1 + Math.imul(((treasure.top_ + 11) | 0), level.width())) | 0);
      treasureSpots.add((treasure.left_ + 1 + Math.imul(((treasure.top_ + 13) | 0), level.width())) | 0);
    }
    Painter.fill$Level$Rect$int(level, treasure, Terrain.EMPTY_SP);
    for (const $it3 = treasureSpots.iterator(); $it3.hasNext(); ) {
      let cell = $it3.next();
      Painter.set$Level$int$int(level, cell, Terrain.PEDESTAL);
    }
    level.drop(new ImpStatue()._ImpStatue(), treasureSpots.removeAt(3));
    Random.shuffle$List(treasureSpots);
    for (const $it4 = Imp$Quest.rewardOptions.iterator(); $it4.hasNext(); ) {
      let i = $it4.next();
      level.drop(i, treasureSpots.removeAt(0));
    }
    Imp$Quest.rewardOptions.clear();
    let vis = new VaultFinalRoom$VaultTreasure()._VaultFinalRoom$VaultTreasure();
    vis.setRect$int$int$int$int(treasure.left_, (treasure.top_ - 1) | 0, treasure.width(), (treasure.height() + 1) | 0);
    level.customTiles.add(vis);
    let doorVis = new VaultFinalRoom$FinalRoomDoor()._VaultFinalRoom$FinalRoomDoor();
    doorVis.pos$int$int(this.entryDoor.x, this.entryDoor.y);
    level.customTiles.add(doorVis);
    doorVis = new VaultFinalRoom$FinalRoomDoor()._VaultFinalRoom$FinalRoomDoor();
    doorVis.pos$int$int(this.lockedDoor.x, this.lockedDoor.y);
    level.customTiles.add(doorVis);
    let doorOver = new VaultFinalRoom$FinalRoomDoorOverhang()._VaultFinalRoom$FinalRoomDoorOverhang();
    doorOver.pos$int$int(this.entryDoor.x, (this.entryDoor.y - 1) | 0);
    level.customWalls.add(doorOver);
    doorOver = new VaultFinalRoom$FinalRoomDoorOverhang()._VaultFinalRoom$FinalRoomDoorOverhang();
    doorOver.pos$int$int(this.lockedDoor.x, (this.lockedDoor.y - 1) | 0);
    level.customWalls.add(doorOver);
  }
  processHeroStep(hero: Hero): void {
    if (!this.lockTriggered) {
      let heroPos = Dungeon.level.cellToPoint(hero.pos);
      let distance = Math.max(Math.abs((heroPos.x - this.lockedDoor.x) | 0), Math.abs((heroPos.y - this.lockedDoor.y) | 0));
      if (distance <= 3) {
        let bossPoss = Dungeon.level.pointToCell(this.center());
        if (Actor.findChar(bossPoss) != null) {
          let candidates = new ArrayList();
          for (let i of PathFinder.NEIGHBOURS8) {
            if ((Actor.findChar((bossPoss + i) | 0)) == null) {
              candidates.add((bossPoss + i) | 0);
            }
          }
          if (!candidates.isEmpty()) {
            bossPoss = Random.element$Collection(candidates);
          } else {
            return;
          }
        }
        Level.set$int$int(Dungeon.level.pointToCell(this.entryDoor), Terrain.LOCKED_DOOR);
        GameScene.updateMap$int(Dungeon.level.pointToCell(this.entryDoor));
        let boss = new VaultBossElemental()._VaultBossElemental();
        boss.pos = bossPoss;
        GameScene.add$Mob$float(boss, 1);
        boss.fieldOfView = $J.newArray(Dungeon.level.length(), false);
        Dungeon.level.updateFieldOfView(boss, boss.fieldOfView);
        boss.aggro(Dungeon.hero);
        boss.sprite_.turnTo(boss.pos, Dungeon.hero.pos);
        boss.setElementalForm(boss.curForm());
        Dungeon.level.seal();
        Level.set$int$int(Dungeon.level.pointToCell(this.entryDoor), Terrain.LOCKED_DOOR);
        GameScene.updateMap$int(Dungeon.level.pointToCell(this.entryDoor));
        GameScene.updateMap$int(Dungeon.level.pointToCell(this.lockedDoor));
        this.lockTriggered = true;
      } else if (distance === 4 && this.warnState < 2) {
        GLog.n(Messages.get$Class$String$ObjectArr($J.cls(VaultFinalRoom), 'final_warning', []), []);
        Sample.INSTANCE.play$Object(Assets$Sounds.CHARGEUP);
        hero.interrupt();
        this.warnState = 2;
      } else if (distance >= 5 && this.warnState === 2) {
        this.warnState = 1;
      } else if (distance <= 10 && this.warnState < 1) {
        hero.interrupt();
        Game.runOnRenderThread(new (VaultFinalRoom$1())().$o(this));
        this.warnState = 1;
      } else if (distance > 12) {
        this.warnState = 0;
      }
    }
  }
  elementalWasSummoned(): boolean {
    return this.lockTriggered;
  }
  unlock(): void {
    Level.set$int$int(Dungeon.level.pointToCell(this.entryDoor), Terrain.DOOR);
    GameScene.updateMap$int(Dungeon.level.pointToCell(this.entryDoor));
    Level.set$int$int(Dungeon.level.pointToCell(this.lockedDoor), Terrain.DOOR);
    GameScene.updateMap$int(Dungeon.level.pointToCell(this.lockedDoor));
    for (const $it6 = Dungeon.level.heaps.valueList().iterator(); $it6.hasNext(); ) {
      let h = $it6.next();
      let i = h.peek();
      if (i instanceof Ring && !i.levelKnown) {
        i.identify$boolean(false);
      }
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(VaultFinalRoom.ENTRY_DOOR_X, this.entryDoor.x);
    bundle.put$String$int(VaultFinalRoom.ENTRY_DOOR_Y, this.entryDoor.y);
    bundle.put$String$int(VaultFinalRoom.LOCKED_DOOR_X, this.lockedDoor.x);
    bundle.put$String$int(VaultFinalRoom.LOCKED_DOOR_Y, this.lockedDoor.y);
    bundle.put$String$int(VaultFinalRoom.WARN_STATE, this.warnState);
    bundle.put$String$boolean(VaultFinalRoom.LOCK_TRIGGERED, this.lockTriggered);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.entryDoor = new Point()._Point$();
    this.entryDoor.x = bundle.getInt(VaultFinalRoom.ENTRY_DOOR_X);
    this.entryDoor.y = bundle.getInt(VaultFinalRoom.ENTRY_DOOR_Y);
    this.lockedDoor = new Point()._Point$();
    this.lockedDoor.x = bundle.getInt(VaultFinalRoom.LOCKED_DOOR_X);
    this.lockedDoor.y = bundle.getInt(VaultFinalRoom.LOCKED_DOOR_Y);
    this.warnState = bundle.getInt(VaultFinalRoom.WARN_STATE);
    this.lockTriggered = bundle.getBoolean(VaultFinalRoom.LOCK_TRIGGERED);
  }
}

export class VaultFinalRoom$MarkerTiles extends CustomTilemap {
  TEX_WIDTH: number = 0;
  _VaultFinalRoom$MarkerTiles(): this {
    this._CustomTilemap();
    this.texture_ = Assets$Environment.CITY_QUEST;
    this.tileW = this.tileH = 9;
    this.TEX_WIDTH = 256;
    return this;
  }
  create(): Tilemap {
    let v = super.create();
    v.map(this.mapSimpleImage(5, 4, this.TEX_WIDTH), 9);
    return v;
  }
  image(tileX: number, tileY: number): Image {
    if (tileX === 0 || tileY === 0 || tileX === ((this.tileW - 1) | 0) || tileY === ((this.tileH - 1) | 0)) {
      return null;
    }
    if ((tileX === 1 || tileX === ((this.tileW - 2) | 0)) && (tileY === 1 || tileY === ((this.tileH - 2) | 0))) {
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
    if (this.tileW === 7) {
      this.tileW = this.tileH = 9;
      this.tileX = (this.tileX - 1) | 0;
      this.tileY = (this.tileY - 1) | 0;
    }
  }
}

export class VaultFinalRoom$FinalRoomDoor extends CustomTilemap {
  _VaultFinalRoom$FinalRoomDoor(): this {
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
    this.updateAll(data);
    return true;
  }
  updateAll(data: number[]): void {
    let w = Dungeon.level.width();
    let cell = (this.tileX + Math.imul(this.tileY, w)) | 0;
    if ((Dungeon.level.map_[(cell + w) | 0]) !== Terrain.WALL) {
      if (Dungeon.level.map_[cell] === Terrain.OPEN_DOOR || Dungeon.level.map_[cell] === Terrain.EMBERS) {
        data[0] = (Math.imul(16, 9) + 1) | 0;
      } else if (Dungeon.level.map_[cell] === Terrain.DOOR) {
        data[0] = (Math.imul(16, 9) + 2) | 0;
      } else if (Dungeon.level.map_[cell] === Terrain.LOCKED_DOOR) {
        data[0] = (Math.imul(16, 9) + (Dungeon.level.locked ? 3 : 2)) | 0;
      }
      if ((Dungeon.level.map_[(cell + w) | 0]) !== Terrain.EMPTY_SP) {
        data[0] = (data[0] + 16) | 0;
      } else if ((Dungeon.level.map_[(cell - w) | 0]) !== Terrain.EMPTY_SP) {
        data[0] = (data[0] + 32) | 0;
      }
    } else {
      data[0] = Math.imul(16, 12);
      if ((Dungeon.level.map_[(cell - 1) | 0]) !== Terrain.EMPTY_SP) {
        data[0] = (data[0] + 1) | 0;
      } else if ((Dungeon.level.map_[(cell + 1) | 0]) !== Terrain.EMPTY_SP) {
        data[0] = (data[0] + 2) | 0;
      }
    }
  }
  image(tileX: number, tileY: number): Image {
    if ((Dungeon.level.map_[(this.tileX + Math.imul(this.tileY, Dungeon.level.width())) | 0]) === Terrain.EMBERS) {
      return null;
    }
    let img = new Image()._Image$Object(this.texture_);
    if (!Dungeon.level.locked) {
      img.frame$int$int$int$int(32, 140, 16, 16);
    } else {
      img.frame$int$int$int$int(48, 140, 16, 16);
    }
    return img;
  }
  desc(tileX: number, tileY: number): string {
    if (Messages.lang() === Languages.ENGLISH) {
      if (!Dungeon.level.locked) {
        return 'This door has symbols on it that seem similar to the marker on this room\'s floor. Perhaps they\'re tied together in some way?';
      } else {
        return 'The symbols on the door are glowing and emitting the same energy as the greater elemental.\n\nThere\'s no way you\'re going to be able to open the door while it courses with the elemental\'s energy.';
      }
    } else {
      return super.desc(tileX, tileY);
    }
  }
}

export class VaultFinalRoom$FinalRoomDoorOverhang extends CustomTilemap {
  _VaultFinalRoom$FinalRoomDoorOverhang(): this {
    this._CustomTilemap();
    this.texture_ = Assets$Environment.CITY_QUEST;
    this.tileW = 1;
    this.tileH = 2;
    return this;
  }
  create(): Tilemap {
    let v = super.create();
    let data = $J.newArray(2, 0);
    this.updateCell(0, data);
    v.map(data, this.tileW);
    return v;
  }
  updateCell(cell: number, data: number[]): boolean {
    this.updateAll(data);
    return true;
  }
  updateAll(data: number[]): void {
    let w = Dungeon.level.width();
    let cell = (this.tileX + Math.imul(this.tileY, w) + w) | 0;
    if ((Dungeon.level.map_[(cell + w) | 0]) !== Terrain.WALL) {
      data[1] = -1;
      if (Dungeon.level.map_[cell] === Terrain.OPEN_DOOR || Dungeon.level.map_[cell] === Terrain.EMBERS) {
        data[0] = -1;
      } else if (Dungeon.level.map_[cell] === Terrain.DOOR) {
        data[0] = (Math.imul(16, 8) + 2) | 0;
      } else if (Dungeon.level.map_[cell] === Terrain.LOCKED_DOOR) {
        data[0] = (Math.imul(16, 8) + (Dungeon.level.locked ? 3 : 2)) | 0;
      }
    } else {
      if (Dungeon.level.map_[cell] === Terrain.OPEN_DOOR || Dungeon.level.map_[cell] === Terrain.EMBERS) {
        data[0] = -1;
        data[1] = -1;
      } else if (Dungeon.level.map_[cell] === Terrain.DOOR) {
        data[0] = Math.imul(16, 13);
        data[1] = (Math.imul(16, 13) + 3) | 0;
      } else if (Dungeon.level.map_[cell] === Terrain.LOCKED_DOOR) {
        data[0] = (Math.imul(16, 13) + (Dungeon.level.locked ? 2 : 1)) | 0;
        data[1] = (Math.imul(16, 13) + (Dungeon.level.locked ? 7 : 4)) | 0;
        if ((Dungeon.level.map_[(cell - 1) | 0]) !== Terrain.EMPTY_SP) {
          data[1] = (data[1] + 1) | 0;
        } else if ((Dungeon.level.map_[(cell + 1) | 0]) !== Terrain.EMPTY_SP) {
          data[1] = (data[1] + 2) | 0;
        }
      }
    }
  }
}

export class VaultFinalRoom$VaultTreasure extends CustomTilemap {
  _VaultFinalRoom$VaultTreasure(): this {
    this._CustomTilemap();
    this.texture_ = Assets$Environment.CITY_QUEST;
    return this;
  }
  create(): Tilemap {
    let v = super.create();
    let data = $J.newArray(Math.imul(this.tileW, this.tileH), 0);
    for (let i = 0; i < data.length; i++) {
      data[i] = -1;
      if (i < this.tileW) {
        if (i === 0) {
          data[i] = (Math.imul(5, 16) + 4) | 0;
        }
        if (i === ((this.tileW - 1) | 0)) {
          data[i] = (Math.imul(5, 16) + 3) | 0;
        }
      } else {
        let cell = (this.tileX + Math.imul(Dungeon.level.width(), this.tileY)) | 0;
        cell = (cell + (i % this.tileW + Math.imul(($J.idiv(i, this.tileW)), Dungeon.level.width()))) | 0;
        if (Dungeon.level.map_[cell] === Terrain.PEDESTAL) {
          data[i] = (Math.imul(7, 16) + 3) | 0;
        } else if ((Dungeon.level.map_[(cell - Dungeon.level.width()) | 0]) === Terrain.WALL || (Dungeon.level.map_[(cell - Dungeon.level.width()) | 0]) === Terrain.WALL_DECO) {
          data[i] = (Math.imul(6, 16) + 2) | 0;
          if ((Dungeon.level.map_[(cell + 1) | 0]) === Terrain.WALL) {
            data[i] = (data[i] + 1) | 0;
          } else if ((Dungeon.level.map_[(cell - 1) | 0]) === Terrain.WALL) {
            data[i] = (data[i] + 2) | 0;
          }
        } else {
          if ((Dungeon.level.map_[(cell + 1) | 0]) === Terrain.WALL) {
            data[i] = (Math.imul(6, 16) + 0) | 0;
          } else if ((Dungeon.level.map_[(cell - 1) | 0]) === Terrain.WALL) {
            data[i] = (Math.imul(6, 16) + 1) | 0;
          } else {
            data[i] = (Math.imul(7, 16) + $J.idiv(DungeonTileSheet.tileVariance[cell], 34)) | 0;
          }
        }
      }
    }
    v.map(data, this.tileW);
    return v;
  }
  image(tileX: number, tileY: number): Image {
    if (tileY < 1) {
      return null;
    }
    return super.image(tileX, tileY);
  }
  desc(tileX: number, tileY: number): string {
    let cell = (tileX + this.tileX + Math.imul(((tileY + this.tileY) | 0), Dungeon.level.width())) | 0;
    if (Dungeon.level.map_[cell] !== Terrain.PEDESTAL) {
      return Messages.get$Object$String$ObjectArr(this, 'desc', []);
    } else {
      return super.desc(tileX, tileY);
    }
  }
}

let $VaultFinalRoom$1: any = null;
/** An anonymous class (VaultFinalRoom.java:315). */
function VaultFinalRoom$1(): any {
  return $VaultFinalRoom$1 ??= $J.local(class extends JObject {
    call(): void {
      let prepCriteria = $J.newArray(4, false);
      for (const $it5 = Dungeon.hero.belongings.iterator(); $it5.hasNext(); ) {
        let i = $it5.next();
        if (i.level$() >= 2) {
          if (i instanceof MagesStaff) {
            if ((i).wandClass() != null) {
              prepCriteria[2] = true;
            }
          } else if (i instanceof MeleeWeapon) {
            prepCriteria[0] = true;
          } else if (i instanceof MissileWeapon) {
            prepCriteria[1] = true;
          } else if (i instanceof Armor) {
            prepCriteria[2] = true;
          } else if (i instanceof Wand) {
            prepCriteria[3] = true;
          }
        }
      }
      let prepared = true;
      for (let b of prepCriteria) {
        prepared = prepared && b;
      }
      if (!Imp$Quest.mirrorUsed) {
        prepared = false;
      }
      if (!prepared) {
        GameScene.show(new WndTitledMessage()._WndTitledMessage$Image$String$String(new ImpSprite()._ImpSprite(), Messages.titleCase(Messages.get$Class$String$ObjectArr($J.cls(Imp), 'name', [])), Messages.get$Class$String$ObjectArr($J.cls(VaultFinalRoom), 'imp_warning_unprepared', [])));
      } else {
        GameScene.show(new WndTitledMessage()._WndTitledMessage$Image$String$String(new ImpSprite()._ImpSprite(), Messages.titleCase(Messages.get$Class$String$ObjectArr($J.cls(Imp), 'name', [])), Messages.get$Class$String$ObjectArr($J.cls(VaultFinalRoom), 'imp_warning_prepared', [])));
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultFinalRoom$1', ['com.watabou.utils.Callback']);
}

$J.define(VaultFinalRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultFinalRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SpecialRoom', ctors: { '': '_VaultFinalRoom' }, meths: { 'canConnect(com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room)': 'canConnect$Room', 'canConnect(com.watabou.utils.Point)': 'canConnect$Point' } });
$J.define(VaultFinalRoom$MarkerTiles, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultFinalRoom$MarkerTiles', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_VaultFinalRoom$MarkerTiles' } });
$J.define(VaultFinalRoom$FinalRoomDoor, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultFinalRoom$FinalRoomDoor', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_VaultFinalRoom$FinalRoomDoor' } });
$J.define(VaultFinalRoom$FinalRoomDoorOverhang, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultFinalRoom$FinalRoomDoorOverhang', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_VaultFinalRoom$FinalRoomDoorOverhang' } });
$J.define(VaultFinalRoom$VaultTreasure, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultFinalRoom$VaultTreasure', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_VaultFinalRoom$VaultTreasure' } });
$J.module(() => {
  Assets$Environment = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Environment');
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Imp = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Imp');
  Imp$Quest = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Imp$Quest');
  VaultBossElemental = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultBossElemental');
  Armor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor');
  ImpStatue = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.ImpStatue');
  Ring = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.Ring');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  MagesStaff = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MagesStaff');
  MeleeWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon');
  MissileWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon');
  Level = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Room$Door$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.Room$Door$Type');
  EmptyRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.EmptyRoom');
  Languages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Languages');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ImpSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ImpSprite');
  DungeonTileSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTileSheet');
  Carpet = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.custom.Carpet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndTitledMessage = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndTitledMessage');
  Game = $J.load('com.watabou.noosa.Game');
  Image = $J.load('com.watabou.noosa.Image');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Point = $J.load('com.watabou.utils.Point');
  Random = $J.load('com.watabou.utils.Random');
});
