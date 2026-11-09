// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/noosa/Group.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections } from '../../../../jre/index.ts';
import { Gizmo } from './Gizmo.ts';

let Random, Reflection;

export class Group extends Gizmo {
  members: ArrayList<Gizmo> = null;
  length_: number = 0;
  _Group(): this {
    this._Gizmo();
    this.members = new ArrayList();
    this.length_ = 0;
    return this;
  }
  destroy(): void {
    super.destroy();
    for (let i = 0; i < this.length_; i++) {
      let g = this.members.get(i);
      if (g != null) {
        g.destroy();
      }
    }
    if (this.members != null) {
      this.members.clear();
      this.members = null;
    }
    this.length_ = 0;
  }
  update(): void {
    for (let i = 0; i < this.length_; i++) {
      let g = this.members.get(i);
      if (g != null && g.exists && g.active) {
        g.update();
      }
    }
  }
  draw(): void {
    for (let i = 0; i < this.length_; i++) {
      let g = this.members.get(i);
      if (g != null && g.exists && g.isVisible()) {
        g.draw();
      }
    }
  }
  kill(): void {
    for (let i = 0; i < this.length_; i++) {
      let g = this.members.get(i);
      if (g != null && g.exists) {
        g.kill();
      }
    }
    super.kill();
  }
  indexOf(g: Gizmo): number {
    return this.members.indexOf(g);
  }
  add$Gizmo(g: Gizmo): Gizmo {
    if (g.parent === this) {
      return g;
    }
    if (g.parent != null) {
      g.parent.remove$Gizmo(g);
    }
    for (let i = 0; i < this.length_; i++) {
      if (this.members.get(i) == null) {
        this.members.set(i, g);
        g.parent = this;
        return g;
      }
    }
    this.members.add(g);
    g.parent = this;
    this.length_++;
    return g;
  }
  addToFront(g: Gizmo): Gizmo {
    if (g.parent === this) {
      return g;
    }
    if (g.parent != null) {
      g.parent.remove$Gizmo(g);
    }
    for (let i = (this.length_ - 1) | 0; i >= 0; i--) {
      if (this.members.get(i) == null) {
        if (i === 0 || this.members.get((i - 1) | 0) != null) {
          this.members.set(i, g);
          g.parent = this;
          return g;
        }
      } else {
        break;
      }
    }
    this.members.add(g);
    g.parent = this;
    this.length_++;
    return g;
  }
  addToBack(g: Gizmo): Gizmo {
    if (g.parent === this) {
      this.sendToBack(g);
      return g;
    }
    if (g.parent != null) {
      g.parent.remove$Gizmo(g);
    }
    if (!this.members.isEmpty() && this.members.get(0) == null) {
      this.members.set(0, g);
      g.parent = this;
      return g;
    }
    this.members.add(0, g);
    g.parent = this;
    this.length_++;
    return g;
  }
  recycle(c: JClass<Gizmo>): Gizmo {
    let g = this.getFirstAvailable(c);
    if (g != null) {
      return g;
    } else if (c == null) {
      return null;
    } else {
      g = Reflection.newInstance(c);
      if (g != null) {
        return this.add$Gizmo(g);
      }
    }
    return null;
  }
  erase(g: Gizmo): Gizmo {
    let index = this.members.indexOf(g);
    if (index !== -1) {
      this.members.set(index, null);
      g.parent = null;
      return g;
    } else {
      return null;
    }
  }
  remove$Gizmo(g: Gizmo): Gizmo {
    if (this.members.remove(g)) {
      this.length_--;
      g.parent = null;
      return g;
    } else {
      return null;
    }
  }
  replace(oldOne: Gizmo, newOne: Gizmo): Gizmo {
    let index = this.members.indexOf(oldOne);
    if (index !== -1) {
      this.members.set(index, newOne);
      newOne.parent = this;
      oldOne.parent = null;
      return newOne;
    } else {
      return null;
    }
  }
  getFirstAvailable(c: JClass<Gizmo>): Gizmo {
    for (let i = 0; i < this.length_; i++) {
      let g = this.members.get(i);
      if (g != null && !g.exists && ((c == null) || g.getClass() === c)) {
        return g;
      }
    }
    return null;
  }
  countLiving(): number {
    let count = 0;
    for (let i = 0; i < this.length_; i++) {
      let g = this.members.get(i);
      if (g != null && g.exists && g.alive) {
        count++;
      }
    }
    return count;
  }
  countDead(): number {
    let count = 0;
    for (let i = 0; i < this.length_; i++) {
      let g = this.members.get(i);
      if (g != null && !g.alive) {
        count++;
      }
    }
    return count;
  }
  random(): Gizmo {
    if (this.length_ > 0) {
      return this.members.get(Random.Int$int(this.length_));
    } else {
      return null;
    }
  }
  clear(): void {
    if (this.length_ === 0) {
      return;
    }
    for (let i = 0; i < this.length_; i++) {
      let g = this.members.get(i);
      if (g != null) {
        g.parent = null;
      }
    }
    this.members.clear();
    this.length_ = 0;
  }
  bringToFront(g: Gizmo): Gizmo {
    if (this.members.contains(g)) {
      this.members.remove(g);
      this.members.add(g);
      return g;
    } else {
      return null;
    }
  }
  sendToBack(g: Gizmo): Gizmo {
    if (this.members.contains(g)) {
      this.members.remove(g);
      this.members.add(0, g);
      return g;
    } else {
      return null;
    }
  }
  sort(c: Comparator): void {
    for (let i = 0; i < ((this.length_ - 1) | 0); i++) {
      if (c(this.members.get(i), this.members.get((i + 1) | 0)) > 0) {
        Collections.sort(this.members, c);
        return;
      }
    }
  }
}

$J.define(Group, 'com.watabou.noosa.Group', { kind: 'class', sup: 'com.watabou.noosa.Gizmo', ctors: { '': '_Group' }, meths: { 'remove(com.watabou.noosa.Gizmo)': 'remove$Gizmo', 'add(com.watabou.noosa.Gizmo)': 'add$Gizmo' } });
$J.module(() => {
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
