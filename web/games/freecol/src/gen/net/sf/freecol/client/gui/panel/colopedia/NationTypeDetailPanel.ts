// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/colopedia/NationTypeDetailPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let GridLayout, ImageIcon, JLabel, JPanel, SwingConstants, DefaultMutableTreeNode, MigLayout, FontLibrary, ColopediaAction$PanelType, Utility, ColopediaTreeItem, Messages, EuropeanNationType, IndianNationType, CollectionUtils, ImageUtils, StringUtils;

/**
 * This panel displays details of nations in the Colopedia.
 */
export class NationTypeDetailPanel extends ColopediaGameObjectTypePanel {
  /**
   * Creates a new instance of this ColopediaDetailPanel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param colopediaPanel The parent ColopediaPanel.
   */
  _NationTypeDetailPanel(freeColClient: FreeColClient, colopediaPanel: ColopediaPanel): this {
    this._ColopediaGameObjectTypePanel(freeColClient, colopediaPanel, ColopediaAction$PanelType.NATION_TYPES.getKey());
    return this;
  }
  /**
   * {@inheritDoc}
   */
  addSubTrees$DefaultMutableTreeNode(root: DefaultMutableTreeNode): void {
    let parent = new DefaultMutableTreeNode()._DefaultMutableTreeNode$Object(new ColopediaTreeItem()._ColopediaTreeItem(this, this.getId(), this.getName$(), null));
    let nations = new ArrayList();
    nations.addAll(this.getSpecification().getVisibleEuropeanNationTypes());
    nations.addAll(this.getSpecification().getREFNationTypes());
    nations.addAll(this.getSpecification().getIndianNationTypes());
    let icon = new ImageIcon()._ImageIcon$Image(ImageUtils.createCenteredImage$BufferedImage$Dimension(this.getImageLibrary().getLibertyImage(), this.getListItemIconSize()));
    for (const $it0 = nations.iterator(); $it0.hasNext(); ) {
      let type$ = $it0.next();
      parent.add(this.buildItem(type$, icon));
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
    let nationType = this.getSpecification().getNationType(id);
    if (nationType instanceof EuropeanNationType) {
      this.buildEuropeanNationTypeDetail(nationType, panel);
    } else if (nationType instanceof IndianNationType) {
      this.buildIndianNationTypeDetail(nationType, panel);
    }
  }
  /**
   * Builds the details panel for the given nation type.
   *
   * @param nationType - the EuropeanNationType
   * @param panel the panel to use
   */
  buildEuropeanNationTypeDetail(nationType: EuropeanNationType, panel: JPanel): void {
    let boldFont = FontLibrary.getScaledFont$String('simple-bold-smaller');
    panel.setLayout(new MigLayout()._MigLayout$String('wrap 2, gapx 20'));
    let label = Utility.localizedHeaderLabel$Named$String(nationType, Utility.FONTSPEC_SUBTITLE);
    panel.add$Component$Object(label, 'span, align center, wrap 40');
    label = Utility.localizedLabel$String('colopedia.nationType.units');
    label.setFont(boldFont);
    panel.add$Component$Object(label, 'wrap');
    let startingUnits = nationType.getStartingUnits$();
    let startingUnit = CollectionUtils.first$Collection(startingUnits);
    if (startingUnit != null) {
      if (startingUnits.size() > 1) {
        panel.add$Component$Object(this.getUnitButton$AbstractUnit(startingUnit), 'span, split ' + startingUnits.size());
        for (let index = 1; index < startingUnits.size(); index++) {
          startingUnit = startingUnits.get(index);
          panel.add$Component(this.getUnitButton$AbstractUnit(startingUnit));
        }
      } else {
        panel.add$Component(this.getUnitButton$AbstractUnit(startingUnit));
      }
    }
    let abilities = CollectionUtils.transform$Stream$Predicate$Function$Collector(nationType.getAbilities$(), CollectionUtils.alwaysTrue(), (a) => this.getAbilityComponent(a), CollectionUtils.toListNoNulls());
    if (!abilities.isEmpty()) {
      label = Utility.localizedLabel$String('abilities');
      label.setFont(boldFont);
      panel.add$Component$Object(label, 'newline 20, span');
      for (const $it1 = abilities.iterator(); $it1.hasNext(); ) {
        let a = $it1.next();
        panel.add$Component(a);
      }
    }
    let modifiers = CollectionUtils.transform$Stream$Predicate$Function$Collector(nationType.getModifiers$(), CollectionUtils.alwaysTrue(), (m) => this.getModifierComponent(m), CollectionUtils.toListNoNulls());
    if (!modifiers.isEmpty()) {
      label = Utility.localizedLabel$String('modifiers');
      label.setFont(boldFont);
      panel.add$Component$Object(label, 'newline 20, span');
      for (const $it2 = modifiers.iterator(); $it2.hasNext(); ) {
        let m = $it2.next();
        panel.add$Component(m);
      }
    }
  }
  /**
   * Builds the details panel for the given nation type.
   *
   * @param nationType - the IndianNationType
   * @param panel the panel to use
   */
  buildIndianNationTypeDetail(nationType: IndianNationType, panel: JPanel): void {
    let skills = nationType.getSkills();
    panel.setLayout(new MigLayout()._MigLayout$String$String$String('wrap 2, gapx 20', '', ''));
    let name = Utility.localizedHeaderLabel$Named$String(nationType, Utility.FONTSPEC_SUBTITLE);
    panel.add$Component$Object(name, 'span, align center, wrap 40');
    panel.add$Component(Utility.localizedLabel$String('colopedia.nationType.aggression'));
    panel.add$Component(Utility.localizedLabel$String('colopedia.nationType.' + nationType.getAggression().getKey()));
    panel.add$Component(Utility.localizedLabel$String('colopedia.nationType.settlementNumber'));
    panel.add$Component(Utility.localizedLabel$String('colopedia.nationType.' + nationType.getNumberOfSettlements().getKey()));
    panel.add$Component(Utility.localizedLabel$String('colopedia.nationType.typeOfSettlements'));
    panel.add$Component(new JLabel()._JLabel$String$Icon$int(Messages.getName$Named(nationType.getCapitalType()), new ImageIcon()._ImageIcon$Image(this.getImageLibrary().getScaledSettlementTypeImage(nationType.getCapitalType())), SwingConstants.CENTER));
    let regionNames = CollectionUtils.toList$Stream(CollectionUtils.map$Collection$Function(nationType.getRegions(), (n) => Messages.getName$String(n)));
    panel.add$Component(Utility.localizedLabel$String('colopedia.nationType.regions'));
    panel.add$Component(new JLabel()._JLabel$String(StringUtils.join$String$Collection(', ', regionNames)));
    panel.add$Component$Object(Utility.localizedLabel$String('colopedia.nationType.skills'), 'top, newline 20');
    let gridLayout = new GridLayout()._GridLayout$int$int(0, 2);
    gridLayout.setHgap(10);
    let unitPanel = new JPanel()._JPanel$LayoutManager(gridLayout);
    unitPanel.setOpaque(false);
    for (const $it3 = skills.iterator(); $it3.hasNext(); ) {
      let choice = $it3.next();
      unitPanel.add$Component(this.getUnitButton$UnitType(choice.getObject()));
    }
    panel.add$Component(unitPanel);
  }
}

$J.define(NationTypeDetailPanel, 'net.sf.freecol.client.gui.panel.colopedia.NationTypeDetailPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.colopedia.ColopediaGameObjectTypePanel', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.client.gui.panel.colopedia.ColopediaPanel': '_NationTypeDetailPanel' }, meths: { 'buildDetail(java.lang.String,javax.swing.JPanel)': 'buildDetail$String$JPanel', 'addSubTrees(javax.swing.tree.DefaultMutableTreeNode)': 'addSubTrees$DefaultMutableTreeNode' } });
$J.module(() => {
  GridLayout = $J.load('java.awt.GridLayout');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JLabel = $J.load('javax.swing.JLabel');
  JPanel = $J.load('javax.swing.JPanel');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  DefaultMutableTreeNode = $J.load('javax.swing.tree.DefaultMutableTreeNode');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  FontLibrary = $J.load('net.sf.freecol.client.gui.FontLibrary');
  ColopediaAction$PanelType = $J.load('net.sf.freecol.client.gui.action.ColopediaAction$PanelType');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  ColopediaTreeItem = $J.load('net.sf.freecol.client.gui.panel.colopedia.ColopediaTreeItem');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  EuropeanNationType = $J.load('net.sf.freecol.common.model.EuropeanNationType');
  IndianNationType = $J.load('net.sf.freecol.common.model.IndianNationType');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  ImageUtils = $J.load('net.sf.freecol.common.util.ImageUtils');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
});
