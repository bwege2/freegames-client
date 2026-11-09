// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/trinkets/ChaoticCenser.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, HashMap } from '../../../../../../jre/index.ts';
import { Trinket } from './Trinket.ts';
import { Buff } from '../../actors/buffs/Buff.ts';
import { FlavourBuff } from '../../actors/buffs/FlavourBuff.ts';

let Assets$Sounds, Dungeon, Char$Alignment, Blizzard, Blob, ConfusionGas, CorrosiveGas, Inferno, Regrowth, SmokeScreen, StenchGas, StormCloud, ToxicGas, Regeneration, Mob, MagicMissile, Speck, Messages, GameScene, ItemSpriteSheet, TargetHealthIndicator, GLog, Sample, BArray, PathFinder, Random;

export class ChaoticCenser extends Trinket {
  static GAS_CAT_CHANCES: number[][] = null;
  static COMMON_GASSES: HashMap<JClass<Blob>, number> = null;
  static UNCOMMON_GASSES: HashMap<JClass<Blob>, number> = null;
  static RARE_GASSES: HashMap<JClass<Blob>, number> = null;
  static MISSILE_VFX: HashMap<JClass<Blob>, number> = null;
  _ChaoticCenser(): this {
    this._Trinket();
    this.image_ = ItemSpriteSheet.CHAOTIC_CENSER;
    return this;
  }
  upgradeEnergyCost(): number {
    return (6 + Math.imul(2, this.level$())) | 0;
  }
  statsDesc(): string {
    if (this.isIdentified()) {
      return Messages.get$Object$String$ObjectArr(this, 'stats_desc', [ChaoticCenser.averageTurnsUntilGas$int(this.buffedLvl())]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'stats_desc', [ChaoticCenser.averageTurnsUntilGas$int(0)]);
    }
  }
  static averageTurnsUntilGas$(): number {
    return ChaoticCenser.averageTurnsUntilGas$int(Trinket.trinketLevel($J.cls(ChaoticCenser)));
  }
  static averageTurnsUntilGas$int(level: number): number {
    if (level <= -1) {
      return -1;
    } else {
      return $J.idiv(300, ((level + 1) | 0));
    }
  }
  static produceGas(target: Char): boolean {
    let level = Trinket.trinketLevel($J.cls(ChaoticCenser));
    if (level < 0 || level > 3) {
      return false;
    }
    let gasToSpawn: JClass<Blob>;
    let gasQuantity: number;
    switch (Random.chances$floatArr(ChaoticCenser.GAS_CAT_CHANCES[level])) {
      case 0:
      default:
        do {
          gasToSpawn = Random.element$Collection(ChaoticCenser.COMMON_GASSES.keySet());
        } while (!Regeneration.regenOn() && gasToSpawn === $J.cls(Regrowth));
        gasQuantity = +$J.boxF(ChaoticCenser.COMMON_GASSES.get(gasToSpawn));
        break;
      case 1:
        gasToSpawn = Random.element$Collection(ChaoticCenser.UNCOMMON_GASSES.keySet());
        gasQuantity = +$J.boxF(ChaoticCenser.UNCOMMON_GASSES.get(gasToSpawn));
        break;
      case 2:
        gasToSpawn = Random.element$Collection(ChaoticCenser.RARE_GASSES.keySet());
        gasQuantity = +$J.boxF(ChaoticCenser.RARE_GASSES.get(gasToSpawn));
        break;
    }
    let candidateCells = new HashMap();
    PathFinder.buildDistanceMap$int$booleanArr$int(Dungeon.hero.pos, BArray.not(Dungeon.level.solid, null), 6);
    for (let i = 0; i < Dungeon.level.length(); i++) {
      if (Dungeon.level.heroFOV[i] && PathFinder.distance[i] < 2147483647) {
        if (PathFinder.distance[i] >= 2 && PathFinder.distance[i] <= 6) {
          $J.boxF(candidateCells.put(i, $J.boxF(0)));
        }
      }
    }
    let targetpos = target.pos;
    if (Dungeon.level.trueDistance(target.pos, Dungeon.hero.pos) >= Math.fround(4)) {
      for (let i of PathFinder.NEIGHBOURS8) {
        while (!(Dungeon.level.solid[(targetpos + i) | 0]) && Dungeon.level.trueDistance((target.pos + i) | 0, Dungeon.hero.pos) < Dungeon.level.trueDistance(targetpos, Dungeon.hero.pos)) {
          targetpos = (target.pos + i) | 0;
        }
      }
    }
    let closest = 100;
    for (const $it0 = candidateCells.keySet().iterator(); $it0.hasNext(); ) {
      let cell = $it0.next();
      let dist = Math.fround(Dungeon.level.distance(cell, targetpos));
      if (dist < closest) {
        closest = dist;
      }
    }
    for (const $it1 = candidateCells.keySet().iterator(); $it1.hasNext(); ) {
      let cell = $it1.next();
      let dist = Math.fround(Dungeon.level.distance(cell, targetpos));
      if (Math.fround(dist - closest) === Math.fround(0)) {
        $J.boxF(candidateCells.put(cell, $J.boxF(8)));
      } else if (Math.fround(dist - closest) <= Math.fround(1)) {
        $J.boxF(candidateCells.put(cell, $J.boxF(1)));
      } else {
        $J.boxF(candidateCells.put(cell, $J.boxF(0)));
      }
    }
    if (!candidateCells.isEmpty()) {
      let targetCell = Random.chances$HashMap(candidateCells);
      if (targetCell != null) {
        Buff.affect$Char$Class$float(Dungeon.hero, $J.cls(ChaoticCenser$GasSpewer), Dungeon.hero.cooldown()).set(targetCell, gasToSpawn, $J.d2i(gasQuantity));
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(ChaoticCenser), 'spew', [Messages.titleCase(Messages.get$Class$String$ObjectArr(gasToSpawn, 'name', []))]), []);
        if (target.sprite_ != null && target.sprite_.parent != null) {
          GameScene.targetedCell$int$float(targetCell, Dungeon.hero.cooldown());
        }
        return true;
      }
    }
    return false;
  }
  static $clinit() {
    ChaoticCenser.GAS_CAT_CHANCES = $J.newArrayN([4, 3], 0);
    ChaoticCenser.GAS_CAT_CHANCES[0] = [80, 10, 10];
    ChaoticCenser.GAS_CAT_CHANCES[1] = [67, 13, 20];
    ChaoticCenser.GAS_CAT_CHANCES[2] = [54, 16, 30];
    ChaoticCenser.GAS_CAT_CHANCES[3] = [40, 20, 40];
    ChaoticCenser.COMMON_GASSES = new HashMap();
    $J.boxF(ChaoticCenser.COMMON_GASSES.put($J.cls(ToxicGas), $J.boxF(300)));
    $J.boxF(ChaoticCenser.COMMON_GASSES.put($J.cls(ConfusionGas), $J.boxF(300)));
    $J.boxF(ChaoticCenser.COMMON_GASSES.put($J.cls(StenchGas), $J.boxF(200)));
    ChaoticCenser.UNCOMMON_GASSES = new HashMap();
    $J.boxF(ChaoticCenser.UNCOMMON_GASSES.put($J.cls(StormCloud), $J.boxF(300)));
    $J.boxF(ChaoticCenser.UNCOMMON_GASSES.put($J.cls(SmokeScreen), $J.boxF(300)));
    $J.boxF(ChaoticCenser.UNCOMMON_GASSES.put($J.cls(Regrowth), $J.boxF(200)));
    ChaoticCenser.RARE_GASSES = new HashMap();
    $J.boxF(ChaoticCenser.RARE_GASSES.put($J.cls(Inferno), $J.boxF(300)));
    $J.boxF(ChaoticCenser.RARE_GASSES.put($J.cls(Blizzard), $J.boxF(300)));
    $J.boxF(ChaoticCenser.RARE_GASSES.put($J.cls(CorrosiveGas), $J.boxF(200)));
    ChaoticCenser.MISSILE_VFX = new HashMap();
    ChaoticCenser.MISSILE_VFX.put($J.cls(ToxicGas), (MagicMissile.SPECK + Speck.TOXIC) | 0);
    ChaoticCenser.MISSILE_VFX.put($J.cls(ConfusionGas), (MagicMissile.SPECK + Speck.CONFUSION) | 0);
    ChaoticCenser.MISSILE_VFX.put($J.cls(Regrowth), MagicMissile.FOLIAGE);
    ChaoticCenser.MISSILE_VFX.put($J.cls(StormCloud), (MagicMissile.SPECK + Speck.STORM) | 0);
    ChaoticCenser.MISSILE_VFX.put($J.cls(SmokeScreen), (MagicMissile.SPECK + Speck.SMOKE) | 0);
    ChaoticCenser.MISSILE_VFX.put($J.cls(StenchGas), (MagicMissile.SPECK + Speck.STENCH) | 0);
    ChaoticCenser.MISSILE_VFX.put($J.cls(Inferno), (MagicMissile.SPECK + Speck.INFERNO) | 0);
    ChaoticCenser.MISSILE_VFX.put($J.cls(Blizzard), (MagicMissile.SPECK + Speck.BLIZZARD) | 0);
    ChaoticCenser.MISSILE_VFX.put($J.cls(CorrosiveGas), (MagicMissile.SPECK + Speck.CORROSION) | 0);
  }
}

