// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/mapviewer/ChatDisplay.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, JDate, JObject } from '../../../../../../../jre/index.ts';

let FontLibrary;

/**
 * ChatDisplay manages use of {@code GUIMessage}.
 */
export class ChatDisplay extends JObject {
  /**
   * The number of messages getting remembered.
   */
  static readonly MESSAGE_COUNT: number = 5;
  /**
   * Left margin for the text.
   */
  static readonly LEFT_MARGIN: number = 40;
  /**
   * Top margin for the text.
   */
  static readonly TOP_MARGIN: number = 400;
  /**
   * The amount of time before a message gets deleted (in milliseconds).
   */
  static readonly MESSAGE_AGE: number = 30000;
  /**
   * The image library to use to draw with.
   */
  lib: ImageLibrary = null;
  /**
   * The font to write with.
   */
  font: Font = null;
  /**
   * The messages to display.
   */
  messages: List<GUIMessage> = null;
  /**
   * Create the chat display/ container.
   *
   * @param freeColClient The enclosing {@code FreeColClient}.
   */
  _ChatDisplay(freeColClient: FreeColClient): this {
    this.lib = freeColClient.getGUI().getFixedImageLibrary();
    this.font = FontLibrary.getScaledFont$String('normal-plain-tiny');
    this.messages = new ArrayList(ChatDisplay.MESSAGE_COUNT);
    return this;
  }
  /**
   * Adds a message to the list of messages that need to be displayed
   * on the GUI.
   *
   * @param message The message to add.
   */
  addMessage(message: GUIMessage): void {
    if (this.messages.size() >= ChatDisplay.MESSAGE_COUNT) {
      this.messages.removeAt(0);
    }
    this.messages.add(message);
  }
  /**
   * Collect all messages to display, removing all older than MESSAGE_AGE.
   *
   * @return A copy of any messages found.
   */
  prepareMessages(): List<GUIMessage> {
    let currentTime = new JDate().getTime();
    let ret = new ArrayList();
    let i = 0;
    while (i < this.messages.size()) {
      let m = this.messages.get(i);
      let creationTime = m.getCreationTime();
      if ((currentTime - creationTime) >= ChatDisplay.MESSAGE_AGE) {
        this.messages.removeAt(i);
      } else {
        ret.add(m);
        i++;
      }
    }
    return ret;
  }
  /**
   * Displays the list of messages.
   *
   * @param g The Graphics2D the messages should be displayed on.
   * @param size The size of the space for displaying in.
   */
  display(g: Graphics2D, size: Dimension): void {
    let msgs = this.prepareMessages();
    if (msgs.isEmpty()) {
      return;
    }
    let yy = -1;
    let xx = this.lib.scaleInt(ChatDisplay.LEFT_MARGIN);
    for (const $it0 = msgs.iterator(); $it0.hasNext(); ) {
      let m = $it0.next();
      let si = this.lib.getStringImage(g, m.getMessage(), m.getColor(), this.font);
      if (yy < 0) {
        yy = (size.height_ - this.lib.scaleInt(ChatDisplay.TOP_MARGIN) - Math.imul(msgs.size(), si.getHeight$ImageObserver(null))) | 0;
      }
      g.drawImage$Image$int$int$ImageObserver(si, xx, yy, null);
      yy = (yy + si.getHeight$ImageObserver(null)) | 0;
    }
  }
}

$J.define(ChatDisplay, 'net.sf.freecol.client.gui.mapviewer.ChatDisplay', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.client.FreeColClient': '_ChatDisplay' } });
$J.module(() => {
  FontLibrary = $J.load('net.sf.freecol.client.gui.FontLibrary');
});
