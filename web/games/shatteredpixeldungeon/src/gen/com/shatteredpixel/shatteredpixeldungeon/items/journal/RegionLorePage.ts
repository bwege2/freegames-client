// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/journal/RegionLorePage.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../../jre/index.ts';
import { DocumentPage } from './DocumentPage.ts';

let Document, ItemSpriteSheet;

export class RegionLorePage extends JObject {
  _RegionLorePage(): this {
    return this;
  }
  static pageForDoc(doc: Document): DocumentPage {
    switch (doc) {
      case Document.SEWERS_GUARD:
      default:
        return new RegionLorePage$Sewers()._RegionLorePage$Sewers();
      case Document.PRISON_WARDEN:
        return new RegionLorePage$Prison()._RegionLorePage$Prison();
      case Document.CAVES_EXPLORER:
        return new RegionLorePage$Caves()._RegionLorePage$Caves();
      case Document.CITY_WARLOCK:
        return new RegionLorePage$City()._RegionLorePage$City();
      case Document.HALLS_KING:
        return new RegionLorePage$Halls()._RegionLorePage$Halls();
    }
  }
}

export class RegionLorePage$Sewers extends DocumentPage {
  _RegionLorePage$Sewers(): this {
    this._DocumentPage();
    this.image_ = ItemSpriteSheet.SEWER_PAGE;
    return this;
  }
  document(): Document {
    return Document.SEWERS_GUARD;
  }
}

export class RegionLorePage$Prison extends DocumentPage {
  _RegionLorePage$Prison(): this {
    this._DocumentPage();
    this.image_ = ItemSpriteSheet.PRISON_PAGE;
    return this;
  }
  document(): Document {
    return Document.PRISON_WARDEN;
  }
}

export class RegionLorePage$Caves extends DocumentPage {
  _RegionLorePage$Caves(): this {
    this._DocumentPage();
    this.image_ = ItemSpriteSheet.CAVES_PAGE;
    return this;
  }
  document(): Document {
    return Document.CAVES_EXPLORER;
  }
}

export class RegionLorePage$City extends DocumentPage {
  _RegionLorePage$City(): this {
    this._DocumentPage();
    this.image_ = ItemSpriteSheet.CITY_PAGE;
    return this;
  }
  document(): Document {
    return Document.CITY_WARLOCK;
  }
}

export class RegionLorePage$Halls extends DocumentPage {
  _RegionLorePage$Halls(): this {
    this._DocumentPage();
    this.image_ = ItemSpriteSheet.HALLS_PAGE;
    return this;
  }
  document(): Document {
    return Document.HALLS_KING;
  }
}

$J.define(RegionLorePage, 'com.shatteredpixel.shatteredpixeldungeon.items.journal.RegionLorePage', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_RegionLorePage' } });
$J.define(RegionLorePage$Sewers, 'com.shatteredpixel.shatteredpixeldungeon.items.journal.RegionLorePage$Sewers', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.journal.DocumentPage', ctors: { '': '_RegionLorePage$Sewers' } });
$J.define(RegionLorePage$Prison, 'com.shatteredpixel.shatteredpixeldungeon.items.journal.RegionLorePage$Prison', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.journal.DocumentPage', ctors: { '': '_RegionLorePage$Prison' } });
$J.define(RegionLorePage$Caves, 'com.shatteredpixel.shatteredpixeldungeon.items.journal.RegionLorePage$Caves', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.journal.DocumentPage', ctors: { '': '_RegionLorePage$Caves' } });
$J.define(RegionLorePage$City, 'com.shatteredpixel.shatteredpixeldungeon.items.journal.RegionLorePage$City', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.journal.DocumentPage', ctors: { '': '_RegionLorePage$City' } });
$J.define(RegionLorePage$Halls, 'com.shatteredpixel.shatteredpixeldungeon.items.journal.RegionLorePage$Halls', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.journal.DocumentPage', ctors: { '': '_RegionLorePage$Halls' } });
$J.module(() => {
  Document = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Document');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
