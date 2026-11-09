// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/CharHealthIndicator.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { HealthBar } from './HealthBar.ts';

let GameScene;

export class CharHealthIndicator extends HealthBar {
  static readonly HEIGHT: number = 1;
  target: Char = null;
  _CharHealthIndicator(c: Char): this {
    this._HealthBar();
    this.target = c;
    GameScene.add$CharHealthIndicator(this);
    return this;
  }
  createChildren(): void {
    super.createChildren();
    this.height_ = Math.fround(CharHealthIndicator.HEIGHT);
  }
  update(): void {
    super.update();
    if (this.target != null && this.target.isAlive() && this.target.isActive() && this.target.sprite_.visible_) {
      let sprite = this.target.sprite_;
      this.width_ = Math.fround(sprite.width() * (Math.fround(4 / 6)));
      this.x = Math.fround(sprite.x + Math.fround(sprite.width() / 6));
      this.y = Math.fround(sprite.y - 2);
      this.level$Char(this.target);
      this.visible_ = this.target.HP < this.target.HT || this.target.shielding() > 0 || this.target.incomingDOT() > 0;
    } else {
      this.visible_ = false;
    }
  }
  target$Char(ch: Char): void {
    if (ch != null && ch.isAlive() && ch.isActive()) {
      this.target = ch;
    } else {
      this.target = null;
    }
  }
  target$(): Char {
    return this.target;
  }
}

$J.define(CharHealthIndicator, 'com.shatteredpixel.shatteredpixeldungeon.ui.CharHealthIndicator', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.HealthBar', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.actors.Char': '_CharHealthIndicator' }, meths: { 'target()': 'target$', 'target(com.shatteredpixel.shatteredpixeldungeon.actors.Char)': 'target$Char' } });
$J.module(() => {
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
});
