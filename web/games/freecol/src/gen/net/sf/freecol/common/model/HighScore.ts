// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/HighScore.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Comparator, DateFormat, Exception, Files, IOException, JDate, JEnum, Level, Logger, SimpleDateFormat, UUID, XMLStreamException } from '../../../../../../jre/index.ts';
import { FreeColObject } from './FreeColObject.ts';

let FreeCol, Messages, FreeColDirectories, FreeColXMLReader, FreeColXMLWriter, FreeColXMLWriter$WriteScope, Player$PlayerType, CollectionUtils;

/**
 * A FreeCol high score record.
 */
export class HighScore extends FreeColObject {
  static logger: Logger = null;
  static readonly TAG: string = 'highScore';
  /**
   * Trivial UUID to used when it is not present in the high score file.
   */
  static nullUUID: UUID = null;
  /**
   * A comparator by ascending AI object value.
   */
  static descendingScoreComparator: Comparator<any> = null;
  /**
   * The number of high scores to allow in the high scores list.
   */
  static readonly NUMBER_OF_HIGH_SCORES: number = 10;
  /**
   * The format to use for dates.  Almost ISO8601.
   */
  dateFormat: SimpleDateFormat = null;
  /**
   * The turn in which independence was granted.
   */
  independenceTurn: number = 0;
  /**
   * The name of the human player.
   */
  playerName: string = null;
  /**
   * The nation that retired.
   */
  nationId: string = null;
  /**
   * The nation type that retired.
   */
  nationTypeId: string = null;
  /**
   * The game UUID.
   */
  gameUUID: UUID = null;
  /**
   * The high score.
   */
  score: number = 0;
  /**
   * The ScoreLevel/title for this score.
   */
  level: HighScore$ScoreLevel = null;
  /**
   * The name given to the new independent nation.
   */
  nationName: string = null;
  /**
   * The difficulty level of this game.
   */
  difficulty: string = null;
  /**
   * The final number of units.
   */
  nUnits: number = 0;
  /**
   * The final number of colonies.
   */
  nColonies: number = 0;
  /**
   * The name for the New World.
   */
  newLandName_: string = null;
  /**
   * The date for this score.
   */
  date: JDate = null;
  /**
   * The turn when the player retired.
   */
  retirementTurn: number = 0;
  static readonly HIGH_SCORES_TAG: string = 'highScores';
  static readonly COLONIES_TAG: string = 'colonies';
  static readonly DATE_TAG: string = 'date';
  static readonly DIFFICULTY_TAG: string = 'difficulty';
  static readonly GAMEUUID_TAG: string = 'gameUUID';
  static readonly INDEPENDENCE_TURN_TAG: string = 'independenceTurn';
  static readonly LEVEL_TAG: string = 'level';
  static readonly NATION_ID_TAG: string = 'nationId';
  static readonly NATION_NAME_TAG: string = 'nationName';
  static readonly NATION_TYPE_ID_TAG: string = 'nationTypeId';
  static readonly NEW_LAND_NAME_TAG: string = 'newLandName';
  static readonly PLAYER_NAME_TAG: string = 'playerName';
  static readonly RETIREMENT_TURN_TAG: string = 'retirementTurn';
  static readonly SCORE_TAG: string = 'score';
  static readonly UNITS_TAG: string = 'units';
  $init_HighScore() {
    this.dateFormat = new SimpleDateFormat('yyyy-MM-dd HH:mm:ssZ');
    this.independenceTurn = -1;
  }
  /**
   * Trivial constructor, for Game.newInstance.
   */
  _HighScore$(): this {
    this._FreeColObject();
    this.$init_HighScore();
    return this;
  }
  /**
   * Create a new high score record.
   *
   * Public for the test suite.
   *
   * @param player The {@code Player} the score is for.
   */
  _HighScore$Player(player: Player): this {
    this._FreeColObject();
    this.$init_HighScore();
    let game = player.getGame();
    this.date = new JDate();
    this.retirementTurn = game.getTurn().getNumber();
    this.gameUUID = game.getUUID();
    this.score = player.getScore();
    this.level = CollectionUtils.find$ObjectArr$Predicate$Object(HighScore$ScoreLevel.values(), (sl) => sl.getMinimumScore() <= this.score, HighScore$ScoreLevel.PARASITIC_WORM);
    this.playerName = player.getName();
    this.nationId = player.getNationId();
    this.nationTypeId = player.getNationType().getId();
    this.nColonies = CollectionUtils.count$Stream(player.getColonies());
    this.nUnits = player.getUnitCount$();
    this.independenceTurn = (player.getPlayerType() === Player$PlayerType.INDEPENDENT) ? game.getTurn().getNumber() : -1;
    this.nationName = Messages.message$StringTemplate(player.getNationLabel());
    this.difficulty = game.getSpecification().getDifficultyLevel();
    this.newLandName_ = player.getNewLandName();
    return this;
  }
  /**
   * Create a new {@code HighScore} by reading a stream.
   *
   * @param xr The {@code FreeColXMLReader} to read.
   * @exception XMLStreamException if there is a problem reading the stream.
   */
  _HighScore$FreeColXMLReader(xr: FreeColXMLReader): this {
    this._FreeColObject();
    this.$init_HighScore();
    this.readFromXML(xr);
    return this;
  }
  /**
   * Get the turn independence occurs.
   *
   * @return The independence turn.
   */
  getIndependenceTurn(): number {
    return this.independenceTurn;
  }
  /**
   * Get the turn the player retired.
   *
   * @return The retirement turn.
   */
  getRetirementTurn(): number {
    return this.retirementTurn;
  }
  /**
   * Get the player name.
   *
   * @return The player name.
   */
  getPlayerName(): string {
    return this.playerName;
  }
  /**
   * Get the nation identifier.
   *
   * @return The nation identifier.
   */
  getNationId(): string {
    return this.nationId;
  }
  /**
   * Get the nation type identifier.
   *
   * @return The nation type identifier.
   */
  getNationTypeId(): string {
    return this.nationTypeId;
  }
  /**
   * Get the game UUID.
   *
   * @return The UUID for the game with this score.
   */
  getGameUUID(): UUID {
    return this.gameUUID;
  }
  /**
   * Get the final score.
   *
   * @return The score.
   */
  getScore(): number {
    return this.score;
  }
  /**
   * Get the {@code ScoreLevel} corresponding to the score.
   *
   * @return The score level.
   */
  getLevel(): HighScore$ScoreLevel {
    return this.level;
  }
  /**
   * Get the original nation localized name key.
   *
   * @return The old name key.
   */
  getOldNationNameKey(): string {
    return Messages.nameKey$String(this.nationId);
  }
  /**
   * Get the independent nation name.
   *
   * @return The independent nation name.
   */
  getNationName(): string {
    return this.nationName;
  }
  /**
   * Get the name given to the New World.
   *
   * @return The new land name.
   */
  getNewLandName(): string {
    return this.newLandName_;
  }
  /**
   * Get the game difficulty key.
   *
   * @return The game difficulty key.
   */
  getDifficulty(): string {
    return this.difficulty;
  }
  /**
   * Get number of units.
   *
   * @return The number of units.
   */
  getUnitCount(): number {
    return this.nUnits;
  }
  /**
   * Get the number of colonies.
   *
   * @return The number of colonies.
   */
  getColonyCount(): number {
    return this.nColonies;
  }
  /**
   * Get the date.
   *
   * @return The date.
   */
  getDate(): JDate {
    return new JDate(this.date.getTime());
  }
  /**
   * Get the {@code Date} the score was achieved as a formatted string.
   *
   * @return The date string.
   */
  getDateString(): string {
    let format = DateFormat.getDateTimeInstance(2, 3);
    return format.format(this.date);
  }
  /**
   * Tidy a list of scores into canonical form.  That is, sorted and
   * with no more that NUMBER_OF_HIGH_SCORES members.
   *
   * @param scores The list of {@code HighScore}s to operate on.
   */
  static tidyScores(scores: List<HighScore>): void {
    if (scores.size() > HighScore.NUMBER_OF_HIGH_SCORES) {
      scores = scores.subList(0, (HighScore.NUMBER_OF_HIGH_SCORES - 1) | 0);
    }
    scores.sort(HighScore.descendingScoreComparator);
  }
  /**
   * Can a given score be added to a high score list.
   *
   * @param highScore The {@code HighScore} to check.
   * @param scores A list of {@code HighScore} to check against.
   * @return The index of a score to replace, or negative if no replacement.
   */
  static checkHighScore(highScore: HighScore, scores: List<HighScore>): number {
    let nScores = scores.size();
    let score = highScore.getScore();
    let uuid = highScore.getGameUUID();
    if (uuid.compareTo(HighScore.nullUUID) !== 0) {
      for (let i = (nScores - 1) | 0; i >= 0; i--) {
        let hs = scores.get(i);
        if (uuid.compareTo(hs.getGameUUID()) === 0 && score > hs.getScore()) {
          return i;
        }
      }
    }
    if (score < 0) {
      return -1;
    }
    if (nScores === 0) {
      return 0;
    }
    if (nScores >= HighScore.NUMBER_OF_HIGH_SCORES) {
      if (score > scores.get((nScores - 1) | 0).getScore()) {
        return (nScores - 1) | 0;
      }
      return -1;
    }
    return nScores;
  }
  /**
   * Tries to adds a new high score for player.
   *
   * @param player The {@code Player} to add a high score for.
   * @return True if the score was high enough to be added to the
   *     high score list.
   */
  static newHighScore(player: Player): boolean {
    let scores = HighScore.loadHighScores();
    let hs = new HighScore()._HighScore$Player(player);
    let idx = HighScore.checkHighScore(hs, scores);
    if (idx < 0) {
      return false;
    }
    if (idx < scores.size()) {
      scores.set(idx, hs);
    } else {
      scores.add(hs);
    }
    HighScore.tidyScores(scores);
    return HighScore.saveHighScores(scores);
  }
  /**
   * Load the high scores.
   *
   * @return A list of {@code HighScore}s from the high score file.
   */
  static loadHighScores(): List<HighScore> {
    let scores = new ArrayList();
    let hsf = FreeColDirectories.getHighScoreFile();
    if (!hsf.exists()) {
      try {
        if (hsf.createNewFile()) {
          HighScore.logger.info('Created empty high score file: ' + hsf.getPath());
          HighScore.saveHighScores(scores);
        } else {
          HighScore.logger.warning('High score file not created');
        }
      } catch ($e0) {
        if ($J.isa($e0, IOException)) {
          let ioe = $J.exc($e0);
          scores = null;
          HighScore.logger.log(Level.WARNING, 'Unable to create high score file: ' + hsf.getPath(), ioe);
        } else {
          throw $e0;
        }
      }
      return scores;
    }
    {
      try {
        const fis = Files.newInputStream(hsf.toPath());
        try {
          {
            try {
              const xr = new FreeColXMLReader()._FreeColXMLReader$InputStream(fis);
              try {
                xr.nextTag();
                while (xr.moreTags()) {
                  let tag = xr.getLocalName();
                  if ($J.equals(HighScore.TAG, tag)) {
                    scores.add(new HighScore()._HighScore$FreeColXMLReader(xr));
                  }
                }
              } finally {
                if (xr != null) xr.close();
              }
            } catch ($e1) {
              if ($J.isa($e1, XMLStreamException)) {
                let xse = $J.exc($e1);
                HighScore.logger.log(Level.WARNING, 'Stream error loading high scores.', xse);
              } else {
                throw $e1;
              }
            }
          }
        } finally {
          if (fis != null) fis.close();
        }
      } catch ($e2) {
        if ($J.isa($e2, IOException)) {
          let ioe = $J.exc($e2);
          HighScore.logger.log(Level.WARNING, 'I/O error loading high scores.', ioe);
        } else {
          throw $e2;
        }
      }
    }
    HighScore.tidyScores(scores);
    return scores;
  }
  /**
   * Saves high scores.
   *
   * @param scores The list of {@code HighScore}s to save.
   * @return True if the high scores were saved to the high score file.
   */
  static saveHighScores(scores: List<HighScore>): boolean {
    let ret = false;
    if (scores == null) {
      return false;
    }
    HighScore.tidyScores(scores);
    let hsf = FreeColDirectories.getHighScoreFile();
    {
      try {
        const fos = Files.newOutputStream(hsf.toPath());
        try {
          {
            const xw = new FreeColXMLWriter()._FreeColXMLWriter$OutputStream$WriteScope$boolean(fos, FreeColXMLWriter$WriteScope.toSave(), true);
            try {
              xw.writeStartDocument('UTF-8', '1.0');
              xw.writeStartElement(HighScore.HIGH_SCORES_TAG);
              for (const $it3 = scores.iterator(); $it3.hasNext(); ) {
                let score = $it3.next();
                score.toXML$FreeColXMLWriter(xw);
              }
              xw.writeEndElement();
              xw.writeEndDocument();
              ret = true;
            } finally {
              if (xw != null) xw.close();
            }
          }
        } finally {
          if (fos != null) fos.close();
        }
      } catch ($e4) {
        if ($J.isa($e4, IOException)) {
          let ioe = $J.exc($e4);
          HighScore.logger.log(Level.WARNING, 'Error creating FreeColXMLWriter.', ioe);
        } else if ($J.isa($e4, XMLStreamException)) {
          let xse = $J.exc($e4);
          HighScore.logger.log(Level.WARNING, 'Failed to write high scores file.', xse);
        } else {
          throw $e4;
        }
      }
    }
    return ret;
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(HighScore));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.independenceTurn = o.getIndependenceTurn();
    this.playerName = o.getPlayerName();
    this.nationId = o.getNationId();
    this.nationTypeId = o.getNationTypeId();
    this.gameUUID = o.getGameUUID();
    this.score = o.getScore();
    this.level = o.getLevel();
    this.nationName = o.getNationName();
    this.difficulty = o.getDifficulty();
    this.nUnits = o.getUnitCount();
    this.nColonies = o.getColonyCount();
    this.newLandName_ = o.getNewLandName();
    this.date = o.getDate();
    this.retirementTurn = o.getRetirementTurn();
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    let l = this.date.getTime();
    xw.writeAttribute$String$long(HighScore.DATE_TAG, l);
    xw.writeAttribute$String$int(HighScore.RETIREMENT_TURN_TAG, this.retirementTurn);
    xw.writeAttribute$String$int(HighScore.INDEPENDENCE_TURN_TAG, this.independenceTurn);
    xw.writeAttribute(HighScore.PLAYER_NAME_TAG, this.playerName);
    xw.writeAttribute(HighScore.NATION_ID_TAG, this.nationId);
    xw.writeAttribute(HighScore.NATION_TYPE_ID_TAG, this.nationTypeId);
    xw.writeAttribute$String$Object(HighScore.GAMEUUID_TAG, this.gameUUID);
    xw.writeAttribute$String$int(HighScore.SCORE_TAG, this.score);
    xw.writeAttribute(HighScore.LEVEL_TAG, this.level.toString());
    if (this.nationName != null) {
      xw.writeAttribute(HighScore.NATION_NAME_TAG, this.nationName);
    }
    if (this.newLandName_ != null) {
      xw.writeAttribute(HighScore.NEW_LAND_NAME_TAG, this.newLandName_);
    }
    xw.writeAttribute(HighScore.DIFFICULTY_TAG, this.difficulty);
    xw.writeAttribute$String$int(HighScore.UNITS_TAG, this.nUnits);
    xw.writeAttribute$String$int(HighScore.COLONIES_TAG, this.nColonies);
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    this.date = null;
    try {
      let l = xr.getAttribute$String$long(HighScore.DATE_TAG, -1);
      if (l >= 0) {
        this.date = new JDate(l);
      }
    } catch ($e5) {
      if ($J.isa($e5, Exception)) {
        let e = $J.exc($e5);
        HighScore.logger.log(Level.WARNING, 'Bad long date', e);
      } else {
        throw $e5;
      }
    }
    if (this.date == null) {
      try {
        let f = xr.getAttribute$String$float(HighScore.DATE_TAG, Math.fround(-1));
        if (f >= 0 && f < Math.fround(9223372036854775807)) {
          this.date = new JDate($J.d2l(f));
        }
      } catch ($e6) {
        if ($J.isa($e6, Exception)) {
          let e = $J.exc($e6);
          HighScore.logger.log(Level.WARNING, 'Bad float date', e);
        } else {
          throw $e6;
        }
      }
    }
    if (this.date == null) {
      this.date = new JDate();
    }
    this.retirementTurn = xr.getAttribute$String$int(HighScore.RETIREMENT_TURN_TAG, 0);
    this.independenceTurn = xr.getAttribute$String$int(HighScore.INDEPENDENCE_TURN_TAG, 0);
    this.playerName = xr.getAttribute$String$String(HighScore.PLAYER_NAME_TAG, 'anonymous');
    this.nationId = xr.getAttribute$String$String(HighScore.NATION_ID_TAG, null);
    this.nationTypeId = xr.getAttribute$String$String(HighScore.NATION_TYPE_ID_TAG, null);
    let str = xr.getAttribute$String$String(HighScore.GAMEUUID_TAG, null);
    try {
      this.gameUUID = UUID.fromString(str);
    } catch ($e7) {
      if ($J.isa($e7, Exception)) {
        let e = $J.exc($e7);
        this.gameUUID = HighScore.nullUUID;
      } else {
        throw $e7;
      }
    }
    this.score = xr.getAttribute$String$int(HighScore.SCORE_TAG, 0);
    this.level = xr.getAttribute$String$Class$Enum(HighScore.LEVEL_TAG, $J.cls(HighScore$ScoreLevel), HighScore$ScoreLevel.PARASITIC_WORM);
    this.nationName = xr.getAttribute$String$String(HighScore.NATION_NAME_TAG, 'Freedonia');
    this.newLandName_ = xr.getAttribute$String$String(HighScore.NEW_LAND_NAME_TAG, 'New World');
    this.difficulty = xr.getAttribute$String$String(HighScore.DIFFICULTY_TAG, FreeCol.getDifficulty());
    this.nUnits = xr.getAttribute$String$int(HighScore.UNITS_TAG, 0);
    this.nColonies = xr.getAttribute$String$int(HighScore.COLONIES_TAG, 0);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return HighScore.TAG;
  }
  static $clinit() {
    HighScore.logger = Logger.getLogger($J.cls(HighScore).getName());
    HighScore.nullUUID = new UUID(0, 0);
    HighScore.descendingScoreComparator = Comparator.reversed((Comparator.comparingInt(($p0) => $p0.getScore())));
  }
}

