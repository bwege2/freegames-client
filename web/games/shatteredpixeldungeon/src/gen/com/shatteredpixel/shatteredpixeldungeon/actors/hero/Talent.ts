// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/Talent.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, Exception, HashMap, HashSet, JEnum, LinkedHashMap } from '../../../../../../jre/index.ts';
import { FlavourBuff } from '../buffs/FlavourBuff.ts';
import { CounterBuff } from '../buffs/CounterBuff.ts';
import { Buff } from '../buffs/Buff.ts';

let Assets$Sounds, Dungeon, GamesInProgress, Actor, Char$Alignment, ArtifactRecharge, Barrier, Buff$buffType, EnhancedRings, Haste, Invisibility, LostInventory, PhysicalEmpower, Recharging, RevealedArea, Roots, ScrollEmpower, WandEmpower, HeroClass, HeroSubClass, Ratmogrify, DivineSense$DivineSenseTracker, RecallInscription$UsedItemTracker, Mob, CellEmitter, Flare, FloatingText, SpellSprite, LeafParticle, BrokenSeal$WarriorShield, Item, Armor, ClothArmor, CloakOfShadows, HolyTome, HornOfPlenty, Ring, Scroll, ScrollOfRecharging, ScrollOfUpgrade, Runestone, StoneOfIntuition, StoneOfIntuition$IntuitionUseTracker, ShardOfOblivion, Wand, SpiritBow, SpiritBow$SpiritArrow, Weapon, Gloves, MeleeWeapon, MeleeWeapon$Charger, MissileWeapon, Level, Terrain, Messages, GameScene, CharSprite, BuffIndicator, GLog, Game, Sample, Bundle, GameMath, PathFinder, Random, Reflection;

