// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/armor/Armor.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Arrays, JEnum, JObject } from '../../../../../../jre/index.ts';
import { EquipableItem } from '../EquipableItem.ts';

let Badges, Challenges, Dungeon, Statistics, Buff, MagicImmune, Momentum, Hero, HeroClass, HeroSubClass, Talent, ShadowClone$ShadowAlly, AuraOfProtection$AuraBuff, BodyForm$BodyFormBuff, HolyWard, HolyWard$HolyArmBuff, LifeLinkSpell$LifeLinkSpellBuff, PrismaticImage, Speck, BrokenSeal$WarriorShield, Item, AntiEntropy, Bulk, Corrosion, Displacement, Metabolism, Multiplicity, Overgrowth, Stench, Affection, AntiMagic, Brimstone, Camouflage, Entanglement, Flow, Obfuscation, Potential, Repulsion, Stone, Swiftness, Thorns, Viscosity, RingOfArcana, ParchmentScrap, ShardOfOblivion, Catalog, Messages, GameScene, ItemSprite, ItemSprite$Glowing, ItemSpriteSheet, GLog, WndOptions, Emitter, Random, Reflection;

export class Armor extends EquipableItem {
  static readonly AC_DETACH: string = 'DETACH';
  augment: Armor$Augment = null;
  glyph_: Armor$Glyph = null;
  glyphHardened: boolean = false;
  curseInfusionBonus: boolean = false;
  masteryPotionBonus: boolean = false;
  seal_: BrokenSeal = null;
  tier_: number = 0;
  static readonly USES_TO_ID: number = 10;
  usesLeftToID: number = 0;
  availableUsesToID: number = 0;
  static readonly USES_LEFT_TO_ID: string = 'uses_left_to_id';
  static readonly AVAILABLE_USES: string = 'available_uses';
  static readonly GLYPH: string = 'glyph';
  static readonly GLYPH_HARDENED: string = 'glyph_hardened';
  static readonly CURSE_INFUSION_BONUS: string = 'curse_infusion_bonus';
  static readonly MASTERY_POTION_BONUS: string = 'mastery_potion_bonus';
  static readonly SEAL: string = 'seal';
  static readonly AUGMENT: string = 'augment';
  static testingNoArmDefSkill: boolean = false;
  static HOLY: ItemSprite$Glowing = null;
  _Armor(tier: number): this {
    this._EquipableItem();
    this.augment = Armor$Augment.NONE;
    this.glyphHardened = false;
    this.curseInfusionBonus = false;
    this.masteryPotionBonus = false;
    this.usesLeftToID = Math.fround(Armor.USES_TO_ID);
    this.availableUsesToID = Math.fround(Armor.USES_TO_ID / 2);
    this.tier_ = tier;
    return this;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$float(Armor.USES_LEFT_TO_ID, this.usesLeftToID);
    bundle.put$String$float(Armor.AVAILABLE_USES, this.availableUsesToID);
    bundle.put$String$Bundlable(Armor.GLYPH, this.glyph_);
    bundle.put$String$boolean(Armor.GLYPH_HARDENED, this.glyphHardened);
    bundle.put$String$boolean(Armor.CURSE_INFUSION_BONUS, this.curseInfusionBonus);
    bundle.put$String$boolean(Armor.MASTERY_POTION_BONUS, this.masteryPotionBonus);
    bundle.put$String$Bundlable(Armor.SEAL, this.seal_);
    bundle.put$String$Enum(Armor.AUGMENT, this.augment);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.usesLeftToID = Math.fround(bundle.getInt(Armor.USES_LEFT_TO_ID));
    this.availableUsesToID = Math.fround(bundle.getInt(Armor.AVAILABLE_USES));
    this.inscribe$Glyph(bundle.get$String(Armor.GLYPH));
    this.glyphHardened = bundle.getBoolean(Armor.GLYPH_HARDENED);
    this.curseInfusionBonus = bundle.getBoolean(Armor.CURSE_INFUSION_BONUS);
    this.masteryPotionBonus = bundle.getBoolean(Armor.MASTERY_POTION_BONUS);
    this.seal_ = bundle.get$String(Armor.SEAL);
    this.augment = bundle.getEnum(Armor.AUGMENT, $J.cls(Armor$Augment));
  }
  reset(): void {
    super.reset();
    this.usesLeftToID = Math.fround(Armor.USES_TO_ID);
    this.availableUsesToID = Math.fround(Armor.USES_TO_ID / 2);
    this.seal_ = null;
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    if (this.seal_ != null) {
      actions.add(Armor.AC_DETACH);
    }
    return actions;
  }
  execute$Hero$String(hero: Hero, action: string): void {
    super.execute$Hero$String(hero, action);
    if ($J.equals(action, Armor.AC_DETACH) && this.seal_ != null) {
      let detaching = this.detachSeal();
      GLog.i(Messages.get$Class$String$ObjectArr($J.cls(Armor), 'detach_seal', []), []);
      hero.sprite_.operate$int(hero.pos);
      if (!detaching.collect$()) {
        Dungeon.level.drop(detaching, hero.pos);
      }
      Item.updateQuickslot();
    }
  }
  collect$Bag(container: Bag): boolean {
    if (super.collect$Bag(container)) {
      if (Dungeon.hero != null && Dungeon.hero.isAlive() && this.isIdentified() && this.glyph_ != null) {
        Catalog.setSeen(this.glyph_.getClass());
        Statistics.itemTypesDiscovered.add(this.glyph_.getClass());
      }
      return true;
    } else {
      return false;
    }
  }
  identify$boolean(byHero: boolean): Item {
    if (this.glyph_ != null && byHero && Dungeon.hero != null && Dungeon.hero.isAlive()) {
      Catalog.setSeen(this.glyph_.getClass());
      Statistics.itemTypesDiscovered.add(this.glyph_.getClass());
    }
    return super.identify$boolean(byHero);
  }
  setIDReady(): void {
    this.usesLeftToID = -1;
  }
  readyToIdentify(): boolean {
    return !this.isIdentified() && this.usesLeftToID <= Math.fround(0);
  }
  doEquip(hero: Hero): boolean {
    if (hero.heroClass !== HeroClass.CLERIC && hero.hasTalent(Talent.HOLY_INTUITION) && this.cursed && !this.cursedKnown && Random.Int$int(20) < ((1 + Math.imul(2, hero.pointsInTalent(Talent.HOLY_INTUITION))) | 0)) {
      this.cursedKnown = true;
      GLog.p(Messages.get$Object$String$ObjectArr(this, 'curse_detected', []), []);
      return false;
    }
    this.detach(hero.belongings.backpack);
    let oldArmor = hero.belongings.armor_;
    if (hero.belongings.armor_ == null || hero.belongings.armor_.doUnequip$Hero$boolean$boolean(hero, true, false)) {
      hero.belongings.armor_ = this;
      this.cursedKnown = true;
      if (this.cursed) {
        EquipableItem.equipCursed(hero);
        GLog.n(Messages.get$Class$String$ObjectArr($J.cls(Armor), 'equip_cursed', []), []);
      }
      (hero.sprite_).updateArmor();
      this.activate(hero);
      Talent.onItemEquipped(hero, this);
      hero.spend(this.timeToEquip(hero));
      if (Dungeon.hero.heroClass === HeroClass.WARRIOR && this.checkSeal() == null) {
        let seal = oldArmor != null ? oldArmor.checkSeal() : null;
        if (seal != null && (!this.cursed || (seal.getGlyph() != null && seal.getGlyph().curse()))) {
          GameScene.show(new (Armor$1())().$o(this).$c(seal, oldArmor)._WndOptions$Image$String$String$StringArr(new ItemSprite()._ItemSprite$int(ItemSpriteSheet.SEAL), Messages.titleCase(seal.trueName()), Messages.get$Class$String$ObjectArr($J.cls(Armor), 'seal_transfer', []), [Messages.get$Class$String$ObjectArr($J.cls(Armor), 'seal_transfer_yes', []), Messages.get$Class$String$ObjectArr($J.cls(Armor), 'seal_transfer_no', [])]));
        } else {
          hero.next();
        }
      } else {
        hero.next();
      }
      return true;
    } else {
      this.collect$Bag(hero.belongings.backpack);
      return false;
    }
  }
  activate(ch: Char): void {
    if (this.seal_ != null) {
      Buff.affect$Char$Class(ch, $J.cls(BrokenSeal$WarriorShield)).setArmor(this);
    }
  }
  affixSeal(seal: BrokenSeal): void {
    this.seal_ = seal;
    if (seal.level$() > 0) {
      let newLevel = (this.trueLevel() + 1) | 0;
      this.level$int(newLevel);
      Badges.validateItemLevelAquired(this);
    }
    if (seal.getGlyph() != null) {
      this.inscribe$Glyph(seal.getGlyph());
    }
    if (this.isEquipped(Dungeon.hero)) {
      Buff.affect$Char$Class(Dungeon.hero, $J.cls(BrokenSeal$WarriorShield)).setArmor(this);
    }
  }
  detachSeal(): BrokenSeal {
    if (this.seal_ != null) {
      if (this.isEquipped(Dungeon.hero)) {
        let sealBuff = Dungeon.hero.buff($J.cls(BrokenSeal$WarriorShield));
        if (sealBuff != null) {
          sealBuff.setArmor(null);
        }
      }
      let detaching = this.seal_;
      this.seal_ = null;
      if (detaching.level$() > 0) {
        this.degrade$();
      }
      if (detaching.canTransferGlyph()) {
        this.inscribe$Glyph(null);
      } else {
        detaching.setGlyph(null);
      }
      return detaching;
    } else {
      return null;
    }
  }
  checkSeal(): BrokenSeal {
    return this.seal_;
  }
  doUnequip$Hero$boolean$boolean(hero: Hero, collect: boolean, single: boolean): boolean {
    if (super.doUnequip$Hero$boolean$boolean(hero, collect, single)) {
      hero.belongings.armor_ = null;
      (hero.sprite_).updateArmor();
      let sealBuff = hero.buff($J.cls(BrokenSeal$WarriorShield));
      if (sealBuff != null) {
        sealBuff.setArmor(null);
      }
      return true;
    } else {
      return false;
    }
  }
  isEquipped(hero: Hero): boolean {
    return hero != null && hero.belongings.armor() === this;
  }
  DRMax$(): number {
    return this.DRMax$int(this.buffedLvl());
  }
  DRMax$int(lvl: number): number {
    if (Dungeon.isChallenged(Challenges.NO_ARMOR)) {
      return (1 + this.tier_ + lvl + this.augment.defenseFactor(lvl)) | 0;
    }
    let max = (Math.imul(this.tier_, ((2 + lvl) | 0)) + this.augment.defenseFactor(lvl)) | 0;
    if (lvl > max) {
      return $J.idiv(((lvl - max + 1) | 0), 2);
    } else {
      return max;
    }
  }
  DRMin$(): number {
    return this.DRMin$int(this.buffedLvl());
  }
  DRMin$int(lvl: number): number {
    if (Dungeon.isChallenged(Challenges.NO_ARMOR)) {
      return 0;
    }
    let max = this.DRMax$int(lvl);
    if (lvl >= max) {
      return ((lvl - max) | 0);
    } else {
      return lvl;
    }
  }
  evasionFactor(owner: Char, evasion: number): number {
    if (Armor.testingNoArmDefSkill) {
      return evasion;
    }
    if (this.hasGlyph($J.cls(Stone), owner) && !Stone.testingEvasion()) {
      return 0;
    }
    if (owner instanceof Hero) {
      let aEnc = (this.STRReq$() - (owner).STR()) | 0;
      if (aEnc > 0) {
        evasion = Math.fround(evasion / $J.pow(1.5, aEnc));
      }
      let momentum = owner.buff($J.cls(Momentum));
      if (momentum != null) {
        evasion = Math.fround(evasion + momentum.evasionBonus((owner).lvl, Math.max(0, -aEnc)));
      }
    }
    return Math.fround(evasion + this.augment.evasionFactor(this.buffedLvl()));
  }
  speedFactor(owner: Char, speed: number): number {
    if (owner instanceof Hero) {
      let aEnc = (this.STRReq$() - (owner).STR()) | 0;
      if (aEnc > 0) {
        speed = Math.fround(speed / $J.pow(1.2, aEnc));
      }
    }
    return speed;
  }
  level$(): number {
    let level = super.level$();
    if (this.curseInfusionBonus) {
      level = (level + (1 + $J.idiv(level, 6))) | 0;
    }
    return level;
  }
  upgrade$(): Item {
    return this.upgrade$boolean(false);
  }
  upgrade$boolean(inscribe: boolean): Item {
    if (inscribe) {
      if (this.glyph_ == null) {
        this.inscribe$Glyph(Armor$Glyph.random([]));
      }
    } else if (this.glyph_ != null) {
      if (this.glyphHardened) {
        if (this.level$() >= 6 && Random.Float$float(10) < ($J.pow(2, (this.level$() - 6) | 0))) {
          this.glyphHardened = false;
        }
      } else if (this.hasCurseGlyph()) {
        if (Random.Int$int(3) === 0) {
          this.inscribe$Glyph(null);
        }
      } else {
        let lossChanceStart = 4;
        if (Dungeon.hero != null && Dungeon.hero.heroClass !== HeroClass.WARRIOR && Dungeon.hero.hasTalent(Talent.RUNIC_TRANSFERENCE)) {
          lossChanceStart = (lossChanceStart + (1 + Dungeon.hero.pointsInTalent(Talent.RUNIC_TRANSFERENCE))) | 0;
        }
        if (this.level$() >= lossChanceStart && Random.Float$float(10) < ($J.pow(2, (this.level$() - 4) | 0))) {
          this.inscribe$Glyph(null);
        }
      }
    }
    this.cursed = false;
    if (this.seal_ != null && this.seal_.level$() === 0) {
      this.seal_.upgrade$();
    }
    return super.upgrade$();
  }
  proc(attacker: Char, defender: Char, damage: number): number {
    if (defender.buff($J.cls(MagicImmune)) == null) {
      let trinityGlyph = null;
      if (Dungeon.hero.buff($J.cls(BodyForm$BodyFormBuff)) != null && (defender === Dungeon.hero || defender instanceof PrismaticImage || defender instanceof ShadowClone$ShadowAlly)) {
        trinityGlyph = Dungeon.hero.buff($J.cls(BodyForm$BodyFormBuff)).glyph();
        if (this.glyph_ != null && trinityGlyph != null && trinityGlyph.getClass() === this.glyph_.getClass()) {
          trinityGlyph = null;
        }
      }
      if (defender instanceof Hero && this.isEquipped(defender) && defender.buff($J.cls(HolyWard$HolyArmBuff)) != null) {
        if (this.glyph_ != null && ((defender).subClass === HeroSubClass.PALADIN || this.hasCurseGlyph())) {
          damage = this.glyph_.proc(this, attacker, defender, damage);
        }
        if (trinityGlyph != null) {
          damage = trinityGlyph.proc(this, attacker, defender, damage);
        }
        let blocking = (defender).subClass === HeroSubClass.PALADIN ? 3 : 1;
        damage = (damage - $J.roundf(Math.fround(blocking * Armor$Glyph.genericProcChanceMultiplier(defender)))) | 0;
      } else {
        if (this.glyph_ != null) {
          damage = this.glyph_.proc(this, attacker, defender, damage);
        }
        if (trinityGlyph != null) {
          damage = trinityGlyph.proc(this, attacker, defender, damage);
        }
        if (defender.alignment === Dungeon.hero.alignment && Dungeon.hero.buff($J.cls(AuraOfProtection$AuraBuff)) != null && (Dungeon.level.distance(defender.pos, Dungeon.hero.pos) <= 2 || defender.buff($J.cls(LifeLinkSpell$LifeLinkSpellBuff)) != null) && Dungeon.hero.buff($J.cls(HolyWard$HolyArmBuff)) != null) {
          let blocking = Dungeon.hero.subClass === HeroSubClass.PALADIN ? 3 : 1;
          damage = (damage - $J.roundf(Math.fround(blocking * Armor$Glyph.genericProcChanceMultiplier(defender)))) | 0;
        }
      }
      damage = Math.max(damage, 0);
    }
    if (!this.levelKnown && defender === Dungeon.hero) {
      let uses = Math.min(this.availableUsesToID, Talent.itemIDSpeedFactor(Dungeon.hero, this));
      this.availableUsesToID = Math.fround(this.availableUsesToID - uses);
      this.usesLeftToID = Math.fround(this.usesLeftToID - uses);
      if (this.usesLeftToID <= Math.fround(0)) {
        if (ShardOfOblivion.passiveIDDisabled()) {
          if (this.usesLeftToID > Math.fround(-1)) {
            GLog.p(Messages.get$Class$String$ObjectArr($J.cls(ShardOfOblivion), 'identify_ready', []), [this.name()]);
          }
          this.setIDReady();
        } else {
          this.identify$();
          GLog.p(Messages.get$Class$String$ObjectArr($J.cls(Armor), 'identify', []), []);
          Badges.validateItemLevelAquired(this);
        }
      }
    }
    return damage;
  }
  onHeroGainExp(levelPercent: number, hero: Hero): void {
    levelPercent = Math.fround(levelPercent * Talent.itemIDSpeedFactor(hero, this));
    if (!this.levelKnown && this.isEquipped(hero) && this.availableUsesToID <= Math.fround(Armor.USES_TO_ID / 2)) {
      this.availableUsesToID = Math.min(Math.fround(Armor.USES_TO_ID / 2), Math.fround(this.availableUsesToID + Math.fround(levelPercent * Armor.USES_TO_ID)));
    }
  }
  name(): string {
    if (this.isEquipped(Dungeon.hero) && !this.hasCurseGlyph() && Dungeon.hero.buff($J.cls(HolyWard$HolyArmBuff)) != null && (Dungeon.hero.subClass !== HeroSubClass.PALADIN || this.glyph_ == null)) {
      return Messages.get$Class$String$ObjectArr($J.cls(HolyWard), 'glyph_name', [super.name()]);
    } else {
      return this.glyph_ != null && (this.cursedKnown || !this.glyph_.curse()) ? this.glyph_.name$String(super.name()) : super.name();
    }
  }
  info(): string {
    let info = super.info();
    if (this.levelKnown) {
      info += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(Armor), 'curr_absorb', [this.tier_, this.DRMin$(), this.DRMax$(), this.STRReq$()]);
      if (Dungeon.hero != null && this.STRReq$() > Dungeon.hero.STR()) {
        info += ' ' + Messages.get$Class$String$ObjectArr($J.cls(Armor), 'too_heavy', []);
      }
    } else {
      info += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(Armor), 'avg_absorb', [this.tier_, this.DRMin$int(0), this.DRMax$int(0), this.STRReq$int(0)]);
      if (Dungeon.hero != null && this.STRReq$int(0) > Dungeon.hero.STR()) {
        info += ' ' + Messages.get$Class$String$ObjectArr($J.cls(Armor), 'probably_too_heavy', []);
      }
    }
    switch (this.augment) {
      case Armor$Augment.EVASION:
        info += ' ' + Messages.get$Class$String$ObjectArr($J.cls(Armor), 'evasion', []);
        break;
      case Armor$Augment.DEFENSE:
        info += ' ' + Messages.get$Class$String$ObjectArr($J.cls(Armor), 'defense', []);
        break;
      case Armor$Augment.NONE:
    }
    if (this.isEquipped(Dungeon.hero) && !this.hasCurseGlyph() && Dungeon.hero.buff($J.cls(HolyWard$HolyArmBuff)) != null && (Dungeon.hero.subClass !== HeroSubClass.PALADIN || this.glyph_ == null)) {
      info += '\n\n' + Messages.capitalize(Messages.get$Class$String$ObjectArr($J.cls(Armor), 'inscribed', [Messages.get$Class$String$ObjectArr($J.cls(HolyWard), 'glyph_name', [Messages.get$Class$String$ObjectArr($J.cls(Armor$Glyph), 'glyph', [])])]));
      info += ' ' + Messages.get$Class$String$ObjectArr($J.cls(HolyWard), 'glyph_desc', []);
    } else if (this.glyph_ != null && (this.cursedKnown || !this.glyph_.curse())) {
      info += '\n\n' + Messages.capitalize(Messages.get$Class$String$ObjectArr($J.cls(Armor), 'inscribed', [this.glyph_.name$()]));
      if (this.glyphHardened) {
        info += ' ' + Messages.get$Class$String$ObjectArr($J.cls(Armor), 'glyph_hardened', []);
      }
      info += ' ' + this.glyph_.desc();
    } else if (this.glyphHardened) {
      info += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(Armor), 'hardened_no_glyph', []);
    }
    if (this.cursed && this.isEquipped(Dungeon.hero)) {
      info += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(Armor), 'cursed_worn', []);
    } else if (this.cursedKnown && this.cursed) {
      info += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(Armor), 'cursed', []);
    } else if (!this.isIdentified() && this.cursedKnown) {
      if (this.glyph_ != null && this.glyph_.curse()) {
        info += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(Armor), 'weak_cursed', []);
      } else {
        info += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(Armor), 'not_cursed', []);
      }
    }
    if (this.seal_ != null) {
      info += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(Armor), 'seal_attached', [this.seal_.maxShield(this.tier_, this.level$())]);
    }
    return info;
  }
  emitter(): Emitter {
    if (this.seal_ == null) {
      return super.emitter();
    }
    let emitter = new Emitter()._Emitter();
    emitter.pos$float$float(Math.fround(Math.fround(ItemSpriteSheet.film.width$Object(this.image_) / 2) + 2), Math.fround(ItemSpriteSheet.film.height$Object(this.image_) / 3));
    emitter.fillTarget = false;
    emitter.pour(Speck.factory$int(Speck.RED_LIGHT), Math.fround(0.6));
    return emitter;
  }
  random(): Item {
    let n = 0;
    if (Random.Int$int(4) === 0) {
      n++;
      if (Random.Int$int(5) === 0) {
        n++;
      }
    }
    this.level$int(n);
    Random.pushGenerator$long(Random.Long$());
    let effectRoll = Random.Float$();
    if (effectRoll < Math.fround(Math.fround(0.3) * ParchmentScrap.curseChanceMultiplier$())) {
      this.inscribe$Glyph(Armor$Glyph.randomCurse([]));
      this.cursed = true;
    } else if (effectRoll >= Math.fround(1 - (Math.fround(Math.fround(0.15) * ParchmentScrap.enchantChanceMultiplier$())))) {
      this.inscribe$();
    }
    Random.popGenerator();
    return this;
  }
  STRReq$(): number {
    return this.STRReq$int(this.level$());
  }
  STRReq$int(lvl: number): number {
    let req = Armor.STRReq(this.tier_, lvl);
    if (this.masteryPotionBonus) {
      req = (req - 2) | 0;
    }
    return req;
  }
  static STRReq(tier: number, lvl: number): number {
    lvl = Math.max(0, lvl);
    return (8 + $J.roundf(Math.fround(Math.imul(tier, 2))) - $J.idiv($J.d2i(((Math.sqrt((Math.imul(8, lvl) + 1) | 0)) - 1)), 2)) | 0;
  }
  value(): number {
    if (this.seal_ != null) {
      return 0;
    }
    let price = Math.imul(20, this.tier_);
    if (this.hasGoodGlyph()) {
      price = $J.d2i(price * 1.5);
    }
    if (this.cursedKnown && (this.cursed || this.hasCurseGlyph())) {
      price = $J.idiv(price, 2);
    }
    if (this.levelKnown && this.level$() > 0) {
      price = Math.imul(price, ((this.level$() + 1) | 0));
    }
    if (price < 1) {
      price = 1;
    }
    return price;
  }
  inscribe$Glyph(glyph: Armor$Glyph): Armor {
    if (glyph == null || !glyph.curse()) {
      this.curseInfusionBonus = false;
    }
    this.glyph_ = glyph;
    Item.updateQuickslot();
    if (this.seal_ != null) {
      this.seal_.setGlyph(glyph);
    }
    if (glyph != null && this.isIdentified() && Dungeon.hero != null && Dungeon.hero.isAlive() && Dungeon.hero.belongings.contains(this)) {
      Catalog.setSeen(glyph.getClass());
      Statistics.itemTypesDiscovered.add(glyph.getClass());
    }
    return this;
  }
  inscribe$(): Armor {
    let oldGlyphClass = this.glyph_ != null ? this.glyph_.getClass() : null;
    let gl = Armor$Glyph.random([oldGlyphClass]);
    return this.inscribe$Glyph(gl);
  }
  hasGlyph(type$: JClass<Armor$Glyph>, owner: Char): boolean {
    if (owner.buff($J.cls(MagicImmune)) != null) {
      return false;
    } else if (this.glyph_ != null && !this.glyph_.curse() && owner instanceof Hero && this.isEquipped(owner) && owner.buff($J.cls(HolyWard$HolyArmBuff)) != null && (owner).subClass !== HeroSubClass.PALADIN) {
      return false;
    } else if (owner.buff($J.cls(BodyForm$BodyFormBuff)) != null && owner.buff($J.cls(BodyForm$BodyFormBuff)).glyph() != null && $J.equals(owner.buff($J.cls(BodyForm$BodyFormBuff)).glyph().getClass(), type$)) {
      return true;
    } else if (this.glyph_ != null) {
      return this.glyph_.getClass() === type$;
    } else {
      return false;
    }
  }
  hasGoodGlyph(): boolean {
    return this.glyph_ != null && !this.glyph_.curse();
  }
  hasCurseGlyph(): boolean {
    return this.glyph_ != null && this.glyph_.curse();
  }
  glowing(): ItemSprite$Glowing {
    if (this.isEquipped(Dungeon.hero) && !this.hasCurseGlyph() && Dungeon.hero.buff($J.cls(HolyWard$HolyArmBuff)) != null && (Dungeon.hero.subClass !== HeroSubClass.PALADIN || this.glyph_ == null)) {
      return Armor.HOLY;
    } else {
      return this.glyph_ != null && (this.cursedKnown || !this.glyph_.curse()) ? this.glyph_.glowing() : null;
    }
  }
  static $clinit() {
    Armor.testingNoArmDefSkill = false;
    Armor.HOLY = new ItemSprite$Glowing()._ItemSprite$Glowing$int(16776960);
  }
}