/**
 * On retirement, an object will be named in honour of the
 * player.  The nature of the object depends on the player's score.
 */
export class HighScore$ScoreLevel extends JEnum {
  minimumScore: number = 0;
  static CONTINENT: HighScore$ScoreLevel = null;
  static COUNTRY: HighScore$ScoreLevel = null;
  static STATE: HighScore$ScoreLevel = null;
  static CITY: HighScore$ScoreLevel = null;
  static MOUNTAIN_RANGE: HighScore$ScoreLevel = null;
  static RIVER: HighScore$ScoreLevel = null;
  static INSTITUTE: HighScore$ScoreLevel = null;
  static UNIVERSITY: HighScore$ScoreLevel = null;
  static STREET: HighScore$ScoreLevel = null;
  static SCHOOL: HighScore$ScoreLevel = null;
  static BIRD_OF_PREY: HighScore$ScoreLevel = null;
  static TREE: HighScore$ScoreLevel = null;
  static FLOWER: HighScore$ScoreLevel = null;
  static RODENT: HighScore$ScoreLevel = null;
  static FOUL_SMELLING_PLANT: HighScore$ScoreLevel = null;
  static POISONOUS_PLANT: HighScore$ScoreLevel = null;
  static SLIME_MOLD_BEETLE: HighScore$ScoreLevel = null;
  static BLOOD_SUCKING_INSECT: HighScore$ScoreLevel = null;
  static INFECTIOUS_DISEASE: HighScore$ScoreLevel = null;
  static PARASITIC_WORM: HighScore$ScoreLevel = null;
  static $VALUES: HighScore$ScoreLevel[] = null;
  _HighScore$ScoreLevel($name: string, $ordinal: number, minimumScore: number): this {
    this._JEnum($name, $ordinal);
    this.minimumScore = minimumScore;
    return this;
  }
  getMinimumScore(): number {
    return this.minimumScore;
  }
  static values(): HighScore$ScoreLevel[] { return HighScore$ScoreLevel.$VALUES.slice(); }
  static valueOf(name: string): HighScore$ScoreLevel { return $J.enumValueOf(HighScore$ScoreLevel, name); }
  static $clinit() {
    HighScore$ScoreLevel.CONTINENT = new HighScore$ScoreLevel()._HighScore$ScoreLevel('CONTINENT', 0, 40000);
    HighScore$ScoreLevel.COUNTRY = new HighScore$ScoreLevel()._HighScore$ScoreLevel('COUNTRY', 1, 35000);
    HighScore$ScoreLevel.STATE = new HighScore$ScoreLevel()._HighScore$ScoreLevel('STATE', 2, 30000);
    HighScore$ScoreLevel.CITY = new HighScore$ScoreLevel()._HighScore$ScoreLevel('CITY', 3, 25000);
    HighScore$ScoreLevel.MOUNTAIN_RANGE = new HighScore$ScoreLevel()._HighScore$ScoreLevel('MOUNTAIN_RANGE', 4, 20000);
    HighScore$ScoreLevel.RIVER = new HighScore$ScoreLevel()._HighScore$ScoreLevel('RIVER', 5, 15000);
    HighScore$ScoreLevel.INSTITUTE = new HighScore$ScoreLevel()._HighScore$ScoreLevel('INSTITUTE', 6, 12000);
    HighScore$ScoreLevel.UNIVERSITY = new HighScore$ScoreLevel()._HighScore$ScoreLevel('UNIVERSITY', 7, 10000);
    HighScore$ScoreLevel.STREET = new HighScore$ScoreLevel()._HighScore$ScoreLevel('STREET', 8, 8000);
    HighScore$ScoreLevel.SCHOOL = new HighScore$ScoreLevel()._HighScore$ScoreLevel('SCHOOL', 9, 7000);
    HighScore$ScoreLevel.BIRD_OF_PREY = new HighScore$ScoreLevel()._HighScore$ScoreLevel('BIRD_OF_PREY', 10, 6000);
    HighScore$ScoreLevel.TREE = new HighScore$ScoreLevel()._HighScore$ScoreLevel('TREE', 11, 5000);
    HighScore$ScoreLevel.FLOWER = new HighScore$ScoreLevel()._HighScore$ScoreLevel('FLOWER', 12, 4000);
    HighScore$ScoreLevel.RODENT = new HighScore$ScoreLevel()._HighScore$ScoreLevel('RODENT', 13, 3200);
    HighScore$ScoreLevel.FOUL_SMELLING_PLANT = new HighScore$ScoreLevel()._HighScore$ScoreLevel('FOUL_SMELLING_PLANT', 14, 2400);
    HighScore$ScoreLevel.POISONOUS_PLANT = new HighScore$ScoreLevel()._HighScore$ScoreLevel('POISONOUS_PLANT', 15, 1600);
    HighScore$ScoreLevel.SLIME_MOLD_BEETLE = new HighScore$ScoreLevel()._HighScore$ScoreLevel('SLIME_MOLD_BEETLE', 16, 800);
    HighScore$ScoreLevel.BLOOD_SUCKING_INSECT = new HighScore$ScoreLevel()._HighScore$ScoreLevel('BLOOD_SUCKING_INSECT', 17, 400);
    HighScore$ScoreLevel.INFECTIOUS_DISEASE = new HighScore$ScoreLevel()._HighScore$ScoreLevel('INFECTIOUS_DISEASE', 18, 200);
    HighScore$ScoreLevel.PARASITIC_WORM = new HighScore$ScoreLevel()._HighScore$ScoreLevel('PARASITIC_WORM', 19, 0);
    HighScore$ScoreLevel.$VALUES = [HighScore$ScoreLevel.CONTINENT, HighScore$ScoreLevel.COUNTRY, HighScore$ScoreLevel.STATE, HighScore$ScoreLevel.CITY, HighScore$ScoreLevel.MOUNTAIN_RANGE, HighScore$ScoreLevel.RIVER, HighScore$ScoreLevel.INSTITUTE, HighScore$ScoreLevel.UNIVERSITY, HighScore$ScoreLevel.STREET, HighScore$ScoreLevel.SCHOOL, HighScore$ScoreLevel.BIRD_OF_PREY, HighScore$ScoreLevel.TREE, HighScore$ScoreLevel.FLOWER, HighScore$ScoreLevel.RODENT, HighScore$ScoreLevel.FOUL_SMELLING_PLANT, HighScore$ScoreLevel.POISONOUS_PLANT, HighScore$ScoreLevel.SLIME_MOLD_BEETLE, HighScore$ScoreLevel.BLOOD_SUCKING_INSECT, HighScore$ScoreLevel.INFECTIOUS_DISEASE, HighScore$ScoreLevel.PARASITIC_WORM];
  }
}

