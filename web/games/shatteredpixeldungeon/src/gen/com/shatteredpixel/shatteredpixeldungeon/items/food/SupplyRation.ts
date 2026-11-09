// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/food/SupplyRation.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Hunger, Talent, FloatingText, CloakOfShadows, ScrollOfRecharging, CharSprite, ItemSpriteSheet;

export class SupplyRation extends Food {
  _SupplyRation(): this {
    this._Food();
    this.image_ = ItemSpriteSheet.SUPPLY_RATION;
    this.energy = Math.fround(Math.fround(2 * Hunger.HUNGRY) / 3);
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
    hero.HP = Math.min((hero.HP + 5) | 0, hero.HT);
    hero.sprite_.showStatusWithIcon(CharSprite.POSITIVE, '5', FloatingText.HEALING, []);
    let cloak = hero.belongings.getItem($J.cls(CloakOfShadows));
    if (cloak != null) {
      cloak.directCharge(1);
      ScrollOfRecharging.charge(hero);
    }
  }
  value(): number {
    return Math.imul(10, this.quantity);
  }
}

$J.define(SupplyRation, 'com.shatteredpixel.shatteredpixeldungeon.items.food.SupplyRation', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.food.Food', ctors: { '': '_SupplyRation' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Hunger = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Hunger');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  CloakOfShadows = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.CloakOfShadows');
  ScrollOfRecharging = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRecharging');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
