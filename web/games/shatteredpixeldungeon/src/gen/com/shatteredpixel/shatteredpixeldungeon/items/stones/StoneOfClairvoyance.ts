// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/stones/StoneOfClairvoyance.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Runestone } from './Runestone.ts';

let Assets$Sounds, Dungeon, ScrollOfMagicMapping, ShadowCaster, GameScene, ItemSpriteSheet, Sample;

export class StoneOfClairvoyance extends Runestone {
  static readonly DIST: number = 20;
  _StoneOfClairvoyance(): this {
    this._Runestone();
    this.image_ = ItemSpriteSheet.STONE_CLAIRVOYANCE;
    return this;
  }
  activate(cell: number): void {
    let c = Dungeon.level.cellToPoint(cell);
    let rounding = ShadowCaster.rounding[StoneOfClairvoyance.DIST];
    let left: number;
    let right: number;
    let curr: number;
    let noticed = false;
    for (let y = Math.max(0, (c.y - StoneOfClairvoyance.DIST) | 0); y <= (Math.min((Dungeon.level.height() - 1) | 0, (c.y + StoneOfClairvoyance.DIST) | 0)); y++) {
      if ((rounding[Math.abs((c.y - y) | 0)]) < (Math.abs((c.y - y) | 0))) {
        left = (c.x - (rounding[Math.abs((c.y - y) | 0)])) | 0;
      } else {
        left = StoneOfClairvoyance.DIST;
        while (rounding[left] < (rounding[Math.abs((c.y - y) | 0)])) {
          left--;
        }
        left = (c.x - left) | 0;
      }
      right = Math.min((Dungeon.level.width() - 1) | 0, (c.x + c.x - left) | 0);
      left = Math.max(0, left);
      for (curr = (left + Math.imul(y, Dungeon.level.width())) | 0; curr <= ((right + Math.imul(y, Dungeon.level.width())) | 0); curr++) {
        GameScene.checkedCell(curr, cell);
        Dungeon.level.mapped[curr] = true;
        if (Dungeon.level.secret[curr]) {
          Dungeon.level.discover(curr);
          if (Dungeon.level.heroFOV[curr]) {
            GameScene.discoverTile(curr, Dungeon.level.map_[curr]);
            ScrollOfMagicMapping.discover(curr);
            noticed = true;
          }
        }
      }
    }
    if (noticed) {
      Sample.INSTANCE.play$Object(Assets$Sounds.SECRET);
    }
    Sample.INSTANCE.play$Object(Assets$Sounds.TELEPORT);
    GameScene.updateFog$();
  }
}

$J.define(StoneOfClairvoyance, 'com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfClairvoyance', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.stones.Runestone', ctors: { '': '_StoneOfClairvoyance' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  ScrollOfMagicMapping = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfMagicMapping');
  ShadowCaster = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.ShadowCaster');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