export class Talent extends JEnum {
  icon_: number = 0;
  maxPoints_: number = 0;
  static tierLevelThresholds: number[] = null;
  static readonly MAX_TALENT_TIERS: number = 4;
  static readonly TALENT_TIER: string = 'talents_tier_';
  static removedTalents: HashSet<string> = null;
  static renamedTalents: HashMap<string, string> = null;
  static HEARTY_MEAL: Talent = null;
  static VETERANS_INTUITION: Talent = null;
  static PROVOKED_ANGER: Talent = null;
  static IRON_WILL: Talent = null;
  static IRON_STOMACH: Talent = null;
  static LIQUID_WILLPOWER: Talent = null;
  static RUNIC_TRANSFERENCE: Talent = null;
  static LETHAL_MOMENTUM: Talent = null;
  static IMPROVISED_PROJECTILES: Talent = null;
  static HOLD_FAST: Talent = null;
  static STRONGMAN: Talent = null;
  static ENDLESS_RAGE: Talent = null;
  static DEATHLESS_FURY: Talent = null;
  static ENRAGED_CATALYST: Talent = null;
  static CLEAVE: Talent = null;
  static LETHAL_DEFENSE: Talent = null;
  static ENHANCED_COMBO: Talent = null;
  static BODY_SLAM: Talent = null;
  static IMPACT_WAVE: Talent = null;
  static DOUBLE_JUMP: Talent = null;
  static EXPANDING_WAVE: Talent = null;
  static STRIKING_WAVE: Talent = null;
  static SHOCK_FORCE: Talent = null;
  static SUSTAINED_RETRIBUTION: Talent = null;
  static SHRUG_IT_OFF: Talent = null;
  static EVEN_THE_ODDS: Talent = null;
  static EMPOWERING_MEAL: Talent = null;
  static SCHOLARS_INTUITION: Talent = null;
  static LINGERING_MAGIC: Talent = null;
  static BACKUP_BARRIER: Talent = null;
  static ENERGIZING_MEAL: Talent = null;
  static INSCRIBED_POWER: Talent = null;
  static WAND_PRESERVATION: Talent = null;
  static ARCANE_VISION: Talent = null;
  static SHIELD_BATTERY: Talent = null;
  static DESPERATE_POWER: Talent = null;
  static ALLY_WARP: Talent = null;
  static EMPOWERED_STRIKE: Talent = null;
  static MYSTICAL_CHARGE: Talent = null;
  static EXCESS_CHARGE: Talent = null;
  static SOUL_EATER: Talent = null;
  static SOUL_SIPHON: Talent = null;
  static NECROMANCERS_MINIONS: Talent = null;
  static BLAST_RADIUS: Talent = null;
  static ELEMENTAL_POWER: Talent = null;
  static REACTIVE_BARRIER: Talent = null;
  static WILD_POWER: Talent = null;
  static FIRE_EVERYTHING: Talent = null;
  static CONSERVED_MAGIC: Talent = null;
  static TELEFRAG: Talent = null;
  static REMOTE_BEACON: Talent = null;
  static LONGRANGE_WARP: Talent = null;
  static CACHED_RATIONS: Talent = null;
  static THIEFS_INTUITION: Talent = null;
  static SUCKER_PUNCH: Talent = null;
  static PROTECTIVE_SHADOWS: Talent = null;
  static MYSTICAL_MEAL: Talent = null;
  static INSCRIBED_STEALTH: Talent = null;
  static WIDE_SEARCH: Talent = null;
  static SILENT_STEPS: Talent = null;
  static ROGUES_FORESIGHT: Talent = null;
  static ENHANCED_RINGS: Talent = null;
  static LIGHT_CLOAK: Talent = null;
  static ENHANCED_LETHALITY: Talent = null;
  static ASSASSINS_REACH: Talent = null;
  static BOUNTY_HUNTER: Talent = null;
  static EVASIVE_ARMOR: Talent = null;
  static PROJECTILE_MOMENTUM: Talent = null;
  static SPEEDY_STEALTH: Talent = null;
  static HASTY_RETREAT: Talent = null;
  static BODY_REPLACEMENT: Talent = null;
  static SHADOW_STEP: Talent = null;
  static FEAR_THE_REAPER: Talent = null;
  static DEATHLY_DURABILITY: Talent = null;
  static DOUBLE_MARK: Talent = null;
  static SHADOW_BLADE: Talent = null;
  static CLONED_ARMOR: Talent = null;
  static PERFECT_COPY: Talent = null;
  static NATURES_BOUNTY: Talent = null;
  static SURVIVALISTS_INTUITION: Talent = null;
  static FOLLOWUP_STRIKE: Talent = null;
  static NATURES_AID: Talent = null;
  static INVIGORATING_MEAL: Talent = null;
  static LIQUID_NATURE: Talent = null;
  static REJUVENATING_STEPS: Talent = null;
  static HEIGHTENED_SENSES: Talent = null;
  static DURABLE_PROJECTILES: Talent = null;
  static POINT_BLANK: Talent = null;
  static SEER_SHOT: Talent = null;
  static FARSIGHT: Talent = null;
  static SHARED_ENCHANTMENT: Talent = null;
  static SHARED_UPGRADES: Talent = null;
  static DURABLE_TIPS: Talent = null;
  static BARKSKIN: Talent = null;
  static SHIELDING_DEW: Talent = null;
  static FAN_OF_BLADES: Talent = null;
  static PROJECTING_BLADES: Talent = null;
  static SPIRIT_BLADES: Talent = null;
  static GROWING_POWER: Talent = null;
  static NATURES_WRATH: Talent = null;
  static WILD_MOMENTUM: Talent = null;
  static EAGLE_EYE: Talent = null;
  static GO_FOR_THE_EYES: Talent = null;
  static SWIFT_SPIRIT: Talent = null;
  static STRENGTHENING_MEAL: Talent = null;
  static ADVENTURERS_INTUITION: Talent = null;
  static PATIENT_STRIKE: Talent = null;
  static AGGRESSIVE_BARRIER: Talent = null;
  static FOCUSED_MEAL: Talent = null;
  static LIQUID_AGILITY: Talent = null;
  static WEAPON_RECHARGING: Talent = null;
  static LETHAL_HASTE: Talent = null;
  static SWIFT_EQUIP: Talent = null;
  static PRECISE_ASSAULT: Talent = null;
  static DEADLY_FOLLOWUP: Talent = null;
  static VARIED_CHARGE: Talent = null;
  static TWIN_UPGRADES: Talent = null;
  static COMBINED_LETHALITY: Talent = null;
  static UNENCUMBERED_SPIRIT: Talent = null;
  static MONASTIC_VIGOR: Talent = null;
  static COMBINED_ENERGY: Talent = null;
  static CLOSE_THE_GAP: Talent = null;
  static INVIGORATING_VICTORY: Talent = null;
  static ELIMINATION_MATCH: Talent = null;
  static ELEMENTAL_REACH: Talent = null;
  static STRIKING_FORCE: Talent = null;
  static DIRECTED_POWER: Talent = null;
  static FEIGNED_RETREAT: Talent = null;
  static EXPOSE_WEAKNESS: Talent = null;
  static COUNTER_ABILITY: Talent = null;
  static SATIATED_SPELLS: Talent = null;
  static HOLY_INTUITION: Talent = null;
  static SEARING_LIGHT: Talent = null;
  static SHIELD_OF_LIGHT: Talent = null;
  static ENLIGHTENING_MEAL: Talent = null;
  static RECALL_INSCRIPTION: Talent = null;
  static SUNRAY: Talent = null;
  static DIVINE_SENSE: Talent = null;
  static BLESS: Talent = null;
  static CLEANSE: Talent = null;
  static LIGHT_READING: Talent = null;
  static HOLY_LANCE: Talent = null;
  static HALLOWED_GROUND: Talent = null;
  static MNEMONIC_PRAYER: Talent = null;
  static LAY_ON_HANDS: Talent = null;
  static AURA_OF_PROTECTION: Talent = null;
  static WALL_OF_LIGHT: Talent = null;
  static DIVINE_INTERVENTION: Talent = null;
  static JUDGEMENT: Talent = null;
  static FLASH: Talent = null;
  static BODY_FORM: Talent = null;
  static MIND_FORM: Talent = null;
  static SPIRIT_FORM: Talent = null;
  static BEAMING_RAY: Talent = null;
  static LIFE_LINK: Talent = null;
  static STASIS: Talent = null;
  static HEROIC_ENERGY: Talent = null;
  static RATSISTANCE: Talent = null;
  static RATLOMACY: Talent = null;
  static RATFORCEMENTS: Talent = null;
  static $VALUES: Talent[] = null;
  _Talent$int($name: string, $ordinal: number, icon: number): this {
    this._Talent$int$int($name, $ordinal, icon, 2);
    return this;
  }
  _Talent$int$int($name: string, $ordinal: number, icon: number, maxPoints: number): this {
    this._JEnum($name, $ordinal);
    this.icon_ = icon;
    this.maxPoints_ = maxPoints;
    return this;
  }
  icon(): number {
    if (this === Talent.HEROIC_ENERGY) {
      if (Ratmogrify.useRatroicEnergy) {
        return 218;
      }
      let cls = Dungeon.hero != null ? Dungeon.hero.heroClass : GamesInProgress.selectedClass;
      switch (cls) {
        case HeroClass.WARRIOR:
        default:
          return 26;
        case HeroClass.MAGE:
          return 58;
        case HeroClass.ROGUE:
          return 90;
        case HeroClass.HUNTRESS:
          return 122;
        case HeroClass.DUELIST:
          return 154;
        case HeroClass.CLERIC:
          return 186;
      }
    } else {
      return this.icon_;
    }
  }
  maxPoints(): number {
    return this.maxPoints_;
  }
  title(): string {
    if (this === Talent.HEROIC_ENERGY && Ratmogrify.useRatroicEnergy) {
      return Messages.get$Object$String$ObjectArr(this, this.name() + '.rat_title', []);
    }
    return Messages.get$Object$String$ObjectArr(this, this.name() + '.title', []);
  }
  desc$(): string {
    return this.desc$boolean(false);
  }
  desc$boolean(metamorphed: boolean): string {
    if (metamorphed) {
      let metaDesc = Messages.get$Object$String$ObjectArr(this, this.name() + '.meta_desc', []);
      if (!$J.equals(metaDesc, Messages.NO_TEXT_FOUND)) {
        return Messages.get$Object$String$ObjectArr(this, this.name() + '.desc', []) + '\n\n' + metaDesc;
      }
    }
    return Messages.get$Object$String$ObjectArr(this, this.name() + '.desc', []);
  }
  static onTalentUpgraded(hero: Hero, talent: Talent): void {
    if (talent === Talent.IRON_WILL && hero.heroClass !== HeroClass.WARRIOR) {
      Buff.affect$Char$Class(hero, $J.cls(BrokenSeal$WarriorShield));
    }
    if (talent === Talent.VETERANS_INTUITION && hero.pointsInTalent(Talent.VETERANS_INTUITION) === 2) {
      if (hero.belongings.armor() != null && !ShardOfOblivion.passiveIDDisabled()) {
        hero.belongings.armor_.identify$();
      }
    }
    if (talent === Talent.THIEFS_INTUITION && hero.pointsInTalent(Talent.THIEFS_INTUITION) === 2) {
      if (hero.belongings.ring_ instanceof Ring && !ShardOfOblivion.passiveIDDisabled()) {
        hero.belongings.ring_.identify$();
      }
      if (hero.belongings.misc_ instanceof Ring && !ShardOfOblivion.passiveIDDisabled()) {
        hero.belongings.misc_.identify$();
      }
      for (const $it0 = Dungeon.hero.belongings.iterator(); $it0.hasNext(); ) {
        let item = $it0.next();
        if (item instanceof Ring) {
          (item).setKnown();
        }
      }
    }
    if (talent === Talent.THIEFS_INTUITION && hero.pointsInTalent(Talent.THIEFS_INTUITION) === 1) {
      if (hero.belongings.ring_ instanceof Ring) {
        hero.belongings.ring_.setKnown();
      }
      if (hero.belongings.misc_ instanceof Ring) {
        (hero.belongings.misc_).setKnown();
      }
    }
    if (talent === Talent.ADVENTURERS_INTUITION && hero.pointsInTalent(Talent.ADVENTURERS_INTUITION) === 2) {
      if (hero.belongings.weapon() != null && !ShardOfOblivion.passiveIDDisabled()) {
        hero.belongings.weapon().identify$();
      }
      if (hero.belongings.secondWep() != null && !ShardOfOblivion.passiveIDDisabled()) {
        hero.belongings.secondWep().identify$();
      }
    }
    if (talent === Talent.PROTECTIVE_SHADOWS && hero.invisible > 0) {
      Buff.affect$Char$Class(hero, $J.cls(Talent$ProtectiveShadowsTracker));
    }
    if (talent === Talent.LIGHT_CLOAK && hero.heroClass === HeroClass.ROGUE) {
      for (const $it1 = Dungeon.hero.belongings.backpack.iterator(); $it1.hasNext(); ) {
        let item = $it1.next();
        if (item instanceof CloakOfShadows) {
          if (!hero.belongings.lostInventory$() || item.keptThroughLostInventory()) {
            (item).activate(Dungeon.hero);
          }
        }
      }
    }
    if (talent === Talent.HEIGHTENED_SENSES || talent === Talent.FARSIGHT || talent === Talent.DIVINE_SENSE) {
      Dungeon.observe$();
    }
    if (talent === Talent.TWIN_UPGRADES || talent === Talent.DESPERATE_POWER || talent === Talent.STRONGMAN || talent === Talent.DURABLE_PROJECTILES) {
      Item.updateQuickslot();
    }
    if (talent === Talent.UNENCUMBERED_SPIRIT && hero.pointsInTalent(talent) === 3) {
      let toGive = new ClothArmor()._ClothArmor().identify$();
      if (!toGive.collect$()) {
        Dungeon.level.drop(toGive, hero.pos).sprite_.drop$();
      }
      toGive = new Gloves()._Gloves().identify$();
      if (!toGive.collect$()) {
        Dungeon.level.drop(toGive, hero.pos).sprite_.drop$();
      }
    }
    if (talent === Talent.LIGHT_READING && hero.heroClass === HeroClass.CLERIC) {
      for (const $it2 = Dungeon.hero.belongings.backpack.iterator(); $it2.hasNext(); ) {
        let item = $it2.next();
        if (item instanceof HolyTome) {
          if (!hero.belongings.lostInventory$() || item.keptThroughLostInventory()) {
            (item).activate(Dungeon.hero);
          }
        }
      }
    }
    if (talent === Talent.SPIRIT_FORM) {
      Dungeon.hero.updateHT(false);
    }
  }
  static onFoodEaten(hero: Hero, foodVal: number, foodSource: Item): void {
    if (hero.hasTalent(Talent.HEARTY_MEAL)) {
      if (Math.fround(hero.HP / Math.fround(hero.HT)) < Math.fround(0.334)) {
        let healing = (2 + Math.imul(2, hero.pointsInTalent(Talent.HEARTY_MEAL))) | 0;
        hero.HP = Math.min((hero.HP + healing) | 0, hero.HT);
        hero.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(healing), FloatingText.HEALING, []);
      }
    }
    if (hero.hasTalent(Talent.IRON_STOMACH)) {
      if (hero.cooldown() > Math.fround(0)) {
        Buff.affect$Char$Class$float(hero, $J.cls(Talent$WarriorFoodImmunity), hero.cooldown());
      }
    }
    if (hero.hasTalent(Talent.EMPOWERING_MEAL)) {
      Buff.affect$Char$Class(hero, $J.cls(WandEmpower)).set((1 + hero.pointsInTalent(Talent.EMPOWERING_MEAL)) | 0, 3);
      ScrollOfRecharging.charge(hero);
    }
    let wandChargeTurns = 0;
    if (hero.hasTalent(Talent.ENERGIZING_MEAL)) {
      wandChargeTurns = (wandChargeTurns + (2 + Math.imul(3, hero.pointsInTalent(Talent.ENERGIZING_MEAL)))) | 0;
    }
    let artifactChargeTurns = 0;
    if (hero.hasTalent(Talent.MYSTICAL_MEAL)) {
      artifactChargeTurns = (artifactChargeTurns + (1 + Math.imul(2, hero.pointsInTalent(Talent.MYSTICAL_MEAL)))) | 0;
    }
    if (hero.hasTalent(Talent.INVIGORATING_MEAL)) {
      Buff.prolong(hero, $J.cls(Haste), Math.fround(Math.fround(0.67) + hero.pointsInTalent(Talent.INVIGORATING_MEAL)));
    }
    if (hero.hasTalent(Talent.STRENGTHENING_MEAL)) {
      Buff.affect$Char$Class(hero, $J.cls(PhysicalEmpower)).set(3, (1 + hero.pointsInTalent(Talent.STRENGTHENING_MEAL)) | 0);
    }
    if (hero.hasTalent(Talent.FOCUSED_MEAL)) {
      if (hero.heroClass === HeroClass.DUELIST) {
        Buff.affect$Char$Class(hero, $J.cls(MeleeWeapon$Charger)).gainCharge(Math.fround(((hero.pointsInTalent(Talent.FOCUSED_MEAL) + 1) | 0) / 3));
        ScrollOfRecharging.charge(hero);
      } else {
        Buff.affect$Char$Class(hero, $J.cls(PhysicalEmpower)).set($J.roundf(Math.fround(hero.lvl / (Math.fround(4 - hero.pointsInTalent(Talent.FOCUSED_MEAL))))), 1);
      }
    }
    if (hero.hasTalent(Talent.SATIATED_SPELLS)) {
      if (hero.heroClass === HeroClass.CLERIC) {
        Buff.affect$Char$Class(hero, $J.cls(Talent$SatiatedSpellsTracker));
      } else {
        let amount = (1 + Math.imul(2, hero.pointsInTalent(Talent.SATIATED_SPELLS))) | 0;
        let b = Buff.affect$Char$Class(hero, $J.cls(Barrier));
        if (b.shielding() <= amount) {
          b.setShield(amount);
          b.delay(Math.max(Math.fround(10 - b.cooldown()), 0));
        }
      }
    }
    if (hero.hasTalent(Talent.ENLIGHTENING_MEAL)) {
      if (hero.heroClass === HeroClass.CLERIC) {
        let tome = hero.belongings.getItem($J.cls(HolyTome));
        if (tome != null) {
          tome.directCharge(Math.fround(((1 + hero.pointsInTalent(Talent.ENLIGHTENING_MEAL)) | 0) / 3));
          ScrollOfRecharging.charge(hero);
        }
      } else {
        wandChargeTurns = (wandChargeTurns + (1 + hero.pointsInTalent(Talent.ENLIGHTENING_MEAL))) | 0;
        artifactChargeTurns = (artifactChargeTurns + (1 + hero.pointsInTalent(Talent.ENLIGHTENING_MEAL))) | 0;
      }
    }
    if (wandChargeTurns > 0) {
      Buff.prolong(hero, $J.cls(Recharging), Math.fround(wandChargeTurns));
      ScrollOfRecharging.charge(hero);
      SpellSprite.show$Char$int(hero, SpellSprite.CHARGE);
    }
    if (artifactChargeTurns > 0) {
      let buff = Buff.affect$Char$Class(hero, $J.cls(ArtifactRecharge));
      if (buff.left() < Math.fround(artifactChargeTurns)) {
        buff.set(Math.fround(artifactChargeTurns)).ignoreHornOfPlenty = foodSource instanceof HornOfPlenty;
      }
      ScrollOfRecharging.charge(hero);
      SpellSprite.show$Char$int$float$float$float(hero, SpellSprite.CHARGE, 0, 1, 1);
    }
  }
  static itemIDSpeedFactor(hero: Hero, item: Item): number {
    let factor = 1;
    if (item instanceof MeleeWeapon) {
      factor = Math.fround(factor * Math.fround(1 + Math.fround(1.5 * hero.pointsInTalent(Talent.ADVENTURERS_INTUITION))));
      factor = Math.fround(factor * Math.fround(1 + Math.fround(0.75 * hero.pointsInTalent(Talent.VETERANS_INTUITION))));
    }
    if (item instanceof Armor) {
      factor = Math.fround(factor * Math.fround(1 + Math.fround(0.75 * hero.pointsInTalent(Talent.ADVENTURERS_INTUITION))));
      factor = Math.fround(factor * Math.fround(1 + hero.pointsInTalent(Talent.VETERANS_INTUITION)));
    }
    if (item instanceof Wand) {
      factor = Math.fround(factor * Math.fround(1 + Math.fround(2 * hero.pointsInTalent(Talent.SCHOLARS_INTUITION))));
    }
    if (item instanceof MissileWeapon) {
      factor = Math.fround(factor * Math.fround(1 + Math.fround(2 * hero.pointsInTalent(Talent.SURVIVALISTS_INTUITION))));
    }
    if (item instanceof Ring) {
      factor = Math.fround(factor * Math.fround(1 + hero.pointsInTalent(Talent.THIEFS_INTUITION)));
    }
    return factor;
  }
  static onPotionUsed(hero: Hero, cell: number, factor: number): void {
    if (hero.hasTalent(Talent.LIQUID_WILLPOWER)) {
      let shieldToGive = $J.roundf(Math.fround(Math.fround(factor * hero.HT) * (Math.fround(Math.fround(0.03) + Math.fround(Math.fround(0.035) * hero.pointsInTalent(Talent.LIQUID_WILLPOWER))))));
      hero.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(shieldToGive), FloatingText.SHIELDING, []);
      Buff.affect$Char$Class(hero, $J.cls(Barrier)).setShield(shieldToGive);
    }
    if (hero.hasTalent(Talent.LIQUID_NATURE)) {
      let grassCells = new ArrayList();
      for (let i of PathFinder.NEIGHBOURS9) {
        grassCells.add((cell + i) | 0);
      }
      Random.shuffle$List(grassCells);
      for (const $it3 = grassCells.iterator(); $it3.hasNext(); ) {
        let grassCell = $it3.next();
        let ch = Actor.findChar(grassCell);
        if (ch != null && ch.alignment === Char$Alignment.ENEMY) {
          Buff.affect$Char$Class$float(ch, $J.cls(Roots), Math.fround(factor * hero.pointsInTalent(Talent.LIQUID_NATURE)));
        }
        if (Dungeon.level.map_[grassCell] === Terrain.EMPTY || Dungeon.level.map_[grassCell] === Terrain.EMBERS || Dungeon.level.map_[grassCell] === Terrain.EMPTY_DECO) {
          Level.set$int$int(grassCell, Terrain.GRASS);
          GameScene.updateMap$int(grassCell);
        }
        CellEmitter.get(grassCell).burst(LeafParticle.LEVEL_SPECIFIC, 4);
      }
      let totalGrassCells = $J.d2i((Math.fround(factor * ((2 + Math.imul(2, hero.pointsInTalent(Talent.LIQUID_NATURE))) | 0))));
      while (grassCells.size() > totalGrassCells) {
        grassCells.removeAt(0);
      }
      for (const $it4 = grassCells.iterator(); $it4.hasNext(); ) {
        let grassCell = $it4.next();
        let t = Dungeon.level.map_[grassCell];
        if ((t === Terrain.EMPTY || t === Terrain.EMPTY_DECO || t === Terrain.EMBERS || t === Terrain.GRASS || t === Terrain.FURROWED_GRASS) && Dungeon.level.plants.get(grassCell) == null) {
          Level.set$int$int(grassCell, Terrain.HIGH_GRASS);
          GameScene.updateMap$int(grassCell);
        }
      }
      Dungeon.observe$();
    }
    if (hero.hasTalent(Talent.LIQUID_AGILITY)) {
      Buff.prolong(hero, $J.cls(Talent$LiquidAgilEVATracker), Math.fround(hero.cooldown() + Math.max(0, Math.fround(factor - 1))));
      if (factor >= 0.5) {
        Buff.prolong(hero, $J.cls(Talent$LiquidAgilACCTracker), 5).uses = $J.roundf(factor);
      }
    }
  }
  static onScrollUsed(hero: Hero, pos: number, factor: number, cls: JClass<Item>): void {
    if (hero.hasTalent(Talent.INSCRIBED_POWER)) {
      Buff.affect$Char$Class(hero, $J.cls(ScrollEmpower)).reset($J.d2i((Math.fround(factor * ((1 + hero.pointsInTalent(Talent.INSCRIBED_POWER)) | 0)))));
    }
    if (hero.hasTalent(Talent.INSCRIBED_STEALTH)) {
      Buff.affect$Char$Class$float(hero, $J.cls(Invisibility), Math.fround(factor * ((1 + Math.imul(2, hero.pointsInTalent(Talent.INSCRIBED_STEALTH))) | 0)));
      Sample.INSTANCE.play$Object(Assets$Sounds.MELD);
    }
    if (hero.hasTalent(Talent.RECALL_INSCRIPTION) && $J.cls(Scroll).isAssignableFrom(cls) && cls !== $J.cls(ScrollOfUpgrade)) {
      if (hero.heroClass === HeroClass.CLERIC) {
        Buff.prolong(hero, $J.cls(RecallInscription$UsedItemTracker), Math.fround(hero.pointsInTalent(Talent.RECALL_INSCRIPTION) === 2 ? 300 : 10)).item_ = cls;
      } else {
        if (Random.Int$int(20) < ((1 + hero.pointsInTalent(Talent.RECALL_INSCRIPTION)) | 0)) {
          Reflection.newInstance(cls).collect$();
          GLog.p(Messages.get$Class$String$ObjectArr($J.cls(Talent), Talent.RECALL_INSCRIPTION.name() + '.refunded', []), []);
        }
      }
    }
  }
  static onRunestoneUsed(hero: Hero, pos: number, cls: JClass<Item>): void {
    if (hero.hasTalent(Talent.RECALL_INSCRIPTION) && $J.cls(Runestone).isAssignableFrom(cls)) {
      if (hero.heroClass === HeroClass.CLERIC) {
        Buff.prolong(hero, $J.cls(RecallInscription$UsedItemTracker), Math.fround(hero.pointsInTalent(Talent.RECALL_INSCRIPTION) === 2 ? 300 : 10)).item_ = cls;
      } else {
        if ($J.equals(cls, $J.cls(StoneOfIntuition)) && hero.buff($J.cls(StoneOfIntuition$IntuitionUseTracker)) != null) {
          return;
        }
        if (Random.Int$int(20) < ((1 + hero.pointsInTalent(Talent.RECALL_INSCRIPTION)) | 0)) {
          Reflection.newInstance(cls).collect$();
          GLog.p(Messages.get$Class$String$ObjectArr($J.cls(Talent), Talent.RECALL_INSCRIPTION.name() + '.refunded', []), []);
        }
      }
    }
  }
  static onArtifactUsed(hero: Hero): void {
    if (hero.hasTalent(Talent.ENHANCED_RINGS)) {
      Buff.prolong(hero, $J.cls(EnhancedRings), Math.fround(3 * hero.pointsInTalent(Talent.ENHANCED_RINGS)));
    }
    if (Dungeon.hero.heroClass !== HeroClass.CLERIC && Dungeon.hero.hasTalent(Talent.DIVINE_SENSE)) {
      Buff.prolong(Dungeon.hero, $J.cls(DivineSense$DivineSenseTracker), Math.fround(Dungeon.hero.cooldown() + 1));
    }
    if (Dungeon.hero.heroClass !== HeroClass.CLERIC && Dungeon.hero.hasTalent(Talent.CLEANSE) && Random.Int$int(10) < Dungeon.hero.pointsInTalent(Talent.CLEANSE)) {
      let removed = false;
      for (const $it5 = Dungeon.hero.buffs$().iterator(); $it5.hasNext(); ) {
        let b = $it5.next();
        if (b.type_ === Buff$buffType.NEGATIVE && !(b instanceof LostInventory)) {
          b.detach();
          removed = true;
        }
      }
      if (removed && Dungeon.hero.sprite_ != null) {
        new Flare()._Flare(6, 32).color$int$boolean(16731346, true).show$Visual$float(Dungeon.hero.sprite_, 2);
      }
    }
  }
  static onItemEquipped(hero: Hero, item: Item): void {
    let identify = false;
    if (hero.pointsInTalent(Talent.VETERANS_INTUITION) === 2 && item instanceof Armor) {
      identify = true;
    }
    if (hero.hasTalent(Talent.THIEFS_INTUITION) && item instanceof Ring) {
      if (hero.pointsInTalent(Talent.THIEFS_INTUITION) === 2) {
        identify = true;
      }
      (item).setKnown();
    }
    if (hero.pointsInTalent(Talent.ADVENTURERS_INTUITION) === 2 && item instanceof Weapon) {
      identify = true;
    }
    if (identify) {
      if (ShardOfOblivion.passiveIDDisabled()) {
        if (item instanceof Weapon) {
          (item).setIDReady();
        } else if (item instanceof Armor) {
          (item).setIDReady();
        } else if (item instanceof Ring) {
          (item).setIDReady();
        }
      } else {
        item.identify$();
      }
    }
  }
  static onItemCollected(hero: Hero, item: Item): void {
    if (hero.pointsInTalent(Talent.THIEFS_INTUITION) === 2) {
      if (item instanceof Ring) {
        (item).setKnown();
      }
    }
  }
  static onAttackProc(hero: Hero, enemy: Char, dmg: number): number {
    if (hero.hasTalent(Talent.PROVOKED_ANGER) && hero.buff($J.cls(Talent$ProvokedAngerTracker)) != null) {
      dmg = (dmg + (1 + Math.imul(2, hero.pointsInTalent(Talent.PROVOKED_ANGER)))) | 0;
      hero.buff($J.cls(Talent$ProvokedAngerTracker)).detach();
    }
    if (hero.hasTalent(Talent.LINGERING_MAGIC) && hero.buff($J.cls(Talent$LingeringMagicTracker)) != null) {
      dmg = (dmg + Random.IntRange(hero.pointsInTalent(Talent.LINGERING_MAGIC), 2)) | 0;
      hero.buff($J.cls(Talent$LingeringMagicTracker)).detach();
    }
    if (hero.hasTalent(Talent.SUCKER_PUNCH) && enemy instanceof Mob && (enemy).surprisedBy$Char(hero) && enemy.buff($J.cls(Talent$SuckerPunchTracker)) == null) {
      dmg = (dmg + Random.IntRange(hero.pointsInTalent(Talent.SUCKER_PUNCH), 2)) | 0;
      Buff.affect$Char$Class(enemy, $J.cls(Talent$SuckerPunchTracker));
    }
    if (hero.hasTalent(Talent.FOLLOWUP_STRIKE) && enemy.isAlive() && enemy.alignment === Char$Alignment.ENEMY) {
      if (hero.belongings.attackingWeapon() instanceof MissileWeapon) {
        Buff.prolong(hero, $J.cls(Talent$FollowupStrikeTracker), 5).object = enemy.id();
      } else if (hero.buff($J.cls(Talent$FollowupStrikeTracker)) != null && hero.buff($J.cls(Talent$FollowupStrikeTracker)).object === enemy.id()) {
        dmg = (dmg + (1 + hero.pointsInTalent(Talent.FOLLOWUP_STRIKE))) | 0;
        hero.buff($J.cls(Talent$FollowupStrikeTracker)).detach();
      }
    }
    if (hero.buff($J.cls(Talent$SpiritBladesTracker)) != null && Random.Int$int(10) < Math.imul(3, hero.pointsInTalent(Talent.SPIRIT_BLADES))) {
      let bow = hero.belongings.getItem($J.cls(SpiritBow));
      if (bow != null) {
        dmg = bow.proc(hero, enemy, dmg);
      }
      hero.buff($J.cls(Talent$SpiritBladesTracker)).detach();
    }
    if (hero.hasTalent(Talent.PATIENT_STRIKE)) {
      if (hero.buff($J.cls(Talent$PatientStrikeTracker)) != null && !(hero.belongings.attackingWeapon() instanceof MissileWeapon)) {
        hero.buff($J.cls(Talent$PatientStrikeTracker)).detach();
        dmg = (dmg + Random.IntRange(hero.pointsInTalent(Talent.PATIENT_STRIKE), 2)) | 0;
      }
    }
    if (hero.hasTalent(Talent.DEADLY_FOLLOWUP) && enemy.alignment === Char$Alignment.ENEMY) {
      if (hero.belongings.attackingWeapon() instanceof MissileWeapon) {
        if (!(hero.belongings.attackingWeapon() instanceof SpiritBow$SpiritArrow)) {
          Buff.prolong(hero, $J.cls(Talent$DeadlyFollowupTracker), 5).object = enemy.id();
        }
      } else if (hero.buff($J.cls(Talent$DeadlyFollowupTracker)) != null && hero.buff($J.cls(Talent$DeadlyFollowupTracker)).object === enemy.id()) {
        dmg = $J.roundf(Math.fround(dmg * (Math.fround(1 + Math.fround(Math.fround(0.1) * hero.pointsInTalent(Talent.DEADLY_FOLLOWUP))))));
      }
    }
    return dmg;
  }
  static initClassTalents$Hero(hero: Hero): void {
    Talent.initClassTalents$HeroClass$ArrayList$LinkedHashMap(hero.heroClass, hero.talents_, hero.metamorphedTalents);
  }
  static initClassTalents$HeroClass$ArrayList(cls: HeroClass, talents: ArrayList<LinkedHashMap<Talent, number>>): void {
    Talent.initClassTalents$HeroClass$ArrayList$LinkedHashMap(cls, talents, new LinkedHashMap());
  }
  static initClassTalents$HeroClass$ArrayList$LinkedHashMap(cls: HeroClass, talents: ArrayList<LinkedHashMap<Talent, number>>, replacements: LinkedHashMap<Talent, Talent>): void {
    while (talents.size() < Talent.MAX_TALENT_TIERS) {
      talents.add(new LinkedHashMap());
    }
    let tierTalents = new ArrayList();
    switch (cls) {
      case HeroClass.WARRIOR:
      default:
        Collections.addAll(tierTalents, Talent.HEARTY_MEAL, Talent.VETERANS_INTUITION, Talent.PROVOKED_ANGER, Talent.IRON_WILL);
        break;
      case HeroClass.MAGE:
        Collections.addAll(tierTalents, Talent.EMPOWERING_MEAL, Talent.SCHOLARS_INTUITION, Talent.LINGERING_MAGIC, Talent.BACKUP_BARRIER);
        break;
      case HeroClass.ROGUE:
        Collections.addAll(tierTalents, Talent.CACHED_RATIONS, Talent.THIEFS_INTUITION, Talent.SUCKER_PUNCH, Talent.PROTECTIVE_SHADOWS);
        break;
      case HeroClass.HUNTRESS:
        Collections.addAll(tierTalents, Talent.NATURES_BOUNTY, Talent.SURVIVALISTS_INTUITION, Talent.FOLLOWUP_STRIKE, Talent.NATURES_AID);
        break;
      case HeroClass.DUELIST:
        Collections.addAll(tierTalents, Talent.STRENGTHENING_MEAL, Talent.ADVENTURERS_INTUITION, Talent.PATIENT_STRIKE, Talent.AGGRESSIVE_BARRIER);
        break;
      case HeroClass.CLERIC:
        Collections.addAll(tierTalents, Talent.SATIATED_SPELLS, Talent.HOLY_INTUITION, Talent.SEARING_LIGHT, Talent.SHIELD_OF_LIGHT);
        break;
    }
    for (const $it6 = tierTalents.iterator(); $it6.hasNext(); ) {
      let talent = $it6.next();
      if (replacements.containsKey(talent)) {
        talent = replacements.get(talent);
      }
      talents.get(0).put(talent, 0);
    }
    tierTalents.clear();
    switch (cls) {
      case HeroClass.WARRIOR:
      default:
        Collections.addAll(tierTalents, Talent.IRON_STOMACH, Talent.LIQUID_WILLPOWER, Talent.RUNIC_TRANSFERENCE, Talent.LETHAL_MOMENTUM, Talent.IMPROVISED_PROJECTILES);
        break;
      case HeroClass.MAGE:
        Collections.addAll(tierTalents, Talent.ENERGIZING_MEAL, Talent.INSCRIBED_POWER, Talent.WAND_PRESERVATION, Talent.ARCANE_VISION, Talent.SHIELD_BATTERY);
        break;
      case HeroClass.ROGUE:
        Collections.addAll(tierTalents, Talent.MYSTICAL_MEAL, Talent.INSCRIBED_STEALTH, Talent.WIDE_SEARCH, Talent.SILENT_STEPS, Talent.ROGUES_FORESIGHT);
        break;
      case HeroClass.HUNTRESS:
        Collections.addAll(tierTalents, Talent.INVIGORATING_MEAL, Talent.LIQUID_NATURE, Talent.REJUVENATING_STEPS, Talent.HEIGHTENED_SENSES, Talent.DURABLE_PROJECTILES);
        break;
      case HeroClass.DUELIST:
        Collections.addAll(tierTalents, Talent.FOCUSED_MEAL, Talent.LIQUID_AGILITY, Talent.WEAPON_RECHARGING, Talent.LETHAL_HASTE, Talent.SWIFT_EQUIP);
        break;
      case HeroClass.CLERIC:
        Collections.addAll(tierTalents, Talent.ENLIGHTENING_MEAL, Talent.RECALL_INSCRIPTION, Talent.SUNRAY, Talent.DIVINE_SENSE, Talent.BLESS);
        break;
    }
    for (const $it7 = tierTalents.iterator(); $it7.hasNext(); ) {
      let talent = $it7.next();
      if (replacements.containsKey(talent)) {
        talent = replacements.get(talent);
      }
      talents.get(1).put(talent, 0);
    }
    tierTalents.clear();
    switch (cls) {
      case HeroClass.WARRIOR:
      default:
        Collections.addAll(tierTalents, Talent.HOLD_FAST, Talent.STRONGMAN);
        break;
      case HeroClass.MAGE:
        Collections.addAll(tierTalents, Talent.DESPERATE_POWER, Talent.ALLY_WARP);
        break;
      case HeroClass.ROGUE:
        Collections.addAll(tierTalents, Talent.ENHANCED_RINGS, Talent.LIGHT_CLOAK);
        break;
      case HeroClass.HUNTRESS:
        Collections.addAll(tierTalents, Talent.POINT_BLANK, Talent.SEER_SHOT);
        break;
      case HeroClass.DUELIST:
        Collections.addAll(tierTalents, Talent.PRECISE_ASSAULT, Talent.DEADLY_FOLLOWUP);
        break;
      case HeroClass.CLERIC:
        Collections.addAll(tierTalents, Talent.CLEANSE, Talent.LIGHT_READING);
        break;
    }
    for (const $it8 = tierTalents.iterator(); $it8.hasNext(); ) {
      let talent = $it8.next();
      if (replacements.containsKey(talent)) {
        talent = replacements.get(talent);
      }
      talents.get(2).put(talent, 0);
    }
    tierTalents.clear();
  }
  static initSubclassTalents$Hero(hero: Hero): void {
    Talent.initSubclassTalents$HeroSubClass$ArrayList(hero.subClass, hero.talents_);
  }
  static initSubclassTalents$HeroSubClass$ArrayList(cls: HeroSubClass, talents: ArrayList<LinkedHashMap<Talent, number>>): void {
    if (cls === HeroSubClass.NONE) {
      return;
    }
    while (talents.size() < Talent.MAX_TALENT_TIERS) {
      talents.add(new LinkedHashMap());
    }
    let tierTalents = new ArrayList();
    switch (cls) {
      case HeroSubClass.BERSERKER:
      default:
        Collections.addAll(tierTalents, Talent.ENDLESS_RAGE, Talent.DEATHLESS_FURY, Talent.ENRAGED_CATALYST);
        break;
      case HeroSubClass.GLADIATOR:
        Collections.addAll(tierTalents, Talent.CLEAVE, Talent.LETHAL_DEFENSE, Talent.ENHANCED_COMBO);
        break;
      case HeroSubClass.BATTLEMAGE:
        Collections.addAll(tierTalents, Talent.EMPOWERED_STRIKE, Talent.MYSTICAL_CHARGE, Talent.EXCESS_CHARGE);
        break;
      case HeroSubClass.WARLOCK:
        Collections.addAll(tierTalents, Talent.SOUL_EATER, Talent.SOUL_SIPHON, Talent.NECROMANCERS_MINIONS);
        break;
      case HeroSubClass.ASSASSIN:
        Collections.addAll(tierTalents, Talent.ENHANCED_LETHALITY, Talent.ASSASSINS_REACH, Talent.BOUNTY_HUNTER);
        break;
      case HeroSubClass.FREERUNNER:
        Collections.addAll(tierTalents, Talent.EVASIVE_ARMOR, Talent.PROJECTILE_MOMENTUM, Talent.SPEEDY_STEALTH);
        break;
      case HeroSubClass.SNIPER:
        Collections.addAll(tierTalents, Talent.FARSIGHT, Talent.SHARED_ENCHANTMENT, Talent.SHARED_UPGRADES);
        break;
      case HeroSubClass.WARDEN:
        Collections.addAll(tierTalents, Talent.DURABLE_TIPS, Talent.BARKSKIN, Talent.SHIELDING_DEW);
        break;
      case HeroSubClass.CHAMPION:
        Collections.addAll(tierTalents, Talent.VARIED_CHARGE, Talent.TWIN_UPGRADES, Talent.COMBINED_LETHALITY);
        break;
      case HeroSubClass.MONK:
        Collections.addAll(tierTalents, Talent.UNENCUMBERED_SPIRIT, Talent.MONASTIC_VIGOR, Talent.COMBINED_ENERGY);
        break;
      case HeroSubClass.PRIEST:
        Collections.addAll(tierTalents, Talent.HOLY_LANCE, Talent.HALLOWED_GROUND, Talent.MNEMONIC_PRAYER);
        break;
      case HeroSubClass.PALADIN:
        Collections.addAll(tierTalents, Talent.LAY_ON_HANDS, Talent.AURA_OF_PROTECTION, Talent.WALL_OF_LIGHT);
        break;
    }
    for (const $it9 = tierTalents.iterator(); $it9.hasNext(); ) {
      let talent = $it9.next();
      talents.get(2).put(talent, 0);
    }
    tierTalents.clear();
  }
  static initArmorTalents$Hero(hero: Hero): void {
    Talent.initArmorTalents$ArmorAbility$ArrayList(hero.armorAbility, hero.talents_);
  }
  static initArmorTalents$ArmorAbility$ArrayList(abil: ArmorAbility, talents: ArrayList<LinkedHashMap<Talent, number>>): void {
    if (abil == null) {
      return;
    }
    while (talents.size() < Talent.MAX_TALENT_TIERS) {
      talents.add(new LinkedHashMap());
    }
    for (let t of abil.talents()) {
      talents.get(3).put(t, 0);
    }
  }
  static storeTalentsInBundle(bundle: Bundle, hero: Hero): void {
    for (let i = 0; i < Talent.MAX_TALENT_TIERS; i++) {
      let tier = hero.talents_.get(i);
      let tierBundle = new Bundle()._Bundle$();
      for (const $it10 = tier.keySet().iterator(); $it10.hasNext(); ) {
        let talent = $it10.next();
        if (tier.get(talent) > 0) {
          tierBundle.put$String$int(talent.name(), tier.get(talent));
        }
        if (tierBundle.contains(talent.name())) {
          tier.put(talent, Math.min(tierBundle.getInt(talent.name()), talent.maxPoints()));
        }
      }
      bundle.put$String$Bundle(Talent.TALENT_TIER + ((i + 1) | 0), tierBundle);
    }
    let replacementsBundle = new Bundle()._Bundle$();
    for (const $it11 = hero.metamorphedTalents.keySet().iterator(); $it11.hasNext(); ) {
      let t = $it11.next();
      replacementsBundle.put$String$Enum(t.name(), hero.metamorphedTalents.get(t));
    }
    bundle.put$String$Bundle('replacements', replacementsBundle);
  }
  static restoreTalentsFromBundle(bundle: Bundle, hero: Hero): void {
    if (bundle.contains('replacements')) {
      let replacements = bundle.getBundle('replacements');
      for (const $it12 = replacements.getKeys().iterator(); $it12.hasNext(); ) {
        let key = $it12.next();
        let value = replacements.getString(key);
        if (Talent.renamedTalents.containsKey(key)) {
          key = Talent.renamedTalents.get(key);
        }
        if (Talent.renamedTalents.containsKey(value)) {
          value = Talent.renamedTalents.get(value);
        }
        if (!Talent.removedTalents.contains(key) && !Talent.removedTalents.contains(value)) {
          try {
            hero.metamorphedTalents.put(Talent.valueOf(key), Talent.valueOf(value));
          } catch ($e13) {
            if ($J.isa($e13, Exception)) {
              let e = $J.exc($e13);
              Game.reportException(e);
            } else {
              throw $e13;
            }
          }
        }
      }
    }
    if (hero.heroClass != null) {
      Talent.initClassTalents$Hero(hero);
    }
    if (hero.subClass != null) {
      Talent.initSubclassTalents$Hero(hero);
    }
    if (hero.armorAbility != null) {
      Talent.initArmorTalents$Hero(hero);
    }
    for (let i = 0; i < Talent.MAX_TALENT_TIERS; i++) {
      let tier = hero.talents_.get(i);
      let tierBundle = bundle.contains(Talent.TALENT_TIER + ((i + 1) | 0)) ? bundle.getBundle(Talent.TALENT_TIER + ((i + 1) | 0)) : null;
      if (tierBundle != null) {
        for (const $it14 = tierBundle.getKeys().iterator(); $it14.hasNext(); ) {
          let tName = $it14.next();
          let points = tierBundle.getInt(tName);
          if (Talent.renamedTalents.containsKey(tName)) {
            tName = Talent.renamedTalents.get(tName);
          }
          if (!Talent.removedTalents.contains(tName)) {
            try {
              let talent = Talent.valueOf(tName);
              if (tier.containsKey(talent)) {
                tier.put(talent, Math.min(points, talent.maxPoints()));
              }
            } catch ($e15) {
              if ($J.isa($e15, Exception)) {
                let e = $J.exc($e15);
                Game.reportException(e);
              } else {
                throw $e15;
              }
            }
          }
        }
      }
    }
  }
  static values(): Talent[] { return Talent.$VALUES.slice(); }
  static valueOf(name: string): Talent { return $J.enumValueOf(Talent, name); }
  static $clinit() {
    Talent.HEARTY_MEAL = new Talent()._Talent$int('HEARTY_MEAL', 0, 0);
    Talent.VETERANS_INTUITION = new Talent()._Talent$int('VETERANS_INTUITION', 1, 1);
    Talent.PROVOKED_ANGER = new Talent()._Talent$int('PROVOKED_ANGER', 2, 2);
    Talent.IRON_WILL = new Talent()._Talent$int('IRON_WILL', 3, 3);
    Talent.IRON_STOMACH = new Talent()._Talent$int('IRON_STOMACH', 4, 4);
    Talent.LIQUID_WILLPOWER = new Talent()._Talent$int('LIQUID_WILLPOWER', 5, 5);
    Talent.RUNIC_TRANSFERENCE = new Talent()._Talent$int('RUNIC_TRANSFERENCE', 6, 6);
    Talent.LETHAL_MOMENTUM = new Talent()._Talent$int('LETHAL_MOMENTUM', 7, 7);
    Talent.IMPROVISED_PROJECTILES = new Talent()._Talent$int('IMPROVISED_PROJECTILES', 8, 8);
    Talent.HOLD_FAST = new Talent()._Talent$int$int('HOLD_FAST', 9, 9, 3);
    Talent.STRONGMAN = new Talent()._Talent$int$int('STRONGMAN', 10, 10, 3);
    Talent.ENDLESS_RAGE = new Talent()._Talent$int$int('ENDLESS_RAGE', 11, 11, 3);
    Talent.DEATHLESS_FURY = new Talent()._Talent$int$int('DEATHLESS_FURY', 12, 12, 3);
    Talent.ENRAGED_CATALYST = new Talent()._Talent$int$int('ENRAGED_CATALYST', 13, 13, 3);
    Talent.CLEAVE = new Talent()._Talent$int$int('CLEAVE', 14, 14, 3);
    Talent.LETHAL_DEFENSE = new Talent()._Talent$int$int('LETHAL_DEFENSE', 15, 15, 3);
    Talent.ENHANCED_COMBO = new Talent()._Talent$int$int('ENHANCED_COMBO', 16, 16, 3);
    Talent.BODY_SLAM = new Talent()._Talent$int$int('BODY_SLAM', 17, 17, 4);
    Talent.IMPACT_WAVE = new Talent()._Talent$int$int('IMPACT_WAVE', 18, 18, 4);
    Talent.DOUBLE_JUMP = new Talent()._Talent$int$int('DOUBLE_JUMP', 19, 19, 4);
    Talent.EXPANDING_WAVE = new Talent()._Talent$int$int('EXPANDING_WAVE', 20, 20, 4);
    Talent.STRIKING_WAVE = new Talent()._Talent$int$int('STRIKING_WAVE', 21, 21, 4);
    Talent.SHOCK_FORCE = new Talent()._Talent$int$int('SHOCK_FORCE', 22, 22, 4);
    Talent.SUSTAINED_RETRIBUTION = new Talent()._Talent$int$int('SUSTAINED_RETRIBUTION', 23, 23, 4);
    Talent.SHRUG_IT_OFF = new Talent()._Talent$int$int('SHRUG_IT_OFF', 24, 24, 4);
    Talent.EVEN_THE_ODDS = new Talent()._Talent$int$int('EVEN_THE_ODDS', 25, 25, 4);
    Talent.EMPOWERING_MEAL = new Talent()._Talent$int('EMPOWERING_MEAL', 26, 32);
    Talent.SCHOLARS_INTUITION = new Talent()._Talent$int('SCHOLARS_INTUITION', 27, 33);
    Talent.LINGERING_MAGIC = new Talent()._Talent$int('LINGERING_MAGIC', 28, 34);
    Talent.BACKUP_BARRIER = new Talent()._Talent$int('BACKUP_BARRIER', 29, 35);
    Talent.ENERGIZING_MEAL = new Talent()._Talent$int('ENERGIZING_MEAL', 30, 36);
    Talent.INSCRIBED_POWER = new Talent()._Talent$int('INSCRIBED_POWER', 31, 37);
    Talent.WAND_PRESERVATION = new Talent()._Talent$int('WAND_PRESERVATION', 32, 38);
    Talent.ARCANE_VISION = new Talent()._Talent$int('ARCANE_VISION', 33, 39);
    Talent.SHIELD_BATTERY = new Talent()._Talent$int('SHIELD_BATTERY', 34, 40);
    Talent.DESPERATE_POWER = new Talent()._Talent$int$int('DESPERATE_POWER', 35, 41, 3);
    Talent.ALLY_WARP = new Talent()._Talent$int$int('ALLY_WARP', 36, 42, 3);
    Talent.EMPOWERED_STRIKE = new Talent()._Talent$int$int('EMPOWERED_STRIKE', 37, 43, 3);
    Talent.MYSTICAL_CHARGE = new Talent()._Talent$int$int('MYSTICAL_CHARGE', 38, 44, 3);
    Talent.EXCESS_CHARGE = new Talent()._Talent$int$int('EXCESS_CHARGE', 39, 45, 3);
    Talent.SOUL_EATER = new Talent()._Talent$int$int('SOUL_EATER', 40, 46, 3);
    Talent.SOUL_SIPHON = new Talent()._Talent$int$int('SOUL_SIPHON', 41, 47, 3);
    Talent.NECROMANCERS_MINIONS = new Talent()._Talent$int$int('NECROMANCERS_MINIONS', 42, 48, 3);
    Talent.BLAST_RADIUS = new Talent()._Talent$int$int('BLAST_RADIUS', 43, 49, 4);
    Talent.ELEMENTAL_POWER = new Talent()._Talent$int$int('ELEMENTAL_POWER', 44, 50, 4);
    Talent.REACTIVE_BARRIER = new Talent()._Talent$int$int('REACTIVE_BARRIER', 45, 51, 4);
    Talent.WILD_POWER = new Talent()._Talent$int$int('WILD_POWER', 46, 52, 4);
    Talent.FIRE_EVERYTHING = new Talent()._Talent$int$int('FIRE_EVERYTHING', 47, 53, 4);
    Talent.CONSERVED_MAGIC = new Talent()._Talent$int$int('CONSERVED_MAGIC', 48, 54, 4);
    Talent.TELEFRAG = new Talent()._Talent$int$int('TELEFRAG', 49, 55, 4);
    Talent.REMOTE_BEACON = new Talent()._Talent$int$int('REMOTE_BEACON', 50, 56, 4);
    Talent.LONGRANGE_WARP = new Talent()._Talent$int$int('LONGRANGE_WARP', 51, 57, 4);
    Talent.CACHED_RATIONS = new Talent()._Talent$int('CACHED_RATIONS', 52, 64);
    Talent.THIEFS_INTUITION = new Talent()._Talent$int('THIEFS_INTUITION', 53, 65);
    Talent.SUCKER_PUNCH = new Talent()._Talent$int('SUCKER_PUNCH', 54, 66);
    Talent.PROTECTIVE_SHADOWS = new Talent()._Talent$int('PROTECTIVE_SHADOWS', 55, 67);
    Talent.MYSTICAL_MEAL = new Talent()._Talent$int('MYSTICAL_MEAL', 56, 68);
    Talent.INSCRIBED_STEALTH = new Talent()._Talent$int('INSCRIBED_STEALTH', 57, 69);
    Talent.WIDE_SEARCH = new Talent()._Talent$int('WIDE_SEARCH', 58, 70);
    Talent.SILENT_STEPS = new Talent()._Talent$int('SILENT_STEPS', 59, 71);
    Talent.ROGUES_FORESIGHT = new Talent()._Talent$int('ROGUES_FORESIGHT', 60, 72);
    Talent.ENHANCED_RINGS = new Talent()._Talent$int$int('ENHANCED_RINGS', 61, 73, 3);
    Talent.LIGHT_CLOAK = new Talent()._Talent$int$int('LIGHT_CLOAK', 62, 74, 3);
    Talent.ENHANCED_LETHALITY = new Talent()._Talent$int$int('ENHANCED_LETHALITY', 63, 75, 3);
    Talent.ASSASSINS_REACH = new Talent()._Talent$int$int('ASSASSINS_REACH', 64, 76, 3);
    Talent.BOUNTY_HUNTER = new Talent()._Talent$int$int('BOUNTY_HUNTER', 65, 77, 3);
    Talent.EVASIVE_ARMOR = new Talent()._Talent$int$int('EVASIVE_ARMOR', 66, 78, 3);
    Talent.PROJECTILE_MOMENTUM = new Talent()._Talent$int$int('PROJECTILE_MOMENTUM', 67, 79, 3);
    Talent.SPEEDY_STEALTH = new Talent()._Talent$int$int('SPEEDY_STEALTH', 68, 80, 3);
    Talent.HASTY_RETREAT = new Talent()._Talent$int$int('HASTY_RETREAT', 69, 81, 4);
    Talent.BODY_REPLACEMENT = new Talent()._Talent$int$int('BODY_REPLACEMENT', 70, 82, 4);
    Talent.SHADOW_STEP = new Talent()._Talent$int$int('SHADOW_STEP', 71, 83, 4);
    Talent.FEAR_THE_REAPER = new Talent()._Talent$int$int('FEAR_THE_REAPER', 72, 84, 4);
    Talent.DEATHLY_DURABILITY = new Talent()._Talent$int$int('DEATHLY_DURABILITY', 73, 85, 4);
    Talent.DOUBLE_MARK = new Talent()._Talent$int$int('DOUBLE_MARK', 74, 86, 4);
    Talent.SHADOW_BLADE = new Talent()._Talent$int$int('SHADOW_BLADE', 75, 87, 4);
    Talent.CLONED_ARMOR = new Talent()._Talent$int$int('CLONED_ARMOR', 76, 88, 4);
    Talent.PERFECT_COPY = new Talent()._Talent$int$int('PERFECT_COPY', 77, 89, 4);
    Talent.NATURES_BOUNTY = new Talent()._Talent$int('NATURES_BOUNTY', 78, 96);
    Talent.SURVIVALISTS_INTUITION = new Talent()._Talent$int('SURVIVALISTS_INTUITION', 79, 97);
    Talent.FOLLOWUP_STRIKE = new Talent()._Talent$int('FOLLOWUP_STRIKE', 80, 98);
    Talent.NATURES_AID = new Talent()._Talent$int('NATURES_AID', 81, 99);
    Talent.INVIGORATING_MEAL = new Talent()._Talent$int('INVIGORATING_MEAL', 82, 100);
    Talent.LIQUID_NATURE = new Talent()._Talent$int('LIQUID_NATURE', 83, 101);
    Talent.REJUVENATING_STEPS = new Talent()._Talent$int('REJUVENATING_STEPS', 84, 102);
    Talent.HEIGHTENED_SENSES = new Talent()._Talent$int('HEIGHTENED_SENSES', 85, 103);
    Talent.DURABLE_PROJECTILES = new Talent()._Talent$int('DURABLE_PROJECTILES', 86, 104);
    Talent.POINT_BLANK = new Talent()._Talent$int$int('POINT_BLANK', 87, 105, 3);
    Talent.SEER_SHOT = new Talent()._Talent$int$int('SEER_SHOT', 88, 106, 3);
    Talent.FARSIGHT = new Talent()._Talent$int$int('FARSIGHT', 89, 107, 3);
    Talent.SHARED_ENCHANTMENT = new Talent()._Talent$int$int('SHARED_ENCHANTMENT', 90, 108, 3);
    Talent.SHARED_UPGRADES = new Talent()._Talent$int$int('SHARED_UPGRADES', 91, 109, 3);
    Talent.DURABLE_TIPS = new Talent()._Talent$int$int('DURABLE_TIPS', 92, 110, 3);
    Talent.BARKSKIN = new Talent()._Talent$int$int('BARKSKIN', 93, 111, 3);
    Talent.SHIELDING_DEW = new Talent()._Talent$int$int('SHIELDING_DEW', 94, 112, 3);
    Talent.FAN_OF_BLADES = new Talent()._Talent$int$int('FAN_OF_BLADES', 95, 113, 4);
    Talent.PROJECTING_BLADES = new Talent()._Talent$int$int('PROJECTING_BLADES', 96, 114, 4);
    Talent.SPIRIT_BLADES = new Talent()._Talent$int$int('SPIRIT_BLADES', 97, 115, 4);
    Talent.GROWING_POWER = new Talent()._Talent$int$int('GROWING_POWER', 98, 116, 4);
    Talent.NATURES_WRATH = new Talent()._Talent$int$int('NATURES_WRATH', 99, 117, 4);
    Talent.WILD_MOMENTUM = new Talent()._Talent$int$int('WILD_MOMENTUM', 100, 118, 4);
    Talent.EAGLE_EYE = new Talent()._Talent$int$int('EAGLE_EYE', 101, 119, 4);
    Talent.GO_FOR_THE_EYES = new Talent()._Talent$int$int('GO_FOR_THE_EYES', 102, 120, 4);
    Talent.SWIFT_SPIRIT = new Talent()._Talent$int$int('SWIFT_SPIRIT', 103, 121, 4);
    Talent.STRENGTHENING_MEAL = new Talent()._Talent$int('STRENGTHENING_MEAL', 104, 128);
    Talent.ADVENTURERS_INTUITION = new Talent()._Talent$int('ADVENTURERS_INTUITION', 105, 129);
    Talent.PATIENT_STRIKE = new Talent()._Talent$int('PATIENT_STRIKE', 106, 130);
    Talent.AGGRESSIVE_BARRIER = new Talent()._Talent$int('AGGRESSIVE_BARRIER', 107, 131);
    Talent.FOCUSED_MEAL = new Talent()._Talent$int('FOCUSED_MEAL', 108, 132);
    Talent.LIQUID_AGILITY = new Talent()._Talent$int('LIQUID_AGILITY', 109, 133);
    Talent.WEAPON_RECHARGING = new Talent()._Talent$int('WEAPON_RECHARGING', 110, 134);
    Talent.LETHAL_HASTE = new Talent()._Talent$int('LETHAL_HASTE', 111, 135);
    Talent.SWIFT_EQUIP = new Talent()._Talent$int('SWIFT_EQUIP', 112, 136);
    Talent.PRECISE_ASSAULT = new Talent()._Talent$int$int('PRECISE_ASSAULT', 113, 137, 3);
    Talent.DEADLY_FOLLOWUP = new Talent()._Talent$int$int('DEADLY_FOLLOWUP', 114, 138, 3);
    Talent.VARIED_CHARGE = new Talent()._Talent$int$int('VARIED_CHARGE', 115, 139, 3);
    Talent.TWIN_UPGRADES = new Talent()._Talent$int$int('TWIN_UPGRADES', 116, 140, 3);
    Talent.COMBINED_LETHALITY = new Talent()._Talent$int$int('COMBINED_LETHALITY', 117, 141, 3);
    Talent.UNENCUMBERED_SPIRIT = new Talent()._Talent$int$int('UNENCUMBERED_SPIRIT', 118, 142, 3);
    Talent.MONASTIC_VIGOR = new Talent()._Talent$int$int('MONASTIC_VIGOR', 119, 143, 3);
    Talent.COMBINED_ENERGY = new Talent()._Talent$int$int('COMBINED_ENERGY', 120, 144, 3);
    Talent.CLOSE_THE_GAP = new Talent()._Talent$int$int('CLOSE_THE_GAP', 121, 145, 4);
    Talent.INVIGORATING_VICTORY = new Talent()._Talent$int$int('INVIGORATING_VICTORY', 122, 146, 4);
    Talent.ELIMINATION_MATCH = new Talent()._Talent$int$int('ELIMINATION_MATCH', 123, 147, 4);
    Talent.ELEMENTAL_REACH = new Talent()._Talent$int$int('ELEMENTAL_REACH', 124, 148, 4);
    Talent.STRIKING_FORCE = new Talent()._Talent$int$int('STRIKING_FORCE', 125, 149, 4);
    Talent.DIRECTED_POWER = new Talent()._Talent$int$int('DIRECTED_POWER', 126, 150, 4);
    Talent.FEIGNED_RETREAT = new Talent()._Talent$int$int('FEIGNED_RETREAT', 127, 151, 4);
    Talent.EXPOSE_WEAKNESS = new Talent()._Talent$int$int('EXPOSE_WEAKNESS', 128, 152, 4);
    Talent.COUNTER_ABILITY = new Talent()._Talent$int$int('COUNTER_ABILITY', 129, 153, 4);
    Talent.SATIATED_SPELLS = new Talent()._Talent$int('SATIATED_SPELLS', 130, 160);
    Talent.HOLY_INTUITION = new Talent()._Talent$int('HOLY_INTUITION', 131, 161);
    Talent.SEARING_LIGHT = new Talent()._Talent$int('SEARING_LIGHT', 132, 162);
    Talent.SHIELD_OF_LIGHT = new Talent()._Talent$int('SHIELD_OF_LIGHT', 133, 163);
    Talent.ENLIGHTENING_MEAL = new Talent()._Talent$int('ENLIGHTENING_MEAL', 134, 164);
    Talent.RECALL_INSCRIPTION = new Talent()._Talent$int('RECALL_INSCRIPTION', 135, 165);
    Talent.SUNRAY = new Talent()._Talent$int('SUNRAY', 136, 166);
    Talent.DIVINE_SENSE = new Talent()._Talent$int('DIVINE_SENSE', 137, 167);
    Talent.BLESS = new Talent()._Talent$int('BLESS', 138, 168);
    Talent.CLEANSE = new Talent()._Talent$int$int('CLEANSE', 139, 169, 3);
    Talent.LIGHT_READING = new Talent()._Talent$int$int('LIGHT_READING', 140, 170, 3);
    Talent.HOLY_LANCE = new Talent()._Talent$int$int('HOLY_LANCE', 141, 171, 3);
    Talent.HALLOWED_GROUND = new Talent()._Talent$int$int('HALLOWED_GROUND', 142, 172, 3);
    Talent.MNEMONIC_PRAYER = new Talent()._Talent$int$int('MNEMONIC_PRAYER', 143, 173, 3);
    Talent.LAY_ON_HANDS = new Talent()._Talent$int$int('LAY_ON_HANDS', 144, 174, 3);
    Talent.AURA_OF_PROTECTION = new Talent()._Talent$int$int('AURA_OF_PROTECTION', 145, 175, 3);
    Talent.WALL_OF_LIGHT = new Talent()._Talent$int$int('WALL_OF_LIGHT', 146, 176, 3);
    Talent.DIVINE_INTERVENTION = new Talent()._Talent$int$int('DIVINE_INTERVENTION', 147, 177, 4);
    Talent.JUDGEMENT = new Talent()._Talent$int$int('JUDGEMENT', 148, 178, 4);
    Talent.FLASH = new Talent()._Talent$int$int('FLASH', 149, 179, 4);
    Talent.BODY_FORM = new Talent()._Talent$int$int('BODY_FORM', 150, 180, 4);
    Talent.MIND_FORM = new Talent()._Talent$int$int('MIND_FORM', 151, 181, 4);
    Talent.SPIRIT_FORM = new Talent()._Talent$int$int('SPIRIT_FORM', 152, 182, 4);
    Talent.BEAMING_RAY = new Talent()._Talent$int$int('BEAMING_RAY', 153, 183, 4);
    Talent.LIFE_LINK = new Talent()._Talent$int$int('LIFE_LINK', 154, 184, 4);
    Talent.STASIS = new Talent()._Talent$int$int('STASIS', 155, 185, 4);
    Talent.HEROIC_ENERGY = new Talent()._Talent$int$int('HEROIC_ENERGY', 156, 26, 4);
    Talent.RATSISTANCE = new Talent()._Talent$int$int('RATSISTANCE', 157, 215, 4);
    Talent.RATLOMACY = new Talent()._Talent$int$int('RATLOMACY', 158, 216, 4);
    Talent.RATFORCEMENTS = new Talent()._Talent$int$int('RATFORCEMENTS', 159, 217, 4);
    Talent.$VALUES = [Talent.HEARTY_MEAL, Talent.VETERANS_INTUITION, Talent.PROVOKED_ANGER, Talent.IRON_WILL, Talent.IRON_STOMACH, Talent.LIQUID_WILLPOWER, Talent.RUNIC_TRANSFERENCE, Talent.LETHAL_MOMENTUM, Talent.IMPROVISED_PROJECTILES, Talent.HOLD_FAST, Talent.STRONGMAN, Talent.ENDLESS_RAGE, Talent.DEATHLESS_FURY, Talent.ENRAGED_CATALYST, Talent.CLEAVE, Talent.LETHAL_DEFENSE, Talent.ENHANCED_COMBO, Talent.BODY_SLAM, Talent.IMPACT_WAVE, Talent.DOUBLE_JUMP, Talent.EXPANDING_WAVE, Talent.STRIKING_WAVE, Talent.SHOCK_FORCE, Talent.SUSTAINED_RETRIBUTION, Talent.SHRUG_IT_OFF, Talent.EVEN_THE_ODDS, Talent.EMPOWERING_MEAL, Talent.SCHOLARS_INTUITION, Talent.LINGERING_MAGIC, Talent.BACKUP_BARRIER, Talent.ENERGIZING_MEAL, Talent.INSCRIBED_POWER, Talent.WAND_PRESERVATION, Talent.ARCANE_VISION, Talent.SHIELD_BATTERY, Talent.DESPERATE_POWER, Talent.ALLY_WARP, Talent.EMPOWERED_STRIKE, Talent.MYSTICAL_CHARGE, Talent.EXCESS_CHARGE, Talent.SOUL_EATER, Talent.SOUL_SIPHON, Talent.NECROMANCERS_MINIONS, Talent.BLAST_RADIUS, Talent.ELEMENTAL_POWER, Talent.REACTIVE_BARRIER, Talent.WILD_POWER, Talent.FIRE_EVERYTHING, Talent.CONSERVED_MAGIC, Talent.TELEFRAG, Talent.REMOTE_BEACON, Talent.LONGRANGE_WARP, Talent.CACHED_RATIONS, Talent.THIEFS_INTUITION, Talent.SUCKER_PUNCH, Talent.PROTECTIVE_SHADOWS, Talent.MYSTICAL_MEAL, Talent.INSCRIBED_STEALTH, Talent.WIDE_SEARCH, Talent.SILENT_STEPS, Talent.ROGUES_FORESIGHT, Talent.ENHANCED_RINGS, Talent.LIGHT_CLOAK, Talent.ENHANCED_LETHALITY, Talent.ASSASSINS_REACH, Talent.BOUNTY_HUNTER, Talent.EVASIVE_ARMOR, Talent.PROJECTILE_MOMENTUM, Talent.SPEEDY_STEALTH, Talent.HASTY_RETREAT, Talent.BODY_REPLACEMENT, Talent.SHADOW_STEP, Talent.FEAR_THE_REAPER, Talent.DEATHLY_DURABILITY, Talent.DOUBLE_MARK, Talent.SHADOW_BLADE, Talent.CLONED_ARMOR, Talent.PERFECT_COPY, Talent.NATURES_BOUNTY, Talent.SURVIVALISTS_INTUITION, Talent.FOLLOWUP_STRIKE, Talent.NATURES_AID, Talent.INVIGORATING_MEAL, Talent.LIQUID_NATURE, Talent.REJUVENATING_STEPS, Talent.HEIGHTENED_SENSES, Talent.DURABLE_PROJECTILES, Talent.POINT_BLANK, Talent.SEER_SHOT, Talent.FARSIGHT, Talent.SHARED_ENCHANTMENT, Talent.SHARED_UPGRADES, Talent.DURABLE_TIPS, Talent.BARKSKIN, Talent.SHIELDING_DEW, Talent.FAN_OF_BLADES, Talent.PROJECTING_BLADES, Talent.SPIRIT_BLADES, Talent.GROWING_POWER, Talent.NATURES_WRATH, Talent.WILD_MOMENTUM, Talent.EAGLE_EYE, Talent.GO_FOR_THE_EYES, Talent.SWIFT_SPIRIT, Talent.STRENGTHENING_MEAL, Talent.ADVENTURERS_INTUITION, Talent.PATIENT_STRIKE, Talent.AGGRESSIVE_BARRIER, Talent.FOCUSED_MEAL, Talent.LIQUID_AGILITY, Talent.WEAPON_RECHARGING, Talent.LETHAL_HASTE, Talent.SWIFT_EQUIP, Talent.PRECISE_ASSAULT, Talent.DEADLY_FOLLOWUP, Talent.VARIED_CHARGE, Talent.TWIN_UPGRADES, Talent.COMBINED_LETHALITY, Talent.UNENCUMBERED_SPIRIT, Talent.MONASTIC_VIGOR, Talent.COMBINED_ENERGY, Talent.CLOSE_THE_GAP, Talent.INVIGORATING_VICTORY, Talent.ELIMINATION_MATCH, Talent.ELEMENTAL_REACH, Talent.STRIKING_FORCE, Talent.DIRECTED_POWER, Talent.FEIGNED_RETREAT, Talent.EXPOSE_WEAKNESS, Talent.COUNTER_ABILITY, Talent.SATIATED_SPELLS, Talent.HOLY_INTUITION, Talent.SEARING_LIGHT, Talent.SHIELD_OF_LIGHT, Talent.ENLIGHTENING_MEAL, Talent.RECALL_INSCRIPTION, Talent.SUNRAY, Talent.DIVINE_SENSE, Talent.BLESS, Talent.CLEANSE, Talent.LIGHT_READING, Talent.HOLY_LANCE, Talent.HALLOWED_GROUND, Talent.MNEMONIC_PRAYER, Talent.LAY_ON_HANDS, Talent.AURA_OF_PROTECTION, Talent.WALL_OF_LIGHT, Talent.DIVINE_INTERVENTION, Talent.JUDGEMENT, Talent.FLASH, Talent.BODY_FORM, Talent.MIND_FORM, Talent.SPIRIT_FORM, Talent.BEAMING_RAY, Talent.LIFE_LINK, Talent.STASIS, Talent.HEROIC_ENERGY, Talent.RATSISTANCE, Talent.RATLOMACY, Talent.RATFORCEMENTS];
    Talent.tierLevelThresholds = [0, 2, 7, 13, 21, 31];
    Talent.removedTalents = new HashSet();
    Talent.renamedTalents = new HashMap();
  }
}

