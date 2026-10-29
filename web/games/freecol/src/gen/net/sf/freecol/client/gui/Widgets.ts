// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/Widgets.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject, Logger, Thread } from '../../../../../../jre/index.ts';

let SwingUtilities, SwingGUI$PopupPosition, CaptureGoodsDialog, ChooseFoundingFatherDialog, ConfirmDeclarationDialog, DifficultyDialog, DumpCargoDialog, EditOptionDialog, EditSettlementDialog, EmigrationDialog, EndTurnDialog, FirstContactDialog, FreeColChoiceDialog, FreeColConfirmDialog, FreeColStringInputDialog, GameOptionsDialog, LoadDialog, LoadingSavegameDialog, MapGeneratorOptionsDialog, MapSizeDialog, MonarchDialog, NativeDemandDialog, NegotiationDialog, ParametersDialog, PreCombatDialog, RiverStyleDialog, SaveDialog, ScaleMapSizeDialog, SelectAmountDialog, SelectDestinationDialog, SelectTributeAmountDialog, VictoryDialog, WarehouseDialog, AboutPanel, BuildQueuePanel, ChatPanel, ColorChooserPanel, DeclarationPanel, ErrorPanel, EuropePanel, EventPanel, FindSettlementPanel, IndianSettlementPanel, InformationPanel, NewPanel, PurchasePanel, RecruitPanel, ServerListPanel, StatisticsPanel, TilePanel, TradeRouteInputPanel, TradeRoutePanel, TrainPanel, WorkProductionPanel, ColopediaPanel, CompactLabourReport, ReportCargoPanel, ReportClassicColonyPanel, ReportCompactColonyPanel, ReportContinentalCongressPanel, ReportEducationPanel, ReportExplorationPanel, ReportForeignAffairPanel, ReportHighScoresPanel, ReportHistoryPanel, ReportIndianPanel, ReportLabourDetailPanel, ReportLabourPanel, ReportMilitaryPanel, ReportNavalPanel, ReportProductionPanel, ReportReligiousPanel, ReportRequirementsPanel, ReportTradePanel, ReportTurnPanel, Messages, Utils;

/**
 * Container for all the higher level dialogs and panels.
 * Moved here so that Canvas is more manageable.
 */
