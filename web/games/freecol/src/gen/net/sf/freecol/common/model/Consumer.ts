// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/Consumer.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/**
 *  Copyright (C) 2002-2022   The FreeCol Team
 *
 *  This file is part of FreeCol.
 *
 *  FreeCol is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  FreeCol is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with FreeCol.  If not, see <http://www.gnu.org/licenses/>.
 */
import { $J, Comparator } from '../../../../../../jre/index.ts';

/**
 * Objects implementing the Consumer interface consume Goods. Examples
 * include units that eat food, buildings that convert Goods into
 * other Goods, or buildings that store Goods.
 */
export class Consumer {
  /**
   * Compare consumers by descending priority.
   */
  static COMPARATOR: Comparator<Consumer> = null;
  /**
   * Default consumption priority for the Colony when producing new
   * colonists (from food).
   */
  static readonly POPULATION_PRIORITY: number = 300;
  /**
   * The consumption priority of the colony build queue.
   */
  static readonly COLONY_PRIORITY: number = 500;
  /**
   * Default consumption priority for buildings. Individual building
   * types may have different priorities.
   */
  static readonly BUILDING_PRIORITY: number = 800;
  /**
   * Default consumption priority for units. Individual unit types
   * may have different priorities. Slave units, or converts, or
   * petty criminals, for example, might have a lower priority.
   */
  static readonly UNIT_PRIORITY: number = 1000;
  static $clinit() {
    Consumer.COMPARATOR = Comparator.reversed((Comparator.comparingInt(($p0) => $p0.getPriority())));
  }
}

$J.define(Consumer, 'net.sf.freecol.common.model.Consumer', { kind: 'interface', returns: { 'getPriority': 'int', 'getConsumedGoods': 'java.util.List' }, clinit: true, lazy: ['COMPARATOR'] });
