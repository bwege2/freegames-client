// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/Char.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Arrays, HashSet, JEnum, LinkedHashSet } from '../../../../../jre/index.ts';
import { Actor } from './Actor.ts';

let Assets$Sounds, Badges, Dungeon, Electricity, StormCloud, ToxicGas, Adrenaline, AllyBuff, Amok, ArcaneArmor, AscensionChallenge, Barkskin, Berserk, Bleeding, Bless, Buff, Buff$DOTbuff, Buff$buffType, Burning, ChampionEnemy, ChampionEnemy$Giant, Charm, Chill, Corrosion, Corruption, Cripple, Daze, Doom, Dread, FireImbue, Frost, FrostImbue, Fury, Haste, Hex, Hunger, Invulnerability, LifeLink, LostInventory, MagicalSleep, Momentum, MonkEnergy$MonkAbility$Focus$FocusBuff, MonkEnergy$MonkAbility$Meditate$MeditateResistance, MonkEnergy$MonkAbility$UnarmedAbilityTracker, Ooze, Paralysis, Poison, Preparation, ShieldBuff, Sleep, Slow, SnipersMark, Speed, Stamina, Terror, Vertigo, Vulnerable, Weakness, Hero, HeroClass, HeroSubClass, Talent, Talent$BountyHunterTracker, Talent$CombinedLethalityAbilityTracker, Talent$DeadlyFollowupTracker, Talent$FollowupStrikeTracker, PowerOfMany$PowerBuff, Challenge$SpectatorFreeze, DeathMark, DeathMark$DeathMarkTracker, Endure$EndureTracker, AuraOfProtection$AuraBuff, BeamingRay$BeamingRayBoost, GuidingLight, GuidingLight$Illuminated, LifeLinkSpell$LifeLinkSpellBuff, ShieldOfLight$ShieldOfLightTracker, Brute$BruteRage, CrystalSpire$SpireSpike, DwarfKing$KingDamager, DwarfKing$Summoning, Elemental$FireElemental, Elemental$FrostElemental, Elemental$ShockElemental, GnollGeomancer$Boulder, GnollGeomancer$GnollRockFall, Necromancer$SummoningBlockDamage, Tengu$BombAbility$BombItem, Tengu$ShockerAbility$ShockerItem, MirrorImage, PrismaticImage, FloatingText, Splash, ShadowParticle, BrokenSeal$WarriorShield, Heap, Heap$Type, Bulk, AntiMagic, Brimstone, Flow, Obfuscation, Potential, Swiftness, Viscosity$DeferedDamage, Viscosity$ViscosityTracker, DriedRose$GhostHero$NoRoseDamage, TimekeepersHourglass$timeFreeze, PotionOfCleansing$Cleanse, Pickaxe, RingOfElements, ScrollOfRetribution, ScrollOfTeleportation, ScrollOfChallenge$ChallengeArena, ScrollOfPsionicBlast, FerretTuft, WandOfBlastWave$Knockback, WandOfFireblast, WandOfFrost, WandOfLightning, WandOfLivingEarth$EarthGuardian, Weapon$Enchantment, Blazing, Grim, Grim$GrimTracker, Kinetic$ConservedDamage, Kinetic$KineticTracker, Shocking, Vorpal, Vorpal$VorpalTracker, MeleeWeapon, Sickle$HarvestBleedTracker, MissileWeapon, ShockingDart, Terrain, Chasm, Door, GeyserTrap, GnollRockfallTrap, GrimTrap, Languages, Messages, Earthroot$Armor, Swiftthistle$TimeBubble, GameScene, CharSprite, MobSprite, TargetHealthIndicator, GLog, Sample, BArray, PathFinder, PointF, Random;

