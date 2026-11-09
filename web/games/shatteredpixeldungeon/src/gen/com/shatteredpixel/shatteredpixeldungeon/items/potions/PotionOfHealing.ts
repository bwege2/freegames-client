// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/potions/PotionOfHealing.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Potion } from './Potion.ts';

let Challenges, Dungeon, Bleeding, Blindness, Buff, Cripple, Drowsy, Healing, Poison, Slow, Vertigo, Vulnerable, Weakness, Messages, ItemSpriteSheet$Icons, GLog;

export class PotionOfHealing extends Potion {
  _PotionOfHealing(): this {
    this._Potion();
    this.icon_ = ItemSpriteSheet$Icons.POTION_HEALING;
    this.bones = true;
    return this;
  }
  apply(hero: Hero): void {
    this.identify$();
    PotionOfHealing.cure(hero);
    PotionOfHealing.heal(hero);
  }
  static heal(ch: Char): void {
    if (ch === Dungeon.hero && Dungeon.isChallenged(Challenges.NO_HEALING)) {
      PotionOfHealing.pharmacophobiaProc(Dungeon.hero);
    } else {
      let healing = Buff.affect$Char$Class(ch, $J.cls(Healing));
      healing.setHeal$int$float$int$boolean($J.d2i((Math.fround(Math.fround(Math.fround(0.8) * ch.HT) + 14))), 0.25, 0, true);
      if (ch === Dungeon.hero) {
        GLog.p(Messages.get$Class$String$ObjectArr($J.cls(PotionOfHealing), 'heal', []), []);
      }
    }
  }
  static pharmacophobiaProc(hero: Hero): void {
    Buff.affect$Char$Class(hero, $J.cls(Poison)).set(Math.fround((4 + $J.idiv(hero.lvl, 2)) | 0));
  }
  static cure(ch: Char): void {
    Buff.detach(ch, $J.cls(Poison));
    Buff.detach(ch, $J.cls(Cripple));
    Buff.detach(ch, $J.cls(Weakness));
    Buff.detach(ch, $J.cls(Vulnerable));
    Buff.detach(ch, $J.cls(Bleeding));
    Buff.detach(ch, $J.cls(Blindness));
    Buff.detach(ch, $J.cls(Drowsy));
    Buff.detach(ch, $J.cls(Slow));
    Buff.detach(ch, $J.cls(Vertigo));
  }
  value(): number {
    return this.isKnown() ? Math.imul(30, this.quantity) : super.value();
  }
}

$J.define(PotionOfHealing, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfHealing', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.potions.Potion', ctors: { '': '_PotionOfHealing' } });
$J.module(() => {
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Bleeding = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Bleeding');
  Blindness = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Blindness');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Cripple = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Cripple');
  Drowsy = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Drowsy');
  Healing = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Healing');
  Poison = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Poison');
  Slow = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Slow');
  Vertigo = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Vertigo');
  Vulnerable = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Vulnerable');
  Weakness = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Weakness');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet$Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
});
