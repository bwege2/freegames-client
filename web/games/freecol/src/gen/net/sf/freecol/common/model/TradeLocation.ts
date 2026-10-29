// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/TradeLocation.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let JLabel;

/**
 * A wrapper interface for a location that can be on a trade route.
 *
 * @see TradeRoute
 */
export class TradeLocation {
  /**
   * Get the name of this instance as a JLabel.
   *
   * @return The {@code JLabel} with the result of
   *     {@link #getLocationName(TradeLocation)}
   */
  getNameAsJlabel(): JLabel {
    return new JLabel()._JLabel$String(this.getLocationName(this));
  }
  /**
   * Can a TradeLocation be set as the input location on a
   * TradeRouteInputPanel
   *
   * @return True if possible, false by default.
   */
  canBeInput(): boolean {
    return false;
  }
}

$J.define(TradeLocation, 'net.sf.freecol.common.model.TradeLocation', { kind: 'interface', returns: { 'getNameAsJlabel': 'javax.swing.JLabel' } });
$J.module(() => {
  JLabel = $J.load('javax.swing.JLabel');
});
