// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/SewerLevel.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Emitter } from '../../../watabou/noosa/particles/Emitter.ts';
import { PixelParticle } from '../../../watabou/noosa/particles/PixelParticle.ts';

let Assets$Environment, Assets$Music, Badges, Dungeon, GamesInProgress, Statistics, Ghost$Quest, Splash, Amulet, Level, Level$Feeling, Terrain, LevelTransition$Type, SewerPainter, AlarmTrap, ChillingTrap, ConfusionTrap, FlockTrap, GatewayTrap, OozeTrap, ShockingTrap, SummoningTrap, TeleportationTrap, ToxicTrap, WornDartTrap, Messages, GameScene, SurfaceScene, DungeonTilemap, WndMessage, Game, Music, Emitter$Factory, ColorMath, Random;

export class SewerLevel extends RegularLevel {
  static SEWER_TRACK_LIST: string[] = null;
  static SEWER_TRACK_CHANCES: number[] = null;
  _SewerLevel(): this {
    this._RegularLevel();
    this.color1 = 4748860;
    this.color2 = 5871946;
    return this;
  }
  playLevelMusic(): void {
    if (Ghost$Quest.active() || Statistics.amuletObtained) {
      if (Statistics.amuletObtained && Dungeon.depth === 1) {
        Music.INSTANCE.play$String$boolean(Assets$Music.THEME_FINALE, true);
      } else {
        Music.INSTANCE.play$String$boolean(Assets$Music.SEWERS_TENSE, true);
      }
    } else {
      Music.INSTANCE.playTracks(SewerLevel.SEWER_TRACK_LIST, SewerLevel.SEWER_TRACK_CHANCES, false);
    }
  }
  standardRooms(forceMax: boolean): number {
    if (forceMax) {
      return 6;
    }
    return (4 + Random.chances$floatArr([1, 3, 1])) | 0;
  }
  specialRooms(forceMax: boolean): number {
    if (forceMax) {
      return 2;
    }
    return (1 + Random.chances$floatArr([1, 4])) | 0;
  }
  painter(): Painter {
    return new SewerPainter()._SewerPainter().setWater(this.feeling === Level$Feeling.WATER ? Math.fround(0.85) : Math.fround(0.3), 5).setGrass(this.feeling === Level$Feeling.GRASS ? Math.fround(0.8) : Math.fround(0.2), 4).setTraps(this.nTraps(), this.trapClasses(), this.trapChances());
  }
  tilesTex(): string {
    return Assets$Environment.TILES_SEWERS;
  }
  waterTex(): string {
    return Assets$Environment.WATER_SEWERS;
  }
  trapClasses(): JClass<any>[] {
    return Dungeon.depth === 1 ? [$J.cls(WornDartTrap)] : [$J.cls(ChillingTrap), $J.cls(ShockingTrap), $J.cls(ToxicTrap), $J.cls(WornDartTrap), $J.cls(AlarmTrap), $J.cls(OozeTrap), $J.cls(ConfusionTrap), $J.cls(FlockTrap), $J.cls(SummoningTrap), $J.cls(TeleportationTrap), $J.cls(GatewayTrap)];
  }
  trapChances(): number[] {
    return Dungeon.depth === 1 ? [1] : [4, 4, 4, 4, 2, 2, 1, 1, 1, 1, 1];
  }
  createMobs(): void {
    Ghost$Quest.spawn(this, this.roomExit);
    super.createMobs();
  }
  activateTransition(hero: Hero, transition: LevelTransition): boolean {
    if (transition.type_ === LevelTransition$Type.SURFACE) {
      if (hero.belongings.getItem($J.cls(Amulet)) == null) {
        Game.runOnRenderThread(new (SewerLevel$1())().$o(this).$c(hero));
        return false;
      } else {
        Statistics.ascended = true;
        Game.switchScene$Class$SceneChangeCallback($J.cls(SurfaceScene), new (SewerLevel$2())().$o(this));
        return true;
      }
    } else {
      return super.activateTransition(hero, transition);
    }
  }
  addVisuals(): Group {
    super.addVisuals();
    SewerLevel.addSewerVisuals(this, this.visuals);
    return this.visuals;
  }
  buildFlagMaps(): void {
    super.buildFlagMaps();
    for (let i = 0; i < this.length(); i++) {
      if (this.map_[i] === Terrain.REGION_DECO || this.map_[i] === Terrain.REGION_DECO_ALT) {
        this.flamable[i] = true;
      }
    }
  }
  destroy(pos: number): void {
    let terr = this.map_[pos];
    if (terr === Terrain.REGION_DECO) {
      Level.set$int$int(pos, Terrain.WATER);
      Splash.at$int$int$int(pos, -11502755, 10);
    } else if (terr === Terrain.REGION_DECO_ALT) {
      Level.set$int$int(pos, Terrain.EMPTY_SP);
      Splash.at$int$int$int(pos, -11502755, 10);
    }
    super.destroy(pos);
  }
  static addSewerVisuals(level: Level, group: Group): void {
    for (let i = 0; i < level.length(); i++) {
      if (level.map_[i] === Terrain.WALL_DECO) {
        group.add$Gizmo(new SewerLevel$Sink()._SewerLevel$Sink(i));
      }
    }
  }
  tileName(tile: number): string {
    switch (tile) {
      case Terrain.WATER:
        return Messages.get$Class$String$ObjectArr($J.cls(SewerLevel), 'water_name', []);
      case Terrain.REGION_DECO:
      case Terrain.REGION_DECO_ALT:
        return Messages.get$Class$String$ObjectArr($J.cls(SewerLevel), 'region_deco_name', []);
      default:
        return super.tileName(tile);
    }
  }
  tileDesc(tile: number): string {
    switch (tile) {
      case Terrain.EMPTY_DECO:
        return Messages.get$Class$String$ObjectArr($J.cls(SewerLevel), 'empty_deco_desc', []);
      case Terrain.BOOKSHELF:
        return Messages.get$Class$String$ObjectArr($J.cls(SewerLevel), 'bookshelf_desc', []);
      case Terrain.REGION_DECO:
      case Terrain.REGION_DECO_ALT:
        return Messages.get$Class$String$ObjectArr($J.cls(SewerLevel), 'region_deco_desc', []);
      default:
        return super.tileDesc(tile);
    }
  }
  static $clinit() {
    SewerLevel.SEWER_TRACK_LIST = [Assets$Music.SEWERS_1, Assets$Music.SEWERS_2, Assets$Music.SEWERS_2, Assets$Music.SEWERS_1, Assets$Music.SEWERS_3, Assets$Music.SEWERS_3];
    SewerLevel.SEWER_TRACK_CHANCES = [1, 1, 0.5, 0.25, 1, 0.5];
  }
}

