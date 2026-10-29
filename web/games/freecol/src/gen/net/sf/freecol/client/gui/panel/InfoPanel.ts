// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/InfoPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, JEnum, JString, Logger } from '../../../../../../../jre/index.ts';
import { FreeColPanel } from './FreeColPanel.ts';

let BorderLayout, Dimension, MouseAdapter, BorderFactory, ImageIcon, JButton, JLabel, SwingConstants, MigLayout, SwingGUI$PopupPosition, EndTurnAction, FreeColImageBorder, MigPanel, Utility, Messages, AbstractGoods, StringTemplate, Unit$UnitLabelType, ResourceManager, CollectionUtils, StringUtils;

/**
 * The InfoPanel is a wrapper for several informative displays in the
 * lower right corner.
 */
export class InfoPanel extends FreeColPanel {
  static logger: Logger = null;
  /**
   * Pixel width of text area beside icon.
   */
  static readonly TEXT_WIDTH: number = 150;
  /**
   * A small pixel gap.
   */
  static readonly SLACK: number = 5;
  /**
   * Number of goods/production items to show.
   */
  static readonly PRODUCTION: number = 4;
  /**
   * Preferred size for non-skinned panel.
   */
  static PREFERRED_SIZE: Dimension = null;
  /**
   * The image library to use for the font.
   */
  lib: ImageLibrary = null;
  /**
   * The font for the end turn message.
   */
  font$InfoPanel: Font = null;
  /**
   * An optional background image (the standard one has shape).
   */
  skin: Image = null;
  /**
   * The mouse listener for the various subpanels.
   */
  mouseAdapter: MouseAdapter = null;
  /**
   * The panel mode.
   */
  mode: InfoPanel$InfoPanelMode = null;
  /**
   * The associated map transform when in MAP mode.
   */
  mapTransform: MapTransform = null;
  /**
   * The associated tile when in TILE mode.
   */
  tile: Tile = null;
  /**
   * The associated unit when in UNIT mode.
   */
  unit: Unit = null;
  /**
   * Use the info panel skin.
   */
  useSkin: boolean = false;
  $init_InfoPanel() {
    this.mode = InfoPanel$InfoPanelMode.NONE;
    this.mapTransform = null;
    this.tile = null;
    this.unit = null;
  }
  /**
   * The constructor that will add the items to this panel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _InfoPanel$FreeColClient(freeColClient: FreeColClient): this {
    this._InfoPanel$FreeColClient$boolean(freeColClient, true);
    return this;
  }
  /**
   * The constructor that will add the items to this panel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param useSkin Use the info panel skin.
   */
  _InfoPanel$FreeColClient$boolean(freeColClient: FreeColClient, useSkin: boolean): this {
    this._FreeColPanel$FreeColClient$String$LayoutManager(freeColClient, null, null);
    this.$init_InfoPanel();
    this.lib = freeColClient.getGUI().getFixedImageLibrary();
    this.useSkin = useSkin;
    this.mouseAdapter = new (InfoPanel$1())().$o(this)._MouseAdapter();
    return this;
  }
  updateLayoutIfNeeded(newUseSkin: boolean): void {
    let newFont = this.lib.getScaledFont('normal-plain-tiny', null);
    let newSkin = (newUseSkin) ? this.lib.getScaledImage('image.skin.InfoPanel') : null;
    if (this.useSkin === newUseSkin && newFont === this.font$InfoPanel && newSkin === this.skin) {
      return;
    }
    this.font$InfoPanel = newFont;
    this.skin = newSkin;
    this.useSkin = newUseSkin;
    if (this.skin != null) {
      this.setBorder(null);
      this.setSize$int$int(this.skin.getWidth$ImageObserver(null), this.skin.getHeight$ImageObserver(null));
      this.setOpaque(false);
    } else if (!this.useSkin) {
      this.setSize$Dimension(this.lib.scale$Dimension(InfoPanel.PREFERRED_SIZE));
      this.setBorder(BorderFactory.createEmptyBorder$());
      this.setOpaque(true);
    } else {
      this.setSize$Dimension(this.lib.scale$Dimension(InfoPanel.PREFERRED_SIZE));
      this.setBorder(FreeColImageBorder.panelWithoutShadowBorder);
      this.setOpaque(true);
    }
  }
  /**
   * Get a new MigPanel with specified layout and size it to fit neatly.
   *
   * @param layout The {@code LayoutManager} for the panel.
   * @return The new {@code MigPanel}.
   */
  newPanel(layout: LayoutManager): MigPanel {
    let panel = new MigPanel()._MigPanel$LayoutManager(layout);
    panel.setSize$Dimension(new Dimension()._Dimension$int$int($J.d2i((this.getWidth() * 0.8)), $J.d2i((this.getHeight() * 0.6))));
    return panel;
  }
  /**
   * Size, place and request redraw of the given panel.
   *
   * @param panel The new panel to display.
   */
  setPanel(panel: MigPanel): void {
    panel.addMouseListener(this.mouseAdapter);
    if (this.skin != null) {
      panel.setOpaque(false);
      let pl = ResourceManager.getPropertyList('image.skin.InfoPanel.properties');
      panel.setLocation$int$int(this.lib.scaleInt(pl.getInt$String('panel.x')), this.lib.scaleInt(pl.getInt$String('panel.y')));
      panel.setSize$int$int(this.lib.scaleInt(pl.getInt$String('panel.width')), this.lib.scaleInt(pl.getInt$String('panel.height')));
    } else {
      let y = $J.idiv(((this.getHeight() - panel.getHeight()) | 0), 2);
      let x = $J.idiv(((this.getWidth() - panel.getWidth()) | 0), 2);
      panel.setSize$Dimension(this.lib.scale$Dimension(InfoPanel.PREFERRED_SIZE));
      panel.setLocation$int$int(0, 0);
    }
    this.removeAll();
    this.add$Component(panel);
    this.revalidate();
    this.repaint$();
  }
  /**
   * Get the mode-dependent associated tile.
   *
   * @return The {@code Tile} associated with this panel.
   */
  getTile(): Tile {
    switch (this.mode) {
      case InfoPanel$InfoPanelMode.TILE:
        return this.tile;
      case InfoPanel$InfoPanelMode.UNIT:
        return (this.unit == null) ? null : this.unit.getTile$();
      default:
        break;
    }
    return null;
  }
  /**
   * Change the panel mode.
   *
   * The important job here is to clear out all the old settings.
   *
   * @param newMode The new {@code InfoPanelMode}.
   * @return The old {@code InfoPanelMode}.
   */
  changeMode(newMode: InfoPanel$InfoPanelMode): InfoPanel$InfoPanelMode {
    let oldMode = this.mode;
    if (oldMode !== newMode) {
      {
        let gc: GoodsContainer;
        switch (oldMode) {
          case InfoPanel$InfoPanelMode.MAP:
            this.mapTransform = null;
            break;
          case InfoPanel$InfoPanelMode.TILE:
            this.tile = null;
            break;
          case InfoPanel$InfoPanelMode.UNIT:
            this.unit.removePropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
            gc = this.unit.getGoodsContainer();
            if (gc != null) {
              gc.removePropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
            }
            this.unit = null;
            break;
          default:
            break;
        }
      }
      this.mode = newMode;
    }
    return oldMode;
  }
  /**
   * Fill in an end turn message into a new panel and add it.
   */
  fillEndPanel(): void {
    let panel = this.newPanel(new MigLayout()._MigLayout$String$String$String('wrap 1, center', '[center]', ''));
    let labelString = Messages.message$String('infoPanel.endTurn');
    let width = $J.d2i((0.3 * this.getWidth()));
    panel.add$Component(new JLabel()._JLabel$String(''));
    for (const $it0 = StringUtils.splitText(labelString, ' /', this.getFontMetrics(this.font$InfoPanel), width).iterator(); $it0.hasNext(); ) {
      let s = $it0.next();
      let label = new JLabel()._JLabel$String(s);
      label.setFont(this.font$InfoPanel);
      panel.add$Component(label);
    }
    let button = new JButton()._JButton$Action(this.getFreeColClient().getActionManager().getFreeColAction(EndTurnAction.id));
    button.setFont(this.font$InfoPanel);
    panel.add$Component(button);
    this.setPanel(panel);
  }
  /**
   * Fill map transform information into a new panel and add it.
   *
   * @param mapTransform The {@code MapTransform} to display.
   * @return The {@code MapTransform}.
   */
  fillMapPanel(mapTransform: MapTransform): MapTransform {
    let panel = this.newPanel(new BorderLayout()._BorderLayout$());
    let p = (mapTransform == null) ? null : mapTransform.getDescriptionPanel();
    if (p != null) {
      p.setOpaque(false);
      let d = p.getPreferredSize$();
      p.setBounds$int$int$int$int(0, $J.idiv(((this.getHeight() - d.height_) | 0), 2), this.getWidth(), d.height_);
      panel.add$Component$Object(p, BorderLayout.CENTER);
    }
    this.setPanel(panel);
    return mapTransform;
  }
  /**
   * Fill tile information into a new panel and add it.
   *
   * @param tile The {@code Tile} to display.
   * @return The {@code Tile}.
   */
  fillTilePanel(tile: Tile): Tile {
    let panel = this.newPanel(new MigLayout()._MigLayout$String$String$String('fill, wrap ' + ((InfoPanel.PRODUCTION + 1) | 0) + ', gap 1 1', '', ''));
    if (tile != null) {
      let image = this.getGUI().createTileImageWithBeachBorderAndItems(tile);
      if (tile.isExplored()) {
        let width = (panel.getWidth() - InfoPanel.SLACK) | 0;
        let text = Messages.message$StringTemplate(tile.getLabel());
        for (const $it1 = StringUtils.splitText(text, ' /', this.getFontMetrics(this.font$InfoPanel), width).iterator(); $it1.hasNext(); ) {
          let s = $it1.next();
          let label = new JLabel()._JLabel$String(s);
          label.setFont(this.font$InfoPanel);
          panel.add$Component$Object(label, 'span, align center');
        }
        panel.add$Component$Object(new JLabel()._JLabel$Icon(new ImageIcon()._ImageIcon$Image(image)), 'spany');
        let owner = tile.getOwner();
        if (owner == null) {
          panel.add$Component$Object(new JLabel()._JLabel$(), 'span ' + InfoPanel.PRODUCTION);
        } else {
          let t = owner.getNationLabel();
          let label = Utility.localizedLabel$StringTemplate(t);
          label.setFont(this.font$InfoPanel);
          panel.add$Component$Object(label, 'span ' + InfoPanel.PRODUCTION);
        }
        let defenceLabel = Utility.localizedLabel$StringTemplate(StringTemplate.template$String('infoPanel.defenseBonus').addAmount('%bonus%', tile.getDefenceBonusPercentage()));
        defenceLabel.setFont(this.font$InfoPanel);
        panel.add$Component$Object(defenceLabel, 'span ' + InfoPanel.PRODUCTION);
        let moveLabel = Utility.localizedLabel$StringTemplate(StringTemplate.template$String('infoPanel.movementCost').addAmount('%cost%', $J.idiv(tile.getType().getBasicMoveCost(), 3)));
        moveLabel.setFont(this.font$InfoPanel);
        this.add$Component$Object(moveLabel, 'span ' + InfoPanel.PRODUCTION);
        let produce = CollectionUtils.sort$Stream$Comparator(tile.getType().getPossibleProduction(true), AbstractGoods.descendingAmountComparator);
        if (produce.isEmpty()) {
          panel.add$Component$Object(new JLabel()._JLabel$(), 'span ' + InfoPanel.PRODUCTION);
        } else {
          for (const $it2 = produce.iterator(); $it2.hasNext(); ) {
            let ag = $it2.next();
            let type$ = ag.getType();
            let n = tile.getPotentialProduction(type$, null);
            let label = new JLabel()._JLabel$String$Icon$int(String(n), new ImageIcon()._ImageIcon$Image(this.lib.getSmallGoodsTypeImage(type$)), SwingConstants.RIGHT);
            label.setToolTipText(Messages.getName$Named(type$));
            label.setFont(this.font$InfoPanel);
            panel.add$Component(label);
          }
        }
      } else {
        panel.add$Component$Object(Utility.localizedLabel$String('unexplored'), 'span, align center');
        panel.add$Component$Object(new JLabel()._JLabel$Icon(new ImageIcon()._ImageIcon$Image(image)), 'spany');
      }
    }
    this.setPanel(panel);
    return tile;
  }
  /**
   * Add labels to a panel with MigLayout, on one line.
   *
   * @param panel The {@code JPanel} to add to.
   * @param labels A list of {@code JLabel}s to add.
   * @param max The maximum number of labels to put on a line
   */
  static addLabels(panel: JPanel, labels: List<JLabel>, max: number): void {
    for (; ; ) {
      let n = Math.min(max, labels.size());
      if (n <= 0) {
        break;
      } else if (n === 1) {
        panel.add$Component(labels.get(0));
        break;
      } else {
        panel.add$Component$Object(labels.removeAt(0), 'split ' + n);
        for (let i = 1; i < n; i++) {
          panel.add$Component(labels.removeAt(0));
        }
      }
    }
  }
  /**
   * Fill unit information into a new panel and add it.
   *
   * @param unit The {@code Unit} to display.
   * @return The {@code Unit}.
   */
  fillUnitPanel(unit: Unit): Unit {
    let ii = new ImageIcon()._ImageIcon$Image(this.lib.getScaledUnitImage$Unit(unit));
    let width = ii.getIconWidth();
    let panel = this.newPanel(new MigLayout()._MigLayout$String$String$String('wrap 2, fill, gap 0 0', '[' + width + '][fill]', ''));
    panel.add$Component$Object(new JLabel()._JLabel$Icon(ii), 'spany, center');
    let text = unit.getDescription$UnitLabelType(Unit$UnitLabelType.FULL);
    let textLabel: JLabel;
    for (const $it3 = (StringUtils.splitText(text, ' /', this.getFontMetrics(this.font$InfoPanel), (panel.getWidth() - width) | 0)).iterator(); $it3.hasNext(); ) {
      let s = $it3.next();
      textLabel = new JLabel()._JLabel$String(s);
      textLabel.setFont(this.font$InfoPanel);
      panel.add$Component(textLabel);
    }
    text = (unit.isInEurope()) ? Messages.getName$Named(unit.getOwner().getEurope()) : Messages.message$String('infoPanel.moves') + ' ' + unit.getMovesAsString();
    textLabel = new JLabel()._JLabel$String(text);
    textLabel.setFont(this.font$InfoPanel);
    panel.add$Component(textLabel);
    if (unit.isCarrier()) {
      let labels = new ArrayList();
      let icon: ImageIcon;
      let label: JLabel;
      for (const $it4 = unit.getUnitList().iterator(); $it4.hasNext(); ) {
        let carriedUnit = $it4.next();
        icon = new ImageIcon()._ImageIcon$Image(this.lib.getSmallerUnitImage(carriedUnit));
        label = new JLabel()._JLabel$Icon(icon);
        text = carriedUnit.getDescription$UnitLabelType(Unit$UnitLabelType.NATIONAL);
        label.setFont(this.font$InfoPanel);
        label.setToolTipText(text);
        labels.add(label);
      }
      InfoPanel.addLabels(panel, labels, 6);
      labels.clear();
      for (const $it5 = unit.getGoodsList().iterator(); $it5.hasNext(); ) {
        let goods = $it5.next();
        let amount = goods.getAmount();
        let gt = goods.getType();
        icon = new ImageIcon()._ImageIcon$Image(this.lib.getSmallerGoodsTypeImage(gt));
        label = new JLabel()._JLabel$String$Icon$int(String(amount), icon, SwingConstants.CENTER);
        text = Messages.message$StringTemplate(goods.getLabel$boolean(true));
        label.setFont(this.font$InfoPanel);
        label.setToolTipText(text);
        labels.add(label);
      }
      InfoPanel.addLabels(panel, labels, 3);
    }
    panel.add$Component$Object(new JLabel()._JLabel$String(''), 'growy');
    this.setPanel(panel);
    return unit;
  }
  /**
   * Update this {@code InfoPanel} to end turn mode.
   */
  update$(): void {
    if (this.getFreeColClient().isMapEditor()) {
      this.changeMode(InfoPanel$InfoPanelMode.NONE);
      this.removeAll();
      this.revalidate();
      this.repaint$();
    } else {
      let updated = false;
      let oldMode = this.changeMode(InfoPanel$InfoPanelMode.END);
      if (oldMode !== InfoPanel$InfoPanelMode.END) {
        this.fillEndPanel();
        updated = true;
      }
      InfoPanel.logger.info('InfoPanel ' + ((updated) ? 'updated ' : 'maintained ') + $J.str(oldMode) + ' -> ' + $J.str(this.mode));
    }
  }
  /**
   * Update this {@code InfoPanel} to map mode with a given transform.
   *
   * @param mapTransform The {@code MapTransform} to display.
   */
  update$MapTransform(mapTransform: MapTransform): void {
    let updated = false;
    let oldMode = this.changeMode(InfoPanel$InfoPanelMode.MAP);
    if (oldMode !== InfoPanel$InfoPanelMode.MAP || mapTransform !== this.mapTransform) {
      this.mapTransform = this.fillMapPanel(mapTransform);
      updated = true;
    }
    InfoPanel.logger.info('InfoPanel ' + ((updated) ? 'updated ' : 'maintained ') + $J.str(oldMode) + ' -> ' + $J.str(this.mode) + ' with ' + $J.str(mapTransform));
  }
  /**
   * Update this {@code InfoPanel} to tile mode with a given tile.
   *
   * @param tile The displayed {@code Tile}.
   */
  update$Tile(tile: Tile): void {
    let updated = false;
    let oldMode = this.changeMode(InfoPanel$InfoPanelMode.TILE);
    if (oldMode !== InfoPanel$InfoPanelMode.TILE || tile !== this.tile) {
      this.tile = this.fillTilePanel(tile);
      updated = true;
    }
    InfoPanel.logger.info('InfoPanel ' + ((updated) ? 'updated ' : 'maintained ') + $J.str(oldMode) + ' -> ' + $J.str(this.mode) + ' with tile ' + $J.str(tile));
  }
  /**
   * Update this {@code InfoPanel} to unit mode with a given unit.
   *
   * @param unit The displayed {@code Unit}.
   */
  update$Unit(unit: Unit): void {
    if (unit == null) {
      this.update$();
      return;
    }
    let updated = false;
    let oldMode = this.changeMode(InfoPanel$InfoPanelMode.UNIT);
    if (unit !== this.unit) {
      if (this.unit != null) {
        this.unit.removePropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
        let gc = this.unit.getGoodsContainer();
        if (gc != null) {
          gc.removePropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
        }
      }
      unit.addPropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
      let gc = unit.getGoodsContainer();
      if (gc != null) {
        gc.addPropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
      }
    }
    this.unit = this.fillUnitPanel(unit);
    updated = true;
    InfoPanel.logger.info('InfoPanel ' + ((updated) ? 'updated ' : 'maintained ') + $J.str(oldMode) + ' -> ' + $J.str(this.mode) + ' with unit ' + $J.str(unit));
  }
  /**
   * Refresh this panel.
   *
   * Apparently this is necessary when adding the info panel back into the
   * canvas with the skinned corner, otherwise the unit does not get
   * displayed.
   * TODO: Explain why, or fix so we do not need this.
   */
  refresh(): void {
    switch (this.mode) {
      case InfoPanel$InfoPanelMode.END:
        this.fillEndPanel();
        break;
      case InfoPanel$InfoPanelMode.MAP:
        this.fillMapPanel(this.mapTransform);
        break;
      case InfoPanel$InfoPanelMode.TILE:
        this.fillTilePanel(this.tile);
        break;
      case InfoPanel$InfoPanelMode.UNIT:
        this.fillUnitPanel(this.unit);
        break;
      default:
        break;
    }
  }
  getFramePopupPosition(): SwingGUI$PopupPosition {
    return SwingGUI$PopupPosition.LOWER_RIGHT;
  }
  getFrameTitle(): string {
    return Messages.message$String('infoPanel.title');
  }
  /**
   * {@inheritDoc}
   */
  paintComponent(graphics: Graphics): void {
    if (this.skin != null) {
      graphics.drawImage$Image$int$int$ImageObserver(this.skin, 0, 0, null);
    }
    super.paintComponent(graphics);
  }
  /**
   * {@inheritDoc}
   */
  propertyChange(event: PropertyChangeEvent): void {
    this.refresh();
  }
  static $clinit() {
    InfoPanel.logger = Logger.getLogger($J.cls(InfoPanel).getName());
    InfoPanel.PREFERRED_SIZE = new Dimension()._Dimension$int$int(250, 138);
  }
}

