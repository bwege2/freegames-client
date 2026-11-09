// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/SnipersMark.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { FlavourBuff } from './FlavourBuff.ts';

let Dungeon, Actor, Buff$buffType, SpiritBow, Weapon$Augment, Messages, ActionIndicator, BuffIndicator, HeroIcon, QuickSlotButton;

export class SnipersMark extends FlavourBuff {
  object: number = 0;
  percentDmgBonus: number = 0;
  static readonly OBJECT: string = 'object';
  static readonly BONUS: string = 'bonus';
  static readonly DURATION: number = 4;
  _SnipersMark(): this {
    this._FlavourBuff();
    this.object = 0;
    this.percentDmgBonus = 0;
    this.type_ = Buff$buffType.POSITIVE;
    return this;
  }
  set(object$: number, bonus: number): void {
    this.object = object$;
    this.percentDmgBonus = bonus;
    let bow = Dungeon.hero.belongings.getItem($J.cls(SpiritBow));
    if (bow != null) {
      ActionIndicator.setAction(this);
    }
  }
  detach(): void {
    super.detach();
    ActionIndicator.clearAction$Action(this);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(SnipersMark.OBJECT, this.object);
    bundle.put$String$float(SnipersMark.BONUS, this.percentDmgBonus);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.object = bundle.getInt(SnipersMark.OBJECT);
    this.percentDmgBonus = bundle.getFloat(SnipersMark.BONUS);
  }
  icon(): number {
    return BuffIndicator.MARK;
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(SnipersMark.DURATION - this.visualcooldown())) / SnipersMark.DURATION));
  }
  actionName(): string {
    let bow = Dungeon.hero.belongings.getItem($J.cls(SpiritBow));
    if (bow == null) {
      return null;
    }
    switch (bow.augment) {
      case Weapon$Augment.NONE:
      default:
        return Messages.get$Object$String$ObjectArr(this, 'action_name_snapshot', []);
      case Weapon$Augment.SPEED:
        return Messages.get$Object$String$ObjectArr(this, 'action_name_volley', []);
      case Weapon$Augment.DAMAGE:
        return Messages.get$Object$String$ObjectArr(this, 'action_name_sniper', []);
    }
  }
  actionIcon(): number {
    return HeroIcon.SNIPERS_MARK;
  }
  indicatorColor(): number {
    return 4473924;
  }
  doAction(): void {
    let hero = Dungeon.hero;
    if (hero == null) {
      return;
    }
    let bow = hero.belongings.getItem($J.cls(SpiritBow));
    if (bow == null) {
      return;
    }
    let arrow = bow.knockArrow();
    if (arrow == null) {
      return;
    }
    let ch = Actor.findById(this.object);
    if (ch == null) {
      return;
    }
    let cell = QuickSlotButton.autoAim$Char$Item(ch, arrow);
    if (cell === -1) {
      return;
    }
    bow.sniperSpecial = true;
    bow.sniperSpecialBonusDamage = this.percentDmgBonus;
    arrow.cast(hero, cell);
    this.detach();
  }
}

$J.define(SnipersMark, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.SnipersMark', { kind: 'class', ifaces: ['com.shatteredpixel.shatteredpixeldungeon.ui.ActionIndicator$Action'], sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_SnipersMark' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  SpiritBow = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.SpiritBow');
  Weapon$Augment = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Augment');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ActionIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ActionIndicator');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  QuickSlotButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.QuickSlotButton');
});
