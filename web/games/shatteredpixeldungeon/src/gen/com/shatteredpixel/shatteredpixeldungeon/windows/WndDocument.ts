// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndDocument.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../jre/index.ts';
import { Window } from '../ui/Window.ts';

let Messages, ScrollingListPane, ScrollingListPane$ListItem, WndStory, Game;

export class WndDocument extends Window {
  list: ScrollingListPane = null;
  _WndDocument(doc: Document): this {
    this._Window$();
    this.list = new ScrollingListPane()._ScrollingListPane();
    this.add$Gizmo(this.list);
    this.list.addTitle(Messages.titleCase(doc.title()));
    for (const $it0 = doc.pageNames().iterator(); $it0.hasNext(); ) {
      let page = $it0.next();
      let found = doc.isPageFound$String(page);
      let item = new (WndDocument$1())().$o(this).$c(found, doc, page)._ScrollingListPane$ListItem$Image$String$String(doc.pageSprite$(), null, found ? Messages.titleCase(doc.pageTitle$String(page)) : Messages.titleCase(Messages.get$Object$String$ObjectArr(this, 'missing', [])));
      if (!found) {
        item.hardlight(10066329);
        item.hardlightIcon(10066329);
      } else if (!doc.isPageRead$String(page)) {
        item.hardlight(Window.TITLE_COLOR);
      }
      this.list.addItem$ListItem(item);
    }
    this.resize(120, Math.min(144, $J.d2i(this.list.content().height())));
    this.list.setRect(0, 0, Math.fround(this.width_), Math.fround(this.height_));
    return this;
  }
}

let $WndDocument$1: any = null;
/** An anonymous class (WndDocument.java:46). */
function WndDocument$1(): any {
  return $WndDocument$1 ??= $J.local(class extends ScrollingListPane$ListItem {
    onClick(x: number, y: number): boolean {
      if (this.inside(x, y) && this.$cv_found) {
        Game.scene().addToFront(new WndStory()._WndStory$Image$String$String(this.$cv_doc.pageSprite$String(this.$cv_page), this.$cv_doc.pageTitle$String(this.$cv_page), this.$cv_doc.pageBody$String(this.$cv_page)));
        this.$cv_doc.readPage$String(this.$cv_page);
        this.hardlight(Window.WHITE);
        return true;
      } else {
        return false;
      }
    }
    $c($found, $doc, $page): this {
      this.$cv_found = $found; this.$cv_doc = $doc; this.$cv_page = $page;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndDocument$1', []);
}

$J.define(WndDocument, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndDocument', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.journal.Document': '_WndDocument' } });
$J.module(() => {
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ScrollingListPane = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ScrollingListPane');
  ScrollingListPane$ListItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ScrollingListPane$ListItem');
  WndStory = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndStory');
  Game = $J.load('com.watabou.noosa.Game');
});
