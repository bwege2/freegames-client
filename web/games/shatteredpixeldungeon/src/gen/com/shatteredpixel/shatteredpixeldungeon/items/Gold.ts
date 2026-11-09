// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/Gold.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Badges, Dungeon, Statistics, FloatingText, Catalog, GameScene, CharSprite, ItemSpriteSheet, Sample, Random;

export class Gold extends Item {
  $init_Gold() {
    this.image_ = ItemSpriteSheet.GOLD;
    this.stackable = true;
  }
  _Gold$(): this {
    this._Gold$int(1);
    return this;
  }
  _Gold$int(value: number): this {
    this._Item();
    this.$init_Gold();
    this.quantity = value;
    return this;
  }
  actions(hero: Hero): ArrayList<string> {
    return new ArrayList();
  }
  doPickUp$Hero$int(hero: Hero, pos: number): boolean {
    Catalog.setSeen($J.getClass(this));
    Statistics.itemTypesDiscovered.add($J.getClass(this));
    Dungeon.gold = (Dungeon.gold + this.quantity) | 0;
    Statistics.goldCollected = (Statistics.goldCollected + this.quantity) | 0;
    Badges.validateGoldCollected();
    GameScene.pickUp(this, pos);
    hero.sprite_.showStatusWithIcon(CharSprite.NEUTRAL, String(this.quantity), FloatingText.GOLD, []);
    hero.spendAndNext(this.pickupDelay());
    Sample.INSTANCE.play$Object$float$float$float(Assets$Sounds.GOLD, 1, 1, Random.Float$float$float(Math.fround(0.9), Math.fround(1.1)));
    Item.updateQuickslot();
    return true;
  }
  isUpgradable(): boolean {
    return false;
  }
  isIdentified(): boolean {
    return true;
  }
  random(): Item {
    this.quantity = Random.IntRange((30 + Math.imul(Dungeon.depth, 10)) | 0, (60 + Math.imul(Dungeon.depth, 20)) | 0);
    return this;
  }
}

$J.define(Gold, 'com.shatteredpixel.shatteredpixeldungeon.items.Gold', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { 'int': '_Gold$int', '': '_Gold$' }, meths: { 'doPickUp(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,int)': 'doPickUp$Hero$int' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Random = $J.load('com.watabou.utils.Random');
});
