// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/colopedia/FatherDetailPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, EnumMap, Logger } from '../../../../../../../../jre/index.ts';
import { ColopediaGameObjectTypePanel } from './ColopediaGameObjectTypePanel.ts';

let ImageIcon, JLabel, DefaultMutableTreeNode, MigLayout, FontLibrary, ColopediaAction$PanelType, Utility, ColopediaTreeItem, Messages, FoundingFather$FoundingFatherType, StringTemplate, ImageUtils;

/**
 * This panel displays details of founding fathers in the Colopedia.
 */
export class FatherDetailPanel extends ColopediaGameObjectTypePanel {
  static logger: Logger = null;
  /**
   * Creates a new instance of this ColopediaDetailPanel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param colopediaPanel The parent ColopediaPanel.
   */
  _FatherDetailPanel(freeColClient: FreeColClient, colopediaPanel: ColopediaPanel): this {
    this._ColopediaGameObjectTypePanel(freeColClient, colopediaPanel, ColopediaAction$PanelType.FATHERS.getKey());
    return this;
  }
  /**
   * {@inheritDoc}
   */
  addSubTrees$DefaultMutableTreeNode(root: DefaultMutableTreeNode): void {
    let spec = this.getSpecification();
    let parent = new DefaultMutableTreeNode()._DefaultMutableTreeNode$Object(new ColopediaTreeItem()._ColopediaTreeItem(this, this.getId(), this.getName$(), null));
    let fathersByType = new EnumMap($J.cls(FoundingFather$FoundingFatherType));
    for (let fatherType of FoundingFather$FoundingFatherType.values()) {
      fathersByType.put(fatherType, new ArrayList());
    }
    for (const $it0 = spec.getFoundingFathers().iterator(); $it0.hasNext(); ) {
      let foundingFather = $it0.next();
      fathersByType.get(foundingFather.getType()).add(foundingFather);
    }
    let icon = new ImageIcon()._ImageIcon$Image(ImageUtils.createCenteredImage$BufferedImage$Dimension(this.getImageLibrary().getLibertyImage(), this.getListItemIconSize()));
    for (let fatherType of FoundingFather$FoundingFatherType.values()) {
      let id = fatherType.getTypeKey();
      let typeName = Messages.message$String(id);
      let node = new DefaultMutableTreeNode()._DefaultMutableTreeNode$Object(new ColopediaTreeItem()._ColopediaTreeItem(this, id, typeName, null));
      parent.add(node);
      for (const $it1 = fathersByType.get(fatherType).iterator(); $it1.hasNext(); ) {
        let father = $it1.next();
        node.add(this.buildItem(father, icon));
      }
    }
    root.add(parent);
  }
  /**
   * {@inheritDoc}
   */
  buildDetail$String$JPanel(id: string, panel: JPanel): void {
    let father = this.getSpecification().getFoundingFather(id);
    if (father == null) {
      FatherDetailPanel.logger.warning('Bogus father detail requested for: ' + id);
    } else {
      this.buildDetail$FoundingFather$JPanel(father, panel);
    }
  }
  /**
   * Builds the details panel for the given FoundingFather.
   *
   * @param father The {@code FoundingFather} to build a panel for.
   * @param panel The detail panel to build.
   */
  buildDetail$FoundingFather$JPanel(father: FoundingFather, panel: JPanel): void {
    panel.setLayout(new MigLayout()._MigLayout$String$String$String('wrap 2, fillx, gapx 20', '', ''));
    let name = Messages.getName$Named(father);
    let type$ = Messages.message$String(father.getTypeKey());
    let text = name + ' (' + type$ + ')';
    let header = new JLabel()._JLabel$String(text);
    header.setFont(FontLibrary.getScaledFont$String$String(Utility.FONTSPEC_SUBTITLE, text));
    let image = this.getImageLibrary().getFoundingFatherImage(father, false);
    let label = new JLabel()._JLabel$Icon(new ImageIcon()._ImageIcon$Image(image));
    let template = StringTemplate.label('').add$String(Messages.descriptionKey$ObjectWithId(father)).addName$String('\n\n[').add$String(father.getId() + '.birthAndDeath').addName$String('] ').add$String(father.getId() + '.text');
    let turn = this.getMyPlayer().getElectionTurns().get(name);
    if (turn != null) {
      template.addName$String('\n\n').add$String('report.continentalCongress.elected').addName$String(' ').addStringTemplate$StringTemplate(turn.getLabel());
    }
    panel.add$Component$Object(header, 'span, align center, wrap');
    panel.add$Component$Object(label, 'top');
    let description = Utility.localizedTextArea$StringTemplate$int(template, 20);
    panel.add$Component$Object(description, 'top, growx, wmin 0');
  }
  static $clinit() {
    FatherDetailPanel.logger = Logger.getLogger($J.cls(FatherDetailPanel).getName());
  }
}

$J.define(FatherDetailPanel, 'net.sf.freecol.client.gui.panel.colopedia.FatherDetailPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.colopedia.ColopediaGameObjectTypePanel', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.client.gui.panel.colopedia.ColopediaPanel': '_FatherDetailPanel' }, meths: { 'buildDetail(net.sf.freecol.common.model.FoundingFather,javax.swing.JPanel)': 'buildDetail$FoundingFather$JPanel', 'buildDetail(java.lang.String,javax.swing.JPanel)': 'buildDetail$String$JPanel', 'addSubTrees(javax.swing.tree.DefaultMutableTreeNode)': 'addSubTrees$DefaultMutableTreeNode' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JLabel = $J.load('javax.swing.JLabel');
  DefaultMutableTreeNode = $J.load('javax.swing.tree.DefaultMutableTreeNode');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  FontLibrary = $J.load('net.sf.freecol.client.gui.FontLibrary');
  ColopediaAction$PanelType = $J.load('net.sf.freecol.client.gui.action.ColopediaAction$PanelType');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  ColopediaTreeItem = $J.load('net.sf.freecol.client.gui.panel.colopedia.ColopediaTreeItem');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  FoundingFather$FoundingFatherType = $J.load('net.sf.freecol.common.model.FoundingFather$FoundingFatherType');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  ImageUtils = $J.load('net.sf.freecol.common.util.ImageUtils');
});
