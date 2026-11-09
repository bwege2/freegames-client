// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Shaman.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Badges, Dungeon, Dungeon$LimitedDrops, Char, AscensionChallenge, Buff, Hex, Invisibility, Vulnerable, Weakness, Generator$Category, Ballistica, Messages, CharSprite, ShamanSprite$Blue, ShamanSprite$Purple, ShamanSprite$Red, GLog, Sample, Random;

export class Shaman extends Mob {
  _Shaman(): this {
    this._Mob();
    this.HP = this.HT = 35;
    this.defenseSkill_ = 15;
    this.EXP = 8;
    this.maxLvl = 16;
    this.loot = Generator$Category.WAND;
    this.lootChance_ = Math.fround(0.03);
    return this;
  }
  damageRoll(): number {
    return Random.NormalIntRange(5, 10);
  }
  attackSkill(target: Char): number {
    return 18;
  }
  drRoll(): number {
    return (super.drRoll() + Random.NormalIntRange(0, 6)) | 0;
  }
  canAttack(enemy: Char): boolean {
    return super.canAttack(enemy) || new Ballistica()._Ballistica(this.pos, enemy.pos, Ballistica.MAGIC_BOLT).collisionPos === enemy.pos;
  }
  lootChance(): number {
    return Math.fround(super.lootChance() * Math.fround($J.pow(Math.fround(1 / 3), Dungeon$LimitedDrops.SHAMAN_WAND.count_)));
  }
  createLoot(): Item {
    Dungeon$LimitedDrops.SHAMAN_WAND.count_++;
    return super.createLoot();
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
    this.spend(1);
    Invisibility.dispel$Char(this);
    let enemy = this.enemy;
    if (Char.hit$Char$Char$boolean(this, enemy, true)) {
      if (Random.Int$int(2) === 0) {
        this.debuff(enemy);
        if (enemy === Dungeon.hero) {
          Sample.INSTANCE.play$Object(Assets$Sounds.DEBUFF);
        }
      }
      let dmg = Random.NormalIntRange(6, 15);
      dmg = $J.roundf(Math.fround(dmg * AscensionChallenge.statModifier(this)));
      enemy.damage(dmg, new Shaman$EarthenBolt()._Shaman$EarthenBolt());
      if (!enemy.isAlive() && enemy === Dungeon.hero) {
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
  description(): string {
    return super.description() + '\n\n' + Messages.get$Object$String$ObjectArr(this, 'spell_desc', []);
  }
  static random(): JClass<Shaman> {
    let roll = Random.Float$();
    if (roll < Math.fround(0.4)) {
      return $J.cls(Shaman$RedShaman);
    } else if (roll < Math.fround(0.8)) {
      return $J.cls(Shaman$BlueShaman);
    } else {
      return $J.cls(Shaman$PurpleShaman);
    }
  }
}

export class Shaman$EarthenBolt extends JObject {
  _Shaman$EarthenBolt(): this {
    return this;
  }
}

export class Shaman$RedShaman extends Shaman {
  _Shaman$RedShaman(): this {
    this._Shaman();
    this.spriteClass = $J.cls(ShamanSprite$Red);
    return this;
  }
  debuff(enemy: Char): void {
    Buff.prolong(enemy, $J.cls(Weakness), Weakness.DURATION);
  }
}

export class Shaman$BlueShaman extends Shaman {
  _Shaman$BlueShaman(): this {
    this._Shaman();
    this.spriteClass = $J.cls(ShamanSprite$Blue);
    return this;
  }
  debuff(enemy: Char): void {
    Buff.prolong(enemy, $J.cls(Vulnerable), Vulnerable.DURATION);
  }
}

export class Shaman$PurpleShaman extends Shaman {
  _Shaman$PurpleShaman(): this {
    this._Shaman();
    this.spriteClass = $J.cls(ShamanSprite$Purple);
    return this;
  }
  debuff(enemy: Char): void {
    Buff.prolong(enemy, $J.cls(Hex), Hex.DURATION);
  }
}

$J.define(Shaman, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Shaman', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_Shaman' } });
$J.define(Shaman$EarthenBolt, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Shaman$EarthenBolt', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Shaman$EarthenBolt' } });
$J.define(Shaman$RedShaman, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Shaman$RedShaman', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Shaman', ctors: { '': '_Shaman$RedShaman' } });
$J.define(Shaman$BlueShaman, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Shaman$BlueShaman', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Shaman', ctors: { '': '_Shaman$BlueShaman' } });
$J.define(Shaman$PurpleShaman, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Shaman$PurpleShaman', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Shaman', ctors: { '': '_Shaman$PurpleShaman' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Dungeon$LimitedDrops = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon$LimitedDrops');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  AscensionChallenge = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AscensionChallenge');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Hex = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Hex');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Vulnerable = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Vulnerable');
  Weakness = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Weakness');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  ShamanSprite$Blue = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ShamanSprite$Blue');
  ShamanSprite$Purple = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ShamanSprite$Purple');
  ShamanSprite$Red = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ShamanSprite$Red');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Random = $J.load('com.watabou.utils.Random');
});
