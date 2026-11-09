// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/blobs/ToxicGas.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Badges, Dungeon, Actor, Speck, Messages, GLog;

export class ToxicGas extends Blob {
  _ToxicGas(): this {
    this._Blob();
    return this;
  }
  evolve(): void {
    super.evolve();
    let damage = (1 + $J.idiv(Dungeon.scalingDepth(), 5)) | 0;
    let ch: Char;
    let cell: number;
    for (let i = this.area.left_; i < this.area.right_; i++) {
      for (let j = this.area.top_; j < this.area.bottom_; j++) {
        cell = (i + Math.imul(j, Dungeon.level.width())) | 0;
        if (this.cur[cell] > 0 && (ch = Actor.findChar(cell)) != null) {
          if (!ch.isImmune(this.getClass())) {
            ch.damage(damage, this);
          }
        }
      }
    }
  }
  use(emitter: BlobEmitter): void {
    super.use(emitter);
    emitter.pour(Speck.factory$int(Speck.TOXIC), Math.fround(0.4));
  }
  tileDesc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', []);
  }
  onDeath(): void {
    Badges.validateDeathFromGas();
    Dungeon.fail(this);
    GLog.n(Messages.get$Object$String$ObjectArr(this, 'ondeath', []), []);
  }
}

$J.define(ToxicGas, 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.ToxicGas', { kind: 'class', ifaces: ['com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero$Doom'], sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob', ctors: { '': '_ToxicGas' } });
$J.module(() => {
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
});
