// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/BodyForm.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Buff$buffType, Talent, Trinity$WndItemtypeSelect, Armor$Glyph, Weapon$Enchantment, Messages, GameScene, BuffIndicator, HeroIcon;

export class BodyForm extends ClericSpell {
  static INSTANCE: BodyForm = null;
  _BodyForm(): this {
    this._ClericSpell();
    return this;
  }
  icon(): number {
    return HeroIcon.BODY_FORM;
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [BodyForm.duration()]) + '\n\n' + Messages.get$Object$String$ObjectArr(this, 'charge_cost', [$J.d2i(this.chargeUse(Dungeon.hero))]);
  }
  chargeUse(hero: Hero): number {
    return 2;
  }
  canCast(hero: Hero): boolean {
    return super.canCast(hero) && hero.hasTalent(Talent.BODY_FORM);
  }
  onCast(tome: HolyTome, hero: Hero): void {
    GameScene.show(new Trinity$WndItemtypeSelect()._Trinity$WndItemtypeSelect(tome, this));
  }
  static duration(): number {
    return $J.roundf(Math.fround(Math.fround(13.33) + Math.fround(Math.fround(6.67) * Dungeon.hero.pointsInTalent(Talent.BODY_FORM))));
  }
  static $clinit() {
    BodyForm.INSTANCE = new BodyForm()._BodyForm();
  }
}

export class BodyForm$BodyFormBuff extends FlavourBuff {
  effect_: Bundlable = null;
  static readonly EFFECT: string = 'effect';
  _BodyForm$BodyFormBuff(): this {
    this._FlavourBuff();
    this.type_ = Buff$buffType.POSITIVE;
    return this;
  }
  icon(): number {
    return BuffIndicator.TRINITY_FORM;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(1, 0, 0);
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(BodyForm.duration() - this.visualcooldown())) / BodyForm.duration()));
  }
  setEffect(effect: Bundlable): void {
    this.effect_ = effect;
  }
  enchant(): Weapon$Enchantment {
    if (this.effect_ instanceof Weapon$Enchantment) {
      return this.effect_;
    }
    return null;
  }
  glyph(): Armor$Glyph {
    if (this.effect_ instanceof Armor$Glyph) {
      return this.effect_;
    }
    return null;
  }
  desc(): string {
    if (this.enchant() != null) {
      return Messages.get$Object$String$ObjectArr(this, 'desc', [Messages.titleCase(this.enchant().name$()), this.dispTurns$()]);
    } else if (this.glyph() != null) {
      return Messages.get$Object$String$ObjectArr(this, 'desc', [Messages.titleCase(this.glyph().name$()), this.dispTurns$()]);
    }
    return super.desc();
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$Bundlable(BodyForm$BodyFormBuff.EFFECT, this.effect_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.effect_ = bundle.get$String(BodyForm$BodyFormBuff.EFFECT);
  }
}

$J.define(BodyForm, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.BodyForm', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.ClericSpell', ctors: { '': '_BodyForm' }, clinit: true, lazy: ['INSTANCE'] });
$J.define(BodyForm$BodyFormBuff, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.BodyForm$BodyFormBuff', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_BodyForm$BodyFormBuff' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Trinity$WndItemtypeSelect = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.Trinity$WndItemtypeSelect');
  Armor$Glyph = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor$Glyph');
  Weapon$Enchantment = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
});
