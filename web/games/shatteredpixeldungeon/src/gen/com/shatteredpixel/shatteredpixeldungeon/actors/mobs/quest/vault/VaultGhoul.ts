// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/quest/vault/VaultGhoul.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Ghoul } from '../../Ghoul.ts';

let Dungeon, DwarfToken;

export class VaultGhoul extends Ghoul {
  _VaultGhoul(): this {
    this._Ghoul();
    this.activateSteathGameplayBehaviour();
    this.partnerID = -2;
    this.maxLvl = 30;
    this.EXP = 0;
    this.loot = $J.cls(DwarfToken);
    this.lootChance_ = 1;
    return this;
  }
  act(): boolean {
    if (this.state_ === this.WANDERING || this.state_ === this.SLEEPING) {
      for (const $it0 = Dungeon.level.mobs.iterator(); $it0.hasNext(); ) {
        let m = $it0.next();
        if (m instanceof VaultGhoul && Dungeon.level.distance(this.pos, m.pos) < 4 && (m.state_ === m.INVESTIGATING || m.state_ === m.HUNTING)) {
          this.beckon(m.pos);
          break;
        }
      }
    }
    return super.act();
  }
}

$J.define(VaultGhoul, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultGhoul', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Ghoul', ctors: { '': '_VaultGhoul' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  DwarfToken = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.DwarfToken');
});
