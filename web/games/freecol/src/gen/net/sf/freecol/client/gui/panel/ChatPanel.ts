// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/ChatPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JString, Logger, NumberFormatException } from '../../../../../../../jre/index.ts';
import { FreeColPanel } from './FreeColPanel.ts';

let BorderLayout, AbstractAction, JTextField, Utility;

/**
 * This is the panel that pops up when the user wants to send a
 * message to the other players. There is no close button because it
 * closes as soon as the user presses enter in the textfield.
 */
export class ChatPanel extends FreeColPanel {
  static logger: Logger = null;
  static readonly CHAT: number = 1;
  field: JTextField = null;
  /**
   * The constructor that will add the items to this panel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _ChatPanel(freeColClient: FreeColClient): this {
    this._FreeColPanel$FreeColClient$String$LayoutManager(freeColClient, null, new BorderLayout()._BorderLayout$int$int(10, 10));
    let label = Utility.localizedLabel$String('chatPanel.message');
    this.add$Component$Object(label, BorderLayout.PAGE_START);
    label.setFocusable(false);
    this.field = new JTextField()._JTextField$String$int('', 40);
    this.field.setActionCommand(String(ChatPanel.CHAT));
    this.field.addActionListener($J.fn(this, 'actionPerformed'));
    this.add$Component$Object(this.field, BorderLayout.CENTER);
    this.field.setFocusable(true);
    this.setEscapeAction(new (ChatPanel$1())().$o(this)._AbstractAction$());
    this.setSize$Dimension(this.getPreferredSize$());
    return this;
  }
  /**
   * Requests that the chat textfield in this chat panel gets the focus.
   */
  requestFocus$(): void {
    this.field.requestFocus$();
  }
  /**
   * Gets the chat message that the user has entered and clears the
   * chat textfield to make room for a new message.
   *
   * @return The chat message.
   */
  getChatText(): string {
    let message = this.field.getText$();
    this.field.setText('');
    return message;
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    let command = ae.getActionCommand();
    try {
      {
        let message: string;
        switch ($J.parseInt(command)) {
          case ChatPanel.CHAT:
            message = this.getChatText();
            if (!$J.equals(JString.trim(message), '')) {
              this.igc().chat(message);
            }
            this.getGUI().removeComponent(this);
            break;
          default:
            super.actionPerformed(ae);
        }
      }
    } catch ($e0) {
      if ($J.isa($e0, NumberFormatException)) {
        let e = $J.exc($e0);
        ChatPanel.logger.warning('Invalid ActionEvent, not a number: ' + command);
      } else {
        throw $e0;
      }
    }
  }
  static $clinit() {
    ChatPanel.logger = Logger.getLogger($J.cls(ChatPanel).getName());
  }
}

let $ChatPanel$1: any = null;
/** An anonymous class (ChatPanel.java:65). */
function ChatPanel$1(): any {
  return $ChatPanel$1 ??= $J.local(class extends AbstractAction {
    actionPerformed(ae: ActionEvent): void {
      this.$outer.getGUI().removeComponent(this.$outer);
    }
  }, 'net.sf.freecol.client.gui.panel.ChatPanel$1', []);
}

$J.define(ChatPanel, 'net.sf.freecol.client.gui.panel.ChatPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.FreeColPanel', ctors: { 'net.sf.freecol.client.FreeColClient': '_ChatPanel' }, returns: { 'getChatText': 'java.lang.String' }, meths: { 'requestFocus()': 'requestFocus$' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  BorderLayout = $J.load('java.awt.BorderLayout');
  AbstractAction = $J.load('javax.swing.AbstractAction');
  JTextField = $J.load('javax.swing.JTextField');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
});
