// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/PrisonLevel.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Environment, Assets$Music, Dungeon, Statistics, Wandmaker$Quest, FlameParticle, WindParticle$Wind, Level$Feeling, Terrain, PrisonPainter, AlarmTrap, BurningTrap, ChillingTrap, ConfusionTrap, FlockTrap, GatewayTrap, GeyserTrap, GrippingTrap, OozeTrap, PoisonDartTrap, ShockingTrap, SummoningTrap, TeleportationTrap, ToxicTrap, Messages, DungeonTilemap, Game, Halo, Music, Random;

export class PrisonLevel extends RegularLevel {
  static PRISON_TRACK_LIST: string[] = null;
  static PRISON_TRACK_CHANCES: number[] = null;
  wandmakerQuestWasActive: boolean = null;
  _PrisonLevel(): this {
    this._RegularLevel();
    this.color1 = 6976061;
    this.color2 = 8950348;
    this.wandmakerQuestWasActive = null;
    return this;
  }
  playLevelMusic(): void {
    if (Wandmaker$Quest.active() || Statistics.amuletObtained) {
      Music.INSTANCE.play$String$boolean(Assets$Music.PRISON_TENSE, true);
    } else {
      Music.INSTANCE.playTracks(PrisonLevel.PRISON_TRACK_LIST, PrisonLevel.PRISON_TRACK_CHANCES, false);
    }
    this.wandmakerQuestWasActive = Wandmaker$Quest.active();
  }
  initRooms(): ArrayList<Room> {
    return Wandmaker$Quest.spawnRoom(super.initRooms());
  }
  createMobs(): void {
    Wandmaker$Quest.spawnWandmaker(this, this.roomEntrance);
    super.createMobs();
  }
  standardRooms(forceMax: boolean): number {
    if (forceMax) {
      return 6;
    }
    return (5 + Random.chances$floatArr([1, 1])) | 0;
  }
  specialRooms(forceMax: boolean): number {
    if (forceMax) {
      return 3;
    }
    return (1 + Random.chances$floatArr([1, 3, 1])) | 0;
  }
  painter(): Painter {
    return new PrisonPainter()._PrisonPainter().setWater(this.feeling === Level$Feeling.WATER ? Math.fround(0.9) : Math.fround(0.3), 4).setGrass(this.feeling === Level$Feeling.GRASS ? Math.fround(0.8) : Math.fround(0.2), 3).setTraps(this.nTraps(), this.trapClasses(), this.trapChances());
  }
  tilesTex(): string {
    return Assets$Environment.TILES_PRISON;
  }
  waterTex(): string {
    return Assets$Environment.WATER_PRISON;
  }
  trapClasses(): JClass<any>[] {
    return [$J.cls(ChillingTrap), $J.cls(ShockingTrap), $J.cls(ToxicTrap), $J.cls(BurningTrap), $J.cls(PoisonDartTrap), $J.cls(AlarmTrap), $J.cls(OozeTrap), $J.cls(GrippingTrap), $J.cls(ConfusionTrap), $J.cls(FlockTrap), $J.cls(SummoningTrap), $J.cls(TeleportationTrap), $J.cls(GatewayTrap), $J.cls(GeyserTrap)];
  }
  trapChances(): number[] {
    return [4, 4, 4, 4, 4, 2, 2, 2, 1, 1, 1, 1, 1, 1];
  }
  occupyCell(ch: Char): void {
    super.occupyCell(ch);
    if (ch === Dungeon.hero) {
      this.updateWandmakerQuestMusic();
    }
  }
  updateWandmakerQuestMusic(): void {
    if (this.wandmakerQuestWasActive == null) {
      this.wandmakerQuestWasActive = Wandmaker$Quest.active();
      return;
    }
    if (Wandmaker$Quest.active() !== this.wandmakerQuestWasActive) {
      this.wandmakerQuestWasActive = Wandmaker$Quest.active();
      Game.runOnRenderThread(new (PrisonLevel$1())().$o(this));
    }
  }
  tileName(tile: number): string {
    switch (tile) {
      case Terrain.WATER:
        return Messages.get$Class$String$ObjectArr($J.cls(PrisonLevel), 'water_name', []);
      case Terrain.REGION_DECO:
        return Messages.get$Class$String$ObjectArr($J.cls(PrisonLevel), 'region_deco_name', []);
      case Terrain.REGION_DECO_ALT:
        return Messages.get$Class$String$ObjectArr($J.cls(PrisonLevel), 'region_deco_alt_name', []);
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
        return Messages.get$Class$String$ObjectArr($J.cls(PrisonLevel), 'region_deco_desc', []);
      case Terrain.REGION_DECO_ALT:
        return Messages.get$Class$String$ObjectArr($J.cls(PrisonLevel), 'region_deco_alt_desc', []);
      default:
        return super.tileDesc(tile);
    }
  }
  addVisuals(): Group {
    super.addVisuals();
    PrisonLevel.addPrisonVisuals(this, this.visuals);
    return this.visuals;
  }
  static addPrisonVisuals(level: Level, group: Group): void {
    for (let i = 0; i < level.length(); i++) {
      if (level.map_[i] === Terrain.WALL_DECO) {
        group.add$Gizmo(new PrisonLevel$Torch()._PrisonLevel$Torch(i));
      }
      if (level.map_[i] === Terrain.REGION_DECO_ALT) {
        group.add$Gizmo(new WindParticle$Wind()._WindParticle$Wind(i));
      }
    }
  }
  static $clinit() {
    PrisonLevel.PRISON_TRACK_LIST = [Assets$Music.PRISON_1, Assets$Music.PRISON_2, Assets$Music.PRISON_2, Assets$Music.PRISON_1, Assets$Music.PRISON_3, Assets$Music.PRISON_3];
    PrisonLevel.PRISON_TRACK_CHANCES = [1, 1, 0.5, 0.25, 1, 0.5];
  }
}

