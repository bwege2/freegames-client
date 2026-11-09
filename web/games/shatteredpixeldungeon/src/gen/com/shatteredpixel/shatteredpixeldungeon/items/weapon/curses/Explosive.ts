// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/curses/Explosive.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../jre/index.ts';
import { Weapon$Enchantment } from '../Weapon.ts';
import { Bomb$ConjuredBomb } from '../../bombs/Bomb.ts';

let Dungeon, BlastParticle, SmokeParticle, Item, MissileWeapon, Messages, CharSprite, ItemSprite$Glowing, GLog, PathFinder, Random;

export class Explosive extends Weapon$Enchantment {
  static BLACK: ItemSprite$Glowing = null;
  static WARM: ItemSprite$Glowing = null;
  static HOT: ItemSprite$Glowing = null;
  durability: number = 0;
  static readonly DURABILITY: string = 'durability';
  _Explosive(): this {
    this._Weapon$Enchantment();
    this.durability = 100;
    return this;
  }
  proc(weapon: Weapon, attacker: Char, defender: Char, damage: number): number {
    if (weapon instanceof MissileWeapon && (weapon).parent != null && (weapon).parent.enchantment instanceof Explosive) {
      this.durability = ((weapon).parent.enchantment).durability;
    }
    let durToReduce = $J.roundf(Math.fround(Random.IntRange(0, 10) * this.procChanceMultiplier(attacker)));
    let currentDurability = this.durability;
    this.durability = (this.durability - durToReduce) | 0;
    if (currentDurability > 50 && this.durability <= 50) {
      attacker.sprite_.showStatus(CharSprite.WARNING, Messages.get$Object$String$ObjectArr(this, 'warm', []), []);
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'desc_warm', []), []);
      attacker.sprite_.emitter().burst(SmokeParticle.FACTORY, 4);
      Item.updateQuickslot();
    } else if (currentDurability > 10 && this.durability <= 10) {
      attacker.sprite_.showStatus(CharSprite.WARNING, Messages.get$Object$String$ObjectArr(this, 'hot', []), []);
      GLog.n(Messages.get$Object$String$ObjectArr(this, 'desc_hot', []), []);
      attacker.sprite_.emitter().burst(BlastParticle.FACTORY, 5);
      Item.updateQuickslot();
    } else if (this.durability <= 0) {
      let explosionPos = -1;
      for (let i of PathFinder.NEIGHBOURS8) {
        if (!(Dungeon.level.solid[(defender.pos + i) | 0]) && (explosionPos === -1 || Dungeon.level.trueDistance(attacker.pos, (defender.pos + i) | 0) < Dungeon.level.trueDistance(attacker.pos, explosionPos))) {
          explosionPos = (defender.pos + i) | 0;
        }
      }
      if (explosionPos === -1) {
        explosionPos = defender.pos;
      }
      new Explosive$ExplosiveCurseBomb()._Explosive$ExplosiveCurseBomb().explode(explosionPos);
      this.durability = (this.durability + 100) | 0;
      Item.updateQuickslot();
      if (weapon instanceof MissileWeapon) {
        (weapon).damage(Math.fround(9 * (weapon).durabilityPerUse$()));
      }
    }
    if (weapon instanceof MissileWeapon && (weapon).parent != null && (weapon).parent.enchantment instanceof Explosive) {
      ((weapon).parent.enchantment).durability = this.durability;
      this.durability = 100;
    }
    return damage;
  }
  merge(other: Explosive): void {
    let diff = (100 - other.durability) | 0;
    this.durability = (this.durability - diff) | 0;
  }
  clear(): void {
    this.durability = 100;
  }
  curse(): boolean {
    return true;
  }
  glowing(): ItemSprite$Glowing {
    if (this.durability > 50) {
      return Explosive.BLACK;
    } else if (this.durability > 10) {
      return Explosive.WARM;
    } else {
      return Explosive.HOT;
    }
  }
  desc(): string {
    let desc = super.desc();
    if (this.durability > 50) {
      desc += ' ' + Messages.get$Object$String$ObjectArr(this, 'desc_cool', []);
    } else if (this.durability > 10) {
      desc += ' ' + Messages.get$Object$String$ObjectArr(this, 'desc_warm', []);
    } else {
      desc += ' _' + Messages.get$Object$String$ObjectArr(this, 'desc_hot', []) + '_';
    }
    return desc;
  }
  restoreFromBundle(bundle: Bundle): void {
    this.durability = bundle.getInt(Explosive.DURABILITY);
  }
  storeInBundle(bundle: Bundle): void {
    bundle.put$String$int(Explosive.DURABILITY, this.durability);
  }
  static $clinit() {
    Explosive.BLACK = new ItemSprite$Glowing()._ItemSprite$Glowing$int(0);
    Explosive.WARM = new ItemSprite$Glowing()._ItemSprite$Glowing$int$float(0, 0.5);
    Explosive.HOT = new ItemSprite$Glowing()._ItemSprite$Glowing$int$float(0, 0.25);
  }
}

export class Explosive$ExplosiveCurseBomb extends Bomb$ConjuredBomb {
  _Explosive$ExplosiveCurseBomb(): this {
    this._Bomb$ConjuredBomb();
    return this;
  }
}

$J.define(Explosive, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.curses.Explosive', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment', ctors: { '': '_Explosive' }, clinit: true, lazy: ['BLACK', 'WARM', 'HOT'] });
$J.define(Explosive$ExplosiveCurseBomb, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.curses.Explosive$ExplosiveCurseBomb', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.bombs.Bomb$ConjuredBomb', ctors: { '': '_Explosive$ExplosiveCurseBomb' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  BlastParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.BlastParticle');
  SmokeParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.SmokeParticle');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  MissileWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
