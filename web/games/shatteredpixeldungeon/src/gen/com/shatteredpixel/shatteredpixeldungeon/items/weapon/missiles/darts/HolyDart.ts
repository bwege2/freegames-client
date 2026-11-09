// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/darts/HolyDart.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../../jre/index.ts';
import { TippedDart } from './TippedDart.ts';

let Assets$Sounds, Dungeon, Char, Char$Property, Bless, Buff, Hero, ShadowParticle, ItemSpriteSheet, Sample, Random;

export class HolyDart extends TippedDart {
  _HolyDart(): this {
    this._TippedDart();
    this.image_ = ItemSpriteSheet.HOLY_DART;
    return this;
  }
  damageRoll(owner: Char): number {
    if (owner instanceof Hero) {
      if ((owner).attackTarget().alignment === owner.alignment) {
        return 0;
      }
    }
    return super.damageRoll(owner);
  }
  proc(attacker: Char, defender: Char, damage: number): number {
    if (this.processingChargedShot && defender === attacker) {
      return super.proc(attacker, defender, damage);
    }
    if (attacker.alignment === defender.alignment) {
      Buff.affect$Char$Class$float(defender, $J.cls(Bless), Math.fround($J.roundf(Bless.DURATION)));
      return 0;
    }
    if (Char.hasProp(defender, Char$Property.UNDEAD) || Char.hasProp(defender, Char$Property.DEMONIC)) {
      defender.sprite_.emitter().start(ShadowParticle.UP, Math.fround(0.05), (10 + this.buffedLvl()) | 0);
      Sample.INSTANCE.play$Object(Assets$Sounds.BURNING);
      defender.damage(Random.NormalIntRange((10 + $J.idiv(Dungeon.scalingDepth(), 3)) | 0, (20 + $J.idiv(Dungeon.scalingDepth(), 3)) | 0), this);
    } else if (!this.processingChargedShot) {
      Buff.affect$Char$Class$float(defender, $J.cls(Bless), Math.fround($J.roundf(Bless.DURATION)));
    }
    return super.proc(attacker, defender, damage);
  }
}

$J.define(HolyDart, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.HolyDart', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.TippedDart', ctors: { '': '_HolyDart' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Bless = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Bless');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  ShadowParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShadowParticle');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Random = $J.load('com.watabou.utils.Random');
});
