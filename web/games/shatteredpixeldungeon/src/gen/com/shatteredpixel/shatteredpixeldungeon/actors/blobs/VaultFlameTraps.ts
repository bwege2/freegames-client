// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/blobs/VaultFlameTraps.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, Arrays } from '../../../../../../jre/index.ts';
import { Blob } from './Blob.ts';

let Assets$Sounds, Dungeon, Statistics, Actor, Fire, Buff, Burning, Imp$Quest, CellEmitter, ElmoParticle, Messages, Game, Sample;

export class VaultFlameTraps extends Blob {
  afterTriggerCooldowns: number[] = null;
  curCooldowns: number[] = null;
  triggersAfterCooldown: number[] = null;
  static SFXLastPlayed: bigint = 0n;
  static readonly AFTER_TRIGGER_CDS: string = 'after_trigger_cds';
  static readonly CUR_COOLDOWNS: string = 'cur_cooldowns';
  static readonly TRIGGERS: string = 'triggers';
  _VaultFlameTraps(): this {
    this._Blob();
    return this;
  }
  act(): boolean {
    super.act();
    if (this.afterTriggerCooldowns != null) {
      for (let i = 0; i < this.afterTriggerCooldowns.length; i++) {
        if (this.afterTriggerCooldowns[i] > -1) {
          if (this.curCooldowns[i] <= 0) {
            this.curCooldowns[i] = this.afterTriggerCooldowns[i];
          }
          this.curCooldowns[i]--;
          if (this.curCooldowns[i] <= 0) {
            this.seed(Dungeon.level, i, this.triggersAfterCooldown[i]);
          }
        }
      }
    }
    return true;
  }
  evolve(): void {
    let cell: number;
    let playSfx = false;
    for (let i = this.area.left_; i < this.area.right_; i++) {
      for (let j = this.area.top_; j < this.area.bottom_; j++) {
        cell = (i + Math.imul(j, Dungeon.level.width())) | 0;
        if (this.cur[cell] > 0) {
          let ch = Actor.findChar(cell);
          if (ch != null && !ch.isImmune($J.getClass(this))) {
            if (ch === Dungeon.hero) {
              Sample.INSTANCE.play$Object(Assets$Sounds.BURNING);
              VaultFlameTraps.SFXLastPlayed = Game.realTime;
              if (Imp$Quest.hazardFreebies > 0) {
                Imp$Quest.hazardFreebies--;
              } else {
                Statistics.questScores[3] = (Statistics.questScores[3] - 100) | 0;
              }
            }
            if (!ch.isImmune($J.cls(Fire))) {
              Buff.affect$Char$Class(ch, $J.cls(Burning)).reignite$Char$float(ch, 4);
            }
            let heap = Dungeon.level.heaps.get(cell);
            if (heap != null) {
              heap.burn();
            }
            let plant = Dungeon.level.plants.get(cell);
            if (plant != null) {
              plant.wither();
            }
          }
          if (Dungeon.level.heroFOV[cell]) {
            CellEmitter.get(cell).start(ElmoParticle.FACTORY, Math.fround(0.02), 10);
            playSfx = true;
          }
          this.off[cell] = (this.cur[cell] - 1) | 0;
          this.volume_ = (this.volume_ + this.off[cell]) | 0;
        } else {
          this.off[cell] = 0;
        }
      }
    }
    if (playSfx && BigInt.asIntN(64, VaultFlameTraps.SFXLastPlayed + 80n) < Game.realTime) {
      Sample.INSTANCE.play$Object$float(Assets$Sounds.BURNING, 0.5);
      VaultFlameTraps.SFXLastPlayed = Game.realTime;
    }
  }
  seed(level: Level, cell: number, amount: number): void {
    super.seed(level, cell, amount);
    if (this.afterTriggerCooldowns == null) {
      this.afterTriggerCooldowns = $J.newArray(level.length(), 0);
      Arrays.fill(this.afterTriggerCooldowns, -1);
    }
    if (this.curCooldowns == null) {
      this.curCooldowns = $J.newArray(level.length(), 0);
    }
    if (this.triggersAfterCooldown == null) {
      this.triggersAfterCooldown = $J.newArray(level.length(), 0);
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    if (this.afterTriggerCooldowns != null) {
      bundle.put$String$intArr(VaultFlameTraps.AFTER_TRIGGER_CDS, this.afterTriggerCooldowns);
      bundle.put$String$intArr(VaultFlameTraps.CUR_COOLDOWNS, this.curCooldowns);
      bundle.put$String$intArr(VaultFlameTraps.TRIGGERS, this.triggersAfterCooldown);
    }
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    if (bundle.contains(VaultFlameTraps.AFTER_TRIGGER_CDS)) {
      this.afterTriggerCooldowns = bundle.getIntArray(VaultFlameTraps.AFTER_TRIGGER_CDS);
      this.curCooldowns = bundle.getIntArray(VaultFlameTraps.CUR_COOLDOWNS);
      this.triggersAfterCooldown = bundle.getIntArray(VaultFlameTraps.TRIGGERS);
    }
  }
  use(emitter: BlobEmitter): void {
    super.use(emitter);
    emitter.bound.set$float$float$float$float(Math.fround(0.4), Math.fround(0.4), Math.fround(0.6), Math.fround(0.6));
    emitter.pour(ElmoParticle.FACTORY, Math.fround(0.3));
  }
  tileDesc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', []);
  }
  static $clinit() {
    VaultFlameTraps.SFXLastPlayed = 0n;
  }
}

$J.define(VaultFlameTraps, 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.VaultFlameTraps', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob', ctors: { '': '_VaultFlameTraps' }, clinit: true, lazy: ['SFXLastPlayed'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Fire = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Fire');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Burning = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Burning');
  Imp$Quest = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Imp$Quest');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  ElmoParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ElmoParticle');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  Game = $J.load('com.watabou.noosa.Game');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
