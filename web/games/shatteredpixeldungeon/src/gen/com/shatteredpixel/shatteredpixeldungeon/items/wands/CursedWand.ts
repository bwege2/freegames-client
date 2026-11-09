// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/wands/CursedWand.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, IOException, JObject } from '../../../../../../jre/index.ts';

let Assets$Sounds, Badges, Challenges, Dungeon, Actor, Char, Char$Alignment, Char$Property, Blob, ConfusionGas, Electricity, Fire, ParalyticGas, Regrowth, ToxicGas, Bless, Buff, Burning, Frost, GravityChaosTracker, HeroDisguise, Hex, Invulnerability, Levitation, Ooze, Paralysis, Poison, Recharging, SuperNovaTracker, TimeStasis, Hero, GoldenMimic, Mimic, Piranha, NPC, Sheep, CellEmitter, Flare, FloatingText, Lightning, MagicMissile, Speck, SpellSprite, Splash, FlameParticle, PitfallParticle, PoisonParticle, ShadowParticle, SparkParticle, EquipableItem, Generator, Generator$Category, Bomb$ConjuredBomb, ScrollOfMirrorImage, ScrollOfRecharging, ScrollOfTeleportation, ScrollOfChallenge$ChallengeArena, ScrollOfMetamorphosis$WndMetamorphChoose, ScrollOfSirensSong$Enthralled, WondrousResin, Wand, WandOfBlastWave$BlastWave, Level, Terrain, BurningTrap, ChillingTrap, CursingTrap, FlockTrap, GeyserTrap, PitfallTrap$DelayedPit, ShockingTrap, SummoningTrap, Ballistica, ConeAOE, ShadowCaster, Languages, Messages, GameScene, InterlevelScene, InterlevelScene$Mode, CharSprite, DungeonTilemap, Icons, TargetHealthIndicator, GLog, WndOptions, Game, Sample, BArray, PathFinder, Random;

export class CursedWand extends JObject {
  static EFFECT_CAT_CHANCES: number[] = null;
  static COMMON_EFFECTS: ArrayList<CursedWand$CursedEffect> = null;
  static UNCOMMON_EFFECTS: ArrayList<CursedWand$CursedEffect> = null;
  static RARE_EFFECTS: ArrayList<CursedWand$CursedEffect> = null;
  static VERY_RARE_EFFECTS: ArrayList<CursedWand$CursedEffect> = null;
  _CursedWand(): this {
    return this;
  }
  static cursedZap(origin: Item, user: Char, bolt: Ballistica, afterZap: Callback): void {
    let positiveOnly = user === Dungeon.hero && Random.Float$() < WondrousResin.positiveCurseEffectChance$();
    let effect = CursedWand.randomValidEffect(origin, user, bolt, positiveOnly);
    effect.FX(origin, user, bolt, new (CursedWand$1())().$c(effect, origin, user, bolt, positiveOnly, afterZap));
  }
  static tryForWandProc(target: Char, origin: Item): void {
    if (target != null && target !== Dungeon.hero && origin instanceof Wand) {
      Wand.wandProc(target, origin.buffedLvl(), 1);
    }
  }
  static randomEffect(): CursedWand$CursedEffect {
    switch (Random.chances$floatArr(CursedWand.EFFECT_CAT_CHANCES)) {
      case 0:
      default:
        return CursedWand.randomCommonEffect();
      case 1:
        return CursedWand.randomUncommonEffect();
      case 2:
        return CursedWand.randomRareEffect();
      case 3:
        return CursedWand.randomVeryRareEffect();
    }
  }
  static randomValidEffect(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): CursedWand$CursedEffect {
    switch (Random.chances$floatArr(CursedWand.EFFECT_CAT_CHANCES)) {
      case 0:
      default:
        return CursedWand.randomValidCommonEffect(origin, user, bolt, positiveOnly);
      case 1:
        return CursedWand.randomValidUncommonEffect(origin, user, bolt, positiveOnly);
      case 2:
        return CursedWand.randomValidRareEffect(origin, user, bolt, positiveOnly);
      case 3:
        return CursedWand.randomValidVeryRareEffect(origin, user, bolt, positiveOnly);
    }
  }
  static randomCommonEffect(): CursedWand$CursedEffect {
    return Random.element$Collection(CursedWand.COMMON_EFFECTS);
  }
  static randomValidCommonEffect(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): CursedWand$CursedEffect {
    let effect: CursedWand$CursedEffect;
    do {
      effect = Random.element$Collection(CursedWand.COMMON_EFFECTS);
    } while (!effect.valid(origin, user, bolt, positiveOnly));
    return effect;
  }
  static randomUncommonEffect(): CursedWand$CursedEffect {
    return Random.element$Collection(CursedWand.UNCOMMON_EFFECTS);
  }
  static randomValidUncommonEffect(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): CursedWand$CursedEffect {
    let effect: CursedWand$CursedEffect;
    do {
      effect = Random.element$Collection(CursedWand.UNCOMMON_EFFECTS);
    } while (!effect.valid(origin, user, bolt, positiveOnly));
    return effect;
  }
  static randomRareEffect(): CursedWand$CursedEffect {
    return Random.element$Collection(CursedWand.RARE_EFFECTS);
  }
  static randomValidRareEffect(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): CursedWand$CursedEffect {
    let effect: CursedWand$CursedEffect;
    do {
      effect = Random.element$Collection(CursedWand.RARE_EFFECTS);
    } while (!effect.valid(origin, user, bolt, positiveOnly));
    return effect;
  }
  static randomVeryRareEffect(): CursedWand$CursedEffect {
    return Random.element$Collection(CursedWand.VERY_RARE_EFFECTS);
  }
  static randomValidVeryRareEffect(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): CursedWand$CursedEffect {
    let effect: CursedWand$CursedEffect;
    do {
      effect = Random.element$Collection(CursedWand.VERY_RARE_EFFECTS);
    } while (!effect.valid(origin, user, bolt, positiveOnly));
    return effect;
  }
  static $clinit() {
    CursedWand.EFFECT_CAT_CHANCES = [60, 30, 9, 1];
    CursedWand.COMMON_EFFECTS = new ArrayList();
    CursedWand.COMMON_EFFECTS.add(new CursedWand$BurnAndFreeze()._CursedWand$BurnAndFreeze());
    CursedWand.COMMON_EFFECTS.add(new CursedWand$SpawnRegrowth()._CursedWand$SpawnRegrowth());
    CursedWand.COMMON_EFFECTS.add(new CursedWand$RandomTeleport()._CursedWand$RandomTeleport());
    CursedWand.COMMON_EFFECTS.add(new CursedWand$RandomGas()._CursedWand$RandomGas());
    CursedWand.COMMON_EFFECTS.add(new CursedWand$RandomAreaEffect()._CursedWand$RandomAreaEffect());
    CursedWand.COMMON_EFFECTS.add(new CursedWand$Bubbles()._CursedWand$Bubbles());
    CursedWand.COMMON_EFFECTS.add(new CursedWand$RandomWand()._CursedWand$RandomWand());
    CursedWand.COMMON_EFFECTS.add(new CursedWand$SelfOoze()._CursedWand$SelfOoze());
    CursedWand.UNCOMMON_EFFECTS = new ArrayList();
    CursedWand.UNCOMMON_EFFECTS.add(new CursedWand$RandomPlant()._CursedWand$RandomPlant());
    CursedWand.UNCOMMON_EFFECTS.add(new CursedWand$HealthTransfer()._CursedWand$HealthTransfer());
    CursedWand.UNCOMMON_EFFECTS.add(new CursedWand$Explosion()._CursedWand$Explosion());
    CursedWand.UNCOMMON_EFFECTS.add(new CursedWand$LightningBolt()._CursedWand$LightningBolt());
    CursedWand.UNCOMMON_EFFECTS.add(new CursedWand$Geyser()._CursedWand$Geyser());
    CursedWand.UNCOMMON_EFFECTS.add(new CursedWand$SummonSheep()._CursedWand$SummonSheep());
    CursedWand.UNCOMMON_EFFECTS.add(new CursedWand$Levitate()._CursedWand$Levitate());
    CursedWand.UNCOMMON_EFFECTS.add(new CursedWand$Alarm()._CursedWand$Alarm());
    CursedWand.RARE_EFFECTS = new ArrayList();
    CursedWand.RARE_EFFECTS.add(new CursedWand$SheepPolymorph()._CursedWand$SheepPolymorph());
    CursedWand.RARE_EFFECTS.add(new CursedWand$CurseEquipment()._CursedWand$CurseEquipment());
    CursedWand.RARE_EFFECTS.add(new CursedWand$InterFloorTeleport()._CursedWand$InterFloorTeleport());
    CursedWand.RARE_EFFECTS.add(new CursedWand$SummonMonsters()._CursedWand$SummonMonsters());
    CursedWand.RARE_EFFECTS.add(new CursedWand$FireBall()._CursedWand$FireBall());
    CursedWand.RARE_EFFECTS.add(new CursedWand$ConeOfColors()._CursedWand$ConeOfColors());
    CursedWand.RARE_EFFECTS.add(new CursedWand$MassInvuln()._CursedWand$MassInvuln());
    CursedWand.RARE_EFFECTS.add(new CursedWand$Petrify()._CursedWand$Petrify());
    CursedWand.VERY_RARE_EFFECTS = new ArrayList();
    CursedWand.VERY_RARE_EFFECTS.add(new CursedWand$ForestFire()._CursedWand$ForestFire());
    CursedWand.VERY_RARE_EFFECTS.add(new CursedWand$SpawnGoldenMimic()._CursedWand$SpawnGoldenMimic());
    CursedWand.VERY_RARE_EFFECTS.add(new CursedWand$AbortRetryFail()._CursedWand$AbortRetryFail());
    CursedWand.VERY_RARE_EFFECTS.add(new CursedWand$RandomTransmogrify()._CursedWand$RandomTransmogrify());
    CursedWand.VERY_RARE_EFFECTS.add(new CursedWand$HeroShapeShift()._CursedWand$HeroShapeShift());
    CursedWand.VERY_RARE_EFFECTS.add(new CursedWand$SuperNova()._CursedWand$SuperNova());
    CursedWand.VERY_RARE_EFFECTS.add(new CursedWand$SinkHole()._CursedWand$SinkHole());
    CursedWand.VERY_RARE_EFFECTS.add(new CursedWand$GravityChaos()._CursedWand$GravityChaos());
  }
}