export class Widgets extends JObject {
  static logger: Logger = null;
  /**
   * The game client.
   */
  freeColClient: FreeColClient = null;
  /**
   * The canvas to write to.
   */
  canvas: Canvas = null;
  /**
   * Create this wrapper class.
   *
   * @param freeColClient The enclosing {@code FreeColClient}.
   * @param canvas The {@code Canvas} to call out to.
   */
  _Widgets(freeColClient: FreeColClient, canvas: Canvas): this {
    this.freeColClient = freeColClient;
    this.canvas = canvas;
    return this;
  }
  getFrame(): FreeColFrame {
    return this.canvas.getParentFrame();
  }
  /**
   * Show a modal dialog with a text and a ok/cancel option.
   *
   * @param tmpl A {@code StringTemplate} to explain the choice.
   * @param icon An optional icon to display.
   * @param okKey The text displayed on the "ok"-button.
   * @param cancelKey The text displayed on the "cancel"-button.
   * @param pos A {@code PopupPosition} for the dialog.
   * @return True if the user clicked the "ok"-button.
   */
  confirm(tmpl: StringTemplate, icon: ImageIcon, okKey: string, cancelKey: string, pos: SwingGUI$PopupPosition): boolean {
    let dialog = new FreeColConfirmDialog()._FreeColConfirmDialog$FreeColClient$JFrame$boolean$StringTemplate$ImageIcon$String$String(this.freeColClient, this.getFrame(), true, tmpl, icon, okKey, cancelKey);
    return this.canvas.showFreeColDialog(dialog, pos);
  }
  /**
   * Show a modal dialog with text and a choice of options.
   *
   * @param <T> The type to be returned from the dialog.
   * @param tmpl A SringTemplate that explains the choice for the user.
   * @param icon An optional icon to display.
   * @param cancelKey Key for the text of the optional cancel button.
   * @param choices The {@code List} containing the ChoiceItems to
   *            create buttons for.
   * @param pos A {@code PopupPosition} for the dialog.
   * @return The corresponding member of the values array to the selected
   *     option, or null if no choices available.
   */
  getChoice<T>(tmpl: StringTemplate, icon: ImageIcon, cancelKey: string, choices: List<ChoiceItem<T>>, pos: SwingGUI$PopupPosition): T {
    if (choices.isEmpty()) {
      return null;
    }
    let dialog = new FreeColChoiceDialog()._FreeColChoiceDialog$FreeColClient$JFrame$boolean$StringTemplate$ImageIcon$String$List(this.freeColClient, this.getFrame(), true, tmpl, icon, cancelKey, choices);
    return this.canvas.showFreeColDialog(dialog, pos);
  }
  /**
   * Show a modal dialog with a text field and a ok/cancel option.
   *
   * @param tmpl A {@code StringTemplate} that explains the
   *     action to the user.
   * @param defaultValue The default value appearing in the text field.
   * @param okKey A key displayed on the "ok"-button.
   * @param cancelKey A key displayed on the optional "cancel"-button.
   * @param pos A {@code PopupPosition} for the dialog.
   * @return The text the user entered, or null if cancelled.
   */
  getInput(tmpl: StringTemplate, defaultValue: string, okKey: string, cancelKey: string, pos: SwingGUI$PopupPosition): string {
    let dialog = new FreeColStringInputDialog()._FreeColStringInputDialog(this.freeColClient, this.getFrame(), true, tmpl, defaultValue, okKey, cancelKey);
    return this.canvas.showFreeColDialog(dialog, pos);
  }
  /**
   * Show the AboutPanel.
   *
   * @return The panel shown.
   */
  showAboutPanel(): FreeColPanel {
    let panel = new AboutPanel()._AboutPanel(this.freeColClient);
    return this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, SwingGUI$PopupPosition.CENTERED, false);
  }
  /**
   * Show the BuildQueuePanel for a given colony.
   *
   * @param colony The {@code Colony} to show the build queue of.
   * @return The panel shown.
   */
  showBuildQueuePanel(colony: Colony): FreeColPanel {
    let panel = this.canvas.getExistingFreeColPanel($J.cls(BuildQueuePanel));
    if (panel == null || panel.getColony() !== colony) {
      panel = new BuildQueuePanel()._BuildQueuePanel(this.freeColClient, colony);
      return this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, SwingGUI$PopupPosition.CENTERED, true);
    }
    return panel;
  }
  /**
   * Show the {@code CaptureGoodsDialog}.
   *
   * @param unit The {@code Unit} capturing goods.
   * @param gl The list of {@code Goods} to choose from.
   * @param handler A {@code DialogHandler} for the dialog response.
   */
  showCaptureGoodsDialog(unit: Unit, gl: List<Goods>, handler: DialogHandler<List<Goods>>): void {
    new Widgets$DialogCallback().$o(this)._Widgets$DialogCallback(new CaptureGoodsDialog()._CaptureGoodsDialog(this.freeColClient, this.getFrame(), unit, gl), null, handler);
  }
  /**
   * Show the chat panel.
   *
   * @return The panel shown.
   */
  showChatPanel(): FreeColPanel {
    let panel = new ChatPanel()._ChatPanel(this.freeColClient);
    this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, SwingGUI$PopupPosition.CENTERED, true);
    panel.requestFocus$();
    return panel;
  }
  /**
   * Show the {@code ChooseFoundingFatherDialog}.
   *
   * @param ffs The {@code FoundingFather}s to choose from.
   * @param handler A {@code DialogHandler} for the dialog response.
   */
  showChooseFoundingFatherDialog(ffs: List<FoundingFather>, handler: DialogHandler<FoundingFather>): void {
    new Widgets$DialogCallback().$o(this)._Widgets$DialogCallback(new ChooseFoundingFatherDialog()._ChooseFoundingFatherDialog(this.freeColClient, this.getFrame(), ffs), null, handler);
  }
  /**
   * Show the colopedia entry for a given node.
   *
   * @param nodeId The node identifier to display.
   * @return The panel shown.
   */
  showColopediaPanel(nodeId: string): FreeColPanel {
    let panel = new ColopediaPanel()._ColopediaPanel$FreeColClient$String(this.freeColClient, nodeId);
    return this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, SwingGUI$PopupPosition.CENTERED, true);
  }
  /**
   * Show a {@code ColorChooserPanel}.
   *
   * @param al An {@code ActionListener} to handle panel button
   *     presses.
   * @return The panel shown.
   */
  showColorChooserPanel(al: ActionListener): FreeColPanel {
    let panel = new ColorChooserPanel()._ColorChooserPanel(this.freeColClient, al);
    return this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, SwingGUI$PopupPosition.CENTERED, false);
  }
  /**
   * Show the compact labour report.
   *
   * @return The panel shown.
   */
  showCompactLabourReport$(): FreeColPanel {
    let panel = new CompactLabourReport()._CompactLabourReport$FreeColClient(this.freeColClient);
    panel.initialize();
    return this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, SwingGUI$PopupPosition.CENTERED, false);
  }
  /**
   * Show the compact labour report for the specified unit data.
   *
   * @param unitData The {@code UnitData} to display.
   * @return The panel shown.
   */
  showCompactLabourReport$UnitData(unitData: LabourData$UnitData): FreeColPanel {
    let panel = new CompactLabourReport()._CompactLabourReport$FreeColClient$UnitData(this.freeColClient, unitData);
    panel.initialize();
    return this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, SwingGUI$PopupPosition.CENTERED, false);
  }
  /**
   * Show a dialog to confirm a declaration of independence.
   *
   * @return A list of names for a new nation.
   */
  showConfirmDeclarationDialog(): List<string> {
    let dialog = new ConfirmDeclarationDialog()._ConfirmDeclarationDialog(this.freeColClient, this.getFrame());
    return this.canvas.showFreeColDialog(dialog, null);
  }
  /**
   * Show a panel showing the declaration of independence with
   * animated signature.
   *
   * @param afterClosing A callback that is executed after the panel closes.
   */
  showDeclarationPanel(afterClosing: Runnable): void {
    let panel = new DeclarationPanel()._DeclarationPanel(this.freeColClient, afterClosing);
    this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, SwingGUI$PopupPosition.CENTERED, false);
  }
  /**
   * Show the difficulty dialog for a given group.
   *
   * @param spec The enclosing {@code Specification}.
   * @param group The {@code OptionGroup} containing the difficulty.
   * @param editable If the options should be editable.
   * @param dialogHandler Callback executed when the dialog gets closed.
   * @return The resulting {@code OptionGroup}.
   */
  showDifficultyDialog(spec: Specification, group: OptionGroup, editable: boolean, dialogHandler: DialogHandler<OptionGroup>): void {
    let dialog = new DifficultyDialog()._DifficultyDialog(this.freeColClient, this.getFrame(), spec, group, editable);
    dialog.setDialogHandler(dialogHandler);
    this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(dialog, SwingGUI$PopupPosition.CENTERED, true);
  }
  /**
   * Show the {@code DumpCargoDialog}.
   *
   * @param unit The {@code Unit} that is dumping.
   * @param pos A {@code PopupPosition} for the dialog.
   * @param handler A {@code DialogHandler} for the dialog response.
   */
  showDumpCargoDialog(unit: Unit, pos: SwingGUI$PopupPosition, handler: DialogHandler<List<Goods>>): void {
    new Widgets$DialogCallback().$o(this)._Widgets$DialogCallback(new DumpCargoDialog()._DumpCargoDialog(this.freeColClient, this.getFrame(), unit), pos, handler);
  }
  /**
   * Show the EditOptionDialog.
   *
   * @param op The {@code Option} to edit.
   * @return The response returned by the dialog.
   */
  showEditOptionDialog(op: Option): boolean {
    if (op == null) {
      return false;
    }
    let dialog = new EditOptionDialog()._EditOptionDialog(this.freeColClient, this.getFrame(), op);
    return this.canvas.showFreeColDialog(dialog, null);
  }
  /**
   * Show the EditSettlementDialog.
   *
   * @param is The {@code IndianSettlement} to edit.
   * @return The response returned by the dialog.
   */
  showEditSettlementDialog(is$: IndianSettlement): IndianSettlement {
    let dialog = new EditSettlementDialog()._EditSettlementDialog(this.freeColClient, this.getFrame(), is$);
    return this.canvas.showFreeColDialog(dialog, null);
  }
  /**
   * Show the panel that allows the user to choose which unit will
   * emigrate from Europe.
   *
   * @param player The {@code Player} whose unit is emigrating.
   * @param fountainOfYouth Is this dialog displayed as a result of a
   *     fountain of youth.
   * @param handler A {@code DialogHandler} for the dialog response.
   */
  showEmigrationDialog(player: Player, fountainOfYouth: boolean, handler: DialogHandler<number>): void {
    new Widgets$DialogCallback().$o(this)._Widgets$DialogCallback(new EmigrationDialog()._EmigrationDialog(this.freeColClient, this.getFrame(), player.getEurope(), fountainOfYouth), null, handler);
  }
  /**
   * Show the EndTurnDialog with given units that could still move.
   *
   * @param units A list of {@code Unit}s that could still move.
   * @param handler A {@code DialogHandler} for the dialog response.
   */
  showEndTurnDialog(units: List<Unit>, handler: DialogHandler<boolean>): void {
    new Widgets$DialogCallback().$o(this)._Widgets$DialogCallback(new EndTurnDialog()._EndTurnDialog(this.freeColClient, this.getFrame(), units), null, handler);
  }
  /**
   * Show an error message.
   *
   * @param message The message to display.
   * @return The panel shown.
   */
  showErrorPanel(message: string): FreeColPanel {
    if (message == null) {
      return null;
    }
    let panel = new ErrorPanel()._ErrorPanel$FreeColClient$String(this.freeColClient, message);
    return this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, SwingGUI$PopupPosition.CENTERED, true);
  }
  /**
   * Show the {@code EuropePanel}.
   *
   * @param callback An optional closing callback to add.
   * @return The panel shown.
   */
  showEuropePanel(callback: Runnable): FreeColPanel {
    if (this.freeColClient.getGame() == null) {
      return null;
    }
    let panel = this.canvas.getExistingFreeColPanel($J.cls(EuropePanel));
    if (panel == null) {
      panel = new EuropePanel()._EuropePanel(this.freeColClient, (this.canvas.getHeight() > 780));
      if (callback != null) {
        panel.addClosingCallback(callback);
      }
      this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, SwingGUI$PopupPosition.CENTERED, true);
    }
    return panel;
  }
  /**
   * Show an event panel.
   *
   * @param header The title.
   * @param image A resource key for the image to display.
   * @param footer Optional footer text.
   * @return The panel shown.
   */
  showEventPanel(header: string, image: string, footer: string): FreeColPanel {
    let panel = new EventPanel()._EventPanel(this.freeColClient, header, image, footer);
    return this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, SwingGUI$PopupPosition.CENTERED, false);
  }
  /**
   * Show the FindSettlementPanel.
   *
   * @return The panel shown.
   */
  showFindSettlementPanel(): FreeColPanel {
    let panel = new FindSettlementPanel()._FindSettlementPanel(this.freeColClient);
    return this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, SwingGUI$PopupPosition.ORIGIN, true);
  }
  /**
   * Show the first contact dialog (which is really just a non-modal
   * confirm dialog).
   *
   * @param player The {@code Player} making contact.
   * @param other The {@code Player} to contact.
   * @param tile An optional {@code Tile} on offer.
   * @param settlementCount The number of settlements the other
   *     player has (from the server, other.getNumberOfSettlements()
   *     is wrong here!).
   * @param pos A {@code PopupPosition} for the dialog.
   * @param handler A {@code DialogHandler} for the dialog response.
   */
  showFirstContactDialog(player: Player, other: Player, tile: Tile, settlementCount: number, pos: SwingGUI$PopupPosition, handler: DialogHandler<boolean>): void {
    new Widgets$DialogCallback().$o(this)._Widgets$DialogCallback(new FirstContactDialog()._FirstContactDialog(this.freeColClient, this.getFrame(), player, other, tile, settlementCount), pos, handler);
  }
  /**
   * Show the GameOptionsDialog.
   *
   * @param editable Should the game options be editable?
   * @param dialogHandler A callback for handling the closing of the dialog.
   */
  showGameOptionsDialog(editable: boolean, dialogHandler: DialogHandler<OptionGroup>): void {
    let dialog = new GameOptionsDialog()._GameOptionsDialog(this.freeColClient, this.getFrame(), editable);
    dialog.setDialogHandler(dialogHandler);
    this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(dialog, SwingGUI$PopupPosition.CENTERED, true);
  }
  /**
   * Show the high scores panel.
   *
   * @param messageId An optional message to add to the high scores panel.
   * @param scores The list of {@code HighScore}s to display.
   * @return The panel shown.
   */
  showHighScoresPanel(messageId: string, scores: List<HighScore>): FreeColPanel {
    let panel = new ReportHighScoresPanel()._ReportHighScoresPanel(this.freeColClient, messageId, scores);
    return this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, SwingGUI$PopupPosition.CENTERED, true);
  }
  /**
   * Show the panel of the given native settlement.
   *
   * @param is The {@code IndianSettlement} to display.
   * @param pos A {@code PopupPosition} for the panel.
   * @return The panel shown.
   */
  showIndianSettlementPanel(is$: IndianSettlement, pos: SwingGUI$PopupPosition): FreeColPanel {
    let panel = new IndianSettlementPanel()._IndianSettlementPanel(this.freeColClient, is$);
    return this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, pos, true);
  }
  /**
   * Show a message with some information and an "OK"-button.
   *
   * @param displayObject Optional object for displaying.
   * @param pos A {@code PopupPosition} for the panel.
   * @param icon The icon to display for the object.
   * @param tmpl The {@code StringTemplate} to display.
   * @return The panel shown.
   */
  showInformationPanel(displayObject: FreeColObject, pos: SwingGUI$PopupPosition, icon: ImageIcon, tmpl: StringTemplate): FreeColPanel {
    let panel = new InformationPanel()._InformationPanel(this.freeColClient, [Messages.message$StringTemplate(tmpl)], [displayObject], [icon]);
    return this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, pos, false);
  }
  /**
   * Show a dialog where the user may choose a file.
   *
   * @param directory The directory containing the files.
   * @param filters {@code FileFilter}s for suitable files.
   * @return The selected {@code File}.
   */
  showLoadDialog(directory: File, filters: FileFilter[]): File {
    let dialog = new LoadDialog()._LoadDialog(this.freeColClient, this.getFrame(), directory, filters);
    return this.canvas.showFreeColDialog(dialog, null);
  }
  /**
   * Show a dialog for setting options when loading a savegame.
   *
   * The settings can be retrieved directly from
   * {@link LoadingSavegameDialog} after calling this method.
   *
   * @param pubSer Default value.
   * @param single Default value.
   * @return The {@code LoadingSavegameInfo} if the dialog was accepted,
   *     or null otherwise.
   */
  showLoadingSavegameDialog(pubSer: boolean, single: boolean): LoadingSavegameInfo {
    let dialog = new LoadingSavegameDialog()._LoadingSavegameDialog(this.freeColClient, this.getFrame());
    return (this.canvas.showFreeColDialog(dialog, null)) ? dialog.getInfo() : null;
  }
  /**
   * Show a panel containing the log file.
   *
   * @return The panel shown.
   */
  showLogFilePanel(): FreeColPanel {
    let panel = new ErrorPanel()._ErrorPanel$FreeColClient(this.freeColClient);
    return this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, SwingGUI$PopupPosition.CENTERED, true);
  }
  /**
   * Show the map generator options dialog.
   *
   * @param editable Should these options be editable.
   */
  showMapGeneratorOptionsDialog(editable: boolean, dialogHandler: DialogHandler<OptionGroup>): void {
    let dialog = new MapGeneratorOptionsDialog()._MapGeneratorOptionsDialog(this.freeColClient, this.getFrame(), editable);
    dialog.setDialogHandler(dialogHandler);
    this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(dialog, SwingGUI$PopupPosition.CENTERED, true);
  }
  /**
   * Show the map size dialog.
   *
   * @return The response returned by the dialog.
   */
  showMapSizeDialog(): Dimension {
    let dialog = new MapSizeDialog()._MapSizeDialog(this.freeColClient, this.getFrame());
    return this.canvas.showFreeColDialog(dialog, null);
  }
  /**
   * Show the monarch dialog.
   *
   * @param action The {@code MonarchAction} underway.
   * @param tmpl The {@code StringTemplate} describing the
   *     situation.
   * @param monarchKey The resource key for the monarch image.
   * @param handler A {@code DialogHandler} for the dialog response.
   */
  showMonarchDialog(action: Monarch$MonarchAction, tmpl: StringTemplate, monarchKey: string, handler: DialogHandler<boolean>): void {
    new Widgets$DialogCallback().$o(this)._Widgets$DialogCallback(new MonarchDialog()._MonarchDialog(this.freeColClient, this.getFrame(), action, tmpl, monarchKey), null, handler);
  }
  /**
   * Show a dialog to set a new name for something.
   *
   * @param tmpl A {@code StringTemplate} for the message
   *     to explain the dialog.
   * @param defaultName The default name.
   * @param pos A {@code PopupPosition} for the dialog.
   * @param handler A {@code DialogHandler} for the dialog response.
   */
  showNamingDialog(tmpl: StringTemplate, defaultName: string, pos: SwingGUI$PopupPosition, handler: DialogHandler<string>): void {
    new Widgets$DialogCallback().$o(this)._Widgets$DialogCallback(new FreeColStringInputDialog()._FreeColStringInputDialog(this.freeColClient, this.getFrame(), false, tmpl, defaultName, 'ok', null), pos, handler);
  }
  /**
   * Show a dialog to handle a native demand to a colony.
   *
   * @param unit The demanding {@code Unit}.
   * @param colony The {@code Colony} being demanded of.
   * @param type The {@code GoodsType} demanded (null for gold).
   * @param amount The amount of goods demanded.
   * @param pos A {@code PopupPosition} for the dialog.
   * @param handler A {@code DialogHandler} for the dialog response.
   */
  showNativeDemandDialog(unit: Unit, colony: Colony, type$: GoodsType, amount: number, pos: SwingGUI$PopupPosition, handler: DialogHandler<boolean>): void {
    new Widgets$DialogCallback().$o(this)._Widgets$DialogCallback(new NativeDemandDialog()._NativeDemandDialog(this.freeColClient, this.getFrame(), unit, colony, type$, amount), pos, handler);
  }
  /**
   * Show the {@code NegotiationDialog}.
   *
   * @param our Our {@code FreeColGameObject} that is negotiating.
   * @param other The other {@code FreeColGameObject}.
   * @param agreement The current {@code DiplomaticTrade} agreement.
   * @param comment An optional {@code StringTemplate} containing a
   *     commentary message.
   * @param pos A {@code PopupPosition} for the dialog.
   * @return An updated agreement.
   */
  showNegotiationDialog(our: FreeColGameObject, other: FreeColGameObject, agreement: DiplomaticTrade, comment: StringTemplate, pos: SwingGUI$PopupPosition): DiplomaticTrade {
    let dialog = new NegotiationDialog()._NegotiationDialog(this.freeColClient, this.getFrame(), our, other, agreement, comment);
    return this.canvas.showFreeColDialog(dialog, pos);
  }
  /**
   * Show the NewPanel for a given optional specification.
   *
   * @param specification The {@code Specification} to use.
   * @return The panel shown.
   */
  showNewPanel(specification: Specification): FreeColPanel {
    let panel = new NewPanel()._NewPanel$FreeColClient$Specification(this.freeColClient, specification);
    return this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, SwingGUI$PopupPosition.CENTERED, false);
  }
  /**
   * Show the parameters dialog.
   *
   * @return The response returned by the dialog.
   */
  showParametersDialog(): Parameters {
    let dialog = new ParametersDialog()._ParametersDialog(this.freeColClient, this.getFrame());
    return this.canvas.showFreeColDialog(dialog, null);
  }
  /**
   * Show a dialog to confirm a combat.
   *
   * @param attacker The attacker {@code Unit}.
   * @param defender The defender.
   * @param pos A {@code PopupPosition} for the dialog.
   * @return True if the combat is to proceed.
   */
  showPreCombatDialog(attacker: Unit, defender: FreeColGameObject, pos: SwingGUI$PopupPosition): boolean {
    let dialog = new PreCombatDialog()._PreCombatDialog(this.freeColClient, this.getFrame(), attacker, defender);
    return this.canvas.showFreeColDialog(dialog, pos);
  }
  /**
   * Show the purchase panel.
   *
   * @return The panel shown.
   */
  showPurchasePanel(): FreeColPanel {
    let panel = this.canvas.getExistingFreeColPanel($J.cls(PurchasePanel));
    if (panel == null) {
      panel = new PurchasePanel()._PurchasePanel(this.freeColClient);
      panel.update$();
      this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, SwingGUI$PopupPosition.CENTERED, false);
    }
    return panel;
  }
  /**
   * Show the recruit panel.
   *
   * @return The panel shown.
   */
  showRecruitPanel(): FreeColPanel {
    let panel = this.canvas.getExistingFreeColPanel($J.cls(RecruitPanel));
    if (panel == null) {
      panel = new RecruitPanel()._RecruitPanel(this.freeColClient);
      this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, SwingGUI$PopupPosition.CENTERED, false);
    }
    return panel;
  }
  /**
   * Show the labour detail panel.
   *
   * @param unitType The {@code UnitType} to display.
   * @param data The labour data.
   * @param unitCount A map of unit distribution.
   * @param colonies The list of player {@code Colony}s.
   * @return The panel shown.
   */
  showReportLabourDetailPanel(unitType: UnitType, data: JMap<UnitType, JMap<Location, number>>, unitCount: TypeCountMap<UnitType>, colonies: List<Colony>): FreeColPanel {
    let panel = new ReportLabourDetailPanel()._ReportLabourDetailPanel(this.freeColClient, unitType, data, unitCount, colonies);
    panel.initialize();
    return this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, SwingGUI$PopupPosition.CENTERED, true);
  }
  /**
   * Show the river style dialog.
   *
   * @param styles The river styles a choice is made from.
   * @return The response returned by the dialog.
   */
  showRiverStyleDialog(styles: List<string>): string {
    let dialog = new RiverStyleDialog()._RiverStyleDialog(this.freeColClient, this.getFrame(), styles);
    return this.canvas.showFreeColDialog(dialog, null);
  }
  /**
   * Show a dialog where the user may choose a filename.
   *
   * @param directory The directory containing the files in which
   *     the user may overwrite.
   * @param filters {@code FileFilter}s for acceptable file names.
   * @param defaultName Default filename for the savegame.
   * @return The selected {@code File}.
   */
  showSaveDialog(directory: File, filters: FileFilter[], defaultName: string): File {
    let dialog = new SaveDialog()._SaveDialog(this.freeColClient, this.getFrame(), directory, filters, defaultName);
    return this.canvas.showFreeColDialog(dialog, null);
  }
  /**
   * Show the scale map size dialog.
   *
   * @return The response returned by the dialog.
   */
  showScaleMapSizeDialog(): Dimension {
    let dialog = new ScaleMapSizeDialog()._ScaleMapSizeDialog(this.freeColClient, this.getFrame());
    return this.canvas.showFreeColDialog(dialog, null);
  }
  /**
   * Show the select-amount dialog.
   *
   * @param goodsType The {@code GoodsType} to select an amount of.
   * @param available The amount of goods available.
   * @param defaultAmount The amount to select to start with.
   * @param needToPay If true, check the player has sufficient funds.
   * @return The amount selected.
   */
  showSelectAmountDialog(goodsType: GoodsType, available: number, defaultAmount: number, needToPay: boolean): number {
    let dialog = new SelectAmountDialog()._SelectAmountDialog(this.freeColClient, this.getFrame(), goodsType, available, defaultAmount, needToPay);
    let result = this.canvas.showFreeColDialog(dialog, null);
    return (result == null) ? -1 : result;
  }
  /**
   * Show a dialog allowing the user to select a destination for
   * a given unit.
   *
   * @param unit The {@code Unit} to select a destination for.
   * @param pos A {@code PopupPosition} for the dialog.
   * @return A destination for the unit, or null.
   */
  showSelectDestinationDialog(unit: Unit, pos: SwingGUI$PopupPosition): Location {
    let dialog = new SelectDestinationDialog()._SelectDestinationDialog(this.freeColClient, this.getFrame(), unit);
    return this.canvas.showFreeColDialog(dialog, pos);
  }
  /**
   * Show the {@code ServerListPanel}.
   *
   * @param serverList The list containing the servers retrieved from the
   *     metaserver.
   * @return The panel shown.
   */
  showServerListPanel(serverList: List<ServerInfo>): FreeColPanel {
    let panel = new ServerListPanel()._ServerListPanel(this.freeColClient, this.freeColClient.getConnectController());
    panel.initialize(serverList);
    return this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, SwingGUI$PopupPosition.CENTERED, true);
  }
  /**
   * Show the select-tribute-amount dialog.
   *
   * @param question a {@code stringtemplate} describing the
   *     amount of tribute to demand.
   * @param maximum The maximum amount available.
   * @return The amount selected.
   */
  showSelectTributeAmountDialog(question: StringTemplate, maximum: number): number {
    let dialog = new SelectTributeAmountDialog()._SelectTributeAmountDialog(this.freeColClient, this.getFrame(), question, maximum);
    let result = this.canvas.showFreeColDialog(dialog, null);
    return (result == null) ? -1 : result;
  }
  /**
   * Show the statistics panel.
   *
   * @param serverStats A map of server statistics key,value pairs.
   * @param clientStats A map of client statistics key,value pairs.
   * @return The panel shown.
   */
  showStatisticsPanel(serverStats: JMap<string, string>, clientStats: JMap<string, string>): FreeColPanel {
    let panel = new StatisticsPanel()._StatisticsPanel(this.freeColClient, serverStats, clientStats);
    return this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, SwingGUI$PopupPosition.CENTERED, true);
  }
  /**
   * Show the tile panel for a given tile.
   *
   * @param tile The {@code Tile} to display.
   * @return The panel shown.
   */
  showTilePanel(tile: Tile): FreeColPanel {
    if (tile == null || !tile.isExplored()) {
      return null;
    }
    let panel = new TilePanel()._TilePanel(this.freeColClient, tile);
    return this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, SwingGUI$PopupPosition.CENTERED, false);
  }
  /**
   * Show the trade route input panel for a given trade route.
   *
   * @param newRoute The {@code TradeRoute} to display.
   * @return The panel shown.
   */
  showTradeRouteInputPanel(newRoute: TradeRoute): FreeColPanel {
    let panel = new TradeRouteInputPanel()._TradeRouteInputPanel(this.freeColClient, newRoute);
    return this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, SwingGUI$PopupPosition.CENTERED, true);
  }
  /**
   * Show a panel to select a trade route for a unit.
   *
   * @param unit An optional {@code Unit} to select a trade route for.
   * @param pos A {@code PopupPosition} for the panel.
   * @return The panel shown.
   */
  showTradeRoutePanel(unit: Unit, pos: SwingGUI$PopupPosition): FreeColPanel {
    let panel = new TradeRoutePanel()._TradeRoutePanel(this.freeColClient, unit);
    return this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, pos, true);
  }
  /**
   * Show the training panel.
   *
   * @return The panel shown.
   */
  showTrainPanel(): FreeColPanel {
    let panel = this.canvas.getExistingFreeColPanel($J.cls(TrainPanel));
    if (panel == null) {
      panel = new TrainPanel()._TrainPanel(this.freeColClient);
      panel.update$();
      this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, SwingGUI$PopupPosition.CENTERED, false);
    }
    return panel;
  }
  /**
   * Show the victory dialog.
   *
   * @param handler A {@code DialogHandler} for the dialog response.
   */
  showVictoryDialog(handler: DialogHandler<boolean>): void {
    new Widgets$DialogCallback().$o(this)._Widgets$DialogCallback(new VictoryDialog()._VictoryDialog(this.freeColClient, this.getFrame()), null, handler);
  }
  /**
   * Show the warehouse dialog for a colony.
   *
   * Run out of ColonyPanel, so the tile is already displayed.
   *
   * @param colony The {@code Colony} to display.
   * @return The response returned by the dialog.
   */
  showWarehouseDialog(colony: Colony, handler: DialogHandler<boolean>): void {
    let dialog = new WarehouseDialog()._WarehouseDialog(this.freeColClient, colony, handler);
    this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(dialog, SwingGUI$PopupPosition.CENTERED, true);
  }
  /**
   * Show the production of a unit.
   *
   * @param unit The {@code Unit} to display.
   * @return The panel shown.
   */
  showWorkProductionPanel(unit: Unit): FreeColPanel {
    let panel = new WorkProductionPanel()._WorkProductionPanel(this.freeColClient, unit);
    return this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, SwingGUI$PopupPosition.CENTERED, true);
  }
  showReportCargoPanel(): FreeColPanel {
    let panel = this.canvas.getExistingFreeColPanel($J.cls(ReportCargoPanel));
    if (panel == null) {
      panel = new ReportCargoPanel()._ReportCargoPanel(this.freeColClient);
      this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, SwingGUI$PopupPosition.CENTERED, true);
    }
    return panel;
  }
  showReportColonyPanel(compact: boolean): FreeColPanel {
    let panel: FreeColPanel;
    if (compact) {
      panel = this.canvas.getExistingFreeColPanel($J.cls(ReportCompactColonyPanel));
      if (panel == null) {
        panel = new ReportCompactColonyPanel()._ReportCompactColonyPanel(this.freeColClient);
        this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, SwingGUI$PopupPosition.CENTERED, true);
      }
    } else {
      panel = this.canvas.getExistingFreeColPanel($J.cls(ReportClassicColonyPanel));
      if (panel == null) {
        panel = new ReportClassicColonyPanel()._ReportClassicColonyPanel(this.freeColClient);
        this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, SwingGUI$PopupPosition.CENTERED, true);
      }
    }
    return panel;
  }
  showReportContinentalCongressPanel(): FreeColPanel {
    let panel = this.canvas.getExistingFreeColPanel($J.cls(ReportContinentalCongressPanel));
    if (panel == null) {
      panel = new ReportContinentalCongressPanel()._ReportContinentalCongressPanel(this.freeColClient);
      this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, SwingGUI$PopupPosition.CENTERED, true);
    }
    return panel;
  }
  showReportEducationPanel(): FreeColPanel {
    let panel = this.canvas.getExistingFreeColPanel($J.cls(ReportEducationPanel));
    if (panel == null) {
      panel = new ReportEducationPanel()._ReportEducationPanel(this.freeColClient);
      this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, SwingGUI$PopupPosition.CENTERED, true);
    }
    return panel;
  }
  showReportExplorationPanel(): FreeColPanel {
    let panel = this.canvas.getExistingFreeColPanel($J.cls(ReportExplorationPanel));
    if (panel == null) {
      panel = new ReportExplorationPanel()._ReportExplorationPanel(this.freeColClient);
      this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, SwingGUI$PopupPosition.CENTERED, true);
    }
    return panel;
  }
  showReportForeignAffairPanel(): FreeColPanel {
    let panel = this.canvas.getExistingFreeColPanel($J.cls(ReportForeignAffairPanel));
    if (panel == null) {
      panel = new ReportForeignAffairPanel()._ReportForeignAffairPanel(this.freeColClient);
      this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, SwingGUI$PopupPosition.CENTERED, true);
    }
    return panel;
  }
  showReportHistoryPanel(): FreeColPanel {
    let panel = this.canvas.getExistingFreeColPanel($J.cls(ReportHistoryPanel));
    if (panel == null) {
      panel = new ReportHistoryPanel()._ReportHistoryPanel(this.freeColClient);
      this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, SwingGUI$PopupPosition.CENTERED, true);
    }
    return panel;
  }
  showReportIndianPanel(): FreeColPanel {
    let panel = this.canvas.getExistingFreeColPanel($J.cls(ReportIndianPanel));
    if (panel == null) {
      panel = new ReportIndianPanel()._ReportIndianPanel(this.freeColClient);
      this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, SwingGUI$PopupPosition.CENTERED, true);
    }
    return panel;
  }
  showReportLabourPanel(): FreeColPanel {
    let panel = this.canvas.getExistingFreeColPanel($J.cls(ReportLabourPanel));
    if (panel == null) {
      panel = new ReportLabourPanel()._ReportLabourPanel(this.freeColClient);
      this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, SwingGUI$PopupPosition.CENTERED, true);
    }
    return panel;
  }
  showReportMilitaryPanel(): FreeColPanel {
    let panel = this.canvas.getExistingFreeColPanel($J.cls(ReportMilitaryPanel));
    if (panel == null) {
      panel = new ReportMilitaryPanel()._ReportMilitaryPanel(this.freeColClient);
      this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, SwingGUI$PopupPosition.CENTERED, true);
    }
    return panel;
  }
  showReportNavalPanel(): FreeColPanel {
    let panel = this.canvas.getExistingFreeColPanel($J.cls(ReportNavalPanel));
    if (panel == null) {
      panel = new ReportNavalPanel()._ReportNavalPanel(this.freeColClient);
      this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, SwingGUI$PopupPosition.CENTERED, true);
    }
    return panel;
  }
  showReportProductionPanel(): FreeColPanel {
    let panel = this.canvas.getExistingFreeColPanel($J.cls(ReportProductionPanel));
    if (panel == null) {
      panel = new ReportProductionPanel()._ReportProductionPanel(this.freeColClient);
      this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, SwingGUI$PopupPosition.CENTERED, true);
    }
    return panel;
  }
  showReportReligiousPanel(): FreeColPanel {
    let panel = this.canvas.getExistingFreeColPanel($J.cls(ReportReligiousPanel));
    if (panel == null) {
      panel = new ReportReligiousPanel()._ReportReligiousPanel(this.freeColClient);
      this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, SwingGUI$PopupPosition.CENTERED, true);
    }
    return panel;
  }
  showReportRequirementsPanel(): FreeColPanel {
    let panel = this.canvas.getExistingFreeColPanel($J.cls(ReportRequirementsPanel));
    if (panel == null) {
      panel = new ReportRequirementsPanel()._ReportRequirementsPanel(this.freeColClient);
      this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, SwingGUI$PopupPosition.CENTERED, true);
    }
    return panel;
  }
  showReportTradePanel(): FreeColPanel {
    let panel = this.canvas.getExistingFreeColPanel($J.cls(ReportTradePanel));
    if (panel == null) {
      panel = new ReportTradePanel()._ReportTradePanel(this.freeColClient);
      this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, SwingGUI$PopupPosition.CENTERED, true);
    }
    return panel;
  }
  /**
   * Show the turn report.
   *
   * @param messages The {@code ModelMessage}s to show.
   * @return The {@code FreeColPanel} displayed.
   */
  showReportTurnPanel(messages: List<ModelMessage>): FreeColPanel {
    let panel = this.canvas.getExistingFreeColPanel($J.cls(ReportTurnPanel));
    if (panel == null) {
      panel = new ReportTurnPanel()._ReportTurnPanel(this.freeColClient, messages);
      this.canvas.showFreeColPanel$FreeColPanel$PopupPosition$boolean(panel, SwingGUI$PopupPosition.CENTERED, true);
    } else {
      panel.setMessages(messages);
    }
    return panel;
  }
  static $clinit() {
    Widgets.logger = Logger.getLogger($J.cls(Widgets).getName());
  }
}

