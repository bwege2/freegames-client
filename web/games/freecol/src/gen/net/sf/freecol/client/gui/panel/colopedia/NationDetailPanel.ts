// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/colopedia/NationDetailPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let ImageIcon, JLabel, MigLayout, ImageLibrary, ColopediaAction$PanelType, Utility, CollectionUtils;

/**
 * This panel displays details of nations in the Colopedia.
 */
export class NationDetailPanel extends ColopediaGameObjectTypePanel {
  /**
   * Creates a new instance of this ColopediaDetailPanel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param colopediaPanel The parent ColopediaPanel.
   */
  _NationDetailPanel(freeColClient: FreeColClient, colopediaPanel: ColopediaPanel): this {
    this._ColopediaGameObjectTypePanel(freeColClient, colopediaPanel, ColopediaAction$PanelType.NATIONS.getKey());
    return this;
  }
  /**
   * {@inheritDoc}
   */
  addSubTrees$DefaultMutableTreeNode(root: DefaultMutableTreeNode): void {
    let nations = new ArrayList();
    nations.addAll(this.getSpecification().getEuropeanNations());
    nations.addAll(this.getSpecification().getIndianNations());
    super.addSubTrees$DefaultMutableTreeNode$List(root, nations);
  }
  /**
   * {@inheritDoc}
   */
  buildDetail$String$JPanel(id: string, panel: JPanel): void {
    if ($J.equals(this.getId(), id)) {
      return;
    }
    let nation = this.getSpecification().getNation(id);
    let player = CollectionUtils.find$Stream$Predicate(this.getGame().getLivePlayers([]), (p) => p.getNation() === nation);
    let currentNationType = (player == null) ? nation.getType() : player.getNationType();
    panel.setLayout(new MigLayout()._MigLayout$String$String$String('wrap 3, fillx, gapx 20', '', ''));
    let name = Utility.localizedHeaderLabel$Named$String(nation, Utility.FONTSPEC_SUBTITLE);
    panel.add$Component$Object(name, 'span, align center, wrap 40');
    let artLabel = new JLabel()._JLabel$Icon(new ImageIcon()._ImageIcon$Image(ImageLibrary.getMonarchImage$Nation(nation)));
    panel.add$Component$Object(artLabel, 'spany, gap 40, top');
    panel.add$Component(Utility.localizedLabel$String('colopedia.nation.ruler'));
    panel.add$Component(new JLabel()._JLabel$String(nation.getRulerName()));
    panel.add$Component(Utility.localizedLabel$String('colopedia.nation.defaultAdvantage'));
    panel.add$Component(this.getButton$FreeColSpecObjectType(nation.getType()));
    panel.add$Component(Utility.localizedLabel$String('colopedia.nation.currentAdvantage'));
    panel.add$Component$Object(this.getButton$FreeColSpecObjectType(currentNationType), 'wrap push');
  }
}

$J.define(NationDetailPanel, 'net.sf.freecol.client.gui.panel.colopedia.NationDetailPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.colopedia.ColopediaGameObjectTypePanel', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.client.gui.panel.colopedia.ColopediaPanel': '_NationDetailPanel' }, meths: { 'buildDetail(java.lang.String,javax.swing.JPanel)': 'buildDetail$String$JPanel', 'addSubTrees(javax.swing.tree.DefaultMutableTreeNode)': 'addSubTrees$DefaultMutableTreeNode' } });
$J.module(() => {
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JLabel = $J.load('javax.swing.JLabel');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  ColopediaAction$PanelType = $J.load('net.sf.freecol.client.gui.action.ColopediaAction$PanelType');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
