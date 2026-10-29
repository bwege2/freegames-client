// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/control/MapTransform.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../../jre/index.ts';

/**
 * Represents a transformation that can be applied to
 * a {@code Tile}.
 *
 * @see #transform(Tile)
 */
export class MapTransform extends JObject {
  /**
   * A panel with information about this transformation.
   */
  descriptionPanel: JPanel = null;
  _MapTransform(): this {
    this.descriptionPanel = null;
    return this;
  }
  /**
   * A panel with information about this transformation.  This panel
   * is currently displayed on the
   * {@link net.sf.freecol.client.gui.panel.InfoPanel} when selected,
   * but might be used elsewhere as well.
   *
   * @return The panel or {@code null} if no panel
   *      has been set.
   */
  getDescriptionPanel(): JPanel {
    return this.descriptionPanel;
  }
  /**
   * Sets a panel that can be used for describing this
   * transformation to the user.
   *
   * @param descriptionPanel The panel.
   */
  setDescriptionPanel(descriptionPanel: JPanel): void {
    this.descriptionPanel = descriptionPanel;
  }
}

$J.define(MapTransform, 'net.sf.freecol.client.control.MapTransform', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_MapTransform' }, returns: { 'getDescriptionPanel': 'javax.swing.JPanel' } });
