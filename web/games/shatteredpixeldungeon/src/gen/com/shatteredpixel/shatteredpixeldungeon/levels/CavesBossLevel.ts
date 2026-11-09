// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/CavesBossLevel.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, JObject } from '../../../../../jre/index.ts';
import { Level } from './Level.ts';
import { CustomTilemap } from '../tiles/CustomTilemap.ts';
import { Blob } from '../actors/blobs/Blob.ts';

let Assets$Environment, Assets$Music, Assets$Sounds, Bones, Challenges, Dungeon, Statistics, Actor, Char, Char$Alignment, Char$Property, Electricity, Buff, DM300, Mob, Pylon, CellEmitter, Speck, BlastParticle, SparkParticle, Heap$Type, CavesLevel, CityLevel, Patch, Terrain, LevelTransition, LevelTransition$Type, CavesPainter, Painter, Trap$HazardAssistTracker, Messages, GameScene, PixelScene, PylonSprite, BossHealthBar, GLog, Game, Music, Sample, Emitter$Factory, GameMath, PathFinder, Point, Random, Rect;

export class CavesBossLevel extends Level {
  static WIDTH: number = 0;
  static HEIGHT: number = 0;
  static diggableArea: Rect = null;
  static mainArena: Rect = null;
  static gate: Rect = null;
  static pylonPositions: number[] = null;
  customArenaVisuals: CavesBossLevel$ArenaVisuals = null;
  /**
   * semi-randomized setup for entrance and corners
   */
  static readonly n: number = -1;
  static readonly W: number = 4;
  static readonly e: number = 1;
  static readonly s: number = 14;
  static entrance1: number[] = null;
  static entrance2: number[] = null;
  static entrance3: number[] = null;
  static entrance4: number[] = null;
  static entranceVariants: number[][] = null;
  static corner1: number[] = null;
  static corner2: number[] = null;
  static corner3: number[] = null;
  static corner4: number[] = null;
  static cornerVariants: number[][] = null;
  _CavesBossLevel(): this {
    this._Level();
    this.color1 = 5459774;
    this.color2 = 12179041;
    return this;
  }
  playLevelMusic(): void {
    if (this.locked) {
      if (BossHealthBar.isBleeding()) {
        Music.INSTANCE.play$String$boolean(Assets$Music.CAVES_BOSS_FINALE, true);
      } else {
        Music.INSTANCE.play$String$boolean(Assets$Music.CAVES_BOSS, true);
      }
    } else if ((this.map_[(14 + Math.imul(13, this.width())) | 0]) === Terrain.CUSTOM_DECO) {
      Music.INSTANCE.end();
    } else {
      Music.INSTANCE.playTracks(CavesLevel.CAVES_TRACK_LIST, CavesLevel.CAVES_TRACK_CHANCES, false);
    }
  }
  tilesTex(): string {
    return Assets$Environment.TILES_CAVES;
  }
  waterTex(): string {
    return Assets$Environment.WATER_CAVES;
  }
  build(): boolean {
    this.setSize(CavesBossLevel.WIDTH, CavesBossLevel.HEIGHT);
    Painter.fill$Level$Rect$int(this, CavesBossLevel.gate, Terrain.CUSTOM_DECO);
    Painter.fillEllipse$Level$Rect$int(this, CavesBossLevel.mainArena, Terrain.EMPTY);
    let patch = Patch.generate(this.width_, (this.height_ - 14) | 0, Math.fround(0.15), 2, true);
    for (let i = Math.imul(14, this.width()); i < this.length(); i++) {
      if (this.map_[i] === Terrain.EMPTY) {
        if (patch[(i - Math.imul(14, this.width())) | 0]) {
          this.map_[i] = Terrain.WATER;
        } else if ((Random.Int$int(Dungeon.isChallenged(Challenges.STRONGER_BOSSES) ? 4 : 8)) === 0) {
          this.map_[i] = Terrain.INACTIVE_TRAP;
        }
      }
    }
    this.buildEntrance();
    this.buildCorners();
    new CavesPainter()._CavesPainter().paint(this, null);
    Painter.fill$Level$int$int$int$int$int(this, 0, 3, this.width(), 4, Terrain.CHASM);
    Painter.fill$Level$int$int$int$int$int(this, 6, 7, 21, 1, Terrain.CHASM);
    Painter.fill$Level$int$int$int$int$int(this, 9, 3, 1, 6, Terrain.REGION_DECO_ALT);
    Painter.fill$Level$int$int$int$int$int(this, 23, 3, 1, 6, Terrain.REGION_DECO_ALT);
    Painter.fill$Level$int$int$int$int$int(this, 10, 8, 13, 1, Terrain.CHASM);
    Painter.fill$Level$int$int$int$int$int(this, 12, 9, 9, 1, Terrain.CHASM);
    Painter.fill$Level$int$int$int$int$int(this, 13, 10, 7, 1, Terrain.CHASM);
    Painter.fill$Level$int$int$int$int$int(this, 14, 3, 5, 10, Terrain.EMPTY);
    Painter.fill$Level$int$int$int$int$int(this, 15, 2, 3, 3, Terrain.EMPTY_SP);
    Painter.fill$Level$int$int$int$int$int(this, 15, 5, 3, 1, Terrain.STATUE);
    Painter.fill$Level$int$int$int$int$int(this, 15, 7, 3, 1, Terrain.STATUE);
    Painter.fill$Level$int$int$int$int$int(this, 15, 9, 3, 1, Terrain.STATUE);
    Painter.fill$Level$int$int$int$int$int(this, 16, 5, 1, 6, Terrain.EMPTY_SP);
    Painter.fill$Level$int$int$int$int$int(this, 15, 0, 3, 3, Terrain.EXIT);
    let exitCell = (16 + Math.imul(2, this.width())) | 0;
    let exit = new LevelTransition()._LevelTransition$Level$int$Type(this, exitCell, LevelTransition$Type.REGULAR_EXIT);
    exit.set$int$int$int$int(14, 0, 18, 2);
    this.transitions.add(exit);
    let customVisuals = new CavesBossLevel$CityEntrance()._CavesBossLevel$CityEntrance();
    customVisuals.setRect$int$int$int$int(0, 0, this.width(), 11);
    this.customTiles.add(customVisuals);
    customVisuals = new CavesBossLevel$EntranceTerrain()._CavesBossLevel$EntranceTerrain();
    customVisuals.setRect$int$int$int$int(($J.idiv(CavesBossLevel.WIDTH, 2) - 2) | 0, 0, 5, 11);
    this.customTerrain.add(customVisuals);
    customVisuals = new CavesBossLevel$EntranceOverhang()._CavesBossLevel$EntranceOverhang();
    customVisuals.setRect$int$int$int$int(0, 0, this.width(), 11);
    this.customWalls.add(customVisuals);
    customVisuals = this.customArenaVisuals = new CavesBossLevel$ArenaVisuals()._CavesBossLevel$ArenaVisuals();
    customVisuals.setRect$int$int$int$int(0, 12, this.width(), 27);
    this.customTiles.add(customVisuals);
    let pass = $J.newArray(this.length_, false);
    for (let i = 0; i < this.length_; i++) {
      pass[i] = this.map_[i] === Terrain.EMPTY || this.map_[i] === Terrain.EMPTY_SP || this.map_[i] === Terrain.EMPTY_DECO;
    }
    PathFinder.buildDistanceMap$int$booleanArr((16 + Math.imul(25, this.width())) | 0, pass);
    for (let i of CavesBossLevel.pylonPositions) {
      if (PathFinder.distance[i] === 2147483647) {
        return false;
      }
    }
    return true;
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    for (const $it0 = this.customTiles.iterator(); $it0.hasNext(); ) {
      let c = $it0.next();
      if (c instanceof CavesBossLevel$ArenaVisuals) {
        this.customArenaVisuals = c;
      }
    }
  }
  createMobs(): void {
    for (let i of CavesBossLevel.pylonPositions) {
      let pylon = new Pylon()._Pylon();
      pylon.pos = i;
      this.mobs.add(pylon);
    }
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
      for (const $it1 = bonesItems.iterator(); $it1.hasNext(); ) {
        let i = $it1.next();
        this.drop(i, pos).setHauntedIfCursed().type_ = Heap$Type.REMAINS;
      }
    }
    Random.popGenerator();
  }
  randomRespawnCell(ch: Char): number {
    let candidates = new ArrayList();
    for (let i of PathFinder.NEIGHBOURS8) {
      let cell = (this.entrance() + i) | 0;
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
  setCellToWater(includeTraps: boolean, cell: number): boolean {
    for (let i of CavesBossLevel.pylonPositions) {
      if (Dungeon.level.distance(cell, i) <= 1) {
        return false;
      }
    }
    return super.setCellToWater(includeTraps, cell);
  }
  invalidHeroPos(tile: number): boolean {
    if ((this.map_[(CavesBossLevel.gate.left_ + Math.imul(CavesBossLevel.gate.top_, this.width())) | 0]) === Terrain.CUSTOM_DECO) {
      let p = this.cellToPoint(tile);
      if (p.y < CavesBossLevel.diggableArea.top_) {
        return true;
      } else if (p.y < CavesBossLevel.gate.bottom_ && p.x >= CavesBossLevel.gate.left_ && p.x < CavesBossLevel.gate.right_) {
        return true;
      }
    }
    return super.invalidHeroPos(tile);
  }
  occupyCell(ch: Char): void {
    let gatePos = this.pointToCell(new Point()._Point$int$int(CavesBossLevel.gate.left_, CavesBossLevel.gate.top_));
    if (ch === Dungeon.hero && !this.locked && this.solid[gatePos]) {
      for (let pos of CavesBossLevel.pylonPositions) {
        if (Dungeon.level.distance(ch.pos, pos) <= 3) {
          this.seal();
          break;
        }
      }
    }
    super.occupyCell(ch);
  }
  seal(): void {
    super.seal();
    Statistics.qualifiedForBossChallengeBadge = true;
    let entrance = this.entrance();
    Level.set$int$int(entrance, Terrain.WALL);
    let heap = Dungeon.level.heaps.get(entrance);
    while (heap != null && !heap.isEmpty()) {
      let n: number;
      do {
        n = (entrance + PathFinder.NEIGHBOURS8[Random.Int$int(8)]) | 0;
      } while (!Dungeon.level.passable[n]);
      let dropped = Dungeon.level.drop(heap.pickUp(), n);
      dropped.seen = heap.seen;
    }
    let ch = Actor.findChar(entrance);
    if (ch != null) {
      let n: number;
      do {
        n = (entrance + PathFinder.NEIGHBOURS8[Random.Int$int(8)]) | 0;
      } while (!Dungeon.level.passable[n]);
      ch.pos = n;
      ch.sprite_.place(n);
    }
    GameScene.updateMap$int(entrance);
    Dungeon.observe$();
    CellEmitter.get(entrance).start(Speck.factory$int(Speck.ROCK), Math.fround(0.07), 10);
    PixelScene.shake(3, Math.fround(0.7));
    Sample.INSTANCE.play$Object(Assets$Sounds.ROCKS);
    let boss = new DM300()._DM300();
    boss.state_ = boss.WANDERING;
    do {
      boss.pos = this.pointToCell(Random.element$Collection(CavesBossLevel.mainArena.getPoints()));
    } while (!this.openSpace[boss.pos] || this.map_[boss.pos] === Terrain.EMPTY_SP || Actor.findChar(boss.pos) != null);
    GameScene.add$Mob(boss);
    Game.runOnRenderThread(new (CavesBossLevel$1())().$o(this));
  }
  unseal(): void {
    super.unseal();
    this.blobs.get($J.cls(CavesBossLevel$PylonEnergy)).fullyClear();
    Level.set$int$int(this.entrance(), Terrain.ENTRANCE);
    let i = Math.imul(CavesBossLevel.gate.top_, this.width());
    for (let j = CavesBossLevel.gate.left_; j < CavesBossLevel.gate.right_; j++) {
      Level.set$int$int((i + j) | 0, Terrain.EMPTY);
      if (Dungeon.level.heroFOV[(i + j) | 0]) {
        (CellEmitter.get((i + j) | 0)).burst(BlastParticle.FACTORY, 10);
      }
    }
    GameScene.updateMap$();
    if (this.customArenaVisuals != null) {
      this.customArenaVisuals.updateState();
    }
    Dungeon.observe$();
    Game.runOnRenderThread(new (CavesBossLevel$2())().$o(this));
  }
  activatePylon(): void {
    let pylons = new ArrayList();
    for (const $it2 = this.mobs.iterator(); $it2.hasNext(); ) {
      let m = $it2.next();
      if (m instanceof Pylon && m.alignment === Char$Alignment.NEUTRAL) {
        pylons.add(m);
      }
    }
    if (pylons.size() === 1) {
      pylons.get(0).activate();
    } else if (!pylons.isEmpty()) {
      let closest = null;
      for (const $it3 = pylons.iterator(); $it3.hasNext(); ) {
        let p = $it3.next();
        if (closest == null || this.trueDistance(p.pos, Dungeon.hero.pos) < this.trueDistance(closest.pos, Dungeon.hero.pos)) {
          closest = p;
        }
      }
      pylons.remove(closest);
      Random.element$Collection(pylons).activate();
    }
    for (let i = Math.imul(((CavesBossLevel.mainArena.top_ - 1) | 0), this.width_); i < this.length_; i++) {
      if (this.map_[i] === Terrain.INACTIVE_TRAP || this.map_[i] === Terrain.WATER || this.map_[i] === Terrain.CUSTOM_DECO) {
        GameScene.add$Blob(Blob.seed$int$int$Class(i, 1, $J.cls(CavesBossLevel$PylonEnergy)));
      }
    }
  }
  eliminatePylon(): void {
    if (this.customArenaVisuals != null) {
      this.customArenaVisuals.updateState();
    }
    let pylonsRemaining = 0;
    for (const $it4 = this.mobs.iterator(); $it4.hasNext(); ) {
      let m = $it4.next();
      if (m instanceof DM300) {
        (m).loseSupercharge();
        CavesBossLevel$PylonEnergy.energySourceSprite = m.sprite_;
      } else if (m instanceof Pylon) {
        pylonsRemaining++;
      }
    }
    let finalPylonsRemaining = Dungeon.isChallenged(Challenges.STRONGER_BOSSES) ? 1 : 2;
    if (pylonsRemaining > finalPylonsRemaining) {
      this.blobs.get($J.cls(CavesBossLevel$PylonEnergy)).fullyClear();
    }
  }
  tileName(tile: number): string {
    switch (tile) {
      case Terrain.GRASS:
        return Messages.get$Class$String$ObjectArr($J.cls(CavesLevel), 'grass_name', []);
      case Terrain.HIGH_GRASS:
        return Messages.get$Class$String$ObjectArr($J.cls(CavesLevel), 'high_grass_name', []);
      case Terrain.WATER:
        return Messages.get$Class$String$ObjectArr($J.cls(CavesLevel), 'water_name', []);
      case Terrain.STATUE:
        return Messages.get$Class$String$ObjectArr($J.cls(CityLevel), 'statue_name', []);
      case Terrain.REGION_DECO:
      case Terrain.REGION_DECO_ALT:
        return Messages.get$Class$String$ObjectArr($J.cls(CavesLevel), 'region_deco_name', []);
      default:
        return super.tileName(tile);
    }
  }
  tileDesc(tile: number): string {
    switch (tile) {
      case Terrain.WATER:
        return super.tileDesc(tile) + '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(CavesBossLevel), 'water_desc', []);
      case Terrain.ENTRANCE:
      case Terrain.ENTRANCE_SP:
        return Messages.get$Class$String$ObjectArr($J.cls(CavesLevel), 'entrance_desc', []);
      case Terrain.EXIT:
        return Messages.get$Class$String$ObjectArr($J.cls(CityLevel), 'exit_desc', []);
      case Terrain.HIGH_GRASS:
        return Messages.get$Class$String$ObjectArr($J.cls(CavesLevel), 'high_grass_desc', []);
      case Terrain.WALL_DECO:
        return Messages.get$Class$String$ObjectArr($J.cls(CavesLevel), 'wall_deco_desc', []);
      case Terrain.BOOKSHELF:
        return Messages.get$Class$String$ObjectArr($J.cls(CavesLevel), 'bookshelf_desc', []);
      case Terrain.STATUE:
        return Messages.get$Class$String$ObjectArr($J.cls(CityLevel), 'statue_desc', []);
      case Terrain.REGION_DECO:
      case Terrain.REGION_DECO_ALT:
        return Messages.get$Class$String$ObjectArr($J.cls(CavesLevel), 'region_deco_desc', []);
      default:
        return super.tileDesc(tile);
    }
  }
  addVisuals(): Group {
    super.addVisuals();
    CavesLevel.addCavesVisuals$Level$Group(this, this.visuals);
    return this.visuals;
  }
  buildEntrance(): void {
    let entrance = (16 + Math.imul(25, this.width())) | 0;
    let NW = (entrance - 7 - Math.imul(7, this.width())) | 0;
    let NE = (entrance + 7 - Math.imul(7, this.width())) | 0;
    let SE = (entrance + 7 + Math.imul(7, this.width())) | 0;
    let SW = (entrance - 7 + Math.imul(7, this.width())) | 0;
    let entranceTiles = Random.oneOf(CavesBossLevel.entranceVariants);
    for (let i = 0; i < entranceTiles.length; i++) {
      if (i % 8 === 0 && i !== 0) {
        NW = (NW + (this.width() - 8)) | 0;
        NE = (NE + (this.width() + 8)) | 0;
        SE = (SE - (this.width() - 8)) | 0;
        SW = (SW - (this.width() + 8)) | 0;
      }
      if (entranceTiles[i] !== CavesBossLevel.n) {
        this.map_[NW] = this.map_[NE] = this.map_[SE] = this.map_[SW] = entranceTiles[i];
      }
      NW++;
      NE--;
      SW++;
      SE--;
    }
    Painter.set$Level$int$int(this, entrance, Terrain.ENTRANCE);
    this.transitions.add(new LevelTransition()._LevelTransition$Level$int$Type(this, entrance, LevelTransition$Type.REGULAR_ENTRANCE));
  }
  buildCorners(): void {
    let NW = (2 + Math.imul(11, this.width())) | 0;
    let NE = (30 + Math.imul(11, this.width())) | 0;
    let SE = (30 + Math.imul(39, this.width())) | 0;
    let SW = (2 + Math.imul(39, this.width())) | 0;
    let cornerTiles = Random.oneOf(CavesBossLevel.cornerVariants);
    for (let i = 0; i < cornerTiles.length; i++) {
      if (i % 10 === 0 && i !== 0) {
        NW = (NW + (this.width() - 10)) | 0;
        NE = (NE + (this.width() + 10)) | 0;
        SE = (SE - (this.width() - 10)) | 0;
        SW = (SW - (this.width() + 10)) | 0;
      }
      if (cornerTiles[i] !== CavesBossLevel.n) {
        this.map_[NW] = this.map_[NE] = this.map_[SE] = this.map_[SW] = cornerTiles[i];
      }
      NW++;
      NE--;
      SW++;
      SE--;
    }
  }
  static $clinit() {
    CavesBossLevel.WIDTH = 33;
    CavesBossLevel.HEIGHT = 42;
    CavesBossLevel.diggableArea = new Rect()._Rect$int$int$int$int(2, 11, 31, 40);
    CavesBossLevel.mainArena = new Rect()._Rect$int$int$int$int(5, 14, 28, 37);
    CavesBossLevel.gate = new Rect()._Rect$int$int$int$int(14, 13, 19, 14);
    CavesBossLevel.pylonPositions = [(4 + Math.imul(13, CavesBossLevel.WIDTH)) | 0, (28 + Math.imul(13, CavesBossLevel.WIDTH)) | 0, (4 + Math.imul(37, CavesBossLevel.WIDTH)) | 0, (28 + Math.imul(37, CavesBossLevel.WIDTH)) | 0];
    CavesBossLevel.entrance1 = [CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.e];
    CavesBossLevel.entrance2 = [CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.e, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.e, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.e];
    CavesBossLevel.entrance3 = [CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.e];
    CavesBossLevel.entrance4 = [CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.e, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.n, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.e];
    CavesBossLevel.entranceVariants = [CavesBossLevel.entrance1, CavesBossLevel.entrance2, CavesBossLevel.entrance3, CavesBossLevel.entrance4];
    CavesBossLevel.corner1 = [CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.s, CavesBossLevel.s, CavesBossLevel.s, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.s, CavesBossLevel.s, CavesBossLevel.s, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.s, CavesBossLevel.s, CavesBossLevel.s, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.n, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.W, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n];
    CavesBossLevel.corner2 = [CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.s, CavesBossLevel.s, CavesBossLevel.s, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.s, CavesBossLevel.s, CavesBossLevel.s, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.s, CavesBossLevel.s, CavesBossLevel.s, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.W, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n];
    CavesBossLevel.corner3 = [CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.s, CavesBossLevel.s, CavesBossLevel.s, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.s, CavesBossLevel.s, CavesBossLevel.s, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.s, CavesBossLevel.s, CavesBossLevel.s, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.W, CavesBossLevel.n, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.n, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n];
    CavesBossLevel.corner4 = [CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.s, CavesBossLevel.s, CavesBossLevel.s, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.s, CavesBossLevel.s, CavesBossLevel.s, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.s, CavesBossLevel.s, CavesBossLevel.s, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.n, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.e, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.e, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.W, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n, CavesBossLevel.n];
    CavesBossLevel.cornerVariants = [CavesBossLevel.corner1, CavesBossLevel.corner2, CavesBossLevel.corner3, CavesBossLevel.corner4];
  }
}

/**
 * Visual Effects
 */
export class CavesBossLevel$CityEntrance extends CustomTilemap {
  static entryWay: number[] = null;
  _CavesBossLevel$CityEntrance(): this {
    this._CustomTilemap();
    this.texture_ = Assets$Environment.CAVES_BOSS;
    return this;
  }
  create(): Tilemap {
    let v = super.create();
    let data = $J.newArray(Math.imul(this.tileW, this.tileH), 0);
    let entryPos = 0;
    for (let i = 0; i < data.length; i++) {
      if (i % this.tileW === (($J.idiv(this.tileW, 2) - 2) | 0)) {
        data[i++] = CavesBossLevel$CityEntrance.entryWay[entryPos++];
        data[i++] = CavesBossLevel$CityEntrance.entryWay[entryPos++];
        data[i++] = CavesBossLevel$CityEntrance.entryWay[entryPos++];
        data[i++] = CavesBossLevel$CityEntrance.entryWay[entryPos++];
        data[i] = CavesBossLevel$CityEntrance.entryWay[entryPos++];
      } else {
        if ($J.idiv(i, this.tileW) === 2) {
          data[i] = 13;
        } else if ($J.idiv(i, this.tileW) === 3) {
          if (i % this.tileW === 9 || i % this.tileW === 23) {
            data[i] = -1;
          } else {
            data[i] = 21;
          }
        } else {
          data[i] = -1;
        }
      }
    }
    v.map(data, this.tileW);
    return v;
  }
  static $clinit() {
    CavesBossLevel$CityEntrance.entryWay = [-1, 7, 7, 7, -1, -1, 1, 2, 3, -1, 8, 1, 2, 3, 12, 16, 9, 10, 11, 20, 16, 16, 22, 20, 20, 16, 17, 18, 19, 20, 16, 16, 18, 20, 20, 16, 17, 18, 19, 20, 16, 16, 18, 20, 20, 16, 17, 18, 19, 20, 24, 25, 26, 27, 28];
  }
}

export class CavesBossLevel$EntranceTerrain extends CustomTilemap {
  static entryWay: number[] = null;
  _CavesBossLevel$EntranceTerrain(): this {
    this._CustomTilemap();
    this.texture_ = Assets$Environment.CAVES_BOSS;
    return this;
  }
  create(): Tilemap {
    let v = super.create();
    let data = $J.newArray(Math.imul(this.tileW, this.tileH), 0);
    let entryPos = 0;
    for (let i = 0; i < data.length; i++) {
      data[i] = CavesBossLevel$EntranceTerrain.entryWay[entryPos++];
    }
    v.map(data, this.tileW);
    return v;
  }
  image(tileX: number, tileY: number): Image {
    return null;
  }
  static $clinit() {
    CavesBossLevel$EntranceTerrain.entryWay = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 8, -1, -1, -1, 12, 30, -1, -1, -1, 31, -1, -1, -1, -1, -1, -1, 17, -1, 19, -1, -1, -1, -1, -1, -1, -1, 17, -1, 19, -1, -1, -1, -1, -1, -1, -1, 17, -1, 19, -1, -1, -1, -1, -1, -1];
  }
}

