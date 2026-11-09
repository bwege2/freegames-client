// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/remains/RemainsItem.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Actor, HeroClass, BowFragment, BrokenHilt, BrokenStaff, CloakScrap, SealShard, TornPage, Catalog;

export class RemainsItem extends Item {
  static readonly AC_USE: string = 'USE';
  _RemainsItem(): this {
    this._Item();
    this.bones = false;
    this.defaultAction_ = RemainsItem.AC_USE;
    return this;
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    actions.add(RemainsItem.AC_USE);
    return actions;
  }
  execute$Hero$String(hero: Hero, action: string): void {
    super.execute$Hero$String(hero, action);
    if ($J.equals(action, RemainsItem.AC_USE)) {
      hero.sprite_.operate$int(hero.pos);
      Catalog.countUse($J.getClass(this));
      this.doEffect(hero);
      hero.spendAndNext(Actor.TICK);
      this.detach(hero.belongings.backpack);
    }
  }
  isIdentified(): boolean {
    return true;
  }
  isUpgradable(): boolean {
    return false;
  }
  value(): number {
    return 50;
  }
  static get(cls: HeroClass): RemainsItem {
    switch (cls) {
      case HeroClass.WARRIOR:
      default:
        return new SealShard()._SealShard();
      case HeroClass.MAGE:
        return new BrokenStaff()._BrokenStaff();
      case HeroClass.ROGUE:
        return new CloakScrap()._CloakScrap();
      case HeroClass.HUNTRESS:
        return new BowFragment()._BowFragment();
      case HeroClass.DUELIST:
        return new BrokenHilt()._BrokenHilt();
      case HeroClass.CLERIC:
        return new TornPage()._TornPage();
    }
  }
}

$J.define(RemainsItem, 'com.shatteredpixel.shatteredpixeldungeon.items.remains.RemainsItem', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_RemainsItem' }, meths: { 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' } });
$J.module(() => {
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  HeroClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass');
  BowFragment = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.remains.BowFragment');
  BrokenHilt = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.remains.BrokenHilt');
  BrokenStaff = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.remains.BrokenStaff');
  CloakScrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.remains.CloakScrap');
  SealShard = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.remains.SealShard');
  TornPage = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.remains.TornPage');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
});
