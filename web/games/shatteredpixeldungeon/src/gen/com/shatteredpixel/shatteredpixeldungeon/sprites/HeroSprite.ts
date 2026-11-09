// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/HeroSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { CharSprite } from './CharSprite.ts';

let Assets$Sprites, Dungeon, HeroDisguise, GameScene, TextureCache, Camera, Game, Image, MovieClip$Animation, TextureFilm;

export class HeroSprite extends CharSprite {
  static readonly FRAME_WIDTH: number = 12;
  static readonly FRAME_HEIGHT: number = 15;
  static readonly RUN_FRAMERATE: number = 20;
  static tiers_: TextureFilm = null;
  fly: MovieClip$Animation = null;
  read_: MovieClip$Animation = null;
  _HeroSprite(): this {
    this._CharSprite();
    this.texture(Dungeon.hero.heroClass.spritesheet());
    this.updateArmor();
    this.link(Dungeon.hero);
    if (this.ch.isAlive()) {
      this.idle();
    } else {
      this.die();
    }
    return this;
  }
  disguise(cls: HeroClass): void {
    this.texture(cls.spritesheet());
    this.updateArmor();
  }
  updateArmor(): void {
    let film = new TextureFilm()._TextureFilm$TextureFilm$Object$int$int(HeroSprite.tiers(), Dungeon.hero.tier(), HeroSprite.FRAME_WIDTH, HeroSprite.FRAME_HEIGHT);
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(1, true);
    this.idle_.frames$TextureFilm$ObjectArr(film, [0, 0, 0, 1, 0, 0, 1, 1]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(HeroSprite.RUN_FRAMERATE, true);
    this.run_.frames$TextureFilm$ObjectArr(film, [2, 3, 4, 5, 6, 7]);
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(20, false);
    this.die_.frames$TextureFilm$ObjectArr(film, [8, 9, 10, 11, 12, 11]);
    this.attack = new MovieClip$Animation()._MovieClip$Animation(15, false);
    this.attack.frames$TextureFilm$ObjectArr(film, [13, 14, 15, 0]);
    this.zap_ = this.attack.clone();
    this.operate = new MovieClip$Animation()._MovieClip$Animation(8, false);
    this.operate.frames$TextureFilm$ObjectArr(film, [16, 17, 16, 17]);
    this.fly = new MovieClip$Animation()._MovieClip$Animation(1, true);
    this.fly.frames$TextureFilm$ObjectArr(film, [18]);
    this.read_ = new MovieClip$Animation()._MovieClip$Animation(20, false);
    this.read_.frames$TextureFilm$ObjectArr(film, [19, 20, 20, 20, 20, 20, 20, 20, 20, 19]);
    if (Dungeon.hero.isAlive()) {
      this.idle();
    } else {
      this.die();
    }
  }
  place(p: number): void {
    super.place(p);
    if (Game.scene() instanceof GameScene) {
      Camera.main.panFollow(this, 5);
    }
  }
  move(from: number, to: number): void {
    super.move(from, to);
    if (this.ch != null && this.ch.flying) {
      this.play$Animation(this.fly);
    }
    Camera.main.panFollow(this, 20);
  }
  idle(): void {
    super.idle();
    if (this.ch != null && this.ch.flying) {
      this.play$Animation(this.fly);
    }
  }
  jump$int$int$float$float$Callback(from: number, to: number, height: number, duration: number, callback: Callback): void {
    super.jump$int$int$float$float$Callback(from, to, height, duration, callback);
    this.play$Animation(this.fly);
    Camera.main.panFollow(this, 20);
  }
  read(): void {
    this.animCallback = new (HeroSprite$1())().$o(this);
    this.play$Animation(this.read_);
  }
  bloodBurstA(from: PointF, damage: number): void {
  }
  update(): void {
    this.sleeping = this.ch.isAlive() && (this.ch).resting;
    super.update();
  }
  sprint(speed: number): void {
    this.run_.delay_ = Math.fround(Math.fround(1 / speed) / HeroSprite.RUN_FRAMERATE);
  }
  static tiers(): TextureFilm {
    if (HeroSprite.tiers_ == null) {
      let texture = TextureCache.get(Assets$Sprites.ROGUE);
      HeroSprite.tiers_ = new TextureFilm()._TextureFilm$Object$int$int(texture, texture.width_, HeroSprite.FRAME_HEIGHT);
    }
    return HeroSprite.tiers_;
  }
  static avatar$Hero(hero: Hero): Image {
    if (hero.buff($J.cls(HeroDisguise)) != null) {
      return HeroSprite.avatar$HeroClass$int(hero.buff($J.cls(HeroDisguise)).getDisguise(), hero.tier());
    } else {
      return HeroSprite.avatar$HeroClass$int(hero.heroClass, hero.tier());
    }
  }
  static avatar$HeroClass$int(cl: HeroClass, armorTier: number): Image {
    let patch = HeroSprite.tiers().get$Object(armorTier);
    let avatar = new Image()._Image$Object(cl.spritesheet());
    let frame = avatar.texture_.uvRect(1, 0, Math.fround(HeroSprite.FRAME_WIDTH), Math.fround(HeroSprite.FRAME_HEIGHT));
    frame.shift(patch.left_, patch.top_);
    avatar.frame$RectF(frame);
    return avatar;
  }
}

let $HeroSprite$1: any = null;
/** An anonymous class (HeroSprite.java:135). */
function HeroSprite$1(): any {
  return $HeroSprite$1 ??= $J.local(class extends JObject {
    call(): void {
      this.$outer.idle();
      this.$outer.ch.onOperateComplete();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.sprites.HeroSprite$1', ['com.watabou.utils.Callback']);
}

$J.define(HeroSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.HeroSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite', ctors: { '': '_HeroSprite' }, meths: { 'avatar(com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass,int)': 'avatar$HeroClass$int', 'avatar(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero)': 'avatar$Hero', 'jump(int,int,float,float,com.watabou.utils.Callback)': 'jump$int$int$float$float$Callback' } });
$J.module(() => {
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  HeroDisguise = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.HeroDisguise');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  TextureCache = $J.load('com.watabou.gltextures.TextureCache');
  Camera = $J.load('com.watabou.noosa.Camera');
  Game = $J.load('com.watabou.noosa.Game');
  Image = $J.load('com.watabou.noosa.Image');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
});