export class Talent$ImprovisedProjectileCooldown extends FlavourBuff {
  _Talent$ImprovisedProjectileCooldown(): this {
    this._FlavourBuff();
    return this;
  }
  icon(): number {
    return BuffIndicator.TIME;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(Math.fround(0.15), Math.fround(0.2), 0.5);
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround(this.visualcooldown() / 50));
  }
}

export class Talent$LethalMomentumTracker extends FlavourBuff {
  _Talent$LethalMomentumTracker(): this {
    this._FlavourBuff();
    return this;
  }
}

export class Talent$StrikingWaveTracker extends FlavourBuff {
  _Talent$StrikingWaveTracker(): this {
    this._FlavourBuff();
    return this;
  }
}

export class Talent$WandPreservationCounter extends CounterBuff {
  _Talent$WandPreservationCounter(): this {
    this._CounterBuff();
    this.revivePersists = true;
    return this;
  }
}

export class Talent$EmpoweredStrikeTracker extends FlavourBuff {
  delayedDetach: boolean = false;
  _Talent$EmpoweredStrikeTracker(): this {
    this._FlavourBuff();
    this.delayedDetach = false;
    return this;
  }
}

export class Talent$ProtectiveShadowsTracker extends Buff {
  barrierInc: number = 0;
  static readonly BARRIER_INC: string = 'barrier_inc';
  _Talent$ProtectiveShadowsTracker(): this {
    this._Buff();
    this.barrierInc = 0.5;
    return this;
  }
  act(): boolean {
    if ((this.target).hasTalent(Talent.PROTECTIVE_SHADOWS) && this.target.invisible > 0) {
      let barrier = Buff.affect$Char$Class(this.target, $J.cls(Barrier));
      if (barrier.shielding() < ((1 + Math.imul(2, (this.target).pointsInTalent(Talent.PROTECTIVE_SHADOWS))) | 0)) {
        this.barrierInc = Math.fround(this.barrierInc + Math.fround(0.5 * (this.target).pointsInTalent(Talent.PROTECTIVE_SHADOWS)));
      }
      if (this.barrierInc >= Math.fround(1)) {
        this.barrierInc = 0;
        barrier.incShield$int(1);
      } else {
        barrier.incShield$int(0);
      }
    } else {
      this.detach();
    }
    this.spend(Actor.TICK);
    return true;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$float(Talent$ProtectiveShadowsTracker.BARRIER_INC, this.barrierInc);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.barrierInc = bundle.getFloat(Talent$ProtectiveShadowsTracker.BARRIER_INC);
  }
}

