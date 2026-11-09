// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/blobs/Foliage.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Fire, Buff, Shadows, ShaftParticle, Notes$Landmark, Level, Terrain, Messages, GameScene, PathFinder;

export class Foliage extends Blob {
  _Foliage(): this {
    this._Blob();
    return this;
  }
  landmark(): Notes$Landmark {
    return Notes$Landmark.GARDEN;
  }
  evolve(): void {
    let map = Dungeon.level.map_;
    let seen = false;
    let fire = Dungeon.level.blobs.get($J.cls(Fire));
    let cell: number;
    for (let i = this.area.left_; i < this.area.right_; i++) {
      for (let j = this.area.top_; j < this.area.bottom_; j++) {
        cell = (i + Math.imul(j, Dungeon.level.width())) | 0;
        if (this.cur[cell] > 0) {
          this.off[cell] = this.cur[cell];
          this.volume_ = (this.volume_ + this.off[cell]) | 0;
          if (map[cell] === Terrain.EMBERS) {
            let valid = true;
            if (fire != null && fire.volume_ > 0) {
              for (let k of PathFinder.NEIGHBOURS9) {
                if ((fire.cur[(cell + k) | 0]) > 0) {
                  valid = false;
                }
              }
            }
            if (valid) {
              Level.set$int$int(cell, Terrain.GRASS);
              GameScene.updateMap$int(cell);
            }
          }
          seen = seen || Dungeon.level.visited[cell];
        } else {
          this.off[cell] = 0;
        }
      }
    }
    let hero = Dungeon.hero;
    if (hero.isAlive() && this.cur[hero.pos] > 0) {
      let s = Buff.affect$Char$Class(hero, $J.cls(Shadows));
      if (s != null) {
        s.prolong();
      }
    }
  }
  use(emitter: BlobEmitter): void {
    super.use(emitter);
    emitter.start(ShaftParticle.FACTORY, Math.fround(0.9), 0);
  }
  tileDesc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', []);
  }
}

$J.define(Foliage, 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Foliage', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob', ctors: { '': '_Foliage' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Fire = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Fire');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Shadows = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Shadows');
  ShaftParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShaftParticle');
  Notes$Landmark = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes$Landmark');
  Level = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
