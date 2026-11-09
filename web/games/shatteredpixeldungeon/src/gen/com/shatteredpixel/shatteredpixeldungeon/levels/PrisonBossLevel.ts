// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/PrisonBossLevel.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, JEnum, JObject } from '../../../../../jre/index.ts';
import { Level } from './Level.ts';
import { CustomTilemap } from '../tiles/CustomTilemap.ts';

let Assets$Environment, Assets$Music, Assets$Sounds, Bones, Challenges, Dungeon, Statistics, Actor, Char, Char$Alignment, Char$Property, Blob, Regrowth, StormCloud, Doom, Mob, Tengu, Tengu$BombAbility$BombItem, Tengu$ShockerAbility$ShockerItem, CellEmitter, Speck, Heap$Type, Bomb, IronKey, HeavyBoomerang$CircleBack, Patch, PrisonLevel, Terrain, LevelTransition, LevelTransition$Type, Painter, TenguDartTrap, Messages, GameScene, TargetHealthIndicator, Camera, Game, Music, Sample, AlphaTweener, BArray, PathFinder, Point, Random, Rect;

export class PrisonBossLevel extends Level {
  state_: PrisonBossLevel$State = null;
  tengu: Tengu = null;
  static readonly STATE: string = 'state';
  static readonly TENGU: string = 'tengu';
  static readonly STORED_ITEMS: string = 'storeditems';
  static readonly TRIGGERED: string = 'triggered';
  static readonly ENTRANCE_POS: number = 138;
  static entranceRoom: Rect = null;
  static startHallway: Rect = null;
  static startCells: Rect[] = null;
  static tenguCell: Rect = null;
  static tenguCellCenter: Point = null;
  static tenguCellDoor: Point = null;
  static startTorches: Point[] = null;
  static pauseSafeArea: Rect = null;
  static arena: Rect = null;
  static W: number = 0;
  static D: number = 0;
  static e: number = 0;
  static E: number = 0;
  static C: number = 0;
  static endStart: Point = null;
  static levelExit: Point = null;
  static endMap: number[] = null;
  storedItems: ArrayList<Item> = null;
  triggered: boolean[] = null;
  _PrisonBossLevel(): this {
    this._Level();
    this.color1 = 6976061;
    this.color2 = 8950348;
    this.viewDistance = 12;
    this.storedItems = new ArrayList();
    this.triggered = [false, false, false, false];
    return this;
  }
  playLevelMusic(): void {
    if (this.state_ === PrisonBossLevel$State.START) {
      Music.INSTANCE.end();
    } else if (this.state_ === PrisonBossLevel$State.WON) {
      Music.INSTANCE.playTracks(PrisonLevel.PRISON_TRACK_LIST, PrisonLevel.PRISON_TRACK_CHANCES, false);
    } else {
      Music.INSTANCE.play$String$boolean(Assets$Music.PRISON_BOSS, true);
    }
  }
  state(): PrisonBossLevel$State {
    return this.state_;
  }
  tilesTex(): string {
    return Assets$Environment.TILES_PRISON;
  }
  waterTex(): string {
    return Assets$Environment.WATER_PRISON;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$Enum(PrisonBossLevel.STATE, this.state_);
    bundle.put$String$Bundlable(PrisonBossLevel.TENGU, this.tengu);
    bundle.put$String$Collection(PrisonBossLevel.STORED_ITEMS, this.storedItems);
    bundle.put$String$booleanArr(PrisonBossLevel.TRIGGERED, this.triggered);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.state_ = bundle.getEnum(PrisonBossLevel.STATE, $J.cls(PrisonBossLevel$State));
    if (this.state_ === PrisonBossLevel$State.START || this.state_ === PrisonBossLevel$State.FIGHT_PAUSE) {
      this.tengu = bundle.get$String(PrisonBossLevel.TENGU);
    } else {
      for (const $it0 = this.mobs.iterator(); $it0.hasNext(); ) {
        let mob = $it0.next();
        if (mob instanceof Tengu) {
          this.tengu = mob;
          break;
        }
      }
    }
    for (const $it1 = bundle.getCollection(PrisonBossLevel.STORED_ITEMS).iterator(); $it1.hasNext(); ) {
      let item = $it1.next();
      this.storedItems.add(item);
    }
    this.triggered = bundle.getBooleanArray(PrisonBossLevel.TRIGGERED);
  }
  build(): boolean {
    this.setSize(32, 32);
    this.state_ = PrisonBossLevel$State.START;
    this.setMapStart();
    return true;
  }
  setMapStart(): void {
    this.transitions.add(new LevelTransition()._LevelTransition$Level$int$Type(this, PrisonBossLevel.ENTRANCE_POS, LevelTransition$Type.REGULAR_ENTRANCE));
    Painter.fill$Level$int$int$int$int$int(this, 0, 0, 32, 32, Terrain.WALL);
    Painter.fill$Level$Rect$int(this, PrisonBossLevel.entranceRoom, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(this, PrisonBossLevel.entranceRoom, 1, Terrain.EMPTY);
    Painter.set$Level$int$int(this, PrisonBossLevel.ENTRANCE_POS, Terrain.ENTRANCE);
    Painter.fill$Level$Rect$int(this, PrisonBossLevel.startHallway, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(this, PrisonBossLevel.startHallway, 1, Terrain.EMPTY);
    Painter.set$Level$int$int$int(this, (PrisonBossLevel.startHallway.left_ + 1) | 0, PrisonBossLevel.startHallway.top_, Terrain.DOOR);
    for (let r of PrisonBossLevel.startCells) {
      Painter.fill$Level$Rect$int(this, r, Terrain.WALL);
      Painter.fill$Level$Rect$int$int(this, r, 1, Terrain.EMPTY);
    }
    Painter.set$Level$int$int$int(this, PrisonBossLevel.startHallway.left_, (PrisonBossLevel.startHallway.top_ + 5) | 0, Terrain.DOOR);
    Painter.set$Level$int$int$int(this, (PrisonBossLevel.startHallway.right_ - 1) | 0, (PrisonBossLevel.startHallway.top_ + 5) | 0, Terrain.DOOR);
    Painter.set$Level$int$int$int(this, PrisonBossLevel.startHallway.left_, (PrisonBossLevel.startHallway.top_ + 11) | 0, Terrain.DOOR);
    Painter.set$Level$int$int$int(this, (PrisonBossLevel.startHallway.right_ - 1) | 0, (PrisonBossLevel.startHallway.top_ + 11) | 0, Terrain.DOOR);
    Painter.fill$Level$Rect$int(this, PrisonBossLevel.tenguCell, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(this, PrisonBossLevel.tenguCell, 1, Terrain.EMPTY);
    Painter.set$Level$int$int$int(this, (PrisonBossLevel.tenguCell.left_ + 4) | 0, PrisonBossLevel.tenguCell.top_, Terrain.LOCKED_DOOR);
    for (let p of PrisonBossLevel.startTorches) {
      Painter.set$Level$Point$int(this, p, Terrain.WALL_DECO);
    }
    this.addCagesToCells();
    let exit = new LevelTransition()._LevelTransition$Level$int$Type(this, this.pointToCell(PrisonBossLevel.levelExit), LevelTransition$Type.REGULAR_EXIT);
    exit.right_ = (exit.right_ + 2) | 0;
    exit.bottom_ = (exit.bottom_ + 3) | 0;
    this.transitions.add(exit);
  }
  setMapPause(): void {
    this.setMapStart();
    this.transitions.clear();
    Painter.set$Level$int$int$int(this, (PrisonBossLevel.tenguCell.left_ + 4) | 0, PrisonBossLevel.tenguCell.top_, Terrain.DOOR);
    Painter.fill$Level$int$int$int$int$int(this, PrisonBossLevel.startCells[1].left_, (PrisonBossLevel.startCells[1].top_ + 3) | 0, 1, 7, Terrain.EMPTY);
    Painter.fill$Level$int$int$int$int$int(this, (PrisonBossLevel.startCells[1].left_ + 2) | 0, (PrisonBossLevel.startCells[1].top_ + 2) | 0, 3, 10, Terrain.EMPTY);
    Painter.fill$Level$Rect$int(this, PrisonBossLevel.entranceRoom, Terrain.WALL);
    Painter.set$Level$int$int$int(this, (PrisonBossLevel.startHallway.left_ + 1) | 0, PrisonBossLevel.startHallway.top_, Terrain.EMPTY);
    Painter.set$Level$int$int$int(this, (PrisonBossLevel.startHallway.left_ + 1) | 0, (PrisonBossLevel.startHallway.top_ + 1) | 0, Terrain.DOOR);
    this.addCagesToCells();
  }
  setMapArena(): void {
    this.transitions.clear();
    Painter.fill$Level$int$int$int$int$int(this, 0, 0, 32, 32, Terrain.WALL);
    Painter.fill$Level$Rect$int(this, PrisonBossLevel.arena, Terrain.WALL);
    Painter.fillEllipse$Level$Rect$int$int(this, PrisonBossLevel.arena, 1, Terrain.EMPTY);
  }
  setMapEnd(): void {
    Painter.fill$Level$int$int$int$int$int(this, 0, 0, 32, 32, Terrain.WALL);
    this.setMapStart();
    for (const $it2 = this.heaps.valueList().iterator(); $it2.hasNext(); ) {
      let h = $it2.next();
      if (h.peek() instanceof IronKey) {
        h.destroy();
      }
    }
    let vis = new PrisonBossLevel$ExitVisual()._PrisonBossLevel$ExitVisual();
    vis.pos$int$int(11, 10);
    this.customTiles.add(vis);
    GameScene.add$CustomTilemap$boolean(vis, false);
    vis = new PrisonBossLevel$ExitVisualWalls()._PrisonBossLevel$ExitVisualWalls();
    vis.pos$int$int(11, 10);
    this.customWalls.add(vis);
    GameScene.add$CustomTilemap$boolean(vis, true);
    Painter.set$Level$int$int$int(this, (PrisonBossLevel.tenguCell.left_ + 4) | 0, PrisonBossLevel.tenguCell.top_, Terrain.DOOR);
    let cell = this.pointToCell(PrisonBossLevel.endStart);
    let i = 0;
    while (cell < this.length()) {
      $J.system_arraycopy(PrisonBossLevel.endMap, i, this.map_, cell, 14);
      i = (i + 14) | 0;
      cell = (cell + this.width()) | 0;
    }
    this.addCagesToCells();
  }
  clearEntities(safeArea: Rect): void {
    for (const $it3 = this.heaps.valueList().iterator(); $it3.hasNext(); ) {
      let heap = $it3.next();
      if (safeArea == null || !safeArea.inside$Point(this.cellToPoint(heap.pos))) {
        for (const $it4 = heap.items_.iterator(); $it4.hasNext(); ) {
          let item = $it4.next();
          if (!(item instanceof Bomb) || (item).fuse == null) {
            this.storedItems.add(item);
          }
        }
        heap.destroy();
      }
    }
    for (const $it5 = Dungeon.hero.buffs$Class($J.cls(HeavyBoomerang$CircleBack)).iterator(); $it5.hasNext(); ) {
      let b = $it5.next();
      if (b.activeDepth() === Dungeon.depth && (safeArea == null || !safeArea.inside$Point(this.cellToPoint(b.returnPos())))) {
        this.storedItems.add(b.cancel());
      }
    }
    for (let mob of $J.toArrayInto(Dungeon.level.mobs.toArray(), $J.newArray(0, null))) {
      if (mob !== this.tengu && (safeArea == null || !safeArea.inside$Point(this.cellToPoint(mob.pos)))) {
        mob.destroy();
        if (mob.sprite_ != null) {
          mob.sprite_.killAndErase();
        }
      }
    }
    for (const $it6 = this.plants.valueList().iterator(); $it6.hasNext(); ) {
      let plant = $it6.next();
      if (safeArea == null || !safeArea.inside$Point(this.cellToPoint(plant.pos))) {
        this.plants.remove(plant.pos);
      }
    }
  }
  cleanMapState(): void {
    this.buildFlagMaps();
    this.cleanWalls();
    BArray.setFalse(this.visited);
    BArray.setFalse(this.mapped);
    for (const $it7 = this.blobs.values().iterator(); $it7.hasNext(); ) {
      let blob = $it7.next();
      blob.fullyClear();
    }
    this.addVisuals();
    this.traps.clear();
    for (let t of $J.toArrayInto(this.customTiles.toArray(), $J.newArray(0, null))) {
      if (t instanceof PrisonBossLevel$FadingTraps) {
        (t).remove();
      }
    }
    GameScene.resetMap();
    Dungeon.observe$();
  }
  addCagesToCells(): void {
    Random.pushGenerator$long(Dungeon.seedCurDepth());
    for (let i = 0; i < 5; i++) {
      let cell = this.randomPrisonCellPos();
      let valid = false;
      for (let j of PathFinder.NEIGHBOURS4) {
        if ((this.map_[(cell + j) | 0]) === Terrain.WALL) {
          valid = true;
        }
      }
      if (valid) {
        Painter.set$Level$int$int(this, cell, Terrain.REGION_DECO);
      }
    }
    Random.popGenerator();
  }
  addVisuals(): Group {
    super.addVisuals();
    PrisonLevel.addPrisonVisuals(this, this.visuals);
    return this.visuals;
  }
  progress(): void {
    {
      let tenguPos: number, tenguDoorPos: number, h: Heap, doorPos: number, d: Doom, allies: ArrayList<Mob>;
      switch (this.state_) {
        case PrisonBossLevel$State.START:
          tenguPos = this.pointToCell(PrisonBossLevel.tenguCellCenter);
          if (Actor.findChar(tenguPos) != null) {
            let candidates = new ArrayList();
            for (let i of PathFinder.NEIGHBOURS8) {
              if ((Actor.findChar((tenguPos + i) | 0)) == null) {
                candidates.add((tenguPos + i) | 0);
              }
            }
            if (!candidates.isEmpty()) {
              tenguPos = Random.element$Collection(candidates);
            } else {
              return;
            }
          }
          this.seal();
          Statistics.qualifiedForBossChallengeBadge = true;
          Level.set$int$int(this.pointToCell(PrisonBossLevel.tenguCellDoor), Terrain.LOCKED_DOOR);
          GameScene.updateMap$int(this.pointToCell(PrisonBossLevel.tenguCellDoor));
          tenguDoorPos = this.pointToCell(PrisonBossLevel.tenguCellDoor);
          h = this.heaps.get(tenguDoorPos);
          if (h != null) {
            for (const $it8 = h.items_.iterator(); $it8.hasNext(); ) {
              let i = $it8.next();
              (this.drop(i, (tenguDoorPos + this.width()) | 0)).sprite_.drop$int(tenguDoorPos);
            }
            h.destroy();
          }
          doorPos = this.pointToCell(PrisonBossLevel.tenguCellDoor);
          Mob.holdAllies$Level$int(this, doorPos);
          Mob.restoreAllies$Level$int$int(this, Dungeon.hero.pos, doorPos);
          this.tengu.state_ = this.tengu.HUNTING;
          this.tengu.pos = tenguPos;
          GameScene.add$Mob$float(this.tengu, 1);
          this.tengu.notice();
          CellEmitter.get(this.tengu.pos).burst(Speck.factory$int(Speck.WOOL), 6);
          Sample.INSTANCE.play$Object(Assets$Sounds.PUFF);
          this.state_ = PrisonBossLevel$State.FIGHT_START;
          Game.runOnRenderThread(new (PrisonBossLevel$1())().$o(this));
          break;
        case PrisonBossLevel$State.FIGHT_START:
          this.clearEntities(PrisonBossLevel.tenguCell);
          this.setMapPause();
          this.cleanMapState();
          d = this.tengu.buff($J.cls(Doom));
          Actor.remove(this.tengu);
          this.mobs.remove(this.tengu);
          this.tengu.clearTime();
          TargetHealthIndicator.instance.target$Char(null);
          this.tengu.sprite_.kill();
          if (d != null) {
            this.tengu.add(d);
          }
          GameScene.flash$int(-2130706433);
          Sample.INSTANCE.play$Object(Assets$Sounds.BLAST);
          this.state_ = PrisonBossLevel$State.FIGHT_PAUSE;
          break;
        case PrisonBossLevel$State.FIGHT_PAUSE:
          Dungeon.hero.interrupt();
          this.clearEntities(PrisonBossLevel.pauseSafeArea);
          this.setMapArena();
          this.cleanMapState();
          this.tengu.state_ = this.tengu.HUNTING;
          this.tengu.pos = (PrisonBossLevel.arena.left_ + $J.idiv(PrisonBossLevel.arena.width(), 2) + Math.imul(this.width(), ((PrisonBossLevel.arena.top_ + 2) | 0))) | 0;
          GameScene.add$Mob$float(this.tengu, 1);
          this.tengu.notice();
          CellEmitter.get(this.tengu.pos).burst(Speck.factory$int(Speck.WOOL), 6);
          GameScene.flash$int(-2130706433);
          Sample.INSTANCE.play$Object(Assets$Sounds.BLAST);
          this.state_ = PrisonBossLevel$State.FIGHT_ARENA;
          break;
        case PrisonBossLevel$State.FIGHT_ARENA:
          this.unseal();
          Dungeon.hero.interrupt();
          Dungeon.hero.pos = (PrisonBossLevel.tenguCell.left_ + 4 + Math.imul(((PrisonBossLevel.tenguCell.top_ + 2) | 0), this.width())) | 0;
          Dungeon.hero.sprite_.interruptMotion();
          Dungeon.hero.sprite_.place(Dungeon.hero.pos);
          Camera.main.snapTo$PointF(Dungeon.hero.sprite_.center$());
          this.tengu.pos = this.pointToCell(PrisonBossLevel.tenguCellCenter);
          this.tengu.sprite_.place(this.tengu.pos);
          allies = new ArrayList();
          for (let m of $J.toArrayInto(this.mobs.toArray(), $J.newArray(0, null))) {
            if (m.alignment === Char$Alignment.ALLY && !m.properties().contains(Char$Property.IMMOVABLE)) {
              allies.add(m);
              this.mobs.remove(m);
            }
          }
          this.setMapEnd();
          for (const $it9 = allies.iterator(); $it9.hasNext(); ) {
            let m = $it9.next();
            do {
              m.pos = this.randomTenguCellPos();
            } while (this.findMob(m.pos) != null || m.pos === Dungeon.hero.pos);
            if (m.sprite_ != null) {
              m.sprite_.place(m.pos);
            }
            this.mobs.add(m);
          }
          this.tengu.die(Dungeon.hero);
          this.clearEntities(PrisonBossLevel.tenguCell);
          this.cleanMapState();
          for (const $it10 = this.storedItems.iterator(); $it10.hasNext(); ) {
            let item = $it10.next();
            if (!(item instanceof Tengu$BombAbility$BombItem) && !(item instanceof Tengu$ShockerAbility$ShockerItem)) {
              this.drop(item, this.randomTenguCellPos());
            }
          }
          GameScene.flash$int(-2130706433);
          Sample.INSTANCE.play$Object(Assets$Sounds.BLAST);
          this.state_ = PrisonBossLevel$State.WON;
          Game.runOnRenderThread(new (PrisonBossLevel$2())().$o(this));
          break;
      }
    }
  }
  occupyCell(ch: Char): void {
    if (ch === Dungeon.hero) {
      switch (this.state_) {
        case PrisonBossLevel$State.START:
          if (this.cellToPoint(ch.pos).y > PrisonBossLevel.tenguCell.top_) {
            this.progress();
          }
          break;
        case PrisonBossLevel$State.FIGHT_PAUSE:
          if (this.cellToPoint(ch.pos).y <= ((PrisonBossLevel.startHallway.top_ + 1) | 0)) {
            this.progress();
          }
          break;
      }
    }
    super.occupyCell(ch);
  }
  createMobs(): void {
    this.tengu = new Tengu()._Tengu();
  }
  addRespawner(): Actor {
    return null;
  }
  createItems(): void {
    Random.pushGenerator$long(Random.Long$());
    let bonesItems = Bones.get();
    if (bonesItems != null) {
      let pos: number;
      do {
        pos = this.randomRespawnCell(null);
      } while (pos === this.entrance());
      for (const $it11 = bonesItems.iterator(); $it11.hasNext(); ) {
        let i = $it11.next();
        this.drop(i, pos).setHauntedIfCursed().type_ = Heap$Type.REMAINS;
      }
    }
    Random.popGenerator();
    let pos: number;
    do {
      pos = this.randomPrisonCellPos();
    } while (this.solid[pos]);
    this.drop(new IronKey()._IronKey$int(10), pos);
  }
  getItemsToPreserveFromSealedResurrect(): ArrayList<Item> {
    let items = super.getItemsToPreserveFromSealedResurrect();
    items.addAll(this.storedItems);
    for (let i of $J.toArrayInto(items.toArray(), $J.newArray(0, null))) {
      if (i instanceof Tengu$BombAbility$BombItem || i instanceof Tengu$ShockerAbility$ShockerItem) {
        items.remove(i);
      }
    }
    return items;
  }
  randomPrisonCellPos(): number {
    let room = PrisonBossLevel.startCells[Random.Int$int(PrisonBossLevel.startCells.length)];
    return ((Random.IntRange((room.left_ + 1) | 0, (room.right_ - 2) | 0)) + Math.imul(this.width(), Random.IntRange((room.top_ + 1) | 0, (room.bottom_ - 2) | 0))) | 0;
  }
  randomTenguCellPos(): number {
    return ((Random.IntRange((PrisonBossLevel.tenguCell.left_ + 1) | 0, (PrisonBossLevel.tenguCell.right_ - 2) | 0)) + Math.imul(this.width(), Random.IntRange((PrisonBossLevel.tenguCell.top_ + 1) | 0, (PrisonBossLevel.tenguCell.bottom_ - 2) | 0))) | 0;
  }
  cleanTenguCell(): void {
    this.traps.clear();
    Painter.fill$Level$Rect$int$int(this, PrisonBossLevel.tenguCell, 1, Terrain.EMPTY);
    this.buildFlagMaps();
    for (let vis of $J.toArrayInto(this.customTiles.toArray(), $J.newArray(0, null))) {
      if (vis instanceof PrisonBossLevel$FadingTraps) {
        (vis).remove();
      }
    }
  }
  placeTrapsInTenguCell(fill: number): void {
    let tenguPoint = this.cellToPoint(this.tengu.pos);
    let heroPoint = this.cellToPoint(Dungeon.hero.pos);
    PathFinder.setMapSize(7, 7);
    let tenguPos = (tenguPoint.x - (PrisonBossLevel.tenguCell.left_ + 1) + Math.imul(((tenguPoint.y - (PrisonBossLevel.tenguCell.top_ + 1)) | 0), 7)) | 0;
    let heroPos = (heroPoint.x - (PrisonBossLevel.tenguCell.left_ + 1) + Math.imul(((heroPoint.y - (PrisonBossLevel.tenguCell.top_ + 1)) | 0), 7)) | 0;
    let trapsPatch: boolean[];
    if (Dungeon.isChallenged(Challenges.STRONGER_BOSSES)) {
      fill = Math.fround(Math.fround(0.675) + Math.fround(fill / 4));
    }
    let tries = 0;
    do {
      tries++;
      if (tries >= 100) {
        tries = 0;
        fill = Math.fround(fill - Math.fround(0.01));
      }
      trapsPatch = Patch.generate(7, 7, fill, 0, false);
      PathFinder.buildDistanceMap$int$booleanArr(tenguPos, BArray.not(trapsPatch, null));
    } while ((PathFinder.distance[heroPos] < Math.ceil(Math.fround(7 * fill))) || (PathFinder.distance[heroPos] > Math.ceil(Math.fround(4 + Math.fround(4 * fill)))));
    $J.out.println(String(tries));
    PathFinder.setMapSize(this.width(), this.height());
    for (let i = 0; i < trapsPatch.length; i++) {
      if (trapsPatch[i]) {
        let x = i % 7;
        let y = $J.idiv(i, 7);
        let cell = (x + PrisonBossLevel.tenguCell.left_ + 1 + Math.imul(((y + PrisonBossLevel.tenguCell.top_ + 1) | 0), this.width())) | 0;
        if (Blob.volumeAt(cell, $J.cls(StormCloud)) === 0 && Blob.volumeAt(cell, $J.cls(Regrowth)) <= 9 && Dungeon.level.plants.get(cell) == null && Actor.findChar(cell) == null) {
          Level.set$int$int(cell, Terrain.SECRET_TRAP);
          this.setTrap(new TenguDartTrap()._TenguDartTrap().hide(), cell);
          CellEmitter.get(cell).burst(Speck.factory$int(Speck.LIGHT), 2);
        }
      }
    }
    GameScene.updateMap$();
    let t = new PrisonBossLevel$FadingTraps()._PrisonBossLevel$FadingTraps();
    t.fadeDelay = 2;
    t.setCoveringArea(PrisonBossLevel.tenguCell);
    GameScene.add$CustomTilemap$boolean(t, false);
    this.customTiles.add(t);
  }
  randomRespawnCell(ch: Char): number {
    let candidates = new ArrayList();
    for (let i of PathFinder.NEIGHBOURS8) {
      let cell = (PrisonBossLevel.ENTRANCE_POS + i) | 0;
      if (this.passable[cell] && Actor.findChar(cell) == null && (!Char.hasProp(ch, Char$Property.LARGE) || this.openSpace[cell])) {
        candidates.add(cell);
      }
    }
    if (candidates.isEmpty()) {
      return -1;
    } else {
      return Random.element$Collection(candidates);
    }
  }
  tileName(tile: number): string {
    switch (tile) {
      case Terrain.WATER:
        return Messages.get$Class$String$ObjectArr($J.cls(PrisonLevel), 'water_name', []);
      case Terrain.REGION_DECO:
      case Terrain.REGION_DECO_ALT:
        return Messages.get$Class$String$ObjectArr($J.cls(PrisonLevel), 'region_deco_name', []);
      default:
        return super.tileName(tile);
    }
  }
  tileDesc(tile: number): string {
    switch (tile) {
      case Terrain.EMPTY_DECO:
        return Messages.get$Class$String$ObjectArr($J.cls(PrisonLevel), 'empty_deco_desc', []);
      case Terrain.BOOKSHELF:
        return Messages.get$Class$String$ObjectArr($J.cls(PrisonLevel), 'bookshelf_desc', []);
      case Terrain.REGION_DECO:
      case Terrain.REGION_DECO_ALT:
        return Messages.get$Class$String$ObjectArr($J.cls(PrisonLevel), 'region_deco_desc', []);
      default:
        return super.tileDesc(tile);
    }
  }
  static $clinit() {
    PrisonBossLevel.entranceRoom = new Rect()._Rect$int$int$int$int(8, 2, 13, 8);
    PrisonBossLevel.startHallway = new Rect()._Rect$int$int$int$int(9, 7, 12, 24);
    PrisonBossLevel.startCells = [new Rect()._Rect$int$int$int$int(5, 9, 10, 16), new Rect()._Rect$int$int$int$int(11, 9, 16, 16), new Rect()._Rect$int$int$int$int(5, 15, 10, 22), new Rect()._Rect$int$int$int$int(11, 15, 16, 22)];
    PrisonBossLevel.tenguCell = new Rect()._Rect$int$int$int$int(6, 23, 15, 32);
    PrisonBossLevel.tenguCellCenter = new Point()._Point$int$int(10, 27);
    PrisonBossLevel.tenguCellDoor = new Point()._Point$int$int(10, 23);
    PrisonBossLevel.startTorches = [new Point()._Point$int$int(10, 2), new Point()._Point$int$int(7, 9), new Point()._Point$int$int(13, 9), new Point()._Point$int$int(7, 15), new Point()._Point$int$int(13, 15), new Point()._Point$int$int(8, 23), new Point()._Point$int$int(12, 23)];
    PrisonBossLevel.pauseSafeArea = new Rect()._Rect$int$int$int$int(9, 2, 12, 12);
    PrisonBossLevel.arena = new Rect()._Rect$int$int$int$int(3, 1, 18, 16);
    PrisonBossLevel.W = Terrain.WALL;
    PrisonBossLevel.D = Terrain.WALL_DECO;
    PrisonBossLevel.e = Terrain.EMPTY;
    PrisonBossLevel.E = Terrain.EXIT;
    PrisonBossLevel.C = Terrain.CHASM;
    PrisonBossLevel.endStart = new Point()._Point$int$int((PrisonBossLevel.startHallway.left_ + 2) | 0, (PrisonBossLevel.startHallway.top_ + 2) | 0);
    PrisonBossLevel.levelExit = new Point()._Point$int$int((PrisonBossLevel.endStart.x + 11) | 0, (PrisonBossLevel.endStart.y + 6) | 0);
    PrisonBossLevel.endMap = [PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.D, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.W, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.C, PrisonBossLevel.C, PrisonBossLevel.C, PrisonBossLevel.C, PrisonBossLevel.C, PrisonBossLevel.C, PrisonBossLevel.C, PrisonBossLevel.C, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.W, PrisonBossLevel.e, PrisonBossLevel.W, PrisonBossLevel.C, PrisonBossLevel.C, PrisonBossLevel.C, PrisonBossLevel.C, PrisonBossLevel.C, PrisonBossLevel.C, PrisonBossLevel.C, PrisonBossLevel.C, PrisonBossLevel.C, PrisonBossLevel.E, PrisonBossLevel.E, PrisonBossLevel.W, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.C, PrisonBossLevel.C, PrisonBossLevel.C, PrisonBossLevel.C, PrisonBossLevel.C, PrisonBossLevel.C, PrisonBossLevel.C, PrisonBossLevel.C, PrisonBossLevel.E, PrisonBossLevel.E, PrisonBossLevel.W, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.C, PrisonBossLevel.C, PrisonBossLevel.C, PrisonBossLevel.C, PrisonBossLevel.C, PrisonBossLevel.C, PrisonBossLevel.E, PrisonBossLevel.E, PrisonBossLevel.W, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.C, PrisonBossLevel.C, PrisonBossLevel.C, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.C, PrisonBossLevel.C, PrisonBossLevel.C, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.C, PrisonBossLevel.C, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.C, PrisonBossLevel.C, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.C, PrisonBossLevel.C, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.D, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.C, PrisonBossLevel.C, PrisonBossLevel.W, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.C, PrisonBossLevel.C, PrisonBossLevel.W, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.C, PrisonBossLevel.C, PrisonBossLevel.W, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.C, PrisonBossLevel.C, PrisonBossLevel.W, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.C, PrisonBossLevel.C, PrisonBossLevel.W, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.C, PrisonBossLevel.C, PrisonBossLevel.W, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.C, PrisonBossLevel.C, PrisonBossLevel.W, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.e, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.C, PrisonBossLevel.C, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.W, PrisonBossLevel.C, PrisonBossLevel.C, PrisonBossLevel.W];
  }
}

export class PrisonBossLevel$State extends JEnum {
  static START: PrisonBossLevel$State = null;
  static FIGHT_START: PrisonBossLevel$State = null;
  static FIGHT_PAUSE: PrisonBossLevel$State = null;
  static FIGHT_ARENA: PrisonBossLevel$State = null;
  static WON: PrisonBossLevel$State = null;
  static $VALUES: PrisonBossLevel$State[] = null;
  _PrisonBossLevel$State($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): PrisonBossLevel$State[] { return PrisonBossLevel$State.$VALUES.slice(); }
  static valueOf(name: string): PrisonBossLevel$State { return $J.enumValueOf(PrisonBossLevel$State, name); }
  static $clinit() {
    PrisonBossLevel$State.START = new PrisonBossLevel$State()._PrisonBossLevel$State('START', 0);
    PrisonBossLevel$State.FIGHT_START = new PrisonBossLevel$State()._PrisonBossLevel$State('FIGHT_START', 1);
    PrisonBossLevel$State.FIGHT_PAUSE = new PrisonBossLevel$State()._PrisonBossLevel$State('FIGHT_PAUSE', 2);
    PrisonBossLevel$State.FIGHT_ARENA = new PrisonBossLevel$State()._PrisonBossLevel$State('FIGHT_ARENA', 3);
    PrisonBossLevel$State.WON = new PrisonBossLevel$State()._PrisonBossLevel$State('WON', 4);
    PrisonBossLevel$State.$VALUES = [PrisonBossLevel$State.START, PrisonBossLevel$State.FIGHT_START, PrisonBossLevel$State.FIGHT_PAUSE, PrisonBossLevel$State.FIGHT_ARENA, PrisonBossLevel$State.WON];
  }
}

export class PrisonBossLevel$FadingTraps extends CustomTilemap {
  area: Rect = null;
  fadeDuration: number = 0;
  initialAlpha: number = 0;
  fadeDelay: number = 0;
  _PrisonBossLevel$FadingTraps(): this {
    this._CustomTilemap();
    this.texture_ = Assets$Environment.TERRAIN_FEATURES;
    this.fadeDuration = 1;
    this.initialAlpha = Math.fround(0.4);
    this.fadeDelay = 1;
    return this;
  }
  setCoveringArea(area: Rect): void {
    this.tileX = area.left_;
    this.tileY = area.top_;
    this.tileH = (area.bottom_ - area.top_) | 0;
    this.tileW = (area.right_ - area.left_) | 0;
    this.area = area;
  }
  create(): Tilemap {
    let v = super.create();
    let data = $J.newArray(Math.imul(this.tileW, this.tileH), 0);
    let cell: number;
    let t: Trap;
    let i = 0;
    for (let y = this.tileY; y < ((this.tileY + this.tileH) | 0); y++) {
      cell = (this.tileX + Math.imul(y, Dungeon.level.width())) | 0;
      for (let x = this.tileX; x < ((this.tileX + this.tileW) | 0); x++) {
        t = Dungeon.level.traps.get(cell);
        if (t != null) {
          data[i] = (t.color_ + Math.imul(t.shape, 16)) | 0;
        } else {
          data[i] = -1;
        }
        cell++;
        i++;
      }
    }
    v.map(data, this.tileW);
    this.setFade();
    return v;
  }
  name(tileX: number, tileY: number): string {
    let cell = (this.tileX + tileX + Math.imul(Dungeon.level.width(), ((this.tileY + tileY) | 0))) | 0;
    if (Dungeon.level.traps.get(cell) != null) {
      return Messages.titleCase(Dungeon.level.traps.get(cell).name());
    }
    return super.name(tileX, tileY);
  }
  desc(tileX: number, tileY: number): string {
    let cell = (this.tileX + tileX + Math.imul(Dungeon.level.width(), ((this.tileY + tileY) | 0))) | 0;
    if (Dungeon.level.traps.get(cell) != null) {
      return Dungeon.level.traps.get(cell).desc();
    }
    return super.desc(tileX, tileY);
  }
  setFade(): void {
    if (this.vis == null) {
      return;
    }
    this.vis.alpha$float(this.initialAlpha);
    Actor.addDelayed(new (PrisonBossLevel$FadingTraps$1())().$o(this)._Actor().$init_anon(), this.fadeDelay);
  }
  remove(): void {
    if (this.vis != null) {
      this.vis.killAndErase();
    }
    Dungeon.level.customTiles.remove(this);
  }
}

export class PrisonBossLevel$ExitVisual extends CustomTilemap {
  TEX_WIDTH: number = 0;
  static render: number[] = null;
  _PrisonBossLevel$ExitVisual(): this {
    this._CustomTilemap();
    this.texture_ = Assets$Environment.PRISON_EXIT;
    this.tileW = 14;
    this.tileH = 11;
    this.TEX_WIDTH = 256;
    return this;
  }
  create(): Tilemap {
    let v = super.create();
    let data = this.mapSimpleImage(0, 0, this.TEX_WIDTH);
    for (let i = 0; i < data.length; i++) {
      if (PrisonBossLevel$ExitVisual.render[i] === 0) {
        data[i] = -1;
      }
    }
    v.map(data, this.tileW);
    return v;
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.tileX = 11;
    this.tileY = 10;
    this.tileW = 14;
    this.tileH = 11;
  }
  static $clinit() {
    PrisonBossLevel$ExitVisual.render = [0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  }
}

export class PrisonBossLevel$ExitVisualWalls extends CustomTilemap {
  TEX_WIDTH: number = 0;
  static render: number[] = null;
  _PrisonBossLevel$ExitVisualWalls(): this {
    this._CustomTilemap();
    this.texture_ = Assets$Environment.PRISON_EXIT;
    this.tileW = 14;
    this.tileH = 22;
    this.TEX_WIDTH = 256;
    return this;
  }
  create(): Tilemap {
    let v = super.create();
    let data = this.mapSimpleImage(0, 10, this.TEX_WIDTH);
    for (let i = 0; i < data.length; i++) {
      if (PrisonBossLevel$ExitVisualWalls.render[i] === 0) {
        data[i] = -1;
      }
    }
    v.map(data, this.tileW);
    return v;
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.tileX = 11;
    this.tileY = 10;
    this.tileW = 14;
    this.tileH = 22;
  }
  static $clinit() {
    PrisonBossLevel$ExitVisualWalls.render = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1];
  }
}

let $PrisonBossLevel$1: any = null;
/** An anonymous class (PrisonBossLevel.java:460). */
function PrisonBossLevel$1(): any {
  return $PrisonBossLevel$1 ??= $J.local(class extends JObject {
    call(): void {
      Music.INSTANCE.play$String$boolean(Assets$Music.PRISON_BOSS, true);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.PrisonBossLevel$1', ['com.watabou.utils.Callback']);
}

let $PrisonBossLevel$2$1: any = null;
/** An anonymous class (PrisonBossLevel.java:562). */
function PrisonBossLevel$2$1(): any {
  return $PrisonBossLevel$2$1 ??= $J.local(class extends JObject {
    call(): void {
      Music.INSTANCE.end();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.PrisonBossLevel$2$1', ['com.watabou.utils.Callback']);
}

let $PrisonBossLevel$2: any = null;
/** An anonymous class (PrisonBossLevel.java:559). */
function PrisonBossLevel$2(): any {
  return $PrisonBossLevel$2 ??= $J.local(class extends JObject {
    call(): void {
      Music.INSTANCE.fadeOut(5, new (PrisonBossLevel$2$1())().$o(this));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.PrisonBossLevel$2', ['com.watabou.utils.Callback']);
}

let $PrisonBossLevel$FadingTraps$1$1: any = null;
/** An anonymous class (PrisonBossLevel.java:862). */
function PrisonBossLevel$FadingTraps$1$1(): any {
  return $PrisonBossLevel$FadingTraps$1$1 ??= $J.local(class extends AlphaTweener {
    onComplete(): void {
      super.onComplete();
      this.$outer.$outer.vis.killAndErase();
      this.killAndErase();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.PrisonBossLevel$FadingTraps$1$1', []);
}

let $PrisonBossLevel$FadingTraps$1: any = null;
/** An anonymous class (PrisonBossLevel.java:850). */
function PrisonBossLevel$FadingTraps$1(): any {
  return $PrisonBossLevel$FadingTraps$1 ??= $J.local(class extends Actor {
    $init_anon() {
      this.actPriority = (Actor.HERO_PRIO + 1) | 0;
      return this;
    }
    act(): boolean {
      Actor.remove(this);
      if (this.$outer.vis != null && this.$outer.vis.parent != null) {
        Dungeon.level.customTiles.remove(this.$outer);
        this.$outer.vis.parent.add$Gizmo(new (PrisonBossLevel$FadingTraps$1$1())().$o(this)._AlphaTweener(this.$outer.vis, 0, this.$outer.fadeDuration));
      }
      return true;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.PrisonBossLevel$FadingTraps$1', []);
}

$J.define(PrisonBossLevel, 'com.shatteredpixel.shatteredpixeldungeon.levels.PrisonBossLevel', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.Level', ctors: { '': '_PrisonBossLevel' }, clinit: true, lazy: ['entranceRoom', 'startHallway', 'startCells', 'tenguCell', 'tenguCellCenter', 'tenguCellDoor', 'startTorches', 'pauseSafeArea', 'arena', 'W', 'D', 'e', 'E', 'C', 'endStart', 'levelExit', 'endMap'] });
$J.define(PrisonBossLevel$State, 'com.shatteredpixel.shatteredpixeldungeon.levels.PrisonBossLevel$State', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_PrisonBossLevel$State' }, clinit: true, lazy: ['$VALUES', 'START', 'FIGHT_START', 'FIGHT_PAUSE', 'FIGHT_ARENA', 'WON'] });
$J.define(PrisonBossLevel$FadingTraps, 'com.shatteredpixel.shatteredpixeldungeon.levels.PrisonBossLevel$FadingTraps', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_PrisonBossLevel$FadingTraps' } });
$J.define(PrisonBossLevel$ExitVisual, 'com.shatteredpixel.shatteredpixeldungeon.levels.PrisonBossLevel$ExitVisual', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_PrisonBossLevel$ExitVisual' }, clinit: true, lazy: ['render'] });
$J.define(PrisonBossLevel$ExitVisualWalls, 'com.shatteredpixel.shatteredpixeldungeon.levels.PrisonBossLevel$ExitVisualWalls', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_PrisonBossLevel$ExitVisualWalls' }, clinit: true, lazy: ['render'] });
$J.module(() => {
  Assets$Environment = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Environment');
  Assets$Music = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Music');
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Bones = $J.load('com.shatteredpixel.shatteredpixeldungeon.Bones');
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Blob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob');
  Regrowth = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Regrowth');
  StormCloud = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.StormCloud');
  Doom = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Doom');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  Tengu = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Tengu');
  Tengu$BombAbility$BombItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Tengu$BombAbility$BombItem');
  Tengu$ShockerAbility$ShockerItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Tengu$ShockerAbility$ShockerItem');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  Bomb = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bombs.Bomb');
  IronKey = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.keys.IronKey');
  HeavyBoomerang$CircleBack = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.HeavyBoomerang$CircleBack');
  Patch = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Patch');
  PrisonLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.PrisonLevel');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  LevelTransition = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition');
  LevelTransition$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition$Type');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  TenguDartTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.TenguDartTrap');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  TargetHealthIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.TargetHealthIndicator');
  Camera = $J.load('com.watabou.noosa.Camera');
  Game = $J.load('com.watabou.noosa.Game');
  Music = $J.load('com.watabou.noosa.audio.Music');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  AlphaTweener = $J.load('com.watabou.noosa.tweeners.AlphaTweener');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Point = $J.load('com.watabou.utils.Point');
  Random = $J.load('com.watabou.utils.Random');
  Rect = $J.load('com.watabou.utils.Rect');
});
