// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/scrolls/exotic/ScrollOfPrismaticImage.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Dungeon, Buff, PrismaticGuard, Stasis, PrismaticImage, FloatingText, Item, CharSprite, ItemSpriteSheet$Icons, Sample;

export class ScrollOfPrismaticImage extends ExoticScroll {
  _ScrollOfPrismaticImage(): this {
    this._ExoticScroll();
    this.icon_ = ItemSpriteSheet$Icons.SCROLL_PRISIMG;
    return this;
  }
  doRead(): void {
    this.detach(Item.curUser.belongings.backpack);
    let found = false;
    for (let m of $J.toArrayInto(Dungeon.level.mobs.toArray(), $J.newArray(0, null))) {
      if (m instanceof PrismaticImage) {
        found = true;
        m.HP = m.HT;
        m.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(m.HT), FloatingText.HEALING, []);
      }
    }
    if (!found) {
      if (Stasis.getStasisAlly() instanceof PrismaticImage) {
        found = true;
        Stasis.getStasisAlly().HP = Stasis.getStasisAlly().HT;
      }
    }
    if (!found) {
      Buff.affect$Char$Class(Item.curUser, $J.cls(PrismaticGuard)).set$int(PrismaticGuard.maxHP(Item.curUser));
    }
    this.identify$();
    Sample.INSTANCE.play$Object(Assets$Sounds.READ);
    this.readAnimation();
  }
}

$J.define(ScrollOfPrismaticImage, 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfPrismaticImage', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ExoticScroll', ctors: { '': '_ScrollOfPrismaticImage' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  PrismaticGuard = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.PrismaticGuard');
  Stasis = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Stasis');
  PrismaticImage = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.PrismaticImage');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  ItemSpriteSheet$Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
