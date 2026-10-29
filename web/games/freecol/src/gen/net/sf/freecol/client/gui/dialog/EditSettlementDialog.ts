// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/dialog/EditSettlementDialog.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { FreeColDialog } from './FreeColDialog.ts';

let DefaultComboBoxModel, ImageIcon, JCheckBox, JComboBox, JSpinner, JTextField, SpinnerNumberModel, MigLayout, ChoiceItem, FreeColDialog$DialogType, MapEditorTransformPanel, MigPanel, Utility, FreeColComboBoxRenderer, Messages, ServerUnit;

/**
 * This dialog is used to edit an Indian settlement (map editor only).
 */
export class EditSettlementDialog extends FreeColDialog {
  static logger: Logger = null;
  /**
   * The settlement to edit.
   */
  is: IndianSettlement = null;
  /**
   * The settlement name.
   */
  name$EditSettlementDialog: JTextField = null;
  /**
   * The selected settlement owner.
   */
  owner: JComboBox<Nation> = null;
  /**
   * Is this settlement the capital?
   */
  capital: JCheckBox = null;
  /**
   * The skill to learn at the settlement.
   */
  skill: JComboBox<UnitType> = null;
  /**
   * The number of units.
   */
  units: JSpinner = null;
  /**
   * Create an EditSettlementDialog.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param frame The owner frame.
   * @param is The {@code IndianSettlement} to edit.
   */
  _EditSettlementDialog(freeColClient: FreeColClient, frame: JFrame, is$: IndianSettlement): this {
    this._FreeColDialog$FreeColClient$JFrame(freeColClient, frame);
    this.is = is$;
    this.name$EditSettlementDialog = new JTextField()._JTextField$String$int(is$.getName(), 30);
    let nationModel = new DefaultComboBoxModel()._DefaultComboBoxModel$();
    for (const $it0 = this.getSpecification().getIndianNations().iterator(); $it0.hasNext(); ) {
      let n = $it0.next();
      nationModel.addElement(n);
    }
    this.owner = new JComboBox()._JComboBox$ComboBoxModel(nationModel);
    this.owner.setSelectedItem(is$.getOwner().getNation());
    this.owner.addItemListener($J.fn(this, 'itemStateChanged'));
    this.owner.setRenderer(new FreeColComboBoxRenderer()._FreeColComboBoxRenderer$());
    this.capital = new JCheckBox()._JCheckBox$();
    this.capital.setSelected(is$.isCapital());
    this.skill = new JComboBox()._JComboBox$ComboBoxModel(this.getSkillModel());
    this.skill.setSelectedItem(is$.getLearnableSkill());
    this.skill.setRenderer(new FreeColComboBoxRenderer()._FreeColComboBoxRenderer$());
    let unitCount = is$.getUnitCount();
    let spinnerModel = new SpinnerNumberModel()._SpinnerNumberModel$int$int$int$int(unitCount, 1, 20, 1);
    this.units = new JSpinner()._JSpinner$SpinnerModel(spinnerModel);
    spinnerModel.setValue(unitCount);
    let panel = new MigPanel()._MigPanel$LayoutManager(new MigLayout()._MigLayout$String('wrap 2, gapx 20'));
    panel.add$Component(Utility.localizedLabel$String('name'));
    panel.add$Component(this.name$EditSettlementDialog);
    panel.add$Component(Utility.localizedLabel$String('nation'));
    panel.add$Component(this.owner);
    panel.add$Component(Utility.localizedLabel$String('capital'));
    panel.add$Component(this.capital);
    panel.add$Component(Utility.localizedLabel$String('skillTaught'));
    panel.add$Component(this.skill);
    panel.add$Component(Utility.localizedLabel$String('units'));
    panel.add$Component(this.units);
    let c = FreeColDialog.choices();
    c.add(new ChoiceItem()._ChoiceItem$String$Object(Messages.message$String('ok'), is$).okOption());
    c.add(new ChoiceItem()._ChoiceItem$String$Object(Messages.message$String('editSettlementDialog.removeSettlement'), null));
    c.add(new ChoiceItem()._ChoiceItem$String$Object(Messages.message$String('cancel'), null).cancelOption().defaultOption());
    this.initializeDialog(frame, FreeColDialog$DialogType.QUESTION, true, panel, new ImageIcon()._ImageIcon$Image(this.getImageLibrary().getSmallSettlementImage(is$)), c);
    return this;
  }
  getOwnerNation(): Nation {
    return this.owner.getSelectedItem();
  }
  getOwnerNationType(): IndianNationType {
    let n = this.getOwnerNation();
    return (n == null) ? null : n.getType();
  }
  getOwnerPlayer(): Player {
    return this.is.getGame().getPlayerByNation(this.getOwnerNation());
  }
  getSettlementType(): SettlementType {
    return this.getOwnerNationType().getSettlementType$boolean(this.capital.isSelected());
  }
  getSkillModel(): DefaultComboBoxModel<UnitType> {
    let ownerType = this.getOwnerNationType();
    let skillModel = new DefaultComboBoxModel()._DefaultComboBoxModel$();
    for (const $it1 = ownerType.getSkills().iterator(); $it1.hasNext(); ) {
      let skill = $it1.next();
      skillModel.addElement(skill.getObject());
    }
    return skillModel;
  }
  /**
   * {@inheritDoc}
   */
  itemStateChanged(e: ItemEvent): void {
    let player = this.getOwnerPlayer();
    if (player != null) {
      this.name$EditSettlementDialog.setText((this.capital.isSelected()) ? player.getCapitalName(null) : player.getSettlementName(null));
    }
    this.skill.setModel(this.getSkillModel());
    this.skill.setSelectedItem(this.is.getLearnableSkill());
    this.units.getModel().setValue(this.is.getUnitCount());
  }
  /**
   * {@inheritDoc}
   */
  getResponse(): IndianSettlement {
    let spec = this.freeColClient.getGame().getSpecification();
    let gui = this.getGUI();
    let ret = null;
    let tiles = this.is.getOwnedTiles();
    let value = this.getValue();
    if (this.options.get(0).equals(value)) {
      this.is.setName(this.name$EditSettlementDialog.getText$());
      let newNation = this.getOwnerNation();
      if (newNation !== this.is.getOwner().getNation()) {
        let newPlayer = this.getOwnerPlayer();
        this.is.setOwner(newPlayer);
        for (const $it2 = this.is.getAllUnitsList().iterator(); $it2.hasNext(); ) {
          let u = $it2.next();
          u.setOwner(newPlayer);
          u.setEthnicity(newNation.getId());
          u.setNationality(newNation.getId());
        }
        for (const $it3 = this.is.getOwnedTiles().iterator(); $it3.hasNext(); ) {
          let t = $it3.next();
          t.setOwner(newPlayer);
        }
        MapEditorTransformPanel.setNativeNation(newNation);
      }
      if (this.capital.isSelected() && !this.is.isCapital()) {
        for (const $it4 = this.is.getOwner().getIndianSettlementList().iterator(); $it4.hasNext(); ) {
          let indianSettlement = $it4.next();
          indianSettlement.setCapital(false);
        }
        this.is.setCapital(true);
      } else if (!this.capital.isSelected() && this.is.isCapital()) {
        this.is.setCapital(false);
      }
      this.is.setLearnableSkill(this.skill.getSelectedItem());
      let numberOfUnits = (this.units.getValue() - this.is.getUnitCount()) | 0;
      if (numberOfUnits > 0) {
        let owner = this.is.getOwner();
        let brave = spec.getDefaultUnitType$Player(owner);
        for (let index = 0; index < numberOfUnits; index++) {
          this.is.add(new ServerUnit()._ServerUnit$Game$Location$Player$UnitType(this.is.getGame(), this.is, owner, brave));
        }
      } else if (numberOfUnits < 0) {
        let unitList = this.is.getUnitList().subList(0, -numberOfUnits);
        for (const $it5 = unitList.iterator(); $it5.hasNext(); ) {
          let unit = $it5.next();
          unit.dispose();
        }
      }
      let oldType = this.is.getType();
      let type$ = this.getSettlementType();
      this.is.setType(type$);
      this.is.getFeatureContainer().replaceSource(oldType, type$);
      ret = this.is;
    } else if (this.options.get(1).equals(value)) {
      if (!gui.confirm$String$String$String('editSettlementDialog.removeSettlement.text', 'ok', 'cancel')) {
        return this.is;
      }
      let tile = this.is.getTile$();
      for (const $it6 = tile.getUnitList().iterator(); $it6.hasNext(); ) {
        let unit = $it6.next();
        unit.dispose();
      }
      this.is.exciseSettlement();
    }
    return ret;
  }
  static $clinit() {
    EditSettlementDialog.logger = Logger.getLogger($J.cls(EditSettlementDialog).getName());
  }
}

