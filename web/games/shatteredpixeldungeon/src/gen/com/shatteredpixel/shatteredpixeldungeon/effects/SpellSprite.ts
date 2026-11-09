// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/SpellSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, HashMap, JEnum } from '../../../../../jre/index.ts';
import { Image } from '../../../watabou/noosa/Image.ts';

let Assets$Effects, GameScene, Game, TextureFilm;

export class SpellSprite extends Image {
  static readonly FOOD: number = 0;
  static readonly MAP: number = 1;
  static readonly CHARGE: number = 2;
  static readonly BERSERK: number = 3;
  static readonly ANKH: number = 4;
  static readonly HASTE: number = 5;
  static readonly VISION: number = 6;
  static readonly PURITY: number = 7;
  static readonly SIZE: number = 16;
  static readonly FADE_IN_TIME: number = Math.fround(0.2);
  static readonly STATIC_TIME: number = Math.fround(0.8);
  static readonly FADE_OUT_TIME: number = Math.fround(0.4);
  static film: TextureFilm = null;
  target: Char = null;
  phase: SpellSprite$Phase = null;
  duration: number = 0;
  passed: number = 0;
  static all: HashMap<Char, SpellSprite> = null;
  _SpellSprite(): this {
    this._Image$Object(Assets$Effects.SPELL_ICONS);
    if (SpellSprite.film == null) {
      SpellSprite.film = new TextureFilm()._TextureFilm$SmartTexture$int(this.texture_, SpellSprite.SIZE);
    }
    return this;
  }
  reset(index: number): void {
    this.frame$RectF(SpellSprite.film.get$Object(index));
    this.origin.set$float$float(Math.fround(this.width_ / 2), Math.fround(this.height_ / 2));
    this.phase = SpellSprite$Phase.FADE_IN;
    this.duration = SpellSprite.FADE_IN_TIME;
    this.passed = 0;
  }
  update(): void {
    super.update();
    if (this.target != null && this.target.sprite_ != null) {
      this.x = Math.fround(this.target.sprite_.center$().x - $J.idiv(SpellSprite.SIZE, 2));
      this.y = Math.fround(this.target.sprite_.y - SpellSprite.SIZE);
    }
    if (this.phase == null || this.target == null) {
      return;
    }
    switch (this.phase) {
      case SpellSprite$Phase.FADE_IN:
        this.alpha$float(Math.fround(this.passed / this.duration));
        this.scale_.set$float(Math.fround(this.passed / this.duration));
        break;
      case SpellSprite$Phase.STATIC:
        break;
      case SpellSprite$Phase.FADE_OUT:
        this.alpha$float(Math.fround(1 - Math.fround(this.passed / this.duration)));
        break;
    }
    if ((this.passed = Math.fround(this.passed + Game.elapsed)) > this.duration) {
      switch (this.phase) {
        case SpellSprite$Phase.FADE_IN:
          this.phase = SpellSprite$Phase.STATIC;
          this.duration = SpellSprite.STATIC_TIME;
          break;
        case SpellSprite$Phase.STATIC:
          this.phase = SpellSprite$Phase.FADE_OUT;
          this.duration = SpellSprite.FADE_OUT_TIME;
          break;
        case SpellSprite$Phase.FADE_OUT:
          this.kill();
          break;
      }
      this.passed = 0;
    }
  }
  kill(): void {
    super.kill();
    SpellSprite.all.remove(this.target);
  }
  static show$Char$int(ch: Char, index: number): void {
    SpellSprite.show$Char$int$float$float$float(ch, index, 1, 1, 1);
  }
  static show$Char$int$float$float$float(ch: Char, index: number, r: number, g: number, b: number): void {
    if (!ch.sprite_.visible_) {
      return;
    }
    let old = SpellSprite.all.get(ch);
    if (old != null) {
      old.kill();
    }
    let sprite = GameScene.spellSprite();
    sprite.target = ch;
    sprite.reset(index);
    sprite.hardlight$float$float$float(r, g, b);
    sprite.revive();
    SpellSprite.all.put(ch, sprite);
  }
  static $clinit() {
    SpellSprite.all = new HashMap();
  }
}

export class SpellSprite$Phase extends JEnum {
  static FADE_IN: SpellSprite$Phase = null;
  static STATIC: SpellSprite$Phase = null;
  static FADE_OUT: SpellSprite$Phase = null;
  static $VALUES: SpellSprite$Phase[] = null;
  _SpellSprite$Phase($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): SpellSprite$Phase[] { return SpellSprite$Phase.$VALUES.slice(); }
  static valueOf(name: string): SpellSprite$Phase { return $J.enumValueOf(SpellSprite$Phase, name); }
  static $clinit() {
    SpellSprite$Phase.FADE_IN = new SpellSprite$Phase()._SpellSprite$Phase('FADE_IN', 0);
    SpellSprite$Phase.STATIC = new SpellSprite$Phase()._SpellSprite$Phase('STATIC', 1);
    SpellSprite$Phase.FADE_OUT = new SpellSprite$Phase()._SpellSprite$Phase('FADE_OUT', 2);
    SpellSprite$Phase.$VALUES = [SpellSprite$Phase.FADE_IN, SpellSprite$Phase.STATIC, SpellSprite$Phase.FADE_OUT];
  }
}

$J.define(SpellSprite, 'com.shatteredpixel.shatteredpixeldungeon.effects.SpellSprite', { kind: 'class', sup: 'com.watabou.noosa.Image', ctors: { '': '_SpellSprite' }, meths: { 'show(com.shatteredpixel.shatteredpixeldungeon.actors.Char,int,float,float,float)': 'show$Char$int$float$float$float', 'show(com.shatteredpixel.shatteredpixeldungeon.actors.Char,int)': 'show$Char$int' }, clinit: true, lazy: ['film', 'all'] });
$J.define(SpellSprite$Phase, 'com.shatteredpixel.shatteredpixeldungeon.effects.SpellSprite$Phase', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_SpellSprite$Phase' }, clinit: true, lazy: ['$VALUES', 'FADE_IN', 'STATIC', 'FADE_OUT'] });
$J.module(() => {
  Assets$Effects = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Effects');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  Game = $J.load('com.watabou.noosa.Game');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
});
