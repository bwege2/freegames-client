// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/quest/vault/VaultDM200.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { DM200 } from '../../DM200.ts';

let DwarfToken, DM200Sprite$Vault;

export class VaultDM200 extends DM200 {
  _VaultDM200(): this {
    this._DM200();
    this.activateSteathGameplayBehaviour();
    this.spriteClass = $J.cls(DM200Sprite$Vault);
    this.defenseSkill_ = 15;
    this.maxLvl = 30;
    this.EXP = 0;
    this.loot = $J.cls(DwarfToken);
    this.lootChance_ = 1;
    return this;
  }
  attackSkill(target: Char): number {
    return 28;
  }
  lootChance(): number {
    return 1;
  }
  createLoot(): Item {
    return new DwarfToken()._DwarfToken();
  }
}

$J.define(VaultDM200, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultDM200', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DM200', ctors: { '': '_VaultDM200' } });
$J.module(() => {
  DwarfToken = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.DwarfToken');
  DM200Sprite$Vault = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.DM200Sprite$Vault');
});
