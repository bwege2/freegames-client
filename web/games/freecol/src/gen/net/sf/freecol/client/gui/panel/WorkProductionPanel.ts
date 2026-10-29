// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/WorkProductionPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { FreeColPanel } from './FreeColPanel.ts';

let AbstractAction, ImageIcon, JLabel, MigLayout, FontLibrary, ModifierFormat, UnitLabel, Utility, Messages, Building, Modifier, CollectionUtils;

/**
 * Display the production of a unit.
 */
export class WorkProductionPanel extends FreeColPanel {
  turn: Turn = null;
  /**
   * Create a new production display.
   *
   * FIXME: expand display to handle several outputs
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param unit The {@code Unit} that is producing.
   */
  _WorkProductionPanel(freeColClient: FreeColClient, unit: Unit): this {
    this._FreeColPanel$FreeColClient$String$LayoutManager(freeColClient, null, new MigLayout()._MigLayout$String$String$String('wrap 3, insets 10 10 10 10', '[]30:push[right][]', ''));
    this.turn = this.getGame().getTurn();
    let lib = this.getImageLibrary();
    let colony = unit.getColony();
    let unitType = unit.getType();
    let wl = unit.getLocation();
    let workType = unit.getWorkType();
    let shortName = '';
    let longName = '';
    let image = null;
    let result = Math.fround(wl.getBaseProduction(wl.getProductionType(), workType, unitType));
    let tile = wl.getWorkTile();
    if (tile != null) {
      let tileType = tile.getType();
      shortName = Messages.getName$Named(tileType);
      longName = Messages.message$StringTemplate(wl.getLabel());
      image = this.getGUI().createColonyTileImage(tile, colony);
    } else {
      let building = wl;
      shortName = Messages.getName$Named(building.getType());
      longName = shortName;
      image = lib.getScaledBuildingImage(building);
    }
    this.add$Component$Object(new JLabel()._JLabel$String(longName), 'span, align center, wrap 30');
    this.add$Component(new JLabel()._JLabel$Icon(new ImageIcon()._ImageIcon$Image(image)));
    this.add$Component$Object(new UnitLabel()._UnitLabel$FreeColClient$Unit(this.getFreeColClient(), unit), 'wrap');
    this.add$Component(new JLabel()._JLabel$String(shortName));
    this.add$Component(new JLabel()._JLabel$String(ModifierFormat.format(result)));
    this.output(CollectionUtils.sort$Stream$Comparator(wl.getProductionModifiers(workType, unitType), Modifier.ascendingModifierIndexComparator), unitType);
    result = Math.fround(wl.getPotentialProduction(workType, unitType));
    if (result < 0) {
      this.add$Component$Object(Utility.localizedLabel$String('workProductionPanel.zeroThreshold'), 'newline');
      this.add$Component$Object(new JLabel()._JLabel$String(ModifierFormat.format(Math.fround(-result))), 'wrap 30');
      result = 0;
    }
    let bigFont = lib.getScaledFont('normal-bold-smaller', null);
    let finalLabel = Utility.localizedLabel$String('finalResult');
    finalLabel.setFont(bigFont);
    this.add$Component$Object(finalLabel, 'newline');
    let finalResult = new JLabel()._JLabel$String(ModifierFormat.format(result));
    finalResult.setFont(bigFont);
    finalResult.setBorder(Utility.getProductionBorder());
    this.add$Component$Object(finalResult, 'wrap 30');
    result = Math.fround(wl.getBaseProduction(null, workType, null));
    if (wl instanceof Building && result > Math.fround(0)) {
      let boldFont = FontLibrary.getUnscaledFont$String('normal-bold-tiny');
      let unattendedLabel = Utility.localizedLabel$String('workProductionPanel.unattendedProduction');
      unattendedLabel.setFont(boldFont);
      this.add$Component$Object(unattendedLabel, 'span');
      this.add$Component(Utility.localizedLabel$StringTemplate(wl.getLabel()));
      this.add$Component(new JLabel()._JLabel$String(ModifierFormat.format(result)));
      this.output(CollectionUtils.sort$Stream$Comparator(wl.getProductionModifiers(workType, null), Modifier.ascendingModifierIndexComparator), unitType);
    }
    this.add$Component$Object(this.okButton, 'newline, span, tag ok');
    this.setSize$Dimension(this.getPreferredSize$());
    this.setEscapeAction(new (WorkProductionPanel$1())().$o(this)._AbstractAction$());
    return this;
  }
  output(modifiers: List<Modifier>, unitType: UnitType): void {
    for (const $it0 = modifiers.iterator(); $it0.hasNext(); ) {
      let m = $it0.next();
      let mLabels = ModifierFormat.getModifierLabels(m, unitType, this.turn);
      for (let i = 0; i < mLabels.length; i++) {
        if (mLabels[i] == null) {
          continue;
        }
        if (i === 0) {
          this.add$Component$Object(mLabels[i], 'newline');
        } else {
          this.add$Component(mLabels[i]);
        }
      }
    }
  }
}

let $WorkProductionPanel$1: any = null;
/** An anonymous class (WorkProductionPanel.java:143). */
function WorkProductionPanel$1(): any {
  return $WorkProductionPanel$1 ??= $J.local(class extends AbstractAction {
    actionPerformed(ae: ActionEvent): void {
      this.$outer.okButton.doClick$();
    }
  }, 'net.sf.freecol.client.gui.panel.WorkProductionPanel$1', []);
}

$J.define(WorkProductionPanel, 'net.sf.freecol.client.gui.panel.WorkProductionPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.FreeColPanel', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.common.model.Unit': '_WorkProductionPanel' } });
$J.module(() => {
  AbstractAction = $J.load('javax.swing.AbstractAction');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JLabel = $J.load('javax.swing.JLabel');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  FontLibrary = $J.load('net.sf.freecol.client.gui.FontLibrary');
  ModifierFormat = $J.load('net.sf.freecol.client.gui.ModifierFormat');
  UnitLabel = $J.load('net.sf.freecol.client.gui.label.UnitLabel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Building = $J.load('net.sf.freecol.common.model.Building');
  Modifier = $J.load('net.sf.freecol.common.model.Modifier');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
