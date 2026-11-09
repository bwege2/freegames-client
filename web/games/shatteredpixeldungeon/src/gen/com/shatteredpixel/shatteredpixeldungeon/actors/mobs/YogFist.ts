// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/YogFist.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Mob } from './Mob.ts';

let Badges, Challenges, Dungeon, Actor, Char, Char$Property, Blob, Fire, StormCloud, ToxicGas, Bleeding, Blindness, Buff, Burning, Cripple, Frost, Invisibility, Light, LockedFloor, Ooze, Roots, Sleep, YogDzewa, CellEmitter, FloatingText, Speck, LeafParticle, Viscosity, Viscosity$DeferedDamage, ScrollOfTeleportation, Sickle$HarvestBleedTracker, Level, Terrain, GeyserTrap, Ballistica, Messages, GameScene, CharSprite, FistSprite$Bright, FistSprite$Burning, FistSprite$Dark, FistSprite$Rotting, FistSprite$Rusted, FistSprite$Soiled, GLog, PathFinder, Random;

export class YogFist extends Mob {
  rangedCooldown: number = 0;
  canRangedInMelee: boolean = false;
  invulnWarned: boolean = false;
  static readonly RANGED_COOLDOWN: string = 'ranged_cooldown';
  _YogFist(): this {
    this._Mob();
    this.HP = this.HT = 300;
    this.defenseSkill_ = 20;
    this.viewDistance = Light.DISTANCE;
    this.EXP = 25;
    this.maxLvl = -2;
    this.state_ = this.HUNTING;
    this.properties_.add(Char$Property.BOSS);
    this.properties_.add(Char$Property.DEMONIC);
    this.canRangedInMelee = true;
    this.invulnWarned = false;
    this.immunities_.add($J.cls(Sleep));
    return this;
  }
  incrementRangedCooldown(): void {
    this.rangedCooldown = Math.fround(this.rangedCooldown + Random.NormalFloat(8, 12));
  }
  act(): boolean {
    if (this.paralysed <= 0 && this.rangedCooldown > Math.fround(0)) {
      this.rangedCooldown--;
    }
    if (Dungeon.hero.invisible <= 0 && this.state_ === this.WANDERING) {
      this.beckon(Dungeon.hero.pos);
      this.state_ = this.HUNTING;
      this.enemy = Dungeon.hero;
    }
    return super.act();
  }
  canAttack(enemy: Char): boolean {
    if (this.rangedCooldown <= Math.fround(0)) {
      return new Ballistica()._Ballistica(this.pos, enemy.pos, Ballistica.MAGIC_BOLT).collisionPos === enemy.pos;
    } else {
      return super.canAttack(enemy);
    }
  }
  isNearYog(): boolean {
    let yogPos = (Dungeon.level.exit() + Math.imul(3, Dungeon.level.width())) | 0;
    return Dungeon.level.distance(this.pos, yogPos) <= 4;
  }
  isInvulnerable(effect: JClass): boolean {
    if (this.isNearYog() && !this.invulnWarned) {
      this.invulnWarned = true;
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'invuln_warn', []), []);
    }
    return this.isNearYog() || super.isInvulnerable(effect);
  }
  doAttack(enemy: Char): boolean {
    if (Dungeon.level.adjacent(this.pos, enemy.pos) && (!this.canRangedInMelee || this.rangedCooldown > Math.fround(0))) {
      return super.doAttack(enemy);
    } else {
      this.incrementRangedCooldown();
      if (this.sprite_ != null && (this.sprite_.visible_ || enemy.sprite_.visible_)) {
        this.sprite_.zap$int(enemy.pos);
        return false;
      } else {
        this.zap();
        return true;
      }
    }
  }
  damage(dmg: number, src: any): void {
    let preHP = this.HP;
    super.damage(dmg, src);
    let dmgTaken = (preHP - this.HP) | 0;
    let lock = Dungeon.hero.buff($J.cls(LockedFloor));
    if (dmgTaken > 0 && lock != null && !this.isImmune($J.getClass(src)) && !this.isInvulnerable($J.getClass(src))) {
      if (Dungeon.isChallenged(Challenges.STRONGER_BOSSES)) {
        lock.addTime(Math.fround(dmgTaken / 4));
      } else {
        lock.addTime(Math.fround(dmgTaken / 2));
      }
    }
  }
  die(cause: any): void {
    super.die(cause);
    for (const $it0 = Actor.chars().iterator(); $it0.hasNext(); ) {
      let c = $it0.next();
      if (c instanceof YogDzewa) {
        (c).processFistDeath();
      }
    }
  }
  onZapComplete(): void {
    this.zap();
    this.next();
  }
  attackSkill(target: Char): number {
    return 36;
  }
  damageRoll(): number {
    return Random.NormalIntRange(18, 36);
  }
  drRoll(): number {
    return (super.drRoll() + Random.NormalIntRange(0, 15)) | 0;
  }
  description(): string {
    return Messages.get$Class$String$ObjectArr($J.cls(YogFist), 'desc', []) + '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc', []);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$float(YogFist.RANGED_COOLDOWN, this.rangedCooldown);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.rangedCooldown = bundle.getFloat(YogFist.RANGED_COOLDOWN);
  }
}