export class PrisonLevel$Torch extends Emitter {
  pos: number = 0;
  _PrisonLevel$Torch(pos: number): this {
    this._Emitter();
    this.pos = pos;
    let p = DungeonTilemap.tileCenterToWorld(pos);
    this.pos$float$float$float$float(Math.fround(p.x - 1), Math.fround(p.y + 2), 2, 0);
    this.pour(FlameParticle.FACTORY, Math.fround(0.15));
    this.add$Gizmo(new Halo()._Halo$float$int$float(12, 16777164, Math.fround(0.4)).point$float$float(p.x, Math.fround(p.y + 1)));
    return this;
  }
  update(): void {
    if (this.visible_ = (this.pos < Dungeon.level.heroFOV.length && Dungeon.level.heroFOV[this.pos])) {
      super.update();
    }
  }
}

let $PrisonLevel$1$1: any = null;
/** An anonymous class (PrisonLevel.java:163). */
function PrisonLevel$1$1(): any {
  return $PrisonLevel$1$1 ??= $J.local(class extends JObject {
    call(): void {
      if (Dungeon.level != null) {
        Dungeon.level.playLevelMusic();
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.PrisonLevel$1$1', ['com.watabou.utils.Callback']);
}

let $PrisonLevel$1: any = null;
/** An anonymous class (PrisonLevel.java:160). */
function PrisonLevel$1(): any {
  return $PrisonLevel$1 ??= $J.local(class extends JObject {
    call(): void {
      Music.INSTANCE.fadeOut(1, new (PrisonLevel$1$1())().$o(this));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.PrisonLevel$1', ['com.watabou.utils.Callback']);
}

$J.define(PrisonLevel, 'com.shatteredpixel.shatteredpixeldungeon.levels.PrisonLevel', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.RegularLevel', ctors: { '': '_PrisonLevel' }, clinit: true, lazy: ['PRISON_TRACK_LIST', 'PRISON_TRACK_CHANCES'] });
$J.define(PrisonLevel$Torch, 'com.shatteredpixel.shatteredpixeldungeon.levels.PrisonLevel$Torch', { kind: 'class', sup: 'com.watabou.noosa.particles.Emitter', ctors: { 'int': '_PrisonLevel$Torch' } });
$J.module(() => {
  Assets$Environment = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Environment');
  Assets$Music = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Music');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Wandmaker$Quest = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Wandmaker$Quest');
  FlameParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.FlameParticle');
  WindParticle$Wind = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.WindParticle$Wind');
  Level$Feeling = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level$Feeling');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  PrisonPainter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.PrisonPainter');
  AlarmTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.AlarmTrap');
  BurningTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.BurningTrap');
  ChillingTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.ChillingTrap');
  ConfusionTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.ConfusionTrap');
  FlockTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.FlockTrap');
  GatewayTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.GatewayTrap');
  GeyserTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.GeyserTrap');
  GrippingTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.GrippingTrap');
  OozeTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.OozeTrap');
  PoisonDartTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.PoisonDartTrap');
  ShockingTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.ShockingTrap');
  SummoningTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.SummoningTrap');
  TeleportationTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.TeleportationTrap');
  ToxicTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.ToxicTrap');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  Game = $J.load('com.watabou.noosa.Game');
  Halo = $J.load('com.watabou.noosa.Halo');
  Music = $J.load('com.watabou.noosa.audio.Music');
  Random = $J.load('com.watabou.utils.Random');
});
