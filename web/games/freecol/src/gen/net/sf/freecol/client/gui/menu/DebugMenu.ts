// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/menu/DebugMenu.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger, StringBuilder } from '../../../../../../../jre/index.ts';
import { JMenu } from '../../../../../../javax/swing/JMenu.ts';

let InputEvent, KeyEvent, ButtonGroup, JCheckBoxMenuItem, KeyStroke, Utility, DebugUtils, FreeColDebugger, FreeColDebugger$DebugMode, Messages, Monarch$MonarchAction, StringTemplate, ResourceManager, Utils;

/**
 * The menu that appears in debug mode.
 */
export class DebugMenu extends JMenu {
  static logger: Logger = null;
  static readonly ERROR_MESSAGE: string = 'This is a long error message, indicating that some error has occurred. This is a long error message, indicating that some error has occurred. This is a long error message, indicating that some error has occurred.';
  freeColClient: FreeColClient = null;
  /**
   * Create the debug menu.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _DebugMenu(freeColClient: FreeColClient): this {
    this._JMenu$String(Messages.message$String('menuBar.debug'));
    this.freeColClient = freeColClient;
    this.buildDebugMenu();
    return this;
  }
  /**
   * Builds the debug menu.
   */
  buildDebugMenu(): void {
    let game = this.freeColClient.getGame();
    let gui = this.freeColClient.getGUI();
    let hasGameMap = this.freeColClient.getFreeColServer() != null && game != null && game.getMap() != null;
    let player = this.freeColClient.getMyPlayer();
    this.setOpaque(false);
    this.setMnemonic$int(KeyEvent.VK_D);
    this.add$JMenuItem(this);
    let reload = Utility.localizedMenuItem$String('menuBar.debug.reloadResources');
    reload.setOpaque(false);
    reload.addActionListener((event) => {
      this.freeColClient.getGUI().reloadResources();
    });
    this.add$JMenuItem(reload);
    this.addSeparator();
    let debugRendering = Utility.localizedCheckBoxMenuItem('menuBar.debug.rendering', FreeColDebugger.debugRendering());
    debugRendering.setOpaque(false);
    this.add$JMenuItem(debugRendering);
    debugRendering.addActionListener((ae) => {
      let val = (ae.getSource()).isSelected();
      FreeColDebugger.setDebugRendering(val);
    });
    debugRendering.setEnabled(true);
    let sc = Utility.localizedCheckBoxMenuItem('menuBar.debug.showCoordinates', FreeColDebugger.debugDisplayCoordinates());
    sc.setOpaque(false);
    sc.setMnemonic$int(KeyEvent.VK_S);
    this.add$JMenuItem(sc);
    sc.addActionListener((ae) => {
      let val = (ae.getSource()).isSelected();
      FreeColDebugger.setDebugDisplayCoordinates(val);
      gui.refresh();
    });
    sc.setEnabled(true);
    if (hasGameMap) {
      this.addGameMapOptions(game, gui, player);
    }
    let showResourceKeys = Utility.localizedMenuItem$String('menuBar.debug.showResourceKeys');
    showResourceKeys.setOpaque(false);
    this.add$JMenuItem(showResourceKeys);
    showResourceKeys.addActionListener((ae) => {
      let sb = new StringBuilder(256);
      ResourceManager.summarizeImageResources(sb);
      gui.showInformationPanel$String(sb.toString());
    });
    showResourceKeys.setEnabled(true);
    let statistics = Utility.localizedMenuItem$String('statistics');
    statistics.setOpaque(false);
    this.add$JMenuItem(statistics);
    statistics.addActionListener((ae) => {
      DebugUtils.statistics(this.freeColClient);
    });
    statistics.setEnabled(this.freeColClient.getFreeColServer() != null);
    let gc = Utility.localizedMenuItem$String('menuBar.debug.memoryManager.gc');
    gc.setOpaque(false);
    this.add$JMenuItem(gc);
    gc.addActionListener((ae) => {
      Utils.garbageCollect();
    });
    gc.setEnabled(true);
    let debugBase = Messages.message$String('menuBar.debug');
    for (let dm of FreeColDebugger$DebugMode.values()) {
      if (dm === FreeColDebugger$DebugMode.MENUS) {
        continue;
      }
      let name = debugBase + String.fromCharCode(32 /* ' ' */) + dm.toString();
      let cb = new JCheckBoxMenuItem()._JCheckBoxMenuItem$String$boolean(name, FreeColDebugger.isInDebugMode$DebugMode(dm));
      cb.addChangeListener((ev) => {
        let src = ev.getSource();
        FreeColDebugger.setDebugMode(dm, src.isSelected());
        if (dm === FreeColDebugger$DebugMode.COMMS) {
          DebugUtils.setCommsLogging(this.freeColClient, src.isSelected());
        }
        gui.refresh();
      });
      cb.setOpaque(false);
      cb.setEnabled(true);
      this.add$JMenuItem(cb);
    }
    this.addSeparator();
  }
  addGameMapOptions(game: Game, gui: GUI, player: Player): void {
    let reveal = Utility.localizedCheckBoxMenuItem('menuBar.debug.revealEntireMap', false);
    reveal.setOpaque(false);
    reveal.setMnemonic$int(KeyEvent.VK_R);
    this.add$JMenuItem(reveal);
    reveal.addActionListener((ae) => {
      DebugUtils.revealMap(this.freeColClient, true);
      reveal.setEnabled(false);
    });
    let hide = Utility.localizedCheckBoxMenuItem('menuBar.debug.hideEntireMap', false);
    hide.setOpaque(false);
    this.add$JMenuItem(hide);
    hide.addActionListener((ae) => {
      DebugUtils.revealMap(this.freeColClient, false);
      hide.setEnabled(false);
    });
    let searchTrace = Utility.localizedCheckBoxMenuItem('menuBar.debug.searchTrace', game.getMap().getSearchTrace());
    searchTrace.setOpaque(false);
    this.add$JMenuItem(searchTrace);
    searchTrace.addActionListener((ae) => {
      let val = (ae.getSource()).isSelected();
      game.getMap().setSearchTrace(val);
    });
    let cvpMenu = Utility.localizedMenu$String('menuBar.debug.showColonyValue');
    cvpMenu.setOpaque(false);
    let bg = new ButtonGroup()._ButtonGroup();
    let cv1 = Utility.localizedRadioButtonMenuItem(StringTemplate.template$String('none'), FreeColDebugger.debugDisplayColonyValuePlayer() == null);
    cv1.setOpaque(false);
    cv1.setMnemonic$int(KeyEvent.VK_C);
    cvpMenu.add$JMenuItem(cv1);
    bg.add(cv1);
    cv1.addActionListener((ae) => {
      FreeColDebugger.setDebugDisplayColonyValuePlayer(null);
      gui.refresh();
    });
    this.add$JMenuItem(cvpMenu);
    cvpMenu.addSeparator();
    for (const $it0 = game.getLiveEuropeanPlayerList([]).iterator(); $it0.hasNext(); ) {
      let p = $it0.next();
      let cv2 = Utility.localizedRadioButtonMenuItem(p.getCountryLabel(), FreeColDebugger.debugDisplayColonyValuePlayer() === p);
      cv2.setOpaque(false);
      cvpMenu.add$JMenuItem(cv2);
      bg.add(cv2);
      let fp = p;
      cv2.addActionListener((ae) => {
        FreeColDebugger.setDebugDisplayColonyValuePlayer(fp);
        gui.refresh();
      });
    }
    this.addSeparator();
    let skipTurns = Utility.localizedMenuItem$String('menuBar.debug.skipTurns');
    skipTurns.setOpaque(false);
    skipTurns.setMnemonic$int(KeyEvent.VK_T);
    this.add$JMenuItem(skipTurns);
    skipTurns.addActionListener((ae) => {
      DebugUtils.skipTurns(this.freeColClient);
    });
    DebugUtils.addSkipChangeListener(this.freeColClient, this, skipTurns);
    let addBuilding = Utility.localizedMenuItem$String('menuBar.debug.addBuilding');
    addBuilding.setOpaque(false);
    addBuilding.setMnemonic$int(KeyEvent.VK_B);
    this.add$JMenuItem(addBuilding);
    addBuilding.addActionListener((ae) => {
      DebugUtils.addBuildings(this.freeColClient, addBuilding.getText());
    });
    let addFather = Utility.localizedMenuItem$String('menuBar.debug.addFoundingFather');
    addFather.setOpaque(false);
    addFather.setMnemonic$int(KeyEvent.VK_F);
    this.add$JMenuItem(addFather);
    addFather.addActionListener((ae) => {
      DebugUtils.addFathers(this.freeColClient, addFather.getText());
    });
    let runMonarch = Utility.localizedMenuItem$String('menuBar.debug.runMonarch');
    runMonarch.setOpaque(false);
    runMonarch.setMnemonic$int(KeyEvent.VK_M);
    this.add$JMenuItem(runMonarch);
    runMonarch.addActionListener((ae) => {
      DebugUtils.setMonarchAction(this.freeColClient, runMonarch.getText());
    });
    let addGold = Utility.localizedMenuItem$String('menuBar.debug.addGold');
    addGold.setOpaque(false);
    addGold.setMnemonic$int(KeyEvent.VK_G);
    this.add$JMenuItem(addGold);
    addGold.addActionListener((ae) => {
      DebugUtils.addGold(this.freeColClient);
    });
    let addCrosses = Utility.localizedMenuItem$String('menuBar.debug.addImmigration');
    addCrosses.setOpaque(false);
    addCrosses.setMnemonic$int(KeyEvent.VK_I);
    this.add$JMenuItem(addCrosses);
    addCrosses.addActionListener((ae) => {
      DebugUtils.addImmigration(this.freeColClient);
    });
    let giveBells = Utility.localizedMenuItem$String('menuBar.debug.addLiberty');
    giveBells.setOpaque(false);
    giveBells.setMnemonic$int(KeyEvent.VK_L);
    this.add$JMenuItem(giveBells);
    giveBells.addActionListener((ae) => {
      DebugUtils.addLiberty(this.freeColClient);
    });
    let rng = Utility.localizedMenuItem$String('menuBar.debug.stepRandomNumberGenerator');
    rng.setOpaque(false);
    rng.setMnemonic$int(KeyEvent.VK_X);
    this.add$JMenuItem(rng);
    rng.addActionListener((ae) => {
      DebugUtils.stepRNG(this.freeColClient);
    });
    let du = Utility.localizedMenuItem$String('menuBar.debug.displayUnits');
    du.setOpaque(false);
    this.add$JMenuItem(du);
    du.addActionListener((ae) => {
      DebugUtils.displayUnits(this.freeColClient);
    });
    du.setEnabled(true);
    this.addSeparator();
    let panelMenu = Utility.localizedMenu$String('menuBar.debug.displayPanels');
    panelMenu.setOpaque(false);
    let monarchDialog = Utility.localizedMenuItem$String('menuBar.debug.displayMonarchPanel');
    monarchDialog.addActionListener((ae) => {
      gui.showMonarchDialog(Monarch$MonarchAction.RAISE_TAX_WAR, null, player.getNationId(), (b) => this.freeColClient.getInGameController().monarchAction(Monarch$MonarchAction.RAISE_TAX_WAR, b));
    });
    panelMenu.add$JMenuItem(monarchDialog);
    let errorMessage = Utility.localizedMenuItem$String('menuBar.debug.displayErrorMessage');
    errorMessage.addActionListener((ae) => {
      gui.showErrorPanel$StringTemplate(StringTemplate.name_(DebugMenu.ERROR_MESSAGE));
    });
    panelMenu.add$JMenuItem(errorMessage);
    this.add$JMenuItem(panelMenu);
    let europeStatus = Utility.localizedMenuItem$String('menuBar.debug.displayEuropeStatus');
    europeStatus.setOpaque(false);
    europeStatus.setMnemonic$int(KeyEvent.VK_E);
    this.add$JMenuItem(europeStatus);
    europeStatus.addActionListener((ae) => {
      DebugUtils.displayEurope(this.freeColClient);
    });
    let dam = Utility.localizedCheckBoxMenuItem('menuBar.debug.displayAIMissions', FreeColDebugger.debugShowMission());
    let dami = Utility.localizedCheckBoxMenuItem('menuBar.debug.displayAdditionalAIMissionInfo', FreeColDebugger.debugShowMissionInfo());
    dam.setOpaque(false);
    dam.setMnemonic$int(KeyEvent.VK_A);
    this.add$JMenuItem(dam);
    dam.addActionListener((ae) => {
      let val = (ae.getSource()).isSelected();
      FreeColDebugger.setDebugShowMission(val);
      dami.setEnabled(val);
      gui.refresh();
    });
    dam.setEnabled(true);
    dami.setOpaque(false);
    dami.setMnemonic$int(KeyEvent.VK_I);
    this.add$JMenuItem(dami);
    dami.addActionListener((ae) => {
      let val = (ae.getSource()).isSelected();
      FreeColDebugger.setDebugShowMissionInfo(val);
      dami.setEnabled(val);
      gui.refresh();
    });
    dami.setEnabled(FreeColDebugger.debugShowMissionInfo());
    let aiDefenceMapMenu = Utility.localizedMenu$String('menuBar.debug.showDefenceMap');
    aiDefenceMapMenu.setOpaque(false);
    let aiDefenceMapMenuBg = new ButtonGroup()._ButtonGroup();
    let aiDefenceMapMenuCv1 = Utility.localizedRadioButtonMenuItem(StringTemplate.template$String('none'), FreeColDebugger.debugDisplayColonyValuePlayer() == null);
    aiDefenceMapMenuCv1.setOpaque(false);
    aiDefenceMapMenu.add$JMenuItem(aiDefenceMapMenuCv1);
    aiDefenceMapMenuBg.add(aiDefenceMapMenuCv1);
    aiDefenceMapMenuCv1.addActionListener((ae) => {
      FreeColDebugger.setDebugShowDefenceMapForPlayer(null);
      gui.refresh();
    });
    this.add$JMenuItem(aiDefenceMapMenu);
    aiDefenceMapMenu.addSeparator();
    for (const $it1 = game.getLiveEuropeanPlayerList([]).iterator(); $it1.hasNext(); ) {
      let p = $it1.next();
      if (!p.isAI()) {
        continue;
      }
      let cv2 = Utility.localizedRadioButtonMenuItem(p.getCountryLabel(), FreeColDebugger.debugShowDefenceMapForPlayer() === p);
      cv2.setOpaque(false);
      aiDefenceMapMenu.add$JMenuItem(cv2);
      aiDefenceMapMenuBg.add(cv2);
      let fp = p;
      cv2.addActionListener((ae) => {
        FreeColDebugger.setDebugShowDefenceMapForPlayer(fp);
        gui.refresh();
      });
    }
    this.addSeparator();
    let compareMaps = Utility.localizedMenuItem$String('menuBar.debug.compareMaps');
    compareMaps.setOpaque(false);
    compareMaps.setAccelerator(KeyStroke.getKeyStroke$int$int(67 /* 'C' */, InputEvent.CTRL_DOWN_MASK | InputEvent.ALT_DOWN_MASK));
    this.add$JMenuItem(compareMaps);
    compareMaps.addActionListener((ae) => {
      DebugUtils.checkDesyncAction(this.freeColClient);
    });
  }
  static $clinit() {
    DebugMenu.logger = Logger.getLogger($J.cls(DebugMenu).getName());
  }
}

$J.define(DebugMenu, 'net.sf.freecol.client.gui.menu.DebugMenu', { kind: 'class', sup: 'javax.swing.JMenu', ctors: { 'net.sf.freecol.client.FreeColClient': '_DebugMenu' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  InputEvent = $J.load('java.awt.event.InputEvent');
  KeyEvent = $J.load('java.awt.event.KeyEvent');
  ButtonGroup = $J.load('javax.swing.ButtonGroup');
  JCheckBoxMenuItem = $J.load('javax.swing.JCheckBoxMenuItem');
  KeyStroke = $J.load('javax.swing.KeyStroke');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  DebugUtils = $J.load('net.sf.freecol.common.debug.DebugUtils');
  FreeColDebugger = $J.load('net.sf.freecol.common.debug.FreeColDebugger');
  FreeColDebugger$DebugMode = $J.load('net.sf.freecol.common.debug.FreeColDebugger$DebugMode');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Monarch$MonarchAction = $J.load('net.sf.freecol.common.model.Monarch$MonarchAction');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  ResourceManager = $J.load('net.sf.freecol.common.resources.ResourceManager');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
});