export class Char extends Actor {
  pos: number = 0;
  sprite_: CharSprite = null;
  HT: number = 0;
  HP: number = 0;
  baseSpeed: number = 0;
  path: PathFinder$Path = null;
  paralysed: number = 0;
  rooted: boolean = false;
  flying: boolean = false;
  invisible: number = 0;
  alignment: Char$Alignment = null;
  viewDistance: number = 0;
  fieldOfView: boolean[] = null;
  buffs: LinkedHashSet<Buff> = null;
  static readonly POS: string = 'pos';
  static readonly PREV_POS: string = 'prev_pos';
  static readonly TAG_HP: string = 'HP';
  static readonly TAG_HT: string = 'HT';
  static readonly TAG_SHLD: string = 'SHLD';
  static readonly BUFFS: string = 'buffs';
  static INFINITE_ACCURACY: number = 0;
  static INFINITE_EVASION: number = 0;
  static hitMissIcon: number = 0;
  cachedShield: number = 0;
  needsShieldUpdate: boolean = false;
  cachedIncomingDOT: number = 0;
  needsIncomingDOTUpdate: boolean = false;
  static NO_ARMOR_PHYSICAL_SOURCES: HashSet<JClass> = null;
  deathMarked: boolean = false;
  previousPos: number = 0;
  resistances_: HashSet<JClass> = null;
  immunities_: HashSet<JClass> = null;
  properties_: HashSet<Char$Property> = null;
  _Char(): this {
    this._Actor();
    this.pos = 0;
    this.baseSpeed = 1;
    this.paralysed = 0;
    this.rooted = false;
    this.flying = false;
    this.invisible = 0;
    this.viewDistance = 8;
    this.fieldOfView = null;
    this.buffs = new LinkedHashSet();
    this.cachedShield = 0;
    this.needsShieldUpdate = true;
    this.cachedIncomingDOT = 0;
    this.needsIncomingDOTUpdate = true;
    Char.NO_ARMOR_PHYSICAL_SOURCES.add($J.cls(CrystalSpire$SpireSpike));
    Char.NO_ARMOR_PHYSICAL_SOURCES.add($J.cls(GnollGeomancer$Boulder));
    Char.NO_ARMOR_PHYSICAL_SOURCES.add($J.cls(GnollGeomancer$GnollRockFall));
    Char.NO_ARMOR_PHYSICAL_SOURCES.add($J.cls(GnollRockfallTrap));
    Char.NO_ARMOR_PHYSICAL_SOURCES.add($J.cls(DwarfKing$KingDamager));
    Char.NO_ARMOR_PHYSICAL_SOURCES.add($J.cls(DwarfKing$Summoning));
    Char.NO_ARMOR_PHYSICAL_SOURCES.add($J.cls(LifeLink));
    Char.NO_ARMOR_PHYSICAL_SOURCES.add($J.cls(Chasm));
    Char.NO_ARMOR_PHYSICAL_SOURCES.add($J.cls(WandOfBlastWave$Knockback));
    Char.NO_ARMOR_PHYSICAL_SOURCES.add($J.cls(Heap));
    Char.NO_ARMOR_PHYSICAL_SOURCES.add($J.cls(Necromancer$SummoningBlockDamage));
    Char.NO_ARMOR_PHYSICAL_SOURCES.add($J.cls(DriedRose$GhostHero$NoRoseDamage));
    this.deathMarked = false;
    this.previousPos = -1;
    this.resistances_ = new HashSet();
    this.immunities_ = new HashSet();
    this.properties_ = new HashSet();
    return this;
  }
  act(): boolean {
    if (this.fieldOfView == null || this.fieldOfView.length !== Dungeon.level.length()) {
      this.fieldOfView = $J.newArray(Dungeon.level.length(), false);
    }
    Dungeon.level.updateFieldOfView(this, this.fieldOfView);
    if (this.properties().contains(Char$Property.IMMOVABLE)) {
      this.throwItems();
    }
    return false;
  }
  throwItems(): void {
    let heap = Dungeon.level.heaps.get(this.pos);
    if (heap != null && heap.type_ === Heap$Type.HEAP && !(heap.peek() instanceof Tengu$BombAbility$BombItem) && !(heap.peek() instanceof Tengu$ShockerAbility$ShockerItem)) {
      let candidates = new ArrayList();
      for (let n of PathFinder.NEIGHBOURS8) {
        if (Dungeon.level.passable[(this.pos + n) | 0]) {
          candidates.add((this.pos + n) | 0);
        }
      }
      if (!candidates.isEmpty()) {
        Dungeon.level.drop(heap.pickUp(), Random.element$Collection(candidates)).sprite_.drop$int(this.pos);
      }
    }
  }
  name(): string {
    return Messages.get$Object$String$ObjectArr(this, 'name', []);
  }
  canInteract(c: Char): boolean {
    if (Dungeon.level.adjacent(this.pos, c.pos)) {
      return true;
    } else if (c instanceof Hero && this.alignment === Char$Alignment.ALLY && !Char.hasProp(this, Char$Property.IMMOVABLE) && Dungeon.level.distance(this.pos, c.pos) <= Math.imul(2, Dungeon.hero.pointsInTalent(Talent.ALLY_WARP))) {
      return true;
    } else {
      return false;
    }
  }
  interact(c: Char): boolean {
    if (!Dungeon.level.passable[this.pos] && !c.flying) {
      return true;
    }
    if (this.properties().contains(Char$Property.LARGE) && !Dungeon.level.openSpace[c.pos] || c.properties().contains(Char$Property.LARGE) && !Dungeon.level.openSpace[this.pos]) {
      return true;
    }
    let oldPos = this.pos;
    let newPos = c.pos;
    if (Char.hasProp(this, Char$Property.IMMOVABLE) || Char.hasProp(c, Char$Property.IMMOVABLE)) {
      return true;
    }
    if (c === Dungeon.hero && Dungeon.hero.hasTalent(Talent.ALLY_WARP)) {
      PathFinder.buildDistanceMap$int$booleanArr(c.pos, BArray.or$booleanArr$booleanArr$booleanArr(Dungeon.level.passable, Dungeon.level.avoid, null));
      if (PathFinder.distance[this.pos] === 2147483647) {
        return true;
      }
      this.pos = newPos;
      c.pos = oldPos;
      ScrollOfTeleportation.appear(this, newPos);
      ScrollOfTeleportation.appear(c, oldPos);
      Dungeon.observe$();
      GameScene.updateFog$();
      return true;
    }
    if (this.paralysed > 0 || c.paralysed > 0 || this.rooted || c.rooted || this.buff($J.cls(Vertigo)) != null || c.buff($J.cls(Vertigo)) != null) {
      return true;
    }
    c.pos = oldPos;
    this.moveSprite(oldPos, newPos);
    this.move$int(newPos);
    c.pos = newPos;
    c.sprite_.move(newPos, oldPos);
    c.move$int(oldPos);
    c.spend(Math.fround(1 / c.speed()));
    if (c === Dungeon.hero) {
      if (Dungeon.hero.subClass === HeroSubClass.FREERUNNER) {
        Buff.affect$Char$Class(Dungeon.hero, $J.cls(Momentum)).gainStack();
      }
      Dungeon.hero.busy();
    }
    return true;
  }
  moveSprite(from: number, to: number): boolean {
    if (this.sprite_.isVisible() && this.sprite_.parent != null && (Dungeon.level.heroFOV[from] || Dungeon.level.heroFOV[to])) {
      this.sprite_.move(from, to);
      return true;
    } else {
      this.sprite_.turnTo(from, to);
      this.sprite_.place(to);
      return true;
    }
  }
  hitSound(pitch: number): void {
    Sample.INSTANCE.play$Object$float$float(Assets$Sounds.HIT, 1, pitch);
  }
  blockSound(pitch: number): boolean {
    return false;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(Char.POS, this.pos);
    bundle.put$String$int(Char.PREV_POS, this.previousPos);
    bundle.put$String$int(Char.TAG_HP, this.HP);
    bundle.put$String$int(Char.TAG_HT, this.HT);
    bundle.put$String$Collection(Char.BUFFS, this.buffs);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.pos = bundle.getInt(Char.POS);
    this.previousPos = bundle.getInt(Char.PREV_POS);
    this.HP = bundle.getInt(Char.TAG_HP);
    this.HT = bundle.getInt(Char.TAG_HT);
    for (const $it0 = bundle.getCollection(Char.BUFFS).iterator(); $it0.hasNext(); ) {
      let b = $it0.next();
      if (b != null) {
        (b).attachTo(this);
      }
    }
  }
  attack$Char(enemy: Char): boolean {
    return this.attack$Char$float$float$float(enemy, 1, 0, 1);
  }
  attack$Char$float$float$float(enemy: Char, dmgMulti: number, dmgBonus: number, accMulti: number): boolean {
    if (enemy == null) {
      return false;
    }
    let visibleFight = Dungeon.level.heroFOV[this.pos] || Dungeon.level.heroFOV[enemy.pos];
    if (enemy.isInvulnerable($J.getClass(this))) {
      if (visibleFight) {
        enemy.sprite_.showStatus(CharSprite.POSITIVE, Messages.get$Object$String$ObjectArr(this, 'invulnerable', []), []);
        Sample.INSTANCE.play$Object$float$float(Assets$Sounds.HIT_PARRY, 1, Random.Float$float$float(Math.fround(0.96), Math.fround(1.05)));
      }
      return false;
    } else if (Char.hit$Char$Char$float$boolean(this, enemy, accMulti, false)) {
      let dr = $J.roundf(Math.fround(enemy.drRoll() * AscensionChallenge.statModifier(enemy)));
      if (this instanceof Hero) {
        let h = this;
        if (h.belongings.attackingWeapon() instanceof MissileWeapon && h.subClass === HeroSubClass.SNIPER && !Dungeon.level.adjacent(h.pos, enemy.pos)) {
          dr = 0;
        }
        if (h.buff($J.cls(MonkEnergy$MonkAbility$UnarmedAbilityTracker)) != null) {
          dr = 0;
        }
      }
      let dmg: number;
      let prep = this.buff($J.cls(Preparation));
      if (prep != null) {
        dmg = Math.fround(prep.damageRoll(this));
        if (this === Dungeon.hero && Dungeon.hero.hasTalent(Talent.BOUNTY_HUNTER)) {
          Buff.affect$Char$Class$float(Dungeon.hero, $J.cls(Talent$BountyHunterTracker), 0);
        }
      } else {
        dmg = Math.fround(this.damageRoll());
      }
      dmg = Math.fround(dmg * dmgMulti);
      dmg = Math.fround(dmg + dmgBonus);
      if (enemy.buff($J.cls(GuidingLight$Illuminated)) != null) {
        enemy.buff($J.cls(GuidingLight$Illuminated)).detach();
        if (this === Dungeon.hero && Dungeon.hero.hasTalent(Talent.SEARING_LIGHT)) {
          dmg = Math.fround(dmg + ((1 + Math.imul(2, Dungeon.hero.pointsInTalent(Talent.SEARING_LIGHT))) | 0));
        }
        if (this !== Dungeon.hero && Dungeon.hero.subClass === HeroSubClass.PRIEST) {
          enemy.damage((5 + Dungeon.hero.lvl) | 0, GuidingLight.INSTANCE);
        }
      }
      let berserk = this.buff($J.cls(Berserk));
      if (berserk != null) {
        dmg = berserk.damageFactor(dmg);
      }
      if (this.buff($J.cls(Fury)) != null) {
        dmg = Math.fround(dmg * 1.5);
      }
      if (this.buff($J.cls(PowerOfMany$PowerBuff)) != null) {
        if (this.buff($J.cls(BeamingRay$BeamingRayBoost)) != null && this.buff($J.cls(BeamingRay$BeamingRayBoost)).object === enemy.id()) {
          dmg = Math.fround(dmg * Math.fround(Math.fround(1.3) + Math.fround(Math.fround(0.05) * Dungeon.hero.pointsInTalent(Talent.BEAMING_RAY))));
        } else {
          dmg = Math.fround(dmg * 1.25);
        }
      }
      for (const $it1 = this.buffs$Class($J.cls(ChampionEnemy)).iterator(); $it1.hasNext(); ) {
        let buff = $it1.next();
        dmg = Math.fround(dmg * buff.meleeDamageFactor());
      }
      dmg = Math.fround(dmg * AscensionChallenge.statModifier(this));
      let endure = this.buff($J.cls(Endure$EndureTracker));
      if (endure != null) {
        dmg = endure.damageFactor(dmg);
      }
      endure = enemy.buff($J.cls(Endure$EndureTracker));
      if (endure != null) {
        dmg = endure.adjustDamageTaken(dmg);
      }
      if (enemy.buff($J.cls(ScrollOfChallenge$ChallengeArena)) != null) {
        dmg = Math.fround(dmg * Math.fround(0.67));
      }
      if (Dungeon.hero.alignment === enemy.alignment && Dungeon.hero.buff($J.cls(AuraOfProtection$AuraBuff)) != null && (Dungeon.level.distance(enemy.pos, Dungeon.hero.pos) <= 2 || enemy.buff($J.cls(LifeLinkSpell$LifeLinkSpellBuff)) != null)) {
        dmg = Math.fround(dmg * Math.fround(Math.fround(0.9) - Math.fround(Math.fround(0.1) * Dungeon.hero.pointsInTalent(Talent.AURA_OF_PROTECTION))));
      }
      if (enemy.buff($J.cls(MonkEnergy$MonkAbility$Meditate$MeditateResistance)) != null) {
        dmg = Math.fround(dmg * Math.fround(0.2));
      }
      if (this.buff($J.cls(Weakness)) != null) {
        dmg = Math.fround(dmg * Math.fround(0.67));
      }
      let effectiveDamage = enemy.defenseProc(this, $J.roundf(dmg));
      if (effectiveDamage >= 0) {
        effectiveDamage = Math.max((effectiveDamage - dr) | 0, 0);
        if (enemy.buff($J.cls(Viscosity$ViscosityTracker)) != null) {
          effectiveDamage = enemy.buff($J.cls(Viscosity$ViscosityTracker)).deferDamage(effectiveDamage);
          enemy.buff($J.cls(Viscosity$ViscosityTracker)).detach();
        }
        if (enemy.buff($J.cls(Vulnerable)) != null) {
          effectiveDamage = $J.d2i(Math.fround(effectiveDamage * Math.fround(1.33)));
        }
        effectiveDamage = this.attackProc(enemy, effectiveDamage);
      }
      if (visibleFight) {
        if (effectiveDamage > 0 || !enemy.blockSound(Random.Float$float$float(Math.fround(0.96), Math.fround(1.05)))) {
          this.hitSound(Random.Float$float$float(Math.fround(0.87), Math.fround(1.15)));
        }
      }
      if (!enemy.isAlive()) {
        return true;
      }
      enemy.damage(effectiveDamage, this);
      if (this.buff($J.cls(FireImbue)) != null) {
        this.buff($J.cls(FireImbue)).proc(enemy);
      }
      if (this.buff($J.cls(FrostImbue)) != null) {
        this.buff($J.cls(FrostImbue)).proc(enemy);
      }
      if (enemy.isAlive() && enemy.alignment !== this.alignment && prep != null && prep.canKO(enemy)) {
        enemy.HP = 0;
        for (const $it2 = enemy.buffs$Class($J.cls(Brute$BruteRage)).iterator(); $it2.hasNext(); ) {
          let b = $it2.next();
          b.detach();
        }
        if (!enemy.isAlive()) {
          enemy.die(this);
        } else {
          enemy.damage(-1, this);
          DeathMark.processFearTheReaper(enemy);
        }
        if (enemy.sprite_ != null) {
          enemy.sprite_.showStatus(CharSprite.NEGATIVE, Messages.get$Class$String$ObjectArr($J.cls(Preparation), 'assassinated', []), []);
        }
      }
      let combinedLethality = this.buff($J.cls(Talent$CombinedLethalityAbilityTracker));
      if (combinedLethality != null && this instanceof Hero && (this).belongings.attackingWeapon() instanceof MeleeWeapon && combinedLethality.weapon_ !== (this).belongings.attackingWeapon()) {
        if (enemy.isAlive() && enemy.alignment !== this.alignment && !Char.hasProp(enemy, Char$Property.BOSS) && !Char.hasProp(enemy, Char$Property.MINIBOSS) && (Math.fround(enemy.HP / Math.fround(enemy.HT))) <= Math.fround(Math.fround(Math.fround(0.4) * (this).pointsInTalent(Talent.COMBINED_LETHALITY)) / 3)) {
          enemy.HP = 0;
          for (const $it3 = enemy.buffs$Class($J.cls(Brute$BruteRage)).iterator(); $it3.hasNext(); ) {
            let b = $it3.next();
            b.detach();
          }
          if (!enemy.isAlive()) {
            enemy.die(this);
          } else {
            enemy.damage(-1, this);
            DeathMark.processFearTheReaper(enemy);
          }
          if (enemy.sprite_ != null) {
            enemy.sprite_.showStatus(CharSprite.NEGATIVE, Messages.get$Class$String$ObjectArr($J.cls(Talent$CombinedLethalityAbilityTracker), 'executed', []), []);
          }
        }
        combinedLethality.detach();
      }
      if (enemy.sprite_ != null) {
        enemy.sprite_.bloodBurstA(this.sprite_.center$(), effectiveDamage);
        enemy.sprite_.flash();
      }
      if (!enemy.isAlive() && visibleFight) {
        if (enemy === Dungeon.hero) {
          if (this === Dungeon.hero) {
            return true;
          }
          if (this instanceof WandOfLivingEarth$EarthGuardian || this instanceof MirrorImage || this instanceof PrismaticImage) {
            Badges.validateDeathFromFriendlyMagic();
          }
          Dungeon.fail(this);
          GLog.n(Messages.capitalize(Messages.get$Class$String$ObjectArr($J.cls(Char), 'kill', [this.name()])), []);
        } else if (this === Dungeon.hero) {
          GLog.i(Messages.capitalize(Messages.get$Class$String$ObjectArr($J.cls(Char), 'defeat', [enemy.name()])), []);
        }
      }
      return true;
    } else if (!Char.hasProp(enemy, Char$Property.OBJECT)) {
      if (enemy.sprite_ != null) {
        if (Char.hitMissIcon !== -1) {
          if (Char.hitMissIcon === FloatingText.MISS_TUFT && Messages.lang() === Languages.ENGLISH && Random.Int$int(10) === 0) {
            enemy.sprite_.showStatusWithIcon(CharSprite.NEUTRAL, 'dooked', Char.hitMissIcon, []);
          } else {
            enemy.sprite_.showStatusWithIcon(CharSprite.NEUTRAL, enemy.defenseVerb(), Char.hitMissIcon, []);
          }
          Char.hitMissIcon = -1;
        } else {
          enemy.sprite_.showStatus(CharSprite.NEUTRAL, enemy.defenseVerb(), []);
        }
      }
      if (visibleFight) {
        Sample.INSTANCE.play$Object(Assets$Sounds.MISS);
      }
      return false;
    } else {
      return false;
    }
  }
  static hit$Char$Char$boolean(attacker: Char, defender: Char, magic: boolean): boolean {
    return Char.hit$Char$Char$float$boolean(attacker, defender, magic ? 2 : 1, magic);
  }
  static hit$Char$Char$float$boolean(attacker: Char, defender: Char, accMulti: number, magic: boolean): boolean {
    let acuStat = Math.fround(attacker.attackSkill(defender));
    let defStat = Math.fround(defender.defenseSkill(attacker));
    if (defender instanceof Hero && (defender).damageInterrupt) {
      (defender).interrupt();
    }
    if (attacker.invisible > 0 && attacker.canSurpriseAttack()) {
      acuStat = Math.fround(Char.INFINITE_ACCURACY);
    }
    if (defender.buff($J.cls(MonkEnergy$MonkAbility$Focus$FocusBuff)) != null) {
      defStat = Math.fround(Char.INFINITE_EVASION);
    }
    if (defStat >= Math.fround(Char.INFINITE_EVASION)) {
      Char.hitMissIcon = FloatingText.getMissReasonIcon(attacker, acuStat, defender, Math.fround(Char.INFINITE_EVASION));
      return false;
    } else if (acuStat >= Math.fround(Char.INFINITE_ACCURACY)) {
      Char.hitMissIcon = FloatingText.getHitReasonIcon(attacker, Math.fround(Char.INFINITE_ACCURACY), defender, defStat);
      return true;
    }
    let acuRoll = Random.Float$float(acuStat);
    if (attacker.buff($J.cls(Bless)) != null) {
      acuRoll = Math.fround(acuRoll * 1.25);
    }
    if (attacker.buff($J.cls(Hex)) != null) {
      acuRoll = Math.fround(acuRoll * Math.fround(0.8));
    }
    if (attacker.buff($J.cls(Daze)) != null) {
      acuRoll = Math.fround(acuRoll * 0.5);
    }
    for (const $it4 = attacker.buffs$Class($J.cls(ChampionEnemy)).iterator(); $it4.hasNext(); ) {
      let buff = $it4.next();
      acuRoll = Math.fround(acuRoll * buff.evasionAndAccuracyFactor());
    }
    acuRoll = Math.fround(acuRoll * AscensionChallenge.statModifier(attacker));
    if (Dungeon.hero.heroClass !== HeroClass.CLERIC && Dungeon.hero.hasTalent(Talent.BLESS) && attacker.alignment === Char$Alignment.ALLY) {
      acuRoll = Math.fround(acuRoll * Math.fround(Math.fround(1.01) + Math.fround(Math.fround(0.02) * Dungeon.hero.pointsInTalent(Talent.BLESS))));
    }
    acuRoll = Math.fround(acuRoll * accMulti);
    let defRoll = Random.Float$float(defStat);
    if (defender.buff($J.cls(Bless)) != null) {
      defRoll = Math.fround(defRoll * 1.25);
    }
    if (defender.buff($J.cls(Hex)) != null) {
      defRoll = Math.fround(defRoll * Math.fround(0.8));
    }
    if (defender.buff($J.cls(Daze)) != null) {
      defRoll = Math.fround(defRoll * 0.5);
    }
    for (const $it5 = defender.buffs$Class($J.cls(ChampionEnemy)).iterator(); $it5.hasNext(); ) {
      let buff = $it5.next();
      defRoll = Math.fround(defRoll * buff.evasionAndAccuracyFactor());
    }
    defRoll = Math.fround(defRoll * AscensionChallenge.statModifier(defender));
    if (Dungeon.hero.heroClass !== HeroClass.CLERIC && Dungeon.hero.hasTalent(Talent.BLESS) && defender.alignment === Char$Alignment.ALLY) {
      defRoll = Math.fround(defRoll * Math.fround(Math.fround(1.01) + Math.fround(Math.fround(0.02) * Dungeon.hero.pointsInTalent(Talent.BLESS))));
    }
    defRoll = Math.fround(defRoll * FerretTuft.evasionMultiplier$());
    if (acuRoll >= defRoll) {
      Char.hitMissIcon = FloatingText.getHitReasonIcon(attacker, acuRoll, defender, defRoll);
      return true;
    } else {
      Char.hitMissIcon = FloatingText.getMissReasonIcon(attacker, acuRoll, defender, defRoll);
      return false;
    }
  }
  attackSkill(target: Char): number {
    return 0;
  }
  defenseSkill(enemy: Char): number {
    return 0;
  }
  defenseVerb(): string {
    return Messages.get$Object$String$ObjectArr(this, 'def_verb', []);
  }
  drRoll(): number {
    let dr = 0;
    dr = (dr + Random.NormalIntRange(0, Barkskin.currentLevel(this))) | 0;
    return dr;
  }
  damageRoll(): number {
    return 1;
  }
  attackProc(enemy: Char, damage: number): number {
    for (const $it6 = this.buffs$Class($J.cls(ChampionEnemy)).iterator(); $it6.hasNext(); ) {
      let buff = $it6.next();
      buff.onAttackProc(enemy);
    }
    return damage;
  }
  defenseProc(enemy: Char, damage: number): number {
    let armor = this.buff($J.cls(Earthroot$Armor));
    if (armor != null) {
      damage = armor.absorb(damage);
    }
    let shield = this.buff($J.cls(ShieldOfLight$ShieldOfLightTracker));
    if (shield != null && shield.object === enemy.id()) {
      let min = (1 + Dungeon.hero.pointsInTalent(Talent.SHIELD_OF_LIGHT)) | 0;
      damage = (damage - Random.NormalIntRange(min, Math.imul(2, min))) | 0;
      damage = Math.max(damage, 0);
    } else if (this === Dungeon.hero && Dungeon.hero.heroClass !== HeroClass.CLERIC && Dungeon.hero.hasTalent(Talent.SHIELD_OF_LIGHT) && TargetHealthIndicator.instance.target$() === enemy) {
      if (Random.Int$int(6) < ((1 + Dungeon.hero.pointsInTalent(Talent.SHIELD_OF_LIGHT)) | 0)) {
        damage = (damage - 1) | 0;
      }
    }
    if (!(this instanceof Hero || this instanceof PrismaticImage)) {
      if (Dungeon.hero.alignment === this.alignment && Dungeon.hero.belongings.armor() != null && Dungeon.hero.buff($J.cls(AuraOfProtection$AuraBuff)) != null && (Dungeon.level.distance(this.pos, Dungeon.hero.pos) <= 2 || this.buff($J.cls(LifeLinkSpell$LifeLinkSpellBuff)) != null)) {
        damage = Dungeon.hero.belongings.armor().proc(enemy, this, damage);
      }
    }
    return damage;
  }
  glyphLevel(cls: JClass<Armor$Glyph>): number {
    if (Dungeon.hero != null && Dungeon.level != null && this !== Dungeon.hero && Dungeon.hero.alignment === this.alignment && Dungeon.hero.buff($J.cls(AuraOfProtection$AuraBuff)) != null && (Dungeon.level.distance(this.pos, Dungeon.hero.pos) <= 2 || this.buff($J.cls(LifeLinkSpell$LifeLinkSpellBuff)) != null)) {
      return Dungeon.hero.glyphLevel(cls);
    } else {
      return -1;
    }
  }
  speed(): number {
    let speed = this.baseSpeed;
    if (this.buff($J.cls(Cripple)) != null) {
      speed = Math.fround(speed / 2);
    }
    if (this.buff($J.cls(Stamina)) != null) {
      speed = Math.fround(speed * 1.5);
    }
    if (this.buff($J.cls(Adrenaline)) != null) {
      speed = Math.fround(speed * 2);
    }
    if (this.buff($J.cls(Haste)) != null) {
      speed = Math.fround(speed * 3);
    }
    if (this.buff($J.cls(Dread)) != null) {
      speed = Math.fround(speed * 2);
    }
    speed = Math.fround(speed * Swiftness.speedBoost(this, this.glyphLevel($J.cls(Swiftness))));
    speed = Math.fround(speed * Flow.speedBoost(this, this.glyphLevel($J.cls(Flow))));
    speed = Math.fround(speed * Bulk.speedBoost(this, this.glyphLevel($J.cls(Bulk))));
    return speed;
  }
  canSurpriseAttack(): boolean {
    return true;
  }
  shielding(): number {
    if (!this.needsShieldUpdate) {
      return this.cachedShield;
    }
    this.cachedShield = 0;
    for (const $it7 = this.buffs$Class($J.cls(ShieldBuff)).iterator(); $it7.hasNext(); ) {
      let s = $it7.next();
      this.cachedShield = (this.cachedShield + s.shielding()) | 0;
    }
    this.needsShieldUpdate = false;
    return this.cachedShield;
  }
  incomingDOT(): number {
    if (!this.needsIncomingDOTUpdate) {
      return this.cachedIncomingDOT;
    }
    this.cachedIncomingDOT = 0;
    for (const $it8 = this.buffs$().iterator(); $it8.hasNext(); ) {
      let b = $it8.next();
      if ($J.isa(b, Buff$DOTbuff)) {
        this.cachedIncomingDOT = (this.cachedIncomingDOT + $J.roundf(Math.fround(this.resist(b.getClass()) * (b).totalIncomingDMG()))) | 0;
      }
    }
    for (const $it9 = this.buffs$Class($J.cls(ChampionEnemy)).iterator(); $it9.hasNext(); ) {
      let buff = $it9.next();
      this.cachedIncomingDOT = $J.d2i(Math.ceil(Math.fround(this.cachedIncomingDOT * buff.damageTakenFactor())));
    }
    this.needsIncomingDOTUpdate = false;
    return this.cachedIncomingDOT;
  }
  damage(dmg: number, src: any): void {
    if (!this.isAlive() || dmg < 0) {
      return;
    }
    if (this.isInvulnerable($J.getClass(src))) {
      this.sprite_.showStatus(CharSprite.POSITIVE, Messages.get$Object$String$ObjectArr(this, 'invulnerable', []), []);
      return;
    }
    if (!(src instanceof LifeLink || src instanceof Hunger) && this.buff($J.cls(LifeLink)) != null) {
      let links = this.buffs$Class($J.cls(LifeLink));
      for (let link of $J.toArrayInto(links.toArray(), $J.newArray(0, null))) {
        if (Actor.findById(link.object) == null) {
          links.remove(link);
          link.detach();
        }
      }
      dmg = $J.d2i(Math.ceil(Math.fround(dmg / Math.fround(((links.size() + 1) | 0)))));
      for (const $it10 = links.iterator(); $it10.hasNext(); ) {
        let link = $it10.next();
        let ch = Actor.findById(link.object);
        if (ch != null) {
          ch.damage(dmg, link);
          if (!ch.isAlive()) {
            link.detach();
            if (ch === Dungeon.hero) {
              Badges.validateDeathFromFriendlyMagic();
              Dungeon.fail(src);
              GLog.n(Messages.get$Class$String$ObjectArr($J.cls(LifeLink), 'ondeath', []), []);
            }
          }
        }
      }
    }
    let damage = Math.fround(dmg);
    if (!(src instanceof Char)) {
      if (Dungeon.hero.alignment === this.alignment && Dungeon.hero.buff($J.cls(AuraOfProtection$AuraBuff)) != null && (Dungeon.level.distance(this.pos, Dungeon.hero.pos) <= 2 || this.buff($J.cls(LifeLinkSpell$LifeLinkSpellBuff)) != null)) {
        damage = Math.fround(damage * Math.fround(Math.fround(0.9) - Math.fround(Math.fround(0.1) * Dungeon.hero.pointsInTalent(Talent.AURA_OF_PROTECTION))));
      }
    }
    if (this.buff($J.cls(PowerOfMany$PowerBuff)) != null) {
      if (this.buff($J.cls(LifeLinkSpell$LifeLinkSpellBuff)) != null) {
        damage = Math.fround(damage * Math.fround(Math.fround(0.7) - Math.fround(Math.fround(0.05) * Dungeon.hero.pointsInTalent(Talent.LIFE_LINK))));
      } else {
        damage = Math.fround(damage * 0.75);
      }
    }
    let t = this.buff($J.cls(Terror));
    if (t != null) {
      t.recover();
    }
    let d = this.buff($J.cls(Dread));
    if (d != null) {
      d.recover();
    }
    let c = this.buff($J.cls(Charm));
    if (c != null) {
      c.recover(src);
    }
    if (this.buff($J.cls(Frost)) != null) {
      Buff.detach(this, $J.cls(Frost));
    }
    if (this.buff($J.cls(MagicalSleep)) != null) {
      Buff.detach(this, $J.cls(MagicalSleep));
    }
    if (this.buff($J.cls(Doom)) != null && !this.isImmune($J.cls(Doom))) {
      damage = Math.fround(damage * Math.fround(1.67));
    }
    if (this.alignment !== Char$Alignment.ALLY && this.buff($J.cls(DeathMark$DeathMarkTracker)) != null) {
      damage = Math.fround(damage * 1.25);
    }
    let bleedAmt = 0;
    let bleedSrc = null;
    if (src instanceof Char && (src).buff($J.cls(Sickle$HarvestBleedTracker)) != null) {
      if (!this.isImmune($J.cls(Bleeding))) {
        bleedAmt = Math.fround(dmg);
        bleedSrc = $J.cls(Sickle$HarvestBleedTracker);
      }
      (src).buff($J.cls(Sickle$HarvestBleedTracker)).detach();
    } else if (src instanceof Char && (src).buff($J.cls(Vorpal$VorpalTracker)) != null) {
      if (!this.isImmune($J.cls(Bleeding))) {
        bleedAmt = Math.fround((src).buff($J.cls(Vorpal$VorpalTracker)).powerMulti * (Math.fround(2 + Math.fround(dmg / 2))));
        bleedSrc = $J.cls(Vorpal);
      }
      (src).buff($J.cls(Vorpal$VorpalTracker)).detach();
    }
    let srcClass = $J.getClass(src);
    if (this.isImmune(srcClass)) {
      damage = 0;
    } else {
      damage = Math.fround(damage * this.resist(srcClass));
    }
    dmg = $J.roundf(damage);
    for (const $it11 = this.buffs$Class($J.cls(ChampionEnemy)).iterator(); $it11.hasNext(); ) {
      let buff = $it11.next();
      dmg = $J.d2i(Math.ceil(Math.fround(dmg * buff.damageTakenFactor())));
    }
    if (AntiMagic.RESISTS.contains($J.getClass(src))) {
      dmg = (dmg - AntiMagic.drRoll(this, this.glyphLevel($J.cls(AntiMagic)))) | 0;
      if (this.buff($J.cls(ArcaneArmor)) != null) {
        dmg = (dmg - Random.NormalIntRange(0, this.buff($J.cls(ArcaneArmor)).level())) | 0;
      }
      if (dmg < 0) {
        dmg = 0;
      }
    }
    if (this.buff($J.cls(Paralysis)) != null) {
      this.buff($J.cls(Paralysis)).processDamage(dmg);
    }
    let shield = this.buff($J.cls(BrokenSeal$WarriorShield));
    if (!(src instanceof Hunger) && dmg > 0 && (this.HP <= $J.idiv(this.HT, 2) || ((this.HP + this.shielding() - dmg) | 0) <= $J.idiv(this.HT, 2)) && shield != null && !shield.coolingDown()) {
      this.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(this.buff($J.cls(BrokenSeal$WarriorShield)).maxShield()), FloatingText.SHIELDING, []);
      shield.activate();
    }
    if (bleedSrc === $J.cls(Vorpal) && dmg > ((this.shielding() + this.HP) | 0)) {
      bleedAmt = 0;
    }
    if (bleedAmt > Math.fround(0)) {
      let b = this.buff($J.cls(Bleeding));
      if (b == null) {
        b = new Bleeding()._Bleeding();
      }
      b.announced = false;
      b.attachTo(this);
      b.set$float$Class(bleedAmt, bleedSrc);
      this.sprite_.showStatus(CharSprite.WARNING, Messages.titleCase(b.name()) + ' ' + dmg, []);
      Splash.at$PointF$float$float$int$int(this.sprite_.center$(), Math.fround(Math.fround(-PointF.PI) / 2), Math.fround(PointF.PI / 6), this.sprite_.blood(), 10);
      return;
    }
    let shielded = dmg;
    dmg = ShieldBuff.processDamage(this, dmg, src);
    shielded = (shielded - dmg) | 0;
    this.HP = (this.HP - dmg) | 0;
    if (this.HP > 0 && src instanceof Char && (src).buff($J.cls(Grim$GrimTracker)) != null) {
      let finalChance = (src).buff($J.cls(Grim$GrimTracker)).maxChance;
      finalChance = Math.fround(finalChance * Math.fround($J.pow((Math.fround(((this.HT - this.HP) | 0) / Math.fround(this.HT))), 2)));
      if (Random.Float$() < finalChance) {
        let extraDmg = $J.roundf(Math.fround(this.HP * this.resist($J.cls(Grim))));
        dmg = (dmg + extraDmg) | 0;
        this.HP = (this.HP - extraDmg) | 0;
        this.sprite_.emitter().burst(ShadowParticle.UP, 5);
        if (!this.isAlive() && (src).buff($J.cls(Grim$GrimTracker)).qualifiesForBadge) {
          Badges.validateGrimWeapon();
        }
      }
    }
    if (src instanceof Char && (src).buff($J.cls(Kinetic$KineticTracker)) != null) {
      let dmgToAdd = 0;
      if (this.HP < 0 && this.alignment !== (src).alignment) {
        dmgToAdd = -this.HP;
        dmgToAdd = (dmgToAdd - (src).buff($J.cls(Kinetic$KineticTracker)).conservedDamage) | 0;
        dmgToAdd = $J.roundf(Math.fround(dmgToAdd * Weapon$Enchantment.genericProcChanceMultiplier(src)));
      }
      if (dmgToAdd > 0) {
        Buff.affect$Char$Class(src, $J.cls(Kinetic$ConservedDamage)).setBonus(dmgToAdd);
      } else if ((src).buff($J.cls(Kinetic$ConservedDamage)) != null) {
        (src).buff($J.cls(Kinetic$ConservedDamage)).detach();
      }
      (src).buff($J.cls(Kinetic$KineticTracker)).detach();
    }
    if (this.sprite_ != null) {
      let icon = FloatingText.PHYS_DMG;
      if (Char.NO_ARMOR_PHYSICAL_SOURCES.contains($J.getClass(src))) {
        icon = FloatingText.PHYS_DMG_NO_BLOCK;
      }
      if (AntiMagic.RESISTS.contains($J.getClass(src))) {
        icon = FloatingText.MAGIC_DMG;
      }
      if (src instanceof Pickaxe) {
        icon = FloatingText.PICK_DMG;
      }
      if (src === Dungeon.hero && Dungeon.hero.subClass === HeroSubClass.SNIPER && !Dungeon.level.adjacent(Dungeon.hero.pos, this.pos) && Dungeon.hero.belongings.attackingWeapon() instanceof MissileWeapon) {
        icon = FloatingText.PHYS_DMG_NO_BLOCK;
      }
      if (src === Dungeon.hero && Dungeon.hero.buff($J.cls(MonkEnergy$MonkAbility$UnarmedAbilityTracker)) != null) {
        icon = FloatingText.PHYS_DMG_NO_BLOCK;
      }
      if (src instanceof Hunger) {
        icon = FloatingText.HUNGER;
      }
      if (src instanceof Burning) {
        icon = FloatingText.BURNING;
      }
      if (src instanceof Chill || src instanceof Frost) {
        icon = FloatingText.FROST;
      }
      if (src instanceof GeyserTrap || src instanceof StormCloud) {
        icon = FloatingText.WATER;
      }
      if (src instanceof Burning) {
        icon = FloatingText.BURNING;
      }
      if (src instanceof Electricity) {
        icon = FloatingText.SHOCKING;
      }
      if (src instanceof Bleeding) {
        icon = FloatingText.BLEEDING;
      }
      if (src instanceof ToxicGas) {
        icon = FloatingText.TOXIC;
      }
      if (src instanceof Corrosion) {
        icon = FloatingText.CORROSION;
      }
      if (src instanceof Poison) {
        icon = FloatingText.POISON;
      }
      if (src instanceof Ooze) {
        icon = FloatingText.OOZE;
      }
      if (src instanceof Viscosity$DeferedDamage) {
        icon = FloatingText.DEFERRED;
      }
      if (src instanceof Corruption) {
        icon = FloatingText.CORRUPTION;
      }
      if (src instanceof AscensionChallenge) {
        icon = FloatingText.AMULET;
      }
      if ((icon === FloatingText.PHYS_DMG || icon === FloatingText.PHYS_DMG_NO_BLOCK) && Char.hitMissIcon !== -1) {
        if (icon === FloatingText.PHYS_DMG_NO_BLOCK) {
          Char.hitMissIcon = (Char.hitMissIcon + 18) | 0;
        }
        icon = Char.hitMissIcon;
      }
      Char.hitMissIcon = -1;
      this.sprite_.showStatusWithIcon(CharSprite.NEGATIVE, String((dmg + shielded) | 0), icon, []);
    }
    if (this.HP < 0) {
      this.HP = 0;
    }
    if (!this.isAlive()) {
      this.die(src);
    } else if (this.HP === 0 && this.buff($J.cls(DeathMark$DeathMarkTracker)) != null) {
      DeathMark.processFearTheReaper(this);
    }
  }
  destroy(): void {
    this.HP = 0;
    Actor.remove(this);
    for (let ch of $J.toArrayInto(Actor.chars().toArray(), $J.newArray(0, null))) {
      if (ch.buff($J.cls(Charm)) != null && ch.buff($J.cls(Charm)).object === this.id()) {
        ch.buff($J.cls(Charm)).detach();
      }
      if (ch.buff($J.cls(Dread)) != null && ch.buff($J.cls(Dread)).object === this.id()) {
        ch.buff($J.cls(Dread)).detach();
      }
      if (ch.buff($J.cls(Terror)) != null && ch.buff($J.cls(Terror)).object === this.id()) {
        ch.buff($J.cls(Terror)).detach();
      }
      if (ch.buff($J.cls(SnipersMark)) != null && ch.buff($J.cls(SnipersMark)).object === this.id()) {
        ch.buff($J.cls(SnipersMark)).detach();
      }
      if (ch.buff($J.cls(Talent$FollowupStrikeTracker)) != null && ch.buff($J.cls(Talent$FollowupStrikeTracker)).object === this.id()) {
        ch.buff($J.cls(Talent$FollowupStrikeTracker)).detach();
      }
      if (ch.buff($J.cls(Talent$DeadlyFollowupTracker)) != null && ch.buff($J.cls(Talent$DeadlyFollowupTracker)).object === this.id()) {
        ch.buff($J.cls(Talent$DeadlyFollowupTracker)).detach();
      }
    }
  }
  die(src: any): void {
    if (this.buff($J.cls(DeathMark$DeathMarkTracker)) != null) {
      this.buff($J.cls(DeathMark$DeathMarkTracker)).detachOnDeath();
    }
    this.destroy();
    if (src !== $J.cls(Chasm)) {
      this.sprite_.die();
      if (!this.flying && Dungeon.level != null && this.sprite_ instanceof MobSprite && Dungeon.level.map_[this.pos] === Terrain.CHASM) {
        (this.sprite_).fall();
      }
    }
  }
  isAlive(): boolean {
    return this.HP > 0 || this.deathMarked;
  }
  isActive(): boolean {
    return this.isAlive();
  }
  spendConstant(time: number): void {
    let freeze = this.buff($J.cls(TimekeepersHourglass$timeFreeze));
    if (freeze != null) {
      freeze.processTime(time);
      return;
    }
    let bubble = this.buff($J.cls(Swiftthistle$TimeBubble));
    if (bubble != null) {
      bubble.processTime(time);
      return;
    }
    super.spendConstant(time);
  }
  spend(time: number): void {
    let timeScale = 1;
    if (this.buff($J.cls(Slow)) != null) {
      timeScale = Math.fround(timeScale * 0.5);
    } else if (this.buff($J.cls(Chill)) != null) {
      timeScale = Math.fround(timeScale * this.buff($J.cls(Chill)).speedFactor());
    }
    if (this.buff($J.cls(Speed)) != null) {
      timeScale = Math.fround(timeScale * 2);
    }
    super.spend(Math.fround(time / timeScale));
  }
  buffs$(): LinkedHashSet<Buff> {
    return new LinkedHashSet(this.buffs);
  }
  buffs$Class<T>(c: JClass<T>): HashSet<T> {
    let filtered = new HashSet();
    for (const $it12 = this.buffs.iterator(); $it12.hasNext(); ) {
      let b = $it12.next();
      if (c.isInstance(b)) {
        filtered.add(b);
      }
    }
    return filtered;
  }
  buff<T>(c: JClass<T>): T {
    for (const $it13 = this.buffs.iterator(); $it13.hasNext(); ) {
      let b = $it13.next();
      if (b.getClass() === c) {
        return b;
      }
    }
    return null;
  }
  isCharmedBy(ch: Char): boolean {
    let chID = ch.id();
    for (const $it14 = this.buffs.iterator(); $it14.hasNext(); ) {
      let b = $it14.next();
      if (b instanceof Charm && (b).object === chID) {
        return true;
      }
    }
    return false;
  }
  add(buff: Buff): boolean {
    if (this.buff($J.cls(PotionOfCleansing$Cleanse)) != null) {
      if (buff.type_ === Buff$buffType.NEGATIVE && !(buff instanceof AllyBuff) && !(buff instanceof LostInventory)) {
        return false;
      }
    }
    if (this.sprite_ != null && this.buff($J.cls(Challenge$SpectatorFreeze)) != null) {
      return false;
    }
    this.buffs.add(buff);
    if (Actor.chars().contains(this)) {
      Actor.add$Actor(buff);
    }
    if (this.sprite_ != null && this.sprite_.alive && buff.announced) {
      switch (buff.type_) {
        case Buff$buffType.POSITIVE:
          this.sprite_.showStatus(CharSprite.POSITIVE, Messages.titleCase(buff.name()), []);
          break;
        case Buff$buffType.NEGATIVE:
          this.sprite_.showStatus(CharSprite.WARNING, Messages.titleCase(buff.name()), []);
          break;
        case Buff$buffType.NEUTRAL:
        default:
          this.sprite_.showStatus(CharSprite.NEUTRAL, Messages.titleCase(buff.name()), []);
          break;
      }
    }
    return true;
  }
  remove$Buff(buff: Buff): boolean {
    this.buffs.remove(buff);
    Actor.remove(buff);
    return true;
  }
  remove$Class(buffClass: JClass<Buff>): void {
    for (const $it15 = this.buffs$Class(buffClass).iterator(); $it15.hasNext(); ) {
      let buff = $it15.next();
      this.remove$Buff(buff);
    }
  }
  onRemove(): void {
    for (let buff of $J.toArrayInto(this.buffs.toArray(), $J.newArray(this.buffs.size(), null))) {
      buff.detach();
    }
  }
  updateSpriteState(): void {
    for (const $it16 = this.buffs.iterator(); $it16.hasNext(); ) {
      let buff = $it16.next();
      buff.fx(true);
    }
  }
  stealth(): number {
    let stealth = 0;
    stealth = Math.fround(stealth + Obfuscation.stealthBoost(this, this.glyphLevel($J.cls(Obfuscation))));
    return stealth;
  }
  move$int(step: number): void {
    this.move$int$boolean(step, true);
  }
  move$int$boolean(step: number, travelling: boolean): void {
    if (travelling && Dungeon.level.adjacent(step, this.pos) && this.buff($J.cls(Vertigo)) != null) {
      this.sprite_.interruptMotion();
      let newPos = (this.pos + PathFinder.NEIGHBOURS8[Random.Int$int(8)]) | 0;
      if (!(Dungeon.level.passable[newPos] || Dungeon.level.avoid[newPos]) || (this.properties().contains(Char$Property.LARGE) && !Dungeon.level.openSpace[newPos]) || Actor.findChar(newPos) != null) {
        return;
      } else {
        this.sprite_.move(this.pos, newPos);
        step = newPos;
      }
    }
    if (Dungeon.level.map_[this.pos] === Terrain.OPEN_DOOR) {
      Door.leave(this.pos);
    }
    if (travelling) {
      this.previousPos = this.pos;
    } else {
      this.previousPos = -1;
    }
    this.pos = step;
    if (this !== Dungeon.hero) {
      this.sprite_.visible_ = Dungeon.level.heroFOV[this.pos];
    }
    Dungeon.level.occupyCell(this);
  }
  distance(other: Char): number {
    return Dungeon.level.distance(this.pos, other.pos);
  }
  modifyPassable(passable: boolean[]): boolean[] {
    return passable;
  }
  onMotionComplete(): void {
  }
  onAttackComplete(): void {
    this.next();
  }
  onOperateComplete(): void {
    this.next();
  }
  resist(effect: JClass): number {
    let resists = new HashSet(this.resistances_);
    for (const $it17 = this.properties().iterator(); $it17.hasNext(); ) {
      let p = $it17.next();
      resists.addAll(p.resistances());
    }
    for (const $it18 = this.buffs$().iterator(); $it18.hasNext(); ) {
      let b = $it18.next();
      resists.addAll(b.resistances());
    }
    let result = 1;
    for (const $it19 = resists.iterator(); $it19.hasNext(); ) {
      let c = $it19.next();
      if (c.isAssignableFrom(effect)) {
        result = Math.fround(result * 0.5);
      }
    }
    return Math.fround(result * RingOfElements.resist(this, effect));
  }
  isImmune(effect: JClass): boolean {
    let immunes = new HashSet(this.immunities_);
    for (const $it20 = this.properties().iterator(); $it20.hasNext(); ) {
      let p = $it20.next();
      immunes.addAll(p.immunities());
    }
    for (const $it21 = this.buffs$().iterator(); $it21.hasNext(); ) {
      let b = $it21.next();
      immunes.addAll(b.immunities());
    }
    if (this.glyphLevel($J.cls(Brimstone)) >= 0) {
      immunes.add($J.cls(Burning));
    }
    for (const $it22 = immunes.iterator(); $it22.hasNext(); ) {
      let c = $it22.next();
      if (c.isAssignableFrom(effect)) {
        return true;
      }
    }
    return false;
  }
  isInvulnerable(effect: JClass): boolean {
    return this.buff($J.cls(Challenge$SpectatorFreeze)) != null || this.buff($J.cls(Invulnerability)) != null;
  }
  properties(): HashSet<Char$Property> {
    let props = new HashSet(this.properties_);
    if (this.buff($J.cls(ChampionEnemy$Giant)) != null) {
      props.add(Char$Property.LARGE);
    }
    return props;
  }
  static hasProp(ch: Char, p: Char$Property): boolean {
    return (ch != null && ch.properties().contains(p));
  }
  static $clinit() {
    Char.INFINITE_ACCURACY = 1000000;
    Char.INFINITE_EVASION = 1000000;
    Char.hitMissIcon = -1;
    Char.NO_ARMOR_PHYSICAL_SOURCES = new HashSet();
  }
}