export class Armor$Augment extends JEnum {
  evasionFactor_: number = 0;
  defenceFactor: number = 0;
  static EVASION: Armor$Augment = null;
  static DEFENSE: Armor$Augment = null;
  static NONE: Armor$Augment = null;
  static $VALUES: Armor$Augment[] = null;
  _Armor$Augment($name: string, $ordinal: number, eva: number, df: number): this {
    this._JEnum($name, $ordinal);
    this.evasionFactor_ = eva;
    this.defenceFactor = df;
    return this;
  }
  evasionFactor(level: number): number {
    return $J.roundf(Math.fround(((2 + level) | 0) * this.evasionFactor_));
  }
  defenseFactor(level: number): number {
    return $J.roundf(Math.fround(((2 + level) | 0) * this.defenceFactor));
  }
  static values(): Armor$Augment[] { return Armor$Augment.$VALUES.slice(); }
  static valueOf(name: string): Armor$Augment { return $J.enumValueOf(Armor$Augment, name); }
  static $clinit() {
    Armor$Augment.EVASION = new Armor$Augment()._Armor$Augment('EVASION', 0, 2, Math.fround(-1));
    Armor$Augment.DEFENSE = new Armor$Augment()._Armor$Augment('DEFENSE', 1, Math.fround(-2), 1);
    Armor$Augment.NONE = new Armor$Augment()._Armor$Augment('NONE', 2, 0, 0);
    Armor$Augment.$VALUES = [Armor$Augment.EVASION, Armor$Augment.DEFENSE, Armor$Augment.NONE];
  }
}