export class YogFist$BurningFist extends YogFist {
  _YogFist$BurningFist(): this {
    this._YogFist();
    this.spriteClass = $J.cls(FistSprite$Burning);
    this.properties_.add(Char$Property.FIERY);
    this.immunities_.add($J.cls(Frost));
    this.resistances_.add($J.cls(StormCloud));
    this.resistances_.add($J.cls(GeyserTrap));
    return this;
  }
  act(): boolean {
    let result = super.act();
    if (Dungeon.level.map_[this.pos] === Terrain.WATER) {
      Level.set$int$int(this.pos, Terrain.EMPTY);
      GameScene.updateMap$int(this.pos);
      CellEmitter.get(this.pos).burst(Speck.factory$int(Speck.STEAM), 10);
    }
    let evaporatedTiles = Random.chances$floatArr([0, 1, 2]);
    for (let i = 0; i < evaporatedTiles; i++) {
      let cell = (this.pos + PathFinder.NEIGHBOURS8[Random.Int$int(8)]) | 0;
      if (Dungeon.level.map_[cell] === Terrain.WATER) {
        Level.set$int$int(cell, Terrain.EMPTY);
        GameScene.updateMap$int(cell);
        CellEmitter.get(cell).burst(Speck.factory$int(Speck.STEAM), 10);
      }
    }
    for (let i of PathFinder.NEIGHBOURS9) {
      let vol = Blob.volumeAt((this.pos + i) | 0, $J.cls(Fire));
      if (vol < 4 && !(Dungeon.level.water[(this.pos + i) | 0]) && !(Dungeon.level.solid[(this.pos + i) | 0])) {
        GameScene.add$Blob(Blob.seed$int$int$Class((this.pos + i) | 0, (4 - vol) | 0, $J.cls(Fire)));
      }
    }
    return result;
  }
  zap(): void {
    this.spend(1);
    if (Dungeon.level.map_[this.enemy.pos] === Terrain.WATER) {
      Level.set$int$int(this.enemy.pos, Terrain.EMPTY);
      GameScene.updateMap$int(this.enemy.pos);
      CellEmitter.get(this.enemy.pos).burst(Speck.factory$int(Speck.STEAM), 10);
    } else {
      Buff.affect$Char$Class(this.enemy, $J.cls(Burning)).reignite$Char(this.enemy);
    }
    for (let i of PathFinder.NEIGHBOURS9) {
      if (!(Dungeon.level.water[(this.enemy.pos + i) | 0]) && !(Dungeon.level.solid[(this.enemy.pos + i) | 0])) {
        let vol = Blob.volumeAt((this.enemy.pos + i) | 0, $J.cls(Fire));
        if (vol < 4) {
          GameScene.add$Blob(Blob.seed$int$int$Class((this.enemy.pos + i) | 0, (4 - vol) | 0, $J.cls(Fire)));
        }
      }
    }
  }
}

