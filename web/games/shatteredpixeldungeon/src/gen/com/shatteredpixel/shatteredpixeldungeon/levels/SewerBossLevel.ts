// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/SewerBossLevel.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { SewerLevel } from './SewerLevel.ts';

let Assets$Music, Bones, Statistics, Actor, Char, Char$Property, Goo, Heap$Type, Level, PrisonLevel$Torch, Terrain, FigureEightBuilder, SewerPainter, RatKingRoom, GooBossRoom, SewerBossEntranceRoom, SewerBossExitRoom, StandardRoom, GameScene, Game, Music, Random;

export class SewerBossLevel extends SewerLevel {
  _SewerBossLevel(): this {
    this._SewerLevel();
    this.color1 = 4748860;
    this.color2 = 5871946;
    return this;
  }
  playLevelMusic(): void {
    if (this.locked) {
      Music.INSTANCE.play$String$boolean(Assets$Music.SEWERS_BOSS, true);
      return;
    }
    let gooAlive = false;
    for (const $it0 = this.mobs.iterator(); $it0.hasNext(); ) {
      let m = $it0.next();
      if (m instanceof Goo) {
        gooAlive = true;
        break;
      }
    }
    if (gooAlive) {
      Music.INSTANCE.end();
    } else {
      Music.INSTANCE.playTracks(SewerLevel.SEWER_TRACK_LIST, SewerLevel.SEWER_TRACK_CHANCES, false);
    }
  }
  initRooms(): ArrayList<Room> {
    let initRooms = new ArrayList();
    initRooms.add(this.roomEntrance = new SewerBossEntranceRoom()._SewerBossEntranceRoom());
    initRooms.add(this.roomExit = new SewerBossExitRoom()._SewerBossExitRoom());
    let standards = this.standardRooms(true);
    for (let i = 0; i < standards; i++) {
      let s = StandardRoom.createRoom();
      s.setSizeCat$int$int(0, 0);
      initRooms.add(s);
    }
    let gooRoom = GooBossRoom.randomGooRoom();
    initRooms.add(gooRoom);
    (this.builder_).setLandmarkRoom(gooRoom);
    initRooms.add(new RatKingRoom()._RatKingRoom());
    return initRooms;
  }
  standardRooms(forceMax: boolean): number {
    if (forceMax) {
      return 3;
    }
    return (2 + Random.chances$floatArr([1, 1])) | 0;
  }
  builder(): Builder {
    return new FigureEightBuilder()._FigureEightBuilder().setLoopShape(2, Random.Float$float$float(Math.fround(0.3), Math.fround(0.8)), 0).setPathLength(1, [1]).setTunnelLength([1, 2], [1]);
  }
  painter(): Painter {
    return new SewerPainter()._SewerPainter().setWater(0.5, 5).setGrass(Math.fround(0.2), 4).setTraps(this.nTraps(), this.trapClasses(), this.trapChances());
  }
  nTraps(): number {
    return 0;
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
        pos = this.pointToCell(this.roomEntrance.random$());
      } while (pos === this.entrance() || this.solid[pos]);
      for (const $it1 = bonesItems.iterator(); $it1.hasNext(); ) {
        let i = $it1.next();
        this.drop(i, pos).setHauntedIfCursed().type_ = Heap$Type.REMAINS;
      }
    }
    Random.popGenerator();
  }
  randomRespawnCell(ch: Char): number {
    let candidates = new ArrayList();
    for (const $it2 = this.roomEntrance.getPoints().iterator(); $it2.hasNext(); ) {
      let p = $it2.next();
      let cell = this.pointToCell(p);
      if (this.passable[cell] && this.roomEntrance.inside$Point(p) && Actor.findChar(cell) == null && (!Char.hasProp(ch, Char$Property.LARGE) || this.openSpace[cell])) {
        candidates.add(cell);
      }
    }
    if (candidates.isEmpty()) {
      return -1;
    } else {
      return Random.element$Collection(candidates);
    }
  }
  seal(): void {
    if (!this.locked) {
      super.seal();
      Statistics.qualifiedForBossChallengeBadge = true;
      Level.set$int$int(this.entrance(), Terrain.WATER);
      GameScene.updateMap$int(this.entrance());
      GameScene.ripple(this.entrance());
      Game.runOnRenderThread(new (SewerBossLevel$1())().$o(this));
    }
  }
  unseal(): void {
    if (this.locked) {
      super.unseal();
      Level.set$int$int(this.entrance(), Terrain.ENTRANCE);
      GameScene.updateMap$int(this.entrance());
      Game.runOnRenderThread(new (SewerBossLevel$2())().$o(this));
    }
  }
  addVisuals(): Group {
    super.addVisuals();
    if ((this.map_[(this.exit() - 1) | 0]) !== Terrain.WALL_DECO) {
      this.visuals.add$Gizmo(new PrisonLevel$Torch()._PrisonLevel$Torch((this.exit() - 1) | 0));
    }
    if ((this.map_[(this.exit() + 1) | 0]) !== Terrain.WALL_DECO) {
      this.visuals.add$Gizmo(new PrisonLevel$Torch()._PrisonLevel$Torch((this.exit() + 1) | 0));
    }
    return this.visuals;
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.roomExit = this.roomEntrance;
  }
}

let $SewerBossLevel$1: any = null;
/** An anonymous class (SewerBossLevel.java:188). */
function SewerBossLevel$1(): any {
  return $SewerBossLevel$1 ??= $J.local(class extends JObject {
    call(): void {
      Music.INSTANCE.play$String$boolean(Assets$Music.SEWERS_BOSS, true);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.SewerBossLevel$1', ['com.watabou.utils.Callback']);
}

let $SewerBossLevel$2$1: any = null;
/** An anonymous class (SewerBossLevel.java:208). */
function SewerBossLevel$2$1(): any {
  return $SewerBossLevel$2$1 ??= $J.local(class extends JObject {
    call(): void {
      Music.INSTANCE.end();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.SewerBossLevel$2$1', ['com.watabou.utils.Callback']);
}

let $SewerBossLevel$2: any = null;
/** An anonymous class (SewerBossLevel.java:205). */
function SewerBossLevel$2(): any {
  return $SewerBossLevel$2 ??= $J.local(class extends JObject {
    call(): void {
      Music.INSTANCE.fadeOut(5, new (SewerBossLevel$2$1())().$o(this));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.SewerBossLevel$2', ['com.watabou.utils.Callback']);
}

$J.define(SewerBossLevel, 'com.shatteredpixel.shatteredpixeldungeon.levels.SewerBossLevel', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.SewerLevel', ctors: { '': '_SewerBossLevel' } });
$J.module(() => {
  Assets$Music = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Music');
  Bones = $J.load('com.shatteredpixel.shatteredpixeldungeon.Bones');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Goo = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Goo');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  Level = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level');
  PrisonLevel$Torch = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.PrisonLevel$Torch');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  FigureEightBuilder = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.builders.FigureEightBuilder');
  SewerPainter = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.painters.SewerPainter');
  RatKingRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.secret.RatKingRoom');
  GooBossRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.sewerboss.GooBossRoom');
  SewerBossEntranceRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.sewerboss.SewerBossEntranceRoom');
  SewerBossExitRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.sewerboss.SewerBossExitRoom');
  StandardRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.standard.StandardRoom');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  Game = $J.load('com.watabou.noosa.Game');
  Music = $J.load('com.watabou.noosa.audio.Music');
  Random = $J.load('com.watabou.utils.Random');
});
