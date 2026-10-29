// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/StartGamePanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JString, Logger } from '../../../../../../../jre/index.ts';
import { FreeColPanel } from './FreeColPanel.ts';

let Dimension, AbstractAction, JCheckBox, JScrollPane, JTextArea, JTextField, ScrollPaneConstants, MigLayout, FontLibrary, FreeColButton, FreeColButton$ButtonStyle, PlayersTable, Utility, Messages, Game$LogoutReason, NationOptions$NationState, GameOptions, MapGeneratorOptions, CollectionUtils;

/**
 * The panel where you choose your nation and color and connected players are
 * shown.
 */
export class StartGamePanel extends FreeColPanel {
  static logger: Logger = null;
  singlePlayerGame: boolean = false;
  readyBox: JCheckBox = null;
  chat_: JTextField = null;
  chatArea: JTextArea = null;
  start_: JButton = null;
  cancel_: JButton = null;
  gameOptions: JButton = null;
  mapGeneratorOptions: JButton = null;
  table: PlayersTable = null;
  startCmd: ActionListener = null;
  cancelCmd: ActionListener = null;
  readyBoxCmd: ActionListener = null;
  chatCmd: ActionListener = null;
  gameOptionsCmd: ActionListener = null;
  mapGeneratorOptionsCmd: ActionListener = null;
  /**
   * Create the panel from which to start a game.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _StartGamePanel(freeColClient: FreeColClient): this {
    this._FreeColPanel$FreeColClient$String$LayoutManager(freeColClient, null, new MigLayout()._MigLayout$String$String$String('fill', '', '[grow][][]'));
    this.startCmd = (ae) => {
      let row = this.table.getSelectedRow();
      let col = this.table.getSelectedColumn();
      if (row > -1 && col > -1) {
        this.table.getCellEditor$int$int(row, col).stopCellEditing();
      }
      if (!this.checkVictoryConditions()) {
        return;
      }
      if (this.singlePlayerGame) {
        this.getMyPlayer().setReady(true);
      }
      this.getFreeColClient().getPreGameController().requestLaunch();
    };
    this.cancelCmd = (ae) => {
      let gui = this.getGUI();
      if (this.getFreeColClient().isLoggedIn()) {
        this.getFreeColClient().getConnectController().requestLogout(Game$LogoutReason.NEW_GAME);
      }
      this.getFreeColClient().stopServer();
      gui.removeComponent(this);
      gui.showNewPanel$();
    };
    this.readyBoxCmd = (ae) => {
      this.getFreeColClient().getPreGameController().setReady(this.readyBox.isSelected());
      this.refreshPlayersTable();
    };
    this.chatCmd = (ae) => {
      if (!(this.chat_.getText$().length === 0)) {
        this.getFreeColClient().getPreGameController().sendChat(this.chat_.getText$());
        this.displayChat(this.getMyPlayer().getName(), this.chat_.getText$(), false);
        this.chat_.setText('');
      }
    };
    this.gameOptionsCmd = (ae) => {
      let fcc = this.getFreeColClient();
      this.getGUI().showGameOptionsDialog(fcc.isAdmin(), (gameOptions) => {
        if (gameOptions != null) {
          fcc.getGame().setGameOptions(gameOptions);
          fcc.getPreGameController().updateGameOptions();
        }
      });
    };
    this.mapGeneratorOptionsCmd = (ae) => {
      let fcc = this.getFreeColClient();
      this.getGUI().showMapGeneratorOptionsDialog(fcc.isAdmin(), (mgo) => {
        if (mgo != null) {
          fcc.getGame().setMapGeneratorOptions(mgo);
          fcc.getPreGameController().updateMapGeneratorOptions();
        }
      });
    };
    return this;
  }
  initialize(singlePlayer: boolean): void {
    this.removeAll();
    this.singlePlayerGame = singlePlayer;
    if (singlePlayer || this.getMyPlayer().isAdmin()) {
      this.getSpecification().updateGameAndMapOptions();
    }
    let nationOptions = this.getGame().getNationOptions();
    this.cancel_ = Utility.localizedButton$String('cancel');
    let chatScroll = null;
    let tableScroll: JScrollPane;
    this.table = new PlayersTable()._PlayersTable(this.getFreeColClient(), nationOptions, this.getMyPlayer());
    this.start_ = new FreeColButton()._FreeColButton$String(Messages.message$String('startGame')).withButtonStyle(FreeColButton$ButtonStyle.IMPORTANT);
    this.gameOptions = Utility.localizedButton$String(Messages.nameKey$String(GameOptions.TAG));
    this.mapGeneratorOptions = Utility.localizedButton$String(Messages.nameKey$String(MapGeneratorOptions.TAG));
    this.readyBox = new JCheckBox()._JCheckBox$String(Messages.message$String('startGamePanel.iAmReady'));
    if (this.singlePlayerGame) {
      this.getMyPlayer().setReady(false);
      this.readyBox.setSelected(true);
    } else {
      this.readyBox.setSelected(this.getMyPlayer().isReady());
      this.chat_ = new JTextField()._JTextField$();
      this.chatArea = new JTextArea()._JTextArea$();
      chatScroll = new JScrollPane()._JScrollPane$Component$int$int(this.chatArea, ScrollPaneConstants.VERTICAL_SCROLLBAR_ALWAYS, ScrollPaneConstants.HORIZONTAL_SCROLLBAR_NEVER);
    }
    this.refreshPlayersTable();
    tableScroll = new (StartGamePanel$1())().$o(this)._JScrollPane$Component$int$int(this.table, ScrollPaneConstants.VERTICAL_SCROLLBAR_AS_NEEDED, ScrollPaneConstants.HORIZONTAL_SCROLLBAR_NEVER);
    tableScroll.getViewport().setOpaque(false);
    let tableWidth = this.getImageLibrary().scaleInt(600);
    let tableHeight = this.getImageLibrary().scaleInt(300);
    this.add$Component$Object(tableScroll, 'grow');
    tableScroll.setSize$Dimension(this.getPreferredSize$());
    if (!this.singlePlayerGame) {
      let chatHeight = $J.d2i((Math.fround(FontLibrary.getFontScaling() * 100)));
      this.add$Component$Object(chatScroll, 'newline, height ' + chatHeight + 'px:,growx');
      this.add$Component$Object(this.chat_, 'newline, growx');
    }
    this.add$Component$Object(this.mapGeneratorOptions, 'newline, split 2, growx, top, sg');
    this.add$Component$Object(this.gameOptions, 'growx, top, sg');
    this.add$Component$Object(this.readyBox, 'newline, span, split 3, tag left, gaptop unrelated');
    this.add$Component$Object(this.start_, 'tag ok');
    this.add$Component$Object(this.cancel_, 'tag cancel');
    if (!this.singlePlayerGame) {
      this.chat_.addActionListener(this.chatCmd);
      this.chatArea.setEditable(false);
      this.chatArea.setLineWrap(true);
      this.chatArea.setWrapStyleWord(true);
      this.chatArea.setText('');
    }
    this.start_.addActionListener(this.startCmd);
    this.cancel_.addActionListener(this.cancelCmd);
    this.readyBox.addActionListener(this.readyBoxCmd);
    this.gameOptions.addActionListener(this.gameOptionsCmd);
    this.mapGeneratorOptions.addActionListener(this.mapGeneratorOptionsCmd);
    this.setEscapeAction(new (StartGamePanel$2())().$o(this)._AbstractAction$());
    this.setEnabled(true);
  }
  /**
   * Check that the user has not specified degenerate victory conditions
   * that are automatically true.
   *
   * @return True if the victory conditions are sensible.
   */
  checkVictoryConditions(): boolean {
    let spec = this.getSpecification();
    if (this.singlePlayerGame && spec.getBoolean(GameOptions.VICTORY_DEFEAT_EUROPEANS) && !spec.getBoolean(GameOptions.VICTORY_DEFEAT_REF)) {
      let n = CollectionUtils.count$Collection$Predicate(this.getGame().getNationOptions().getNations().entrySet(), (e) => (e.getKey().getType().isEuropean() && !e.getKey().isUnknownEnemy() && e.getValue() !== NationOptions$NationState.NOT_AVAILABLE));
      if (n === 0) {
        this.getGUI().showInformationPanel$String('info.noEuropeans');
        return false;
      }
    }
    return true;
  }
  /**
   * Displays a chat message to the user.
   *
   * @param senderName The name of the player who sent the chat
   *     message to the server.
   * @param message The chat message.
   * @param privateChat 'true' if the message is a private one, 'false'
   *     otherwise.
   */
  displayChat(senderName: string, message: string, privateChat: boolean): void {
    if (privateChat) {
      this.chatArea.append(senderName + ' (' + Messages.message$String('private') + '): ' + message + String.fromCharCode(10 /* \u000a */));
    } else {
      this.chatArea.append(senderName + ': ' + message + String.fromCharCode(10 /* \u000a */));
    }
  }
  /**
   * Refreshes the table that displays the players and the choices that
   * they've made.
   */
  refreshPlayersTable(): void {
    if (this.table != null) {
      this.table.update$();
    }
  }
  /**
   * {@inheritDoc}
   */
  removeNotify(): void {
    this.start_.removeActionListener(this.startCmd);
    this.cancel_.removeActionListener(this.cancelCmd);
    this.readyBox.removeActionListener(this.readyBoxCmd);
    this.gameOptions.removeActionListener(this.gameOptionsCmd);
    this.mapGeneratorOptions.removeActionListener(this.mapGeneratorOptionsCmd);
    if (this.chat_ != null) {
      this.chat_.removeActionListener(this.chatCmd);
    }
  }
  /**
   * {@inheritDoc}
   */
  requestFocus$(): void {
    this.start_.requestFocus$();
  }
  /**
   * {@inheritDoc}
   */
  setEnabled(enabled: boolean): void {
    super.setEnabled(enabled);
    let components = this.getComponents();
    for (let component of components) {
      component.setEnabled(enabled);
    }
    if (this.singlePlayerGame && enabled) {
      this.readyBox.setEnabled(false);
    }
    if (enabled) {
      this.start_.setEnabled(this.getFreeColClient().isAdmin());
    }
    this.gameOptions.setEnabled(enabled);
  }
  static $clinit() {
    StartGamePanel.logger = Logger.getLogger($J.cls(StartGamePanel).getName());
  }
}

