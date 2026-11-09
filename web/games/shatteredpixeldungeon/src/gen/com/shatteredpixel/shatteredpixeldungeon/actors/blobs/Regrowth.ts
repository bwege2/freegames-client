// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/blobs/Regrowth.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../jre/index.ts';
import { Blob } from './Blob.ts';

let Dungeon, Actor, Buff, Roots, LeafParticle, Level, Terrain, GameScene;

export class Regrowth extends Blob {
  _Regrowth(): this {
    this._Blob();
    return this;
  }
  evolve(): void {
    super.evolve();
    if (this.volume_ > 0) {
      let cell: number;
      for (let i = this.area.left_; i < this.area.right_; i++) {
        for (let j = this.area.top_; j < this.area.bottom_; j++) {
          cell = (i + Math.imul(j, Dungeon.level.width())) | 0;
          if (this.off[cell] > 0) {
            let c = Dungeon.level.map_[cell];
            let c1 = c;
            if (c === Terrain.EMPTY || c === Terrain.EMBERS || c === Terrain.EMPTY_DECO) {
              c1 = (this.cur[cell] > 9 && Actor.findChar(cell) == null) ? Terrain.HIGH_GRASS : Terrain.GRASS;
            } else if ((c === Terrain.GRASS || c === Terrain.FURROWED_GRASS) && this.cur[cell] > 9 && Dungeon.level.plants.get(cell) == null && Actor.findChar(cell) == null) {
              c1 = Terrain.HIGH_GRASS;
            }
            if (c1 !== c) {
              Level.set$int$int(cell, c1);
              GameScene.updateMap$int(cell);
            }
            let ch = Actor.findChar(cell);
            if (ch != null && !ch.isImmune(this.getClass()) && this.off[cell] > 1) {
              Buff.prolong(ch, $J.cls(Roots), Actor.TICK);
            }
          }
        }
      }
      Dungeon.observe$();
    }
  }
  use(emitter: BlobEmitter): void {
    super.use(emitter);
    emitter.start(LeafParticle.LEVEL_SPECIFIC, Math.fround(0.2), 0);
  }
}

$J.define(Regrowth, 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Regrowth', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob', ctors: { '': '_Regrowth' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Roots = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Roots');
  LeafParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.LeafParticle');
  Level = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
});
