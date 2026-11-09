// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/journal/Document.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JEnum, JString, LinkedHashMap } from '../../../../../jre/index.ts';

let Badges, ScrollOfIdentify, Journal, Messages, ItemSprite, ItemSpriteSheet, Icons, Bundle, DeviceCompat;

export class Document extends JEnum {
  static readonly NOT_FOUND: number = 0;
  static readonly FOUND: number = 1;
  static readonly READ: number = 2;
  pagesStates: LinkedHashMap<string, number> = null;
  pageSprite: number = 0;
  pageIcon: Icons = null;
  loreDocument: boolean = false;
  static readonly GUIDE_INTRO: string = 'Intro';
  static readonly GUIDE_EXAMINING: string = 'Examining';
  static readonly GUIDE_SURPRISE_ATKS: string = 'Surprise_Attacks';
  static readonly GUIDE_IDING: string = 'Identifying';
  static readonly GUIDE_FOOD: string = 'Food';
  static readonly GUIDE_ALCHEMY: string = 'Alchemy';
  static readonly GUIDE_DIEING: string = 'Dieing';
  static readonly GUIDE_SEARCHING: string = 'Searching';
  static readonly KING_ATTRITION: string = 'attrition';
  static readonly DOCUMENTS: string = 'documents';
  static ADVENTURERS_GUIDE: Document = null;
  static ALCHEMY_GUIDE: Document = null;
  static INTROS: Document = null;
  static SEWERS_GUARD: Document = null;
  static PRISON_WARDEN: Document = null;
  static CAVES_EXPLORER: Document = null;
  static CITY_WARLOCK: Document = null;
  static HALLS_KING: Document = null;
  static $VALUES: Document[] = null;
  $init_Document() {
    this.pagesStates = new LinkedHashMap();
  }
  _Document$int$boolean($name: string, $ordinal: number, sprite: number, lore: boolean): this {
    this._JEnum($name, $ordinal);
    this.$init_Document();
    this.pageIcon = null;
    this.pageSprite = sprite;
    this.loreDocument = lore;
    return this;
  }
  _Document$Icons$boolean($name: string, $ordinal: number, icon: Icons, lore: boolean): this {
    this._JEnum($name, $ordinal);
    this.$init_Document();
    this.pageIcon = icon;
    this.pageSprite = 0;
    this.loreDocument = lore;
    return this;
  }
  findPage$String(page: string): boolean {
    if (this.pagesStates.containsKey(page) && this.pagesStates.get(page) === Document.NOT_FOUND) {
      this.pagesStates.put(page, Document.FOUND);
      Journal.saveNeeded = true;
      Badges.validateCatalogBadges();
      return true;
    }
    return false;
  }
  findPage$int(pageIdx: number): boolean {
    return this.findPage$String($J.toArrayInto(this.pagesStates.keySet().toArray(), $J.newArray(0, null))[pageIdx]);
  }
  deletePage$String(page: string): boolean {
    if (this.pagesStates.containsKey(page) && this.pagesStates.get(page) !== Document.NOT_FOUND) {
      this.pagesStates.put(page, Document.NOT_FOUND);
      Journal.saveNeeded = true;
      return true;
    }
    return false;
  }
  deletePage$int(pageIdx: number): boolean {
    return this.deletePage$String($J.toArrayInto(this.pagesStates.keySet().toArray(), $J.newArray(0, null))[pageIdx]);
  }
  unreadPage$String(page: string): boolean {
    if (this.pagesStates.containsKey(page) && this.pagesStates.get(page) === Document.READ) {
      this.pagesStates.put(page, Document.FOUND);
      Journal.saveNeeded = true;
      return true;
    }
    return false;
  }
  unreadPage$int(pageIdx: number): boolean {
    return this.deletePage$String($J.toArrayInto(this.pagesStates.keySet().toArray(), $J.newArray(0, null))[pageIdx]);
  }
  isPageFound$String(page: string): boolean {
    return this.pagesStates.containsKey(page) && this.pagesStates.get(page) > Document.NOT_FOUND;
  }
  isPageFound$int(pageIdx: number): boolean {
    return this.isPageFound$String($J.toArrayInto(this.pagesStates.keySet().toArray(), $J.newArray(0, null))[pageIdx]);
  }
  anyPagesFound(): boolean {
    for (const $it0 = this.pagesStates.values().iterator(); $it0.hasNext(); ) {
      let val = $it0.next();
      if (val !== Document.NOT_FOUND) {
        return true;
      }
    }
    return false;
  }
  allPagesFound(): boolean {
    for (const $it1 = this.pagesStates.values().iterator(); $it1.hasNext(); ) {
      let val = $it1.next();
      if (val === Document.NOT_FOUND) {
        return false;
      }
    }
    return true;
  }
  readPage$String(page: string): boolean {
    if (this.pagesStates.containsKey(page)) {
      this.pagesStates.put(page, Document.READ);
      Journal.saveNeeded = true;
      Badges.validateCatalogBadges();
      return true;
    }
    return false;
  }
  readPage$int(pageIdx: number): boolean {
    return this.readPage$String($J.toArrayInto(this.pagesStates.keySet().toArray(), $J.newArray(0, null))[pageIdx]);
  }
  isPageRead$String(page: string): boolean {
    return this.pagesStates.containsKey(page) && this.pagesStates.get(page) === Document.READ;
  }
  isPageRead$int(pageIdx: number): boolean {
    return this.isPageRead$String($J.toArrayInto(this.pagesStates.keySet().toArray(), $J.newArray(0, null))[pageIdx]);
  }
  pageNames(): Collection<string> {
    return this.pagesStates.keySet();
  }
  pageIdx(name: string): number {
    let i = 0;
    for (const $it2 = this.pagesStates.keySet().iterator(); $it2.hasNext(); ) {
      let page = $it2.next();
      if ($J.equals(page, name)) {
        return i;
      }
      i++;
    }
    return -1;
  }
  pageSprite$(): Image {
    return this.pageSprite$String('');
  }
  pageSprite$String(page: string): Image {
    if ((page.length === 0) || !this.isPageFound$String(page) || this !== Document.ADVENTURERS_GUIDE) {
      if (this.pageIcon != null) {
        return Icons.get$Icons(this.pageIcon);
      } else {
        return new ItemSprite()._ItemSprite$int(this.pageSprite);
      }
    } else {
      switch (page) {
        case Document.GUIDE_INTRO:
        default:
          return new ItemSprite()._ItemSprite$int(ItemSpriteSheet.MASTERY);
        case 'Examining':
          return Icons.get$Icons(Icons.MAGNIFY);
        case 'Surprise_Attacks':
          return Icons.get$Icons(Icons.SNAKE);
        case 'Identifying':
          return new ItemSprite()._ItemSprite$Item(new ScrollOfIdentify()._ScrollOfIdentify());
        case 'Food':
          return new ItemSprite()._ItemSprite$int(ItemSpriteSheet.PASTY);
        case 'Alchemy':
          return new ItemSprite()._ItemSprite$int(ItemSpriteSheet.TRINKET_CATA);
        case 'Dieing':
          return new ItemSprite()._ItemSprite$int(ItemSpriteSheet.TOMB);
        case Document.GUIDE_SEARCHING:
          return Icons.get$Icons(Icons.MAGNIFY);
        case 'Strength':
          return new ItemSprite()._ItemSprite$int(ItemSpriteSheet.GREATAXE);
        case 'Upgrades':
          return new ItemSprite()._ItemSprite$int(ItemSpriteSheet.RING_EMERALD);
        case 'Looting':
          return new ItemSprite()._ItemSprite$int(ItemSpriteSheet.CRYSTAL_KEY);
        case 'Levelling':
          return Icons.get$Icons(Icons.TALENT);
        case 'Positioning':
          return new ItemSprite()._ItemSprite$int(ItemSpriteSheet.SPIRIT_BOW);
        case 'Magic':
          return new ItemSprite()._ItemSprite$int(ItemSpriteSheet.WAND_FIREBOLT);
      }
    }
  }
  isLoreDoc(): boolean {
    return this.loreDocument;
  }
  title(): string {
    return Messages.get$Object$String$ObjectArr(this, this.name() + '.title', []);
  }
  discoverHint(): string {
    return Messages.get$Object$String$ObjectArr(this, this.name() + '.discover_hint', []);
  }
  pageTitle$String(page: string): string {
    return Messages.get$Object$String$ObjectArr(this, this.name() + '.' + page + '.title', []);
  }
  pageTitle$int(pageIdx: number): string {
    return this.pageTitle$String($J.toArrayInto(this.pagesStates.keySet().toArray(), $J.newArray(0, null))[pageIdx]);
  }
  pageBody$String(page: string): string {
    return Messages.get$Object$String$ObjectArr(this, this.name() + '.' + page + '.body', []);
  }
  pageBody$int(pageIdx: number): string {
    return this.pageBody$String($J.toArrayInto(this.pagesStates.keySet().toArray(), $J.newArray(0, null))[pageIdx]);
  }
  static store(bundle: Bundle): void {
    let docsBundle = new Bundle()._Bundle$();
    for (let doc of Document.values()) {
      let pagesBundle = new Bundle()._Bundle$();
      let empty = true;
      for (const $it3 = doc.pageNames().iterator(); $it3.hasNext(); ) {
        let page = $it3.next();
        if (doc.pagesStates.get(page) !== Document.NOT_FOUND) {
          pagesBundle.put$String$int(page, doc.pagesStates.get(page));
          empty = false;
        }
      }
      if (!empty) {
        docsBundle.put$String$Bundle(doc.name(), pagesBundle);
      }
    }
    bundle.put$String$Bundle(Document.DOCUMENTS, docsBundle);
  }
  static restore(bundle: Bundle): void {
    if (!bundle.contains(Document.DOCUMENTS)) {
      return;
    }
    let docsBundle = bundle.getBundle(Document.DOCUMENTS);
    for (let doc of Document.values()) {
      if (docsBundle.contains(doc.name())) {
        let pagesBundle = docsBundle.getBundle(doc.name());
        for (const $it4 = doc.pageNames().iterator(); $it4.hasNext(); ) {
          let page = $it4.next();
          if (pagesBundle.contains(page)) {
            doc.pagesStates.put(page, pagesBundle.getInt(page));
          }
        }
      }
    }
  }
  static values(): Document[] { return Document.$VALUES.slice(); }
  static valueOf(name: string): Document { return $J.enumValueOf(Document, name); }
  static $clinit() {
    Document.ADVENTURERS_GUIDE = new Document()._Document$int$boolean('ADVENTURERS_GUIDE', 0, ItemSpriteSheet.GUIDE_PAGE, false);
    Document.ALCHEMY_GUIDE = new Document()._Document$int$boolean('ALCHEMY_GUIDE', 1, ItemSpriteSheet.ALCH_PAGE, false);
    Document.INTROS = new Document()._Document$Icons$boolean('INTROS', 2, Icons.STAIRS, true);
    Document.SEWERS_GUARD = new Document()._Document$int$boolean('SEWERS_GUARD', 3, ItemSpriteSheet.SEWER_PAGE, true);
    Document.PRISON_WARDEN = new Document()._Document$int$boolean('PRISON_WARDEN', 4, ItemSpriteSheet.PRISON_PAGE, true);
    Document.CAVES_EXPLORER = new Document()._Document$int$boolean('CAVES_EXPLORER', 5, ItemSpriteSheet.CAVES_PAGE, true);
    Document.CITY_WARLOCK = new Document()._Document$int$boolean('CITY_WARLOCK', 6, ItemSpriteSheet.CITY_PAGE, true);
    Document.HALLS_KING = new Document()._Document$int$boolean('HALLS_KING', 7, ItemSpriteSheet.HALLS_PAGE, true);
    Document.$VALUES = [Document.ADVENTURERS_GUIDE, Document.ALCHEMY_GUIDE, Document.INTROS, Document.SEWERS_GUARD, Document.PRISON_WARDEN, Document.CAVES_EXPLORER, Document.CITY_WARLOCK, Document.HALLS_KING];
    let debug = DeviceCompat.isDebug();
    Document.ADVENTURERS_GUIDE.pagesStates.put(Document.GUIDE_INTRO, debug ? Document.READ : Document.NOT_FOUND);
    Document.ADVENTURERS_GUIDE.pagesStates.put(Document.GUIDE_EXAMINING, debug ? Document.READ : Document.NOT_FOUND);
    Document.ADVENTURERS_GUIDE.pagesStates.put(Document.GUIDE_SURPRISE_ATKS, debug ? Document.READ : Document.NOT_FOUND);
    Document.ADVENTURERS_GUIDE.pagesStates.put(Document.GUIDE_IDING, debug ? Document.READ : Document.NOT_FOUND);
    Document.ADVENTURERS_GUIDE.pagesStates.put(Document.GUIDE_FOOD, debug ? Document.READ : Document.NOT_FOUND);
    Document.ADVENTURERS_GUIDE.pagesStates.put(Document.GUIDE_ALCHEMY, debug ? Document.READ : Document.NOT_FOUND);
    Document.ADVENTURERS_GUIDE.pagesStates.put(Document.GUIDE_DIEING, debug ? Document.READ : Document.NOT_FOUND);
    Document.ADVENTURERS_GUIDE.pagesStates.put(Document.GUIDE_SEARCHING, debug ? Document.READ : Document.NOT_FOUND);
    Document.ADVENTURERS_GUIDE.pagesStates.put('Strength', debug ? Document.READ : Document.NOT_FOUND);
    Document.ADVENTURERS_GUIDE.pagesStates.put('Upgrades', debug ? Document.READ : Document.NOT_FOUND);
    Document.ADVENTURERS_GUIDE.pagesStates.put('Looting', debug ? Document.READ : Document.NOT_FOUND);
    Document.ADVENTURERS_GUIDE.pagesStates.put('Levelling', debug ? Document.READ : Document.NOT_FOUND);
    Document.ADVENTURERS_GUIDE.pagesStates.put('Positioning', debug ? Document.READ : Document.NOT_FOUND);
    Document.ADVENTURERS_GUIDE.pagesStates.put('Magic', debug ? Document.READ : Document.NOT_FOUND);
    Document.ALCHEMY_GUIDE.pagesStates.put('Potions', debug ? Document.READ : Document.NOT_FOUND);
    Document.ALCHEMY_GUIDE.pagesStates.put('Stones', debug ? Document.READ : Document.NOT_FOUND);
    Document.ALCHEMY_GUIDE.pagesStates.put('Energy_Food', debug ? Document.READ : Document.NOT_FOUND);
    Document.ALCHEMY_GUIDE.pagesStates.put('Exotic_Potions', debug ? Document.READ : Document.NOT_FOUND);
    Document.ALCHEMY_GUIDE.pagesStates.put('Exotic_Scrolls', debug ? Document.READ : Document.NOT_FOUND);
    Document.ALCHEMY_GUIDE.pagesStates.put('Bombs', debug ? Document.READ : Document.NOT_FOUND);
    Document.ALCHEMY_GUIDE.pagesStates.put('Weapons', debug ? Document.READ : Document.NOT_FOUND);
    Document.ALCHEMY_GUIDE.pagesStates.put('Brews_Elixirs', debug ? Document.READ : Document.NOT_FOUND);
    Document.ALCHEMY_GUIDE.pagesStates.put('Spells', debug ? Document.READ : Document.NOT_FOUND);
    Document.INTROS.pagesStates.put('Dungeon', Document.READ);
    Document.INTROS.pagesStates.put('Sewers', debug ? Document.READ : Document.NOT_FOUND);
    Document.INTROS.pagesStates.put('Prison', debug ? Document.READ : Document.NOT_FOUND);
    Document.INTROS.pagesStates.put('Caves', debug ? Document.READ : Document.NOT_FOUND);
    Document.INTROS.pagesStates.put('City', debug ? Document.READ : Document.NOT_FOUND);
    Document.INTROS.pagesStates.put('Halls', debug ? Document.READ : Document.NOT_FOUND);
    Document.SEWERS_GUARD.pagesStates.put('new_position', debug ? Document.READ : Document.NOT_FOUND);
    Document.SEWERS_GUARD.pagesStates.put('dangerous', debug ? Document.READ : Document.NOT_FOUND);
    Document.SEWERS_GUARD.pagesStates.put('crabs', debug ? Document.READ : Document.NOT_FOUND);
    Document.SEWERS_GUARD.pagesStates.put('guild', debug ? Document.READ : Document.NOT_FOUND);
    Document.SEWERS_GUARD.pagesStates.put('lost', debug ? Document.READ : Document.NOT_FOUND);
    Document.SEWERS_GUARD.pagesStates.put('not_worth', debug ? Document.READ : Document.NOT_FOUND);
    Document.PRISON_WARDEN.pagesStates.put('journal', debug ? Document.READ : Document.NOT_FOUND);
    Document.PRISON_WARDEN.pagesStates.put('recruits', debug ? Document.READ : Document.NOT_FOUND);
    Document.PRISON_WARDEN.pagesStates.put('mines', debug ? Document.READ : Document.NOT_FOUND);
    Document.PRISON_WARDEN.pagesStates.put('rotberry', debug ? Document.READ : Document.NOT_FOUND);
    Document.PRISON_WARDEN.pagesStates.put('no_support', debug ? Document.READ : Document.NOT_FOUND);
    Document.PRISON_WARDEN.pagesStates.put('letter', debug ? Document.READ : Document.NOT_FOUND);
    Document.CAVES_EXPLORER.pagesStates.put('expedition', debug ? Document.READ : Document.NOT_FOUND);
    Document.CAVES_EXPLORER.pagesStates.put('gold', debug ? Document.READ : Document.NOT_FOUND);
    Document.CAVES_EXPLORER.pagesStates.put('troll', debug ? Document.READ : Document.NOT_FOUND);
    Document.CAVES_EXPLORER.pagesStates.put('city', debug ? Document.READ : Document.NOT_FOUND);
    Document.CAVES_EXPLORER.pagesStates.put('alive', debug ? Document.READ : Document.NOT_FOUND);
    Document.CAVES_EXPLORER.pagesStates.put('report', debug ? Document.READ : Document.NOT_FOUND);
    Document.CITY_WARLOCK.pagesStates.put('old_king', debug ? Document.READ : Document.NOT_FOUND);
    Document.CITY_WARLOCK.pagesStates.put('resistance', debug ? Document.READ : Document.NOT_FOUND);
    Document.CITY_WARLOCK.pagesStates.put('failure', debug ? Document.READ : Document.NOT_FOUND);
    Document.CITY_WARLOCK.pagesStates.put('more_powerful', debug ? Document.READ : Document.NOT_FOUND);
    Document.CITY_WARLOCK.pagesStates.put('new_power', debug ? Document.READ : Document.NOT_FOUND);
    Document.CITY_WARLOCK.pagesStates.put('seen_it', debug ? Document.READ : Document.NOT_FOUND);
    Document.HALLS_KING.pagesStates.put('Rejection', debug ? Document.READ : Document.NOT_FOUND);
    Document.HALLS_KING.pagesStates.put('amulet', debug ? Document.READ : Document.NOT_FOUND);
    Document.HALLS_KING.pagesStates.put('ritual', debug ? Document.READ : Document.NOT_FOUND);
    Document.HALLS_KING.pagesStates.put('new_king', debug ? Document.READ : Document.NOT_FOUND);
    Document.HALLS_KING.pagesStates.put('thing', debug ? Document.READ : Document.NOT_FOUND);
    Document.HALLS_KING.pagesStates.put(Document.KING_ATTRITION, debug ? Document.NOT_FOUND : Document.NOT_FOUND);
  }
}

