// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/RegularLevel.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, HashMap, HashSet } from '../../../../../jre/index.ts';
import { Level } from './Level.ts';

let Bones, Challenges, Dungeon, Dungeon$LimitedDrops, Statistics, Actor, Char, Char$Alignment, Char$Property, SacrificialFire, Buff, Talent, Talent$CachedRationsDropped, EbonyMimic, GoldenMimic, Mimic, Statue, Ghost$Quest, Generator, Heap$Type, Torch, Artifact, DriedRose, DriedRose$Petal, SupplyRation, GuidePage, RegionLorePage, CrystalKey, GoldenKey, Key, CrackedSpyglass, MimicTooth, TrinketCatalyst, Document, Notes, Notes$KeyRecord, Level$Feeling, Terrain, FigureEightBuilder, LoopBuilder, SecretRoom, MagicalFireRoom, MagicalFireRoom$EternalFire, PitRoom, SacrificeRoom, ShopRoom, SpecialRoom, StatueRoom, StandardRoom, EntranceRoom, ExitRoom, BlazingTrap, BurningTrap, ChillingTrap, DisintegrationTrap, ExplosiveTrap, FrostTrap, PitfallTrap, WornDartTrap, ShadowCaster, BArray, PathFinder, Random;

export class RegularLevel extends Level {
  rooms_: ArrayList<Room> = null;
  builder_: Builder = null;
  roomEntrance: Room = null;
  roomExit: Room = null;
  static limitedDocs: HashMap<Document, Dungeon$LimitedDrops> = null;
  _RegularLevel(): this {
    this._Level();
    return this;
  }
  build(): boolean {
    this.builder_ = this.builder();
    let initRooms = this.initRooms();
    Random.shuffle$List(initRooms);
    do {
      for (const $it0 = initRooms.iterator(); $it0.hasNext(); ) {
        let r = $it0.next();
        r.neigbours.clear();
        r.connected_.clear();
      }
      this.rooms_ = this.builder_.build(initRooms.clone());
    } while (this.rooms_ == null);
    return this.painter().paint(this, this.rooms_);
  }
  initRooms(): ArrayList<Room> {
    let initRooms = new ArrayList();
    initRooms.add(this.roomEntrance = EntranceRoom.createEntrance());
    initRooms.add(this.roomExit = ExitRoom.createExit());
    let standards = this.standardRooms(this.feeling === Level$Feeling.LARGE);
    if (this.feeling === Level$Feeling.LARGE) {
      standards = $J.d2i(Math.ceil(Math.fround(standards * 1.5)));
    }
    for (let i = 0; i < standards; i++) {
      let s: StandardRoom;
      do {
        s = StandardRoom.createRoom();
      } while (!s.setSizeCat$int((standards - i) | 0));
      i = (i + (s.sizeFactor() - 1)) | 0;
      initRooms.add(s);
    }
    if (Dungeon.shopOnLevel()) {
      initRooms.add(new ShopRoom()._ShopRoom());
    }
    let specials = this.specialRooms(this.feeling === Level$Feeling.LARGE);
    if (this.feeling === Level$Feeling.LARGE) {
      specials++;
    }
    SpecialRoom.initForFloor();
    for (let i = 0; i < specials; i++) {
      let s = SpecialRoom.createRoom();
      if (s instanceof PitRoom) {
        specials++;
      }
      initRooms.add(s);
    }
    let secrets = SecretRoom.secretsForFloor(Dungeon.depth);
    if (this.feeling === Level$Feeling.SECRETS) {
      secrets++;
    }
    for (let i = 0; i < secrets; i++) {
      initRooms.add(SecretRoom.createRoom());
    }
    return initRooms;
  }
  standardRooms(forceMax: boolean): number {
    return 0;
  }
  specialRooms(forceMax: boolean): number {
    return 0;
  }
  builder(): Builder {
    if (Random.Int$int(2) === 0) {
      return new LoopBuilder()._LoopBuilder().setLoopShape(2, Random.Float$float$float(0, Math.fround(0.65)), Random.Float$float$float(0, 0.5));
    } else {
      return new FigureEightBuilder()._FigureEightBuilder().setLoopShape(2, Random.Float$float$float(Math.fround(0.3), Math.fround(0.8)), 0);
    }
  }
  nTraps(): number {
    return Random.NormalIntRange(2, (3 + ($J.idiv(Dungeon.depth, 5))) | 0);
  }
  trapClasses(): JClass<any>[] {
    return [$J.cls(WornDartTrap)];
  }
  trapChances(): number[] {
    return [1];
  }
  mobLimit(): number {
    if (Dungeon.depth <= 1) {
      if (!Statistics.amuletObtained) {
        return 0;
      } else {
        return 10;
      }
    }
    let mobs = (3 + Dungeon.depth % 5 + Random.Int$int(3)) | 0;
    if (this.feeling === Level$Feeling.LARGE) {
      mobs = $J.d2i(Math.ceil(Math.fround(mobs * Math.fround(1.33))));
    }
    return mobs;
  }
  createMobs(): void {
    let mobsToSpawn = Dungeon.depth === 1 ? 8 : this.mobLimit();
    let stdRooms = new ArrayList();
    for (const $it1 = this.rooms_.iterator(); $it1.hasNext(); ) {
      let room = $it1.next();
      if (room instanceof StandardRoom) {
        for (let i = 0; i < (room).mobSpawnWeight(); i++) {
          stdRooms.add(room);
        }
      }
    }
    Random.shuffle$List(stdRooms);
    let stdRoomIter = stdRooms.iterator();
    let entranceFOV = $J.newArray(this.length(), false);
    let c = this.cellToPoint(this.entrance());
    ShadowCaster.castShadow(c.x, c.y, this.width(), entranceFOV, this.losBlocking, 8);
    let entranceWalkable = BArray.not(this.solid, null);
    for (let y = (this.roomEntrance.top_ + 1) | 0; y < this.roomEntrance.bottom_; y++) {
      for (let x = (this.roomEntrance.left_ + 1) | 0; x < this.roomEntrance.right_; x++) {
        let cell = (x + Math.imul(y, this.width())) | 0;
        if (this.passable[cell]) {
          entranceWalkable[cell] = true;
        }
      }
    }
    PathFinder.buildDistanceMap$int$booleanArr$int(this.entrance(), entranceWalkable, 8);
    let mob = null;
    while (mobsToSpawn > 0) {
      if (mob == null) {
        mob = this.createMob();
      }
      let roomToSpawn: Room;
      if (!stdRoomIter.hasNext()) {
        stdRoomIter = stdRooms.iterator();
      }
      roomToSpawn = stdRoomIter.next();
      let tries = 30;
      do {
        mob.pos = this.pointToCell(roomToSpawn.random$());
        tries--;
      } while (tries >= 0 && (this.findMob(mob.pos) != null || entranceFOV[mob.pos] || PathFinder.distance[mob.pos] !== 2147483647 || !this.passable[mob.pos] || this.solid[mob.pos] || !roomToSpawn.canPlaceCharacter(this.cellToPoint(mob.pos), this) || mob.pos === this.exit() || this.traps.get(mob.pos) != null || this.plants.get(mob.pos) != null || (!this.openSpace[mob.pos] && mob.properties().contains(Char$Property.LARGE))));
      if (tries >= 0) {
        mobsToSpawn--;
        this.mobs.add(mob);
        mob = null;
        if (Dungeon.depth > 1 && mobsToSpawn > 0 && Random.Int$int(4) === 0) {
          mob = this.createMob();
          tries = 30;
          do {
            mob.pos = this.pointToCell(roomToSpawn.random$());
            tries--;
          } while (tries >= 0 && (this.findMob(mob.pos) != null || entranceFOV[mob.pos] || PathFinder.distance[mob.pos] !== 2147483647 || !this.passable[mob.pos] || this.solid[mob.pos] || !roomToSpawn.canPlaceCharacter(this.cellToPoint(mob.pos), this) || mob.pos === this.exit() || this.traps.get(mob.pos) != null || this.plants.get(mob.pos) != null || (!this.openSpace[mob.pos] && mob.properties().contains(Char$Property.LARGE))));
          if (tries >= 0) {
            mobsToSpawn--;
            this.mobs.add(mob);
            mob = null;
          }
        }
      }
    }
    for (const $it2 = this.mobs.iterator(); $it2.hasNext(); ) {
      let m = $it2.next();
      if (this.map_[m.pos] === Terrain.HIGH_GRASS || this.map_[m.pos] === Terrain.FURROWED_GRASS) {
        this.map_[m.pos] = Terrain.GRASS;
        this.losBlocking[m.pos] = false;
      }
    }
  }
  randomRespawnCell(ch: Char): number {
    let count = 0;
    let cell = -1;
    while (true) {
      if (++count > 30) {
        return -1;
      }
      let room = this.randomRoom($J.cls(StandardRoom));
      if (room == null || room === this.roomEntrance) {
        continue;
      }
      cell = this.pointToCell(room.random$int(1));
      if (!this.heroFOV[cell] && Actor.findChar(cell) == null && this.passable[cell] && !this.solid[cell] && (!Char.hasProp(ch, Char$Property.LARGE) || this.openSpace[cell]) && room.canPlaceCharacter(this.cellToPoint(cell), this) && cell !== this.exit()) {
        return cell;
      }
    }
  }
  randomDestination(ch: Char): number {
    let count = 0;
    let cell = -1;
    while (true) {
      if (++count > 30) {
        return -1;
      }
      let room = Random.element$Collection(this.rooms_);
      if (room == null) {
        continue;
      }
      let points = room.charPlaceablePoints(this);
      if (!points.isEmpty()) {
        cell = this.pointToCell(Random.element$Collection(points));
        if (this.passable[cell] && (!Char.hasProp(ch, Char$Property.LARGE) || this.openSpace[cell])) {
          return cell;
        }
      }
    }
  }
  createItems(): void {
    let nItems = (3 + Random.chances$floatArr([6, 3, 1])) | 0;
    if (this.feeling === Level$Feeling.LARGE) {
      nItems = (nItems + 2) | 0;
    }
    for (let i = 0; i < nItems; i++) {
      let toDrop = Generator.random$();
      if (toDrop == null) {
        continue;
      }
      let cell = this.randomDropCell$();
      if (this.map_[cell] === Terrain.HIGH_GRASS || this.map_[cell] === Terrain.FURROWED_GRASS) {
        this.map_[cell] = Terrain.GRASS;
        this.losBlocking[cell] = false;
      }
      let type$ = null;
      switch (Random.Int$int(20)) {
        case 0:
          type$ = Heap$Type.SKELETON;
          break;
        case 1:
        case 2:
        case 3:
        case 4:
          if (Random.Float$() < Math.fround((Math.fround(MimicTooth.mimicChanceMultiplier$() - 1)) / 4) && this.findMob(cell) == null) {
            this.mobs.add(Mimic.spawnAt$int$ItemArr(cell, [toDrop]));
            continue;
          }
          type$ = Heap$Type.CHEST;
          break;
        case 5:
          if (Dungeon.depth > 1 && this.findMob(cell) == null) {
            this.mobs.add(Mimic.spawnAt$int$ItemArr(cell, [toDrop]));
            continue;
          }
          type$ = Heap$Type.CHEST;
          break;
        default:
          type$ = Heap$Type.HEAP;
          break;
      }
      if ((toDrop instanceof Artifact && Random.Int$int(2) === 0) || (toDrop.isUpgradable() && (Random.Int$int((4 - toDrop.level$()) | 0)) === 0)) {
        let mimicChance = Math.fround(Math.fround(1 / 10) * MimicTooth.mimicChanceMultiplier$());
        if (Dungeon.depth > 1 && Random.Float$() < mimicChance && this.findMob(cell) == null) {
          this.mobs.add(Mimic.spawnAt$int$Class$ItemArr(cell, $J.cls(GoldenMimic), [toDrop]));
        } else {
          let dropped = this.drop(toDrop, cell);
          if (this.heaps.get(cell) === dropped) {
            dropped.type_ = Heap$Type.LOCKED_CHEST;
            this.addItemToSpawn(new GoldenKey()._GoldenKey$int(Dungeon.depth));
          }
        }
      } else {
        let dropped = this.drop(toDrop, cell);
        dropped.type_ = type$;
        if (type$ === Heap$Type.SKELETON) {
          dropped.setHauntedIfCursed();
        }
      }
    }
    for (const $it3 = this.itemsToSpawn.iterator(); $it3.hasNext(); ) {
      let item = $it3.next();
      let cell = this.randomDropCell$();
      if (item instanceof TrinketCatalyst) {
        this.drop(item, cell).type_ = Heap$Type.LOCKED_CHEST;
        let keyCell = this.randomDropCell$();
        this.drop(new GoldenKey()._GoldenKey$int(Dungeon.depth), keyCell).type_ = Heap$Type.HEAP;
        if (this.map_[keyCell] === Terrain.HIGH_GRASS || this.map_[keyCell] === Terrain.FURROWED_GRASS) {
          this.map_[keyCell] = Terrain.GRASS;
          this.losBlocking[keyCell] = false;
        }
      } else {
        this.drop(item, cell).type_ = Heap$Type.HEAP;
      }
      if (this.map_[cell] === Terrain.HIGH_GRASS || this.map_[cell] === Terrain.FURROWED_GRASS) {
        this.map_[cell] = Terrain.GRASS;
        this.losBlocking[cell] = false;
      }
    }
    Random.pushGenerator$long(Random.Long$());
    if (Dungeon.isChallenged(Challenges.DARKNESS)) {
      let cell = this.randomDropCell$();
      if (this.map_[cell] === Terrain.HIGH_GRASS || this.map_[cell] === Terrain.FURROWED_GRASS) {
        this.map_[cell] = Terrain.GRASS;
        this.losBlocking[cell] = false;
      }
      this.drop(new Torch()._Torch(), cell);
      if (this.feeling === Level$Feeling.LARGE) {
        cell = this.randomDropCell$();
        if (this.map_[cell] === Terrain.HIGH_GRASS || this.map_[cell] === Terrain.FURROWED_GRASS) {
          this.map_[cell] = Terrain.GRASS;
          this.losBlocking[cell] = false;
        }
        this.drop(new Torch()._Torch(), cell);
      }
    }
    Random.popGenerator();
    Random.pushGenerator$long(Random.Long$());
    let bonesItems = Bones.get();
    if (bonesItems != null) {
      let cell = this.randomDropCell$();
      if (this.map_[cell] === Terrain.HIGH_GRASS || this.map_[cell] === Terrain.FURROWED_GRASS) {
        this.map_[cell] = Terrain.GRASS;
        this.losBlocking[cell] = false;
      }
      for (const $it4 = bonesItems.iterator(); $it4.hasNext(); ) {
        let i = $it4.next();
        this.drop(i, cell).setHauntedIfCursed().type_ = Heap$Type.REMAINS;
      }
    }
    Random.popGenerator();
    Random.pushGenerator$long(Random.Long$());
    let rose = Dungeon.hero.belongings.getItem($J.cls(DriedRose));
    if (rose != null && rose.isIdentified() && !rose.cursed && Ghost$Quest.completed()) {
      let petalsNeeded = $J.d2i(Math.ceil(Math.fround(Math.fround(((($J.idiv(Dungeon.depth, 2)) - rose.droppedPetals) | 0)) / 3)));
      for (let i = 1; i <= petalsNeeded; i++) {
        if (rose.droppedPetals < 11) {
          let item = new DriedRose$Petal()._DriedRose$Petal();
          let cell = this.randomDropCell$();
          this.drop(item, cell).type_ = Heap$Type.HEAP;
          if (this.map_[cell] === Terrain.HIGH_GRASS || this.map_[cell] === Terrain.FURROWED_GRASS) {
            this.map_[cell] = Terrain.GRASS;
            this.losBlocking[cell] = false;
          }
          rose.droppedPetals++;
        }
      }
    }
    Random.popGenerator();
    Random.pushGenerator$long(Random.Long$());
    if (Dungeon.hero.hasTalent(Talent.CACHED_RATIONS)) {
      let dropped = Buff.affect$Char$Class(Dungeon.hero, $J.cls(Talent$CachedRationsDropped));
      let targetFloor = $J.d2i((Math.fround(2 + dropped.count())));
      if (dropped.count() > Math.fround(4)) {
        targetFloor++;
      }
      if (Dungeon.depth >= targetFloor && dropped.count() < Math.fround((2 + Math.imul(2, Dungeon.hero.pointsInTalent(Talent.CACHED_RATIONS))) | 0)) {
        let cell: number;
        let tries = 100;
        let valid: boolean;
        do {
          cell = this.randomDropCell$Class($J.cls(SpecialRoom));
          valid = cell !== -1 && !(this.room$int(cell) instanceof SecretRoom) && !(this.room$int(cell) instanceof ShopRoom) && this.map_[cell] !== Terrain.EMPTY_SP && this.map_[cell] !== Terrain.WATER && this.map_[cell] !== Terrain.PEDESTAL;
        } while (tries-- > 0 && !valid);
        if (valid) {
          if (this.map_[cell] === Terrain.HIGH_GRASS || this.map_[cell] === Terrain.FURROWED_GRASS) {
            this.map_[cell] = Terrain.GRASS;
            this.losBlocking[cell] = false;
          }
          this.drop(new SupplyRation()._SupplyRation(), cell).type_ = Heap$Type.CHEST;
          dropped.countUp(2);
        }
      }
    }
    Random.popGenerator();
    Random.pushGenerator$long(Random.Long$());
    let allPages = Document.ADVENTURERS_GUIDE.pageNames();
    let missingPages = new ArrayList();
    for (const $it5 = allPages.iterator(); $it5.hasNext(); ) {
      let page = $it5.next();
      if (!Document.ADVENTURERS_GUIDE.isPageFound$String(page)) {
        missingPages.add(page);
      }
    }
    missingPages.remove(Document.GUIDE_SEARCHING);
    let dropChance = Math.fround(0.25 * ((Dungeon.depth - 1) | 0));
    if (!missingPages.isEmpty() && Random.Float$() < dropChance) {
      let p = new GuidePage()._GuidePage();
      p.page$String(missingPages.get(0));
      let cell = this.randomDropCell$();
      if (this.map_[cell] === Terrain.HIGH_GRASS || this.map_[cell] === Terrain.FURROWED_GRASS) {
        this.map_[cell] = Terrain.GRASS;
        this.losBlocking[cell] = false;
      }
      this.drop(p, cell);
    }
    Random.popGenerator();
    Random.pushGenerator$long(Random.Long$());
    if (Document.ADVENTURERS_GUIDE.allPagesFound()) {
      let region = (1 + $J.idiv(((Dungeon.depth - 1) | 0), 5)) | 0;
      let regionDoc: Document;
      switch (region) {
        default:
          regionDoc = null;
          break;
        case 1:
          regionDoc = Document.SEWERS_GUARD;
          break;
        case 2:
          regionDoc = Document.PRISON_WARDEN;
          break;
        case 3:
          regionDoc = Document.CAVES_EXPLORER;
          break;
        case 4:
          regionDoc = Document.CITY_WARLOCK;
          break;
        case 5:
          regionDoc = Document.HALLS_KING;
          break;
      }
      if (regionDoc != null && !regionDoc.allPagesFound()) {
        let limit = RegularLevel.limitedDocs.get(regionDoc);
        if (limit == null || !limit.dropped()) {
          let totalPages = 0;
          let pagesFound = 0;
          let pageToDrop = null;
          for (const $it6 = regionDoc.pageNames().iterator(); $it6.hasNext(); ) {
            let page = $it6.next();
            totalPages++;
            if (!regionDoc.isPageFound$String(page)) {
              if (pageToDrop == null) {
                pageToDrop = page;
              }
            } else {
              pagesFound++;
            }
          }
          let percentComplete = Math.fround(pagesFound / totalPages);
          let targetFloor = (Math.imul(5, ((region - 1) | 0)) + 1) | 0;
          targetFloor = (targetFloor + $J.roundf(Math.fround(3 * percentComplete))) | 0;
          if (Dungeon.depth >= targetFloor) {
            let page = RegionLorePage.pageForDoc(regionDoc);
            page.page$String(pageToDrop);
            let cell = this.randomDropCell$();
            if (this.map_[cell] === Terrain.HIGH_GRASS || this.map_[cell] === Terrain.FURROWED_GRASS) {
              this.map_[cell] = Terrain.GRASS;
              this.losBlocking[cell] = false;
            }
            this.drop(page, cell);
            if (limit != null) {
              limit.drop();
            }
          }
        }
      }
    }
    Random.popGenerator();
    Random.pushGenerator$long(Random.Long$());
    if (Random.Float$() < MimicTooth.ebonyMimicChance$()) {
      let candidateCells = new ArrayList();
      if (Random.Int$int(2) === 0) {
        for (const $it7 = this.heaps.valueList().iterator(); $it7.hasNext(); ) {
          let h = $it7.next();
          if (h.type_ === Heap$Type.HEAP && !(this.room$int(h.pos) instanceof SpecialRoom) && this.findMob(h.pos) == null) {
            candidateCells.add(h.pos);
          }
        }
      }
      if (candidateCells.isEmpty()) {
        if (Random.Int$int(5) === 0 && this.findMob(this.exit()) == null) {
          candidateCells.add(this.exit());
        } else {
          for (let i = 0; i < this.length(); i++) {
            if (this.map_[i] === Terrain.DOOR && this.findMob(i) == null) {
              candidateCells.add(i);
            }
          }
        }
      }
      let pos = Random.element$Collection(candidateCells);
      this.mobs.add(Mimic.spawnAt$int$Class$boolean$ItemArr(pos, $J.cls(EbonyMimic), false, []));
    }
    Random.popGenerator();
    Random.pushGenerator$long(Random.Long$());
    let items = $J.d2i((Math.fround(Random.Float$() + CrackedSpyglass.extraLootChance$())));
    for (let i = 0; i < items; i++) {
      let cell = this.randomDropCell$();
      if (this.map_[cell] === Terrain.HIGH_GRASS || this.map_[cell] === Terrain.FURROWED_GRASS) {
        this.map_[cell] = Terrain.GRASS;
        this.losBlocking[cell] = false;
      }
      this.drop(Generator.randomUsingDefaults$(), cell).hidden = true;
    }
    Random.popGenerator();
  }
  rooms(): ArrayList<Room> {
    return new ArrayList(this.rooms_);
  }
  randomRoom(type$: JClass<Room>): Room {
    Random.shuffle$List(this.rooms_);
    return this.room$Class(type$);
  }
  room$Class(type$: JClass<Room>): Room {
    for (const $it8 = this.rooms_.iterator(); $it8.hasNext(); ) {
      let r = $it8.next();
      if (type$.isInstance(r)) {
        return r;
      }
    }
    return null;
  }
  room$int(pos: number): Room {
    for (const $it9 = this.rooms_.iterator(); $it9.hasNext(); ) {
      let room = $it9.next();
      if (room.inside$Point(this.cellToPoint(pos))) {
        return room;
      }
    }
    return null;
  }
  randomDropCell$(): number {
    return this.randomDropCell$Class($J.cls(StandardRoom));
  }
  randomDropCell$Class(roomType: JClass<Room>): number {
    let tries = 100;
    while (tries-- > 0) {
      let room = this.randomRoom(roomType);
      if (room == null) {
        return -1;
      }
      if (room !== this.roomEntrance) {
        let pos = this.pointToCell(room.random$());
        if (this.passable[pos] && !this.solid[pos] && pos !== this.exit() && this.heaps.get(pos) == null && room.canPlaceItem(this.cellToPoint(pos), this) && this.findMob(pos) == null) {
          let t = this.traps.get(pos);
          if (t == null || !(t instanceof BurningTrap || t instanceof BlazingTrap || t instanceof ChillingTrap || t instanceof FrostTrap || t instanceof ExplosiveTrap || t instanceof DisintegrationTrap || t instanceof PitfallTrap)) {
            return pos;
          }
        }
      }
    }
    return -1;
  }
  fallCell(fallIntoPit: boolean): number {
    if (fallIntoPit) {
      for (const $it10 = this.rooms_.iterator(); $it10.hasNext(); ) {
        let room = $it10.next();
        if (room instanceof PitRoom) {
          let candidates = new ArrayList();
          for (const $it11 = room.getPoints().iterator(); $it11.hasNext(); ) {
            let p = $it11.next();
            let cell = this.pointToCell(p);
            if (this.passable[cell] && this.findMob(cell) == null) {
              candidates.add(cell);
            }
          }
          if (!candidates.isEmpty()) {
            return Random.element$Collection(candidates);
          }
        }
      }
    }
    return super.fallCell(fallIntoPit);
  }
  levelExplorePercent(depth: number): number {
    let missedRooms = new HashSet();
    for (const $it12 = this.heaps.valueList().iterator(); $it12.hasNext(); ) {
      let h = $it12.next();
      if (h.autoExplored) {
        continue;
      }
      if (!h.seen || (h.type_ !== Heap$Type.HEAP && h.type_ !== Heap$Type.FOR_SALE && h.type_ !== Heap$Type.CRYSTAL_CHEST)) {
        missedRooms.add(this.room$int(h.pos));
      } else {
        for (const $it13 = h.items_.iterator(); $it13.hasNext(); ) {
          let i = $it13.next();
          if (i instanceof Key) {
            missedRooms.add(this.room$int(h.pos));
            break;
          }
        }
      }
    }
    for (const $it14 = this.blobs.values().iterator(); $it14.hasNext(); ) {
      let b = $it14.next();
      if (b.volume_ > 0) {
        if (b instanceof MagicalFireRoom$EternalFire) {
          missedRooms.add(this.room$Class($J.cls(MagicalFireRoom)));
        } else if (b instanceof SacrificialFire) {
          missedRooms.add(this.room$Class($J.cls(SacrificeRoom)));
        }
      }
    }
    for (let m of $J.toArrayInto(this.mobs.toArray(), $J.newArray(0, null))) {
      if (m.alignment !== Char$Alignment.ALLY) {
        if (m instanceof Statue && (m).levelGenStatue) {
          missedRooms.add(this.room$Class($J.cls(StatueRoom)));
        } else if (m instanceof Mimic) {
          missedRooms.add(this.room$int(m.pos));
        }
      }
    }
    for (let i = 0; i < this.length_; i++) {
      if (this.map_[i] === Terrain.BARRICADE || this.map_[i] === Terrain.LOCKED_DOOR || this.map_[i] === Terrain.SECRET_DOOR) {
        let candidate = null;
        for (let j of PathFinder.NEIGHBOURS4) {
          if ((this.room$int((i + j) | 0)) != null) {
            if (candidate == null || !missedRooms.contains(candidate)) {
              candidate = this.room$int((i + j) | 0);
            }
          }
        }
        if (candidate != null) {
          missedRooms.add(candidate);
        }
      }
    }
    for (const $it15 = Notes.getRecords$Class($J.cls(Notes$KeyRecord)).iterator(); $it15.hasNext(); ) {
      let rec = $it15.next();
      if (rec.depth() === depth && rec.type() === $J.cls(CrystalKey)) {
        for (const $it16 = this.rooms().iterator(); $it16.hasNext(); ) {
          let r = $it16.next();
          if (SpecialRoom.CRYSTAL_KEY_SPECIALS.contains(r.getClass())) {
            missedRooms.add(r);
          }
        }
      }
    }
    switch (missedRooms.size()) {
      case 0:
        return 1;
      case 1:
        return 0.5;
      case 2:
        return Math.fround(0.2);
      default:
        return 0;
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$Collection('rooms', this.rooms_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.rooms_ = new ArrayList((bundle.getCollection('rooms')));
    for (const $it17 = this.rooms_.iterator(); $it17.hasNext(); ) {
      let r = $it17.next();
      r.onLevelLoad(this);
      if (r.isEntrance()) {
        this.roomEntrance = r;
      } else if (r.isExit()) {
        this.roomExit = r;
      }
    }
  }
  static $clinit() {
    RegularLevel.limitedDocs = new HashMap();
    RegularLevel.limitedDocs.put(Document.SEWERS_GUARD, Dungeon$LimitedDrops.LORE_SEWERS);
    RegularLevel.limitedDocs.put(Document.PRISON_WARDEN, Dungeon$LimitedDrops.LORE_PRISON);
    RegularLevel.limitedDocs.put(Document.CAVES_EXPLORER, Dungeon$LimitedDrops.LORE_CAVES);
    RegularLevel.limitedDocs.put(Document.CITY_WARLOCK, Dungeon$LimitedDrops.LORE_CITY);
    RegularLevel.limitedDocs.put(Document.HALLS_KING, Dungeon$LimitedDrops.LORE_HALLS);
  }
}

$J.define(RegularLevel, 'com.shatteredpixel.shatteredpixeldungeon.levels.RegularLevel', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.Level', ctors: { '': '_RegularLevel' }, meths: { 'randomDropCell(java.lang.Class)': 'randomDropCell$Class', 'randomDropCell()': 'randomDropCell$', 'room(int)': 'room$int', 'room(java.lang.Class)': 'room$Class' }, clinit: true, lazy: ['limitedDocs'] });
$J.module(() => {
  Bones = $J.load('com.shatteredpixel.shatteredpixeldungeon.Bones');
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Dungeon$LimitedDrops = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon$LimitedDrops');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  SacrificialFire = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.SacrificialFire');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Talent$CachedRationsDropped = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$CachedRationsDropped');
  EbonyMimic = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.EbonyMimic');
  GoldenMimic = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GoldenMimic');
  Mimic = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mimic');
  Statue = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Statue');
  Ghost$Quest = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Ghost$Quest');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  Torch = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Torch');
  Artifact = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact');
  DriedRose = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.DriedRose');
  DriedRose$Petal = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.DriedRose$Petal');
  SupplyRation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.SupplyRation');
  GuidePage = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.journal.GuidePage');
  RegionLorePage = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.journal.RegionLorePage');
  CrystalKey = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.keys.CrystalKey');
  GoldenKey = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.keys.GoldenKey');
  Key = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.keys.Key');
  CrackedSpyglass = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.CrackedSpyglass');
  MimicTooth = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.MimicTooth');
  TrinketCatalyst = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.TrinketCatalyst');
  Document = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Document');
  Notes = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes');
  Notes$KeyRecord = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes$KeyRecord');
  Level$Feeling = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level$Feeling');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  FigureEightBuilder = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.builders.FigureEightBuilder');
  LoopBuilder = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.builders.LoopBuilder');
  SecretRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.SecretRoom');
  MagicalFireRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.MagicalFireRoom');
  MagicalFireRoom$EternalFire = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.MagicalFireRoom$EternalFire');
  PitRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.PitRoom');
  SacrificeRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SacrificeRoom');
  ShopRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.ShopRoom');
  SpecialRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SpecialRoom');
  StatueRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.StatueRoom');
  StandardRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom');
  EntranceRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.entrance.EntranceRoom');
  ExitRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.exit.ExitRoom');
  BlazingTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.BlazingTrap');
  BurningTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.BurningTrap');
  ChillingTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.ChillingTrap');
  DisintegrationTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.DisintegrationTrap');
  ExplosiveTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.ExplosiveTrap');
  FrostTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.FrostTrap');
  PitfallTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.PitfallTrap');
  WornDartTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.WornDartTrap');
  ShadowCaster = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.ShadowCaster');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
