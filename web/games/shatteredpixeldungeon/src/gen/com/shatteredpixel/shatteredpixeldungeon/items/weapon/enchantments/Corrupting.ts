// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/enchantments/Corrupting.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Buff } from '../../../actors/buffs/Buff.ts';

let Actor, Char$Alignment, Adrenaline, Corruption, Mob, Multiplicity, GameScene, ItemSprite$Glowing, Random;

export class Corrupting extends Weapon$Enchantment {
  static BLACK: ItemSprite$Glowing = null;
  _Corrupting(): this {
    this._Weapon$Enchantment();
    return this;
  }
  proc(weapon: Weapon, attacker: Char, defender: Char, damage: number): number {
    let level = Math.max(0, weapon.buffedLvl());
    let procChance = Math.fround(Math.fround((Math.fround(level + 5)) / (Math.fround(level + 20))) * this.procChanceMultiplier(attacker));
    if (Random.Float$() < procChance && attacker.alignment === Char$Alignment.ALLY && !defender.isImmune($J.cls(Corruption)) && defender.buff($J.cls(Corruption)) == null && defender instanceof Mob && defender.isAlive()) {
      Buff.affect$Char$Class(defender, $J.cls(Corrupting$CorruptingTracker)).powerMulti = Math.max(1, procChance);
    }
    return damage;
  }
  glowing(): ItemSprite$Glowing {
    return Corrupting.BLACK;
  }
  static $clinit() {
    Corrupting.BLACK = new ItemSprite$Glowing()._ItemSprite$Glowing$int(4456550);
  }
}

export class Corrupting$CorruptingTracker extends Buff {
  powerMulti: number = 0;
  _Corrupting$CorruptingTracker(): this {
    this._Buff();
    this.actPriority = Actor.VFX_PRIO;
    this.powerMulti = 1;
    return this;
  }
  act(): boolean {
    this.detach();
    return true;
  }
  detach(): void {
    if (!this.target.isAlive()) {
      let corrupted = Multiplicity.duplicate(this.target);
      if (corrupted != null) {
        this.target.sprite_.killAndErase();
        corrupted.timeToNow();
        corrupted.pos = this.target.pos;
        GameScene.add$Mob(corrupted);
        Corruption.corruptionHeal(corrupted);
        Buff.affect$Char$Class(corrupted, $J.cls(Corruption));
        if (this.powerMulti > Math.fround(1.1)) {
          Buff.affect$Char$Class$float(corrupted, $J.cls(Adrenaline), Math.fround($J.roundf(Math.fround(5 * (Math.fround(this.powerMulti - 1))))));
        }
      }
    }
    super.detach();
  }
}

$J.define(Corrupting, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Corrupting', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment', ctors: { '': '_Corrupting' }, clinit: true, lazy: ['BLACK'] });
$J.define(Corrupting$CorruptingTracker, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Corrupting$CorruptingTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Corrupting$CorruptingTracker' } });
$J.module(() => {
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Adrenaline = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Adrenaline');
  Corruption = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Corruption');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  Multiplicity = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.curses.Multiplicity');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  Random = $J.load('com.watabou.utils.Random');
});
