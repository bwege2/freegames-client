// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/MiningLevel.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Arrays, JObject } from '../../../../../jre/index.ts';
import { CavesLevel } from './CavesLevel.ts';
import { CustomTilemap } from '../tiles/CustomTilemap.ts';

let Assets$Environment, Assets$Music, Bones, Challenges, Dungeon, Bat, CrystalWisp, FungalSpinner, GnollGuard, Blacksmith, Blacksmith$Quest, Generator, Generator$Category, Heap$Type, Torch, DarkGold, Pickaxe, Level, Terrain, FigureEightBuilder, LevelTransition$Type, MiningLevelPainter, MineEntrance, MineGiantRoom, MineLargeRoom, MineSecretRoom, MineSmallRoom, Messages, GameScene, BlacksmithSprite, WndOptions, WndTitledMessage, Game, Music, Random;

export class MiningLevel extends CavesLevel {
  _MiningLevel(): this {
    this._CavesLevel();
    return this;
  }
  tilesTex(): string {
    switch (Blacksmith$Quest.Type()) {
      default:
        return Assets$Environment.TILES_CAVES;
      case Blacksmith$Quest.CRYSTAL:
        return Assets$Environment.TILES_CAVES_CRYSTAL;
      case Blacksmith$Quest.GNOLL:
        return Assets$Environment.TILES_CAVES_GNOLL;
    }
  }
  playLevelMusic(): void {
    Music.INSTANCE.play$String$boolean(Assets$Music.CAVES_TENSE, true);
  }
  initRooms(): ArrayList<Room> {
    let initRooms = new ArrayList();
    initRooms.add(this.roomEntrance = new MineEntrance()._MineEntrance());
    let s: StandardRoom;
    s = new MineGiantRoom()._MineGiantRoom();
    s.setSizeCat$();
    initRooms.add(s);
    let rooms = 3;
    for (let i = 0; i < rooms; i++) {
      s = new MineLargeRoom()._MineLargeRoom();
      s.setSizeCat$();
      initRooms.add(s);
    }
    rooms = Random.NormalIntRange(6, 8);
    for (let i = 0; i < rooms; i++) {
      s = new MineSmallRoom()._MineSmallRoom();
      s.setSizeCat$();
      initRooms.add(s);
    }
    rooms = 2;
    for (let i = 0; i < rooms; i++) {
      initRooms.add(new MineSecretRoom()._MineSecretRoom());
    }
    return initRooms;
  }
  builder(): Builder {
    return new FigureEightBuilder()._FigureEightBuilder().setPathLength(Math.fround(0.8), [1]).setTunnelLength([1], [1]);
  }
  build(): boolean {
    if (super.build()) {
      let vis = new MiningLevel$BorderTopDarken()._MiningLevel$BorderTopDarken();
      vis.setRect$int$int$int$int(0, 0, this.width_, 1);
      this.customTiles.add(vis);
      vis = new MiningLevel$BorderWallsDarken()._MiningLevel$BorderWallsDarken();
      vis.setRect$int$int$int$int(0, 0, this.width_, this.height_);
      this.customWalls.add(vis);
      return true;
    }
    return false;
  }
  painter(): Painter {
    return new MiningLevelPainter()._MiningLevelPainter().setGold(Random.NormalIntRange(45, 47)).setWater(Blacksmith$Quest.Type() === Blacksmith$Quest.FUNGI ? Math.fround(0.1) : Math.fround(0.35), 6).setGrass(Blacksmith$Quest.Type() === Blacksmith$Quest.FUNGI ? Math.fround(0.65) : Math.fround(0.1), 3);
  }
  mobLimit(): number {
    return (super.mobLimit() - 1) | 0;
  }
  createMob(): Mob {
    switch (Blacksmith$Quest.Type()) {
      default:
        return new Bat()._Bat();
      case Blacksmith$Quest.CRYSTAL:
        return new CrystalWisp()._CrystalWisp();
      case Blacksmith$Quest.GNOLL:
        return new GnollGuard()._GnollGuard();
      case Blacksmith$Quest.FUNGI:
        return new FungalSpinner()._FungalSpinner();
    }
  }
  respawnCooldown(): number {
    return Math.fround(3 * Level.TIME_TO_RESPAWN);
  }
  createItems(): void {
    Random.pushGenerator$long(Random.Long$());
    let bonesItems = Bones.get();
    if (bonesItems != null) {
      let cell = this.randomDropCell$();
      if (this.map_[cell] === Terrain.HIGH_GRASS || this.map_[cell] === Terrain.FURROWED_GRASS) {
        this.map_[cell] = Terrain.GRASS;
        this.losBlocking[cell] = false;
      }
      for (const $it0 = bonesItems.iterator(); $it0.hasNext(); ) {
        let i = $it0.next();
        this.drop(i, cell).setHauntedIfCursed().type_ = Heap$Type.REMAINS;
      }
    }
    Random.popGenerator();
    let cell = this.randomDropCell$();
    if (this.map_[cell] === Terrain.HIGH_GRASS || this.map_[cell] === Terrain.FURROWED_GRASS) {
      this.map_[cell] = Terrain.GRASS;
      this.losBlocking[cell] = false;
    }
    this.drop(Generator.randomUsingDefaults$Category(Generator$Category.FOOD), cell);
    if (Blacksmith$Quest.Type() === Blacksmith$Quest.GNOLL) {
      cell = this.randomDropCell$();
      if (this.map_[cell] === Terrain.HIGH_GRASS || this.map_[cell] === Terrain.FURROWED_GRASS) {
        this.map_[cell] = Terrain.GRASS;
        this.losBlocking[cell] = false;
      }
      this.drop(Generator.randomUsingDefaults$Category(Generator$Category.FOOD), cell);
    }
    if (Dungeon.isChallenged(Challenges.DARKNESS)) {
      cell = this.randomDropCell$();
      if (this.map_[cell] === Terrain.HIGH_GRASS || this.map_[cell] === Terrain.FURROWED_GRASS) {
        this.map_[cell] = Terrain.GRASS;
        this.losBlocking[cell] = false;
      }
      this.drop(new Torch()._Torch(), cell);
    }
  }
  randomDropCell$(): number {
    return this.randomDropCell$Class($J.cls(MineSmallRoom));
  }
  tileName(tile: number): string {
    switch (tile) {
      case Terrain.MINE_CRYSTAL:
        return Messages.get$Class$String$ObjectArr($J.cls(MiningLevel), 'crystal_name', []);
      case Terrain.MINE_BOULDER:
        return Messages.get$Class$String$ObjectArr($J.cls(MiningLevel), 'boulder_name', []);
      default:
        return super.tileName(tile);
    }
  }
  activateTransition(hero: Hero, transition: LevelTransition): boolean {
    if (transition.type_ === LevelTransition$Type.BRANCH_ENTRANCE && !Blacksmith$Quest.completed()) {
      if (hero.belongings.getItem($J.cls(Pickaxe)) == null) {
        Game.runOnRenderThread(new (MiningLevel$1())().$o(this));
        return false;
      }
      let warnText: string;
      let gold = hero.belongings.getItem($J.cls(DarkGold));
      let goldAmount = gold == null ? 0 : gold.quantity$();
      if (goldAmount < 10) {
        warnText = Messages.get$Class$String$ObjectArr($J.cls(Blacksmith), 'exit_warn_none', []);
      } else if (goldAmount < 20) {
        warnText = Messages.get$Class$String$ObjectArr($J.cls(Blacksmith), 'exit_warn_low', []);
      } else if (goldAmount < 30) {
        warnText = Messages.get$Class$String$ObjectArr($J.cls(Blacksmith), 'exit_warn_med', []);
      } else if (goldAmount < 40) {
        warnText = Messages.get$Class$String$ObjectArr($J.cls(Blacksmith), 'exit_warn_high', []);
      } else {
        warnText = Messages.get$Class$String$ObjectArr($J.cls(Blacksmith), 'exit_warn_full', []);
      }
      if (!Blacksmith$Quest.bossBeaten()) {
        switch (Blacksmith$Quest.Type()) {
          case Blacksmith$Quest.CRYSTAL:
            warnText += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(Blacksmith), 'exit_warn_crystal', []);
            break;
          case Blacksmith$Quest.GNOLL:
            warnText += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(Blacksmith), 'exit_warn_gnoll', []);
            break;
          case Blacksmith$Quest.FUNGI:
            warnText += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(Blacksmith), 'exit_warn_fungi', []);
            break;
        }
      }
      let finalWarnText = warnText;
      Game.runOnRenderThread(new (MiningLevel$2())().$o(this).$c(finalWarnText, hero, transition));
      return false;
    } else {
      return super.activateTransition(hero, transition);
    }
  }
  tileDesc(tile: number): string {
    switch (tile) {
      case Terrain.WALL:
        return Messages.get$Class$String$ObjectArr($J.cls(MiningLevel), 'wall_desc', []);
      case Terrain.WALL_DECO:
        return super.tileDesc(tile) + '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(MiningLevel), 'gold_extra_desc', []);
      case Terrain.MINE_CRYSTAL:
        return Messages.get$Class$String$ObjectArr($J.cls(MiningLevel), 'crystal_desc', []);
      case Terrain.MINE_BOULDER:
        return Messages.get$Class$String$ObjectArr($J.cls(MiningLevel), 'boulder_desc', []);
      case Terrain.BARRICADE:
        return Messages.get$Class$String$ObjectArr($J.cls(MiningLevel), 'barricade_desc', []);
      default:
        return super.tileDesc(tile);
    }
  }
  addVisuals(): Group {
    super.addVisuals();
    this.visuals.clear();
    return this.visuals;
  }
  addWallVisuals(): Group {
    super.addWallVisuals();
    CavesLevel.addCavesVisuals$Level$Group$boolean(this, this.wallVisuals, true);
    return this.wallVisuals;
  }
  invalidHeroPos(tile: number): boolean {
    return false;
  }
}

