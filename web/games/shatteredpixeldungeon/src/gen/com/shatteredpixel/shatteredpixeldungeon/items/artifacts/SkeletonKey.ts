// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/artifacts/SkeletonKey.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Arrays, JObject } from '../../../../../../jre/index.ts';
import { Artifact } from './Artifact.ts';
import { Artifact$ArtifactBuff } from './Artifact.ts';
import { Blob } from '../../actors/blobs/Blob.ts';
import { Buff } from '../../actors/buffs/Buff.ts';

let Assets$Sounds, Dungeon, Actor, Char, Char$Alignment, Char$Property, MagicImmune, Regeneration, Talent, CellEmitter, Speck, SpectralWallParticle, Heap$Type, Item, CrystalKey, GoldenKey, IronKey, RingOfEnergy, WandOfBlastWave, Catalog, Notes, Notes$Landmark, Level, Terrain, Ballistica, Messages, CellSelector$Listener, GameScene, ItemSpriteSheet, GLog, Sample, PathFinder, Random;

export class SkeletonKey extends Artifact {
  static readonly AC_INSERT: string = 'INSERT';
  targeter: CellSelector$Listener = null;
  _SkeletonKey(): this {
    this._Artifact();
    this.image_ = ItemSpriteSheet.ARTIFACT_KEY;
    this.levelCap = 10;
    this.charge_ = (3 + $J.idiv(this.level$(), 2)) | 0;
    this.partialCharge = 0;
    this.chargeCap_ = (3 + $J.idiv(this.level$(), 2)) | 0;
    this.defaultAction_ = SkeletonKey.AC_INSERT;
    this.targeter = new (SkeletonKey$1())().$o(this)._CellSelector$Listener();
    return this;
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    if (this.isEquipped(hero) && hero.buff($J.cls(MagicImmune)) == null && !this.cursed) {
      actions.add(SkeletonKey.AC_INSERT);
    }
    return actions;
  }
  execute$Hero$String(hero: Hero, action: string): void {
    super.execute$Hero$String(hero, action);
    if (hero.buff($J.cls(MagicImmune)) != null) {
      return;
    }
    if ($J.equals(action, SkeletonKey.AC_INSERT)) {
      Item.curUser = hero;
      if (!this.isEquipped(hero)) {
        GLog.i(Messages.get$Class$String$ObjectArr($J.cls(Artifact), 'need_to_equip', []), []);
      } else if (this.cursed) {
        GLog.w(Messages.get$Object$String$ObjectArr(this, 'cursed', []), []);
      } else {
        GameScene.selectCell(this.targeter);
      }
    }
  }
  gainExp(xpGain: number): void {
    if (this.level$() === this.levelCap) {
      return;
    }
    this.exp = (this.exp + xpGain) | 0;
    if (this.exp > ((4 + this.level$()) | 0)) {
      this.exp = (this.exp - (4 + this.level$())) | 0;
      this.upgrade$();
      GLog.p(Messages.get$Object$String$ObjectArr(this, 'levelup', []), []);
      Catalog.countUse($J.cls(SkeletonKey));
    }
  }
  passiveBuff(): Artifact$ArtifactBuff {
    return new SkeletonKey$keyRecharge().$o(this)._SkeletonKey$keyRecharge();
  }
  charge(target: Hero, amount: number): void {
    if (this.charge_ < this.chargeCap_ && !this.cursed && target.buff($J.cls(MagicImmune)) == null) {
      this.partialCharge = Math.fround(this.partialCharge + Math.fround(Math.fround(0.133) * amount));
      while (this.partialCharge >= Math.fround(1)) {
        this.partialCharge--;
        this.charge_++;
      }
      if (this.charge_ >= this.chargeCap_) {
        this.partialCharge = 0;
      }
      Item.updateQuickslot();
    }
  }
  desc(): string {
    let desc = super.desc();
    if (this.isEquipped(Dungeon.hero)) {
      if (this.cursed) {
        desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_cursed', []);
      } else {
        desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_worn', []);
      }
    }
    return desc;
  }
  upgrade$(): Item {
    this.chargeCap_ = (3 + $J.idiv(((this.level$() + 1) | 0), 2)) | 0;
    return super.upgrade$();
  }
  placeWall(pos: number, knockbackDIR: number): void {
    let wall = Dungeon.level.blobs.get($J.cls(SkeletonKey$KeyWall));
    if (!Dungeon.level.solid[pos] || (wall != null && wall.cur[pos] > 0)) {
      GameScene.add$Blob(Blob.seed$int$int$Class(pos, 10, $J.cls(SkeletonKey$KeyWall)));
      let ch = Actor.findChar(pos);
      if (ch != null && ch.alignment === Char$Alignment.ENEMY) {
        WandOfBlastWave.throwChar(ch, new Ballistica()._Ballistica(pos, (pos + knockbackDIR) | 0, Ballistica.PROJECTILE), 1, false, false, this);
        Artifact.artifactProc(ch, this.visiblyUpgraded(), 2);
      }
    }
  }
}

