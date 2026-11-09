// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/utils/Signal.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject, LinkedList } from '../../../../jre/index.ts';

export class Signal<T> extends JObject {
  listeners: LinkedList<Signal$Listener<T>> = null;
  stackMode: boolean = false;
  $init_Signal() {
    this.listeners = new LinkedList();
  }
  _Signal$(): this {
    this._Signal$boolean(false);
    return this;
  }
  _Signal$boolean(stackMode: boolean): this {
    this.$init_Signal();
    this.stackMode = stackMode;
    return this;
  }
  add(listener: Signal$Listener<T>): void {
    if (!this.listeners.contains(listener)) {
      if (this.stackMode) {
        this.listeners.addFirst(listener);
      } else {
        this.listeners.addLast(listener);
      }
    }
  }
  remove(listener: Signal$Listener<T>): void {
    this.listeners.remove(listener);
  }
  removeAll(): void {
    this.listeners.clear();
  }
  replace(listener: Signal$Listener<T>): void {
    this.removeAll();
    this.add(listener);
  }
  numListeners(): number {
    return this.listeners.size();
  }
  dispatch(t: T): void {
    let list = $J.toArrayInto(this.listeners.toArray(), $J.newArray(0, null));
    for (let listener of list) {
      if (this.listeners.contains(listener)) {
        if (listener.onSignal(t)) {
          return;
        }
      }
    }
  }
}

export class Signal$Listener<T> {
}

$J.define(Signal, 'com.watabou.utils.Signal', { kind: 'class', sup: 'java.lang.Object', ctors: { 'boolean': '_Signal$boolean', '': '_Signal$' } });
$J.define(Signal$Listener, 'com.watabou.utils.Signal$Listener', { kind: 'interface' });
