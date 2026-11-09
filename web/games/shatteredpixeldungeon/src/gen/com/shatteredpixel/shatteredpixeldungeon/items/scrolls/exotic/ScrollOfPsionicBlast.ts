// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/scrolls/exotic/ScrollOfPsionicBlast.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../../jre/index.ts';
import { ExoticScroll } from './ExoticScroll.ts';

let Assets$Sounds, Badges, Dungeon, Blindness, Buff, Weakness, Item, ScrollOfRetribution, Messages, GameScene, ItemSpriteSheet$Icons, GLog, Sample;

export class ScrollOfPsionicBlast extends ExoticScroll {
  _ScrollOfPsionicBlast(): this {
    this._ExoticScroll();
    this.icon_ = ItemSpriteSheet$Icons.SCROLL_PSIBLAST;
    return this;
  }
  doRead(): void {
    this.detach(Item.curUser.belongings.backpack);
    GameScene.flash$int(-2130706433);
    Sample.INSTANCE.play$Object(Assets$Sounds.BLAST);
    GLog.i(Messages.get$Class$String$ObjectArr($J.cls(ScrollOfRetribution), 'blast', []), []);
    let targets = new ArrayList();
    for (let mob of $J.toArrayInto(Dungeon.level.mobs.toArray(), $J.newArray(0, null))) {
      if (Dungeon.level.heroFOV[mob.pos]) {
        targets.add(mob);
      }
    }
    for (const $it0 = targets.iterator(); $it0.hasNext(); ) {
      let mob = $it0.next();
      mob.damage($J.roundf(Math.fround(Math.fround(mob.HT / 2) + Math.fround(mob.HP / 2))), this);
      if (mob.isAlive()) {
        Buff.prolong(mob, $J.cls(Blindness), Blindness.DURATION);
      }
    }
    Item.curUser.damage(Math.max(0, $J.roundf(Math.fround(Item.curUser.HT * (Math.fround(0.5 * Math.fround($J.pow(0.9, targets.size()))))))), this);
    if (Item.curUser.isAlive()) {
      Buff.prolong(Item.curUser, $J.cls(Blindness), Blindness.DURATION);
      Buff.prolong(Item.curUser, $J.cls(Weakness), Math.fround(Weakness.DURATION * 5));
      Dungeon.observe$();
      this.readAnimation();
    } else {
      Badges.validateDeathFromFriendlyMagic();
      Dungeon.fail(this);
      GLog.n(Messages.get$Object$String$ObjectArr(this, 'ondeath', []), []);
    }
    this.identify$();
  }
}

$J.define(ScrollOfPsionicBlast, 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfPsionicBlast', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ExoticScroll', ctors: { '': '_ScrollOfPsionicBlast' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Blindness = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Blindness');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Weakness = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Weakness');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  ScrollOfRetribution = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRetribution');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet$Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
