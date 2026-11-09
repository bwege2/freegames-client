// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/abilities/duelist/ElementalStrike.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, HashMap, JObject } from '../../../../../../../../jre/index.ts';
import { ArmorAbility } from '../ArmorAbility.ts';
import { FlavourBuff } from '../../../buffs/FlavourBuff.ts';
import { Buff } from '../../../buffs/Buff.ts';
import { CounterBuff } from '../../../buffs/CounterBuff.ts';

let Assets$Sounds, Dungeon, Actor, Char, Char$Alignment, Char$Property, Blob, Electricity, Fire, Freezing, AllyBuff, Amok, Barrier, Bleeding, Blindness, Charm, Corruption, Hex, Invisibility, Poison, Roots, Terror, Hero, Talent, Mob, CellEmitter, FloatingText, MagicMissile, Speck, Splash, RainbowParticle, ShadowParticle, Item, Bomb$ConjuredBomb, ScrollOfTeleportation, WondrousResin, CursedWand, WandOfBlastWave, Weapon, Annoying, Dazzling, Displacing, Explosive, Friendly, Polarized, Pressurized, Sacrificial, Wayward, Wondrous, Blazing, Blocking, Blooming, Chilling, Corrupting, Crystal, Elastic, Eldritch, Grim, Kinetic, Kinetic$ConservedDamage, Lucky, Projecting, Shocking, Unstable, Vampiric, Venomous, Vorpal, MeleeWeapon, Level, Terrain, Ballistica, ConeAOE, Messages, GameScene, CharSprite, AttackIndicator, HeroIcon, Game, Sample, Random;

