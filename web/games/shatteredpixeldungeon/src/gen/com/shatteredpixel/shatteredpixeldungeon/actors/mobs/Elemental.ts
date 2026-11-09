// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Elemental.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Mob } from './Mob.ts';

let Assets$Sounds, Badges, Dungeon, Statistics, Actor, Char, Char$Alignment, Char$Property, Blob, Fire, Freezing, Blindness, Buff, Burning, Chill, Frost, Invisibility, CellEmitter, Lightning, Splash, ElmoParticle, PotionOfFrost, PotionOfLiquidFlame, Embers, ScrollOfRecharging, ScrollOfTransmutation, RatSkull, CursedWand, Shocking, Ballistica, Messages, GameScene, CharSprite, ElementalSprite$Chaos, ElementalSprite$Fire, ElementalSprite$Frost, ElementalSprite$NewbornFire, ElementalSprite$Shock, GLog, Game, Music, Sample, GameMath, PathFinder, Random;

export class Elemental extends Mob {
  summonedALly: boolean = false;
  rangedCooldown: number = 0;
  harmfulBuffs: ArrayList<JClass<Buff>> = null;
  static readonly COOLDOWN: string = 'cooldown';
  static readonly SUMMONED_ALLY: string = 'summoned_ally';
  _Elemental(): this {
    this._Mob();
    this.HP = this.HT = 60;
    this.defenseSkill_ = 20;
    this.EXP = 10;
    this.maxLvl = 20;
    this.flying = true;
    this.rangedCooldown = Random.NormalIntRange(3, 5);
    this.harmfulBuffs = new ArrayList();
    return this;
  }
  damageRoll(): number {
    if (!this.summonedALly) {
      return Random.NormalIntRange(20, 25);
    } else {
      let regionScale = Math.max(2, ((1 + $J.idiv(Dungeon.scalingDepth(), 5)) | 0));
      return Random.NormalIntRange(Math.imul(5, regionScale), (5 + Math.imul(5, regionScale)) | 0);
    }
  }
  attackSkill(target: Char): number {
    if (!this.summonedALly) {
      return 25;
    } else {
      let regionScale = Math.max(2, ((1 + $J.idiv(Dungeon.scalingDepth(), 5)) | 0));
      return (5 + Math.imul(5, regionScale)) | 0;
    }
  }
  setSummonedALly(): void {
    this.summonedALly = true;
    let regionScale = Math.max(2, ((1 + $J.idiv(Dungeon.scalingDepth(), 5)) | 0));
    this.defenseSkill_ = Math.imul(5, regionScale);
    this.HT = Math.imul(15, regionScale);
  }
  drRoll(): number {
    return (super.drRoll() + Random.NormalIntRange(0, 5)) | 0;
  }
  act(): boolean {
    if (this.state_ === this.HUNTING) {
      this.rangedCooldown--;
    }
    return super.act();
  }
  die(cause: any): void {
    this.flying = false;
    super.die(cause);
  }
  canAttack(enemy: Char): boolean {
    if (super.canAttack(enemy)) {
      return true;
    } else {
      return this.rangedCooldown < 0 && new Ballistica()._Ballistica(this.pos, enemy.pos, Ballistica.MAGIC_BOLT).collisionPos === enemy.pos;
    }
  }
  doAttack(enemy: Char): boolean {
    if (Dungeon.level.adjacent(this.pos, enemy.pos) || this.rangedCooldown > 0 || new Ballistica()._Ballistica(this.pos, enemy.pos, Ballistica.MAGIC_BOLT).collisionPos !== enemy.pos) {
      return super.doAttack(enemy);
    } else {
      if (this.sprite_ != null && (this.sprite_.visible_ || enemy.sprite_.visible_)) {
        this.sprite_.zap$int(enemy.pos);
        return false;
      } else {
        this.zap();
        return true;
      }
    }
  }
  attackProc(enemy: Char, damage: number): number {
    damage = super.attackProc(enemy, damage);
    this.meleeProc(enemy, damage);
    return damage;
  }
  zap(): void {
    this.spend(1);
    Invisibility.dispel$Char(this);
    let enemy = this.enemy;
    if (Char.hit$Char$Char$boolean(this, enemy, true)) {
      this.rangedProc(enemy);
    } else {
      enemy.sprite_.showStatus(CharSprite.NEUTRAL, enemy.defenseVerb(), []);
    }
    this.rangedCooldown = Random.NormalIntRange(3, 5);
  }
  onZapComplete(): void {
    this.zap();
    this.next();
  }
  add(buff: Buff): boolean {
    if (this.harmfulBuffs.contains(buff.getClass())) {
      this.damage(Random.NormalIntRange($J.idiv(this.HT, 2), $J.idiv(Math.imul(this.HT, 3), 5)), buff);
      return false;
    } else {
      return super.add(buff);
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(Elemental.COOLDOWN, this.rangedCooldown);
    bundle.put$String$boolean(Elemental.SUMMONED_ALLY, this.summonedALly);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    if (bundle.contains(Elemental.COOLDOWN)) {
      this.rangedCooldown = bundle.getInt(Elemental.COOLDOWN);
    }
    this.summonedALly = bundle.getBoolean(Elemental.SUMMONED_ALLY);
    if (this.summonedALly) {
      this.setSummonedALly();
    }
  }
  static random(): JClass<Elemental> {
    let altChance = Math.fround(Math.fround(1 / 50) * RatSkull.exoticChanceMultiplier$());
    if (Random.Float$() < altChance) {
      return $J.cls(Elemental$ChaosElemental);
    }
    let roll = Random.Float$();
    if (roll < Math.fround(0.4)) {
      return $J.cls(Elemental$FireElemental);
    } else if (roll < Math.fround(0.8)) {
      return $J.cls(Elemental$FrostElemental);
    } else {
      return $J.cls(Elemental$ShockElemental);
    }
  }
}

export class Elemental$FireElemental extends Elemental {
  _Elemental$FireElemental(): this {
    this._Elemental();
    this.spriteClass = $J.cls(ElementalSprite$Fire);
    this.loot = $J.cls(PotionOfLiquidFlame);
    this.lootChance_ = Math.fround(1 / 8);
    this.properties_.add(Char$Property.FIERY);
    this.harmfulBuffs.add($J.cls(Frost));
    this.harmfulBuffs.add($J.cls(Chill));
    return this;
  }
  meleeProc(enemy: Char, damage: number): void {
    if (Random.Int$int(2) === 0 && !Dungeon.level.water[enemy.pos]) {
      Buff.affect$Char$Class(enemy, $J.cls(Burning)).reignite$Char(enemy);
      if (enemy.sprite_.visible_) {
        Splash.at$PointF$int$int(enemy.sprite_.center$(), this.sprite_.blood(), 5);
      }
    }
  }
  rangedProc(enemy: Char): void {
    if (!Dungeon.level.water[enemy.pos]) {
      Buff.affect$Char$Class(enemy, $J.cls(Burning)).reignite$Char$float(enemy, 4);
    }
    if (enemy.sprite_.visible_) {
      Splash.at$PointF$int$int(enemy.sprite_.center$(), this.sprite_.blood(), 5);
    }
  }
}

export class Elemental$NewbornFireElemental extends Elemental$FireElemental {
  targetingPos_: number = 0;
  static readonly TARGETING_POS: string = 'targeting_pos';
  _Elemental$NewbornFireElemental(): this {
    this._Elemental$FireElemental();
    this.spriteClass = $J.cls(ElementalSprite$NewbornFire);
    this.defenseSkill_ = 12;
    this.properties_.add(Char$Property.MINIBOSS);
    this.targetingPos_ = -1;
    return this;
  }
  act(): boolean {
    if (this.targetingPos_ !== -1 && this.state_ === this.HUNTING) {
      this.targetingPos_ = (new Ballistica()._Ballistica(this.pos, this.targetingPos_, Ballistica.STOP_SOLID | Ballistica.STOP_TARGET)).collisionPos;
      if (this.sprite_ != null && (this.sprite_.visible_ || Dungeon.level.heroFOV[this.targetingPos_])) {
        this.sprite_.zap$int(this.targetingPos_);
        return false;
      } else {
        this.zap();
        return true;
      }
    } else {
      if (this.state_ !== this.HUNTING) {
        this.targetingPos_ = -1;
      }
      return super.act();
    }
  }
  canAttack(enemy: Char): boolean {
    if (super.canAttack(enemy)) {
      return true;
    } else {
      return this.rangedCooldown < 0 && (new Ballistica()._Ballistica(this.pos, enemy.pos, Ballistica.STOP_SOLID | Ballistica.STOP_TARGET)).collisionPos === enemy.pos;
    }
  }
  doAttack(enemy: Char): boolean {
    if (this.rangedCooldown > 0) {
      return super.doAttack(enemy);
    } else if ((new Ballistica()._Ballistica(this.pos, enemy.pos, Ballistica.STOP_SOLID | Ballistica.STOP_TARGET)).collisionPos === enemy.pos) {
      let candidates = new ArrayList();
      for (let i of PathFinder.NEIGHBOURS8) {
        let target = (enemy.pos + i) | 0;
        if (target !== this.pos && (new Ballistica()._Ballistica(this.pos, target, Ballistica.STOP_SOLID | Ballistica.STOP_TARGET)).collisionPos === target) {
          candidates.add(target);
        }
      }
      if (!candidates.isEmpty()) {
        this.targetingPos_ = Random.element$Collection(candidates);
        let delay = GameMath.gate(this.attackDelay(), Math.fround($J.d2i(Math.ceil(Dungeon.hero.cooldown()))), Math.fround(3 * this.attackDelay()));
        for (let i of PathFinder.NEIGHBOURS9) {
          if (!(Dungeon.level.solid[(this.targetingPos_ + i) | 0])) {
            GameScene.targetedCell$int$float((this.targetingPos_ + i) | 0, delay);
          }
        }
        GLog.n(Messages.get$Object$String$ObjectArr(this, 'charging', []), []);
        this.spend(delay);
        Dungeon.hero.interrupt();
        return true;
      } else {
        this.rangedCooldown = 1;
        return super.doAttack(enemy);
      }
    } else {
      if (this.sprite_ != null && (this.sprite_.visible_ || Dungeon.level.heroFOV[this.targetingPos_])) {
        this.sprite_.zap$int(this.targetingPos_);
        return false;
      } else {
        this.zap();
        return true;
      }
    }
  }
  zap(): void {
    if (this.targetingPos_ !== -1) {
      this.spend(1);
      Invisibility.dispel$Char(this);
      for (let i of PathFinder.NEIGHBOURS9) {
        if (!(Dungeon.level.solid[(this.targetingPos_ + i) | 0])) {
          (CellEmitter.get((this.targetingPos_ + i) | 0)).burst(ElmoParticle.FACTORY, 5);
          if (Dungeon.level.water[(this.targetingPos_ + i) | 0]) {
            GameScene.add$Blob(Blob.seed$int$int$Class((this.targetingPos_ + i) | 0, 2, $J.cls(Fire)));
          } else {
            GameScene.add$Blob(Blob.seed$int$int$Class((this.targetingPos_ + i) | 0, 8, $J.cls(Fire)));
          }
          let target = Actor.findChar((this.targetingPos_ + i) | 0);
          if (target != null && target !== this) {
            Buff.affect$Char$Class(target, $J.cls(Burning)).reignite$Char(target);
            if (target === Dungeon.hero) {
              Statistics.questScores[1] = (Statistics.questScores[1] - 200) | 0;
            }
          }
        }
      }
      Sample.INSTANCE.play$Object(Assets$Sounds.BURNING);
    }
    this.targetingPos_ = -1;
    this.rangedCooldown = Random.NormalIntRange(3, 5);
  }
  attackSkill(target: Char): number {
    if (!this.summonedALly) {
      return 15;
    } else {
      return super.attackSkill(target);
    }
  }
  damageRoll(): number {
    if (!this.summonedALly) {
      return Random.NormalIntRange(10, 12);
    } else {
      return super.damageRoll();
    }
  }
  meleeProc(enemy: Char, damage: number): void {
    if (this.summonedALly) {
      super.meleeProc(enemy, damage);
    }
  }
  die(cause: any): void {
    super.die(cause);
    if (this.alignment === Char$Alignment.ENEMY) {
      Dungeon.level.drop(new Embers()._Embers(), this.pos).sprite_.drop$();
      Statistics.questScores[1] = (Statistics.questScores[1] + 2000) | 0;
      Game.runOnRenderThread(new (Elemental$NewbornFireElemental$1())().$o(this));
    }
  }
  reset(): boolean {
    return !this.summonedALly;
  }
  description(): string {
    let desc = super.description();
    if (this.summonedALly) {
      desc += ' ' + Messages.get$Object$String$ObjectArr(this, 'desc_ally', []);
    } else {
      desc += ' ' + Messages.get$Object$String$ObjectArr(this, 'desc_boss', []);
    }
    return desc;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(Elemental$NewbornFireElemental.TARGETING_POS, this.targetingPos_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.targetingPos_ = bundle.getInt(Elemental$NewbornFireElemental.TARGETING_POS);
  }
}

export class Elemental$AllyNewBornElemental extends Elemental$NewbornFireElemental {
  _Elemental$AllyNewBornElemental(): this {
    this._Elemental$NewbornFireElemental();
    this.rangedCooldown = 2147483647;
    this.properties_.remove(Char$Property.MINIBOSS);
    return this;
  }
}

export class Elemental$FrostElemental extends Elemental {
  _Elemental$FrostElemental(): this {
    this._Elemental();
    this.spriteClass = $J.cls(ElementalSprite$Frost);
    this.loot = $J.cls(PotionOfFrost);
    this.lootChance_ = Math.fround(1 / 8);
    this.properties_.add(Char$Property.ICY);
    this.harmfulBuffs.add($J.cls(Burning));
    return this;
  }
  meleeProc(enemy: Char, damage: number): void {
    if (Random.Int$int(3) === 0 || Dungeon.level.water[enemy.pos]) {
      Freezing.freeze(enemy.pos);
      if (enemy.sprite_.visible_) {
        Splash.at$PointF$int$int(enemy.sprite_.center$(), this.sprite_.blood(), 5);
      }
    }
  }
  rangedProc(enemy: Char): void {
    Freezing.freeze(enemy.pos);
    if (enemy.sprite_.visible_) {
      Splash.at$PointF$int$int(enemy.sprite_.center$(), this.sprite_.blood(), 5);
    }
  }
}

export class Elemental$ShockElemental extends Elemental {
  _Elemental$ShockElemental(): this {
    this._Elemental();
    this.spriteClass = $J.cls(ElementalSprite$Shock);
    this.loot = $J.cls(ScrollOfRecharging);
    this.lootChance_ = Math.fround(1 / 4);
    this.properties_.add(Char$Property.ELECTRIC);
    return this;
  }
  meleeProc(enemy: Char, damage: number): void {
    let affected = new ArrayList();
    let arcs = new ArrayList();
    Shocking.arc(this, enemy, 2, affected, arcs);
    if (!Dungeon.level.water[enemy.pos]) {
      affected.remove(enemy);
    }
    for (const $it0 = affected.iterator(); $it0.hasNext(); ) {
      let ch = $it0.next();
      ch.damage($J.roundf(Math.fround(damage * Math.fround(0.4))), new Shocking()._Shocking());
      if (ch === Dungeon.hero && !ch.isAlive()) {
        Badges.validateDeathFromEnemyMagic();
        Dungeon.fail(this);
        GLog.n(Messages.capitalize(Messages.get$Class$String$ObjectArr($J.cls(Char), 'kill', [this.name()])), []);
      }
    }
    let visible = this.sprite_.visible_ || enemy.sprite_.visible_;
    for (const $it1 = affected.iterator(); $it1.hasNext(); ) {
      let ch = $it1.next();
      if (ch.sprite_.visible_) {
        visible = true;
      }
    }
    if (visible) {
      this.sprite_.parent.addToFront(new Lightning()._Lightning$List$Callback(arcs, null));
      Sample.INSTANCE.play$Object(Assets$Sounds.LIGHTNING);
    }
  }
  rangedProc(enemy: Char): void {
    Buff.affect$Char$Class$float(enemy, $J.cls(Blindness), Math.fround(Blindness.DURATION / 2));
    if (enemy === Dungeon.hero) {
      GameScene.flash$int(-2130706433);
    }
  }
}

export class Elemental$ChaosElemental extends Elemental {
  _Elemental$ChaosElemental(): this {
    this._Elemental();
    this.spriteClass = $J.cls(ElementalSprite$Chaos);
    this.loot = $J.cls(ScrollOfTransmutation);
    this.lootChance_ = 1;
    return this;
  }
  meleeProc(enemy: Char, damage: number): void {
    let aim = new Ballistica()._Ballistica(this.pos, enemy.pos, Ballistica.STOP_TARGET);
    CursedWand.randomValidEffect(null, this, aim, false).effect(null, this, aim, false);
  }
  zap(): void {
    this.spend(1);
    Invisibility.dispel$Char(this);
    let enemy = this.enemy;
    this.rangedProc(enemy);
    this.rangedCooldown = Random.NormalIntRange(3, 5);
  }
  onZapComplete(): void {
    this.zap();
  }
  rangedProc(enemy: Char): void {
    CursedWand.cursedZap(null, this, new Ballistica()._Ballistica(this.pos, enemy.pos, Ballistica.STOP_TARGET), new (Elemental$ChaosElemental$1())().$o(this));
  }
}

let $Elemental$NewbornFireElemental$1$1: any = null;
/** An anonymous class (Elemental.java:423). */
function Elemental$NewbornFireElemental$1$1(): any {
  return $Elemental$NewbornFireElemental$1$1 ??= $J.local(class extends JObject {
    call(): void {
      if (Dungeon.level != null) {
        Dungeon.level.playLevelMusic();
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Elemental$NewbornFireElemental$1$1', ['com.watabou.utils.Callback']);
}

let $Elemental$NewbornFireElemental$1: any = null;
/** An anonymous class (Elemental.java:420). */
function Elemental$NewbornFireElemental$1(): any {
  return $Elemental$NewbornFireElemental$1 ??= $J.local(class extends JObject {
    call(): void {
      Music.INSTANCE.fadeOut(1, new (Elemental$NewbornFireElemental$1$1())().$o(this));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Elemental$NewbornFireElemental$1', ['com.watabou.utils.Callback']);
}

let $Elemental$ChaosElemental$1: any = null;
/** An anonymous class (Elemental.java:595). */
function Elemental$ChaosElemental$1(): any {
  return $Elemental$ChaosElemental$1 ??= $J.local(class extends JObject {
    call(): void {
      this.$outer.next();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Elemental$ChaosElemental$1', ['com.watabou.utils.Callback']);
}

$J.define(Elemental, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Elemental', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_Elemental' } });
$J.define(Elemental$FireElemental, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Elemental$FireElemental', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Elemental', ctors: { '': '_Elemental$FireElemental' } });
$J.define(Elemental$NewbornFireElemental, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Elemental$NewbornFireElemental', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Elemental$FireElemental', ctors: { '': '_Elemental$NewbornFireElemental' } });
$J.define(Elemental$AllyNewBornElemental, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Elemental$AllyNewBornElemental', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Elemental$NewbornFireElemental', ctors: { '': '_Elemental$AllyNewBornElemental' } });
$J.define(Elemental$FrostElemental, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Elemental$FrostElemental', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Elemental', ctors: { '': '_Elemental$FrostElemental' } });
$J.define(Elemental$ShockElemental, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Elemental$ShockElemental', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Elemental', ctors: { '': '_Elemental$ShockElemental' } });
$J.define(Elemental$ChaosElemental, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Elemental$ChaosElemental', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Elemental', ctors: { '': '_Elemental$ChaosElemental' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Blob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob');
  Fire = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Fire');
  Freezing = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Freezing');
  Blindness = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Blindness');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Burning = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Burning');
  Chill = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Chill');
  Frost = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Frost');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Lightning = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Lightning');
  Splash = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Splash');
  ElmoParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ElmoParticle');
  PotionOfFrost = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfFrost');
  PotionOfLiquidFlame = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfLiquidFlame');
  Embers = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.Embers');
  ScrollOfRecharging = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRecharging');
  ScrollOfTransmutation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTransmutation');
  RatSkull = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.RatSkull');
  CursedWand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand');
  Shocking = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Shocking');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  ElementalSprite$Chaos = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ElementalSprite$Chaos');
  ElementalSprite$Fire = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ElementalSprite$Fire');
  ElementalSprite$Frost = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ElementalSprite$Frost');
  ElementalSprite$NewbornFire = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ElementalSprite$NewbornFire');
  ElementalSprite$Shock = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ElementalSprite$Shock');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Game = $J.load('com.watabou.noosa.Game');
  Music = $J.load('com.watabou.noosa.audio.Music');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  GameMath = $J.load('com.watabou.utils.GameMath');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
