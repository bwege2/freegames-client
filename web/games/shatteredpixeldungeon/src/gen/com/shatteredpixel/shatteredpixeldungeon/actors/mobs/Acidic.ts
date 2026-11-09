// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Acidic.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Scorpio } from './Scorpio.ts';

let Dungeon, Char$Property, Buff, Ooze, PotionOfExperience, AcidicSprite;

export class Acidic extends Scorpio {
  _Acidic(): this {
    this._Scorpio();
    this.spriteClass = $J.cls(AcidicSprite);
    this.properties_.add(Char$Property.ACIDIC);
    this.loot = $J.cls(PotionOfExperience);
    this.lootChance_ = 1;
    return this;
  }
  attackProc(enemy: Char, damage: number): number {
    Buff.affect$Char$Class(enemy, $J.cls(Ooze)).set(Ooze.DURATION);
    return super.attackProc(enemy, damage);
  }
  defenseProc(enemy: Char, damage: number): number {
    if (Dungeon.level.adjacent(this.pos, enemy.pos)) {
      Buff.affect$Char$Class(enemy, $J.cls(Ooze)).set(Ooze.DURATION);
    }
    return super.defenseProc(enemy, damage);
  }
  createLoot(): Item {
    return new PotionOfExperience()._PotionOfExperience();
  }
}

$J.define(Acidic, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Acidic', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Scorpio', ctors: { '': '_Acidic' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Ooze = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Ooze');
  PotionOfExperience = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfExperience');
  AcidicSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.AcidicSprite');
});
