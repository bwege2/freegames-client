// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/stones/StoneOfDeepSleep.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Actor, Buff, MagicalSleep, Mob, Speck, ItemSpriteSheet, Sample;

export class StoneOfDeepSleep extends Runestone {
  _StoneOfDeepSleep(): this {
    this._Runestone();
    this.image_ = ItemSpriteSheet.STONE_SLEEP;
    return this;
  }
  activate(cell: number): void {
    if (Actor.findChar(cell) != null) {
      let c = Actor.findChar(cell);
      if (c instanceof Mob) {
        Buff.affect$Char$Class(c, $J.cls(MagicalSleep));
        c.sprite_.centerEmitter().start(Speck.factory$int(Speck.NOTE), Math.fround(0.3), 5);
      }
    }
    Sample.INSTANCE.play$Object(Assets$Sounds.LULLABY);
  }
}

$J.define(StoneOfDeepSleep, 'com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfDeepSleep', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.stones.Runestone', ctors: { '': '_StoneOfDeepSleep' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  MagicalSleep = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MagicalSleep');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
