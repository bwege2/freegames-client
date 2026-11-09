// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Slime.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon$LimitedDrops, AscensionChallenge, Generator, Generator$Category, SlimeSprite, Random;

export class Slime extends Mob {
  _Slime(): this {
    this._Mob();
    this.spriteClass = $J.cls(SlimeSprite);
    this.HP = this.HT = 20;
    this.defenseSkill_ = 5;
    this.EXP = 4;
    this.maxLvl = 9;
    this.lootChance_ = Math.fround(0.2);
    return this;
  }
  damageRoll(): number {
    return Random.NormalIntRange(2, 5);
  }
  attackSkill(target: Char): number {
    return 12;
  }
  damage(dmg: number, src: any): void {
    let scaleFactor = AscensionChallenge.statModifier(this);
    let scaledDmg = Math.fround(dmg / scaleFactor);
    if (scaledDmg >= Math.fround(5)) {
      scaledDmg = Math.fround(4 + Math.fround(Math.fround((Math.sqrt(Math.fround(Math.fround(8 * (Math.fround(scaledDmg - 4))) + 1)) - 1)) / 2));
    }
    dmg = $J.d2i((Math.fround(scaledDmg * AscensionChallenge.statModifier(this))));
    super.damage(dmg, src);
  }
  lootChance(): number {
    return Math.fround(super.lootChance() * Math.fround($J.pow(Math.fround(1 / 4), Dungeon$LimitedDrops.SLIME_WEP.count_)));
  }
  createLoot(): Item {
    Dungeon$LimitedDrops.SLIME_WEP.count_++;
    let c = Generator$Category.WEP_T2;
    let w = Generator.randomUsingDefaults$Category(Generator$Category.WEP_T2);
    w.level$int(0);
    return w;
  }
}

$J.define(Slime, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Slime', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_Slime' } });
$J.module(() => {
  Dungeon$LimitedDrops = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon$LimitedDrops');
  AscensionChallenge = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AscensionChallenge');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  SlimeSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.SlimeSprite');
  Random = $J.load('com.watabou.utils.Random');
});
