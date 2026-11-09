// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/HallsLevel.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../jre/index.ts';
import { RegularLevel } from './RegularLevel.ts';
import { Group } from '../../../watabou/noosa/Group.ts';
import { PixelParticle$Shrinking } from '../../../watabou/noosa/particles/PixelParticle.ts';

let Assets$Environment, Assets$Music, Dungeon, Statistics, Torch, Level$Feeling, Terrain, HallsPainter, DemonSpawnerRoom, BlazingTrap, CorrosionTrap, CursingTrap, DisarmingTrap, DisintegrationTrap, DistortionTrap, FlashingTrap, FrostTrap, GatewayTrap, GeyserTrap, GrimTrap, GuardianTrap, PitfallTrap, RockfallTrap, StormTrap, SummoningTrap, WarpingTrap, WeakeningTrap, Messages, DungeonTilemap, Blending, Game, Music, Random;

export class HallsLevel extends RegularLevel {
  static HALLS_TRACK_LIST: string[] = null;
  static HALLS_TRACK_CHANCES: number[] = null;
  _HallsLevel(): this {
    this._RegularLevel();
    this.viewDistance = Math.min((26 - Dungeon.depth) | 0, this.viewDistance);
    this.color1 = 8393984;
    this.color2 = 10913057;
    return this;
  }
  playLevelMusic(): void {
    if (Statistics.amuletObtained) {
      Music.INSTANCE.play$String$boolean(Assets$Music.HALLS_TENSE, true);
    } else {
      Music.INSTANCE.playTracks(HallsLevel.HALLS_TRACK_LIST, HallsLevel.HALLS_TRACK_CHANCES, false);
    }
  }
  initRooms(): ArrayList<Room> {
    let rooms = super.initRooms();
    rooms.add(new DemonSpawnerRoom()._DemonSpawnerRoom());
    return rooms;
  }
  standardRooms(forceMax: boolean): number {
    if (forceMax) {
      return 9;
    }
    return (8 + Random.chances$floatArr([2, 1])) | 0;
  }
  specialRooms(forceMax: boolean): number {
    if (forceMax) {
      return 3;
    }
    return (2 + Random.chances$floatArr([1, 1])) | 0;
  }
  painter(): Painter {
    return new HallsPainter()._HallsPainter().setWater(this.feeling === Level$Feeling.WATER ? Math.fround(0.7) : Math.fround(0.15), 6).setGrass(this.feeling === Level$Feeling.GRASS ? Math.fround(0.65) : Math.fround(0.1), 3).setTraps(this.nTraps(), this.trapClasses(), this.trapChances());
  }
  create(): void {
    this.addItemToSpawn(new Torch()._Torch());
    this.addItemToSpawn(new Torch()._Torch());
    super.create();
  }
  tilesTex(): string {
    return Assets$Environment.TILES_HALLS;
  }
  waterTex(): string {
    return Assets$Environment.WATER_HALLS;
  }
  trapClasses(): JClass<any>[] {
    return [$J.cls(FrostTrap), $J.cls(StormTrap), $J.cls(CorrosionTrap), $J.cls(BlazingTrap), $J.cls(DisintegrationTrap), $J.cls(RockfallTrap), $J.cls(FlashingTrap), $J.cls(GuardianTrap), $J.cls(WeakeningTrap), $J.cls(DisarmingTrap), $J.cls(SummoningTrap), $J.cls(WarpingTrap), $J.cls(CursingTrap), $J.cls(GrimTrap), $J.cls(PitfallTrap), $J.cls(DistortionTrap), $J.cls(GatewayTrap), $J.cls(GeyserTrap)];
  }
  trapChances(): number[] {
    return [4, 4, 4, 4, 4, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1];
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
  static addHallsVisuals(level: Level, group: Group): void {
    for (let i = 0; i < level.length(); i++) {
      if (level.map_[i] === Terrain.WATER) {
        group.add$Gizmo(new HallsLevel$Stream()._HallsLevel$Stream(i));
      }
    }
  }
  static $clinit() {
    HallsLevel.HALLS_TRACK_LIST = [Assets$Music.HALLS_1, Assets$Music.HALLS_2, Assets$Music.HALLS_2, Assets$Music.HALLS_1, Assets$Music.HALLS_3, Assets$Music.HALLS_3];
    HallsLevel.HALLS_TRACK_CHANCES = [1, 1, 0.5, 0.25, 1, 0.5];
  }
}

export class HallsLevel$Stream extends Group {
  pos: number = 0;
  delay_: number = 0;
  _HallsLevel$Stream(pos: number): this {
    this._Group();
    this.pos = pos;
    this.delay_ = Random.Float$float(2);
    return this;
  }
  update(): void {
    if (!Dungeon.level.water[this.pos]) {
      this.killAndErase();
      return;
    }
    if (this.visible_ = (this.pos < Dungeon.level.heroFOV.length && Dungeon.level.heroFOV[this.pos])) {
      super.update();
      if ((this.delay_ = Math.fround(this.delay_ - Game.elapsed)) <= Math.fround(0)) {
        this.delay_ = Random.Float$float(2);
        let p = DungeonTilemap.tileToWorld(this.pos);
        (this.recycle($J.cls(HallsLevel$FireParticle))).reset$float$float(Math.fround(p.x + Random.Float$float(Math.fround(DungeonTilemap.SIZE))), Math.fround(p.y + Random.Float$float(Math.fround(DungeonTilemap.SIZE))));
      }
    }
  }
  draw(): void {
    Blending.setLightMode();
    super.draw();
    Blending.setNormalMode();
  }
}

export class HallsLevel$FireParticle extends PixelParticle$Shrinking {
  _HallsLevel$FireParticle(): this {
    this._PixelParticle$Shrinking();
    this.color$int(15628066);
    this.lifespan = 1;
    this.acc.set$float$float(0, Math.fround(+80));
    return this;
  }
  reset$float$float(x: number, y: number): void {
    this.revive();
    this.x = x;
    this.y = y;
    this.left_ = this.lifespan;
    this.speed_.set$float$float(0, -40);
    this.size_ = 4;
  }
  update(): void {
    super.update();
    let p = Math.fround(this.left_ / this.lifespan);
    this.am = p > Math.fround(0.8) ? Math.fround((Math.fround(1 - p)) * 5) : 1;
  }
}

$J.define(HallsLevel, 'com.shatteredpixel.shatteredpixeldungeon.levels.HallsLevel', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.RegularLevel', ctors: { '': '_HallsLevel' }, clinit: true, lazy: ['HALLS_TRACK_LIST', 'HALLS_TRACK_CHANCES'] });
$J.define(HallsLevel$Stream, 'com.shatteredpixel.shatteredpixeldungeon.levels.HallsLevel$Stream', { kind: 'class', sup: 'com.watabou.noosa.Group', ctors: { 'int': '_HallsLevel$Stream' } });
$J.define(HallsLevel$FireParticle, 'com.shatteredpixel.shatteredpixeldungeon.levels.HallsLevel$FireParticle', { kind: 'class', sup: 'com.watabou.noosa.particles.PixelParticle$Shrinking', ctors: { '': '_HallsLevel$FireParticle' }, meths: { 'reset(float,float)': 'reset$float$float' } });
$J.module(() => {
  Assets$Environment = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Environment');
  Assets$Music = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Music');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Torch = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Torch');
  Level$Feeling = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level$Feeling');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  HallsPainter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.HallsPainter');
  DemonSpawnerRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.DemonSpawnerRoom');
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
  GrimTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.GrimTrap');
  GuardianTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.GuardianTrap');
  PitfallTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.PitfallTrap');
  RockfallTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.RockfallTrap');
  StormTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.StormTrap');
  SummoningTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.SummoningTrap');
  WarpingTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.WarpingTrap');
  WeakeningTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.WeakeningTrap');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  Blending = $J.load('com.watabou.glwrap.Blending');
  Game = $J.load('com.watabou.noosa.Game');
  Music = $J.load('com.watabou.noosa.audio.Music');
  Random = $J.load('com.watabou.utils.Random');
});
