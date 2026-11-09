// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/Cleanse.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { ClericSpell } from './ClericSpell.ts';

let Assets$Sounds, Dungeon, Char$Alignment, AllyBuff, Barrier, Buff, Buff$buffType, LostInventory, Talent, PowerOfMany, LifeLinkSpell$LifeLinkSpellBuff, Flare, PotionOfCleansing$Cleanse, Messages, HeroIcon, Sample;

export class Cleanse extends ClericSpell {
  static INSTANCE: Cleanse = null;
  _Cleanse(): this {
    this._ClericSpell();
    return this;
  }
  icon(): number {
    return HeroIcon.CLEANSE;
  }
  chargeUse(hero: Hero): number {
    return 2;
  }
  desc(): string {
    let immunity = Math.imul(2, ((Dungeon.hero.pointsInTalent(Talent.CLEANSE) - 1) | 0));
    if (immunity > 0) {
      immunity++;
    }
    let shield = Math.imul(10, Dungeon.hero.pointsInTalent(Talent.CLEANSE));
    return Messages.get$Object$String$ObjectArr(this, 'desc', [immunity, shield]) + '\n\n' + Messages.get$Object$String$ObjectArr(this, 'charge_cost', [$J.d2i(this.chargeUse(Dungeon.hero))]);
  }
  canCast(hero: Hero): boolean {
    return super.canCast(hero) && hero.hasTalent(Talent.CLEANSE);
  }
  onCast(tome: HolyTome, hero: Hero): void {
    let affected = new ArrayList();
    affected.add(hero);
    for (let mob of $J.toArrayInto(Dungeon.level.mobs.toArray(), $J.newArray(0, null))) {
      if (Dungeon.level.heroFOV[mob.pos] && mob.alignment === Char$Alignment.ALLY) {
        affected.add(mob);
      }
    }
    let ally = PowerOfMany.getPoweredAlly();
    if (ally != null && ally.buff($J.cls(LifeLinkSpell$LifeLinkSpellBuff)) != null && !affected.contains(ally)) {
      affected.add(ally);
    }
    for (const $it0 = affected.iterator(); $it0.hasNext(); ) {
      let ch = $it0.next();
      for (const $it1 = ch.buffs$().iterator(); $it1.hasNext(); ) {
        let b = $it1.next();
        if (b.type_ === Buff$buffType.NEGATIVE && !(b instanceof AllyBuff) && !(b instanceof LostInventory)) {
          b.detach();
        }
      }
      if (hero.pointsInTalent(Talent.CLEANSE) > 1) {
        Buff.prolong(ch, $J.cls(PotionOfCleansing$Cleanse), Math.fround(Math.imul(2, ((Dungeon.hero.pointsInTalent(Talent.CLEANSE) - 1) | 0))));
      }
      Buff.affect$Char$Class(ch, $J.cls(Barrier)).setShield(Math.imul(10, hero.pointsInTalent(Talent.CLEANSE)));
      new Flare()._Flare(6, 32).color$int$boolean(16731346, true).show$Visual$float(ch.sprite_, 2);
    }
    hero.spend(1);
    hero.busy();
    hero.sprite_.operate$int(hero.pos);
    Sample.INSTANCE.play$Object(Assets$Sounds.READ);
    this.onSpellCast(tome, hero);
  }
  static $clinit() {
    Cleanse.INSTANCE = new Cleanse()._Cleanse();
  }
}

$J.define(Cleanse, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Cleanse', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.ClericSpell', ctors: { '': '_Cleanse' }, clinit: true, lazy: ['INSTANCE'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  AllyBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AllyBuff');
  Barrier = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Barrier');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  LostInventory = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.LostInventory');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  PowerOfMany = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.PowerOfMany');
  LifeLinkSpell$LifeLinkSpellBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.LifeLinkSpell$LifeLinkSpellBuff');
  Flare = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Flare');
  PotionOfCleansing$Cleanse = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfCleansing$Cleanse');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
