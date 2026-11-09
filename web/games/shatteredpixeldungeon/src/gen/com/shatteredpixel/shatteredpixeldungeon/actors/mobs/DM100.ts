// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/DM100.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Badges, Dungeon, Char, Char$Property, AscensionChallenge, Invisibility, SparkParticle, Generator$Category, Ballistica, Messages, PixelScene, CharSprite, DM100Sprite, GLog, Random;

export class DM100 extends Mob {
  static readonly TIME_TO_ZAP: number = 1;
  _DM100(): this {
    this._Mob();
    this.spriteClass = $J.cls(DM100Sprite);
    this.HP = this.HT = 20;
    this.defenseSkill_ = 8;
    this.EXP = 6;
    this.maxLvl = 13;
    this.loot = Generator$Category.SCROLL;
    this.lootChance_ = 0.25;
    this.properties_.add(Char$Property.ELECTRIC);
    this.properties_.add(Char$Property.INORGANIC);
    return this;
  }
  damageRoll(): number {
    return Random.NormalIntRange(2, 8);
  }
  attackSkill(target: Char): number {
    return 11;
  }
  drRoll(): number {
    return (super.drRoll() + Random.NormalIntRange(0, 4)) | 0;
  }
  canAttack(enemy: Char): boolean {
    return super.canAttack(enemy) || new Ballistica()._Ballistica(this.pos, enemy.pos, Ballistica.MAGIC_BOLT).collisionPos === enemy.pos;
  }
  doAttack(enemy: Char): boolean {
    if (Dungeon.level.adjacent(this.pos, enemy.pos) || new Ballistica()._Ballistica(this.pos, enemy.pos, Ballistica.MAGIC_BOLT).collisionPos !== enemy.pos) {
      return super.doAttack(enemy);
    } else {
      this.spend(DM100.TIME_TO_ZAP);
      Invisibility.dispel$Char(this);
      if (Char.hit$Char$Char$boolean(this, enemy, true)) {
        let dmg = Random.NormalIntRange(3, 10);
        dmg = $J.roundf(Math.fround(dmg * AscensionChallenge.statModifier(this)));
        enemy.damage(dmg, new DM100$LightningBolt()._DM100$LightningBolt());
        if (enemy.sprite_.visible_) {
          enemy.sprite_.centerEmitter().burst(SparkParticle.FACTORY, 3);
          enemy.sprite_.flash();
        }
        if (enemy === Dungeon.hero) {
          PixelScene.shake(2, Math.fround(0.3));
          if (!enemy.isAlive()) {
            Badges.validateDeathFromEnemyMagic();
            Dungeon.fail(this);
            GLog.n(Messages.get$Object$String$ObjectArr(this, 'zap_kill', []), []);
          }
        }
      } else {
        enemy.sprite_.showStatus(CharSprite.NEUTRAL, enemy.defenseVerb(), []);
      }
      if (this.sprite_ != null && (this.sprite_.visible_ || enemy.sprite_.visible_)) {
        this.sprite_.zap$int(enemy.pos);
        return false;
      } else {
        return true;
      }
    }
  }
}

export class DM100$LightningBolt extends JObject {
  _DM100$LightningBolt(): this {
    return this;
  }
}

$J.define(DM100, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DM100', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_DM100' } });
$J.define(DM100$LightningBolt, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DM100$LightningBolt', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_DM100$LightningBolt' } });
$J.module(() => {
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  AscensionChallenge = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AscensionChallenge');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  SparkParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.SparkParticle');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  DM100Sprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.DM100Sprite');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Random = $J.load('com.watabou.utils.Random');
});
