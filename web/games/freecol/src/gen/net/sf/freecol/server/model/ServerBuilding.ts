// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/model/ServerBuilding.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger } from '../../../../../../jre/index.ts';
import { Building } from '../../common/model/Building.ts';

let Ability, ModelMessage, ModelMessage$MessageType, ChangeSet$See, CollectionUtils;

/**
 * The server version of a building.
 */
export class ServerBuilding extends Building {
  static logger: Logger = null;
  /**
   * Trivial constructor for Game.newInstance.
   *
   * @param game The {@code Game} this object belongs to.
   * @param id The object identifier.
   */
  _ServerBuilding$Game$String(game: Game, id: string): this {
    this._Building$Game$String(game, id);
    return this;
  }
  /**
   * Creates a new ServerBuilding.
   *
   * @param game The {@code Game} this object belongs to.
   * @param colony The {@code Colony} in which this building is located.
   * @param type The {@code BuildingType} of building.
   */
  _ServerBuilding$Game$Colony$BuildingType(game: Game, colony: Colony, type$: BuildingType): this {
    this._Building$Game$Colony$BuildingType(game, colony, type$);
    return this;
  }
  /**
   * Teach all the units in this school.
   *
   * @param cs A {@code ChangeSet} to update.
   */
  csTeach(cs: ChangeSet): void {
    let owner = this.getColony().getOwner();
    for (const $it0 = this.getUnitList().iterator(); $it0.hasNext(); ) {
      let teacher = $it0.next();
      let student = teacher.getStudent();
      if (student != null && student.getTeacher() !== teacher) {
        ServerBuilding.logger.warning('Bogus teacher/student assignment.');
        teacher.setStudent(null);
        student = null;
      }
      if (student == null && this.csAssignStudent(teacher, cs)) {
        student = teacher.getStudent();
      }
      teacher.setTurnsOfTraining((student == null) ? 0 : (teacher.getTurnsOfTraining() + 1) | 0);
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(owner), [teacher]);
    }
  }
  /**
   * Check and complete teaching if possible.
   *
   * This needs to be separate and public because of the recheck of
   * teaching required if the colony production bonus rises at end
   * of new turn calculations.
   *
   * @param teacher The teaching {@code Unit}.
   * @param cs A {@code ChangeSet} to update.
   * @return True if teaching occurred.
   */
  csCheckTeach(teacher: Unit, cs: ChangeSet): boolean {
    let owner = this.getColony().getOwner();
    let student = teacher.getStudent();
    if (student != null && teacher.getTurnsOfTraining() >= teacher.getNeededTurnsOfTraining()) {
      this.csTrainStudent(teacher, student, cs);
      cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(owner), [student]);
      if (teacher.getStudent() == null) {
        this.csAssignStudent(teacher, cs);
      }
      return true;
    }
    return false;
  }
  /**
   * Train a student.
   *
   * @param teacher The teacher {@code Unit}.
   * @param student The student {@code Unit} to train.
   * @param cs A {@code ChangeSet} to update.
   * @return True if teaching occurred.
   */
  csTrainStudent(teacher: Unit, student: Unit, cs: ChangeSet): boolean {
    let owner = this.getColony().getOwner();
    let oldName = student.getLabel$();
    let skill = student.getTeachingType$Unit(teacher);
    let ret = skill != null;
    if (skill == null) {
      ServerBuilding.logger.warning('Student ' + student.getId() + ' can not learn from ' + teacher.getId());
    } else {
      student.changeType(skill);
      let newName = student.getLabel$();
      cs.addMessage(owner, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(ModelMessage$MessageType.UNIT_IMPROVED, 'model.building.unitEducated', this.getColony(), this).addStringTemplate$String$StringTemplate('%oldName%', oldName).addStringTemplate$String$StringTemplate('%unit%', newName).addName$String$String('%colony%', this.getColony().getName()));
    }
    student.setTurnsOfTraining(0);
    student.setMovesLeft(0);
    teacher.setTurnsOfTraining(0);
    teacher.setMovesLeft(0);
    if (!student.canBeStudent(teacher)) {
      student.setTeacher(null);
      teacher.setStudent(null);
    }
    return ret;
  }
  /**
   * Assigns a student to a teacher within a building.
   *
   * @param teacher The {@code Unit} that is teaching.
   * @param cs A {@code ChangeSet} to update.
   * @return True if a student was assigned.
   */
  csAssignStudent(teacher: Unit, cs: ChangeSet): boolean {
    let colony = this.getColony();
    let owner = colony.getOwner();
    let student = colony.findStudent(teacher);
    if (student == null) {
      cs.addMessage(owner, new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(ModelMessage$MessageType.WARNING, 'model.building.noStudent', colony, teacher).addStringTemplate$String$StringTemplate('%teacher%', teacher.getLabel$()).addName$String$String('%colony%', colony.getName()));
      return false;
    }
    teacher.setStudent(student);
    teacher.changeWorkType(null);
    student.setTeacher(teacher);
    cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(owner), [student]);
    return true;
  }
  /**
   * Repair the units in this building.
   *
   * @param cs A {@code ChangeSet} to update.
   */
  csRepairUnits(cs: ChangeSet): void {
    for (const $it1 = (CollectionUtils.transform$Stream$Predicate(this.getTile$().getUnits(), (u) => (u.isDamaged() && this.getType().hasAbility$String$FreeColSpecObjectType(Ability.REPAIR_UNITS, u.getType())))).iterator(); $it1.hasNext(); ) {
      let unit = $it1.next();
      (unit).csRepairUnit(cs);
    }
  }
  /**
   * Check a building to see if it is missing input.
   *
   * The building must need input, have a person working there, and have
   * no production occurring.
   *
   * @param pi The {@code ProductionInfo} for the building.
   * @param cs A {@code ChangeSet} to update.
   */
  csCheckMissingInput(pi: ProductionInfo, cs: ChangeSet): void {
    if (this.canAutoProduce()) {
      return;
    }
    let production = pi.getProduction();
    if (!production.isEmpty()) {
      if (CollectionUtils.all$Collection$Predicate(production, (ag) => ag.getAmount() === 0)) {
        for (const $it2 = (CollectionUtils.transform$Stream$Predicate$Function(this.getInputs(), (ag) => ag.getAmount() > 0, ($p0) => $p0.getType())).iterator(); $it2.hasNext(); ) {
          let gt = $it2.next();
          cs.addMessage(this.getOwner(), new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(ModelMessage$MessageType.MISSING_GOODS, 'model.building.noInput', this, gt).addNamed$String$Named('%inputGoods%', gt).addNamed$String$Named('%building%', this).addName$String$String('%colony%', this.getColony().getName()));
        }
      } else {
        for (const $it3 = pi.getConsumptionDeficit().iterator(); $it3.hasNext(); ) {
          let ag = $it3.next();
          cs.addMessage(this.getOwner(), new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(ModelMessage$MessageType.MISSING_GOODS, 'model.building.notEnoughInput', this, ag.getType()).addNamed$String$Named('%building%', this).addName$String$String('%colony%', this.getColony().getName()).addAmount('%number%', ag.getAmount()).addNamed$String$Named('%goodsType%', ag.getType()));
        }
      }
    }
  }
  /**
   * New turn for this building.
   *
   * @param random A {@code Random} number source.
   * @param lb A {@code LogBuilder} to log to.
   * @param cs A {@code ChangeSet} to update.
   */
  csNewTurn(random: Random, lb: LogBuilder, cs: ChangeSet): void {
    let type$ = this.getType();
    if (this.canTeach()) {
      this.csTeach(cs);
    }
    if (type$.hasAbility$String(Ability.REPAIR_UNITS)) {
      this.csRepairUnits(cs);
    }
  }
  static $clinit() {
    ServerBuilding.logger = Logger.getLogger($J.cls(ServerBuilding).getName());
  }
}

$J.define(ServerBuilding, 'net.sf.freecol.server.model.ServerBuilding', { kind: 'class', ifaces: ['net.sf.freecol.server.model.TurnTaker'], sup: 'net.sf.freecol.common.model.Building', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.model.Colony,net.sf.freecol.common.model.BuildingType': '_ServerBuilding$Game$Colony$BuildingType', 'net.sf.freecol.common.model.Game,java.lang.String': '_ServerBuilding$Game$String' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  ModelMessage = $J.load('net.sf.freecol.common.model.ModelMessage');
  ModelMessage$MessageType = $J.load('net.sf.freecol.common.model.ModelMessage$MessageType');
  ChangeSet$See = $J.load('net.sf.freecol.common.networking.ChangeSet$See');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