export class Talent$BountyHunterTracker extends FlavourBuff {
  _Talent$BountyHunterTracker(): this {
    this._FlavourBuff();
    return this;
  }
}

export class Talent$RejuvenatingStepsCooldown extends FlavourBuff {
  _Talent$RejuvenatingStepsCooldown(): this {
    this._FlavourBuff();
    return this;
  }
  icon(): number {
    return BuffIndicator.TIME;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(0, Math.fround(0.35), Math.fround(0.15));
  }
  iconFadePercent(): number {
    return GameMath.gate(0, Math.fround(this.visualcooldown() / ((15 - Math.imul(5, Dungeon.hero.pointsInTalent(Talent.REJUVENATING_STEPS))) | 0)), 1);
  }
}

export class Talent$RejuvenatingStepsFurrow extends CounterBuff {
  _Talent$RejuvenatingStepsFurrow(): this {
    this._CounterBuff();
    this.revivePersists = true;
    return this;
  }
}

export class Talent$SeerShotCooldown extends FlavourBuff {
  _Talent$SeerShotCooldown(): this {
    this._FlavourBuff();
    return this;
  }
  icon(): number {
    return this.target.buff($J.cls(RevealedArea)) != null ? BuffIndicator.NONE : BuffIndicator.TIME;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(Math.fround(0.7), Math.fround(0.4), Math.fround(0.7));
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround(this.visualcooldown() / 20));
  }
}

