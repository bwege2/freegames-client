// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/MonkEnergy.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../../jre/index.ts';
import { Buff } from './Buff.ts';
import { FlavourBuff } from './FlavourBuff.ts';

let Assets$Sounds, Dungeon, Actor, Char, Char$Alignment, Char$Property, AllyBuff, ArtifactRecharge, Buff$buffType, Healing, Invisibility, LostInventory, Paralysis, Recharging, Regeneration, Hero, Talent, Talent$CombinedEnergyAbilityTracker, Ghoul, RipperDemon, Wraith, YogDzewa$Larva, Speck, RingOfForce$BrawlersStance, WandOfBlastWave, MeleeWeapon, Terrain, Door, Ballistica, Messages, GameScene, PixelScene, CharSprite, ActionIndicator, AttackIndicator, BuffIndicator, HeroIcon, GLog, WndMonkAbilities, BitmapText, Sample, GameMath;

export class MonkEnergy extends Buff {
  energy: number = 0;
  cooldown_: number = 0;
  static readonly MAX_COOLDOWN: number = 5;
  static ENERGY: string = null;
  static COOLDOWN: string = null;
  _MonkEnergy(): this {
    this._Buff();
    this.type_ = Buff$buffType.POSITIVE;
    this.energy = 0;
    return this;
  }
  icon(): number {
    return BuffIndicator.MONK_ENERGY;
  }
  tintIcon(icon: Image): void {
    if (this.cooldown_ > 0) {
      icon.hardlight$float$float$float(Math.fround(0.33), Math.fround(0.33), 1);
    } else {
      icon.resetColor();
    }
  }
  iconFadePercent(): number {
    return GameMath.gate(0, Math.fround(this.cooldown_ / MonkEnergy.MAX_COOLDOWN), 1);
  }
  iconTextDisplay(): string {
    if (this.cooldown_ > 0) {
      return String(this.cooldown_);
    } else {
      return '';
    }
  }
  act(): boolean {
    if (this.cooldown_ > 0) {
      this.cooldown_--;
      if (this.cooldown_ === 0 && this.energy >= Math.fround(1)) {
        ActionIndicator.setAction(this);
      }
      BuffIndicator.refreshHero();
    }
    this.spend(Actor.TICK);
    return true;
  }
  detach(): void {
    super.detach();
    ActionIndicator.clearAction$();
  }
  desc(): string {
    let desc = Messages.get$Object$String$ObjectArr(this, 'desc', [$J.d2i(this.energy), this.energyCap()]);
    if (this.cooldown_ > 0) {
      desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_cooldown', [this.cooldown_]);
    }
    return desc;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$float(MonkEnergy.ENERGY, this.energy);
    bundle.put$String$int(MonkEnergy.COOLDOWN, this.cooldown_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.energy = bundle.getFloat(MonkEnergy.ENERGY);
    this.cooldown_ = bundle.getInt(MonkEnergy.COOLDOWN);
    if (this.energy >= Math.fround(1) && this.cooldown_ === 0) {
      ActionIndicator.setAction(this);
    }
  }
  gainEnergy(enemy: Mob): void {
    if (this.target == null) {
      return;
    }
    if (!Regeneration.regenOn()) {
      return;
    }
    let energyGain: number;
    if (Char.hasProp(enemy, Char$Property.BOSS)) {
      energyGain = 5;
    } else if (Char.hasProp(enemy, Char$Property.MINIBOSS)) {
      energyGain = 3;
    } else if (enemy instanceof Ghoul) {
      energyGain = 0.5;
    } else if (enemy instanceof RipperDemon) {
      energyGain = 0.5;
    } else if (enemy instanceof YogDzewa$Larva) {
      energyGain = 0.5;
    } else if (enemy instanceof Wraith) {
      energyGain = 0.5;
    } else {
      energyGain = 1;
    }
    let enGainMulti = 1;
    if (this.target instanceof Hero) {
      let hero = this.target;
      if (hero.hasTalent(Talent.UNENCUMBERED_SPIRIT)) {
        let points = hero.pointsInTalent(Talent.UNENCUMBERED_SPIRIT);
        if (hero.belongings.armor() != null) {
          if (hero.belongings.armor().tier_ <= 1 && points >= 3) {
            enGainMulti = Math.fround(enGainMulti + 1);
          } else if (hero.belongings.armor().tier_ <= 2 && points >= 2) {
            enGainMulti = Math.fround(enGainMulti + 0.75);
          } else if (hero.belongings.armor().tier_ <= 3 && points >= 1) {
            enGainMulti = Math.fround(enGainMulti + 0.5);
          }
        }
        if (hero.belongings.weapon() instanceof MeleeWeapon && (hero.buff($J.cls(RingOfForce$BrawlersStance)) == null || !hero.buff($J.cls(RingOfForce$BrawlersStance)).active)) {
          if ((hero.belongings.weapon()).tier_ <= 1 && points >= 3) {
            enGainMulti = Math.fround(enGainMulti + 1);
          } else if ((hero.belongings.weapon()).tier_ <= 2 && points >= 2) {
            enGainMulti = Math.fround(enGainMulti + 0.75);
          } else if ((hero.belongings.weapon()).tier_ <= 3 && points >= 1) {
            enGainMulti = Math.fround(enGainMulti + 0.5);
          }
        }
      }
    }
    energyGain = Math.fround(energyGain * enGainMulti);
    this.energy = Math.fround(this.energy + energyGain);
    if (this.target.buff($J.cls(MonkEnergy$MonkAbility$UnarmedAbilityTracker)) == null) {
      this.energy = Math.min(this.energy, Math.fround(this.energyCap()));
    }
    if (this.energy >= Math.fround(1) && this.cooldown_ === 0) {
      ActionIndicator.setAction(this);
    }
    BuffIndicator.refreshHero();
  }
  energyCap(): number {
    return Math.max(10, (5 + $J.idiv(Dungeon.hero.lvl, 2)) | 0);
  }
  abilityUsed(abil: MonkEnergy$MonkAbility): void {
    this.energy = Math.fround(this.energy - abil.energyCost());
    this.energy = Math.min(this.energy, Math.fround(this.energyCap()));
    if (this.target instanceof Hero && (this.target).hasTalent(Talent.COMBINED_ENERGY) && abil.energyCost() >= ((5 - (this.target).pointsInTalent(Talent.COMBINED_ENERGY)) | 0)) {
      let tracker = this.target.buff($J.cls(Talent$CombinedEnergyAbilityTracker));
      if (tracker == null || !tracker.wepAbilUsed) {
        Buff.prolong(this.target, $J.cls(Talent$CombinedEnergyAbilityTracker), 5).monkAbilused = true;
      } else {
        tracker.monkAbilused = true;
        this.processCombinedEnergy(tracker);
      }
    }
    if (this.cooldown_ > 0 || this.energy < Math.fround(1)) {
      ActionIndicator.clearAction$Action(this);
    } else {
      ActionIndicator.refresh();
    }
    BuffIndicator.refreshHero();
  }
  abilitiesEmpowered(hero: Hero): boolean {
    return Math.fround(this.energy / this.energyCap()) >= Math.fround(Math.fround(1.2) - Math.fround(Math.fround(0.2) * hero.pointsInTalent(Talent.MONASTIC_VIGOR)));
  }
  processCombinedEnergy(tracker: Talent$CombinedEnergyAbilityTracker): void {
    this.energy = Math.min(Math.fround(this.energy + 1), Math.fround(this.energyCap()));
    tracker.detach();
    if (this.energy >= Math.fround(1)) {
      ActionIndicator.setAction(this);
    }
    BuffIndicator.refreshHero();
  }
  actionName(): string {
    return Messages.get$Object$String$ObjectArr(this, 'action', []);
  }
  actionIcon(): number {
    return HeroIcon.MONK_ABILITIES;
  }
  secondaryVisual(): Visual {
    let txt = new BitmapText()._BitmapText$Font(PixelScene.pixelFont);
    txt.text$String(String($J.d2i(this.energy)));
    txt.hardlight$int(CharSprite.POSITIVE);
    txt.measure();
    return txt;
  }
  indicatorColor(): number {
    if (this.abilitiesEmpowered(Dungeon.hero)) {
      return 11202082;
    } else {
      return 10520640;
    }
  }
  doAction(): void {
    GameScene.show(new WndMonkAbilities()._WndMonkAbilities(this));
  }
  static $clinit() {
    MonkEnergy.ENERGY = 'energy';
    MonkEnergy.COOLDOWN = 'cooldown';
  }
}

export class MonkEnergy$MonkAbility extends JObject {
  static abilities: MonkEnergy$MonkAbility[] = null;
  _MonkEnergy$MonkAbility(): this {
    return this;
  }
  name(): string {
    return Messages.get$Object$String$ObjectArr(this, 'name', []);
  }
  desc(): string {
    if (Buff.affect$Char$Class(Dungeon.hero, $J.cls(MonkEnergy)).abilitiesEmpowered(Dungeon.hero)) {
      return Messages.get$Object$String$ObjectArr(this, 'empower_desc', []);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'desc', []);
    }
  }
  usable(buff: MonkEnergy): boolean {
    return buff.energy >= Math.fround(this.energyCost());
  }
  targetingPrompt(): string {
    return null;
  }
  static $clinit() {
    MonkEnergy$MonkAbility.abilities = [new MonkEnergy$MonkAbility$Flurry()._MonkEnergy$MonkAbility$Flurry(), new MonkEnergy$MonkAbility$Focus()._MonkEnergy$MonkAbility$Focus(), new MonkEnergy$MonkAbility$Dash()._MonkEnergy$MonkAbility$Dash(), new MonkEnergy$MonkAbility$DragonKick()._MonkEnergy$MonkAbility$DragonKick(), new MonkEnergy$MonkAbility$Meditate()._MonkEnergy$MonkAbility$Meditate()];
  }
}

