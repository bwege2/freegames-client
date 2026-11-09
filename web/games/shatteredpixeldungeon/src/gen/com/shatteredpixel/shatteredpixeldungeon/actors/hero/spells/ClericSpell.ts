// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/ClericSpell.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, JObject } from '../../../../../../../jre/index.ts';

let Dungeon, Barrier, Buff, Invisibility, HeroSubClass, Talent, Talent$SatiatedSpellsTracker, AscendedForm$AscendBuff, PowerOfMany, AuraOfProtection, BeamingRay, BlessSpell, BodyForm, Cleanse, DivineIntervention, DivineSense, Flash, GuidingLight, HallowedGround, HolyIntuition, HolyLance, HolyWard, HolyWard$HolyArmBuff, HolyWeapon, HolyWeapon$HolyWepBuff, Judgement, LayOnHands, LifeLinkSpell, LifeLinkSpell$LifeLinkSpellBuff, MindForm, MnemonicPrayer, Radiance, RecallInscription, ShieldOfLight, Smite, SpiritForm, Stasis, Sunray, WallOfLight, Messages, HeroIcon;

export class ClericSpell extends JObject {
  _ClericSpell(): this {
    return this;
  }
  chargeUse(hero: Hero): number {
    return 1;
  }
  canCast(hero: Hero): boolean {
    return true;
  }
  name(): string {
    return Messages.get$Object$String$ObjectArr(this, 'name', []);
  }
  shortDesc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'short_desc', []) + ' ' + Messages.get$Object$String$ObjectArr(this, 'charge_cost', [$J.d2i(this.chargeUse(Dungeon.hero))]);
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', []) + '\n\n' + Messages.get$Object$String$ObjectArr(this, 'charge_cost', [$J.d2i(this.chargeUse(Dungeon.hero))]);
  }
  usesTargeting(): boolean {
    return false;
  }
  targetingFlags(): number {
    return -1;
  }
  icon(): number {
    return HeroIcon.NONE;
  }
  onSpellCast(tome: HolyTome, hero: Hero): void {
    Invisibility.dispel$();
    if (hero.hasTalent(Talent.SATIATED_SPELLS) && hero.buff($J.cls(Talent$SatiatedSpellsTracker)) != null) {
      let amount = (1 + Math.imul(2, hero.pointsInTalent(Talent.SATIATED_SPELLS))) | 0;
      Buff.affect$Char$Class(hero, $J.cls(Barrier)).setShield(amount);
      let ally = PowerOfMany.getPoweredAlly();
      if (ally != null && ally.buff($J.cls(LifeLinkSpell$LifeLinkSpellBuff)) != null) {
        Buff.affect$Char$Class(ally, $J.cls(Barrier)).setShield(amount);
      }
      hero.buff($J.cls(Talent$SatiatedSpellsTracker)).detach();
    }
    tome.spendCharge(this.chargeUse(hero));
    Talent.onArtifactUsed(hero);
    if (hero.subClass === HeroSubClass.PALADIN) {
      if (this !== HolyWeapon.INSTANCE && hero.buff($J.cls(HolyWeapon$HolyWepBuff)) != null) {
        hero.buff($J.cls(HolyWeapon$HolyWepBuff)).extend(Math.fround(10 * this.chargeUse(hero)));
      }
      if (this !== HolyWard.INSTANCE && hero.buff($J.cls(HolyWard$HolyArmBuff)) != null) {
        hero.buff($J.cls(HolyWard$HolyArmBuff)).extend(Math.fround(10 * this.chargeUse(hero)));
      }
    }
    if (hero.buff($J.cls(AscendedForm$AscendBuff)) != null) {
      hero.buff($J.cls(AscendedForm$AscendBuff)).spellCasts++;
      hero.buff($J.cls(AscendedForm$AscendBuff)).incShield$int($J.d2i((Math.fround(10 * this.chargeUse(hero)))));
    }
  }
  static getSpellList(cleric: Hero, tier: number): ArrayList<ClericSpell> {
    let spells = new ArrayList();
    if (tier === 1) {
      spells.add(GuidingLight.INSTANCE);
      spells.add(HolyWeapon.INSTANCE);
      spells.add(HolyWard.INSTANCE);
      if (cleric.hasTalent(Talent.HOLY_INTUITION)) {
        spells.add(HolyIntuition.INSTANCE);
      }
      if (cleric.hasTalent(Talent.SHIELD_OF_LIGHT)) {
        spells.add(ShieldOfLight.INSTANCE);
      }
    } else if (tier === 2) {
      if (cleric.hasTalent(Talent.RECALL_INSCRIPTION)) {
        spells.add(RecallInscription.INSTANCE);
      }
      if (cleric.hasTalent(Talent.SUNRAY)) {
        spells.add(Sunray.INSTANCE);
      }
      if (cleric.hasTalent(Talent.DIVINE_SENSE)) {
        spells.add(DivineSense.INSTANCE);
      }
      if (cleric.hasTalent(Talent.BLESS)) {
        spells.add(BlessSpell.INSTANCE);
      }
    } else if (tier === 3) {
      if (cleric.subClass === HeroSubClass.PRIEST) {
        spells.add(Radiance.INSTANCE);
      } else if (cleric.subClass === HeroSubClass.PALADIN) {
        spells.add(Smite.INSTANCE);
      }
      if (cleric.hasTalent(Talent.CLEANSE)) {
        spells.add(Cleanse.INSTANCE);
      }
      if (cleric.hasTalent(Talent.HOLY_LANCE)) {
        spells.add(HolyLance.INSTANCE);
      }
      if (cleric.hasTalent(Talent.HALLOWED_GROUND)) {
        spells.add(HallowedGround.INSTANCE);
      }
      if (cleric.hasTalent(Talent.MNEMONIC_PRAYER)) {
        spells.add(MnemonicPrayer.INSTANCE);
      }
      if (cleric.hasTalent(Talent.LAY_ON_HANDS)) {
        spells.add(LayOnHands.INSTANCE);
      }
      if (cleric.hasTalent(Talent.AURA_OF_PROTECTION)) {
        spells.add(AuraOfProtection.INSTANCE);
      }
      if (cleric.hasTalent(Talent.WALL_OF_LIGHT)) {
        spells.add(WallOfLight.INSTANCE);
      }
    } else if (tier === 4) {
      if (cleric.hasTalent(Talent.DIVINE_INTERVENTION)) {
        spells.add(DivineIntervention.INSTANCE);
      }
      if (cleric.hasTalent(Talent.JUDGEMENT)) {
        spells.add(Judgement.INSTANCE);
      }
      if (cleric.hasTalent(Talent.FLASH)) {
        spells.add(Flash.INSTANCE);
      }
      if (cleric.hasTalent(Talent.BODY_FORM)) {
        spells.add(BodyForm.INSTANCE);
      }
      if (cleric.hasTalent(Talent.MIND_FORM)) {
        spells.add(MindForm.INSTANCE);
      }
      if (cleric.hasTalent(Talent.SPIRIT_FORM)) {
        spells.add(SpiritForm.INSTANCE);
      }
      if (cleric.hasTalent(Talent.BEAMING_RAY)) {
        spells.add(BeamingRay.INSTANCE);
      }
      if (cleric.hasTalent(Talent.LIFE_LINK)) {
        spells.add(LifeLinkSpell.INSTANCE);
      }
      if (cleric.hasTalent(Talent.STASIS)) {
        spells.add(Stasis.INSTANCE);
      }
    }
    return spells;
  }
  static getAllSpells(): ArrayList<ClericSpell> {
    let spells = new ArrayList();
    spells.add(GuidingLight.INSTANCE);
    spells.add(HolyWeapon.INSTANCE);
    spells.add(HolyWard.INSTANCE);
    spells.add(HolyIntuition.INSTANCE);
    spells.add(ShieldOfLight.INSTANCE);
    spells.add(RecallInscription.INSTANCE);
    spells.add(Sunray.INSTANCE);
    spells.add(DivineSense.INSTANCE);
    spells.add(BlessSpell.INSTANCE);
    spells.add(Cleanse.INSTANCE);
    spells.add(Radiance.INSTANCE);
    spells.add(Smite.INSTANCE);
    spells.add(LayOnHands.INSTANCE);
    spells.add(AuraOfProtection.INSTANCE);
    spells.add(WallOfLight.INSTANCE);
    spells.add(HolyLance.INSTANCE);
    spells.add(HallowedGround.INSTANCE);
    spells.add(MnemonicPrayer.INSTANCE);
    spells.add(DivineIntervention.INSTANCE);
    spells.add(Judgement.INSTANCE);
    spells.add(Flash.INSTANCE);
    spells.add(BodyForm.INSTANCE);
    spells.add(MindForm.INSTANCE);
    spells.add(SpiritForm.INSTANCE);
    spells.add(BeamingRay.INSTANCE);
    spells.add(LifeLinkSpell.INSTANCE);
    spells.add(Stasis.INSTANCE);
    return spells;
  }
}