export class SkeletonKey$keyRecharge extends Artifact$ArtifactBuff {
  _SkeletonKey$keyRecharge(): this {
    this._Artifact$ArtifactBuff();
    return this;
  }
  act(): boolean {
    if (this.$outer.charge_ < this.$outer.chargeCap_ && !this.$outer.cursed && this.target.buff($J.cls(MagicImmune)) == null && Regeneration.regenOn()) {
      let chargeGain = Math.fround(1 / (Math.fround(120 - Math.fround(((this.$outer.chargeCap_ - this.$outer.charge_) | 0) * 7.5))));
      chargeGain = Math.fround(chargeGain * RingOfEnergy.artifactChargeMultiplier(this.target));
      this.$outer.partialCharge = Math.fround(this.$outer.partialCharge + chargeGain);
      while (this.$outer.partialCharge >= Math.fround(1)) {
        this.$outer.partialCharge--;
        this.$outer.charge_++;
        if (this.$outer.charge_ === this.$outer.chargeCap_) {
          this.$outer.partialCharge = 0;
        }
      }
    }
    Item.updateQuickslot();
    this.spend(Actor.TICK);
    return true;
  }
}

export class SkeletonKey$KeyWall extends Blob {
  _SkeletonKey$KeyWall(): this {
    this._Blob();
    this.alwaysVisible = true;
    return this;
  }
  evolve(): void {
    let cell: number;
    let cellEnded = false;
    let l = Dungeon.level;
    for (let i = this.area.left_; i < this.area.right_; i++) {
      for (let j = this.area.top_; j < this.area.bottom_; j++) {
        cell = (i + Math.imul(j, l.width())) | 0;
        this.off[cell] = this.cur[cell] > 0 ? (this.cur[cell] - 1) | 0 : 0;
        if (this.cur[cell] > 0 && this.off[cell] === 0) {
          cellEnded = true;
        }
        this.off[cell] = Math.min(this.off[cell], 9);
        this.volume_ = (this.volume_ + this.off[cell]) | 0;
        if (this.off[cell] === 0 && this.cur[cell] > 0) {
          this.cellsToFlagUpdate.add(cell);
        }
      }
    }
    if (cellEnded) {
      Dungeon.observe$();
    }
  }
  seed(level: Level, cell: number, amount: number): void {
    super.seed(level, cell, amount);
    level.updateCellFlags(cell);
  }
  clear(cell: number): void {
    super.clear(cell);
    if (this.cur == null) {
      return;
    }
    Dungeon.level.updateCellFlags(cell);
  }
  fullyClear(): void {
    super.fullyClear();
    Dungeon.level.buildFlagMaps();
  }
  onBuildFlagMaps(l: Level): void {
    if (this.volume_ > 0) {
      for (let i = 0; i < l.length(); i++) {
        this.onUpdateCellFlags(l, i);
      }
    }
  }
  onUpdateCellFlags(l: Level, cell: number): void {
    if (this.volume_ > 0 && this.cur[cell] > 0) {
      l.losBlocking[cell] = true;
      l.solid[cell] = true;
      l.passable[cell] = false;
      l.avoid[cell] = false;
    }
  }
  use(emitter: BlobEmitter): void {
    super.use(emitter);
    emitter.pour(SpectralWallParticle.FACTORY, Math.fround(0.05));
  }
  tileDesc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', []);
  }
}