export class ChaoticCenser$CenserGasTracker extends Buff {
  left_: number = 0;
  safeAreaDelay: number = 0;
  static LEFT: string = null;
  _ChaoticCenser$CenserGasTracker(): this {
    this._Buff();
    this.left_ = 2147483647;
    this.safeAreaDelay = 100;
    return this;
  }
  act(): boolean {
    let avgTurns = ChaoticCenser.averageTurnsUntilGas$();
    if (avgTurns === -1) {
      this.spend(Math.fround(Random.NormalIntRange(1, 5)));
      return true;
    } else if (Math.fround(this.left_) > Math.fround(avgTurns * Math.fround(1.2))) {
      this.left_ = Random.IntRange($J.d2i((Math.fround(avgTurns * Math.fround(0.833)))), $J.d2i((Math.fround(avgTurns * Math.fround(1.2)))));
    }
    if (this.left_ <= 0) {
      if (TargetHealthIndicator.instance != null && TargetHealthIndicator.instance.isVisible()) {
        let target = TargetHealthIndicator.instance.target$();
        if (target != null && target.isActive() && target.alignment === Char$Alignment.ENEMY && (!(target instanceof Mob) || (target).state_ !== (target).PASSIVE)) {
          if (ChaoticCenser.produceGas(target)) {
            Sample.INSTANCE.play$Object$float(Assets$Sounds.GAS, 0.5);
            Dungeon.hero.interrupt();
            this.left_ = (this.left_ + Random.IntRange($J.d2i((Math.fround(avgTurns * Math.fround(0.9)))), $J.d2i((Math.fround(avgTurns * Math.fround(1.1)))))) | 0;
          }
        }
      }
    }
    let delay = Random.NormalIntRange(1, 3);
    this.spend(Math.fround(delay));
    this.left_ = $J.d2i(Math.max(Math.fround((this.left_ - delay) | 0), Math.fround(-avgTurns / 3)));
    return true;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(ChaoticCenser$CenserGasTracker.LEFT, this.left_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    if (bundle.contains(ChaoticCenser$CenserGasTracker.LEFT)) {
      this.left_ = bundle.getInt(ChaoticCenser$CenserGasTracker.LEFT);
    }
  }
  static $clinit() {
    ChaoticCenser$CenserGasTracker.LEFT = 'left';
  }
}

export class ChaoticCenser$GasSpewer extends FlavourBuff {
  targetCell: number = 0;
  depth_: number = 0;
  branch: number = 0;
  gasType: JClass<Blob> = null;
  gasQuantity: number = 0;
  static readonly CELL: string = 'cell';
  static readonly DEPTH: string = 'depth';
  static readonly BRANCH: string = 'branch';
  static readonly GAS_TYPE: string = 'gas_type';
  static readonly GAS_QUANTITY: string = 'gas_quantity';
  _ChaoticCenser$GasSpewer(): this {
    this._FlavourBuff();
    return this;
  }
  set(targetCell: number, gasType: JClass<Blob>, gasQuantity: number): void {
    this.targetCell = targetCell;
    this.depth_ = Dungeon.depth;
    this.branch = Dungeon.branch;
    this.gasType = gasType;
    this.gasQuantity = gasQuantity;
  }
  act(): boolean {
    if (this.depth_ === Dungeon.depth && this.branch === Dungeon.branch) {
      GameScene.add$Blob(Blob.seed$int$int$Class(this.targetCell, this.gasQuantity, this.gasType));
      if (this.gasType === $J.cls(CorrosiveGas)) {
        (Dungeon.level.blobs.get($J.cls(CorrosiveGas))).setStrength$int$Class((2 + $J.idiv(Dungeon.scalingDepth(), 5)) | 0, $J.cls(ChaoticCenser));
      }
      MagicMissile.boltFromChar(Dungeon.hero.sprite_.parent, ChaoticCenser.MISSILE_VFX.get(this.gasType), Dungeon.hero.sprite_, this.targetCell, null);
      Sample.INSTANCE.play$Object(Assets$Sounds.GAS);
    }
    this.detach();
    return true;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(ChaoticCenser$GasSpewer.CELL, this.targetCell);
    bundle.put$String$int(ChaoticCenser$GasSpewer.DEPTH, this.depth_);
    bundle.put$String$int(ChaoticCenser$GasSpewer.BRANCH, this.branch);
    bundle.put$String$Class(ChaoticCenser$GasSpewer.GAS_TYPE, this.gasType);
    bundle.put$String$int(ChaoticCenser$GasSpewer.GAS_QUANTITY, this.gasQuantity);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.targetCell = bundle.getInt(ChaoticCenser$GasSpewer.CELL);
    this.depth_ = bundle.getInt(ChaoticCenser$GasSpewer.DEPTH);
    this.branch = bundle.getInt(ChaoticCenser$GasSpewer.BRANCH);
    this.gasType = bundle.getClass$String(ChaoticCenser$GasSpewer.GAS_TYPE);
    this.gasQuantity = bundle.getInt(ChaoticCenser$GasSpewer.GAS_QUANTITY);
  }
}

$J.define(ChaoticCenser, 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ChaoticCenser', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.Trinket', ctors: { '': '_ChaoticCenser' }, meths: { 'averageTurnsUntilGas(int)': 'averageTurnsUntilGas$int', 'averageTurnsUntilGas()': 'averageTurnsUntilGas$' }, clinit: true, lazy: ['GAS_CAT_CHANCES', 'COMMON_GASSES', 'UNCOMMON_GASSES', 'RARE_GASSES', 'MISSILE_VFX'] });
$J.define(ChaoticCenser$CenserGasTracker, 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ChaoticCenser$CenserGasTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_ChaoticCenser$CenserGasTracker' }, clinit: true, lazy: ['LEFT'] });
$J.define(ChaoticCenser$GasSpewer, 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ChaoticCenser$GasSpewer', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_ChaoticCenser$GasSpewer' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Blizzard = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blizzard');
  Blob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob');
  ConfusionGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.ConfusionGas');
  CorrosiveGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.CorrosiveGas');
  Inferno = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Inferno');
  Regrowth = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Regrowth');
  SmokeScreen = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.SmokeScreen');
  StenchGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.StenchGas');
  StormCloud = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.StormCloud');
  ToxicGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.ToxicGas');
  Regeneration = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Regeneration');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  MagicMissile = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  TargetHealthIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.TargetHealthIndicator');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