export class MonkEnergy$MonkAbility$UnarmedAbilityTracker extends FlavourBuff {
  _MonkEnergy$MonkAbility$UnarmedAbilityTracker(): this {
    this._FlavourBuff();
    return this;
  }
}

export class MonkEnergy$MonkAbility$FlurryEmpowerTracker extends FlavourBuff {
  _MonkEnergy$MonkAbility$FlurryEmpowerTracker(): this {
    this._FlavourBuff();
    return this;
  }
}

export class MonkEnergy$MonkAbility$FlurryCooldownTracker extends FlavourBuff {
  _MonkEnergy$MonkAbility$FlurryCooldownTracker(): this {
    this._FlavourBuff();
    return this;
  }
}

export class MonkEnergy$MonkAbility$Flurry extends MonkEnergy$MonkAbility {
  _MonkEnergy$MonkAbility$Flurry(): this {
    this._MonkEnergy$MonkAbility();
    return this;
  }
  energyCost(): number {
    return 1;
  }
  usable(buff: MonkEnergy): boolean {
    return super.usable(buff) && buff.target.buff($J.cls(MonkEnergy$MonkAbility$FlurryCooldownTracker)) == null;
  }
  desc(): string {
    if (Buff.affect$Char$Class(Dungeon.hero, $J.cls(MonkEnergy)).abilitiesEmpowered(Dungeon.hero)) {
      return Messages.get$Object$String$ObjectArr(this, 'empower_desc', [2, $J.roundf(Math.fround(1.5 * ((Dungeon.hero.STR() - 8) | 0)))]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'desc', [2, $J.roundf(Math.fround(1.5 * ((Dungeon.hero.STR() - 8) | 0)))]);
    }
  }
  targetingPrompt(): string {
    return Messages.get$Class$String$ObjectArr($J.cls(MeleeWeapon), 'prompt', []);
  }
  doAbility(hero: Hero, target: number): void {
    if (target == null || target === -1) {
      return;
    }
    let enemy = Actor.findChar(target);
    if (enemy == null || enemy === hero || hero.isCharmedBy(enemy) || !Dungeon.level.heroFOV[target]) {
      GLog.w(Messages.get$Class$String$ObjectArr($J.cls(MeleeWeapon), 'ability_no_target', []), []);
      return;
    }
    if (Buff.affect$Char$Class(hero, $J.cls(MonkEnergy)).abilitiesEmpowered(hero)) {
      Buff.affect$Char$Class$float(hero, $J.cls(MonkEnergy$MonkAbility$FlurryEmpowerTracker), 0);
    }
    let tracker = Buff.affect$Char$Class(hero, $J.cls(MonkEnergy$MonkAbility$UnarmedAbilityTracker));
    if (!hero.canAttack(enemy)) {
      GLog.w(Messages.get$Class$String$ObjectArr($J.cls(MeleeWeapon), 'ability_target_range', []), []);
      tracker.detach();
      if (hero.buff($J.cls(MonkEnergy$MonkAbility$FlurryEmpowerTracker)) != null) {
        hero.buff($J.cls(MonkEnergy$MonkAbility$FlurryEmpowerTracker)).detach();
      }
      return;
    }
    hero.sprite_.attack$int$Callback(enemy.pos, new (MonkEnergy$MonkAbility$Flurry$1())().$o(this).$c(enemy, hero, tracker));
  }
}

