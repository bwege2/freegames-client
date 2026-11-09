// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Necromancer.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Mob$Hunting } from './Mob.ts';
import { Skeleton } from './Skeleton.ts';
import { SkeletonSprite } from '../../sprites/SkeletonSprite.ts';

let Assets$Sounds, Badges, Dungeon, Dungeon$LimitedDrops, Actor, Char, Char$Property, Adrenaline, Buff, Beam$HealthRay, FloatingText, Pushing, PotionOfHealing, ScrollOfTeleportation, Messages, GameScene, CharSprite, NecromancerSprite, GLog, Sample, BArray, PathFinder, Random;

export class Necromancer extends Mob {
  summoning: boolean = false;
  summoningPos: number = 0;
  firstSummon: boolean = false;
  mySkeleton: Necromancer$NecroSkeleton = null;
  storedSkeletonID: number = 0;
  static readonly SUMMONING: string = 'summoning';
  static readonly FIRST_SUMMON: string = 'first_summon';
  static readonly SUMMONING_POS: string = 'summoning_pos';
  static readonly MY_SKELETON: string = 'my_skeleton';
  _Necromancer(): this {
    this._Mob();
    this.spriteClass = $J.cls(NecromancerSprite);
    this.HP = this.HT = 40;
    this.defenseSkill_ = 14;
    this.EXP = 7;
    this.maxLvl = 14;
    this.loot = $J.cls(PotionOfHealing);
    this.lootChance_ = Math.fround(0.2);
    this.properties_.add(Char$Property.UNDEAD);
    this.HUNTING = new Necromancer$Hunting().$o(this)._Necromancer$Hunting();
    this.summoning = false;
    this.summoningPos = -1;
    this.firstSummon = true;
    this.storedSkeletonID = -1;
    return this;
  }
  act(): boolean {
    if (this.summoning && this.state_ !== this.HUNTING) {
      this.summoning = false;
      if (this.sprite_ instanceof NecromancerSprite) {
        (this.sprite_).cancelSummoning();
      }
    }
    return super.act();
  }
  aggro(ch: Char): void {
    super.aggro(ch);
    if (this.mySkeleton != null && this.mySkeleton.isAlive() && Dungeon.level.mobs.contains(this.mySkeleton) && this.mySkeleton.alignment === this.alignment) {
      this.mySkeleton.aggro(ch);
    }
  }
  drRoll(): number {
    return (super.drRoll() + Random.NormalIntRange(0, 5)) | 0;
  }
  lootChance(): number {
    return Math.fround(super.lootChance() * (Math.fround((Math.fround(6 - Dungeon$LimitedDrops.NECRO_HP.count_)) / 6)));
  }
  createLoot(): Item {
    Dungeon$LimitedDrops.NECRO_HP.count_++;
    return super.createLoot();
  }
  die(cause: any): void {
    if (this.storedSkeletonID !== -1) {
      let ch = Actor.findById(this.storedSkeletonID);
      this.storedSkeletonID = -1;
      if (ch instanceof Necromancer$NecroSkeleton) {
        this.mySkeleton = ch;
      }
    }
    if (this.mySkeleton != null && this.mySkeleton.isAlive() && this.mySkeleton.alignment === this.alignment) {
      this.mySkeleton.die(null);
    }
    super.die(cause);
  }
  canAttack(enemy: Char): boolean {
    return false;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$boolean(Necromancer.SUMMONING, this.summoning);
    bundle.put$String$boolean(Necromancer.FIRST_SUMMON, this.firstSummon);
    if (this.summoning) {
      bundle.put$String$int(Necromancer.SUMMONING_POS, this.summoningPos);
    }
    if (this.mySkeleton != null) {
      bundle.put$String$int(Necromancer.MY_SKELETON, this.mySkeleton.id());
    } else if (this.storedSkeletonID !== -1) {
      bundle.put$String$int(Necromancer.MY_SKELETON, this.storedSkeletonID);
    }
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.summoning = bundle.getBoolean(Necromancer.SUMMONING);
    if (bundle.contains(Necromancer.FIRST_SUMMON)) {
      this.firstSummon = bundle.getBoolean(Necromancer.FIRST_SUMMON);
    }
    if (this.summoning) {
      this.summoningPos = bundle.getInt(Necromancer.SUMMONING_POS);
    }
    if (bundle.contains(Necromancer.MY_SKELETON)) {
      this.storedSkeletonID = bundle.getInt(Necromancer.MY_SKELETON);
    }
  }
  onZapComplete(): void {
    if (this.mySkeleton == null || this.mySkeleton.sprite_ == null || !this.mySkeleton.isAlive()) {
      return;
    }
    if (this.mySkeleton.HP < this.mySkeleton.HT) {
      if (this.sprite_.visible_ || this.mySkeleton.sprite_.visible_) {
        this.sprite_.parent.add$Gizmo(new Beam$HealthRay()._Beam$HealthRay(this.sprite_.center$(), this.mySkeleton.sprite_.center$()));
        Sample.INSTANCE.play$Object(Assets$Sounds.RAY);
      }
      this.mySkeleton.HP = Math.min((this.mySkeleton.HP + $J.idiv(this.mySkeleton.HT, 5)) | 0, this.mySkeleton.HT);
      if (this.mySkeleton.sprite_.visible_) {
        this.mySkeleton.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String($J.idiv(this.mySkeleton.HT, 5)), FloatingText.HEALING, []);
      }
    } else if (this.mySkeleton.buff($J.cls(Adrenaline)) == null) {
      if (this.sprite_.visible_ || this.mySkeleton.sprite_.visible_) {
        this.sprite_.parent.add$Gizmo(new Beam$HealthRay()._Beam$HealthRay(this.sprite_.center$(), this.mySkeleton.sprite_.center$()));
        Sample.INSTANCE.play$Object(Assets$Sounds.RAY);
      }
      Buff.affect$Char$Class$float(this.mySkeleton, $J.cls(Adrenaline), 3);
    }
    this.next();
  }
  summonMinion(): void {
    let existing = Actor.findChar(this.summoningPos);
    if ((existing != null && existing !== this.mySkeleton) || !Dungeon.level.passable[this.summoningPos]) {
      let pushPos = this.pos;
      for (let c of PathFinder.NEIGHBOURS8) {
        if ((Actor.findChar((this.summoningPos + c) | 0)) == null && Dungeon.level.passable[(this.summoningPos + c) | 0] && (Dungeon.level.openSpace[(this.summoningPos + c) | 0] || !Char.hasProp(Actor.findChar(this.summoningPos), Char$Property.LARGE)) && Dungeon.level.trueDistance(this.pos, (this.summoningPos + c) | 0) > Dungeon.level.trueDistance(this.pos, pushPos)) {
          pushPos = (this.summoningPos + c) | 0;
        }
      }
      if (pushPos !== this.pos) {
        let ch = Actor.findChar(this.summoningPos);
        if (ch == null || Char.hasProp(ch, Char$Property.IMMOVABLE)) {
          this.summoningPos = pushPos;
        } else {
          Actor.add$Actor(new Pushing()._Pushing$Char$int$int(ch, ch.pos, pushPos));
          ch.pos = pushPos;
          Dungeon.level.occupyCell(ch);
        }
      } else {
        let blocker = Actor.findChar(this.summoningPos);
        if (blocker != null && blocker.alignment !== this.alignment) {
          blocker.damage(Random.NormalIntRange(2, 10), new Necromancer$SummoningBlockDamage()._Necromancer$SummoningBlockDamage());
          if (blocker === Dungeon.hero && !blocker.isAlive()) {
            Badges.validateDeathFromEnemyMagic();
            Dungeon.fail(this);
            GLog.n(Messages.capitalize(Messages.get$Class$String$ObjectArr($J.cls(Char), 'kill', [this.name()])), []);
          }
        }
        this.spend(Actor.TICK);
        return;
      }
    }
    this.summoning = this.firstSummon = false;
    if (this.mySkeleton == null || !this.mySkeleton.isActive()) {
      this.mySkeleton = new Necromancer$NecroSkeleton()._Necromancer$NecroSkeleton();
      this.mySkeleton.pos = this.summoningPos;
      GameScene.add$Mob(this.mySkeleton);
      Dungeon.level.occupyCell(this.mySkeleton);
      for (const $it0 = this.buffs$().iterator(); $it0.hasNext(); ) {
        let b = $it0.next();
        if (b.revivePersists) {
          Buff.affect$Char$Class(this.mySkeleton, b.getClass());
        }
      }
    } else {
      ScrollOfTeleportation.appear(this.mySkeleton, this.summoningPos);
    }
    (this.sprite_).finishSummoning();
  }
}

