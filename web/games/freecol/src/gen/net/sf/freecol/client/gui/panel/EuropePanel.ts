// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/EuropePanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Exception, JEnum, Level, Logger } from '../../../../../../../jre/index.ts';
import { PortPanel } from './PortPanel.ts';
import { JPanel } from '../../../../../../javax/swing/JPanel.ts';
import { UnitPanel } from './UnitPanel.ts';
import { FreeColButton } from './FreeColButton.ts';
import { InPortPanel } from './InPortPanel.ts';
import { JTextPane } from '../../../../../../javax/swing/JTextPane.ts';

let Dimension, GridLayout, KeyEvent, AbstractAction, ComponentInputMap, JComponent, JScrollPane, KeyStroke, ScrollPaneConstants, SwingUtilities, SimpleAttributeSet, StyleConstants, MigLayout, ClientOptions, FontLibrary, GoodsLabel, MarketLabel, UnitLabel, CargoPanel, DefaultTransferHandler, DragListener, DropListener, FreeColButton$ButtonStyle, Utility, Messages, Constants$BoycottAction, Europe, Map_, StringTemplate, Unit, Unit$UnitState;

/**
 * This is a panel for the Europe display.  It shows the ships in Europe and
 * allows the user to send them back.
 */
export class EuropePanel extends PortPanel {
  static logger: Logger = null;
  toAmericaPanel: EuropePanel$DestinationPanel = null;
  toEuropePanel: EuropePanel$DestinationPanel = null;
  europeanDocksPanel: EuropePanel$EuropeanDocksPanel = null;
  marketPanel: EuropePanel$MarketPanel = null;
  log_: EuropePanel$TransactionLog = null;
  exitButton: JButton = null;
  trainButton: JButton = null;
  purchaseButton: JButton = null;
  recruitButton: JButton = null;
  unloadButton: JButton = null;
  sailButton: JButton = null;
  europe: Europe = null;
  /**
   * The constructor for a EuropePanel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param header True when a header should be added.
   */
  _EuropePanel(freeColClient: FreeColClient, header: boolean): this {
    this._PortPanel(freeColClient, new MigLayout()._MigLayout$String$String('wrap 3, fill', '[30%:][30%:][15%:]'));
    this.exitButton = (new EuropePanel$EuropeButton()._EuropePanel$EuropeButton(Messages.message$String('close'), KeyEvent.VK_ESCAPE, EuropePanel$EuropeAction.EXIT.toString(), (ae) => this.exitAction())).withButtonStyle(FreeColButton$ButtonStyle.IMPORTANT);
    this.trainButton = new EuropePanel$EuropeButton()._EuropePanel$EuropeButton(Messages.message$String('train'), KeyEvent.VK_T, EuropePanel$EuropeAction.TRAIN.toString(), (ae) => this.getGUI().showTrainPanel());
    this.purchaseButton = new EuropePanel$EuropeButton()._EuropePanel$EuropeButton(Messages.message$String('purchase'), KeyEvent.VK_P, EuropePanel$EuropeAction.PURCHASE.toString(), (ae) => this.getGUI().showPurchasePanel());
    this.recruitButton = new EuropePanel$EuropeButton()._EuropePanel$EuropeButton(Messages.message$String('recruit'), KeyEvent.VK_R, EuropePanel$EuropeAction.RECRUIT.toString(), (ae) => this.getGUI().showRecruitPanel());
    this.unloadButton = new EuropePanel$EuropeButton()._EuropePanel$EuropeButton(Messages.message$String('unload'), KeyEvent.VK_U, EuropePanel$EuropeAction.UNLOAD.toString(), (ae) => this.unloadAction());
    this.sailButton = new EuropePanel$EuropeButton()._EuropePanel$EuropeButton(Messages.message$String('setSail'), KeyEvent.VK_S, EuropePanel$EuropeAction.SAIL.toString(), (ae) => this.sailAction());
    this.toAmericaPanel = new EuropePanel$DestinationPanel().$o(this)._EuropePanel$DestinationPanel();
    this.toEuropePanel = new EuropePanel$DestinationPanel().$o(this)._EuropePanel$DestinationPanel();
    this.inPortPanel = new EuropePanel$EuropeInPortPanel().$o(this)._EuropePanel$EuropeInPortPanel();
    this.cargoPanel = new CargoPanel()._CargoPanel(freeColClient, true, false);
    this.europeanDocksPanel = new EuropePanel$EuropeanDocksPanel().$o(this)._EuropePanel$EuropeanDocksPanel();
    this.marketPanel = new EuropePanel$MarketPanel().$o(this)._EuropePanel$MarketPanel(this);
    this.log_ = new EuropePanel$TransactionLog().$o(this)._EuropePanel$TransactionLog();
    this.europe = freeColClient.getMyPlayer().getEurope();
    let attributes = new SimpleAttributeSet()._SimpleAttributeSet$();
    StyleConstants.setAlignment(attributes, StyleConstants.ALIGN_RIGHT);
    StyleConstants.setBold(attributes, true);
    StyleConstants.setFontSize(attributes, $J.d2i(FontLibrary.getMainFontSize()));
    this.log_.setParagraphAttributes(attributes, true);
    this.defaultTransferHandler = new DefaultTransferHandler()._DefaultTransferHandler(freeColClient, this);
    this.toAmericaPanel.setTransferHandler(this.defaultTransferHandler);
    this.toEuropePanel.setTransferHandler(this.defaultTransferHandler);
    this.inPortPanel.setTransferHandler(this.defaultTransferHandler);
    this.cargoPanel.setTransferHandler(this.defaultTransferHandler);
    this.europeanDocksPanel.setTransferHandler(this.defaultTransferHandler);
    this.marketPanel.setTransferHandler(this.defaultTransferHandler);
    this.pressListener = new DragListener()._DragListener(freeColClient, this);
    let releaseListener = new DropListener()._DropListener();
    this.toAmericaPanel.addMouseListener(releaseListener);
    this.toEuropePanel.addMouseListener(releaseListener);
    this.inPortPanel.addMouseListener(releaseListener);
    this.cargoPanel.addMouseListener(releaseListener);
    this.europeanDocksPanel.addMouseListener(releaseListener);
    this.marketPanel.addMouseListener(releaseListener);
    this.toAmericaPanel.setLayout(new GridLayout()._GridLayout$int$int(1, 0));
    this.toEuropePanel.setLayout(new GridLayout()._GridLayout$int$int(1, 0));
    this.inPortPanel.setLayout(new GridLayout()._GridLayout$int$int(1, 0));
    this.cargoPanel.setLayout(new GridLayout()._GridLayout$int$int(1, 0));
    this.europeanDocksPanel.setLayout(new GridLayout()._GridLayout$int$int(0, 5));
    let toAmericaScroll = new JScrollPane()._JScrollPane$Component$int$int(this.toAmericaPanel, ScrollPaneConstants.VERTICAL_SCROLLBAR_NEVER, ScrollPaneConstants.HORIZONTAL_SCROLLBAR_AS_NEEDED);
    toAmericaScroll.getVerticalScrollBar().setUnitIncrement(16);
    let toEuropeScroll = new JScrollPane()._JScrollPane$Component$int$int(this.toEuropePanel, ScrollPaneConstants.VERTICAL_SCROLLBAR_NEVER, ScrollPaneConstants.HORIZONTAL_SCROLLBAR_AS_NEEDED);
    toEuropeScroll.getVerticalScrollBar().setUnitIncrement(16);
    let inPortScroll = new JScrollPane()._JScrollPane$Component$int$int(this.inPortPanel, ScrollPaneConstants.VERTICAL_SCROLLBAR_NEVER, ScrollPaneConstants.HORIZONTAL_SCROLLBAR_AS_NEEDED);
    inPortScroll.getVerticalScrollBar().setUnitIncrement(16);
    let cargoScroll = new JScrollPane()._JScrollPane$Component$int$int(this.cargoPanel, ScrollPaneConstants.VERTICAL_SCROLLBAR_NEVER, ScrollPaneConstants.HORIZONTAL_SCROLLBAR_AS_NEEDED);
    cargoScroll.getVerticalScrollBar().setUnitIncrement(16);
    let docksScroll = new JScrollPane()._JScrollPane$Component$int$int(this.europeanDocksPanel, ScrollPaneConstants.VERTICAL_SCROLLBAR_AS_NEEDED, ScrollPaneConstants.HORIZONTAL_SCROLLBAR_NEVER);
    docksScroll.getVerticalScrollBar().setUnitIncrement(16);
    let marketScroll = new JScrollPane()._JScrollPane$Component$int$int(this.marketPanel, ScrollPaneConstants.VERTICAL_SCROLLBAR_NEVER, ScrollPaneConstants.HORIZONTAL_SCROLLBAR_AS_NEEDED);
    let logScroll = new JScrollPane()._JScrollPane$Component$int$int(this.log_, ScrollPaneConstants.VERTICAL_SCROLLBAR_AS_NEEDED, ScrollPaneConstants.HORIZONTAL_SCROLLBAR_NEVER);
    logScroll.getVerticalScrollBar().setUnitIncrement(16);
    this.toAmericaPanel.setBorder(Utility.localizedBorder$String('sailingToAmerica'));
    this.toEuropePanel.setBorder(Utility.localizedBorder$String('sailingToEurope'));
    this.europeanDocksPanel.setBorder(Utility.localizedBorder$String('docks'));
    this.inPortPanel.setBorder(Utility.localizedBorder$String('inPort'));
    this.marketPanel.setBorder(Utility.blankBorder(10, 10, 10, 10));
    this.log_.setBorder(Utility.localizedBorder$String('sales'));
    toAmericaScroll.getViewport().setOpaque(false);
    this.toAmericaPanel.setOpaque(false);
    toEuropeScroll.getViewport().setOpaque(false);
    this.toEuropePanel.setOpaque(false);
    inPortScroll.getViewport().setOpaque(false);
    this.inPortPanel.setOpaque(false);
    cargoScroll.getViewport().setOpaque(false);
    this.cargoPanel.setOpaque(false);
    docksScroll.getViewport().setOpaque(false);
    this.europeanDocksPanel.setOpaque(false);
    marketScroll.getViewport().setOpaque(false);
    this.marketPanel.setOpaque(false);
    logScroll.getViewport().setOpaque(false);
    this.log_.setOpaque(false);
    this.initialize(this.europe);
    if (header) {
      this.add$Component$Object(Utility.localizedHeader(this.europe.getNameKey(), Utility.FONTSPEC_TITLE), 'span, top, center');
    }
    this.add$Component$Object(toAmericaScroll, 'sg, height 15%:, grow');
    this.add$Component$Object(toEuropeScroll, 'sg, height 15%:, grow');
    this.add$Component$Object(logScroll, 'spany 3, grow');
    this.add$Component$Object(inPortScroll, 'sg, height 15%:, grow');
    this.add$Component$Object(docksScroll, 'spany 2, grow');
    this.add$Component$Object(cargoScroll, 'height 10%:, grow');
    this.add$Component$Object(marketScroll, 'span, height 10%:, grow');
    this.add$Component$Object(this.recruitButton, 'span, split 6');
    this.add$Component(this.purchaseButton);
    this.add$Component(this.trainButton);
    this.add$Component(this.unloadButton);
    this.add$Component(this.sailButton);
    this.add$Component$Object(this.exitButton, 'tag ok');
    let u = this.europe.getLastUnit();
    if (u == null) {
      this.setSelectedUnitLabel(null);
    } else {
      this.setSelectedUnit(u);
    }
    let width = this.getImageLibrary().scaleInt(1050);
    let height = this.getImageLibrary().scaleInt(725);
    this.getGUI().restoreSavedSize(this, new Dimension()._Dimension$int$int(width, height));
    this.setEscapeAction(new (EuropePanel$1())().$o(this)._AbstractAction$());
    return this;
  }
  /**
   * Initialize this EuropePanel.
   *
   * @param europe The {@code Europe} this panel should display.
   */
  initialize(europe: Europe): void {
    this.toAmericaPanel.initialize(europe.getGame().getMap());
    this.toEuropePanel.initialize(europe);
    this.cargoPanel.initialize();
    this.inPortPanel.initialize();
    this.marketPanel.initialize();
    this.europeanDocksPanel.initialize();
    this.log_.initialize();
  }
  /**
   * Cleans up this EuropePanel.
   */
  cleanup(): void {
    this.log_.cleanup();
    this.europeanDocksPanel.cleanup();
    this.marketPanel.cleanup();
    this.inPortPanel.cleanup();
    this.cargoPanel.cleanup();
    this.toEuropePanel.cleanup();
    this.toAmericaPanel.cleanup();
  }
  /**
   * What to do when requesting focus.
   */
  requestFocus$(): void {
    this.exitButton.requestFocus$();
  }
  /**
   * Refreshes this panel.
   */
  refresh(): void {
    this.repaint$int$int$int$int(0, 0, this.getWidth(), this.getHeight());
  }
  /**
   * Selects a unit that is located somewhere on this panel.
   *
   * @param unitLabel The {@code UnitLabel} for the unit that
   *     is being selected.
   */
  setSelectedUnitLabel(unitLabel: UnitLabel): void {
    if (this.selectedUnitLabel !== unitLabel) {
      if (this.selectedUnitLabel != null) {
        this.selectedUnitLabel.setSelected(false);
      }
      this.selectedUnitLabel = unitLabel;
      if (unitLabel == null) {
        this.cargoPanel.setCarrier(null);
      } else {
        this.cargoPanel.setCarrier(unitLabel.getUnit());
        unitLabel.setSelected(true);
      }
    }
    this.inPortPanel.revalidate();
    this.inPortPanel.repaint$();
  }
  /**
   * Exits this EuropePanel.
   */
  exitAction(): void {
    this.cleanup();
    this.getGUI().removeComponent(this);
    this.igc().nextModelMessage();
  }
  /**
   * Unload the contents of the currently selected carrier.
   */
  unloadAction(): void {
    let player = this.getMyPlayer();
    let unit = this.getSelectedUnit();
    if (unit != null && unit.isCarrier()) {
      for (const $it0 = unit.getCompactGoodsList().iterator(); $it0.hasNext(); ) {
        let g = $it0.next();
        if (player.canTrade$GoodsType(g.getType())) {
          this.igc().sellGoods(g);
        } else {
          this.igc().payArrears(g.getType());
        }
      }
      for (const $it1 = unit.getUnitList().iterator(); $it1.hasNext(); ) {
        let u = $it1.next();
        this.igc().leaveShip(u);
      }
      this.cargoPanel.update$();
      this.europeanDocksPanel.update$();
    }
    this.requestFocus$();
  }
  /**
   * A unit sets sail for the new world.
   */
  sailAction(): void {
    let unit = this.getSelectedUnit();
    if (unit != null && this.toAmericaPanel.accepts$Unit(unit)) {
      this.toAmericaPanel.add$Component$boolean(this.getSelectedUnitLabel(), true);
    }
    this.requestFocus$();
  }
  /**
   * Get the units in Europe.
   *
   * @return A list of units in Europe.
   */
  getUnitList(): List<Unit> {
    return this.europe.getUnitList();
  }
  /**
   * {@inheritDoc}
   */
  removeNotify(): void {
    super.removeNotify();
    this.removeAll();
    this.toAmericaPanel = null;
    this.toEuropePanel = null;
    this.europeanDocksPanel = null;
    this.marketPanel = null;
    this.log_ = null;
    this.exitButton = this.trainButton = this.purchaseButton = this.recruitButton = this.unloadButton = this.sailButton = null;
  }
  static $clinit() {
    EuropePanel.logger = Logger.getLogger($J.cls(EuropePanel).getName());
  }
}