export class Talent$SpiritBladesTracker extends FlavourBuff {
  _Talent$SpiritBladesTracker(): this {
    this._FlavourBuff();
    return this;
  }
}

export class Talent$PatientStrikeTracker extends Buff {
  pos: number = 0;
  static readonly POS: string = 'pos';
  _Talent$PatientStrikeTracker(): this {
    this._Buff();
    this.type_ = Buff$buffType.POSITIVE;
    return this;
  }
  icon(): number {
    return BuffIndicator.TIME;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(0.5, 0, 1);
  }
  act(): boolean {
    if (this.pos !== this.target.pos) {
      this.detach();
    } else {
      this.spend(Actor.TICK);
    }
    return true;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(Talent$PatientStrikeTracker.POS, this.pos);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.pos = bundle.getInt(Talent$PatientStrikeTracker.POS);
  }
}

export class Talent$AggressiveBarrierCooldown extends FlavourBuff {
  _Talent$AggressiveBarrierCooldown(): this {
    this._FlavourBuff();
    return this;
  }
  icon(): number {
    return BuffIndicator.TIME;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(Math.fround(0.35), 0, Math.fround(0.7));
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround(this.visualcooldown() / 50));
  }
}

export class Talent$LiquidAgilEVATracker extends FlavourBuff {
  _Talent$LiquidAgilEVATracker(): this {
    this._FlavourBuff();
    this.actPriority = (Actor.HERO_PRIO + 1) | 0;
    return this;
  }
}