export class Necromancer$SummoningBlockDamage extends JObject {
  _Necromancer$SummoningBlockDamage(): this {
    return this;
  }
}

export class Necromancer$Hunting extends Mob$Hunting {
  _Necromancer$Hunting(): this {
    this._Mob$Hunting();
    return this;
  }
  act(enemyInFOV: boolean, justAlerted: boolean): boolean {
    this.$outer.enemySeen = enemyInFOV;
    if (this.$outer.enemySeen) {
      this.$outer.target = this.$outer.enemy.pos;
    }
    if (this.$outer.storedSkeletonID !== -1) {
      let ch = Actor.findById(this.$outer.storedSkeletonID);
      this.$outer.storedSkeletonID = -1;
      if (ch instanceof Necromancer$NecroSkeleton) {
        this.$outer.mySkeleton = ch;
      }
    }
    if (this.$outer.summoning) {
      this.$outer.summonMinion();
      return true;
    }
    if (this.$outer.mySkeleton != null && (!this.$outer.mySkeleton.isAlive() || !Dungeon.level.mobs.contains(this.$outer.mySkeleton) || this.$outer.mySkeleton.alignment !== this.$outer.alignment)) {
      this.$outer.mySkeleton = null;
    }
    if (this.$outer.enemySeen && Dungeon.level.distance(this.$outer.pos, this.$outer.enemy.pos) <= 4 && this.$outer.mySkeleton == null) {
      this.$outer.summoningPos = -1;
      let passable = BArray.not(Dungeon.level.solid, null);
      BArray.or$booleanArr$booleanArr$booleanArr(Dungeon.level.passable, passable, passable);
      PathFinder.buildDistanceMap$int$booleanArr$int(this.$outer.pos, passable, (Dungeon.level.distance(this.$outer.pos, this.$outer.enemy.pos) + 3) | 0);
      for (let c of PathFinder.NEIGHBOURS8) {
        if ((Actor.findChar((this.$outer.enemy.pos + c) | 0)) == null && (PathFinder.distance[(this.$outer.enemy.pos + c) | 0]) !== 2147483647 && Dungeon.level.passable[(this.$outer.enemy.pos + c) | 0] && (!Char.hasProp(this.$outer, Char$Property.LARGE) || Dungeon.level.openSpace[(this.$outer.enemy.pos + c) | 0]) && this.$outer.fieldOfView[(this.$outer.enemy.pos + c) | 0] && Dungeon.level.trueDistance(this.$outer.pos, (this.$outer.enemy.pos + c) | 0) < Dungeon.level.trueDistance(this.$outer.pos, this.$outer.summoningPos)) {
          this.$outer.summoningPos = (this.$outer.enemy.pos + c) | 0;
        }
      }
      if (this.$outer.summoningPos !== -1) {
        this.$outer.summoning = true;
        this.$outer.sprite_.zap$int(this.$outer.summoningPos);
        if (Dungeon.level.heroFOV[this.$outer.pos] || Dungeon.level.heroFOV[this.$outer.summoningPos]) {
          Dungeon.hero.interrupt();
        }
        this.$outer.spend(this.$outer.firstSummon ? Actor.TICK : Math.fround(2 * Actor.TICK));
      } else {
        this.$outer.spend(Actor.TICK);
      }
      return true;
    } else if (this.$outer.enemySeen && this.$outer.mySkeleton != null) {
      this.$outer.spend(Actor.TICK);
      let teleporting = false;
      if (!this.$outer.fieldOfView[this.$outer.mySkeleton.pos]) {
        teleporting = true;
      } else if (!this.$outer.mySkeleton.canAttack(this.$outer.enemy)) {
        let skelePath = Dungeon.findPath(this.$outer.mySkeleton, this.$outer.enemy.pos, Dungeon.level.passable, this.$outer.fieldOfView, true);
        if (skelePath == null || (skelePath.size() > Math.imul(2, Dungeon.level.distance(this.$outer.pos, this.$outer.enemy.pos)) && skelePath.size() >= 4)) {
          teleporting = true;
        }
      }
      if (teleporting) {
        if (!Dungeon.level.adjacent(this.$outer.mySkeleton.pos, this.$outer.enemy.pos)) {
          let telePos = -1;
          for (let c of PathFinder.NEIGHBOURS8) {
            if ((Actor.findChar((this.$outer.enemy.pos + c) | 0)) == null && Dungeon.level.passable[(this.$outer.enemy.pos + c) | 0] && this.$outer.fieldOfView[(this.$outer.enemy.pos + c) | 0] && (Dungeon.level.openSpace[(this.$outer.enemy.pos + c) | 0] || !Char.hasProp(this.$outer.mySkeleton, Char$Property.LARGE)) && Dungeon.level.trueDistance(this.$outer.pos, (this.$outer.enemy.pos + c) | 0) < Dungeon.level.trueDistance(this.$outer.pos, telePos)) {
              telePos = (this.$outer.enemy.pos + c) | 0;
            }
          }
          if (telePos !== -1) {
            if (this.$outer.sprite_ != null && this.$outer.sprite_.visible_) {
              this.$outer.summoning = true;
              this.$outer.summoningPos = telePos;
              this.$outer.sprite_.zap$int(telePos);
              if (Dungeon.level.heroFOV[this.$outer.pos] || Dungeon.level.heroFOV[this.$outer.summoningPos]) {
                Dungeon.hero.interrupt();
              }
              this.$outer.spend(Actor.TICK);
            }
          }
        }
        return true;
      } else {
        if (this.$outer.mySkeleton.HP < this.$outer.mySkeleton.HT || this.$outer.mySkeleton.buff($J.cls(Adrenaline)) == null) {
          if (this.$outer.sprite_ != null && this.$outer.sprite_.visible_) {
            this.$outer.sprite_.zap$int(this.$outer.mySkeleton.pos);
            return false;
          } else {
            this.$outer.onZapComplete();
          }
        }
      }
      return true;
    } else {
      return super.act(enemyInFOV, justAlerted);
    }
  }
}

