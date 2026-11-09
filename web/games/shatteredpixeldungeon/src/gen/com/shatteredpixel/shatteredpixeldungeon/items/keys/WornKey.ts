// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/keys/WornKey.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, IOException, JObject } from '../../../../../../jre/index.ts';
import { Key } from './Key.ts';

let Dungeon, SPDSettings, ItemSpriteSheet, WndSupportPrompt, Game;

export class WornKey extends Key {
  $init_WornKey() {
    this.image_ = ItemSpriteSheet.WORN_KEY;
  }
  _WornKey$(): this {
    this._WornKey$int(0);
    return this;
  }
  _WornKey$int(depth: number): this {
    this._Key();
    this.$init_WornKey();
    this.depth_ = depth;
    return this;
  }
  doPickUp$Hero$int(hero: Hero, pos: number): boolean {
    if (!SPDSettings.supportNagged$()) {
      try {
        Dungeon.saveAll();
        Game.runOnRenderThread(new (WornKey$1())().$o(this));
      } catch ($e0) {
        if ($J.isa($e0, IOException)) {
          let e = $J.exc($e0);
          Game.reportException(e);
        } else {
          throw $e0;
        }
      }
    }
    return super.doPickUp$Hero$int(hero, pos);
  }
}

let $WornKey$1: any = null;
/** An anonymous class (WornKey.java:55). */
function WornKey$1(): any {
  return $WornKey$1 ??= $J.local(class extends JObject {
    call(): void {
      Game.scene().add$Gizmo(new WndSupportPrompt()._WndSupportPrompt());
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.keys.WornKey$1', ['com.watabou.utils.Callback']);
}

$J.define(WornKey, 'com.shatteredpixel.shatteredpixeldungeon.items.keys.WornKey', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.keys.Key', ctors: { 'int': '_WornKey$int', '': '_WornKey$' }, meths: { 'doPickUp(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,int)': 'doPickUp$Hero$int' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  SPDSettings = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDSettings');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  WndSupportPrompt = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndSupportPrompt');
  Game = $J.load('com.watabou.noosa.Game');
});
