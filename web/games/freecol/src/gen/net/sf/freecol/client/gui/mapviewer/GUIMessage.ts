// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/mapviewer/GUIMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JDate, JObject, Logger } from '../../../../../../../jre/index.ts';

/**
 * Represents a message that can be displayed in the GUI.  It has
 * message data and a Color.
 */
export class GUIMessage extends JObject {
  static logger: Logger = null;
  message: string = null;
  color: Color = null;
  creationTime: JDate = null;
  /**
   * The constructor to use.
   *
   * @param message The actual message.
   * @param color The {@code Color} in which to display this
   *     message.
   */
  _GUIMessage(message: string, color: Color): this {
    this.message = message;
    this.color = color;
    this.creationTime = new JDate();
    return this;
  }
  /**
   * Get the message data.
   *
   * @return The message data.
   */
  getMessage(): string {
    return this.message;
  }
  /**
   * Gets the message's Color.
   *
   * @return The message {@code Color}.
   */
  getColor(): Color {
    return this.color;
  }
  /**
   * Get the time at which this message was created.
   *
   * @return The time at which this message was created.
   */
  getCreationTime(): number {
    return this.creationTime.getTime();
  }
  static $clinit() {
    GUIMessage.logger = Logger.getLogger($J.cls(GUIMessage).getName());
  }
}

$J.define(GUIMessage, 'net.sf.freecol.client.gui.mapviewer.GUIMessage', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.lang.String,java.awt.Color': '_GUIMessage' }, returns: { 'getCreationTime': 'long', 'getColor': 'java.awt.Color', 'getMessage': 'java.lang.String' }, clinit: true, lazy: ['logger'] });