/**
 * A wrapper class for non-modal dialogs.
 */
export class Widgets$DialogCallback<T> extends JObject {
  /**
   * The dialog to show.
   */
  fcd: FreeColDialog<T> = null;
  /**
   * A rough position for the dialog.
   */
  pos: SwingGUI$PopupPosition = null;
  /**
   * The handler for the dialog response.
   */
  handler: DialogHandler<T> = null;
  /**
   * Constructor.
   *
   * @param fcd The parent {@code FreeColDialog}.
   * @param pos A {@code PopupPosition} for the dialog.
   * @param handler The {@code DialogHandler} to call when run.
   */
  _Widgets$DialogCallback(fcd: FreeColDialog<T>, pos: SwingGUI$PopupPosition, handler: DialogHandler<T>): this {
    this.fcd = fcd;
    this.pos = pos;
    this.handler = handler;
    SwingUtilities.invokeLater($J.fn(this, 'run'));
    return this;
  }
  /**
   * {@inheritDoc}
   */
  run(): void {
    this.$outer.canvas.viewFreeColDialog(this.fcd, this.pos);
    new (Widgets$DialogCallback$1())().$o(this)._Thread(this.fcd.toString()).start();
  }
}

let $Widgets$DialogCallback$1: any = null;
/** An anonymous class (Widgets.java:189). */
function Widgets$DialogCallback$1(): any {
  return $Widgets$DialogCallback$1 ??= $J.local(class extends Thread {
    run(): void {
      while (!this.$outer.fcd.responded()) {
        Utils.delay(500, 'Dialog interrupted.');
      }
      $J.fn(this.$outer.handler, 'handle')(this.$outer.fcd.getResponse());
    }
  }, 'net.sf.freecol.client.gui.Widgets$DialogCallback$1', []);
}