$J.define(HighScore, 'net.sf.freecol.common.model.HighScore', { kind: 'class', sup: 'net.sf.freecol.common.model.FreeColObject', ctors: { 'net.sf.freecol.common.io.FreeColXMLReader': '_HighScore$FreeColXMLReader', 'net.sf.freecol.common.model.Player': '_HighScore$Player', '': '_HighScore$' }, returns: { 'getXMLTagName': 'java.lang.String', 'getDateString': 'java.lang.String', 'getDate': 'java.util.Date', 'getColonyCount': 'int', 'getUnitCount': 'int', 'getDifficulty': 'java.lang.String', 'getNewLandName': 'java.lang.String', 'getNationName': 'java.lang.String', 'getOldNationNameKey': 'java.lang.String', 'getLevel': 'net.sf.freecol.common.model.HighScore$ScoreLevel', 'getScore': 'int', 'getGameUUID': 'java.util.UUID', 'getNationTypeId': 'java.lang.String', 'getNationId': 'java.lang.String', 'getPlayerName': 'java.lang.String', 'getRetirementTurn': 'int', 'getIndependenceTurn': 'int' }, clinit: true, lazy: ['logger', 'nullUUID', 'descendingScoreComparator'] });
$J.define(HighScore$ScoreLevel, 'net.sf.freecol.common.model.HighScore$ScoreLevel', { kind: 'enum', sup: 'java.lang.Enum', ctors: { 'int': '_HighScore$ScoreLevel' }, returns: { 'getMinimumScore': 'int' }, clinit: true, lazy: ['$VALUES', 'CONTINENT', 'COUNTRY', 'STATE', 'CITY', 'MOUNTAIN_RANGE', 'RIVER', 'INSTITUTE', 'UNIVERSITY', 'STREET', 'SCHOOL', 'BIRD_OF_PREY', 'TREE', 'FLOWER', 'RODENT', 'FOUL_SMELLING_PLANT', 'POISONOUS_PLANT', 'SLIME_MOLD_BEETLE', 'BLOOD_SUCKING_INSECT', 'INFECTIOUS_DISEASE', 'PARASITIC_WORM'] });
$J.module(() => {
  FreeCol = $J.load('net.sf.freecol.FreeCol');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  FreeColDirectories = $J.load('net.sf.freecol.common.io.FreeColDirectories');
  FreeColXMLReader = $J.load('net.sf.freecol.common.io.FreeColXMLReader');
  FreeColXMLWriter = $J.load('net.sf.freecol.common.io.FreeColXMLWriter');
  FreeColXMLWriter$WriteScope = $J.load('net.sf.freecol.common.io.FreeColXMLWriter$WriteScope');
  Player$PlayerType = $J.load('net.sf.freecol.common.model.Player$PlayerType');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
