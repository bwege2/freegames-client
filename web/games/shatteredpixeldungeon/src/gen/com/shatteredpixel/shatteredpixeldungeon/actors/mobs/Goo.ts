// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Goo.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../jre/index.ts';
import { Mob } from './Mob.ts';

let Badges, Challenges, Dungeon, Statistics, Actor, Char$Property, Buff, Invisibility, LockedFloor, Ooze, FloatingText, DriedRose$GhostHero, WornKey, GooBlob, Ballistica, Messages, GameScene, PixelScene, CharSprite, GooSprite, BossHealthBar, GLog, GameMath, PathFinder, Random;

export class Goo extends Mob {
  pumpedUp: number = 0;
  healInc: number = 0;
  PUMPEDUP: string = null;
  HEALINC: string = null;
  _Goo(): this {
    this._Mob();
    this.HP = this.HT = Dungeon.isChallenged(Challenges.STRONGER_BOSSES) ? 120 : 100;
    this.EXP = 10;
    this.defenseSkill_ = 8;
    this.spriteClass = $J.cls(GooSprite);
    this.properties_.add(Char$Property.BOSS);
    this.properties_.add(Char$Property.DEMONIC);
    this.properties_.add(Char$Property.ACIDIC);
    this.pumpedUp = 0;
    this.healInc = 1;
    this.PUMPEDUP = 'pumpedup';
    this.HEALINC = 'healinc';
    return this;
  }
  damageRoll(): number {
    let min = 1;
    let max = (Math.imul(this.HP, 2) <= this.HT) ? 12 : 8;
    if (this.pumpedUp > 0) {
      this.pumpedUp = 0;
      if (this.enemy === Dungeon.hero) {
        Statistics.qualifiedForBossChallengeBadge = false;
        Statistics.bossScores[0] = (Statistics.bossScores[0] - 100) | 0;
      }
      return Random.NormalIntRange(Math.imul(min, 3), Math.imul(max, 3));
    } else {
      return Random.NormalIntRange(min, max);
    }
  }
  attackSkill(target: Char): number {
    let attack = 10;
    if (Math.imul(this.HP, 2) <= this.HT) {
      attack = 15;
    }
    if (this.pumpedUp > 0) {
      attack = Math.imul(attack, 2);
    }
    return attack;
  }
  defenseSkill(enemy: Char): number {
    return $J.d2i((super.defenseSkill(enemy) * ((Math.imul(this.HP, 2) <= this.HT) ? 1.5 : 1)));
  }
  drRoll(): number {
    return (super.drRoll() + Random.NormalIntRange(0, 2)) | 0;
  }
  act(): boolean {
    if (this.state_ !== this.HUNTING && this.pumpedUp > 0) {
      this.pumpedUp = 0;
      this.sprite_.idle();
    }
    if (!this.flying && Dungeon.level.water[this.pos] && this.HP < this.HT) {
      this.HP = (this.HP + this.healInc) | 0;
      Statistics.qualifiedForBossChallengeBadge = false;
      let lock = Dungeon.hero.buff($J.cls(LockedFloor));
      if (lock != null) {
        if (Dungeon.isChallenged(Challenges.STRONGER_BOSSES)) {
          lock.removeTime(Math.fround(this.healInc));
        } else {
          lock.removeTime(Math.fround(this.healInc * 1.5));
        }
      }
      if (Dungeon.level.heroFOV[this.pos]) {
        this.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String(this.healInc), FloatingText.HEALING, []);
      }
      if (Dungeon.isChallenged(Challenges.STRONGER_BOSSES) && this.healInc < 3) {
        this.healInc++;
      }
      if (Math.imul(this.HP, 2) > this.HT) {
        BossHealthBar.bleed(false);
        (this.sprite_).spray(false);
        this.HP = Math.min(this.HP, this.HT);
      }
    } else {
      this.healInc = 1;
    }
    if (this.state_ !== this.SLEEPING) {
      Dungeon.level.seal();
    }
    return super.act();
  }
  canAttack(enemy: Char): boolean {
    if (this.pumpedUp > 0) {
      return Dungeon.level.distance(enemy.pos, this.pos) <= 2 && (new Ballistica()._Ballistica(this.pos, enemy.pos, Ballistica.STOP_TARGET | Ballistica.STOP_SOLID | Ballistica.IGNORE_SOFT_SOLID)).collisionPos === enemy.pos && (new Ballistica()._Ballistica(enemy.pos, this.pos, Ballistica.STOP_TARGET | Ballistica.STOP_SOLID | Ballistica.IGNORE_SOFT_SOLID)).collisionPos === this.pos;
    } else {
      return super.canAttack(enemy);
    }
  }
  attackProc(enemy: Char, damage: number): number {
    damage = super.attackProc(enemy, damage);
    if (Random.Int$int(3) === 0) {
      Buff.affect$Char$Class(enemy, $J.cls(Ooze)).set(Ooze.DURATION);
      enemy.sprite_.burst(0, 5);
    }
    if (this.pumpedUp > 0) {
      PixelScene.shake(3, Math.fround(0.2));
    }
    return damage;
  }
  updateSpriteState(): void {
    super.updateSpriteState();
    if (this.pumpedUp > 0) {
      (this.sprite_).pumpUp(this.pumpedUp);
    }
  }
  doAttack(enemy: Char): boolean {
    if (this.pumpedUp === 1) {
      this.pumpedUp++;
      (this.sprite_).pumpUp(this.pumpedUp);
      this.spend(this.attackDelay());
      return true;
    } else if (this.pumpedUp >= 2 || (Random.Int$int((Math.imul(this.HP, 2) <= this.HT) ? 2 : 5)) > 0) {
      let visible = Dungeon.level.heroFOV[this.pos];
      if (visible) {
        if (this.pumpedUp >= 2) {
          (this.sprite_).pumpAttack();
        } else {
          this.sprite_.attack$int(enemy.pos);
        }
      } else {
        if (this.pumpedUp >= 2) {
          (this.sprite_).triggerEmitters();
        }
        this.attack$Char(enemy);
        Invisibility.dispel$Char(this);
        this.spend(this.attackDelay());
      }
      return !visible;
    } else {
      if (Dungeon.isChallenged(Challenges.STRONGER_BOSSES)) {
        this.pumpedUp = (this.pumpedUp + 2) | 0;
        this.spend(GameMath.gate(this.attackDelay(), Math.fround($J.d2i(Math.ceil(enemy.cooldown()))), Math.fround(3 * this.attackDelay())));
      } else {
        this.pumpedUp++;
        this.spend(this.attackDelay());
      }
      (this.sprite_).pumpUp(this.pumpedUp);
      if (Dungeon.level.heroFOV[this.pos]) {
        this.sprite_.showStatus(CharSprite.WARNING, Messages.get$Object$String$ObjectArr(this, '!!!', []), []);
        GLog.n(Messages.get$Object$String$ObjectArr(this, 'pumpup', []), []);
      }
      return true;
    }
  }
  attack$Char$float$float$float(enemy: Char, dmgMulti: number, dmgBonus: number, accMulti: number): boolean {
    let result = super.attack$Char$float$float$float(enemy, dmgMulti, dmgBonus, accMulti);
    if (this.pumpedUp > 0) {
      this.pumpedUp = 0;
      if (enemy === Dungeon.hero) {
        Statistics.qualifiedForBossChallengeBadge = false;
        Statistics.bossScores[0] = (Statistics.bossScores[0] - 100) | 0;
      }
    }
    return result;
  }
  getCloser(target: number): boolean {
    if (this.pumpedUp !== 0) {
      this.pumpedUp = 0;
      this.sprite_.idle();
    }
    return super.getCloser(target);
  }
  getFurther(target: number): boolean {
    if (this.pumpedUp !== 0) {
      this.pumpedUp = 0;
      this.sprite_.idle();
    }
    return super.getFurther(target);
  }
  damage(dmg: number, src: any): void {
    if (!BossHealthBar.isAssigned()) {
      BossHealthBar.assignBoss$Mob(this);
      Dungeon.level.seal();
    }
    let bleeding = (Math.imul(this.HP, 2) <= this.HT);
    super.damage(dmg, src);
    if ((Math.imul(this.HP, 2) <= this.HT) && !bleeding) {
      BossHealthBar.bleed(true);
      this.sprite_.showStatus(CharSprite.WARNING, Messages.get$Object$String$ObjectArr(this, 'enraged', []), []);
      (this.sprite_).spray(true);
      this.yell(Messages.get$Object$String$ObjectArr(this, 'gluuurp', []));
    }
    let lock = Dungeon.hero.buff($J.cls(LockedFloor));
    if (lock != null && !this.isImmune($J.getClass(src)) && !this.isInvulnerable($J.getClass(src))) {
      if (Dungeon.isChallenged(Challenges.STRONGER_BOSSES)) {
        lock.addTime(Math.fround(dmg));
      } else {
        lock.addTime(Math.fround(dmg * 1.5));
      }
    }
  }
  die(cause: any): void {
    super.die(cause);
    Dungeon.level.unseal();
    GameScene.bossSlain();
    Dungeon.level.drop(new WornKey()._WornKey$int(Dungeon.depth), this.pos).sprite_.drop$();
    let blobs = Random.chances$floatArr([0, 0, 6, 3, 1]);
    for (let i = 0; i < blobs; i++) {
      let ofs: number;
      do {
        ofs = PathFinder.NEIGHBOURS8[Random.Int$int(8)];
      } while (!(Dungeon.level.passable[(this.pos + ofs) | 0]));
      Dungeon.level.drop(new GooBlob()._GooBlob(), (this.pos + ofs) | 0).sprite_.drop$int(this.pos);
    }
    Badges.validateBossSlain();
    if (Statistics.qualifiedForBossChallengeBadge) {
      Badges.validateBossChallengeCompleted();
    }
    Statistics.bossScores[0] = (Statistics.bossScores[0] + 1000) | 0;
    this.yell(Messages.get$Object$String$ObjectArr(this, 'defeated', []));
  }
  notice(): void {
    super.notice();
    if (!BossHealthBar.isAssigned()) {
      BossHealthBar.assignBoss$Mob(this);
      Dungeon.level.seal();
      this.yell(Messages.get$Object$String$ObjectArr(this, 'notice', []));
      for (const $it0 = Actor.chars().iterator(); $it0.hasNext(); ) {
        let ch = $it0.next();
        if (ch instanceof DriedRose$GhostHero) {
          (ch).sayBoss();
        }
      }
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(this.PUMPEDUP, this.pumpedUp);
    bundle.put$String$int(this.HEALINC, this.healInc);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.pumpedUp = bundle.getInt(this.PUMPEDUP);
    if (this.state_ !== this.SLEEPING) {
      BossHealthBar.assignBoss$Mob(this);
    }
    if (Math.imul(this.HP, 2) <= this.HT) {
      BossHealthBar.bleed(true);
    }
    this.healInc = bundle.getInt(this.HEALINC);
  }
}

$J.define(Goo, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Goo', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_Goo' }, meths: { 'attack(com.shatteredpixel.shatteredpixeldungeon.actors.Char,float,float,float)': 'attack$Char$float$float$float' } });
$J.module(() => {
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  LockedFloor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.LockedFloor');
  Ooze = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Ooze');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  DriedRose$GhostHero = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.DriedRose$GhostHero');
  WornKey = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.keys.WornKey');
  GooBlob = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.GooBlob');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  GooSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.GooSprite');
  BossHealthBar = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BossHealthBar');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  GameMath = $J.load('com.watabou.utils.GameMath');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
