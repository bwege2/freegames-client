// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/BuildingPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Logger, StringBuilder } from '../../../../../../../jre/index.ts';
import { MigPanel } from './MigPanel.ts';
import { JLabel } from '../../../../../../javax/swing/JLabel.ts';

let Dimension, ImageIcon, MigLayout, ImageLibrary, ProductionLabel, UnitLabel, BuildingToolTip, Ability, AbstractGoods, GameOptions, CollectionUtils;

/**
 * This panel represents a single building in a Colony.
 */
export class BuildingPanel extends MigPanel {
  static logger: Logger = null;
  /**
   * The enclosing client.
   */
  freeColClient: FreeColClient = null;
  /**
   * The Building to display.
   */
  building: Building = null;
  /**
   * Labels for any units present.
   */
  unitLabels: List<UnitLabel> = null;
  unscaledMinimumWorkerAndProductionSize: Dimension = null;
  /**
   * Creates this BuildingPanel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param building The building to display information from.
   */
  _BuildingPanel(freeColClient: FreeColClient, building: Building): this {
    this._MigPanel$LayoutManager(new MigLayout()._MigLayout$String$String$String('ins 0 0 0 0, gap 0 0', BuildingPanel.layoutConstraintString(building), '0:push[32!, bottom]0[58!, bottom]'));
    this.unitLabels = new ArrayList();
    this.freeColClient = freeColClient;
    this.building = building;
    this.unscaledMinimumWorkerAndProductionSize = new Dimension()._Dimension$int$int(Math.max(64, Math.imul(building.getUnitCapacity(), 32)), 90);
    this.setToolTipText(' ');
    return this;
  }
  static layoutConstraintString(building: Building): string {
    return 'push' + BuildingPanel.layoutWorkerString(building) + 'push';
  }
  static layoutWorkerString(building: Building): string {
    if (building.getUnitCapacity() < 2) {
      return '[64!]';
    }
    let sb = new StringBuilder();
    for (let i = 0; i < building.getUnitCapacity(); i++) {
      sb.append('[32!]');
    }
    return sb.toString();
  }
  getImageLibrary(): ImageLibrary {
    return this.freeColClient.getGUI().getFixedImageLibrary();
  }
  /**
   * Initialize this building panel.
   */
  initialize(): void {
    this.cleanup();
    this.addPropertyChangeListeners();
    this.update$();
  }
  /**
   * Clean up this building panel.
   */
  cleanup(): void {
    this.unitLabels.clear();
    this.removePropertyChangeListeners();
    this.removeAll();
  }
  /**
   * Add any property change listeners.
   */
  addPropertyChangeListeners(): void {
    if (this.building != null) {
      this.building.addPropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
    }
  }
  /**
   * Remove any property change listeners.
   */
  removePropertyChangeListeners(): void {
    if (this.building != null) {
      this.building.removePropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
    }
  }
  /**
   * Update up this building panel.
   */
  update$(): void {
    this.removeAll();
    this.unitLabels.clear();
    let colony = this.building.getColony();
    let productionOutput = null;
    let info = this.building.getProductionInfo();
    let output = (info == null) ? null : CollectionUtils.first$Collection(info.getProduction());
    if (output != null && output.getAmount() > 0) {
      if (this.building.hasAbility$String(Ability.AVOID_EXCESS_PRODUCTION)) {
        let stored = colony.getGoodsCount(output.getType());
        let capacity = colony.getWarehouseCapacity();
        if (((output.getAmount() + stored) | 0) > capacity) {
          output = new AbstractGoods()._AbstractGoods$GoodsType$int(output.getType(), (capacity - stored) | 0);
        }
      }
      let maximum = info.getMaximumProduction().isEmpty() ? output : info.getMaximumProduction().get(0);
      productionOutput = new ProductionLabel()._ProductionLabel$FreeColClient$AbstractGoods$int(this.freeColClient, output, maximum.getAmount());
    }
    let upkeep = null;
    if (this.building.getSpecification().getBoolean(GameOptions.ENABLE_UPKEEP) && this.building.getType().getUpkeep() > 0) {
      upkeep = new BuildingPanel$UpkeepLabel().$o(this)._BuildingPanel$UpkeepLabel(this.building.getType().getUpkeep());
    }
    if (productionOutput == null) {
      if (upkeep != null) {
        this.add$Component$Object(upkeep, 'span, align center');
      } else {
        let nothing = new JLabel()._JLabel$();
        nothing.setOpaque(false);
        this.add$Component$Object(nothing, 'span, align center');
      }
    } else if (upkeep == null) {
      this.add$Component$Object(productionOutput, 'span, align center');
    } else {
      this.add$Component$Object(productionOutput, 'span, split 2, align center');
      this.add$Component(upkeep);
    }
    for (const $it0 = this.building.getUnitList().iterator(); $it0.hasNext(); ) {
      let unit = $it0.next();
      let unitLabel = new UnitLabel()._UnitLabel$FreeColClient$Unit$boolean(this.freeColClient, unit, true);
      this.unitLabels.add(unitLabel);
      this.add$Component(unitLabel);
    }
    let minimumWorkerAndProductionSize = this.getImageLibrary().scale$Dimension(this.unscaledMinimumWorkerAndProductionSize);
    let image = this.getImageLibrary().getScaledBuildingImage(this.building);
    let minimumSizeForImage = new Dimension()._Dimension$int$int(image.getWidth(), image.getHeight());
    this.setMinimumSize(this.largestWidthAndHeight(minimumWorkerAndProductionSize, minimumSizeForImage));
    let preferredSizeForImage = this.getImageLibrary().determineMaxSizeUsingSizeFromAllLevels(this.building.getType(), this.building.getOwner());
    this.setPreferredSize(this.largestWidthAndHeight(minimumWorkerAndProductionSize, preferredSizeForImage));
    this.revalidate();
    this.repaint$();
  }
  largestWidthAndHeight(d1: Dimension, d2: Dimension): Dimension {
    return new Dimension()._Dimension$int$int(Math.max(d1.width_, d2.width_), Math.max(d1.height_, d2.height_));
  }
  /**
   * Get the building this panel displays.
   *
   * @return The displayed {@code Building}.
   */
  getBuilding(): Building {
    return this.building;
  }
  /**
   * Get any unit labels for the units present.
   *
   * @return A list of {@code UnitLabel}s.
   */
  getUnitLabels(): List<UnitLabel> {
    return this.unitLabels;
  }
  /**
   * {@inheritDoc}
   *
   * Changes a property upon an interaction event, then logs the change
   * when FreeCol is run on the Level.FINEST setting. The logging can be
   * useful for debugging issues with a given building.
   */
  propertyChange(event: PropertyChangeEvent): void {
    let property = event.getPropertyName();
    BuildingPanel.logger.finest(this.building.getId() + ' change ' + property + ': ' + $J.str(event.getOldValue()) + ' -> ' + $J.str(event.getNewValue()));
    this.update$();
  }
  /**
   * {@inheritDoc}
   */
  createToolTip(): JToolTip {
    return new BuildingToolTip()._BuildingToolTip(this.freeColClient, this.building);
  }
  /**
   * {@inheritDoc}
   */
  paintComponent(g: Graphics): void {
    let lib = this.getImageLibrary();
    let image = lib.getScaledBuildingImage(this.building);
    let size = this.getSize$();
    g.drawImage$Image$int$int$ImageObserver(image, $J.idiv(((size.width_ - image.getWidth()) | 0), 2), (size.height_ - image.getHeight()) | 0, this);
  }
  static $clinit() {
    BuildingPanel.logger = Logger.getLogger($J.cls(BuildingPanel).getName());
  }
}

