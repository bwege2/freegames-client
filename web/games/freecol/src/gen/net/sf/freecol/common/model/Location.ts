// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/Location.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../jre/index.ts';

/**
 * A place where a {@code Locatable} can be put.
 *
 * @see Locatable
 */
export class Location {
  static readonly LOCATION_RANK_NOWHERE: number = -3;
  static readonly LOCATION_RANK_EUROPE: number = -2;
  static readonly LOCATION_RANK_HIGHSEAS: number = -1;
  /**
   * Static frontend to up().
   *
   * @param loc The {@code Location} to improve.
   * @return The improved {@code Location}.
   */
  static upLoc(loc: Location): Location {
    return (loc == null) ? null : loc.up();
  }
  /**
   * Static front end to getRank.
   *
   * @param loc A {@code Location} to check.
   * @return The integer rank of the given location.
   */
  static rankOf(loc: Location): number {
    return (loc == null) ? Location.LOCATION_RANK_NOWHERE : loc.getRank();
  }
  /**
   * Get an image key for this location.
   *
   * @return A key for image lookup, null by default.
   */
  getLocationImageKey(): string {
    return null;
  }
}

$J.define(Location, 'net.sf.freecol.common.model.Location', { kind: 'interface', ifaces: ['net.sf.freecol.common.ObjectWithId'], returns: { 'getLocationImageKey': 'java.lang.String', 'getRank': 'int', 'getIndianSettlement': 'net.sf.freecol.common.model.IndianSettlement', 'getColony': 'net.sf.freecol.common.model.Colony', 'getSettlement': 'net.sf.freecol.common.model.Settlement', 'getGoodsContainer': 'net.sf.freecol.common.model.GoodsContainer', 'getUnitList': 'java.util.List', 'getUnits': 'java.util.stream.Stream', 'getUnitCount': 'int', 'getLocationLabel': 'net.sf.freecol.common.model.StringTemplate', 'getTile$': 'net.sf.freecol.common.model.Tile', 'getId': 'java.lang.String' }, meths: { 'getTile()': 'getTile$' } });
