// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/blobs/SacrificialFire.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Blob } from './Blob.ts';
import { FlavourBuff } from '../buffs/FlavourBuff.ts';

let Assets$Sounds, Badges, Dungeon, Actor, Buff, Hero, Bee, Mimic, Mob, Piranha, Statue, Swarm, Wraith, CellEmitter, SacrificialParticle, Notes, Notes$Landmark, SacrificeRoom, Messages, GLog, Sample, PathFinder, Random;

export class SacrificialFire extends Blob {
  curEmitter: BlobEmitter = null;
  bonusSpawns: number = 0;
  prize_: Item = null;
  static readonly BONUS_SPAWNS: string = 'bonus_spawns';
  static readonly PRIZE: string = 'prize';
  _SacrificialFire(): this {
    this._Blob();
    this.actPriority = (Actor.MOB_PRIO - 1) | 0;
    this.bonusSpawns = 3;
    return this;
  }
  landmark(): Notes$Landmark {
    return Notes$Landmark.SACRIFICIAL_FIRE;
  }
  evolve(): void {
    let cell: number;
    for (let i = (this.area.top_ - 1) | 0; i <= this.area.bottom_; i++) {
      for (let j = (this.area.left_ - 1) | 0; j <= this.area.right_; j++) {
        cell = (j + Math.imul(i, Dungeon.level.width())) | 0;
        if (Dungeon.level.insideMap(cell)) {
          this.off[cell] = this.cur[cell];
          this.volume_ = (this.volume_ + this.off[cell]) | 0;
          if (this.off[cell] > 0) {
            for (let k of PathFinder.NEIGHBOURS9) {
              let ch = Actor.findChar((cell + k) | 0);
              if (ch != null) {
                if (Dungeon.level.heroFOV[(cell + k) | 0] && ch.buff($J.cls(SacrificialFire$Marked)) == null) {
                  (CellEmitter.get((cell + k) | 0)).burst(SacrificialParticle.FACTORY, 5);
                }
                Buff.prolong(ch, $J.cls(SacrificialFire$Marked), SacrificialFire$Marked.DURATION);
              }
            }
            if (this.off[cell] > 0 && Dungeon.level.visited[cell]) {
              if (Dungeon.level.mobCount() === 0 && this.bonusSpawns > 0) {
                if (Dungeon.level.spawnMob(4)) {
                  this.bonusSpawns--;
                }
              }
            }
          }
        }
      }
    }
    let max = (6 + Math.imul(Dungeon.depth, 4)) | 0;
    this.curEmitter.pour(SacrificialParticle.FACTORY, Math.fround(Math.fround(0.01) + (Math.fround((Math.fround(this.volume_ / Math.fround(max))) * Math.fround(0.09)))));
  }
  use(emitter: BlobEmitter): void {
    super.use(emitter);
    this.curEmitter = emitter;
    let max = (6 + Math.imul(Dungeon.depth, 4)) | 0;
    this.curEmitter.pour(SacrificialParticle.FACTORY, Math.fround(Math.fround(0.01) + (Math.fround((Math.fround(this.volume_ / Math.fround(max))) * Math.fround(0.09)))));
  }
  tileDesc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', []);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(SacrificialFire.BONUS_SPAWNS, this.bonusSpawns);
    bundle.put$String$Bundlable(SacrificialFire.PRIZE, this.prize_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.bonusSpawns = bundle.getInt(SacrificialFire.BONUS_SPAWNS);
    if (bundle.contains(SacrificialFire.PRIZE)) {
      this.prize_ = bundle.get$String(SacrificialFire.PRIZE);
    }
  }
  setPrize(prize: Item): void {
    this.prize_ = prize;
  }
  sacrifice(ch: Char): void {
    let firePos = -1;
    for (let i of PathFinder.NEIGHBOURS9) {
      if (this.volume_ > 0 && (this.cur[(ch.pos + i) | 0]) > 0) {
        firePos = (ch.pos + i) | 0;
        break;
      }
    }
    if (firePos !== -1) {
      let exp = 0;
      if (ch instanceof Mob) {
        if (ch instanceof Statue || ch instanceof Mimic) {
          exp = (1 + Dungeon.depth) | 0;
        } else if (ch instanceof Piranha || ch instanceof Bee) {
          exp = (1 + $J.idiv(Dungeon.depth, 2)) | 0;
        } else if (ch instanceof Wraith) {
          exp = (1 + $J.idiv(Dungeon.depth, 3)) | 0;
        } else if (ch instanceof Swarm && (ch).EXP === 0) {
          exp = 1;
        } else if ((ch).EXP > 0) {
          exp = (1 + (ch).EXP) | 0;
        }
        exp = Math.imul(exp, Random.IntRange(2, 3));
      } else if (ch instanceof Hero) {
        exp = 1000000;
        Badges.validateDeathFromSacrifice();
      }
      if (exp > 0) {
        let volumeLeft = (this.cur[firePos] - exp) | 0;
        if (volumeLeft > 0) {
          this.cur[firePos] = (this.cur[firePos] - exp) | 0;
          this.volume_ = (this.volume_ - exp) | 0;
          this.bonusSpawns++;
          CellEmitter.get(firePos).burst(SacrificialParticle.FACTORY, 20);
          Sample.INSTANCE.play$Object(Assets$Sounds.BURNING);
          GLog.w(Messages.get$Class$String$ObjectArr($J.cls(SacrificialFire), 'worthy', []), []);
        } else {
          this.clear(firePos);
          if (this.volume_ <= 0) {
            Notes.remove$Landmark(this.landmark());
          }
          for (let i of PathFinder.NEIGHBOURS9) {
            (CellEmitter.get((firePos + i) | 0)).burst(SacrificialParticle.FACTORY, 20);
          }
          Sample.INSTANCE.play$Object(Assets$Sounds.BURNING);
          Sample.INSTANCE.play$Object(Assets$Sounds.BURNING);
          Sample.INSTANCE.play$Object(Assets$Sounds.BURNING);
          GLog.w(Messages.get$Class$String$ObjectArr($J.cls(SacrificialFire), 'reward', []), []);
          if (this.prize_ != null) {
            Dungeon.level.drop(this.prize_, firePos).sprite_.drop$();
          } else {
            Dungeon.level.drop(SacrificeRoom.prize(Dungeon.level), firePos).sprite_.drop$();
          }
        }
      } else {
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(SacrificialFire), 'unworthy', []), []);
      }
    }
  }
}

export class SacrificialFire$Marked extends FlavourBuff {
  static readonly DURATION: number = 2;
  _SacrificialFire$Marked(): this {
    this._FlavourBuff();
    return this;
  }
  detach(): void {
    if (!this.target.isAlive()) {
      let fire = Dungeon.level.blobs.get($J.cls(SacrificialFire));
      if (fire != null) {
        fire.sacrifice(this.target);
      }
    }
    super.detach();
  }
}

$J.define(SacrificialFire, 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.SacrificialFire', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob', ctors: { '': '_SacrificialFire' } });
$J.define(SacrificialFire$Marked, 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.SacrificialFire$Marked', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_SacrificialFire$Marked' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  Bee = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Bee');
  Mimic = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mimic');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  Piranha = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Piranha');
  Statue = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Statue');
  Swarm = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Swarm');
  Wraith = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Wraith');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  SacrificialParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.SacrificialParticle');
  Notes = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes');
  Notes$Landmark = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes$Landmark');
  SacrificeRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SacrificeRoom');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
