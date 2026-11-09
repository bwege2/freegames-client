// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/noosa/Gizmo.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class Gizmo extends JObject {
  exists: boolean = false;
  alive: boolean = false;
  active: boolean = false;
  visible_: boolean = false;
  parent: Group = null;
  camera_: Camera = null;
  _Gizmo(): this {
    this.exists = true;
    this.alive = true;
    this.active = true;
    this.visible_ = true;
    return this;
  }
  destroy(): void {
    this.parent = null;
  }
  update(): void {
  }
  draw(): void {
  }
  kill(): void {
    this.alive = false;
    this.exists = false;
  }
  revive(): void {
    this.alive = true;
    this.exists = true;
  }
  camera(): Camera {
    if (this.camera_ != null) {
      return this.camera_;
    } else if (this.parent != null) {
      return this.camera_ = this.parent.camera();
    } else {
      return null;
    }
  }
  isVisible(): boolean {
    if (this.parent == null) {
      return this.visible_;
    } else {
      return this.visible_ && this.parent.isVisible();
    }
  }
  isActive(): boolean {
    if (this.parent == null) {
      return this.active;
    } else {
      return this.active && this.parent.isActive();
    }
  }
  killAndErase(): void {
    this.kill();
    if (this.parent != null) {
      this.parent.erase(this);
    }
  }
  remove$(): void {
    if (this.parent != null) {
      this.parent.remove$Gizmo(this);
    }
  }
}

$J.define(Gizmo, 'com.watabou.noosa.Gizmo', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Gizmo' }, meths: { 'remove()': 'remove$' } });
