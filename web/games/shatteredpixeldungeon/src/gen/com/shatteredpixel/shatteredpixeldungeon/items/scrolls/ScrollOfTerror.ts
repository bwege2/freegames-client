// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/scrolls/ScrollOfTerror.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Dungeon, Char$Alignment, Buff, Terror, Flare, Item, Messages, ItemSpriteSheet$Icons, GLog, Sample;

export class ScrollOfTerror extends Scroll {
  _ScrollOfTerror(): this {
    this._Scroll();
    this.icon_ = ItemSpriteSheet$Icons.SCROLL_TERROR;
    return this;
  }
  doRead(): void {
    this.detach(Item.curUser.belongings.backpack);
    new Flare()._Flare(5, 32).color$int$boolean(16711680, true).show$Visual$float(Item.curUser.sprite_, 2);
    Sample.INSTANCE.play$Object(Assets$Sounds.READ);
    let count = 0;
    let affected = null;
    for (let mob of $J.toArrayInto(Dungeon.level.mobs.toArray(), $J.newArray(0, null))) {
      if (mob.alignment !== Char$Alignment.ALLY && Dungeon.level.heroFOV[mob.pos]) {
        Buff.affect$Char$Class$float(mob, $J.cls(Terror), Terror.DURATION).object = Item.curUser.id();
        if (mob.buff($J.cls(Terror)) != null) {
          count++;
          affected = mob;
        }
      }
    }
    switch (count) {
      case 0:
        GLog.i(Messages.get$Object$String$ObjectArr(this, 'none', []), []);
        break;
      case 1:
        GLog.i(Messages.get$Object$String$ObjectArr(this, 'one', [affected.name()]), []);
        break;
      default:
        GLog.i(Messages.get$Object$String$ObjectArr(this, 'many', []), []);
    }
    this.identify$();
    this.readAnimation();
  }
  value(): number {
    return this.isKnown() ? Math.imul(40, this.quantity) : super.value();
  }
}

$J.define(ScrollOfTerror, 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTerror', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.Scroll', ctors: { '': '_ScrollOfTerror' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Terror = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Terror');
  Flare = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Flare');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet$Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
