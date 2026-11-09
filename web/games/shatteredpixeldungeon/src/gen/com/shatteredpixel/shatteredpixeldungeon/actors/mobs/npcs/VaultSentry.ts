// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/npcs/VaultSentry.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../../jre/index.ts';
import { NPC } from './NPC.ts';

let Assets$Sounds, Badges, Dungeon, Statistics, Actor, Char$Alignment, Char$Property, DM100$LightningBolt, Imp$Quest, Lightning, SparkParticle, Bestiary, Ballistica, ConeAOE, Messages, GameScene, SentrySprite$VaultScan, GLog, Game, Sample, Random;

export class VaultSentry extends NPC {
  scanWidth: number = 0;
  scanLength: number = 0;
  scanDirs: number[][] = null;
  scanDirIdx: number = 0;
  curCooldown: number = 0;
  afterScanCooldown: number = 0;
  scansAfterCooldown: number = 0;
  scansMade: number = 0;
  giveWarning: boolean = false;
  static SFXLastPlayed: bigint = 0n;
  seen: boolean = false;
  recentZaps: ArrayList<number> = null;
  static readonly SCAN_WIDTH: string = 'scan_width';
  static readonly SCAN_LENGTH: string = 'scan_length';
  static readonly SCAN_DIR_IDX: string = 'scan_dir_idx';
  static readonly SCAN_DIRS: string = 'scan_dirs_';
  static readonly SCAN_DIRS_LEN: string = 'scan_dirs_len';
  static readonly AFTER_SCAN_COOLDOWN: string = 'after_shot_cooldown';
  static readonly CUR_COOLDOWN: string = 'cur_cooldown';
  static readonly SCANS: string = 'shots';
  static readonly SCANS_MADE: string = 'shots_fired';
  static readonly WARNING: string = 'warning';
  static readonly RECENT_ZAPS: string = 'recent_zaps';
  _VaultSentry(): this {
    this._NPC();
    this.spriteClass = $J.cls(SentrySprite$VaultScan);
    this.properties_.add(Char$Property.IMMOVABLE);
    this.curCooldown = 1;
    this.afterScanCooldown = 1;
    this.scansAfterCooldown = 1;
    this.scansMade = 0;
    this.giveWarning = false;
    this.seen = false;
    this.recentZaps = new ArrayList();
    return this;
  }
  act(): boolean {
    if (!this.seen && Dungeon.level.heroFOV[this.pos]) {
      Bestiary.setSeen($J.getClass(this));
      this.seen = true;
    }
    if (this.fieldOfView == null || this.fieldOfView.length !== Dungeon.level.length()) {
      this.fieldOfView = $J.newArray(Dungeon.level.length(), false);
    }
    Dungeon.level.updateFieldOfView(this, this.fieldOfView);
    this.curCooldown--;
    let curZaps = new ArrayList();
    if (this.curCooldown <= 0) {
      let scanDirsThisTurn = this.scanDirs[this.scanDirIdx];
      let visible = false;
      for (let scanDir of scanDirsThisTurn) {
        let aim = new Ballistica()._Ballistica(this.pos, scanDir, Ballistica.WONT_STOP);
        let scan = new ConeAOE()._ConeAOE$Ballistica$float$float$int(aim, this.scanLength, this.scanWidth, Ballistica.STOP_SOLID | Ballistica.STOP_TARGET);
        if (scan.cells.isEmpty() && aim.path.size() >= 2) {
          scan.cells.add(aim.path.get(1));
        }
        for (const $it0 = scan.cells.iterator(); $it0.hasNext(); ) {
          let cell = $it0.next();
          if (this.fieldOfView[cell] && Dungeon.level.heroFOV[cell]) {
            visible = true;
            break;
          }
        }
        if (visible) {
          for (const $it1 = scan.cells.iterator(); $it1.hasNext(); ) {
            let cell = $it1.next();
            if (this.fieldOfView[cell]) {
              let ch = Actor.findChar(cell);
              if (ch != null && ch.alignment === Char$Alignment.ALLY && ch.invisible === 0) {
                if (this.recentZaps.contains(ch.id())) {
                  ch.damage(Random.NormalIntRange(3, 6), new DM100$LightningBolt()._DM100$LightningBolt());
                } else {
                  ch.damage(Random.NormalIntRange(6, 12), new DM100$LightningBolt()._DM100$LightningBolt());
                }
                curZaps.add(ch.id());
                if (ch.sprite_.visible_ || this.sprite_.visible_) {
                  Sample.INSTANCE.play$Object(Assets$Sounds.LIGHTNING);
                  this.sprite_.parent.add$Gizmo(new Lightning()._Lightning$PointF$PointF$Callback(this.sprite_.center$(), ch.sprite_.destinationCenter(), null));
                  if (ch.sprite_.visible_) {
                    let e = GameScene.emitter();
                    if (e != null) {
                      e.pos$PointF(ch.sprite_.destinationCenter());
                      e.burst(SparkParticle.FACTORY, 3);
                    }
                    ch.sprite_.flash();
                  }
                }
                if (ch === Dungeon.hero) {
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
              GameScene.checkedCell(cell, this.pos);
            }
          }
        }
      }
      if (visible && BigInt.asIntN(64, VaultSentry.SFXLastPlayed + 80n) < Game.realTime) {
        Sample.INSTANCE.play$Object$float(Assets$Sounds.ZAP, 0.5);
        VaultSentry.SFXLastPlayed = Game.realTime;
      }
      this.scanDirIdx++;
      if (this.scanDirIdx >= this.scanDirs.length) {
        this.scanDirIdx = 0;
      }
      this.scansMade++;
      if (this.scansMade < this.scansAfterCooldown) {
        this.curCooldown = 1;
      } else {
        this.scansMade = 0;
        this.curCooldown = this.afterScanCooldown;
      }
    }
    this.recentZaps.clear();
    this.recentZaps.addAll(curZaps);
    if (this.curCooldown === 1 && this.giveWarning) {
      let scanDirsNextTurn = this.scanDirs[this.scanDirIdx];
      for (let scanDir of scanDirsNextTurn) {
        let aim = new Ballistica()._Ballistica(this.pos, scanDir, Ballistica.WONT_STOP);
        let scan = new ConeAOE()._ConeAOE$Ballistica$float$float$int(aim, this.scanLength, this.scanWidth, Ballistica.STOP_SOLID | Ballistica.STOP_TARGET);
        if (scan.cells.isEmpty() && aim.path.size() >= 2) {
          scan.cells.add(aim.path.get(1));
        }
        let visible = false;
        for (const $it2 = scan.cells.iterator(); $it2.hasNext(); ) {
          let cell = $it2.next();
          if (Dungeon.level.heroFOV[cell] && this.fieldOfView[cell]) {
            visible = true;
          }
        }
        if (visible) {
          for (const $it3 = scan.cells.iterator(); $it3.hasNext(); ) {
            let cell = $it3.next();
            if (this.fieldOfView[cell]) {
              Dungeon.hero.interrupt();
              GameScene.targetedCell$int$int$float(cell, 16711680, Actor.TICK);
            }
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
    bundle.put$String$float(VaultSentry.SCAN_WIDTH, this.scanWidth);
    bundle.put$String$float(VaultSentry.SCAN_LENGTH, this.scanLength);
    bundle.put$String$int(VaultSentry.SCAN_DIR_IDX, this.scanDirIdx);
    bundle.put$String$int(VaultSentry.SCAN_DIRS_LEN, this.scanDirs.length);
    for (let i = 0; i < this.scanDirs.length; i++) {
      bundle.put$String$intArr(VaultSentry.SCAN_DIRS + i, this.scanDirs[i]);
    }
    bundle.put$String$int(VaultSentry.AFTER_SCAN_COOLDOWN, this.afterScanCooldown);
    bundle.put$String$int(VaultSentry.CUR_COOLDOWN, this.curCooldown);
    bundle.put$String$int(VaultSentry.SCANS, this.scansAfterCooldown);
    bundle.put$String$int(VaultSentry.SCANS_MADE, this.scansMade);
    bundle.put$String$boolean(VaultSentry.WARNING, this.giveWarning);
    let recent = $J.newArray(this.recentZaps.size(), 0);
    for (let i = 0; i < recent.length; i++) {
      recent[i] = this.recentZaps.get(i);
    }
    bundle.put$String$intArr(VaultSentry.RECENT_ZAPS, recent);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.scanWidth = bundle.getFloat(VaultSentry.SCAN_WIDTH);
    this.scanLength = bundle.getFloat(VaultSentry.SCAN_LENGTH);
    this.scanDirIdx = bundle.getInt(VaultSentry.SCAN_DIR_IDX);
    this.scanDirs = $J.newArray(bundle.getInt(VaultSentry.SCAN_DIRS_LEN), null);
    for (let i = 0; i < this.scanDirs.length; i++) {
      this.scanDirs[i] = bundle.getIntArray(VaultSentry.SCAN_DIRS + i);
    }
    if (bundle.contains(VaultSentry.AFTER_SCAN_COOLDOWN)) {
      this.afterScanCooldown = bundle.getInt(VaultSentry.AFTER_SCAN_COOLDOWN);
      this.curCooldown = bundle.getInt(VaultSentry.CUR_COOLDOWN);
      this.scansAfterCooldown = bundle.getInt(VaultSentry.SCANS);
      this.scansMade = bundle.getInt(VaultSentry.SCANS_MADE);
      this.giveWarning = bundle.getBoolean(VaultSentry.WARNING);
    }
    if (bundle.contains(VaultSentry.RECENT_ZAPS)) {
      this.recentZaps.clear();
      for (let i of bundle.getIntArray(VaultSentry.RECENT_ZAPS)) {
        this.recentZaps.add(i);
      }
    }
  }
  static $clinit() {
    VaultSentry.SFXLastPlayed = 0n;
  }
}

$J.define(VaultSentry, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.VaultSentry', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.NPC', ctors: { '': '_VaultSentry' }, clinit: true, lazy: ['SFXLastPlayed'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  DM100$LightningBolt = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DM100$LightningBolt');
  Imp$Quest = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Imp$Quest');
  Lightning = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Lightning');
  SparkParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.SparkParticle');
  Bestiary = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Bestiary');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  ConeAOE = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.ConeAOE');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  SentrySprite$VaultScan = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.SentrySprite$VaultScan');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Game = $J.load('com.watabou.noosa.Game');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Random = $J.load('com.watabou.utils.Random');
});
