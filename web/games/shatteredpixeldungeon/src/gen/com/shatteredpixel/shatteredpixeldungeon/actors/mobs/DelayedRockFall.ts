// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/DelayedRockFall.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../jre/index.ts';
import { FlavourBuff } from '../buffs/FlavourBuff.ts';

let Assets$Sounds, Actor, CellEmitter, Speck, EarthParticle, PixelScene, DungeonTilemap, Sample;

export class DelayedRockFall extends FlavourBuff {
  rockPositions: number[] = null;
  rockEmitters: ArrayList<Emitter> = null;
  static readonly POSITIONS: string = 'positions';
  _DelayedRockFall(): this {
    this._FlavourBuff();
    this.rockEmitters = new ArrayList();
    return this;
  }
  setRockPositions(rockPositions: List<number>): void {
    this.rockPositions = $J.newArray(rockPositions.size(), 0);
    for (let i = 0; i < rockPositions.size(); i++) {
      this.rockPositions[i] = rockPositions.get(i);
    }
    this.fx(true);
  }
  act(): boolean {
    for (let i of this.rockPositions) {
      CellEmitter.get(i).start(Speck.factory$int(Speck.ROCK), Math.fround(0.07), 10);
      let ch = Actor.findChar(i);
      if (ch != null) {
        this.affectChar(ch);
      } else {
        this.affectCell(i);
      }
    }
    PixelScene.shake(3, Math.fround(0.7));
    Sample.INSTANCE.play$Object(Assets$Sounds.ROCKS);
    this.detach();
    return super.act();
  }
  affectChar(ch: Char): void {
  }
  affectCell(cell: number): void {
  }
  fx(on: boolean): void {
    if (on && this.rockPositions != null) {
      for (let i of this.rockPositions) {
        let e = CellEmitter.get(i);
        e.y = Math.fround(e.y - Math.fround(DungeonTilemap.SIZE * Math.fround(0.2)));
        e.height_ = Math.fround(e.height_ * Math.fround(0.4));
        e.pour(EarthParticle.FALLING, Math.fround(0.1));
        this.rockEmitters.add(e);
      }
    } else {
      for (const $it0 = this.rockEmitters.iterator(); $it0.hasNext(); ) {
        let e = $it0.next();
        e.on = false;
      }
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$intArr(DelayedRockFall.POSITIONS, this.rockPositions);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.rockPositions = bundle.getIntArray(DelayedRockFall.POSITIONS);
  }
}

$J.define(DelayedRockFall, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DelayedRockFall', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_DelayedRockFall' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  EarthParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.EarthParticle');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