export class ElementalStrike extends ArmorAbility {
  static effectTypes: HashMap<JClass<Weapon$Enchantment>, number> = null;
  storedKineticDamage: number = 0;
  oldEnemyPos: number = 0;
  _ElementalStrike(): this {
    this._ArmorAbility();
    this.baseChargeUse_ = 25;
    this.storedKineticDamage = 0;
    return this;
  }
  targetingPrompt(): string {
    return Messages.get$Object$String$ObjectArr(this, 'prompt', []);
  }
  targetedPos(user: Char, dst: number): number {
    return dst;
  }
  activate(armor: ClassArmor, hero: Hero, target: number): void {
    if (target == null) {
      return;
    }
    armor.charge_ = Math.fround(armor.charge_ - this.chargeUse(hero));
    Item.updateQuickslot();
    let aim = new Ballistica()._Ballistica(hero.pos, target, Ballistica.WONT_STOP);
    let maxDist = (4 + hero.pointsInTalent(Talent.ELEMENTAL_REACH)) | 0;
    let dist = Math.min(aim.dist, maxDist);
    let cone = new ConeAOE()._ConeAOE$Ballistica$float$float$int(aim, Math.fround(dist), Math.fround((65 + Math.imul(10, hero.pointsInTalent(Talent.ELEMENTAL_REACH))) | 0), Ballistica.STOP_SOLID | Ballistica.STOP_TARGET);
    let w = hero.belongings.weapon();
    let enchantment = null;
    if (w instanceof MeleeWeapon) {
      enchantment = (w).enchantment;
    }
    let enchCls = null;
    if (enchantment != null) {
      enchCls = enchantment.getClass();
    }
    for (const $it0 = cone.outerRays.iterator(); $it0.hasNext(); ) {
      let ray = $it0.next();
      (hero.sprite_.parent.recycle($J.cls(MagicMissile))).reset$int$Visual$int$Callback(ElementalStrike.effectTypes.get(enchCls), hero.sprite_, ray.path.get(ray.dist), null);
    }
    let finalEnchantment = enchantment;
    hero.sprite_.attack$int$Callback(target, new (ElementalStrike$1())().$o(this).$c(target, hero, cone, finalEnchantment));
    Sample.INSTANCE.play$Object(Assets$Sounds.CHARGEUP);
    hero.busy();
  }
  preAttackEffect(cone: ConeAOE, hero: Hero, ench: Weapon$Enchantment): void {
    let targetsHit = 0;
    for (const $it1 = Actor.chars().iterator(); $it1.hasNext(); ) {
      let ch = $it1.next();
      if (ch.alignment === Char$Alignment.ENEMY && cone.cells.contains(ch.pos)) {
        targetsHit++;
      }
    }
    if (hero.hasTalent(Talent.DIRECTED_POWER)) {
      let enchBoost = Math.fround(Math.fround(Math.fround(0.3) * targetsHit) * hero.pointsInTalent(Talent.DIRECTED_POWER));
      Buff.affect$Char$Class$float(hero, $J.cls(ElementalStrike$DirectedPowerTracker), 0).enchBoost = enchBoost;
    }
    let powerMulti = Math.fround(1 + Math.fround(Math.fround(0.3) * Dungeon.hero.pointsInTalent(Talent.STRIKING_FORCE)));
    if (ench instanceof Kinetic) {
      if (hero.buff($J.cls(Kinetic$ConservedDamage)) != null) {
        this.storedKineticDamage = hero.buff($J.cls(Kinetic$ConservedDamage)).damageBonus();
      }
    } else if (ench instanceof Blocking) {
      if (targetsHit > 0) {
        let shield = $J.roundf(Math.fround($J.roundf(Math.fround(Math.fround(6 * targetsHit) * powerMulti))));
        Buff.affect$Char$Class(hero, $J.cls(Barrier)).setShield($J.roundf(Math.fround(Math.fround(6 * targetsHit) * powerMulti)));
        hero.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(shield), FloatingText.SHIELDING, []);
      }
    } else if (ench instanceof Vampiric) {
      if (targetsHit > 0) {
        let heal = $J.roundf(Math.fround(Math.fround(2.5 * targetsHit) * powerMulti));
        heal = Math.min(heal, (hero.HT - hero.HP) | 0);
        if (heal > 0) {
          hero.HP = (hero.HP + heal) | 0;
          hero.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(heal), FloatingText.HEALING, []);
        }
      }
    } else if (ench instanceof Sacrificial) {
      Buff.affect$Char$Class(hero, $J.cls(Bleeding)).set$float(Math.fround(10 * powerMulti));
    }
  }
  perCellEffect(cone: ConeAOE, ench: Weapon$Enchantment): void {
    let targetsHit = 0;
    for (const $it2 = Actor.chars().iterator(); $it2.hasNext(); ) {
      let ch = $it2.next();
      if (ch.alignment === Char$Alignment.ENEMY && cone.cells.contains(ch.pos)) {
        targetsHit++;
      }
    }
    let powerMulti = Math.fround(1 + Math.fround(Math.fround(0.3) * Dungeon.hero.pointsInTalent(Talent.STRIKING_FORCE)));
    if (ench instanceof Blazing) {
      for (const $it3 = cone.cells.iterator(); $it3.hasNext(); ) {
        let cell = $it3.next();
        GameScene.add$Blob(Blob.seed$int$int$Class(cell, $J.roundf(Math.fround(8 * powerMulti)), $J.cls(Fire)));
      }
    } else if (ench instanceof Chilling) {
      for (const $it4 = cone.cells.iterator(); $it4.hasNext(); ) {
        let cell = $it4.next();
        GameScene.add$Blob(Blob.seed$int$int$Class(cell, $J.roundf(Math.fround(8 * powerMulti)), $J.cls(Freezing)));
      }
    } else if (ench instanceof Shocking) {
      for (const $it5 = cone.cells.iterator(); $it5.hasNext(); ) {
        let cell = $it5.next();
        GameScene.add$Blob(Blob.seed$int$int$Class(cell, $J.roundf(Math.fround(8 * powerMulti)), $J.cls(Electricity)));
      }
    } else if (ench instanceof Blooming) {
      let cells = new ArrayList(cone.cells);
      Random.shuffle$List(cells);
      let grassToPlace = $J.roundf(Math.fround(8 * powerMulti));
      let highGrassType = Terrain.HIGH_GRASS;
      if (Buff.affect$Char$Class(Dungeon.hero, $J.cls(ElementalStrike$ElementalStrikeFurrowCounter)).count() >= Math.fround(40)) {
        highGrassType = Terrain.FURROWED_GRASS;
      } else {
        if (Dungeon.hero.visibleEnemies() === 0 && targetsHit === 0) {
          Buff.count(Dungeon.hero, $J.cls(ElementalStrike$ElementalStrikeFurrowCounter), 4);
        } else {
          Buff.count(Dungeon.hero, $J.cls(ElementalStrike$ElementalStrikeFurrowCounter), 1);
        }
      }
      for (const $it6 = cells.iterator(); $it6.hasNext(); ) {
        let cell = $it6.next();
        let terr = Dungeon.level.map_[cell];
        if (terr === Terrain.EMPTY || terr === Terrain.EMBERS || terr === Terrain.EMPTY_DECO || terr === Terrain.GRASS) {
          if (grassToPlace > 0 && !Char.hasProp(Actor.findChar(cell), Char$Property.IMMOVABLE) && Dungeon.level.plants.get(cell) == null) {
            Level.set$int$int(cell, highGrassType);
            grassToPlace--;
          } else {
            Level.set$int$int(cell, Terrain.GRASS);
          }
          GameScene.updateMap$int(cell);
        }
      }
      Dungeon.observe$();
    } else if (ench instanceof Pressurized) {
      for (const $it7 = cone.cells.iterator(); $it7.hasNext(); ) {
        let cell = $it7.next();
        if (Random.Float$() < Math.fround(powerMulti / 2)) {
          Splash.at$int$int$int(cell, 6013411, 5);
          Dungeon.level.setCellToWater(true, cell);
        }
      }
    }
  }
  perCharEffect(cone: ConeAOE, hero: Hero, primaryTarget: Char, ench: Weapon$Enchantment): void {
    let powerMulti = Math.fround(1 + Math.fround(Math.fround(0.3) * Dungeon.hero.pointsInTalent(Talent.STRIKING_FORCE)));
    let affected = new ArrayList();
    for (const $it8 = Actor.chars().iterator(); $it8.hasNext(); ) {
      let ch = $it8.next();
      if (ch.alignment !== Char$Alignment.ALLY && cone.cells.contains(ch.pos)) {
        affected.add(ch);
      }
    }
    if (ench == null) {
      for (const $it9 = affected.iterator(); $it9.hasNext(); ) {
        let ch = $it9.next();
        ch.damage($J.roundf(Math.fround(powerMulti * Hero.heroDamageIntRange(6, 12))), this);
      }
    } else if (ench instanceof Kinetic) {
      if (this.storedKineticDamage > 0) {
        for (const $it10 = affected.iterator(); $it10.hasNext(); ) {
          let ch = $it10.next();
          if (ch !== primaryTarget) {
            ch.damage($J.roundf(Math.fround(Math.fround(this.storedKineticDamage * Math.fround(0.4)) * powerMulti)), ench);
          }
        }
        this.storedKineticDamage = 0;
      }
      if (primaryTarget == null && hero.buff($J.cls(Kinetic$ConservedDamage)) != null) {
        hero.buff($J.cls(Kinetic$ConservedDamage)).detach();
      }
    } else if (ench instanceof Venomous) {
      for (const $it11 = affected.iterator(); $it11.hasNext(); ) {
        let ch = $it11.next();
        if (ch !== primaryTarget) {
          let p = ch.buff($J.cls(Poison));
          if (p == null) {
            p = Buff.affect$Char$Class(ch, $J.cls(Poison));
            p.delay(3);
          }
          p.extend(Math.fround(powerMulti * 10));
        }
      }
    } else if (ench instanceof Blooming) {
      for (const $it12 = affected.iterator(); $it12.hasNext(); ) {
        let ch = $it12.next();
        Buff.affect$Char$Class$float(ch, $J.cls(Roots), Math.fround($J.roundf(Math.fround(6 * powerMulti))));
      }
    } else if (ench instanceof Elastic) {
      Collections.sort(affected, (a, b) => {
        return (Dungeon.level.distance(hero.pos, a.pos) - Dungeon.level.distance(hero.pos, b.pos)) | 0;
      });
      for (const $it13 = affected.iterator(); $it13.hasNext(); ) {
        let ch = $it13.next();
        if (ch === primaryTarget && this.oldEnemyPos !== primaryTarget.pos) {
          continue;
        }
        let aim = new Ballistica()._Ballistica(hero.pos, ch.pos, Ballistica.WONT_STOP);
        let knockback = $J.roundf(Math.fround(5 * powerMulti));
        WandOfBlastWave.throwChar(ch, new Ballistica()._Ballistica(ch.pos, aim.collisionPos, Ballistica.MAGIC_BOLT), knockback, true, true, this);
      }
    } else if (ench instanceof Eldritch) {
      for (const $it14 = affected.iterator(); $it14.hasNext(); ) {
        let ch = $it14.next();
        Buff.affect$Char$Class$float(ch, $J.cls(Terror), Math.fround(powerMulti * 10)).object = hero.id();
      }
    } else if (ench instanceof Lucky) {
      for (const $it15 = affected.iterator(); $it15.hasNext(); ) {
        let ch = $it15.next();
        if (ch.alignment === Char$Alignment.ENEMY && Random.Float$() < Math.fround(0.125 * powerMulti) && ch.buff($J.cls(ElementalStrike$ElementalStrikeLuckyTracker)) == null) {
          Dungeon.level.drop(Lucky.genLoot(), ch.pos).sprite_.drop$();
          Lucky.showFlare(ch.sprite_);
          Buff.affect$Char$Class(ch, $J.cls(ElementalStrike$ElementalStrikeLuckyTracker));
        }
      }
    } else if (ench instanceof Projecting) {
      for (const $it16 = affected.iterator(); $it16.hasNext(); ) {
        let ch = $it16.next();
        if (ch !== primaryTarget) {
          ch.damage($J.roundf(Math.fround(Math.fround(hero.damageRoll() * Math.fround(0.3)) * powerMulti)), ench);
        }
      }
    } else if (ench instanceof Unstable) {
      let w = hero.belongings.weapon();
      if (w instanceof Weapon) {
        for (const $it17 = affected.iterator(); $it17.hasNext(); ) {
          let ch = $it17.next();
          if (ch !== primaryTarget) {
            ench.proc(w, hero, ch, w.damageRoll(hero));
          }
        }
      }
    } else if (ench instanceof Vorpal) {
      for (const $it18 = affected.iterator(); $it18.hasNext(); ) {
        let ch = $it18.next();
        if (ch !== primaryTarget) {
          Buff.affect$Char$Class(ch, $J.cls(Bleeding)).set$float(Math.fround(powerMulti * 10));
        }
      }
    } else if (ench instanceof Corrupting) {
      for (const $it19 = affected.iterator(); $it19.hasNext(); ) {
        let ch = $it19.next();
        if (ch !== primaryTarget && !ch.isImmune($J.cls(Corruption)) && ch.buff($J.cls(Corruption)) == null && ch instanceof Mob && ch.isAlive()) {
          let hpMissing = Math.fround(1 - (Math.fround(ch.HP / Math.fround(ch.HT))));
          let chance = Math.fround(Math.fround(0.05) + Math.fround(Math.fround(0.2) * hpMissing));
          if (Random.Float$() < Math.fround(chance * powerMulti)) {
            Corruption.corruptionHeal(ch);
            AllyBuff.affectAndLoot(ch, hero, $J.cls(Corruption));
          }
        }
      }
    } else if (ench instanceof Crystal) {
      for (const $it20 = affected.iterator(); $it20.hasNext(); ) {
        let ch = $it20.next();
        if (ch !== primaryTarget) {
          ch.damage($J.roundf(Math.fround(powerMulti * Hero.heroDamageIntRange(10, 20))), this);
          (ench).repair(null, false, Math.fround(4 * powerMulti));
        }
      }
    } else if (ench instanceof Grim) {
      for (const $it21 = affected.iterator(); $it21.hasNext(); ) {
        let ch = $it21.next();
        if (ch !== primaryTarget) {
          let hpMissing = Math.fround(1 - (Math.fround(ch.HP / Math.fround(ch.HT))));
          let chance = Math.fround(Math.fround(0.06) + Math.fround(Math.fround(0.24) * hpMissing));
          if (Random.Float$() < Math.fround(chance * powerMulti)) {
            ch.damage(ch.HP, $J.cls(Grim));
            ch.sprite_.emitter().burst(ShadowParticle.UP, 5);
          }
        }
      }
    } else if (ench instanceof Annoying) {
      for (const $it22 = affected.iterator(); $it22.hasNext(); ) {
        let ch = $it22.next();
        if (Random.Float$() < Math.fround(Math.fround(0.2) * powerMulti)) {
          Buff.affect$Char$Class$float(ch, $J.cls(Amok), 6);
        }
      }
    } else if (ench instanceof Displacing) {
      for (const $it23 = affected.iterator(); $it23.hasNext(); ) {
        let ch = $it23.next();
        if (Random.Float$() < Math.fround(0.5 * powerMulti)) {
          let oldpos = ch.pos;
          if (ScrollOfTeleportation.teleportChar$Char(ch)) {
            if (Dungeon.level.heroFOV[oldpos]) {
              CellEmitter.get(oldpos).start(Speck.factory$int(Speck.LIGHT), Math.fround(0.2), 3);
            }
            if (ch instanceof Mob && (ch).state_ === (ch).HUNTING) {
              (ch).state_ = (ch).WANDERING;
            }
          }
        }
      }
    } else if (ench instanceof Dazzling) {
      for (const $it24 = affected.iterator(); $it24.hasNext(); ) {
        let ch = $it24.next();
        if (Random.Float$() < Math.fround(0.5 * powerMulti)) {
          Buff.affect$Char$Class$float(ch, $J.cls(Blindness), 6);
        }
      }
    } else if (ench instanceof Explosive) {
      if (Random.Float$() < Math.fround(0.5 * powerMulti)) {
        let exploding = Random.element$Collection(affected);
        if (exploding != null) {
          new Bomb$ConjuredBomb()._Bomb$ConjuredBomb().explode(exploding.pos);
        }
      }
    } else if (ench instanceof Sacrificial) {
      for (const $it25 = affected.iterator(); $it25.hasNext(); ) {
        let ch = $it25.next();
        Buff.affect$Char$Class(ch, $J.cls(Bleeding)).set$float(Math.fround(12 * powerMulti));
      }
    } else if (ench instanceof Wayward) {
      for (const $it26 = affected.iterator(); $it26.hasNext(); ) {
        let ch = $it26.next();
        if (Random.Float$() < Math.fround(0.5 * powerMulti)) {
          Buff.affect$Char$Class$float(ch, $J.cls(Hex), 6);
        }
      }
    } else if (ench instanceof Polarized) {
      for (const $it27 = affected.iterator(); $it27.hasNext(); ) {
        let ch = $it27.next();
        if (Random.Float$() < Math.fround(0.5 * powerMulti)) {
          ch.damage(Hero.heroDamageIntRange(24, 36), this);
        }
      }
    } else if (ench instanceof Friendly) {
      for (const $it28 = affected.iterator(); $it28.hasNext(); ) {
        let ch = $it28.next();
        if (Random.Float$() < Math.fround(0.5 * powerMulti)) {
          Buff.affect$Char$Class$float(ch, $J.cls(Charm), 6).object = hero.id();
        }
      }
    } else if (ench instanceof Wondrous) {
      let positiveOnly = Random.Float$() < WondrousResin.positiveCurseEffectChance$();
      for (const $it29 = affected.iterator(); $it29.hasNext(); ) {
        let ch = $it29.next();
        if (Random.Float$() < Math.fround(powerMulti / 2)) {
          let aim = new Ballistica()._Ballistica(hero.pos, ch.pos, Ballistica.STOP_TARGET);
          ch.sprite_.emitter().burst(RainbowParticle.BURST, 25);
          CursedWand.randomValidEffect(null, hero, aim, positiveOnly).effect(null, hero, aim, positiveOnly);
        }
      }
    } else if (ench instanceof Pressurized) {
      Collections.sort(affected, (a, b) => {
        return (Dungeon.level.distance(hero.pos, a.pos) - Dungeon.level.distance(hero.pos, b.pos)) | 0;
      });
      for (const $it30 = affected.iterator(); $it30.hasNext(); ) {
        let ch = $it30.next();
        if (ch === primaryTarget && this.oldEnemyPos !== primaryTarget.pos) {
          continue;
        }
        let aim = new Ballistica()._Ballistica(hero.pos, ch.pos, Ballistica.WONT_STOP);
        let knockback = $J.roundf(Math.fround(2 * powerMulti));
        WandOfBlastWave.throwChar(ch, new Ballistica()._Ballistica(ch.pos, aim.collisionPos, Ballistica.MAGIC_BOLT), knockback, true, true, this);
      }
    }
  }
  desc(): string {
    let desc = Messages.get$Object$String$ObjectArr(this, 'desc', []);
    if (Game.scene() instanceof GameScene) {
      let w = Dungeon.hero.belongings.weapon();
      if (w instanceof MeleeWeapon && (w).enchantment != null) {
        desc += '\n\n' + Messages.get$Object$String$ObjectArr((w).enchantment, 'elestrike_desc', []);
      } else {
        desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'generic_desc', []);
      }
    } else {
      desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'generic_desc', []);
    }
    desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'cost', [$J.d2i(this.baseChargeUse_)]);
    return desc;
  }
  icon(): number {
    return HeroIcon.ELEMENTAL_STRIKE;
  }
  talents(): Talent[] {
    return [Talent.ELEMENTAL_REACH, Talent.STRIKING_FORCE, Talent.DIRECTED_POWER, Talent.HEROIC_ENERGY];
  }
  static $clinit() {
    ElementalStrike.effectTypes = new HashMap();
    ElementalStrike.effectTypes.put($J.cls(Blazing), MagicMissile.FIRE_CONE);
    ElementalStrike.effectTypes.put($J.cls(Chilling), MagicMissile.FROST_CONE);
    ElementalStrike.effectTypes.put($J.cls(Kinetic), MagicMissile.FORCE_CONE);
    ElementalStrike.effectTypes.put($J.cls(Shocking), MagicMissile.SPARK_CONE);
    ElementalStrike.effectTypes.put($J.cls(Venomous), MagicMissile.POISON_CONE);
    ElementalStrike.effectTypes.put($J.cls(Blocking), MagicMissile.WARD_CONE);
    ElementalStrike.effectTypes.put($J.cls(Blooming), MagicMissile.FOLIAGE_CONE);
    ElementalStrike.effectTypes.put($J.cls(Eldritch), MagicMissile.SHADOW_CONE);
    ElementalStrike.effectTypes.put($J.cls(Elastic), MagicMissile.FORCE_CONE);
    ElementalStrike.effectTypes.put($J.cls(Lucky), MagicMissile.RAINBOW_CONE);
    ElementalStrike.effectTypes.put($J.cls(Projecting), MagicMissile.PURPLE_CONE);
    ElementalStrike.effectTypes.put($J.cls(Unstable), MagicMissile.RAINBOW_CONE);
    ElementalStrike.effectTypes.put($J.cls(Vorpal), MagicMissile.BLOOD_CONE);
    ElementalStrike.effectTypes.put($J.cls(Corrupting), MagicMissile.SHADOW_CONE);
    ElementalStrike.effectTypes.put($J.cls(Crystal), (MagicMissile.SPECK + Speck.LIGHT) | 0);
    ElementalStrike.effectTypes.put($J.cls(Grim), MagicMissile.SHADOW_CONE);
    ElementalStrike.effectTypes.put($J.cls(Vampiric), MagicMissile.BLOOD_CONE);
    ElementalStrike.effectTypes.put($J.cls(Annoying), MagicMissile.SHADOW_CONE);
    ElementalStrike.effectTypes.put($J.cls(Displacing), MagicMissile.SHADOW_CONE);
    ElementalStrike.effectTypes.put($J.cls(Dazzling), MagicMissile.SHADOW_CONE);
    ElementalStrike.effectTypes.put($J.cls(Explosive), MagicMissile.SHADOW_CONE);
    ElementalStrike.effectTypes.put($J.cls(Friendly), MagicMissile.SHADOW_CONE);
    ElementalStrike.effectTypes.put($J.cls(Polarized), MagicMissile.SHADOW_CONE);
    ElementalStrike.effectTypes.put($J.cls(Pressurized), MagicMissile.SHADOW_CONE);
    ElementalStrike.effectTypes.put($J.cls(Sacrificial), MagicMissile.SHADOW_CONE);
    ElementalStrike.effectTypes.put($J.cls(Wayward), MagicMissile.SHADOW_CONE);
    ElementalStrike.effectTypes.put($J.cls(Wondrous), MagicMissile.SHADOW_CONE);
    ElementalStrike.effectTypes.put(null, MagicMissile.MAGIC_MISS_CONE);
  }
}