export class CavesBossLevel$EntranceOverhang extends CustomTilemap {
  static entryWay: number[] = null;
  _CavesBossLevel$EntranceOverhang(): this {
    this._CustomTilemap();
    this.texture_ = Assets$Environment.CAVES_BOSS;
    return this;
  }
  create(): Tilemap {
    let v = super.create();
    let data = $J.newArray(Math.imul(this.tileW, this.tileH), 0);
    let entryPos = 0;
    for (let i = 0; i < data.length; i++) {
      if (i % this.tileW === (($J.idiv(this.tileW, 2) - 2) | 0)) {
        data[i++] = CavesBossLevel$EntranceOverhang.entryWay[entryPos++];
        data[i++] = CavesBossLevel$EntranceOverhang.entryWay[entryPos++];
        data[i++] = CavesBossLevel$EntranceOverhang.entryWay[entryPos++];
        data[i++] = CavesBossLevel$EntranceOverhang.entryWay[entryPos++];
        data[i] = CavesBossLevel$EntranceOverhang.entryWay[entryPos++];
      } else {
        data[i] = -1;
      }
    }
    v.map(data, this.tileW);
    return v;
  }
  static $clinit() {
    CavesBossLevel$EntranceOverhang.entryWay = [0, 7, 7, 7, 4, 0, 15, 15, 15, 4, -1, 23, 23, 23, -1, -1, -1, -1, -1, -1, -1, 6, -1, 14, -1, -1, -1, -1, -1, -1, -1, 6, -1, 14, -1, -1, -1, -1, -1, -1, -1, 6, -1, 14, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];
  }
}

