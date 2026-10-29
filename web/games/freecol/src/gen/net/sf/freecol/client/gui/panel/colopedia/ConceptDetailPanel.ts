// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/colopedia/ConceptDetailPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, Comparator } from '../../../../../../../../jre/index.ts';
import { FreeColPanel } from '../FreeColPanel.ts';
import { JEditorPane } from '../../../../../../../javax/swing/JEditorPane.ts';

let RenderingHints, ImageIcon, SwingConstants, DefaultMutableTreeNode, MigLayout, ColopediaAction$PanelType, Utility, ColopediaTreeItem, Messages, ImageUtils;

/**
 * This panel displays the concepts within the Colopedia.
 */
export class ConceptDetailPanel extends FreeColPanel {
  static id: string = null;
  static concepts: string[] = null;
  static nodeComparator: Comparator<DefaultMutableTreeNode> = null;
  colopediaPanel: ColopediaPanel = null;
  /**
   * Creates a new instance of this ColopediaDetailPanel.
   *
   * @param freeColClient The enclosing {@code FreeColClient}.
   * @param colopediaPanel The parent {@code ColopediaPanel}.
   */
  _ConceptDetailPanel(freeColClient: FreeColClient, colopediaPanel: ColopediaPanel): this {
    this._FreeColPanel$FreeColClient(freeColClient);
    this.colopediaPanel = colopediaPanel;
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getName$(): string {
    return Messages.getName$String(ConceptDetailPanel.id);
  }
  /**
   * {@inheritDoc}
   */
  addSubTrees$DefaultMutableTreeNode(root: DefaultMutableTreeNode): void {
    let node = new DefaultMutableTreeNode()._DefaultMutableTreeNode$Object(new ColopediaTreeItem()._ColopediaTreeItem(this, ConceptDetailPanel.id, this.getName$(), null));
    let nodes = new ArrayList(ConceptDetailPanel.concepts.length);
    for (let concept of ConceptDetailPanel.concepts) {
      let nodeId = 'colopedia.concepts.' + concept;
      let nodeName = Messages.getName$String(nodeId);
      let image = ImageUtils.createCenteredImage$BufferedImage$Dimension(this.getImageLibrary().getColopediaConceptImage(), this.colopediaPanel.getListItemIconSize());
      nodes.add(new DefaultMutableTreeNode()._DefaultMutableTreeNode$Object(new ColopediaTreeItem()._ColopediaTreeItem(this, nodeId, nodeName, new ImageIcon()._ImageIcon$Image(image))));
    }
    Collections.sort(nodes, ConceptDetailPanel.nodeComparator);
    for (const $it0 = nodes.iterator(); $it0.hasNext(); ) {
      let n = $it0.next();
      node.add(n);
    }
    root.add(node);
  }
  /**
   * {@inheritDoc}
   */
  buildDetail$String$JPanel(id: string, panel: JPanel): void {
    if ($J.equals(ConceptDetailPanel.id, id)) {
      return;
    }
    panel.setLayout(new MigLayout()._MigLayout$String('wrap 1, center'));
    let header = Utility.localizedHeaderLabel$String$int$String(Messages.nameKey$String(id), SwingConstants.LEADING, Utility.FONTSPEC_SUBTITLE);
    panel.add$Component$Object(header, 'align center, wrap 20');
    let editorPane = new ConceptDetailPanel$ConceptEditorPane()._ConceptDetailPanel$ConceptEditorPane(Messages.getDescription$String(id));
    editorPane.setFont(panel.getFont());
    editorPane.addHyperlinkListener(this.colopediaPanel);
    panel.add$Component$Object(editorPane, 'width 95%');
  }
  static $clinit() {
    ConceptDetailPanel.id = 'colopediaAction.' + ColopediaAction$PanelType.CONCEPTS.getKey();
    ConceptDetailPanel.concepts = ['taxes', 'efficiency', 'education', 'fortification', 'independence', 'ref', 'interventionForce'];
    ConceptDetailPanel.nodeComparator = Comparator.comparing((tn) => (tn.getUserObject()).getText());
  }
}

export class ConceptDetailPanel$ConceptEditorPane extends JEditorPane {
  /**
   * Build a new concept editor pane containing the given text.
   *
   * @param text The text to display.
   */
  _ConceptDetailPanel$ConceptEditorPane(text: string): this {
    this._JEditorPane$String$String('text/html', text);
    this.putClientProperty(JEditorPane.HONOR_DISPLAY_PROPERTIES, true);
    this.setOpaque(false);
    this.setEditable(false);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  paintComponent(g: Graphics): void {
    let graphics2d = g;
    graphics2d.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
    super.paintComponent(graphics2d);
  }
}

$J.define(ConceptDetailPanel, 'net.sf.freecol.client.gui.panel.colopedia.ConceptDetailPanel', { kind: 'class', ifaces: ['net.sf.freecol.client.gui.panel.colopedia.ColopediaDetailPanel'], sup: 'net.sf.freecol.client.gui.panel.FreeColPanel', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.client.gui.panel.colopedia.ColopediaPanel': '_ConceptDetailPanel' }, returns: { 'getName$': 'java.lang.String' }, meths: { 'buildDetail(java.lang.String,javax.swing.JPanel)': 'buildDetail$String$JPanel', 'addSubTrees(javax.swing.tree.DefaultMutableTreeNode)': 'addSubTrees$DefaultMutableTreeNode', 'getName()': 'getName$' }, clinit: true, lazy: ['id', 'concepts', 'nodeComparator'] });
$J.define(ConceptDetailPanel$ConceptEditorPane, 'net.sf.freecol.client.gui.panel.colopedia.ConceptDetailPanel$ConceptEditorPane', { kind: 'class', sup: 'javax.swing.JEditorPane', ctors: { 'java.lang.String': '_ConceptDetailPanel$ConceptEditorPane' } });
$J.module(() => {
  RenderingHints = $J.load('java.awt.RenderingHints');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  DefaultMutableTreeNode = $J.load('javax.swing.tree.DefaultMutableTreeNode');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  ColopediaAction$PanelType = $J.load('net.sf.freecol.client.gui.action.ColopediaAction$PanelType');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  ColopediaTreeItem = $J.load('net.sf.freecol.client.gui.panel.colopedia.ColopediaTreeItem');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  ImageUtils = $J.load('net.sf.freecol.common.util.ImageUtils');
});