/**
 * A panel to hold unit labels that represent units that are going
 * to America or Europe.
 */
export class EuropePanel$DestinationPanel extends JPanel {
  destination: Location = null;
  _EuropePanel$DestinationPanel(): this {
    this._JPanel$();
    return this;
  }
  /**
   * Initialize this DestinationPanel.
   *
   * @param destination The destination {@code Location}
   *     for this panel.
   */
  initialize(destination: Location): void {
    this.destination = destination;
    this.update$();
  }
  /**
   * Cleans up this DestinationPanel.
   */
  cleanup(): void {
  }
  /**
   * Update this DestinationPanel.
   */
  update$(): void {
    this.removeAll();
    let highSeas = this.$outer.getMyPlayer().getHighSeas();
    if (highSeas != null) {
      for (const $it2 = highSeas.getUnitList().iterator(); $it2.hasNext(); ) {
        let unit = $it2.next();
        let belongs: boolean;
        if (this.destination instanceof Europe) {
          belongs = unit.getDestination() === this.destination;
        } else if (this.destination instanceof Map_) {
          belongs = unit.getDestination() === this.destination || (unit.getDestination() != null && unit.getDestination().getTile$() != null && unit.getDestination().getTile$().getMap() === this.destination);
        } else {
          EuropePanel.logger.warning('Bogus DestinationPanel location: ' + $J.str(this.destination) + ' for unit: ' + $J.str(unit));
          belongs = false;
        }
        if (belongs) {
          let unitLabel = new UnitLabel()._UnitLabel$FreeColClient$Unit(this.$outer.getFreeColClient(), unit);
          unitLabel.setTransferHandler(this.$outer.defaultTransferHandler);
          unitLabel.addMouseListener(this.$outer.pressListener);
          this.add$Component(unitLabel);
        }
      }
    }
    Utility.localizeBorder(this, Unit.getUnitDestinationLabel('ship', this.destination, this.$outer.getMyPlayer()));
    this.revalidate();
  }
  /**
   * {@inheritDoc}
   */
  accepts$Goods(goods: Goods): boolean {
    return false;
  }
  /**
   * {@inheritDoc}
   */
  accepts$GoodsType(goodsType: GoodsType): boolean {
    return false;
  }
  /**
   * {@inheritDoc}
   */
  accepts$Unit(unit: Unit): boolean {
    return unit.isNaval() && !unit.isDamagedAndUnderForcedRepair();
  }
  /**
   * {@inheritDoc}
   */
  add$Component$boolean(comp: Component, editState: boolean): Component {
    if (editState) {
      if (!(comp instanceof UnitLabel)) {
        EuropePanel.logger.warning('Invalid component: ' + $J.str(comp));
        return null;
      }
      let unit = (comp).getUnit();
      if (unit.getTradeRoute() != null) {
        if (!this.$outer.getGUI().confirmClearTradeRoute(unit) || !this.$outer.igc().assignTradeRoute(unit, null)) {
          return null;
        }
      }
      let dest = this.destination;
      if (unit.isInEurope()) {
        dest = this.$outer.getGUI().showSelectDestinationDialog(unit);
        if (dest == null) {
          return null;
        }
      }
      let co = this.$outer.getClientOptions();
      if (!co.getBoolean(ClientOptions.AUTOLOAD_EMIGRANTS) && unit.isInEurope() && !(this.destination instanceof Europe) && this.$outer.europeanDocksPanel.getComponentCount() > 0 && unit.hasSpaceLeft()) {
        let locName = this.destination.getLocationLabelFor(unit.getOwner());
        if (!this.$outer.getGUI().confirm$Tile$StringTemplate$Unit$String$String(null, StringTemplate.template$String('europePanel.leaveColonists').addStringTemplate$String$StringTemplate('%newWorld%', locName), unit, 'ok', 'cancel')) {
          return null;
        }
      }
      this.$outer.igc().moveTo(unit, dest);
      if (dest instanceof Europe) {
      } else {
        if (unit.isInEurope()) {
          return null;
        }
      }
      let parent = comp.getParent();
      if (parent != null) {
        parent.remove$Component(comp);
      }
      this.$outer.inPortPanel.update$();
      this.$outer.europeanDocksPanel.update$();
      this.$outer.cargoPanel.update$();
      if (unit === this.$outer.cargoPanel.getCarrier()) {
        this.$outer.cargoPanel.setCarrier(null);
      }
    }
    let c = this.add$Component(comp);
    this.revalidate();
    this.$outer.refresh();
    return c;
  }
  /**
   * {@inheritDoc}
   */
  suggested(type$: GoodsType): number {
    return -1;
  }
}

