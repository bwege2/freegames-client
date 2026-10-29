// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/action/ActionManager.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Logger } from '../../../../../../../jre/index.ts';
import { OptionGroup } from '../../../common/option/OptionGroup.ts';

let AboutAction, AssignTradeRouteAction, AttackRangedAction, BuildColonyAction, CenterAction, ChangeAction, ChangeWindowedModeAction, ChatAction, ClearOrdersAction, ColopediaAction, ColopediaAction$PanelType, ContinueAction, DebugAction, DeclareIndependenceAction, DetermineHighSeasAction, DisbandUnitAction, DisplayBordersAction, DisplayFogOfWarAction, DisplayGridAction, DisplayTileTextAction, DisplayTileTextAction$DisplayText, EndTurnAction, EuropeAction, ExecuteGotoOrdersAction, FindSettlementAction, FortifyAction, FreeColAction, GotoAction, GotoTileAction, ImprovementAction, LoadAction, MapControlsAction, MapEditorAction, MapEditorToolboxPanelAction, MapEditorTransformPanelAction, MiniMapToggleFogOfWarAction, MiniMapToggleViewAction, MiniMapZoomInAction, MiniMapZoomOutAction, MoveAction, NewAction, NewEmptyMapAction, OpenAction, PreferencesAction, QuitAction, ReconnectAction, RenameAction, ReportCargoAction, ReportColonyAction, ReportContinentalCongressAction, ReportEducationAction, ReportExplorationAction, ReportForeignAction, ReportHighScoresAction, ReportHistoryAction, ReportIndianAction, ReportLabourAction, ReportMilitaryAction, ReportNavalAction, ReportProductionAction, ReportReligionAction, ReportRequirementsAction, ReportTradeAction, ReportTurnAction, RetireAction, SaveAction, SaveAndQuitAction, ScaleMapAction, SentryAction, ShowDifficultyAction, ShowGameOptionsAction, ShowMainAction, ShowMapGeneratorOptionsAction, SkipUnitAction, StartMapAction, TilePopupAction, ToggleViewModeAction, TradeRouteAction, UnloadAction, WaitAction, ZoomInAction, ZoomOutAction, UnitButton, Ability, Direction;

/**
 * Stores all {@code FreeColActions} and retrieves them by identifier.
 */
