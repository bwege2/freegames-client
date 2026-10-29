// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/dialog/NegotiationDialog.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, IllegalStateException, Logger } from '../../../../../../../jre/index.ts';
import { FreeColDialog } from './FreeColDialog.ts';
import { AbstractAction } from '../../../../../../javax/swing/AbstractAction.ts';
import { MigPanel } from '../panel/MigPanel.ts';
import { JLabel } from '../../../../../../javax/swing/JLabel.ts';

let Cursor, Dimension, DefaultComboBoxModel, ImageIcon, JButton, JComboBox, JScrollPane, JSpinner, JTextArea, ScrollPaneConstants, SpinnerNumberModel, MigLayout, ChoiceItem, FontLibrary, FreeColDialog$DialogType, Utility, FreeColDebugger, FreeColDebugger$DebugMode, Messages, Colony, ColonyTradeItem, DiplomaticTrade$TradeContext, DiplomaticTrade$TradeStatus, GoldTradeItem, Goods, GoodsContainer, GoodsTradeItem, InciteTradeItem, Player, Stance, StanceTradeItem, StringTemplate, Unit, UnitTradeItem, CollectionUtils;

/**
 * The panel that allows negotiations between players.
 * <p>
 * Panel Layout:
 * <p>
 * The Negotiation Dialog is laid out in three columns. The outer two columns are 30% of the panel's width while the
 *      center column is 40% the panel's width.
 * <p style="display: block; font-family: monospace; white-space: pre; margin: 1em 0;">
 * --------------------------------------------------------------------------
 * |                         negotiationDialog.title                        |
 * | ---------------------------------------------------------------------- |
 * |       Left Pane      |       Center Pane       |      Right Pane       |
 * |                      |      (centerPanel)      |                       |
 * | ---------------------------------------------------------------------- |
 * |                       [cancelButton][sendButton]                       |
 * --------------------------------------------------------------------------
 * <p>
 * The Left and Right Panes are laid out as follows:
 * <p style="display: block; font-family: monospace; white-space: pre; margin: 1em 0;">
 * | --------------- |
 * | gold            |
 * | --------------- |
 * | colony          |
 * | --------------- |
 * | stance          |
 * | --------------- |
 * | war declaration |
 * | --------------- |
 * TODO: Improve layout description
 */