/**
 * A special label to display the building upkeep required.
 */
export class BuildingPanel$UpkeepLabel extends JLabel {
  /**
   * The base image to display.
   */
  number: number = 0;
  /**
   * The font for the label.
   */
  font$BuildingPanel_UpkeepLabel: Font = null;
  /**
   * Create an upkeep label.
   *
   * @param number The upkeep cost.
   */
  _BuildingPanel$UpkeepLabel(number$: number): this {
    this._JLabel$Icon(new ImageIcon()._ImageIcon$Image(this.$outer.getImageLibrary().getScaledImage(ImageLibrary.ICON_COIN)));
    this.number = number$;
    this.font$BuildingPanel_UpkeepLabel = this.$outer.getImageLibrary().getScaledFont('simple-bold-tiny', null);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  paintComponent(g: Graphics): void {
    this.getIcon().paintIcon(null, g, 0, 0);
    let lib = this.$outer.getImageLibrary();
    let img = lib.getStringImage(g, String(this.number), this.getForeground(), this.font$BuildingPanel_UpkeepLabel);
    g.drawImage$Image$int$int$ImageObserver(img, $J.idiv(((this.getIcon().getIconWidth() - img.getWidth(null)) | 0), 2), $J.idiv(((this.getIcon().getIconHeight() - img.getHeight(null)) | 0), 2), null);
  }
}

$J.define(BuildingPanel, 'net.sf.freecol.client.gui.panel.BuildingPanel', { kind: 'class', ifaces: ['java.beans.PropertyChangeListener'], sup: 'net.sf.freecol.client.gui.panel.MigPanel', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.common.model.Building': '_BuildingPanel' }, returns: { 'getUnitLabels': 'java.util.List', 'getBuilding': 'net.sf.freecol.common.model.Building', 'getImageLibrary': 'net.sf.freecol.client.gui.ImageLibrary' }, meths: { 'update()': 'update$' }, clinit: true, lazy: ['logger'] });
$J.define(BuildingPanel$UpkeepLabel, 'net.sf.freecol.client.gui.panel.BuildingPanel$UpkeepLabel', { kind: 'class', sup: 'javax.swing.JLabel', ctors: { 'int': '_BuildingPanel$UpkeepLabel' }, inner: true });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  ProductionLabel = $J.load('net.sf.freecol.client.gui.label.ProductionLabel');
  UnitLabel = $J.load('net.sf.freecol.client.gui.label.UnitLabel');
  BuildingToolTip = $J.load('net.sf.freecol.client.gui.tooltip.BuildingToolTip');
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  AbstractGoods = $J.load('net.sf.freecol.common.model.AbstractGoods');
  GameOptions = $J.load('net.sf.freecol.common.option.GameOptions');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