export class CursedWand$CursedEffect extends JObject {
  _CursedWand$CursedEffect(): this {
    return this;
  }
  valid(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): boolean {
    return true;
  }
  FX(origin: Item, user: Char, bolt: Ballistica, callback: Callback): void {
    MagicMissile.boltFromChar(user.sprite_.parent, MagicMissile.RAINBOW, user.sprite_, bolt.collisionPos, callback);
    Sample.INSTANCE.play$Object(Assets$Sounds.ZAP);
  }
}

export class CursedWand$BurnAndFreeze extends CursedWand$CursedEffect {
  _CursedWand$BurnAndFreeze(): this {
    this._CursedWand$CursedEffect();
    return this;
  }
  effect(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): boolean {
    let target = Actor.findChar(bolt.collisionPos);
    if (Random.Int$int(2) === 0) {
      if (target != null) {
        Buff.affect$Char$Class(target, $J.cls(Burning)).reignite$Char(target);
      }
      if (!positiveOnly) {
        Buff.affect$Char$Class$float(user, $J.cls(Frost), Frost.DURATION);
      }
    } else {
      if (!positiveOnly) {
        Buff.affect$Char$Class(user, $J.cls(Burning)).reignite$Char(user);
      }
      if (target != null) {
        Buff.affect$Char$Class$float(target, $J.cls(Frost), Frost.DURATION);
      }
    }
    CursedWand.tryForWandProc(target, origin);
    return true;
  }
}

export class CursedWand$SpawnRegrowth extends CursedWand$CursedEffect {
  _CursedWand$SpawnRegrowth(): this {
    this._CursedWand$CursedEffect();
    return this;
  }
  effect(origin: Item, user: Char, bolt: Ballistica, postiveOnly: boolean): boolean {
    if (Actor.findChar(bolt.collisionPos) == null) {
      Dungeon.level.pressCell$int(bolt.collisionPos);
    }
    GameScene.add$Blob(Blob.seed$int$int$Class(bolt.collisionPos, 30, $J.cls(Regrowth)));
    CursedWand.tryForWandProc(Actor.findChar(bolt.collisionPos), origin);
    return true;
  }
}

export class CursedWand$RandomTeleport extends CursedWand$CursedEffect {
  _CursedWand$RandomTeleport(): this {
    this._CursedWand$CursedEffect();
    return this;
  }
  valid(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): boolean {
    let target = Actor.findChar(bolt.collisionPos);
    if (positiveOnly && (target == null || Char.hasProp(target, Char$Property.IMMOVABLE))) {
      return false;
    }
    return true;
  }
  effect(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): boolean {
    let target = Actor.findChar(bolt.collisionPos);
    if (target != null && !Char.hasProp(target, Char$Property.IMMOVABLE) && (positiveOnly || Random.Int$int(2) === 0)) {
      ScrollOfTeleportation.teleportChar$Char(target);
      CursedWand.tryForWandProc(target, origin);
      return true;
    } else {
      if (positiveOnly || user == null || Char.hasProp(user, Char$Property.IMMOVABLE)) {
        return false;
      } else {
        ScrollOfTeleportation.teleportChar$Char(user);
        return true;
      }
    }
  }
}

export class CursedWand$RandomGas extends CursedWand$CursedEffect {
  _CursedWand$RandomGas(): this {
    this._CursedWand$CursedEffect();
    return this;
  }
  effect(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): boolean {
    Sample.INSTANCE.play$Object(Assets$Sounds.GAS);
    CursedWand.tryForWandProc(Actor.findChar(bolt.collisionPos), origin);
    if (Actor.findChar(bolt.collisionPos) == null) {
      Dungeon.level.pressCell$int(bolt.collisionPos);
    }
    switch (Random.Int$int(3)) {
      case 0:
      default:
        GameScene.add$Blob(Blob.seed$int$int$Class(bolt.collisionPos, 800, $J.cls(ConfusionGas)));
        return true;
      case 1:
        GameScene.add$Blob(Blob.seed$int$int$Class(bolt.collisionPos, 500, $J.cls(ToxicGas)));
        return true;
      case 2:
        GameScene.add$Blob(Blob.seed$int$int$Class(bolt.collisionPos, 200, $J.cls(ParalyticGas)));
        return true;
    }
  }
}

export class CursedWand$RandomAreaEffect extends CursedWand$CursedEffect {
  _CursedWand$RandomAreaEffect(): this {
    this._CursedWand$CursedEffect();
    return this;
  }
  effect(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): boolean {
    CursedWand.tryForWandProc(Actor.findChar(bolt.collisionPos), origin);
    if (Actor.findChar(bolt.collisionPos) == null) {
      Dungeon.level.pressCell$int(bolt.collisionPos);
    }
    switch (Random.Int$int(3)) {
      case 0:
      default:
        new BurningTrap()._BurningTrap().set(bolt.collisionPos).activate();
        return true;
      case 1:
        new ChillingTrap()._ChillingTrap().set(bolt.collisionPos).activate();
        return true;
      case 2:
        new ShockingTrap()._ShockingTrap().set(bolt.collisionPos).activate();
        return true;
    }
  }
}

