// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/colopedia/BuildingDetailPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, HashMap } from '../../../../../../../../jre/index.ts';
import { ColopediaGameObjectTypePanel } from './ColopediaGameObjectTypePanel.ts';

let Dimension, ImageIcon, JButton, JLabel, BadLocationException, StyleConstants, DefaultMutableTreeNode, MigLayout, FontLibrary, ColopediaAction$PanelType, Utility, ColopediaTreeItem, Messages, Ability, StringTemplate, CollectionUtils, ImageUtils;

/**
 * This panel displays details of buildings in the Colopedia.
 */
export class BuildingDetailPanel extends ColopediaGameObjectTypePanel {
  /**
   * Creates a new instance of this ColopediaDetailPanel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param colopediaPanel The parent ColopediaPanel.
   */
  _BuildingDetailPanel(freeColClient: FreeColClient, colopediaPanel: ColopediaPanel): this {
    this._ColopediaGameObjectTypePanel(freeColClient, colopediaPanel, ColopediaAction$PanelType.BUILDINGS.getKey());
    return this;
  }
  /**
   * {@inheritDoc}
   */
  addSubTrees$DefaultMutableTreeNode(root: DefaultMutableTreeNode): void {
    let parent = new DefaultMutableTreeNode()._DefaultMutableTreeNode$Object(new ColopediaTreeItem()._ColopediaTreeItem(this, this.getId(), this.getName$(), null));
    let buildingTypes = new ArrayList();
    let buildingHash = new HashMap();
    for (const $it0 = this.getSpecification().getBuildingTypeList().iterator(); $it0.hasNext(); ) {
      let buildingType = $it0.next();
      if (buildingType.getUpgradesFrom() == null) {
        let name = Messages.getName$Named(buildingType);
        let listItemIconSize = this.getListItemIconSize();
        let buildingTypeImage = this.getImageLibrary().getBuildingTypeImage$BuildingType$Dimension(buildingType, new Dimension()._Dimension$int$int(-1, listItemIconSize.height_));
        let centeredImage = ImageUtils.createCenteredImage$BufferedImage$Dimension(buildingTypeImage, listItemIconSize);
        let item = new DefaultMutableTreeNode()._DefaultMutableTreeNode$Object(new ColopediaTreeItem()._ColopediaTreeItem(this, buildingType.getId(), name, new ImageIcon()._ImageIcon$Image(centeredImage)));
        buildingHash.put(buildingType, item);
        parent.add(item);
      } else {
        buildingTypes.add(buildingType);
      }
    }
    while (!buildingTypes.isEmpty()) {
      let iterator = buildingTypes.iterator();
      while (iterator.hasNext()) {
        let buildingType = iterator.next();
        let node = buildingHash.get(buildingType.getUpgradesFrom());
        if (node != null) {
          let name = Messages.getName$Named(buildingType);
          let listItemIconSize = this.getListItemIconSize();
          let buildingTypeImage = this.getImageLibrary().getBuildingTypeImage$BuildingType$Dimension(buildingType, new Dimension()._Dimension$int$int(-1, listItemIconSize.height_));
          let centeredImage = ImageUtils.createCenteredImage$BufferedImage$Dimension(buildingTypeImage, listItemIconSize);
          let item = new DefaultMutableTreeNode()._DefaultMutableTreeNode$Object(new ColopediaTreeItem()._ColopediaTreeItem(this, buildingType.getId(), name, new ImageIcon()._ImageIcon$Image(centeredImage)));
          node.add(item);
          buildingHash.put(buildingType, item);
          iterator.remove();
        }
      }
    }
    root.add(parent);
  }
  /**
   * {@inheritDoc}
   */
  buildDetail$String$JPanel(id: string, panel: JPanel): void {
    if ($J.equals(this.getId(), id)) {
      return;
    }
    let buildingType = this.getSpecification().getBuildingType(id);
    panel.setLayout(new MigLayout()._MigLayout$String$String$String('wrap 7, gapx 20', '', ''));
    let name = Utility.localizedHeaderLabel$Named$String(buildingType, Utility.FONTSPEC_SUBTITLE);
    panel.add$Component$Object(name, 'span, align center, wrap 40');
    let textPane = Utility.getDefaultTextPane$();
    let doc = textPane.getStyledDocument();
    try {
      if (buildingType.getUpgradesFrom() != null) {
        StyleConstants.setComponent(doc.getStyle('button'), this.getButton$FreeColSpecObjectType(buildingType.getUpgradesFrom()));
        doc.insertString(doc.getLength(), ' ', doc.getStyle('button'));
        doc.insertString(doc.getLength(), '\n', doc.getStyle('regular'));
      }
      if (buildingType.getRequiredPopulation() > 0) {
        let template = StringTemplate.template$String('colopedia.buildings.requiredPopulation').addAmount('%number%', buildingType.getRequiredPopulation());
        doc.insertString(doc.getLength(), Messages.message$StringTemplate(template) + '\n', doc.getStyle('regular'));
      }
      CollectionUtils.forEachMapEntry$Map$Consumer(buildingType.getRequiredAbilities(), (e) => this.appendRequiredAbility(doc, e.getKey(), e.getValue()));
      panel.add$Component$Object(Utility.localizedLabel$String('colopedia.buildings.requires'), 'top');
      panel.add$Component$Object(textPane, 'span, growx');
    } catch ($e1) {
      if ($J.isa($e1, BadLocationException)) {
        let e = $J.exc($e1);
      } else {
        throw $e1;
      }
    }
    panel.add$Component(Utility.localizedLabel$String('colopedia.buildings.cost'));
    if (!buildingType.needsGoodsToBuild()) {
      panel.add$Component$Object(Utility.localizedLabel$String('colopedia.buildings.autoBuilt'), 'span');
    } else {
      let required = buildingType.getRequiredGoodsList$();
      let goodsRequired = CollectionUtils.first$Collection(required);
      if (required.size() > 1) {
        panel.add$Component$Object(this.getGoodsButton$GoodsType$int(goodsRequired.getType(), goodsRequired.getAmount()), 'span, split ' + required.size());
        for (let index = 1; index < required.size(); index++) {
          goodsRequired = required.get(index);
          panel.add$Component(this.getGoodsButton$GoodsType$int(goodsRequired.getType(), goodsRequired.getAmount()));
        }
      } else {
        panel.add$Component$Object(this.getGoodsButton$GoodsType$int(goodsRequired.getType(), goodsRequired.getAmount()), 'span');
      }
    }
    if (buildingType.hasAbility$String(Ability.TEACH)) {
      panel.add$Component$Object(Utility.localizedLabel$String('colopedia.buildings.teaches'), 'newline, top');
      let count = 0;
      for (const $it2 = this.getSpecification().getUnitTypeList().iterator(); $it2.hasNext(); ) {
        let unitType2 = $it2.next();
        if (buildingType.canAdd(unitType2)) {
          if (count > 0 && count % 3 === 0) {
            panel.add$Component$Object(this.getButton$FreeColSpecObjectType(unitType2), 'skip, span 2');
          } else {
            panel.add$Component$Object(this.getButton$FreeColSpecObjectType(unitType2), 'span 2');
          }
          count++;
        }
      }
    } else {
      for (const $it3 = buildingType.getAvailableProductionTypes$boolean(false).iterator(); $it3.hasNext(); ) {
        let pt = $it3.next();
        panel.add$Component$Object(Utility.localizedLabel$String('colopedia.buildings.production'), 'newline');
        let input = CollectionUtils.first$Stream(pt.getInputs());
        if (input != null) {
          panel.add$Component$Object(this.getGoodsButton$AbstractGoods(input), 'span, split 3');
          let arrow = new JLabel()._JLabel$String('→');
          let font = FontLibrary.getScaledFont$String('simple-bold-small');
          arrow.setFont(font);
          panel.add$Component(arrow);
        }
        let output = CollectionUtils.first$Stream(pt.getOutputs());
        if (output != null) {
          panel.add$Component(this.getGoodsButton$AbstractGoods(output));
        }
      }
    }
    let workplaces = buildingType.getWorkPlaces();
    panel.add$Component$Object(Utility.localizedLabel$String('colopedia.buildings.workplaces'), 'newline');
    panel.add$Component$Object(new JLabel()._JLabel$String(String(workplaces)), 'span');
    if (workplaces > 0) {
      panel.add$Component$Object(Utility.localizedLabel$String('colopedia.buildings.specialist'), 'newline');
      let unitType = this.getSpecification().getExpertForProducing(buildingType.getProducedGoodsType());
      if (unitType == null) {
        panel.add$Component$Object(Utility.localizedLabel$String('none'), 'span');
      } else {
        panel.add$Component$Object(this.getUnitButton$UnitType(unitType), 'span');
      }
    }
    let labels = new ArrayList();
    CollectionUtils.forEach$Stream$Consumer(buildingType.getModifiers$(), (m) => {
      let component = this.getModifierComponent(m);
      if (component instanceof JButton) {
        labels.add(0, component);
      } else {
        labels.add(component);
      }
    });
    for (const $it4 = CollectionUtils.iterable(buildingType.getAbilities$()).iterator(); $it4.hasNext(); ) {
      let ability = $it4.next();
      let component = this.getAbilityComponent(ability);
      if (component != null) {
        labels.add(component);
      }
    }
    if (!labels.isEmpty()) {
      panel.add$Component$Object(Utility.localizedLabel$StringTemplate(StringTemplate.template$String('colopedia.buildings.modifiers').addAmount('%number%', labels.size())), 'newline, top');
      let count = 0;
      for (const $it5 = labels.iterator(); $it5.hasNext(); ) {
        let component = $it5.next();
        if (count > 0 && count % 2 === 0) {
          panel.add$Component$Object(component, 'skip, span 3');
        } else {
          panel.add$Component$Object(component, 'span 3');
        }
        count++;
      }
    }
    panel.add$Component$Object(Utility.localizedLabel$String('colopedia.buildings.notes'), 'newline 20, top');
    panel.add$Component$Object(Utility.localizedTextArea$String(Messages.descriptionKey$ObjectWithId(buildingType)), 'span, growx');
  }
}

