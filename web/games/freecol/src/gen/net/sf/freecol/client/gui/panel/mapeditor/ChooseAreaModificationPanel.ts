// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/mapeditor/ChooseAreaModificationPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/**
 *  Copyright (C) 2002-2024   The FreeCol Team
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
import { $J, Logger } from '../../../../../../../../jre/index.ts';
import { FreeColPanel } from '../FreeColPanel.ts';

let BorderLayout, Dimension, BorderFactory, ButtonGroup, JCheckBox, JPanel, JToggleButton, SwingConstants, MigLayout, WrapLayout, WrapLayout$HorizontalAlignment, Messages;

/**
 * A panel for choosing an area that tiles should be toggled in or out from.
 */
export class ChooseAreaModificationPanel extends FreeColPanel {
  static logger: Logger = null;
  dialogHandler: DialogHandler<Area> = null;
  /**
   * Creates a new game panel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _ChooseAreaModificationPanel(freeColClient: FreeColClient, dialogHandler: DialogHandler<Area>): this {
    this._FreeColPanel$FreeColClient$String$LayoutManager(freeColClient, null, new MigLayout()._MigLayout$String$String$String('fill, wrap 1', '[fill, growprio 150]', '[fill, growprio 150]'));
    this.dialogHandler = dialogHandler;
    let areasPanel = new (ChooseAreaModificationPanel$1())().$o(this)._JPanel$LayoutManager(new WrapLayout()._WrapLayout().withHorizontalAlignment(WrapLayout$HorizontalAlignment.CENTER).withAllComponentsWithTheSameSize(true));
    areasPanel.setOpaque(false);
    let ctlr = this.getFreeColClient().getMapEditorController();
    let bg = new ButtonGroup()._ButtonGroup();
    for (const $it0 = freeColClient.getGame().getAreas().iterator(); $it0.hasNext(); ) {
      let a = $it0.next();
      let areaPanel = new JPanel()._JPanel$LayoutManager(new BorderLayout()._BorderLayout$());
      areaPanel.setOpaque(false);
      let title = (a.getNameKey() != null) ? Messages.message$String(a.getNameKey()) : a.getName();
      let areaButton = new JToggleButton()._JToggleButton$String(title);
      areaButton.addActionListener((e) => {
        $J.fn(dialogHandler, 'handle')(a);
      });
      bg.add(areaButton);
      areaPanel.add$Component$Object(areaButton, BorderLayout.NORTH);
      let visible = new JCheckBox()._JCheckBox$();
      visible.setSelected(ctlr.isAreaVisible(a));
      visible.setHorizontalAlignment(SwingConstants.CENTER);
      visible.addActionListener((e) => {
        ctlr.setAreaVisible(a, visible.isSelected());
        this.getGUI().refresh();
      });
      areaPanel.add$Component$Object(visible, BorderLayout.SOUTH);
      areasPanel.add$Component(areaPanel);
    }
    this.add$Component$Object(areasPanel, 'grow, shrink');
    this.setBorder(BorderFactory.createEmptyBorder$());
    this.setSize$Dimension(this.getPreferredSize$());
    return this;
  }
  getFrameTitle(): string {
    return Messages.message$String('mapEditor.chooseAreaModificationPanel.title');
  }
  onFrameClosing(): void {
    super.onFrameClosing();
    this.getFreeColClient().getMapEditorController().setDisplayAreas(false);
  }
  static $clinit() {
    ChooseAreaModificationPanel.logger = Logger.getLogger($J.cls(ChooseAreaModificationPanel).getName());
  }
}

let $ChooseAreaModificationPanel$1: any = null;
/** An anonymous class (ChooseAreaModificationPanel.java:65). */
function ChooseAreaModificationPanel$1(): any {
  return $ChooseAreaModificationPanel$1 ??= $J.local(class extends JPanel {
    getMinimumSize$(): Dimension {
      return new Dimension()._Dimension$int$int(1, 1);
    }
  }, 'net.sf.freecol.client.gui.panel.mapeditor.ChooseAreaModificationPanel$1', []);
}

$J.define(ChooseAreaModificationPanel, 'net.sf.freecol.client.gui.panel.mapeditor.ChooseAreaModificationPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.FreeColPanel', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.client.gui.DialogHandler': '_ChooseAreaModificationPanel' }, returns: { 'getFrameTitle': 'java.lang.String' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  BorderLayout = $J.load('java.awt.BorderLayout');
  Dimension = $J.load('java.awt.Dimension');
  BorderFactory = $J.load('javax.swing.BorderFactory');
  ButtonGroup = $J.load('javax.swing.ButtonGroup');
  JCheckBox = $J.load('javax.swing.JCheckBox');
  JPanel = $J.load('javax.swing.JPanel');
  JToggleButton = $J.load('javax.swing.JToggleButton');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  WrapLayout = $J.load('net.sf.freecol.client.gui.panel.WrapLayout');
  WrapLayout$HorizontalAlignment = $J.load('net.sf.freecol.client.gui.panel.WrapLayout$HorizontalAlignment');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
});
