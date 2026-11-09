// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/scrolls/ScrollOfMagicMapping.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Scroll } from './Scroll.ts';

let Assets$Sounds, Dungeon, CellEmitter, Speck, SpellSprite, Item, Terrain, Messages, GameScene, ItemSpriteSheet$Icons, GLog, Sample;

export class ScrollOfMagicMapping extends Scroll {
  _ScrollOfMagicMapping(): this {
    this._Scroll();
    this.icon_ = ItemSpriteSheet$Icons.SCROLL_MAGICMAP;
    return this;
  }
  doRead(): void {
    this.detach(Item.curUser.belongings.backpack);
    let length = Dungeon.level.length();
    let map = Dungeon.level.map_;
    let mapped = Dungeon.level.mapped;
    let discoverable = Dungeon.level.discoverable;
    let noticed = false;
    for (let i = 0; i < length; i++) {
      let terr = map[i];
      if (discoverable[i]) {
        mapped[i] = true;
        if ((Terrain.flags[terr] & Terrain.SECRET) !== 0) {
          Dungeon.level.discover(i);
          if (Dungeon.level.heroFOV[i]) {
            GameScene.discoverTile(i, terr);
            ScrollOfMagicMapping.discover(i);
            noticed = true;
          }
        }
      }
    }
    GameScene.updateFog$();
    GLog.i(Messages.get$Object$String$ObjectArr(this, 'layout', []), []);
    if (noticed) {
      Sample.INSTANCE.play$Object(Assets$Sounds.SECRET);
    }
    SpellSprite.show$Char$int(Item.curUser, SpellSprite.MAP);
    Sample.INSTANCE.play$Object(Assets$Sounds.READ);
    this.identify$();
    this.readAnimation();
  }
  value(): number {
    return this.isKnown() ? Math.imul(40, this.quantity) : super.value();
  }
  static discover(cell: number): void {
    CellEmitter.get(cell).start(Speck.factory$int(Speck.DISCOVER), Math.fround(0.1), 4);
  }
}

$J.define(ScrollOfMagicMapping, 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfMagicMapping', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.Scroll', ctors: { '': '_ScrollOfMagicMapping' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  SpellSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.SpellSprite');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet$Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
