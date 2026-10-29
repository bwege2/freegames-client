// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/label/FreeColLabel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/**
 * Copyright (C) 2002-2022   The FreeCol Team
 *
 * This file is part of FreeCol.
 *
 * FreeCol is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * FreeCol is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with FreeCol.  If not, see <http://www.gnu.org/licenses/>.
 */
import { $J } from '../../../../../../../jre/index.ts';
import { JLabel } from '../../../../../../javax/swing/JLabel.ts';

let SwingConstants;

/**
 * A simple wrapper for {@code JLabel}
 *
 * All members of the net.sf.freecol.client.gui.label
 *      package extend this abstract class.
 *
 * @since 0.11.7
 */
export class FreeColLabel extends JLabel {
  /**
   * Creates a {@code FreeColLabel} instance with
   * no image and with an empty string for the title.
   * <p>
   * The label is centered vertically in its display area.
   * <p>
   * The label's contents, once set, will be displayed on the leading edge
   * of the label's display area.
   */
  _FreeColLabel$(): this {
    this._JLabel$String$Icon$int('', null, SwingConstants.LEADING);
    return this;
  }
  /**
   * Creates a {@code FreeColLabel} instance with the
   * specified image. The label is centered vertically
   * and horizontally in its display area.
   *
   * @param image The image to be displayed by the label.
   */
  _FreeColLabel$Icon(image: Icon): this {
    this._JLabel$String$Icon$int(null, image, SwingConstants.CENTER);
    return this;
  }
}

$J.define(FreeColLabel, 'net.sf.freecol.client.gui.label.FreeColLabel', { kind: 'class', sup: 'javax.swing.JLabel', ctors: { 'javax.swing.Icon': '_FreeColLabel$Icon', '': '_FreeColLabel$' } });
$J.module(() => {
  SwingConstants = $J.load('javax.swing.SwingConstants');
});
