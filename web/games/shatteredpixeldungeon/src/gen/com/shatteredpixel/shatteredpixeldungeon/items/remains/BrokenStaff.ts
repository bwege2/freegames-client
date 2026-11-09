// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/remains/BrokenStaff.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { RemainsItem } from './RemainsItem.ts';

let Assets$Sounds, ScrollOfRecharging, ItemSpriteSheet, Sample;

export class BrokenStaff extends RemainsItem {
  _BrokenStaff(): this {
    this._RemainsItem();
    this.image_ = ItemSpriteSheet.BROKEN_STAFF;
    return this;
  }
  doEffect(hero: Hero): void {
    hero.belongings.charge(1);
    ScrollOfRecharging.charge(hero);
    Sample.INSTANCE.play$Object(Assets$Sounds.CHARGEUP);
  }
}

$J.define(BrokenStaff, 'com.shatteredpixel.shatteredpixeldungeon.items.remains.BrokenStaff', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.remains.RemainsItem', ctors: { '': '_BrokenStaff' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  ScrollOfRecharging = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRecharging');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
