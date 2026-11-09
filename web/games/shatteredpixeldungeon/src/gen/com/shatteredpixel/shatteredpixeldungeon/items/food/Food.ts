// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/food/Food.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Item } from '../Item.ts';

let Assets$Sounds, Badges, Challenges, Dungeon, Statistics, Buff, Hunger, Talent, SpellSprite, HornOfPlenty$hornRecharge, Catalog, Messages, ItemSpriteSheet, GLog, Sample;

export class Food extends Item {
  static readonly TIME_TO_EAT: number = 3;
  static readonly AC_EAT: string = 'EAT';
  energy: number = 0;
  _Food(): this {
    this._Item();
    this.energy = Hunger.HUNGRY;
    this.stackable = true;
    this.image_ = ItemSpriteSheet.RATION;
    this.defaultAction_ = Food.AC_EAT;
    this.bones = true;
    return this;
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    actions.add(Food.AC_EAT);
    return actions;
  }
  execute$Hero$String(hero: Hero, action: string): void {
    super.execute$Hero$String(hero, action);
    if ($J.equals(action, Food.AC_EAT)) {
      this.detach(hero.belongings.backpack);
      Catalog.countUse($J.getClass(this));
      this.satisfy(hero);
      GLog.i(Messages.get$Object$String$ObjectArr(this, 'eat_msg', []), []);
      hero.sprite_.operate$int(hero.pos);
      hero.busy();
      SpellSprite.show$Char$int(hero, SpellSprite.FOOD);
      this.eatSFX();
      hero.spend(this.eatingTime());
      Talent.onFoodEaten(hero, this.energy, this);
      Statistics.foodEaten++;
      Badges.validateFoodEaten();
    }
  }
  eatSFX(): void {
    Sample.INSTANCE.play$Object(Assets$Sounds.EAT);
  }
  eatingTime(): number {
    if (Dungeon.hero.hasTalent(Talent.IRON_STOMACH) || Dungeon.hero.hasTalent(Talent.ENERGIZING_MEAL) || Dungeon.hero.hasTalent(Talent.MYSTICAL_MEAL) || Dungeon.hero.hasTalent(Talent.INVIGORATING_MEAL) || Dungeon.hero.hasTalent(Talent.FOCUSED_MEAL) || Dungeon.hero.hasTalent(Talent.ENLIGHTENING_MEAL)) {
      return Math.fround(Food.TIME_TO_EAT - 2);
    } else {
      return Food.TIME_TO_EAT;
    }
  }
  satisfy(hero: Hero): void {
    let foodVal = this.energy;
    if (Dungeon.isChallenged(Challenges.NO_FOOD)) {
      foodVal = Math.fround(foodVal / 3);
    }
    let buff = hero.buff($J.cls(HornOfPlenty$hornRecharge));
    if (buff != null && buff.isCursed()) {
      foodVal = Math.fround(foodVal * Math.fround(0.67));
      GLog.n(Messages.get$Class$String$ObjectArr($J.cls(Hunger), 'cursedhorn', []), []);
    }
    Buff.affect$Char$Class(hero, $J.cls(Hunger)).satisfy(foodVal);
  }
  isUpgradable(): boolean {
    return false;
  }
  isIdentified(): boolean {
    return true;
  }
  value(): number {
    return Math.imul(10, this.quantity);
  }
}

$J.define(Food, 'com.shatteredpixel.shatteredpixeldungeon.items.food.Food', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_Food' }, meths: { 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Hunger = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Hunger');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  SpellSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.SpellSprite');
  HornOfPlenty$hornRecharge = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.HornOfPlenty$hornRecharge');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
