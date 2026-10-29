// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/dialog/PreCombatDialog.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, RuntimeException } from '../../../../../../../jre/index.ts';
import { FreeColConfirmDialog } from './FreeColConfirmDialog.ts';

let ImageIcon, JLabel, JSeparator, SwingConstants, MigLayout, FontLibrary, ModifierFormat, UnitLabel, MigPanel, Utility, FeatureContainer, Modifier, Unit$UnitLabelType, CollectionUtils;

/**
 * The dialog that is shown prior to a possible combat.
 */
export class PreCombatDialog extends FreeColConfirmDialog {
  /**
   * Create a new pre-combat dialog.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param frame The owner frame.
   * @param attacker The attacker {@code Unit}.
   * @param defender The defender (either a {@code Unit} or
   *     a {@code Settlement}).
   */
  _PreCombatDialog(freeColClient: FreeColClient, frame: JFrame, attacker: Unit, defender: FreeColGameObject): this {
    this._FreeColConfirmDialog$FreeColClient$JFrame(freeColClient, frame);
    let lib = this.getImageLibrary();
    let game = attacker.getGame();
    let combatModel = game.getCombatModel();
    let turn = game.getTurn();
    let attackModifiers = combatModel.getOffensiveModifiers(attacker, defender);
    let defenceModifiers = combatModel.getDefensiveModifiers(attacker, defender);
    let offence = CollectionUtils.sort$Collection$Comparator(attackModifiers, Modifier.ascendingModifierIndexComparator);
    let defence = CollectionUtils.sort$Collection$Comparator(defenceModifiers, Modifier.ascendingModifierIndexComparator);
    let panel = new MigPanel()._MigPanel$LayoutManager(new MigLayout()._MigLayout$String$String$String('wrap 6', '[sg label]20[sg value, right]1px[sg percent]40[sg label]20[sg value, right]1px[sg percent]', ''));
    let attackerName = attacker.getDescription$UnitLabelType(Unit$UnitLabelType.NATIONAL);
    let attackerLabel = new UnitLabel()._UnitLabel$FreeColClient$Unit$boolean$boolean(freeColClient, attacker, false, true);
    let defenderName = null;
    let defenderLabel = null;
    if (combatModel.combatIsAttack(attacker, defender)) {
      let defenderUnit = defender;
      defenderName = defenderUnit.getDescription$UnitLabelType(Unit$UnitLabelType.NATIONAL);
      defenderLabel = new UnitLabel()._UnitLabel$FreeColClient$Unit$boolean$boolean(freeColClient, defenderUnit, false, true);
    } else if (combatModel.combatIsSettlementAttack(attacker, defender)) {
      let settlement = defender;
      defenderName = settlement.getName();
      defenderLabel = new JLabel()._JLabel$Icon(new ImageIcon()._ImageIcon$Image(lib.getScaledSettlementImage(settlement)));
    } else {
      throw new RuntimeException('Bogus attack: ' + $J.str(attacker) + ' v ' + $J.str(defender));
    }
    panel.add$Component$Object(new JLabel()._JLabel$String(attackerName), 'span 3, align center');
    panel.add$Component$Object(new JLabel()._JLabel$String(defenderName), 'span 3, align center');
    panel.add$Component$Object(attackerLabel, 'span 3, align center');
    panel.add$Component$Object(defenderLabel, 'span 3, align center');
    panel.add$Component$Object(new JSeparator()._JSeparator$int(SwingConstants.HORIZONTAL), 'newline, span 3, growx');
    panel.add$Component$Object(new JSeparator()._JSeparator$int(SwingConstants.HORIZONTAL), 'span 3, growx');
    let offenceI = offence.iterator();
    let defenceI = defence.iterator();
    while (offenceI.hasNext() || defenceI.hasNext()) {
      let skip = 0;
      let hasOffence = offenceI.hasNext();
      if (hasOffence) {
        let labels = ModifierFormat.getModifierLabels(offenceI.next(), null, turn);
        skip = this.addLabels(panel, labels, true, 0);
      } else {
        skip = 3;
      }
      if (defenceI.hasNext()) {
        let labels = ModifierFormat.getModifierLabels(defenceI.next(), null, turn);
        this.addLabels(panel, labels, !hasOffence, skip);
      }
    }
    let bigFont = FontLibrary.getScaledFont$String('normal-bold-smaller');
    let offenceResult = FeatureContainer.applyModifiers$float$Turn$Collection(0, turn, attackModifiers);
    let finalLabel = Utility.localizedLabel$String('finalResult');
    finalLabel.setFont(bigFont);
    panel.add$Component$Object(new JSeparator()._JSeparator$int(SwingConstants.HORIZONTAL), 'newline, span 3, growx');
    panel.add$Component$Object(new JSeparator()._JSeparator$int(SwingConstants.HORIZONTAL), 'span 3, growx');
    panel.add$Component(finalLabel);
    let finalOffenceResult = new JLabel()._JLabel$String(ModifierFormat.format(offenceResult));
    finalOffenceResult.setFont(bigFont);
    panel.add$Component(finalOffenceResult);
    let defenceResult = FeatureContainer.applyModifiers$float$Turn$Collection(0, turn, defenceModifiers);
    panel.add$Component$Object(finalLabel, 'skip');
    let finalDefenceResult = new JLabel()._JLabel$String(ModifierFormat.format(defenceResult));
    finalDefenceResult.setFont(bigFont);
    panel.add$Component(finalDefenceResult);
    panel.setSize$Dimension(panel.getPreferredSize$());
    this.initializeConfirmDialog(frame, true, panel, null, 'ok', 'cancel');
    return this;
  }
  addLabels(panel: JPanel, labels: JLabel[], newline: boolean, skip: number): number {
    let len = labels.length;
    for (let i = 0; i < len; i++) {
      if (labels[i] == null) {
        len = i;
      }
    }
    let constraint = (newline) ? 'newline' : null;
    if (skip > 0) {
      if (constraint == null) {
        constraint = 'skip ' + skip;
      } else {
        constraint += ', skip ' + skip;
      }
    }
    for (let i = 0; i < len; i++) {
      if (constraint != null) {
        panel.add$Component$Object(labels[i], constraint);
        constraint = null;
      } else {
        panel.add$Component(labels[i]);
      }
    }
    return (3 - len) | 0;
  }
}

$J.define(PreCombatDialog, 'net.sf.freecol.client.gui.dialog.PreCombatDialog', { kind: 'class', sup: 'net.sf.freecol.client.gui.dialog.FreeColConfirmDialog', ctors: { 'net.sf.freecol.client.FreeColClient,javax.swing.JFrame,net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.FreeColGameObject': '_PreCombatDialog' } });
$J.module(() => {
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JLabel = $J.load('javax.swing.JLabel');
  JSeparator = $J.load('javax.swing.JSeparator');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  FontLibrary = $J.load('net.sf.freecol.client.gui.FontLibrary');
  ModifierFormat = $J.load('net.sf.freecol.client.gui.ModifierFormat');
  UnitLabel = $J.load('net.sf.freecol.client.gui.label.UnitLabel');
  MigPanel = $J.load('net.sf.freecol.client.gui.panel.MigPanel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  FeatureContainer = $J.load('net.sf.freecol.common.model.FeatureContainer');
  Modifier = $J.load('net.sf.freecol.common.model.Modifier');
  Unit$UnitLabelType = $J.load('net.sf.freecol.common.model.Unit$UnitLabelType');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
