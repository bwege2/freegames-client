// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/traps/AlarmTrap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Trap } from './Trap.ts';

let Assets$Sounds, Dungeon, CellEmitter, Speck, Messages, GLog, Sample;

export class AlarmTrap extends Trap {
  _AlarmTrap(): this {
    this._Trap();
    this.color_ = Trap.RED;
    this.shape = Trap.DOTS;
    return this;
  }
  activate(): void {
    for (const $it0 = Dungeon.level.mobs.iterator(); $it0.hasNext(); ) {
      let mob = $it0.next();
      mob.beckon(this.pos);
    }
    if (Dungeon.level.heroFOV[this.pos]) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'alarm', []), []);
      CellEmitter.center(this.pos).start(Speck.factory$int(Speck.SCREAM), Math.fround(0.3), 3);
    }
    Sample.INSTANCE.play$Object(Assets$Sounds.ALERT);
  }
}

$J.define(AlarmTrap, 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.AlarmTrap', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap', ctors: { '': '_AlarmTrap' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