export class CavesBossLevel$ArenaVisuals extends CustomTilemap {
  _CavesBossLevel$ArenaVisuals(): this {
    this._CustomTilemap();
    this.texture_ = Assets$Environment.CAVES_BOSS;
    return this;
  }
  create(): Tilemap {
    let v = super.create();
    this.updateState();
    return v;
  }
  updateState(): void {
    if (this.vis != null) {
      let data = $J.newArray(Math.imul(this.tileW, this.tileH), 0);
      let j = Math.imul(Dungeon.level.width(), this.tileY);
      for (let i = 0; i < data.length; i++) {
        if (Dungeon.level.map_[j] === Terrain.EMPTY_SP) {
          for (let k of CavesBossLevel.pylonPositions) {
            if (k === j) {
              if (Dungeon.level.locked && !(Actor.findChar(k) instanceof Pylon)) {
                data[i] = 38;
              } else {
                data[i] = -1;
              }
            } else if (Dungeon.level.adjacent(k, j)) {
              let w = Dungeon.level.width_;
              data[i] = (54 + (j % w + Math.imul(8, ($J.idiv(j, w)))) - (k % w + Math.imul(8, ($J.idiv(k, w))))) | 0;
            }
          }
        } else if (Dungeon.level.map_[j] === Terrain.INACTIVE_TRAP) {
          data[i] = 37;
        } else if (CavesBossLevel.gate.inside$Point(Dungeon.level.cellToPoint(j))) {
          let idx = Dungeon.level.solid[j] ? 40 : 32;
          data[i++] = idx++;
          data[i++] = idx++;
          data[i++] = idx++;
          data[i++] = idx++;
          data[i] = idx;
          j = (j + 4) | 0;
        } else {
          data[i] = -1;
        }
        j++;
      }
      this.vis.map(data, this.tileW);
    }
  }
  name(tileX: number, tileY: number): string {
    let i = (tileX + Math.imul(this.tileW, ((tileY + this.tileY) | 0))) | 0;
    if (Dungeon.level.map_[i] === Terrain.INACTIVE_TRAP) {
      return Messages.get$Class$String$ObjectArr($J.cls(CavesBossLevel), 'wires_name', []);
    } else if (CavesBossLevel.gate.inside$Point(Dungeon.level.cellToPoint(i))) {
      return Messages.get$Class$String$ObjectArr($J.cls(CavesBossLevel), 'gate_name', []);
    }
    return super.name(tileX, tileY);
  }
  desc(tileX: number, tileY: number): string {
    let i = (tileX + Math.imul(this.tileW, ((tileY + this.tileY) | 0))) | 0;
    if (Dungeon.level.map_[i] === Terrain.INACTIVE_TRAP) {
      return Messages.get$Class$String$ObjectArr($J.cls(CavesBossLevel), 'wires_desc', []);
    } else if (CavesBossLevel.gate.inside$Point(Dungeon.level.cellToPoint(i))) {
      if (Dungeon.level.solid[i]) {
        return Messages.get$Class$String$ObjectArr($J.cls(CavesBossLevel), 'gate_desc', []);
      } else {
        return Messages.get$Class$String$ObjectArr($J.cls(CavesBossLevel), 'gate_desc_broken', []);
      }
    }
    return super.desc(tileX, tileY);
  }
  image(tileX: number, tileY: number): Image {
    let i = (tileX + Math.imul(this.tileW, ((tileY + this.tileY) | 0))) | 0;
    for (let k of CavesBossLevel.pylonPositions) {
      if (Dungeon.level.distance(i, k) <= 1) {
        return null;
      }
    }
    return super.image(tileX, tileY);
  }
}

