// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/tooltip/BuildingToolTip.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, StringBuilder } from '../../../../../../../jre/index.ts';
import { JToolTip } from '../../../../../../javax/swing/JToolTip.ts';

let ImageIcon, JLabel, MigLayout, FontLibrary, ModifierFormat, ProductionLabel, UnitLabel, Utility, FreeColDebugger, FreeColDebugger$DebugMode, Messages, AbstractGoods, Modifier, StringTemplate, ResourceManager, CollectionUtils;

/**
 * A tooltip for a single building in a Colony.
 */
export class BuildingToolTip extends JToolTip {
  /**
   * Creates this BuildingToolTip.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param building The building to display information from.
   */
  _BuildingToolTip(freeColClient: FreeColClient, building: Building): this {
    this._JToolTip();
    let lib = freeColClient.getGUI().getFixedImageLibrary();
    let game = building.getGame();
    let workplaces = building.getUnitCapacity();
    let output = CollectionUtils.first$Stream(building.getOutputs());
    let outputType = (output == null) ? null : output.getType();
    let sb = new StringBuilder(64);
    sb.append('[align center]');
    for (let index = 0; index < workplaces; index++) {
      sb.append('20[]5[]');
    }
    let columns = sb.toString();
    let layout = new MigLayout()._MigLayout$String$String$String('fill, insets 20, wrap ' + ((Math.imul(2, workplaces) + 1) | 0), columns, '[][][align bottom]');
    this.setLayout(layout);
    let buildingName = new JLabel()._JLabel$String(Messages.getName$Named(building));
    let font = FontLibrary.getScaledFont$String('simple-bold-smaller');
    buildingName.setFont(font);
    this.add$Component$Object(buildingName, 'span');
    let info = building.getProductionInfo();
    let production = (info == null) ? null : CollectionUtils.first$Collection(info.getProduction());
    let consumption = (info == null) ? null : CollectionUtils.first$Collection(info.getConsumption());
    if (production == null || production.getAmount() <= 0) {
      this.add$Component$Object(new JLabel()._JLabel$(), 'span');
    } else {
      let arrow = new JLabel()._JLabel$String(ResourceManager.getString$String('arrow.E'));
      arrow.setFont(FontLibrary.getScaledFont$String('simple-bold-small'));
      let maxProduction = (info == null) ? null : CollectionUtils.first$Collection(info.getMaximumProduction());
      let productionOutput = new ProductionLabel()._ProductionLabel$FreeColClient$AbstractGoods$int(freeColClient, production, ((maxProduction == null) ? production : maxProduction).getAmount());
      if (consumption == null) {
        this.add$Component$Object(productionOutput, 'span');
      } else if (consumption.getAmount() > 0) {
        let maxConsumption = (info == null) ? null : CollectionUtils.first$Collection(info.getMaximumConsumption());
        let productionInput = new ProductionLabel()._ProductionLabel$FreeColClient$AbstractGoods$int(freeColClient, consumption, ((maxConsumption == null) ? consumption : maxConsumption).getAmount());
        this.add$Component$Object(productionInput, 'span, split 3');
        this.add$Component(arrow);
        this.add$Component(productionOutput);
      } else {
        this.add$Component$Object(new JLabel()._JLabel$Icon(new ImageIcon()._ImageIcon$Image(lib.getScaledGoodsTypeImage(consumption.getType()))), 'span, split 3');
        this.add$Component(arrow);
        this.add$Component(new JLabel()._JLabel$Icon(new ImageIcon()._ImageIcon$Image(lib.getScaledGoodsTypeImage(production.getType()))));
      }
    }
    this.add$Component(new JLabel()._JLabel$Icon(new ImageIcon()._ImageIcon$Image(lib.getScaledBuildingImage(building))));
    if (outputType != null) {
      for (const $it0 = building.getUnitList().iterator(); $it0.hasNext(); ) {
        let unit = $it0.next();
        let unitLabel = new UnitLabel()._UnitLabel$FreeColClient$Unit(freeColClient, unit);
        let amount = building.getUnitProduction(unit, outputType);
        if (amount > 0) {
          this.add$Component(unitLabel);
          let pLabel = new ProductionLabel()._ProductionLabel$FreeColClient$AbstractGoods(freeColClient, new AbstractGoods()._AbstractGoods$GoodsType$int(outputType, amount));
          this.add$Component$Object(pLabel, 'split 2');
          this.add$Component(new JLabel()._JLabel$());
        }
      }
    } else if (building.canTeach()) {
      for (const $it1 = building.getUnitList().iterator(); $it1.hasNext(); ) {
        let unit = $it1.next();
        let unitLabel = new UnitLabel()._UnitLabel$FreeColClient$Unit(freeColClient, unit);
        if (unit.getStudent() != null) {
          let progress = new JLabel()._JLabel$String(unit.getTurnsOfTraining() + '/' + unit.getNeededTurnsOfTraining());
          let sLabel = new UnitLabel()._UnitLabel$FreeColClient$Unit$boolean$boolean(freeColClient, unit.getStudent(), true, true);
          this.add$Component(unitLabel);
          this.add$Component$Object(progress, 'split 2, flowy');
          this.add$Component(sLabel);
        } else {
          this.add$Component$Object(unitLabel, 'span 2');
        }
      }
    }
    let diff = (building.getUnitCapacity() - building.getUnitCount()) | 0;
    for (let index = 0; index < diff; index++) {
      this.add$Component$Object(new JLabel()._JLabel$Icon(new ImageIcon()._ImageIcon$Image(lib.getScaledImage('image.unit.placeholder'))), 'span 2');
    }
    let breed = (outputType == null || !outputType.isBreedable()) ? -1 : outputType.getBreedingNumber();
    if (breed > building.getColony().getGoodsCount(outputType)) {
      this.add$Component(Utility.localizedLabel$StringTemplate(StringTemplate.template$String('buildingToolTip.breeding').addAmount('%number%', breed).addNamed$String$Named('%goods%', outputType)));
    }
    if (outputType != null && FreeColDebugger.isInDebugMode$DebugMode(FreeColDebugger$DebugMode.MENUS)) {
      let mods = CollectionUtils.sort$Stream$Comparator(building.getProductionModifiers(outputType, null), Modifier.ascendingModifierIndexComparator);
      for (const $it2 = mods.iterator(); $it2.hasNext(); ) {
        let m = $it2.next();
        let mLabels = ModifierFormat.getModifierLabels(m, null, game.getTurn());
        for (let i = 0; i < mLabels.length; i++) {
          if (mLabels[i] != null) {
            if (i === 0) {
              this.add$Component$Object(mLabels[i], 'newline');
            } else {
              this.add$Component(mLabels[i]);
            }
          }
        }
      }
    }
    this.setPreferredSize(layout.preferredLayoutSize(this));
    return this;
  }
  /**
   * {@inheritDoc}
   */
  removeNotify(): void {
    super.removeNotify();
    this.setLayout(null);
  }
}

$J.define(BuildingToolTip, 'net.sf.freecol.client.gui.tooltip.BuildingToolTip', { kind: 'class', sup: 'javax.swing.JToolTip', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.common.model.Building': '_BuildingToolTip' } });
$J.module(() => {
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JLabel = $J.load('javax.swing.JLabel');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  FontLibrary = $J.load('net.sf.freecol.client.gui.FontLibrary');
  ModifierFormat = $J.load('net.sf.freecol.client.gui.ModifierFormat');
  ProductionLabel = $J.load('net.sf.freecol.client.gui.label.ProductionLabel');
  UnitLabel = $J.load('net.sf.freecol.client.gui.label.UnitLabel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  FreeColDebugger = $J.load('net.sf.freecol.common.debug.FreeColDebugger');
  FreeColDebugger$DebugMode = $J.load('net.sf.freecol.common.debug.FreeColDebugger$DebugMode');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  AbstractGoods = $J.load('net.sf.freecol.common.model.AbstractGoods');
  Modifier = $J.load('net.sf.freecol.common.model.Modifier');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  ResourceManager = $J.load('net.sf.freecol.common.resources.ResourceManager');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
