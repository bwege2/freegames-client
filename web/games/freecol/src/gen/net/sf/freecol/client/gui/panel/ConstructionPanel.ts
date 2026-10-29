// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/ConstructionPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JString } from '../../../../../../../jre/index.ts';
import { MigPanel } from './MigPanel.ts';

let Color, Dimension, MouseAdapter, ImageIcon, JLabel, JPanel, MigLayout, FontLibrary, FreeColProgressBar, Utility, Messages, Colony$ColonyChangeEvent, StringTemplate, StringUtils;

/**
 * This panel shows the progress of constructing a building or
 * unit in a colony.
 */
export class ConstructionPanel extends MigPanel {
  static EVENT: string = null;
  /**
   * The enclosing client.
   */
  freeColClient: FreeColClient = null;
  /**
   * Should a mouse click open the build queue?
   */
  openBuildQueue: boolean = false;
  /**
   * The colony performing the construction.
   */
  colony: Colony = null;
  /**
   * The text to display if buildable == null.
   */
  defaultLabel: StringTemplate = null;
  /**
   * Creates a ConstructionPanel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param colony The {@code Colony} whose construction is to be
   *     modified.
   * @param openBuildQueue True if the build queue should be immediately
   *     shown.
   */
  _ConstructionPanel(freeColClient: FreeColClient, colony: Colony, openBuildQueue: boolean): this {
    this._MigPanel$String$LayoutManager('ConstructionPanelUI', new MigLayout()._MigLayout$String$String$String('fill, ins 0 0 0 0, gapy 0, wrap 2', 'push[]10[center]push', '[center]'));
    this.defaultLabel = StringTemplate.key$String('constructionPanel.clickToBuild');
    this.freeColClient = freeColClient;
    this.colony = colony;
    this.openBuildQueue = openBuildQueue;
    this.setOpaque(false);
    return this;
  }
  /**
   * Add a listener for button presses on this panel to show the BuildQueuePanel
   */
  initialize(): void {
    if (this.colony != null) {
      this.colony.addPropertyChangeListener$String$PropertyChangeListener(ConstructionPanel.EVENT, $J.fn(this, 'propertyChange'));
      if (this.openBuildQueue) {
        this.addMouseListener(new (ConstructionPanel$1())().$o(this)._MouseAdapter());
      }
    }
    this.update$();
  }
  /**
   * Removes PropertyChangeListeners and MouseListeners
   */
  cleanup(): void {
    if (this.colony != null) {
      this.colony.removePropertyChangeListener$String$PropertyChangeListener(ConstructionPanel.EVENT, $J.fn(this, 'propertyChange'));
    }
    for (let listener of this.getMouseListeners()) {
      this.removeMouseListener(listener);
    }
  }
  /**
   * This method updates the Construction Panel.
   *
   * With zero arguments, the update() method can only be
   * run on what a given colony is currently building.
   */
  update$(): void {
    this.update$BuildableType((this.colony == null) ? null : this.colony.getCurrentlyBuilding());
  }
  /**
   * This method updates the Construction Panel.
   *
   * With one argument, the update() method can be called
   * to update the panel based on a called {@code BuildableType}
   * This method is used when a change to to the
   * {@code BuildQueuePanel} are made.
   *
   * @param buildable The BuildableType object to update.
   *
   * @see BuildQueuePanel for the only use of the one-argument method.
   */
  update$BuildableType(buildable: BuildableType): void {
    this.removeAll();
    let lib = this.freeColClient.getGUI().getFixedImageLibrary();
    let font = FontLibrary.getScaledFont$String$String('normal-plain-smaller', null);
    let fontTitle = FontLibrary.getScaledFont$String$String('normal-plain-smaller', null);
    let maxFontSize = lib.scaleInt(17);
    if (font.getSize() > maxFontSize) {
      font = font.deriveFont$float(Math.fround(maxFontSize));
      fontTitle = fontTitle.deriveFont$float(Math.fround(maxFontSize));
    }
    if (buildable == null) {
      let clickToBuild = Messages.message$StringTemplate(this.getDefaultLabel());
      let breakingPoint = StringUtils.getBreakingPoint$String(clickToBuild);
      if (breakingPoint > 0) {
        let label0 = new JLabel()._JLabel$String(clickToBuild.substring(0, breakingPoint));
        label0.setFont(font);
        label0.setForeground(this.getForeground());
        this.add$Component$Object(label0, 'span, align center bottom');
        let label1 = new JLabel()._JLabel$String(clickToBuild.substring((breakingPoint + 1) | 0));
        label1.setFont(font);
        label1.setForeground(this.getForeground());
        this.add$Component$Object(label1, 'span, align center top');
      } else {
        let label = new JLabel()._JLabel$String(clickToBuild);
        label.setFont(font);
        label.setForeground(this.getForeground());
        this.add$Component$Object(label, 'span, align center');
      }
    } else {
      let infoPanel = new JPanel()._JPanel$LayoutManager(new MigLayout()._MigLayout$String$String('wrap 1', '[center]'));
      infoPanel.setOpaque(false);
      let image = lib.getSmallBuildableTypeImageWithWithSize(buildable, this.colony.getOwner(), new Dimension()._Dimension$int$int(lib.scaleInt(100), lib.scaleInt(96)));
      this.add$Component$Object(new JLabel()._JLabel$Icon(new ImageIcon()._ImageIcon$Image(image)), 'spany');
      let label0 = Utility.localizedLabel$StringTemplate(buildable.getCurrentlyBuildingLabel());
      label0.setFont(fontTitle);
      label0.setForeground(this.getForeground());
      infoPanel.add$Component(label0);
      for (const $it0 = buildable.getRequiredGoodsList$().iterator(); $it0.hasNext(); ) {
        let ag = $it0.next();
        let amountNeeded = ag.getAmount();
        let amountAvailable = this.colony.getGoodsCount(ag.getType());
        let amountProduced = this.colony.getAdjustedNetProductionOf(ag.getType());
        infoPanel.add$Component$Object(new FreeColProgressBar()._FreeColProgressBar$FreeColClient$GoodsType$int$int$int$int(this.freeColClient, ag.getType(), 0, amountNeeded, amountAvailable, amountProduced), 'height 20:');
      }
      this.add$Component(infoPanel);
    }
    this.revalidate();
    this.repaint$();
  }
  /**
   * @return A {@code StringTemplate} of the ConstructionPanel's Label
   */
  getDefaultLabel(): StringTemplate {
    return this.defaultLabel;
  }
  /**
   * Set the ConstructionPanel's Label as a {@code StringTemplate}
   *
   * @param newDefaultLabel The default StringTemplate label of the panel.
   */
  setDefaultLabel(newDefaultLabel: StringTemplate): void {
    this.defaultLabel = newDefaultLabel;
  }
  /**
   * {@inheritDoc}
   *
   * Upon a change to a bound parameter, call the {@link #update()} method.
   */
  propertyChange(event: PropertyChangeEvent): void {
    this.update$();
  }
  paintComponent(g: Graphics): void {
    super.paintComponent(g);
    let oldColor = g.getColor();
    g.setColor(new Color()._Color$int$int$int$int(0, 0, 0, 128));
    let size = this.getSize$();
    g.fillRect(0, 0, size.width_, size.height_);
    g.setColor(oldColor);
  }
  static $clinit() {
    ConstructionPanel.EVENT = Colony$ColonyChangeEvent.BUILD_QUEUE_CHANGE.toString();
  }
}