export class CavesBossLevel$PylonEnergy extends Blob {
  static energySourceSprite: CharSprite = null;
  static DIRECTED_SPARKS: Emitter$Factory = null;
  _CavesBossLevel$PylonEnergy(): this {
    this._Blob();
    return this;
  }
  evolve(): void {
    for (let cell = 0; cell < Dungeon.level.length(); cell++) {
      if (Dungeon.level.insideMap(cell)) {
        this.off[cell] = this.cur[cell];
        if (this.off[cell] === 0 && Dungeon.level.water[cell]) {
          this.area.union$int$int(cell % Dungeon.level.width(), $J.idiv(cell, Dungeon.level.width()));
          this.off[cell]++;
        }
        this.volume_ = (this.volume_ + this.off[cell]) | 0;
        if (this.off[cell] > 0) {
          let ch = Actor.findChar(cell);
          if (ch != null && !(ch instanceof DM300) && !ch.flying) {
            if (ch instanceof Mob) {
              Buff.prolong(ch, $J.cls(Trap$HazardAssistTracker), Trap$HazardAssistTracker.DURATION);
            }
            Sample.INSTANCE.play$Object(Assets$Sounds.LIGHTNING);
            ch.damage(Random.NormalIntRange(6, 12), new Electricity()._Electricity());
            ch.sprite_.flash();
            if (ch === Dungeon.hero) {
              if (CavesBossLevel$PylonEnergy.energySourceSprite != null && CavesBossLevel$PylonEnergy.energySourceSprite instanceof PylonSprite) {
                Statistics.qualifiedForBossChallengeBadge = false;
              }
              Statistics.bossScores[2] = (Statistics.bossScores[2] - 200) | 0;
              if (!ch.isAlive()) {
                Dungeon.fail($J.cls(DM300));
                GLog.n(Messages.get$Class$String$ObjectArr($J.cls(Electricity), 'ondeath', []), []);
              }
            }
          }
        }
      }
    }
  }
  fullyClear(): void {
    super.fullyClear();
    CavesBossLevel$PylonEnergy.energySourceSprite = null;
  }
  tileDesc(): string {
    return Messages.get$Class$String$ObjectArr($J.cls(CavesBossLevel), 'energy_desc', []);
  }
  use(emitter: BlobEmitter): void {
    super.use(emitter);
    CavesBossLevel$PylonEnergy.energySourceSprite = null;
    emitter.pour(CavesBossLevel$PylonEnergy.DIRECTED_SPARKS, Math.fround(0.08));
  }
  static $clinit() {
    CavesBossLevel$PylonEnergy.energySourceSprite = null;
    CavesBossLevel$PylonEnergy.DIRECTED_SPARKS = new (CavesBossLevel$PylonEnergy$1())()._Emitter$Factory();
  }
}

