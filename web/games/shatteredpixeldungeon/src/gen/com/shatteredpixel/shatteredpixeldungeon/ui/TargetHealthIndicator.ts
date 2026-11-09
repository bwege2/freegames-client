// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/TargetHealthIndicator.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class TargetHealthIndicator extends HealthBar {
  static instance: TargetHealthIndicator = null;
  target: Char = null;
  _TargetHealthIndicator(): this {
    this._HealthBar();
    TargetHealthIndicator.instance = this;
    return this;
  }
  update(): void {
    super.update();
    if (this.target != null && this.target.isAlive() && this.target.isActive() && this.target.sprite_ != null && this.target.sprite_.visible_) {
      let sprite = this.target.sprite_;
      this.width_ = sprite.width();
      this.x = sprite.x;
      this.y = Math.fround(sprite.y - 3);
      this.level$Char(this.target);
      this.visible_ = true;
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

$J.define(TargetHealthIndicator, 'com.shatteredpixel.shatteredpixeldungeon.ui.TargetHealthIndicator', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.HealthBar', ctors: { '': '_TargetHealthIndicator' }, meths: { 'target()': 'target$', 'target(com.shatteredpixel.shatteredpixeldungeon.actors.Char)': 'target$Char' } });
