// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/traps/DisintegrationTrap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Badges, Dungeon, Actor, Buff, Hero, Mob, Beam$DeathRay, Trap$HazardAssistTracker, Ballistica, Messages, DungeonTilemap, GLog, Game, Sample, Random;

export class DisintegrationTrap extends Trap {
  _DisintegrationTrap(): this {
    this._Trap();
    this.color_ = Trap.VIOLET;
    this.shape = Trap.CROSSHAIR;
    this.canBeHidden = false;
    this.avoidsClosedSpaces = true;
    return this;
  }
  activate(): void {
    let target = Actor.findChar(this.pos);
    let range = Math.fround(Math.max(6, Dungeon.level.viewDistance) + 0.5);
    if (target == null) {
      let closestDist = Math.fround(3.4028235E38);
      for (const $it0 = Actor.chars().iterator(); $it0.hasNext(); ) {
        let ch = $it0.next();
        if (!ch.isAlive()) {
          continue;
        }
        let curDist = Dungeon.level.trueDistance(this.pos, ch.pos);
        if (ch.invisible > 0) {
          curDist = Math.max(curDist, range);
        }
        let bolt = new Ballistica()._Ballistica(this.pos, ch.pos, Ballistica.PROJECTILE);
        if (bolt.collisionPos === ch.pos && (curDist < closestDist || (curDist === closestDist && target instanceof Hero))) {
          target = ch;
          closestDist = curDist;
        }
      }
      if (closestDist > range) {
        target = null;
      }
    }
    let heap = Dungeon.level.heaps.get(this.pos);
    if (heap != null) {
      heap.explode();
    }
    if (target != null) {
      if (target instanceof Mob) {
        Buff.prolong(target, $J.cls(Trap$HazardAssistTracker), Trap$HazardAssistTracker.DURATION);
      }
      if (Dungeon.level.heroFOV[this.pos] || Dungeon.level.heroFOV[target.pos]) {
        Sample.INSTANCE.play$Object(Assets$Sounds.RAY);
        Game.scene().add$Gizmo(new Beam$DeathRay()._Beam$DeathRay(DungeonTilemap.tileCenterToWorld(this.pos), target.sprite_.center$()));
        Sample.INSTANCE.play$Object(Assets$Sounds.RAY);
      }
      target.damage((Random.NormalIntRange(30, 50) + this.scalingDepth()) | 0, this);
      if (target === Dungeon.hero) {
        let hero = target;
        if (!hero.isAlive()) {
          Badges.validateDeathFromGrimOrDisintTrap();
          Dungeon.fail(this);
          GLog.n(Messages.get$Object$String$ObjectArr(this, 'ondeath', []), []);
          if (this.reclaimed) {
            Badges.validateDeathFromFriendlyMagic();
          }
        }
      }
    }
  }
}

$J.define(DisintegrationTrap, 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.DisintegrationTrap', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap', ctors: { '': '_DisintegrationTrap' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  Beam$DeathRay = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Beam$DeathRay');
  Trap$HazardAssistTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap$HazardAssistTracker');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Game = $J.load('com.watabou.noosa.Game');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Random = $J.load('com.watabou.utils.Random');
});
