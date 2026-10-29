// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/FreeColGameObject.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Level, Logger, RuntimeException, Stream } from '../../../../../../jre/index.ts';
import { FreeColObject } from './FreeColObject.ts';

let Constants$IntegrityType, Ownable, CollectionUtils, LogBuilder, Utils;

/**
 * The superclass of all game objects in FreeCol.
 *
 * All FreeColGameObjects need to be able to refer to the game they belong
 * to.  Therefore, the game attribute must not be null, except in the special
 * case where a Game is being initially created.
 *
 * Most FreeColGameObjects are intended to be accessible by identifier (@see
 * Game#getFreeColObject) but some are not, and should override isInternable
 * to return false.
 */
export class FreeColGameObject extends FreeColObject {
  static logger: Logger = null;
  /**
   * Default class index for FreeColGameObjects.
   */
  static readonly FREECOL_GAME_OBJECT_CLASS_INDEX: number = 50;
  /**
   * The game this object belongs to.
   */
  game: Game = null;
  /**
   * Has this object been disposed?
   */
  disposed: boolean = false;
  /**
   * Has this object been initialized?
   */
  initialized: boolean = false;
  $init_FreeColGameObject() {
    this.disposed = false;
  }
  /**
   * Special constructor solely for initializing a Game.
   *
   * Do *not* call internId as the Game is not ready to register objects.
   */
  _FreeColGameObject$(): this {
    this._FreeColObject();
    this.$init_FreeColGameObject();
    this.game = this;
    this.disposed = false;
    this.initialized = false;
    return this;
  }
  /**
   * Create and initialize a new {@code FreeColGameObject}.
   *
   * @param game The enclosing {@code Game}.
   */
  _FreeColGameObject$Game(game: Game): this {
    this._FreeColObject();
    this.$init_FreeColGameObject();
    this.game = game;
    this.internId(this.getXMLTagName() + ':' + game.getNextId());
    this.disposed = false;
    this.initialized = this.getId() != null;
    return this;
  }
  /**
   * Creates a new {@code FreeColGameObject}.
   * If an identifier is supplied, use that, otherwise leave it undefined.
   *
   * This routine should be used when we know that the object will need
   * further initialization.
   *
   * @param game The enclosing {@code Game}.
   * @param id The object identifier.
   */
  _FreeColGameObject$Game$String(game: Game, id: string): this {
    this._FreeColObject();
    this.$init_FreeColGameObject();
    this.game = game;
    this.internId(id);
    this.initialized = false;
    this.disposed = false;
    return this;
  }
  /**
   * Sets the unique identifier of this object and registers it in its
   * {@code Game} with that identifier, i.e. "intern" this object.
   *
   * @param newId The unique identifier of this object.
   */
  internId(newId: string): void {
    if (this.game != null && newId != null && this.isInternable()) {
      let oldId = this.getId();
      if ($J.equals(newId, oldId)) {
        this.game.setFreeColGameObject(newId, this);
      } else {
        if (oldId != null) {
          this.game.removeFreeColGameObject(oldId, 'override');
        }
        this.setId(newId);
        this.game.addFreeColGameObject(newId, this);
      }
    } else {
      this.setId(newId);
    }
  }
  /**
   * Intern this object.
   */
  intern(): void {
    this.internId(this.getId());
  }
  /**
   * Has this object been initialized?
   *
   * @return True if this object is initialized.
   */
  isInitialized(): boolean {
    return this.initialized;
  }
  /**
   * Has this object been disposed?
   *
   * @return True if this object has been disposed.
   * @see #dispose
   */
  isDisposed(): boolean {
    return this.disposed;
  }
  /**
   * Destroy this object and all its parts, releasing resources and
   * removing references.
   */
  dispose(): void {
    if (this.disposed) {
      return;
    }
    let lb = new LogBuilder()._LogBuilder(64);
    lb.add(['Destroying:']);
    for (const $it0 = CollectionUtils.toList$Stream(this.getDisposables()).iterator(); $it0.hasNext(); ) {
      let fcgo = $it0.next();
      lb.add([' ', fcgo.getId()]);
      fcgo.disposeResources();
    }
    lb.log(FreeColGameObject.logger, Level.INFO);
  }
  /**
   * Low level base dispose, removing the object from the game.
   */
  fundamentalDispose(): void {
    this.getGame().removeFreeColGameObject(this.getId(), 'dispose');
    this.disposed = true;
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let fcgo = this.copyInCast(other, $J.cls(FreeColGameObject));
    if (fcgo == null) {
      return false;
    }
    let owner = ($J.isa(this, Ownable)) ? (this).getOwner() : null;
    if (!super.copyIn(fcgo)) {
      return false;
    }
    let game = this.getGame();
    this.game = game.updateRef$FreeColGameObject(fcgo.getGame());
    this.disposed = fcgo.isDisposed();
    this.initialized = fcgo.isInitialized();
    if (owner != null) {
      game.checkOwners(this, owner);
    }
    return true;
  }
  /**
   * Should this object be interned into its Game?
   *
   * Usually true, but there are some special containers that have to be
   * FCGOs but are unsuitable to be interned.  These classes will override
   * this routine.
   *
   * @return True if this object should be interned.
   */
  isInternable(): boolean {
    return true;
  }
  /**
   * Collect this object and all its subparts that should be
   * disposed of when this object goes away.
   *
   * Overriding routines should call upwards towards this routine,
   * arranging that the object itself is last.
   *
   * @return A stream of {@code FreeColGameObject}s to dispose of.
   */
  getDisposables(): Stream<FreeColGameObject> {
    return Stream.of(this);
  }
  /**
   * Dispose of the resources of this object, and finally remove it from the
   * game.
   *
   * To be extended by subclasses, but they must tail call up
   * towards this.
   */
  disposeResources(): void {
    this.fundamentalDispose();
  }
  /**
   * Get a suitable game object to use as a clickable link in messages
   * to a player.
   *
   * Objects do not have links by default, hence the null return
   * here.  However, for example, a player's colony should return
   * itself as a link target.
   *
   * @param player The {@code Player} to make a link for.
   * @return A suitable link target if available, although usually null.
   */
  getLinkTarget(player: Player): FreeColGameObject {
    return null;
  }
  /**
   * Checks the integrity of this game object.
   *
   * @param fix If true, fix problems if possible.
   * @param lb A {@code LogBuilder} to log to.
   * @return A suitable {@code IntegrityType}.
   */
  checkIntegrity(fix: boolean, lb: LogBuilder): Constants$IntegrityType {
    return Constants$IntegrityType.INTEGRITY_GOOD;
  }
  /**
   * {@inheritDoc}
   */
  getSpecification(): Specification {
    return (this.game == null) ? null : this.game.getSpecification();
  }
  /**
   * {@inheritDoc}
   */
  setSpecification(specification: Specification): void {
    throw new RuntimeException('Can not set specification for: ' + $J.str(this));
  }
  /**
   * {@inheritDoc}
   */
  getGame(): Game {
    return this.game;
  }
  /**
   * {@inheritDoc}
   */
  setGame(game: Game): void {
    if (game == null) {
      throw new RuntimeException('Null game: ' + $J.str(this));
    }
    this.game = game;
  }
  /**
   * {@inheritDoc}
   */
  getClassIndex(): number {
    return FreeColGameObject.FREECOL_GAME_OBJECT_CLASS_INDEX;
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    if (xr.shouldIntern()) {
      this.internId(this.getId());
    }
  }
  /**
   * {@inheritDoc}
   */
  readFromXML(xr: FreeColXMLReader): void {
    this.initialized = true;
    super.readFromXML(xr);
  }
  /**
   * {@inheritDoc}
   */
  equals(o: any): boolean {
    if (this === o) {
      return true;
    }
    if (o instanceof FreeColGameObject) {
      let other = o;
      return this.getGame() === other.getGame() && super.equals(other);
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    let hash = super.hashCode();
    return (Math.imul(31, hash) + Utils.hashCode(this.game)) | 0;
  }
  static $clinit() {
    FreeColGameObject.logger = Logger.getLogger($J.cls(FreeColGameObject).getName());
  }
}

$J.define(FreeColGameObject, 'net.sf.freecol.common.model.FreeColGameObject', { kind: 'class', sup: 'net.sf.freecol.common.model.FreeColObject', ctors: { 'net.sf.freecol.common.model.Game,java.lang.String': '_FreeColGameObject$Game$String', 'net.sf.freecol.common.model.Game': '_FreeColGameObject$Game', '': '_FreeColGameObject$' }, returns: { 'hashCode': 'int', 'getClassIndex': 'int', 'getGame': 'net.sf.freecol.common.model.Game', 'getSpecification': 'net.sf.freecol.common.model.Specification', 'getDisposables': 'java.util.stream.Stream', 'isInternable': 'boolean', 'isDisposed': 'boolean', 'isInitialized': 'boolean' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Constants$IntegrityType = $J.load('net.sf.freecol.common.model.Constants$IntegrityType');
  Ownable = $J.load('net.sf.freecol.common.model.Ownable');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  LogBuilder = $J.load('net.sf.freecol.common.util.LogBuilder');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
});