$J.define(Document, 'com.shatteredpixel.shatteredpixeldungeon.journal.Document', { kind: 'enum', sup: 'java.lang.Enum', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.ui.Icons,boolean': '_Document$Icons$boolean', 'int,boolean': '_Document$int$boolean' }, meths: { 'pageBody(int)': 'pageBody$int', 'pageBody(java.lang.String)': 'pageBody$String', 'pageTitle(int)': 'pageTitle$int', 'pageTitle(java.lang.String)': 'pageTitle$String', 'pageSprite(java.lang.String)': 'pageSprite$String', 'pageSprite()': 'pageSprite$', 'isPageRead(int)': 'isPageRead$int', 'isPageRead(java.lang.String)': 'isPageRead$String', 'readPage(int)': 'readPage$int', 'readPage(java.lang.String)': 'readPage$String', 'isPageFound(int)': 'isPageFound$int', 'isPageFound(java.lang.String)': 'isPageFound$String', 'unreadPage(int)': 'unreadPage$int', 'unreadPage(java.lang.String)': 'unreadPage$String', 'deletePage(int)': 'deletePage$int', 'deletePage(java.lang.String)': 'deletePage$String', 'findPage(int)': 'findPage$int', 'findPage(java.lang.String)': 'findPage$String' }, clinit: true, lazy: ['$VALUES', 'ADVENTURERS_GUIDE', 'ALCHEMY_GUIDE', 'INTROS', 'SEWERS_GUARD', 'PRISON_WARDEN', 'CAVES_EXPLORER', 'CITY_WARLOCK', 'HALLS_KING'] });
$J.module(() => {
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  ScrollOfIdentify = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfIdentify');
  Journal = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Journal');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  Bundle = $J.load('com.watabou.utils.Bundle');
  DeviceCompat = $J.load('com.watabou.utils.DeviceCompat');
});
