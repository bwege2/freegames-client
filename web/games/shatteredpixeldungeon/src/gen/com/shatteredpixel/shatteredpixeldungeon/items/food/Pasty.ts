// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/food/Pasty.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Food } from './Food.ts';

let Assets$Sounds, Dungeon, Actor, Char, Char$Alignment, Char$Property, ArtifactRecharge, Barrier, Buff, Charm, Hunger, FloatingText, RainbowParticle, PotionOfExperience, ScrollOfRecharging, Messages, CharSprite, ItemSpriteSheet, TargetHealthIndicator, Holiday, Sample;

export class Pasty extends Food {
  _Pasty(): this {
    this._Food();
    this.reset();
    this.energy = Hunger.STARVING;
    this.bones = true;
    return this;
  }
  reset(): void {
    super.reset();
    switch (Holiday.getCurrentHoliday()) {
      case Holiday.NONE:
      default:
        this.image_ = ItemSpriteSheet.PASTY;
        break;
      case Holiday.LUNAR_NEW_YEAR:
        this.image_ = ItemSpriteSheet.STEAMED_FISH;
        break;
      case Holiday.APRIL_FOOLS:
        this.image_ = ItemSpriteSheet.CHOC_AMULET;
        break;
      case Holiday.EASTER:
        this.image_ = ItemSpriteSheet.EASTER_EGG;
        break;
      case Holiday.PRIDE:
        this.image_ = ItemSpriteSheet.RAINBOW_POTION;
        break;
      case Holiday.SHATTEREDPD_BIRTHDAY:
        this.image_ = ItemSpriteSheet.SHATTERED_CAKE;
        break;
      case Holiday.HALLOWEEN:
        this.image_ = ItemSpriteSheet.PUMPKIN_PIE;
        break;
      case Holiday.PD_BIRTHDAY:
        this.image_ = ItemSpriteSheet.VANILLA_CAKE;
        break;
      case Holiday.WINTER_HOLIDAYS:
        this.image_ = ItemSpriteSheet.CANDY_CANE;
        break;
      case Holiday.NEW_YEARS:
        this.image_ = ItemSpriteSheet.SPARKLING_POTION;
        break;
    }
  }
  eatSFX(): void {
    switch (Holiday.getCurrentHoliday()) {
      case Holiday.PRIDE:
      case Holiday.NEW_YEARS:
        Sample.INSTANCE.play$Object(Assets$Sounds.DRINK);
        return;
    }
    super.eatSFX();
  }
  satisfy(hero: Hero): void {
    if (Holiday.getCurrentHoliday() === Holiday.LUNAR_NEW_YEAR) {
      this.energy = Hunger.HUNGRY;
    }
    super.satisfy(hero);
    {
      let left: Pasty$FishLeftover, target: Char, expToGive: number, toHeal: number, toShield: number;
      switch (Holiday.getCurrentHoliday()) {
        default:
          break;
        case Holiday.LUNAR_NEW_YEAR:
          left = new Pasty$FishLeftover()._Pasty$FishLeftover();
          if (!left.collect$()) {
            Dungeon.level.drop(left, hero.pos).sprite_.drop$();
          }
          break;
        case Holiday.APRIL_FOOLS:
          Sample.INSTANCE.play$Object(Assets$Sounds.MIMIC);
        case Holiday.EASTER:
          ArtifactRecharge.chargeArtifacts(hero, 2);
          ScrollOfRecharging.charge(hero);
          break;
        case Holiday.PRIDE:
          target = null;
          for (const $it0 = Actor.chars().iterator(); $it0.hasNext(); ) {
            let ch = $it0.next();
            if (!Char.hasProp(ch, Char$Property.BOSS) && !Char.hasProp(ch, Char$Property.MINIBOSS) && ch.alignment === Char$Alignment.ENEMY && Dungeon.level.adjacent(hero.pos, ch.pos)) {
              if (target == null || ch === TargetHealthIndicator.instance.target$()) {
                target = ch;
              }
            }
          }
          if (target != null) {
            Buff.affect$Char$Class$float(target, $J.cls(Charm), 5).object = hero.id();
          }
          hero.sprite_.emitter().burst(RainbowParticle.BURST, 15);
          break;
        case Holiday.SHATTEREDPD_BIRTHDAY:
        case Holiday.PD_BIRTHDAY:
          expToGive = Math.max(2, $J.idiv(hero.maxExp(), 10));
          hero.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(expToGive), FloatingText.EXPERIENCE, []);
          hero.earnExp(expToGive, $J.cls(PotionOfExperience));
          break;
        case Holiday.HALLOWEEN:
          toHeal = Math.max(3, $J.idiv(hero.HT, 20));
          hero.HP = Math.min((hero.HP + toHeal) | 0, hero.HT);
          hero.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(toHeal), FloatingText.HEALING, []);
          break;
        case Holiday.WINTER_HOLIDAYS:
          hero.belongings.charge(0.5);
          ScrollOfRecharging.charge(hero);
          break;
        case Holiday.NEW_YEARS:
          toShield = Math.max(5, $J.idiv(hero.HT, 10));
          Buff.affect$Char$Class(hero, $J.cls(Barrier)).setShield(toShield);
          hero.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(toShield), FloatingText.SHIELDING, []);
          break;
      }
    }
  }
  name(): string {
    switch (Holiday.getCurrentHoliday()) {
      case Holiday.NONE:
      default:
        return super.name();
      case Holiday.LUNAR_NEW_YEAR:
        return Messages.get$Object$String$ObjectArr(this, 'fish_name', []);
      case Holiday.APRIL_FOOLS:
        return Messages.get$Object$String$ObjectArr(this, 'amulet_name', []);
      case Holiday.EASTER:
        return Messages.get$Object$String$ObjectArr(this, 'egg_name', []);
      case Holiday.PRIDE:
        return Messages.get$Object$String$ObjectArr(this, 'rainbow_name', []);
      case Holiday.SHATTEREDPD_BIRTHDAY:
        return Messages.get$Object$String$ObjectArr(this, 'shattered_name', []);
      case Holiday.HALLOWEEN:
        return Messages.get$Object$String$ObjectArr(this, 'pie_name', []);
      case Holiday.PD_BIRTHDAY:
        return Messages.get$Object$String$ObjectArr(this, 'vanilla_name', []);
      case Holiday.WINTER_HOLIDAYS:
        return Messages.get$Object$String$ObjectArr(this, 'cane_name', []);
      case Holiday.NEW_YEARS:
        return Messages.get$Object$String$ObjectArr(this, 'sparkling_name', []);
    }
  }
  desc(): string {
    switch (Holiday.getCurrentHoliday()) {
      case Holiday.NONE:
      default:
        return super.desc();
      case Holiday.LUNAR_NEW_YEAR:
        return Messages.get$Object$String$ObjectArr(this, 'fish_desc', []);
      case Holiday.APRIL_FOOLS:
        return Messages.get$Object$String$ObjectArr(this, 'amulet_desc', []);
      case Holiday.EASTER:
        return Messages.get$Object$String$ObjectArr(this, 'egg_desc', []);
      case Holiday.PRIDE:
        return Messages.get$Object$String$ObjectArr(this, 'rainbow_desc', []);
      case Holiday.SHATTEREDPD_BIRTHDAY:
        return Messages.get$Object$String$ObjectArr(this, 'shattered_desc', []);
      case Holiday.HALLOWEEN:
        return Messages.get$Object$String$ObjectArr(this, 'pie_desc', []);
      case Holiday.PD_BIRTHDAY:
        return Messages.get$Object$String$ObjectArr(this, 'vanilla_desc', []);
      case Holiday.WINTER_HOLIDAYS:
        return Messages.get$Object$String$ObjectArr(this, 'cane_desc', []);
      case Holiday.NEW_YEARS:
        return Messages.get$Object$String$ObjectArr(this, 'sparkling_desc', []);
    }
  }
  value(): number {
    return Math.imul(20, this.quantity);
  }
}

export class Pasty$FishLeftover extends Food {
  _Pasty$FishLeftover(): this {
    this._Food();
    this.image_ = ItemSpriteSheet.FISH_LEFTOVER;
    this.energy = Math.fround(Hunger.HUNGRY / 2);
    return this;
  }
  value(): number {
    return Math.imul(10, this.quantity);
  }
}

$J.define(Pasty, 'com.shatteredpixel.shatteredpixeldungeon.items.food.Pasty', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.food.Food', ctors: { '': '_Pasty' } });
$J.define(Pasty$FishLeftover, 'com.shatteredpixel.shatteredpixeldungeon.items.food.Pasty$FishLeftover', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.food.Food', ctors: { '': '_Pasty$FishLeftover' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  ArtifactRecharge = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ArtifactRecharge');
  Barrier = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Barrier');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Charm = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Charm');
  Hunger = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Hunger');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  RainbowParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.RainbowParticle');
  PotionOfExperience = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfExperience');
  ScrollOfRecharging = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRecharging');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  TargetHealthIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.TargetHealthIndicator');
  Holiday = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.Holiday');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
