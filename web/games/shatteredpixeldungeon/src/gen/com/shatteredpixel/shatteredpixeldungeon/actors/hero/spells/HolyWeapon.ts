// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/HolyWeapon.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { ClericSpell } from './ClericSpell.ts';
import { FlavourBuff } from '../../buffs/FlavourBuff.ts';

let Assets$Sounds, Dungeon, Buff, Buff$buffType, HeroSubClass, Enchanting, Item, Messages, BuffIndicator, HeroIcon, Sample;

export class HolyWeapon extends ClericSpell {
  static INSTANCE: HolyWeapon = null;
  _HolyWeapon(): this {
    this._ClericSpell();
    return this;
  }
  icon(): number {
    return HeroIcon.HOLY_WEAPON;
  }
  chargeUse(hero: Hero): number {
    return 2;
  }
  onCast(tome: HolyTome, hero: Hero): void {
    Buff.affect$Char$Class$float(hero, $J.cls(HolyWeapon$HolyWepBuff), 50);
    Item.updateQuickslot();
    Sample.INSTANCE.play$Object(Assets$Sounds.READ);
    hero.sprite_.operate$int(hero.pos);
    if (hero.belongings.weapon() != null) {
      Enchanting.show(hero, hero.belongings.weapon());
    }
    this.onSpellCast(tome, hero);
  }
  desc(): string {
    let desc = Messages.get$Object$String$ObjectArr(this, 'desc', []);
    if (Dungeon.hero.subClass === HeroSubClass.PALADIN) {
      desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_paladin', []);
    }
    return desc + '\n\n' + Messages.get$Object$String$ObjectArr(this, 'charge_cost', [$J.d2i(this.chargeUse(Dungeon.hero))]);
  }
  static $clinit() {
    HolyWeapon.INSTANCE = new HolyWeapon()._HolyWeapon();
  }
}

export class HolyWeapon$HolyWepBuff extends FlavourBuff {
  static readonly DURATION: number = 50;
  _HolyWeapon$HolyWepBuff(): this {
    this._FlavourBuff();
    this.type_ = Buff$buffType.POSITIVE;
    return this;
  }
  icon(): number {
    return BuffIndicator.HOLY_WEAPON;
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(HolyWeapon$HolyWepBuff.DURATION - this.visualcooldown())) / HolyWeapon$HolyWepBuff.DURATION));
  }
  desc(): string {
    if (Dungeon.hero.subClass === HeroSubClass.PALADIN) {
      return Messages.get$Object$String$ObjectArr(this, 'desc_paladin', [this.dispTurns$()]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'desc', [this.dispTurns$()]);
    }
  }
  detach(): void {
    super.detach();
    Item.updateQuickslot();
  }
  extend(extension: number): void {
    if (Math.fround(this.cooldown() + extension) <= Math.fround(2 * HolyWeapon$HolyWepBuff.DURATION)) {
      this.spend(extension);
    } else {
      this.postpone(Math.fround(2 * HolyWeapon$HolyWepBuff.DURATION));
    }
  }
}

$J.define(HolyWeapon, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.HolyWeapon', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.ClericSpell', ctors: { '': '_HolyWeapon' }, clinit: true, lazy: ['INSTANCE'] });
$J.define(HolyWeapon$HolyWepBuff, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.HolyWeapon$HolyWepBuff', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_HolyWeapon$HolyWepBuff' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  Enchanting = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Enchanting');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