export class Armor$Glyph extends JObject {
  static common: JClass<any>[] = null;
  static uncommon: JClass<any>[] = null;
  static rare: JClass<any>[] = null;
  static typeChances: number[] = null;
  static curses: JClass<any>[] = null;
  _Armor$Glyph(): this {
    return this;
  }
  procChanceMultiplier(defender: Char): number {
    return Armor$Glyph.genericProcChanceMultiplier(defender);
  }
  static genericProcChanceMultiplier(defender: Char): number {
    let multi = RingOfArcana.enchantPowerMultiplier(defender);
    if (Dungeon.hero.alignment === defender.alignment && Dungeon.hero.buff($J.cls(AuraOfProtection$AuraBuff)) != null && (Dungeon.level.distance(defender.pos, Dungeon.hero.pos) <= 2 || defender.buff($J.cls(LifeLinkSpell$LifeLinkSpellBuff)) != null)) {
      multi = Math.fround(multi + Math.fround(0.25 + Math.fround(0.25 * Dungeon.hero.pointsInTalent(Talent.AURA_OF_PROTECTION))));
    }
    return multi;
  }
  name$(): string {
    if (!this.curse()) {
      return this.name$String(Messages.get$Object$String$ObjectArr(this, 'glyph', []));
    } else {
      return this.name$String(Messages.get$Class$String$ObjectArr($J.cls(Item), 'curse', []));
    }
  }
  name$String(armorName: string): string {
    return Messages.get$Object$String$ObjectArr(this, 'name', [armorName]);
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', []);
  }
  curse(): boolean {
    return false;
  }
  restoreFromBundle(bundle: Bundle): void {
  }
  storeInBundle(bundle: Bundle): void {
  }
  static random(toIgnore: JClass<Armor$Glyph>[]): Armor$Glyph {
    switch (Random.chances$floatArr(Armor$Glyph.typeChances)) {
      case 0:
      default:
        return Armor$Glyph.randomCommon(toIgnore);
      case 1:
        return Armor$Glyph.randomUncommon(toIgnore);
      case 2:
        return Armor$Glyph.randomRare(toIgnore);
    }
  }
  static randomCommon(toIgnore: JClass<Armor$Glyph>[]): Armor$Glyph {
    let glyphs = new ArrayList(Arrays.asList(...Armor$Glyph.common));
    glyphs.removeAll(Arrays.asList(...toIgnore));
    if (glyphs.isEmpty()) {
      return Armor$Glyph.random([]);
    } else {
      return Reflection.newInstance(Random.element$Collection(glyphs));
    }
  }
  static randomUncommon(toIgnore: JClass<Armor$Glyph>[]): Armor$Glyph {
    let glyphs = new ArrayList(Arrays.asList(...Armor$Glyph.uncommon));
    glyphs.removeAll(Arrays.asList(...toIgnore));
    if (glyphs.isEmpty()) {
      return Armor$Glyph.random([]);
    } else {
      return Reflection.newInstance(Random.element$Collection(glyphs));
    }
  }
  static randomRare(toIgnore: JClass<Armor$Glyph>[]): Armor$Glyph {
    let glyphs = new ArrayList(Arrays.asList(...Armor$Glyph.rare));
    glyphs.removeAll(Arrays.asList(...toIgnore));
    if (glyphs.isEmpty()) {
      return Armor$Glyph.random([]);
    } else {
      return Reflection.newInstance(Random.element$Collection(glyphs));
    }
  }
  static randomCurse(toIgnore: JClass<Armor$Glyph>[]): Armor$Glyph {
    let glyphs = new ArrayList(Arrays.asList(...Armor$Glyph.curses));
    glyphs.removeAll(Arrays.asList(...toIgnore));
    if (glyphs.isEmpty()) {
      return Armor$Glyph.random([]);
    } else {
      return Reflection.newInstance(Random.element$Collection(glyphs));
    }
  }
  static $clinit() {
    Armor$Glyph.common = [$J.cls(Obfuscation), $J.cls(Swiftness), $J.cls(Viscosity), $J.cls(Potential)];
    Armor$Glyph.uncommon = [$J.cls(Brimstone), $J.cls(Stone), $J.cls(Entanglement), $J.cls(Repulsion), $J.cls(Camouflage), $J.cls(Flow)];
    Armor$Glyph.rare = [$J.cls(Affection), $J.cls(AntiMagic), $J.cls(Thorns)];
    Armor$Glyph.typeChances = [50, 40, 10];
    Armor$Glyph.curses = [$J.cls(AntiEntropy), $J.cls(Corrosion), $J.cls(Displacement), $J.cls(Metabolism), $J.cls(Multiplicity), $J.cls(Stench), $J.cls(Overgrowth), $J.cls(Bulk)];
  }
}

