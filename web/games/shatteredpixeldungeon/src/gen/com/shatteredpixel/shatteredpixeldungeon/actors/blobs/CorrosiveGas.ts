// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/blobs/CorrosiveGas.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Actor, Buff, Corrosion, Speck, Messages;

export class CorrosiveGas extends Blob {
  strength: number = 0;
  source_: JClass = null;
  static readonly STRENGTH: string = 'strength';
  static readonly SOURCE: string = 'source';
  _CorrosiveGas(): this {
    this._Blob();
    this.strength = 0;
    return this;
  }
  evolve(): void {
    super.evolve();
    if (this.volume_ === 0) {
      this.strength = 0;
      this.source_ = null;
    } else {
      let ch: Char;
      let cell: number;
      for (let i = this.area.left_; i < this.area.right_; i++) {
        for (let j = this.area.top_; j < this.area.bottom_; j++) {
          cell = (i + Math.imul(j, Dungeon.level.width())) | 0;
          if (this.cur[cell] > 0 && (ch = Actor.findChar(cell)) != null) {
            if (!ch.isImmune(this.getClass())) {
              Buff.affect$Char$Class(ch, $J.cls(Corrosion)).set$float$int$Class(2, this.strength, this.source_);
            }
          }
        }
      }
    }
  }
  setStrength$int(str: number): CorrosiveGas {
    return this.setStrength$int$Class(str, null);
  }
  setStrength$int$Class(str: number, source: JClass): CorrosiveGas {
    if (str > this.strength) {
      this.strength = str;
      this.source_ = source;
    }
    return this;
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.strength = bundle.getInt(CorrosiveGas.STRENGTH);
    this.source_ = bundle.getClass$String(CorrosiveGas.SOURCE);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(CorrosiveGas.STRENGTH, this.strength);
    bundle.put$String$Class(CorrosiveGas.SOURCE, this.source_);
  }
  use(emitter: BlobEmitter): void {
    super.use(emitter);
    emitter.pour(Speck.factory$int(Speck.CORROSION), Math.fround(0.4));
  }
  tileDesc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', []);
  }
}

$J.define(CorrosiveGas, 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.CorrosiveGas', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob', ctors: { '': '_CorrosiveGas' }, meths: { 'setStrength(int,java.lang.Class)': 'setStrength$int$Class', 'setStrength(int)': 'setStrength$int' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Corrosion = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Corrosion');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
});