export class Talent$LiquidAgilACCTracker extends FlavourBuff {
  uses: number = 0;
  static readonly USES: string = 'uses';
  _Talent$LiquidAgilACCTracker(): this {
    this._FlavourBuff();
    this.type_ = Buff$buffType.POSITIVE;
    return this;
  }
  icon(): number {
    return BuffIndicator.INVERT_MARK;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(0.5, 0, 1);
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround(1 - (Math.fround(this.visualcooldown() / 5))));
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(Talent$LiquidAgilACCTracker.USES, this.uses);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.uses = bundle.getInt(Talent$LiquidAgilACCTracker.USES);
  }
}

export class Talent$LethalHasteCooldown extends FlavourBuff {
  _Talent$LethalHasteCooldown(): this {
    this._FlavourBuff();
    return this;
  }
  icon(): number {
    return BuffIndicator.TIME;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(Math.fround(0.35), 0, Math.fround(0.7));
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround(this.visualcooldown() / 100));
  }
}

export class Talent$SwiftEquipCooldown extends FlavourBuff {
  secondUse: boolean = false;
  static readonly SECOND_USE: string = 'second_use';
  _Talent$SwiftEquipCooldown(): this {
    this._FlavourBuff();
    return this;
  }
  hasSecondUse(): boolean {
    return this.secondUse;
  }
  icon(): number {
    return BuffIndicator.TIME;
  }
  tintIcon(icon: Image): void {
    if (this.hasSecondUse()) {
      icon.hardlight$float$float$float(Math.fround(0.85), 0, 1);
    } else {
      icon.hardlight$float$float$float(Math.fround(0.35), 0, Math.fround(0.7));
    }
  }
  iconFadePercent(): number {
    return GameMath.gate(0, Math.fround(this.visualcooldown() / 20), 1);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$boolean(Talent$SwiftEquipCooldown.SECOND_USE, this.secondUse);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.secondUse = bundle.getBoolean(Talent$SwiftEquipCooldown.SECOND_USE);
  }
}