export class ActionManager extends OptionGroup {
  static logger: Logger = null;
  freeColClient: FreeColClient = null;
  /**
   * Creates a new {@code ActionManager}.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _ActionManager(freeColClient: FreeColClient): this {
    this._OptionGroup$String('actionManager');
    this.freeColClient = freeColClient;
    return this;
  }
  /**
   * This method adds all FreeColActions to the OptionGroup. If you
   * implement a new {@code FreeColAction}, then you need to
   * add it in this method.  Localization and a possible accelerator
   * need to be added to the strings file.
   *
   * @param inGameController The client {@code InGameController}.
   * @param connectController The client {@code ConnectController}.
   */
  initializeActions(inGameController: InGameController, connectController: ConnectController): void {
    this.add(new AboutAction()._AboutAction(this.freeColClient));
    this.add(new AssignTradeRouteAction()._AssignTradeRouteAction(this.freeColClient));
    this.add(new BuildColonyAction()._BuildColonyAction(this.freeColClient));
    this.add(new CenterAction()._CenterAction(this.freeColClient));
    this.add(new ChangeAction()._ChangeAction(this.freeColClient));
    this.add(new ChangeWindowedModeAction()._ChangeWindowedModeAction(this.freeColClient));
    this.add(new ChatAction()._ChatAction(this.freeColClient));
    this.add(new ClearOrdersAction()._ClearOrdersAction(this.freeColClient));
    for (let panelType of ColopediaAction$PanelType.values()) {
      this.add(new ColopediaAction()._ColopediaAction(this.freeColClient, panelType));
    }
    this.add(new ContinueAction()._ContinueAction(this.freeColClient));
    this.add(new DebugAction()._DebugAction(this.freeColClient));
    this.add(new DeclareIndependenceAction()._DeclareIndependenceAction(this.freeColClient));
    this.add(new DetermineHighSeasAction()._DetermineHighSeasAction(this.freeColClient));
    this.add(new DisbandUnitAction()._DisbandUnitAction(this.freeColClient));
    this.add(new DisplayBordersAction()._DisplayBordersAction(this.freeColClient));
    this.add(new DisplayGridAction()._DisplayGridAction(this.freeColClient));
    this.add(new DisplayFogOfWarAction()._DisplayFogOfWarAction(this.freeColClient));
    for (let type$ of DisplayTileTextAction$DisplayText.values()) {
      this.add(new DisplayTileTextAction()._DisplayTileTextAction(this.freeColClient, type$));
    }
    this.add(new EndTurnAction()._EndTurnAction(this.freeColClient));
    this.add(new EuropeAction()._EuropeAction(this.freeColClient));
    this.add(new ExecuteGotoOrdersAction()._ExecuteGotoOrdersAction(this.freeColClient));
    this.add(new FindSettlementAction()._FindSettlementAction(this.freeColClient));
    this.add(new FortifyAction()._FortifyAction(this.freeColClient));
    this.add(new GotoAction()._GotoAction(this.freeColClient));
    this.add(new GotoTileAction()._GotoTileAction(this.freeColClient));
    this.add(new LoadAction()._LoadAction(this.freeColClient));
    this.add(new MapControlsAction()._MapControlsAction(this.freeColClient));
    this.add(new MapEditorAction()._MapEditorAction(this.freeColClient));
    this.add(new MapEditorToolboxPanelAction()._MapEditorToolboxPanelAction(this.freeColClient));
    this.add(new MapEditorTransformPanelAction()._MapEditorTransformPanelAction(this.freeColClient));
    this.add(new MiniMapToggleViewAction()._MiniMapToggleViewAction$FreeColClient(this.freeColClient));
    this.add(new MiniMapToggleViewAction()._MiniMapToggleViewAction$FreeColClient$boolean(this.freeColClient, true));
    this.add(new MiniMapToggleFogOfWarAction()._MiniMapToggleFogOfWarAction$FreeColClient(this.freeColClient));
    this.add(new MiniMapToggleFogOfWarAction()._MiniMapToggleFogOfWarAction$FreeColClient$boolean(this.freeColClient, true));
    this.add(new MiniMapZoomInAction()._MiniMapZoomInAction$FreeColClient(this.freeColClient));
    this.add(new MiniMapZoomInAction()._MiniMapZoomInAction$FreeColClient$boolean(this.freeColClient, true));
    this.add(new MiniMapZoomOutAction()._MiniMapZoomOutAction$FreeColClient(this.freeColClient));
    this.add(new MiniMapZoomOutAction()._MiniMapZoomOutAction$FreeColClient$boolean(this.freeColClient, true));
    for (let d of Direction.values()) {
      this.add(new MoveAction()._MoveAction$FreeColClient$Direction(this.freeColClient, d));
      this.add(new MoveAction()._MoveAction$FreeColClient$Direction$boolean(this.freeColClient, d, true));
    }
    this.add(new NewAction()._NewAction(this.freeColClient));
    this.add(new NewEmptyMapAction()._NewEmptyMapAction(this.freeColClient));
    this.add(new OpenAction()._OpenAction(this.freeColClient));
    this.add(new PreferencesAction()._PreferencesAction(this.freeColClient));
    this.add(new SaveAndQuitAction()._SaveAndQuitAction(this.freeColClient));
    this.add(new QuitAction()._QuitAction(this.freeColClient));
    this.add(new AttackRangedAction()._AttackRangedAction(this.freeColClient));
    this.add(new ReconnectAction()._ReconnectAction(this.freeColClient));
    this.add(new RenameAction()._RenameAction(this.freeColClient));
    this.add(new ReportCargoAction()._ReportCargoAction(this.freeColClient));
    this.add(new ReportContinentalCongressAction()._ReportContinentalCongressAction(this.freeColClient));
    this.add(new ReportColonyAction()._ReportColonyAction(this.freeColClient));
    this.add(new ReportEducationAction()._ReportEducationAction(this.freeColClient));
    this.add(new ReportExplorationAction()._ReportExplorationAction(this.freeColClient));
    this.add(new ReportForeignAction()._ReportForeignAction(this.freeColClient));
    this.add(new ReportHighScoresAction()._ReportHighScoresAction(this.freeColClient));
    this.add(new ReportHistoryAction()._ReportHistoryAction(this.freeColClient));
    this.add(new ReportIndianAction()._ReportIndianAction(this.freeColClient));
    this.add(new ReportLabourAction()._ReportLabourAction(this.freeColClient));
    this.add(new ReportMilitaryAction()._ReportMilitaryAction(this.freeColClient));
    this.add(new ReportNavalAction()._ReportNavalAction(this.freeColClient));
    this.add(new ReportProductionAction()._ReportProductionAction(this.freeColClient));
    this.add(new ReportReligionAction()._ReportReligionAction(this.freeColClient));
    this.add(new ReportRequirementsAction()._ReportRequirementsAction(this.freeColClient));
    this.add(new ReportTradeAction()._ReportTradeAction(this.freeColClient));
    this.add(new ReportTurnAction()._ReportTurnAction(this.freeColClient));
    this.add(new RetireAction()._RetireAction(this.freeColClient));
    this.add(new SaveAction()._SaveAction(this.freeColClient));
    this.add(new ScaleMapAction()._ScaleMapAction(this.freeColClient));
    this.add(new SentryAction()._SentryAction(this.freeColClient));
    this.add(new ShowDifficultyAction()._ShowDifficultyAction(this.freeColClient));
    this.add(new ShowGameOptionsAction()._ShowGameOptionsAction(this.freeColClient));
    this.add(new ShowMainAction()._ShowMainAction(this.freeColClient));
    this.add(new ShowMapGeneratorOptionsAction()._ShowMapGeneratorOptionsAction(this.freeColClient));
    this.add(new SkipUnitAction()._SkipUnitAction(this.freeColClient));
    this.add(new StartMapAction()._StartMapAction(this.freeColClient));
    this.add(new TilePopupAction()._TilePopupAction(this.freeColClient));
    this.add(new ToggleViewModeAction()._ToggleViewModeAction(this.freeColClient));
    this.add(new TradeRouteAction()._TradeRouteAction(this.freeColClient));
    this.add(new UnloadAction()._UnloadAction$FreeColClient(this.freeColClient));
    this.add(new WaitAction()._WaitAction(this.freeColClient));
    this.add(new ZoomInAction()._ZoomInAction(this.freeColClient));
    this.add(new ZoomOutAction()._ZoomOutAction(this.freeColClient));
  }
  /**
   * Adds the {@code FreeColActions} that are provided by the
   * {@code Specification}.  At the moment, this includes only
   * {@code TileImprovements}.
   *
   * @param spec The {@code Specification} to refer to.
   */
  addSpecificationActions(spec: Specification): void {
    for (const $it0 = new ArrayList(this.getOptions()).iterator(); $it0.hasNext(); ) {
      let o = $it0.next();
      if (o instanceof ImprovementAction) {
        this.remove(o.getId());
      }
    }
    for (const $it1 = spec.getTileImprovementTypeList().iterator(); $it1.hasNext(); ) {
      let type$ = $it1.next();
      if (!type$.isNatural()) {
        this.add(new ImprovementAction()._ImprovementAction(this.freeColClient, type$));
      }
    }
    this.update();
  }
  /**
   * Gets the {@code FreeColAction} specified by the given
   * identifier.
   *
   * @param id The object identifier.
   * @return The {@code FreeColAction} or null if not present.
   */
  getFreeColAction(id: string): FreeColAction {
    return (this.hasOption(id, $J.cls(FreeColAction))) ? this.getOption$String$Class(id, $J.cls(FreeColAction)) : null;
  }
  /**
   * Updates every {@code FreeColAction} this object keeps.
   *
   * @see FreeColAction
   */
  update(): void {
    for (const $it2 = this.getOptions().iterator(); $it2.hasNext(); ) {
      let o = $it2.next();
      (o).update();
    }
  }
  /**
   * Make the buttons needed by the map controls for the mini map.
   *
   * @return A list of {@code UnitButton}s.
   */
  makeMiniMapButtons(): List<UnitButton> {
    let ret = new ArrayList();
    ret.add(new UnitButton()._UnitButton(this, MiniMapToggleViewAction.id));
    ret.add(new UnitButton()._UnitButton(this, MiniMapToggleFogOfWarAction.id));
    ret.add(new UnitButton()._UnitButton(this, MiniMapZoomOutAction.id));
    ret.add(new UnitButton()._UnitButton(this, MiniMapZoomInAction.id));
    return ret;
  }
  /**
   * Make the buttons needed by the map controls for unit actions.
   *
   * @param spec The {@code Specification} to query.
   * @return A list of {@code UnitButton}s.
   */
  makeUnitActionButtons(spec: Specification): List<UnitButton> {
    let ret = new ArrayList();
    if (spec == null || spec.hasAbility(Ability.HITPOINTS_COMBAT_MODEL)) {
      ret.add(new UnitButton()._UnitButton(this, AttackRangedAction.id));
    }
    ret.add(new UnitButton()._UnitButton(this, WaitAction.id));
    ret.add(new UnitButton()._UnitButton(this, SkipUnitAction.id));
    ret.add(new UnitButton()._UnitButton(this, SentryAction.id));
    ret.add(new UnitButton()._UnitButton(this, FortifyAction.id));
    if (spec != null) {
      for (const $it3 = spec.getTileImprovementTypeList().iterator(); $it3.hasNext(); ) {
        let ti = $it3.next();
        let id = ti.getSuffix$() + 'Action';
        let a = this.getFreeColAction(id);
        if (a != null && a.hasOrderButtons() && !ti.isNatural()) {
          ret.add(new UnitButton()._UnitButton(this, id));
        }
      }
    }
    ret.add(new UnitButton()._UnitButton(this, BuildColonyAction.id));
    ret.add(new UnitButton()._UnitButton(this, DisbandUnitAction.id));
    return ret;
  }
  refreshResources(): void {
    for (const $it4 = this.getOptions().iterator(); $it4.hasNext(); ) {
      let option = $it4.next();
      if (option instanceof FreeColAction) {
        (option).updateRegisteredImageIcons();
      }
    }
  }
  static $clinit() {
    ActionManager.logger = Logger.getLogger($J.cls(ActionManager).getName());
  }
}

