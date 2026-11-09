// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/journal/GuidePage.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { DocumentPage } from './DocumentPage.ts';

let Document, Messages, ItemSpriteSheet;

export class GuidePage extends DocumentPage {
  _GuidePage(): this {
    this._DocumentPage();
    this.image_ = ItemSpriteSheet.GUIDE_PAGE;
    return this;
  }
  document(): Document {
    return Document.ADVENTURERS_GUIDE;
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [this.document().pageTitle$String(this.page$())]);
  }
}

$J.define(GuidePage, 'com.shatteredpixel.shatteredpixeldungeon.items.journal.GuidePage', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.journal.DocumentPage', ctors: { '': '_GuidePage' } });
$J.module(() => {
  Document = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Document');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
