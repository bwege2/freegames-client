// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/blobs/Freezing.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Actor, Fire, Buff, Chill, Frost, CellEmitter, SnowParticle, MagicalFireRoom$EternalFire, Messages;

export class Freezing extends Blob {
  _Freezing(): this {
    this._Blob();
    return this;
  }
  evolve(): void {
    let cell: number;
    let fire = Dungeon.level.blobs.get($J.cls(Fire));
    for (let i = (this.area.left_ - 1) | 0; i <= this.area.right_; i++) {
      for (let j = (this.area.top_ - 1) | 0; j <= this.area.bottom_; j++) {
        cell = (i + Math.imul(j, Dungeon.level.width())) | 0;
        if (this.cur[cell] > 0) {
          if (fire != null && fire.volume_ > 0 && fire.cur[cell] > 0) {
            fire.clear(cell);
            this.off[cell] = this.cur[cell] = 0;
            continue;
          }
          Freezing.freeze(cell);
          this.off[cell] = (this.cur[cell] - 1) | 0;
          this.volume_ = (this.volume_ + this.off[cell]) | 0;
        } else {
          this.off[cell] = 0;
        }
      }
    }
  }
  static freeze(cell: number): void {
    let ch = Actor.findChar(cell);
    if (ch != null && !ch.isImmune($J.cls(Freezing))) {
      if (ch.buff($J.cls(Frost)) != null) {
        Buff.affect$Char$Class$float(ch, $J.cls(Frost), 2);
      } else {
        let chill = ch.buff($J.cls(Chill));
        let turnsToAdd = Dungeon.level.water[cell] ? 5 : 3;
        if (chill != null) {
          let chillToCap = Math.fround(Chill.DURATION - chill.cooldown());
          chillToCap = Math.fround(chillToCap / ch.resist($J.cls(Chill)));
          turnsToAdd = Math.min(turnsToAdd, chillToCap);
        }
        if (turnsToAdd > 0) {
          Buff.affect$Char$Class$float(ch, $J.cls(Chill), turnsToAdd);
        }
        if (chill != null && chill.cooldown() >= Chill.DURATION && !ch.isImmune($J.cls(Frost))) {
          Buff.affect$Char$Class$float(ch, $J.cls(Frost), Frost.DURATION);
        }
      }
    }
    let heap = Dungeon.level.heaps.get(cell);
    if (heap != null) {
      heap.freeze();
    }
  }
  use(emitter: BlobEmitter): void {
    super.use(emitter);
    emitter.start(SnowParticle.FACTORY, Math.fround(0.05), 0);
  }
  tileDesc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', []);
  }
  static affect(cell: number): boolean {
    let ch = Actor.findChar(cell);
    if (ch != null) {
      if (Dungeon.level.water[ch.pos]) {
        Buff.prolong(ch, $J.cls(Frost), Math.fround(Frost.DURATION * 3));
      } else {
        Buff.prolong(ch, $J.cls(Frost), Frost.DURATION);
      }
    }
    let fire = Dungeon.level.blobs.get($J.cls(Fire));
    if (fire != null && fire.volume_ > 0) {
      fire.clear(cell);
    }
    let eternalFire = Dungeon.level.blobs.get($J.cls(MagicalFireRoom$EternalFire));
    if (eternalFire != null && eternalFire.volume_ > 0) {
      eternalFire.clear(cell);
    }
    let heap = Dungeon.level.heaps.get(cell);
    if (heap != null) {
      heap.freeze();
    }
    if (Dungeon.level.heroFOV[cell]) {
      CellEmitter.get(cell).start(SnowParticle.FACTORY, Math.fround(0.2), 6);
      return true;
    } else {
      return false;
    }
  }
}

$J.define(Freezing, 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Freezing', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob', ctors: { '': '_Freezing' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Fire = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Fire');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Chill = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Chill');
  Frost = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Frost');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  SnowParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.SnowParticle');
  MagicalFireRoom$EternalFire = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.MagicalFireRoom$EternalFire');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
});
