// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/spells/MnemonicPrayer.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { TargetedClericSpell } from './TargetedClericSpell.ts';

let Assets$Sounds, Dungeon, Actor, Char$Alignment, AdrenalineSurge, ArcaneArmor, ArtifactRecharge, Barkskin, Bleeding, Buff, Buff$buffType, Burning, Corrosion, Dread, FireImbue, FlavourBuff, GreaterHaste, Healing, LifeLink, Ooze, Poison, ShieldBuff, ToxicImbue, WellFed, Talent, AscendedForm$AscendBuff, PowerOfMany, PowerOfMany$PowerBuff, BeamingRay$BeamingRayBoost, BodyForm$BodyFormBuff, GuidingLight$Illuminated, LifeLinkSpell$LifeLinkSpellBuff, SpiritForm$SpiritFormBuff, Speck, Viscosity$DeferedDamage, ElixirOfAquaticRejuvenation$AquaHealing, ScrollOfChallenge$ChallengeArena, Kinetic$ConservedDamage, Ballistica, Messages, Sungrass$Health, BuffIndicator, HeroIcon, QuickSlotButton, GLog, Sample;

export class MnemonicPrayer extends TargetedClericSpell {
  static INSTANCE: MnemonicPrayer = null;
  _MnemonicPrayer(): this {
    this._TargetedClericSpell();
    return this;
  }
  icon(): number {
    return HeroIcon.MNEMONIC_PRAYER;
  }
  targetingFlags(): number {
    return Ballistica.STOP_TARGET;
  }
  canCast(hero: Hero): boolean {
    return super.canCast(hero) && hero.hasTalent(Talent.MNEMONIC_PRAYER);
  }
  onTargetSelected(tome: HolyTome, hero: Hero, target: number): void {
    if (target == null) {
      return;
    }
    let ch = Actor.findChar(target);
    if (ch == null || !Dungeon.level.heroFOV[target]) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'no_target', []), []);
      return;
    }
    QuickSlotButton.target(ch);
    let extension = Math.fround((2 + hero.pointsInTalent(Talent.MNEMONIC_PRAYER)) | 0);
    this.affectChar(ch, extension);
    let ally = PowerOfMany.getPoweredAlly();
    if (ally != null && ally.buff($J.cls(LifeLinkSpell$LifeLinkSpellBuff)) != null) {
      if (ch === hero) {
        this.affectChar(ally, extension);
      } else if (ch === ally) {
        this.affectChar(hero, extension);
      }
    }
    if (ch === hero) {
      hero.sprite_.operate$int(ch.pos);
      BuffIndicator.refreshHero();
    } else {
      hero.sprite_.zap$int(ch.pos);
      hero.next();
    }
    this.onSpellCast(tome, hero);
  }
  affectChar(ch: Char, extension: number): void {
    if (ch.alignment === Char$Alignment.ALLY) {
      Sample.INSTANCE.play$Object(Assets$Sounds.CHARGEUP);
      ch.sprite_.emitter().start(Speck.factory$int(Speck.UP), Math.fround(0.15), 4);
      for (const $it0 = ch.buffs$().iterator(); $it0.hasNext(); ) {
        let b = $it0.next();
        if (b.type_ !== Buff$buffType.POSITIVE || b.mnemonicExtended || b.icon() === BuffIndicator.NONE) {
          continue;
        }
        if (b instanceof AscendedForm$AscendBuff || b instanceof BodyForm$BodyFormBuff || b instanceof SpiritForm$SpiritFormBuff || b instanceof PowerOfMany$PowerBuff || b instanceof BeamingRay$BeamingRayBoost || b instanceof LifeLink || b instanceof LifeLinkSpell$LifeLinkSpellBuff) {
          continue;
        }
        if (b instanceof FlavourBuff) {
          Buff.affect$Char$Class$float(ch, b.getClass(), extension);
        } else if (b instanceof AdrenalineSurge) {
          (b).delay(extension);
        } else if (b instanceof ArcaneArmor) {
          (b).delay(extension);
        } else if (b instanceof ArtifactRecharge) {
          (b).extend(extension);
        } else if (b instanceof Barkskin) {
          (b).delay(extension);
        } else if (b instanceof FireImbue) {
          (b).extend(extension);
        } else if (b instanceof GreaterHaste) {
          (b).extend(extension);
        } else if (b instanceof Healing) {
          (b).increaseHeal($J.d2i(extension));
        } else if (b instanceof ToxicImbue) {
          (b).extend(extension);
        } else if (b instanceof WellFed) {
          (b).extend(extension);
        } else if (b instanceof ElixirOfAquaticRejuvenation$AquaHealing) {
          (b).extend(extension);
        } else if (b instanceof ScrollOfChallenge$ChallengeArena) {
          (b).extend(extension);
        } else if (b instanceof ShieldBuff) {
          (b).delay(extension);
        } else if (b instanceof Kinetic$ConservedDamage) {
          (b).delay(extension);
        } else if (b instanceof Sungrass$Health) {
          (b).boost($J.d2i(extension));
        }
        b.mnemonicExtended = true;
      }
    } else {
      Sample.INSTANCE.play$Object(Assets$Sounds.DEBUFF);
      ch.sprite_.emitter().start(Speck.factory$int(Speck.DOWN), Math.fround(0.15), 4);
      Buff.affect$Char$Class(ch, $J.cls(GuidingLight$Illuminated));
      for (const $it1 = ch.buffs$().iterator(); $it1.hasNext(); ) {
        let b = $it1.next();
        if (b.type_ !== Buff$buffType.NEGATIVE || b.mnemonicExtended) {
          continue;
        }
        if (b instanceof FlavourBuff) {
          Buff.affect$Char$Class$float(ch, b.getClass(), extension);
        } else if (b instanceof Bleeding) {
          (b).extend(extension);
        } else if (b instanceof Burning) {
          (b).extend(extension);
        } else if (b instanceof Corrosion) {
          (b).extend(extension);
        } else if (b instanceof Dread) {
          (b).extend(extension);
        } else if (b instanceof Ooze) {
          (b).extend(extension);
        } else if (b instanceof Poison) {
          (b).extend(extension);
        } else if (b instanceof Viscosity$DeferedDamage) {
          (b).extend(extension);
        }
        b.mnemonicExtended = true;
      }
    }
  }
  desc(): string {
    return (Messages.get$Object$String$ObjectArr(this, 'desc', [(2 + Dungeon.hero.pointsInTalent(Talent.MNEMONIC_PRAYER)) | 0])) + '\n\n' + Messages.get$Object$String$ObjectArr(this, 'charge_cost', [$J.d2i(this.chargeUse(Dungeon.hero))]);
  }
  static $clinit() {
    MnemonicPrayer.INSTANCE = new MnemonicPrayer()._MnemonicPrayer();
  }
}

