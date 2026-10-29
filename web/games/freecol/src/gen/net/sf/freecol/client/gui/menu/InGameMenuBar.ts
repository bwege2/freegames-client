// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/menu/InGameMenuBar.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { FreeColMenuBar } from './FreeColMenuBar.ts';

let RenderingHints, KeyEvent, ButtonGroup, FontLibrary, AssignTradeRouteAction, AttackRangedAction, BuildColonyAction, CenterAction, ChangeAction, ChangeWindowedModeAction, ChatAction, ClearOrdersAction, DeclareIndependenceAction, DisbandUnitAction, DisplayBordersAction, DisplayFogOfWarAction, DisplayGridAction, DisplayTileTextAction, DisplayTileTextAction$DisplayText, EndTurnAction, EuropeAction, ExecuteGotoOrdersAction, FindSettlementAction, FortifyAction, GotoAction, GotoTileAction, LoadAction, MapControlsAction, NewAction, OpenAction, PreferencesAction, QuitAction, ReconnectAction, RenameAction, ReportCargoAction, ReportColonyAction, ReportContinentalCongressAction, ReportEducationAction, ReportExplorationAction, ReportForeignAction, ReportHighScoresAction, ReportHistoryAction, ReportIndianAction, ReportLabourAction, ReportMilitaryAction, ReportNavalAction, ReportProductionAction, ReportReligionAction, ReportRequirementsAction, ReportTradeAction, ReportTurnAction, RetireAction, SaveAction, SaveAndQuitAction, SentryAction, ShowDifficultyAction, ShowGameOptionsAction, ShowMainAction, ShowMapGeneratorOptionsAction, SkipUnitAction, TilePopupAction, ToggleViewModeAction, TradeRouteAction, UnloadAction, WaitAction, ZoomInAction, ZoomOutAction, DebugMenu, Utility, FreeColDebugger, FreeColDebugger$DebugMode, Messages, Ability, StringTemplate;

/**
 * This is the menu bar used in-game.
 *
 * That is, the menu bar that is displayed on the top left corner of the
 * {@code Canvas}.
 *
 * @see MapEditorMenuBar
 */
