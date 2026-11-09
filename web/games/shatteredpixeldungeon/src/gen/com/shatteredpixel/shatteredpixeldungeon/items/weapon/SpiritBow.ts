// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/SpiritBow.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, JObject } from '../../../../../../jre/index.ts';
import { Weapon } from './Weapon.ts';
import { MissileWeapon } from './missiles/MissileWeapon.ts';

let Assets$Sounds, Dungeon, Actor, Buff, RevealedArea, Hero, Talent, Talent$LethalMomentumTracker, Talent$SeerShotCooldown, NaturesPower$naturesPowerTracker, Splash, LeafParticle, EquipableItem, Item, RingOfSharpshooting, Weapon$Augment, Messages, Blindweed, Firebloom, Icecap, Sorrowmoss, Stormvine, CellSelector$Listener, GameScene, ItemSpriteSheet, MissileSprite, QuickSlotButton, Sample, Emitter, Random, Reflection;

export class SpiritBow extends Weapon {
  static readonly AC_SHOOT: string = 'SHOOT';
  sniperSpecial: boolean = false;
  sniperSpecialBonusDamage: number = 0;
  static harmfulPlants: JClass[] = null;
  targetPos: number = 0;
  shooter: CellSelector$Listener = null;
  _SpiritBow(): this {
    this._Weapon();
    this.image_ = ItemSpriteSheet.SPIRIT_BOW;
    this.defaultAction_ = SpiritBow.AC_SHOOT;
    this.usesTargeting_ = true;
    this.unique = true;
    this.bones = false;
    this.sniperSpecial = false;
    this.sniperSpecialBonusDamage = 0;
    this.shooter = new (SpiritBow$2())().$o(this)._CellSelector$Listener();
    return this;
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    actions.remove(EquipableItem.AC_EQUIP);
    actions.add(SpiritBow.AC_SHOOT);
    return actions;
  }
  execute$Hero$String(hero: Hero, action: string): void {
    super.execute$Hero$String(hero, action);
    if ($J.equals(action, SpiritBow.AC_SHOOT)) {
      Item.curUser = hero;
      Item.curItem = this;
      GameScene.selectCell(this.shooter);
    }
  }
  proc(attacker: Char, defender: Char, damage: number): number {
    if (attacker.buff($J.cls(NaturesPower$naturesPowerTracker)) != null && !this.sniperSpecial) {
      Actor.add$Actor(new (SpiritBow$1())().$o(this).$c(attacker, defender)._Actor().$init_anon());
    }
    return super.proc(attacker, defender, damage);
  }
  info(): string {
    let info = super.info();
    info += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(SpiritBow), 'stats', [$J.roundf(Math.fround(this.augment.damageFactor$int(this.min$()))), $J.roundf(Math.fround(this.augment.damageFactor$int(this.max$()))), this.STRReq$()]);
    if (this.STRReq$() > Dungeon.hero.STR()) {
      info += ' ' + Messages.get$Class$String$ObjectArr($J.cls(Weapon), 'too_heavy', []);
    } else if (Dungeon.hero.STR() > this.STRReq$()) {
      info += ' ' + (Messages.get$Class$String$ObjectArr($J.cls(Weapon), 'excess_str', [(Dungeon.hero.STR() - this.STRReq$()) | 0]));
    }
    switch (this.augment) {
      case Weapon$Augment.SPEED:
        info += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(Weapon), 'faster', []);
        break;
      case Weapon$Augment.DAMAGE:
        info += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(Weapon), 'stronger', []);
        break;
      case Weapon$Augment.NONE:
    }
    if (this.enchantment != null && (this.cursedKnown || !this.enchantment.curse())) {
      info += '\n\n' + Messages.capitalize(Messages.get$Class$String$ObjectArr($J.cls(Weapon), 'enchanted', [this.enchantment.name$()]));
      if (this.enchantHardened) {
        info += ' ' + Messages.get$Class$String$ObjectArr($J.cls(Weapon), 'enchant_hardened', []);
      }
      info += ' ' + this.enchantment.desc();
    } else if (this.enchantHardened) {
      info += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(Weapon), 'hardened_no_enchant', []);
    }
    if (this.cursed && this.isEquipped(Dungeon.hero)) {
      info += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(Weapon), 'cursed_worn', []);
    } else if (this.cursedKnown && this.cursed) {
      info += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(Weapon), 'cursed', []);
    } else if (!this.isIdentified() && this.cursedKnown) {
      info += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(Weapon), 'not_cursed', []);
    }
    info += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(MissileWeapon), 'distance', []);
    return info;
  }
  STRReq$int(lvl: number): number {
    return Weapon.STRReq(1, lvl);
  }
  min$int(lvl: number): number {
    let dmg = (1 + $J.idiv(Dungeon.hero.lvl, 5) + RingOfSharpshooting.levelDamageBonus(Dungeon.hero) + (this.curseInfusionBonus ? (1 + $J.idiv(Dungeon.hero.lvl, 30)) | 0 : 0)) | 0;
    return Math.max(0, dmg);
  }
  max$int(lvl: number): number {
    let dmg = (6 + $J.d2i((Math.fround(Dungeon.hero.lvl / 2.5))) + Math.imul(2, RingOfSharpshooting.levelDamageBonus(Dungeon.hero)) + (this.curseInfusionBonus ? (2 + $J.idiv(Dungeon.hero.lvl, 15)) | 0 : 0)) | 0;
    return Math.max(0, dmg);
  }
  targetingPos(user: Hero, dst: number): number {
    return this.knockArrow().targetingPos(user, dst);
  }
  damageRoll(owner: Char): number {
    let damage = this.augment.damageFactor$int(super.damageRoll(owner));
    if (owner instanceof Hero) {
      let exStr = ((owner).STR() - this.STRReq$()) | 0;
      if (exStr > 0) {
        damage = (damage + Hero.heroDamageIntRange(0, exStr)) | 0;
      }
    }
    if (this.sniperSpecial) {
      damage = $J.roundf(Math.fround(damage * (Math.fround(1 + this.sniperSpecialBonusDamage))));
      {
        let distance: number, multiplier: number;
        switch (this.augment) {
          case Weapon$Augment.NONE:
            damage = $J.roundf(Math.fround(damage * Math.fround(0.667)));
            break;
          case Weapon$Augment.SPEED:
            damage = $J.roundf(Math.fround(damage * 0.5));
            break;
          case Weapon$Augment.DAMAGE:
            distance = (Dungeon.level.distance(owner.pos, this.targetPos) - 1) | 0;
            multiplier = Math.min(3, Math.fround(Math.fround(1.2) * Math.fround($J.pow(1.125, distance))));
            damage = $J.roundf(Math.fround(damage * multiplier));
            break;
        }
      }
    }
    return damage;
  }
  baseDelay(owner: Char): number {
    if (this.sniperSpecial) {
      switch (this.augment) {
        case Weapon$Augment.NONE:
        default:
          return 0;
        case Weapon$Augment.SPEED:
          return 1;
        case Weapon$Augment.DAMAGE:
          return 2;
      }
    } else {
      return super.baseDelay(owner);
    }
  }
  speedMultiplier(owner: Char): number {
    let speed = super.speedMultiplier(owner);
    if (owner.buff($J.cls(NaturesPower$naturesPowerTracker)) != null) {
      speed = Math.fround(speed + (Math.fround(((8 + (owner).pointsInTalent(Talent.GROWING_POWER)) | 0) / 24)));
    }
    return speed;
  }
  level$(): number {
    let level = Dungeon.hero == null ? 0 : $J.idiv(Dungeon.hero.lvl, 5);
    if (this.curseInfusionBonus) {
      level = (level + (1 + $J.idiv(level, 6))) | 0;
    }
    return level;
  }
  buffedLvl(): number {
    return this.level$();
  }
  isUpgradable(): boolean {
    return false;
  }
  knockArrow(): SpiritBow$SpiritArrow {
    return new SpiritBow$SpiritArrow().$o(this)._SpiritBow$SpiritArrow();
  }
  static $clinit() {
    SpiritBow.harmfulPlants = [$J.cls(Blindweed), $J.cls(Firebloom), $J.cls(Icecap), $J.cls(Sorrowmoss), $J.cls(Stormvine)];
  }
}

