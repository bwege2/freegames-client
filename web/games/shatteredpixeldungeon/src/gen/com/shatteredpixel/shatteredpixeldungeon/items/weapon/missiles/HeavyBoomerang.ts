// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/HeavyBoomerang.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../../../jre/index.ts';
import { MissileWeapon } from './MissileWeapon.ts';
import { Buff } from '../../../actors/buffs/Buff.ts';

let Assets$Sounds, Dungeon, Actor, Hero, ItemSpriteSheet, MissileSprite, AlphaTweener;

export class HeavyBoomerang extends MissileWeapon {
  circlingBack: boolean = false;
  _HeavyBoomerang(): this {
    this._MissileWeapon();
    this.image_ = ItemSpriteSheet.BOOMERANG;
    this.hitSound_ = Assets$Sounds.HIT_CRUSH;
    this.hitSoundPitch = 1;
    this.tier_ = 4;
    this.sticky = false;
    this.baseUses = 5;
    this.circlingBack = false;
    return this;
  }
  max$int(lvl: number): number {
    return (Math.imul(4, this.tier_) + Math.imul(((this.tier_ - 1) | 0), lvl)) | 0;
  }
  adjacentAccFactor(owner: Char, target: Char): number {
    if (this.circlingBack) {
      return 1.5;
    }
    return super.adjacentAccFactor(owner, target);
  }
  pickupDelay(): number {
    return this.circlingBack ? 0 : super.pickupDelay();
  }
  rangedHit(enemy: Char, cell: number): void {
    this.decrementDurability();
    if (this.durability > Math.fround(0)) {
      Buff.append$Char$Class(Dungeon.hero, $J.cls(HeavyBoomerang$CircleBack)).setup(this, cell, Dungeon.hero.pos, Dungeon.depth, Dungeon.branch);
    }
  }
  rangedMiss(cell: number): void {
    this.parent = null;
    Buff.append$Char$Class(Dungeon.hero, $J.cls(HeavyBoomerang$CircleBack)).setup(this, cell, Dungeon.hero.pos, Dungeon.depth, Dungeon.branch);
  }
}

export class HeavyBoomerang$CircleBack extends Buff {
  boomerang: HeavyBoomerang = null;
  thrownPos: number = 0;
  returnPos_: number = 0;
  returnDepth: number = 0;
  returnBranch: number = 0;
  left_: number = 0;
  static readonly BOOMERANG: string = 'boomerang';
  static readonly THROWN_POS: string = 'thrown_pos';
  static readonly RETURN_POS: string = 'return_pos';
  static readonly RETURN_DEPTH: string = 'return_depth';
  static readonly RETURN_BRANCH: string = 'return_branch';
  _HeavyBoomerang$CircleBack(): this {
    this._Buff();
    this.revivePersists = true;
    return this;
  }
  setup(boomerang: HeavyBoomerang, thrownPos: number, returnPos: number, returnDepth: number, returnBranch: number): void {
    this.boomerang = boomerang;
    this.thrownPos = thrownPos;
    this.returnPos_ = returnPos;
    this.returnDepth = returnDepth;
    this.returnBranch = returnBranch;
    this.left_ = 5;
  }
  returnPos(): number {
    return this.returnPos_;
  }
  cancel(): MissileWeapon {
    this.detach();
    return this.boomerang;
  }
  activeDepth(): number {
    return this.returnDepth;
  }
  act(): boolean {
    if (this.returnDepth === Dungeon.depth && this.returnBranch === Dungeon.branch) {
      this.left_--;
      if (this.left_ <= 0) {
        let returnTarget = Actor.findChar(this.returnPos_);
        let target = this.target;
        let visual = (Dungeon.hero.sprite_.parent.recycle($J.cls(MissileSprite)));
        visual.reset$int$int$Item$Callback(this.thrownPos, this.returnPos_, this.boomerang, new (HeavyBoomerang$CircleBack$1())().$o(this).$c(returnTarget, target));
        visual.alpha$float(0);
        let duration = Math.fround(Dungeon.level.trueDistance(this.thrownPos, this.returnPos_) / 20);
        target.sprite_.parent.add$Gizmo(new AlphaTweener()._AlphaTweener(visual, 1, duration));
        return false;
      }
    }
    this.spend(Actor.TICK);
    return true;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$Bundlable(HeavyBoomerang$CircleBack.BOOMERANG, this.boomerang);
    bundle.put$String$int(HeavyBoomerang$CircleBack.THROWN_POS, this.thrownPos);
    bundle.put$String$int(HeavyBoomerang$CircleBack.RETURN_POS, this.returnPos_);
    bundle.put$String$int(HeavyBoomerang$CircleBack.RETURN_DEPTH, this.returnDepth);
    bundle.put$String$int(HeavyBoomerang$CircleBack.RETURN_BRANCH, this.returnBranch);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.boomerang = bundle.get$String(HeavyBoomerang$CircleBack.BOOMERANG);
    this.thrownPos = bundle.getInt(HeavyBoomerang$CircleBack.THROWN_POS);
    this.returnPos_ = bundle.getInt(HeavyBoomerang$CircleBack.RETURN_POS);
    this.returnDepth = bundle.getInt(HeavyBoomerang$CircleBack.RETURN_DEPTH);
    this.returnBranch = bundle.contains(HeavyBoomerang$CircleBack.RETURN_BRANCH) ? bundle.getInt(HeavyBoomerang$CircleBack.RETURN_BRANCH) : 0;
  }
}

let $HeavyBoomerang$CircleBack$1: any = null;
/** An anonymous class (HeavyBoomerang.java:131). */
function HeavyBoomerang$CircleBack$1(): any {
  return $HeavyBoomerang$CircleBack$1 ??= $J.local(class extends JObject {
    call(): void {
      this.$outer.detach();
      this.$outer.boomerang.circlingBack = true;
      if (this.$cv_returnTarget === this.$cv_target) {
        if (!this.$outer.boomerang.spawnedForEffect) {
          if (!(this.$cv_target instanceof Hero) || !this.$outer.boomerang.doPickUp$Hero(this.$cv_target)) {
            Dungeon.level.drop(this.$outer.boomerang, this.$outer.returnPos_).sprite_.drop$();
          }
        }
      } else if (this.$cv_returnTarget != null) {
        if ((this.$cv_target).shoot(this.$cv_returnTarget, this.$outer.boomerang)) {
          this.$outer.boomerang.decrementDurability();
        }
        if (!this.$outer.boomerang.spawnedForEffect && this.$outer.boomerang.durability > Math.fround(0)) {
          Dungeon.level.drop(this.$outer.boomerang, this.$outer.returnPos_).sprite_.drop$();
        }
      } else if (!this.$outer.boomerang.spawnedForEffect) {
        Dungeon.level.drop(this.$outer.boomerang, this.$outer.returnPos_).sprite_.drop$();
      }
      this.$outer.boomerang.circlingBack = false;
      this.$outer.next();
    }
    $c($returnTarget, $target): this {
      this.$cv_returnTarget = $returnTarget; this.$cv_target = $target;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.HeavyBoomerang$CircleBack$1', ['com.watabou.utils.Callback']);
}

$J.define(HeavyBoomerang, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.HeavyBoomerang', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon', ctors: { '': '_HeavyBoomerang' }, meths: { 'max(int)': 'max$int' } });
$J.define(HeavyBoomerang$CircleBack, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.HeavyBoomerang$CircleBack', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_HeavyBoomerang$CircleBack' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  MissileSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.MissileSprite');
  AlphaTweener = $J.load('com.watabou.noosa.tweeners.AlphaTweener');
});
