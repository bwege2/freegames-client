// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/spells/PhaseShift.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { TargetedSpell } from './TargetedSpell.ts';
import { Recipe$SimpleRecipe } from '../Recipe.ts';

let Dungeon, Actor, Char, Char$Property, Buff, Paralysis, Mob, ScrollOfTeleportation, Messages, ItemSpriteSheet, GLog;

export class PhaseShift extends TargetedSpell {
  _PhaseShift(): this {
    this._TargetedSpell();
    this.image_ = ItemSpriteSheet.PHASE_SHIFT;
    this.usesTargeting_ = true;
    this.talentChance = Math.fround(1 / Math.fround(PhaseShift$Recipe.OUT_QUANTITY));
    return this;
  }
  affectTarget(bolt: Ballistica, hero: Hero): void {
    let ch = Actor.findChar(bolt.collisionPos);
    if (ch != null) {
      if (ScrollOfTeleportation.teleportChar$Char(ch)) {
        if (ch instanceof Mob) {
          if ((ch).state_ === (ch).HUNTING) {
            (ch).state_ = (ch).WANDERING;
          }
          (ch).beckon(Dungeon.level.randomDestination(ch));
        }
        if (!Char.hasProp(ch, Char$Property.BOSS) && !Char.hasProp(ch, Char$Property.MINIBOSS)) {
          Buff.affect$Char$Class$float(ch, $J.cls(Paralysis), Paralysis.DURATION);
        }
      }
    } else {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'no_target', []), []);
    }
    this.onSpellused();
  }
  value(): number {
    return $J.d2i((Math.fround(60 * (Math.fround(this.quantity / Math.fround(PhaseShift$Recipe.OUT_QUANTITY))))));
  }
  energyVal(): number {
    return $J.d2i((Math.fround(12 * (Math.fround(this.quantity / Math.fround(PhaseShift$Recipe.OUT_QUANTITY))))));
  }
}

export class PhaseShift$Recipe extends Recipe$SimpleRecipe {
  static readonly OUT_QUANTITY: number = 6;
  _PhaseShift$Recipe(): this {
    this._Recipe$SimpleRecipe();
    this.inputs = [$J.cls(ScrollOfTeleportation)];
    this.inQuantity = [1];
    this.cost_ = 10;
    this.output = $J.cls(PhaseShift);
    this.outQuantity = PhaseShift$Recipe.OUT_QUANTITY;
    return this;
  }
}

$J.define(PhaseShift, 'com.shatteredpixel.shatteredpixeldungeon.items.spells.PhaseShift', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.spells.TargetedSpell', ctors: { '': '_PhaseShift' } });
$J.define(PhaseShift$Recipe, 'com.shatteredpixel.shatteredpixeldungeon.items.spells.PhaseShift$Recipe', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Recipe$SimpleRecipe', ctors: { '': '_PhaseShift$Recipe' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Paralysis = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Paralysis');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  ScrollOfTeleportation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
});
