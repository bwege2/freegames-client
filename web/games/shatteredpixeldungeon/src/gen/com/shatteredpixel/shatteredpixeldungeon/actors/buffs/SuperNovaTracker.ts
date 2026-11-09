// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/SuperNovaTracker.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Buff } from './Buff.ts';
import { FlavourBuff } from './FlavourBuff.ts';
import { Halo } from '../../../../watabou/noosa/Halo.ts';

let Assets$Sounds, Dungeon, Actor, Char$Alignment, FloatingText, Bomb$ConjuredBomb, ShadowCaster, GameScene, PixelScene, CharSprite, DungeonTilemap, Game, Sample;

export class SuperNovaTracker extends Buff {
  pos: number = 0;
  depth_: number = 0;
  branch: number = 0;
  turnsLeft: number = 0;
  harmsAllies: boolean = false;
  fieldOfView: boolean[] = null;
  halo: SuperNovaTracker$NovaVFX = null;
  static readonly DIST: number = 8;
  static readonly POS: string = 'pos';
  static readonly DEPTH: string = 'depth';
  static readonly BRANCH: string = 'branch';
  static readonly LEFT: string = 'left';
  static readonly HARMS_ALLIES: string = 'harms_allies';
  _SuperNovaTracker(): this {
    this._Buff();
    this.depth_ = Dungeon.depth;
    this.branch = Dungeon.branch;
    this.turnsLeft = 10;
    this.harmsAllies = true;
    return this;
  }
  act(): boolean {
    if (this.branch !== Dungeon.branch || this.depth_ !== Dungeon.depth) {
      this.spend(Actor.TICK);
      return true;
    }
    let p = DungeonTilemap.raisedTileCenterToWorld(this.pos);
    if (this.fieldOfView == null) {
      this.fieldOfView = $J.newArray(Dungeon.level.length(), false);
    }
    if (this.halo == null) {
      this.halo = new SuperNovaTracker$NovaVFX().$o(this)._SuperNovaTracker$NovaVFX();
      this.halo.point$float$float(p.x, p.y);
      this.halo.hardlight$float$float$float(1, 1, 0);
      GameScene.effect(this.halo);
    }
    if (this.turnsLeft > 0) {
      FloatingText.show$float$float$int$String$int(p.x, p.y, this.pos, this.turnsLeft + '...', CharSprite.WARNING);
      this.halo.radius(Math.fround((5 + Math.imul(2, ((10 - this.turnsLeft) | 0))) | 0));
      this.halo.alpha$float(Math.fround(1.25 - Math.fround(Math.fround(0.075) * this.turnsLeft)));
      this.halo.point$float$float(p.x, p.y);
    }
    let c = Dungeon.level.cellToPoint(this.pos);
    ShadowCaster.castShadow(c.x, c.y, Dungeon.level.width(), this.fieldOfView, Dungeon.level.solid, Math.min(SuperNovaTracker.DIST, (11 - this.turnsLeft) | 0));
    if (this.turnsLeft <= 0) {
      this.detach();
      this.halo.killAndErase();
      if (!this.harmsAllies) {
        for (const $it0 = Actor.chars().iterator(); $it0.hasNext(); ) {
          let ch = $it0.next();
          if (ch.alignment === Char$Alignment.ALLY) {
            Buff.affect$Char$Class$float(ch, $J.cls(SuperNovaTracker$NovaBombImmune), 0);
          }
        }
      }
      Sample.INSTANCE.play$Object(Assets$Sounds.BLAST);
      Sample.INSTANCE.playDelayed$Object$float(Assets$Sounds.BLAST, 0.25);
      Sample.INSTANCE.playDelayed$Object$float(Assets$Sounds.BLAST, 0.5);
      PixelScene.shake(5, 2);
      for (let i = 0; i < Dungeon.level.length(); i++) {
        if (this.fieldOfView[i] && !Dungeon.level.solid[i]) {
          new Bomb$ConjuredBomb()._Bomb$ConjuredBomb().explode(i);
          Dungeon.level.destroy(i);
          if (Actor.findChar(i) === Dungeon.hero) {
            GameScene.flash$int(-2130706433);
          }
        }
      }
      GameScene.updateMap$();
    } else {
      for (let i = 0; i < Dungeon.level.length(); i++) {
        if (this.fieldOfView[i] && !Dungeon.level.solid[i]) {
          GameScene.targetedCell$int$float(i, Actor.TICK);
        }
      }
    }
    this.turnsLeft--;
    this.spend(Actor.TICK);
    return true;
  }
  fx(on: boolean): void {
    if (on && this.depth_ === Dungeon.depth && this.branch === Dungeon.branch && (this.halo == null || this.halo.parent == null)) {
      this.halo = new SuperNovaTracker$NovaVFX().$o(this)._SuperNovaTracker$NovaVFX();
      let p = DungeonTilemap.raisedTileCenterToWorld(this.pos);
      this.halo.hardlight$float$float$float(1, 1, 0);
      this.halo.radius(Math.fround((5 + Math.imul(2, ((10 - this.turnsLeft) | 0))) | 0));
      this.halo.alpha$float(Math.fround(1.25 - Math.fround(Math.fround(0.075) * this.turnsLeft)));
      this.halo.point$float$float(p.x, p.y);
      GameScene.effect(this.halo);
    }
    super.fx(on);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(SuperNovaTracker.POS, this.pos);
    bundle.put$String$int(SuperNovaTracker.DEPTH, this.depth_);
    bundle.put$String$int(SuperNovaTracker.BRANCH, this.branch);
    bundle.put$String$int(SuperNovaTracker.LEFT, this.turnsLeft);
    bundle.put$String$boolean(SuperNovaTracker.HARMS_ALLIES, this.harmsAllies);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.pos = bundle.getInt(SuperNovaTracker.POS);
    this.depth_ = bundle.getInt(SuperNovaTracker.DEPTH);
    this.branch = bundle.getInt(SuperNovaTracker.BRANCH);
    this.turnsLeft = bundle.getInt(SuperNovaTracker.LEFT);
    this.harmsAllies = bundle.getBoolean(SuperNovaTracker.HARMS_ALLIES);
  }
}

