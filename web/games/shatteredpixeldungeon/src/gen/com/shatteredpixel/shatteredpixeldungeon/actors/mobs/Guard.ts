// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Guard.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Dungeon, Dungeon$LimitedDrops, Actor, Char, Char$Property, Buff, Cripple, Chains, Effects$Type, Pushing, Generator$Category, Item, Ballistica, Messages, GameScene, GuardSprite, Sample, Random;

export class Guard extends Mob {
  chainsUsed: boolean = false;
  CHAINSUSED: string = null;
  _Guard(): this {
    this._Mob();
    this.chainsUsed = false;
    this.spriteClass = $J.cls(GuardSprite);
    this.HP = this.HT = 40;
    this.defenseSkill_ = 10;
    this.EXP = 7;
    this.maxLvl = 14;
    this.loot = Generator$Category.ARMOR;
    this.lootChance_ = Math.fround(0.2);
    this.properties_.add(Char$Property.UNDEAD);
    this.HUNTING = new Guard$Hunting().$o(this)._Guard$Hunting();
    this.CHAINSUSED = 'chainsused';
    return this;
  }
  damageRoll(): number {
    return Random.NormalIntRange(4, 12);
  }
  chain(target: number): boolean {
    if (this.chainsUsed || this.enemy.properties().contains(Char$Property.IMMOVABLE)) {
      return false;
    }
    let chain = new Ballistica()._Ballistica(this.pos, target, Ballistica.PROJECTILE);
    if (chain.collisionPos !== this.enemy.pos || chain.path.size() < 2 || Dungeon.level.pit[chain.path.get(1)]) {
      return false;
    } else {
      let newPos = -1;
      for (const $it0 = chain.subPath(1, chain.dist).iterator(); $it0.hasNext(); ) {
        let i = $it0.next();
        if (!Dungeon.level.solid[i] && Actor.findChar(i) == null && (Dungeon.level.openSpace[i] || !Char.hasProp(this.enemy, Char$Property.LARGE))) {
          newPos = i;
          break;
        }
      }
      if (newPos === -1) {
        return false;
      } else {
        let newPosFinal = newPos;
        this.target = newPos;
        if (this.sprite_.visible_ || this.enemy.sprite_.visible_) {
          this.yell(Messages.get$Object$String$ObjectArr(this, 'scorpion', []));
          new Item()._Item().throwSound();
          Sample.INSTANCE.play$Object(Assets$Sounds.CHAINS);
          this.sprite_.parent.add$Gizmo(new Chains()._Chains$PointF$PointF$Type$Callback(this.sprite_.center$(), this.enemy.sprite_.destinationCenter(), Effects$Type.CHAIN, new (Guard$1())().$o(this).$c(newPosFinal)));
        } else {
          this.pullEnemy(this.enemy, newPos);
        }
      }
    }
    this.chainsUsed = true;
    return true;
  }
  pullEnemy(enemy: Char, pullPos: number): void {
    enemy.pos = pullPos;
    enemy.sprite_.place(pullPos);
    Dungeon.level.occupyCell(enemy);
    Buff.prolong(enemy, $J.cls(Cripple), 4);
    if (enemy === Dungeon.hero) {
      Dungeon.hero.interrupt();
      Dungeon.observe$();
      GameScene.updateFog$();
    } else {
      enemy.sprite_.visible_ = Dungeon.level.heroFOV[pullPos];
    }
  }
  attackSkill(target: Char): number {
    return 12;
  }
  drRoll(): number {
    return (super.drRoll() + Random.NormalIntRange(0, 7)) | 0;
  }
  lootChance(): number {
    return Math.fround(super.lootChance() * Math.fround($J.pow(Math.fround(1 / 3), Dungeon$LimitedDrops.GUARD_ARM.count_)));
  }
  createLoot(): Item {
    Dungeon$LimitedDrops.GUARD_ARM.count_++;
    return super.createLoot();
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$boolean(this.CHAINSUSED, this.chainsUsed);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.chainsUsed = bundle.getBoolean(this.CHAINSUSED);
  }
}

export class Guard$Hunting extends Mob$Hunting {
  _Guard$Hunting(): this {
    this._Mob$Hunting();
    return this;
  }
  act(enemyInFOV: boolean, justAlerted: boolean): boolean {
    this.$outer.enemySeen = enemyInFOV;
    if (!this.$outer.chainsUsed && enemyInFOV && !this.$outer.isCharmedBy(this.$outer.enemy) && !this.$outer.canAttack(this.$outer.enemy) && Dungeon.level.distance(this.$outer.pos, this.$outer.enemy.pos) < 5 && this.$outer.chain(this.$outer.enemy.pos)) {
      return !(this.$outer.sprite_.visible_ || this.$outer.enemy.sprite_.visible_);
    } else {
      return super.act(enemyInFOV, justAlerted);
    }
  }
}

let $Guard$1$1: any = null;
/** An anonymous class (Guard.java:106). */
function Guard$1$1(): any {
  return $Guard$1$1 ??= $J.local(class extends JObject {
    call(): void {
      this.$outer.$outer.pullEnemy(this.$outer.$outer.enemy, this.$cv_newPosFinal);
    }
    $c($newPosFinal): this {
      this.$cv_newPosFinal = $newPosFinal;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Guard$1$1', ['com.watabou.utils.Callback']);
}

let $Guard$1: any = null;
/** An anonymous class (Guard.java:104). */
function Guard$1(): any {
  return $Guard$1 ??= $J.local(class extends JObject {
    call(): void {
      Actor.add$Actor(new Pushing()._Pushing$Char$int$int$Callback(this.$outer.enemy, this.$outer.enemy.pos, this.$cv_newPosFinal, new (Guard$1$1())().$o(this).$c(this.$cv_newPosFinal)));
      this.$outer.next();
    }
    $c($newPosFinal): this {
      this.$cv_newPosFinal = $newPosFinal;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Guard$1', ['com.watabou.utils.Callback']);
}

$J.define(Guard, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Guard', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_Guard' } });
$J.define(Guard$Hunting, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Guard$Hunting', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Hunting', ctors: { '': '_Guard$Hunting' }, inner: true });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Dungeon$LimitedDrops = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon$LimitedDrops');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Cripple = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Cripple');
  Chains = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Chains');
  Effects$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Effects$Type');
  Pushing = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Pushing');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  GuardSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.GuardSprite');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Random = $J.load('com.watabou.utils.Random');
});
