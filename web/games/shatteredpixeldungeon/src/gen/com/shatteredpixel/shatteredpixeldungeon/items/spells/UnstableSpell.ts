// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/spells/UnstableSpell.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, HashMap, HashSet } from '../../../../../../jre/index.ts';
import { Spell } from './Spell.ts';
import { Recipe } from '../Recipe.ts';

let Item, ScrollOfIdentify, ScrollOfLullaby, ScrollOfMagicMapping, ScrollOfMirrorImage, ScrollOfRage, ScrollOfRecharging, ScrollOfRemoveCurse, ScrollOfRetribution, ScrollOfTeleportation, ScrollOfTerror, ScrollOfTransmutation, ExoticScroll, Runestone, Catalog, ItemSpriteSheet, Random, Reflection;

export class UnstableSpell extends Spell {
  static scrollChances: HashMap<JClass<Scroll>, number> = null;
  static nonCombatScrolls: HashSet<JClass<Scroll>> = null;
  static combatScrolls: HashSet<JClass<Scroll>> = null;
  _UnstableSpell(): this {
    this._Spell();
    this.image_ = ItemSpriteSheet.UNSTABLE_SPELL;
    return this;
  }
  onCast(hero: Hero): void {
    this.detach(Item.curUser.belongings.backpack);
    Item.updateQuickslot();
    let s = Reflection.newInstance(Random.chances$HashMap(UnstableSpell.scrollChances));
    if (hero.visibleEnemies() === 0) {
      while (!UnstableSpell.nonCombatScrolls.contains(s.getClass())) {
        s = Reflection.newInstance(Random.chances$HashMap(UnstableSpell.scrollChances));
      }
    } else {
      while (!UnstableSpell.combatScrolls.contains(s.getClass())) {
        s = Reflection.newInstance(Random.chances$HashMap(UnstableSpell.scrollChances));
      }
    }
    s.anonymize();
    s.talentChance = s.talentFactor = 1;
    Item.curItem = s;
    s.doRead();
    Catalog.countUse($J.getClass(this));
  }
  value(): number {
    return Math.imul(40, this.quantity);
  }
  energyVal(): number {
    return Math.imul(8, this.quantity);
  }
  static $clinit() {
    UnstableSpell.scrollChances = new HashMap();
    $J.boxF(UnstableSpell.scrollChances.put($J.cls(ScrollOfIdentify), $J.boxF(3)));
    $J.boxF(UnstableSpell.scrollChances.put($J.cls(ScrollOfRemoveCurse), $J.boxF(2)));
    $J.boxF(UnstableSpell.scrollChances.put($J.cls(ScrollOfMagicMapping), $J.boxF(2)));
    $J.boxF(UnstableSpell.scrollChances.put($J.cls(ScrollOfMirrorImage), $J.boxF(2)));
    $J.boxF(UnstableSpell.scrollChances.put($J.cls(ScrollOfRecharging), $J.boxF(2)));
    $J.boxF(UnstableSpell.scrollChances.put($J.cls(ScrollOfLullaby), $J.boxF(2)));
    $J.boxF(UnstableSpell.scrollChances.put($J.cls(ScrollOfRetribution), $J.boxF(2)));
    $J.boxF(UnstableSpell.scrollChances.put($J.cls(ScrollOfRage), $J.boxF(2)));
    $J.boxF(UnstableSpell.scrollChances.put($J.cls(ScrollOfTeleportation), $J.boxF(2)));
    $J.boxF(UnstableSpell.scrollChances.put($J.cls(ScrollOfTerror), $J.boxF(2)));
    $J.boxF(UnstableSpell.scrollChances.put($J.cls(ScrollOfTransmutation), $J.boxF(1)));
    UnstableSpell.nonCombatScrolls = new HashSet();
    UnstableSpell.nonCombatScrolls.add($J.cls(ScrollOfIdentify));
    UnstableSpell.nonCombatScrolls.add($J.cls(ScrollOfRemoveCurse));
    UnstableSpell.nonCombatScrolls.add($J.cls(ScrollOfMagicMapping));
    UnstableSpell.nonCombatScrolls.add($J.cls(ScrollOfRecharging));
    UnstableSpell.nonCombatScrolls.add($J.cls(ScrollOfLullaby));
    UnstableSpell.nonCombatScrolls.add($J.cls(ScrollOfTeleportation));
    UnstableSpell.nonCombatScrolls.add($J.cls(ScrollOfTransmutation));
    UnstableSpell.combatScrolls = new HashSet();
    UnstableSpell.combatScrolls.add($J.cls(ScrollOfMirrorImage));
    UnstableSpell.combatScrolls.add($J.cls(ScrollOfRecharging));
    UnstableSpell.combatScrolls.add($J.cls(ScrollOfLullaby));
    UnstableSpell.combatScrolls.add($J.cls(ScrollOfRetribution));
    UnstableSpell.combatScrolls.add($J.cls(ScrollOfRage));
    UnstableSpell.combatScrolls.add($J.cls(ScrollOfTeleportation));
    UnstableSpell.combatScrolls.add($J.cls(ScrollOfTerror));
  }
}

export class UnstableSpell$Recipe extends Recipe {
  _UnstableSpell$Recipe(): this {
    this._Recipe();
    return this;
  }
  testIngredients(ingredients: ArrayList<Item>): boolean {
    let scroll = false;
    let stone = false;
    for (const $it0 = ingredients.iterator(); $it0.hasNext(); ) {
      let i = $it0.next();
      if (i instanceof Runestone) {
        stone = true;
      } else if (ExoticScroll.regToExo.containsKey(i.getClass()) || ExoticScroll.regToExo.containsValue(i.getClass())) {
        scroll = true;
      }
    }
    return scroll && stone;
  }
  cost(ingredients: ArrayList<Item>): number {
    return 1;
  }
  brew(ingredients: ArrayList<Item>): Item {
    for (const $it1 = ingredients.iterator(); $it1.hasNext(); ) {
      let i = $it1.next();
      i.quantity$int((i.quantity$() - 1) | 0);
    }
    return this.sampleOutput(null);
  }
  sampleOutput(ingredients: ArrayList<Item>): Item {
    return new UnstableSpell()._UnstableSpell();
  }
}

$J.define(UnstableSpell, 'com.shatteredpixel.shatteredpixeldungeon.items.spells.UnstableSpell', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.spells.Spell', ctors: { '': '_UnstableSpell' }, clinit: true, lazy: ['scrollChances', 'nonCombatScrolls', 'combatScrolls'] });
$J.define(UnstableSpell$Recipe, 'com.shatteredpixel.shatteredpixeldungeon.items.spells.UnstableSpell$Recipe', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Recipe', ctors: { '': '_UnstableSpell$Recipe' } });
$J.module(() => {
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  ScrollOfIdentify = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfIdentify');
  ScrollOfLullaby = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfLullaby');
  ScrollOfMagicMapping = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfMagicMapping');
  ScrollOfMirrorImage = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfMirrorImage');
  ScrollOfRage = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRage');
  ScrollOfRecharging = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRecharging');
  ScrollOfRemoveCurse = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRemoveCurse');
  ScrollOfRetribution = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRetribution');
  ScrollOfTeleportation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation');
  ScrollOfTerror = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTerror');
  ScrollOfTransmutation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTransmutation');
  ExoticScroll = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ExoticScroll');
  Runestone = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.Runestone');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
