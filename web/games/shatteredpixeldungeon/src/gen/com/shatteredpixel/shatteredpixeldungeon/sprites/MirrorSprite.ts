// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/MirrorSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, HeroClass, HeroSprite, MovieClip$Animation, TextureFilm;

export class MirrorSprite extends MobSprite {
  static readonly FRAME_WIDTH: number = 12;
  static readonly FRAME_HEIGHT: number = 15;
  _MirrorSprite(): this {
    this._MobSprite();
    this.texture(Dungeon.hero != null ? Dungeon.hero.heroClass.spritesheet() : HeroClass.WARRIOR.spritesheet());
    this.updateArmor$int(0);
    this.idle();
    return this;
  }
  link(ch: Char): void {
    super.link(ch);
    this.updateArmor$();
  }
  bloodBurstA(from: PointF, damage: number): void {
  }
  updateArmor$(): void {
    this.updateArmor$int((this.ch).armTier);
  }
  updateArmor$int(tier: number): void {
    let film = new TextureFilm()._TextureFilm$TextureFilm$Object$int$int(HeroSprite.tiers(), tier, MirrorSprite.FRAME_WIDTH, MirrorSprite.FRAME_HEIGHT);
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(1, true);
    this.idle_.frames$TextureFilm$ObjectArr(film, [0, 0, 0, 1, 0, 0, 1, 1]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(20, true);
    this.run_.frames$TextureFilm$ObjectArr(film, [2, 3, 4, 5, 6, 7]);
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(20, false);
    this.die_.frames$TextureFilm$ObjectArr(film, [0]);
    this.attack = new MovieClip$Animation()._MovieClip$Animation(15, false);
    this.attack.frames$TextureFilm$ObjectArr(film, [13, 14, 15, 0]);
    this.idle();
  }
}

$J.define(MirrorSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.MirrorSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_MirrorSprite' }, meths: { 'updateArmor(int)': 'updateArmor$int', 'updateArmor()': 'updateArmor$' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  HeroClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass');
  HeroSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.HeroSprite');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
});
