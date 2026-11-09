// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/traps/GrimTrap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Badges, Dungeon, Actor, Buff, Hero, Mob, CellEmitter, MagicMissile, ShadowParticle, Trap$HazardAssistTracker, Ballistica, Messages, DungeonTilemap, GLog, Sample;

export class GrimTrap extends Trap {
  _GrimTrap(): this {
    this._Trap();
    this.color_ = Trap.GREY;
    this.shape = Trap.LARGE_DOT;
    this.canBeHidden = false;
    this.avoidsClosedSpaces = true;
    return this;
  }
  activate(): void {
    Actor.add$Actor(new (GrimTrap$1())().$o(this)._Actor().$init_anon());
  }
}

let $GrimTrap$1$1: any = null;
/** An anonymous class (GrimTrap.java:109). */
function GrimTrap$1$1(): any {
  return $GrimTrap$1$1 ??= $J.local(class extends JObject {
    call(): void {
      this.$cv_finalTarget.damage(this.$cv_finalDmg, this.$outer.$outer);
      if (this.$cv_finalTarget === Dungeon.hero) {
        Sample.INSTANCE.play$Object(Assets$Sounds.CURSED);
        if (!this.$cv_finalTarget.isAlive()) {
          Badges.validateDeathFromGrimOrDisintTrap();
          Dungeon.fail(this.$outer.$outer);
          GLog.n(Messages.get$Class$String$ObjectArr($J.cls(GrimTrap), 'ondeath', []), []);
          if (this.$outer.$outer.reclaimed) {
            Badges.validateDeathFromFriendlyMagic();
          }
        }
      } else {
        Sample.INSTANCE.play$Object(Assets$Sounds.BURNING);
      }
      this.$cv_finalTarget.sprite_.emitter().burst(ShadowParticle.UP, 10);
      this.$outer.next();
    }
    $c($finalTarget, $finalDmg): this {
      this.$cv_finalTarget = $finalTarget; this.$cv_finalDmg = $finalDmg;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.GrimTrap$1$1', ['com.watabou.utils.Callback']);
}

let $GrimTrap$1: any = null;
/** An anonymous class (GrimTrap.java:56). */
function GrimTrap$1(): any {
  return $GrimTrap$1 ??= $J.local(class extends Actor {
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
        let damage = $J.roundf(Math.fround(Math.fround(finalTarget.HT / 2) + Math.fround(finalTarget.HP / 2)));
        if (finalTarget === Dungeon.hero) {
          damage = $J.d2i(Math.min(Math.fround(damage), Math.fround(finalTarget.HT * Math.fround(0.9))));
        }
        let finalDmg = damage;
        if (Dungeon.level.heroFOV[this.$outer.pos] || Dungeon.level.heroFOV[target.pos]) {
          (finalTarget.sprite_.parent.recycle($J.cls(MagicMissile))).reset$int$PointF$PointF$Callback(MagicMissile.SHADOW, DungeonTilemap.tileCenterToWorld(this.$outer.pos), finalTarget.sprite_.center$(), new (GrimTrap$1$1())().$o(this).$c(finalTarget, finalDmg));
          return false;
        } else {
          finalTarget.damage(finalDmg, this.$outer);
          return true;
        }
      } else {
        CellEmitter.get(this.$outer.pos).burst(ShadowParticle.UP, 10);
        Sample.INSTANCE.play$Object(Assets$Sounds.BURNING);
        return true;
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.GrimTrap$1', []);
}

$J.define(GrimTrap, 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.GrimTrap', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap', ctors: { '': '_GrimTrap' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  MagicMissile = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile');
  ShadowParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShadowParticle');
  Trap$HazardAssistTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap$HazardAssistTracker');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
