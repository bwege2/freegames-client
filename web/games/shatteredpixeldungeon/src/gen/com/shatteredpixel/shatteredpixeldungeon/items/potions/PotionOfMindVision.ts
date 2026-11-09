// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/potions/PotionOfMindVision.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Potion } from './Potion.ts';

let Dungeon, Buff, MindVision, SpellSprite, Messages, ItemSpriteSheet$Icons, GLog;

export class PotionOfMindVision extends Potion {
  _PotionOfMindVision(): this {
    this._Potion();
    this.icon_ = ItemSpriteSheet$Icons.POTION_MINDVIS;
    return this;
  }
  apply(hero: Hero): void {
    this.identify$();
    Buff.prolong(hero, $J.cls(MindVision), MindVision.DURATION);
    SpellSprite.show$Char$int$float$float$float(hero, SpellSprite.VISION, 1, Math.fround(0.77), Math.fround(0.9));
    Dungeon.observe$();
    if (Dungeon.level.mobs.size() > 0) {
      GLog.i(Messages.get$Object$String$ObjectArr(this, 'see_mobs', []), []);
    } else {
      GLog.i(Messages.get$Object$String$ObjectArr(this, 'see_none', []), []);
    }
  }
  value(): number {
    return this.isKnown() ? Math.imul(30, this.quantity) : super.value();
  }
}

$J.define(PotionOfMindVision, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfMindVision', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.potions.Potion', ctors: { '': '_PotionOfMindVision' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  MindVision = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MindVision');
  SpellSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.SpellSprite');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet$Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
});
