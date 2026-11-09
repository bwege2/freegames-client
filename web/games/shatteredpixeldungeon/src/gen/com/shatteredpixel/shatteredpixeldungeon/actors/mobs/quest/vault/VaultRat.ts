// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/quest/vault/VaultRat.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Rat } from '../../Rat.ts';

let DwarfToken, Messages;

export class VaultRat extends Rat {
  _VaultRat(): this {
    this._Rat();
    this.activateSteathGameplayBehaviour();
    this.defenseSkill_ = 18;
    this.maxLvl = 30;
    this.EXP = 0;
    this.loot = $J.cls(DwarfToken);
    this.lootChance_ = 1;
    return this;
  }
  attackSkill(target: Char): number {
    return 24;
  }
  description(): string {
    return Messages.get$Class$String$ObjectArr($J.cls(Rat), 'desc', []) + '\n\n' + super.description();
  }
}

$J.define(VaultRat, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultRat', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Rat', ctors: { '': '_VaultRat' } });
$J.module(() => {
  DwarfToken = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.DwarfToken');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
});