export class MonkEnergy$MonkAbility$Focus extends MonkEnergy$MonkAbility {
  _MonkEnergy$MonkAbility$Focus(): this {
    this._MonkEnergy$MonkAbility();
    return this;
  }
  energyCost(): number {
    return 2;
  }
  usable(buff: MonkEnergy): boolean {
    return super.usable(buff) && buff.target.buff($J.cls(MonkEnergy$MonkAbility$Focus$FocusBuff)) == null;
  }
  doAbility(hero: Hero, target: number): void {
    Buff.affect$Char$Class(hero, $J.cls(MonkEnergy$MonkAbility$Focus$FocusBuff));
    if (Buff.affect$Char$Class(hero, $J.cls(MonkEnergy)).abilitiesEmpowered(hero)) {
      hero.next();
    } else {
      hero.spendAndNext(1);
    }
    Buff.affect$Char$Class(hero, $J.cls(MonkEnergy)).abilityUsed(this);
  }
}

export class MonkEnergy$MonkAbility$Focus$FocusBuff extends Buff {
  _MonkEnergy$MonkAbility$Focus$FocusBuff(): this {
    this._Buff();
    this.type_ = Buff$buffType.POSITIVE;
    this.announced = true;
    return this;
  }
  icon(): number {
    return BuffIndicator.MIND_VISION;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(0.25, 1.5, 1);
  }
}