$J.define(ActionManager, 'net.sf.freecol.client.gui.action.ActionManager', { kind: 'class', sup: 'net.sf.freecol.common.option.OptionGroup', ctors: { 'net.sf.freecol.client.FreeColClient': '_ActionManager' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  AboutAction = $J.load('net.sf.freecol.client.gui.action.AboutAction');
  AssignTradeRouteAction = $J.load('net.sf.freecol.client.gui.action.AssignTradeRouteAction');
  AttackRangedAction = $J.load('net.sf.freecol.client.gui.action.AttackRangedAction');
  BuildColonyAction = $J.load('net.sf.freecol.client.gui.action.BuildColonyAction');
  CenterAction = $J.load('net.sf.freecol.client.gui.action.CenterAction');
  ChangeAction = $J.load('net.sf.freecol.client.gui.action.ChangeAction');
  ChangeWindowedModeAction = $J.load('net.sf.freecol.client.gui.action.ChangeWindowedModeAction');
  ChatAction = $J.load('net.sf.freecol.client.gui.action.ChatAction');
  ClearOrdersAction = $J.load('net.sf.freecol.client.gui.action.ClearOrdersAction');
  ColopediaAction = $J.load('net.sf.freecol.client.gui.action.ColopediaAction');
  ColopediaAction$PanelType = $J.load('net.sf.freecol.client.gui.action.ColopediaAction$PanelType');
  ContinueAction = $J.load('net.sf.freecol.client.gui.action.ContinueAction');
  DebugAction = $J.load('net.sf.freecol.client.gui.action.DebugAction');
  DeclareIndependenceAction = $J.load('net.sf.freecol.client.gui.action.DeclareIndependenceAction');
  DetermineHighSeasAction = $J.load('net.sf.freecol.client.gui.action.DetermineHighSeasAction');
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
  FreeColAction = $J.load('net.sf.freecol.client.gui.action.FreeColAction');
  GotoAction = $J.load('net.sf.freecol.client.gui.action.GotoAction');
  GotoTileAction = $J.load('net.sf.freecol.client.gui.action.GotoTileAction');
  ImprovementAction = $J.load('net.sf.freecol.client.gui.action.ImprovementAction');
  LoadAction = $J.load('net.sf.freecol.client.gui.action.LoadAction');
  MapControlsAction = $J.load('net.sf.freecol.client.gui.action.MapControlsAction');
  MapEditorAction = $J.load('net.sf.freecol.client.gui.action.MapEditorAction');
  MapEditorToolboxPanelAction = $J.load('net.sf.freecol.client.gui.action.MapEditorToolboxPanelAction');
  MapEditorTransformPanelAction = $J.load('net.sf.freecol.client.gui.action.MapEditorTransformPanelAction');
  MiniMapToggleFogOfWarAction = $J.load('net.sf.freecol.client.gui.action.MiniMapToggleFogOfWarAction');
  MiniMapToggleViewAction = $J.load('net.sf.freecol.client.gui.action.MiniMapToggleViewAction');
  MiniMapZoomInAction = $J.load('net.sf.freecol.client.gui.action.MiniMapZoomInAction');
  MiniMapZoomOutAction = $J.load('net.sf.freecol.client.gui.action.MiniMapZoomOutAction');
  MoveAction = $J.load('net.sf.freecol.client.gui.action.MoveAction');
  NewAction = $J.load('net.sf.freecol.client.gui.action.NewAction');
  NewEmptyMapAction = $J.load('net.sf.freecol.client.gui.action.NewEmptyMapAction');
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
  ScaleMapAction = $J.load('net.sf.freecol.client.gui.action.ScaleMapAction');
  SentryAction = $J.load('net.sf.freecol.client.gui.action.SentryAction');
  ShowDifficultyAction = $J.load('net.sf.freecol.client.gui.action.ShowDifficultyAction');
  ShowGameOptionsAction = $J.load('net.sf.freecol.client.gui.action.ShowGameOptionsAction');
  ShowMainAction = $J.load('net.sf.freecol.client.gui.action.ShowMainAction');
  ShowMapGeneratorOptionsAction = $J.load('net.sf.freecol.client.gui.action.ShowMapGeneratorOptionsAction');
  SkipUnitAction = $J.load('net.sf.freecol.client.gui.action.SkipUnitAction');
  StartMapAction = $J.load('net.sf.freecol.client.gui.action.StartMapAction');
  TilePopupAction = $J.load('net.sf.freecol.client.gui.action.TilePopupAction');
  ToggleViewModeAction = $J.load('net.sf.freecol.client.gui.action.ToggleViewModeAction');
  TradeRouteAction = $J.load('net.sf.freecol.client.gui.action.TradeRouteAction');
  UnloadAction = $J.load('net.sf.freecol.client.gui.action.UnloadAction');
  WaitAction = $J.load('net.sf.freecol.client.gui.action.WaitAction');
  ZoomInAction = $J.load('net.sf.freecol.client.gui.action.ZoomInAction');
  ZoomOutAction = $J.load('net.sf.freecol.client.gui.action.ZoomOutAction');
  UnitButton = $J.load('net.sf.freecol.client.gui.panel.UnitButton');
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  Direction = $J.load('net.sf.freecol.common.model.Direction');
});
