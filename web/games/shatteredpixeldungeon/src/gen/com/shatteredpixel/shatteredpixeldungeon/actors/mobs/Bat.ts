// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Bat.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Mob } from './Mob.ts';

let Dungeon$LimitedDrops, FloatingText, PotionOfHealing, BatSprite, CharSprite, Random;

export class Bat extends Mob {
  _Bat(): this {
    this._Mob();
    this.spriteClass = $J.cls(BatSprite);
    this.HP = this.HT = 30;
    this.defenseSkill_ = 15;
    this.baseSpeed = 2;
    this.EXP = 7;
    this.maxLvl = 15;
    this.flying = true;
    this.loot = $J.cls(PotionOfHealing);
    this.lootChance_ = Math.fround(0.1667);
    return this;
  }
  damageRoll(): number {
    return Random.NormalIntRange(5, 18);
  }
  attackSkill(target: Char): number {
    return 16;
  }
  drRoll(): number {
    return (super.drRoll() + Random.NormalIntRange(0, 4)) | 0;
  }
  die(cause: any): void {
    this.flying = false;
    super.die(cause);
  }
  attackProc(enemy: Char, damage: number): number {
    damage = super.attackProc(enemy, damage);
    let reg = Math.min((damage - 4) | 0, (this.HT - this.HP) | 0);
    if (reg > 0) {
      this.HP = (this.HP + reg) | 0;
      this.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(reg), FloatingText.HEALING, []);
    }
    return damage;
  }
  lootChance(): number {
    return Math.fround(super.lootChance() * (Math.fround((Math.fround(7 - Dungeon$LimitedDrops.BAT_HP.count_)) / 7)));
  }
  createLoot(): Item {
    Dungeon$LimitedDrops.BAT_HP.count_++;
    return super.createLoot();
  }
}

$J.define(Bat, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Bat', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_Bat' } });
$J.module(() => {
  Dungeon$LimitedDrops = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon$LimitedDrops');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  PotionOfHealing = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfHealing');
  BatSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.BatSprite');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  Random = $J.load('com.watabou.utils.Random');
});
