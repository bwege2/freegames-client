// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/potions/exotic/PotionOfCleansing.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { ExoticPotion } from './ExoticPotion.ts';
import { FlavourBuff } from '../../../actors/buffs/FlavourBuff.ts';

let Assets$Sounds, Dungeon, Actor, AllyBuff, Buff, Buff$buffType, Hunger, LostInventory, Flare, Item, ItemSpriteSheet$Icons, BuffIndicator, Sample;

export class PotionOfCleansing extends ExoticPotion {
  _PotionOfCleansing(): this {
    this._ExoticPotion();
    this.icon_ = ItemSpriteSheet$Icons.POTION_CLEANSE;
    return this;
  }
  apply(hero: Hero): void {
    this.identify$();
    PotionOfCleansing.cleanse$Char(hero);
    new Flare()._Flare(6, 32).color$int$boolean(16731346, true).show$Visual$float(Item.curUser.sprite_, 2);
  }
  shatter(cell: number): void {
    if (Actor.findChar(cell) == null) {
      super.shatter(cell);
    } else {
      this.splash(cell);
      if (Dungeon.level.heroFOV[cell]) {
        Sample.INSTANCE.play$Object(Assets$Sounds.SHATTER);
        this.identify$();
      }
      if (Actor.findChar(cell) != null) {
        PotionOfCleansing.cleanse$Char(Actor.findChar(cell));
      }
    }
  }
  static cleanse$Char(ch: Char): void {
    PotionOfCleansing.cleanse$Char$float(ch, PotionOfCleansing$Cleanse.DURATION);
  }
  static cleanse$Char$float(ch: Char, duration: number): void {
    for (const $it0 = ch.buffs$().iterator(); $it0.hasNext(); ) {
      let b = $it0.next();
      if (b.type_ === Buff$buffType.NEGATIVE && !(b instanceof AllyBuff) && !(b instanceof LostInventory)) {
        b.detach();
      }
      if (b instanceof Hunger) {
        (b).satisfy(Hunger.STARVING);
      }
    }
    Buff.prolong(ch, $J.cls(PotionOfCleansing$Cleanse), duration);
  }
}

export class PotionOfCleansing$Cleanse extends FlavourBuff {
  static readonly DURATION: number = 5;
  _PotionOfCleansing$Cleanse(): this {
    this._FlavourBuff();
    this.type_ = Buff$buffType.POSITIVE;
    return this;
  }
  icon(): number {
    return BuffIndicator.IMMUNITY;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(1, 0, 2);
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(PotionOfCleansing$Cleanse.DURATION - this.visualcooldown())) / PotionOfCleansing$Cleanse.DURATION));
  }
}

$J.define(PotionOfCleansing, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfCleansing', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.ExoticPotion', ctors: { '': '_PotionOfCleansing' }, meths: { 'cleanse(com.shatteredpixel.shatteredpixeldungeon.actors.Char,float)': 'cleanse$Char$float', 'cleanse(com.shatteredpixel.shatteredpixeldungeon.actors.Char)': 'cleanse$Char' } });
$J.define(PotionOfCleansing$Cleanse, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfCleansing$Cleanse', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_PotionOfCleansing$Cleanse' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  AllyBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AllyBuff');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Hunger = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Hunger');
  LostInventory = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.LostInventory');
  Flare = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Flare');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  ItemSpriteSheet$Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