export class SkeletonKey$KeyReplacementTracker extends Buff {
  ironKeysNeeded: number[] = null;
  goldenKeysNeeded: number[] = null;
  crystalKeysNeeded: number[] = null;
  static IRON_NEEDED: string = null;
  static GOLDEN_NEEDED: string = null;
  static CRYSTAL_NEEDED: string = null;
  _SkeletonKey$KeyReplacementTracker(): this {
    this._Buff();
    this.revivePersists = true;
    this.ironKeysNeeded = $J.newArray(26, 0);
    Arrays.fill(this.ironKeysNeeded, -1);
    this.goldenKeysNeeded = $J.newArray(26, 0);
    Arrays.fill(this.goldenKeysNeeded, -1);
    this.crystalKeysNeeded = $J.newArray(26, 0);
    Arrays.fill(this.crystalKeysNeeded, -1);
    return this;
  }
  setupKeysForDepth(): void {
    this.ironKeysNeeded[Dungeon.depth] = 0;
    this.goldenKeysNeeded[Dungeon.depth] = 0;
    this.crystalKeysNeeded[Dungeon.depth] = 0;
    for (const $it0 = Dungeon.level.heaps.valueList().iterator(); $it0.hasNext(); ) {
      let h = $it0.next();
      if (h.type_ === Heap$Type.LOCKED_CHEST) {
        this.goldenKeysNeeded[Dungeon.depth]++;
      } else if (h.type_ === Heap$Type.CRYSTAL_CHEST) {
        this.crystalKeysNeeded[Dungeon.depth]++;
      }
    }
    for (let i = 0; i < Dungeon.level.length(); i++) {
      if (Dungeon.level.map_[i] === Terrain.LOCKED_DOOR) {
        this.ironKeysNeeded[Dungeon.depth]++;
      } else if (Dungeon.level.map_[i] === Terrain.CRYSTAL_DOOR) {
        this.crystalKeysNeeded[Dungeon.depth]++;
      }
    }
  }
  clearDepth(): void {
    this.ironKeysNeeded[Dungeon.depth] = -1;
    this.goldenKeysNeeded[Dungeon.depth] = -1;
    this.crystalKeysNeeded[Dungeon.depth] = -1;
  }
  processIronLockOpened(): void {
    if (this.ironKeysNeeded[Dungeon.depth] === -1) {
      this.setupKeysForDepth();
    }
    this.ironKeysNeeded[Dungeon.depth] -= 1;
    this.processExcessKeys();
  }
  processGoldLockOpened(): void {
    if (this.goldenKeysNeeded[Dungeon.depth] === -1) {
      this.setupKeysForDepth();
    }
    this.goldenKeysNeeded[Dungeon.depth] -= 1;
    this.processExcessKeys();
  }
  processCrystalLockOpened(): void {
    if (this.crystalKeysNeeded[Dungeon.depth] === -1) {
      this.setupKeysForDepth();
    }
    this.crystalKeysNeeded[Dungeon.depth] -= 1;
    this.processExcessKeys();
  }
  processExcessKeys(): void {
    let keysNeeded = this.ironKeysNeeded[Dungeon.depth];
    let removed = false;
    if (keysNeeded >= 0) {
      while (Notes.keyCount(new IronKey()._IronKey$int(Dungeon.depth)) > keysNeeded) {
        Notes.remove$Key(new IronKey()._IronKey$int(Dungeon.depth));
        removed = true;
      }
    }
    keysNeeded = this.goldenKeysNeeded[Dungeon.depth];
    if (keysNeeded >= 0) {
      while (Notes.keyCount(new GoldenKey()._GoldenKey$int(Dungeon.depth)) > keysNeeded) {
        Notes.remove$Key(new GoldenKey()._GoldenKey$int(Dungeon.depth));
        removed = true;
      }
    }
    keysNeeded = this.crystalKeysNeeded[Dungeon.depth];
    if (keysNeeded >= 0) {
      while (Notes.keyCount(new CrystalKey()._CrystalKey$int(Dungeon.depth)) > keysNeeded) {
        Notes.remove$Key(new CrystalKey()._CrystalKey$int(Dungeon.depth));
        removed = true;
      }
    }
    if (removed) {
      GameScene.updateKeyDisplay();
      GLog.i(Messages.get$Class$String$ObjectArr($J.cls(SkeletonKey), 'discard', []), []);
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$intArr(SkeletonKey$KeyReplacementTracker.IRON_NEEDED, this.ironKeysNeeded);
    bundle.put$String$intArr(SkeletonKey$KeyReplacementTracker.GOLDEN_NEEDED, this.goldenKeysNeeded);
    bundle.put$String$intArr(SkeletonKey$KeyReplacementTracker.CRYSTAL_NEEDED, this.crystalKeysNeeded);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.ironKeysNeeded = bundle.getIntArray(SkeletonKey$KeyReplacementTracker.IRON_NEEDED);
    this.goldenKeysNeeded = bundle.getIntArray(SkeletonKey$KeyReplacementTracker.GOLDEN_NEEDED);
    this.crystalKeysNeeded = bundle.getIntArray(SkeletonKey$KeyReplacementTracker.CRYSTAL_NEEDED);
  }
  static $clinit() {
    SkeletonKey$KeyReplacementTracker.IRON_NEEDED = 'iron_needed';
    SkeletonKey$KeyReplacementTracker.GOLDEN_NEEDED = 'golden_needed';
    SkeletonKey$KeyReplacementTracker.CRYSTAL_NEEDED = 'crystal_needed';
  }
}

let $SkeletonKey$1$1: any = null;
/** An anonymous class (SkeletonKey.java:157). */
function SkeletonKey$1$1(): any {
  return $SkeletonKey$1$1 ??= $J.local(class extends JObject {
    call(): void {
      Buff.affect$Char$Class(Item.curUser, $J.cls(SkeletonKey$KeyReplacementTracker)).processIronLockOpened();
      Level.set$int$int(this.$cv_target, Terrain.DOOR);
      GameScene.updateMap$int(this.$cv_target);
      this.$outer.$outer.charge_ = (this.$outer.$outer.charge_ - 1) | 0;
      this.$outer.$outer.gainExp((2 + 1) | 0);
      Talent.onArtifactUsed(Dungeon.hero);
      Item.curUser.spendAndNext(Actor.TICK);
      Item.curUser.sprite_.idle();
    }
    $c($target): this {
      this.$cv_target = $target;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.SkeletonKey$1$1', ['com.watabou.utils.Callback']);
}

let $SkeletonKey$1$2: any = null;
/** An anonymous class (SkeletonKey.java:176). */
function SkeletonKey$1$2(): any {
  return $SkeletonKey$1$2 ??= $J.local(class extends JObject {
    call(): void {
      Level.set$int$int(this.$cv_target, Terrain.DOOR);
      GameScene.updateMap$int(this.$cv_target);
      Item.curUser.spendAndNext(Actor.TICK);
      Item.curUser.sprite_.idle();
    }
    $c($target): this {
      this.$cv_target = $target;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.SkeletonKey$1$2', ['com.watabou.utils.Callback']);
}

let $SkeletonKey$1$3: any = null;
/** An anonymous class (SkeletonKey.java:195). */
function SkeletonKey$1$3(): any {
  return $SkeletonKey$1$3 ??= $J.local(class extends JObject {
    call(): void {
      Buff.affect$Char$Class(Item.curUser, $J.cls(SkeletonKey$KeyReplacementTracker)).processCrystalLockOpened();
      Level.set$int$int(this.$cv_target, Terrain.EMPTY);
      GameScene.updateMap$int(this.$cv_target);
      this.$outer.$outer.charge_ = (this.$outer.$outer.charge_ - 5) | 0;
      this.$outer.$outer.gainExp((2 + 5) | 0);
      Talent.onArtifactUsed(Dungeon.hero);
      Sample.INSTANCE.play$Object(Assets$Sounds.TELEPORT);
      CellEmitter.get(this.$cv_target).start(Speck.factory$int(Speck.DISCOVER), Math.fround(0.025), 20);
      Item.curUser.spendAndNext(Actor.TICK);
      Item.curUser.sprite_.idle();
      Notes.remove$Landmark$int(Notes$Landmark.DISTANT_WELL, (Dungeon.depth - 1) | 0);
    }
    $c($target): this {
      this.$cv_target = $target;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.SkeletonKey$1$3', ['com.watabou.utils.Callback']);
}

let $SkeletonKey$1$4: any = null;
/** An anonymous class (SkeletonKey.java:258). */
function SkeletonKey$1$4(): any {
  return $SkeletonKey$1$4 ??= $J.local(class extends JObject {
    call(): void {
      Level.set$int$int(this.$cv_target, Terrain.HERO_LKD_DR);
      GameScene.updateMap$int(this.$cv_target);
      this.$outer.$outer.charge_ = (this.$outer.$outer.charge_ - 2) | 0;
      this.$outer.$outer.gainExp(2);
      Talent.onArtifactUsed(Dungeon.hero);
      Item.curUser.spendAndNext(Actor.TICK);
      Item.curUser.sprite_.idle();
      if (Dungeon.level.heaps.get(this.$cv_target) != null) {
        let candidates = new ArrayList();
        for (let n of PathFinder.NEIGHBOURS8) {
          if (Dungeon.level.passable[(this.$cv_target + n) | 0]) {
            candidates.add((this.$cv_target + n) | 0);
          }
        }
        if (!candidates.isEmpty()) {
          let heap = Dungeon.level.heaps.get(this.$cv_target);
          while (!heap.isEmpty()) {
            Dungeon.level.drop(heap.pickUp(), Random.element$Collection(candidates)).sprite_.drop$int(this.$cv_target);
          }
        }
      }
    }
    $c($target): this {
      this.$cv_target = $target;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.SkeletonKey$1$4', ['com.watabou.utils.Callback']);
}

let $SkeletonKey$1$5: any = null;
/** An anonymous class (SkeletonKey.java:295). */
function SkeletonKey$1$5(): any {
  return $SkeletonKey$1$5 ??= $J.local(class extends JObject {
    call(): void {
      Buff.affect$Char$Class(Item.curUser, $J.cls(SkeletonKey$KeyReplacementTracker)).processGoldLockOpened();
      Dungeon.level.heaps.get(this.$cv_target).open(Item.curUser);
      this.$outer.$outer.charge_ = (this.$outer.$outer.charge_ - 2) | 0;
      this.$outer.$outer.gainExp((2 + 2) | 0);
      Talent.onArtifactUsed(Dungeon.hero);
      Item.curUser.spendAndNext(Actor.TICK);
      Item.curUser.sprite_.idle();
    }
    $c($target): this {
      this.$cv_target = $target;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.SkeletonKey$1$5', ['com.watabou.utils.Callback']);
}

let $SkeletonKey$1$6: any = null;
/** An anonymous class (SkeletonKey.java:316). */
function SkeletonKey$1$6(): any {
  return $SkeletonKey$1$6 ??= $J.local(class extends JObject {
    call(): void {
      Buff.affect$Char$Class(Item.curUser, $J.cls(SkeletonKey$KeyReplacementTracker)).processCrystalLockOpened();
      Dungeon.level.heaps.get(this.$cv_target).open(Item.curUser);
      this.$outer.$outer.charge_ = (this.$outer.$outer.charge_ - 5) | 0;
      this.$outer.$outer.gainExp((2 + 5) | 0);
      Talent.onArtifactUsed(Dungeon.hero);
      Item.curUser.spendAndNext(Actor.TICK);
      Item.curUser.sprite_.idle();
    }
    $c($target): this {
      this.$cv_target = $target;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.SkeletonKey$1$6', ['com.watabou.utils.Callback']);
}

let $SkeletonKey$1$7: any = null;
/** An anonymous class (SkeletonKey.java:359). */
function SkeletonKey$1$7(): any {
  return $SkeletonKey$1$7 ??= $J.local(class extends JObject {
    call(): void {
      this.$outer.$outer.placeWall((Item.curUser.pos + PathFinder.CIRCLE8[this.$cv_finalClosestIdx]) | 0, this.$cv_knockBackDir);
      this.$outer.$outer.placeWall((Item.curUser.pos + PathFinder.CIRCLE8[((this.$cv_finalClosestIdx + 7) | 0) % 8]) | 0, this.$cv_knockBackDir);
      this.$outer.$outer.placeWall((Item.curUser.pos + PathFinder.CIRCLE8[((this.$cv_finalClosestIdx + 1) | 0) % 8]) | 0, this.$cv_knockBackDir);
      if (this.$cv_finalClosestIdx % 2 === 0) {
        this.$outer.$outer.placeWall((Item.curUser.pos + Math.imul(2, PathFinder.CIRCLE8[((this.$cv_finalClosestIdx + 7) | 0) % 8])) | 0, this.$cv_knockBackDir);
        this.$outer.$outer.placeWall((Item.curUser.pos + Math.imul(2, PathFinder.CIRCLE8[((this.$cv_finalClosestIdx + 1) | 0) % 8])) | 0, this.$cv_knockBackDir);
      }
      this.$outer.$outer.charge_ = (this.$outer.$outer.charge_ - 2) | 0;
      this.$outer.$outer.gainExp(2);
      Dungeon.observe$();
      GameScene.updateFog$();
      Sample.INSTANCE.play$Object(Assets$Sounds.TELEPORT);
      Talent.onArtifactUsed(Dungeon.hero);
      Item.curUser.spendAndNext(Actor.TICK);
      Item.curUser.sprite_.idle();
    }
    $c($finalClosestIdx, $knockBackDir): this {
      this.$cv_finalClosestIdx = $finalClosestIdx; this.$cv_knockBackDir = $knockBackDir;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.SkeletonKey$1$7', ['com.watabou.utils.Callback']);
}

let $SkeletonKey$1: any = null;
/** An anonymous class (SkeletonKey.java:130). */
function SkeletonKey$1(): any {
  return $SkeletonKey$1 ??= $J.local(class extends CellSelector$Listener {
    onSelect(target: number): void {
      if (target != null && (Dungeon.level.visited[target] || Dungeon.level.mapped[target])) {
        if (target === Item.curUser.pos) {
          GLog.w(Messages.get$Class$String$ObjectArr($J.cls(SkeletonKey), 'invalid_target', []), []);
          return;
        }
        if (Dungeon.level.adjacent(target, Item.curUser.pos)) {
          if (Dungeon.level.map_[target] === Terrain.LOCKED_EXIT) {
            GLog.w(Messages.get$Class$String$ObjectArr($J.cls(SkeletonKey), 'wont_open', []), []);
            return;
          }
          if (Dungeon.level.map_[target] === Terrain.LOCKED_DOOR) {
            if (Dungeon.level.locked || Dungeon.branch !== 0) {
              GLog.w(Messages.get$Class$String$ObjectArr($J.cls(SkeletonKey), 'wont_open', []), []);
              return;
            }
            if (this.$outer.charge_ < 1) {
              GLog.i(Messages.get$Class$String$ObjectArr($J.cls(SkeletonKey), 'iron_charges', []), []);
              return;
            }
            Sample.INSTANCE.play$Object(Assets$Sounds.UNLOCK);
            Item.curUser.sprite_.operate$int$Callback(target, new (SkeletonKey$1$1())().$o(this).$c(target));
            Item.curUser.busy();
            return;
          } else if (Dungeon.level.map_[target] === Terrain.HERO_LKD_DR) {
            Sample.INSTANCE.play$Object(Assets$Sounds.UNLOCK);
            Item.curUser.sprite_.operate$int$Callback(target, new (SkeletonKey$1$2())().$o(this).$c(target));
            Item.curUser.busy();
            return;
          } else if (Dungeon.level.map_[target] === Terrain.CRYSTAL_DOOR) {
            if (this.$outer.charge_ < 5) {
              GLog.i(Messages.get$Class$String$ObjectArr($J.cls(SkeletonKey), 'crystal_charges', []), []);
              return;
            }
            Sample.INSTANCE.play$Object(Assets$Sounds.UNLOCK);
            Item.curUser.sprite_.operate$int$Callback(target, new (SkeletonKey$1$3())().$o(this).$c(target));
            Item.curUser.busy();
            return;
          } else if (Dungeon.level.map_[target] === Terrain.DOOR || Dungeon.level.map_[target] === Terrain.OPEN_DOOR) {
            if (this.$outer.charge_ < 2) {
              GLog.i(Messages.get$Class$String$ObjectArr($J.cls(SkeletonKey), 'lock_charges', []), []);
              return;
            }
            if (Actor.findChar(target) != null) {
              let toMove = Actor.findChar(target);
              let pushCell = -1;
              let oppositeCell = (target + (target - Item.curUser.pos)) | 0;
              if (!Dungeon.level.solid[oppositeCell] && Actor.findChar(oppositeCell) == null && (Dungeon.level.openSpace[oppositeCell] || !Char.hasProp(toMove, Char$Property.LARGE))) {
                pushCell = oppositeCell;
              } else {
                for (let i of PathFinder.NEIGHBOURS8) {
                  if (!(Dungeon.level.solid[(target + i) | 0]) && (Actor.findChar((target + i) | 0)) == null && (Dungeon.level.openSpace[(target + i) | 0] || !Char.hasProp(toMove, Char$Property.LARGE)) && (pushCell === -1 || Dungeon.level.trueDistance(Item.curUser.pos, pushCell) < Dungeon.level.trueDistance(Item.curUser.pos, (target + i) | 0))) {
                    pushCell = (target + i) | 0;
                  }
                }
              }
              if (pushCell !== -1 && !Char.hasProp(toMove, Char$Property.IMMOVABLE)) {
                let push = new Ballistica()._Ballistica(target, pushCell, Ballistica.PROJECTILE);
                WandOfBlastWave.throwChar(toMove, push, 1, false, false, this);
                Artifact.artifactProc(toMove, this.$outer.visiblyUpgraded(), 2);
              } else {
                GLog.w(Messages.get$Class$String$ObjectArr($J.cls(SkeletonKey), 'lock_no_space', []), []);
                return;
              }
            }
            Sample.INSTANCE.play$Object(Assets$Sounds.UNLOCK);
            Item.curUser.sprite_.operate$int$Callback(target, new (SkeletonKey$1$4())().$o(this).$c(target));
            Item.curUser.busy();
            return;
          } else if (Dungeon.level.heaps.get(target) != null && Dungeon.level.heaps.get(target).type_ === Heap$Type.LOCKED_CHEST) {
            if (this.$outer.charge_ < 2) {
              GLog.i(Messages.get$Class$String$ObjectArr($J.cls(SkeletonKey), 'gold_charges', []), []);
              return;
            }
            Sample.INSTANCE.play$Object(Assets$Sounds.UNLOCK);
            Item.curUser.sprite_.operate$int$Callback(target, new (SkeletonKey$1$5())().$o(this).$c(target));
            Item.curUser.busy();
            return;
          } else if (Dungeon.level.heaps.get(target) != null && Dungeon.level.heaps.get(target).type_ === Heap$Type.CRYSTAL_CHEST) {
            if (this.$outer.charge_ < 5) {
              GLog.i(Messages.get$Class$String$ObjectArr($J.cls(SkeletonKey), 'crystal_charges', []), []);
              return;
            }
            Sample.INSTANCE.play$Object(Assets$Sounds.UNLOCK);
            Item.curUser.sprite_.operate$int$Callback(target, new (SkeletonKey$1$6())().$o(this).$c(target));
            Item.curUser.busy();
            return;
          }
        }
        if (this.$outer.charge_ < 2) {
          GLog.i(Messages.get$Class$String$ObjectArr($J.cls(SkeletonKey), 'wall_charges', []), []);
          return;
        }
        let closest = Item.curUser.pos;
        let closestIdx = -1;
        for (let i = 0; i < PathFinder.CIRCLE8.length; i++) {
          let ofs = PathFinder.CIRCLE8[i];
          if (Dungeon.level.trueDistance(target, (Item.curUser.pos + ofs) | 0) < Dungeon.level.trueDistance(target, closest)) {
            closest = (Item.curUser.pos + ofs) | 0;
            closestIdx = i;
          }
        }
        let knockBackDir = PathFinder.CIRCLE8[closestIdx];
        if (Dungeon.level.solid[closest]) {
          GLog.w(Messages.get$Class$String$ObjectArr($J.cls(SkeletonKey), 'invalid_target', []), []);
          return;
        }
        let finalClosestIdx = closestIdx;
        Sample.INSTANCE.play$Object(Assets$Sounds.UNLOCK);
        Item.curUser.sprite_.operate$int$Callback(target, new (SkeletonKey$1$7())().$o(this).$c(finalClosestIdx, knockBackDir));
        Item.curUser.busy();
      }
    }
    prompt(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(SkeletonKey), 'prompt', []);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.SkeletonKey$1', []);
}

$J.define(SkeletonKey, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.SkeletonKey', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact', ctors: { '': '_SkeletonKey' }, meths: { 'upgrade()': 'upgrade$', 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' } });
$J.define(SkeletonKey$keyRecharge, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.SkeletonKey$keyRecharge', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact$ArtifactBuff', ctors: { '': '_SkeletonKey$keyRecharge' }, inner: true });
$J.define(SkeletonKey$KeyWall, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.SkeletonKey$KeyWall', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob', ctors: { '': '_SkeletonKey$KeyWall' } });
$J.define(SkeletonKey$KeyReplacementTracker, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.SkeletonKey$KeyReplacementTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_SkeletonKey$KeyReplacementTracker' }, clinit: true, lazy: ['IRON_NEEDED', 'GOLDEN_NEEDED', 'CRYSTAL_NEEDED'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  MagicImmune = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MagicImmune');
  Regeneration = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Regeneration');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  SpectralWallParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.SpectralWallParticle');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  CrystalKey = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.keys.CrystalKey');
  GoldenKey = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.keys.GoldenKey');
  IronKey = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.keys.IronKey');
  RingOfEnergy = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfEnergy');
  WandOfBlastWave = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfBlastWave');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Notes = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes');
  Notes$Landmark = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes$Landmark');
  Level = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CellSelector$Listener = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.CellSelector$Listener');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
