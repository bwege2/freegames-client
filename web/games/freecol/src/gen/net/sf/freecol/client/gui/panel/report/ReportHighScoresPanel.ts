// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/report/ReportHighScoresPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JString } from '../../../../../../../../jre/index.ts';
import { ReportPanel } from './ReportPanel.ts';

let JLabel, SwingConstants, MigLayout, FontLibrary, Utility, Messages, StringTemplate, Turn;

/**
 * This panel displays the high scores.
 */
export class ReportHighScoresPanel extends ReportPanel {
  /**
   * Creates the high scores report.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param prefix An optional message to add at the top of the panel.
   * @param highScores The list of {@code HighScore}s.
   */
  _ReportHighScoresPanel(freeColClient: FreeColClient, prefix: string, highScores: List<HighScore>): this {
    this._ReportPanel(freeColClient, 'reportHighScoresAction');
    this.reportPanel.removeAll();
    this.reportPanel.setLayout(new MigLayout()._MigLayout$String$String$String('wrap 3, gapx 30', '[][][align right]', ''));
    if (prefix != null) {
      this.reportPanel.add$Component$Object(Utility.localizedLabel$String(prefix), 'span, wrap 10');
    }
    let font = FontLibrary.getScaledFont$String(Utility.FONTSPEC_SUBTITLE);
    for (const $it0 = highScores.iterator(); $it0.hasNext(); ) {
      let highScore = $it0.next();
      let scoreValue = new JLabel()._JLabel$String(String(highScore.getScore()));
      scoreValue.setFont(font);
      this.reportPanel.add$Component(scoreValue);
      let messageId = (highScore.getIndependenceTurn() > 0) ? 'report.highScores.president' : 'report.highScores.governor';
      let template = StringTemplate.template$String(messageId).addName$String$String('%name%', highScore.getPlayerName()).addName$String$String('%nation%', highScore.getNewLandName());
      let headline = Utility.localizedHeaderLabel$StringTemplate$int$String(template, SwingConstants.LEADING, Utility.FONTSPEC_SUBTITLE);
      this.reportPanel.add$Component$Object(headline, 'span, wrap 10');
      this.reportPanel.add$Component$Object(Utility.localizedLabel$String('report.highScores.turn'), 'skip');
      let retirementTurn = highScore.getRetirementTurn();
      this.reportPanel.add$Component((retirementTurn <= 0) ? Utility.localizedLabel$String('notApplicable') : Utility.localizedLabel$StringTemplate(Turn.getTurnLabel(retirementTurn)));
      this.reportPanel.add$Component$Object(Utility.localizedLabel$String('report.highScores.score'), 'skip');
      this.reportPanel.add$Component(new JLabel()._JLabel$String(String(highScore.getScore())));
      this.reportPanel.add$Component$Object(Utility.localizedLabel$String('report.highScores.difficulty'), 'skip');
      this.reportPanel.add$Component(Utility.localizedLabel$String(Messages.nameKey$String(highScore.getDifficulty())));
      this.reportPanel.add$Component$Object(Utility.localizedLabel$String('report.highScores.independence'), 'skip');
      let independenceTurn = highScore.getIndependenceTurn();
      this.reportPanel.add$Component((independenceTurn <= 0) ? Utility.localizedLabel$String('no') : Utility.localizedLabel$StringTemplate(Turn.getTurnLabel(independenceTurn)));
      this.reportPanel.add$Component$Object(Utility.localizedLabel$String('report.highScores.nation'), 'skip');
      this.reportPanel.add$Component(Utility.localizedLabel$StringTemplate((highScore.getIndependenceTurn() > 0) ? StringTemplate.name_(highScore.getNationName()) : StringTemplate.key$String(highScore.getOldNationNameKey())));
      this.reportPanel.add$Component$Object(Utility.localizedLabel$String('report.highScores.nationType'), 'skip');
      this.reportPanel.add$Component(Utility.localizedLabel$String(Messages.nameKey$String(highScore.getNationTypeId())));
      this.reportPanel.add$Component$Object(Utility.localizedLabel$String('report.highScores.units'), 'skip');
      this.reportPanel.add$Component(new JLabel()._JLabel$String(String(highScore.getUnitCount())));
      this.reportPanel.add$Component$Object(Utility.localizedLabel$String('report.highScores.colonies'), 'skip');
      this.reportPanel.add$Component(new JLabel()._JLabel$String(String(highScore.getColonyCount())));
      this.reportPanel.add$Component$Object(Utility.localizedLabel$String('report.highScores.retired'), 'skip');
      this.reportPanel.add$Component$Object(new JLabel()._JLabel$String(highScore.getDateString()), 'wrap 20');
    }
    this.reportPanel.doLayout();
    return this;
  }
}

$J.define(ReportHighScoresPanel, 'net.sf.freecol.client.gui.panel.report.ReportHighScoresPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.report.ReportPanel', ctors: { 'net.sf.freecol.client.FreeColClient,java.lang.String,java.util.List': '_ReportHighScoresPanel' } });
$J.module(() => {
  JLabel = $J.load('javax.swing.JLabel');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  FontLibrary = $J.load('net.sf.freecol.client.gui.FontLibrary');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  Turn = $J.load('net.sf.freecol.common.model.Turn');
});
