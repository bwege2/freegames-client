// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/CrystalSpireSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sprites, Dungeon, Splash, GameScene, DungeonWallsTilemap, RaisedTerrainTilemap, MovieClip$Animation, TextureFilm;

export class CrystalSpireSprite extends MobSprite {
  wasVisible: boolean = false;
  _CrystalSpireSprite(): this {
    this._MobSprite();
    this.wasVisible = false;
    this.texture(Assets$Sprites.CRYSTAL_SPIRE);
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 29, 40);
    let c = this.texOffset();
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(1, true);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [(0 + c) | 0]);
    this.run_ = this.idle_.clone();
    this.attack = this.idle_.clone();
    this.zap_ = this.idle_.clone();
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(1, false);
    this.die_.frames$TextureFilm$ObjectArr(frames, [(4 + c) | 0]);
    this.play$Animation(this.idle_);
    return this;
  }
  updateIdle(): void {
    let hpPercent = 1;
    if (this.ch != null) {
      hpPercent = Math.fround(this.ch.HP / Math.fround(this.ch.HT));
    }
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 29, 40);
    if (hpPercent > Math.fround(0.9)) {
      this.idle_.frames$TextureFilm$ObjectArr(frames, [(0 + this.texOffset()) | 0]);
    } else if (hpPercent > Math.fround(0.67)) {
      this.idle_.frames$TextureFilm$ObjectArr(frames, [(1 + this.texOffset()) | 0]);
    } else if (hpPercent > Math.fround(0.33)) {
      this.idle_.frames$TextureFilm$ObjectArr(frames, [(2 + this.texOffset()) | 0]);
    } else {
      this.idle_.frames$TextureFilm$ObjectArr(frames, [(3 + this.texOffset()) | 0]);
    }
    this.play$Animation$boolean(this.idle_, true);
    this.run_ = this.idle_.clone();
    this.attack = this.idle_.clone();
    this.zap_ = this.idle_.clone();
  }
  link(ch: Char): void {
    super.link(ch);
    this.updateIdle();
  }
  update(): void {
    super.update();
    if (this.curAnim !== this.die_ && this.ch != null && this.visible_ !== this.wasVisible) {
      if (this.visible_) {
        DungeonWallsTilemap.skipCells.add((this.ch.pos - Math.imul(2, Dungeon.level.width())) | 0);
        DungeonWallsTilemap.skipCells.add((this.ch.pos - Dungeon.level.width()) | 0);
        RaisedTerrainTilemap.skipCells.add((this.ch.pos - Math.imul(2, Dungeon.level.width())) | 0);
        RaisedTerrainTilemap.skipCells.add((this.ch.pos - Dungeon.level.width()) | 0);
      } else {
        DungeonWallsTilemap.skipCells.remove((this.ch.pos - Math.imul(2, Dungeon.level.width())) | 0);
        DungeonWallsTilemap.skipCells.remove((this.ch.pos - Dungeon.level.width()) | 0);
        RaisedTerrainTilemap.skipCells.remove((this.ch.pos - Math.imul(2, Dungeon.level.width())) | 0);
        RaisedTerrainTilemap.skipCells.remove((this.ch.pos - Dungeon.level.width()) | 0);
      }
      GameScene.updateMap$int((this.ch.pos - Math.imul(2, Dungeon.level.width())) | 0);
      GameScene.updateMap$int((this.ch.pos - Dungeon.level.width()) | 0);
      this.wasVisible = this.visible_;
    }
  }
  die(): void {
    super.die();
    Splash.around(this, this.blood(), 100);
    if (this.ch != null && this.visible_) {
      DungeonWallsTilemap.skipCells.remove((this.ch.pos - Math.imul(2, Dungeon.level.width())) | 0);
      DungeonWallsTilemap.skipCells.remove((this.ch.pos - Dungeon.level.width()) | 0);
      GameScene.updateMap$int((this.ch.pos - Math.imul(2, Dungeon.level.width())) | 0);
      GameScene.updateMap$int((this.ch.pos - Dungeon.level.width()) | 0);
    }
  }
  turnTo(from: number, to: number): void {
  }
}

export class CrystalSpireSprite$Blue extends CrystalSpireSprite {
  _CrystalSpireSprite$Blue(): this {
    this._CrystalSpireSprite();
    return this;
  }
  texOffset(): number {
    return 0;
  }
  blood(): number {
    return -7412737;
  }
}

export class CrystalSpireSprite$Green extends CrystalSpireSprite {
  _CrystalSpireSprite$Green(): this {
    this._CrystalSpireSprite();
    return this;
  }
  texOffset(): number {
    return 8;
  }
  blood(): number {
    return -7995448;
  }
}

export class CrystalSpireSprite$Red extends CrystalSpireSprite {
  _CrystalSpireSprite$Red(): this {
    this._CrystalSpireSprite();
    return this;
  }
  texOffset(): number {
    return 16;
  }
  blood(): number {
    return -17613;
  }
}

$J.define(CrystalSpireSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.CrystalSpireSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_CrystalSpireSprite' } });
$J.define(CrystalSpireSprite$Blue, 'com.shatteredpixel.shatteredpixeldungeon.sprites.CrystalSpireSprite$Blue', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.CrystalSpireSprite', ctors: { '': '_CrystalSpireSprite$Blue' } });
$J.define(CrystalSpireSprite$Green, 'com.shatteredpixel.shatteredpixeldungeon.sprites.CrystalSpireSprite$Green', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.CrystalSpireSprite', ctors: { '': '_CrystalSpireSprite$Green' } });
$J.define(CrystalSpireSprite$Red, 'com.shatteredpixel.shatteredpixeldungeon.sprites.CrystalSpireSprite$Red', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.CrystalSpireSprite', ctors: { '': '_CrystalSpireSprite$Red' } });
$J.module(() => {
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Splash = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Splash');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  DungeonWallsTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonWallsTilemap');
  RaisedTerrainTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.RaisedTerrainTilemap');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
});
