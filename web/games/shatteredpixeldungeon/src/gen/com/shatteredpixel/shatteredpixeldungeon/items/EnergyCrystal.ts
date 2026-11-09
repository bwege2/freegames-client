// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/EnergyCrystal.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../jre/index.ts';
import { Item } from './Item.ts';

let Assets$Sounds, Dungeon, Statistics, FloatingText, Catalog, GameScene, ItemSpriteSheet, Sample;

export class EnergyCrystal extends Item {
  $init_EnergyCrystal() {
    this.image_ = ItemSpriteSheet.ENERGY;
    this.stackable = true;
  }
  _EnergyCrystal$(): this {
    this._EnergyCrystal$int(1);
    return this;
  }
  _EnergyCrystal$int(value: number): this {
    this._Item();
    this.$init_EnergyCrystal();
    this.quantity = value;
    return this;
  }
  actions(hero: Hero): ArrayList<string> {
    return new ArrayList();
  }
  doPickUp$Hero$int(hero: Hero, pos: number): boolean {
    Catalog.setSeen($J.getClass(this));
    Statistics.itemTypesDiscovered.add($J.getClass(this));
    Dungeon.energy = (Dungeon.energy + this.quantity) | 0;
    GameScene.pickUp(this, pos);
    hero.sprite_.showStatusWithIcon(4508927, String(this.quantity), FloatingText.ENERGY, []);
    hero.spendAndNext(this.pickupDelay());
    Sample.INSTANCE.play$Object(Assets$Sounds.ITEM);
    Item.updateQuickslot();
    return true;
  }
  isUpgradable(): boolean {
    return false;
  }
  isIdentified(): boolean {
    return true;
  }
}

$J.define(EnergyCrystal, 'com.shatteredpixel.shatteredpixeldungeon.items.EnergyCrystal', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { 'int': '_EnergyCrystal$int', '': '_EnergyCrystal$' }, meths: { 'doPickUp(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,int)': 'doPickUp$Hero$int' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
