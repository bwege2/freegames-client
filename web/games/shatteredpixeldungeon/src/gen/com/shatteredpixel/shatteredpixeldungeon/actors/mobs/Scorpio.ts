// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Scorpio.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Char$Property, Buff, Cripple, Light, Generator$Category, PotionOfHealing, PotionOfStrength, Ballistica, ScorpioSprite, Random, Reflection;

export class Scorpio extends Mob {
  _Scorpio(): this {
    this._Mob();
    this.spriteClass = $J.cls(ScorpioSprite);
    this.HP = this.HT = 110;
    this.defenseSkill_ = 24;
    this.viewDistance = Light.DISTANCE;
    this.EXP = 14;
    this.maxLvl = 27;
    this.loot = Generator$Category.POTION;
    this.lootChance_ = 0.5;
    this.properties_.add(Char$Property.DEMONIC);
    return this;
  }
  damageRoll(): number {
    return Random.NormalIntRange(30, 40);
  }
  attackSkill(target: Char): number {
    return 36;
  }
  drRoll(): number {
    return (super.drRoll() + Random.NormalIntRange(0, 16)) | 0;
  }
  canAttack(enemy: Char): boolean {
    return !Dungeon.level.adjacent(this.pos, enemy.pos) && (super.canAttack(enemy) || new Ballistica()._Ballistica(this.pos, enemy.pos, Ballistica.PROJECTILE).collisionPos === enemy.pos);
  }
  attackProc(enemy: Char, damage: number): number {
    damage = super.attackProc(enemy, damage);
    if (Random.Int$int(2) === 0) {
      Buff.prolong(enemy, $J.cls(Cripple), Cripple.DURATION);
    }
    return damage;
  }
  getCloser(target: number): boolean {
    if (this.state_ === this.HUNTING) {
      return this.enemySeen && this.getFurther(target);
    } else {
      return super.getCloser(target);
    }
  }
  aggro(ch: Char): void {
    if (ch == null || this.fieldOfView == null || this.fieldOfView.length !== Dungeon.level.length() || this.fieldOfView[ch.pos]) {
      super.aggro(ch);
    }
  }
  createLoot(): Item {
    let loot: JClass<Potion>;
    do {
      loot = Random.oneOf(Generator$Category.POTION.classes);
    } while (loot === $J.cls(PotionOfHealing) || loot === $J.cls(PotionOfStrength));
    return Reflection.newInstance(loot);
  }
}

$J.define(Scorpio, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Scorpio', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_Scorpio' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Cripple = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Cripple');
  Light = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Light');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  PotionOfHealing = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfHealing');
  PotionOfStrength = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfStrength');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  ScorpioSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ScorpioSprite');
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