export class NegotiationDialog extends FreeColDialog {
  static logger: Logger = null;
  static readonly HUGE_DEMAND: number = 100000;
  static readonly ADD: string = 'add';
  static readonly CLEAR: string = 'clear';
  /**
   * The other player in the negotiation (!= getMyPlayer()).
   */
  otherPlayer: Player = null;
  /**
   * The agreement under negotiation.
   */
  agreement: DiplomaticTrade = null;
  /**
   * A comment message.
   */
  comment: StringTemplate = null;
  /**
   * The panels for various negotiable data.
   */
  stancePanel: NegotiationDialog$StanceTradeItemPanel = null;
  goldOfferPanel: NegotiationDialog$GoldTradeItemPanel = null;
  goldDemandPanel: NegotiationDialog$GoldTradeItemPanel = null;
  colonyOfferPanel: NegotiationDialog$ColonyTradeItemPanel = null;
  colonyDemandPanel: NegotiationDialog$ColonyTradeItemPanel = null;
  goodsOfferPanel: NegotiationDialog$GoodsTradeItemPanel = null;
  goodsDemandPanel: NegotiationDialog$GoodsTradeItemPanel = null;
  inciteOfferPanel: NegotiationDialog$InciteTradeItemPanel = null;
  inciteDemandPanel: NegotiationDialog$InciteTradeItemPanel = null;
  unitOfferPanel: NegotiationDialog$UnitTradeItemPanel = null;
  unitDemandPanel: NegotiationDialog$UnitTradeItemPanel = null;
  /**
   * A panel showing a summary of the current agreement.
   */
  summary: JPanel = null;
  /**
   * Useful internal messages.
   */
  demand: StringTemplate = null;
  /**
   * Useful internal messages.
   */
  offer: StringTemplate = null;
  exchangeMessage: string = null;
  /**
   * Responses.
   */
  send_: ChoiceItem<DiplomaticTrade> = null;
  /**
   * Responses.
   */
  accept_: ChoiceItem<DiplomaticTrade> = null;
  /**
   * Creates a new {@code NegotiationDialog} instance.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param frame The owner frame.
   * @param our Our {@code FreeColGameObject} that is negotiating.
   * @param other The other {@code FreeColGameObject}.
   * @param agreement The {@code DiplomaticTrade} agreement that
   *     is being negotiated.
   * @param comment An optional {@code StringTemplate}
   *     commentary message.
   */
  _NegotiationDialog(freeColClient: FreeColClient, frame: JFrame, our: FreeColGameObject, other: FreeColGameObject, agreement: DiplomaticTrade, comment: StringTemplate): this {
    this._FreeColDialog$FreeColClient$JFrame(freeColClient, frame);
    this.send_ = null;
    this.accept_ = null;
    let player = this.getMyPlayer();
    let ourUnit = (our instanceof Unit) ? our : null;
    let ourColony = (our instanceof Colony) ? our : null;
    let otherUnit = (other instanceof Unit) ? other : null;
    let otherColony = (other instanceof Colony) ? other : null;
    this.otherPlayer = (other).getOwner();
    this.agreement = agreement;
    this.comment = comment;
    let nation = player.getCountryLabel();
    let otherNation = this.otherPlayer.getCountryLabel();
    this.demand = StringTemplate.template$String('negotiationDialog.demand').addStringTemplate$String$StringTemplate('%nation%', nation).addStringTemplate$String$StringTemplate('%otherNation%', otherNation);
    this.offer = StringTemplate.template$String('negotiationDialog.offer').addStringTemplate$String$StringTemplate('%nation%', nation).addStringTemplate$String$StringTemplate('%otherNation%', otherNation);
    this.exchangeMessage = Messages.message$String('negotiationDialog.exchange');
    let ns = this.igc().nationSummary(this.otherPlayer);
    let gold = (ns == null || ns.getGold() === Player.GOLD_NOT_ACCOUNTED) ? NegotiationDialog.HUGE_DEMAND : ns.getGold();
    this.goldDemandPanel = new NegotiationDialog$GoldTradeItemPanel().$o(this)._NegotiationDialog$GoldTradeItemPanel(this.otherPlayer, gold);
    gold = (player.getGold() === Player.GOLD_NOT_ACCOUNTED) ? NegotiationDialog.HUGE_DEMAND : player.getGold();
    this.goldOfferPanel = new NegotiationDialog$GoldTradeItemPanel().$o(this)._NegotiationDialog$GoldTradeItemPanel(player, gold);
    let tutorial = null;
    let context = agreement.getContext();
    {
      let goods: List<Goods>, gl: GoodsLocation;
      switch (context) {
        case DiplomaticTrade$TradeContext.CONTACT:
          if (freeColClient.tutorialMode()) {
            tutorial = StringTemplate.key$String('negotiationDialog.contact.tutorial');
          }
          this.stancePanel = new NegotiationDialog$StanceTradeItemPanel().$o(this)._NegotiationDialog$StanceTradeItemPanel(player, this.otherPlayer);
          this.inciteOfferPanel = new NegotiationDialog$InciteTradeItemPanel().$o(this)._NegotiationDialog$InciteTradeItemPanel(player, this.otherPlayer);
          this.inciteDemandPanel = new NegotiationDialog$InciteTradeItemPanel().$o(this)._NegotiationDialog$InciteTradeItemPanel(this.otherPlayer, player);
          break;
        case DiplomaticTrade$TradeContext.DIPLOMATIC:
          this.stancePanel = new NegotiationDialog$StanceTradeItemPanel().$o(this)._NegotiationDialog$StanceTradeItemPanel(player, this.otherPlayer);
          this.colonyDemandPanel = new NegotiationDialog$ColonyTradeItemPanel().$o(this)._NegotiationDialog$ColonyTradeItemPanel(this.otherPlayer);
          this.colonyOfferPanel = new NegotiationDialog$ColonyTradeItemPanel().$o(this)._NegotiationDialog$ColonyTradeItemPanel(player);
          this.goodsDemandPanel = this.goodsOfferPanel = null;
          this.inciteOfferPanel = new NegotiationDialog$InciteTradeItemPanel().$o(this)._NegotiationDialog$InciteTradeItemPanel(player, this.otherPlayer);
          this.inciteDemandPanel = new NegotiationDialog$InciteTradeItemPanel().$o(this)._NegotiationDialog$InciteTradeItemPanel(this.otherPlayer, player);
          this.unitOfferPanel = this.unitDemandPanel = null;
          break;
        case DiplomaticTrade$TradeContext.TRADE:
          this.stancePanel = null;
          this.colonyDemandPanel = this.colonyOfferPanel = null;
          goods = this.getAnyGoods();
          this.goodsDemandPanel = new NegotiationDialog$GoodsTradeItemPanel().$o(this)._NegotiationDialog$GoodsTradeItemPanel(this.otherPlayer, goods);
          gl = (ourUnit != null) ? ourUnit : ourColony;
          goods = (ourUnit != null) ? ourUnit.getGoodsList() : ourColony.getCompactGoodsList();
          for (const $it0 = goods.iterator(); $it0.hasNext(); ) {
            let g = $it0.next();
            if (g.getAmount() > GoodsContainer.CARGO_SIZE) {
              g.setAmount(GoodsContainer.CARGO_SIZE);
            }
            g.setLocation(gl);
          }
          this.goodsOfferPanel = new NegotiationDialog$GoodsTradeItemPanel().$o(this)._NegotiationDialog$GoodsTradeItemPanel(player, goods);
          this.inciteOfferPanel = this.inciteDemandPanel = null;
          this.unitDemandPanel = new NegotiationDialog$UnitTradeItemPanel().$o(this)._NegotiationDialog$UnitTradeItemPanel(this.otherPlayer, this.getUnitUnitList(null));
          this.unitOfferPanel = new NegotiationDialog$UnitTradeItemPanel().$o(this)._NegotiationDialog$UnitTradeItemPanel(player, ((ourUnit != null) ? this.getUnitUnitList(ourUnit) : ourColony.getUnitList()));
          break;
        case DiplomaticTrade$TradeContext.TRIBUTE:
          this.stancePanel = new NegotiationDialog$StanceTradeItemPanel().$o(this)._NegotiationDialog$StanceTradeItemPanel(player, this.otherPlayer);
          this.colonyDemandPanel = this.colonyOfferPanel = null;
          this.goodsDemandPanel = this.goodsOfferPanel = null;
          this.inciteOfferPanel = new NegotiationDialog$InciteTradeItemPanel().$o(this)._NegotiationDialog$InciteTradeItemPanel(player, this.otherPlayer);
          this.inciteDemandPanel = new NegotiationDialog$InciteTradeItemPanel().$o(this)._NegotiationDialog$InciteTradeItemPanel(this.otherPlayer, player);
          this.unitOfferPanel = this.unitDemandPanel = null;
          break;
        default:
          throw new IllegalStateException('Bogus trade context: ' + $J.str(context));
      }
    }
    this.summary = new MigPanel()._MigPanel$LayoutManager(new MigLayout()._MigLayout$String$String('wrap 2', '[20px:n:n][]'));
    this.summary.setOpaque(false);
    this.summary.add$Component$Object(Utility.localizedTextArea$StringTemplate(comment), 'center, span 2');
    let panel = new MigPanel()._MigPanel$LayoutManager(new MigLayout()._MigLayout$String$String$String('wrap 3', '[30%|40%|30%]', ''));
    panel.add$Component$Object(Utility.localizedHeader('negotiationDialog.title.' + agreement.getContext().getKey(), Utility.FONTSPEC_TITLE), 'span 3, center');
    let labelDemandMessage = Utility.localizedTextArea$StringTemplate(this.demand);
    let font = FontLibrary.getScaledFont$String('normal-bold-tiny');
    labelDemandMessage.setFont(font);
    panel.add$Component(labelDemandMessage);
    let blank = new JTextArea()._JTextArea$String(' ');
    blank.setVisible(false);
    panel.add$Component$Object(blank, '');
    let labelOfferMessage = Utility.localizedTextArea$StringTemplate(this.offer);
    labelOfferMessage.setFont(font);
    panel.add$Component(labelOfferMessage);
    panel.add$Component(this.goldDemandPanel);
    let centerPanel = new MigPanel()._MigPanel$LayoutManager(new MigLayout()._MigLayout$String('wrap 1'));
    centerPanel.setMinimumSize(new Dimension()._Dimension$int$int(250, 50));
    if (tutorial != null) {
      let tutArea = Utility.localizedTextArea$StringTemplate$int(tutorial, 30);
      centerPanel.add$Component$Object(tutArea, 'center');
    }
    let scroll = new JScrollPane()._JScrollPane$Component$int$int(this.summary, ScrollPaneConstants.VERTICAL_SCROLLBAR_AS_NEEDED, ScrollPaneConstants.HORIZONTAL_SCROLLBAR_NEVER);
    scroll.getViewport().setOpaque(false);
    scroll.setBorder(null);
    centerPanel.add$Component$Object(scroll, 'top, width 100%');
    panel.add$Component$Object(centerPanel, 'spany, top');
    panel.add$Component(this.goldOfferPanel);
    if (this.colonyDemandPanel != null) {
      panel.add$Component(this.colonyDemandPanel);
      panel.add$Component(this.colonyOfferPanel);
    }
    if (this.stancePanel != null) {
      panel.add$Component$Object(this.stancePanel, 'skip');
    }
    if (this.goodsDemandPanel != null) {
      panel.add$Component(this.goodsDemandPanel);
      panel.add$Component(this.goodsOfferPanel);
    }
    if (this.inciteDemandPanel != null) {
      panel.add$Component(this.inciteDemandPanel);
      panel.add$Component(this.inciteOfferPanel);
    }
    if (this.unitDemandPanel != null) {
      panel.add$Component(this.unitDemandPanel);
      panel.add$Component(this.unitOfferPanel);
    }
    if (FreeColDebugger.isInDebugMode$DebugMode(FreeColDebugger$DebugMode.MENUS)) {
      panel.add$Component(new JLabel()._JLabel$String('Version = ' + agreement.getVersion()));
    }
    let str: string;
    let c = FreeColDialog.choices();
    if (agreement.getVersion() > 0) {
      str = Messages.message$String('negotiationDialog.accept');
      c.add(this.accept_ = new ChoiceItem()._ChoiceItem$String$Object(str, null));
    }
    str = Messages.message$String('negotiationDialog.send');
    c.add(this.send_ = new ChoiceItem()._ChoiceItem$String$Object(str, null).okOption());
    if (agreement.getVersion() > 0 || context !== DiplomaticTrade$TradeContext.CONTACT) {
      str = Messages.message$String('negotiationDialog.cancel');
      c.add(new ChoiceItem()._ChoiceItem$String$Object(str, null).cancelOption().defaultOption());
    }
    this.updateDialog(false);
    let icon = new ImageIcon()._ImageIcon$Image((otherColony != null) ? this.getImageLibrary().getScaledSettlementImage(otherColony) : this.getImageLibrary().getScaledUnitImage$Unit(otherUnit));
    this.initializeDialog(frame, FreeColDialog$DialogType.QUESTION, true, panel, icon, c);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getResponse(): DiplomaticTrade {
    let value = this.getValue();
    let s = (value == null) ? DiplomaticTrade$TradeStatus.REJECT_TRADE : (value === this.accept_) ? DiplomaticTrade$TradeStatus.ACCEPT_TRADE : (value === this.send_) ? DiplomaticTrade$TradeStatus.PROPOSE_TRADE : DiplomaticTrade$TradeStatus.REJECT_TRADE;
    this.agreement.setStatus(s);
    return this.agreement;
  }
  /**
   * Gets a list of all possible storable goods (one cargo load).
   * Note that these goods are fictional.  They are the goods that
   * *might* be in the other player's store.  Therefore they have a
   * bogus location (i.e. not the actual goods container).
   *
   * @return A list of storable {@code Goods}.
   */
  getAnyGoods(): List<Goods> {
    let game = this.getGame();
    let spec = this.getSpecification();
    return CollectionUtils.transform$Collection$Predicate$Function(spec.getStorableGoodsTypeList(), CollectionUtils.alwaysTrue(), (gt) => new Goods()._Goods$Game$Location$GoodsType$int(game, null, gt, GoodsContainer.CARGO_SIZE));
  }
  /**
   * Get a list of units to offer that are associated with a given unit.
   *
   * @param unit The {@code Unit} that is trading.
   * @return A list of {@code Unit}s.
   */
  getUnitUnitList(unit: Unit): List<Unit> {
    let ul = new ArrayList();
    if (unit != null) {
      if (unit.isCarrier()) {
        ul.addAll(unit.getUnitList());
      } else if (unit.isOnCarrier()) {
        ul.addAll(unit.getCarrier().getUnitList());
      } else {
        ul.add(unit);
      }
    }
    return ul;
  }
  /**
   * Update the entire dialog.
   *
   * @param changed If true, the agreement has changed, and the accept button
   *     needs to be disabled
   */
  updateDialog(changed: boolean): void {
    if (this.goldOfferPanel != null) {
      this.goldOfferPanel.update$DiplomaticTrade(this.agreement);
    }
    if (this.stancePanel != null) {
      this.stancePanel.update$DiplomaticTrade(this.agreement);
    }
    if (this.colonyOfferPanel != null) {
      this.colonyOfferPanel.update$DiplomaticTrade$NegotiationDialog_ColonyTradeItemPanel(this.agreement);
    }
    if (this.colonyDemandPanel != null) {
      this.colonyDemandPanel.update$DiplomaticTrade$NegotiationDialog_ColonyTradeItemPanel(this.agreement);
    }
    if (this.goodsOfferPanel != null) {
      this.goodsOfferPanel.update$DiplomaticTrade(this.agreement);
    }
    if (this.goodsDemandPanel != null) {
      this.goodsDemandPanel.update$DiplomaticTrade(this.agreement);
    }
    if (this.inciteOfferPanel != null) {
      this.inciteOfferPanel.update$DiplomaticTrade(this.agreement);
    }
    if (this.inciteDemandPanel != null) {
      this.inciteDemandPanel.update$DiplomaticTrade(this.agreement);
    }
    if (this.unitOfferPanel != null) {
      this.unitOfferPanel.update$DiplomaticTrade$NegotiationDialog_UnitTradeItemPanel(this.agreement);
    }
    if (this.unitDemandPanel != null) {
      this.unitDemandPanel.update$DiplomaticTrade$NegotiationDialog_UnitTradeItemPanel(this.agreement);
    }
    if (changed && this.accept_ != null) {
      this.accept_.setEnabled(false);
    }
    this.updateSummary();
  }
  /**
   * Gets a trade item button for a given item.
   *
   * @param item The {@code TradeItem} to make a button for.
   * @param saleDir Boolean to indicate the EU price for sale (T) or buy (F)
   * @return A new {@code JButton} for the item.
   */
  getTradeItemButton(item: TradeItem, saleDir: boolean): JButton {
    let market = this.getMyPlayer().getMarket();
    let button = new JButton()._JButton$Action(new NegotiationDialog$RemoveAction().$o(this)._NegotiationDialog$RemoveAction(item));
    if (item.getGoods() != null) {
      let buyPriceTotal = market.getBidPrice(item.getGoods().getType(), item.getGoods().getAmount());
      let salePriceTotal = market.getSalePrice$GoodsType$int(item.getGoods().getType(), item.getGoods().getAmount());
      if (saleDir) {
        button.setText(Messages.message$StringTemplate(item.getLabel()) + ' ' + Messages.message$StringTemplate(StringTemplate.template$String('negotiationDialog.euSalePrice').addAmount('%priceTotal%', salePriceTotal)));
      } else {
        button.setText(Messages.message$StringTemplate(item.getLabel()) + ' ' + Messages.message$StringTemplate(StringTemplate.template$String('negotiationDialog.euBuyPrice').addAmount('%priceTotal%', buyPriceTotal)));
      }
    } else {
      button.setText(Messages.message$StringTemplate(item.getLabel()));
    }
    button.setMargin(Utility.EMPTY_MARGIN);
    button.setOpaque(false);
    button.setForeground(Utility.getLinkColor());
    button.setBorder(Utility.blankBorder(0, 0, 0, 0));
    button.setCursor$Cursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
    return button;
  }
  /**
   * Update the text summary of the proposed transaction.
   */
  updateSummary(): void {
    let player = this.getMyPlayer();
    this.summary.removeAll();
    this.summary.add$Component$Object(Utility.localizedTextArea$StringTemplate(this.comment), 'center, span 2');
    let offers = this.agreement.getItemsGivenBy(player);
    if (!offers.isEmpty()) {
      this.summary.add$Component$Object(Utility.localizedLabel$StringTemplate(this.offer), 'span');
      for (const $it1 = offers.iterator(); $it1.hasNext(); ) {
        let item = $it1.next();
        this.summary.add$Component$Object(this.getTradeItemButton(item, true), 'skip');
      }
    }
    let demands = this.agreement.getItemsGivenBy(this.otherPlayer);
    if (!demands.isEmpty()) {
      if (offers.isEmpty()) {
        this.summary.add$Component$Object(Utility.localizedLabel$StringTemplate(this.demand), 'span');
      } else {
        this.summary.add$Component$Object(new JLabel()._JLabel$String(this.exchangeMessage), 'newline 20, span');
      }
      for (const $it2 = demands.iterator(); $it2.hasNext(); ) {
        let item = $it2.next();
        this.summary.add$Component$Object(this.getTradeItemButton(item, false), 'skip');
      }
    }
  }
  /**
   * Remove trade items of a given type.
   *
   * @param itemClass The class of {@code TradeItem} to remove.
   */
  removeTradeItems(itemClass: JClass<TradeItem>): void {
    this.agreement.removeType(itemClass);
    this.updateDialog(true);
  }
  /**
   * Adds a {@code ColonyTradeItem} to the list of TradeItems.
   *
   * @param source The sourced {@code Player}.
   * @param colony The {@code Colony} to add.
   */
  addColonyTradeItem(source: Player, colony: Colony): void {
    let player = this.getMyPlayer();
    let destination = (source === this.otherPlayer) ? player : this.otherPlayer;
    this.agreement.add(new ColonyTradeItem()._ColonyTradeItem$Game$Player$Player$Colony(this.getGame(), source, destination, colony));
    this.updateDialog(true);
  }
  /**
   * Adds a {@code GoldTradeItem} to the list of TradeItems.
   *
   * @param source The source {@code Player}.
   * @param amount The amount of gold.
   */
  addGoldTradeItem(source: Player, amount: number): void {
    let player = this.getMyPlayer();
    let destination = (source === this.otherPlayer) ? player : this.otherPlayer;
    this.agreement.add(new GoldTradeItem()._GoldTradeItem$Game$Player$Player$int(this.getGame(), source, destination, amount));
    this.updateDialog(true);
  }
  /**
   * Adds a {@code GoodsTradeItem} to the list of TradeItems.
   *
   * @param source The source {@code Player}.
   * @param goods The {@code Goods} to add.
   */
  addGoodsTradeItem(source: Player, goods: Goods): void {
    let player = this.getMyPlayer();
    let destination = (source === this.otherPlayer) ? player : this.otherPlayer;
    this.agreement.add(new GoodsTradeItem()._GoodsTradeItem$Game$Player$Player$Goods(this.getGame(), source, destination, goods));
    this.updateDialog(true);
  }
  /**
   * Add an {@code InciteTradeItem} to the list of trade items.
   *
   * @param source The source {@code Player}.
   * @param victim The {@code Player} to be attacked.
   */
  addInciteTradeItem(source: Player, victim: Player): void {
    let player = this.getMyPlayer();
    let destination = (source === this.otherPlayer) ? player : this.otherPlayer;
    this.agreement.add(new InciteTradeItem()._InciteTradeItem$Game$Player$Player$Player(this.getGame(), source, destination, victim));
    this.updateDialog(true);
  }
  /**
   * Trade a stance change between the players.
   *
   * @param stance The {@code Stance} to trade.
   */
  addStanceTradeItem(stance: Stance): void {
    let player = this.getMyPlayer();
    this.agreement.add(new StanceTradeItem()._StanceTradeItem$Game$Player$Player$Stance(this.getGame(), this.otherPlayer, player, stance));
    this.updateDialog(true);
  }
  /**
   * Adds a {@code UnitTradeItem} to the list of TradeItems.
   *
   * @param source The source {@code Player}.
   * @param unit The {@code Unit} to add.
   */
  addUnitTradeItem(source: Player, unit: Unit): void {
    let player = this.getMyPlayer();
    let destination = (source === this.otherPlayer) ? player : this.otherPlayer;
    this.agreement.add(new UnitTradeItem()._UnitTradeItem$Game$Player$Player$Unit(this.getGame(), source, destination, unit));
    this.updateDialog(true);
  }
  /**
   * {@inheritDoc}
   */
  removeNotify(): void {
    super.removeNotify();
    this.removeAll();
    this.stancePanel = null;
    this.goldOfferPanel = this.goldDemandPanel = null;
    this.colonyOfferPanel = this.colonyDemandPanel = null;
    this.goodsOfferPanel = this.goodsDemandPanel = null;
    this.inciteOfferPanel = this.inciteDemandPanel = null;
    this.unitOfferPanel = this.unitDemandPanel = null;
    this.summary = null;
    this.demand = this.offer = null;
    this.exchangeMessage = null;
  }
  static $clinit() {
    NegotiationDialog.logger = Logger.getLogger($J.cls(NegotiationDialog).getName());
  }
}

export class NegotiationDialog$RemoveAction extends AbstractAction {
  item: TradeItem = null;
  _NegotiationDialog$RemoveAction(item: TradeItem): this {
    this._AbstractAction$();
    this.item = item;
    return this;
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    this.$outer.agreement.remove$TradeItem(this.item);
    this.$outer.updateDialog(true);
  }
}

export class NegotiationDialog$ColonyTradeItemPanel extends MigPanel {
  source: Player = null;
  colonyBox: JComboBox<Colony> = null;
  clearButton: JButton = null;
  addButton: JButton = null;
  label: JLabel = null;
  allColonies: List<Colony> = null;
  /**
   * Creates a new {@code ColonyTradeItemPanel} instance.
   *
   * @param source The {@code Player} source.
   */
  _NegotiationDialog$ColonyTradeItemPanel(source: Player): this {
    this._MigPanel$LayoutManager(new MigLayout()._MigLayout$String$String$String('wrap 1', '', ''));
    this.source = source;
    this.colonyBox = new JComboBox()._JComboBox$();
    this.clearButton = Utility.localizedButton$String('negotiationDialog.clear');
    this.clearButton.addActionListener($J.fn(this, 'actionPerformed'));
    this.clearButton.setActionCommand(NegotiationDialog.CLEAR);
    this.addButton = Utility.localizedButton$String('negotiationDialog.add');
    this.addButton.addActionListener($J.fn(this, 'actionPerformed'));
    this.addButton.setActionCommand(NegotiationDialog.ADD);
    this.label = Utility.localizedLabel$String(Messages.getName$String('model.tradeItem.colony'));
    this.allColonies = source.getColonyList();
    this.setBorder(Utility.getSimpleLineBorder());
    this.add$Component(this.label);
    this.add$Component(this.colonyBox);
    this.add$Component$Object(this.clearButton, 'split 2');
    this.add$Component(this.addButton);
    this.setSize$Dimension(this.getPreferredSize$());
    return this;
  }
  /**
   * Update this panel.
   *
   * @param dt The {@code DiplomaticTrade} to update with.
   */
  update$DiplomaticTrade$NegotiationDialog_ColonyTradeItemPanel(dt: DiplomaticTrade): void {
    if (!this.source.isEuropean()) {
      return;
    }
    let listeners = this.colonyBox.getActionListeners();
    for (let al of listeners) {
      this.colonyBox.removeActionListener(al);
    }
    let available = new ArrayList(this.allColonies);
    for (const $it3 = dt.getColoniesGivenBy(this.source).iterator(); $it3.hasNext(); ) {
      let c = $it3.next();
      if (available.contains(c)) {
        available.remove(c);
      } else {
        this.allColonies.add(c);
      }
    }
    this.colonyBox.removeAllItems();
    for (const $it4 = available.iterator(); $it4.hasNext(); ) {
      let c = $it4.next();
      this.colonyBox.addItem(c);
    }
    let enable = !available.isEmpty();
    this.clearButton.setEnabled(!enable);
    this.addButton.setEnabled(enable);
    this.colonyBox.setEnabled(enable);
    this.label.setEnabled(enable);
    for (let al of listeners) {
      this.colonyBox.addActionListener(al);
    }
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    let command = ae.getActionCommand();
    if (null != command) {
      switch (command) {
        case NegotiationDialog.ADD:
          this.$outer.addColonyTradeItem(this.source, this.colonyBox.getSelectedItem());
          break;
        case NegotiationDialog.CLEAR:
          this.$outer.removeTradeItems($J.cls(ColonyTradeItem));
          break;
        default:
          NegotiationDialog.logger.warning('Bad command: ' + command);
          break;
      }
    }
  }
}

export class NegotiationDialog$GoldTradeItemPanel extends MigPanel {
  source: Player = null;
  spinner: JSpinner = null;
  /**
   * Creates a new {@code GoldTradeItemPanel} instance.
   *
   * @param source The {@code Player} that is trading.
   * @param gold The maximum amount of gold to trade.
   */
  _NegotiationDialog$GoldTradeItemPanel(source: Player, gold: number): this {
    this._MigPanel$LayoutManager(new MigLayout()._MigLayout$String$String$String('wrap 1', '', ''));
    this.source = source;
    this.spinner = new JSpinner()._JSpinner$SpinnerModel(new SpinnerNumberModel()._SpinnerNumberModel$int$int$int$int(0, 0, gold, 1));
    let clearButton = Utility.localizedButton$String('negotiationDialog.clear');
    clearButton.addActionListener($J.fn(this, 'actionPerformed'));
    clearButton.setActionCommand(NegotiationDialog.CLEAR);
    let addButton = Utility.localizedButton$String('negotiationDialog.add');
    addButton.addActionListener($J.fn(this, 'actionPerformed'));
    addButton.setActionCommand(NegotiationDialog.ADD);
    (this.spinner.getEditor()).getTextField().setColumns(5);
    this.setBorder(Utility.getSimpleLineBorder());
    this.add$Component(Utility.localizedLabel$String(Messages.getName$String('model.tradeItem.gold')));
    this.add$Component(Utility.localizedLabel$StringTemplate(StringTemplate.template$String('negotiationDialog.goldAvailable').addAmount('%amount%', gold)));
    this.add$Component(this.spinner);
    this.add$Component$Object(clearButton, 'split 2');
    this.add$Component(addButton);
    this.setSize$Dimension(this.getPreferredSize$());
    return this;
  }
  /**
   * Update this panel.
   *
   * @param dt The {@code DiplomaticTrade} to update with.
   */
  update$DiplomaticTrade(dt: DiplomaticTrade): void {
    let gold = dt.getGoldGivenBy(this.source);
    if (gold >= 0) {
      let model = this.spinner.getModel();
      model.setValue(gold);
    }
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    let command = ae.getActionCommand();
    if (null != command) {
      {
        let amount: number;
        switch (command) {
          case NegotiationDialog.ADD:
            amount = (this.spinner.getValue());
            this.$outer.addGoldTradeItem(this.source, amount);
            break;
          case NegotiationDialog.CLEAR:
            this.$outer.removeTradeItems($J.cls(GoldTradeItem));
            break;
          default:
            NegotiationDialog.logger.warning('Bad command: ' + command);
            break;
        }
      }
    }
  }
}

export class NegotiationDialog$GoodsTradeItemPanel extends MigPanel {
  source: Player = null;
  goodsBox: JComboBox<Goods> = null;
  clearButton: JButton = null;
  addButton: JButton = null;
  label: JLabel = null;
  allGoods: List<Goods> = null;
  /**
   * Creates a new {@code GoodsTradeItemPanel} instance.
   *
   * @param source The {@code Player} nominally in possession of the
   *     goods (this may be totally fictional).
   * @param allGoods The {@code Goods} to trade.
   */
  _NegotiationDialog$GoodsTradeItemPanel(source: Player, allGoods: List<Goods>): this {
    this._MigPanel$LayoutManager(new MigLayout()._MigLayout$String$String$String('wrap 1', '', ''));
    this.source = source;
    this.goodsBox = new JComboBox()._JComboBox$ComboBoxModel(new DefaultComboBoxModel()._DefaultComboBoxModel$());
    this.goodsBox.setRenderer(new NegotiationDialog$GoodsTradeItemPanel$GoodsBoxRenderer().$o(this)._NegotiationDialog$GoodsTradeItemPanel$GoodsBoxRenderer());
    this.clearButton = Utility.localizedButton$String('negotiationDialog.clear');
    this.clearButton.addActionListener($J.fn(this, 'actionPerformed'));
    this.clearButton.setActionCommand(NegotiationDialog.CLEAR);
    this.addButton = Utility.localizedButton$String('negotiationDialog.add');
    this.addButton.addActionListener($J.fn(this, 'actionPerformed'));
    this.addButton.setActionCommand(NegotiationDialog.ADD);
    this.label = Utility.localizedLabel$String(Messages.nameKey$String('model.tradeItem.goods'));
    this.allGoods = allGoods;
    this.setBorder(Utility.getSimpleLineBorder());
    this.add$Component(this.label);
    this.add$Component(this.goodsBox);
    this.add$Component$Object(this.clearButton, 'split 2');
    this.add$Component(this.addButton);
    this.setSize$Dimension(this.getPreferredSize$());
    return this;
  }
  /**
   * Update this panel.
   *
   * @param dt The {@code DiplomaticTrade} to update with.
   */
  update$DiplomaticTrade(dt: DiplomaticTrade): void {
    let listeners = this.goodsBox.getActionListeners();
    for (let al of listeners) {
      this.goodsBox.removeActionListener(al);
    }
    let available = new ArrayList(this.allGoods);
    for (const $it5 = dt.getGoodsGivenBy(this.source).iterator(); $it5.hasNext(); ) {
      let goods = $it5.next();
      for (let i = 0; i < available.size(); i++) {
        let g = available.get(i);
        if (g.getType() === goods.getType()) {
          if (g.getAmount() <= goods.getAmount()) {
            available.removeAt(i);
          } else {
            g.setAmount((g.getAmount() - goods.getAmount()) | 0);
          }
          break;
        }
      }
    }
    this.goodsBox.removeAllItems();
    for (const $it6 = available.iterator(); $it6.hasNext(); ) {
      let g = $it6.next();
      this.goodsBox.addItem(g);
    }
    let enable = !available.isEmpty();
    this.label.setEnabled(enable);
    this.clearButton.setEnabled(!enable);
    this.addButton.setEnabled(enable);
    this.goodsBox.setEnabled(enable);
    for (let al of listeners) {
      this.goodsBox.addActionListener(al);
    }
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    let command = ae.getActionCommand();
    if (null != command) {
      switch (command) {
        case NegotiationDialog.ADD:
          this.$outer.addGoodsTradeItem(this.source, this.goodsBox.getSelectedItem());
          break;
        case NegotiationDialog.CLEAR:
          this.$outer.removeTradeItems($J.cls(GoodsTradeItem));
          break;
        default:
          NegotiationDialog.logger.warning('Bad command: ' + command);
          break;
      }
    }
  }
}

export class NegotiationDialog$GoodsTradeItemPanel$GoodsBoxRenderer extends JLabel {
  _NegotiationDialog$GoodsTradeItemPanel$GoodsBoxRenderer(): this {
    this._JLabel$();
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getListCellRendererComponent(list: JList<Goods>, value: Goods, index: number, isSelected: boolean, cellHasFocus: boolean): Component {
    this.setText((value == null) ? '' : Messages.message$StringTemplate(value.getLabel$boolean(true)));
    return this;
  }
}

export class NegotiationDialog$InciteTradeItemPanel extends MigPanel {
  source: Player = null;
  other: Player = null;
  victimBox: JComboBox<Player> = null;
  label: JLabel = null;
  clearButton: JButton = null;
  addButton: JButton = null;
  available_: List<Player> = null;
  /**
   * Creates a new {@code InciteTradeItemPanel} instance.
   *
   * @param source The {@code Player} that is trading.
   * @param other The {@code Player} negotiated with.
   */
  _NegotiationDialog$InciteTradeItemPanel(source: Player, other: Player): this {
    this._MigPanel$LayoutManager(new MigLayout()._MigLayout$String$String$String('wrap 1', '', ''));
    this.available_ = new ArrayList();
    this.source = source;
    this.other = other;
    this.victimBox = new JComboBox()._JComboBox$ComboBoxModel(new DefaultComboBoxModel()._DefaultComboBoxModel$());
    this.victimBox.setRenderer(new NegotiationDialog$InciteTradeItemPanel$InciteBoxRenderer().$o(this)._NegotiationDialog$InciteTradeItemPanel$InciteBoxRenderer());
    this.clearButton = Utility.localizedButton$String('negotiationDialog.clear');
    this.clearButton.addActionListener($J.fn(this, 'actionPerformed'));
    this.clearButton.setActionCommand(NegotiationDialog.CLEAR);
    this.addButton = Utility.localizedButton$String('negotiationDialog.add');
    this.addButton.addActionListener($J.fn(this, 'actionPerformed'));
    this.addButton.setActionCommand(NegotiationDialog.ADD);
    this.label = Utility.localizedLabel$String(Messages.nameKey$String('model.tradeItem.incite'));
    this.setBorder(Utility.getSimpleLineBorder());
    this.available_.clear();
    let incitablePred = (p) => p !== this.other && this.source.getStance(p).isIncitable();
    this.available_.addAll(CollectionUtils.transform$Stream$Predicate(this.$outer.getGame().getLivePlayers([this.source]), incitablePred));
    this.add$Component(this.label);
    this.add$Component(this.victimBox);
    this.add$Component$Object(this.clearButton, 'split 2');
    this.add$Component(this.addButton);
    this.setSize$Dimension(this.getPreferredSize$());
    return this;
  }
  /**
   * Update this panel.
   *
   * @param dt The {@code DiplomaticTrade} to update with.
   */
  update$DiplomaticTrade(dt: DiplomaticTrade): void {
    let listeners = this.victimBox.getActionListeners();
    for (let al of listeners) {
      this.victimBox.removeActionListener(al);
    }
    this.victimBox.removeAllItems();
    for (const $it7 = this.available_.iterator(); $it7.hasNext(); ) {
      let p = $it7.next();
      this.victimBox.addItem(p);
    }
    let enable = !this.available_.isEmpty();
    this.label.setEnabled(enable);
    this.clearButton.setEnabled(!enable);
    this.addButton.setEnabled(enable);
    this.victimBox.setEnabled(enable);
    for (let al of listeners) {
      this.victimBox.addActionListener(al);
    }
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    let command = ae.getActionCommand();
    if (null != command) {
      {
        let victim: Player;
        switch (command) {
          case NegotiationDialog.ADD:
            victim = this.victimBox.getSelectedItem();
            if (victim != null) {
              this.$outer.addInciteTradeItem(this.source, victim);
            }
            break;
          case NegotiationDialog.CLEAR:
            this.$outer.removeTradeItems($J.cls(InciteTradeItem));
            break;
          default:
            NegotiationDialog.logger.warning('Bad command: ' + command);
            break;
        }
      }
    }
  }
}

export class NegotiationDialog$InciteTradeItemPanel$InciteBoxRenderer extends JLabel {
  _NegotiationDialog$InciteTradeItemPanel$InciteBoxRenderer(): this {
    this._JLabel$();
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getListCellRendererComponent(list: JList<Player>, value: Player, index: number, isSelected: boolean, cellHasFocus: boolean): Component {
    this.setText((value == null) ? '' : Messages.message$StringTemplate(value.getNationLabel()));
    return this;
  }
}

/**
 * Class for the stance trade panel.  Access needs to be public so
 * that comboBoxLabel() is externally visible.
 */
export class NegotiationDialog$StanceTradeItemPanel extends MigPanel {
  source: Player = null;
  target: Player = null;
  stanceBox: JComboBox<Stance> = null;
  clearButton: JButton = null;
  addButton: JButton = null;
  /**
   * Creates a new {@code StanceTradeItemPanel} instance.
   *
   * @param source The {@code Player} offering the stance change.
   * @param target The {@code Player} to consider the stance change.
   */
  _NegotiationDialog$StanceTradeItemPanel(source: Player, target: Player): this {
    this._MigPanel$LayoutManager(new MigLayout()._MigLayout$String$String$String('wrap 1', '', ''));
    this.source = source;
    this.target = target;
    this.stanceBox = new JComboBox()._JComboBox$ComboBoxModel(new DefaultComboBoxModel()._DefaultComboBoxModel$());
    this.stanceBox.setRenderer(new NegotiationDialog$StanceTradeItemPanel$StanceBoxRenderer().$o(this)._NegotiationDialog$StanceTradeItemPanel$StanceBoxRenderer());
    this.clearButton = Utility.localizedButton$String('negotiationDialog.clear');
    this.clearButton.addActionListener($J.fn(this, 'actionPerformed'));
    this.clearButton.setActionCommand(NegotiationDialog.CLEAR);
    this.addButton = Utility.localizedButton$String('negotiationDialog.add');
    this.addButton.addActionListener($J.fn(this, 'actionPerformed'));
    this.addButton.setActionCommand(NegotiationDialog.ADD);
    this.setBorder(Utility.getSimpleLineBorder());
    this.add$Component(Utility.localizedLabel$String(Messages.nameKey$String('model.tradeItem.stance')));
    this.add$Component(this.stanceBox);
    this.add$Component$Object(this.clearButton, 'split 2');
    this.add$Component(this.addButton);
    return this;
  }
  /**
   * Select the item with a given stance.
   *
   * @param stance The {@code Stance} to select.
   */
  setSelectedValue(stance: Stance): void {
    for (let i = 0; i < this.stanceBox.getItemCount(); i++) {
      if (this.stanceBox.getItemAt(i) === stance) {
        this.stanceBox.setSelectedItem(i);
      }
    }
  }
  /**
   * Update this panel with a given trade.
   *
   * @param dt The {@code DiplomaticTrade} to update with.
   */
  update$DiplomaticTrade(dt: DiplomaticTrade): void {
    this.stanceBox.removeAllItems();
    let stance = this.source.getStance(this.target);
    if (stance !== Stance.WAR) {
      this.stanceBox.addItem(Stance.WAR);
    } else {
      this.stanceBox.addItem(Stance.CEASE_FIRE);
    }
    if (stance !== Stance.PEACE && stance !== Stance.UNCONTACTED) {
      this.stanceBox.addItem(Stance.PEACE);
    }
    if (stance === Stance.PEACE) {
      this.stanceBox.addItem(Stance.ALLIANCE);
    }
    let select = dt.getStance();
    if (select != null) {
      this.setSelectedValue(select);
    }
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    let command = ae.getActionCommand();
    if (null != command) {
      {
        let stance: Stance;
        switch (command) {
          case NegotiationDialog.ADD:
            stance = this.stanceBox.getSelectedItem();
            this.$outer.addStanceTradeItem(stance);
            break;
          case NegotiationDialog.CLEAR:
            this.$outer.removeTradeItems($J.cls(StanceTradeItem));
            break;
          default:
            NegotiationDialog.logger.warning('Bad command: ' + command);
            break;
        }
      }
    }
  }
}

export class NegotiationDialog$StanceTradeItemPanel$StanceBoxRenderer extends JLabel {
  _NegotiationDialog$StanceTradeItemPanel$StanceBoxRenderer(): this {
    this._JLabel$();
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getListCellRendererComponent(list: JList<Stance>, value: Stance, index: number, isSelected: boolean, cellHasFocus: boolean): Component {
    this.setText((value == null) ? '' : Messages.getName$Named(value));
    return this;
  }
}

export class NegotiationDialog$UnitTradeItemPanel extends MigPanel {
  source: Player = null;
  unitBox: JComboBox<Unit> = null;
  clearButton: JButton = null;
  addButton: JButton = null;
  label: JLabel = null;
  allUnits: List<Unit> = null;
  /**
   * Creates a new {@code UnitTradeItemPanel} instance.
   *
   * @param source The {@code Player} nominally in posession of the
   *     unit (this may be totally fictional).
   * @param allUnits The {@code Unit}s to trade.
   */
  _NegotiationDialog$UnitTradeItemPanel(source: Player, allUnits: List<Unit>): this {
    this._MigPanel$LayoutManager(new MigLayout()._MigLayout$String$String$String('wrap 1', '', ''));
    this.source = source;
    this.unitBox = new JComboBox()._JComboBox$ComboBoxModel(new DefaultComboBoxModel()._DefaultComboBoxModel$());
    this.unitBox.setRenderer(new NegotiationDialog$UnitTradeItemPanel$UnitBoxRenderer().$o(this)._NegotiationDialog$UnitTradeItemPanel$UnitBoxRenderer());
    this.clearButton = Utility.localizedButton$String('negotiationDialog.clear');
    this.clearButton.addActionListener($J.fn(this, 'actionPerformed'));
    this.clearButton.setActionCommand(NegotiationDialog.CLEAR);
    this.addButton = Utility.localizedButton$String('negotiationDialog.add');
    this.addButton.addActionListener($J.fn(this, 'actionPerformed'));
    this.addButton.setActionCommand(NegotiationDialog.ADD);
    this.label = Utility.localizedLabel$String(Messages.nameKey$String('model.tradeItem.unit'));
    this.allUnits = allUnits;
    this.setBorder(Utility.getSimpleLineBorder());
    this.add$Component(this.label);
    this.add$Component(this.unitBox);
    this.add$Component$Object(this.clearButton, 'split 2');
    this.add$Component(this.addButton);
    this.setSize$Dimension(this.getPreferredSize$());
    return this;
  }
  /**
   * Update this panel with a given trade.
   *
   * @param dt The {@code DiplomaticTrade} to update with.
   */
  update$DiplomaticTrade$NegotiationDialog_UnitTradeItemPanel(dt: DiplomaticTrade): void {
    let listeners = this.unitBox.getActionListeners();
    for (let al of listeners) {
      this.unitBox.removeActionListener(al);
    }
    let available = new ArrayList(this.allUnits);
    for (const $it8 = dt.getUnitsGivenBy(this.source).iterator(); $it8.hasNext(); ) {
      let u = $it8.next();
      if (available.contains(u)) {
        available.remove(u);
      } else {
        this.allUnits.add(u);
      }
    }
    this.unitBox.removeAllItems();
    for (const $it9 = available.iterator(); $it9.hasNext(); ) {
      let u = $it9.next();
      this.unitBox.addItem(u);
    }
    let enable = !available.isEmpty();
    this.label.setEnabled(enable);
    this.clearButton.setEnabled(!enable);
    this.addButton.setEnabled(enable);
    this.unitBox.setEnabled(enable);
    for (let al of listeners) {
      this.unitBox.addActionListener(al);
    }
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    let command = ae.getActionCommand();
    if (null != command) {
      switch (command) {
        case NegotiationDialog.ADD:
          this.$outer.addUnitTradeItem(this.source, this.unitBox.getSelectedItem());
          break;
        case NegotiationDialog.CLEAR:
          this.$outer.removeTradeItems($J.cls(UnitTradeItem));
          break;
        default:
          NegotiationDialog.logger.warning('Bad command: ' + command);
          break;
      }
    }
  }
}

export class NegotiationDialog$UnitTradeItemPanel$UnitBoxRenderer extends JLabel {
  _NegotiationDialog$UnitTradeItemPanel$UnitBoxRenderer(): this {
    this._JLabel$();
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getListCellRendererComponent(list: JList<Unit>, value: Unit, index: number, isSelected: boolean, cellHasFocus: boolean): Component {
    this.setText((value == null) ? '' : value.getDescription$());
    return this;
  }
}

$J.define(NegotiationDialog, 'net.sf.freecol.client.gui.dialog.NegotiationDialog', { kind: 'class', sup: 'net.sf.freecol.client.gui.dialog.FreeColDialog', ctors: { 'net.sf.freecol.client.FreeColClient,javax.swing.JFrame,net.sf.freecol.common.model.FreeColGameObject,net.sf.freecol.common.model.FreeColGameObject,net.sf.freecol.common.model.DiplomaticTrade,net.sf.freecol.common.model.StringTemplate': '_NegotiationDialog' }, returns: { 'getAnyGoods': 'java.util.List', 'getResponse': 'net.sf.freecol.common.model.DiplomaticTrade' }, clinit: true, lazy: ['logger'] });
$J.define(NegotiationDialog$RemoveAction, 'net.sf.freecol.client.gui.dialog.NegotiationDialog$RemoveAction', { kind: 'class', sup: 'javax.swing.AbstractAction', ctors: { 'net.sf.freecol.common.model.TradeItem': '_NegotiationDialog$RemoveAction' }, inner: true });
$J.define(NegotiationDialog$ColonyTradeItemPanel, 'net.sf.freecol.client.gui.dialog.NegotiationDialog$ColonyTradeItemPanel', { kind: 'class', ifaces: ['java.awt.event.ActionListener'], sup: 'net.sf.freecol.client.gui.panel.MigPanel', ctors: { 'net.sf.freecol.common.model.Player': '_NegotiationDialog$ColonyTradeItemPanel' }, meths: { 'update(net.sf.freecol.common.model.DiplomaticTrade)': 'update$DiplomaticTrade$NegotiationDialog_ColonyTradeItemPanel' }, inner: true });
$J.define(NegotiationDialog$GoldTradeItemPanel, 'net.sf.freecol.client.gui.dialog.NegotiationDialog$GoldTradeItemPanel', { kind: 'class', ifaces: ['java.awt.event.ActionListener'], sup: 'net.sf.freecol.client.gui.panel.MigPanel', ctors: { 'net.sf.freecol.common.model.Player,int': '_NegotiationDialog$GoldTradeItemPanel' }, meths: { 'update(net.sf.freecol.common.model.DiplomaticTrade)': 'update$DiplomaticTrade' }, inner: true });
$J.define(NegotiationDialog$GoodsTradeItemPanel, 'net.sf.freecol.client.gui.dialog.NegotiationDialog$GoodsTradeItemPanel', { kind: 'class', ifaces: ['java.awt.event.ActionListener'], sup: 'net.sf.freecol.client.gui.panel.MigPanel', ctors: { 'net.sf.freecol.common.model.Player,java.util.List': '_NegotiationDialog$GoodsTradeItemPanel' }, meths: { 'update(net.sf.freecol.common.model.DiplomaticTrade)': 'update$DiplomaticTrade' }, inner: true });
$J.define(NegotiationDialog$GoodsTradeItemPanel$GoodsBoxRenderer, 'net.sf.freecol.client.gui.dialog.NegotiationDialog$GoodsTradeItemPanel$GoodsBoxRenderer', { kind: 'class', ifaces: ['javax.swing.ListCellRenderer'], sup: 'javax.swing.JLabel', ctors: { '': '_NegotiationDialog$GoodsTradeItemPanel$GoodsBoxRenderer' }, inner: true });
$J.define(NegotiationDialog$InciteTradeItemPanel, 'net.sf.freecol.client.gui.dialog.NegotiationDialog$InciteTradeItemPanel', { kind: 'class', ifaces: ['java.awt.event.ActionListener'], sup: 'net.sf.freecol.client.gui.panel.MigPanel', ctors: { 'net.sf.freecol.common.model.Player,net.sf.freecol.common.model.Player': '_NegotiationDialog$InciteTradeItemPanel' }, meths: { 'update(net.sf.freecol.common.model.DiplomaticTrade)': 'update$DiplomaticTrade' }, inner: true });
$J.define(NegotiationDialog$InciteTradeItemPanel$InciteBoxRenderer, 'net.sf.freecol.client.gui.dialog.NegotiationDialog$InciteTradeItemPanel$InciteBoxRenderer', { kind: 'class', ifaces: ['javax.swing.ListCellRenderer'], sup: 'javax.swing.JLabel', ctors: { '': '_NegotiationDialog$InciteTradeItemPanel$InciteBoxRenderer' }, inner: true });
$J.define(NegotiationDialog$StanceTradeItemPanel, 'net.sf.freecol.client.gui.dialog.NegotiationDialog$StanceTradeItemPanel', { kind: 'class', ifaces: ['java.awt.event.ActionListener'], sup: 'net.sf.freecol.client.gui.panel.MigPanel', ctors: { 'net.sf.freecol.common.model.Player,net.sf.freecol.common.model.Player': '_NegotiationDialog$StanceTradeItemPanel' }, meths: { 'update(net.sf.freecol.common.model.DiplomaticTrade)': 'update$DiplomaticTrade' }, inner: true });
$J.define(NegotiationDialog$StanceTradeItemPanel$StanceBoxRenderer, 'net.sf.freecol.client.gui.dialog.NegotiationDialog$StanceTradeItemPanel$StanceBoxRenderer', { kind: 'class', ifaces: ['javax.swing.ListCellRenderer'], sup: 'javax.swing.JLabel', ctors: { '': '_NegotiationDialog$StanceTradeItemPanel$StanceBoxRenderer' }, inner: true });
$J.define(NegotiationDialog$UnitTradeItemPanel, 'net.sf.freecol.client.gui.dialog.NegotiationDialog$UnitTradeItemPanel', { kind: 'class', ifaces: ['java.awt.event.ActionListener'], sup: 'net.sf.freecol.client.gui.panel.MigPanel', ctors: { 'net.sf.freecol.common.model.Player,java.util.List': '_NegotiationDialog$UnitTradeItemPanel' }, meths: { 'update(net.sf.freecol.common.model.DiplomaticTrade)': 'update$DiplomaticTrade$NegotiationDialog_UnitTradeItemPanel' }, inner: true });
$J.define(NegotiationDialog$UnitTradeItemPanel$UnitBoxRenderer, 'net.sf.freecol.client.gui.dialog.NegotiationDialog$UnitTradeItemPanel$UnitBoxRenderer', { kind: 'class', ifaces: ['javax.swing.ListCellRenderer'], sup: 'javax.swing.JLabel', ctors: { '': '_NegotiationDialog$UnitTradeItemPanel$UnitBoxRenderer' }, inner: true });
$J.module(() => {
  Cursor = $J.load('java.awt.Cursor');
  Dimension = $J.load('java.awt.Dimension');
  DefaultComboBoxModel = $J.load('javax.swing.DefaultComboBoxModel');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JButton = $J.load('javax.swing.JButton');
  JComboBox = $J.load('javax.swing.JComboBox');
  JScrollPane = $J.load('javax.swing.JScrollPane');
  JSpinner = $J.load('javax.swing.JSpinner');
  JTextArea = $J.load('javax.swing.JTextArea');
  ScrollPaneConstants = $J.load('javax.swing.ScrollPaneConstants');
  SpinnerNumberModel = $J.load('javax.swing.SpinnerNumberModel');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  ChoiceItem = $J.load('net.sf.freecol.client.gui.ChoiceItem');
  FontLibrary = $J.load('net.sf.freecol.client.gui.FontLibrary');
  FreeColDialog$DialogType = $J.load('net.sf.freecol.client.gui.dialog.FreeColDialog$DialogType');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  FreeColDebugger = $J.load('net.sf.freecol.common.debug.FreeColDebugger');
  FreeColDebugger$DebugMode = $J.load('net.sf.freecol.common.debug.FreeColDebugger$DebugMode');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  ColonyTradeItem = $J.load('net.sf.freecol.common.model.ColonyTradeItem');
  DiplomaticTrade$TradeContext = $J.load('net.sf.freecol.common.model.DiplomaticTrade$TradeContext');
  DiplomaticTrade$TradeStatus = $J.load('net.sf.freecol.common.model.DiplomaticTrade$TradeStatus');
  GoldTradeItem = $J.load('net.sf.freecol.common.model.GoldTradeItem');
  Goods = $J.load('net.sf.freecol.common.model.Goods');
  GoodsContainer = $J.load('net.sf.freecol.common.model.GoodsContainer');
  GoodsTradeItem = $J.load('net.sf.freecol.common.model.GoodsTradeItem');
  InciteTradeItem = $J.load('net.sf.freecol.common.model.InciteTradeItem');
  Player = $J.load('net.sf.freecol.common.model.Player');
  Stance = $J.load('net.sf.freecol.common.model.Stance');
  StanceTradeItem = $J.load('net.sf.freecol.common.model.StanceTradeItem');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  UnitTradeItem = $J.load('net.sf.freecol.common.model.UnitTradeItem');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
