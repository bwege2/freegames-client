// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/ErrorPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger } from '../../../../../../../jre/index.ts';
import { FreeColPanel } from './FreeColPanel.ts';

let AbstractAction, JScrollPane, ScrollPaneConstants, MigLayout, Utility, Messages, FreeColDirectories, StringTemplate;

/**
 * This is the panel that pops up when an error needs to be reported.
 */
export class ErrorPanel extends FreeColPanel {
  static logger: Logger = null;
  static readonly SHOW: string = 'show';
  /**
   * The width of em-width of the textboxes in this panel
   */
  static readonly columnWidth: number = 40;
  /**
   * Creates a panel to display the given error message.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param message The error message to display in this error panel.
   */
  _ErrorPanel$FreeColClient$String(freeColClient: FreeColClient, message: string): this {
    this._FreeColPanel$FreeColClient$String$LayoutManager(freeColClient, null, new MigLayout()._MigLayout$String('wrap 1'));
    let showButton = Utility.localizedButton$StringTemplate(StringTemplate.template$String('errorPanel.showLogFile').addName$String$String('%path%', FreeColDirectories.getLogFilePath()));
    showButton.setActionCommand(ErrorPanel.SHOW);
    showButton.addActionListener($J.fn(this, 'actionPerformed'));
    this.add$Component(Utility.getDefaultTextArea$String$int(message, ErrorPanel.columnWidth));
    this.add$Component$Object(this.okButton, 'split 2, tag ok');
    this.add$Component(showButton);
    this.setEscapeAction(new (ErrorPanel$1())().$o(this)._AbstractAction$());
    return this;
  }
  /**
   * Creates an error panel containing the log file.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _ErrorPanel$FreeColClient(freeColClient: FreeColClient): this {
    this._FreeColPanel$FreeColClient$String$LayoutManager(freeColClient, null, new MigLayout()._MigLayout$String$String$String('wrap 1, fill', '[]', '[fill, grow][]'));
    let message = FreeColDirectories.getLogFileContents();
    if (message == null) {
      message = Messages.message$String('errorPanel.loadError');
    }
    let textArea = Utility.getDefaultTextArea$String$int(message, ErrorPanel.columnWidth);
    textArea.setFocusable(true);
    textArea.setEditable(false);
    let scrollPane = new JScrollPane()._JScrollPane$Component$int$int(textArea, ScrollPaneConstants.VERTICAL_SCROLLBAR_AS_NEEDED, ScrollPaneConstants.HORIZONTAL_SCROLLBAR_NEVER);
    scrollPane.getViewport().setOpaque(false);
    this.add$Component$Object(scrollPane, 'height :200:, grow');
    this.add$Component$Object(this.okButton, 'tag ok');
    return this;
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    let command = ae.getActionCommand();
    if ($J.equals(ErrorPanel.SHOW, command)) {
      this.getGUI().showLogFilePanel();
    } else {
      super.actionPerformed(ae);
    }
  }
  static $clinit() {
    ErrorPanel.logger = Logger.getLogger($J.cls(ErrorPanel).getName());
  }
}

let $ErrorPanel$1: any = null;
/** An anonymous class (ErrorPanel.java:73). */
function ErrorPanel$1(): any {
  return $ErrorPanel$1 ??= $J.local(class extends AbstractAction {
    actionPerformed(ae: ActionEvent): void {
      this.$outer.okButton.doClick$();
    }
  }, 'net.sf.freecol.client.gui.panel.ErrorPanel$1', []);
}

$J.define(ErrorPanel, 'net.sf.freecol.client.gui.panel.ErrorPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.FreeColPanel', ctors: { 'net.sf.freecol.client.FreeColClient': '_ErrorPanel$FreeColClient', 'net.sf.freecol.client.FreeColClient,java.lang.String': '_ErrorPanel$FreeColClient$String' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  AbstractAction = $J.load('javax.swing.AbstractAction');
  JScrollPane = $J.load('javax.swing.JScrollPane');
  ScrollPaneConstants = $J.load('javax.swing.ScrollPaneConstants');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  FreeColDirectories = $J.load('net.sf.freecol.common.io.FreeColDirectories');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
});
