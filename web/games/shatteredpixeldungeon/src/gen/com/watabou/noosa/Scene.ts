// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/noosa/Scene.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../jre/index.ts';
import { Group } from './Group.ts';

let GameAction, KeyBindings, KeyEvent, Camera, Game;

export class Scene extends Group {
  keyListener: Signal$Listener<KeyEvent> = null;
  _Scene(): this {
    this._Group();
    return this;
  }
  create(): void {
    KeyEvent.addKeyListener(this.keyListener = new (Scene$1())().$o(this));
  }
  destroy(): void {
    KeyEvent.removeKeyListener(this.keyListener);
    super.destroy();
  }
  onPause(): void {
  }
  onResume(): void {
  }
  update(): void {
    super.update();
  }
  camera(): Camera {
    return Camera.main;
  }
  onBackPressed(): void {
    Game.instance.finish();
  }
}

let $Scene$1: any = null;
/** An anonymous class (Scene.java:34). */
function Scene$1(): any {
  return $Scene$1 ??= $J.local(class extends JObject {
    onSignal(event: KeyEvent): boolean {
      if (Game.instance != null && event.pressed) {
        if (KeyBindings.getActionForKey(event) === GameAction.BACK) {
          this.$outer.onBackPressed();
        }
      }
      return false;
    }
  }, 'com.watabou.noosa.Scene$1', ['com.watabou.utils.Signal$Listener']);
}

$J.define(Scene, 'com.watabou.noosa.Scene', { kind: 'class', sup: 'com.watabou.noosa.Group', ctors: { '': '_Scene' } });
$J.module(() => {
  GameAction = $J.load('com.watabou.input.GameAction');
  KeyBindings = $J.load('com.watabou.input.KeyBindings');
  KeyEvent = $J.load('com.watabou.input.KeyEvent');
  Camera = $J.load('com.watabou.noosa.Camera');
  Game = $J.load('com.watabou.noosa.Game');
});