export class YogFist$SoiledFist extends YogFist {
  _YogFist$SoiledFist(): this {
    this._YogFist();
    this.spriteClass = $J.cls(FistSprite$Soiled);
    return this;
  }
  act(): boolean {
    let result = super.act();
    let furrowedTiles = Random.chances$floatArr([0, 2, 1]);
    for (let i = 0; i < furrowedTiles; i++) {
      let cell = (this.pos + PathFinder.NEIGHBOURS9[Random.Int$int(9)]) | 0;
      if (Dungeon.level.map_[cell] === Terrain.GRASS) {
        Level.set$int$int(cell, Terrain.FURROWED_GRASS);
        GameScene.updateMap$int(cell);
        CellEmitter.get(cell).burst(LeafParticle.GENERAL, 10);
      }
    }
    Dungeon.observe$();
    for (let i of PathFinder.NEIGHBOURS9) {
      let cell = (this.pos + i) | 0;
      if (this.canSpreadGrass(cell)) {
        Level.set$int$int((this.pos + i) | 0, Terrain.GRASS);
        GameScene.updateMap$int((this.pos + i) | 0);
      }
    }
    return result;
  }
  damage(dmg: number, src: any): void {
    let grassCells = 0;
    for (let i of PathFinder.NEIGHBOURS9) {
      if ((Dungeon.level.map_[(this.pos + i) | 0]) === Terrain.FURROWED_GRASS || (Dungeon.level.map_[(this.pos + i) | 0]) === Terrain.HIGH_GRASS) {
        grassCells++;
      }
    }
    if (grassCells > 0) {
      dmg = $J.roundf(Math.fround(Math.imul(dmg, ((6 - grassCells) | 0)) / 6));
    }
    if ($J.getClass(src) === $J.cls(Burning)) {
      return;
    }
    super.damage(dmg, src);
  }
  incomingDOT(): number {
    if (!this.needsIncomingDOTUpdate) {
      return this.cachedIncomingDOT;
    }
    let total = super.incomingDOT();
    let b = this.buff($J.cls(Burning));
    if (b != null) {
      total = (total - b.totalIncomingDMG()) | 0;
    }
    this.cachedIncomingDOT = total;
    return total;
  }
  zap(): void {
    this.spend(1);
    Invisibility.dispel$Char(this);
    let enemy = this.enemy;
    if (Char.hit$Char$Char$boolean(this, enemy, true)) {
      Buff.affect$Char$Class$float(enemy, $J.cls(Roots), 3);
    } else {
      enemy.sprite_.showStatus(CharSprite.NEUTRAL, enemy.defenseVerb(), []);
    }
    for (let i of PathFinder.NEIGHBOURS9) {
      let cell = (enemy.pos + i) | 0;
      if (this.canSpreadGrass(cell)) {
        if (Random.Int$int(5) === 0) {
          Level.set$int$int(cell, Terrain.FURROWED_GRASS);
          GameScene.updateMap$int(cell);
        } else {
          Level.set$int$int(cell, Terrain.GRASS);
          GameScene.updateMap$int(cell);
        }
        CellEmitter.get(cell).burst(LeafParticle.GENERAL, 10);
      }
    }
    Dungeon.observe$();
  }
  canSpreadGrass(cell: number): boolean {
    let yogPos = (Dungeon.level.exit() + Math.imul(Dungeon.level.width(), 3)) | 0;
    return Dungeon.level.distance(cell, yogPos) > 4 && !Dungeon.level.solid[cell] && !(Dungeon.level.map_[cell] === Terrain.FURROWED_GRASS || Dungeon.level.map_[cell] === Terrain.HIGH_GRASS);
  }
}

export class YogFist$RottingFist extends YogFist {
  _YogFist$RottingFist(): this {
    this._YogFist();
    this.spriteClass = $J.cls(FistSprite$Rotting);
    this.properties_.add(Char$Property.ACIDIC);
    this.immunities_.add($J.cls(ToxicGas));
    return this;
  }
  act(): boolean {
    GameScene.add$Blob(Blob.seed$int$int$Class(this.pos, 0, $J.cls(ToxicGas)));
    if (Dungeon.level.water[this.pos] && this.HP < this.HT) {
      this.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String($J.idiv(this.HT, 50)), FloatingText.HEALING, []);
      this.HP = Math.min(this.HT, (this.HP + $J.idiv(this.HT, 50)) | 0);
    }
    return super.act();
  }
  damage(dmg: number, src: any): void {
    if (!this.isInvulnerable($J.getClass(src)) && !(src instanceof Bleeding) && this.buff($J.cls(Sickle$HarvestBleedTracker)) == null) {
      dmg = $J.roundf(Math.fround(dmg * this.resist($J.getClass(src))));
      if (dmg < 0) {
        return;
      }
      let b = this.buff($J.cls(Bleeding));
      if (b == null) {
        b = new Bleeding()._Bleeding();
      }
      b.announced = false;
      b.attachTo(this);
      b.set$float(Math.fround(dmg * Math.fround(0.6)));
      this.sprite_.showStatus(CharSprite.WARNING, Messages.titleCase(b.name()) + ' ' + $J.d2i(b.level()), []);
    } else {
      super.damage(dmg, src);
    }
  }
  zap(): void {
    this.spend(1);
    GameScene.add$Blob(Blob.seed$int$int$Class(this.enemy.pos, 100, $J.cls(ToxicGas)));
  }
  attackProc(enemy: Char, damage: number): number {
    damage = super.attackProc(enemy, damage);
    if (Random.Int$int(2) === 0) {
      Buff.affect$Char$Class(enemy, $J.cls(Ooze)).set(Ooze.DURATION);
      enemy.sprite_.burst(-16777216, 5);
    }
    return damage;
  }
}

