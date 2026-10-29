// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/AssignTeacherMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Exception } from '../../../../../../jre/index.ts';
import { AttributeMessage } from './AttributeMessage.ts';

let Unit, Message$MessagePriority;

/**
 * The message sent when assigning a teacher.
 */
export class AssignTeacherMessage extends AttributeMessage {
  static readonly TAG: string = 'assignTeacher';
  static readonly STUDENT_TAG: string = 'student';
  static readonly TEACHER_TAG: string = 'teacher';
  /**
   * Create a new {@code AssignTeacherMessage} with the
   * supplied student and teacher.
   *
   * @param student The student {@code Unit}.
   * @param teacher The teacher {@code Unit}.
   */
  _AssignTeacherMessage$Unit$Unit(student: Unit, teacher: Unit): this {
    this._AttributeMessage$String$StringArr(AssignTeacherMessage.TAG, [AssignTeacherMessage.STUDENT_TAG, student.getId(), AssignTeacherMessage.TEACHER_TAG, teacher.getId()]);
    return this;
  }
  /**
   * Create a new {@code AssignTeacherMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _AssignTeacherMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(AssignTeacherMessage.TAG, xr, [AssignTeacherMessage.STUDENT_TAG, AssignTeacherMessage.TEACHER_TAG]);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  currentPlayerMessage(): boolean {
    return true;
  }
  /**
   * {@inheritDoc}
   */
  getPriority(): Message$MessagePriority {
    return Message$MessagePriority.NORMAL;
  }
  /**
   * {@inheritDoc}
   */
  serverHandler(freeColServer: FreeColServer, serverPlayer: ServerPlayer): ChangeSet {
    let studentId = this.getStringAttribute(AssignTeacherMessage.STUDENT_TAG);
    let teacherId = this.getStringAttribute(AssignTeacherMessage.TEACHER_TAG);
    let student: Unit;
    try {
      student = serverPlayer.getOurFreeColGameObject(studentId, $J.cls(Unit));
    } catch ($e0) {
      if ($J.isa($e0, Exception)) {
        let e = $J.exc($e0);
        return serverPlayer.clientError$String(e.getMessage());
      } else {
        throw $e0;
      }
    }
    let teacher: Unit;
    try {
      teacher = serverPlayer.getOurFreeColGameObject(teacherId, $J.cls(Unit));
    } catch ($e1) {
      if ($J.isa($e1, Exception)) {
        let e = $J.exc($e1);
        return serverPlayer.clientError$String(e.getMessage());
      } else {
        throw $e1;
      }
    }
    if (student.getColony() == null) {
      return serverPlayer.clientError$String('Student not in colony: ' + studentId);
    } else if (!student.isInColony()) {
      return serverPlayer.clientError$String('Student not working colony: ' + studentId);
    } else if (teacher.getColony() == null) {
      return serverPlayer.clientError$String('Teacher not in colony: ' + teacherId);
    } else if (!teacher.getColony().canTrain$Unit(teacher)) {
      return serverPlayer.clientError$String('Teacher can not teach: ' + teacherId);
    } else if (student.getColony() !== teacher.getColony()) {
      return serverPlayer.clientError$String('Student and teacher not in same colony: ' + studentId);
    } else if (!student.canBeStudent(teacher)) {
      return serverPlayer.clientError$String('Student can not be taught by teacher: ' + studentId);
    }
    return this.igc$FreeColServer(freeColServer).assignTeacher(serverPlayer, student, teacher);
  }
}

$J.define(AssignTeacherMessage, 'net.sf.freecol.common.networking.AssignTeacherMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_AssignTeacherMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.Unit': '_AssignTeacherMessage$Unit$Unit' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
