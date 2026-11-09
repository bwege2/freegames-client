// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/scrolls/ScrollOfLullaby.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Scroll } from './Scroll.ts';

let Assets$Sounds, Dungeon, Buff, Drowsy, Speck, Item, Messages, ItemSpriteSheet$Icons, GLog, Sample;

export class ScrollOfLullaby extends Scroll {
  _ScrollOfLullaby(): this {
    this._Scroll();
    this.icon_ = ItemSpriteSheet$Icons.SCROLL_LULLABY;
    return this;
  }
  doRead(): void {
    this.detach(Item.curUser.belongings.backpack);
    Item.curUser.sprite_.centerEmitter().start(Speck.factory$int(Speck.NOTE), Math.fround(0.3), 5);
    Sample.INSTANCE.play$Object(Assets$Sounds.LULLABY);
    for (let mob of $J.toArrayInto(Dungeon.level.mobs.toArray(), $J.newArray(0, null))) {
      if (Dungeon.level.heroFOV[mob.pos]) {
        Buff.affect$Char$Class$float(mob, $J.cls(Drowsy), Drowsy.DURATION);
        mob.sprite_.centerEmitter().start(Speck.factory$int(Speck.NOTE), Math.fround(0.3), 5);
      }
    }
    Buff.affect$Char$Class$float(Item.curUser, $J.cls(Drowsy), Drowsy.DURATION);
    GLog.i(Messages.get$Object$String$ObjectArr(this, 'sooth', []), []);
    this.identify$();
    this.readAnimation();
  }
  value(): number {
    return this.isKnown() ? Math.imul(40, this.quantity) : super.value();
  }
}

$J.define(ScrollOfLullaby, 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfLullaby', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.Scroll', ctors: { '': '_ScrollOfLullaby' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Drowsy = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Drowsy');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet$Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
