// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/traps/RockfallTrap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../jre/index.ts';
import { Trap } from './Trap.ts';

let Assets$Sounds, Badges, Dungeon, Actor, Buff, Paralysis, Mob, CellEmitter, Speck, RegularLevel, Trap$HazardAssistTracker, Messages, PixelScene, GLog, Sample, BArray, PathFinder, Random;

export class RockfallTrap extends Trap {
  _RockfallTrap(): this {
    this._Trap();
    this.color_ = Trap.GREY;
    this.shape = Trap.DIAMOND;
    this.canBeHidden = false;
    this.avoidsClosedSpaces = true;
    return this;
  }
  activate(): void {
    let rockCells = new ArrayList();
    let onGround = Dungeon.level.traps.get(this.pos) === this;
    let r = null;
    if (Dungeon.level instanceof RegularLevel) {
      r = (Dungeon.level).room$int(this.pos);
    }
    if (onGround && r != null) {
      let cell: number;
      for (const $it0 = r.getPoints().iterator(); $it0.hasNext(); ) {
        let p = $it0.next();
        cell = Dungeon.level.pointToCell(p);
        if (!Dungeon.level.solid[cell]) {
          rockCells.add(cell);
        }
      }
    } else {
      PathFinder.buildDistanceMap$int$booleanArr$int(this.pos, BArray.not(Dungeon.level.solid, null), 2);
      for (let i = 0; i < PathFinder.distance.length; i++) {
        if (PathFinder.distance[i] < 2147483647) {
          rockCells.add(i);
        }
      }
    }
    let seen = false;
    for (const $it1 = rockCells.iterator(); $it1.hasNext(); ) {
      let cell = $it1.next();
      if (Dungeon.level.heroFOV[cell]) {
        (CellEmitter.get((cell - Dungeon.level.width()) | 0)).start(Speck.factory$int(Speck.ROCK), Math.fround(0.07), 10);
        seen = true;
      }
      let ch = Actor.findChar(cell);
      if (ch != null && ch.isAlive()) {
        if (ch instanceof Mob) {
          Buff.prolong(ch, $J.cls(Trap$HazardAssistTracker), Trap$HazardAssistTracker.DURATION);
        }
        let damage = Random.NormalIntRange((5 + this.scalingDepth()) | 0, (10 + Math.imul(this.scalingDepth(), 2)) | 0);
        damage = (damage - ch.drRoll()) | 0;
        ch.damage(Math.max(damage, 0), this);
        if (ch.isActive()) {
          Buff.prolong(ch, $J.cls(Paralysis), Paralysis.DURATION);
        } else if (!ch.isAlive() && ch === Dungeon.hero) {
          Dungeon.fail(this);
          GLog.n(Messages.get$Object$String$ObjectArr(this, 'ondeath', []), []);
          if (this.reclaimed) {
            Badges.validateDeathFromFriendlyMagic();
          }
        }
      }
    }
    if (seen) {
      PixelScene.shake(3, Math.fround(0.7));
      Sample.INSTANCE.play$Object(Assets$Sounds.ROCKS);
    }
  }
}

$J.define(RockfallTrap, 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.RockfallTrap', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap', ctors: { '': '_RockfallTrap' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Paralysis = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Paralysis');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  RegularLevel = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.RegularLevel');
  Trap$HazardAssistTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap$HazardAssistTracker');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