let $Armor$1: any = null;
/** An anonymous class (Armor.java:269). */
function Armor$1(): any {
  return $Armor$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      super.onSelect(index);
      if (index === 0) {
        this.$cv_seal.affixToArmor(this.$outer, this.$cv_oldArmor);
        Item.updateQuickslot();
      }
      super.hide();
    }
    hide(): void {
    }
    $c($seal, $oldArmor): this {
      this.$cv_seal = $seal; this.$cv_oldArmor = $oldArmor;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor$1', []);
}

$J.define(Armor, 'com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.EquipableItem', ctors: { 'int': '_Armor' }, meths: { 'inscribe()': 'inscribe$', 'inscribe(com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor$Glyph)': 'inscribe$Glyph', 'STRReq(int)': 'STRReq$int', 'STRReq()': 'STRReq$', 'upgrade(boolean)': 'upgrade$boolean', 'upgrade()': 'upgrade$', 'level()': 'level$', 'DRMin(int)': 'DRMin$int', 'DRMin()': 'DRMin$', 'DRMax(int)': 'DRMax$int', 'DRMax()': 'DRMax$', 'doUnequip(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,boolean,boolean)': 'doUnequip$Hero$boolean$boolean', 'identify(boolean)': 'identify$boolean', 'collect(com.shatteredpixel.shatteredpixeldungeon.items.bags.Bag)': 'collect$Bag', 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' }, clinit: true, lazy: ['testingNoArmDefSkill', 'HOLY'] });
$J.define(Armor$Augment, 'com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor$Augment', { kind: 'enum', sup: 'java.lang.Enum', ctors: { 'float,float': '_Armor$Augment' }, clinit: true, lazy: ['$VALUES', 'EVASION', 'DEFENSE', 'NONE'] });
$J.define(Armor$Glyph, 'com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor$Glyph', { kind: 'class', ifaces: ['com.watabou.utils.Bundlable'], sup: 'java.lang.Object', ctors: { '': '_Armor$Glyph' }, meths: { 'name(java.lang.String)': 'name$String', 'name()': 'name$' }, clinit: true, lazy: ['common', 'uncommon', 'rare', 'typeChances', 'curses'] });
$J.module(() => {
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  MagicImmune = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MagicImmune');
  Momentum = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Momentum');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  HeroClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  ShadowClone$ShadowAlly = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.rogue.ShadowClone$ShadowAlly');
  AuraOfProtection$AuraBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.AuraOfProtection$AuraBuff');
  BodyForm$BodyFormBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.BodyForm$BodyFormBuff');
  HolyWard = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.HolyWard');
  HolyWard$HolyArmBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.HolyWard$HolyArmBuff');
  LifeLinkSpell$LifeLinkSpellBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.LifeLinkSpell$LifeLinkSpellBuff');
  PrismaticImage = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.PrismaticImage');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  BrokenSeal$WarriorShield = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.BrokenSeal$WarriorShield');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  AntiEntropy = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.curses.AntiEntropy');
  Bulk = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.curses.Bulk');
  Corrosion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.curses.Corrosion');
  Displacement = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.curses.Displacement');
  Metabolism = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.curses.Metabolism');
  Multiplicity = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.curses.Multiplicity');
  Overgrowth = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.curses.Overgrowth');
  Stench = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.curses.Stench');
  Affection = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Affection');
  AntiMagic = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.AntiMagic');
  Brimstone = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Brimstone');
  Camouflage = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Camouflage');
  Entanglement = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Entanglement');
  Flow = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Flow');
  Obfuscation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Obfuscation');
  Potential = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Potential');
  Repulsion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Repulsion');
  Stone = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Stone');
  Swiftness = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Swiftness');
  Thorns = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Thorns');
  Viscosity = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Viscosity');
  RingOfArcana = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfArcana');
  ParchmentScrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ParchmentScrap');
  ShardOfOblivion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ShardOfOblivion');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  Emitter = $J.load('com.watabou.noosa.particles.Emitter');
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