export class CursedWand$Bubbles extends CursedWand$CursedEffect {
  _CursedWand$Bubbles(): this {
    this._CursedWand$CursedEffect();
    return this;
  }
  FX(origin: Item, user: Char, bolt: Ballistica, callback: Callback): void {
    MagicMissile.boltFromChar(user.sprite_.parent, (MagicMissile.SPECK + Speck.BUBBLE) | 0, user.sprite_, bolt.collisionPos, callback);
    Sample.INSTANCE.play$Object(Assets$Sounds.ZAP);
  }
  effect(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): boolean {
    if (Actor.findChar(bolt.collisionPos) == null) {
      Dungeon.level.pressCell$int(bolt.collisionPos);
    }
    CursedWand.tryForWandProc(Actor.findChar(bolt.collisionPos), origin);
    for (let i of PathFinder.NEIGHBOURS9) {
      if (!(Dungeon.level.solid[(bolt.collisionPos + i) | 0])) {
        (CellEmitter.get((bolt.collisionPos + i) | 0)).start(Speck.factory$int(Speck.BUBBLE), 0.25, 40);
      }
    }
    return true;
  }
}

export class CursedWand$RandomWand extends CursedWand$CursedEffect {
  wand_: Wand = null;
  _CursedWand$RandomWand(): this {
    this._CursedWand$CursedEffect();
    return this;
  }
  valid(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): boolean {
    return super.valid(origin, user, bolt, positiveOnly) && origin instanceof Wand;
  }
  FX(origin: Item, user: Char, bolt: Ballistica, callback: Callback): void {
    if (this.wand_ == null) {
      this.wand_ = Generator.randomUsingDefaults$Category(Generator$Category.WAND);
    }
    this.wand_.fx(bolt, callback);
  }
  effect(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): boolean {
    if (this.wand_ == null) {
      this.wand_ = Generator.randomUsingDefaults$Category(Generator$Category.WAND);
    }
    if (origin instanceof Wand) {
      this.wand_.upgrade$int(origin.level$());
    } else {
      this.wand_.upgrade$int($J.idiv(Dungeon.scalingDepth(), 5));
    }
    this.wand_.levelKnown = false;
    this.wand_.onZap(bolt);
    this.wand_ = null;
    return true;
  }
}

export class CursedWand$SelfOoze extends CursedWand$CursedEffect {
  _CursedWand$SelfOoze(): this {
    this._CursedWand$CursedEffect();
    return this;
  }
  FX(origin: Item, user: Char, bolt: Ballistica, callback: Callback): void {
    callback.call();
  }
  effect(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): boolean {
    PathFinder.buildDistanceMap$int$booleanArr$int(user.pos, BArray.not(Dungeon.level.solid, null), 2);
    for (let i = 0; i < PathFinder.distance.length; i++) {
      if (PathFinder.distance[i] < 2147483647) {
        Splash.at$int$int$int(i, 0, 5);
        let ch = Actor.findChar(i);
        if (ch != null && (!positiveOnly || ch.alignment !== Char$Alignment.ALLY)) {
          Buff.affect$Char$Class(ch, $J.cls(Ooze)).set(Ooze.DURATION);
        }
      }
    }
    Sample.INSTANCE.play$Object(Assets$Sounds.SHATTER);
    return true;
  }
}

export class CursedWand$RandomPlant extends CursedWand$CursedEffect {
  _CursedWand$RandomPlant(): this {
    this._CursedWand$CursedEffect();
    return this;
  }
  valid(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): boolean {
    let pos = bolt.collisionPos;
    if (Dungeon.level.map_[pos] !== Terrain.ALCHEMY && !Dungeon.level.pit[pos] && Dungeon.level.traps.get(pos) == null && !Dungeon.isChallenged(Challenges.NO_HERBALISM)) {
      return true;
    } else {
      return false;
    }
  }
  effect(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): boolean {
    if (this.valid(origin, user, bolt, positiveOnly)) {
      CursedWand.tryForWandProc(Actor.findChar(bolt.collisionPos), origin);
      Dungeon.level.plant(Generator.randomUsingDefaults$Category(Generator$Category.SEED), bolt.collisionPos);
      return true;
    } else {
      return false;
    }
  }
}

export class CursedWand$HealthTransfer extends CursedWand$CursedEffect {
  _CursedWand$HealthTransfer(): this {
    this._CursedWand$CursedEffect();
    return this;
  }
  valid(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): boolean {
    return Actor.findChar(bolt.collisionPos) != null;
  }
  effect(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): boolean {
    let target = Actor.findChar(bolt.collisionPos);
    if (target != null) {
      let damage = Math.imul(Dungeon.scalingDepth(), 2);
      let toHeal: Char;
      let toDamage: Char;
      if (positiveOnly || Random.Int$int(2) === 0) {
        toHeal = user;
        toDamage = target;
      } else {
        toHeal = target;
        toDamage = user;
      }
      toHeal.HP = Math.min(toHeal.HT, (toHeal.HP + $J.idiv(damage, 2)) | 0);
      toHeal.sprite_.emitter().burst(Speck.factory$int(Speck.HEALING), 3);
      toHeal.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String($J.idiv(damage, 2)), FloatingText.HEALING, []);
      toDamage.damage(damage, new CursedWand()._CursedWand());
      toDamage.sprite_.emitter().start(ShadowParticle.UP, Math.fround(0.05), 10);
      if (toDamage === Dungeon.hero) {
        Sample.INSTANCE.play$Object(Assets$Sounds.CURSED);
        if (!toDamage.isAlive()) {
          if (user === Dungeon.hero && origin != null) {
            Badges.validateDeathFromFriendlyMagic();
            Dungeon.fail(origin);
            GLog.n(Messages.get$Class$String$ObjectArr($J.cls(CursedWand), 'ondeath', [origin.name()]), []);
          } else {
            Badges.validateDeathFromEnemyMagic();
            Dungeon.fail(toHeal);
          }
        }
      } else {
        Sample.INSTANCE.play$Object(Assets$Sounds.BURNING);
      }
      CursedWand.tryForWandProc(target, origin);
      return true;
    } else {
      return false;
    }
  }
}

export class CursedWand$Explosion extends CursedWand$CursedEffect {
  _CursedWand$Explosion(): this {
    this._CursedWand$CursedEffect();
    return this;
  }
  effect(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): boolean {
    new Bomb$ConjuredBomb()._Bomb$ConjuredBomb().explode(bolt.collisionPos);
    CursedWand.tryForWandProc(Actor.findChar(bolt.collisionPos), origin);
    return true;
  }
}

