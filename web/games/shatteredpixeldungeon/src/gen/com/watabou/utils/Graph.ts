// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/utils/Graph.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, JObject, LinkedList } from '../../../../jre/index.ts';

export class Graph extends JObject {
  _Graph(): this {
    return this;
  }
  static setPrice<T>(nodes: List<T>, value: number): void {
    for (const $it0 = nodes.iterator(); $it0.hasNext(); ) {
      let node = $it0.next();
      node.price$int(value);
    }
  }
  static buildDistanceMap<T>(nodes: Collection<T>, focus: Graph$Node): void {
    for (const $it1 = nodes.iterator(); $it1.hasNext(); ) {
      let node = $it1.next();
      node.distance$int(2147483647);
    }
    let queue = new LinkedList();
    focus.distance$int(0);
    queue.add(focus);
    while (!queue.isEmpty()) {
      let node = queue.poll();
      let distance = node.distance$();
      let price = node.price$();
      for (const $it2 = node.edges().iterator(); $it2.hasNext(); ) {
        let edge = $it2.next();
        if (edge.distance$() > ((distance + price) | 0)) {
          queue.add(edge);
          edge.distance$int((distance + price) | 0);
        }
      }
    }
  }
  static buildPath<T>(nodes: Collection<T>, from: T, to: T): List<T> {
    let path = new ArrayList();
    let room = from;
    while (room !== to) {
      let min = room.distance$();
      let next = null;
      let edges = room.edges();
      for (const $it3 = edges.iterator(); $it3.hasNext(); ) {
        let edge = $it3.next();
        let distance = edge.distance$();
        if (distance < min) {
          min = distance;
          next = edge;
        }
      }
      if (next == null) {
        return null;
      }
      path.add(next);
      room = next;
    }
    return path;
  }
}

export class Graph$Node {
}

$J.define(Graph, 'com.watabou.utils.Graph', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Graph' } });
$J.define(Graph$Node, 'com.watabou.utils.Graph$Node', { kind: 'interface', meths: { 'price(int)': 'price$int', 'price()': 'price$', 'distance(int)': 'distance$int', 'distance()': 'distance$' } });