export class MonkEnergy$MonkAbility$Dash extends MonkEnergy$MonkAbility {
  _MonkEnergy$MonkAbility$Dash(): this {
    this._MonkEnergy$MonkAbility();
    return this;
  }
  energyCost(): number {
    return 3;
  }
  targetingPrompt(): string {
    return Messages.get$Object$String$ObjectArr(this, 'prompt', []);
  }
  doAbility(hero: Hero, target: number): void {
    if (target == null || target === -1) {
      return;
    }
    let range = 4;
    if (Buff.affect$Char$Class(hero, $J.cls(MonkEnergy)).abilitiesEmpowered(hero)) {
      range = (range + 4) | 0;
    }
    if (Dungeon.hero.rooted) {
      PixelScene.shake(1, 1);
      GLog.w(Messages.get$Class$String$ObjectArr($J.cls(MeleeWeapon), 'ability_target_range', []), []);
      return;
    }
    if (Dungeon.level.distance(hero.pos, target) > range) {
      GLog.w(Messages.get$Class$String$ObjectArr($J.cls(MeleeWeapon), 'ability_target_range', []), []);
      return;
    }
    if (Actor.findChar(target) != null) {
      GLog.w(Messages.get$Class$String$ObjectArr($J.cls(MeleeWeapon), 'ability_occupied', []), []);
      return;
    }
    let dash = new Ballistica()._Ballistica(hero.pos, target, Ballistica.PROJECTILE);
    if (!$J.equals(dash.collisionPos, target) || (Dungeon.level.solid[target] && !Dungeon.level.passable[target])) {
      GLog.w(Messages.get$Class$String$ObjectArr($J.cls(MeleeWeapon), 'ability_target_range', []), []);
      return;
    }
    hero.busy();
    Sample.INSTANCE.play$Object(Assets$Sounds.MISS);
    hero.sprite_.emitter().start(Speck.factory$int(Speck.JET), Math.fround(0.01), $J.roundf(Math.fround(4 + Math.fround(2 * Dungeon.level.trueDistance(hero.pos, target)))));
    hero.sprite_.jump$int$int$float$float$Callback(hero.pos, target, 0, Math.fround(0.1), new (MonkEnergy$MonkAbility$Dash$1())().$o(this).$c(hero, target));
    Buff.affect$Char$Class(hero, $J.cls(MonkEnergy)).abilityUsed(this);
  }
}