let $ConstructionPanel$1: any = null;
/** An anonymous class (ConstructionPanel.java:108). */
function ConstructionPanel$1(): any {
  return $ConstructionPanel$1 ??= $J.local(class extends MouseAdapter {
    mousePressed(e: MouseEvent): void {
      this.$outer.freeColClient.getGUI().showBuildQueuePanel(this.$outer.colony);
    }
  }, 'net.sf.freecol.client.gui.panel.ConstructionPanel$1', []);
}

$J.define(ConstructionPanel, 'net.sf.freecol.client.gui.panel.ConstructionPanel', { kind: 'class', ifaces: ['java.beans.PropertyChangeListener'], sup: 'net.sf.freecol.client.gui.panel.MigPanel', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.common.model.Colony,boolean': '_ConstructionPanel' }, returns: { 'getDefaultLabel': 'net.sf.freecol.common.model.StringTemplate' }, meths: { 'update(net.sf.freecol.common.model.BuildableType)': 'update$BuildableType', 'update()': 'update$' }, clinit: true, lazy: ['EVENT'] });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  Dimension = $J.load('java.awt.Dimension');
  MouseAdapter = $J.load('java.awt.event.MouseAdapter');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JLabel = $J.load('javax.swing.JLabel');
  JPanel = $J.load('javax.swing.JPanel');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  FontLibrary = $J.load('net.sf.freecol.client.gui.FontLibrary');
  FreeColProgressBar = $J.load('net.sf.freecol.client.gui.panel.FreeColProgressBar');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Colony$ColonyChangeEvent = $J.load('net.sf.freecol.common.model.Colony$ColonyChangeEvent');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
});