export class SpiritBow$SpiritArrow extends MissileWeapon {
  flurryCount: number = 0;
  flurryActor: Actor = null;
  _SpiritBow$SpiritArrow(): this {
    this._MissileWeapon();
    this.image_ = ItemSpriteSheet.SPIRIT_ARROW;
    this.hitSound_ = Assets$Sounds.HIT_ARROW;
    this.setID = 0n;
    this.flurryCount = -1;
    this.flurryActor = null;
    return this;
  }
  actions(hero: Hero): ArrayList<string> {
    return new ArrayList();
  }
  defaultAction(): string {
    return null;
  }
  defaultQuantity(): number {
    return 1;
  }
  emitter(): Emitter {
    if (Dungeon.hero.buff($J.cls(NaturesPower$naturesPowerTracker)) != null && !this.$outer.sniperSpecial) {
      let e = new Emitter()._Emitter();
      e.pos$float$float(5, 5);
      e.fillTarget = false;
      e.pour(LeafParticle.GENERAL, Math.fround(0.01));
      return e;
    } else {
      return super.emitter();
    }
  }
  damageRoll(owner: Char): number {
    return this.$outer.damageRoll(owner);
  }
  hasEnchant(type$: JClass<Weapon$Enchantment>, owner: Char): boolean {
    return this.$outer.hasEnchant(type$, owner);
  }
  proc(attacker: Char, defender: Char, damage: number): number {
    return this.$outer.proc(attacker, defender, damage);
  }
  delayFactor(user: Char): number {
    return this.$outer.delayFactor(user);
  }
  accuracyFactor(owner: Char, target: Char): number {
    if (this.$outer.sniperSpecial && this.$outer.augment === Weapon$Augment.DAMAGE) {
      return Infinity;
    } else {
      return super.accuracyFactor(owner, target);
    }
  }
  STRReq$int(lvl: number): number {
    return this.$outer.STRReq$();
  }
  onThrow(cell: number): void {
    let enemy = Actor.findChar(cell);
    if (enemy == null || enemy === Item.curUser) {
      this.parent = null;
      Splash.at$int$int$int(cell, -862322689, 1);
    } else {
      if (!Item.curUser.shoot(enemy, this)) {
        Splash.at$int$int$int(cell, -862322689, 1);
      }
      if (this.$outer.sniperSpecial && this.$outer.augment !== Weapon$Augment.SPEED) {
        this.$outer.sniperSpecial = false;
      }
    }
  }
  split(amount: number): Item {
    return null;
  }
  throwSound(): void {
    Sample.INSTANCE.play$Object$float$float(Assets$Sounds.ATK_SPIRITBOW, 1, Random.Float$float$float(Math.fround(0.87), Math.fround(1.15)));
  }
  cast(user: Hero, dst: number): void {
    let cell = this.throwPos(user, dst);
    this.$outer.targetPos = cell;
    if (this.$outer.sniperSpecial && this.$outer.augment === Weapon$Augment.SPEED) {
      if (this.flurryCount === -1) {
        this.flurryCount = 3;
      }
      let enemy = Actor.findChar(cell);
      if (enemy == null) {
        if (user.buff($J.cls(Talent$LethalMomentumTracker)) != null) {
          user.buff($J.cls(Talent$LethalMomentumTracker)).detach();
          user.next();
        } else {
          user.spendAndNext(this.castDelay(user, cell));
        }
        this.$outer.sniperSpecial = false;
        this.flurryCount = -1;
        if (this.flurryActor != null) {
          this.flurryActor.next();
          this.flurryActor = null;
        }
        return;
      }
      QuickSlotButton.target(enemy);
      user.busy();
      this.throwSound();
      user.sprite_.zap$int(cell);
      (user.sprite_.parent.recycle($J.cls(MissileSprite))).reset$Visual$int$Item$Callback(user.sprite_, cell, this, new (SpiritBow$SpiritArrow$1())().$o(this).$c(enemy, user, cell));
    } else {
      if (user.hasTalent(Talent.SEER_SHOT) && user.buff($J.cls(Talent$SeerShotCooldown)) == null) {
        let shotPos = this.throwPos(user, dst);
        if (Actor.findChar(shotPos) == null) {
          let a = Buff.affect$Char$Class$float(user, $J.cls(RevealedArea), Math.fround(Math.imul(5, user.pointsInTalent(Talent.SEER_SHOT))));
          a.depth_ = Dungeon.depth;
          a.branch = Dungeon.branch;
          a.pos = shotPos;
          Buff.affect$Char$Class$float(user, $J.cls(Talent$SeerShotCooldown), 20);
        }
      }
      super.cast(user, dst);
    }
  }
}

