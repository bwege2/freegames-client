// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/armor/glyphs/AntiMagic.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, HashSet } from '../../../../../../../jre/index.ts';
import { Armor$Glyph } from '../Armor.ts';

let Charm, Degrade, Hex, MagicalSleep, Vulnerable, Weakness, ElementalStrike, ElementalBlast, WarpBeacon, GuidingLight, HolyLance, HolyWeapon, Judgement, Smite, Sunray, CrystalWisp$LightBeam, DM100$LightningBolt, Eye$DeathGaze, Shaman$EarthenBolt, Warlock$DarkBolt, YogFist$BrightFist$LightBeam, YogFist$DarkFist$DarkBolt, ChaliceOfBlood, ArcaneBomb, HolyBomb$HolyDamage, ScrollOfRetribution, ScrollOfTeleportation, ScrollOfPsionicBlast, CursedWand, WandOfBlastWave, WandOfDisintegration, WandOfFireblast, WandOfFrost, WandOfLightning, WandOfLivingEarth, WandOfMagicMissile, WandOfPrismaticLight, WandOfTransfusion, WandOfWarding$Ward, Blazing, Crystal, Grim, Shocking, HolyDart, DisintegrationTrap, GrimTrap, ItemSprite$Glowing, Random;

export class AntiMagic extends Armor$Glyph {
  static TEAL: ItemSprite$Glowing = null;
  static RESISTS: HashSet<JClass> = null;
  _AntiMagic(): this {
    this._Armor$Glyph();
    return this;
  }
  proc(armor: Armor, attacker: Char, defender: Char, damage: number): number {
    return damage;
  }
  static drRoll(owner: Char, level: number): number {
    if (level === -1) {
      return 0;
    } else {
      return Random.NormalIntRange($J.roundf(Math.fround(level * Armor$Glyph.genericProcChanceMultiplier(owner))), $J.roundf(Math.fround((Math.fround(3 + (Math.fround(level * 1.5)))) * Armor$Glyph.genericProcChanceMultiplier(owner))));
    }
  }
  glowing(): ItemSprite$Glowing {
    return AntiMagic.TEAL;
  }
  static $clinit() {
    AntiMagic.TEAL = new ItemSprite$Glowing()._ItemSprite$Glowing$int(8974079);
    AntiMagic.RESISTS = new HashSet();
    AntiMagic.RESISTS.add($J.cls(MagicalSleep));
    AntiMagic.RESISTS.add($J.cls(Charm));
    AntiMagic.RESISTS.add($J.cls(Weakness));
    AntiMagic.RESISTS.add($J.cls(Vulnerable));
    AntiMagic.RESISTS.add($J.cls(Hex));
    AntiMagic.RESISTS.add($J.cls(Degrade));
    AntiMagic.RESISTS.add($J.cls(DisintegrationTrap));
    AntiMagic.RESISTS.add($J.cls(GrimTrap));
    AntiMagic.RESISTS.add($J.cls(ArcaneBomb));
    AntiMagic.RESISTS.add($J.cls(HolyBomb$HolyDamage));
    AntiMagic.RESISTS.add($J.cls(ScrollOfRetribution));
    AntiMagic.RESISTS.add($J.cls(ScrollOfPsionicBlast));
    AntiMagic.RESISTS.add($J.cls(ScrollOfTeleportation));
    AntiMagic.RESISTS.add($J.cls(HolyDart));
    AntiMagic.RESISTS.add($J.cls(GuidingLight));
    AntiMagic.RESISTS.add($J.cls(HolyWeapon));
    AntiMagic.RESISTS.add($J.cls(Sunray));
    AntiMagic.RESISTS.add($J.cls(HolyLance));
    AntiMagic.RESISTS.add($J.cls(Smite));
    AntiMagic.RESISTS.add($J.cls(Judgement));
    AntiMagic.RESISTS.add($J.cls(ElementalBlast));
    AntiMagic.RESISTS.add($J.cls(CursedWand));
    AntiMagic.RESISTS.add($J.cls(WandOfBlastWave));
    AntiMagic.RESISTS.add($J.cls(WandOfDisintegration));
    AntiMagic.RESISTS.add($J.cls(WandOfFireblast));
    AntiMagic.RESISTS.add($J.cls(WandOfFrost));
    AntiMagic.RESISTS.add($J.cls(WandOfLightning));
    AntiMagic.RESISTS.add($J.cls(WandOfLivingEarth));
    AntiMagic.RESISTS.add($J.cls(WandOfMagicMissile));
    AntiMagic.RESISTS.add($J.cls(WandOfPrismaticLight));
    AntiMagic.RESISTS.add($J.cls(WandOfTransfusion));
    AntiMagic.RESISTS.add($J.cls(WandOfWarding$Ward));
    AntiMagic.RESISTS.add($J.cls(ChaliceOfBlood));
    AntiMagic.RESISTS.add($J.cls(ElementalStrike));
    AntiMagic.RESISTS.add($J.cls(Blazing));
    AntiMagic.RESISTS.add($J.cls(Shocking));
    AntiMagic.RESISTS.add($J.cls(Grim));
    AntiMagic.RESISTS.add($J.cls(Crystal));
    AntiMagic.RESISTS.add($J.cls(WarpBeacon));
    AntiMagic.RESISTS.add($J.cls(DM100$LightningBolt));
    AntiMagic.RESISTS.add($J.cls(Shaman$EarthenBolt));
    AntiMagic.RESISTS.add($J.cls(CrystalWisp$LightBeam));
    AntiMagic.RESISTS.add($J.cls(Warlock$DarkBolt));
    AntiMagic.RESISTS.add($J.cls(Eye$DeathGaze));
    AntiMagic.RESISTS.add($J.cls(YogFist$BrightFist$LightBeam));
    AntiMagic.RESISTS.add($J.cls(YogFist$DarkFist$DarkBolt));
  }
}