export class ElementalStrike$DirectedPowerTracker extends FlavourBuff {
  enchBoost: number = 0;
  _ElementalStrike$DirectedPowerTracker(): this {
    this._FlavourBuff();
    this.enchBoost = 0;
    return this;
  }
}

export class ElementalStrike$ElementalStrikeLuckyTracker extends Buff {
  _ElementalStrike$ElementalStrikeLuckyTracker(): this {
    this._Buff();
    return this;
  }
}

export class ElementalStrike$ElementalStrikeFurrowCounter extends CounterBuff {
  _ElementalStrike$ElementalStrikeFurrowCounter(): this {
    this._CounterBuff();
    this.revivePersists = true;
    return this;
  }
}

let $ElementalStrike$1: any = null;
/** An anonymous class (ElementalStrike.java:205). */
function ElementalStrike$1(): any {
  return $ElementalStrike$1 ??= $J.local(class extends JObject {
    call(): void {
      let enemy = Actor.findChar(this.$cv_target);
      if (enemy != null) {
        if (this.$cv_hero.isCharmedBy(enemy)) {
          enemy = null;
        } else if (enemy.alignment === this.$cv_hero.alignment) {
          enemy = null;
        } else if (!this.$cv_hero.canAttack(enemy)) {
          enemy = null;
        }
      }
      this.$outer.preAttackEffect(this.$cv_cone, this.$cv_hero, this.$cv_finalEnchantment);
      if (enemy != null) {
        AttackIndicator.target(enemy);
        this.$outer.oldEnemyPos = enemy.pos;
        if (this.$cv_hero.attack$Char$float$float$float(enemy, 1, 0, Math.fround(Char.INFINITE_ACCURACY))) {
          Sample.INSTANCE.play$Object(Assets$Sounds.HIT_STRONG);
        }
      }
      this.$outer.perCellEffect(this.$cv_cone, this.$cv_finalEnchantment);
      this.$outer.perCharEffect(this.$cv_cone, this.$cv_hero, enemy, this.$cv_finalEnchantment);
      Invisibility.dispel$();
      this.$cv_hero.spendAndNext(this.$cv_hero.attackDelay());
    }
    $c($target, $hero, $cone, $finalEnchantment): this {
      this.$cv_target = $target; this.$cv_hero = $hero; this.$cv_cone = $cone; this.$cv_finalEnchantment = $finalEnchantment;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.duelist.ElementalStrike$1', ['com.watabou.utils.Callback']);
}

$J.define(ElementalStrike, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.duelist.ElementalStrike', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.ArmorAbility', ctors: { '': '_ElementalStrike' }, clinit: true, lazy: ['effectTypes'] });
$J.define(ElementalStrike$DirectedPowerTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.duelist.ElementalStrike$DirectedPowerTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_ElementalStrike$DirectedPowerTracker' } });
$J.define(ElementalStrike$ElementalStrikeLuckyTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.duelist.ElementalStrike$ElementalStrikeLuckyTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_ElementalStrike$ElementalStrikeLuckyTracker' } });
$J.define(ElementalStrike$ElementalStrikeFurrowCounter, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.duelist.ElementalStrike$ElementalStrikeFurrowCounter', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.CounterBuff', ctors: { '': '_ElementalStrike$ElementalStrikeFurrowCounter' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Blob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob');
  Electricity = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Electricity');
  Fire = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Fire');
  Freezing = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Freezing');
  AllyBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AllyBuff');
  Amok = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Amok');
  Barrier = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Barrier');
  Bleeding = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Bleeding');
  Blindness = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Blindness');
  Charm = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Charm');
  Corruption = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Corruption');
  Hex = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Hex');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Poison = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Poison');
  Roots = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Roots');
  Terror = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Terror');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  MagicMissile = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Splash = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Splash');
  RainbowParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.RainbowParticle');
  ShadowParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShadowParticle');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Bomb$ConjuredBomb = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bombs.Bomb$ConjuredBomb');
  ScrollOfTeleportation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation');
  WondrousResin = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.WondrousResin');
  CursedWand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand');
  WandOfBlastWave = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfBlastWave');
  Weapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon');
  Annoying = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.curses.Annoying');
  Dazzling = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.curses.Dazzling');
  Displacing = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.curses.Displacing');
  Explosive = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.curses.Explosive');
  Friendly = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.curses.Friendly');
  Polarized = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.curses.Polarized');
  Pressurized = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.curses.Pressurized');
  Sacrificial = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.curses.Sacrificial');
  Wayward = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.curses.Wayward');
  Wondrous = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.curses.Wondrous');
  Blazing = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Blazing');
  Blocking = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Blocking');
  Blooming = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Blooming');
  Chilling = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Chilling');
  Corrupting = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Corrupting');
  Crystal = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Crystal');
  Elastic = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Elastic');
  Eldritch = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Eldritch');
  Grim = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Grim');
  Kinetic = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Kinetic');
  Kinetic$ConservedDamage = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Kinetic$ConservedDamage');
  Lucky = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Lucky');
  Projecting = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Projecting');
  Shocking = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Shocking');
  Unstable = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Unstable');
  Vampiric = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Vampiric');
  Venomous = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Venomous');
  Vorpal = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Vorpal');
  MeleeWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon');
  Level = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  ConeAOE = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.ConeAOE');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  AttackIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.AttackIndicator');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  Game = $J.load('com.watabou.noosa.Game');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Random = $J.load('com.watabou.utils.Random');
});
