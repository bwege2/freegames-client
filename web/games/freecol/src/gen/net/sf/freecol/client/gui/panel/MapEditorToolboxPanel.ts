// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/MapEditorToolboxPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger } from '../../../../../../../jre/index.ts';
import { FreeColPanel } from './FreeColPanel.ts';

let BorderLayout, Dimension, BorderFactory, ButtonGroup, ImageIcon, JPanel, JScrollPane, JToggleButton, ScrollPaneConstants, MapEditorTool, ImageLibrary, SwingGUI$PopupPosition, WrapLayout, WrapLayout$HorizontalAlignment, WrapLayout$HorizontalGap, Messages;

/**
 * A panel for choosing the current tool in the map editor.
 *
 * This panel is only used when running in
 * {@link net.sf.freecol.client.FreeColClient#isMapEditor() map editor mode}.
 *
 * @see MapEditorTransformPanel
 */
export class MapEditorToolboxPanel extends FreeColPanel {
  static logger: Logger = null;
  listPanel: JPanel = null;
  group: ButtonGroup = null;
  /**
   * Creates a panel for choosing the current tool in the map editor.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _MapEditorToolboxPanel(freeColClient: FreeColClient): this {
    this._FreeColPanel$FreeColClient$String$LayoutManager(freeColClient, null, new BorderLayout()._BorderLayout$());
    let terrainSize = ImageLibrary.scaleDimension(this.getImageLibrary().scale$Dimension(ImageLibrary.TILE_OVERLAY_SIZE), ImageLibrary.SMALLER_SCALE);
    this.listPanel = new JPanel()._JPanel$LayoutManager(new WrapLayout()._WrapLayout().withForceComponentSize(terrainSize).withHorizontalAlignment(WrapLayout$HorizontalAlignment.LEFT).withHorizontalGap$HorizontalGap(WrapLayout$HorizontalGap.AUTO));
    this.group = new ButtonGroup()._ButtonGroup();
    this.group.add(new JToggleButton()._JToggleButton$());
    this.buildList();
    let sl = new JScrollPane()._JScrollPane$Component$int$int(this.listPanel, ScrollPaneConstants.VERTICAL_SCROLLBAR_AS_NEEDED, ScrollPaneConstants.HORIZONTAL_SCROLLBAR_NEVER);
    sl.getViewport().setOpaque(false);
    this.listPanel.setSize$Dimension(new Dimension()._Dimension$int$int(Math.imul(terrainSize.width_, 3), 0));
    this.add$Component$Object(sl, BorderLayout.CENTER);
    this.setBorder(BorderFactory.createEmptyBorder$());
    this.revalidate();
    this.repaint$();
    return this;
  }
  getFrameTitle(): string {
    return Messages.message$String('mapEditor.toolBoxPanel.title');
  }
  getFramePopupPosition(): SwingGUI$PopupPosition {
    return SwingGUI$PopupPosition.UPPER_RIGHT;
  }
  /**
   * Builds the buttons for all the tools.
   */
  buildList(): void {
    let ctlr = this.getFreeColClient().getMapEditorController();
    let defaultTool = ctlr.getCurrentTool();
    for (let mapEditorTool of MapEditorTool.values()) {
      let isDefaultTool = (mapEditorTool === defaultTool);
      this.listPanel.add$Component(this.buildButton(mapEditorTool, isDefaultTool));
    }
  }
  buildButton(mapEditorTool: MapEditorTool, defaultTool: boolean): JToggleButton {
    let text = Messages.getName$String(mapEditorTool.getId());
    let ctlr = this.getFreeColClient().getMapEditorController();
    let riverSize = ImageLibrary.scaleDimension(this.getImageLibrary().scale$Dimension(ImageLibrary.TILE_SIZE), ImageLibrary.SMALLER_SCALE);
    let icon = new ImageIcon()._ImageIcon$Image(this.getImageLibrary().getScaledImage('image.ui.includesSpecification'));
    let button = new JToggleButton()._JToggleButton$Icon(icon);
    button.setToolTipText(text);
    button.setOpaque(false);
    button.setSelected(defaultTool);
    this.group.add(button);
    button.addActionListener((ae) => {
    });
    button.setBorder(null);
    return button;
  }
  static $clinit() {
    MapEditorToolboxPanel.logger = Logger.getLogger($J.cls(MapEditorToolboxPanel).getName());
  }
}

$J.define(MapEditorToolboxPanel, 'net.sf.freecol.client.gui.panel.MapEditorToolboxPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.FreeColPanel', ctors: { 'net.sf.freecol.client.FreeColClient': '_MapEditorToolboxPanel' }, returns: { 'getFramePopupPosition': 'net.sf.freecol.client.gui.SwingGUI$PopupPosition', 'getFrameTitle': 'java.lang.String' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  BorderLayout = $J.load('java.awt.BorderLayout');
  Dimension = $J.load('java.awt.Dimension');
  BorderFactory = $J.load('javax.swing.BorderFactory');
  ButtonGroup = $J.load('javax.swing.ButtonGroup');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JPanel = $J.load('javax.swing.JPanel');
  JScrollPane = $J.load('javax.swing.JScrollPane');
  JToggleButton = $J.load('javax.swing.JToggleButton');
  ScrollPaneConstants = $J.load('javax.swing.ScrollPaneConstants');
  MapEditorTool = $J.load('net.sf.freecol.client.control.MapEditorTool');
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  SwingGUI$PopupPosition = $J.load('net.sf.freecol.client.gui.SwingGUI$PopupPosition');
  WrapLayout = $J.load('net.sf.freecol.client.gui.panel.WrapLayout');
  WrapLayout$HorizontalAlignment = $J.load('net.sf.freecol.client.gui.panel.WrapLayout$HorizontalAlignment');
  WrapLayout$HorizontalGap = $J.load('net.sf.freecol.client.gui.panel.WrapLayout$HorizontalGap');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
});
