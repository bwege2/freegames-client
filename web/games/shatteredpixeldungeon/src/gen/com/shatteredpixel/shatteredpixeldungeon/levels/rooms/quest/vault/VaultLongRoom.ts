// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/rooms/quest/vault/VaultLongRoom.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../../jre/index.ts';
import { VaultRoom } from './VaultRoom.ts';

let Random;

export class VaultLongRoom extends VaultRoom {
  wide_: boolean = false;
  _VaultLongRoom(): this {
    this._VaultRoom();
    this.wide_ = Random.Int$int(2) === 0;
    return this;
  }
  wide(): boolean {
    if (this.width() === this.height()) {
      return this.wide_;
    } else {
      return this.width() > this.height();
    }
  }
  minWidth(): number {
    return this.wide() ? 21 : 11;
  }
  maxWidth(): number {
    return this.minWidth();
  }
  minHeight(): number {
    return this.wide() ? 11 : 21;
  }
  maxHeight(): number {
    return this.minHeight();
  }
  sizeFactor(): number {
    return 2;
  }
}

$J.define(VaultLongRoom, 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultLongRoom', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.rooms.quest.vault.VaultRoom', ctors: { '': '_VaultLongRoom' } });
$J.module(() => {
  Random = $J.load('com.watabou.utils.Random');
});