export class MiningLevel$BorderTopDarken extends CustomTilemap {
  _MiningLevel$BorderTopDarken(): this {
    this._CustomTilemap();
    this.texture_ = Assets$Environment.CAVES_QUEST;
    return this;
  }
  create(): Tilemap {
    let v = super.create();
    let data = $J.newArray(Math.imul(this.tileW, this.tileH), 0);
    Arrays.fill(data, 1);
    v.map(data, this.tileW);
    return v;
  }
  image(tileX: number, tileY: number): Image {
    return null;
  }
}

export class MiningLevel$BorderWallsDarken extends CustomTilemap {
  _MiningLevel$BorderWallsDarken(): this {
    this._CustomTilemap();
    this.texture_ = Assets$Environment.CAVES_QUEST;
    return this;
  }
  create(): Tilemap {
    let v = super.create();
    let data = $J.newArray(Math.imul(this.tileW, this.tileH), 0);
    for (let i = 0; i < data.length; i++) {
      if (i % this.tileW === 0 || i % this.tileW === ((this.tileW - 1) | 0)) {
        data[i] = 1;
      } else if (((i + Math.imul(2, this.tileW)) | 0) > data.length) {
        data[i] = 2;
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

let $MiningLevel$1: any = null;
/** An anonymous class (MiningLevel.java:244). */
function MiningLevel$1(): any {
  return $MiningLevel$1 ??= $J.local(class extends JObject {
    call(): void {
      GameScene.show(new WndTitledMessage()._WndTitledMessage$Image$String$String(new BlacksmithSprite()._BlacksmithSprite(), Messages.titleCase(Messages.get$Class$String$ObjectArr($J.cls(Blacksmith), 'name', [])), Messages.get$Class$String$ObjectArr($J.cls(Blacksmith), 'lost_pick', [])));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.MiningLevel$1', ['com.watabou.utils.Callback']);
}

let $MiningLevel$2$1: any = null;
/** An anonymous class (MiningLevel.java:286). */
function MiningLevel$2$1(): any {
  return $MiningLevel$2$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      if (index === 0) {
        Blacksmith$Quest.complete();
        super.activateTransition(this.$cv_hero, this.$cv_transition);
      }
    }
    $c($hero, $transition): this {
      this.$cv_hero = $hero; this.$cv_transition = $transition;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.MiningLevel$2$1', []);
}

let $MiningLevel$2: any = null;
/** An anonymous class (MiningLevel.java:279). */
function MiningLevel$2(): any {
  return $MiningLevel$2 ??= $J.local(class extends JObject {
    call(): void {
      GameScene.show(new (MiningLevel$2$1())().$o(this).$c(this.$cv_hero, this.$cv_transition)._WndOptions$Image$String$String$StringArr(new BlacksmithSprite()._BlacksmithSprite(), Messages.titleCase(Messages.get$Class$String$ObjectArr($J.cls(Blacksmith), 'name', [])), this.$cv_finalWarnText, [Messages.get$Class$String$ObjectArr($J.cls(Blacksmith), 'exit_yes', []), Messages.get$Class$String$ObjectArr($J.cls(Blacksmith), 'exit_no', [])]));
    }
    $c($finalWarnText, $hero, $transition): this {
      this.$cv_finalWarnText = $finalWarnText; this.$cv_hero = $hero; this.$cv_transition = $transition;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.MiningLevel$2', ['com.watabou.utils.Callback']);
}

$J.define(MiningLevel, 'com.shatteredpixel.shatteredpixeldungeon.levels.MiningLevel', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.CavesLevel', ctors: { '': '_MiningLevel' }, meths: { 'randomDropCell()': 'randomDropCell$' } });
$J.define(MiningLevel$BorderTopDarken, 'com.shatteredpixel.shatteredpixeldungeon.levels.MiningLevel$BorderTopDarken', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_MiningLevel$BorderTopDarken' } });
$J.define(MiningLevel$BorderWallsDarken, 'com.shatteredpixel.shatteredpixeldungeon.levels.MiningLevel$BorderWallsDarken', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_MiningLevel$BorderWallsDarken' } });
$J.module(() => {
  Assets$Environment = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Environment');
  Assets$Music = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Music');
  Bones = $J.load('com.shatteredpixel.shatteredpixeldungeon.Bones');
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Bat = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Bat');
  CrystalWisp = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.CrystalWisp');
  FungalSpinner = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.FungalSpinner');
  GnollGuard = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollGuard');
  Blacksmith = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Blacksmith');
  Blacksmith$Quest = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Blacksmith$Quest');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  Torch = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Torch');
  DarkGold = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.DarkGold');
  Pickaxe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.Pickaxe');
  Level = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  FigureEightBuilder = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.builders.FigureEightBuilder');
  LevelTransition$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition$Type');
  MiningLevelPainter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.MiningLevelPainter');
  MineEntrance = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.MineEntrance');
  MineGiantRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.MineGiantRoom');
  MineLargeRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.MineLargeRoom');
  MineSecretRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.MineSecretRoom');
  MineSmallRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.MineSmallRoom');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  BlacksmithSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.BlacksmithSprite');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  WndTitledMessage = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndTitledMessage');
  Game = $J.load('com.watabou.noosa.Game');
  Music = $J.load('com.watabou.noosa.audio.Music');
  Random = $J.load('com.watabou.utils.Random');
});
