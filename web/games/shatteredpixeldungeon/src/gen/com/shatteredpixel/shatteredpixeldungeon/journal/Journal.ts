// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/journal/Journal.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, IOException, JObject } from '../../../../../jre/index.ts';

let Bestiary, Catalog, Document, Game, Bundle, FileUtils;

export class Journal extends JObject {
  static readonly JOURNAL_FILE: string = 'journal.dat';
  static loaded: boolean = false;
  static saveNeeded: boolean = false;
  _Journal(): this {
    return this;
  }
  static loadGlobal(): void {
    if (Journal.loaded) {
      return;
    }
    let bundle: Bundle;
    try {
      bundle = FileUtils.bundleFromFile(Journal.JOURNAL_FILE);
    } catch ($e0) {
      if ($J.isa($e0, IOException)) {
        let e = $J.exc($e0);
        bundle = new Bundle()._Bundle$();
      } else {
        throw $e0;
      }
    }
    Catalog.restore(bundle);
    Bestiary.restore(bundle);
    Document.restore(bundle);
    Journal.loaded = true;
  }
  static saveGlobal$(): void {
    Journal.saveGlobal$boolean(false);
  }
  static saveGlobal$boolean(force: boolean): void {
    if (!force && !Journal.saveNeeded) {
      return;
    }
    let bundle = new Bundle()._Bundle$();
    Catalog.store(bundle);
    Bestiary.store(bundle);
    Document.store(bundle);
    try {
      FileUtils.bundleToFile(Journal.JOURNAL_FILE, bundle);
      Journal.saveNeeded = false;
    } catch ($e1) {
      if ($J.isa($e1, IOException)) {
        let e = $J.exc($e1);
        Game.reportException(e);
      } else {
        throw $e1;
      }
    }
  }
  static $clinit() {
    Journal.loaded = false;
    Journal.saveNeeded = false;
  }
}

$J.define(Journal, 'com.shatteredpixel.shatteredpixeldungeon.journal.Journal', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Journal' }, meths: { 'saveGlobal(boolean)': 'saveGlobal$boolean', 'saveGlobal()': 'saveGlobal$' }, clinit: true, lazy: ['loaded', 'saveNeeded'] });
$J.module(() => {
  Bestiary = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Bestiary');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Document = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Document');
  Game = $J.load('com.watabou.noosa.Game');
  Bundle = $J.load('com.watabou.utils.Bundle');
  FileUtils = $J.load('com.watabou.utils.FileUtils');
});