let $StartGamePanel$1: any = null;
/** An anonymous class (StartGamePanel.java:180). */
function StartGamePanel$1(): any {
  return $StartGamePanel$1 ??= $J.local(class extends JScrollPane {
    getPreferredSize$(): Dimension {
      let tableWidth = this.$outer.getImageLibrary().scaleInt(600);
      let tableHeight = this.$outer.getImageLibrary().scaleInt(300);
      return new Dimension()._Dimension$int$int(tableWidth, tableHeight);
    }
  }, 'net.sf.freecol.client.gui.panel.StartGamePanel$1', []);
}

let $StartGamePanel$2: any = null;
/** An anonymous class (StartGamePanel.java:219). */
function StartGamePanel$2(): any {
  return $StartGamePanel$2 ??= $J.local(class extends AbstractAction {
    actionPerformed(ae: ActionEvent): void {
      this.$outer.cancel_.doClick$();
    }
  }, 'net.sf.freecol.client.gui.panel.StartGamePanel$2', []);
}

$J.define(StartGamePanel, 'net.sf.freecol.client.gui.panel.StartGamePanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.FreeColPanel', ctors: { 'net.sf.freecol.client.FreeColClient': '_StartGamePanel' }, meths: { 'requestFocus()': 'requestFocus$' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  AbstractAction = $J.load('javax.swing.AbstractAction');
  JCheckBox = $J.load('javax.swing.JCheckBox');
  JScrollPane = $J.load('javax.swing.JScrollPane');
  JTextArea = $J.load('javax.swing.JTextArea');
  JTextField = $J.load('javax.swing.JTextField');
  ScrollPaneConstants = $J.load('javax.swing.ScrollPaneConstants');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  FontLibrary = $J.load('net.sf.freecol.client.gui.FontLibrary');
  FreeColButton = $J.load('net.sf.freecol.client.gui.panel.FreeColButton');
  FreeColButton$ButtonStyle = $J.load('net.sf.freecol.client.gui.panel.FreeColButton$ButtonStyle');
  PlayersTable = $J.load('net.sf.freecol.client.gui.panel.PlayersTable');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Game$LogoutReason = $J.load('net.sf.freecol.common.model.Game$LogoutReason');
  NationOptions$NationState = $J.load('net.sf.freecol.common.model.NationOptions$NationState');
  GameOptions = $J.load('net.sf.freecol.common.option.GameOptions');
  MapGeneratorOptions = $J.load('net.sf.freecol.common.option.MapGeneratorOptions');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
