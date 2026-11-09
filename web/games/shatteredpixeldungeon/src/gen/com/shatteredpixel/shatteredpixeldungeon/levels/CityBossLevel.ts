// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/CityBossLevel.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Environment, Assets$Music, Bones, Dungeon, Statistics, Actor, Char, Char$Property, DwarfKing, DwarfKing$Summoning, Mob, Imp$Quest, Heap$Type, CityLevel, HallsLevel, Terrain, LevelTransition, LevelTransition$Type, CityPainter, Painter, ImpShopRoom, Messages, GameScene, BossHealthBar, Game, Music, AlphaTweener, PathFinder, Point, Random, Rect;

export class CityBossLevel extends Level {
  static WIDTH: number = 0;
  static HEIGHT: number = 0;
  static entry: Rect = null;
  static arena: Rect = null;
  static end: Rect = null;
  static bottomDoor: number = 0;
  static topDoor: number = 0;
  static throne: number = 0;
  static pedestals: number[] = null;
  impShop: ImpShopRoom = null;
  static readonly IMP_SHOP: string = 'imp_shop';
  _CityBossLevel(): this {
    this._Level();
    this.color1 = 4941366;
    this.color2 = 15921906;
    return this;
  }
  playLevelMusic(): void {
    if (this.locked) {
      if (BossHealthBar.isBleeding()) {
        Music.INSTANCE.play$String$boolean(Assets$Music.CITY_BOSS_FINALE, true);
      } else {
        Music.INSTANCE.play$String$boolean(Assets$Music.CITY_BOSS, true);
      }
    } else if (this.map_[CityBossLevel.topDoor] === Terrain.LOCKED_DOOR) {
      Music.INSTANCE.end();
    } else {
      Music.INSTANCE.playTracks(CityLevel.CITY_TRACK_LIST, CityLevel.CITY_TRACK_CHANCES, false);
    }
  }
  tilesTex(): string {
    return Assets$Environment.TILES_CITY;
  }
  waterTex(): string {
    return Assets$Environment.WATER_CITY;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$Bundlable(CityBossLevel.IMP_SHOP, this.impShop);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.impShop = bundle.get$String(CityBossLevel.IMP_SHOP);
    if (this.map_[CityBossLevel.topDoor] !== Terrain.LOCKED_DOOR && Imp$Quest.earnedShop() && !this.impShop.shopSpawned()) {
      this.spawnShop();
    }
  }
  build(): boolean {
    this.setSize(CityBossLevel.WIDTH, CityBossLevel.HEIGHT);
    Painter.fill$Level$Rect$int(this, CityBossLevel.entry, Terrain.WALL);
    Painter.fill$Level$Rect$int$int(this, CityBossLevel.entry, 1, Terrain.BOOKSHELF);
    Painter.fill$Level$Rect$int$int(this, CityBossLevel.entry, 2, Terrain.EMPTY);
    Painter.fill$Level$int$int$int$int$int(this, (CityBossLevel.entry.left_ + 3) | 0, (CityBossLevel.entry.top_ + 3) | 0, 1, 5, Terrain.BOOKSHELF);
    Painter.fill$Level$int$int$int$int$int(this, (CityBossLevel.entry.right_ - 4) | 0, (CityBossLevel.entry.top_ + 3) | 0, 1, 5, Terrain.BOOKSHELF);
    Painter.set$Level$int$int$int(this, (CityBossLevel.entry.left_ + 5) | 0, (CityBossLevel.entry.top_ + 1) | 0, Terrain.REGION_DECO);
    Painter.set$Level$int$int$int(this, (CityBossLevel.entry.left_ + 7) | 0, (CityBossLevel.entry.top_ + 1) | 0, Terrain.REGION_DECO);
    let c = CityBossLevel.entry.center();
    Painter.fill$Level$int$int$int$int$int(this, (c.x - 1) | 0, (c.y - 2) | 0, 3, 1, Terrain.STATUE);
    Painter.fill$Level$int$int$int$int$int(this, (c.x - 1) | 0, c.y, 3, 1, Terrain.STATUE);
    Painter.fill$Level$int$int$int$int$int(this, (c.x - 1) | 0, (c.y + 2) | 0, 3, 1, Terrain.STATUE);
    Painter.fill$Level$int$int$int$int$int(this, c.x, (CityBossLevel.entry.top_ + 1) | 0, 1, 6, Terrain.CUSTOM_DECO_EMPTY);
    Painter.set$Level$int$int$int(this, c.x, CityBossLevel.entry.top_, Terrain.DOOR);
    let entrance = (c.x + Math.imul(((c.y + 2) | 0), this.width())) | 0;
    Painter.set$Level$int$int(this, entrance, Terrain.ENTRANCE);
    this.transitions.add(new LevelTransition()._LevelTransition$Level$int$Type(this, entrance, LevelTransition$Type.REGULAR_ENTRANCE));
    Painter.fillDiamond$Level$Rect$int$int(this, CityBossLevel.arena, 1, Terrain.EMPTY);
    Painter.fill$Level$Rect$int$int(this, CityBossLevel.arena, 5, Terrain.CUSTOM_DECO_EMPTY);
    Painter.fill$Level$Rect$int$int(this, CityBossLevel.arena, 6, Terrain.CUSTOM_DECO);
    c = CityBossLevel.arena.center();
    Painter.set$Level$int$int$int(this, (c.x - 3) | 0, c.y, Terrain.STATUE);
    Painter.set$Level$int$int$int(this, (c.x - 4) | 0, c.y, Terrain.STATUE);
    Painter.set$Level$int$int$int(this, (c.x + 3) | 0, c.y, Terrain.STATUE);
    Painter.set$Level$int$int$int(this, (c.x + 4) | 0, c.y, Terrain.STATUE);
    Painter.set$Level$int$int(this, CityBossLevel.pedestals[0], Terrain.PEDESTAL);
    Painter.set$Level$int$int(this, CityBossLevel.pedestals[1], Terrain.PEDESTAL);
    Painter.set$Level$int$int(this, CityBossLevel.pedestals[2], Terrain.PEDESTAL);
    Painter.set$Level$int$int(this, CityBossLevel.pedestals[3], Terrain.PEDESTAL);
    Painter.fill$Level$int$int$int$int$int(this, c.x, (c.y + 2) | 0, 1, 4, Terrain.CUSTOM_DECO_EMPTY);
    Painter.set$Level$int$int$int(this, c.x, CityBossLevel.arena.top_, Terrain.LOCKED_DOOR);
    Painter.fill$Level$Rect$int(this, CityBossLevel.end, Terrain.CHASM);
    Painter.fill$Level$int$int$int$int$int(this, (CityBossLevel.end.left_ + 4) | 0, (CityBossLevel.end.top_ + 5) | 0, 7, 18, Terrain.EMPTY);
    Painter.fill$Level$int$int$int$int$int(this, (CityBossLevel.end.left_ + 4) | 0, (CityBossLevel.end.top_ + 5) | 0, 7, 4, Terrain.EXIT);
    let exitCell = (CityBossLevel.end.left_ + 7 + Math.imul(((CityBossLevel.end.top_ + 8) | 0), this.width())) | 0;
    let exit = new LevelTransition()._LevelTransition$Level$int$Type(this, exitCell, LevelTransition$Type.REGULAR_EXIT);
    exit.set$int$int$int$int((CityBossLevel.end.left_ + 4) | 0, (CityBossLevel.end.top_ + 4) | 0, (CityBossLevel.end.left_ + 4 + 6) | 0, (CityBossLevel.end.top_ + 4 + 4) | 0);
    this.transitions.add(exit);
    this.impShop = new ImpShopRoom()._ImpShopRoom();
    this.impShop.set$int$int$int$int((CityBossLevel.end.left_ + 3) | 0, (CityBossLevel.end.top_ + 12) | 0, (CityBossLevel.end.left_ + 11) | 0, (CityBossLevel.end.top_ + 20) | 0);
    Painter.set$Level$Point$int(this, this.impShop.center(), Terrain.PEDESTAL);
    Painter.set$Level$int$int$int(this, (this.impShop.left_ + 2) | 0, this.impShop.top_, Terrain.STATUE);
    Painter.set$Level$int$int$int(this, (this.impShop.left_ + 6) | 0, this.impShop.top_, Terrain.STATUE);
    Painter.fill$Level$int$int$int$int$int(this, (CityBossLevel.end.left_ + 5) | 0, (CityBossLevel.end.bottom_ + 1) | 0, 5, 1, Terrain.EMPTY);
    Painter.fill$Level$int$int$int$int$int(this, (CityBossLevel.end.left_ + 6) | 0, (CityBossLevel.end.bottom_ + 2) | 0, 3, 1, Terrain.EMPTY);
    this.impShop.paint(this);
    new CityPainter()._CityPainter().paint(this, null);
    Painter.fill$Level$int$int$int$int$int(this, (CityBossLevel.end.left_ + 1) | 0, (CityBossLevel.end.top_ + 2) | 0, 2, 2, Terrain.WALL);
    Painter.fill$Level$int$int$int$int$int(this, (CityBossLevel.end.left_ + 1) | 0, (CityBossLevel.end.top_ + 7) | 0, 2, 2, Terrain.WALL);
    Painter.fill$Level$int$int$int$int$int(this, (CityBossLevel.end.left_ + 1) | 0, (CityBossLevel.end.top_ + 12) | 0, 2, 2, Terrain.WALL);
    Painter.fill$Level$int$int$int$int$int(this, (CityBossLevel.end.left_ + 1) | 0, (CityBossLevel.end.top_ + 17) | 0, 2, 2, Terrain.WALL);
    Painter.fill$Level$int$int$int$int$int(this, (CityBossLevel.end.right_ - 3) | 0, (CityBossLevel.end.top_ + 2) | 0, 2, 2, Terrain.WALL);
    Painter.fill$Level$int$int$int$int$int(this, (CityBossLevel.end.right_ - 3) | 0, (CityBossLevel.end.top_ + 7) | 0, 2, 2, Terrain.WALL);
    Painter.fill$Level$int$int$int$int$int(this, (CityBossLevel.end.right_ - 3) | 0, (CityBossLevel.end.top_ + 12) | 0, 2, 2, Terrain.WALL);
    Painter.fill$Level$int$int$int$int$int(this, (CityBossLevel.end.right_ - 3) | 0, (CityBossLevel.end.top_ + 17) | 0, 2, 2, Terrain.WALL);
    let customVisuals = new CityBossLevel$CustomGroundVisuals()._CityBossLevel$CustomGroundVisuals();
    customVisuals.setRect$int$int$int$int(0, 0, this.width(), this.height());
    this.customTiles.add(customVisuals);
    customVisuals = new CityBossLevel$CustomTerrainVisuals()._CityBossLevel$CustomTerrainVisuals();
    customVisuals.setRect$int$int$int$int(0, 0, this.width(), this.height());
    this.customTerrain.add(customVisuals);
    customVisuals = new CityBossLevel$CustomWallVisuals()._CityBossLevel$CustomWallVisuals();
    customVisuals.setRect$int$int$int$int(0, 0, this.width(), this.height());
    this.customWalls.add(customVisuals);
    return true;
  }
  getSummoningPos(): number {
    let king = this.getKing();
    let summons = king.buffs$Class($J.cls(DwarfKing$Summoning));
    let positions = new ArrayList();
    for (let pedestal of CityBossLevel.pedestals) {
      let clear = true;
      for (const $it0 = summons.iterator(); $it0.hasNext(); ) {
        let s = $it0.next();
        if (s.getPos() === pedestal) {
          clear = false;
          break;
        }
      }
      if (clear) {
        positions.add(pedestal);
      }
    }
    if (positions.isEmpty()) {
      return -1;
    } else {
      return Random.element$Collection(positions);
    }
  }
  getKing(): Mob {
    for (const $it1 = this.mobs.iterator(); $it1.hasNext(); ) {
      let m = $it1.next();
      if (m instanceof DwarfKing) {
        return m;
      }
    }
    return null;
  }
  createMobs(): void {
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
      for (const $it2 = bonesItems.iterator(); $it2.hasNext(); ) {
        let i = $it2.next();
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
  invalidHeroPos(tile: number): boolean {
    if (this.map_[CityBossLevel.topDoor] === Terrain.LOCKED_DOOR && tile <= CityBossLevel.topDoor) {
      return true;
    }
    return super.invalidHeroPos(tile);
  }
  occupyCell(ch: Char): void {
    if (this.map_[CityBossLevel.bottomDoor] !== Terrain.LOCKED_DOOR && this.map_[CityBossLevel.topDoor] === Terrain.LOCKED_DOOR && ch.pos < CityBossLevel.bottomDoor && ch === Dungeon.hero) {
      this.seal();
    }
    super.occupyCell(ch);
  }
  seal(): void {
    super.seal();
    Statistics.qualifiedForBossChallengeBadge = true;
    let doorPos = this.pointToCell(new Point()._Point$int$int((CityBossLevel.arena.left_ + $J.idiv(CityBossLevel.arena.width(), 2)) | 0, CityBossLevel.arena.bottom_));
    Mob.holdAllies$Level$int(this, doorPos);
    Mob.restoreAllies$Level$int$int(this, Dungeon.hero.pos, doorPos);
    let boss = new DwarfKing()._DwarfKing();
    boss.state_ = boss.WANDERING;
    boss.pos = this.pointToCell(CityBossLevel.arena.center());
    GameScene.add$Mob(boss);
    boss.beckon(Dungeon.hero.pos);
    if (this.heroFOV[boss.pos]) {
      boss.notice();
      boss.sprite_.alpha$float(0);
      boss.sprite_.parent.add$Gizmo(new AlphaTweener()._AlphaTweener(boss.sprite_, 1, Math.fround(0.1)));
    }
    Level.set$int$int(CityBossLevel.bottomDoor, Terrain.LOCKED_DOOR);
    GameScene.updateMap$int(CityBossLevel.bottomDoor);
    Dungeon.observe$();
    let h = this.heaps.get(CityBossLevel.bottomDoor);
    if (h != null) {
      for (const $it3 = h.items_.iterator(); $it3.hasNext(); ) {
        let i = $it3.next();
        (this.drop(i, (CityBossLevel.bottomDoor - this.width()) | 0)).sprite_.drop$int(CityBossLevel.bottomDoor);
      }
      h.destroy();
    }
    Game.runOnRenderThread(new (CityBossLevel$1())().$o(this));
  }
  unseal(): void {
    super.unseal();
    Level.set$int$int(CityBossLevel.bottomDoor, Terrain.DOOR);
    GameScene.updateMap$int(CityBossLevel.bottomDoor);
    Level.set$int$int(CityBossLevel.topDoor, Terrain.DOOR);
    GameScene.updateMap$int(CityBossLevel.topDoor);
    if (Imp$Quest.earnedShop()) {
      this.spawnShop();
    }
    Dungeon.observe$();
    Game.runOnRenderThread(new (CityBossLevel$2())().$o(this));
  }
  spawnShop(): void {
    while (this.impShop.spacesNeeded() >= Math.imul(7, ((this.impShop.height() - 2) | 0))) {
      this.impShop.bottom_++;
    }
    this.impShop.spawnShop(this);
  }
  tileName(tile: number): string {
    switch (tile) {
      case Terrain.WATER:
        return Messages.get$Class$String$ObjectArr($J.cls(CityLevel), 'water_name', []);
      case Terrain.HIGH_GRASS:
        return Messages.get$Class$String$ObjectArr($J.cls(CityLevel), 'high_grass_name', []);
      case Terrain.REGION_DECO:
      case Terrain.REGION_DECO_ALT:
        return Messages.get$Class$String$ObjectArr($J.cls(CityLevel), 'region_deco_name', []);
      default:
        return super.tileName(tile);
    }
  }
  tileDesc(tile: number): string {
    switch (tile) {
      case Terrain.ENTRANCE:
      case Terrain.ENTRANCE_SP:
        return Messages.get$Class$String$ObjectArr($J.cls(CityLevel), 'entrance_desc', []);
      case Terrain.EXIT:
        return Messages.get$Class$String$ObjectArr($J.cls(CityLevel), 'exit_desc', []);
      case Terrain.WALL_DECO:
      case Terrain.EMPTY_DECO:
        return Messages.get$Class$String$ObjectArr($J.cls(CityLevel), 'deco_desc', []);
      case Terrain.STATUE:
      case Terrain.STATUE_SP:
        return Messages.get$Class$String$ObjectArr($J.cls(CityLevel), 'statue_desc', []);
      case Terrain.BOOKSHELF:
        return Messages.get$Class$String$ObjectArr($J.cls(CityLevel), 'bookshelf_desc', []);
      case Terrain.REGION_DECO:
      case Terrain.REGION_DECO_ALT:
        return Messages.get$Class$String$ObjectArr($J.cls(CityLevel), 'region_deco_desc', []);
      default:
        return super.tileDesc(tile);
    }
  }
  addVisuals(): Group {
    super.addVisuals();
    CityLevel.addCityVisuals(this, this.visuals);
    return this.visuals;
  }
  addWallVisuals(): Group {
    super.addWallVisuals();
    CityLevel.addCityWallVisuals(this, this.wallVisuals);
    return this.wallVisuals;
  }
  static $clinit() {
    CityBossLevel.WIDTH = 15;
    CityBossLevel.HEIGHT = 48;
    CityBossLevel.entry = new Rect()._Rect$int$int$int$int(1, 37, 14, 48);
    CityBossLevel.arena = new Rect()._Rect$int$int$int$int(1, 25, 14, 38);
    CityBossLevel.end = new Rect()._Rect$int$int$int$int(0, 0, 15, 22);
    CityBossLevel.bottomDoor = (7 + Math.imul(((CityBossLevel.arena.bottom_ - 1) | 0), 15)) | 0;
    CityBossLevel.topDoor = (7 + Math.imul(CityBossLevel.arena.top_, 15)) | 0;
    CityBossLevel.pedestals = $J.newArray(4, 0);
    let c = CityBossLevel.arena.center();
    CityBossLevel.throne = (c.x + Math.imul((c.y), CityBossLevel.WIDTH)) | 0;
    CityBossLevel.pedestals[0] = (c.x - 3 + Math.imul(((c.y - 3) | 0), CityBossLevel.WIDTH)) | 0;
    CityBossLevel.pedestals[1] = (c.x + 3 + Math.imul(((c.y - 3) | 0), CityBossLevel.WIDTH)) | 0;
    CityBossLevel.pedestals[2] = (c.x + 3 + Math.imul(((c.y + 3) | 0), CityBossLevel.WIDTH)) | 0;
    CityBossLevel.pedestals[3] = (c.x - 3 + Math.imul(((c.y + 3) | 0), CityBossLevel.WIDTH)) | 0;
  }
}

export class CityBossLevel$CustomGroundVisuals extends CustomTilemap {
  static readonly STAIR_ROWS: number = 7;
  _CityBossLevel$CustomGroundVisuals(): this {
    this._CustomTilemap();
    this.texture_ = Assets$Environment.CITY_BOSS;
    this.tileW = 15;
    this.tileH = 48;
    return this;
  }
  create(): Tilemap {
    let v = super.create();
    let data = $J.newArray(Math.imul(this.tileW, this.tileH), 0);
    let map = Dungeon.level.map_;
    let stairsTop = -1;
    for (let i = this.tileW; i < Math.imul(this.tileW, 22); i++) {
      if (map[i] === Terrain.EXIT && stairsTop === -1) {
        stairsTop = i;
      }
      if (map[i] === Terrain.WALL && (map[(i - this.tileW) | 0]) === Terrain.CHASM) {
        data[i] = (Math.imul(13, 8) + 6) | 0;
        data[++i] = (Math.imul(13, 8) + 7) | 0;
      } else if (map[i] === Terrain.WALL && (map[(i - this.tileW) | 0]) === Terrain.WALL) {
        data[i] = (Math.imul(14, 8) + 6) | 0;
        data[++i] = (Math.imul(14, 8) + 7) | 0;
      } else if (i > this.tileW && map[i] === Terrain.CHASM && (map[(i - this.tileW) | 0]) === Terrain.WALL) {
        data[i] = (Math.imul(15, 8) + 6) | 0;
        data[++i] = (Math.imul(15, 8) + 7) | 0;
      } else if (map[i] === Terrain.PEDESTAL) {
        data[i] = (Math.imul(12, 8) + 5) | 0;
      } else if (map[i] === Terrain.STATUE) {
        data[i] = (Math.imul(15, 8) + 5) | 0;
      } else if (map[i] === Terrain.EMPTY || map[i] === Terrain.EMPTY_DECO || map[i] === Terrain.EMBERS || map[i] === Terrain.GRASS || map[i] === Terrain.HIGH_GRASS || map[i] === Terrain.FURROWED_GRASS) {
        if ($J.idiv(i, this.tileW) === 21) {
          data[i] = (Math.imul(11, 8) + 0) | 0;
          data[++i] = (Math.imul(11, 8) + 1) | 0;
          data[++i] = (Math.imul(11, 8) + 2) | 0;
          data[++i] = (Math.imul(11, 8) + 3) | 0;
          data[++i] = (Math.imul(11, 8) + 4) | 0;
          data[++i] = (Math.imul(11, 8) + 5) | 0;
          data[++i] = (Math.imul(11, 8) + 6) | 0;
        } else {
          if ((map[(i - 1) | 0]) === Terrain.CHASM) {
            data[i] = (Math.imul(12, 8) + 1) | 0;
          } else if ((map[(i + 1) | 0]) === Terrain.CHASM) {
            data[i] = (Math.imul(12, 8) + 3) | 0;
          } else if (map[i] === Terrain.EMPTY_DECO) {
            data[i] = (Math.imul(12, 8) + 4) | 0;
          } else {
            data[i] = (Math.imul(12, 8) + 2) | 0;
          }
        }
      } else {
        data[i] = -1;
      }
    }
    for (let i = 0; i < CityBossLevel$CustomGroundVisuals.STAIR_ROWS; i++) {
      for (let j = 0; j < 7; j++) {
        (data[(stairsTop + j) | 0]) = (Math.imul(((i + 4) | 0), 8) + j) | 0;
      }
      stairsTop = (stairsTop + this.tileW) | 0;
    }
    for (let i = Math.imul(this.tileW, 22); i < Math.imul(this.tileW, this.tileH); i++) {
      if (map[i] === Terrain.PEDESTAL) {
        data[i] = (Math.imul(13, 8) + 4) | 0;
      } else if (map[i] === Terrain.STATUE) {
        if (i < Math.imul(this.tileW, 32)) {
          if (i % this.tileW > 7) {
            data[i] = (Math.imul(10, 8) + 7) | 0;
            i++;
            data[i] = (Math.imul(11, 8) + 7) | 0;
          } else {
            data[i] = (Math.imul(8, 8) + 7) | 0;
            i++;
            data[i] = (Math.imul(9, 8) + 7) | 0;
          }
        } else {
          if (i % this.tileW > 7) {
            data[i] = (Math.imul(15, 8) + 4) | 0;
          } else {
            data[i] = -1;
          }
        }
      } else if (map[i] === Terrain.CUSTOM_DECO_EMPTY || map[i] === Terrain.EMPTY_SP) {
        if (((map[(i + 1) | 0]) === Terrain.CUSTOM_DECO_EMPTY && (map[(i + this.tileW) | 0]) === Terrain.CUSTOM_DECO_EMPTY) || ((map[(i + 1) | 0]) === Terrain.EMPTY_SP && (map[(i + this.tileW) | 0]) === Terrain.EMPTY_SP)) {
          data[i] = (Math.imul(13, 8) + 1) | 0;
          data[++i] = (Math.imul(13, 8) + 2) | 0;
          data[++i] = (Math.imul(13, 8) + 3) | 0;
        } else if ((map[(i + 1) | 0]) === Terrain.CUSTOM_DECO) {
          data[i] = (Math.imul(14, 8) + 1) | 0;
          data[++i] = (Math.imul(14, 8) + 2) | 0;
          data[++i] = (Math.imul(14, 8) + 3) | 0;
        } else if (((map[(i + 1) | 0]) === Terrain.CUSTOM_DECO_EMPTY && (map[(i - this.tileW) | 0]) === Terrain.CUSTOM_DECO_EMPTY) || ((map[(i + 1) | 0]) === Terrain.EMPTY_SP && (map[(i - this.tileW) | 0]) === Terrain.EMPTY_SP)) {
          data[i] = (Math.imul(15, 8) + 1) | 0;
          data[++i] = (Math.imul(15, 8) + 2) | 0;
          data[++i] = (Math.imul(15, 8) + 3) | 0;
        } else if (((map[(i - this.tileW) | 0]) !== Terrain.CUSTOM_DECO_EMPTY && (map[(i - this.tileW) | 0]) !== Terrain.EMPTY_SP) || (map[(i - Math.imul(2, this.tileW)) | 0]) === Terrain.CUSTOM_DECO) {
          data[i] = (Math.imul(13, 8) + 0) | 0;
        } else if ((map[(i + this.tileW) | 0]) !== Terrain.CUSTOM_DECO_EMPTY && (map[(i + this.tileW) | 0]) !== Terrain.EMPTY_SP) {
          data[i] = (Math.imul(15, 8) + 0) | 0;
        } else {
          data[i] = (Math.imul(14, 8) + 0) | 0;
        }
      } else {
        data[i] = -1;
      }
    }
    v.map(data, this.tileW);
    return v;
  }
  allowWater(tileX: number, tileY: number): boolean {
    if (super.allowWater(tileX, tileY)) {
      return true;
    } else {
      let i = (tileX + Math.imul(tileY, this.tileW)) | 0;
      let map = Dungeon.level.map_;
      return i > Math.imul(this.tileW, 32) && (map[i] === Terrain.EMPTY || map[i] === Terrain.EMPTY_DECO) && (map[(i - this.tileW) | 0]) === Terrain.WALL_DECO;
    }
  }
  name(tileX: number, tileY: number): string {
    let cell = (this.tileX + tileX + Math.imul(((this.tileY + tileY) | 0), this.tileW)) | 0;
    if (cell < Math.imul(Dungeon.level.width_, 22)) {
      if (Dungeon.level.map_[cell] === Terrain.STATUE) {
        return Messages.get$Class$String$ObjectArr($J.cls(HallsLevel), 'statue_name', []);
      }
    } else {
      if (Dungeon.level.map_[cell] === Terrain.CUSTOM_DECO) {
        return Messages.get$Class$String$ObjectArr($J.cls(CityBossLevel), 'throne_name', []);
      } else if (Dungeon.level.map_[cell] === Terrain.PEDESTAL) {
        return Messages.get$Class$String$ObjectArr($J.cls(CityBossLevel), 'summoning_name', []);
      }
    }
    return super.name(tileX, tileY);
  }
  desc(tileX: number, tileY: number): string {
    let cell = (this.tileX + tileX + Math.imul(((this.tileY + tileY) | 0), this.tileW)) | 0;
    if (cell < Math.imul(Dungeon.level.width_, 22)) {
      if (Dungeon.level.map_[cell] === Terrain.EXIT) {
        return Messages.get$Class$String$ObjectArr($J.cls(HallsLevel), 'exit_desc', []);
      } else if (Dungeon.level.map_[cell] === Terrain.STATUE) {
        return Messages.get$Class$String$ObjectArr($J.cls(HallsLevel), 'statue_desc', []);
      } else if (Dungeon.level.map_[cell] === Terrain.EMPTY_DECO) {
        return '';
      }
    } else {
      if (Dungeon.level.map_[cell] === Terrain.CUSTOM_DECO) {
        return Messages.get$Class$String$ObjectArr($J.cls(CityBossLevel), 'throne_desc', []);
      } else if (Dungeon.level.map_[cell] === Terrain.PEDESTAL) {
        return Messages.get$Class$String$ObjectArr($J.cls(CityBossLevel), 'summoning_desc', []);
      }
    }
    return super.desc(tileX, tileY);
  }
}

export class CityBossLevel$CustomTerrainVisuals extends CustomTilemap {
  _CityBossLevel$CustomTerrainVisuals(): this {
    this._CustomTilemap();
    this.texture_ = Assets$Environment.CITY_BOSS;
    this.tileW = 15;
    this.tileH = 48;
    return this;
  }
  create(): Tilemap {
    let v = super.create();
    let data = $J.newArray(Math.imul(this.tileW, this.tileH), 0);
    let map = Dungeon.level.map_;
    for (let i = this.tileW; i < Math.imul(this.tileW, 22); i++) {
      if (map[i] === Terrain.STATUE) {
        data[i] = (Math.imul(15, 8) + 5) | 0;
      } else {
        data[i] = -1;
      }
    }
    for (let i = Math.imul(this.tileW, 22); i < Math.imul(this.tileW, this.tileH); i++) {
      if (map[i] === Terrain.STATUE) {
        if (i < Math.imul(this.tileW, 32)) {
          if (i % this.tileW > 7) {
            data[i] = (Math.imul(10, 8) + 7) | 0;
            i++;
            data[i] = (Math.imul(11, 8) + 7) | 0;
          } else {
            data[i] = (Math.imul(8, 8) + 7) | 0;
            i++;
            data[i] = (Math.imul(9, 8) + 7) | 0;
          }
        } else {
          if (i % this.tileW > 7) {
            data[i] = (Math.imul(15, 8) + 4) | 0;
          } else {
            data[i] = -1;
          }
        }
      } else if (i < Math.imul(this.tileW, 32) && map[i] === Terrain.WALL_DECO && (map[(i + this.tileW) | 0]) !== Terrain.WALL) {
        data[i] = (Math.imul(6, 8) + 7) | 0;
      } else if (i < Math.imul(this.tileW, 32) && (map[i] === Terrain.EMPTY || map[i] === Terrain.EMPTY_DECO) && (map[(i - this.tileW) | 0]) === Terrain.WALL_DECO) {
        data[i] = (Math.imul(7, 8) + 7) | 0;
      } else {
        data[i] = -1;
      }
    }
    v.map(data, this.tileW);
    return v;
  }
  image(tileX: number, tileY: number): Image {
    return null;
  }
}

export class CityBossLevel$CustomWallVisuals extends CustomTilemap {
  _CityBossLevel$CustomWallVisuals(): this {
    this._CustomTilemap();
    this.texture_ = Assets$Environment.CITY_BOSS;
    this.tileW = 15;
    this.tileH = 48;
    return this;
  }
  create(): Tilemap {
    let v = super.create();
    let data = $J.newArray(Math.imul(this.tileW, this.tileH), 0);
    let map = Dungeon.level.map_;
    let shadowTop = -1;
    for (let i = this.tileW; i < Math.imul(this.tileW, 21); i++) {
      if (map[i] === Terrain.EXIT && shadowTop === -1) {
        shadowTop = (i - Math.imul(this.tileW, 4)) | 0;
      }
      if (map[i] === Terrain.CHASM && (map[(i + this.tileW) | 0]) === Terrain.WALL) {
        data[i] = (Math.imul(12, 8) + 6) | 0;
        data[++i] = (Math.imul(12, 8) + 7) | 0;
      } else if (map[i] === Terrain.WALL && (map[(i - this.tileW) | 0]) === Terrain.CHASM) {
        data[i] = (Math.imul(13, 8) + 6) | 0;
        data[++i] = (Math.imul(13, 8) + 7) | 0;
      } else if ((map[(i + this.tileW) | 0]) === Terrain.STATUE) {
        data[i] = (Math.imul(14, 8) + 5) | 0;
      } else {
        data[i] = -1;
      }
    }
    for (let i = 0; i < 8; i++) {
      if (i < 4) {
        data[shadowTop] = (Math.imul(i, 8) + 0) | 0;
        (data[(shadowTop + 1) | 0]) = (data[(shadowTop + 2) | 0]) = (data[(shadowTop + 3) | 0]) = (data[(shadowTop + 4) | 0]) = (data[(shadowTop + 5) | 0]) = (data[(shadowTop + 6) | 0]) = (Math.imul(i, 8) + 1) | 0;
        (data[(shadowTop + 7) | 0]) = (Math.imul(i, 8) + 2) | 0;
      } else {
        let j = (i - 4) | 0;
        data[shadowTop] = (Math.imul(j, 8) + 3) | 0;
        (data[(shadowTop + 1) | 0]) = (data[(shadowTop + 2) | 0]) = (data[(shadowTop + 3) | 0]) = (data[(shadowTop + 4) | 0]) = (data[(shadowTop + 5) | 0]) = (data[(shadowTop + 6) | 0]) = (Math.imul(j, 8) + 4) | 0;
        (data[(shadowTop + 7) | 0]) = (Math.imul(j, 8) + 5) | 0;
      }
      shadowTop = (shadowTop + this.tileW) | 0;
    }
    for (let i = Math.imul(this.tileW, 21); i < Math.imul(this.tileW, this.tileH); i++) {
      if (map[i] === Terrain.STATUE && i % this.tileW > 7) {
        (data[(i - this.tileW) | 0]) = (Math.imul(14, 8) + 4) | 0;
      } else if (map[i] === Terrain.CUSTOM_DECO) {
        (data[(i - this.tileW) | 0]) = (Math.imul(13, 8) + 5) | 0;
      }
      data[i] = -1;
    }
    v.map(data, this.tileW);
    return v;
  }
}

let $CityBossLevel$1: any = null;
/** An anonymous class (CityBossLevel.java:359). */
function CityBossLevel$1(): any {
  return $CityBossLevel$1 ??= $J.local(class extends JObject {
    call(): void {
      Music.INSTANCE.play$String$boolean(Assets$Music.CITY_BOSS, true);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.CityBossLevel$1', ['com.watabou.utils.Callback']);
}

let $CityBossLevel$2$1: any = null;
/** An anonymous class (CityBossLevel.java:385). */
function CityBossLevel$2$1(): any {
  return $CityBossLevel$2$1 ??= $J.local(class extends JObject {
    call(): void {
      Music.INSTANCE.end();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.CityBossLevel$2$1', ['com.watabou.utils.Callback']);
}

let $CityBossLevel$2: any = null;
/** An anonymous class (CityBossLevel.java:382). */
function CityBossLevel$2(): any {
  return $CityBossLevel$2 ??= $J.local(class extends JObject {
    call(): void {
      Music.INSTANCE.fadeOut(5, new (CityBossLevel$2$1())().$o(this));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.CityBossLevel$2', ['com.watabou.utils.Callback']);
}

$J.define(CityBossLevel, 'com.shatteredpixel.shatteredpixeldungeon.levels.CityBossLevel', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.Level', ctors: { '': '_CityBossLevel' }, clinit: true, lazy: ['WIDTH', 'HEIGHT', 'entry', 'arena', 'end', 'bottomDoor', 'topDoor', 'throne', 'pedestals'] });
$J.define(CityBossLevel$CustomGroundVisuals, 'com.shatteredpixel.shatteredpixeldungeon.levels.CityBossLevel$CustomGroundVisuals', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_CityBossLevel$CustomGroundVisuals' } });
$J.define(CityBossLevel$CustomTerrainVisuals, 'com.shatteredpixel.shatteredpixeldungeon.levels.CityBossLevel$CustomTerrainVisuals', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_CityBossLevel$CustomTerrainVisuals' } });
$J.define(CityBossLevel$CustomWallVisuals, 'com.shatteredpixel.shatteredpixeldungeon.levels.CityBossLevel$CustomWallVisuals', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_CityBossLevel$CustomWallVisuals' } });
$J.module(() => {
  Assets$Environment = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Environment');
  Assets$Music = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Music');
  Bones = $J.load('com.shatteredpixel.shatteredpixeldungeon.Bones');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  DwarfKing = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DwarfKing');
  DwarfKing$Summoning = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DwarfKing$Summoning');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  Imp$Quest = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Imp$Quest');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  CityLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.CityLevel');
  HallsLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.HallsLevel');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  LevelTransition = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition');
  LevelTransition$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition$Type');
  CityPainter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.CityPainter');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  ImpShopRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.ImpShopRoom');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  BossHealthBar = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BossHealthBar');
  Game = $J.load('com.watabou.noosa.Game');
  Music = $J.load('com.watabou.noosa.audio.Music');
  AlphaTweener = $J.load('com.watabou.noosa.tweeners.AlphaTweener');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Point = $J.load('com.watabou.utils.Point');
  Random = $J.load('com.watabou.utils.Random');
  Rect = $J.load('com.watabou.utils.Rect');
});
