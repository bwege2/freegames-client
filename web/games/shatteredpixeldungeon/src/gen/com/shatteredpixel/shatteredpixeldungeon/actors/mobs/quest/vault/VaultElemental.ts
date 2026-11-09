// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/quest/vault/VaultElemental.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Elemental } from '../../Elemental.ts';
import { Elemental$FireElemental } from '../../Elemental.ts';
import { Elemental$FrostElemental } from '../../Elemental.ts';
import { Elemental$ShockElemental } from '../../Elemental.ts';

let DwarfToken, Random;

export class VaultElemental extends Elemental {
  _VaultElemental(): this {
    this._Elemental();
    return this;
  }
  static random(): JClass<Elemental> {
    let roll = Random.Float$();
    if (roll < Math.fround(0.4)) {
      return $J.cls(VaultElemental$Fire);
    } else if (roll < Math.fround(0.8)) {
      return $J.cls(VaultElemental$Frost);
    } else {
      return $J.cls(VaultElemental$Shock);
    }
  }
}

export class VaultElemental$Fire extends Elemental$FireElemental {
  _VaultElemental$Fire(): this {
    this._Elemental$FireElemental();
    this.activateSteathGameplayBehaviour();
    this.maxLvl = 30;
    this.EXP = 0;
    this.loot = $J.cls(DwarfToken);
    this.lootChance_ = 1;
    return this;
  }
}

export class VaultElemental$Frost extends Elemental$FrostElemental {
  _VaultElemental$Frost(): this {
    this._Elemental$FrostElemental();
    this.activateSteathGameplayBehaviour();
    this.maxLvl = 30;
    this.EXP = 0;
    this.loot = $J.cls(DwarfToken);
    this.lootChance_ = 1;
    return this;
  }
}

export class VaultElemental$Shock extends Elemental$ShockElemental {
  _VaultElemental$Shock(): this {
    this._Elemental$ShockElemental();
    this.activateSteathGameplayBehaviour();
    this.maxLvl = 30;
    this.EXP = 0;
    this.loot = $J.cls(DwarfToken);
    this.lootChance_ = 1;
    return this;
  }
}

$J.define(VaultElemental, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultElemental', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Elemental', ctors: { '': '_VaultElemental' } });
$J.define(VaultElemental$Fire, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultElemental$Fire', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Elemental$FireElemental', ctors: { '': '_VaultElemental$Fire' } });
$J.define(VaultElemental$Frost, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultElemental$Frost', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Elemental$FrostElemental', ctors: { '': '_VaultElemental$Frost' } });
$J.define(VaultElemental$Shock, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultElemental$Shock', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Elemental$ShockElemental', ctors: { '': '_VaultElemental$Shock' } });
$J.module(() => {
  DwarfToken = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.DwarfToken');
  Random = $J.load('com.watabou.utils.Random');
});