/**
 * A panel that holds UnitLabels that represent Units that are
 * waiting on the docks in Europe.
 */
export class EuropePanel$EuropeanDocksPanel extends UnitPanel {
  _EuropePanel$EuropeanDocksPanel(): this {
    this._UnitPanel(null, new MigLayout()._MigLayout$String('wrap 6'), this.$outer, 'Europe - docks', true);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  addPropertyChangeListeners(): void {
    this.$outer.europe.addPropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
  }
  /**
   * {@inheritDoc}
   */
  removePropertyChangeListeners(): void {
    this.$outer.europe.removePropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
  }
  /**
   * {@inheritDoc}
   */
  selectLabel(): void {
  }
  /**
   * {@inheritDoc}
   */
  accepts$Goods(goods: Goods): boolean {
    return false;
  }
  /**
   * {@inheritDoc}
   */
  accepts$GoodsType(goodsType: GoodsType): boolean {
    return false;
  }
  /**
   * {@inheritDoc}
   */
  accepts$Unit(unit: Unit): boolean {
    return !unit.isNaval();
  }
  /**
   * {@inheritDoc}
   */
  add$Component$boolean(comp: Component, editState: boolean): Component {
    let c = this.add$Component(comp);
    this.update$();
    return c;
  }
  /**
   * {@inheritDoc}
   */
  suggested(type$: GoodsType): number {
    return -1;
  }
  /**
   * {@inheritDoc}
   */
  remove$Component(comp: Component): void {
    this.update$();
  }
}

export class EuropePanel$EuropeButton extends FreeColButton {
  _EuropePanel$EuropeButton(text: string, keyEvent: number, command: string, listener: ActionListener): this {
    this._FreeColButton$();
    this.setOpaque(true);
    this.setText(text);
    this.setActionCommand(command);
    this.addActionListener(listener);
    let closeInputMap = new ComponentInputMap()._ComponentInputMap(this);
    closeInputMap.put(KeyStroke.getKeyStroke$int$int$boolean(keyEvent, 0, false), 'pressed');
    closeInputMap.put(KeyStroke.getKeyStroke$int$int$boolean(keyEvent, 0, true), 'released');
    SwingUtilities.replaceUIInputMap(this, JComponent.WHEN_IN_FOCUSED_WINDOW, closeInputMap);
    return this;
  }
}

/**
 * A panel that holds unit labels that represent naval units that
 * are waiting in Europe.
 */
export class EuropePanel$EuropeInPortPanel extends InPortPanel {
  _EuropePanel$EuropeInPortPanel(): this {
    this._InPortPanel(new MigLayout()._MigLayout$(), this.$outer, 'Europe - port', true);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  addPropertyChangeListeners(): void {
    this.$outer.europe.addPropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
  }
  /**
   * {@inheritDoc}
   */
  removePropertyChangeListeners(): void {
    this.$outer.europe.removePropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
  }
  /**
   * {@inheritDoc}
   */
  accepts$Unit(unit: Unit): boolean {
    if (!unit.isNaval()) {
      return false;
    }
    switch (unit.getState()) {
      case Unit$UnitState.ACTIVE:
      case Unit$UnitState.FORTIFIED:
      case Unit$UnitState.FORTIFYING:
      case Unit$UnitState.SENTRY:
      case Unit$UnitState.SKIPPED:
        return true;
    }
    return false;
  }
}

/**
 * A panel that shows goods available for purchase in Europe.
 */
export class EuropePanel$MarketPanel extends JPanel {
  /**
   * Creates this MarketPanel.
   *
   * @param europePanel The panel that holds this CargoPanel.
   */
  _EuropePanel$MarketPanel(europePanel: EuropePanel): this {
    this._JPanel$LayoutManager(new GridLayout()._GridLayout$int$int(2, 8));
    return this;
  }
  /**
   * Initialize this MarketPanel.
   */
  initialize(): void {
    this.removeAll();
    let fcc = this.$outer.getFreeColClient();
    let market = this.$outer.getMyPlayer().getMarket();
    for (const $it3 = this.$outer.getSpecification().getStorableGoodsTypeList().iterator(); $it3.hasNext(); ) {
      let goodsType = $it3.next();
      let label = new MarketLabel()._MarketLabel(fcc, goodsType, market);
      label.setTransferHandler(this.$outer.defaultTransferHandler);
      label.addMouseListener(this.$outer.pressListener);
      let md = market.getMarketData$GoodsType(goodsType);
      if (md != null) {
        md.addPropertyChangeListener$PropertyChangeListener($J.fn(label, 'propertyChange'));
      }
      this.add$Component(label);
    }
  }
  /**
   * Cleans up this MarketPanel.
   */
  cleanup(): void {
  }
  /**
   * {@inheritDoc}
   */
  accepts$Goods(goods: Goods): boolean {
    return true;
  }
  /**
   * {@inheritDoc}
   */
  accepts$GoodsType(goodsType: GoodsType): boolean {
    return false;
  }
  /**
   * {@inheritDoc}
   */
  accepts$Unit(unit: Unit): boolean {
    return false;
  }
  /**
   * {@inheritDoc}
   */
  add$Component$boolean(comp: Component, editState: boolean): Component {
    if (editState) {
      if (!(comp instanceof GoodsLabel)) {
        EuropePanel.logger.warning('Invalid component: ' + $J.str(comp));
        return null;
      }
      let goods = (comp).getGoods();
      if (this.$outer.getMyPlayer().canTrade$GoodsType(goods.getType())) {
        this.$outer.igc().sellGoods(goods);
      } else {
        let act = this.$outer.getGUI().getBoycottChoice(goods, this.$outer.europe);
        if (act != null) {
          switch (act) {
            case Constants$BoycottAction.BOYCOTT_PAY_ARREARS:
              this.$outer.igc().payArrears(goods.getType());
              break;
            case Constants$BoycottAction.BOYCOTT_DUMP_CARGO:
              this.$outer.igc().unloadCargo(goods, true);
              break;
            default:
              EuropePanel.logger.warning('showBoycottedGoodsDialog fail: ' + $J.str(act));
              break;
          }
        }
      }
      this.$outer.cargoPanel.revalidate();
      this.revalidate();
      this.$outer.igc().nextModelMessage();
    }
    this.$outer.refresh();
    return comp;
  }
  /**
   * {@inheritDoc}
   */
  remove$Component(comp: Component): void {
  }
}

/**
 * To log transactions made in Europe
 */
export class EuropePanel$TransactionLog extends JTextPane {
  /**
   * Creates a transaction log.
   */
  _EuropePanel$TransactionLog(): this {
    this._JTextPane$();
    this.setEditable(false);
    return this;
  }
  /**
   * Initializes this TransactionLog.
   */
  initialize(): void {
    this.$outer.getMyPlayer().getMarket().addTransactionListener(this);
    this.setText('');
  }
  /**
   * Cleans up this TransactionLog.
   */
  cleanup(): void {
    this.$outer.getMyPlayer().getMarket().removeTransactionListener(this);
  }
  /**
   * Add text to the transaction log.
   *
   * @param text The text to add.
   */
  add$String$EuropePanel_TransactionLog(text: string): void {
    let doc = this.getStyledDocument();
    try {
      if (doc.getLength() > 0) {
        text = '\n\n' + text;
      }
      doc.insertString(doc.getLength(), text, null);
    } catch ($e4) {
      if ($J.isa($e4, Exception)) {
        let e = $J.exc($e4);
        EuropePanel.logger.log(Level.WARNING, 'Transaction log update failure', e);
      } else {
        throw $e4;
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  logPurchase(goodsType: GoodsType, amount: number, price: number): void {
    let total = Math.imul(amount, price);
    let t1 = StringTemplate.template$String('europePanel.transaction.purchase').addNamed$String$Named('%goods%', goodsType).addAmount('%amount%', amount).addAmount('%gold%', price);
    let t2 = StringTemplate.template$String('europePanel.transaction.price').addAmount('%gold%', total);
    this.add$String$EuropePanel_TransactionLog(Messages.message$StringTemplate(t1) + '\n' + Messages.message$StringTemplate(t2));
  }
  /**
   * {@inheritDoc}
   */
  logSale(goodsType: GoodsType, amount: number, price: number, tax: number): void {
    let totalBeforeTax = Math.imul(amount, price);
    let totalTax = $J.idiv(Math.imul(totalBeforeTax, tax), 100);
    let totalAfterTax = (totalBeforeTax - totalTax) | 0;
    let t1 = StringTemplate.template$String('europePanel.transaction.sale').addNamed$String$Named('%goods%', goodsType).addAmount('%amount%', amount).addAmount('%gold%', price);
    let t2 = StringTemplate.template$String('europePanel.transaction.price').addAmount('%gold%', totalBeforeTax);
    let t3 = StringTemplate.template$String('europePanel.transaction.tax').addAmount('%tax%', tax).addAmount('%gold%', totalTax);
    let t4 = StringTemplate.template$String('europePanel.transaction.net').addAmount('%gold%', totalAfterTax);
    this.add$String$EuropePanel_TransactionLog(Messages.message$StringTemplate(t1) + '\n' + Messages.message$StringTemplate(t2) + '\n' + Messages.message$StringTemplate(t3) + '\n' + Messages.message$StringTemplate(t4));
  }
}

export class EuropePanel$EuropeAction extends JEnum {
  static EXIT: EuropePanel$EuropeAction = null;
  static RECRUIT: EuropePanel$EuropeAction = null;
  static PURCHASE: EuropePanel$EuropeAction = null;
  static TRAIN: EuropePanel$EuropeAction = null;
  static UNLOAD: EuropePanel$EuropeAction = null;
  static SAIL: EuropePanel$EuropeAction = null;
  static $VALUES: EuropePanel$EuropeAction[] = null;
  _EuropePanel$EuropeAction($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): EuropePanel$EuropeAction[] { return EuropePanel$EuropeAction.$VALUES.slice(); }
  static valueOf(name: string): EuropePanel$EuropeAction { return $J.enumValueOf(EuropePanel$EuropeAction, name); }
  static $clinit() {
    EuropePanel$EuropeAction.EXIT = new EuropePanel$EuropeAction()._EuropePanel$EuropeAction('EXIT', 0);
    EuropePanel$EuropeAction.RECRUIT = new EuropePanel$EuropeAction()._EuropePanel$EuropeAction('RECRUIT', 1);
    EuropePanel$EuropeAction.PURCHASE = new EuropePanel$EuropeAction()._EuropePanel$EuropeAction('PURCHASE', 2);
    EuropePanel$EuropeAction.TRAIN = new EuropePanel$EuropeAction()._EuropePanel$EuropeAction('TRAIN', 3);
    EuropePanel$EuropeAction.UNLOAD = new EuropePanel$EuropeAction()._EuropePanel$EuropeAction('UNLOAD', 4);
    EuropePanel$EuropeAction.SAIL = new EuropePanel$EuropeAction()._EuropePanel$EuropeAction('SAIL', 5);
    EuropePanel$EuropeAction.$VALUES = [EuropePanel$EuropeAction.EXIT, EuropePanel$EuropeAction.RECRUIT, EuropePanel$EuropeAction.PURCHASE, EuropePanel$EuropeAction.TRAIN, EuropePanel$EuropeAction.UNLOAD, EuropePanel$EuropeAction.SAIL];
  }
}

let $EuropePanel$1: any = null;
/** An anonymous class (EuropePanel.java:770). */
function EuropePanel$1(): any {
  return $EuropePanel$1 ??= $J.local(class extends AbstractAction {
    actionPerformed(ae: ActionEvent): void {
      this.$outer.exitButton.doClick$();
    }
  }, 'net.sf.freecol.client.gui.panel.EuropePanel$1', []);
}

$J.define(EuropePanel, 'net.sf.freecol.client.gui.panel.EuropePanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.PortPanel', ctors: { 'net.sf.freecol.client.FreeColClient,boolean': '_EuropePanel' }, returns: { 'getUnitList': 'java.util.List' }, meths: { 'requestFocus()': 'requestFocus$' }, clinit: true, lazy: ['logger'] });
$J.define(EuropePanel$DestinationPanel, 'net.sf.freecol.client.gui.panel.EuropePanel$DestinationPanel', { kind: 'class', ifaces: ['net.sf.freecol.client.gui.panel.DropTarget'], sup: 'javax.swing.JPanel', ctors: { '': '_EuropePanel$DestinationPanel' }, meths: { 'add(java.awt.Component,boolean)': 'add$Component$boolean', 'accepts(net.sf.freecol.common.model.Unit)': 'accepts$Unit', 'accepts(net.sf.freecol.common.model.GoodsType)': 'accepts$GoodsType', 'accepts(net.sf.freecol.common.model.Goods)': 'accepts$Goods', 'update()': 'update$' }, inner: true });
$J.define(EuropePanel$EuropeanDocksPanel, 'net.sf.freecol.client.gui.panel.EuropePanel$EuropeanDocksPanel', { kind: 'class', ifaces: ['net.sf.freecol.client.gui.panel.DropTarget'], sup: 'net.sf.freecol.client.gui.panel.UnitPanel', ctors: { '': '_EuropePanel$EuropeanDocksPanel' }, meths: { 'remove(java.awt.Component)': 'remove$Component', 'add(java.awt.Component,boolean)': 'add$Component$boolean', 'accepts(net.sf.freecol.common.model.Unit)': 'accepts$Unit', 'accepts(net.sf.freecol.common.model.GoodsType)': 'accepts$GoodsType', 'accepts(net.sf.freecol.common.model.Goods)': 'accepts$Goods' }, inner: true });
$J.define(EuropePanel$EuropeButton, 'net.sf.freecol.client.gui.panel.EuropePanel$EuropeButton', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.FreeColButton', ctors: { 'java.lang.String,int,java.lang.String,java.awt.event.ActionListener': '_EuropePanel$EuropeButton' } });
$J.define(EuropePanel$EuropeInPortPanel, 'net.sf.freecol.client.gui.panel.EuropePanel$EuropeInPortPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.InPortPanel', ctors: { '': '_EuropePanel$EuropeInPortPanel' }, meths: { 'accepts(net.sf.freecol.common.model.Unit)': 'accepts$Unit' }, inner: true });
$J.define(EuropePanel$MarketPanel, 'net.sf.freecol.client.gui.panel.EuropePanel$MarketPanel', { kind: 'class', ifaces: ['net.sf.freecol.client.gui.panel.DropTarget'], sup: 'javax.swing.JPanel', ctors: { 'net.sf.freecol.client.gui.panel.EuropePanel': '_EuropePanel$MarketPanel' }, meths: { 'remove(java.awt.Component)': 'remove$Component', 'add(java.awt.Component,boolean)': 'add$Component$boolean', 'accepts(net.sf.freecol.common.model.Unit)': 'accepts$Unit', 'accepts(net.sf.freecol.common.model.GoodsType)': 'accepts$GoodsType', 'accepts(net.sf.freecol.common.model.Goods)': 'accepts$Goods' }, inner: true });
$J.define(EuropePanel$TransactionLog, 'net.sf.freecol.client.gui.panel.EuropePanel$TransactionLog', { kind: 'class', ifaces: ['net.sf.freecol.common.model.TransactionListener'], sup: 'javax.swing.JTextPane', ctors: { '': '_EuropePanel$TransactionLog' }, meths: { 'add(java.lang.String)': 'add$String$EuropePanel_TransactionLog' }, inner: true });
$J.define(EuropePanel$EuropeAction, 'net.sf.freecol.client.gui.panel.EuropePanel$EuropeAction', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_EuropePanel$EuropeAction' }, clinit: true, lazy: ['$VALUES', 'EXIT', 'RECRUIT', 'PURCHASE', 'TRAIN', 'UNLOAD', 'SAIL'] });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  GridLayout = $J.load('java.awt.GridLayout');
  KeyEvent = $J.load('java.awt.event.KeyEvent');
  AbstractAction = $J.load('javax.swing.AbstractAction');
  ComponentInputMap = $J.load('javax.swing.ComponentInputMap');
  JComponent = $J.load('javax.swing.JComponent');
  JScrollPane = $J.load('javax.swing.JScrollPane');
  KeyStroke = $J.load('javax.swing.KeyStroke');
  ScrollPaneConstants = $J.load('javax.swing.ScrollPaneConstants');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  SimpleAttributeSet = $J.load('javax.swing.text.SimpleAttributeSet');
  StyleConstants = $J.load('javax.swing.text.StyleConstants');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  ClientOptions = $J.load('net.sf.freecol.client.ClientOptions');
  FontLibrary = $J.load('net.sf.freecol.client.gui.FontLibrary');
  GoodsLabel = $J.load('net.sf.freecol.client.gui.label.GoodsLabel');
  MarketLabel = $J.load('net.sf.freecol.client.gui.label.MarketLabel');
  UnitLabel = $J.load('net.sf.freecol.client.gui.label.UnitLabel');
  CargoPanel = $J.load('net.sf.freecol.client.gui.panel.CargoPanel');
  DefaultTransferHandler = $J.load('net.sf.freecol.client.gui.panel.DefaultTransferHandler');
  DragListener = $J.load('net.sf.freecol.client.gui.panel.DragListener');
  DropListener = $J.load('net.sf.freecol.client.gui.panel.DropListener');
  FreeColButton$ButtonStyle = $J.load('net.sf.freecol.client.gui.panel.FreeColButton$ButtonStyle');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Constants$BoycottAction = $J.load('net.sf.freecol.common.model.Constants$BoycottAction');
  Europe = $J.load('net.sf.freecol.common.model.Europe');
  Map_ = $J.load('net.sf.freecol.common.model.Map');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Unit$UnitState = $J.load('net.sf.freecol.common.model.Unit$UnitState');
});