export class Talent$DeadlyFollowupTracker extends FlavourBuff {
  object: number = 0;
  static readonly OBJECT: string = 'object';
  _Talent$DeadlyFollowupTracker(): this {
    this._FlavourBuff();
    this.type_ = Buff$buffType.POSITIVE;
    return this;
  }
  icon(): number {
    return BuffIndicator.INVERT_MARK;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(0.5, 0, 1);
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround(1 - (Math.fround(this.visualcooldown() / 5))));
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(Talent$DeadlyFollowupTracker.OBJECT, this.object);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.object = bundle.getInt(Talent$DeadlyFollowupTracker.OBJECT);
  }
}

export class Talent$PreciseAssaultTracker extends FlavourBuff {
  _Talent$PreciseAssaultTracker(): this {
    this._FlavourBuff();
    this.type_ = Buff$buffType.POSITIVE;
    return this;
  }
  icon(): number {
    return BuffIndicator.INVERT_MARK;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(1, 1, 0);
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround(1 - (Math.fround(this.visualcooldown() / 5))));
  }
}

export class Talent$VariedChargeTracker extends Buff {
  weapon_: JClass = null;
  static readonly WEAPON: string = 'weapon';
  _Talent$VariedChargeTracker(): this {
    this._Buff();
    return this;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$Class(Talent$VariedChargeTracker.WEAPON, this.weapon_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.weapon_ = bundle.getClass$String(Talent$VariedChargeTracker.WEAPON);
  }
}

export class Talent$CombinedLethalityAbilityTracker extends FlavourBuff {
  weapon_: MeleeWeapon = null;
  _Talent$CombinedLethalityAbilityTracker(): this {
    this._FlavourBuff();
    return this;
  }
}

export class Talent$CombinedEnergyAbilityTracker extends FlavourBuff {
  monkAbilused: boolean = false;
  wepAbilUsed: boolean = false;
  static readonly MONK_ABIL_USED: string = 'monk_abil_used';
  static readonly WEP_ABIL_USED: string = 'wep_abil_used';
  _Talent$CombinedEnergyAbilityTracker(): this {
    this._FlavourBuff();
    this.monkAbilused = false;
    this.wepAbilUsed = false;
    return this;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$boolean(Talent$CombinedEnergyAbilityTracker.MONK_ABIL_USED, this.monkAbilused);
    bundle.put$String$boolean(Talent$CombinedEnergyAbilityTracker.WEP_ABIL_USED, this.wepAbilUsed);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.monkAbilused = bundle.getBoolean(Talent$CombinedEnergyAbilityTracker.MONK_ABIL_USED);
    this.wepAbilUsed = bundle.getBoolean(Talent$CombinedEnergyAbilityTracker.WEP_ABIL_USED);
  }
}

export class Talent$CounterAbilityTacker extends FlavourBuff {
  _Talent$CounterAbilityTacker(): this {
    this._FlavourBuff();
    return this;
  }
}

export class Talent$SatiatedSpellsTracker extends Buff {
  _Talent$SatiatedSpellsTracker(): this {
    this._Buff();
    return this;
  }
  icon(): number {
    return BuffIndicator.SPELL_FOOD;
  }
}

export class Talent$SearingLightCooldown extends FlavourBuff {
  _Talent$SearingLightCooldown(): this {
    this._FlavourBuff();
    return this;
  }
  icon(): number {
    return BuffIndicator.TIME;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(0, 0, 1);
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround(this.visualcooldown() / 20));
  }
}

export class Talent$CachedRationsDropped extends CounterBuff {
  _Talent$CachedRationsDropped(): this {
    this._CounterBuff();
    this.revivePersists = true;
    return this;
  }
}

export class Talent$NatureBerriesDropped extends CounterBuff {
  _Talent$NatureBerriesDropped(): this {
    this._CounterBuff();
    this.revivePersists = true;
    return this;
  }
}

export class Talent$WarriorFoodImmunity extends FlavourBuff {
  _Talent$WarriorFoodImmunity(): this {
    this._FlavourBuff();
    this.actPriority = (Actor.HERO_PRIO + 1) | 0;
    return this;
  }
}

export class Talent$ProvokedAngerTracker extends FlavourBuff {
  _Talent$ProvokedAngerTracker(): this {
    this._FlavourBuff();
    this.type_ = Buff$buffType.POSITIVE;
    return this;
  }
  icon(): number {
    return BuffIndicator.WEAPON;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(Math.fround(1.43), Math.fround(1.43), Math.fround(1.43));
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround(1 - (Math.fround(this.visualcooldown() / 5))));
  }
}

export class Talent$LingeringMagicTracker extends FlavourBuff {
  _Talent$LingeringMagicTracker(): this {
    this._FlavourBuff();
    this.type_ = Buff$buffType.POSITIVE;
    return this;
  }
  icon(): number {
    return BuffIndicator.WEAPON;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(Math.fround(1.43), Math.fround(1.43), 0);
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround(1 - (Math.fround(this.visualcooldown() / 5))));
  }
}

export class Talent$SuckerPunchTracker extends Buff {
  _Talent$SuckerPunchTracker(): this {
    this._Buff();
    return this;
  }
}

export class Talent$FollowupStrikeTracker extends FlavourBuff {
  object: number = 0;
  static readonly OBJECT: string = 'object';
  _Talent$FollowupStrikeTracker(): this {
    this._FlavourBuff();
    this.type_ = Buff$buffType.POSITIVE;
    return this;
  }
  icon(): number {
    return BuffIndicator.INVERT_MARK;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(0, 0.75, 1);
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround(1 - (Math.fround(this.visualcooldown() / 5))));
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(Talent$FollowupStrikeTracker.OBJECT, this.object);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.object = bundle.getInt(Talent$FollowupStrikeTracker.OBJECT);
  }
}