let $CavesBossLevel$1: any = null;
/** An anonymous class (CavesBossLevel.java:339). */
function CavesBossLevel$1(): any {
  return $CavesBossLevel$1 ??= $J.local(class extends JObject {
    call(): void {
      Music.INSTANCE.play$String$boolean(Assets$Music.CAVES_BOSS, true);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.CavesBossLevel$1', ['com.watabou.utils.Callback']);
}

let $CavesBossLevel$2$1: any = null;
/** An anonymous class (CavesBossLevel.java:371). */
function CavesBossLevel$2$1(): any {
  return $CavesBossLevel$2$1 ??= $J.local(class extends JObject {
    call(): void {
      Music.INSTANCE.end();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.CavesBossLevel$2$1', ['com.watabou.utils.Callback']);
}

let $CavesBossLevel$2: any = null;
/** An anonymous class (CavesBossLevel.java:368). */
function CavesBossLevel$2(): any {
  return $CavesBossLevel$2 ??= $J.local(class extends JObject {
    call(): void {
      Music.INSTANCE.fadeOut(5, new (CavesBossLevel$2$1())().$o(this));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.CavesBossLevel$2', ['com.watabou.utils.Callback']);
}

let $CavesBossLevel$PylonEnergy$1: any = null;
/** An anonymous class (CavesBossLevel.java:942). */
function CavesBossLevel$PylonEnergy$1(): any {
  return $CavesBossLevel$PylonEnergy$1 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      if (CavesBossLevel$PylonEnergy.energySourceSprite == null) {
        for (const $it5 = Actor.chars().iterator(); $it5.hasNext(); ) {
          let c = $it5.next();
          if (c instanceof Pylon && c.alignment !== Char$Alignment.NEUTRAL) {
            CavesBossLevel$PylonEnergy.energySourceSprite = c.sprite_;
            break;
          } else if (c instanceof DM300) {
            CavesBossLevel$PylonEnergy.energySourceSprite = c.sprite_;
          }
        }
        if (CavesBossLevel$PylonEnergy.energySourceSprite == null) {
          return;
        }
      }
      let dist = Math.max(Math.fround(Math.abs(Math.fround(CavesBossLevel$PylonEnergy.energySourceSprite.x - x))), Math.fround(Math.abs(Math.fround(CavesBossLevel$PylonEnergy.energySourceSprite.y - y))));
      dist = GameMath.gate(0, Math.fround(dist - 40), 320);
      if (Random.Float$float(360) > dist) {
        let s = (emitter.recycle($J.cls(SparkParticle)));
        s.resetAttracting(x, y, CavesBossLevel$PylonEnergy.energySourceSprite);
      }
    }
    lightMode(): boolean {
      return true;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.CavesBossLevel$PylonEnergy$1', []);
}

$J.define(CavesBossLevel, 'com.shatteredpixel.shatteredpixeldungeon.levels.CavesBossLevel', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.Level', ctors: { '': '_CavesBossLevel' }, clinit: true, lazy: ['WIDTH', 'HEIGHT', 'diggableArea', 'mainArena', 'gate', 'pylonPositions', 'entrance1', 'entrance2', 'entrance3', 'entrance4', 'entranceVariants', 'corner1', 'corner2', 'corner3', 'corner4', 'cornerVariants'] });
$J.define(CavesBossLevel$CityEntrance, 'com.shatteredpixel.shatteredpixeldungeon.levels.CavesBossLevel$CityEntrance', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_CavesBossLevel$CityEntrance' }, clinit: true, lazy: ['entryWay'] });
$J.define(CavesBossLevel$EntranceTerrain, 'com.shatteredpixel.shatteredpixeldungeon.levels.CavesBossLevel$EntranceTerrain', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_CavesBossLevel$EntranceTerrain' }, clinit: true, lazy: ['entryWay'] });
$J.define(CavesBossLevel$EntranceOverhang, 'com.shatteredpixel.shatteredpixeldungeon.levels.CavesBossLevel$EntranceOverhang', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_CavesBossLevel$EntranceOverhang' }, clinit: true, lazy: ['entryWay'] });
$J.define(CavesBossLevel$ArenaVisuals, 'com.shatteredpixel.shatteredpixeldungeon.levels.CavesBossLevel$ArenaVisuals', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_CavesBossLevel$ArenaVisuals' } });
$J.define(CavesBossLevel$PylonEnergy, 'com.shatteredpixel.shatteredpixeldungeon.levels.CavesBossLevel$PylonEnergy', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob', ctors: { '': '_CavesBossLevel$PylonEnergy' }, clinit: true, lazy: ['energySourceSprite', 'DIRECTED_SPARKS'] });
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
  Electricity = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Electricity');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  DM300 = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DM300');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  Pylon = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Pylon');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  BlastParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.BlastParticle');
  SparkParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.SparkParticle');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  CavesLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.CavesLevel');
  CityLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.CityLevel');
  Patch = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Patch');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  LevelTransition = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition');
  LevelTransition$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition$Type');
  CavesPainter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.CavesPainter');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Trap$HazardAssistTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap$HazardAssistTracker');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  PylonSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.PylonSprite');
  BossHealthBar = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BossHealthBar');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Game = $J.load('com.watabou.noosa.Game');
  Music = $J.load('com.watabou.noosa.audio.Music');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Emitter$Factory = $J.load('com.watabou.noosa.particles.Emitter$Factory');
  GameMath = $J.load('com.watabou.utils.GameMath');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Point = $J.load('com.watabou.utils.Point');
  Random = $J.load('com.watabou.utils.Random');
  Rect = $J.load('com.watabou.utils.Rect');
});
