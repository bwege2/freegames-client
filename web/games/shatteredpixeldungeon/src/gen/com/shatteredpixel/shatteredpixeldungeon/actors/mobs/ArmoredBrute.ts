// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/ArmoredBrute.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Brute } from './Brute.ts';
import { Brute$BruteRage } from './Brute.ts';

let Dungeon, Actor, AscensionChallenge, Buff, FloatingText, Generator$Category, PlateArmor, ScaleArmor, Messages, CharSprite, ShieldedSprite, Random;

export class ArmoredBrute extends Brute {
  _ArmoredBrute(): this {
    this._Brute();
    this.spriteClass = $J.cls(ShieldedSprite);
    this.loot = Generator$Category.ARMOR;
    this.lootChance_ = 1;
    return this;
  }
  damageRoll(): number {
    return this.buff($J.cls(ArmoredBrute$ArmoredRage)) != null ? Random.NormalIntRange(15, 40) : Random.NormalIntRange(5, 25);
  }
  drRoll(): number {
    return (super.drRoll() + 4) | 0;
  }
  triggerEnrage(): void {
    Buff.affect$Char$Class(this, $J.cls(ArmoredBrute$ArmoredRage)).setShield(($J.idiv(this.HT, 2) + 1) | 0);
    this.sprite_.showStatusWithIcon(CharSprite.POSITIVE, String($J.idiv(this.HT, 2)), FloatingText.SHIELDING, []);
    if (Dungeon.level.heroFOV[this.pos]) {
      this.sprite_.showStatus(CharSprite.WARNING, Messages.get$Object$String$ObjectArr(this, 'enraged', []), []);
    }
    this.spend(Actor.TICK);
    this.hasRaged = true;
  }
  createLoot(): Item {
    if (Random.Int$int(4) === 0) {
      return new PlateArmor()._PlateArmor().random();
    }
    return new ScaleArmor()._ScaleArmor().random();
  }
}

export class ArmoredBrute$ArmoredRage extends Brute$BruteRage {
  _ArmoredBrute$ArmoredRage(): this {
    this._Brute$BruteRage();
    return this;
  }
  act(): boolean {
    if (this.target.HP > 0) {
      this.detach();
      return true;
    }
    this.absorbDamage($J.roundf(AscensionChallenge.statModifier(this.target)));
    if (this.shielding() <= 0) {
      this.target.die(null);
    }
    this.spend(Math.fround(3 * Actor.TICK));
    return true;
  }
}

$J.define(ArmoredBrute, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.ArmoredBrute', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Brute', ctors: { '': '_ArmoredBrute' } });
$J.define(ArmoredBrute$ArmoredRage, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.ArmoredBrute$ArmoredRage', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Brute$BruteRage', ctors: { '': '_ArmoredBrute$ArmoredRage' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  AscensionChallenge = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AscensionChallenge');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  PlateArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.PlateArmor');
  ScaleArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.ScaleArmor');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  ShieldedSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ShieldedSprite');
  Random = $J.load('com.watabou.utils.Random');
});
