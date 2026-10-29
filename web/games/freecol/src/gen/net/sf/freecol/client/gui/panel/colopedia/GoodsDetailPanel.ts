// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/colopedia/GoodsDetailPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../../../jre/index.ts';
import { ColopediaGameObjectTypePanel } from './ColopediaGameObjectTypePanel.ts';

let JLabel, MigLayout, ModifierFormat, ColopediaAction$PanelType, Utility, Messages, AbstractGoods, Constants, StringTemplate, CollectionUtils;

/**
 * This panel displays details of goods types in the Colopedia.
 */
export class GoodsDetailPanel extends ColopediaGameObjectTypePanel {
  /**
   * Creates a new instance of this ColopediaDetailPanel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param colopediaPanel The parent ColopediaPanel.
   */
  _GoodsDetailPanel(freeColClient: FreeColClient, colopediaPanel: ColopediaPanel): this {
    this._ColopediaGameObjectTypePanel(freeColClient, colopediaPanel, ColopediaAction$PanelType.GOODS.getKey());
    return this;
  }
  /**
   * {@inheritDoc}
   */
  addSubTrees$DefaultMutableTreeNode(root: DefaultMutableTreeNode): void {
    super.addSubTrees$DefaultMutableTreeNode$List(root, this.getSpecification().getGoodsTypeList());
  }
  /**
   * {@inheritDoc}
   */
  buildDetail$String$JPanel(id: string, panel: JPanel): void {
    if ($J.equals(this.getId(), id)) {
      return;
    }
    let type$ = this.getSpecification().getGoodsType(id);
    panel.setLayout(new MigLayout()._MigLayout$String$String('wrap 4', '[]20[]'));
    let name = Utility.localizedHeaderLabel$Named$String(type$, Utility.FONTSPEC_SUBTITLE);
    panel.add$Component$Object(name, 'span, align center, wrap 40');
    if (type$.isFarmed()) {
      let improvements = new ArrayList();
      let modifiers = new ArrayList();
      for (const $it0 = this.getSpecification().getTileImprovementTypeList().iterator(); $it0.hasNext(); ) {
        let improvementType = $it0.next();
        let productionModifier = improvementType.getProductionModifier(type$);
        if (productionModifier != null) {
          improvements.add(improvementType);
          modifiers.add(productionModifier);
        }
      }
      panel.add$Component$Object(Utility.localizedLabel$String('colopedia.goods.improvedBy'), 'newline 20, top');
      if (improvements.isEmpty()) {
        panel.add$Component$Object(Utility.localizedLabel$String('none'), 'span');
      } else {
        for (let index = 0; index < improvements.size(); index++) {
          let constraints = (index === 0) ? 'span' : 'skip, span';
          panel.add$Component$Object(Utility.localizedLabel$StringTemplate(StringTemplate.template$String('colopedia.goods.improvement').addName$String$FreeColObject('%name%', improvements.get(index)).addName$String$String('%amount%', ModifierFormat.getModifierAsString(modifiers.get(index)))), constraints);
        }
      }
    } else {
      panel.add$Component$Object(Utility.localizedLabel$String('colopedia.goods.madeFrom'), 'newline 20');
      if (type$.isRefined()) {
        panel.add$Component$Object(this.getGoodsButton$GoodsType(type$.getInputType()), 'span');
      } else {
        panel.add$Component$Object(Utility.localizedLabel$String('nothing'), 'span');
      }
    }
    panel.add$Component$Object(Utility.localizedLabel$String('colopedia.goods.makes'), 'newline 20');
    if (type$.isRawMaterial()) {
      panel.add$Component$Object(this.getGoodsButton$GoodsType(type$.getOutputType()), 'span');
    } else if (type$.getStoredAs() !== type$) {
      panel.add$Component$Object(this.getGoodsButton$GoodsType(type$.getStoredAs()), 'span');
    } else {
      panel.add$Component$Object(Utility.localizedLabel$String('nothing'), 'span');
    }
    if (type$.isBuildingMaterial()) {
      let buildingTypes = new ArrayList();
      let allTypes = this.filterBuildables(this.getSpecification().getBuildingTypeList(), buildingTypes, type$);
      if (!buildingTypes.isEmpty()) {
        panel.add$Component$Object(Utility.localizedLabel$String('colopedia.goods.buildings'), 'newline 20');
        if (allTypes) {
          let button = this.getButton$PanelType$String$ImageIcon(ColopediaAction$PanelType.BUILDINGS, Messages.message$String('colopedia.goods.allBuildings'), null);
          panel.add$Component$Object(button, 'span');
        } else {
          let count = 0;
          for (const $it1 = buildingTypes.iterator(); $it1.hasNext(); ) {
            let building = $it1.next();
            let label = this.getButton$FreeColSpecObjectType(building);
            if (count > 0 && count % 3 === 0) {
              panel.add$Component$Object(label, 'skip');
            } else {
              panel.add$Component(label);
            }
            count++;
          }
        }
      }
      let roles = new ArrayList();
      allTypes = this.filterBuildables(this.getSpecification().getRolesList(), roles, type$);
      if (!roles.isEmpty()) {
        panel.add$Component$Object(Utility.localizedLabel$String('colopedia.goods.equipment'), 'newline 20');
        let count = 0;
        for (const $it2 = roles.iterator(); $it2.hasNext(); ) {
          let role = $it2.next();
          let label = Utility.localizedLabel$String(Messages.getName$Named(role));
          if (count > 0 && count % 3 === 0) {
            panel.add$Component$Object(label, 'skip');
          } else {
            panel.add$Component(label);
          }
          count++;
        }
      }
      let unitTypes = new ArrayList();
      allTypes = this.filterBuildables(this.getSpecification().getUnitTypeList(), unitTypes, type$);
      if (!unitTypes.isEmpty()) {
        panel.add$Component$Object(Utility.localizedLabel$String('colopedia.goods.units'), 'newline 20');
        if (allTypes) {
          let button = this.getButton$PanelType$String$ImageIcon(ColopediaAction$PanelType.UNITS, Messages.message$String('colopedia.goods.allUnits'), null);
          panel.add$Component$Object(button, 'span');
        } else {
          let count = 0;
          for (const $it3 = unitTypes.iterator(); $it3.hasNext(); ) {
            let unit = $it3.next();
            let label = this.getButton$FreeColSpecObjectType(unit);
            if (count > 0 && count % 3 === 0) {
              panel.add$Component$Object(label, 'skip');
            } else {
              panel.add$Component(label);
            }
            count++;
          }
        }
      }
    }
    if (type$.getBreedingNumber() < Constants.INFINITY) {
      panel.add$Component$Object(Utility.localizedLabel$String('colopedia.goods.breedingNumber'), 'newline 20');
      panel.add$Component(new JLabel()._JLabel$String(String(type$.getBreedingNumber())));
    }
    panel.add$Component$Object(Utility.localizedLabel$String('colopedia.goods.description'), 'newline 20');
    panel.add$Component$Object(Utility.localizedTextArea$String$int(Messages.descriptionKey$ObjectWithId(type$), 30), 'span, growx');
  }
  filterBuildables<T>(input: List<T>, output: List<T>, type$: GoodsType): boolean {
    let result = false;
    for (const $it4 = input.iterator(); $it4.hasNext(); ) {
      let bt = $it4.next();
      if (bt.needsGoodsToBuild() && CollectionUtils.any$Stream$Predicate(bt.getRequiredGoods$(), AbstractGoods.matches(type$))) {
        output.add(bt);
        result = true;
      }
    }
    return result;
  }
}

$J.define(GoodsDetailPanel, 'net.sf.freecol.client.gui.panel.colopedia.GoodsDetailPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.colopedia.ColopediaGameObjectTypePanel', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.client.gui.panel.colopedia.ColopediaPanel': '_GoodsDetailPanel' }, meths: { 'buildDetail(java.lang.String,javax.swing.JPanel)': 'buildDetail$String$JPanel', 'addSubTrees(javax.swing.tree.DefaultMutableTreeNode)': 'addSubTrees$DefaultMutableTreeNode' } });
$J.module(() => {
  JLabel = $J.load('javax.swing.JLabel');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  ModifierFormat = $J.load('net.sf.freecol.client.gui.ModifierFormat');
  ColopediaAction$PanelType = $J.load('net.sf.freecol.client.gui.action.ColopediaAction$PanelType');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  AbstractGoods = $J.load('net.sf.freecol.common.model.AbstractGoods');
  Constants = $J.load('net.sf.freecol.common.model.Constants');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
