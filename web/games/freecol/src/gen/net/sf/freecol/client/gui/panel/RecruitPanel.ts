// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/RecruitPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JString, Logger, NumberFormatException } from '../../../../../../../jre/index.ts';
import { FreeColPanel } from './FreeColPanel.ts';

let AbstractAction, ImageIcon, JButton, MigLayout, Utility, Messages, Europe$MigrationType, StringTemplate;

/**
 * The panel that allows a user to recruit people in Europe.
 */
export class RecruitPanel extends FreeColPanel {
  static logger: Logger = null;
  /**
   * The buttons for the recruitable units.
   */
  person: JButton[] = null;
  /**
   * Is there at least one recruitable unit?
   */
  shouldEnable: boolean = false;
  /**
   * The constructor to use.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _RecruitPanel(freeColClient: FreeColClient): this {
    this._FreeColPanel$FreeColClient$String$LayoutManager(freeColClient, null, new MigLayout()._MigLayout$String$String$String('wrap 1', '', ''));
    this.shouldEnable = false;
    let recruitables = this.getMyPlayer().getEurope().getExpandedRecruitables(false);
    this.person = $J.newArray(recruitables.size(), null);
    for (let i = 0; i < this.person.length; i++) {
      this.person[i] = new JButton()._JButton$();
      this.person[i].setActionCommand(String(i));
      this.person[i].addActionListener($J.fn(this, 'actionPerformed'));
      this.person[i].setIconTextGap(FreeColPanel.MARGIN);
    }
    this.update$();
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
    let production = player.getTotalImmigrationProduction();
    let turns = 100;
    if (production > 0) {
      let immigrationRequired = (player.getImmigrationRequired() - player.getImmigration()) | 0;
      turns = $J.idiv(immigrationRequired, production);
      if (immigrationRequired % production > 0) {
        turns++;
      }
    }
    let recruitPrice = player.getEuropeanRecruitPrice();
    this.add$Component$Object(Utility.localizedTextArea$StringTemplate(StringTemplate.template$String('recruitPanel.clickOn').addAmount('%money%', recruitPrice).addAmount('%number%', turns)), 'wrap 20');
    this.shouldEnable = false;
    let recruitables = europe.getExpandedRecruitables(false);
    for (let i = 0; i < this.person.length; i++) {
      let enable = player.checkGold(recruitPrice);
      let au = recruitables.get(i);
      this.person[i].setText(Messages.message$StringTemplate(au.getSingleLabel()));
      this.person[i].setIcon(new ImageIcon()._ImageIcon$Image(this.getSmallAbstractUnitImage(au)));
      this.person[i].setEnabled(enable);
      this.add$Component$Object(this.person[i], 'growx');
      this.shouldEnable = !!(this.shouldEnable | enable);
    }
    this.okButton.setText(Messages.message$String('close'));
    this.add$Component$Object(this.okButton, 'newline 20, tag ok');
    this.setEscapeAction(new (RecruitPanel$1())().$o(this)._AbstractAction$());
    this.setSize$Dimension(this.getPreferredSize$());
    this.revalidate();
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    let command = ae.getActionCommand();
    if ($J.equals(FreeColPanel.OK, command)) {
      super.actionPerformed(ae);
    } else {
      try {
        let index = $J.parseInt(command);
        if (Europe$MigrationType.validMigrantIndex(index)) {
          this.igc().recruitUnitInEurope(index);
          this.getGUI().updateEuropeanSubpanels();
          if (!this.shouldEnable) {
            this.getGUI().removeComponent(this);
          }
          return;
        }
      } catch ($e0) {
        if ($J.isa($e0, NumberFormatException)) {
          let e = $J.exc($e0);
        } else {
          throw $e0;
        }
      }
      RecruitPanel.logger.warning('Invalid action command: ' + command);
    }
  }
  /**
   * {@inheritDoc}
   */
  removeNotify(): void {
    super.removeNotify();
    this.removeAll();
    if (this.person != null) {
      for (let i = 0; i < this.person.length; i++) {
        this.person[i] = null;
      }
    }
  }
  static $clinit() {
    RecruitPanel.logger = Logger.getLogger($J.cls(RecruitPanel).getName());
  }
}

let $RecruitPanel$1: any = null;
/** An anonymous class (RecruitPanel.java:114). */
function RecruitPanel$1(): any {
  return $RecruitPanel$1 ??= $J.local(class extends AbstractAction {
    actionPerformed(ae: ActionEvent): void {
      this.$outer.okButton.doClick$();
    }
  }, 'net.sf.freecol.client.gui.panel.RecruitPanel$1', []);
}

$J.define(RecruitPanel, 'net.sf.freecol.client.gui.panel.RecruitPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.FreeColPanel', ctors: { 'net.sf.freecol.client.FreeColClient': '_RecruitPanel' }, meths: { 'update()': 'update$' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  AbstractAction = $J.load('javax.swing.AbstractAction');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JButton = $J.load('javax.swing.JButton');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Europe$MigrationType = $J.load('net.sf.freecol.common.model.Europe$MigrationType');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
});