export class Char$Alignment extends JEnum {
  static ENEMY: Char$Alignment = null;
  static NEUTRAL: Char$Alignment = null;
  static ALLY: Char$Alignment = null;
  static $VALUES: Char$Alignment[] = null;
  _Char$Alignment($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Char$Alignment[] { return Char$Alignment.$VALUES.slice(); }
  static valueOf(name: string): Char$Alignment { return $J.enumValueOf(Char$Alignment, name); }
  static $clinit() {
    Char$Alignment.ENEMY = new Char$Alignment()._Char$Alignment('ENEMY', 0);
    Char$Alignment.NEUTRAL = new Char$Alignment()._Char$Alignment('NEUTRAL', 1);
    Char$Alignment.ALLY = new Char$Alignment()._Char$Alignment('ALLY', 2);
    Char$Alignment.$VALUES = [Char$Alignment.ENEMY, Char$Alignment.NEUTRAL, Char$Alignment.ALLY];
  }
}

export class Char$Property extends JEnum {
  resistances_: HashSet<JClass> = null;
  immunities_: HashSet<JClass> = null;
  static BOSS: Char$Property = null;
  static MINIBOSS: Char$Property = null;
  static BOSS_MINION: Char$Property = null;
  static UNDEAD: Char$Property = null;
  static DEMONIC: Char$Property = null;
  static INORGANIC: Char$Property = null;
  static FIERY: Char$Property = null;
  static ICY: Char$Property = null;
  static ACIDIC: Char$Property = null;
  static ELECTRIC: Char$Property = null;
  static LARGE: Char$Property = null;
  static IMMOVABLE: Char$Property = null;
  static OBJECT: Char$Property = null;
  static STATIC: Char$Property = null;
  static $VALUES: Char$Property[] = null;
  _Char$Property$($name: string, $ordinal: number): this {
    this._Char$Property$HashSet$HashSet($name, $ordinal, new HashSet(), new HashSet());
    return this;
  }
  _Char$Property$HashSet$HashSet($name: string, $ordinal: number, resistances: HashSet<JClass>, immunities: HashSet<JClass>): this {
    this._JEnum($name, $ordinal);
    this.resistances_ = resistances;
    this.immunities_ = immunities;
    return this;
  }
  resistances(): HashSet<JClass> {
    return new HashSet(this.resistances_);
  }
  immunities(): HashSet<JClass> {
    return new HashSet(this.immunities_);
  }
  static values(): Char$Property[] { return Char$Property.$VALUES.slice(); }
  static valueOf(name: string): Char$Property { return $J.enumValueOf(Char$Property, name); }
  static $clinit() {
    Char$Property.BOSS = new Char$Property()._Char$Property$HashSet$HashSet('BOSS', 0, new HashSet(Arrays.asList($J.cls(Grim), $J.cls(GrimTrap), $J.cls(ScrollOfRetribution), $J.cls(ScrollOfPsionicBlast))), new HashSet(Arrays.asList($J.cls(AllyBuff), $J.cls(Dread))));
    Char$Property.MINIBOSS = new Char$Property()._Char$Property$HashSet$HashSet('MINIBOSS', 1, new HashSet(), new HashSet(Arrays.asList($J.cls(AllyBuff), $J.cls(Dread))));
    Char$Property.BOSS_MINION = new Char$Property()._Char$Property$('BOSS_MINION', 2);
    Char$Property.UNDEAD = new Char$Property()._Char$Property$('UNDEAD', 3);
    Char$Property.DEMONIC = new Char$Property()._Char$Property$('DEMONIC', 4);
    Char$Property.INORGANIC = new Char$Property()._Char$Property$HashSet$HashSet('INORGANIC', 5, new HashSet(), new HashSet(Arrays.asList($J.cls(Bleeding), $J.cls(ToxicGas), $J.cls(Poison))));
    Char$Property.FIERY = new Char$Property()._Char$Property$HashSet$HashSet('FIERY', 6, new HashSet(Arrays.asList($J.cls(WandOfFireblast), $J.cls(Elemental$FireElemental))), new HashSet(Arrays.asList($J.cls(Burning), $J.cls(Blazing))));
    Char$Property.ICY = new Char$Property()._Char$Property$HashSet$HashSet('ICY', 7, new HashSet(Arrays.asList($J.cls(WandOfFrost), $J.cls(Elemental$FrostElemental))), new HashSet(Arrays.asList($J.cls(Frost), $J.cls(Chill))));
    Char$Property.ACIDIC = new Char$Property()._Char$Property$HashSet$HashSet('ACIDIC', 8, new HashSet(Arrays.asList($J.cls(Corrosion))), new HashSet(Arrays.asList($J.cls(Ooze))));
    Char$Property.ELECTRIC = new Char$Property()._Char$Property$HashSet$HashSet('ELECTRIC', 9, new HashSet(Arrays.asList($J.cls(WandOfLightning), $J.cls(Shocking), $J.cls(Potential), $J.cls(Electricity), $J.cls(ShockingDart), $J.cls(Elemental$ShockElemental))), new HashSet());
    Char$Property.LARGE = new Char$Property()._Char$Property$('LARGE', 10);
    Char$Property.IMMOVABLE = new Char$Property()._Char$Property$HashSet$HashSet('IMMOVABLE', 11, new HashSet(), new HashSet(Arrays.asList($J.cls(Vertigo))));
    Char$Property.OBJECT = new Char$Property()._Char$Property$('OBJECT', 12);
    Char$Property.STATIC = new Char$Property()._Char$Property$HashSet$HashSet('STATIC', 13, new HashSet(), new HashSet(Arrays.asList($J.cls(AllyBuff), $J.cls(Dread), $J.cls(Terror), $J.cls(Amok), $J.cls(Charm), $J.cls(Sleep), $J.cls(Paralysis), $J.cls(Frost), $J.cls(Chill), $J.cls(Slow), $J.cls(Speed))));
    Char$Property.$VALUES = [Char$Property.BOSS, Char$Property.MINIBOSS, Char$Property.BOSS_MINION, Char$Property.UNDEAD, Char$Property.DEMONIC, Char$Property.INORGANIC, Char$Property.FIERY, Char$Property.ICY, Char$Property.ACIDIC, Char$Property.ELECTRIC, Char$Property.LARGE, Char$Property.IMMOVABLE, Char$Property.OBJECT, Char$Property.STATIC];
  }
}

$J.define(Char, 'com.shatteredpixel.shatteredpixeldungeon.actors.Char', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.Actor', ctors: { '': '_Char' }, meths: { 'move(int,boolean)': 'move$int$boolean', 'move(int)': 'move$int', 'remove(java.lang.Class)': 'remove$Class', 'remove(com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff)': 'remove$Buff', 'buffs(java.lang.Class)': 'buffs$Class', 'buffs()': 'buffs$', 'hit(com.shatteredpixel.shatteredpixeldungeon.actors.Char,com.shatteredpixel.shatteredpixeldungeon.actors.Char,float,boolean)': 'hit$Char$Char$float$boolean', 'hit(com.shatteredpixel.shatteredpixeldungeon.actors.Char,com.shatteredpixel.shatteredpixeldungeon.actors.Char,boolean)': 'hit$Char$Char$boolean', 'attack(com.shatteredpixel.shatteredpixeldungeon.actors.Char,float,float,float)': 'attack$Char$float$float$float', 'attack(com.shatteredpixel.shatteredpixeldungeon.actors.Char)': 'attack$Char' }, clinit: true, lazy: ['INFINITE_ACCURACY', 'INFINITE_EVASION', 'hitMissIcon', 'NO_ARMOR_PHYSICAL_SOURCES'] });
$J.define(Char$Alignment, 'com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Char$Alignment' }, clinit: true, lazy: ['$VALUES', 'ENEMY', 'NEUTRAL', 'ALLY'] });
$J.define(Char$Property, 'com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property', { kind: 'enum', sup: 'java.lang.Enum', ctors: { 'java.util.HashSet,java.util.HashSet': '_Char$Property$HashSet$HashSet', '': '_Char$Property$' }, clinit: true, lazy: ['$VALUES', 'BOSS', 'MINIBOSS', 'BOSS_MINION', 'UNDEAD', 'DEMONIC', 'INORGANIC', 'FIERY', 'ICY', 'ACIDIC', 'ELECTRIC', 'LARGE', 'IMMOVABLE', 'OBJECT', 'STATIC'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Electricity = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Electricity');
  StormCloud = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.StormCloud');
  ToxicGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.ToxicGas');
  Adrenaline = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Adrenaline');
  AllyBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AllyBuff');
  Amok = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Amok');
  ArcaneArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ArcaneArmor');
  AscensionChallenge = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AscensionChallenge');
  Barkskin = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Barkskin');
  Berserk = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Berserk');
  Bleeding = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Bleeding');
  Bless = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Bless');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Buff$DOTbuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$DOTbuff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Burning = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Burning');
  ChampionEnemy = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ChampionEnemy');
  ChampionEnemy$Giant = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ChampionEnemy$Giant');
  Charm = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Charm');
  Chill = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Chill');
  Corrosion = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Corrosion');
  Corruption = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Corruption');
  Cripple = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Cripple');
  Daze = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Daze');
  Doom = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Doom');
  Dread = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Dread');
  FireImbue = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FireImbue');
  Frost = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Frost');
  FrostImbue = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FrostImbue');
  Fury = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Fury');
  Haste = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Haste');
  Hex = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Hex');
  Hunger = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Hunger');
  Invulnerability = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invulnerability');
  LifeLink = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.LifeLink');
  LostInventory = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.LostInventory');
  MagicalSleep = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MagicalSleep');
  Momentum = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Momentum');
  MonkEnergy$MonkAbility$Focus$FocusBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MonkEnergy$MonkAbility$Focus$FocusBuff');
  MonkEnergy$MonkAbility$Meditate$MeditateResistance = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MonkEnergy$MonkAbility$Meditate$MeditateResistance');
  MonkEnergy$MonkAbility$UnarmedAbilityTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MonkEnergy$MonkAbility$UnarmedAbilityTracker');
  Ooze = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Ooze');
  Paralysis = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Paralysis');
  Poison = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Poison');
  Preparation = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Preparation');
  ShieldBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ShieldBuff');
  Sleep = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Sleep');
  Slow = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Slow');
  SnipersMark = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.SnipersMark');
  Speed = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Speed');
  Stamina = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Stamina');
  Terror = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Terror');
  Vertigo = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Vertigo');
  Vulnerable = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Vulnerable');
  Weakness = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Weakness');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  HeroClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Talent$BountyHunterTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$BountyHunterTracker');
  Talent$CombinedLethalityAbilityTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$CombinedLethalityAbilityTracker');
  Talent$DeadlyFollowupTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$DeadlyFollowupTracker');
  Talent$FollowupStrikeTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$FollowupStrikeTracker');
  PowerOfMany$PowerBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.PowerOfMany$PowerBuff');
  Challenge$SpectatorFreeze = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.duelist.Challenge$SpectatorFreeze');
  DeathMark = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.rogue.DeathMark');
  DeathMark$DeathMarkTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.rogue.DeathMark$DeathMarkTracker');
  Endure$EndureTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.warrior.Endure$EndureTracker');
  AuraOfProtection$AuraBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.AuraOfProtection$AuraBuff');
  BeamingRay$BeamingRayBoost = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.BeamingRay$BeamingRayBoost');
  GuidingLight = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.GuidingLight');
  GuidingLight$Illuminated = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.GuidingLight$Illuminated');
  LifeLinkSpell$LifeLinkSpellBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.LifeLinkSpell$LifeLinkSpellBuff');
  ShieldOfLight$ShieldOfLightTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.ShieldOfLight$ShieldOfLightTracker');
  Brute$BruteRage = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Brute$BruteRage');
  CrystalSpire$SpireSpike = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.CrystalSpire$SpireSpike');
  DwarfKing$KingDamager = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DwarfKing$KingDamager');
  DwarfKing$Summoning = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DwarfKing$Summoning');
  Elemental$FireElemental = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Elemental$FireElemental');
  Elemental$FrostElemental = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Elemental$FrostElemental');
  Elemental$ShockElemental = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Elemental$ShockElemental');
  GnollGeomancer$Boulder = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollGeomancer$Boulder');
  GnollGeomancer$GnollRockFall = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollGeomancer$GnollRockFall');
  Necromancer$SummoningBlockDamage = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Necromancer$SummoningBlockDamage');
  Tengu$BombAbility$BombItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Tengu$BombAbility$BombItem');
  Tengu$ShockerAbility$ShockerItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Tengu$ShockerAbility$ShockerItem');
  MirrorImage = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.MirrorImage');
  PrismaticImage = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.PrismaticImage');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  Splash = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Splash');
  ShadowParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShadowParticle');
  BrokenSeal$WarriorShield = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.BrokenSeal$WarriorShield');
  Heap = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  Bulk = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.curses.Bulk');
  AntiMagic = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.AntiMagic');
  Brimstone = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Brimstone');
  Flow = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Flow');
  Obfuscation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Obfuscation');
  Potential = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Potential');
  Swiftness = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Swiftness');
  Viscosity$DeferedDamage = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Viscosity$DeferedDamage');
  Viscosity$ViscosityTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Viscosity$ViscosityTracker');
  DriedRose$GhostHero$NoRoseDamage = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.DriedRose$GhostHero$NoRoseDamage');
  TimekeepersHourglass$timeFreeze = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.TimekeepersHourglass$timeFreeze');
  PotionOfCleansing$Cleanse = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfCleansing$Cleanse');
  Pickaxe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.Pickaxe');
  RingOfElements = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfElements');
  ScrollOfRetribution = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRetribution');
  ScrollOfTeleportation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation');
  ScrollOfChallenge$ChallengeArena = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfChallenge$ChallengeArena');
  ScrollOfPsionicBlast = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfPsionicBlast');
  FerretTuft = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.FerretTuft');
  WandOfBlastWave$Knockback = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfBlastWave$Knockback');
  WandOfFireblast = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfFireblast');
  WandOfFrost = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfFrost');
  WandOfLightning = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfLightning');
  WandOfLivingEarth$EarthGuardian = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfLivingEarth$EarthGuardian');
  Weapon$Enchantment = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment');
  Blazing = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Blazing');
  Grim = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Grim');
  Grim$GrimTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Grim$GrimTracker');
  Kinetic$ConservedDamage = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Kinetic$ConservedDamage');
  Kinetic$KineticTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Kinetic$KineticTracker');
  Shocking = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Shocking');
  Vorpal = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Vorpal');
  Vorpal$VorpalTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Vorpal$VorpalTracker');
  MeleeWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon');
  Sickle$HarvestBleedTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Sickle$HarvestBleedTracker');
  MissileWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon');
  ShockingDart = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.ShockingDart');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Chasm = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.Chasm');
  Door = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.Door');
  GeyserTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.GeyserTrap');
  GnollRockfallTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.GnollRockfallTrap');
  GrimTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.GrimTrap');
  Languages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Languages');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  Earthroot$Armor = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Earthroot$Armor');
  Swiftthistle$TimeBubble = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Swiftthistle$TimeBubble');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  MobSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite');
  TargetHealthIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.TargetHealthIndicator');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  PointF = $J.load('com.watabou.utils.PointF');
  Random = $J.load('com.watabou.utils.Random');
});
