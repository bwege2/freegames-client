// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/journal/DocumentPage.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Document, GameScene, ItemSpriteSheet, WndJournal, WndJournal$AlchemyTab, WndJournal$CatalogTab, Sample;

export class DocumentPage extends Item {
  page: string = null;
  static readonly PAGE: string = 'page';
  _DocumentPage(): this {
    this._Item();
    this.image_ = ItemSpriteSheet.MASTERY;
    return this;
  }
  page$String(page: string): void {
    this.page = page;
  }
  page$(): string {
    return this.page;
  }
  doPickUp$Hero$int(hero: Hero, pos: number): boolean {
    GameScene.pickUpJournal(this, pos);
    GameScene.flashForDocument(this.document(), this.page$());
    if (this.document() === Document.ADVENTURERS_GUIDE) {
      WndJournal.last_index = 1;
    } else if (this.document() === Document.ALCHEMY_GUIDE) {
      WndJournal.last_index = 2;
      WndJournal$AlchemyTab.currentPageIdx = this.document().pageIdx(this.page$());
    } else if (this.document().isLoreDoc()) {
      WndJournal.last_index = 3;
      WndJournal$CatalogTab.currentItemIdx = 3;
    }
    this.document().findPage$String(this.page);
    Sample.INSTANCE.play$Object(Assets$Sounds.ITEM);
    hero.spendAndNext(this.pickupDelay());
    return true;
  }
  isUpgradable(): boolean {
    return false;
  }
  isIdentified(): boolean {
    return true;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$String(DocumentPage.PAGE, this.page$());
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.page = bundle.getString(DocumentPage.PAGE);
  }
}

$J.define(DocumentPage, 'com.shatteredpixel.shatteredpixeldungeon.items.journal.DocumentPage', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_DocumentPage' }, meths: { 'doPickUp(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,int)': 'doPickUp$Hero$int', 'page()': 'page$', 'page(java.lang.String)': 'page$String' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Document = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Document');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  WndJournal = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndJournal');
  WndJournal$AlchemyTab = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndJournal$AlchemyTab');
  WndJournal$CatalogTab = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndJournal$CatalogTab');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