export class YogFist$RustedFist extends YogFist {
  _YogFist$RustedFist(): this {
    this._YogFist();
    this.spriteClass = $J.cls(FistSprite$Rusted);
    this.properties_.add(Char$Property.LARGE);
    this.properties_.add(Char$Property.INORGANIC);
    return this;
  }
  damageRoll(): number {
    return Random.NormalIntRange(22, 44);
  }
  damage(dmg: number, src: any): void {
    if (!this.isInvulnerable($J.getClass(src)) && !(src instanceof Viscosity$DeferedDamage)) {
      dmg = $J.roundf(Math.fround(dmg * this.resist($J.getClass(src))));
      if (dmg >= 0) {
        Buff.affect$Char$Class(this, $J.cls(Viscosity$DeferedDamage)).extend(Math.fround(dmg));
        this.sprite_.showStatus(CharSprite.WARNING, Messages.get$Class$String$ObjectArr($J.cls(Viscosity), 'deferred', [dmg]), []);
      }
    } else {
      super.damage(dmg, src);
    }
  }
  zap(): void {
    this.spend(1);
    Buff.affect$Char$Class$float(this.enemy, $J.cls(Cripple), 4);
  }
}

export class YogFist$BrightFist extends YogFist {
  _YogFist$BrightFist(): this {
    this._YogFist();
    this.spriteClass = $J.cls(FistSprite$Bright);
    this.properties_.add(Char$Property.ELECTRIC);
    this.canRangedInMelee = false;
    return this;
  }
  incrementRangedCooldown(): void {
  }
  zap(): void {
    this.spend(1);
    Invisibility.dispel$Char(this);
    let enemy = this.enemy;
    if (Char.hit$Char$Char$boolean(this, enemy, true)) {
      enemy.damage(Random.NormalIntRange(10, 20), new YogFist$BrightFist$LightBeam()._YogFist$BrightFist$LightBeam());
      Buff.prolong(enemy, $J.cls(Blindness), Math.fround(Blindness.DURATION / 2));
      if (!enemy.isAlive() && enemy === Dungeon.hero) {
        Badges.validateDeathFromEnemyMagic();
        Dungeon.fail(this);
        GLog.n(Messages.get$Class$String$ObjectArr($J.cls(Char), 'kill', [this.name()]), []);
      }
    } else {
      enemy.sprite_.showStatus(CharSprite.NEUTRAL, enemy.defenseVerb(), []);
    }
  }
  damage(dmg: number, src: any): void {
    let beforeHP = this.HP;
    super.damage(dmg, src);
    if (this.isAlive() && beforeHP > $J.idiv(this.HT, 2) && this.HP <= $J.idiv(this.HT, 2)) {
      this.HP = $J.idiv(this.HT, 2);
      Buff.prolong(Dungeon.hero, $J.cls(Blindness), Math.fround(Blindness.DURATION * 1.5));
      let i: number;
      do {
        i = Random.Int$int(Dungeon.level.length());
      } while (Dungeon.level.heroFOV[i] || Dungeon.level.solid[i] || Actor.findChar(i) != null || PathFinder.getStep(i, Dungeon.level.exit(), Dungeon.level.passable) === -1);
      ScrollOfTeleportation.appear(this, i);
      this.state_ = this.WANDERING;
      GameScene.flash$int(-2130706433);
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'teleport', []), []);
    } else if (!this.isAlive()) {
      Buff.prolong(Dungeon.hero, $J.cls(Blindness), Math.fround(Blindness.DURATION * 3));
      GameScene.flash$int(-2130706433);
    }
  }
}

export class YogFist$BrightFist$LightBeam extends JObject {
  _YogFist$BrightFist$LightBeam(): this {
    return this;
  }
}

