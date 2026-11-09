// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/scrolls/ScrollOfRecharging.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Buff, Recharging, SpellSprite, EnergyParticle, Item, Messages, ItemSpriteSheet$Icons, GLog, Sample;

export class ScrollOfRecharging extends Scroll {
  _ScrollOfRecharging(): this {
    this._Scroll();
    this.icon_ = ItemSpriteSheet$Icons.SCROLL_RECHARGE;
    return this;
  }
  doRead(): void {
    this.detach(Item.curUser.belongings.backpack);
    Buff.affect$Char$Class$float(Item.curUser, $J.cls(Recharging), Recharging.DURATION);
    ScrollOfRecharging.charge(Item.curUser);
    Sample.INSTANCE.play$Object(Assets$Sounds.READ);
    Sample.INSTANCE.play$Object(Assets$Sounds.CHARGEUP);
    GLog.i(Messages.get$Object$String$ObjectArr(this, 'surge', []), []);
    SpellSprite.show$Char$int(Item.curUser, SpellSprite.CHARGE);
    this.identify$();
    this.readAnimation();
  }
  static charge(user: Char): void {
    if (user.sprite_ != null) {
      let e = user.sprite_.centerEmitter();
      if (e != null) {
        e.burst(EnergyParticle.FACTORY, 15);
      }
    }
  }
  value(): number {
    return this.isKnown() ? Math.imul(30, this.quantity) : super.value();
  }
}

$J.define(ScrollOfRecharging, 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRecharging', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.Scroll', ctors: { '': '_ScrollOfRecharging' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Recharging = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Recharging');
  SpellSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.SpellSprite');
  EnergyParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.EnergyParticle');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet$Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