export class Necromancer$NecroSkeleton extends Skeleton {
  _Necromancer$NecroSkeleton(): this {
    this._Skeleton();
    this.state_ = this.WANDERING;
    this.spriteClass = $J.cls(Necromancer$NecroSkeleton$NecroSkeletonSprite);
    this.maxLvl = -5;
    this.HP = 20;
    return this;
  }
  spawningWeight(): number {
    return 0;
  }
}

export class Necromancer$NecroSkeleton$NecroSkeletonSprite extends SkeletonSprite {
  _Necromancer$NecroSkeleton$NecroSkeletonSprite(): this {
    this._SkeletonSprite();
    this.brightness(0.75);
    return this;
  }
  resetColor(): void {
    super.resetColor();
    this.brightness(0.75);
  }
}

$J.define(Necromancer, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Necromancer', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_Necromancer' } });
$J.define(Necromancer$SummoningBlockDamage, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Necromancer$SummoningBlockDamage', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Necromancer$SummoningBlockDamage' } });
$J.define(Necromancer$Hunting, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Necromancer$Hunting', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Hunting', ctors: { '': '_Necromancer$Hunting' }, inner: true });
$J.define(Necromancer$NecroSkeleton, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Necromancer$NecroSkeleton', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Skeleton', ctors: { '': '_Necromancer$NecroSkeleton' } });
$J.define(Necromancer$NecroSkeleton$NecroSkeletonSprite, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Necromancer$NecroSkeleton$NecroSkeletonSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.SkeletonSprite', ctors: { '': '_Necromancer$NecroSkeleton$NecroSkeletonSprite' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Dungeon$LimitedDrops = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon$LimitedDrops');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Adrenaline = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Adrenaline');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Beam$HealthRay = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Beam$HealthRay');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  Pushing = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Pushing');
  PotionOfHealing = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfHealing');
  ScrollOfTeleportation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  NecromancerSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.NecromancerSprite');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
