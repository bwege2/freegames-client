// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/CavesLevel.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../jre/index.ts';
import { RegularLevel } from './RegularLevel.ts';
import { Group } from '../../../watabou/noosa/Group.ts';
import { PixelParticle } from '../../../watabou/noosa/particles/PixelParticle.ts';

let Assets$Environment, Assets$Music, Dungeon, Statistics, Actor, Blacksmith, Blacksmith$Quest, Pickaxe, Level$Feeling, Terrain, LevelTransition$Type, CavesPainter, BurningTrap, ConfusionTrap, CorrosionTrap, FrostTrap, GatewayTrap, GeyserTrap, GrippingTrap, GuardianTrap, PitfallTrap, PoisonDartTrap, RockfallTrap, StormTrap, SummoningTrap, WarpingTrap, Messages, GameScene, BlacksmithSprite, DungeonTileSheet, DungeonTilemap, GLog, WndOptions, WndTitledMessage, Game, Music, Random;

export class CavesLevel extends RegularLevel {
  static CAVES_TRACK_LIST: string[] = null;
  static CAVES_TRACK_CHANCES: number[] = null;
  _CavesLevel(): this {
    this._RegularLevel();
    this.color1 = 5459774;
    this.color2 = 12179041;
    return this;
  }
  playLevelMusic(): void {
    if (Statistics.amuletObtained) {
      Music.INSTANCE.play$String$boolean(Assets$Music.CAVES_TENSE, true);
    } else {
      Music.INSTANCE.playTracks(CavesLevel.CAVES_TRACK_LIST, CavesLevel.CAVES_TRACK_CHANCES, false);
    }
  }
  initRooms(): ArrayList<Room> {
    return Blacksmith$Quest.spawn(super.initRooms());
  }
  standardRooms(forceMax: boolean): number {
    if (forceMax) {
      return 7;
    }
    return (6 + Random.chances$floatArr([2, 1])) | 0;
  }
  specialRooms(forceMax: boolean): number {
    if (forceMax) {
      return 3;
    }
    return (2 + Random.chances$floatArr([4, 1])) | 0;
  }
  painter(): Painter {
    return new CavesPainter()._CavesPainter().setWater(this.feeling === Level$Feeling.WATER ? Math.fround(0.85) : Math.fround(0.3), 6).setGrass(this.feeling === Level$Feeling.GRASS ? Math.fround(0.65) : Math.fround(0.15), 3).setTraps(this.nTraps(), this.trapClasses(), this.trapChances());
  }
  activateTransition(hero: Hero, transition: LevelTransition): boolean {
    if (transition.type_ === LevelTransition$Type.BRANCH_EXIT && (!Blacksmith$Quest.given() || Blacksmith$Quest.completed() || !Blacksmith$Quest.started())) {
      let smith = null;
      for (const $it0 = Actor.chars().iterator(); $it0.hasNext(); ) {
        let c = $it0.next();
        if (c instanceof Blacksmith) {
          smith = c;
          break;
        }
      }
      if (smith == null || !Blacksmith$Quest.given() || Blacksmith$Quest.completed()) {
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(Blacksmith), 'entrance_blocked', []), []);
      } else {
        let pick = hero.belongings.getItem($J.cls(Pickaxe));
        Game.runOnRenderThread(new (CavesLevel$1())().$o(this).$c(pick, hero, transition));
      }
      return false;
    } else {
      return super.activateTransition(hero, transition);
    }
  }
  tilesTex(): string {
    return Assets$Environment.TILES_CAVES;
  }
  waterTex(): string {
    return Assets$Environment.WATER_CAVES;
  }
  trapClasses(): JClass<any>[] {
    return [$J.cls(BurningTrap), $J.cls(PoisonDartTrap), $J.cls(FrostTrap), $J.cls(StormTrap), $J.cls(CorrosionTrap), $J.cls(GrippingTrap), $J.cls(RockfallTrap), $J.cls(GuardianTrap), $J.cls(ConfusionTrap), $J.cls(SummoningTrap), $J.cls(WarpingTrap), $J.cls(PitfallTrap), $J.cls(GatewayTrap), $J.cls(GeyserTrap)];
  }
  trapChances(): number[] {
    return [4, 4, 4, 4, 4, 2, 2, 2, 1, 1, 1, 1, 1, 1];
  }
  tileName(tile: number): string {
    switch (tile) {
      case Terrain.GRASS:
        return Messages.get$Class$String$ObjectArr($J.cls(CavesLevel), 'grass_name', []);
      case Terrain.HIGH_GRASS:
        return Messages.get$Class$String$ObjectArr($J.cls(CavesLevel), 'high_grass_name', []);
      case Terrain.WATER:
        return Messages.get$Class$String$ObjectArr($J.cls(CavesLevel), 'water_name', []);
      case Terrain.REGION_DECO:
      case Terrain.REGION_DECO_ALT:
        return Messages.get$Class$String$ObjectArr($J.cls(CavesLevel), 'region_deco_name', []);
      default:
        return super.tileName(tile);
    }
  }
  tileDesc(tile: number): string {
    switch (tile) {
      case Terrain.ENTRANCE:
      case Terrain.ENTRANCE_SP:
        return Messages.get$Class$String$ObjectArr($J.cls(CavesLevel), 'entrance_desc', []);
      case Terrain.EXIT:
        return Messages.get$Class$String$ObjectArr($J.cls(CavesLevel), 'exit_desc', []);
      case Terrain.HIGH_GRASS:
        return Messages.get$Class$String$ObjectArr($J.cls(CavesLevel), 'high_grass_desc', []);
      case Terrain.WALL_DECO:
        return Messages.get$Class$String$ObjectArr($J.cls(CavesLevel), 'wall_deco_desc', []);
      case Terrain.BOOKSHELF:
        return Messages.get$Class$String$ObjectArr($J.cls(CavesLevel), 'bookshelf_desc', []);
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
  static addCavesVisuals$Level$Group(level: Level, group: Group): void {
    CavesLevel.addCavesVisuals$Level$Group$boolean(level, group, false);
  }
  static addCavesVisuals$Level$Group$boolean(level: Level, group: Group, overHang: boolean): void {
    for (let i = 0; i < level.length(); i++) {
      if (level.map_[i] === Terrain.WALL_DECO) {
        group.add$Gizmo(new CavesLevel$Vein()._CavesLevel$Vein$int$boolean(i, overHang));
      }
    }
  }
  static $clinit() {
    CavesLevel.CAVES_TRACK_LIST = [Assets$Music.CAVES_1, Assets$Music.CAVES_2, Assets$Music.CAVES_2, Assets$Music.CAVES_1, Assets$Music.CAVES_3, Assets$Music.CAVES_3];
    CavesLevel.CAVES_TRACK_CHANCES = [1, 1, 0.5, 0.25, 1, 0.5];
  }
}

export class CavesLevel$Vein extends Group {
  pos: number = 0;
  includeOverhang: boolean = false;
  delay_: number = 0;
  _CavesLevel$Vein$int(pos: number): this {
    this._CavesLevel$Vein$int$boolean(pos, false);
    return this;
  }
  _CavesLevel$Vein$int$boolean(pos: number, includeOverhang: boolean): this {
    this._Group();
    this.pos = pos;
    this.includeOverhang = includeOverhang;
    this.delay_ = Random.Float$float(2);
    return this;
  }
  update(): void {
    if (this.visible_ = (this.pos < Dungeon.level.heroFOV.length && Dungeon.level.heroFOV[this.pos])) {
      super.update();
      if ((this.delay_ = Math.fround(this.delay_ - Game.elapsed)) <= Math.fround(0)) {
        if (Dungeon.level.map_[this.pos] !== Terrain.WALL_DECO) {
          this.kill();
          return;
        }
        this.delay_ = Random.Float$();
        let p = DungeonTilemap.tileToWorld(this.pos);
        if (this.includeOverhang && !(DungeonTileSheet.wallStitcheable(Dungeon.level.map_[(this.pos - Dungeon.level.width()) | 0]))) {
          this.delay_ = Math.fround(this.delay_ * Math.fround(0.67));
          p.y = Math.fround(p.y - Math.fround(DungeonTilemap.SIZE / 2));
          (this.recycle($J.cls(CavesLevel$Sparkle))).reset$float$float(Math.fround(p.x + Random.Float$float(Math.fround(DungeonTilemap.SIZE))), Math.fround(p.y + Random.Float$float(Math.fround(DungeonTilemap.SIZE * 1.5))));
        } else {
          (this.recycle($J.cls(CavesLevel$Sparkle))).reset$float$float(Math.fround(p.x + Random.Float$float(Math.fround(DungeonTilemap.SIZE))), Math.fround(p.y + Random.Float$float(Math.fround(DungeonTilemap.SIZE))));
        }
      }
    }
  }
}

export class CavesLevel$Sparkle extends PixelParticle {
  _CavesLevel$Sparkle(): this {
    this._PixelParticle();
    return this;
  }
  reset$float$float(x: number, y: number): void {
    this.revive();
    this.x = x;
    this.y = y;
    this.left_ = this.lifespan = 0.5;
  }
  update(): void {
    super.update();
    let p = Math.fround(this.left_ / this.lifespan);
    this.size$float(Math.fround((this.am = p < 0.5 ? Math.fround(p * 2) : Math.fround((Math.fround(1 - p)) * 2)) * 2));
  }
}

let $CavesLevel$1$1: any = null;
/** An anonymous class (CavesLevel.java:146). */
function CavesLevel$1$1(): any {
  return $CavesLevel$1$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      if (index === 0) {
        Blacksmith$Quest.start();
        super.activateTransition(this.$cv_hero, this.$cv_transition);
      }
    }
    $c($hero, $transition): this {
      this.$cv_hero = $hero; this.$cv_transition = $transition;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.CavesLevel$1$1', []);
}

let $CavesLevel$1: any = null;
/** An anonymous class (CavesLevel.java:133). */
function CavesLevel$1(): any {
  return $CavesLevel$1 ??= $J.local(class extends JObject {
    call(): void {
      if (this.$cv_pick == null) {
        GameScene.show(new WndTitledMessage()._WndTitledMessage$Image$String$String(new BlacksmithSprite()._BlacksmithSprite(), Messages.titleCase(Messages.get$Class$String$ObjectArr($J.cls(Blacksmith), 'name', [])), Messages.get$Class$String$ObjectArr($J.cls(Blacksmith), 'lost_pick', [])));
      } else {
        GameScene.show(new (CavesLevel$1$1())().$o(this).$c(this.$cv_hero, this.$cv_transition)._WndOptions$Image$String$String$StringArr(new BlacksmithSprite()._BlacksmithSprite(), Messages.titleCase(Messages.get$Class$String$ObjectArr($J.cls(Blacksmith), 'name', [])), Messages.get$Class$String$ObjectArr($J.cls(Blacksmith), 'quest_start_prompt', []), [Messages.get$Class$String$ObjectArr($J.cls(Blacksmith), 'enter_yes', []), Messages.get$Class$String$ObjectArr($J.cls(Blacksmith), 'enter_no', [])]));
      }
    }
    $c($pick, $hero, $transition): this {
      this.$cv_pick = $pick; this.$cv_hero = $hero; this.$cv_transition = $transition;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.CavesLevel$1', ['com.watabou.utils.Callback']);
}

$J.define(CavesLevel, 'com.shatteredpixel.shatteredpixeldungeon.levels.CavesLevel', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.RegularLevel', ctors: { '': '_CavesLevel' }, meths: { 'addCavesVisuals(com.shatteredpixel.shatteredpixeldungeon.levels.Level,com.watabou.noosa.Group,boolean)': 'addCavesVisuals$Level$Group$boolean', 'addCavesVisuals(com.shatteredpixel.shatteredpixeldungeon.levels.Level,com.watabou.noosa.Group)': 'addCavesVisuals$Level$Group' }, clinit: true, lazy: ['CAVES_TRACK_LIST', 'CAVES_TRACK_CHANCES'] });
$J.define(CavesLevel$Vein, 'com.shatteredpixel.shatteredpixeldungeon.levels.CavesLevel$Vein', { kind: 'class', sup: 'com.watabou.noosa.Group', ctors: { 'int,boolean': '_CavesLevel$Vein$int$boolean', 'int': '_CavesLevel$Vein$int' } });
$J.define(CavesLevel$Sparkle, 'com.shatteredpixel.shatteredpixeldungeon.levels.CavesLevel$Sparkle', { kind: 'class', sup: 'com.watabou.noosa.particles.PixelParticle', ctors: { '': '_CavesLevel$Sparkle' }, meths: { 'reset(float,float)': 'reset$float$float' } });
$J.module(() => {
  Assets$Environment = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Environment');
  Assets$Music = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Music');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Blacksmith = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Blacksmith');
  Blacksmith$Quest = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Blacksmith$Quest');
  Pickaxe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.Pickaxe');
  Level$Feeling = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level$Feeling');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  LevelTransition$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition$Type');
  CavesPainter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.CavesPainter');
  BurningTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.BurningTrap');
  ConfusionTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.ConfusionTrap');
  CorrosionTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.CorrosionTrap');
  FrostTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.FrostTrap');
  GatewayTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.GatewayTrap');
  GeyserTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.GeyserTrap');
  GrippingTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.GrippingTrap');
  GuardianTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.GuardianTrap');
  PitfallTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.PitfallTrap');
  PoisonDartTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.PoisonDartTrap');
  RockfallTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.RockfallTrap');
  StormTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.StormTrap');
  SummoningTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.SummoningTrap');
  WarpingTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.WarpingTrap');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  BlacksmithSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.BlacksmithSprite');
  DungeonTileSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTileSheet');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  WndTitledMessage = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndTitledMessage');
  Game = $J.load('com.watabou.noosa.Game');
  Music = $J.load('com.watabou.noosa.audio.Music');
  Random = $J.load('com.watabou.utils.Random');
});
