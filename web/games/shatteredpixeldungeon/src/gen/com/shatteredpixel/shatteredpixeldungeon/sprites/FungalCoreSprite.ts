// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/FungalCoreSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sprites, Dungeon, GameScene, DungeonWallsTilemap, MovieClip$Animation, TextureFilm;

export class FungalCoreSprite extends MobSprite {
  wasVisible: boolean = false;
  _FungalCoreSprite(): this {
    this._MobSprite();
    this.wasVisible = false;
    this.texture(Assets$Sprites.FUNGAL_CORE);
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 27, 27);
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(0, true);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [0]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(0, true);
    this.run_.frames$TextureFilm$ObjectArr(frames, [0]);
    this.attack = new MovieClip$Animation()._MovieClip$Animation(24, false);
    this.attack.frames$TextureFilm$ObjectArr(frames, [0]);
    this.zap_ = this.attack.clone();
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(12, false);
    this.die_.frames$TextureFilm$ObjectArr(frames, [0]);
    this.play$Animation(this.idle_);
    return this;
  }
  update(): void {
    super.update();
    if (this.curAnim !== this.die_ && this.ch != null && this.visible_ !== this.wasVisible) {
      if (this.visible_) {
        DungeonWallsTilemap.skipCells.add((this.ch.pos - Math.imul(2, Dungeon.level.width())) | 0);
        DungeonWallsTilemap.skipCells.add((this.ch.pos - Dungeon.level.width()) | 0);
      } else {
        DungeonWallsTilemap.skipCells.remove((this.ch.pos - Math.imul(2, Dungeon.level.width())) | 0);
        DungeonWallsTilemap.skipCells.remove((this.ch.pos - Dungeon.level.width()) | 0);
      }
      GameScene.updateMap$int((this.ch.pos - Math.imul(2, Dungeon.level.width())) | 0);
      GameScene.updateMap$int((this.ch.pos - Dungeon.level.width()) | 0);
      this.wasVisible = this.visible_;
    }
  }
  die(): void {
    super.die();
    if (this.ch != null && this.visible_) {
      DungeonWallsTilemap.skipCells.remove((this.ch.pos - Math.imul(2, Dungeon.level.width())) | 0);
      DungeonWallsTilemap.skipCells.remove((this.ch.pos - Dungeon.level.width()) | 0);
      GameScene.updateMap$int((this.ch.pos - Math.imul(2, Dungeon.level.width())) | 0);
      GameScene.updateMap$int((this.ch.pos - Dungeon.level.width()) | 0);
    }
  }
  turnTo(from: number, to: number): void {
  }
  blood(): number {
    return -7812028;
  }
}

$J.define(FungalCoreSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.FungalCoreSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_FungalCoreSprite' } });
$J.module(() => {
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  DungeonWallsTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonWallsTilemap');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
});