$J.define(AntiMagic, 'com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.AntiMagic', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor$Glyph', ctors: { '': '_AntiMagic' }, clinit: true, lazy: ['TEAL', 'RESISTS'] });
$J.module(() => {
  Charm = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Charm');
  Degrade = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Degrade');
  Hex = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Hex');
  MagicalSleep = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MagicalSleep');
  Vulnerable = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Vulnerable');
  Weakness = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Weakness');
  ElementalStrike = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.duelist.ElementalStrike');
  ElementalBlast = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.mage.ElementalBlast');
  WarpBeacon = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.mage.WarpBeacon');
  GuidingLight = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.GuidingLight');
  HolyLance = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.HolyLance');
  HolyWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.HolyWeapon');
  Judgement = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Judgement');
  Smite = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Smite');
  Sunray = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.Sunray');
  CrystalWisp$LightBeam = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.CrystalWisp$LightBeam');
  DM100$LightningBolt = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DM100$LightningBolt');
  Eye$DeathGaze = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Eye$DeathGaze');
  Shaman$EarthenBolt = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Shaman$EarthenBolt');
  Warlock$DarkBolt = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Warlock$DarkBolt');
  YogFist$BrightFist$LightBeam = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogFist$BrightFist$LightBeam');
  YogFist$DarkFist$DarkBolt = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogFist$DarkFist$DarkBolt');
  ChaliceOfBlood = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.ChaliceOfBlood');
  ArcaneBomb = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bombs.ArcaneBomb');
  HolyBomb$HolyDamage = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bombs.HolyBomb$HolyDamage');
  ScrollOfRetribution = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRetribution');
  ScrollOfTeleportation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation');
  ScrollOfPsionicBlast = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfPsionicBlast');
  CursedWand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand');
  WandOfBlastWave = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfBlastWave');
  WandOfDisintegration = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfDisintegration');
  WandOfFireblast = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfFireblast');
  WandOfFrost = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfFrost');
  WandOfLightning = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfLightning');
  WandOfLivingEarth = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfLivingEarth');
  WandOfMagicMissile = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfMagicMissile');
  WandOfPrismaticLight = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfPrismaticLight');
  WandOfTransfusion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfTransfusion');
  WandOfWarding$Ward = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfWarding$Ward');
  Blazing = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Blazing');
  Crystal = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Crystal');
  Grim = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Grim');
  Shocking = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Shocking');
  HolyDart = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.HolyDart');
  DisintegrationTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.DisintegrationTrap');
  GrimTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.GrimTrap');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  Random = $J.load('com.watabou.utils.Random');
});