export class SewerLevel$Sink extends Emitter {
  pos: number = 0;
  rippleDelay: number = 0;
  static factory: Emitter$Factory = null;
  _SewerLevel$Sink(pos: number): this {
    this._Emitter();
    this.rippleDelay = 0;
    this.pos = pos;
    let p = DungeonTilemap.tileCenterToWorld(pos);
    this.pos$float$float$float$float(Math.fround(p.x - 2), Math.fround(p.y + 3), 4, 0);
    this.pour(SewerLevel$Sink.factory, Math.fround(0.1));
    return this;
  }
  update(): void {
    if (this.visible_ = (this.pos < Dungeon.level.heroFOV.length && Dungeon.level.heroFOV[this.pos])) {
      super.update();
      if (!this.isFrozen() && (this.rippleDelay = Math.fround(this.rippleDelay - Game.elapsed)) <= Math.fround(0)) {
        let ripple = GameScene.ripple((this.pos + Dungeon.level.width()) | 0);
        if (ripple != null) {
          ripple.y = Math.fround(ripple.y - $J.idiv(DungeonTilemap.SIZE, 2));
          this.rippleDelay = Random.Float$float$float(Math.fround(0.4), Math.fround(0.6));
        }
      }
    }
  }
  static $clinit() {
    SewerLevel$Sink.factory = new (SewerLevel$Sink$1())()._Emitter$Factory();
  }
}