export class CursedWand$LightningBolt extends CursedWand$CursedEffect {
  _CursedWand$LightningBolt(): this {
    this._CursedWand$CursedEffect();
    return this;
  }
  FX(origin: Item, user: Char, bolt: Ballistica, callback: Callback): void {
    let ch = Actor.findChar(bolt.collisionPos);
    if (ch != null) {
      user.sprite_.parent.addToFront(new Lightning()._Lightning$PointF$PointF$Callback(user.sprite_.center$(), ch.sprite_.center$(), null));
    } else {
      user.sprite_.parent.addToFront(new Lightning()._Lightning$PointF$PointF$Callback(user.sprite_.center$(), DungeonTilemap.raisedTileCenterToWorld(bolt.collisionPos), null));
    }
    Sample.INSTANCE.play$Object(Assets$Sounds.LIGHTNING);
    callback.call();
  }
  effect(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): boolean {
    let affected = new ArrayList();
    user.sprite_.parent.add$Gizmo(new Lightning()._Lightning$int$int$Callback((user.pos - 1) | 0, (user.pos + 1) | 0, null));
    user.sprite_.parent.add$Gizmo(new Lightning()._Lightning$int$int$Callback((user.pos - Dungeon.level.width()) | 0, (user.pos + Dungeon.level.width()) | 0, null));
    user.sprite_.parent.add$Gizmo(new Lightning()._Lightning$int$int$Callback((user.pos - 1 - Dungeon.level.width()) | 0, (user.pos + 1 + Dungeon.level.width()) | 0, null));
    user.sprite_.parent.add$Gizmo(new Lightning()._Lightning$int$int$Callback((user.pos - 1 + Dungeon.level.width()) | 0, (user.pos + 1 - Dungeon.level.width()) | 0, null));
    for (let i of PathFinder.NEIGHBOURS9) {
      if ((Actor.findChar((user.pos + i) | 0)) != null) {
        affected.add(Actor.findChar((user.pos + i) | 0));
      }
    }
    let pos = bolt.collisionPos;
    user.sprite_.parent.add$Gizmo(new Lightning()._Lightning$int$int$Callback((pos - 1) | 0, (user.pos + 1) | 0, null));
    user.sprite_.parent.add$Gizmo(new Lightning()._Lightning$int$int$Callback((pos - Dungeon.level.width()) | 0, (pos + Dungeon.level.width()) | 0, null));
    user.sprite_.parent.add$Gizmo(new Lightning()._Lightning$int$int$Callback((pos - 1 - Dungeon.level.width()) | 0, (pos + 1 + Dungeon.level.width()) | 0, null));
    user.sprite_.parent.add$Gizmo(new Lightning()._Lightning$int$int$Callback((pos - 1 + Dungeon.level.width()) | 0, (pos + 1 - Dungeon.level.width()) | 0, null));
    for (let i of PathFinder.NEIGHBOURS9) {
      if ((Actor.findChar((pos + i) | 0)) != null && !affected.contains(Actor.findChar((pos + i) | 0))) {
        affected.add(Actor.findChar((pos + i) | 0));
      }
    }
    CursedWand.tryForWandProc(Actor.findChar(bolt.collisionPos), origin);
    for (const $it0 = affected.iterator(); $it0.hasNext(); ) {
      let ch = $it0.next();
      if (ch instanceof Hero) {
        Buff.prolong(ch, $J.cls(Recharging), Math.fround(Recharging.DURATION / 3));
        ScrollOfRecharging.charge(ch);
        SpellSprite.show$Char$int(ch, SpellSprite.CHARGE);
      }
      if (ch.alignment !== Char$Alignment.ALLY || !positiveOnly) {
        ch.damage(Random.NormalIntRange((5 + $J.idiv(Dungeon.scalingDepth(), 4)) | 0, (10 + $J.idiv(Dungeon.scalingDepth(), 4)) | 0), new Electricity()._Electricity());
        if (ch.isAlive()) {
          Buff.affect$Char$Class$float(ch, $J.cls(Paralysis), Math.fround(Paralysis.DURATION / 2));
        } else if (ch === Dungeon.hero) {
          if (user === Dungeon.hero && origin != null) {
            Badges.validateDeathFromFriendlyMagic();
            Dungeon.fail(origin);
            GLog.n(Messages.get$Class$String$ObjectArr($J.cls(CursedWand), 'ondeath', [origin.name()]), []);
          } else {
            Badges.validateDeathFromEnemyMagic();
            Dungeon.fail(user);
          }
        }
      }
    }
    return true;
  }
}

export class CursedWand$Geyser extends CursedWand$CursedEffect {
  _CursedWand$Geyser(): this {
    this._CursedWand$CursedEffect();
    return this;
  }
  effect(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): boolean {
    CursedWand.tryForWandProc(Actor.findChar(bolt.collisionPos), origin);
    let geyser = new GeyserTrap()._GeyserTrap();
    geyser.pos = bolt.collisionPos;
    geyser.source_ = origin == null ? user : origin;
    geyser.activate();
    return true;
  }
}

export class CursedWand$SummonSheep extends CursedWand$CursedEffect {
  _CursedWand$SummonSheep(): this {
    this._CursedWand$CursedEffect();
    return this;
  }
  effect(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): boolean {
    CursedWand.tryForWandProc(Actor.findChar(bolt.collisionPos), origin);
    new FlockTrap()._FlockTrap().set(bolt.collisionPos).activate();
    return true;
  }
}

export class CursedWand$Levitate extends CursedWand$CursedEffect {
  _CursedWand$Levitate(): this {
    this._CursedWand$CursedEffect();
    return this;
  }
  valid(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): boolean {
    return positiveOnly || Actor.findChar(bolt.collisionPos) != null;
  }
  effect(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): boolean {
    let ch = Actor.findChar(bolt.collisionPos);
    if ((!positiveOnly || (ch instanceof Piranha)) && ch != null && !ch.flying && !Char.hasProp(ch, Char$Property.IMMOVABLE)) {
      Buff.affect$Char$Class$float(ch, $J.cls(Levitation), Levitation.DURATION);
    } else {
      Buff.affect$Char$Class$float(user, $J.cls(Levitation), Levitation.DURATION);
    }
    return true;
  }
}

export class CursedWand$Alarm extends CursedWand$CursedEffect {
  _CursedWand$Alarm(): this {
    this._CursedWand$CursedEffect();
    return this;
  }
  FX(origin: Item, user: Char, bolt: Ballistica, callback: Callback): void {
    callback.call();
  }
  effect(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): boolean {
    for (const $it1 = Dungeon.level.mobs.iterator(); $it1.hasNext(); ) {
      let mob = $it1.next();
      mob.beckon(user.pos);
    }
    user.sprite_.centerEmitter().start(Speck.factory$int(Speck.SCREAM), Math.fround(0.3), 3);
    if (positiveOnly) {
      Buff.affect$Char$Class(user, $J.cls(ScrollOfChallenge$ChallengeArena)).setup(user.pos);
      Sample.INSTANCE.play$Object(Assets$Sounds.CHALLENGE);
    } else {
      Sample.INSTANCE.play$Object(Assets$Sounds.ALERT);
    }
    return true;
  }
}

export class CursedWand$SheepPolymorph extends CursedWand$CursedEffect {
  _CursedWand$SheepPolymorph(): this {
    this._CursedWand$CursedEffect();
    return this;
  }
  valid(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): boolean {
    let ch = Actor.findChar(bolt.collisionPos);
    if (ch != null && !(ch instanceof Hero) && !ch.properties().contains(Char$Property.BOSS) && !ch.properties().contains(Char$Property.MINIBOSS) && !(ch instanceof NPC && ch.alignment === Char$Alignment.NEUTRAL)) {
      return true;
    } else {
      return false;
    }
  }
  effect(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): boolean {
    if (this.valid(origin, user, bolt, positiveOnly)) {
      let ch = Actor.findChar(bolt.collisionPos);
      let sheep = new Sheep()._Sheep();
      sheep.initialize(10);
      sheep.pos = ch.pos;
      ch.destroy();
      ch.sprite_.killAndErase();
      Dungeon.level.mobs.remove(ch);
      TargetHealthIndicator.instance.target$Char(null);
      GameScene.add$Mob(sheep);
      CellEmitter.get(sheep.pos).burst(Speck.factory$int(Speck.WOOL), 4);
      Sample.INSTANCE.play$Object(Assets$Sounds.PUFF);
      Sample.INSTANCE.play$Object(Assets$Sounds.SHEEP);
      Dungeon.level.occupyCell(sheep);
      return true;
    } else {
      return false;
    }
  }
}

