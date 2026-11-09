// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/abilities/mage/ElementalBlast.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, HashMap, JObject } from '../../../../../../../../jre/index.ts';
import { ArmorAbility } from '../ArmorAbility.ts';

let Assets$Sounds, Challenges, Dungeon, Actor, Char$Alignment, Char$Property, Blob, Electricity, Fire, Freezing, Amok, Barrier, Blindness, Buff, Burning, Charm, Corrosion, Frost, Invisibility, Light, Paralysis, Recharging, Roots, Hero, Talent, FloatingText, MagicMissile, MagicMissile$EarthParticle, Speck, SpellSprite, ShadowParticle, Item, ScrollOfMagicMapping, WandOfBlastWave, WandOfCorrosion, WandOfCorruption, WandOfDisintegration, WandOfFireblast, WandOfFrost, WandOfLightning, WandOfLivingEarth, WandOfLivingEarth$EarthGuardian, WandOfMagicMissile, WandOfPrismaticLight, WandOfRegrowth, WandOfTransfusion, WandOfWarding, WandOfWarding$Ward, MagesStaff, Level, Terrain, Ballistica, ConeAOE, Messages, GameScene, CharSprite, HeroIcon, GLog, Game, Sample, PathFinder, Random, Reflection;

export class ElementalBlast extends ArmorAbility {
  static effectTypes: HashMap<JClass<Wand>, number> = null;
  static damageFactors: HashMap<JClass<Wand>, number> = null;
  _ElementalBlast(): this {
    this._ArmorAbility();
    this.baseChargeUse_ = 35;
    return this;
  }
  activate(armor: ClassArmor, hero: Hero, target: number): void {
    let aim: Ballistica;
    let x = hero.pos % Dungeon.level.width();
    let y = $J.idiv(hero.pos, Dungeon.level.width());
    if ((Math.max(x, (Dungeon.level.width() - x) | 0)) >= (Math.max(y, (Dungeon.level.height() - y) | 0))) {
      if (x > $J.idiv(Dungeon.level.width(), 2)) {
        aim = new Ballistica()._Ballistica(hero.pos, (hero.pos - 1) | 0, Ballistica.WONT_STOP);
      } else {
        aim = new Ballistica()._Ballistica(hero.pos, (hero.pos + 1) | 0, Ballistica.WONT_STOP);
      }
    } else {
      if (y > $J.idiv(Dungeon.level.height(), 2)) {
        aim = new Ballistica()._Ballistica(hero.pos, (hero.pos - Dungeon.level.width()) | 0, Ballistica.WONT_STOP);
      } else {
        aim = new Ballistica()._Ballistica(hero.pos, (hero.pos + Dungeon.level.width()) | 0, Ballistica.WONT_STOP);
      }
    }
    let wandCls = null;
    if (hero.belongings.getItem($J.cls(MagesStaff)) != null) {
      wandCls = hero.belongings.getItem($J.cls(MagesStaff)).wandClass();
    }
    if (wandCls == null) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'no_staff', []), []);
      return;
    }
    let aoeSize = (4 + hero.pointsInTalent(Talent.BLAST_RADIUS)) | 0;
    let projectileProps = Ballistica.STOP_SOLID | Ballistica.STOP_TARGET;
    if (wandCls === $J.cls(WandOfDisintegration)) {
      projectileProps = Ballistica.STOP_TARGET;
    } else if (wandCls === $J.cls(WandOfFireblast)) {
      projectileProps = projectileProps | Ballistica.IGNORE_SOFT_SOLID;
    } else if (wandCls === $J.cls(WandOfWarding)) {
      projectileProps = Ballistica.STOP_TARGET;
    }
    let aoe = new ConeAOE()._ConeAOE$Ballistica$float$float$int(aim, Math.fround(aoeSize), 360, projectileProps);
    for (const $it0 = aoe.outerRays.iterator(); $it0.hasNext(); ) {
      let ray = $it0.next();
      (hero.sprite_.parent.recycle($J.cls(MagicMissile))).reset$int$Visual$int$Callback(ElementalBlast.effectTypes.get(wandCls), hero.sprite_, ray.path.get(ray.dist), null);
    }
    let effectMulti = Math.fround(1 + Math.fround(0.25 * hero.pointsInTalent(Talent.ELEMENTAL_POWER)));
    let finalWandCls = wandCls;
    (hero.sprite_.parent.recycle($J.cls(MagicMissile))).reset$int$Visual$int$Callback(ElementalBlast.effectTypes.get(wandCls), hero.sprite_, aim.path.get(Math.min($J.idiv(aoeSize, 2), (aim.path.size() - 1) | 0)), new (ElementalBlast$1())().$o(this).$c(aoe, finalWandCls, effectMulti, hero, aoeSize));
    hero.sprite_.operate$int(hero.pos);
    Invisibility.dispel$();
    hero.busy();
    armor.charge_ = Math.fround(armor.charge_ - this.chargeUse(hero));
    Item.updateQuickslot();
    Sample.INSTANCE.play$Object(Assets$Sounds.CHARGEUP);
  }
  desc(): string {
    let desc = Messages.get$Object$String$ObjectArr(this, 'desc', []);
    if (Game.scene() instanceof GameScene) {
      let staff = Dungeon.hero.belongings.getItem($J.cls(MagesStaff));
      if (staff != null && staff.wandClass() != null) {
        desc += '\n\n' + Messages.get$Class$String$ObjectArr(staff.wandClass(), 'eleblast_desc', []);
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
    return HeroIcon.ELEMENTAL_BLAST;
  }
  talents(): Talent[] {
    return [Talent.BLAST_RADIUS, Talent.ELEMENTAL_POWER, Talent.REACTIVE_BARRIER, Talent.HEROIC_ENERGY];
  }
  static $clinit() {
    ElementalBlast.effectTypes = new HashMap();
    ElementalBlast.effectTypes.put($J.cls(WandOfMagicMissile), MagicMissile.MAGIC_MISS_CONE);
    ElementalBlast.effectTypes.put($J.cls(WandOfLightning), MagicMissile.SPARK_CONE);
    ElementalBlast.effectTypes.put($J.cls(WandOfDisintegration), MagicMissile.PURPLE_CONE);
    ElementalBlast.effectTypes.put($J.cls(WandOfFireblast), MagicMissile.FIRE_CONE);
    ElementalBlast.effectTypes.put($J.cls(WandOfCorrosion), MagicMissile.CORROSION_CONE);
    ElementalBlast.effectTypes.put($J.cls(WandOfBlastWave), MagicMissile.FORCE_CONE);
    ElementalBlast.effectTypes.put($J.cls(WandOfLivingEarth), MagicMissile.EARTH_CONE);
    ElementalBlast.effectTypes.put($J.cls(WandOfFrost), MagicMissile.FROST_CONE);
    ElementalBlast.effectTypes.put($J.cls(WandOfPrismaticLight), MagicMissile.RAINBOW_CONE);
    ElementalBlast.effectTypes.put($J.cls(WandOfWarding), MagicMissile.WARD_CONE);
    ElementalBlast.effectTypes.put($J.cls(WandOfTransfusion), MagicMissile.BLOOD_CONE);
    ElementalBlast.effectTypes.put($J.cls(WandOfCorruption), MagicMissile.SHADOW_CONE);
    ElementalBlast.effectTypes.put($J.cls(WandOfRegrowth), MagicMissile.FOLIAGE_CONE);
    ElementalBlast.damageFactors = new HashMap();
    $J.boxF(ElementalBlast.damageFactors.put($J.cls(WandOfMagicMissile), $J.boxF(0.5)));
    $J.boxF(ElementalBlast.damageFactors.put($J.cls(WandOfLightning), $J.boxF(1)));
    $J.boxF(ElementalBlast.damageFactors.put($J.cls(WandOfDisintegration), $J.boxF(1)));
    $J.boxF(ElementalBlast.damageFactors.put($J.cls(WandOfFireblast), $J.boxF(1)));
    $J.boxF(ElementalBlast.damageFactors.put($J.cls(WandOfCorrosion), $J.boxF(0)));
    $J.boxF(ElementalBlast.damageFactors.put($J.cls(WandOfBlastWave), $J.boxF(Math.fround(0.67))));
    $J.boxF(ElementalBlast.damageFactors.put($J.cls(WandOfLivingEarth), $J.boxF(0.5)));
    $J.boxF(ElementalBlast.damageFactors.put($J.cls(WandOfFrost), $J.boxF(1)));
    $J.boxF(ElementalBlast.damageFactors.put($J.cls(WandOfPrismaticLight), $J.boxF(Math.fround(0.67))));
    $J.boxF(ElementalBlast.damageFactors.put($J.cls(WandOfWarding), $J.boxF(0)));
    $J.boxF(ElementalBlast.damageFactors.put($J.cls(WandOfTransfusion), $J.boxF(0)));
    $J.boxF(ElementalBlast.damageFactors.put($J.cls(WandOfCorruption), $J.boxF(0)));
    $J.boxF(ElementalBlast.damageFactors.put($J.cls(WandOfRegrowth), $J.boxF(0)));
  }
}

let $ElementalBlast$1: any = null;
/** An anonymous class (ElementalBlast.java:200). */
function ElementalBlast$1(): any {
  return $ElementalBlast$1 ??= $J.local(class extends JObject {
    call(): void {
      let charsHit = 0;
      let freeze = Dungeon.level.blobs.get($J.cls(Freezing));
      let fire = Dungeon.level.blobs.get($J.cls(Fire));
      for (const $it1 = this.$cv_aoe.cells.iterator(); $it1.hasNext(); ) {
        let cell = $it1.next();
        if (this.$cv_finalWandCls === $J.cls(WandOfLightning)) {
          if (Dungeon.level.water[cell]) {
            GameScene.add$Blob(Blob.seed$int$int$Class(cell, 4, $J.cls(Electricity)));
          }
        } else if (this.$cv_finalWandCls === $J.cls(WandOfFireblast)) {
          if (Dungeon.level.map_[cell] === Terrain.DOOR) {
            Level.set$int$int(cell, Terrain.OPEN_DOOR);
            GameScene.updateMap$int(cell);
          }
          if (freeze != null) {
            freeze.clear(cell);
          }
          if (Dungeon.level.flamable[cell]) {
            GameScene.add$Blob(Blob.seed$int$int$Class(cell, 4, $J.cls(Fire)));
          }
        } else if (this.$cv_finalWandCls === $J.cls(WandOfFrost)) {
          if (fire != null) {
            fire.clear(cell);
          }
        } else if (this.$cv_finalWandCls === $J.cls(WandOfPrismaticLight)) {
          for (let n of PathFinder.NEIGHBOURS9) {
            let c = (cell + n) | 0;
            if (Dungeon.level.discoverable[c]) {
              Dungeon.level.mapped[c] = true;
            }
            let terr = Dungeon.level.map_[c];
            if ((Terrain.flags[terr] & Terrain.SECRET) !== 0) {
              Dungeon.level.discover(c);
              GameScene.discoverTile(c, terr);
              ScrollOfMagicMapping.discover(c);
            }
          }
        } else if (this.$cv_finalWandCls === $J.cls(WandOfRegrowth)) {
          let t = Dungeon.level.map_[cell];
          if (Random.Float$() < Math.fround(Math.fround(0.33) * this.$cv_effectMulti)) {
            if ((t === Terrain.EMPTY || t === Terrain.EMPTY_DECO || t === Terrain.EMBERS || t === Terrain.GRASS || t === Terrain.FURROWED_GRASS) && Dungeon.level.plants.get(cell) == null) {
              Level.set$int$int(cell, Terrain.HIGH_GRASS);
              GameScene.updateMap$int(cell);
            }
          }
        }
        let mob = Actor.findChar(cell);
        let damage = $J.roundf(Math.fround(Math.fround(Hero.heroDamageIntRange(15, 25) * this.$cv_effectMulti) * +$J.boxF(ElementalBlast.damageFactors.get(this.$cv_finalWandCls))));
        if (mob != null && damage > 0 && mob.alignment !== Char$Alignment.ALLY) {
          mob.damage(damage, Reflection.newInstance(this.$cv_finalWandCls));
          charsHit++;
        }
        if (mob != null && mob !== this.$cv_hero) {
          if (this.$cv_finalWandCls === $J.cls(WandOfLightning)) {
            if (mob.isAlive() && mob.alignment !== Char$Alignment.ALLY) {
              Buff.affect$Char$Class$float(mob, $J.cls(Paralysis), Math.fround(Math.fround(this.$cv_effectMulti * Paralysis.DURATION) / 2));
            }
          } else if (this.$cv_finalWandCls === $J.cls(WandOfFireblast)) {
            if (mob.isAlive() && mob.alignment !== Char$Alignment.ALLY) {
              Buff.affect$Char$Class(mob, $J.cls(Burning)).reignite$Char(mob);
            }
          } else if (this.$cv_finalWandCls === $J.cls(WandOfCorrosion)) {
            if (mob.isAlive() && mob.alignment !== Char$Alignment.ALLY) {
              Buff.affect$Char$Class(mob, $J.cls(Corrosion)).set$float$int(4, $J.roundf(Math.fround(6 * this.$cv_effectMulti)));
              charsHit++;
            }
          } else if (this.$cv_finalWandCls === $J.cls(WandOfBlastWave)) {
            if (mob.alignment !== Char$Alignment.ALLY) {
              let aim = new Ballistica()._Ballistica(this.$cv_hero.pos, mob.pos, Ballistica.WONT_STOP);
              let knockback = (this.$cv_aoeSize + 1 - $J.d2i(Dungeon.level.trueDistance(this.$cv_hero.pos, mob.pos))) | 0;
              knockback = $J.d2i(Math.fround(knockback * this.$cv_effectMulti));
              WandOfBlastWave.throwChar(mob, new Ballistica()._Ballistica(mob.pos, aim.collisionPos, Ballistica.MAGIC_BOLT), knockback, true, true, this.$outer);
            }
          } else if (this.$cv_finalWandCls === $J.cls(WandOfFrost)) {
            if (mob.isAlive() && mob.alignment !== Char$Alignment.ALLY) {
              Buff.affect$Char$Class$float(mob, $J.cls(Frost), Math.fround(this.$cv_effectMulti * Frost.DURATION));
            }
          } else if (this.$cv_finalWandCls === $J.cls(WandOfPrismaticLight)) {
            if (mob.isAlive() && mob.alignment !== Char$Alignment.ALLY) {
              Buff.prolong(mob, $J.cls(Blindness), Math.fround(Math.fround(this.$cv_effectMulti * Blindness.DURATION) / 2));
              charsHit++;
            }
          } else if (this.$cv_finalWandCls === $J.cls(WandOfWarding)) {
            if (mob instanceof WandOfWarding$Ward) {
              (mob).wandHeal$int$float(0, this.$cv_effectMulti);
              charsHit++;
            }
          } else if (this.$cv_finalWandCls === $J.cls(WandOfTransfusion)) {
            if (mob.alignment === Char$Alignment.ALLY || mob.buff($J.cls(Charm)) != null) {
              let healing = $J.roundf(Math.fround(10 * this.$cv_effectMulti));
              let shielding = (mob.HP + healing - mob.HT) | 0;
              if (shielding > 0) {
                healing = (healing - shielding) | 0;
                Buff.affect$Char$Class(mob, $J.cls(Barrier)).setShield(shielding);
              } else {
                shielding = 0;
              }
              mob.HP = (mob.HP + healing) | 0;
              mob.sprite_.emitter().burst(Speck.factory$int(Speck.HEALING), 4);
              if (healing > 0) {
                mob.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(healing), FloatingText.HEALING, []);
              }
              if (shielding > 0) {
                mob.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(shielding), FloatingText.SHIELDING, []);
              }
            } else {
              if (!mob.properties().contains(Char$Property.UNDEAD)) {
                let charm = Buff.affect$Char$Class$float(mob, $J.cls(Charm), Math.fround(Math.fround(this.$cv_effectMulti * Charm.DURATION) / 2));
                charm.object = this.$cv_hero.id();
                charm.ignoreHeroAllies = true;
                mob.sprite_.centerEmitter().start(Speck.factory$int(Speck.HEART), Math.fround(0.2), 3);
              } else {
                damage = $J.roundf(Math.fround(Hero.heroDamageIntRange(15, 25) * this.$cv_effectMulti));
                mob.damage(damage, Reflection.newInstance(this.$cv_finalWandCls));
                mob.sprite_.emitter().start(ShadowParticle.UP, Math.fround(0.05), 10);
              }
            }
            charsHit++;
          } else if (this.$cv_finalWandCls === $J.cls(WandOfCorruption)) {
            if (mob.isAlive() && mob.alignment !== Char$Alignment.ALLY) {
              Buff.prolong(mob, $J.cls(Amok), Math.fround(this.$cv_effectMulti * 5));
              charsHit++;
            }
          } else if (this.$cv_finalWandCls === $J.cls(WandOfRegrowth)) {
            if (mob.alignment !== Char$Alignment.ALLY) {
              Buff.prolong(mob, $J.cls(Roots), Math.fround(this.$cv_effectMulti * Roots.DURATION));
              charsHit++;
            }
          }
        }
      }
      if (this.$cv_finalWandCls === $J.cls(WandOfMagicMissile)) {
        Buff.affect$Char$Class$float(this.$cv_hero, $J.cls(Recharging), Math.fround(Math.fround(this.$cv_effectMulti * Recharging.DURATION) / 2));
        SpellSprite.show$Char$int(this.$cv_hero, SpellSprite.CHARGE);
      } else if (this.$cv_finalWandCls === $J.cls(WandOfLivingEarth) && charsHit > 0) {
        for (const $it2 = Dungeon.level.mobs.iterator(); $it2.hasNext(); ) {
          let m = $it2.next();
          if (m instanceof WandOfLivingEarth$EarthGuardian) {
            (m).setInfo(this.$cv_hero, 0, $J.roundf(Math.fround(Math.fround(this.$cv_effectMulti * charsHit) * 5)));
            m.sprite_.centerEmitter().burst(MagicMissile$EarthParticle.ATTRACT, (8 + charsHit) | 0);
            break;
          }
        }
      } else if (this.$cv_finalWandCls === $J.cls(WandOfFrost)) {
        if ((this.$cv_hero.buff($J.cls(Burning))) != null) {
          this.$cv_hero.buff($J.cls(Burning)).detach();
        }
      } else if (this.$cv_finalWandCls === $J.cls(WandOfPrismaticLight)) {
        if (Dungeon.isChallenged(Challenges.DARKNESS)) {
          Buff.prolong(this.$cv_hero, $J.cls(Light), Math.fround(this.$cv_effectMulti * 10));
        } else {
          Buff.prolong(this.$cv_hero, $J.cls(Light), Math.fround(this.$cv_effectMulti * 50));
        }
      }
      charsHit = Math.min((4 + this.$cv_hero.pointsInTalent(Talent.REACTIVE_BARRIER)) | 0, charsHit);
      if (charsHit > 0 && this.$cv_hero.hasTalent(Talent.REACTIVE_BARRIER)) {
        let shielding = $J.roundf(Math.fround(Math.fround(charsHit * 2.5) * this.$cv_hero.pointsInTalent(Talent.REACTIVE_BARRIER)));
        this.$cv_hero.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(shielding), FloatingText.SHIELDING, []);
        Buff.affect$Char$Class(this.$cv_hero, $J.cls(Barrier)).setShield(shielding);
      }
      this.$cv_hero.spendAndNext(Actor.TICK);
    }
    $c($aoe, $finalWandCls, $effectMulti, $hero, $aoeSize): this {
      this.$cv_aoe = $aoe; this.$cv_finalWandCls = $finalWandCls; this.$cv_effectMulti = $effectMulti; this.$cv_hero = $hero; this.$cv_aoeSize = $aoeSize;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.mage.ElementalBlast$1', ['com.watabou.utils.Callback']);
}

$J.define(ElementalBlast, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.mage.ElementalBlast', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.ArmorAbility', ctors: { '': '_ElementalBlast' }, clinit: true, lazy: ['effectTypes', 'damageFactors'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Blob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob');
  Electricity = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Electricity');
  Fire = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Fire');
  Freezing = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Freezing');
  Amok = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Amok');
  Barrier = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Barrier');
  Blindness = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Blindness');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Burning = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Burning');
  Charm = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Charm');
  Corrosion = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Corrosion');
  Frost = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Frost');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Light = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Light');
  Paralysis = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Paralysis');
  Recharging = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Recharging');
  Roots = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Roots');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  MagicMissile = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile');
  MagicMissile$EarthParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$EarthParticle');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  SpellSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.SpellSprite');
  ShadowParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShadowParticle');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  ScrollOfMagicMapping = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfMagicMapping');
  WandOfBlastWave = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfBlastWave');
  WandOfCorrosion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfCorrosion');
  WandOfCorruption = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfCorruption');
  WandOfDisintegration = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfDisintegration');
  WandOfFireblast = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfFireblast');
  WandOfFrost = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfFrost');
  WandOfLightning = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfLightning');
  WandOfLivingEarth = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfLivingEarth');
  WandOfLivingEarth$EarthGuardian = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfLivingEarth$EarthGuardian');
  WandOfMagicMissile = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfMagicMissile');
  WandOfPrismaticLight = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfPrismaticLight');
  WandOfRegrowth = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfRegrowth');
  WandOfTransfusion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfTransfusion');
  WandOfWarding = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfWarding');
  WandOfWarding$Ward = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfWarding$Ward');
  MagesStaff = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MagesStaff');
  Level = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  ConeAOE = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.ConeAOE');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Game = $J.load('com.watabou.noosa.Game');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