export class InfoPanel$InfoPanelMode extends JEnum {
  static NONE: InfoPanel$InfoPanelMode = null;
  static END: InfoPanel$InfoPanelMode = null;
  static MAP: InfoPanel$InfoPanelMode = null;
  static TILE: InfoPanel$InfoPanelMode = null;
  static UNIT: InfoPanel$InfoPanelMode = null;
  static $VALUES: InfoPanel$InfoPanelMode[] = null;
  _InfoPanel$InfoPanelMode($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): InfoPanel$InfoPanelMode[] { return InfoPanel$InfoPanelMode.$VALUES.slice(); }
  static valueOf(name: string): InfoPanel$InfoPanelMode { return $J.enumValueOf(InfoPanel$InfoPanelMode, name); }
  static $clinit() {
    InfoPanel$InfoPanelMode.NONE = new InfoPanel$InfoPanelMode()._InfoPanel$InfoPanelMode('NONE', 0);
    InfoPanel$InfoPanelMode.END = new InfoPanel$InfoPanelMode()._InfoPanel$InfoPanelMode('END', 1);
    InfoPanel$InfoPanelMode.MAP = new InfoPanel$InfoPanelMode()._InfoPanel$InfoPanelMode('MAP', 2);
    InfoPanel$InfoPanelMode.TILE = new InfoPanel$InfoPanelMode()._InfoPanel$InfoPanelMode('TILE', 3);
    InfoPanel$InfoPanelMode.UNIT = new InfoPanel$InfoPanelMode()._InfoPanel$InfoPanelMode('UNIT', 4);
    InfoPanel$InfoPanelMode.$VALUES = [InfoPanel$InfoPanelMode.NONE, InfoPanel$InfoPanelMode.END, InfoPanel$InfoPanelMode.MAP, InfoPanel$InfoPanelMode.TILE, InfoPanel$InfoPanelMode.UNIT];
  }
}

