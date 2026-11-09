// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/npcs/VaultLaser.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../jre/index.ts';
import { NPC } from './NPC.ts';

let Assets$Sounds, Badges, Dungeon, Statistics, Actor, Char$Alignment, Char$Property, Eye$DeathGaze, Imp$Quest, Beam$DeathRay, CellEmitter, PurpleParticle, Bestiary, Ballistica, Messages, GameScene, SentrySprite$VaultLaser, DungeonTilemap, GLog, Game, Sample, Random;

export class VaultLaser extends NPC {
  laserDirs: number[] = null;
  laserDirIdx: number = 0;
  curCooldown: number = 0;
  afterShotCooldown: number = 0;
  shotsAfterCooldown: number = 0;
  shotsFired: number = 0;
  giveWarning: boolean = false;
  static SFXLastPlayed: bigint = 0n;
  seen: boolean = false;
  static readonly LASER_DIRS: string = 'laser_dirs';
  static readonly LASER_DIR_IDX: string = 'laser_dir_idx';
  static readonly AFTER_SHOT_COOLDOWN: string = 'after_shot_cooldown';
  static readonly CUR_COOLDOWN: string = 'cur_cooldown';
  static readonly SHOTS: string = 'shots';
  static readonly SHOTS_FIRED: string = 'shots_fired';
  static readonly WARNING: string = 'warning';
  _VaultLaser(): this {
    this._NPC();
    this.spriteClass = $J.cls(SentrySprite$VaultLaser);
    this.properties_.add(Char$Property.IMMOVABLE);
    this.shotsAfterCooldown = 1;
    this.shotsFired = 0;
    this.giveWarning = true;
    this.seen = false;
    return this;
  }
  act(): boolean {
    if (!this.seen && Dungeon.level.heroFOV[this.pos]) {
      Bestiary.setSeen($J.getClass(this));
      this.seen = true;
    }
    this.curCooldown--;
    if (this.curCooldown <= 0) {
      let beam = new Ballistica()._Ballistica(this.pos, this.laserDirs[this.laserDirIdx], Ballistica.STOP_SOLID);
      let visible = false;
      let observe = false;
      for (const $it0 = beam.subPath(1, beam.dist).iterator(); $it0.hasNext(); ) {
        let cell = $it0.next();
        if (Dungeon.level.heroFOV[cell]) {
          visible = true;
        }
        if (Dungeon.level.flamable[cell]) {
          Dungeon.level.destroy(cell);
          observe = true;
          GameScene.updateMap$int(cell);
        }
        let ch = Actor.findChar(cell);
        if (ch != null && ch.alignment === Char$Alignment.ALLY) {
          ch.damage(Random.NormalIntRange(10, 20), new Eye$DeathGaze()._Eye$DeathGaze());
          if (ch.sprite_.visible_) {
            ch.sprite_.flash();
            CellEmitter.center(this.pos).burst(PurpleParticle.BURST, Random.IntRange(1, 2));
          }
          if (ch === Dungeon.hero) {
            Sample.INSTANCE.play$Object(Assets$Sounds.RAY);
            VaultLaser.SFXLastPlayed = Game.realTime;
            if (Imp$Quest.hazardFreebies > 0) {
              Imp$Quest.hazardFreebies--;
            } else {
              Statistics.questScores[3] = (Statistics.questScores[3] - 100) | 0;
            }
            if (!ch.isAlive()) {
              Badges.validateDeathFromEnemyMagic();
              Dungeon.fail(this);
              GLog.n(Messages.get$Object$String$ObjectArr(this, 'ondeath', []), []);
            }
          }
        }
      }
      if (visible) {
        this.sprite_.parent.add$Gizmo(new Beam$DeathRay()._Beam$DeathRay(this.sprite_.center$(), DungeonTilemap.raisedTileCenterToWorld(beam.collisionPos)));
        if (BigInt.asIntN(64, VaultLaser.SFXLastPlayed + 80n) < Game.realTime) {
          Sample.INSTANCE.play$Object$float(Assets$Sounds.RAY, 0.5);
          VaultLaser.SFXLastPlayed = Game.realTime;
        }
      }
      if (observe) {
        Dungeon.observe$();
      }
      this.laserDirIdx++;
      if (this.laserDirIdx >= this.laserDirs.length) {
        this.laserDirIdx = 0;
      }
      this.shotsFired++;
      if (this.shotsFired < this.shotsAfterCooldown) {
        this.curCooldown = 1;
      } else {
        this.shotsFired = 0;
        this.curCooldown = this.afterShotCooldown;
      }
    }
    if (this.curCooldown === 1 && this.giveWarning) {
      let nextBeam = new Ballistica()._Ballistica(this.pos, this.laserDirs[this.laserDirIdx], Ballistica.STOP_SOLID);
      let visible = false;
      for (const $it1 = nextBeam.subPath(1, nextBeam.dist).iterator(); $it1.hasNext(); ) {
        let cell = $it1.next();
        if (Dungeon.level.heroFOV[cell]) {
          visible = true;
          break;
        }
      }
      if (visible) {
        for (const $it2 = nextBeam.subPath(1, nextBeam.dist).iterator(); $it2.hasNext(); ) {
          let cell = $it2.next();
          GameScene.targetedCell$int$float(cell, 1);
          if (Actor.findChar(cell) === Dungeon.hero) {
            Dungeon.hero.interrupt();
          }
        }
      }
    }
    this.throwItems();
    this.spend(Actor.TICK);
    return true;
  }
  isImmune(effect: JClass): boolean {
    return true;
  }
  isInvulnerable(effect: JClass): boolean {
    return true;
  }
  reset(): boolean {
    return true;
  }
  interact(c: Char): boolean {
    return true;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$intArr(VaultLaser.LASER_DIRS, this.laserDirs);
    bundle.put$String$int(VaultLaser.LASER_DIR_IDX, this.laserDirIdx);
    bundle.put$String$int(VaultLaser.AFTER_SHOT_COOLDOWN, this.afterShotCooldown);
    bundle.put$String$int(VaultLaser.CUR_COOLDOWN, this.curCooldown);
    bundle.put$String$int(VaultLaser.SHOTS, this.shotsAfterCooldown);
    bundle.put$String$int(VaultLaser.SHOTS_FIRED, this.shotsFired);
    bundle.put$String$boolean(VaultLaser.WARNING, this.giveWarning);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.laserDirs = bundle.getIntArray(VaultLaser.LASER_DIRS);
    this.laserDirIdx = bundle.getInt(VaultLaser.LASER_DIR_IDX);
    if (bundle.contains(VaultLaser.AFTER_SHOT_COOLDOWN)) {
      this.afterShotCooldown = bundle.getInt(VaultLaser.AFTER_SHOT_COOLDOWN);
      this.curCooldown = bundle.getInt(VaultLaser.CUR_COOLDOWN);
      this.shotsAfterCooldown = bundle.getInt(VaultLaser.SHOTS);
      this.shotsFired = bundle.getInt(VaultLaser.SHOTS_FIRED);
      this.giveWarning = bundle.getBoolean(VaultLaser.WARNING);
    } else {
      this.afterShotCooldown = Random.IntRange(3, 7);
      this.curCooldown = Random.IntRange(1, this.afterShotCooldown);
    }
  }
  static $clinit() {
    VaultLaser.SFXLastPlayed = 0n;
  }
}

$J.define(VaultLaser, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.VaultLaser', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.NPC', ctors: { '': '_VaultLaser' }, clinit: true, lazy: ['SFXLastPlayed'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Eye$DeathGaze = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Eye$DeathGaze');
  Imp$Quest = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Imp$Quest');
  Beam$DeathRay = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Beam$DeathRay');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  PurpleParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.PurpleParticle');
  Bestiary = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Bestiary');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  SentrySprite$VaultLaser = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.SentrySprite$VaultLaser');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Game = $J.load('com.watabou.noosa.Game');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Random = $J.load('com.watabou.utils.Random');
});
