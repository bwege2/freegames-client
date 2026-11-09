// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/noosa/tweeners/Tweener.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Gizmo } from '../Gizmo.ts';

let Game;

export class Tweener extends Gizmo {
  target: Gizmo = null;
  interval: number = 0;
  elapsed: number = 0;
  listener: Tweener$Listener = null;
  _Tweener(target: Gizmo, interval: number): this {
    this._Gizmo();
    this.target = target;
    this.interval = interval;
    this.elapsed = 0;
    return this;
  }
  update(): void {
    if (this.elapsed < Math.fround(0)) {
      this.onComplete();
      this.kill();
      return;
    }
    this.elapsed = Math.fround(this.elapsed + Game.elapsed);
    if ((Math.fround(this.interval - this.elapsed)) < Math.fround(Game.elapsed / 2)) {
      this.elapsed = this.interval;
    }
    if (this.elapsed >= this.interval) {
      this.updateValues(1);
      this.onComplete();
      this.kill();
    } else {
      this.updateValues(Math.fround(this.elapsed / this.interval));
    }
  }
  stop(complete: boolean): void {
    this.elapsed = complete ? this.interval : -1;
  }
  onComplete(): void {
    if (this.listener != null) {
      this.listener.onComplete$Tweener(this);
    }
  }
}

export class Tweener$Listener {
}

$J.define(Tweener, 'com.watabou.noosa.tweeners.Tweener', { kind: 'class', sup: 'com.watabou.noosa.Gizmo', ctors: { 'com.watabou.noosa.Gizmo,float': '_Tweener' } });
$J.define(Tweener$Listener, 'com.watabou.noosa.tweeners.Tweener$Listener', { kind: 'interface', meths: { 'onComplete(com.watabou.noosa.tweeners.Tweener)': 'onComplete$Tweener' } });
$J.module(() => {
  Game = $J.load('com.watabou.noosa.Game');
});