let $InfoPanel$1: any = null;
/** An anonymous class (InfoPanel.java:144). */
function InfoPanel$1(): any {
  return $InfoPanel$1 ??= $J.local(class extends MouseAdapter {
    /**
     * {@inheritDoc}
     */
    mousePressed(e: MouseEvent): void {
      let tile = this.$outer.getTile();
      if (tile != null) {
        this.$outer.getGUI().setFocus(tile);
      }
    }
  }, 'net.sf.freecol.client.gui.panel.InfoPanel$1', []);
}

$J.define(InfoPanel, 'net.sf.freecol.client.gui.panel.InfoPanel', { kind: 'class', ifaces: ['java.beans.PropertyChangeListener'], sup: 'net.sf.freecol.client.gui.panel.FreeColPanel', ctors: { 'net.sf.freecol.client.FreeColClient,boolean': '_InfoPanel$FreeColClient$boolean', 'net.sf.freecol.client.FreeColClient': '_InfoPanel$FreeColClient' }, returns: { 'getFrameTitle': 'java.lang.String', 'getFramePopupPosition': 'net.sf.freecol.client.gui.SwingGUI$PopupPosition', 'getTile': 'net.sf.freecol.common.model.Tile' }, meths: { 'update(net.sf.freecol.common.model.Unit)': 'update$Unit', 'update(net.sf.freecol.common.model.Tile)': 'update$Tile', 'update(net.sf.freecol.client.control.MapTransform)': 'update$MapTransform', 'update()': 'update$' }, clinit: true, lazy: ['logger', 'PREFERRED_SIZE'] });
$J.define(InfoPanel$InfoPanelMode, 'net.sf.freecol.client.gui.panel.InfoPanel$InfoPanelMode', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_InfoPanel$InfoPanelMode' }, clinit: true, lazy: ['$VALUES', 'NONE', 'END', 'MAP', 'TILE', 'UNIT'] });
$J.module(() => {
  BorderLayout = $J.load('java.awt.BorderLayout');
  Dimension = $J.load('java.awt.Dimension');
  MouseAdapter = $J.load('java.awt.event.MouseAdapter');
  BorderFactory = $J.load('javax.swing.BorderFactory');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JButton = $J.load('javax.swing.JButton');
  JLabel = $J.load('javax.swing.JLabel');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  SwingGUI$PopupPosition = $J.load('net.sf.freecol.client.gui.SwingGUI$PopupPosition');
  EndTurnAction = $J.load('net.sf.freecol.client.gui.action.EndTurnAction');
  FreeColImageBorder = $J.load('net.sf.freecol.client.gui.panel.FreeColImageBorder');
  MigPanel = $J.load('net.sf.freecol.client.gui.panel.MigPanel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  AbstractGoods = $J.load('net.sf.freecol.common.model.AbstractGoods');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  Unit$UnitLabelType = $J.load('net.sf.freecol.common.model.Unit$UnitLabelType');
  ResourceManager = $J.load('net.sf.freecol.common.resources.ResourceManager');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
});
