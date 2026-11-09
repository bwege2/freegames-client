// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/HolyIntuition.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { InventoryClericSpell } from './InventoryClericSpell.ts';

let Assets$Sounds, Talent, Identification, EquipableItem, Wand, Messages, HeroIcon, GLog, Sample;

export class HolyIntuition extends InventoryClericSpell {
  static INSTANCE: HolyIntuition = null;
  _HolyIntuition(): this {
    this._InventoryClericSpell();
    return this;
  }
  icon(): number {
    return HeroIcon.HOLY_INTUITION;
  }
  usableOnItem(item: Item): boolean {
    return (item instanceof EquipableItem || item instanceof Wand) && !item.isIdentified() && !item.cursedKnown;
  }
  chargeUse(hero: Hero): number {
    return Math.fround((4 - hero.pointsInTalent(Talent.HOLY_INTUITION)) | 0);
  }
  canCast(hero: Hero): boolean {
    return super.canCast(hero) && hero.hasTalent(Talent.HOLY_INTUITION);
  }
  onItemSelected(tome: HolyTome, hero: Hero, item: Item): void {
    if (item == null) {
      return;
    }
    item.cursedKnown = true;
    if (item.cursed) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'cursed', []), []);
    } else {
      GLog.i(Messages.get$Object$String$ObjectArr(this, 'uncursed', []), []);
    }
    hero.spend(1);
    hero.busy();
    hero.sprite_.operate$int(hero.pos);
    hero.sprite_.parent.add$Gizmo(new Identification()._Identification(hero.sprite_.center$().offset$float$float(0, -16)));
    Sample.INSTANCE.play$Object(Assets$Sounds.READ);
    this.onSpellCast(tome, hero);
  }
  static $clinit() {
    HolyIntuition.INSTANCE = new HolyIntuition()._HolyIntuition();
  }
}

$J.define(HolyIntuition, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.HolyIntuition', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.InventoryClericSpell', ctors: { '': '_HolyIntuition' }, clinit: true, lazy: ['INSTANCE'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Identification = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Identification');
  EquipableItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.EquipableItem');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
