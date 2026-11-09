// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/quest/DwarfToken.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Imp$Quest, Messages, ItemSpriteSheet, GLog;

export class DwarfToken extends Item {
  _DwarfToken(): this {
    this._Item();
    this.image_ = ItemSpriteSheet.TOKEN;
    this.stackable = true;
    this.unique = true;
    return this;
  }
  isUpgradable(): boolean {
    return false;
  }
  isIdentified(): boolean {
    return true;
  }
  doPickUp$Hero$int(hero: Hero, pos: number): boolean {
    if (Imp$Quest.mirrorUsed) {
      GLog.i(Messages.get$Object$String$ObjectArr(this, 'discard', []), []);
      hero.next();
      return true;
    }
    return super.doPickUp$Hero$int(hero, pos);
  }
  desc(): string {
    if (Imp$Quest.isOld()) {
      return Messages.get$Object$String$ObjectArr(this, 'desc_old', []);
    } else {
      return super.desc();
    }
  }
}

$J.define(DwarfToken, 'com.shatteredpixel.shatteredpixeldungeon.items.quest.DwarfToken', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_DwarfToken' }, meths: { 'doPickUp(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,int)': 'doPickUp$Hero$int' } });
$J.module(() => {
  Imp$Quest = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Imp$Quest');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
});
