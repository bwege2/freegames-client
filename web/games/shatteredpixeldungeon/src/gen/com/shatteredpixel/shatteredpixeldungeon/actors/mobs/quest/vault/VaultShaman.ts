// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/quest/vault/VaultShaman.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Shaman } from '../../Shaman.ts';

let Buff, Hex, Vulnerable, Weakness, DwarfToken, ShamanSprite$Vault, Random;

export class VaultShaman extends Shaman {
  type_: number = 0;
  static readonly TYPE: string = 'type';
  _VaultShaman(): this {
    this._Shaman();
    this.activateSteathGameplayBehaviour();
    this.spriteClass = $J.cls(ShamanSprite$Vault);
    this.defenseSkill_ = 18;
    this.maxLvl = 30;
    this.EXP = 0;
    this.loot = $J.cls(DwarfToken);
    this.lootChance_ = 1;
    this.type_ = Random.Int$int(5);
    return this;
  }
  attackSkill(target: Char): number {
    return 25;
  }
  lootChance(): number {
    return 1;
  }
  createLoot(): Item {
    return new DwarfToken()._DwarfToken();
  }
  debuff(enemy: Char): void {
    switch (this.type_) {
      case 0:
      case 1:
        Buff.prolong(enemy, $J.cls(Weakness), Weakness.DURATION);
        break;
      case 2:
      case 3:
        Buff.prolong(enemy, $J.cls(Vulnerable), Vulnerable.DURATION);
        break;
      case 4:
        Buff.prolong(enemy, $J.cls(Hex), Hex.DURATION);
        break;
    }
  }
  damageRoll(): number {
    return Random.NormalIntRange(5, 25);
  }
  drRoll(): number {
    return (super.drRoll() + 5) | 0;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(VaultShaman.TYPE, this.type_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.type_ = bundle.getInt(VaultShaman.TYPE);
  }
}

$J.define(VaultShaman, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.quest.vault.VaultShaman', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Shaman', ctors: { '': '_VaultShaman' } });
$J.module(() => {
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Hex = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Hex');
  Vulnerable = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Vulnerable');
  Weakness = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Weakness');
  DwarfToken = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.DwarfToken');
  ShamanSprite$Vault = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ShamanSprite$Vault');
  Random = $J.load('com.watabou.utils.Random');
});