export class CursedWand$CurseEquipment extends CursedWand$CursedEffect {
  _CursedWand$CurseEquipment(): this {
    this._CursedWand$CursedEffect();
    return this;
  }
  effect(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): boolean {
    if (positiveOnly || !(user instanceof Hero)) {
      let ch = Actor.findChar(bolt.collisionPos);
      if (ch != null) {
        Buff.affect$Char$Class$float(ch, $J.cls(Hex), Hex.DURATION);
      }
      return true;
    } else {
      CursingTrap.curse$Hero(user);
      return true;
    }
  }
}

export class CursedWand$InterFloorTeleport extends CursedWand$CursedEffect {
  _CursedWand$InterFloorTeleport(): this {
    this._CursedWand$CursedEffect();
    return this;
  }
  FX(origin: Item, user: Char, bolt: Ballistica, callback: Callback): void {
    callback.call();
  }
  effect(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): boolean {
    if (!positiveOnly && Dungeon.depth > 1 && Dungeon.interfloorTeleportAllowed() && user === Dungeon.hero) {
      let depths = $J.newArray((Dungeon.depth - 1) | 0, 0);
      let start = Math.max(1, (Dungeon.depth - 10) | 0);
      for (let i = start; i < Dungeon.depth; i++) {
        (depths[(i - 1) | 0]) = Math.fround((i - start + 1) | 0);
      }
      let depth = (1 + Random.chances$floatArr(depths)) | 0;
      Level.beforeTransition();
      InterlevelScene.mode = InterlevelScene$Mode.RETURN;
      InterlevelScene.returnDepth = depth;
      InterlevelScene.returnBranch = 0;
      InterlevelScene.returnPos = -1;
      Game.switchScene$Class($J.cls(InterlevelScene));
    } else {
      ScrollOfTeleportation.teleportChar$Char(user);
    }
    return true;
  }
}

export class CursedWand$SummonMonsters extends CursedWand$CursedEffect {
  _CursedWand$SummonMonsters(): this {
    this._CursedWand$CursedEffect();
    return this;
  }
  effect(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): boolean {
    if (positiveOnly && user === Dungeon.hero) {
      ScrollOfMirrorImage.spawnImages$Hero$int$int(Dungeon.hero, bolt.collisionPos, 2);
    } else {
      new SummoningTrap()._SummoningTrap().set(bolt.collisionPos).activate();
    }
    return true;
  }
}

export class CursedWand$FireBall extends CursedWand$CursedEffect {
  _CursedWand$FireBall(): this {
    this._CursedWand$CursedEffect();
    return this;
  }
  effect(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): boolean {
    let c = Dungeon.level.cellToPoint(bolt.collisionPos);
    let fieldOfView = $J.newArray(Dungeon.level.length(), false);
    ShadowCaster.castShadow(c.x, c.y, Dungeon.level.width(), fieldOfView, Dungeon.level.solid, 3);
    CursedWand.tryForWandProc(Actor.findChar(bolt.collisionPos), origin);
    for (let i = 0; i < Dungeon.level.length(); i++) {
      if (fieldOfView[i] && !Dungeon.level.solid[i]) {
        if (positiveOnly && Actor.findChar(i) != null && Actor.findChar(i).alignment === Char$Alignment.ALLY) {
          continue;
        }
        CellEmitter.get(i).burst(FlameParticle.FACTORY, 10);
        if (Actor.findChar(i) != null) {
          let ch = Actor.findChar(i);
          let burning = Buff.affect$Char$Class(ch, $J.cls(Burning));
          burning.reignite$Char(ch);
          let dmg = Random.NormalIntRange((5 + Dungeon.scalingDepth()) | 0, (10 + Math.imul(Dungeon.scalingDepth(), 2)) | 0);
          ch.damage(dmg, burning);
        }
        if (Dungeon.level.flamable[i]) {
          GameScene.add$Blob(Blob.seed$int$int$Class(i, 4, $J.cls(Fire)));
        }
      }
    }
    WandOfBlastWave$BlastWave.blast$int$float(bolt.collisionPos, 6);
    Sample.INSTANCE.play$Object(Assets$Sounds.BLAST);
    Sample.INSTANCE.play$Object(Assets$Sounds.BURNING);
    return false;
  }
}

export class CursedWand$ConeOfColors extends CursedWand$CursedEffect {
  cone: ConeAOE = null;
  _CursedWand$ConeOfColors(): this {
    this._CursedWand$CursedEffect();
    this.cone = null;
    return this;
  }
  FX(origin: Item, user: Char, bolt: Ballistica, callback: Callback): void {
    bolt = new Ballistica()._Ballistica(bolt.sourcePos, bolt.collisionPos, Ballistica.STOP_SOLID);
    this.cone = new ConeAOE()._ConeAOE$Ballistica$float$float$int(bolt, 8, 90, Ballistica.STOP_SOLID);
    let longestRay = null;
    for (const $it2 = this.cone.outerRays.iterator(); $it2.hasNext(); ) {
      let ray = $it2.next();
      if (longestRay == null || ray.dist > longestRay.dist) {
        longestRay = ray;
      }
      (user.sprite_.parent.recycle($J.cls(MagicMissile))).reset$int$Visual$int$Callback(MagicMissile.RAINBOW_CONE, user.sprite_, ray.path.get(ray.dist), null);
    }
    MagicMissile.boltFromChar(user.sprite_.parent, MagicMissile.RAINBOW_CONE, user.sprite_, longestRay.path.get($J.idiv(longestRay.dist, 2)), callback);
    Sample.INSTANCE.play$Object(Assets$Sounds.ZAP);
  }
  effect(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): boolean {
    let affectedChars = new ArrayList();
    if (this.cone == null && Actor.findChar(bolt.collisionPos) != null) {
      affectedChars.add(Actor.findChar(bolt.collisionPos));
    } else {
      for (const $it3 = this.cone.cells.iterator(); $it3.hasNext(); ) {
        let cell = $it3.next();
        if (cell === user.pos) {
          continue;
        }
        if (Actor.findChar(cell) != null) {
          affectedChars.add(Actor.findChar(cell));
        }
      }
    }
    CursedWand.tryForWandProc(Actor.findChar(bolt.collisionPos), origin);
    for (const $it4 = affectedChars.iterator(); $it4.hasNext(); ) {
      let ch = $it4.next();
      if (positiveOnly && ch.alignment === Char$Alignment.ALLY) {
        continue;
      } else {
        let dmg = Random.NormalIntRange((5 + Dungeon.scalingDepth()) | 0, (10 + Math.imul(Dungeon.scalingDepth(), 2)) | 0);
        {
          let burning: Burning, poison: Poison, ooze: Ooze;
          switch (Random.Int$int(5)) {
            case 0:
            default:
              burning = Buff.affect$Char$Class(ch, $J.cls(Burning));
              burning.reignite$Char(ch);
              ch.damage(dmg, burning);
              ch.sprite_.emitter().burst(FlameParticle.FACTORY, 20);
              break;
            case 1:
              ch.damage(dmg, new Frost()._Frost());
              if (ch.isAlive()) {
                Buff.affect$Char$Class$float(ch, $J.cls(Frost), Frost.DURATION);
              }
              Splash.at$PointF$int$int(ch.sprite_.center$(), -5056769, 20);
              break;
            case 2:
              poison = Buff.affect$Char$Class(ch, $J.cls(Poison));
              poison.set(Math.fround((3 + $J.idiv(Dungeon.scalingDepth(), 2)) | 0));
              ch.damage(dmg, poison);
              ch.sprite_.emitter().burst(PoisonParticle.SPLASH, 20);
              break;
            case 3:
              ooze = Buff.affect$Char$Class(ch, $J.cls(Ooze));
              ooze.set(Ooze.DURATION);
              ch.damage(dmg, ooze);
              Splash.at$PointF$int$int(ch.sprite_.center$(), 0, 20);
              break;
            case 4:
              ch.damage(dmg, new Electricity()._Electricity());
              if (ch.isAlive()) {
                Buff.affect$Char$Class$float(ch, $J.cls(Paralysis), Paralysis.DURATION);
              }
              ch.sprite_.emitter().burst(SparkParticle.FACTORY, 20);
              break;
          }
        }
        if (ch === Dungeon.hero && !ch.isAlive()) {
          if (user === Dungeon.hero && origin != null) {
            Badges.validateDeathFromFriendlyMagic();
            Dungeon.fail(origin);
            GLog.n(Messages.get$Class$String$ObjectArr($J.cls(CursedWand), 'ondeath', [origin.name()]), []);
          } else {
            Badges.validateDeathFromEnemyMagic();
            Dungeon.fail(user);
          }
        }
      }
    }
    return true;
  }
}