export class SewerLevel$WaterParticle extends PixelParticle {
  _SewerLevel$WaterParticle(): this {
    this._PixelParticle();
    this.acc.y = 50;
    this.am = 0.5;
    this.color$int(ColorMath.random(11979970, 3892819));
    this.size$float(2);
    return this;
  }
  reset$float$float(x: number, y: number): void {
    this.revive();
    this.x = x;
    this.y = y;
    this.speed_.set$float$float(Random.Float$float$float(-2, Math.fround(+2)), 0);
    this.left_ = this.lifespan = Math.fround(0.4);
  }
}

let $SewerLevel$1: any = null;
/** An anonymous class (SewerLevel.java:149). */
function SewerLevel$1(): any {
  return $SewerLevel$1 ??= $J.local(class extends JObject {
    call(): void {
      GameScene.show(new WndMessage()._WndMessage(Messages.get$Object$String$ObjectArr(this.$cv_hero, 'leave', [])));
    }
    $c($hero): this {
      this.$cv_hero = $hero;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.SewerLevel$1', ['com.watabou.utils.Callback']);
}

let $SewerLevel$2: any = null;
/** An anonymous class (SewerLevel.java:158). */
function SewerLevel$2(): any {
  return $SewerLevel$2 ??= $J.local(class extends JObject {
    beforeCreate(): void {
    }
    afterCreate(): void {
      Badges.validateHappyEnd();
      Dungeon.win($J.cls(Amulet));
      Dungeon.deleteGame(GamesInProgress.curSlot, true);
      Badges.saveGlobal$();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.SewerLevel$2', ['com.watabou.noosa.Game$SceneChangeCallback']);
}

let $SewerLevel$Sink$1: any = null;
/** An anonymous class (SewerLevel.java:251). */
function SewerLevel$Sink$1(): any {
  return $SewerLevel$Sink$1 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      let p = emitter.recycle($J.cls(SewerLevel$WaterParticle));
      p.reset$float$float(x, y);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.SewerLevel$Sink$1', []);
}

$J.define(SewerLevel, 'com.shatteredpixel.shatteredpixeldungeon.levels.SewerLevel', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.RegularLevel', ctors: { '': '_SewerLevel' }, clinit: true, lazy: ['SEWER_TRACK_LIST', 'SEWER_TRACK_CHANCES'] });
$J.define(SewerLevel$Sink, 'com.shatteredpixel.shatteredpixeldungeon.levels.SewerLevel$Sink', { kind: 'class', sup: 'com.watabou.noosa.particles.Emitter', ctors: { 'int': '_SewerLevel$Sink' }, clinit: true, lazy: ['factory'] });
$J.define(SewerLevel$WaterParticle, 'com.shatteredpixel.shatteredpixeldungeon.levels.SewerLevel$WaterParticle', { kind: 'class', sup: 'com.watabou.noosa.particles.PixelParticle', ctors: { '': '_SewerLevel$WaterParticle' }, meths: { 'reset(float,float)': 'reset$float$float' } });
$J.module(() => {
  Assets$Environment = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Environment');
  Assets$Music = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Music');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  GamesInProgress = $J.load('com.shatteredpixel.shatteredpixeldungeon.GamesInProgress');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Ghost$Quest = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Ghost$Quest');
  Splash = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Splash');
  Amulet = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Amulet');
  Level = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level');
  Level$Feeling = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level$Feeling');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  LevelTransition$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition$Type');
  SewerPainter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.SewerPainter');
  AlarmTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.AlarmTrap');
  ChillingTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.ChillingTrap');
  ConfusionTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.ConfusionTrap');
  FlockTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.FlockTrap');
  GatewayTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.GatewayTrap');
  OozeTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.OozeTrap');
  ShockingTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.ShockingTrap');
  SummoningTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.SummoningTrap');
  TeleportationTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.TeleportationTrap');
  ToxicTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.ToxicTrap');
  WornDartTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.WornDartTrap');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  SurfaceScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.SurfaceScene');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  WndMessage = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndMessage');
  Game = $J.load('com.watabou.noosa.Game');
  Music = $J.load('com.watabou.noosa.audio.Music');
  Emitter$Factory = $J.load('com.watabou.noosa.particles.Emitter$Factory');
  ColorMath = $J.load('com.watabou.utils.ColorMath');
  Random = $J.load('com.watabou.utils.Random');
});
