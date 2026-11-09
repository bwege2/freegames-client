// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Warlock.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Badges, Dungeon, Dungeon$LimitedDrops, Char, Char$Property, AscensionChallenge, Buff, Degrade, Invisibility, Generator, Generator$Category, PotionOfHealing, Ballistica, Messages, CharSprite, WarlockSprite, GLog, Sample, Random;

export class Warlock extends Mob {
  static readonly TIME_TO_ZAP: number = 1;
  _Warlock(): this {
    this._Mob();
    this.spriteClass = $J.cls(WarlockSprite);
    this.HP = this.HT = 70;
    this.defenseSkill_ = 18;
    this.EXP = 11;
    this.maxLvl = 21;
    this.loot = Generator$Category.POTION;
    this.lootChance_ = 0.5;
    this.properties_.add(Char$Property.UNDEAD);
    return this;
  }
  damageRoll(): number {
    return Random.NormalIntRange(12, 18);
  }
  attackSkill(target: Char): number {
    return 25;
  }
  drRoll(): number {
    return (super.drRoll() + Random.NormalIntRange(0, 8)) | 0;
  }
  canAttack(enemy: Char): boolean {
    return super.canAttack(enemy) || new Ballistica()._Ballistica(this.pos, enemy.pos, Ballistica.MAGIC_BOLT).collisionPos === enemy.pos;
  }
  doAttack(enemy: Char): boolean {
    if (Dungeon.level.adjacent(this.pos, enemy.pos) || new Ballistica()._Ballistica(this.pos, enemy.pos, Ballistica.MAGIC_BOLT).collisionPos !== enemy.pos) {
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
  zap(): void {
    this.spend(Warlock.TIME_TO_ZAP);
    Invisibility.dispel$Char(this);
    let enemy = this.enemy;
    if (Char.hit$Char$Char$boolean(this, enemy, true)) {
      if (enemy === Dungeon.hero && Random.Int$int(2) === 0) {
        Buff.prolong(enemy, $J.cls(Degrade), Degrade.DURATION);
        Sample.INSTANCE.play$Object(Assets$Sounds.DEGRADE);
      }
      let dmg = Random.NormalIntRange(12, 18);
      dmg = $J.roundf(Math.fround(dmg * AscensionChallenge.statModifier(this)));
      enemy.damage(dmg, new Warlock$DarkBolt()._Warlock$DarkBolt());
      if (enemy === Dungeon.hero && !enemy.isAlive()) {
        Badges.validateDeathFromEnemyMagic();
        Dungeon.fail(this);
        GLog.n(Messages.get$Object$String$ObjectArr(this, 'bolt_kill', []), []);
      }
    } else {
      enemy.sprite_.showStatus(CharSprite.NEUTRAL, enemy.defenseVerb(), []);
    }
  }
  onZapComplete(): void {
    this.zap();
    this.next();
  }
  createLoot(): Item {
    if (Random.Int$int(3) === 0 && Random.Int$int(8) > Dungeon$LimitedDrops.WARLOCK_HP.count_) {
      Dungeon$LimitedDrops.WARLOCK_HP.count_++;
      return new PotionOfHealing()._PotionOfHealing();
    } else {
      let i: Item;
      do {
        i = Generator.randomUsingDefaults$Category(Generator$Category.POTION);
      } while (i instanceof PotionOfHealing);
      return i;
    }
  }
}

export class Warlock$DarkBolt extends JObject {
  _Warlock$DarkBolt(): this {
    return this;
  }
}

$J.define(Warlock, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Warlock', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_Warlock' } });
$J.define(Warlock$DarkBolt, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Warlock$DarkBolt', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Warlock$DarkBolt' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Dungeon$LimitedDrops = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon$LimitedDrops');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  AscensionChallenge = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AscensionChallenge');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Degrade = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Degrade');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  PotionOfHealing = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfHealing');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  WarlockSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.WarlockSprite');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Random = $J.load('com.watabou.utils.Random');
});
