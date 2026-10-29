// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/report/ReportRequirementsPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Exception, HashMap, HashSet, Level, Logger } from '../../../../../../../../jre/index.ts';
import { ReportPanel } from './ReportPanel.ts';

let BadLocationException, StyleConstants, MigLayout, FontLibrary, Utility, Messages, Building, StringTemplate, TypeCountMap, CollectionUtils;

/**
 * This panel displays the Advanced Colony Report.
 */
export class ReportRequirementsPanel extends ReportPanel {
  static logger: Logger = null;
  /**
   * A list of all the player's colonies.
   */
  colonies: List<Colony> = null;
  /**
   * Records the number of units indexed by colony and unit type.
   */
  unitCount: JMap<Colony, TypeCountMap<UnitType>> = null;
  /**
   * Records whether a colony can train a type of unit.
   */
  canTrain: JMap<Colony, JSet<UnitType>> = null;
  /**
   * The constructor that will add the items to this panel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _ReportRequirementsPanel(freeColClient: FreeColClient): this {
    this._ReportPanel(freeColClient, 'reportRequirementsAction');
    let player = this.getMyPlayer();
    this.colonies = player.getColonyList();
    let textPane = Utility.getDefaultTextPane$();
    let doc = textPane.getStyledDocument();
    this.unitCount = new HashMap(this.colonies.size());
    this.canTrain = new HashMap(this.colonies.size());
    for (const $it0 = this.colonies.iterator(); $it0.hasNext(); ) {
      let colony = $it0.next();
      let newUnitCount = new TypeCountMap()._TypeCountMap();
      let newCanTrain = new HashSet();
      for (const $it1 = colony.getUnitList().iterator(); $it1.hasNext(); ) {
        let unit = $it1.next();
        newUnitCount.incrementCount(unit.getType(), 1);
        if (colony.canTrain$UnitType(unit.getType())) {
          newCanTrain.add(unit.getType());
        }
      }
      this.unitCount.put(colony, newUnitCount);
      this.canTrain.put(colony, newCanTrain);
    }
    for (const $it2 = this.colonies.iterator(); $it2.hasNext(); ) {
      let colony = $it2.next();
      this.checkColony(colony, doc);
    }
    let width = this.reportPanel.getParent().getWidth();
    this.reportPanel.setLayout(new MigLayout()._MigLayout$String('width ' + width + '!'));
    this.reportPanel.add$Component(textPane);
    textPane.setCaretPosition(0);
    return this;
  }
  checkColony(colony: Colony, doc: StyledDocument): void {
    let spec = this.getSpecification();
    try {
      if (doc.getLength() > 0) {
        doc.insertString(doc.getLength(), '\n\n', doc.getStyle('regular'));
      }
      StyleConstants.setComponent(doc.getStyle('button'), this.createColonyButton$Colony$boolean$ReportRequirementsPanel(colony, true));
      doc.insertString(doc.getLength(), ' ', doc.getStyle('button'));
    } catch ($e3) {
      if ($J.isa($e3, Exception)) {
        let e = $J.exc($e3);
        ReportRequirementsPanel.logger.log(Level.WARNING, 'Colony check fail', e);
      } else {
        throw $e3;
      }
    }
    let missingExpertWarning = new HashSet();
    let badAssignmentWarning = new HashSet();
    let productionWarning = new HashSet();
    for (const $it4 = (CollectionUtils.transform$Stream$Predicate(colony.getUnits(), (u) => u.getSkillLevel() > 0)).iterator(); $it4.hasNext(); ) {
      let expert = $it4.next();
      let better = colony.getBetterExpert(expert);
      if (better != null && !badAssignmentWarning.contains(expert.getType())) {
        this.addBadAssignmentWarning(doc, colony, expert, better);
        badAssignmentWarning.add(expert.getType());
      }
    }
    for (const $it5 = colony.getColonyTiles().iterator(); $it5.hasNext(); ) {
      let colonyTile = $it5.next();
      for (const $it6 = colonyTile.getUnitList().iterator(); $it6.hasNext(); ) {
        let unit = $it6.next();
        let workType = unit.getWorkType();
        let expert = spec.getExpertForProducing(workType);
        if (this.unitCount.get(colony).getCount(expert) === 0 && missingExpertWarning.add(expert)) {
          this.addExpertWarning(doc, colony, workType, expert);
        }
      }
    }
    for (const $it7 = colony.getBuildings().iterator(); $it7.hasNext(); ) {
      let building = $it7.next();
      for (const $it8 = CollectionUtils.iterable(building.getOutputs()).iterator(); $it8.hasNext(); ) {
        let output = $it8.next();
        let goodsType = output.getType();
        let expert = spec.getExpertForProducing(goodsType);
        if (goodsType != null && expert != null && !building.getUnitList().isEmpty() && !missingExpertWarning.contains(expert) && this.unitCount.get(colony).getCount(expert) === 0) {
          if (!colony.goodsUseful(goodsType)) {
            continue;
          }
          this.addExpertWarning(doc, colony, goodsType, expert);
          missingExpertWarning.add(expert);
        }
        let info = building.getProductionInfo();
        if (goodsType != null && info != null && !info.atMaximumProduction() && productionWarning.add(goodsType)) {
          CollectionUtils.forEach$Stream$Consumer(CollectionUtils.map$Stream$Function(building.getInputs(), ($p0) => $p0.getType()), (gt) => this.addProductionWarning(doc, colony, goodsType, gt));
        }
      }
    }
    let tileSuggestions = colony.getTileImprovementSuggestions();
    for (const $it9 = tileSuggestions.iterator(); $it9.hasNext(); ) {
      let tis = $it9.next();
      if (tis.tileImprovementType == null) {
        this.addTileWarning(doc, colony, 'report.requirements.exploreTile', tis.tile);
      } else {
        let key = 'report.requirements.tile.' + tis.tileImprovementType.getSuffix$();
        if (Messages.containsKey(key)) {
          this.addTileWarning(doc, colony, key, tis.tile);
        }
      }
    }
    if (tileSuggestions.isEmpty() && missingExpertWarning.isEmpty() && badAssignmentWarning.isEmpty() && productionWarning.isEmpty()) {
      try {
        doc.insertString(doc.getLength(), '\n\n' + Messages.message$String('report.requirements.met'), doc.getStyle('regular'));
      } catch ($e10) {
        if ($J.isa($e10, Exception)) {
          let e = $J.exc($e10);
          ReportRequirementsPanel.logger.log(Level.WARNING, 'Colony check fail', e);
        } else {
          throw $e10;
        }
      }
    }
  }
  addTileWarning(doc: StyledDocument, colony: Colony, messageId: string, tile: Tile): void {
    if (messageId == null || !Messages.containsKey(messageId)) {
      return;
    }
    let t = StringTemplate.template$String(messageId).addStringTemplate$String$StringTemplate('%location%', tile.getColonyTileLocationLabel(colony));
    try {
      doc.insertString(doc.getLength(), '\n\n' + Messages.message$StringTemplate(t), doc.getStyle('regular'));
    } catch ($e11) {
      if ($J.isa($e11, Exception)) {
        let e = $J.exc($e11);
        ReportRequirementsPanel.logger.log(Level.WARNING, 'Tile warning fail', e);
      } else {
        throw $e11;
      }
    }
  }
  addBadAssignmentWarning(doc: StyledDocument, colony: Colony, expert: Unit, nonExpert: Unit): void {
    let expertGoods = expert.getWorkType();
    let nonExpertGoods = nonExpert.getWorkType();
    let colonyName = colony.getName();
    let expertName = Messages.getName$Named(expert.getType());
    let nonExpertName = Messages.getName$Named(nonExpert.getType());
    let expertProductionName = Messages.message$String(expertGoods.getWorkingAsKey());
    let nonExpertProductionName = Messages.message$String(nonExpertGoods.getWorkingAsKey());
    let newMessage = Messages.message$StringTemplate(StringTemplate.template$String('report.requirements.badAssignment').addName$String$String('%colony%', colonyName).addName$String$String('%expert%', expertName).addName$String$String('%expertWork%', expertProductionName).addName$String$String('%nonExpert%', nonExpertName).addName$String$String('%nonExpertWork%', nonExpertProductionName));
    try {
      doc.insertString(doc.getLength(), '\n\n' + newMessage, doc.getStyle('regular'));
    } catch ($e12) {
      if ($J.isa($e12, Exception)) {
        let e = $J.exc($e12);
        ReportRequirementsPanel.logger.log(Level.WARNING, 'Bad assignment fail', e);
      } else {
        throw $e12;
      }
    }
  }
  addExpertWarning(doc: StyledDocument, c: Colony, goodsType: GoodsType, workType: UnitType): void {
    let newMessage = Messages.message$StringTemplate(StringTemplate.template$String('report.requirements.noExpert').addName$String$String('%colony%', c.getName()).addName$String$FreeColObject('%goods%', goodsType).addName$String$FreeColObject('%unit%', workType));
    try {
      doc.insertString(doc.getLength(), '\n\n' + newMessage, doc.getStyle('regular'));
      let misusedExperts = new ArrayList();
      let severalExperts = new ArrayList();
      let canTrainExperts = new ArrayList();
      for (const $it13 = this.colonies.iterator(); $it13.hasNext(); ) {
        let colony = $it13.next();
        for (const $it14 = colony.getUnitList().iterator(); $it14.hasNext(); ) {
          let unit = $it14.next();
          let expertise = unit.getType().getExpertProduction();
          if (expertise === goodsType && unit.getSkillLevel() > 0) {
            if (unit.getLocation() instanceof Building) {
              if (!(unit.getLocation()).canProduce(goodsType, unit.getType())) {
                misusedExperts.add(colony);
              }
            } else if (expertise !== unit.getWorkType()) {
              misusedExperts.add(colony);
            }
          }
        }
        if (this.unitCount.get(colony).getCount(workType) > 1) {
          severalExperts.add(colony);
        }
        if (this.canTrain.get(colony).contains(workType)) {
          canTrainExperts.add(colony);
        }
      }
      if (!misusedExperts.isEmpty()) {
        doc.insertString(doc.getLength(), '\n' + Messages.message$StringTemplate(StringTemplate.template$String('report.requirements.misusedExperts').addName$String$FreeColObject('%unit%', workType).add$String$String('%work%', goodsType.getWorkingAsKey())) + ' ', doc.getStyle('regular'));
        this.insertColonyButtons(doc, misusedExperts);
      }
      if (!severalExperts.isEmpty()) {
        doc.insertString(doc.getLength(), '\n' + Messages.message$StringTemplate(StringTemplate.template$String('report.requirements.severalExperts').addName$String$FreeColObject('%unit%', workType)) + ' ', doc.getStyle('regular'));
        this.insertColonyButtons(doc, severalExperts);
      }
      if (!canTrainExperts.isEmpty()) {
        doc.insertString(doc.getLength(), '\n' + Messages.message$StringTemplate(StringTemplate.template$String('report.requirements.canTrainExperts').addName$String$FreeColObject('%unit%', workType)) + ' ', doc.getStyle('regular'));
        this.insertColonyButtons(doc, canTrainExperts);
      }
    } catch ($e15) {
      if ($J.isa($e15, Exception)) {
        let e = $J.exc($e15);
        ReportRequirementsPanel.logger.log(Level.WARNING, 'Assign experts fail', e);
      } else {
        throw $e15;
      }
    }
  }
  insertColonyButtons(doc: StyledDocument, colonies: List<Colony>): void {
    for (const $it16 = colonies.iterator(); $it16.hasNext(); ) {
      let colony = $it16.next();
      StyleConstants.setComponent(doc.getStyle('button'), this.createColonyButton$Colony$boolean$ReportRequirementsPanel(colony, false));
      doc.insertString(doc.getLength(), ' ', doc.getStyle('button'));
      doc.insertString(doc.getLength(), ', ', doc.getStyle('regular'));
    }
    doc.remove((doc.getLength() - 2) | 0, 2);
  }
  addProductionWarning(doc: StyledDocument, colony: Colony, output: GoodsType, input: GoodsType): void {
    let colonyName = colony.getName();
    let newMessage = Messages.message$StringTemplate(StringTemplate.template$String('report.requirements.missingGoods').addName$String$String('%colony%', colonyName).addNamed$String$Named('%goods%', output).addNamed$String$Named('%input%', input));
    try {
      doc.insertString(doc.getLength(), '\n\n' + newMessage, doc.getStyle('regular'));
      let withSurplus = new ArrayList();
      let theSurplus = new ArrayList();
      for (const $it17 = this.colonies.iterator(); $it17.hasNext(); ) {
        let col = $it17.next();
        let amount = colony.getAdjustedNetProductionOf(input);
        if (amount > 0) {
          withSurplus.add(col);
          theSurplus.add(amount);
        }
      }
      if (!withSurplus.isEmpty()) {
        doc.insertString(doc.getLength(), '\n' + Messages.message$StringTemplate(StringTemplate.template$String('report.requirements.surplus').addNamed$String$Named('%goods%', input)) + ' ', doc.getStyle('regular'));
        for (let index = 0; index < ((withSurplus.size() - 1) | 0); index++) {
          let amount = ' (' + theSurplus.get(index) + ')';
          StyleConstants.setComponent(doc.getStyle('button'), this.createColonyButton$Colony$String$boolean$ReportRequirementsPanel(withSurplus.get(index), amount, false));
          doc.insertString(doc.getLength(), ' ', doc.getStyle('button'));
          doc.insertString(doc.getLength(), ', ', doc.getStyle('regular'));
        }
        let lastColony = withSurplus.get((withSurplus.size() - 1) | 0);
        let amount = ' (' + theSurplus.get((theSurplus.size() - 1) | 0) + ')';
        StyleConstants.setComponent(doc.getStyle('button'), this.createColonyButton$Colony$String$boolean$ReportRequirementsPanel(lastColony, amount, false));
        doc.insertString(doc.getLength(), ' ', doc.getStyle('button'));
      }
    } catch ($e18) {
      if ($J.isa($e18, BadLocationException)) {
        let ble = $J.exc($e18);
        ReportRequirementsPanel.logger.log(Level.WARNING, 'Bad insert location', ble);
      } else {
        throw $e18;
      }
    }
  }
  createColonyButton$Colony$boolean$ReportRequirementsPanel(colony: Colony, headline: boolean): JButton {
    return this.createColonyButton$Colony$String$boolean$ReportRequirementsPanel(colony, '', headline);
  }
  createColonyButton$Colony$String$boolean$ReportRequirementsPanel(colony: Colony, info: string, headline: boolean): JButton {
    let text = colony.getName() + info;
    let button = Utility.getLinkButton(text, null, colony.getId());
    if (headline) {
      button.setFont(FontLibrary.getScaledFont$String$String(Utility.FONTSPEC_SUBTITLE, text));
    }
    button.addActionListener($J.fn(this, 'actionPerformed'));
    return button;
  }
  static $clinit() {
    ReportRequirementsPanel.logger = Logger.getLogger($J.cls(ReportRequirementsPanel).getName());
  }
}

$J.define(ReportRequirementsPanel, 'net.sf.freecol.client.gui.panel.report.ReportRequirementsPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.report.ReportPanel', ctors: { 'net.sf.freecol.client.FreeColClient': '_ReportRequirementsPanel' }, meths: { 'createColonyButton(net.sf.freecol.common.model.Colony,java.lang.String,boolean)': 'createColonyButton$Colony$String$boolean$ReportRequirementsPanel', 'createColonyButton(net.sf.freecol.common.model.Colony,boolean)': 'createColonyButton$Colony$boolean$ReportRequirementsPanel' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  BadLocationException = $J.load('javax.swing.text.BadLocationException');
  StyleConstants = $J.load('javax.swing.text.StyleConstants');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  FontLibrary = $J.load('net.sf.freecol.client.gui.FontLibrary');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Building = $J.load('net.sf.freecol.common.model.Building');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  TypeCountMap = $J.load('net.sf.freecol.common.model.TypeCountMap');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