$J.define(MnemonicPrayer, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.MnemonicPrayer', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.TargetedClericSpell', ctors: { '': '_MnemonicPrayer' }, clinit: true, lazy: ['INSTANCE'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  AdrenalineSurge = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AdrenalineSurge');
  ArcaneArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ArcaneArmor');
  ArtifactRecharge = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ArtifactRecharge');
  Barkskin = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Barkskin');
  Bleeding = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Bleeding');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Burning = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Burning');
  Corrosion = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Corrosion');
  Dread = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Dread');
  FireImbue = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FireImbue');
  FlavourBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff');
  GreaterHaste = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.GreaterHaste');
  Healing = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Healing');
  LifeLink = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.LifeLink');
  Ooze = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Ooze');
  Poison = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Poison');
  ShieldBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ShieldBuff');
  ToxicImbue = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ToxicImbue');
  WellFed = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.WellFed');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  AscendedForm$AscendBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.AscendedForm$AscendBuff');
  PowerOfMany = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.PowerOfMany');
  PowerOfMany$PowerBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.PowerOfMany$PowerBuff');
  BeamingRay$BeamingRayBoost = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.BeamingRay$BeamingRayBoost');
  BodyForm$BodyFormBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.BodyForm$BodyFormBuff');
  GuidingLight$Illuminated = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.GuidingLight$Illuminated');
  LifeLinkSpell$LifeLinkSpellBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.LifeLinkSpell$LifeLinkSpellBuff');
  SpiritForm$SpiritFormBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.SpiritForm$SpiritFormBuff');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Viscosity$DeferedDamage = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Viscosity$DeferedDamage');
  ElixirOfAquaticRejuvenation$AquaHealing = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfAquaticRejuvenation$AquaHealing');
  ScrollOfChallenge$ChallengeArena = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfChallenge$ChallengeArena');
  Kinetic$ConservedDamage = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Kinetic$ConservedDamage');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  Sungrass$Health = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Sungrass$Health');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  QuickSlotButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.QuickSlotButton');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