export class InGameMenuBar extends FreeColMenuBar {
  static logger: Logger = null;
  /**
   * Creates a new {@code FreeColMenuBar}. This menu bar will include
   * all of the submenus and items.
   *
   * @param freeColClient The main controller.
   * @param listener An optional mouse motion listener.
   */
  _InGameMenuBar(freeColClient: FreeColClient, listener: MouseMotionListener): this {
    this._FreeColMenuBar(freeColClient, listener);
    this.reset();
    return this;
  }
  /**
   * Resets this menu bar.
   */
  reset(): void {
    this.removeAll();
    this.buildGameMenu();
    this.buildViewMenu();
    this.buildOrdersMenu();
    this.buildReportMenu();
    this.buildColopediaMenu();
    if (FreeColDebugger.isInDebugMode$DebugMode(FreeColDebugger$DebugMode.MENUS)) {
      this.add$JMenu(new DebugMenu()._DebugMenu(this.freeColClient));
    }
    this.update$();
  }
  buildGameMenu(): void {
    let menu = Utility.localizedMenu$String('menuBar.game');
    menu.setOpaque(false);
    menu.setMnemonic$int(KeyEvent.VK_G);
    menu.add$JMenuItem(this.getMenuItem$String(NewAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(OpenAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(SaveAction.id));
    menu.addSeparator();
    menu.add$JMenuItem(this.getMenuItem$String(PreferencesAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(ReconnectAction.id));
    menu.addSeparator();
    menu.add$JMenuItem(this.getMenuItem$String(ChatAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(DeclareIndependenceAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(EndTurnAction.id));
    menu.addSeparator();
    menu.add$JMenuItem(this.getMenuItem$String(ShowMainAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(ReportHighScoresAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(RetireAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(SaveAndQuitAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(QuitAction.id));
    this.add$JMenu(menu);
  }
  buildViewMenu(): void {
    let menu = Utility.localizedMenu$String('menuBar.view');
    menu.setOpaque(false);
    menu.setMnemonic$int(KeyEvent.VK_V);
    menu.add$JMenuItem(this.getCheckBoxMenuItem(MapControlsAction.id));
    menu.add$JMenuItem(this.getCheckBoxMenuItem(DisplayGridAction.id));
    menu.add$JMenuItem(this.getCheckBoxMenuItem(DisplayBordersAction.id));
    menu.add$JMenuItem(this.getCheckBoxMenuItem(DisplayFogOfWarAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(ToggleViewModeAction.id));
    menu.add$JMenuItem(this.getCheckBoxMenuItem(ChangeWindowedModeAction.id));
    menu.addSeparator();
    let group = new ButtonGroup()._ButtonGroup();
    for (let type$ of DisplayTileTextAction$DisplayText.values()) {
      menu.add$JMenuItem(this.getRadioButtonMenuItem(DisplayTileTextAction.id + type$.getKey(), group));
    }
    menu.addSeparator();
    menu.add$JMenuItem(this.getMenuItem$String(ZoomInAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(ZoomOutAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(CenterAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(TilePopupAction.id));
    menu.addSeparator();
    menu.add$JMenuItem(this.getMenuItem$String(EuropeAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(TradeRouteAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(FindSettlementAction.id));
    this.add$JMenu(menu);
  }
  buildOrdersMenu(): void {
    let spec = this.freeColClient.getGame().getSpecification();
    let menu = Utility.localizedMenu$String('menuBar.orders');
    menu.setOpaque(false);
    menu.setMnemonic$int(KeyEvent.VK_O);
    if (spec.hasAbility(Ability.HITPOINTS_COMBAT_MODEL)) {
      menu.add$JMenuItem(this.getMenuItem$String(AttackRangedAction.id));
    }
    menu.add$JMenuItem(this.getMenuItem$String(SentryAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(FortifyAction.id));
    menu.addSeparator();
    menu.add$JMenuItem(this.getMenuItem$String(GotoAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(GotoTileAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(ExecuteGotoOrdersAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(AssignTradeRouteAction.id));
    menu.addSeparator();
    menu.add$JMenuItem(this.getMenuItem$String(BuildColonyAction.id));
    for (const $it0 = spec.getTileImprovementTypeList().iterator(); $it0.hasNext(); ) {
      let type$ = $it0.next();
      if (!type$.isNatural()) {
        menu.add$JMenuItem(this.getMenuItem$String(type$.getSuffix$() + 'Action'));
      }
    }
    menu.addSeparator();
    menu.add$JMenuItem(this.getMenuItem$String(LoadAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(UnloadAction.id));
    menu.addSeparator();
    menu.add$JMenuItem(this.getMenuItem$String(WaitAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(SkipUnitAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(ChangeAction.id));
    menu.addSeparator();
    menu.add$JMenuItem(this.getMenuItem$String(ClearOrdersAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(RenameAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(DisbandUnitAction.id));
    this.add$JMenu(menu);
  }
  buildReportMenu(): void {
    let menu = Utility.localizedMenu$String('menuBar.report');
    menu.setOpaque(false);
    menu.setMnemonic$int(KeyEvent.VK_R);
    menu.add$JMenuItem(this.getMenuItem$String(ReportReligionAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(ReportLabourAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(ReportColonyAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(ReportForeignAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(ReportIndianAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(ReportContinentalCongressAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(ReportMilitaryAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(ReportNavalAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(ReportTradeAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(ReportTurnAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(ReportRequirementsAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(ReportCargoAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(ReportExplorationAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(ReportHistoryAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(ReportProductionAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(ReportEducationAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(ShowDifficultyAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(ShowGameOptionsAction.id));
    menu.add$JMenuItem(this.getMenuItem$String(ShowMapGeneratorOptionsAction.id));
    this.add$JMenu(menu);
  }
  /**
   * {@inheritDoc}
   */
  paintComponent(g: Graphics): void {
    super.paintComponent(g);
    if (this.freeColClient == null) {
      return;
    }
    let player = this.freeColClient.getMyPlayer();
    if (player == null) {
      return;
    }
    let text = JString.replace(Messages.message$StringTemplate(StringTemplate.template$String('menuBar.statusLine').addAmount('%gold%', player.getGold()).addAmount('%tax%', player.getTax()).addAmount('%score%', player.getScore()).addStringTemplate$String$StringTemplate('%year%', this.freeColClient.getGame().getTurn().getLabel())), '|', '✧');
    let g2d = g;
    g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
    g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
    let font = FontLibrary.getMainFont();
    g2d.setFont(font);
    let fm = g2d.getFontMetrics$();
    let d = fm.getStringBounds$String$Graphics(text, g2d);
    let textWidth = $J.d2i(d.getWidth());
    let textHeight = $J.d2i(d.getHeight());
    let rightSidePaddingInPx = 10;
    let centerHeight = (this.getHeight() - this.getInsets$().bottom) | 0;
    let x = (this.getWidth() - rightSidePaddingInPx - textWidth - this.getInsets$().right) | 0;
    let y = ($J.idiv(((centerHeight - textHeight) | 0), 2) + fm.getAscent()) | 0;
    Utility.drawGoldenText(text, g2d, font, x, y);
  }
  static $clinit() {
    InGameMenuBar.logger = Logger.getLogger($J.cls(InGameMenuBar).getName());
  }
}

$J.define(InGameMenuBar, 'net.sf.freecol.client.gui.menu.InGameMenuBar', { kind: 'class', sup: 'net.sf.freecol.client.gui.menu.FreeColMenuBar', ctors: { 'net.sf.freecol.client.FreeColClient,java.awt.event.MouseMotionListener': '_InGameMenuBar' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  RenderingHints = $J.load('java.awt.RenderingHints');
  KeyEvent = $J.load('java.awt.event.KeyEvent');
  ButtonGroup = $J.load('javax.swing.ButtonGroup');
  FontLibrary = $J.load('net.sf.freecol.client.gui.FontLibrary');
  AssignTradeRouteAction = $J.load('net.sf.freecol.client.gui.action.AssignTradeRouteAction');
  AttackRangedAction = $J.load('net.sf.freecol.client.gui.action.AttackRangedAction');
  BuildColonyAction = $J.load('net.sf.freecol.client.gui.action.BuildColonyAction');
  CenterAction = $J.load('net.sf.freecol.client.gui.action.CenterAction');
  ChangeAction = $J.load('net.sf.freecol.client.gui.action.ChangeAction');
  ChangeWindowedModeAction = $J.load('net.sf.freecol.client.gui.action.ChangeWindowedModeAction');
  ChatAction = $J.load('net.sf.freecol.client.gui.action.ChatAction');
  ClearOrdersAction = $J.load('net.sf.freecol.client.gui.action.ClearOrdersAction');
  DeclareIndependenceAction = $J.load('net.sf.freecol.client.gui.action.DeclareIndependenceAction');
  DisbandUnitAction = $J.load('net.sf.freecol.client.gui.action.DisbandUnitAction');
  DisplayBordersAction = $J.load('net.sf.freecol.client.gui.action.DisplayBordersAction');
  DisplayFogOfWarAction = $J.load('net.sf.freecol.client.gui.action.DisplayFogOfWarAction');
  DisplayGridAction = $J.load('net.sf.freecol.client.gui.action.DisplayGridAction');
  DisplayTileTextAction = $J.load('net.sf.freecol.client.gui.action.DisplayTileTextAction');
  DisplayTileTextAction$DisplayText = $J.load('net.sf.freecol.client.gui.action.DisplayTileTextAction$DisplayText');
  EndTurnAction = $J.load('net.sf.freecol.client.gui.action.EndTurnAction');
  EuropeAction = $J.load('net.sf.freecol.client.gui.action.EuropeAction');
  ExecuteGotoOrdersAction = $J.load('net.sf.freecol.client.gui.action.ExecuteGotoOrdersAction');
  FindSettlementAction = $J.load('net.sf.freecol.client.gui.action.FindSettlementAction');
  FortifyAction = $J.load('net.sf.freecol.client.gui.action.FortifyAction');
  GotoAction = $J.load('net.sf.freecol.client.gui.action.GotoAction');
  GotoTileAction = $J.load('net.sf.freecol.client.gui.action.GotoTileAction');
  LoadAction = $J.load('net.sf.freecol.client.gui.action.LoadAction');
  MapControlsAction = $J.load('net.sf.freecol.client.gui.action.MapControlsAction');
  NewAction = $J.load('net.sf.freecol.client.gui.action.NewAction');
  OpenAction = $J.load('net.sf.freecol.client.gui.action.OpenAction');
  PreferencesAction = $J.load('net.sf.freecol.client.gui.action.PreferencesAction');
  QuitAction = $J.load('net.sf.freecol.client.gui.action.QuitAction');
  ReconnectAction = $J.load('net.sf.freecol.client.gui.action.ReconnectAction');
  RenameAction = $J.load('net.sf.freecol.client.gui.action.RenameAction');
  ReportCargoAction = $J.load('net.sf.freecol.client.gui.action.ReportCargoAction');
  ReportColonyAction = $J.load('net.sf.freecol.client.gui.action.ReportColonyAction');
  ReportContinentalCongressAction = $J.load('net.sf.freecol.client.gui.action.ReportContinentalCongressAction');
  ReportEducationAction = $J.load('net.sf.freecol.client.gui.action.ReportEducationAction');
  ReportExplorationAction = $J.load('net.sf.freecol.client.gui.action.ReportExplorationAction');
  ReportForeignAction = $J.load('net.sf.freecol.client.gui.action.ReportForeignAction');
  ReportHighScoresAction = $J.load('net.sf.freecol.client.gui.action.ReportHighScoresAction');
  ReportHistoryAction = $J.load('net.sf.freecol.client.gui.action.ReportHistoryAction');
  ReportIndianAction = $J.load('net.sf.freecol.client.gui.action.ReportIndianAction');
  ReportLabourAction = $J.load('net.sf.freecol.client.gui.action.ReportLabourAction');
  ReportMilitaryAction = $J.load('net.sf.freecol.client.gui.action.ReportMilitaryAction');
  ReportNavalAction = $J.load('net.sf.freecol.client.gui.action.ReportNavalAction');
  ReportProductionAction = $J.load('net.sf.freecol.client.gui.action.ReportProductionAction');
  ReportReligionAction = $J.load('net.sf.freecol.client.gui.action.ReportReligionAction');
  ReportRequirementsAction = $J.load('net.sf.freecol.client.gui.action.ReportRequirementsAction');
  ReportTradeAction = $J.load('net.sf.freecol.client.gui.action.ReportTradeAction');
  ReportTurnAction = $J.load('net.sf.freecol.client.gui.action.ReportTurnAction');
  RetireAction = $J.load('net.sf.freecol.client.gui.action.RetireAction');
  SaveAction = $J.load('net.sf.freecol.client.gui.action.SaveAction');
  SaveAndQuitAction = $J.load('net.sf.freecol.client.gui.action.SaveAndQuitAction');
  SentryAction = $J.load('net.sf.freecol.client.gui.action.SentryAction');
  ShowDifficultyAction = $J.load('net.sf.freecol.client.gui.action.ShowDifficultyAction');
  ShowGameOptionsAction = $J.load('net.sf.freecol.client.gui.action.ShowGameOptionsAction');
  ShowMainAction = $J.load('net.sf.freecol.client.gui.action.ShowMainAction');
  ShowMapGeneratorOptionsAction = $J.load('net.sf.freecol.client.gui.action.ShowMapGeneratorOptionsAction');
  SkipUnitAction = $J.load('net.sf.freecol.client.gui.action.SkipUnitAction');
  TilePopupAction = $J.load('net.sf.freecol.client.gui.action.TilePopupAction');
  ToggleViewModeAction = $J.load('net.sf.freecol.client.gui.action.ToggleViewModeAction');
  TradeRouteAction = $J.load('net.sf.freecol.client.gui.action.TradeRouteAction');
  UnloadAction = $J.load('net.sf.freecol.client.gui.action.UnloadAction');
  WaitAction = $J.load('net.sf.freecol.client.gui.action.WaitAction');
  ZoomInAction = $J.load('net.sf.freecol.client.gui.action.ZoomInAction');
  ZoomOutAction = $J.load('net.sf.freecol.client.gui.action.ZoomOutAction');
  DebugMenu = $J.load('net.sf.freecol.client.gui.menu.DebugMenu');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  FreeColDebugger = $J.load('net.sf.freecol.common.debug.FreeColDebugger');
  FreeColDebugger$DebugMode = $J.load('net.sf.freecol.common.debug.FreeColDebugger$DebugMode');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
});
