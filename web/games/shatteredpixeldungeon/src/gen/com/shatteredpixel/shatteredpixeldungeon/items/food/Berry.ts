// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/food/Berry.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Food } from './Food.ts';
import { CounterBuff } from '../../actors/buffs/CounterBuff.ts';

let Dungeon, Buff, Hunger, Talent, Generator, Generator$Category, ItemSpriteSheet;

export class Berry extends Food {
  _Berry(): this {
    this._Food();
    this.image_ = ItemSpriteSheet.BERRY;
    this.energy = Math.fround(Hunger.HUNGRY / 3);
    this.bones = false;
    return this;
  }
  eatingTime(): number {
    if (Dungeon.hero.hasTalent(Talent.IRON_STOMACH) || Dungeon.hero.hasTalent(Talent.ENERGIZING_MEAL) || Dungeon.hero.hasTalent(Talent.MYSTICAL_MEAL) || Dungeon.hero.hasTalent(Talent.INVIGORATING_MEAL) || Dungeon.hero.hasTalent(Talent.FOCUSED_MEAL) || Dungeon.hero.hasTalent(Talent.ENLIGHTENING_MEAL)) {
      return 0;
    } else {
      return 1;
    }
  }
  satisfy(hero: Hero): void {
    super.satisfy(hero);
    let counter = Buff.count(hero, $J.cls(Berry$SeedCounter), 1);
    if (counter.count() >= Math.fround(2)) {
      Dungeon.level.drop(Generator.randomUsingDefaults$Category(Generator$Category.SEED), hero.pos).sprite_.drop$();
      counter.detach();
    }
  }
  value(): number {
    return Math.imul(5, this.quantity);
  }
}

export class Berry$SeedCounter extends CounterBuff {
  _Berry$SeedCounter(): this {
    this._CounterBuff();
    this.revivePersists = true;
    return this;
  }
}

$J.define(Berry, 'com.shatteredpixel.shatteredpixeldungeon.items.food.Berry', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.food.Food', ctors: { '': '_Berry' } });
$J.define(Berry$SeedCounter, 'com.shatteredpixel.shatteredpixeldungeon.items.food.Berry$SeedCounter', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.CounterBuff', ctors: { '': '_Berry$SeedCounter' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Hunger = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Hunger');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