let $SpiritBow$2: any = null;
/** An anonymous class (SpiritBow.java:493). */
function SpiritBow$2(): any {
  return $SpiritBow$2 ??= $J.local(class extends CellSelector$Listener {
    onSelect(target: number): void {
      if (target != null) {
        this.$outer.knockArrow().cast(Item.curUser, target);
      }
    }
    prompt(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(SpiritBow), 'prompt', []);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.SpiritBow$2', []);
}

let $SpiritBow$1: any = null;
/** An anonymous class (SpiritBow.java:106). */
function SpiritBow$1(): any {
  return $SpiritBow$1 ??= $J.local(class extends Actor {
    $init_anon() {
      this.actPriority = Actor.VFX_PRIO;
      return this;
    }
    act(): boolean {
      if (Random.Int$int(12) < (this.$cv_attacker).pointsInTalent(Talent.NATURES_WRATH)) {
        let plant = Reflection.newInstance(Random.element$ObjectArr(SpiritBow.harmfulPlants));
        plant.pos = this.$cv_defender.pos;
        plant.activate(this.$cv_defender.isAlive() ? this.$cv_defender : null);
      }
      if (!this.$cv_defender.isAlive()) {
        let tracker = this.$cv_attacker.buff($J.cls(NaturesPower$naturesPowerTracker));
        if (tracker != null) {
          tracker.extend((this.$cv_attacker).pointsInTalent(Talent.WILD_MOMENTUM));
        }
      }
      Actor.remove(this);
      return true;
    }
    $c($attacker, $defender): this {
      this.$cv_attacker = $attacker; this.$cv_defender = $defender;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.SpiritBow$1', []);
}

let $SpiritBow$SpiritArrow$1$1: any = null;
/** An anonymous class (SpiritBow.java:439). */
function SpiritBow$SpiritArrow$1$1(): any {
  return $SpiritBow$SpiritArrow$1$1 ??= $J.local(class extends Actor {
    $init_anon() {
      this.actPriority = (Actor.VFX_PRIO - 1) | 0;
      return this;
    }
    act(): boolean {
      this.$outer.$outer.flurryActor = this;
      let target = QuickSlotButton.autoAim$Char$Item(this.$cv_enemy, this.$outer.$outer);
      if (target === -1) {
        target = this.$cv_cell;
      }
      this.$outer.$outer.cast(this.$cv_user, target);
      Actor.remove(this);
      return false;
    }
    $c($enemy, $cell, $user): this {
      this.$cv_enemy = $enemy; this.$cv_cell = $cell; this.$cv_user = $user;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.SpiritBow$SpiritArrow$1$1', []);
}

let $SpiritBow$SpiritArrow$1: any = null;
/** An anonymous class (SpiritBow.java:429). */
function SpiritBow$SpiritArrow$1(): any {
  return $SpiritBow$SpiritArrow$1 ??= $J.local(class extends JObject {
    call(): void {
      if (this.$cv_enemy.isAlive()) {
        Item.curUser = this.$cv_user;
        this.$outer.onThrow(this.$cv_cell);
      }
      this.$outer.flurryCount--;
      if (this.$outer.flurryCount > 0) {
        Actor.add$Actor(new (SpiritBow$SpiritArrow$1$1())().$o(this).$c(this.$cv_enemy, this.$cv_cell, this.$cv_user)._Actor().$init_anon());
        Item.curUser.next();
      } else {
        if (this.$cv_user.buff($J.cls(Talent$LethalMomentumTracker)) != null) {
          this.$cv_user.buff($J.cls(Talent$LethalMomentumTracker)).detach();
          this.$cv_user.next();
        } else {
          this.$cv_user.spendAndNext(this.$outer.castDelay(this.$cv_user, this.$cv_cell));
        }
        this.$outer.$outer.sniperSpecial = false;
        this.$outer.flurryCount = -1;
      }
      if (this.$outer.flurryActor != null) {
        this.$outer.flurryActor.next();
        this.$outer.flurryActor = null;
      }
    }
    $c($enemy, $user, $cell): this {
      this.$cv_enemy = $enemy; this.$cv_user = $user; this.$cv_cell = $cell;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.SpiritBow$SpiritArrow$1', ['com.watabou.utils.Callback']);
}

$J.define(SpiritBow, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.SpiritBow', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon', ctors: { '': '_SpiritBow' }, meths: { 'level()': 'level$', 'max(int)': 'max$int', 'min(int)': 'min$int', 'STRReq(int)': 'STRReq$int', 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' }, clinit: true, lazy: ['harmfulPlants'] });
$J.define(SpiritBow$SpiritArrow, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.SpiritBow$SpiritArrow', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon', ctors: { '': '_SpiritBow$SpiritArrow' }, meths: { 'STRReq(int)': 'STRReq$int' }, inner: true });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  RevealedArea = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.RevealedArea');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Talent$LethalMomentumTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$LethalMomentumTracker');
  Talent$SeerShotCooldown = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$SeerShotCooldown');
  NaturesPower$naturesPowerTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.huntress.NaturesPower$naturesPowerTracker');
  Splash = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Splash');
  LeafParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.LeafParticle');
  EquipableItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.EquipableItem');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  RingOfSharpshooting = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfSharpshooting');
  Weapon$Augment = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Augment');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  Blindweed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Blindweed');
  Firebloom = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Firebloom');
  Icecap = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Icecap');
  Sorrowmoss = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Sorrowmoss');
  Stormvine = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Stormvine');
  CellSelector$Listener = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.CellSelector$Listener');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  MissileSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.MissileSprite');
  QuickSlotButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.QuickSlotButton');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Emitter = $J.load('com.watabou.noosa.particles.Emitter');
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
