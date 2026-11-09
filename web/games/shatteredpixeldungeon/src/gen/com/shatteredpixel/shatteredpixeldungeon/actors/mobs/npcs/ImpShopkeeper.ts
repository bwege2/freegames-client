// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/npcs/ImpShopkeeper.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Shopkeeper } from './Shopkeeper.ts';

let Dungeon, AscensionChallenge, Messages, ImpSprite;

export class ImpShopkeeper extends Shopkeeper {
  seenBefore: boolean = false;
  _ImpShopkeeper(): this {
    this._Shopkeeper();
    this.spriteClass = $J.cls(ImpSprite);
    this.seenBefore = false;
    return this;
  }
  act(): boolean {
    if (!this.seenBefore && Dungeon.level.heroFOV[this.pos]) {
      if (Dungeon.hero.buff($J.cls(AscensionChallenge)) == null) {
        this.yell(Messages.get$Object$String$ObjectArr(this, 'greetings', [Messages.titleCase(Dungeon.hero.name())]));
      } else {
        this.yell(Messages.get$Object$String$ObjectArr(this, 'greetings_ascent', [Messages.titleCase(Dungeon.hero.name())]));
      }
      this.seenBefore = true;
    }
    return super.act();
  }
}

$J.define(ImpShopkeeper, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.ImpShopkeeper', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Shopkeeper', ctors: { '': '_ImpShopkeeper' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  AscensionChallenge = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AscensionChallenge');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ImpSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ImpSprite');
});