$J.define(BuildingDetailPanel, 'net.sf.freecol.client.gui.panel.colopedia.BuildingDetailPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.colopedia.ColopediaGameObjectTypePanel', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.client.gui.panel.colopedia.ColopediaPanel': '_BuildingDetailPanel' }, meths: { 'buildDetail(java.lang.String,javax.swing.JPanel)': 'buildDetail$String$JPanel', 'addSubTrees(javax.swing.tree.DefaultMutableTreeNode)': 'addSubTrees$DefaultMutableTreeNode' } });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JButton = $J.load('javax.swing.JButton');
  JLabel = $J.load('javax.swing.JLabel');
  BadLocationException = $J.load('javax.swing.text.BadLocationException');
  StyleConstants = $J.load('javax.swing.text.StyleConstants');
  DefaultMutableTreeNode = $J.load('javax.swing.tree.DefaultMutableTreeNode');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  FontLibrary = $J.load('net.sf.freecol.client.gui.FontLibrary');
  ColopediaAction$PanelType = $J.load('net.sf.freecol.client.gui.action.ColopediaAction$PanelType');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  ColopediaTreeItem = $J.load('net.sf.freecol.client.gui.panel.colopedia.ColopediaTreeItem');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  ImageUtils = $J.load('net.sf.freecol.common.util.ImageUtils');
});
