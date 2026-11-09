// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/CurrencyIndicator.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Component } from '../../../watabou/noosa/ui/Component.ts';

let Dungeon, PixelScene, BitmapText, Game;

export class CurrencyIndicator extends Component {
  static readonly TIME: number = 2;
  lastGold: number = 0;
  lastEnergy: number = 0;
  gold: BitmapText = null;
  energy: BitmapText = null;
  goldTime: number = 0;
  energyTime: number = 0;
  static showGold: boolean = false;
  _CurrencyIndicator(): this {
    this._Component();
    this.lastGold = 0;
    this.lastEnergy = 0;
    return this;
  }
  createChildren(): void {
    this.gold = new BitmapText()._BitmapText$Font(PixelScene.pixelFont);
    this.gold.text$String(String(this.lastGold));
    this.gold.measure();
    this.gold.hardlight$int(16776960);
    this.add$Gizmo(this.gold);
    this.energy = new BitmapText()._BitmapText$Font(PixelScene.pixelFont);
    this.energy.text$String(String(this.lastEnergy));
    this.energy.measure();
    this.energy.hardlight$int(4508927);
    this.add$Gizmo(this.energy);
    this.gold.visible_ = this.energy.visible_ = false;
  }
  layout(): void {
    this.gold.x = Math.fround(this.x + 1);
    this.gold.y = Math.fround(this.top() + 1);
    this.energy.x = Math.fround(this.x + 1);
    if (this.gold.visible_) {
      this.energy.y = Math.fround(Math.fround(this.top() + this.energy.height()) - 1);
    } else {
      this.energy.y = Math.fround(this.top() + 1);
    }
  }
  update(): void {
    super.update();
    if (this.gold.visible_) {
      this.goldTime = Math.fround(this.goldTime - Game.elapsed);
      if (this.goldTime > Math.fround(0)) {
        this.gold.alpha$float(this.goldTime > Math.fround(CurrencyIndicator.TIME / 2) ? 1 : Math.fround(Math.fround(this.goldTime * 2) / CurrencyIndicator.TIME));
      } else {
        this.gold.visible_ = false;
      }
    }
    if (this.energy.visible_) {
      this.energyTime = Math.fround(this.energyTime - Game.elapsed);
      if (this.energyTime > Math.fround(0)) {
        this.energy.alpha$float(this.energyTime > Math.fround(CurrencyIndicator.TIME / 2) ? 1 : Math.fround(Math.fround(this.energyTime * 2) / CurrencyIndicator.TIME));
      } else {
        this.energy.visible_ = false;
      }
    }
    if (Dungeon.gold !== this.lastGold) {
      this.lastGold = Dungeon.gold;
      this.gold.text$String(String(this.lastGold));
      this.gold.measure();
      this.gold.visible_ = true;
      this.goldTime = CurrencyIndicator.TIME;
      this.layout();
    }
    if (Dungeon.energy !== this.lastEnergy) {
      this.lastEnergy = Dungeon.energy;
      this.energy.text$String(String(this.lastEnergy));
      this.energy.measure();
      this.energy.visible_ = true;
      this.energyTime = CurrencyIndicator.TIME;
      this.layout();
    }
    if (CurrencyIndicator.showGold) {
      if (!this.gold.visible_) {
        this.gold.visible_ = true;
        this.layout();
      }
      this.goldTime = Math.fround(CurrencyIndicator.TIME / 2);
    }
  }
  static $clinit() {
    CurrencyIndicator.showGold = false;
  }
}

$J.define(CurrencyIndicator, 'com.shatteredpixel.shatteredpixeldungeon.ui.CurrencyIndicator', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { '': '_CurrencyIndicator' }, clinit: true, lazy: ['showGold'] });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  BitmapText = $J.load('com.watabou.noosa.BitmapText');
  Game = $J.load('com.watabou.noosa.Game');
});