export class SuperNovaTracker$NovaBombImmune extends FlavourBuff {
  _SuperNovaTracker$NovaBombImmune(): this {
    this._FlavourBuff();
    this.immunities_.add($J.cls(Bomb$ConjuredBomb));
    return this;
  }
}

export class SuperNovaTracker$NovaVFX extends Halo {
  _SuperNovaTracker$NovaVFX(): this {
    this._Halo$();
    return this;
  }
  update(): void {
    this.am = Math.fround(this.brightness_ + Math.fround(Math.fround(0.1) * Math.fround(Math.cos(Math.fround(20 * Game.timeTotal)))));
    this.scale_.set$float(Math.fround((Math.fround(this.radius_ + Math.fround(Math.cos(Math.fround(20 * Game.timeTotal))))) / Halo.RADIUS));
    let p = DungeonTilemap.raisedTileCenterToWorld(this.$outer.pos);
    this.point$float$float(p.x, p.y);
    super.update();
  }
}

$J.define(SuperNovaTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.SuperNovaTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_SuperNovaTracker' } });
$J.define(SuperNovaTracker$NovaBombImmune, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.SuperNovaTracker$NovaBombImmune', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_SuperNovaTracker$NovaBombImmune' } });
$J.define(SuperNovaTracker$NovaVFX, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.SuperNovaTracker$NovaVFX', { kind: 'class', sup: 'com.watabou.noosa.Halo', ctors: { '': '_SuperNovaTracker$NovaVFX' }, inner: true });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  FloatingText = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.FloatingText');
  Bomb$ConjuredBomb = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bombs.Bomb$ConjuredBomb');
  ShadowCaster = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.ShadowCaster');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  Game = $J.load('com.watabou.noosa.Game');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