export class CursedWand$MassInvuln extends CursedWand$CursedEffect {
  _CursedWand$MassInvuln(): this {
    this._CursedWand$CursedEffect();
    return this;
  }
  FX(origin: Item, user: Char, bolt: Ballistica, callback: Callback): void {
    callback.call();
  }
  effect(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): boolean {
    for (const $it5 = Actor.chars().iterator(); $it5.hasNext(); ) {
      let ch = $it5.next();
      Buff.affect$Char$Class$float(ch, $J.cls(Invulnerability), 10);
      Buff.affect$Char$Class$float(ch, $J.cls(Bless), Bless.DURATION);
    }
    new Flare()._Flare(5, 48).color$int$boolean(16776960, true).show$Visual$float(user.sprite_, 3);
    GameScene.flash$int(-2130706624);
    Sample.INSTANCE.play$Object(Assets$Sounds.TELEPORT);
    GLog.p(Messages.get$Class$String$ObjectArr($J.cls(CursedWand), 'mass_invuln', []), []);
    return true;
  }
}

export class CursedWand$Petrify extends CursedWand$CursedEffect {
  _CursedWand$Petrify(): this {
    this._CursedWand$CursedEffect();
    return this;
  }
  valid(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): boolean {
    return user === Dungeon.hero;
  }
  FX(origin: Item, user: Char, bolt: Ballistica, callback: Callback): void {
    callback.call();
  }
  effect(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): boolean {
    Buff.affect$Char$Class$float(user, $J.cls(TimeStasis), 100);
    Sample.INSTANCE.play$Object(Assets$Sounds.TELEPORT);
    user.sprite_.emitter().burst(Speck.factory$int(Speck.STEAM), 10);
    GLog.w(Messages.get$Class$String$ObjectArr($J.cls(CursedWand), 'petrify', []), []);
    return true;
  }
}

export class CursedWand$ForestFire extends CursedWand$CursedEffect {
  _CursedWand$ForestFire(): this {
    this._CursedWand$CursedEffect();
    return this;
  }
  effect(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): boolean {
    for (let i = 0; i < Dungeon.level.length(); i++) {
      GameScene.add$Blob(Blob.seed$int$int$Class(i, 15, $J.cls(Regrowth)));
    }
    new Flare()._Flare(8, 32).color$int$boolean(16777062, true).show$Visual$float(user.sprite_, 2);
    Sample.INSTANCE.play$Object(Assets$Sounds.TELEPORT);
    GLog.p(Messages.get$Class$String$ObjectArr($J.cls(CursedWand), 'grass', []), []);
    if (!positiveOnly) {
      GLog.w(Messages.get$Class$String$ObjectArr($J.cls(CursedWand), 'fire', []), []);
      do {
        GameScene.add$Blob(Blob.seed$int$int$Class(Dungeon.level.randomDestination(null), 10, $J.cls(Fire)));
      } while (Random.Int$int(5) !== 0);
    }
    return true;
  }
}

export class CursedWand$SpawnGoldenMimic extends CursedWand$CursedEffect {
  _CursedWand$SpawnGoldenMimic(): this {
    this._CursedWand$CursedEffect();
    return this;
  }
  effect(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): boolean {
    let ch = Actor.findChar(bolt.collisionPos);
    let spawnCell = bolt.collisionPos;
    if (ch != null) {
      let candidates = new ArrayList();
      for (let n of PathFinder.NEIGHBOURS8) {
        let cell = (bolt.collisionPos + n) | 0;
        if (Dungeon.level.passable[cell] && Actor.findChar(cell) == null) {
          candidates.add(cell);
        }
      }
      if (!candidates.isEmpty()) {
        spawnCell = Random.element$Collection(candidates);
      } else {
        return false;
      }
    }
    let mimic = Mimic.spawnAt$int$Class$boolean$ItemArr(spawnCell, $J.cls(GoldenMimic), false, []);
    mimic.stopHiding();
    mimic.alignment = Char$Alignment.ENEMY;
    Sample.INSTANCE.play$Object$float$float(Assets$Sounds.MIMIC, 1, Math.fround(0.85));
    CellEmitter.get(mimic.pos).burst(Speck.factory$int(Speck.STAR), 10);
    mimic.items_.clear();
    GameScene.add$Mob(mimic);
    if (positiveOnly) {
      Buff.affect$Char$Class(mimic, $J.cls(ScrollOfSirensSong$Enthralled));
    } else {
      let reward: Item;
      do {
        reward = Generator.randomUsingDefaults$Category(Random.oneOf([Generator$Category.WEAPON, Generator$Category.ARMOR, Generator$Category.RING, Generator$Category.WAND]));
      } while (reward.level$() < 1);
      mimic.items_.add(reward);
    }
    Dungeon.level.occupyCell(mimic);
    return true;
  }
}

export class CursedWand$AbortRetryFail extends CursedWand$CursedEffect {
  _CursedWand$AbortRetryFail(): this {
    this._CursedWand$CursedEffect();
    return this;
  }
  effect(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): boolean {
    try {
      Dungeon.saveAll();
      if (Messages.lang() !== Languages.ENGLISH) {
        return false;
      } else {
        Game.runOnRenderThread(new (CursedWand$AbortRetryFail$1())().$o(this));
        return false;
      }
    } catch ($e6) {
      if ($J.isa($e6, IOException)) {
        let e = $J.exc($e6);
        Game.reportException(e);
        return false;
      } else {
        throw $e6;
      }
    }
  }
}