$J.define(EditSettlementDialog, 'net.sf.freecol.client.gui.dialog.EditSettlementDialog', { kind: 'class', ifaces: ['java.awt.event.ItemListener'], sup: 'net.sf.freecol.client.gui.dialog.FreeColDialog', ctors: { 'net.sf.freecol.client.FreeColClient,javax.swing.JFrame,net.sf.freecol.common.model.IndianSettlement': '_EditSettlementDialog' }, returns: { 'getResponse': 'net.sf.freecol.common.model.IndianSettlement', 'getSkillModel': 'javax.swing.DefaultComboBoxModel', 'getSettlementType': 'net.sf.freecol.common.model.SettlementType', 'getOwnerPlayer': 'net.sf.freecol.common.model.Player', 'getOwnerNationType': 'net.sf.freecol.common.model.IndianNationType', 'getOwnerNation': 'net.sf.freecol.common.model.Nation' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  DefaultComboBoxModel = $J.load('javax.swing.DefaultComboBoxModel');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JCheckBox = $J.load('javax.swing.JCheckBox');
  JComboBox = $J.load('javax.swing.JComboBox');
  JSpinner = $J.load('javax.swing.JSpinner');
  JTextField = $J.load('javax.swing.JTextField');
  SpinnerNumberModel = $J.load('javax.swing.SpinnerNumberModel');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  ChoiceItem = $J.load('net.sf.freecol.client.gui.ChoiceItem');
  FreeColDialog$DialogType = $J.load('net.sf.freecol.client.gui.dialog.FreeColDialog$DialogType');
  MapEditorTransformPanel = $J.load('net.sf.freecol.client.gui.panel.MapEditorTransformPanel');
  MigPanel = $J.load('net.sf.freecol.client.gui.panel.MigPanel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  FreeColComboBoxRenderer = $J.load('net.sf.freecol.client.gui.plaf.FreeColComboBoxRenderer');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  ServerUnit = $J.load('net.sf.freecol.server.model.ServerUnit');
});
