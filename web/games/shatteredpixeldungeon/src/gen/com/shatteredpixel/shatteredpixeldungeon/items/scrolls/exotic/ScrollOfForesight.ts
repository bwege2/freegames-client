// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/scrolls/exotic/ScrollOfForesight.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Buff, Foresight, Item, ItemSpriteSheet$Icons, Sample;

export class ScrollOfForesight extends ExoticScroll {
  _ScrollOfForesight(): this {
    this._ExoticScroll();
    this.icon_ = ItemSpriteSheet$Icons.SCROLL_FORESIGHT;
    return this;
  }
  doRead(): void {
    this.detach(Item.curUser.belongings.backpack);
    Sample.INSTANCE.play$Object(Assets$Sounds.READ);
    Buff.affect$Char$Class$float(Item.curUser, $J.cls(Foresight), Foresight.DURATION);
    this.identify$();
    this.readAnimation();
  }
}

$J.define(ScrollOfForesight, 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfForesight', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ExoticScroll', ctors: { '': '_ScrollOfForesight' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Foresight = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Foresight');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  ItemSpriteSheet$Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