export class CursedWand$RandomTransmogrify extends CursedWand$CursedEffect {
  _CursedWand$RandomTransmogrify(): this {
    this._CursedWand$CursedEffect();
    return this;
  }
  valid(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): boolean {
    if (positiveOnly) {
      return true;
    } else if (origin == null || user !== Dungeon.hero || !Dungeon.hero.belongings.contains(origin)) {
      return false;
    } else {
      return true;
    }
  }
  effect(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): boolean {
    if (positiveOnly) {
      GameScene.show(new ScrollOfMetamorphosis$WndMetamorphChoose()._ScrollOfMetamorphosis$WndMetamorphChoose());
      return true;
    }
    if (origin == null || user !== Dungeon.hero || !Dungeon.hero.belongings.contains(origin)) {
      return false;
    }
    if (origin.isEquipped(Dungeon.hero) && origin instanceof EquipableItem) {
      origin.cursed = false;
      (origin).doUnequip$Hero$boolean(Dungeon.hero, false);
    } else {
      origin.detach(Dungeon.hero.belongings.backpack);
    }
    let result: Item;
    do {
      result = Generator.randomUsingDefaults$Category(Random.oneOf([Generator$Category.WEAPON, Generator$Category.ARMOR, Generator$Category.RING, Generator$Category.ARTIFACT]));
    } while (result.cursed);
    if (result.isUpgradable()) {
      result.upgrade$();
    }
    result.cursed = result.cursedKnown = true;
    if (origin instanceof Wand) {
      GLog.w(Messages.get$Class$String$ObjectArr($J.cls(CursedWand), 'transmogrify_wand', []), []);
    } else {
      GLog.w(Messages.get$Class$String$ObjectArr($J.cls(CursedWand), 'transmogrify_other', []), []);
    }
    Dungeon.level.drop(result, user.pos).sprite_.drop$();
    return true;
  }
}

export class CursedWand$HeroShapeShift extends CursedWand$CursedEffect {
  _CursedWand$HeroShapeShift(): this {
    this._CursedWand$CursedEffect();
    return this;
  }
  valid(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): boolean {
    return user instanceof Hero || Actor.findChar(bolt.collisionPos) instanceof Hero;
  }
  effect(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): boolean {
    if (user instanceof Hero) {
      Buff.affect$Char$Class$float(user, $J.cls(HeroDisguise), HeroDisguise.DURATION);
      GLog.w(Messages.get$Class$String$ObjectArr($J.cls(CursedWand), 'disguise', []), []);
      return true;
    } else if (Actor.findChar(bolt.collisionPos) instanceof Hero) {
      Buff.affect$Char$Class$float(Actor.findChar(bolt.collisionPos), $J.cls(HeroDisguise), HeroDisguise.DURATION);
      GLog.w(Messages.get$Class$String$ObjectArr($J.cls(CursedWand), 'disguise', []), []);
      return true;
    }
    return false;
  }
}

export class CursedWand$SuperNova extends CursedWand$CursedEffect {
  _CursedWand$SuperNova(): this {
    this._CursedWand$CursedEffect();
    return this;
  }
  effect(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): boolean {
    let nova = Buff.append$Char$Class(Dungeon.hero, $J.cls(SuperNovaTracker));
    nova.pos = bolt.collisionPos;
    nova.harmsAllies = !positiveOnly;
    if (positiveOnly) {
      GLog.p(Messages.get$Class$String$ObjectArr($J.cls(CursedWand), 'supernova_positive', []), []);
    } else {
      GLog.w(Messages.get$Class$String$ObjectArr($J.cls(CursedWand), 'supernova', []), []);
    }
    return true;
  }
}

export class CursedWand$SinkHole extends CursedWand$CursedEffect {
  _CursedWand$SinkHole(): this {
    this._CursedWand$CursedEffect();
    return this;
  }
  valid(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): boolean {
    if (Dungeon.bossLevel$() || Dungeon.depth > 25 || Dungeon.branch !== 0) {
      return false;
    }
    return true;
  }
  FX(origin: Item, user: Char, bolt: Ballistica, callback: Callback): void {
    callback.call();
  }
  effect(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): boolean {
    let passable = BArray.not(Dungeon.level.solid, null);
    BArray.or$booleanArr$booleanArr$booleanArr(passable, Dungeon.level.passable, passable);
    PathFinder.buildDistanceMap$int$booleanArr$int(user.pos, passable, 5);
    let positions = new ArrayList();
    for (let i = 0; i < PathFinder.distance.length; i++) {
      if (PathFinder.distance[i] < 2147483647) {
        if (!Dungeon.level.solid[i] || Dungeon.level.passable[i]) {
          CellEmitter.floor(i).burst(PitfallParticle.FACTORY4, 8);
          positions.add(i);
        }
      }
    }
    let p = Buff.append$Char$Class$float(Dungeon.hero, $J.cls(PitfallTrap$DelayedPit), 1);
    p.depth_ = Dungeon.depth;
    p.branch = Dungeon.branch;
    p.setPositions(positions);
    if (positiveOnly) {
      p.ignoreAllies = true;
      GLog.p(Messages.get$Class$String$ObjectArr($J.cls(CursedWand), 'sinkhole_positive', []), []);
    } else {
      GLog.w(Messages.get$Class$String$ObjectArr($J.cls(CursedWand), 'sinkhole', []), []);
    }
    return true;
  }
}

export class CursedWand$GravityChaos extends CursedWand$CursedEffect {
  _CursedWand$GravityChaos(): this {
    this._CursedWand$CursedEffect();
    return this;
  }
  FX(origin: Item, user: Char, bolt: Ballistica, callback: Callback): void {
    callback.call();
  }
  effect(origin: Item, user: Char, bolt: Ballistica, positiveOnly: boolean): boolean {
    Buff.append$Char$Class(user, $J.cls(GravityChaosTracker)).positiveOnly = positiveOnly;
    Sample.INSTANCE.play$Object(Assets$Sounds.TELEPORT);
    if (positiveOnly) {
      GLog.p(Messages.get$Class$String$ObjectArr($J.cls(CursedWand), 'gravity_positive', []), []);
    } else {
      GLog.w(Messages.get$Class$String$ObjectArr($J.cls(CursedWand), 'gravity', []), []);
    }
    return true;
  }
}