export class YogFist$DarkFist extends YogFist {
  _YogFist$DarkFist(): this {
    this._YogFist();
    this.spriteClass = $J.cls(FistSprite$Dark);
    this.canRangedInMelee = false;
    return this;
  }
  incrementRangedCooldown(): void {
  }
  zap(): void {
    this.spend(1);
    Invisibility.dispel$Char(this);
    let enemy = this.enemy;
    if (Char.hit$Char$Char$boolean(this, enemy, true)) {
      enemy.damage(Random.NormalIntRange(10, 20), new YogFist$DarkFist$DarkBolt()._YogFist$DarkFist$DarkBolt());
      let l = enemy.buff($J.cls(Light));
      if (l != null) {
        l.weaken(50);
      }
      if (!enemy.isAlive() && enemy === Dungeon.hero) {
        Badges.validateDeathFromEnemyMagic();
        Dungeon.fail(this);
        GLog.n(Messages.get$Class$String$ObjectArr($J.cls(Char), 'kill', [this.name()]), []);
      }
    } else {
      enemy.sprite_.showStatus(CharSprite.NEUTRAL, enemy.defenseVerb(), []);
    }
  }
  damage(dmg: number, src: any): void {
    let beforeHP = this.HP;
    super.damage(dmg, src);
    if (this.isAlive() && beforeHP > $J.idiv(this.HT, 2) && this.HP <= $J.idiv(this.HT, 2)) {
      this.HP = $J.idiv(this.HT, 2);
      let l = Dungeon.hero.buff($J.cls(Light));
      if (l != null) {
        l.detach();
      }
      let i: number;
      do {
        i = Random.Int$int(Dungeon.level.length());
      } while (Dungeon.level.heroFOV[i] || Dungeon.level.solid[i] || Actor.findChar(i) != null || PathFinder.getStep(i, Dungeon.level.exit(), Dungeon.level.passable) === -1);
      ScrollOfTeleportation.appear(this, i);
      this.state_ = this.WANDERING;
      GameScene.flash$int$boolean(0, false);
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'teleport', []), []);
    } else if (!this.isAlive()) {
      let l = Dungeon.hero.buff($J.cls(Light));
      if (l != null) {
        l.detach();
      }
      GameScene.flash$int$boolean(0, false);
    }
  }
}

export class YogFist$DarkFist$DarkBolt extends JObject {
  _YogFist$DarkFist$DarkBolt(): this {
    return this;
  }
}

$J.define(YogFist, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogFist', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_YogFist' } });
$J.define(YogFist$BurningFist, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogFist$BurningFist', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogFist', ctors: { '': '_YogFist$BurningFist' } });
$J.define(YogFist$SoiledFist, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogFist$SoiledFist', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogFist', ctors: { '': '_YogFist$SoiledFist' } });
$J.define(YogFist$RottingFist, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogFist$RottingFist', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogFist', ctors: { '': '_YogFist$RottingFist' } });
$J.define(YogFist$RustedFist, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogFist$RustedFist', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogFist', ctors: { '': '_YogFist$RustedFist' } });
$J.define(YogFist$BrightFist, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogFist$BrightFist', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogFist', ctors: { '': '_YogFist$BrightFist' } });
$J.define(YogFist$BrightFist$LightBeam, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogFist$BrightFist$LightBeam', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_YogFist$BrightFist$LightBeam' } });
$J.define(YogFist$DarkFist, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogFist$DarkFist', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogFist', ctors: { '': '_YogFist$DarkFist' } });
$J.define(YogFist$DarkFist$DarkBolt, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogFist$DarkFist$DarkBolt', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_YogFist$DarkFist$DarkBolt' } });
$J.module(() => {
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Blob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob');
  Fire = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Fire');
  StormCloud = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.StormCloud');
  ToxicGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.ToxicGas');
  Bleeding = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Bleeding');
  Blindness = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Blindness');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Burning = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Burning');
  Cripple = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Cripple');
  Frost = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Frost');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Light = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Light');
  LockedFloor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.LockedFloor');
  Ooze = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Ooze');
  Roots = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Roots');
  Sleep = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Sleep');
  YogDzewa = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.YogDzewa');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  LeafParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.LeafParticle');
  Viscosity = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Viscosity');
  Viscosity$DeferedDamage = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Viscosity$DeferedDamage');
  ScrollOfTeleportation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation');
  Sickle$HarvestBleedTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Sickle$HarvestBleedTracker');
  Level = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  GeyserTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.GeyserTrap');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  FistSprite$Bright = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.FistSprite$Bright');
  FistSprite$Burning = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.FistSprite$Burning');
  FistSprite$Dark = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.FistSprite$Dark');
  FistSprite$Rotting = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.FistSprite$Rotting');
  FistSprite$Rusted = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.FistSprite$Rusted');
  FistSprite$Soiled = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.FistSprite$Soiled');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
