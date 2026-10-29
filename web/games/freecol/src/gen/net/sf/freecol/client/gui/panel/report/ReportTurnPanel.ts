// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/report/ReportTurnPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Hashtable, JString, Level, Logger } from '../../../../../../../../jre/index.ts';
import { ReportPanel } from './ReportPanel.ts';

let ImageIcon, JButton, JLabel, BadLocationException, StyleConstants, MigLayout, ClientOptions, FontLibrary, Utility, Messages, Building, Colony, Europe, Market, ModelMessage$MessageType, Nameable, Named, Player, StringTemplate, Tile, Unit, Unit$UnitLabelType, BooleanOption;

/**
 * This panel displays the Turn Report.
 */
export class ReportTurnPanel extends ReportPanel {
  static logger: Logger = null;
  /**
   * Map message identifiers to label.
   */
  labelsByMessage: Hashtable<string, List<JComponent>> = null;
  /**
   * Map message identifiers to text pane.
   */
  textPanesByMessage: Hashtable<string, List<JComponent>> = null;
  /**
   * The messages to display.
   */
  messages: List<ModelMessage> = null;
  /**
   * Creates the turn report.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param messages The {@code ModelMessages} to display in the report.
   */
  _ReportTurnPanel(freeColClient: FreeColClient, messages: List<ModelMessage>): this {
    this._ReportPanel(freeColClient, 'reportTurnAction');
    this.labelsByMessage = new Hashtable();
    this.textPanesByMessage = new Hashtable();
    this.messages = new ArrayList();
    this.reportPanel.setLayout(new MigLayout()._MigLayout$String$String$String('wrap 4', '[center][550!]:push[][]', ''));
    this.setMessages(messages);
    return this;
  }
  /**
   * Set the messages being displayed by this report.
   *
   * @param messages The {@code ModelMessages} to display in the report.
   */
  setMessages(messages: List<ModelMessage>): void {
    this.reportPanel.removeAll();
    this.messages.clear();
    if (messages != null) {
      this.messages.addAll(messages);
    }
    this.displayMessages();
  }
  displayMessages(): void {
    let game = this.getFreeColClient().getGame();
    let co = this.getClientOptions();
    let groupBy = co.getInteger(ClientOptions.MESSAGES_GROUP_BY);
    let comparator = co.getModelMessageComparator(game);
    if (comparator != null) {
      this.messages.sort(comparator);
    }
    let source = this;
    let type$ = null;
    for (const $it0 = this.messages.iterator(); $it0.hasNext(); ) {
      let message = $it0.next();
      {
        let messageSource: FreeColGameObject;
        switch (groupBy) {
          case ClientOptions.MESSAGES_GROUP_BY_SOURCE:
            messageSource = game.getMessageSource(message);
            if (messageSource !== source) {
              source = messageSource;
              this.reportPanel.add$Component$Object(this.getHeadline(messageSource), 'newline 20, skip');
            }
            break;
          case ClientOptions.MESSAGES_GROUP_BY_TYPE:
            if (message.getMessageType() !== type$) {
              type$ = message.getMessageType();
              let headline = Utility.localizedHeaderLabel$Named$String(type$, Utility.FONTSPEC_SUBTITLE);
              this.reportPanel.add$Component$Object(headline, 'newline 20, skip, span');
            }
            break;
          default:
            break;
        }
      }
      let component = new JLabel()._JLabel$();
      let messageDisplay = game.getMessageDisplay(message);
      let lib = this.getImageLibrary();
      if (messageDisplay != null) {
        let image = lib.getObjectImage$FreeColObject(messageDisplay);
        let icon = (image == null) ? null : new ImageIcon()._ImageIcon$Image(image);
        if (messageDisplay instanceof Colony || messageDisplay instanceof Europe) {
          let button = Utility.getLinkButton(null, icon, messageDisplay.getId());
          button.addActionListener($J.fn(this, 'actionPerformed'));
          component = button;
        } else if (messageDisplay instanceof Unit) {
          let button = Utility.getLinkButton(null, icon, (messageDisplay).up().getId());
          button.addActionListener($J.fn(this, 'actionPerformed'));
          component = button;
        } else {
          component = new JLabel()._JLabel$Icon(icon);
        }
      }
      this.reportPanel.add$Component$Object(component, 'newline');
      let textPane = Utility.getDefaultTextPane$();
      try {
        this.insertMessage(textPane.getStyledDocument(), message, this.getMyPlayer());
      } catch ($e1) {
        if ($J.isa($e1, BadLocationException)) {
          let ble = $J.exc($e1);
          ReportTurnPanel.logger.log(Level.WARNING, 'message insert fail', ble);
        } else {
          throw $e1;
        }
      }
      this.reportPanel.add$Component(textPane);
      let ignore = false;
      let label = component;
      {
        let ignoreButton: JButton, m: ModelMessage;
        switch (message.getMessageType()) {
          case ModelMessage$MessageType.WAREHOUSE_CAPACITY:
            ignoreButton = new JButton()._JButton$String('x');
            Utility.localizeToolTip$JComponent$StringTemplate(ignoreButton, StringTemplate.copy('report.turn.ignore', message));
            m = message;
            ignoreButton.addActionListener((ae) => {
              let flag = label.isEnabled();
              this.igc().ignoreMessage(m, flag);
              textPane.setEnabled(!flag);
              label.setEnabled(!flag);
            });
            this.reportPanel.add$Component(ignoreButton);
            ignore = true;
            break;
          default:
            break;
        }
      }
      let id = message.getId();
      let components: List<JComponent>;
      if ((components = this.textPanesByMessage.get(id)) == null) {
        this.textPanesByMessage.put(id, components = new ArrayList());
      }
      components.add(textPane);
      if ((components = this.labelsByMessage.get(id)) == null) {
        this.labelsByMessage.put(id, components = new ArrayList());
      }
      components.add(label);
      let msgKey = message.getOptionName();
      if (co.hasOption(msgKey, $J.cls(BooleanOption))) {
        let filterButton = new JButton()._JButton$String('X');
        Utility.localizeToolTip$JComponent$StringTemplate(filterButton, StringTemplate.template$String('report.turn.filter').addNamed$String$Named('%type%', message.getMessageType()));
        let mess = message;
        filterButton.addActionListener((ae) => {
          let flag = co.getBoolean(msgKey);
          co.setBoolean(msgKey, !flag);
          for (const $it2 = this.messages.iterator(); $it2.hasNext(); ) {
            let m = $it2.next();
            if (m.getMessageType() !== mess.getMessageType()) {
              continue;
            }
            for (const $it3 = this.textPanesByMessage.get(m.getId()).iterator(); $it3.hasNext(); ) {
              let jc = $it3.next();
              jc.setEnabled(!flag);
            }
            for (const $it4 = this.labelsByMessage.get(m.getId()).iterator(); $it4.hasNext(); ) {
              let jc = $it4.next();
              jc.setEnabled(!flag);
            }
          }
        });
        if (ignore) {
          this.reportPanel.add$Component(filterButton);
        } else {
          this.reportPanel.add$Component$Object(filterButton, 'skip');
        }
      }
    }
  }
  getHeadline(source: FreeColGameObject): JComponent {
    let text: string;
    let commandId = null;
    if (source == null) {
      text = '';
    } else if (source instanceof Player) {
      let player = source;
      let template = StringTemplate.template$String('report.turn.playerNation').addName$String$String('%player%', player.getName()).addStringTemplate$String$StringTemplate('%nation%', player.getNationLabel());
      text = Messages.message$StringTemplate(template);
    } else if (source instanceof Europe) {
      let europe = source;
      text = Messages.getName$Named(europe);
      commandId = europe.getId();
    } else if (source instanceof Market) {
      let market = source;
      let template = market.getOwner().getMarketName();
      text = Messages.message$StringTemplate(template);
      let europe = this.getMyPlayer().getEurope();
      commandId = (europe != null) ? europe.getId() : null;
    } else if (source instanceof Colony) {
      let colony = source;
      text = colony.getName();
      commandId = colony.getId();
    } else if (source instanceof Building) {
      let colony = (source).getColony();
      text = colony.getName();
      commandId = colony.getId();
    } else if (source instanceof Unit) {
      let unit = source;
      text = unit.getDescription$UnitLabelType(Unit$UnitLabelType.NATIONAL);
      commandId = unit.getLocation().getId();
    } else if (source instanceof Tile) {
      let tile = source;
      let template = tile.getLocationLabelFor(this.getMyPlayer());
      text = Messages.message$StringTemplate(template);
      commandId = tile.getId();
    } else if ($J.isa(source, Named)) {
      text = Messages.message$String((source).getNameKey());
    } else if ($J.isa(source, Nameable)) {
      text = (source).getName();
    } else {
      text = source.toString();
    }
    let font = FontLibrary.getScaledFont$String$String(Utility.FONTSPEC_SUBTITLE, text);
    let headline: JComponent;
    if (commandId != null) {
      let button = new JButton()._JButton$String(text);
      button.addActionListener($J.fn(this, 'actionPerformed'));
      button.setActionCommand(commandId);
      headline = button;
      headline.setForeground(Utility.getLinkColor());
    } else {
      headline = new JLabel()._JLabel$String(text);
    }
    headline.setFont(font);
    headline.setOpaque(false);
    headline.setBorder(Utility.blankBorder(5, 0, 0, 0));
    return headline;
  }
  insertMessage(document: StyledDocument, message: ModelMessage, player: Player): void {
    for (const $it5 = message.splitLinks(player).iterator(); $it5.hasNext(); ) {
      let o = $it5.next();
      if ($J.isa(o, JString)) {
        document.insertString(document.getLength(), o, document.getStyle('regular'));
      } else if (o instanceof JButton) {
        let b = o;
        b.addActionListener($J.fn(this, 'actionPerformed'));
        StyleConstants.setComponent(document.getStyle('button'), b);
        document.insertString(document.getLength(), ' ', document.getStyle('button'));
      }
    }
  }
  static $clinit() {
    ReportTurnPanel.logger = Logger.getLogger($J.cls(ReportTurnPanel).getName());
  }
}