let $CursedWand$1: any = null;
/** An anonymous class (CursedWand.java:127). */
function CursedWand$1(): any {
  return $CursedWand$1 ??= $J.local(class extends JObject {
    call(): void {
      this.$cv_effect.effect(this.$cv_origin, this.$cv_user, this.$cv_bolt, this.$cv_positiveOnly);
      this.$cv_afterZap.call();
    }
    $c($effect, $origin, $user, $bolt, $positiveOnly, $afterZap): this {
      this.$cv_effect = $effect; this.$cv_origin = $origin; this.$cv_user = $user; this.$cv_bolt = $bolt; this.$cv_positiveOnly = $positiveOnly; this.$cv_afterZap = $afterZap;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$1', ['com.watabou.utils.Callback']);
}

let $CursedWand$AbortRetryFail$1$1: any = null;
/** An anonymous class (CursedWand.java:1115). */
function CursedWand$AbortRetryFail$1$1(): any {
  return $CursedWand$AbortRetryFail$1$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      Game.instance.finish();
    }
    onBackPressed(): void {
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$AbortRetryFail$1$1', []);
}

let $CursedWand$AbortRetryFail$1: any = null;
/** An anonymous class (CursedWand.java:1106). */
function CursedWand$AbortRetryFail$1(): any {
  return $CursedWand$AbortRetryFail$1 ??= $J.local(class extends JObject {
    call(): void {
      GameScene.show(new (CursedWand$AbortRetryFail$1$1())().$o(this)._WndOptions$Image$String$String$StringArr(Icons.get$Icons(Icons.WARNING), 'CURSED WAND ERROR', 'this application will now self-destruct', ['abort', 'retry', 'fail']));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$AbortRetryFail$1', ['com.watabou.utils.Callback']);
}

$J.define(CursedWand, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_CursedWand' }, clinit: true, lazy: ['EFFECT_CAT_CHANCES', 'COMMON_EFFECTS', 'UNCOMMON_EFFECTS', 'RARE_EFFECTS', 'VERY_RARE_EFFECTS'] });
$J.define(CursedWand$CursedEffect, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$CursedEffect', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_CursedWand$CursedEffect' } });
$J.define(CursedWand$BurnAndFreeze, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$BurnAndFreeze', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$CursedEffect', ctors: { '': '_CursedWand$BurnAndFreeze' } });
$J.define(CursedWand$SpawnRegrowth, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$SpawnRegrowth', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$CursedEffect', ctors: { '': '_CursedWand$SpawnRegrowth' } });
$J.define(CursedWand$RandomTeleport, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$RandomTeleport', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$CursedEffect', ctors: { '': '_CursedWand$RandomTeleport' } });
$J.define(CursedWand$RandomGas, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$RandomGas', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$CursedEffect', ctors: { '': '_CursedWand$RandomGas' } });
$J.define(CursedWand$RandomAreaEffect, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$RandomAreaEffect', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$CursedEffect', ctors: { '': '_CursedWand$RandomAreaEffect' } });
$J.define(CursedWand$Bubbles, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$Bubbles', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$CursedEffect', ctors: { '': '_CursedWand$Bubbles' } });
$J.define(CursedWand$RandomWand, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$RandomWand', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$CursedEffect', ctors: { '': '_CursedWand$RandomWand' } });
$J.define(CursedWand$SelfOoze, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$SelfOoze', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$CursedEffect', ctors: { '': '_CursedWand$SelfOoze' } });
$J.define(CursedWand$RandomPlant, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$RandomPlant', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$CursedEffect', ctors: { '': '_CursedWand$RandomPlant' } });
$J.define(CursedWand$HealthTransfer, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$HealthTransfer', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$CursedEffect', ctors: { '': '_CursedWand$HealthTransfer' } });
$J.define(CursedWand$Explosion, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$Explosion', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$CursedEffect', ctors: { '': '_CursedWand$Explosion' } });
$J.define(CursedWand$LightningBolt, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$LightningBolt', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$CursedEffect', ctors: { '': '_CursedWand$LightningBolt' } });
$J.define(CursedWand$Geyser, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$Geyser', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$CursedEffect', ctors: { '': '_CursedWand$Geyser' } });
$J.define(CursedWand$SummonSheep, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$SummonSheep', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$CursedEffect', ctors: { '': '_CursedWand$SummonSheep' } });
$J.define(CursedWand$Levitate, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$Levitate', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$CursedEffect', ctors: { '': '_CursedWand$Levitate' } });
$J.define(CursedWand$Alarm, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$Alarm', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$CursedEffect', ctors: { '': '_CursedWand$Alarm' } });
$J.define(CursedWand$SheepPolymorph, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$SheepPolymorph', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$CursedEffect', ctors: { '': '_CursedWand$SheepPolymorph' } });
$J.define(CursedWand$CurseEquipment, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$CurseEquipment', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$CursedEffect', ctors: { '': '_CursedWand$CurseEquipment' } });
$J.define(CursedWand$InterFloorTeleport, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$InterFloorTeleport', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$CursedEffect', ctors: { '': '_CursedWand$InterFloorTeleport' } });
$J.define(CursedWand$SummonMonsters, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$SummonMonsters', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$CursedEffect', ctors: { '': '_CursedWand$SummonMonsters' } });
$J.define(CursedWand$FireBall, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$FireBall', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$CursedEffect', ctors: { '': '_CursedWand$FireBall' } });
$J.define(CursedWand$ConeOfColors, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$ConeOfColors', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$CursedEffect', ctors: { '': '_CursedWand$ConeOfColors' } });
$J.define(CursedWand$MassInvuln, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$MassInvuln', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$CursedEffect', ctors: { '': '_CursedWand$MassInvuln' } });
$J.define(CursedWand$Petrify, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$Petrify', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$CursedEffect', ctors: { '': '_CursedWand$Petrify' } });
$J.define(CursedWand$ForestFire, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$ForestFire', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$CursedEffect', ctors: { '': '_CursedWand$ForestFire' } });
$J.define(CursedWand$SpawnGoldenMimic, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$SpawnGoldenMimic', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$CursedEffect', ctors: { '': '_CursedWand$SpawnGoldenMimic' } });
$J.define(CursedWand$AbortRetryFail, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$AbortRetryFail', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$CursedEffect', ctors: { '': '_CursedWand$AbortRetryFail' } });
$J.define(CursedWand$RandomTransmogrify, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$RandomTransmogrify', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$CursedEffect', ctors: { '': '_CursedWand$RandomTransmogrify' } });
$J.define(CursedWand$HeroShapeShift, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$HeroShapeShift', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$CursedEffect', ctors: { '': '_CursedWand$HeroShapeShift' } });
$J.define(CursedWand$SuperNova, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$SuperNova', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$CursedEffect', ctors: { '': '_CursedWand$SuperNova' } });
$J.define(CursedWand$SinkHole, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$SinkHole', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$CursedEffect', ctors: { '': '_CursedWand$SinkHole' } });
$J.define(CursedWand$GravityChaos, 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$GravityChaos', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand$CursedEffect', ctors: { '': '_CursedWand$GravityChaos' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Blob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob');
  ConfusionGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.ConfusionGas');
  Electricity = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Electricity');
  Fire = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Fire');
  ParalyticGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.ParalyticGas');
  Regrowth = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Regrowth');
  ToxicGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.ToxicGas');
  Bless = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Bless');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Burning = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Burning');
  Frost = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Frost');
  GravityChaosTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.GravityChaosTracker');
  HeroDisguise = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.HeroDisguise');
  Hex = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Hex');
  Invulnerability = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invulnerability');
  Levitation = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Levitation');
  Ooze = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Ooze');
  Paralysis = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Paralysis');
  Poison = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Poison');
  Recharging = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Recharging');
  SuperNovaTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.SuperNovaTracker');
  TimeStasis = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.TimeStasis');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  GoldenMimic = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GoldenMimic');
  Mimic = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mimic');
  Piranha = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Piranha');
  NPC = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.NPC');
  Sheep = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Sheep');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Flare = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Flare');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  Lightning = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Lightning');
  MagicMissile = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  SpellSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.SpellSprite');
  Splash = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Splash');
  FlameParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.FlameParticle');
  PitfallParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.PitfallParticle');
  PoisonParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.PoisonParticle');
  ShadowParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShadowParticle');
  SparkParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.SparkParticle');
  EquipableItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.EquipableItem');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  Bomb$ConjuredBomb = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bombs.Bomb$ConjuredBomb');
  ScrollOfMirrorImage = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfMirrorImage');
  ScrollOfRecharging = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRecharging');
  ScrollOfTeleportation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation');
  ScrollOfChallenge$ChallengeArena = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfChallenge$ChallengeArena');
  ScrollOfMetamorphosis$WndMetamorphChoose = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfMetamorphosis$WndMetamorphChoose');
  ScrollOfSirensSong$Enthralled = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfSirensSong$Enthralled');
  WondrousResin = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.WondrousResin');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  WandOfBlastWave$BlastWave = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfBlastWave$BlastWave');
  Level = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  BurningTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.BurningTrap');
  ChillingTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.ChillingTrap');
  CursingTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.CursingTrap');
  FlockTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.FlockTrap');
  GeyserTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.GeyserTrap');
  PitfallTrap$DelayedPit = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.PitfallTrap$DelayedPit');
  ShockingTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.ShockingTrap');
  SummoningTrap = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.SummoningTrap');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  ConeAOE = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.ConeAOE');
  ShadowCaster = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.ShadowCaster');
  Languages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Languages');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  InterlevelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene');
  InterlevelScene$Mode = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene$Mode');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  TargetHealthIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.TargetHealthIndicator');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  Game = $J.load('com.watabou.noosa.Game');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
