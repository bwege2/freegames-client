// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/CityLevel.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { ElmoParticle } from '../effects/particles/ElmoParticle.ts';
import { PixelParticle } from '../../../watabou/noosa/particles/PixelParticle.ts';

let Assets$Environment, Assets$Music, Dungeon, Statistics, AscensionChallenge, LostInventory, Imp, Imp$Quest, ClothArmor, EscapeCrystal, Level$Feeling, Terrain, LevelTransition$Type, CityPainter, BlazingTrap, CorrosionTrap, CursingTrap, DisarmingTrap, DisintegrationTrap, DistortionTrap, FlashingTrap, FrostTrap, GatewayTrap, GeyserTrap, GuardianTrap, PitfallTrap, RockfallTrap, StormTrap, SummoningTrap, WarpingTrap, WeakeningTrap, Messages, GameScene, ImpSprite, DungeonTilemap, WndOptions, Game, Music, Emitter$Factory, Random;

export class CityLevel extends RegularLevel {
  static CITY_TRACK_LIST: string[] = null;
  static CITY_TRACK_CHANCES: number[] = null;
  _CityLevel(): this {
    this._RegularLevel();
    this.color1 = 4941366;
    this.color2 = 15921906;
    return this;
  }
  playLevelMusic(): void {
    if (Statistics.amuletObtained) {
      Music.INSTANCE.play$String$boolean(Assets$Music.CITY_TENSE, true);
    } else {
      Music.INSTANCE.playTracks(CityLevel.CITY_TRACK_LIST, CityLevel.CITY_TRACK_CHANCES, false);
    }
  }
  standardRooms(forceMax: boolean): number {
    if (forceMax) {
      return 8;
    }
    return (6 + Random.chances$floatArr([1, 3, 1])) | 0;
  }
  specialRooms(forceMax: boolean): number {
    if (forceMax) {
      return 3;
    }
    return (2 + Random.chances$floatArr([2, 1])) | 0;
  }
  tilesTex(): string {
    return Assets$Environment.TILES_CITY;
  }
  waterTex(): string {
    return Assets$Environment.WATER_CITY;
  }
  painter(): Painter {
    return new CityPainter()._CityPainter().setWater(this.feeling === Level$Feeling.WATER ? Math.fround(0.9) : Math.fround(0.3), 4).setGrass(this.feeling === Level$Feeling.GRASS ? Math.fround(0.8) : Math.fround(0.2), 3).setTraps(this.nTraps(), this.trapClasses(), this.trapChances());
  }
  trapClasses(): JClass<any>[] {
    return [$J.cls(FrostTrap), $J.cls(StormTrap), $J.cls(CorrosionTrap), $J.cls(BlazingTrap), $J.cls(DisintegrationTrap), $J.cls(RockfallTrap), $J.cls(FlashingTrap), $J.cls(GuardianTrap), $J.cls(WeakeningTrap), $J.cls(DisarmingTrap), $J.cls(SummoningTrap), $J.cls(WarpingTrap), $J.cls(CursingTrap), $J.cls(PitfallTrap), $J.cls(DistortionTrap), $J.cls(GatewayTrap), $J.cls(GeyserTrap)];
  }
  trapChances(): number[] {
    return [4, 4, 4, 4, 4, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1];
  }
  activateTransition(hero: Hero, transition: LevelTransition): boolean {
    if (transition.type_ === LevelTransition$Type.BRANCH_EXIT) {
      if (Imp$Quest.isOld() || Imp$Quest.isCompleted() || !Imp$Quest.given() || hero.buff($J.cls(AscensionChallenge)) != null || hero.buff($J.cls(LostInventory)) != null) {
        return false;
      }
      Game.runOnRenderThread(new (CityLevel$1())().$o(this).$c(hero, transition));
      return false;
    } else {
      return super.activateTransition(hero, transition);
    }
  }
  initRooms(): ArrayList<Room> {
    return Imp$Quest.spawn(super.initRooms());
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
  static addCityVisuals(level: Level, group: Group): void {
    for (let i = 0; i < level.length(); i++) {
      if (level.map_[i] === Terrain.WALL_DECO) {
        group.add$Gizmo(new CityLevel$Smoke()._CityLevel$Smoke(i));
      }
    }
  }
  addWallVisuals(): Group {
    super.addWallVisuals();
    CityLevel.addCityWallVisuals(this, this.wallVisuals);
    return this.wallVisuals;
  }
  static addCityWallVisuals(level: Level, group: Group): void {
    for (let i = 0; i < level.length(); i++) {
      if (level.map_[i] === Terrain.REGION_DECO || level.map_[i] === Terrain.REGION_DECO_ALT) {
        group.add$Gizmo(new CityLevel$GreenFlame()._CityLevel$GreenFlame(i));
      }
    }
  }
  static $clinit() {
    CityLevel.CITY_TRACK_LIST = [Assets$Music.CITY_1, Assets$Music.CITY_2, Assets$Music.CITY_2, Assets$Music.CITY_1, Assets$Music.CITY_3, Assets$Music.CITY_3];
    CityLevel.CITY_TRACK_CHANCES = [1, 1, 0.5, 0.25, 1, 0.5];
  }
}

export class CityLevel$GreenFlame extends Emitter {
  pos: number = 0;
  static factory: Emitter$Factory = null;
  _CityLevel$GreenFlame(pos: number): this {
    this._Emitter();
    this.pos = pos;
    let p = DungeonTilemap.raisedTileCenterToWorld(pos);
    this.pos$float$float$float$float(Math.fround(p.x - 2), Math.fround(p.y - 5), 4, 4);
    this.pour(CityLevel$GreenFlame.factory, Math.fround(0.1));
    return this;
  }
  update(): void {
    if (this.visible_ = (this.pos < Dungeon.level.heroFOV.length && Dungeon.level.heroFOV[this.pos])) {
      super.update();
    }
  }
  static $clinit() {
    CityLevel$GreenFlame.factory = new (CityLevel$GreenFlame$1())()._Emitter$Factory();
  }
}

export class CityLevel$GreenFlameParticle extends ElmoParticle {
  _CityLevel$GreenFlameParticle(): this {
    this._ElmoParticle();
    this.acc.set$float$float(0, -40);
    return this;
  }
}

export class CityLevel$Smoke extends Emitter {
  pos: number = 0;
  static factory: Emitter$Factory = null;
  _CityLevel$Smoke(pos: number): this {
    this._Emitter();
    this.pos = pos;
    let p = DungeonTilemap.tileCenterToWorld(pos);
    this.pos$float$float$float$float(Math.fround(p.x - 6), Math.fround(p.y - 4), 12, 12);
    this.pour(CityLevel$Smoke.factory, Math.fround(0.2));
    return this;
  }
  update(): void {
    if (this.visible_ = (this.pos < Dungeon.level.heroFOV.length && Dungeon.level.heroFOV[this.pos])) {
      super.update();
    }
  }
  static $clinit() {
    CityLevel$Smoke.factory = new (CityLevel$Smoke$1())()._Emitter$Factory();
  }
}

export class CityLevel$SmokeParticle extends PixelParticle {
  _CityLevel$SmokeParticle(): this {
    this._PixelParticle();
    this.color$int(0);
    this.speed_.set$float$float(Random.Float$float$float(-2, 4), Math.fround(-Random.Float$float$float(3, 6)));
    return this;
  }
  reset$float$float(x: number, y: number): void {
    this.revive();
    this.x = x;
    this.y = y;
    this.left_ = this.lifespan = 2;
  }
  update(): void {
    super.update();
    let p = Math.fround(this.left_ / this.lifespan);
    this.am = p > Math.fround(0.8) ? Math.fround(1 - p) : Math.fround(p * 0.25);
    this.size$float(Math.fround(6 - Math.fround(p * 3)));
  }
}

let $CityLevel$1$1: any = null;
/** An anonymous class (CityLevel.java:157). */
function CityLevel$1$1(): any {
  return $CityLevel$1$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      if (index === 0) {
        Dungeon.hero.live();
        this.$cv_hero.HP = this.$cv_hero.HT;
        let crystal = this.$cv_hero.belongings.getItem($J.cls(EscapeCrystal));
        if (crystal == null) {
          crystal = new EscapeCrystal()._EscapeCrystal();
        } else {
          crystal.detachAll(Dungeon.hero.belongings.backpack);
        }
        if (crystal.storedItems == null) {
          crystal.storeHeroBelongings(Dungeon.hero);
        }
        crystal.collect$();
        this.$cv_hero.belongings.armor_ = new ClothArmor()._ClothArmor();
        this.$cv_hero.belongings.armor_.identify$();
        this.$cv_hero.updateHT(false);
        super.activateTransition(this.$cv_hero, this.$cv_transition);
      }
    }
    $c($hero, $transition): this {
      this.$cv_hero = $hero; this.$cv_transition = $transition;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.CityLevel$1$1', []);
}

let $CityLevel$1: any = null;
/** An anonymous class (CityLevel.java:150). */
function CityLevel$1(): any {
  return $CityLevel$1 ??= $J.local(class extends JObject {
    call(): void {
      GameScene.show(new (CityLevel$1$1())().$o(this).$c(this.$cv_hero, this.$cv_transition)._WndOptions$Image$String$String$StringArr(new ImpSprite()._ImpSprite(), Messages.titleCase(Messages.get$Class$String$ObjectArr($J.cls(Imp), 'name', [])), Messages.get$Class$String$ObjectArr($J.cls(Imp), 'enter_text', []), [Messages.get$Class$String$ObjectArr($J.cls(Imp), 'enter_yes', []), Messages.get$Class$String$ObjectArr($J.cls(Imp), 'enter_no', [])]));
    }
    $c($hero, $transition): this {
      this.$cv_hero = $hero; this.$cv_transition = $transition;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.CityLevel$1', ['com.watabou.utils.Callback']);
}

let $CityLevel$GreenFlame$1: any = null;
/** An anonymous class (CityLevel.java:269). */
function CityLevel$GreenFlame$1(): any {
  return $CityLevel$GreenFlame$1 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      let p = emitter.recycle($J.cls(CityLevel$GreenFlameParticle));
      p.reset$float$float(x, y);
    }
    lightMode(): boolean {
      return true;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.CityLevel$GreenFlame$1', []);
}

let $CityLevel$Smoke$1: any = null;
/** An anonymous class (CityLevel.java:315). */
function CityLevel$Smoke$1(): any {
  return $CityLevel$Smoke$1 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      let p = emitter.recycle($J.cls(CityLevel$SmokeParticle));
      p.reset$float$float(x, y);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.CityLevel$Smoke$1', []);
}

$J.define(CityLevel, 'com.shatteredpixel.shatteredpixeldungeon.levels.CityLevel', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.RegularLevel', ctors: { '': '_CityLevel' }, clinit: true, lazy: ['CITY_TRACK_LIST', 'CITY_TRACK_CHANCES'] });
$J.define(CityLevel$GreenFlame, 'com.shatteredpixel.shatteredpixeldungeon.levels.CityLevel$GreenFlame', { kind: 'class', sup: 'com.watabou.noosa.particles.Emitter', ctors: { 'int': '_CityLevel$GreenFlame' }, clinit: true, lazy: ['factory'] });
$J.define(CityLevel$GreenFlameParticle, 'com.shatteredpixel.shatteredpixeldungeon.levels.CityLevel$GreenFlameParticle', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.ElmoParticle', ctors: { '': '_CityLevel$GreenFlameParticle' } });
$J.define(CityLevel$Smoke, 'com.shatteredpixel.shatteredpixeldungeon.levels.CityLevel$Smoke', { kind: 'class', sup: 'com.watabou.noosa.particles.Emitter', ctors: { 'int': '_CityLevel$Smoke' }, clinit: true, lazy: ['factory'] });
$J.define(CityLevel$SmokeParticle, 'com.shatteredpixel.shatteredpixeldungeon.levels.CityLevel$SmokeParticle', { kind: 'class', sup: 'com.watabou.noosa.particles.PixelParticle', ctors: { '': '_CityLevel$SmokeParticle' }, meths: { 'reset(float,float)': 'reset$float$float' } });
$J.module(() => {
  Assets$Environment = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Environment');
  Assets$Music = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Music');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  AscensionChallenge = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AscensionChallenge');
  LostInventory = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.LostInventory');
  Imp = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Imp');
  Imp$Quest = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Imp$Quest');
  ClothArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.ClothArmor');
  EscapeCrystal = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.EscapeCrystal');
  Level$Feeling = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level$Feeling');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  LevelTransition$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.LevelTransition$Type');
  CityPainter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.CityPainter');
  BlazingTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.BlazingTrap');
  CorrosionTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.CorrosionTrap');
  CursingTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.CursingTrap');
  DisarmingTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.DisarmingTrap');
  DisintegrationTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.DisintegrationTrap');
  DistortionTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.DistortionTrap');
  FlashingTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.FlashingTrap');
  FrostTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.FrostTrap');
  GatewayTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.GatewayTrap');
  GeyserTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.GeyserTrap');
  GuardianTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.GuardianTrap');
  PitfallTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.PitfallTrap');
  RockfallTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.RockfallTrap');
  StormTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.StormTrap');
  SummoningTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.SummoningTrap');
  WarpingTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.WarpingTrap');
  WeakeningTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.WeakeningTrap');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ImpSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ImpSprite');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  Game = $J.load('com.watabou.noosa.Game');
  Music = $J.load('com.watabou.noosa.audio.Music');
  Emitter$Factory = $J.load('com.watabou.noosa.particles.Emitter$Factory');
  Random = $J.load('com.watabou.utils.Random');
});