$J.define(Talent, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent', { kind: 'enum', sup: 'java.lang.Enum', ctors: { 'int,int': '_Talent$int$int', 'int': '_Talent$int' }, meths: { 'initArmorTalents(com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.ArmorAbility,java.util.ArrayList)': 'initArmorTalents$ArmorAbility$ArrayList', 'initArmorTalents(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero)': 'initArmorTalents$Hero', 'initSubclassTalents(com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass,java.util.ArrayList)': 'initSubclassTalents$HeroSubClass$ArrayList', 'initSubclassTalents(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero)': 'initSubclassTalents$Hero', 'initClassTalents(com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass,java.util.ArrayList,java.util.LinkedHashMap)': 'initClassTalents$HeroClass$ArrayList$LinkedHashMap', 'initClassTalents(com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass,java.util.ArrayList)': 'initClassTalents$HeroClass$ArrayList', 'initClassTalents(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero)': 'initClassTalents$Hero', 'desc(boolean)': 'desc$boolean', 'desc()': 'desc$' }, clinit: true, lazy: ['$VALUES', 'HEARTY_MEAL', 'VETERANS_INTUITION', 'PROVOKED_ANGER', 'IRON_WILL', 'IRON_STOMACH', 'LIQUID_WILLPOWER', 'RUNIC_TRANSFERENCE', 'LETHAL_MOMENTUM', 'IMPROVISED_PROJECTILES', 'HOLD_FAST', 'STRONGMAN', 'ENDLESS_RAGE', 'DEATHLESS_FURY', 'ENRAGED_CATALYST', 'CLEAVE', 'LETHAL_DEFENSE', 'ENHANCED_COMBO', 'BODY_SLAM', 'IMPACT_WAVE', 'DOUBLE_JUMP', 'EXPANDING_WAVE', 'STRIKING_WAVE', 'SHOCK_FORCE', 'SUSTAINED_RETRIBUTION', 'SHRUG_IT_OFF', 'EVEN_THE_ODDS', 'EMPOWERING_MEAL', 'SCHOLARS_INTUITION', 'LINGERING_MAGIC', 'BACKUP_BARRIER', 'ENERGIZING_MEAL', 'INSCRIBED_POWER', 'WAND_PRESERVATION', 'ARCANE_VISION', 'SHIELD_BATTERY', 'DESPERATE_POWER', 'ALLY_WARP', 'EMPOWERED_STRIKE', 'MYSTICAL_CHARGE', 'EXCESS_CHARGE', 'SOUL_EATER', 'SOUL_SIPHON', 'NECROMANCERS_MINIONS', 'BLAST_RADIUS', 'ELEMENTAL_POWER', 'REACTIVE_BARRIER', 'WILD_POWER', 'FIRE_EVERYTHING', 'CONSERVED_MAGIC', 'TELEFRAG', 'REMOTE_BEACON', 'LONGRANGE_WARP', 'CACHED_RATIONS', 'THIEFS_INTUITION', 'SUCKER_PUNCH', 'PROTECTIVE_SHADOWS', 'MYSTICAL_MEAL', 'INSCRIBED_STEALTH', 'WIDE_SEARCH', 'SILENT_STEPS', 'ROGUES_FORESIGHT', 'ENHANCED_RINGS', 'LIGHT_CLOAK', 'ENHANCED_LETHALITY', 'ASSASSINS_REACH', 'BOUNTY_HUNTER', 'EVASIVE_ARMOR', 'PROJECTILE_MOMENTUM', 'SPEEDY_STEALTH', 'HASTY_RETREAT', 'BODY_REPLACEMENT', 'SHADOW_STEP', 'FEAR_THE_REAPER', 'DEATHLY_DURABILITY', 'DOUBLE_MARK', 'SHADOW_BLADE', 'CLONED_ARMOR', 'PERFECT_COPY', 'NATURES_BOUNTY', 'SURVIVALISTS_INTUITION', 'FOLLOWUP_STRIKE', 'NATURES_AID', 'INVIGORATING_MEAL', 'LIQUID_NATURE', 'REJUVENATING_STEPS', 'HEIGHTENED_SENSES', 'DURABLE_PROJECTILES', 'POINT_BLANK', 'SEER_SHOT', 'FARSIGHT', 'SHARED_ENCHANTMENT', 'SHARED_UPGRADES', 'DURABLE_TIPS', 'BARKSKIN', 'SHIELDING_DEW', 'FAN_OF_BLADES', 'PROJECTING_BLADES', 'SPIRIT_BLADES', 'GROWING_POWER', 'NATURES_WRATH', 'WILD_MOMENTUM', 'EAGLE_EYE', 'GO_FOR_THE_EYES', 'SWIFT_SPIRIT', 'STRENGTHENING_MEAL', 'ADVENTURERS_INTUITION', 'PATIENT_STRIKE', 'AGGRESSIVE_BARRIER', 'FOCUSED_MEAL', 'LIQUID_AGILITY', 'WEAPON_RECHARGING', 'LETHAL_HASTE', 'SWIFT_EQUIP', 'PRECISE_ASSAULT', 'DEADLY_FOLLOWUP', 'VARIED_CHARGE', 'TWIN_UPGRADES', 'COMBINED_LETHALITY', 'UNENCUMBERED_SPIRIT', 'MONASTIC_VIGOR', 'COMBINED_ENERGY', 'CLOSE_THE_GAP', 'INVIGORATING_VICTORY', 'ELIMINATION_MATCH', 'ELEMENTAL_REACH', 'STRIKING_FORCE', 'DIRECTED_POWER', 'FEIGNED_RETREAT', 'EXPOSE_WEAKNESS', 'COUNTER_ABILITY', 'SATIATED_SPELLS', 'HOLY_INTUITION', 'SEARING_LIGHT', 'SHIELD_OF_LIGHT', 'ENLIGHTENING_MEAL', 'RECALL_INSCRIPTION', 'SUNRAY', 'DIVINE_SENSE', 'BLESS', 'CLEANSE', 'LIGHT_READING', 'HOLY_LANCE', 'HALLOWED_GROUND', 'MNEMONIC_PRAYER', 'LAY_ON_HANDS', 'AURA_OF_PROTECTION', 'WALL_OF_LIGHT', 'DIVINE_INTERVENTION', 'JUDGEMENT', 'FLASH', 'BODY_FORM', 'MIND_FORM', 'SPIRIT_FORM', 'BEAMING_RAY', 'LIFE_LINK', 'STASIS', 'HEROIC_ENERGY', 'RATSISTANCE', 'RATLOMACY', 'RATFORCEMENTS', 'tierLevelThresholds', 'removedTalents', 'renamedTalents'] });
$J.define(Talent$ImprovisedProjectileCooldown, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$ImprovisedProjectileCooldown', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Talent$ImprovisedProjectileCooldown' } });
$J.define(Talent$LethalMomentumTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$LethalMomentumTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Talent$LethalMomentumTracker' } });
$J.define(Talent$StrikingWaveTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$StrikingWaveTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Talent$StrikingWaveTracker' } });
$J.define(Talent$WandPreservationCounter, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$WandPreservationCounter', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.CounterBuff', ctors: { '': '_Talent$WandPreservationCounter' } });
$J.define(Talent$EmpoweredStrikeTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$EmpoweredStrikeTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Talent$EmpoweredStrikeTracker' } });
$J.define(Talent$ProtectiveShadowsTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$ProtectiveShadowsTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Talent$ProtectiveShadowsTracker' } });
$J.define(Talent$BountyHunterTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$BountyHunterTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Talent$BountyHunterTracker' } });
$J.define(Talent$RejuvenatingStepsCooldown, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$RejuvenatingStepsCooldown', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Talent$RejuvenatingStepsCooldown' } });
$J.define(Talent$RejuvenatingStepsFurrow, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$RejuvenatingStepsFurrow', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.CounterBuff', ctors: { '': '_Talent$RejuvenatingStepsFurrow' } });
$J.define(Talent$SeerShotCooldown, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$SeerShotCooldown', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Talent$SeerShotCooldown' } });
$J.define(Talent$SpiritBladesTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$SpiritBladesTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Talent$SpiritBladesTracker' } });
$J.define(Talent$PatientStrikeTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$PatientStrikeTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Talent$PatientStrikeTracker' } });
$J.define(Talent$AggressiveBarrierCooldown, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$AggressiveBarrierCooldown', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Talent$AggressiveBarrierCooldown' } });
$J.define(Talent$LiquidAgilEVATracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$LiquidAgilEVATracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Talent$LiquidAgilEVATracker' } });
$J.define(Talent$LiquidAgilACCTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$LiquidAgilACCTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Talent$LiquidAgilACCTracker' } });
$J.define(Talent$LethalHasteCooldown, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$LethalHasteCooldown', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Talent$LethalHasteCooldown' } });
$J.define(Talent$SwiftEquipCooldown, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$SwiftEquipCooldown', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Talent$SwiftEquipCooldown' } });
$J.define(Talent$DeadlyFollowupTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$DeadlyFollowupTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Talent$DeadlyFollowupTracker' } });
$J.define(Talent$PreciseAssaultTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$PreciseAssaultTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Talent$PreciseAssaultTracker' } });
$J.define(Talent$VariedChargeTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$VariedChargeTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Talent$VariedChargeTracker' } });
$J.define(Talent$CombinedLethalityAbilityTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$CombinedLethalityAbilityTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Talent$CombinedLethalityAbilityTracker' } });
$J.define(Talent$CombinedEnergyAbilityTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$CombinedEnergyAbilityTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Talent$CombinedEnergyAbilityTracker' } });
$J.define(Talent$CounterAbilityTacker, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$CounterAbilityTacker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Talent$CounterAbilityTacker' } });
$J.define(Talent$SatiatedSpellsTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$SatiatedSpellsTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Talent$SatiatedSpellsTracker' } });
$J.define(Talent$SearingLightCooldown, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$SearingLightCooldown', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Talent$SearingLightCooldown' } });
$J.define(Talent$CachedRationsDropped, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$CachedRationsDropped', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.CounterBuff', ctors: { '': '_Talent$CachedRationsDropped' } });
$J.define(Talent$NatureBerriesDropped, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$NatureBerriesDropped', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.CounterBuff', ctors: { '': '_Talent$NatureBerriesDropped' } });
$J.define(Talent$WarriorFoodImmunity, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$WarriorFoodImmunity', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Talent$WarriorFoodImmunity' } });
$J.define(Talent$ProvokedAngerTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$ProvokedAngerTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Talent$ProvokedAngerTracker' } });
$J.define(Talent$LingeringMagicTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$LingeringMagicTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Talent$LingeringMagicTracker' } });
$J.define(Talent$SuckerPunchTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$SuckerPunchTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Talent$SuckerPunchTracker' } });
$J.define(Talent$FollowupStrikeTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$FollowupStrikeTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Talent$FollowupStrikeTracker' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  GamesInProgress = $J.load('com.shatteredpixel.shatteredpixeldungeon.GamesInProgress');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  ArtifactRecharge = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ArtifactRecharge');
  Barrier = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Barrier');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  EnhancedRings = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.EnhancedRings');
  Haste = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Haste');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  LostInventory = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.LostInventory');
  PhysicalEmpower = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.PhysicalEmpower');
  Recharging = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Recharging');
  RevealedArea = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.RevealedArea');
  Roots = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Roots');
  ScrollEmpower = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ScrollEmpower');
  WandEmpower = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.WandEmpower');
  HeroClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  Ratmogrify = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.Ratmogrify');
  DivineSense$DivineSenseTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.DivineSense$DivineSenseTracker');
  RecallInscription$UsedItemTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.RecallInscription$UsedItemTracker');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Flare = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Flare');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  SpellSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.SpellSprite');
  LeafParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.LeafParticle');
  BrokenSeal$WarriorShield = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.BrokenSeal$WarriorShield');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Armor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor');
  ClothArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.ClothArmor');
  CloakOfShadows = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.CloakOfShadows');
  HolyTome = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.HolyTome');
  HornOfPlenty = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.HornOfPlenty');
  Ring = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.Ring');
  Scroll = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.Scroll');
  ScrollOfRecharging = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRecharging');
  ScrollOfUpgrade = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfUpgrade');
  Runestone = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.Runestone');
  StoneOfIntuition = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfIntuition');
  StoneOfIntuition$IntuitionUseTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfIntuition$IntuitionUseTracker');
  ShardOfOblivion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ShardOfOblivion');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  SpiritBow = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.SpiritBow');
  SpiritBow$SpiritArrow = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.SpiritBow$SpiritArrow');
  Weapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon');
  Gloves = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Gloves');
  MeleeWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon');
  MeleeWeapon$Charger = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon$Charger');
  MissileWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon');
  Level = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Game = $J.load('com.watabou.noosa.Game');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Bundle = $J.load('com.watabou.utils.Bundle');
  GameMath = $J.load('com.watabou.utils.GameMath');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