export class MonkEnergy$MonkAbility$DragonKick extends MonkEnergy$MonkAbility {
  _MonkEnergy$MonkAbility$DragonKick(): this {
    this._MonkEnergy$MonkAbility();
    return this;
  }
  energyCost(): number {
    return 4;
  }
  desc(): string {
    if (Buff.affect$Char$Class(Dungeon.hero, $J.cls(MonkEnergy)).abilitiesEmpowered(Dungeon.hero)) {
      return Messages.get$Object$String$ObjectArr(this, 'empower_desc', [9, Math.imul(9, ((Dungeon.hero.STR() - 8) | 0))]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'desc', [6, Math.imul(6, ((Dungeon.hero.STR() - 8) | 0))]);
    }
  }
  targetingPrompt(): string {
    return Messages.get$Class$String$ObjectArr($J.cls(MeleeWeapon), 'prompt', []);
  }
  doAbility(hero: Hero, target: number): void {
    if (target == null || target === -1) {
      return;
    }
    let enemy = Actor.findChar(target);
    if (enemy == null || enemy === hero || hero.isCharmedBy(enemy) || !Dungeon.level.heroFOV[target]) {
      GLog.w(Messages.get$Class$String$ObjectArr($J.cls(MeleeWeapon), 'ability_no_target', []), []);
      return;
    }
    let tracker = Buff.affect$Char$Class(hero, $J.cls(MonkEnergy$MonkAbility$UnarmedAbilityTracker));
    if (!hero.canAttack(enemy)) {
      GLog.w(Messages.get$Class$String$ObjectArr($J.cls(MeleeWeapon), 'ability_target_range', []), []);
      tracker.detach();
      return;
    }
    hero.sprite_.attack$int$Callback(enemy.pos, new (MonkEnergy$MonkAbility$DragonKick$1())().$o(this).$c(enemy, hero, tracker));
  }
}

export class MonkEnergy$MonkAbility$Meditate extends MonkEnergy$MonkAbility {
  _MonkEnergy$MonkAbility$Meditate(): this {
    this._MonkEnergy$MonkAbility();
    return this;
  }
  energyCost(): number {
    return 5;
  }
  doAbility(hero: Hero, target: number): void {
    hero.sprite_.operate$int(hero.pos);
    GameScene.flash$int$boolean(-2013265920, false);
    Sample.INSTANCE.play$Object(Assets$Sounds.SCAN);
    for (const $it1 = hero.buffs$().iterator(); $it1.hasNext(); ) {
      let b = $it1.next();
      if (b.type_ === Buff$buffType.NEGATIVE && !(b instanceof AllyBuff) && !(b instanceof LostInventory)) {
        b.detach();
      }
    }
    for (let i = 0; i < 5; i++) {
      hero.spendConstant(Actor.TICK);
    }
    if (Buff.affect$Char$Class(hero, $J.cls(MonkEnergy)).abilitiesEmpowered(hero)) {
      let toHeal = $J.roundf(Math.fround(((hero.HT - hero.HP) | 0) / 5));
      if (toHeal > 0) {
        Buff.affect$Char$Class(hero, $J.cls(Healing)).setHeal$int$float$int(toHeal, 0, 1);
      }
      Buff.affect$Char$Class$float(hero, $J.cls(MonkEnergy$MonkAbility$Meditate$MeditateResistance), hero.cooldown());
    }
    Actor.addDelayed(new (MonkEnergy$MonkAbility$Meditate$1())().$o(this).$c(hero)._Actor().$init_anon(), Math.fround(hero.cooldown() - 1));
    hero.next();
    hero.busy();
    Buff.affect$Char$Class(hero, $J.cls(MonkEnergy)).abilityUsed(this);
  }
}