$J.define(ReportTurnPanel, 'net.sf.freecol.client.gui.panel.report.ReportTurnPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.report.ReportPanel', ctors: { 'net.sf.freecol.client.FreeColClient,java.util.List': '_ReportTurnPanel' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JButton = $J.load('javax.swing.JButton');
  JLabel = $J.load('javax.swing.JLabel');
  BadLocationException = $J.load('javax.swing.text.BadLocationException');
  StyleConstants = $J.load('javax.swing.text.StyleConstants');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  ClientOptions = $J.load('net.sf.freecol.client.ClientOptions');
  FontLibrary = $J.load('net.sf.freecol.client.gui.FontLibrary');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Building = $J.load('net.sf.freecol.common.model.Building');
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  Europe = $J.load('net.sf.freecol.common.model.Europe');
  Market = $J.load('net.sf.freecol.common.model.Market');
  ModelMessage$MessageType = $J.load('net.sf.freecol.common.model.ModelMessage$MessageType');
  Nameable = $J.load('net.sf.freecol.common.model.Nameable');
  Named = $J.load('net.sf.freecol.common.model.Named');
  Player = $J.load('net.sf.freecol.common.model.Player');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  Tile = $J.load('net.sf.freecol.common.model.Tile');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Unit$UnitLabelType = $J.load('net.sf.freecol.common.model.Unit$UnitLabelType');
  BooleanOption = $J.load('net.sf.freecol.common.option.BooleanOption');
});
