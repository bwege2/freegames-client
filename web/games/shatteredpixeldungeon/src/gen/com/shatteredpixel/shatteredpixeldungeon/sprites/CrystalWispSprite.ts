// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/CrystalWispSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../jre/index.ts';
import { MobSprite } from './MobSprite.ts';

let Assets$Sounds, Assets$Sprites, Beam$LightRay, TorchHalo, GameScene, DungeonTilemap, Game, MovieClip$Animation, TextureFilm, Sample, AlphaTweener;

export class CrystalWispSprite extends MobSprite {
  light$CrystalWispSprite: TorchHalo = null;
  baseY: number = 0;
  _CrystalWispSprite(): this {
    this._MobSprite();
    this.baseY = NaN;
    let c = this.texOffset();
    this.texture(Assets$Sprites.CRYSTAL_WISP);
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 12, 14);
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(1, true);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [(c + 0) | 0]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(12, true);
    this.run_.frames$TextureFilm$ObjectArr(frames, [(c + 0) | 0, (c + 0) | 0, (c + 0) | 0, (c + 1) | 0]);
    this.attack = new MovieClip$Animation()._MovieClip$Animation(16, false);
    this.attack.frames$TextureFilm$ObjectArr(frames, [(c + 2) | 0, (c + 3) | 0, (c + 4) | 0, (c + 5) | 0]);
    this.zap_ = this.attack.clone();
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(15, false);
    this.die_.frames$TextureFilm$ObjectArr(frames, [(c + 6) | 0, (c + 7) | 0, (c + 8) | 0, (c + 9) | 0, (c + 10) | 0, (c + 11) | 0, (c + 12) | 0, (c + 11) | 0]);
    this.play$Animation(this.idle_);
    return this;
  }
  zap$int(cell: number): void {
    super.zap$int(cell);
    this.parent.add$Gizmo(new (CrystalWispSprite$1())().$o(this).$c(cell)._AlphaTweener(this.light$CrystalWispSprite, 1, Math.fround(0.2)));
  }
  attack$int(cell: number): void {
    super.attack$int(cell);
    this.parent.add$Gizmo(new (CrystalWispSprite$2())().$o(this)._AlphaTweener(this.light$CrystalWispSprite, 1, Math.fround(0.2)));
  }
  link(ch: Char): void {
    super.link(ch);
    this.light$CrystalWispSprite = new TorchHalo()._TorchHalo(this);
    this.light$CrystalWispSprite.hardlight$int(this.blood() & 16777215);
    this.light$CrystalWispSprite.alpha$float(Math.fround(0.3));
    this.light$CrystalWispSprite.radius(10);
    GameScene.effect(this.light$CrystalWispSprite);
  }
  die(): void {
    super.die();
    if (this.light$CrystalWispSprite != null) {
      this.light$CrystalWispSprite.putOut();
    }
  }
  kill(): void {
    super.kill();
    if (this.light$CrystalWispSprite != null) {
      this.light$CrystalWispSprite.killAndErase();
    }
  }
  onComplete$Animation(anim: MovieClip$Animation): void {
    if (anim === this.zap_) {
      this.idle();
    }
    super.onComplete$Animation(anim);
  }
  place(cell: number): void {
    super.place(cell);
    this.baseY = this.y;
  }
  point$PointF(p: PointF): PointF {
    super.point$PointF(p);
    this.baseY = this.y;
    return p;
  }
  update(): void {
    super.update();
    if (!this.paused_ && this.curAnim !== this.die_) {
      if ($J.Float_isNaN(this.baseY)) {
        this.baseY = this.y;
      }
      this.y = Math.fround(this.baseY + Math.fround(Math.abs(Math.fround(Math.sin(Game.timeTotal)))));
      this.shadowOffset = Math.fround(0.25 - Math.fround(Math.fround(0.8) * Math.fround(Math.abs(Math.fround(Math.sin(Game.timeTotal))))));
    }
    if (this.light$CrystalWispSprite != null) {
      this.light$CrystalWispSprite.visible_ = this.visible_;
      this.light$CrystalWispSprite.point$PointF(this.center$());
    }
  }
  turnTo(from: number, to: number): void {
  }
}

export class CrystalWispSprite$Blue extends CrystalWispSprite {
  _CrystalWispSprite$Blue(): this {
    this._CrystalWispSprite();
    return this;
  }
  texOffset(): number {
    return 0;
  }
  blood(): number {
    return -10046465;
  }
}

export class CrystalWispSprite$Green extends CrystalWispSprite {
  _CrystalWispSprite$Green(): this {
    this._CrystalWispSprite();
    return this;
  }
  texOffset(): number {
    return 13;
  }
  blood(): number {
    return -13703634;
  }
}

export class CrystalWispSprite$Red extends CrystalWispSprite {
  _CrystalWispSprite$Red(): this {
    this._CrystalWispSprite();
    return this;
  }
  texOffset(): number {
    return 26;
  }
  blood(): number {
    return -33024;
  }
}

let $CrystalWispSprite$1: any = null;
/** An anonymous class (CrystalWispSprite.java:71). */
function CrystalWispSprite$1(): any {
  return $CrystalWispSprite$1 ??= $J.local(class extends AlphaTweener {
    onComplete(): void {
      this.$outer.light$CrystalWispSprite.alpha$float(Math.fround(0.3));
      (this.$outer.ch).onZapComplete();
      let ray = new Beam$LightRay()._Beam$LightRay(this.$outer.center$(), DungeonTilemap.raisedTileCenterToWorld(this.$cv_cell));
      Sample.INSTANCE.play$Object(Assets$Sounds.RAY);
      ray.hardlight$int(this.$outer.blood() & 16777215);
      this.parent.add$Gizmo(ray);
    }
    $c($cell): this {
      this.$cv_cell = $cell;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.sprites.CrystalWispSprite$1', []);
}

let $CrystalWispSprite$2: any = null;
/** An anonymous class (CrystalWispSprite.java:88). */
function CrystalWispSprite$2(): any {
  return $CrystalWispSprite$2 ??= $J.local(class extends AlphaTweener {
    onComplete(): void {
      this.$outer.light$CrystalWispSprite.alpha$float(Math.fround(0.3));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.sprites.CrystalWispSprite$2', []);
}

$J.define(CrystalWispSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.CrystalWispSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_CrystalWispSprite' }, meths: { 'point(com.watabou.utils.PointF)': 'point$PointF', 'onComplete(com.watabou.noosa.MovieClip$Animation)': 'onComplete$Animation', 'attack(int)': 'attack$int', 'zap(int)': 'zap$int' } });
$J.define(CrystalWispSprite$Blue, 'com.shatteredpixel.shatteredpixeldungeon.sprites.CrystalWispSprite$Blue', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.CrystalWispSprite', ctors: { '': '_CrystalWispSprite$Blue' } });
$J.define(CrystalWispSprite$Green, 'com.shatteredpixel.shatteredpixeldungeon.sprites.CrystalWispSprite$Green', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.CrystalWispSprite', ctors: { '': '_CrystalWispSprite$Green' } });
$J.define(CrystalWispSprite$Red, 'com.shatteredpixel.shatteredpixeldungeon.sprites.CrystalWispSprite$Red', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.CrystalWispSprite', ctors: { '': '_CrystalWispSprite$Red' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  Beam$LightRay = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Beam$LightRay');
  TorchHalo = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.TorchHalo');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  Game = $J.load('com.watabou.noosa.Game');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  AlphaTweener = $J.load('com.watabou.noosa.tweeners.AlphaTweener');
});