$J.define(Widgets, 'net.sf.freecol.client.gui.Widgets', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.client.gui.Canvas': '_Widgets' }, returns: { 'getFrame': 'net.sf.freecol.client.gui.FreeColFrame' }, meths: { 'showCompactLabourReport(net.sf.freecol.client.gui.panel.report.LabourData$UnitData)': 'showCompactLabourReport$UnitData', 'showCompactLabourReport()': 'showCompactLabourReport$' }, clinit: true, lazy: ['logger'] });
$J.define(Widgets$DialogCallback, 'net.sf.freecol.client.gui.Widgets$DialogCallback', { kind: 'class', ifaces: ['java.lang.Runnable'], sup: 'java.lang.Object', ctors: { 'net.sf.freecol.client.gui.dialog.FreeColDialog,net.sf.freecol.client.gui.SwingGUI$PopupPosition,net.sf.freecol.client.gui.DialogHandler': '_Widgets$DialogCallback' }, inner: true });
$J.module(() => {
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  SwingGUI$PopupPosition = $J.load('net.sf.freecol.client.gui.SwingGUI$PopupPosition');
  CaptureGoodsDialog = $J.load('net.sf.freecol.client.gui.dialog.CaptureGoodsDialog');
  ChooseFoundingFatherDialog = $J.load('net.sf.freecol.client.gui.dialog.ChooseFoundingFatherDialog');
  ConfirmDeclarationDialog = $J.load('net.sf.freecol.client.gui.dialog.ConfirmDeclarationDialog');
  DifficultyDialog = $J.load('net.sf.freecol.client.gui.dialog.DifficultyDialog');
  DumpCargoDialog = $J.load('net.sf.freecol.client.gui.dialog.DumpCargoDialog');
  EditOptionDialog = $J.load('net.sf.freecol.client.gui.dialog.EditOptionDialog');
  EditSettlementDialog = $J.load('net.sf.freecol.client.gui.dialog.EditSettlementDialog');
  EmigrationDialog = $J.load('net.sf.freecol.client.gui.dialog.EmigrationDialog');
  EndTurnDialog = $J.load('net.sf.freecol.client.gui.dialog.EndTurnDialog');
  FirstContactDialog = $J.load('net.sf.freecol.client.gui.dialog.FirstContactDialog');
  FreeColChoiceDialog = $J.load('net.sf.freecol.client.gui.dialog.FreeColChoiceDialog');
  FreeColConfirmDialog = $J.load('net.sf.freecol.client.gui.dialog.FreeColConfirmDialog');
  FreeColStringInputDialog = $J.load('net.sf.freecol.client.gui.dialog.FreeColStringInputDialog');
  GameOptionsDialog = $J.load('net.sf.freecol.client.gui.dialog.GameOptionsDialog');
  LoadDialog = $J.load('net.sf.freecol.client.gui.dialog.LoadDialog');
  LoadingSavegameDialog = $J.load('net.sf.freecol.client.gui.dialog.LoadingSavegameDialog');
  MapGeneratorOptionsDialog = $J.load('net.sf.freecol.client.gui.dialog.MapGeneratorOptionsDialog');
  MapSizeDialog = $J.load('net.sf.freecol.client.gui.dialog.MapSizeDialog');
  MonarchDialog = $J.load('net.sf.freecol.client.gui.dialog.MonarchDialog');
  NativeDemandDialog = $J.load('net.sf.freecol.client.gui.dialog.NativeDemandDialog');
  NegotiationDialog = $J.load('net.sf.freecol.client.gui.dialog.NegotiationDialog');
  ParametersDialog = $J.load('net.sf.freecol.client.gui.dialog.ParametersDialog');
  PreCombatDialog = $J.load('net.sf.freecol.client.gui.dialog.PreCombatDialog');
  RiverStyleDialog = $J.load('net.sf.freecol.client.gui.dialog.RiverStyleDialog');
  SaveDialog = $J.load('net.sf.freecol.client.gui.dialog.SaveDialog');
  ScaleMapSizeDialog = $J.load('net.sf.freecol.client.gui.dialog.ScaleMapSizeDialog');
  SelectAmountDialog = $J.load('net.sf.freecol.client.gui.dialog.SelectAmountDialog');
  SelectDestinationDialog = $J.load('net.sf.freecol.client.gui.dialog.SelectDestinationDialog');
  SelectTributeAmountDialog = $J.load('net.sf.freecol.client.gui.dialog.SelectTributeAmountDialog');
  VictoryDialog = $J.load('net.sf.freecol.client.gui.dialog.VictoryDialog');
  WarehouseDialog = $J.load('net.sf.freecol.client.gui.dialog.WarehouseDialog');
  AboutPanel = $J.load('net.sf.freecol.client.gui.panel.AboutPanel');
  BuildQueuePanel = $J.load('net.sf.freecol.client.gui.panel.BuildQueuePanel');
  ChatPanel = $J.load('net.sf.freecol.client.gui.panel.ChatPanel');
  ColorChooserPanel = $J.load('net.sf.freecol.client.gui.panel.ColorChooserPanel');
  DeclarationPanel = $J.load('net.sf.freecol.client.gui.panel.DeclarationPanel');
  ErrorPanel = $J.load('net.sf.freecol.client.gui.panel.ErrorPanel');
  EuropePanel = $J.load('net.sf.freecol.client.gui.panel.EuropePanel');
  EventPanel = $J.load('net.sf.freecol.client.gui.panel.EventPanel');
  FindSettlementPanel = $J.load('net.sf.freecol.client.gui.panel.FindSettlementPanel');
  IndianSettlementPanel = $J.load('net.sf.freecol.client.gui.panel.IndianSettlementPanel');
  InformationPanel = $J.load('net.sf.freecol.client.gui.panel.InformationPanel');
  NewPanel = $J.load('net.sf.freecol.client.gui.panel.NewPanel');
  PurchasePanel = $J.load('net.sf.freecol.client.gui.panel.PurchasePanel');
  RecruitPanel = $J.load('net.sf.freecol.client.gui.panel.RecruitPanel');
  ServerListPanel = $J.load('net.sf.freecol.client.gui.panel.ServerListPanel');
  StatisticsPanel = $J.load('net.sf.freecol.client.gui.panel.StatisticsPanel');
  TilePanel = $J.load('net.sf.freecol.client.gui.panel.TilePanel');
  TradeRouteInputPanel = $J.load('net.sf.freecol.client.gui.panel.TradeRouteInputPanel');
  TradeRoutePanel = $J.load('net.sf.freecol.client.gui.panel.TradeRoutePanel');
  TrainPanel = $J.load('net.sf.freecol.client.gui.panel.TrainPanel');
  WorkProductionPanel = $J.load('net.sf.freecol.client.gui.panel.WorkProductionPanel');
  ColopediaPanel = $J.load('net.sf.freecol.client.gui.panel.colopedia.ColopediaPanel');
  CompactLabourReport = $J.load('net.sf.freecol.client.gui.panel.report.CompactLabourReport');
  ReportCargoPanel = $J.load('net.sf.freecol.client.gui.panel.report.ReportCargoPanel');
  ReportClassicColonyPanel = $J.load('net.sf.freecol.client.gui.panel.report.ReportClassicColonyPanel');
  ReportCompactColonyPanel = $J.load('net.sf.freecol.client.gui.panel.report.ReportCompactColonyPanel');
  ReportContinentalCongressPanel = $J.load('net.sf.freecol.client.gui.panel.report.ReportContinentalCongressPanel');
  ReportEducationPanel = $J.load('net.sf.freecol.client.gui.panel.report.ReportEducationPanel');
  ReportExplorationPanel = $J.load('net.sf.freecol.client.gui.panel.report.ReportExplorationPanel');
  ReportForeignAffairPanel = $J.load('net.sf.freecol.client.gui.panel.report.ReportForeignAffairPanel');
  ReportHighScoresPanel = $J.load('net.sf.freecol.client.gui.panel.report.ReportHighScoresPanel');
  ReportHistoryPanel = $J.load('net.sf.freecol.client.gui.panel.report.ReportHistoryPanel');
  ReportIndianPanel = $J.load('net.sf.freecol.client.gui.panel.report.ReportIndianPanel');
  ReportLabourDetailPanel = $J.load('net.sf.freecol.client.gui.panel.report.ReportLabourDetailPanel');
  ReportLabourPanel = $J.load('net.sf.freecol.client.gui.panel.report.ReportLabourPanel');
  ReportMilitaryPanel = $J.load('net.sf.freecol.client.gui.panel.report.ReportMilitaryPanel');
  ReportNavalPanel = $J.load('net.sf.freecol.client.gui.panel.report.ReportNavalPanel');
  ReportProductionPanel = $J.load('net.sf.freecol.client.gui.panel.report.ReportProductionPanel');
  ReportReligiousPanel = $J.load('net.sf.freecol.client.gui.panel.report.ReportReligiousPanel');
  ReportRequirementsPanel = $J.load('net.sf.freecol.client.gui.panel.report.ReportRequirementsPanel');
  ReportTradePanel = $J.load('net.sf.freecol.client.gui.panel.report.ReportTradePanel');
  ReportTurnPanel = $J.load('net.sf.freecol.client.gui.panel.report.ReportTurnPanel');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
});
