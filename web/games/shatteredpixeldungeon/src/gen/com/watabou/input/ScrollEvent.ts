// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/input/ScrollEvent.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, JObject } from '../../../../jre/index.ts';

let Signal;

export class ScrollEvent extends JObject {
  pos: PointF = null;
  amount: number = 0;
  static scrollSignal: Signal<ScrollEvent> = null;
  static scrollEvents: ArrayList<ScrollEvent> = null;
  _ScrollEvent(mousePos: PointF, amount: number): this {
    this.amount = amount;
    this.pos = mousePos;
    return this;
  }
  static addScrollListener(listener: Signal$Listener<ScrollEvent>): void {
    ScrollEvent.scrollSignal.add(listener);
  }
  static removeScrollListener(listener: Signal$Listener<ScrollEvent>): void {
    ScrollEvent.scrollSignal.remove(listener);
  }
  static clearListeners(): void {
    ScrollEvent.scrollSignal.removeAll();
  }
  static addScrollEvent(event: ScrollEvent): void {
    ScrollEvent.scrollEvents.add(event);
  }
  static processScrollEvents(): void {
    if (ScrollEvent.scrollEvents.isEmpty()) {
      return;
    }
    for (const $it0 = ScrollEvent.scrollEvents.iterator(); $it0.hasNext(); ) {
      let k = $it0.next();
      ScrollEvent.scrollSignal.dispatch(k);
    }
    ScrollEvent.scrollEvents.clear();
  }
  static $clinit() {
    ScrollEvent.scrollSignal = new Signal()._Signal$boolean(true);
    ScrollEvent.scrollEvents = new ArrayList();
  }
}

$J.define(ScrollEvent, 'com.watabou.input.ScrollEvent', { kind: 'class', sup: 'java.lang.Object', ctors: { 'com.watabou.utils.PointF,float': '_ScrollEvent' }, clinit: true, lazy: ['scrollSignal', 'scrollEvents'] });
$J.module(() => {
  Signal = $J.load('com.watabou.utils.Signal');
});
