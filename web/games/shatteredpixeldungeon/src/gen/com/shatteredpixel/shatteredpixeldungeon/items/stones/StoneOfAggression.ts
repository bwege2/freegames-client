// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/stones/StoneOfAggression.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Runestone } from './Runestone.ts';
import { FlavourBuff } from '../../actors/buffs/FlavourBuff.ts';

let Assets$Sounds, Dungeon, Actor, Char, Char$Alignment, Char$Property, Buff, Buff$buffType, Mob, CellEmitter, Speck, ItemSpriteSheet, BuffIndicator, Sample;

export class StoneOfAggression extends Runestone {
  _StoneOfAggression(): this {
    this._Runestone();
    this.image_ = ItemSpriteSheet.STONE_AGGRESSION;
    return this;
  }
  activate(cell: number): void {
    let ch = Actor.findChar(cell);
    if (ch != null && !Char.hasProp(ch, Char$Property.BOSS) && !Char.hasProp(ch, Char$Property.MINIBOSS)) {
      Buff.prolong(ch, $J.cls(StoneOfAggression$Aggression), StoneOfAggression$Aggression.DURATION);
    }
    CellEmitter.center(cell).start(Speck.factory$int(Speck.SCREAM), Math.fround(0.3), 3);
    Sample.INSTANCE.play$Object(Assets$Sounds.READ);
  }
}

export class StoneOfAggression$Aggression extends FlavourBuff {
  static readonly DURATION: number = 20;
  _StoneOfAggression$Aggression(): this {
    this._FlavourBuff();
    this.type_ = Buff$buffType.NEGATIVE;
    this.announced = true;
    return this;
  }
  icon(): number {
    return BuffIndicator.TARGETED;
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(StoneOfAggression$Aggression.DURATION - this.visualcooldown())) / StoneOfAggression$Aggression.DURATION));
  }
  detach(): void {
    if (this.target.isAlive()) {
      if (this.target.alignment === Char$Alignment.ENEMY) {
        for (const $it0 = Dungeon.level.mobs.iterator(); $it0.hasNext(); ) {
          let m = $it0.next();
          if (m.alignment === Char$Alignment.ENEMY && m.isTargeting(this.target)) {
            m.aggro(null);
          }
          if (this.target instanceof Mob && (this.target).isTargeting(m)) {
            (this.target).aggro(null);
          }
        }
      }
    }
    super.detach();
  }
}

$J.define(StoneOfAggression, 'com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfAggression', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.stones.Runestone', ctors: { '': '_StoneOfAggression' } });
$J.define(StoneOfAggression$Aggression, 'com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfAggression$Aggression', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_StoneOfAggression$Aggression' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
