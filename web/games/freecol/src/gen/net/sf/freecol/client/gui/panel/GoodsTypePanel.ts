// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/GoodsTypePanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../jre/index.ts';
import { MigPanel } from './MigPanel.ts';

let MigLayout, GoodsTypeLabel, Utility;

/**
 * Simple panel for a goods type.
 *
 * Used in the trade route code to show the cargo a carrier is
 * supposed to take on board at a certain stop.
 *
 * FIXME: use in the CaptureGoodsDialog?
 */
export class GoodsTypePanel extends MigPanel {
  /**
   * Are duplicate entries allowed?
   */
  unique: boolean = false;
  /**
   * Build a new cargo panel.
   *
   * @param unique Should the goods types be unique or are
   *     duplicates allowed?
   */
  _GoodsTypePanel$boolean(unique: boolean): this {
    this._GoodsTypePanel$LayoutManager$boolean(new MigLayout()._MigLayout$(), unique);
    return this;
  }
  /**
   * Build a new goods type panel.
   *
   * @param layout The {@code LayoutManager} to use for this panel.
   * @param unique Should the goods types be unique or are
   *     duplicates allowed?
   */
  _GoodsTypePanel$LayoutManager$boolean(layout: LayoutManager, unique: boolean): this {
    this._MigPanel$LayoutManager(layout);
    this.unique = unique;
    this.setOpaque(false);
    this.setBorder(Utility.localizedBorder$String('cargoOnCarrier'));
    return this;
  }
  /**
   * Set the labels to display on this panel.
   *
   * @param labels The {@code GoodsTypeLabel}s to display.
   */
  setLabels(labels: List<GoodsTypeLabel>): void {
    this.removeAll();
    if (labels != null) {
      for (const $it0 = labels.iterator(); $it0.hasNext(); ) {
        let label = $it0.next();
        this.add$Component(label);
      }
    }
    this.revalidate();
    this.repaint$();
  }
  /**
   * Find the sub-component goods type label for a given goods type.
   *
   * @param gt The {@code GoodsType} to find.
   * @return The existing subcomponent for that goods type, or null.
   */
  findLabel(gt: GoodsType): Component {
    for (let child of this.getComponents()) {
      if (child instanceof GoodsTypeLabel && (child).getType() === gt) {
        return child;
      }
    }
    return null;
  }
  /**
   * Add a single label.
   *
   * Do not repaint, that will be done top down.
   *
   * @param label The {@code GoodsTypeLabel} to add.
   * @return True if the label was added.
   */
  addLabel(label: GoodsTypeLabel): boolean {
    if (label != null && (!this.unique || this.findLabel(label.getType()) == null)) {
      let ret = super.add$Component(label);
      this.revalidate();
      this.repaint$();
      return ret != null;
    }
    return false;
  }
  /**
   * Remove labels that correspond to a given goods type.
   *
   * @param gt The {@code GoodsType} to remove.
   * @return True if the goods were removed.
   */
  removeGoodsType(gt: GoodsType): boolean {
    let child = this.findLabel(gt);
    if (child != null) {
      super.remove$Component(child);
      this.revalidate();
      this.repaint$();
      return true;
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  accepts$GoodsType(goodsType: GoodsType): boolean {
    return true;
  }
  /**
   * {@inheritDoc}
   */
  add$Component$boolean(comp: Component, editState: boolean): Component {
    if (comp instanceof GoodsTypeLabel && this.addLabel(comp)) {
      return comp;
    }
    return null;
  }
}

$J.define(GoodsTypePanel, 'net.sf.freecol.client.gui.panel.GoodsTypePanel', { kind: 'class', ifaces: ['net.sf.freecol.client.gui.panel.DropTarget'], sup: 'net.sf.freecol.client.gui.panel.MigPanel', ctors: { 'java.awt.LayoutManager,boolean': '_GoodsTypePanel$LayoutManager$boolean', 'boolean': '_GoodsTypePanel$boolean' }, meths: { 'add(java.awt.Component,boolean)': 'add$Component$boolean', 'accepts(net.sf.freecol.common.model.GoodsType)': 'accepts$GoodsType' } });
$J.module(() => {
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  GoodsTypeLabel = $J.load('net.sf.freecol.client.gui.label.GoodsTypeLabel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
});