$J.define(ClericSpell, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.ClericSpell', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_ClericSpell' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Barrier = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Barrier');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Talent$SatiatedSpellsTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$SatiatedSpellsTracker');
  AscendedForm$AscendBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.AscendedForm$AscendBuff');
  PowerOfMany = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.PowerOfMany');
  AuraOfProtection = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.AuraOfProtection');
  BeamingRay = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.BeamingRay');
  BlessSpell = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.BlessSpell');
  BodyForm = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.BodyForm');
  Cleanse = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Cleanse');
  DivineIntervention = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.DivineIntervention');
  DivineSense = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.DivineSense');
  Flash = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Flash');
  GuidingLight = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.GuidingLight');
  HallowedGround = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.HallowedGround');
  HolyIntuition = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.HolyIntuition');
  HolyLance = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.HolyLance');
  HolyWard = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.HolyWard');
  HolyWard$HolyArmBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.HolyWard$HolyArmBuff');
  HolyWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.HolyWeapon');
  HolyWeapon$HolyWepBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.HolyWeapon$HolyWepBuff');
  Judgement = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Judgement');
  LayOnHands = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.LayOnHands');
  LifeLinkSpell = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.LifeLinkSpell');
  LifeLinkSpell$LifeLinkSpellBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.LifeLinkSpell$LifeLinkSpellBuff');
  MindForm = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.MindForm');
  MnemonicPrayer = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.MnemonicPrayer');
  Radiance = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Radiance');
  RecallInscription = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.RecallInscription');
  ShieldOfLight = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.ShieldOfLight');
  Smite = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Smite');
  SpiritForm = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.SpiritForm');
  Stasis = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Stasis');
  Sunray = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Sunray');
  WallOfLight = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.WallOfLight');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
});
