// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/NewUnitPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Comparator } from '../../../../../../../jre/index.ts';
import { FreeColPanel } from './FreeColPanel.ts';

let AbstractAction, ImageIcon, JButton, JLabel, MigLayout, Utility, Messages, StringTemplate, CollectionUtils;

/**
 * The panel that allows a user to pay for a new unit in Europe.
 */
export class NewUnitPanel extends FreeColPanel {
  /**
   * The main label for the panel.
   */
  question: JLabel = null;
  /**
   * The buttons to display.
   */
  buttons: List<JButton> = null;
  /**
   * The unit types corresponding to the buttons.
   */
  units: List<UnitType> = null;
  /**
   * A comparator by ascending unit price.
   */
  priceComparator: Comparator<UnitType> = null;
  /**
   * Is there at least one available unit?
   */
  shouldEnable: boolean = false;
  /**
   * The constructor to use.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param layout The {@code LayoutManager} to use.
   * @param label The label for the panel.
   * @param units A list of {@code UnitType}s to offer.
   */
  _NewUnitPanel(freeColClient: FreeColClient, layout: LayoutManager, label: string, units: List<UnitType>): this {
    this._FreeColPanel$FreeColClient$String$LayoutManager(freeColClient, null, layout);
    this.buttons = new ArrayList();
    this.units = new ArrayList();
    this.shouldEnable = false;
    this.question = new JLabel()._JLabel$String(label);
    this.units.addAll(units);
    let europe = this.getMyPlayer().getEurope();
    this.priceComparator = Comparator.comparingInt((ut) => europe.getUnitPrice(ut));
    this.okButton.setText(Messages.message$String('close'));
    this.setEscapeAction(new (NewUnitPanel$1())().$o(this)._AbstractAction$());
    return this;
  }
  /**
   * Updates this panel's labels so that the information it displays
   * is up to date.
   */
  update$(): void {
    this.removeAll();
    let player = this.getMyPlayer();
    let europe = player.getEurope();
    this.add$Component$Object(this.question, 'span, wrap 20');
    this.buttons.clear();
    for (const $it0 = CollectionUtils.sort$Collection$Comparator(this.units, this.priceComparator).iterator(); $it0.hasNext(); ) {
      let ut = $it0.next();
      let price = europe.getUnitPrice(ut);
      let enable = player.checkGold(price);
      let newButton = new JButton()._JButton$();
      newButton.setLayout(new MigLayout()._MigLayout$String$String$String('wrap 2', '[60]', '[30][30]'));
      let icon = new ImageIcon()._ImageIcon$Image(this.getImageLibrary().getSmallUnitTypeImage$UnitType$boolean(ut, !enable));
      let name = Utility.localizedLabel$FreeColSpecObjectType(ut);
      name.setEnabled(enable);
      let gold = Utility.localizedLabel$StringTemplate(StringTemplate.template$String('goldAmount').addAmount('%amount%', price));
      gold.setEnabled(enable);
      newButton.setEnabled(enable);
      newButton.add$Component$Object(new JLabel()._JLabel$Icon(icon), 'span 1 2');
      newButton.add$Component(name);
      newButton.add$Component(gold);
      newButton.setActionCommand(ut.getId());
      newButton.addActionListener($J.fn(this, 'actionPerformed'));
      this.buttons.add(newButton);
      this.add$Component$Object(newButton, 'grow');
    }
    this.add$Component$Object(this.okButton, 'newline 20, span, tag ok');
    this.setSize$Dimension(this.getPreferredSize$());
    this.revalidate();
    this.shouldEnable = player.checkGold(europe.getUnitPrice(CollectionUtils.first$Collection(this.units)));
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    let command = ae.getActionCommand();
    if ($J.equals(FreeColPanel.OK, command)) {
      super.actionPerformed(ae);
    } else {
      let unitType = this.getSpecification().getUnitType(command);
      this.igc().trainUnitInEurope(unitType);
      this.getGUI().updateEuropeanSubpanels();
      if (!this.shouldEnable) {
        this.getGUI().removeComponent(this);
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  removeNotify(): void {
    super.removeNotify();
    this.removeAll();
    for (const $it1 = this.buttons.iterator(); $it1.hasNext(); ) {
      let jb = $it1.next();
      if (jb != null) {
        jb.setLayout(null);
      }
    }
    this.buttons.clear();
  }
}

let $NewUnitPanel$1: any = null;
/** An anonymous class (NewUnitPanel.java:86). */
function NewUnitPanel$1(): any {
  return $NewUnitPanel$1 ??= $J.local(class extends AbstractAction {
    actionPerformed(ae: ActionEvent): void {
      this.$outer.okButton.doClick$();
    }
  }, 'net.sf.freecol.client.gui.panel.NewUnitPanel$1', []);
}

$J.define(NewUnitPanel, 'net.sf.freecol.client.gui.panel.NewUnitPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.FreeColPanel', ctors: { 'net.sf.freecol.client.FreeColClient,java.awt.LayoutManager,java.lang.String,java.util.List': '_NewUnitPanel' }, meths: { 'update()': 'update$' } });
$J.module(() => {
  AbstractAction = $J.load('javax.swing.AbstractAction');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JButton = $J.load('javax.swing.JButton');
  JLabel = $J.load('javax.swing.JLabel');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
