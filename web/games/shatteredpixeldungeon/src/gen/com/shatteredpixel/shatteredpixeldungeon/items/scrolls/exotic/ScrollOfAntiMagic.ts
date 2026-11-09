// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/scrolls/exotic/ScrollOfAntiMagic.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../jre/index.ts';
import { ExoticScroll } from './ExoticScroll.ts';

let Buff, MagicImmune, Flare, Item, ItemSpriteSheet$Icons;

export class ScrollOfAntiMagic extends ExoticScroll {
  _ScrollOfAntiMagic(): this {
    this._ExoticScroll();
    this.icon_ = ItemSpriteSheet$Icons.SCROLL_ANTIMAGIC;
    return this;
  }
  doRead(): void {
    this.detach(Item.curUser.belongings.backpack);
    Buff.affect$Char$Class$float(Item.curUser, $J.cls(MagicImmune), MagicImmune.DURATION);
    new Flare()._Flare(5, 32).color$int$boolean(65280, true).show$Visual$float(Item.curUser.sprite_, 2);
    this.identify$();
    this.readAnimation();
  }
}

$J.define(ScrollOfAntiMagic, 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfAntiMagic', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ExoticScroll', ctors: { '': '_ScrollOfAntiMagic' } });
$J.module(() => {
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  MagicImmune = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MagicImmune');
  Flare = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Flare');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  ItemSpriteSheet$Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons');
});
