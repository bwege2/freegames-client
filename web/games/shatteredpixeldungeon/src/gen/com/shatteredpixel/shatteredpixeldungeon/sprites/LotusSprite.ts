// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/LotusSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../jre/index.ts';
import { MobSprite } from './MobSprite.ts';

let Assets$Sprites, Dungeon, CellEmitter, LeafParticle, WandOfRegrowth$Lotus, MovieClip$Animation, TextureFilm;

export class LotusSprite extends MobSprite {
  grassVfx: ArrayList<Emitter> = null;
  _LotusSprite(): this {
    this._MobSprite();
    this.perspectiveRaise = 0;
    this.texture(Assets$Sprites.LOTUS);
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 19, 16);
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(1, true);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [0]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(1, true);
    this.run_.frames$TextureFilm$ObjectArr(frames, [0]);
    this.attack = new MovieClip$Animation()._MovieClip$Animation(1, false);
    this.attack.frames$TextureFilm$ObjectArr(frames, [0]);
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(1, false);
    this.die_.frames$TextureFilm$ObjectArr(frames, [0]);
    this.play$Animation(this.idle_);
    return this;
  }
  link(ch: Char): void {
    super.link(ch);
    this.renderShadow = false;
    if (this.grassVfx == null && ch instanceof WandOfRegrowth$Lotus) {
      let l = ch;
      this.grassVfx = new ArrayList();
      for (let i = 0; i < Dungeon.level.length(); i++) {
        if (!Dungeon.level.solid[i] && l.inRange(i)) {
          let e = CellEmitter.get(i);
          e.pour(LeafParticle.LEVEL_SPECIFIC, 0.5);
          this.grassVfx.add(e);
        }
      }
    }
  }
  place(cell: number): void {
    if (this.parent != null) {
      this.parent.sendToBack(this);
    }
    super.place(cell);
  }
  turnTo(from: number, to: number): void {
  }
  update(): void {
    this.visible_ = true;
    super.update();
  }
  die(): void {
    super.die();
    if (this.grassVfx != null) {
      for (const $it0 = this.grassVfx.iterator(); $it0.hasNext(); ) {
        let e = $it0.next();
        e.on = false;
      }
      this.grassVfx = null;
    }
  }
  kill(): void {
    super.kill();
    if (this.grassVfx != null) {
      for (const $it1 = this.grassVfx.iterator(); $it1.hasNext(); ) {
        let e = $it1.next();
        e.on = false;
      }
      this.grassVfx = null;
    }
  }
}

$J.define(LotusSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.LotusSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_LotusSprite' } });
$J.module(() => {
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  LeafParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.LeafParticle');
  WandOfRegrowth$Lotus = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfRegrowth$Lotus');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
});
