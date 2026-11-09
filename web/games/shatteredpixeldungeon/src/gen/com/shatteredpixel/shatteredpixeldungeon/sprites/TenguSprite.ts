// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/TenguSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../jre/index.ts';
import { MobSprite } from './MobSprite.ts';
import { Item } from '../items/Item.ts';

let Assets$Sprites, Dungeon, GameScene, ItemSpriteSheet, MissileSprite, MovieClip$Animation, TextureFilm;

export class TenguSprite extends MobSprite {
  _TenguSprite(): this {
    this._MobSprite();
    this.texture(Assets$Sprites.TENGU);
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 14, 16);
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(2, true);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [0, 0, 0, 1]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(15, false);
    this.run_.frames$TextureFilm$ObjectArr(frames, [2, 3, 4, 5, 0]);
    this.attack = new MovieClip$Animation()._MovieClip$Animation(15, false);
    this.attack.frames$TextureFilm$ObjectArr(frames, [6, 7, 7, 0]);
    this.zap_ = this.attack.clone();
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(8, false);
    this.die_.frames$TextureFilm$ObjectArr(frames, [8, 9, 10, 10, 10, 10, 10, 10]);
    this.play$Animation(this.run_);
    this.isMoving = true;
    return this;
  }
  play$Animation(anim: MovieClip$Animation): void {
    if (this.isMoving && anim !== this.run_) {
      {
        this.isMoving = false;
        $J.monitorNotify(this, true);
      }
    }
    super.play$Animation(anim);
  }
  move(from: number, to: number): void {
    this.place(to);
    this.play$Animation(this.run_);
    this.turnTo(from, to);
    this.isMoving = true;
    if (Dungeon.level.water[to]) {
      GameScene.ripple(to);
    }
  }
  update(): void {
    if (this.paused_ && !this.curAnim.looped) {
      this.updateAnimation();
    }
    super.update();
  }
  attack$int(cell: number): void {
    if (!Dungeon.level.adjacent(cell, this.ch.pos)) {
      (this.parent.recycle($J.cls(MissileSprite))).reset$Visual$int$Item$Callback(this, cell, new TenguSprite$TenguShuriken()._TenguSprite$TenguShuriken(), new (TenguSprite$1())().$o(this));
      this.zap$int(this.ch.pos);
    } else {
      super.attack$int(cell);
    }
  }
  onComplete$Animation(anim: MovieClip$Animation): void {
    if (anim === this.run_) {
      {
        this.isMoving = false;
        this.idle();
        $J.monitorNotify(this, true);
      }
    } else {
      super.onComplete$Animation(anim);
    }
  }
}

export class TenguSprite$TenguShuriken extends Item {
  _TenguSprite$TenguShuriken(): this {
    this._Item();
    this.image_ = ItemSpriteSheet.SHURIKEN;
    return this;
  }
}

let $TenguSprite$1: any = null;
/** An anonymous class (TenguSprite.java:98). */
function TenguSprite$1(): any {
  return $TenguSprite$1 ??= $J.local(class extends JObject {
    call(): void {
      this.$outer.ch.onAttackComplete();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.sprites.TenguSprite$1', ['com.watabou.utils.Callback']);
}

$J.define(TenguSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.TenguSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_TenguSprite' }, meths: { 'onComplete(com.watabou.noosa.MovieClip$Animation)': 'onComplete$Animation', 'attack(int)': 'attack$int', 'play(com.watabou.noosa.MovieClip$Animation)': 'play$Animation' } });
$J.define(TenguSprite$TenguShuriken, 'com.shatteredpixel.shatteredpixeldungeon.sprites.TenguSprite$TenguShuriken', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_TenguSprite$TenguShuriken' } });
$J.module(() => {
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  MissileSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.MissileSprite');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
});