export class MonkEnergy$MonkAbility$Meditate$MeditateResistance extends FlavourBuff {
  _MonkEnergy$MonkAbility$Meditate$MeditateResistance(): this {
    this._FlavourBuff();
    this.actPriority = (Actor.HERO_PRIO + 1) | 0;
    return this;
  }
}

let $MonkEnergy$MonkAbility$Flurry$1$1: any = null;
/** An anonymous class (MonkEnergy.java:388). */
function MonkEnergy$MonkAbility$Flurry$1$1(): any {
  return $MonkEnergy$MonkAbility$Flurry$1$1 ??= $J.local(class extends JObject {
    call(): void {
      this.$cv_hero.attack$Char$float$float$float(this.$cv_enemy, 1.5, 0, Math.fround(Char.INFINITE_ACCURACY));
      Invisibility.dispel$();
      this.$cv_hero.next();
      this.$cv_tracker.detach();
      Buff.affect$Char$Class(this.$cv_hero, $J.cls(MonkEnergy)).abilityUsed(this.$outer.$outer);
      if (this.$cv_hero.buff($J.cls(MonkEnergy$MonkAbility$FlurryEmpowerTracker)) != null) {
        this.$cv_hero.buff($J.cls(MonkEnergy$MonkAbility$FlurryEmpowerTracker)).detach();
      }
      Buff.affect$Char$Class$float(this.$cv_hero, $J.cls(MonkEnergy$MonkAbility$FlurryCooldownTracker), 0);
    }
    $c($hero, $enemy, $tracker): this {
      this.$cv_hero = $hero; this.$cv_enemy = $enemy; this.$cv_tracker = $tracker;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MonkEnergy$MonkAbility$Flurry$1$1', ['com.watabou.utils.Callback']);
}

let $MonkEnergy$MonkAbility$Flurry$1: any = null;
/** An anonymous class (MonkEnergy.java:381). */
function MonkEnergy$MonkAbility$Flurry$1(): any {
  return $MonkEnergy$MonkAbility$Flurry$1 ??= $J.local(class extends JObject {
    call(): void {
      AttackIndicator.target(this.$cv_enemy);
      this.$cv_hero.attack$Char$float$float$float(this.$cv_enemy, 1.5, 0, Math.fround(Char.INFINITE_ACCURACY));
      if (this.$cv_enemy.isAlive()) {
        this.$cv_hero.sprite_.attack$int$Callback(this.$cv_enemy.pos, new (MonkEnergy$MonkAbility$Flurry$1$1())().$o(this).$c(this.$cv_hero, this.$cv_enemy, this.$cv_tracker));
      } else {
        Invisibility.dispel$();
        this.$cv_hero.next();
        this.$cv_tracker.detach();
        Buff.affect$Char$Class(this.$cv_hero, $J.cls(MonkEnergy)).abilityUsed(this.$outer);
        if (this.$cv_hero.buff($J.cls(MonkEnergy$MonkAbility$FlurryEmpowerTracker)) != null) {
          this.$cv_hero.buff($J.cls(MonkEnergy$MonkAbility$FlurryEmpowerTracker)).detach();
        }
        Buff.affect$Char$Class$float(this.$cv_hero, $J.cls(MonkEnergy$MonkAbility$FlurryCooldownTracker), 0);
      }
    }
    $c($enemy, $hero, $tracker): this {
      this.$cv_enemy = $enemy; this.$cv_hero = $hero; this.$cv_tracker = $tracker;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MonkEnergy$MonkAbility$Flurry$1', ['com.watabou.utils.Callback']);
}

let $MonkEnergy$MonkAbility$Dash$1: any = null;
/** An anonymous class (MonkEnergy.java:512). */
function MonkEnergy$MonkAbility$Dash$1(): any {
  return $MonkEnergy$MonkAbility$Dash$1 ??= $J.local(class extends JObject {
    call(): void {
      if (Dungeon.level.map_[this.$cv_hero.pos] === Terrain.OPEN_DOOR) {
        Door.leave(this.$cv_hero.pos);
      }
      this.$cv_hero.pos = this.$cv_target;
      Dungeon.level.occupyCell(this.$cv_hero);
      this.$cv_hero.next();
    }
    $c($hero, $target): this {
      this.$cv_hero = $hero; this.$cv_target = $target;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MonkEnergy$MonkAbility$Dash$1', ['com.watabou.utils.Callback']);
}

let $MonkEnergy$MonkAbility$DragonKick$1: any = null;
/** An anonymous class (MonkEnergy.java:570). */
function MonkEnergy$MonkAbility$DragonKick$1(): any {
  return $MonkEnergy$MonkAbility$DragonKick$1 ??= $J.local(class extends JObject {
    call(): void {
      AttackIndicator.target(this.$cv_enemy);
      let empowered = Buff.affect$Char$Class(this.$cv_hero, $J.cls(MonkEnergy)).abilitiesEmpowered(this.$cv_hero);
      let oldPos = this.$cv_enemy.pos;
      if (this.$cv_hero.attack$Char$float$float$float(this.$cv_enemy, empowered ? 9 : 6, 0, Math.fround(Char.INFINITE_ACCURACY))) {
        Sample.INSTANCE.play$Object(Assets$Sounds.HIT_STRONG);
      }
      if (oldPos === this.$cv_enemy.pos) {
        let trajectory = new Ballistica()._Ballistica(this.$cv_hero.pos, this.$cv_enemy.pos, Ballistica.STOP_TARGET);
        trajectory = new Ballistica()._Ballistica(trajectory.collisionPos, trajectory.path.get((trajectory.path.size() - 1) | 0), Ballistica.PROJECTILE);
        WandOfBlastWave.throwChar(this.$cv_enemy, trajectory, 6, true, false, this.$cv_hero);
        if (trajectory.dist > 0 && this.$cv_enemy.isActive()) {
          Buff.affect$Char$Class$float(this.$cv_enemy, $J.cls(Paralysis), Math.fround(Math.min(6, trajectory.dist)));
        }
      }
      Invisibility.dispel$();
      this.$cv_hero.spendAndNext(this.$cv_hero.attackDelay());
      this.$cv_tracker.detach();
      Buff.affect$Char$Class(this.$cv_hero, $J.cls(MonkEnergy)).abilityUsed(this.$outer);
      if (empowered) {
        for (const $it0 = Actor.chars().iterator(); $it0.hasNext(); ) {
          let ch = $it0.next();
          if (ch !== this.$cv_enemy && ch.alignment === Char$Alignment.ENEMY && Dungeon.level.adjacent(ch.pos, this.$cv_hero.pos)) {
            let trajectory = new Ballistica()._Ballistica(this.$cv_hero.pos, ch.pos, Ballistica.STOP_TARGET);
            trajectory = new Ballistica()._Ballistica(trajectory.collisionPos, trajectory.path.get((trajectory.path.size() - 1) | 0), Ballistica.PROJECTILE);
            WandOfBlastWave.throwChar(ch, trajectory, 6, true, false, this.$cv_hero);
            if (trajectory.dist > 0 && this.$cv_enemy.isActive()) {
              Buff.affect$Char$Class$float(ch, $J.cls(Paralysis), Math.fround(Math.min(6, trajectory.dist)));
            }
          }
        }
      }
    }
    $c($enemy, $hero, $tracker): this {
      this.$cv_enemy = $enemy; this.$cv_hero = $hero; this.$cv_tracker = $tracker;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MonkEnergy$MonkAbility$DragonKick$1', ['com.watabou.utils.Callback']);
}

let $MonkEnergy$MonkAbility$Meditate$1: any = null;
/** An anonymous class (MonkEnergy.java:655). */
function MonkEnergy$MonkAbility$Meditate$1(): any {
  return $MonkEnergy$MonkAbility$Meditate$1 ??= $J.local(class extends Actor {
    $init_anon() {
      this.actPriority = Actor.VFX_PRIO;
      return this;
    }
    act(): boolean {
      Buff.affect$Char$Class$float(this.$cv_hero, $J.cls(Recharging), 8);
      Buff.affect$Char$Class(this.$cv_hero, $J.cls(ArtifactRecharge)).extend(8).ignoreHornOfPlenty = false;
      Actor.remove(this);
      return true;
    }
    $c($hero): this {
      this.$cv_hero = $hero;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MonkEnergy$MonkAbility$Meditate$1', []);
}

$J.define(MonkEnergy, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MonkEnergy', { kind: 'class', ifaces: ['com.shatteredpixel.shatteredpixeldungeon.ui.ActionIndicator$Action'], sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_MonkEnergy' }, clinit: true, lazy: ['ENERGY', 'COOLDOWN'] });
$J.define(MonkEnergy$MonkAbility, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MonkEnergy$MonkAbility', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_MonkEnergy$MonkAbility' }, clinit: true, lazy: ['abilities'] });
$J.define(MonkEnergy$MonkAbility$UnarmedAbilityTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MonkEnergy$MonkAbility$UnarmedAbilityTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_MonkEnergy$MonkAbility$UnarmedAbilityTracker' } });
$J.define(MonkEnergy$MonkAbility$FlurryEmpowerTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MonkEnergy$MonkAbility$FlurryEmpowerTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_MonkEnergy$MonkAbility$FlurryEmpowerTracker' } });
$J.define(MonkEnergy$MonkAbility$FlurryCooldownTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MonkEnergy$MonkAbility$FlurryCooldownTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_MonkEnergy$MonkAbility$FlurryCooldownTracker' } });
$J.define(MonkEnergy$MonkAbility$Flurry, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MonkEnergy$MonkAbility$Flurry', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MonkEnergy$MonkAbility', ctors: { '': '_MonkEnergy$MonkAbility$Flurry' } });
$J.define(MonkEnergy$MonkAbility$Focus, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MonkEnergy$MonkAbility$Focus', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MonkEnergy$MonkAbility', ctors: { '': '_MonkEnergy$MonkAbility$Focus' } });
$J.define(MonkEnergy$MonkAbility$Focus$FocusBuff, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MonkEnergy$MonkAbility$Focus$FocusBuff', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_MonkEnergy$MonkAbility$Focus$FocusBuff' } });
$J.define(MonkEnergy$MonkAbility$Dash, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MonkEnergy$MonkAbility$Dash', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MonkEnergy$MonkAbility', ctors: { '': '_MonkEnergy$MonkAbility$Dash' } });
$J.define(MonkEnergy$MonkAbility$DragonKick, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MonkEnergy$MonkAbility$DragonKick', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MonkEnergy$MonkAbility', ctors: { '': '_MonkEnergy$MonkAbility$DragonKick' } });
$J.define(MonkEnergy$MonkAbility$Meditate, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MonkEnergy$MonkAbility$Meditate', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MonkEnergy$MonkAbility', ctors: { '': '_MonkEnergy$MonkAbility$Meditate' } });
$J.define(MonkEnergy$MonkAbility$Meditate$MeditateResistance, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MonkEnergy$MonkAbility$Meditate$MeditateResistance', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_MonkEnergy$MonkAbility$Meditate$MeditateResistance' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  AllyBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AllyBuff');
  ArtifactRecharge = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ArtifactRecharge');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Healing = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Healing');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  LostInventory = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.LostInventory');
  Paralysis = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Paralysis');
  Recharging = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Recharging');
  Regeneration = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Regeneration');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Talent$CombinedEnergyAbilityTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$CombinedEnergyAbilityTracker');
  Ghoul = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Ghoul');
  RipperDemon = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.RipperDemon');
  Wraith = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Wraith');
  YogDzewa$Larva = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogDzewa$Larva');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  RingOfForce$BrawlersStance = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfForce$BrawlersStance');
  WandOfBlastWave = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfBlastWave');
  MeleeWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Door = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.Door');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  ActionIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ActionIndicator');
  AttackIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.AttackIndicator');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndMonkAbilities = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndMonkAbilities');
  BitmapText = $J.load('com.watabou.noosa.BitmapText');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  GameMath = $J.load('com.watabou.utils.GameMath');
});
