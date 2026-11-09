// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/features/Door.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../../jre/index.ts';

let Assets$Sounds, Dungeon, Actor, Level, Terrain, GameScene, Sample;

export class Door extends JObject {
  _Door(): this {
    return this;
  }
  static enter(pos: number): void {
    Level.set$int$int(pos, Terrain.OPEN_DOOR);
    GameScene.updateMap$int(pos);
    if (Dungeon.level.heroFOV[pos]) {
      Dungeon.observe$();
      Sample.INSTANCE.play$Object(Assets$Sounds.OPEN);
    }
  }
  static leave(pos: number): void {
    let chars = 0;
    for (const $it0 = Actor.chars().iterator(); $it0.hasNext(); ) {
      let ch = $it0.next();
      if (ch.pos === pos) {
        chars++;
      }
    }
    if (Dungeon.level.heaps.get(pos) == null && chars <= 1) {
      Level.set$int$int(pos, Terrain.DOOR);
      GameScene.updateMap$int(pos);
      if (Dungeon.level.heroFOV[pos]) {
        Dungeon.observe$();
      }
    }
  }
}

$J.define(Door, 'com.shatteredpixel.shatteredpixeldungeon.levels.features.Door', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Door' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Level = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
