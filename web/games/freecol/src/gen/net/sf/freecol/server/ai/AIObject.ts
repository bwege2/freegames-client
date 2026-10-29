// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/ai/AIObject.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger, RuntimeException } from '../../../../../../jre/index.ts';
import { FreeColObject } from '../../common/model/FreeColObject.ts';

let Constants$IntegrityType, LogBuilder;

/**
 * An {@code AIObject} contains AI-related information and methods.
 * Each {@code FreeColGameObject}, that is owned by an AI-controlled
 * player, can have a single {@code AIObject} attached to it.
 */
export class AIObject extends FreeColObject {
  static logger: Logger = null;
  /**
   * The AI this object exists within.
   */
  aiMain: AIMain = null;
  /**
   * Whether the object is initialized.
   */
  initialized: boolean = false;
  /**
   * Creates a new uninitialized {@code AIObject}.
   *
   * @param aiMain The main AI-object.
   */
  _AIObject$AIMain(aiMain: AIMain): this {
    this._FreeColObject();
    this.aiMain = aiMain;
    this.initialized = false;
    return this;
  }
  /**
   * Creates a new uninitialized {@code AIObject} with a registerable
   * AI identifier.
   *
   * @param aiMain The main AI-object.
   * @param id The object identifier.
   * @see AIMain#addAIObject(String, AIObject)
   */
  _AIObject$AIMain$String(aiMain: AIMain, id: string): this {
    this._AIObject$AIMain(aiMain);
    if (id != null) {
      this.setId(id);
      aiMain.addAIObject(id, this);
    }
    return this;
  }
  /**
   * Creates a new {@code AIObject}.
   *
   * @param aiMain The main AI-object.
   * @param xr The input stream containing the XML.
   * @exception XMLStreamException if a problem was encountered
   *     during parsing.
   * @see AIObject#readFromXML
   */
  _AIObject$AIMain$FreeColXMLReader(aiMain: AIMain, xr: FreeColXMLReader): this {
    this._AIObject$AIMain(aiMain);
    this.readFromXML(xr);
    this.addAIObjectWithId();
    return this;
  }
  /**
   * Is this AI object initialized?
   *
   * That is: it has been fully initialized by a detailed
   * constructor, or built with a simple constructor due to being
   * referenced by another object, but then updated with
   * {@link #readFromXML}.
   *
   * @return True if this {@code AIObject} is initialized.
   */
  isInitialized(): boolean {
    return this.initialized;
  }
  /**
   * Convenience accessor for the main AI-object.
   *
   * @return The {@code AIMain}.
   */
  getAIMain(): AIMain {
    return this.aiMain;
  }
  /**
   * Disposes this {@code AIObject} by removing the reference
   * to this object from the enclosing AIMain.
   */
  dispose(): void {
    this.getAIMain().removeAIObject(this.getId());
  }
  /**
   * Has this AIObject been disposed?
   *
   * @return True if this AIObject was disposed.
   */
  isDisposed(): boolean {
    return this.getAIMain().getAIObject$String(this.getId()) == null;
  }
  /**
   * Adds this object to the AI main if it has a non-null identifier.
   */
  addAIObjectWithId(): void {
    if (this.getId() != null) {
      this.aiMain.addAIObject(this.getId(), this);
    }
  }
  /**
   * AIObjects need integrity checking too.
   *
   * @param fix If true, fix problems if possible.
   * @param lb A {@code LogBuilder} to log to.
   * @return -1 if there are problems remaining, zero if problems
   *     were fixed, +1 if no problems found at all.
   */
  checkIntegrity$boolean$LogBuilder(fix: boolean, lb: LogBuilder): Constants$IntegrityType {
    let result = Constants$IntegrityType.INTEGRITY_GOOD;
    if (!this.isInitialized()) {
      lb.add(['\n  Uninitialized AI Object: ', this.getId()]);
      result = result.fail();
    }
    return result;
  }
  /**
   * Just do the check, short cut the logging.
   *
   * @param fix Fix problems if possible.
   * @return Negative if there are problems remaining, zero if
   *     problems were fixed, positive if no problems found at all.
   */
  checkIntegrity$boolean(fix: boolean): Constants$IntegrityType {
    return this.checkIntegrity$boolean$LogBuilder(fix, new LogBuilder()._LogBuilder(-1));
  }
  /**
   * {@inheritDoc}
   */
  getSpecification(): Specification {
    return this.getAIMain().getSpecification();
  }
  /**
   * {@inheritDoc}
   */
  setSpecification(specification: Specification): void {
    throw new RuntimeException('Can not set specification: ' + $J.str(this));
  }
  /**
   * {@inheritDoc}
   */
  getGame(): Game {
    return this.getAIMain().getGame();
  }
  /**
   * {@inheritDoc}
   */
  setGame(game: Game): void {
    throw new RuntimeException('Can not set game: ' + $J.str(this));
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(AIObject));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.initialized = o.isInitialized();
    return true;
  }
  static $clinit() {
    AIObject.logger = Logger.getLogger($J.cls(AIObject).getName());
  }
}

$J.define(AIObject, 'net.sf.freecol.server.ai.AIObject', { kind: 'class', sup: 'net.sf.freecol.common.model.FreeColObject', ctors: { 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.common.io.FreeColXMLReader': '_AIObject$AIMain$FreeColXMLReader', 'net.sf.freecol.server.ai.AIMain,java.lang.String': '_AIObject$AIMain$String', 'net.sf.freecol.server.ai.AIMain': '_AIObject$AIMain' }, returns: { 'getGame': 'net.sf.freecol.common.model.Game', 'getSpecification': 'net.sf.freecol.common.model.Specification', 'isDisposed': 'boolean', 'getAIMain': 'net.sf.freecol.server.ai.AIMain', 'isInitialized': 'boolean' }, meths: { 'checkIntegrity(boolean)': 'checkIntegrity$boolean', 'checkIntegrity(boolean,net.sf.freecol.common.util.LogBuilder)': 'checkIntegrity$boolean$LogBuilder' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Constants$IntegrityType = $J.load('net.sf.freecol.common.model.Constants$IntegrityType');
  LogBuilder = $J.load('net.sf.freecol.common.util.LogBuilder');
});
