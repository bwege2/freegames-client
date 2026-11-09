// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/HallsBossLevel.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Environment, Assets$Music, Bones, Dungeon, Statistics, Actor, Char, Char$Property, AscensionChallenge, Buff, YogDzewa, CellEmitter, Pushing, FlameParticle, ShadowParticle, Amulet, Heap$Type, HallsLevel, Patch, Terrain, LevelTransition, LevelTransition$Type, Painter, Messages, GameScene, ItemSprite, ItemSpriteSheet, BossHealthBar, WndOptions, Game, Music, PathFinder, Random;

export class HallsBossLevel extends Level {
  static readonly WIDTH: number = 32;
  static readonly HEIGHT: number = 32;
  static readonly ROOM_LEFT: number = 12;
  static readonly ROOM_RIGHT: number = 20;
  static readonly ROOM_TOP: number = 8;
  static readonly ROOM_BOTTOM: number = 16;
  _HallsBossLevel(): this {
    this._Level();
    this.color1 = 8393984;
    this.color2 = 10913057;
    this.viewDistance = Math.min(4, this.viewDistance);
    return this;
  }
  playLevelMusic(): void {
    if (this.locked && BossHealthBar.isAssigned()) {
      if (BossHealthBar.isBleeding()) {
        Music.INSTANCE.play$String$boolean(Assets$Music.HALLS_BOSS_FINALE, true);
      } else {
        Music.INSTANCE.play$String$boolean(Assets$Music.HALLS_BOSS, true);
      }
    } else if (this.map_[this.exit()] !== Terrain.EXIT || Statistics.amuletObtained) {
      Music.INSTANCE.end();
    } else {
      Music.INSTANCE.playTracks(HallsLevel.HALLS_TRACK_LIST, HallsLevel.HALLS_TRACK_CHANCES, false);
    }
  }
  tilesTex(): string {
    return Assets$Environment.TILES_HALLS;
  }
  waterTex(): string {
    return Assets$Environment.WATER_HALLS;
  }
  build(): boolean {
    this.setSize(HallsBossLevel.WIDTH, HallsBossLevel.HEIGHT);
    for (let i = 0; i < 5; i++) {
      let top: number;
      let bottom: number;
      if (i === 0 || i === 4) {
        top = Random.IntRange((HallsBossLevel.ROOM_TOP - 1) | 0, (HallsBossLevel.ROOM_TOP + 3) | 0);
        bottom = Random.IntRange((HallsBossLevel.ROOM_BOTTOM + 2) | 0, (HallsBossLevel.ROOM_BOTTOM + 6) | 0);
      } else if (i === 1 || i === 3) {
        top = Random.IntRange((HallsBossLevel.ROOM_TOP - 5) | 0, (HallsBossLevel.ROOM_TOP - 1) | 0);
        bottom = Random.IntRange((HallsBossLevel.ROOM_BOTTOM + 6) | 0, (HallsBossLevel.ROOM_BOTTOM + 10) | 0);
      } else {
        top = Random.IntRange((HallsBossLevel.ROOM_TOP - 6) | 0, (HallsBossLevel.ROOM_TOP - 3) | 0);
        bottom = Random.IntRange((HallsBossLevel.ROOM_BOTTOM + 8) | 0, (HallsBossLevel.ROOM_BOTTOM + 12) | 0);
      }
      Painter.fill$Level$int$int$int$int$int(this, (4 + Math.imul(i, 5)) | 0, top, 5, (bottom - top + 1) | 0, Terrain.EMPTY);
      if (i === 2) {
        let entrance = (6 + Math.imul(i, 5) + Math.imul(((bottom - 1) | 0), this.width())) | 0;
        this.transitions.add(new LevelTransition()._LevelTransition$Level$int$Type(this, entrance, LevelTransition$Type.REGULAR_ENTRANCE));
      }
    }
    let exitCell = ($J.idiv(this.width_, 2) + (Math.imul(((HallsBossLevel.ROOM_TOP + 1) | 0), this.width_))) | 0;
    let bossPos = (exitCell + Math.imul(this.width_, 3)) | 0;
    let patch = Patch.generate(this.width_, this.height_, Math.fround(0.2), 0, true);
    for (let i = 0; i < this.length(); i++) {
      if (this.map_[i] === Terrain.EMPTY && patch[i]) {
        this.map_[i] = ((this.distance(i, bossPos) + Random.Int$int(5)) | 0) >= 10 ? Terrain.REGION_DECO : Terrain.STATUE;
      }
    }
    this.map_[this.entrance()] = Terrain.ENTRANCE;
    Painter.fill$Level$int$int$int$int$int(this, (HallsBossLevel.ROOM_LEFT - 1) | 0, (HallsBossLevel.ROOM_TOP - 1) | 0, 11, 11, Terrain.EMPTY);
    patch = Patch.generate(this.width_, this.height_, Math.fround(0.3), 3, true);
    for (let i = 0; i < this.length(); i++) {
      if ((this.map_[i] === Terrain.EMPTY || this.map_[i] === Terrain.STATUE || this.map_[i] === Terrain.REGION_DECO) && patch[i]) {
        this.map_[i] = Terrain.WATER;
      }
    }
    for (let i = 0; i < this.length(); i++) {
      if (this.map_[i] === Terrain.EMPTY && Random.Int$int(4) === 0) {
        this.map_[i] = Terrain.EMPTY_DECO;
      }
    }
    Painter.fill$Level$int$int$int$int$int(this, HallsBossLevel.ROOM_LEFT, HallsBossLevel.ROOM_TOP, 9, 9, Terrain.EMPTY_SP);
    Painter.fill$Level$int$int$int$int$int(this, HallsBossLevel.ROOM_LEFT, HallsBossLevel.ROOM_TOP, 9, 2, Terrain.WALL_DECO);
    Painter.fill$Level$int$int$int$int$int(this, HallsBossLevel.ROOM_LEFT, (HallsBossLevel.ROOM_BOTTOM - 1) | 0, 2, 2, Terrain.WALL_DECO);
    Painter.fill$Level$int$int$int$int$int(this, (HallsBossLevel.ROOM_RIGHT - 1) | 0, (HallsBossLevel.ROOM_BOTTOM - 1) | 0, 2, 2, Terrain.WALL_DECO);
    Painter.fill$Level$int$int$int$int$int(this, (HallsBossLevel.ROOM_LEFT + 3) | 0, (HallsBossLevel.ROOM_TOP + 2) | 0, 3, 4, Terrain.EMPTY);
    let exit = new LevelTransition()._LevelTransition$Level$int$Type(this, exitCell, LevelTransition$Type.REGULAR_EXIT);
    exit.top_--;
    exit.left_--;
    exit.right_++;
    this.transitions.add(exit);
    let vis = new HallsBossLevel$CenterPieceVisuals()._HallsBossLevel$CenterPieceVisuals();
    vis.pos$int$int(HallsBossLevel.ROOM_LEFT, (HallsBossLevel.ROOM_TOP + 1) | 0);
    this.customTiles.add(vis);
    vis = new HallsBossLevel$CenterPieceWalls()._HallsBossLevel$CenterPieceWalls();
    vis.pos$int$int(HallsBossLevel.ROOM_LEFT, HallsBossLevel.ROOM_TOP);
    this.customWalls.add(vis);
    for (let i = 0; i < this.length(); i++) {
      if (this.map_[i] === Terrain.REGION_DECO && Random.Int$int(2) === 0) {
        this.map_[i] = Terrain.REGION_DECO_ALT;
      }
    }
    for (let i = 0; i < this.length_; i++) {
      this.passable[i] = (Terrain.flags[this.map_[i]] & Terrain.PASSABLE) !== 0;
    }
    return (PathFinder.getStep(this.entrance(), this.exit(), this.passable) !== -1);
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
      for (const $it0 = bonesItems.iterator(); $it0.hasNext(); ) {
        let i = $it0.next();
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
  occupyCell(ch: Char): void {
    if (this.map_[this.entrance()] === Terrain.ENTRANCE && this.map_[this.exit()] !== Terrain.EXIT && ch === Dungeon.hero && Dungeon.level.distance(ch.pos, this.entrance()) >= 2) {
      this.seal();
    }
    super.occupyCell(ch);
  }
  seal(): void {
    super.seal();
    Statistics.qualifiedForBossChallengeBadge = true;
    let entrance = this.entrance();
    Level.set$int$int(entrance, Terrain.EMPTY_SP);
    GameScene.updateMap$int(entrance);
    CellEmitter.get(entrance).start(FlameParticle.FACTORY, Math.fround(0.1), 10);
    Dungeon.observe$();
    let boss = new YogDzewa()._YogDzewa();
    boss.pos = (this.exit() + Math.imul(this.width_, 3)) | 0;
    if (Actor.findChar(boss.pos) != null) {
      let candidates = new ArrayList();
      for (let i of PathFinder.NEIGHBOURS8) {
        if ((Actor.findChar((boss.pos + i) | 0)) == null) {
          candidates.add((boss.pos + i) | 0);
        }
      }
      let ch = Actor.findChar(boss.pos);
      if (!candidates.isEmpty()) {
        ch.pos = Random.element$Collection(candidates);
      } else {
        ch.pos = (boss.pos + Math.imul(2, this.width_)) | 0;
      }
      Actor.add$Actor(new Pushing()._Pushing$Char$int$int(ch, boss.pos, ch.pos));
    }
    GameScene.add$Mob(boss);
  }
  unseal(): void {
    super.unseal();
    Level.set$int$int(this.entrance(), Terrain.ENTRANCE);
    GameScene.updateMap$int(this.entrance());
    Level.set$int$int(this.exit(), Terrain.EXIT);
    GameScene.updateMap$int(this.exit());
    (CellEmitter.get((this.exit() - 1) | 0)).burst(ShadowParticle.UP, 25);
    CellEmitter.get(this.exit()).burst(ShadowParticle.UP, 100);
    (CellEmitter.get((this.exit() + 1) | 0)).burst(ShadowParticle.UP, 25);
    for (const $it1 = this.customTiles.iterator(); $it1.hasNext(); ) {
      let t = $it1.next();
      if (t instanceof HallsBossLevel$CenterPieceVisuals) {
        (t).updateState();
      }
    }
    for (const $it2 = this.customWalls.iterator(); $it2.hasNext(); ) {
      let t = $it2.next();
      if (t instanceof HallsBossLevel$CenterPieceWalls) {
        (t).updateState();
      }
    }
    Dungeon.observe$();
    Game.runOnRenderThread(new (HallsBossLevel$1())().$o(this));
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    for (const $it3 = this.mobs.iterator(); $it3.hasNext(); ) {
      let m = $it3.next();
      if (m instanceof YogDzewa) {
        (m).updateVisibility(this);
      }
    }
  }
  activateTransition(hero: Hero, transition: LevelTransition): boolean {
    if (transition.type_ === LevelTransition$Type.REGULAR_ENTRANCE && hero.belongings.getItem($J.cls(Amulet)) != null && hero.buff($J.cls(AscensionChallenge)) == null) {
      Game.runOnRenderThread(new (HallsBossLevel$2())().$o(this).$c(hero, transition));
      return false;
    } else {
      return super.activateTransition(hero, transition);
    }
  }
  tileName(tile: number): string {
    switch (tile) {
      case Terrain.WATER:
        return Messages.get$Class$String$ObjectArr($J.cls(HallsLevel), 'water_name', []);
      case Terrain.GRASS:
        return Messages.get$Class$String$ObjectArr($J.cls(HallsLevel), 'grass_name', []);
      case Terrain.HIGH_GRASS:
        return Messages.get$Class$String$ObjectArr($J.cls(HallsLevel), 'high_grass_name', []);
      case Terrain.STATUE:
      case Terrain.STATUE_SP:
        return Messages.get$Class$String$ObjectArr($J.cls(HallsLevel), 'statue_name', []);
      case Terrain.REGION_DECO:
      case Terrain.REGION_DECO_ALT:
        return Messages.get$Class$String$ObjectArr($J.cls(HallsLevel), 'region_deco_name', []);
      default:
        return super.tileName(tile);
    }
  }
  tileDesc(tile: number): string {
    switch (tile) {
      case Terrain.WATER:
        return Messages.get$Class$String$ObjectArr($J.cls(HallsLevel), 'water_desc', []);
      case Terrain.STATUE:
      case Terrain.STATUE_SP:
        return Messages.get$Class$String$ObjectArr($J.cls(HallsLevel), 'statue_desc', []);
      case Terrain.BOOKSHELF:
        return Messages.get$Class$String$ObjectArr($J.cls(HallsLevel), 'bookshelf_desc', []);
      case Terrain.REGION_DECO:
      case Terrain.REGION_DECO_ALT:
        return Messages.get$Class$String$ObjectArr($J.cls(HallsLevel), 'region_deco_desc', []);
      default:
        return super.tileDesc(tile);
    }
  }
  addVisuals(): Group {
    super.addVisuals();
    HallsLevel.addHallsVisuals(this, this.visuals);
    return this.visuals;
  }
}

export class HallsBossLevel$CenterPieceVisuals extends CustomTilemap {
  static map: number[] = null;
  _HallsBossLevel$CenterPieceVisuals(): this {
    this._CustomTilemap();
    this.texture_ = Assets$Environment.HALLS_SP;
    this.tileW = 9;
    this.tileH = 8;
    return this;
  }
  create(): Tilemap {
    let v = super.create();
    this.updateState();
    return v;
  }
  updateState(): void {
    if (this.vis != null) {
      let data = HallsBossLevel$CenterPieceVisuals.map.slice();
      if (Dungeon.level.map_[Dungeon.level.exit()] === Terrain.EXIT) {
        data[4] = 19;
        data[12] = data[14] = 31;
      }
      this.vis.map(data, this.tileW);
    }
  }
  static $clinit() {
    HallsBossLevel$CenterPieceVisuals.map = [8, 9, 10, 11, 11, 11, 12, 13, 14, 16, 17, 18, 27, 19, 27, 20, 21, 22, 24, 25, 26, 19, 19, 19, 28, 29, 30, 24, 25, 26, 19, 19, 19, 28, 29, 30, 24, 25, 26, 19, 19, 19, 28, 29, 30, 24, 25, 34, 35, 35, 35, 34, 29, 30, 40, 41, 36, 36, 36, 36, 36, 40, 41, 48, 49, 36, 36, 36, 36, 36, 48, 49];
  }
}

export class HallsBossLevel$CenterPieceWalls extends CustomTilemap {
  static map: number[] = null;
  _HallsBossLevel$CenterPieceWalls(): this {
    this._CustomTilemap();
    this.texture_ = Assets$Environment.HALLS_SP;
    this.tileW = 9;
    this.tileH = 9;
    return this;
  }
  create(): Tilemap {
    let v = super.create();
    this.updateState();
    return v;
  }
  updateState(): void {
    if (this.vis != null) {
      let data = HallsBossLevel$CenterPieceWalls.map.slice();
      if (Dungeon.level.map_[Dungeon.level.exit()] === Terrain.EXIT) {
        data[3] = 1;
        data[4] = 0;
        data[5] = 2;
        data[13] = 23;
      }
      this.vis.map(data, this.tileW);
    }
  }
  static $clinit() {
    HallsBossLevel$CenterPieceWalls.map = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 32, 33, -1, -1, -1, -1, -1, 32, 33, 40, 41, -1, -1, -1, -1, -1, 40, 41];
  }
}

let $HallsBossLevel$1$1: any = null;
/** An anonymous class (HallsBossLevel.java:314). */
function HallsBossLevel$1$1(): any {
  return $HallsBossLevel$1$1 ??= $J.local(class extends JObject {
    call(): void {
      Music.INSTANCE.play$String$boolean(Assets$Music.THEME_FINALE, true);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.HallsBossLevel$1$1', ['com.watabou.utils.Callback']);
}

let $HallsBossLevel$1: any = null;
/** An anonymous class (HallsBossLevel.java:311). */
function HallsBossLevel$1(): any {
  return $HallsBossLevel$1 ??= $J.local(class extends JObject {
    call(): void {
      Music.INSTANCE.fadeOut(5, new (HallsBossLevel$1$1())().$o(this));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.HallsBossLevel$1', ['com.watabou.utils.Callback']);
}

let $HallsBossLevel$2$1: any = null;
/** An anonymous class (HallsBossLevel.java:347). */
function HallsBossLevel$2$1(): any {
  return $HallsBossLevel$2$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      if (index === 0) {
        Buff.affect$Char$Class(this.$cv_hero, $J.cls(AscensionChallenge));
        Statistics.highestAscent = 25;
        super.activateTransition(this.$cv_hero, this.$cv_transition);
      }
    }
    $c($hero, $transition): this {
      this.$cv_hero = $hero; this.$cv_transition = $transition;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.HallsBossLevel$2$1', []);
}

let $HallsBossLevel$2: any = null;
/** An anonymous class (HallsBossLevel.java:340). */
function HallsBossLevel$2(): any {
  return $HallsBossLevel$2 ??= $J.local(class extends JObject {
    call(): void {
      GameScene.show(new (HallsBossLevel$2$1())().$o(this).$c(this.$cv_hero, this.$cv_transition)._WndOptions$Image$String$String$StringArr(new ItemSprite()._ItemSprite$int(ItemSpriteSheet.AMULET), Messages.get$Class$String$ObjectArr($J.cls(Amulet), 'ascent_title', []), Messages.get$Class$String$ObjectArr($J.cls(Amulet), 'ascent_desc', []), [Messages.get$Class$String$ObjectArr($J.cls(Amulet), 'ascent_yes', []), Messages.get$Class$String$ObjectArr($J.cls(Amulet), 'ascent_no', [])]));
    }
    $c($hero, $transition): this {
      this.$cv_hero = $hero; this.$cv_transition = $transition;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.HallsBossLevel$2', ['com.watabou.utils.Callback']);
}

$J.define(HallsBossLevel, 'com.shatteredpixel.shatteredpixeldungeon.levels.HallsBossLevel', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.Level', ctors: { '': '_HallsBossLevel' } });
$J.define(HallsBossLevel$CenterPieceVisuals, 'com.shatteredpixel.shatteredpixeldungeon.levels.HallsBossLevel$CenterPieceVisuals', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_HallsBossLevel$CenterPieceVisuals' }, clinit: true, lazy: ['map'] });
$J.define(HallsBossLevel$CenterPieceWalls, 'com.shatteredpixel.shatteredpixeldungeon.levels.HallsBossLevel$CenterPieceWalls', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_HallsBossLevel$CenterPieceWalls' }, clinit: true, lazy: ['map'] });
$J.module(() => {
  Assets$Environment = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Environment');
  Assets$Music = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Music');
  Bones = $J.load('com.shatteredpixel.shatteredpixeldungeon.Bones');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  AscensionChallenge = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AscensionChallenge');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  YogDzewa = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogDzewa');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Pushing = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Pushing');
  FlameParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.FlameParticle');
  ShadowParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShadowParticle');
  Amulet = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Amulet');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  HallsLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.HallsLevel');
  Patch = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Patch');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  LevelTransition = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition');
  LevelTransition$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition$Type');
  Painter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.Painter');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  BossHealthBar = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BossHealthBar');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  Game = $J.load('com.watabou.noosa.Game');
  Music = $J.load('com.watabou.noosa.audio.Music');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
