// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/traps/WornDartTrap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../../jre/index.ts';
import { Trap } from './Trap.ts';

let Assets$Sounds, Badges, Dungeon, Actor, Buff, Hero, Mob, Dart, Trap$HazardAssistTracker, Ballistica, Messages, MissileSprite, GLog, Game, Sample, Random;

export class WornDartTrap extends Trap {
  _WornDartTrap(): this {
    this._Trap();
    this.color_ = Trap.GREY;
    this.shape = Trap.CROSSHAIR;
    this.canBeHidden = false;
    this.avoidsClosedSpaces = true;
    return this;
  }
  activate(): void {
    Actor.add$Actor(new (WornDartTrap$1())().$o(this)._Actor().$init_anon());
  }
}

let $WornDartTrap$1$1: any = null;
/** An anonymous class (WornDartTrap.java:97). */
function WornDartTrap$1$1(): any {
  return $WornDartTrap$1$1 ??= $J.local(class extends JObject {
    call(): void {
      let dmg = (Random.NormalIntRange(4, 8) - this.$cv_finalTarget.drRoll()) | 0;
      this.$cv_finalTarget.damage(dmg, this.$outer.$outer);
      if (this.$cv_finalTarget === Dungeon.hero && !this.$cv_finalTarget.isAlive()) {
        Dungeon.fail(this.$outer.$outer);
        GLog.n(Messages.get$Class$String$ObjectArr($J.cls(WornDartTrap), 'ondeath', []), []);
        if (this.$outer.$outer.reclaimed) {
          Badges.validateDeathFromFriendlyMagic();
        }
      }
      Sample.INSTANCE.play$Object$float$float$float(Assets$Sounds.HIT, 1, 1, Random.Float$float$float(Math.fround(0.8), 1.25));
      this.$cv_finalTarget.sprite_.bloodBurstA(this.$cv_finalTarget.sprite_.center$(), dmg);
      this.$cv_finalTarget.sprite_.flash();
      this.$outer.next();
    }
    $c($finalTarget): this {
      this.$cv_finalTarget = $finalTarget;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.WornDartTrap$1$1', ['com.watabou.utils.Callback']);
}

let $WornDartTrap$1: any = null;
/** An anonymous class (WornDartTrap.java:56). */
function WornDartTrap$1(): any {
  return $WornDartTrap$1 ??= $J.local(class extends Actor {
    $init_anon() {
      this.actPriority = Actor.VFX_PRIO;
      return this;
    }
    act(): boolean {
      Actor.remove(this);
      let target = Actor.findChar(this.$outer.pos);
      let range = Math.fround(Math.max(6, Dungeon.level.viewDistance) + 0.5);
      if (target == null) {
        let closestDist = Math.fround(3.4028235E38);
        for (const $it0 = Actor.chars().iterator(); $it0.hasNext(); ) {
          let ch = $it0.next();
          if (!ch.isAlive()) {
            continue;
          }
          let curDist = Dungeon.level.trueDistance(this.$outer.pos, ch.pos);
          if (ch.invisible > 0) {
            curDist = Math.max(curDist, range);
          }
          let bolt = new Ballistica()._Ballistica(this.$outer.pos, ch.pos, Ballistica.PROJECTILE);
          if (bolt.collisionPos === ch.pos && (curDist < closestDist || (curDist === closestDist && target instanceof Hero))) {
            target = ch;
            closestDist = curDist;
          }
        }
        if (closestDist > range) {
          target = null;
        }
      }
      if (target != null) {
        if (target instanceof Mob) {
          Buff.prolong(target, $J.cls(Trap$HazardAssistTracker), Trap$HazardAssistTracker.DURATION);
        }
        let finalTarget = target;
        if (Dungeon.level.heroFOV[this.$outer.pos] || Dungeon.level.heroFOV[target.pos]) {
          (Game.scene().recycle($J.cls(MissileSprite))).reset$int$Visual$Item$Callback(this.$outer.pos, finalTarget.sprite_, new Dart()._Dart(), new (WornDartTrap$1$1())().$o(this).$c(finalTarget));
          return false;
        } else {
          finalTarget.damage((Random.NormalIntRange(4, 8) - finalTarget.drRoll()) | 0, this.$outer);
          return true;
        }
      } else {
        return true;
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.WornDartTrap$1', []);
}

$J.define(WornDartTrap, 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.WornDartTrap', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap', ctors: { '': '_WornDartTrap' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  Dart = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.Dart');
  Trap$HazardAssistTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap$HazardAssistTracker');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  MissileSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.MissileSprite');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Game = $J.load('com.watabou.noosa.Game');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Random = $J.load('com.watabou.utils.Random');
});
