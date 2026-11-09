// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Senior.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Monk } from './Monk.ts';

let Pasty, SeniorSprite, Random;

export class Senior extends Monk {
  _Senior(): this {
    this._Monk();
    this.spriteClass = $J.cls(SeniorSprite);
    this.loot = $J.cls(Pasty);
    this.lootChance_ = 1;
    return this;
  }
  move$int$boolean(step: number, travelling: boolean): void {
    if (travelling) {
      this.focusCooldown = Math.fround(this.focusCooldown - Math.fround(1.66));
    }
    super.move$int$boolean(step, travelling);
  }
  damageRoll(): number {
    return Random.NormalIntRange(16, 25);
  }
}

$J.define(Senior, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Senior', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Monk', ctors: { '': '_Senior' }, meths: { 'move(int,boolean)': 'move$int$boolean' } });
$J.module(() => {
  Pasty = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.Pasty');
  SeniorSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.SeniorSprite');
  Random = $J.load('com.watabou.utils.Random');
});
