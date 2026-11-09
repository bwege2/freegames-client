// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/scrolls/exotic/ScrollOfPassage.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { ExoticScroll } from './ExoticScroll.ts';

let Dungeon, Item, ScrollOfTeleportation, Level, Messages, InterlevelScene, InterlevelScene$Mode, ItemSpriteSheet$Icons, GLog, Game;

export class ScrollOfPassage extends ExoticScroll {
  _ScrollOfPassage(): this {
    this._ExoticScroll();
    this.icon_ = ItemSpriteSheet$Icons.SCROLL_PASSAGE;
    return this;
  }
  doRead(): void {
    this.detach(Item.curUser.belongings.backpack);
    this.identify$();
    this.readAnimation();
    if (!Dungeon.interfloorTeleportAllowed()) {
      GLog.w(Messages.get$Class$String$ObjectArr($J.cls(ScrollOfTeleportation), 'no_tele', []), []);
      return;
    }
    Level.beforeTransition();
    InterlevelScene.mode = InterlevelScene$Mode.RETURN;
    InterlevelScene.returnDepth = Math.max(1, ((Dungeon.depth - 1 - ((Dungeon.depth - 2) | 0) % 5) | 0));
    InterlevelScene.returnBranch = 0;
    InterlevelScene.returnPos = -1;
    Game.switchScene$Class($J.cls(InterlevelScene));
  }
}

$J.define(ScrollOfPassage, 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfPassage', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ExoticScroll', ctors: { '': '_ScrollOfPassage' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  ScrollOfTeleportation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation');
  Level = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  InterlevelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene');
  InterlevelScene$Mode = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene$Mode');
  ItemSpriteSheet$Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Game = $J.load('com.watabou.noosa.Game');
});
